#!/usr/bin/env node
// Mark ledger for one provider: kaikki_wiktionary_hebrew (M13, M25, M11, M69, M50).
//
// One pass over the provider's routes. Every mark occurrence (any character
// that is not a letter, digit or whitespace) is given exactly one SHAPE by an
// ordered list of deterministic tests; each shape says what the mark means in
// this provider and whether it divides readings. The declaration's division
// is the set of occurrences whose shape divides; the pieces must rejoin into
// the route character for character or the route ships whole. The same pass
// compares that division with today's engine (sense-split-rule-v3), both as
// sense-split-v1.mjs's senseSplit alone and as the card runs it (zone.html:
// the semicolon split, then the comma rule per sense, damaged senses dropped).
//
// Read-only on everything but this folder. Usage:
//   node ledger.mjs <provider.jsonl> <mark-inventory.json> <ghp/reader dir> <out dir>

import { createReadStream, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { SHAPES, parse } from "./declaration-kaikki.mjs";

const [SRC, INVENTORY, READER, OUT] = process.argv.slice(2);
const M_IDS = ["M13", "M25", "M11", "M69", "M50"];
const SOURCE_KEY = "kaikki_wiktionary_hebrew";

// ---- today's engine -----------------------------------------------------
const v3 = await import(pathToFileURL(join(READER, "tools", "sense-split-v1.mjs")).href);
// the card's own pair, grabbed from zone.html the way bake-search-index-v1.mjs does
const zone = readFileSync(join(READER, "zone.html"), "utf8");
const grab = (head, end) => {
  const a = zone.indexOf(head);
  if (a < 0 || zone.indexOf(head, a + 1) >= 0) throw new Error(`zone.html does not hold exactly one ${head.trim()}`);
  const b = zone.indexOf(end, a);
  return zone.slice(a, b + end.length);
};
const { readingSplit, senseSplit: zoneSenseSplit } = new Function(
  `${grab("\n  const readingSplit = (text) => {\n", "\n  };\n")}${grab("\n  const senseSplit = (text) => {\n", "\n  };\n")}return { readingSplit, senseSplit };`,
)();
const v3Literal = (t) => v3.senseSplit(t).readings.map((x) => x.trim()).filter(Boolean);
// zone.html's readingSplit against sense-split-v1.mjs's senseSplit, sense by sense: the card's comma rule is the module's
const equivalence = { senses: 0, same: 0, differ: 0, examples: [] };
const v3Display = (t) => {
  const out = [];
  let damaged = 0;
  for (const sense of zoneSenseSplit(t)) {
    { const a = readingSplit(sense).readings.map((x) => x.trim()).filter(Boolean), b = v3.senseSplit(sense).readings.map((x) => x.trim()).filter(Boolean);
      equivalence.senses += 1;
      if (a.length === b.length && a.every((x, k) => x === b[k])) equivalence.same += 1;
      else { equivalence.differ += 1; if (equivalence.examples.length < 6) equivalence.examples.push({ sense: sense.slice(0, 60), card: a.map((x) => x.slice(0, 40)), module: b.map((x) => x.slice(0, 40)) }); } }
    const r = readingSplit(sense);
    if (r.damaged) { damaged += 1; continue; }
    out.push(...r.readings.map((x) => x.trim()).filter(Boolean));
  }
  return { readings: out, damaged };
};

// ---- run ----------------------------------------------------------------------
const census = { route: {}, def: {} };
const bump = (where, c, s, key, text, i, rowSeen, role) => {
  const m = (census[where][c] ||= { occurrences: 0, routes: 0, shapes: {} });
  m.occurrences += 1;
  if (!rowSeen.has(c)) { rowSeen.add(c); m.routes += 1; }
  const sh = (m.shapes[s] ||= { count: 0, routes: 0, _last: -1, examples: [] });
  sh.count += 1;
  if (role) { sh.by_region ||= {}; sh.by_region[role] = (sh.by_region[role] || 0) + 1; }
  if (sh._last !== rowSeen.rowNo) { sh._last = rowSeen.rowNo; sh.routes += 1; }
  if (sh.examples.length < 3) {
    const a = Math.max(0, i - 28), w = text.slice(a, a + 58);
    if (!sh.examples.some((e) => e.endsWith(w))) sh.examples.push(`${key}: ${a > 0 ? "…" : ""}${w}${a + 58 < text.length ? "…" : ""}`);
  }
};
const cmp = { routes: 0, same: 0, v3_divides_decl_whole: 0, decl_divides_v3_whole: 0, divided_differently: 0, v3_prints_nothing: 0, ex: { v3_divides_decl_whole: [], decl_divides_v3_whole: [], divided_differently: [], v3_prints_nothing: [] }, distinct: { same: new Set(), v3_divides_decl_whole: new Set(), decl_divides_v3_whole: new Set(), divided_differently: new Set(), v3_prints_nothing: new Set() } };
const cmpLit = { same: 0, v3_divides_decl_whole: 0, decl_divides_v3_whole: 0, divided_differently: 0, ex: { v3_divides_decl_whole: [], decl_divides_v3_whole: [], divided_differently: [] } };
// why each disagreeing route disagrees: the declaration's dividing and holding shapes it carries (a route may carry several)
const causes = {};
const DIVIDE_CAUSE = { "colon.head_explanation": "declaration divides at ':' (v3 never does)", "colon.pointer_gloss": "declaration divides at ':' (v3 never does)", "colon.gloss_pointer": "declaration divides at ':' (v3 never does)", "colon.strongs_list": "declaration divides at ':' (v3 never does)", "period.sentence_boundary": "declaration divides at a sentence '.' (v3 never does)", "period.before_trailing_note": "declaration divides at a sentence '.' (v3 never does)" };
const HOLD_CAUSE = (s) => s.endsWith("under_lead_label") ? "declaration holds the line under a lead or trailing label" : s === "comma.pointer" ? "declaration holds a form pointer's commas" : s === "comma.in_note" ? "declaration holds a note's commas" : s === "comma.strongs_list" ? "declaration holds a Strong's list" : /^comma\.(after_label|before_etc|before_clause|before_serial_conjunction|before_relative|shared_object|list_inside_sentence|before_bare_group)$/.test(s) ? "declaration holds a sentence's commas (clause, conjunction, label, etc.)" : (s === "semicolon.in_quotation" || s === "comma.in_quotation") ? "declaration holds a mark inside a quotation" : (s === "comma.in_brackets") ? "declaration holds a comma inside square brackets" : null;
const region = { whole: 0, slice_tail_after_lead_label: 0, slice_other: 0, absent: 0 };
const decl = { long_comma_pieces: { pieces: 0, routes: 0, note: "pieces of more than 4 words outside parentheses standing beside a comma.gloss_boundary in the same route: the class sense-split-rule-v3 refuses and this declaration divides" }, trailing_label_routes: 0, trailing_note_routes: 0, routes_divided: 0, pieces: 0, rejoin_failures: 0, lead_label_routes: 0, unclosed_routes: 0, by_role: {}, routes_with_explanation: 0, routes_with_note: 0, by_m: {} };
const changesOut = [];
const short = (s) => (s.length > 60 ? `${s.slice(0, 57)}…` : s);
let rowNo = 0;
const rl = createInterface({ input: createReadStream(SRC, "utf8"), crlfDelay: Infinity });
for await (const line of rl) {
  if (!line.trim()) continue;
  const r = JSON.parse(line); rowNo += 1;
  const R = r.route, D = r.def;
  if (R === D) region.whole += 1;
  else if (D.endsWith(R) && /^\s*\([^()]*\)\s*$/.test(D.slice(0, D.length - R.length))) { region.slice_tail_after_lead_label += 1; (region.slice_tail_by_m ||= {})[r.m] = (region.slice_tail_by_m[r.m] || 0) + 1; }
  else if (D.includes(R)) region.slice_other += 1; else region.absent += 1;
  for (const [where, text] of [["route", R], ["def", D]]) {
    const p = where === "route" ? parse(R) : (D === R ? null : parse(D));
    const res = p || parse(R);
    const seen = new Set(); seen.rowNo = rowNo;
    for (const [i, s] of [...res.occ.entries()].sort((a, b) => a[0] - b[0])) bump(where, text[i], s, r.key, text, i, seen, res.occRole.get(i));
    if (where === "def") continue;
    // declaration
    const pcs = res.readings.map((x) => x.text);
    if (res.leadLabel && res.trailKind !== "label") { decl.lead_label_routes += 1; (decl.lead_label_by_m ||= {})[r.m] = (decl.lead_label_by_m[r.m] || 0) + 1; }
    if (res.trailKind === "label") { decl.trailing_label_routes += 1; (decl.trailing_label_by_m ||= {})[r.m] = (decl.trailing_label_by_m[r.m] || 0) + 1; }
    if (res.trailKind === "note") decl.trailing_note_routes += 1;
    if (res.unclosed) decl.unclosed_routes += 1;
    if (!res.rejoins) decl.rejoin_failures += 1;
    if (pcs.length > 1) { decl.routes_divided += 1; decl.pieces += pcs.length; }
    if (pcs.length > 1 && [...res.occ.values()].includes("comma.gloss_boundary")) {
      const wcl = (t) => t.replace(/\([^()]*\)/g, " ").split(/\s+/).filter(Boolean).length;
      const long = res.readings.filter((x) => (x.role === "head" || x.role === "explanation" || x.role === "gloss") && wcl(x.text) > 4).length;
      if (long) { decl.long_comma_pieces.pieces += long; decl.long_comma_pieces.routes += 1; }
    }
    for (const x of res.readings) decl.by_role[x.role] = (decl.by_role[x.role] || 0) + (pcs.length > 1 ? 1 : 0);
    if (pcs.length > 1 && res.readings.some((x) => x.role === "explanation")) decl.routes_with_explanation += 1;
    if (pcs.length > 1 && res.readings.some((x) => x.role === "note")) decl.routes_with_note += 1;
    const bm = (decl.by_m[r.m] ||= { routes: 0, divided: 0 }); bm.routes += 1; if (pcs.length > 1) bm.divided += 1;
    // comparison
    const dsp = v3Display(R);
    const v = dsp.readings, lit = v3Literal(R);
    const eq = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);
    cmp.routes += 1;
    let kind;
    if (v.length === 0) kind = "v3_prints_nothing";
    else if (eq(v, pcs)) kind = "same";
    else if (v.length > 1 && pcs.length === 1) kind = "v3_divides_decl_whole";
    else if (pcs.length > 1 && v.length === 1) kind = "decl_divides_v3_whole";
    else kind = "divided_differently";
    cmp[kind] += 1; cmp.distinct[kind].add(R);
    if (kind !== "same") {
      const why = new Set();
      for (const s of res.occ.values()) { if (DIVIDE_CAUSE[s]) why.add(DIVIDE_CAUSE[s]); const h = HOLD_CAUSE(s); if (h) why.add(h); }
      const wc = (t) => t.replace(/\([^()]*\)/g, " ").split(/\s+/).filter(Boolean).length;
      if ([...res.occ.values()].includes("comma.gloss_boundary") && pcs.some((t) => wc(t) > 4)) why.add("declaration divides at a comma beside a piece of more than 4 words (v3 holds the field as a sentence)");
      if (pcs.some((t) => /^(and|or|nor|but)$/i.test(t.trim())) && [...res.occ.values()].includes("comma.gloss_boundary")) why.add("v3 drops a bare conjunction piece that is the provider's own gloss (but, yet, in fact)");
      if (kind === "v3_prints_nothing") why.add("v3 drops a sense whose parentheses do not balance; the declaration ships it whole");
      if (!why.size) why.add("other");
      for (const w of why) { const c = (causes[kind] ||= {}); c[w] = (c[w] || 0) + 1; }
    }
    if (kind !== "same") {
      const ex = cmp.ex[kind];
      if (ex.length < 6 && !ex.some((e) => e.route === short(R)) && (rowNo * 2654435761 % 97) < 9) ex.push({ key: r.key, m: r.m, route: short(R), v3: v.map(short), declaration: pcs.map(short) });
      changesOut.push(JSON.stringify({ key: r.key, m: r.m, kind, route: R, v3: v, declaration: pcs }));
    }
    let lk;
    if (eq(lit, pcs)) lk = "same"; else if (lit.length > 1 && pcs.length === 1) lk = "v3_divides_decl_whole"; else if (pcs.length > 1 && lit.length === 1) lk = "decl_divides_v3_whole"; else lk = "divided_differently";
    cmpLit[lk] += 1;
    if (lk !== "same") { const ex = cmpLit.ex[lk]; if (ex.length < 6 && !ex.some((e) => e.route === short(R)) && (rowNo * 2654435761 % 89) < 7) ex.push({ key: r.key, m: r.m, route: short(R), v3: lit.map(short), declaration: pcs.map(short) }); }
  }
}

// ---- inventory check -------------------------------------------------------
const inv = JSON.parse(readFileSync(INVENTORY, "utf8"));
const invMarks = {};
for (const p of inv.providers) if (M_IDS.includes(p.provider)) for (const mk of p.marks) {
  const x = (invMarks[mk.mark] ||= { occurrences: 0, routes: 0 }); x.occurrences += mk.occurrences; x.routes += mk.routes_carrying_it;
}
const invMismatch = [];
for (const c of new Set([...Object.keys(invMarks), ...Object.keys(census.route)])) {
  const a = invMarks[c] || { occurrences: 0, routes: 0 }, b = census.route[c] || { occurrences: 0, routes: 0 };
  if (a.occurrences !== b.occurrences || a.routes !== b.routes) invMismatch.push({ mark: c, inventory: a, jsonl: { occurrences: b.occurrences, routes: b.routes } });
}

// ---- write --------------------------------------------------------------------
const tidy = (where) => Object.entries(census[where]).sort((a, b) => b[1].occurrences - a[1].occurrences).map(([c, m]) => {
  const shapes = Object.entries(m.shapes).filter(([s]) => !s.startsWith("UNEXPLAINED")).sort((a, b) => b[1].count - a[1].count)
    .map(([s, v]) => ({ shape: s, test: SHAPES[s].test, count: v.count, routes: v.routes, means: SHAPES[s].means, divides_readings: SHAPES[s].divides, ...(v.by_region ? { by_region: v.by_region } : {}), examples: v.examples }));
  const un = Object.entries(m.shapes).filter(([s]) => s.startsWith("UNEXPLAINED"));
  const unexplained = un.reduce((t, [, v]) => t + v.count, 0);
  const total = shapes.reduce((t, s) => t + s.count, 0) + unexplained;
  if (total !== m.occurrences) throw new Error(`shape counts do not sum for ${c}`);
  return { mark: c, codepoint: `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`, occurrences: m.occurrences, routes: m.routes, shapes, unexplained, unexplained_examples: un.flatMap(([, v]) => v.examples) };
});
const routeCensus = tidy("route"), defCensus = tidy("def");
const distinctCount = Object.fromEntries(Object.entries(cmp.distinct).map(([k, v]) => [k, v.size]));
const comparison = {
  engine: v3.RULE_ID,
  display_path: "zone.html senseSplit (depth-0 semicolons, orphan closers inert) then readingSplit per sense (sense-split-rule-v3 commas, page citations dropped); a damaged sense prints nothing",
  routes: cmp.routes,
  same_division: cmp.same,
  v3_divides_where_declaration_keeps_whole: cmp.v3_divides_decl_whole,
  declaration_divides_where_v3_keeps_whole: cmp.decl_divides_v3_whole,
  divided_differently: cmp.divided_differently,
  v3_prints_nothing_damaged: cmp.v3_prints_nothing,
  distinct_route_texts: distinctCount,
  examples: cmp.ex,
  causes_of_disagreement: causes,
  card_comma_rule_equals_sense_split_v1: { senses: equivalence.senses, same: equivalence.same, differ: equivalence.differ, examples: equivalence.examples },
  literal_sense_split_v1_only: { note: "sense-split-v1.mjs senseSplit on the whole route text, commas only, no semicolon pass", ...cmpLit },
};
writeFileSync(join(OUT, "census.json"), JSON.stringify({
  schema: "MARK_LEDGER_PILOT_V1", source_key: SOURCE_KEY, m_ids: M_IDS, measured_on: "2026-10-31", script: "ledger.mjs",
  routes: rowNo, route_region_in_definition: region,
  inventory_check: { inventory: "mark-inventory-2026-10-31.json", marks_in_inventory: Object.keys(invMarks).length, marks_in_jsonl_route_text: Object.keys(census.route).length, mismatches: invMismatch },
  route_text: routeCensus, definition_text: defCensus,
  declaration_division: decl, comparison,
}, null, 1));
writeFileSync(join(OUT, "changes-vs-v3.jsonl"), changesOut.join("\n") + "\n");
writeFileSync(join(OUT, "shapes-table.json"), JSON.stringify(SHAPES, null, 1));
console.log(JSON.stringify({ routes: rowNo, region, inventory_mismatches: invMismatch.length, decl, comparison: { ...comparison, examples: undefined } }, null, 1));
console.log("unexplained:", routeCensus.filter((m) => m.unexplained).map((m) => `${m.mark} ${m.unexplained} ${JSON.stringify(m.unexplained_examples)}`));
