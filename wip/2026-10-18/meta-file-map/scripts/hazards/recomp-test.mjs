// Recompression test (local only): can a .gz object be rebuilt byte for byte from its decompressed bytes?
// For each file: gunzip it, then gzip again with Node's zlib at levels 1-9 (memLevel 8 default and 9),
// patch the 10-byte header (mtime, xfl, os) to the original's, and compare all bytes.
// Usage: node recomp-test.mjs ROOT KEYS.txt OUT.jsonl
import { readFileSync, appendFileSync } from "node:fs";
import { gunzipSync, gzipSync, constants } from "node:zlib";
import { createHash } from "node:crypto";
import { join } from "node:path";
const [ROOT, KEYS, OUT] = process.argv.slice(2);
const keys = readFileSync(KEYS, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const md5 = (b) => createHash("md5").update(b).digest("hex");
for (const k of keys) {
  const orig = readFileSync(join(ROOT, k)); const raw = gunzipSync(orig);
  const flg = orig[3]; let hit = null; const tried = [];
  for (const memLevel of [8, 9]) for (const strategy of [constants.Z_DEFAULT_STRATEGY]) for (let level = 1; level <= 9 && !hit; level++) {
    const g = Buffer.from(gzipSync(raw, { level, memLevel, strategy }));
    if (flg === 0) { orig.copy(g, 4, 4, 10); }  // same mtime, xfl, os as the original header
    tried.push(level);
    if (g.length === orig.length && g.equals(orig)) hit = { level, memLevel };
  }
  appendFileSync(OUT, JSON.stringify({ k, bytes: orig.length, raw_bytes: raw.length, md5: md5(orig), header_flg: flg, os: orig[9], xfl: orig[8], node_zlib_rebuilt: hit }) + "\n");
}
console.error(`node ${process.version} zlib ${process.versions.zlib}`);
