// READ-ONLY HeadObject over a list of keys, signed like ../../r2get.mjs (method HEAD instead of GET).
// Usage: node r2head.mjs KEYS.txt OUT.jsonl [concurrency]
//   KEYS.txt: one key per line (JSON-encoded string per line if it starts with '"').
// Writes one JSON line per key: { k, status, headers: {all response headers, lower-cased} }.
// Sends header x-amz-checksum-mode: ENABLED so any stored checksum (x-amz-checksum-*) is returned,
// and accept-encoding: identity so the reply's content-encoding is the stored one, not the edge's.
// Only HTTP HEAD is issued. No PUT/DELETE/COPY.
import { createHmac, createHash } from "node:crypto";
import { readFileSync, openSync, writeSync, closeSync } from "node:fs";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host;
const [KEYS, OUT, CONC = "8"] = process.argv.slice(2);
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const keys = readFileSync(KEYS, "utf8").split("\n").filter(Boolean).map((l) => (l.startsWith('"') ? JSON.parse(l) : l));
const out = openSync(OUT, "w");
const head = async (key) => {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
  const headers = { host, "x-amz-checksum-mode": "ENABLED", "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
  const canon = ["HEAD", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  // accept-encoding: identity (unsigned) so Cloudflare's edge does not gzip the reply on the fly:
  // a first test showed content-encoding: gzip + a weak W/ ETag on a plain JSON object, a transport artifact, not stored metadata.
  const res = await fetch(`https://${host}${path}`, { method: "HEAD", headers: { "accept-encoding": "identity", ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
  const h = {}; for (const [k, v] of res.headers) h[k.toLowerCase()] = v;
  return { status: res.status, headers: h };
};
let i = 0, done = 0, bad = 0;
await Promise.all(Array.from({ length: Number(CONC) }, async () => {
  while (i < keys.length) {
    const k = keys[i++];
    let r = null;
    for (let t = 0; t < 4 && !r; t++) { try { r = await head(k); } catch (e) { await new Promise((z) => setTimeout(z, 1500 * (t + 1))); } }
    if (!r) r = { status: -1, headers: {} };
    if (r.status !== 200) bad++;
    writeSync(out, JSON.stringify({ k, ...r }) + "\n"); done++;
  }
}));
closeSync(out);
console.error(JSON.stringify({ keys: keys.length, done, non_200: bad }));
