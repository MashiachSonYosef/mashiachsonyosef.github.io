// READ-ONLY streaming GET + hash: nothing is written to disk but one JSON line per key.
// For each key: bytes, md5, sha256, CRC-64/NVME (base64, as R2's x-amz-checksum-crc64nvme prints it),
// and the S3 multipart-style ETag recomputed with 5 MiB parts (md5 of the part md5s, "-N").
// Usage: node r2stream-hash.mjs OUT.jsonl key [key ...]     (keys may also come from a file: @KEYS.txt, JSON string per line)
// Only HTTP GET is issued (accept-encoding: identity). No PUT/DELETE/COPY.
import { createHmac, createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host;
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const [OUT, ...rest] = process.argv.slice(2);
const keys = rest.flatMap((a) => a.startsWith("@") ? readFileSync(a.slice(1), "utf8").split("\n").filter(Boolean).map((l) => (l.startsWith('"') ? JSON.parse(l) : l)) : [a]);
// CRC-64/NVME: poly 0xAD93D23594C93659 (reflected 0x9A6C9329AC4BC9B5), init and xorout all ones; check("123456789") = ae8b14860a799888
const TL = new Uint32Array(256), TH = new Uint32Array(256);
{ const P = 0x9A6C9329AC4BC9B5n; for (let i = 0; i < 256; i++) { let c = BigInt(i); for (let j = 0; j < 8; j++) c = c & 1n ? (c >> 1n) ^ P : c >> 1n; TL[i] = Number(c & 0xffffffffn); TH[i] = Number(c >> 32n); } }
const crc64 = () => { let lo = 0xffffffff, hi = 0xffffffff; return { update(b) { for (let i = 0; i < b.length; i++) { const x = (lo ^ b[i]) & 0xff; lo = (((lo >>> 8) | (hi << 24)) ^ TL[x]) >>> 0; hi = ((hi >>> 8) ^ TH[x]) >>> 0; } },
  digest() { const h = (~hi) >>> 0, l = (~lo) >>> 0; const buf = Buffer.alloc(8); buf.writeUInt32BE(h, 0); buf.writeUInt32BE(l, 4); return buf; } }; };
{ const t = crc64(); t.update(Buffer.from("123456789")); if (t.digest().toString("hex") !== "ae8b14860a799888") { console.error("crc64nvme self-test failed", t.digest().toString("hex")); process.exit(2); } }
const PART = 5 * 1024 * 1024;
for (const key of keys) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
  const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
  const canon = ["GET", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  const t0 = Date.now();
  const res = await fetch(`https://${host}${path}`, { headers: { "accept-encoding": "identity", ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
  if (!res.ok) { appendFileSync(OUT, JSON.stringify({ k: key, status: res.status }) + "\n"); continue; }
  const md5 = createHash("md5"), s256 = createHash("sha256"), c = crc64(); const partMd5s = []; let part = createHash("md5"), inPart = 0, n = 0;
  for await (const chunk0 of res.body) {
    let chunk = Buffer.from(chunk0); n += chunk.length; md5.update(chunk); s256.update(chunk); c.update(chunk);
    while (chunk.length) { const take = Math.min(PART - inPart, chunk.length); part.update(chunk.subarray(0, take)); inPart += take; chunk = chunk.subarray(take);
      if (inPart === PART) { partMd5s.push(part.digest()); part = createHash("md5"); inPart = 0; } }
  }
  if (inPart > 0 || partMd5s.length === 0) partMd5s.push(part.digest());
  const mpEtag = createHash("md5").update(Buffer.concat(partMd5s)).digest("hex") + "-" + partMd5s.length;
  const rec = { k: key, status: res.status, bytes: n, md5: md5.digest("hex"), sha256: s256.digest("hex"), crc64nvme_b64: c.digest().toString("base64"), multipart_etag_5MiB: mpEtag,
    resp_etag: res.headers.get("etag"), resp_crc64nvme: res.headers.get("x-amz-checksum-crc64nvme"), resp_content_encoding: res.headers.get("content-encoding"), seconds: (Date.now() - t0) / 1000 };
  appendFileSync(OUT, JSON.stringify(rec) + "\n");
  console.error(`${key.slice(-70)}  ${n} B  ${rec.seconds}s`);
}
