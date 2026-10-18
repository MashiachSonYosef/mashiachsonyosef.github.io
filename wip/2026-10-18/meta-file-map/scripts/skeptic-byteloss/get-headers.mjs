// READ-ONLY: one signed GET per key, printing the response headers (body discarded). env CKMODE=1 adds x-amz-checksum-mode: ENABLED.
import { createHmac, createHash } from "node:crypto";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host;
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
for (const key of process.argv.slice(2)) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
  const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now };
  if (env.CKMODE) headers["x-amz-checksum-mode"] = "ENABLED";
  const signed = Object.keys(headers).sort();
  const canon = ["GET", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  const res = await fetch(`https://${host}${path}`, { headers: { "accept-encoding": "identity", ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
  const body = Buffer.from(await res.arrayBuffer());
  const h = {}; for (const [k, v] of res.headers) if (k.startsWith("x-amz") || k === "content-type" || k === "etag" || k === "content-length" || k === "content-encoding") h[k] = v;
  console.log(JSON.stringify({ k: key, ckmode: !!env.CKMODE, status: res.status, body_bytes: body.length, headers: h }));
}
