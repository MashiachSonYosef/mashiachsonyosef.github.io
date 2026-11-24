// Read-only R2 client (S3 API, SigV4). Credentials come from the environment
// (endpoint, R2_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) and are never printed.
// Usage (run with NODE_USE_ENV_PROXY=1):
//   node r2.mjs dirs <prefix>          one level of "folders" and files under prefix
//   node r2.mjs list <prefix>          every key under prefix, with size and date (TSV)
//   node r2.mjs get <outdir> <key...>  download keys into outdir (path kept)
import { createHmac, createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const EP = (process.env.endpoint || process.env.R2_ENDPOINT || "").replace(/\/+$/, "");
const BUCKET = process.env.R2_BUCKET;
const AK = process.env.access_key_id || process.env.AWS_ACCESS_KEY_ID;
const SK = process.env.secret_access_key || process.env.AWS_SECRET_ACCESS_KEY;
if (!EP || !BUCKET || !AK || !SK) { console.error("missing R2 environment variables"); process.exit(2); }
const host = new URL(EP).host;
const sha = (s) => createHash("sha256").update(s).digest("hex");
const hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const encPath = (p) => p.split("/").map(enc).join("/");

async function req(path, query = {}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = amzDate.slice(0, 8);
  const qs = Object.keys(query).sort().map((k) => `${enc(k)}=${enc(query[k])}`).join("&");
  const payload = "UNSIGNED-PAYLOAD";
  const headers = { host, "x-amz-content-sha256": payload, "x-amz-date": amzDate };
  const signed = Object.keys(headers).sort();
  const canon = ["GET", path, qs, signed.map((h) => `${h}:${headers[h]}\n`).join(""), signed.join(";"), payload].join("\n");
  const scope = `${day}/auto/s3/aws4_request`;
  const sts = ["AWS4-HMAC-SHA256", amzDate, scope, sha(canon)].join("\n");
  let k = hmac("AWS4" + SK, day); k = hmac(k, "auto"); k = hmac(k, "s3"); k = hmac(k, "aws4_request");
  const sig = createHmac("sha256", k).update(sts).digest("hex");
  const auth = `AWS4-HMAC-SHA256 Credential=${AK}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${sig}`;
  const url = `${EP}${path}${qs ? "?" + qs : ""}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { headers: { ...headers, authorization: auth } });
      if (r.status >= 500 || r.status === 429) { await new Promise((z) => setTimeout(z, 1000 * 2 ** attempt)); continue; }
      return r;
    } catch (e) { if (attempt === 3) throw e; await new Promise((z) => setTimeout(z, 1000 * 2 ** attempt)); }
  }
}
const tag = (xml, t) => [...xml.matchAll(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`, "g"))].map((m) => m[1]);
const unxml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

async function listAll(prefix, delimiter) {
  const out = { dirs: [], files: [] };
  let token = null;
  do {
    const q = { "list-type": "2", prefix, "max-keys": "1000" };
    if (delimiter) q.delimiter = delimiter;
    if (token) q["continuation-token"] = token;
    const r = await req(`/${BUCKET}`, q);
    const xml = await r.text();
    if (r.status !== 200) { console.error("list failed", r.status, xml.slice(0, 200)); process.exit(1); }
    for (const c of tag(xml, "Contents")) out.files.push({ key: unxml(tag(c, "Key")[0]), size: +tag(c, "Size")[0], date: tag(c, "LastModified")[0] });
    for (const p of tag(xml, "CommonPrefixes")) out.dirs.push(unxml(tag(p, "Prefix")[0]));
    token = tag(xml, "IsTruncated")[0] === "true" ? unxml(tag(xml, "NextContinuationToken")[0]) : null;
  } while (token);
  return out;
}

const [cmd, a, ...rest] = process.argv.slice(2);
if (cmd === "dirs") {
  const o = await listAll(a || "", "/");
  for (const d of o.dirs) console.log("D\t" + d);
  for (const f of o.files) console.log(`F\t${f.key}\t${f.size}\t${f.date}`);
} else if (cmd === "list") {
  const o = await listAll(a || "", null);
  for (const f of o.files) console.log(`${f.key}\t${f.size}\t${f.date}`);
} else if (cmd === "get") {
  for (const key of rest) {
    const r = await req(`/${BUCKET}/${encPath(key)}`);
    if (r.status !== 200) { console.error("get failed", r.status, key); continue; }
    const buf = Buffer.from(await r.arrayBuffer());
    const p = join(a, key); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, buf);
    console.log(`${buf.length}\t${p}`);
  }
} else { console.error("usage: dirs|list|get"); process.exit(2); }
