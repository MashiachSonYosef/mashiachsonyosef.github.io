// The declaration's division, rebuilt from its precedence text, and the v3 comparison, rebuilt from its stated application.
import { writeFileSync } from "node:fs";
import { loadRows } from "./common.mjs";
import { analyze, useLabels } from "./classify.mjs";
import { senseSplit as v3SenseSplit } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/sense-split-v1.mjs";
const mode = process.argv[2] || "draft"; useLabels(mode);
const DIVIDES = new Set(["period.list_end", "semicolon.rendering_separator", "comma.rendering_separator", "semicolon.sense_separator", "comma.def_between_tagged_glosses"]);
// declaration: slice routes never cut; whole routes cut at the dividing shapes (depth 0 by construction; nothing after an unclosed opener is depth 0)
export const declare = (r, a) => {
  if (r.route !== r.def) return { pieces: [r.route.trim()].filter(Boolean), kept: [r.route.trim()].filter(Boolean), cuts: [] };
  const s = r.def; const cuts = [...a.shape].filter(([, sh]) => DIVIDES.has(sh)).map(([i]) => i).sort((x, y) => x - y);
  const pieces = []; const kept = []; let start = 0;
  for (const c of cuts) {
    const seg = s.slice(start, c).trim();
    if (seg) { pieces.push(seg); kept.push(a.shape.get(c) === "period.list_end" && !s.slice(c + 1).trim() ? s.slice(start, c + 1).trim() : seg); }
    start = c + 1;
  }
  const tail = s.slice(start).trim(); if (tail) { pieces.push(tail); kept.push(tail); }
  // rejoin check: every piece is a run of the provider's characters, in order
  let at = 0; for (const p of pieces) { const j = s.indexOf(p, at); if (j < 0) throw new Error("piece does not rejoin: " + r.key); at = j + p.length; }
  return { pieces, kept, cuts };
};
// v3 as the draft says it applied it: depth-0 ';' with orphan closers inert, then sense-split-v1 senseSplit per sense (damaged sense held whole)
const packSplit = (t) => {
  const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i++) { const c = t[i]; if (c === "(") d++; else if (c === ")") { if (d > 0) d--; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } }
  out.push(t.slice(start)); if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
export const v3 = (text) => { const out = []; let damaged = false; for (const sense of packSplit(text)) { const r = v3SenseSplit(sense); if (r.damaged) damaged = true; out.push(...r.readings.map((x) => String(x).trim()).filter(Boolean)); } return { readings: out, damaged }; };
if (process.argv[1].endsWith("division-variant.mjs")) {
  const rows = loadRows(); const cache = new Map();
  const c = { fields_compared: 0, same_division: 0, same_but_full_stop: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0 };
  const dec = { routes_divided: 0, pieces_from_divided: 0, list_routes_divided: 0, def_routes_divided: 0, note_pieces: 0, v3_damaged_routes: 0 };
  const ex = {}; const lines = [];
  for (const r of rows) {
    let a = cache.get(r.def); if (!a) { a = analyze(r.def); cache.set(r.def, a); }
    const D = declare(r, a); const V3 = v3(r.route);
    if (V3.damaged) dec.v3_damaged_routes++;
    if (D.pieces.length > 1) { dec.routes_divided++; dec.pieces_from_divided += D.pieces.length; dec[a.field === "list" ? "list_routes_divided" : "def_routes_divided"]++; }
    if (r.route === r.def && a.field === "list" && a.end >= 0 && r.def.slice(a.end + 1).trim()) dec.note_pieces++;
    c.fields_compared++;
    const R = V3.readings; const eq = (x, y) => x.length === y.length && x.every((v, k) => v === y[k]);
    let cat;
    if (eq(R, D.pieces)) cat = "same_division";
    else if (eq(R, D.kept)) { cat = "same_division"; c.same_but_full_stop++; }
    else if (R.length > 1 && D.pieces.length === 1) cat = "v3_divides_where_declaration_keeps_whole";
    else if (R.length <= 1 && D.pieces.length > 1) cat = "declaration_divides_where_v3_keeps_whole";
    else cat = "divided_differently";
    c[cat]++;
    if (cat !== "same_division") lines.push(JSON.stringify({ key: r.key, cat, field: a.field, slice: r.route !== r.def, v3: R.map((x) => x.slice(0, 40)), decl: D.pieces.map((x) => x.slice(0, 40)) }));
    (ex[cat] ??= []).length < 3 && cat !== "same_division" && ex[cat].push(`${r.key}: ${r.route.slice(0, 55)} | v3 ${R.length} | decl ${D.pieces.length}`);
  }
  writeFileSync(new URL(`./v3-compare-${mode}-variant.jsonl`, import.meta.url), lines.join("\n") + "\n");
  writeFileSync(new URL(`./v3-summary-${mode}-variant.json`, import.meta.url), JSON.stringify({ mode, comparison: c, declaration: dec, examples: ex }, null, 1));
  console.log("mode", mode, c); console.log(dec);
}
