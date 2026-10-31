import { loadRows, fieldOf, parse, traceAt } from "./common.mjs";
const rows = loadRows();
const defs = new Map();
for (const r of rows) if (!defs.has(r.def)) defs.set(r.def, { routes: 0, slices: 0 });
for (const r of rows) { const d = defs.get(r.def); d.routes++; if (r.route !== r.def) d.slices++; }
const c = {}; const inc = (k) => (c[k] = (c[k] || 0) + 1);
const ends = {}; const pieceFreq = new Map(); const groupFreq = new Map();
for (const [def, d] of defs) {
  const f = fieldOf(def); inc("rec:" + f); if (d.slices) inc("recslice:" + f);
  if (f === "list" && !/[×+]/u.test(def)) { const t = def.trim(); if (!/\.$/u.test(t)) inc("list_end_bracket:" + t.slice(-30)); }
  if (f === "def") {
    const p = parse(def);
    let start = 0;
    for (let i = 0; i < def.length; i++) {
      if ((def[i] === "," || def[i] === ";") && p.depth[i] === 0) {
        const piece = def.slice(start, i).trim();
        if (def[i] === "," && !traceAt(def, i) && piece.split(/\s+/).length <= 3) pieceFreq.set(piece, (pieceFreq.get(piece) || 0) + 1);
        start = i + 1;
      }
      if (def[i] === "(" && p.partner[i] > i) { const g = def.slice(i + 1, p.partner[i]).trim(); if (g.split(/\s+/).length <= 3) groupFreq.set(g, (groupFreq.get(g) || 0) + 1); }
    }
  }
}
console.log(c);
console.log("PIECES", [...pieceFreq].sort((a, b) => b[1] - a[1]).slice(0, 120).map(([k, v]) => `${k}=${v}`).join(" | "));
console.log("GROUPS", [...groupFreq].sort((a, b) => b[1] - a[1]).slice(0, 120).map(([k, v]) => `${k}=${v}`).join(" | "));
