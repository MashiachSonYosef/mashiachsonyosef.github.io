// Body-only recompression test with Node's bundled zlib (local only); pairs with recomp-raw.py.
// Usage: node recomp-raw.mjs ROOT KEYS.txt PY_OUT.jsonl OUT.jsonl
import { readFileSync, writeFileSync } from "node:fs";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { join } from "node:path";
const [ROOT, KEYS, PY, OUT] = process.argv.slice(2);
const py = readFileSync(PY, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out = [];
for (const r of py) {
  const b = readFileSync(join(ROOT, r.k)); const body = b.subarray(r.header_len, b.length - 8 - Math.max(0, r.members_after_first_bytes));
  const raw = inflateRawSync(b.subarray(r.header_len)); let hit = null;
  for (const memLevel of [8, 9]) { for (let level = 1; level <= 9 && !hit; level++) { if (Buffer.from(deflateRawSync(raw, { level, memLevel })).equals(body)) hit = { level, memLevel }; } if (hit) break; }
  out.push(JSON.stringify({ ...r, node_raw: hit }));
}
writeFileSync(OUT, out.join("\n") + "\n");
