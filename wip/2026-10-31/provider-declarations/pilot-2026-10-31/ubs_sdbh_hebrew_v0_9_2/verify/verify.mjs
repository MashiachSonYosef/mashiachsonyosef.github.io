// node verify.mjs  → verify.out.json : counts per shape under first-hit precedence, overlaps, unexplained,
// comparison with the draft's declaration.json shape_occurrences and the mark inventory.
import { readFileSync, writeFileSync } from "node:fs";
import { load, classifyAll, win, SCRATCH, isMark } from "./lib.mjs";

const opts = JSON.parse(process.argv[2] || "{}");
const rows = load();
const decl = JSON.parse(readFileSync(`${SCRATCH}/punct/pilot/ubs_sdbh_hebrew_v0_9_2/declaration.json`, "utf8"));
const P = Object.values(decl.providers)[0];
const inv = JSON.parse(readFileSync(`${SCRATCH}/punct/mark-inventory-2026-10-31.json`, "utf8")).providers.find((p) => p.provider === "M18");

const markOcc = {}; const shapeCount = {}; const overlap = {}; const unexplained = []; const ex = {};
for (const r of rows) {
  for (const o of classifyAll(r.route, opts)) {
    markOcc[o.mark] = (markOcc[o.mark] || 0) + 1;
    if (!o.hits.length) { unexplained.push(`${r.key}: [${o.mark}] ${win(r.route, o.i)}`); continue; }
    const k = `${o.mark}\t${o.hits[0]}`;
    shapeCount[k] = (shapeCount[k] || 0) + 1;
    if (o.hits.length > 1) { const ok = `${o.mark}\t${o.hits.join(" & ")}`; overlap[ok] = (overlap[ok] || 0) + 1; (ex[ok] ||= []).length < 4 && ex[ok].push(`${r.key}: ${win(r.route, o.i)}`); }
  }
}
// compare with stated
const stated = {};
for (const [m, v] of Object.entries(P.marks)) for (const [sh, n] of Object.entries(v.shape_occurrences || {})) stated[`${m}\t${sh}`] = n;
const diffs = [];
for (const k of new Set([...Object.keys(stated), ...Object.keys(shapeCount)])) {
  if ((stated[k] || 0) !== (shapeCount[k] || 0)) diffs.push({ k, stated: stated[k] || 0, mine: shapeCount[k] || 0 });
}
const invDiff = [];
for (const m of inv.marks) if ((markOcc[m.mark] || 0) !== m.occurrences) invDiff.push({ mark: m.mark, inv: m.occurrences, mine: markOcc[m.mark] || 0 });
for (const m of Object.keys(markOcc)) if (!inv.marks.find((x) => x.mark === m)) invDiff.push({ mark: m, inv: 0, mine: markOcc[m] });
const declMarksMissing = inv.marks.filter((m) => !P.marks[m.mark]).map((m) => m.mark);
const out = { opts, routes: rows.length, marks_seen: Object.keys(markOcc).length, total_occurrences: Object.values(markOcc).reduce((a, b) => a + b, 0),
  inventory_diffs: invDiff, declaration_missing_marks: declMarksMissing, shape_count_diffs: diffs, unexplained_count: unexplained.length, unexplained: unexplained.slice(0, 40),
  overlaps: overlap, overlap_examples: ex, shape_counts: shapeCount };
writeFileSync(new URL(`./${process.argv[3] || "verify.out.json"}`, import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ routes: out.routes, marks_seen: out.marks_seen, total: out.total_occurrences, inventory_diffs: invDiff, declaration_missing_marks: declMarksMissing, diffs, unexplained_count: unexplained.length, unexplained: unexplained.slice(0, 25), overlaps: overlap }, null, 1));
