// Every place of one key in a zone: the verse, the pointed surface and the pieces the place carries; and what the
// lattice sidecar holds for each pointed surface at that verse under "cites here".
// node zone-places-of-key.mjs <zones dir> <book> <key as \uXXXX escapes>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [dir, book, keyEsc] = process.argv.slice(2);
const key = JSON.parse(`"${keyEsc}"`);
const read = (f) => JSON.parse(gunzipSync(readFileSync(join(dir, f))).toString("utf8"));
const zone = read(`${book}.bin`), grades = read(`${book}.lattice.bin`).grades;
for (const sec of zone.sections || []) for (const w of sec.words || []) {
  if (!w || w.k !== key) continue;
  const gr = grades[w.s];
  const own = gr && gr.v && Object.prototype.hasOwnProperty.call(gr.v, sec.label) ? gr.v[sec.label] : null;
  const n = own ? own.n : gr ? gr.n : null, c = own ? own.c : gr && gr.o ? gr.o.c : null;
  console.log(`${sec.label} ${w.s} · the place's pieces ${JSON.stringify((w.pg || []).map((p) => p.g))} · cards naming this verse ${JSON.stringify(n)}${own ? " (the verse's own list)" : " (the first verse's list)"} · leader ${c ? JSON.stringify(c[0]) : "none"}`);
}
