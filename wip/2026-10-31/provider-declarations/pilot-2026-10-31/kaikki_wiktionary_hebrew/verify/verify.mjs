// Verify the kaikki_wiktionary_hebrew declaration: census by independent tests, completeness,
// division under the declared precedence, and the v3 comparison.
// run: node verify.mjs <by-source jsonl> <draft census.json (numbers only)> <ghp/reader> <out dir> [hebrewOutside=parens|scopes]
import { readFileSync, writeFileSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { isMark, isHebPoint } from "./lib.mjs";
import { analyzeRoute, OPTS } from "./classify.mjs";
import { markShape } from "./marks.mjs";
const [jsonl, draftCensus, reader, outDir, hebOpt, mode] = process.argv.slice(2);
if (hebOpt) OPTS.hebrewOutside = hebOpt;
if (mode === "reconcile") OPTS.reconcile = true;
const TAG = `${OPTS.hebrewOutside}${OPTS.reconcile ? ".reconcile" : ""}`;
const { senseSplit: v3Split } = await import(pathToFileURL(join(reader, "tools", "sense-split-v1.mjs")).href);

const shapes = new Map(); // mark -> shape -> {count, routes:Set, ex:[]}
const overlaps = new Map(); // "mark|a+b" -> {count, ex}
const unexplained = new Map();
const win = (key, s, i) => { const a = Math.max(0, i - 28); return `${key}: ${a > 0 ? "…" : ""}${s.slice(a, a + 56)}${a + 56 < s.length ? "…" : ""}`; };
const bucket = (m) => isHebPoint(m) ? "HEBREW_POINTS" : m.length === 1 && m.charCodeAt(0) === 0x031E ? "U+031E" : m;
const add = (mark, sh, key, s, i, ri) => {
  if (!shapes.has(mark)) shapes.set(mark, new Map());
  const M = shapes.get(mark); if (!M.has(sh)) M.set(sh, { count: 0, routes: new Set(), ex: [] });
  const e = M.get(sh); e.count++; e.routes.add(ri); if (e.ex.length < 6) e.ex.push(win(key, s, i));
};
const DIV = new Set(["comma.gloss_boundary", "semicolon.sense_boundary", "semicolon.note_follows", "period.sentence_boundary", "period.before_trailing_note", "colon.head_explanation", "colon.pointer_gloss", "colon.gloss_pointer", "colon.strongs_list"]);
const cmp = { routes: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_prints_nothing: 0, both_single_text_differs: 0 };
const cmpEx = {}; const exPush = (k, v) => { (cmpEx[k] ||= []); if (cmpEx[k].length < 8) cmpEx[k].push(v); };
const div = { routes_divided: 0, pieces_in_divided_routes: 0, pieces_all_routes: 0, rejoin_failures: 0, label_routes: 0, lead: 0, closing: 0, trailing_note: 0, unclosed_routes: 0, dividing_mark_in_label_route: 0, dividing_colon_in_note_segment: 0, by_m: {} };
const changes = []; const alone = {};
const rl = createInterface({ input: createReadStream(jsonl, "utf8"), crlfDelay: Infinity });
let ri = -1;
for await (const line of rl) {
  if (!line) continue; ri++;
  const r = JSON.parse(line); const s = r.route; cmp.routes++;
  const R = analyzeRoute(s);
  const divs = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!isMark(c)) continue;
    const { shape, hits } = markShape(R, i);
    add(bucket(c), shape, r.key, s, i, ri);
    if (isHebPoint(c)) add("POINT " + c, shape, r.key, s, i, ri);
    if (/UNEXPLAINED|UNSTATED|UNKNOWN/u.test(shape)) { const k = bucket(c) + "|" + shape; const u = unexplained.get(k) || { count: 0, ex: [] }; u.count++; if (u.ex.length < 6) u.ex.push(win(r.key, s, i)); unexplained.set(k, u); }
    if (hits && hits.length >= 2) { const k = bucket(c) + "|" + hits.join("+"); const o = overlaps.get(k) || { count: 0, ex: [] }; o.count++; if (o.ex.length < 4) o.ex.push(win(r.key, s, i)); overlaps.set(k, o); }
    if (DIV.has(shape)) divs.push([i, shape]);
  }
  // ---- division under the declaration
  const labelled = R.ledByLabel || R.closedByLabel;
  if (labelled) { div.label_routes++; if (R.ledByLabel) div.lead++; if (R.closedByLabel) div.closing++; if (divs.length) div.dividing_mark_in_label_route++; }
  if (R.trailingKind === "note") div.trailing_note++;
  if (R.P.groups.some((g) => g.kind === "(" && g.close < 0)) div.unclosed_routes++;
  for (const [i, sh] of divs) if (sh.startsWith("colon.") && sh !== "colon.strongs_list") { const seg = R.segs.find(([a, b]) => i >= a && i < b); if (seg && /^\s*(used|see|said of|indicating|also|for example|in full|it|this)\b/iu.test(s.slice(seg[0], seg[1]))) div.dividing_colon_in_note_segment++; }
  let pieces;
  if (labelled || !divs.length) pieces = [s.trim()].filter(Boolean);
  else {
    pieces = []; let st = 0; const spans = [];
    for (const [i, sh] of divs) { const end = s[i] === "." ? i + 1 : i; spans.push([st, end]); st = i + 1; }
    spans.push([st, s.length]);
    let rebuilt = ""; let prevEnd = 0;
    for (const [a, b] of spans) { const raw = s.slice(a, b); const t = raw.trim(); if (t) pieces.push(t); }
    // rejoin: each piece is a run of the route's characters, in order, and only whitespace and the divider marks lie between
    let pos = 0, ok = true; const between = [];
    for (const p of pieces) { const j = s.indexOf(p, pos); if (j < 0) { ok = false; break; } between.push(s.slice(pos, j)); pos = j + p.length; }
    between.push(s.slice(pos));
    if (ok) ok = between.every((b) => /^[\s,;:]*$/u.test(b)) && between.join("").replace(/\s/gu, "").length === divs.filter(([i]) => s[i] !== ".").length;
    if (!ok) div.rejoin_failures++;
  }
  div.pieces_all_routes += pieces.length;
  div.by_m[r.m] ||= { routes: 0, divided: 0 }; div.by_m[r.m].routes++;
  if (pieces.length > 1) { div.routes_divided++; div.pieces_in_divided_routes += pieces.length; div.by_m[r.m].divided++; }
  // ---- v3 on the card's path: zone senseSplit (depth-0 ';', orphan closers inert), then readingSplit per sense
  const senses = zoneSenseSplit(s);
  const v3 = [];
  for (const sense of senses) {
    const x = v3Split(sense);
    if (x.damaged) continue;
    const kept = x.readings.filter((p) => !/^p{1,2}\.\s*\d/u.test(p));
    v3.push(...(kept.length ? kept : x.readings));
  }
  { const a = v3Split(s).readings; let c2;
    if (a.length === pieces.length && a.every((x, k) => x === pieces[k])) c2 = "same"; else if (a.length > 1 && pieces.length <= 1) c2 = "v3_divides_decl_whole"; else if (pieces.length > 1 && a.length <= 1) c2 = "decl_divides_v3_whole"; else c2 = "divided_differently";
    alone[c2] = (alone[c2] || 0) + 1; }
  let cls;
  if (!v3.length) cls = "v3_prints_nothing";
  else if (v3.length === pieces.length && v3.every((x, k) => x === pieces[k])) cls = "same_division";
  else if (v3.length > 1 && pieces.length <= 1) cls = "v3_divides_where_declaration_keeps_whole";
  else if (pieces.length > 1 && v3.length <= 1) cls = "declaration_divides_where_v3_keeps_whole";
  else { cls = "divided_differently"; if (v3.length === 1 && pieces.length === 1) cmp.both_single_text_differs++; }
  cmp[cls]++;
  if (cls !== "same_division") { changes.push(JSON.stringify({ key: r.key, m: r.m, cls, route: s, v3, declaration: pieces })); exPush(cls, `${r.key} (${r.m}): ${s.slice(0, 56)}${s.length > 56 ? "…" : ""}`); }
}
function zoneSenseSplit(text) {
  const t = String(text || ""); const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
}
// ---- compare with the draft's census numbers
const draft = JSON.parse(readFileSync(draftCensus, "utf8"));
const draftShapes = new Map();
for (const m of draft.route_text) { const b = bucket(m.mark); if (!draftShapes.has(b)) draftShapes.set(b, new Map()); for (const s of m.shapes) { const M = draftShapes.get(b); M.set(s.shape, (M.get(s.shape) || 0) + s.count); } }
const table = [];
const allMarks = new Set([...shapes.keys()].filter((k) => !k.startsWith("POINT ")).concat([...draftShapes.keys()]));
let exact = 0, differ = 0;
for (const m of allMarks) {
  const mine = shapes.get(m) || new Map(); const theirs = draftShapes.get(m) || new Map();
  const names = new Set([...mine.keys(), ...theirs.keys()]);
  for (const sh of names) {
    const a = mine.get(sh); const b = theirs.get(sh) ?? 0;
    const row = { mark: m, shape: sh, draft: b, mine: a ? a.count : 0, routes: a ? a.routes.size : 0, diff: (a ? a.count : 0) - b };
    if (row.diff === 0) exact++; else { differ++; row.examples = a ? a.ex : []; }
    table.push(row);
  }
}
const out = {
  run: { script: "verify.mjs + classify.mjs + marks.mjs + lib.mjs", hebrewOutside: OPTS.hebrewOutside, reconcile: OPTS.reconcile, routes: cmp.routes },
  counts_exact_rows: exact, counts_differing_rows: differ,
  differing: table.filter((r) => r.diff !== 0),
  table,
  unexplained: Object.fromEntries(unexplained),
  overlaps: Object.fromEntries([...overlaps].sort((a, b) => b[1].count - a[1].count)),
  division: div, comparison: cmp, sense_split_v1_alone: alone, comparison_examples: cmpEx,
};
writeFileSync(join(outDir, `verify.out.${TAG}.json`), JSON.stringify(out, null, 1));
writeFileSync(join(outDir, `changes-vs-v3.${TAG}.jsonl`), changes.join("\n") + "\n");
console.log(JSON.stringify({ exact, differ, unexplained: [...unexplained].map(([k, v]) => k + "=" + v.count), division: { routes_divided: div.routes_divided, pieces: div.pieces_in_divided_routes, rejoin_failures: div.rejoin_failures, label_routes: div.label_routes, lead: div.lead, closing: div.closing, trailing_note: div.trailing_note, unclosed: div.unclosed_routes, dividing_mark_in_label_route: div.dividing_mark_in_label_route, colon_in_note: div.dividing_colon_in_note_segment }, cmp, alone }));
