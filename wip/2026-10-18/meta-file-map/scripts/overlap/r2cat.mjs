// READ-ONLY streaming GET from R2: writes the object body for one key to stdout (or Range via env RANGE).
// Signed exactly like scratchpad/r2get.mjs (SigV4, UNSIGNED-PAYLOAD). Exits 2 on a non-2xx status.
import { createHmac, createHash } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host, key = process.argv[2];
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
const canon = ["GET", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
const RANGE = env.RANGE;
const res = await fetch(`https://${host}${path}`, { method: "GET", headers: { ...(RANGE ? { Range: RANGE } : {}), ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
if (!res.ok) { process.stderr.write(`${res.status} ${key}\n`); process.exit(2); }
await pipeline(Readable.fromWeb(res.body), process.stdout);
