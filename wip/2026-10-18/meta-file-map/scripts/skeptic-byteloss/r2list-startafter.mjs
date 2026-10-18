// one-off ListObjectsV2 over a prefix, signed like the repo's restore tool; prints key<TAB>size
import { createHmac, createHash } from "node:crypto";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host, prefix = process.argv[2] || "";
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
let token = null, n = 0;
do {
  const q = { "list-type": "2", "max-keys": "1000", prefix }; if (process.env.START_AFTER) q["start-after"] = process.env.START_AFTER; if (token) q["continuation-token"] = token;
  const qs = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join("&");
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}`;
  const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
  const canon = ["GET", path, qs, ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  const res = await fetch(`https://${host}${path}?${qs}`, { headers: { ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
  const xml = await res.text(); if (!res.ok) { console.error(res.status, xml.slice(0, 300)); process.exit(1); }
  for (const c of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) { const b = c[1]; const k = (b.match(/<Key>([^<]*)<\/Key>/) || [])[1]; const sz = (b.match(/<Size>(\d+)<\/Size>/) || [])[1]; const lm = (b.match(/<LastModified>([^<]*)<\/LastModified>/) || [])[1]; console.log(`${String(k).replace(/&amp;/g, "&")}\t${sz}\t${lm}`); n++; }
  const t = xml.match(/<NextContinuationToken>([^<]*)<\/NextContinuationToken>/); token = t ? t[1].replace(/&amp;/g, "&") : null;
} while (token);
console.error(`${n} keys`);
