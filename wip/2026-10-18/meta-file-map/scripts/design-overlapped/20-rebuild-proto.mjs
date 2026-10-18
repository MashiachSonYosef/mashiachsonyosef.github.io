// Rebuild every content of the prototype store byte for byte and prove it, written apart from the Python ingest.
// Usage: node 20-rebuild-proto.mjs STORE_DIR   (STORE_DIR holds pack.xz, chunks.tsv, contents.jsonl)
// For each content: join its chunk extents -> inner bytes -> sha256 must equal inner.sha256;
// then gzip header bytes + Node's raw deflate (level and memLevel found by trial, recorded) + crc32 + isize
// -> md5 must equal the R2 ETag and sha256 must equal the content id. Reads only local files; writes STORE_DIR/rebuild.json.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import zlib from "node:zlib";
const dir = process.argv[2];
const t0 = Date.now();
const pack = execFileSync("xz", ["-dc", `${dir}/pack.xz`], { maxBuffer: 4 * 1024 ** 3 });
const idx = readFileSync(`${dir}/chunks.tsv`, "utf8").trim().split("\n").map((l) => l.split("\t"));
const off = new Float64Array(idx.length), len = new Uint32Array(idx.length);
idx.forEach(([o, a, b, s], i) => { off[i] = +a; len[i] = +b; });
let chunkBad = 0;
for (let i = 0; i < idx.length; i += 997) { // spot check of chunk ids (the whole-file sha256 below is the real proof)
  if (createHash("sha256").update(pack.subarray(off[i], off[i] + len[i])).digest("hex") !== idx[i][3]) chunkBad++;
}
const results = [];
const tryOrder = (xfl) => {
  const first = xfl === 2 ? 9 : xfl === 4 ? 1 : 6;
  const out = [[first, 8]];
  for (let l = 1; l <= 9; l++) for (const m of [8, 9]) if (!(l === first && m === 8)) out.push([l, m]);
  return out;
};
for (const line of readFileSync(`${dir}/contents.jsonl`, "utf8").trim().split("\n")) {
  const c = JSON.parse(line);
  const parts = [];
  let total = 0;
  for (const [o, n] of c.inner.extents) {
    const a = off[o], b = off[o + n - 1] + len[o + n - 1];
    parts.push(pack.subarray(a, b)); total += b - a;
  }
  const inner = Buffer.concat(parts, total);
  const innerOk = createHash("sha256").update(inner).digest("hex") === c.inner.sha256 && inner.length === c.inner.bytes;
  const header = Buffer.from(c.wrap.header_hex, "hex");
  const trailer = Buffer.alloc(8);
  trailer.writeUInt32LE(zlib.crc32(inner) >>> 0, 0); trailer.writeUInt32LE(inner.length % 2 ** 32, 4);
  let hit = null, tries = 0;
  const t1 = Date.now();
  for (const [level, memLevel] of tryOrder(header[8])) {
    tries++;
    const body = zlib.deflateRawSync(inner, { level, memLevel });
    const whole = Buffer.concat([header, body, trailer]);
    const md5 = createHash("md5").update(whole).digest("hex");
    if (md5 === c.md5) {
      hit = { level, memLevel, md5, sha256: createHash("sha256").update(whole).digest("hex"), bytes: whole.length };
      break;
    }
    if (tries >= 4) break; // the prototype stops early; the real tool records the recipe at ingest and tries once
  }
  results.push({ sha256: c.sha256, md5: c.md5, inner_ok: innerOk, rebuilt: !!hit && hit.sha256 === c.sha256 && hit.bytes === c.bytes,
    deflater: hit ? `node ${process.versions.node} zlib ${process.versions.zlib} deflateRawSync level ${hit.level} memLevel ${hit.memLevel} strategy default, whole input at once` : null,
    tries, seconds: (Date.now() - t1) / 1000 });
  console.log(JSON.stringify(results.at(-1)));
}
const out = { zlib: process.versions.zlib, node: process.versions.node, chunks: idx.length, chunk_spot_checks_bad: chunkBad,
  contents: results.length, rebuilt_ok: results.filter((r) => r.rebuilt && r.inner_ok).length, seconds: (Date.now() - t0) / 1000, results };
writeFileSync(`${dir}/rebuild.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ contents: out.contents, rebuilt_ok: out.rebuilt_ok, chunk_spot_checks_bad: chunkBad, seconds: out.seconds }));
