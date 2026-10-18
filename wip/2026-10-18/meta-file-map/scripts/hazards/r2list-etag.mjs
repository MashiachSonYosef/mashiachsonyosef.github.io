// READ-ONLY ListObjectsV2 over a prefix (default: whole bucket), signed like ../../r2list.mjs.
// Differences from r2list.mjs: also prints ETag and StorageClass, decodes every XML entity
// (&amp; &lt; &gt; &quot; &apos; and numeric refs), and writes a JSONL mirror so keys with tabs/newlines survive.
// Usage: node r2list-etag.mjs OUT.tsv OUT.jsonl [PREFIX]   (env MAXKEYS: max-keys asked per page, default 1000; env MAXPAGES: stop after N pages)
// TSV columns: key, size, last_modified, etag (quotes stripped), storage_class
// Only HTTP GET on the bucket listing is issued. No PUT/DELETE/COPY.
import { createHmac, createHash } from "node:crypto";
import { openSync, writeSync, closeSync } from "node:fs";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host;
const [OUT_TSV, OUT_JSONL, prefix = ""] = process.argv.slice(2);
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const dec = (s) => s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (m, e) =>
  e === "amp" ? "&" : e === "lt" ? "<" : e === "gt" ? ">" : e === "quot" ? '"' : e === "apos" ? "'" :
  e[1] === "x" ? String.fromCodePoint(parseInt(e.slice(2), 16)) : String.fromCodePoint(parseInt(e.slice(1), 10)));
const tsv = openSync(OUT_TSV, "w"), jsonl = openSync(OUT_JSONL, "w");
let token = null, n = 0, pages = 0, maxPage = 0, truncatedFlags = 0;
do {
  const q = { "list-type": "2", "max-keys": env.MAXKEYS || "1000", prefix }; if (token) q["continuation-token"] = token;
  const qs = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join("&");
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}`;
  const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
  const canon = ["GET", path, qs, ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  let res, xml, tries = 0;
  for (;;) {
    try {
      res = await fetch(`https://${host}${path}?${qs}`, { headers: { ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
      xml = await res.text();
      if (res.ok) break;
      console.error(res.status, xml.slice(0, 300));
    } catch (e) { console.error("fetch error", String(e).slice(0, 200)); }
    if (++tries > 5) process.exit(1);
    await new Promise((r) => setTimeout(r, 2000 * tries));
  }
  pages++;
  let inPage = 0;
  for (const c of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
    const b = c[1];
    const k = dec((b.match(/<Key>([\s\S]*?)<\/Key>/) || [])[1] ?? "");
    const sz = (b.match(/<Size>(\d+)<\/Size>/) || [])[1];
    const lm = (b.match(/<LastModified>([^<]*)<\/LastModified>/) || [])[1];
    const et = dec((b.match(/<ETag>([^<]*)<\/ETag>/) || [])[1] ?? "").replace(/^"|"$/g, "");
    const sc = (b.match(/<StorageClass>([^<]*)<\/StorageClass>/) || [])[1] ?? "";
    writeSync(tsv, `${k}\t${sz}\t${lm}\t${et}\t${sc}\n`);
    writeSync(jsonl, JSON.stringify({ k, s: Number(sz), lm, et, sc }) + "\n");
    n++; inPage++;
  }
  if (inPage > maxPage) maxPage = inPage;
  if (/<IsTruncated>true<\/IsTruncated>/.test(xml)) truncatedFlags++;
  const t = xml.match(/<NextContinuationToken>([^<]*)<\/NextContinuationToken>/); token = t ? dec(t[1]) : null;
  if (pages % 50 === 0) console.error(`page ${pages} keys ${n}`);
} while (token && !(env.MAXPAGES && pages >= Number(env.MAXPAGES)));
closeSync(tsv); closeSync(jsonl);
console.error(JSON.stringify({ keys: n, pages, max_keys_in_one_page: maxPage, pages_marked_truncated: truncatedFlags, finished_utc: new Date().toISOString() }));
