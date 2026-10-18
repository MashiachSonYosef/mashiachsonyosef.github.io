// READ-ONLY ranged GETs (Range: bytes=0-N) from R2 for many keys read from stdin, 16 at a time.
// Prints key<TAB>status<TAB>hex of the first bytes. Signed like scratchpad/r2get.mjs.
import { createHmac, createHash } from "node:crypto";
import { createInterface } from "node:readline";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host, N = Number(process.argv[2] || 63);
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
async function head(key) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
  const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
  const canon = ["GET", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  const res = await fetch(`https://${host}${path}`, { headers: { Range: `bytes=0-${N}`, ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
  const b = Buffer.from(await res.arrayBuffer());
  return `${key}\t${res.status}\t${b.toString("hex")}`;
}
const keys = []; for await (const l of createInterface({ input: process.stdin })) if (l.trim()) keys.push(l.trim());
let i = 0; const out = [];
async function worker() { while (i < keys.length) { const k = keys[i++]; try { console.log(await head(k)); } catch (e) { try { console.log(await head(k)); } catch (e2) { console.log(`${k}\tERR\t`); } } } }
await Promise.all(Array.from({ length: 16 }, worker));
