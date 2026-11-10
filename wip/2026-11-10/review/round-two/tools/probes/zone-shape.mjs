// The shapes a zone's word entries take, with one example of each, and the zone's own counts.
// node zone-shape.mjs <zone.bin>
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
const z = JSON.parse(gunzipSync(readFileSync(process.argv[2])).toString("utf8"));
const shapes = new Map();
let entries = 0;
for (const sec of z.sections || []) for (const w of sec.words || []) {
  entries += 1;
  const shape = [w.mark ? `mark:${w.mark.kind}` : "", w.kq ? "kq" : "", Array.isArray(w.w) ? `w[${w.w.map((r) => r.role || "?").join(",")}]` : "", w.k ? "k" : "", w.s !== undefined ? "s" : "", w.presentation_join ? "pj" : ""].filter(Boolean).join(" ");
  if (!shapes.has(shape)) shapes.set(shape, { n: 0, ex: { at: sec.label, w: JSON.parse(JSON.stringify(w)) } });
  shapes.get(shape).n += 1;
}
console.log(`entries ${entries} · counts ${JSON.stringify(z.counts)}`);
for (const [s, v] of [...shapes].sort((a, b) => b[1].n - a[1].n)) {
  const w = v.ex.w; delete w.pg; delete w.pc;
  console.log(`${String(v.n).padStart(6)}  ${s}\n        ${v.ex.at}: ${JSON.stringify(w).slice(0, 420)}`);
}
