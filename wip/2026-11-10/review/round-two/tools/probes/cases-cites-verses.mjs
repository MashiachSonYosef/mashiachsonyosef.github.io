// Word places whose "cites here" list is their own verse's and not their surface's first verse's, as cases
// ({ s, at }) for line-vs-first-pill.mjs: read off a sidecar that carries the per-verse entries (v).
// node cases-cites-verses.mjs <zones dir with the new sidecars> <book> <out.json> [--max N] [--leader-differs]
//   --leader-differs  only places whose own "cites here" leader is another reading than the first verse's (or none)
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [dir, book, outPath] = process.argv.slice(2);
const flag = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const MAX = Number(flag("--max", "1000000")), ONLY = process.argv.includes("--leader-differs");
const g = JSON.parse(gunzipSync(readFileSync(join(dir, `${book}.lattice.bin`))).toString("utf8")).grades;
const out = [];
let all = 0;
for (const [s, gr] of Object.entries(g)) for (const [at, own] of Object.entries(gr.v || {})) {
  all += 1;
  const a = gr.o && gr.o.c ? gr.o.c[0] : null, b = own.c ? own.c[0] : null;
  if (ONLY && a === b) continue;
  out.push({ s, at });
}
const step = Math.max(1, Math.floor(out.length / MAX));
const picked = out.filter((_, i) => i % step === 0).slice(0, MAX);
writeFileSync(outPath, JSON.stringify(picked));
console.log(`${book}: ${all} verses carry their own list; ${out.length} ${ONLY ? "with another leader than the first verse's" : "in all"}${picked.length < out.length ? `, ${picked.length} taken` : ""} -> ${outPath}`);
