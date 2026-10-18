// READ-ONLY: GET many R2 objects to files. stdin lines "index<TAB>key"; writes OUTDIR/<index 6 digits>.bin;
// prints "index<TAB>ok|fail<TAB>bytes<TAB>status" per object. Concurrency argv[3] (default 8). One retry.
// Signed exactly like scratchpad/r2get.mjs (SigV4, UNSIGNED-PAYLOAD).
import { createHmac, createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createInterface } from "node:readline";
const env = process.env, KEY = env.R2_ACCESS_KEY_ID, SECRET = env.R2_SECRET_ACCESS_KEY, ENDPOINT = env.R2_ENDPOINT, BUCKET = env.R2_BUCKET;
const host = new URL(ENDPOINT).host, OUT = process.argv[2], CONC = Number(process.argv[3] || 8);
const sha = (b) => createHash("sha256").update(b).digest("hex"), hmac = (k, s) => createHmac("sha256", k).update(s).digest();
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
async function get(key, file) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""), day = now.slice(0, 8);
  const path = `/${enc(BUCKET)}/${key.split("/").map(enc).join("/")}`;
  const headers = { host, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": now }, signed = Object.keys(headers).sort();
  const canon = ["GET", path, "", ...signed.map((h) => `${h}:${headers[h]}`), "", signed.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${day}/auto/s3/aws4_request`, toSign = ["AWS4-HMAC-SHA256", now, scope, sha(Buffer.from(canon))].join("\n");
  const kSign = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, day), "auto"), "s3"), "aws4_request");
  const res = await fetch(`https://${host}${path}`, { headers: { ...headers, Authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signed.join(";")}, Signature=${createHmac("sha256", kSign).update(toSign).digest("hex")}` } });
  if (!res.ok) { await res.arrayBuffer().catch(() => {}); return [false, 0, res.status]; }
  let n = 0; const counted = Readable.fromWeb(res.body); counted.on("data", (c) => { n += c.length; });
  await pipeline(counted, createWriteStream(file));
  return [true, n, res.status];
}
const queue = []; let ended = false, active = 0, wake = null;
const rl = createInterface({ input: process.stdin });
rl.on("line", (l) => { if (l.trim()) { queue.push(l); if (wake) { wake(); wake = null; } } });
rl.on("close", () => { ended = true; if (wake) { wake(); wake = null; } });
async function worker() {
  for (;;) {
    if (!queue.length) { if (ended) return; await new Promise((r) => { wake = r; setTimeout(r, 200); }); continue; }
    const [idx, key] = queue.shift().split("\t");
    const file = `${OUT}/${String(idx).padStart(6, "0")}.bin`;
    let r; try { r = await get(key, file); } catch (e) { r = [false, 0, String(e).slice(0, 80)]; }
    if (!r[0]) { try { r = await get(key, file); } catch (e) { r = [false, 0, String(e).slice(0, 80)]; } }
    process.stdout.write(`${idx}\t${r[0] ? "ok" : "fail"}\t${r[1]}\t${r[2]}\n`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
