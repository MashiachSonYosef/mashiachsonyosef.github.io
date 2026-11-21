// For each place where a word had no card on live and has one on the ship tree: what the resting line read, on each.
import { readFileSync, readdirSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
const [A, B] = process.argv.slice(2);
const gz = (p) => JSON.parse(gunzipSync(readFileSync(p)).toString("utf8"));
const at = (rec) => { const m = new Map(); for (const [label, units] of rec.sections || []) { const u = new Map(); for (const x of units || []) for (let j = 0; j < Math.max(1, x[1]); j += 1) u.set(x[0] + j, x); m.set(label, u); } return m; };
const T = { places: 0, same: 0, moved: 0, bare_on_live: 0, bare_on_ship: 0 }; const credits = new Map(); const shown = [];
for (const f of readdirSync(join(B, "data/zones")).filter((f) => f.endsWith(".bin") && !/\.(lattice|volume|commentary)\.bin$/.test(f))) {
  const book = f.slice(0, -4); let za, zb, la, lb;
  try { za = gz(join(A, "data/zones", f)); zb = gz(join(B, "data/zones", f)); la = at(gz(join(A, "data/resting-lines", `${book}.json.gz`))); lb = at(gz(join(B, "data/resting-lines", `${book}.json.gz`))); } catch { continue; }
  if (!zb.sections) continue; const ga = za.gloss || {}, gb = zb.gloss || {};
  for (const sec of zb.sections) (sec.words || []).forEach((w, i) => {
    if (!(w.k && ga[w.k] === undefined && gb[w.k] !== undefined)) return;
    T.places += 1; const x = (la.get(String(sec.label)) || new Map()).get(i) || null, y = (lb.get(String(sec.label)) || new Map()).get(i) || null;
    const tx = x ? String(x[2] || "") : "", ty = y ? String(y[2] || "") : "";
    if (!tx) T.bare_on_live += 1; if (!ty) T.bare_on_ship += 1;
    if (tx === ty) T.same += 1; else T.moved += 1;
    const c = `${x ? x[3] : "-"} → ${y ? y[3] : "-"}`; credits.set(c, (credits.get(c) || 0) + 1);
    if (shown.length < 8) shown.push(`${book} ${sec.label} word ${i + 1}: «${tx}» [${x ? x[3] : "-"}] → «${ty}» [${y ? y[3] : "-"}]`);
  });
}
console.log(JSON.stringify(T)); for (const [c, n] of [...credits].sort((a, b) => b[1] - a[1])) console.log(`  ${n}  credit ${c}`); console.log(shown.join("\n"));
