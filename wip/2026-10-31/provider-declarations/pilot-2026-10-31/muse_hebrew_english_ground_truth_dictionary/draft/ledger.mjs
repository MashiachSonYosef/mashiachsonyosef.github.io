#!/usr/bin/env node
// Mark ledger pilot · muse_hebrew_english_ground_truth_dictionary (M6, M62) · 2026-10-31
//
// One process, one provider file. Reads (never writes) the inventory, the ranked
// sources, the provider's JSONL and the reader's tools; writes census.json,
// declaration.json and changes-vs-v3.jsonl into this folder. Every number in
// those files is computed here.
//
//   node ledger.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const PUNCT = join(OUT, "..", "..");
const TOOLS = join(PUNCT, "..", "ghp", "reader", "tools");
const KEY = "muse_hebrew_english_ground_truth_dictionary";
const QUOTE = 60; // provider text is quoted in windows of at most this many characters

const { senseSplit, RULE_ID: V3 } = await import(join(TOOLS, "sense-split-v1.mjs"));
const machine = await import(join(TOOLS, "declaration-v1.mjs"));

// gloss-store-v1.mjs packSplit, copied verbatim (it lives inside the store's
// factory and cannot be imported without opening a store): the page divides a
// route at depth-0 ';' first, then hands each sense to senseSplit.
const packSplit = (text) => {
  const t = String(text || "");
  const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (c === "(") d += 1;
    else if (c === ")") { if (d > 0) d -= 1; }
    else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; }
  }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
/** What today's page prints for one route: packSplit, then v3 on each sense; a damaged sense prints nothing. */
const v3Readings = (route) => {
  const out = []; let withheld = 0;
  for (const sense of packSplit(route)) {
    const r = senseSplit(sense);
    if (r.damaged) { withheld += 1; continue; }
    out.push(...r.readings);
  }
  return { readings: out, withheld };
};

// ---- inputs --------------------------------------------------------------
const ranked = JSON.parse(readFileSync(join(PUNCT, "sources-ranked.json"), "utf8"));
const src = ranked.sources.find((s) => s.source_key === KEY);
const inventory = JSON.parse(readFileSync(join(PUNCT, "mark-inventory-2026-10-31.json"), "utf8"));
const invRows = inventory.providers.filter((p) => src.m_ids.includes(p.provider));
const rows = readFileSync(join(PUNCT, "by-source", `${KEY}.jsonl`), "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));

const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch); // the inventory's own test
const w = (s) => String(s).slice(0, QUOTE);
const tally = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

// ---- 1. census -----------------------------------------------------------
const census = {
  rows: rows.length,
  rows_by_m: {}, rows_by_year: {}, cut_values: {},
  route_region: { whole: 0, slice: 0, absent: 0 },
  route_marks: {}, route_mark_routes: {}, def_marks: {}, def_mark_rows: {},
  route_mark_examples: {}, def_mark_examples: {},
};
const facts = {
  routes_with_whitespace: 0, defs_with_whitespace: 0,
  routes_with_digit: 0, routes_with_uppercase: 0,
  routes_with_non_ascii_letter: 0, routes_with_combining_mark: 0,
  routes_with_hebrew_letter: 0, routes_untrimmed: 0, routes_empty: 0,
  keys_with_a_mark: 0,
};
const nonAscii = {}; const nonAsciiEx = [];
const lenBuckets = {};
for (const r of rows) {
  tally(census.rows_by_m, r.m); tally(census.rows_by_year, r.year); tally(census.cut_values, JSON.stringify(r.cut));
  if (r.route === r.def) census.route_region.whole += 1;
  else if (r.def.includes(r.route)) census.route_region.slice += 1;
  else census.route_region.absent += 1;
  const seenR = new Set(), seenD = new Set();
  for (const ch of r.route) if (isMark(ch)) {
    tally(census.route_marks, ch); seenR.add(ch);
    (census.route_mark_examples[ch] ||= []).length < 6 && census.route_mark_examples[ch].push(`${r.key}: ${w(r.route)}`);
  }
  for (const ch of seenR) tally(census.route_mark_routes, ch);
  for (const ch of r.def) if (isMark(ch)) {
    tally(census.def_marks, ch); seenD.add(ch);
    (census.def_mark_examples[ch] ||= []).length < 6 && census.def_mark_examples[ch].push(`${r.key}: ${w(r.def)}`);
  }
  for (const ch of seenD) tally(census.def_mark_rows, ch);
  if ([...r.key].some(isMark)) facts.keys_with_a_mark += 1;
  if (/\s/u.test(r.route)) facts.routes_with_whitespace += 1;
  if (/\s/u.test(r.def)) facts.defs_with_whitespace += 1;
  if (/\p{N}/u.test(r.route)) facts.routes_with_digit += 1;
  if (/\p{Lu}/u.test(r.route)) facts.routes_with_uppercase += 1;
  if (/\p{M}/u.test(r.route)) facts.routes_with_combining_mark += 1;
  if (/\p{Script=Hebrew}/u.test(r.route)) facts.routes_with_hebrew_letter += 1;
  if (r.route !== r.route.trim()) facts.routes_untrimmed += 1;
  if (!r.route) facts.routes_empty += 1;
  if (/[^\x00-\x7f]/u.test(r.route)) {
    facts.routes_with_non_ascii_letter += 1;
    if (nonAsciiEx.length < 8) nonAsciiEx.push(`${r.key}: ${w(r.route)}`);
    for (const ch of r.route) if (/[^\x00-\x7f]/u.test(ch)) tally(nonAscii, ch);
  }
  const L = [...r.route].length; tally(lenBuckets, L <= 3 ? "1-3" : L <= 10 ? "4-10" : L <= 20 ? "11-20" : "21+");
}
facts.non_ascii_characters_all_letters = Object.keys(nonAscii).every((c) => /\p{L}/u.test(c));
facts.non_ascii_distinct = Object.keys(nonAscii).length;
facts.non_ascii_examples = nonAsciiEx;
facts.route_length_in_characters = lenBuckets;
facts.year_rows_not_no_source_year = rows.filter((r) => r.year !== "S_NO_SOURCE_YEAR").map((r) => `${r.key}: ${w(r.route)} (year ${r.year}, ${r.m})`);

// record structure: how the provider gives alternatives
const byKey = new Map();
for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, []); byKey.get(r.key).push(r); }
const perKey = {}; let multiKeys = 0, multiRoutes = 0, mixedM = 0, dupKR = 0;
for (const rs of byKey.values()) {
  tally(perKey, rs.length);
  if (rs.length > 1) { multiKeys += 1; multiRoutes += rs.length; }
  if (new Set(rs.map((r) => r.m)).size > 1) mixedM += 1;
  dupKR += rs.length - new Set(rs.map((r) => r.route)).size;
}
const multiExamples = [...byKey].filter(([, rs]) => rs.length >= 3).slice(0, 6)
  .map(([k, rs]) => `${k}: ${w(rs.map((r) => r.route).join(" | "))}`);
const records = {
  keys: byKey.size, routes_per_key: perKey,
  keys_with_more_than_one_route: multiKeys, routes_on_those_keys: multiRoutes,
  keys_mixing_m6_and_m62: mixedM, duplicate_key_route_pairs: dupKR,
  examples: multiExamples,
};

// inventory agreement
const invMarks = new Set(invRows.flatMap((p) => (p.marks || []).map((m) => m.mark ?? m.char ?? m)));
const invRoutes = invRows.reduce((t, p) => t + p.routes, 0);
const invRegion = invRows.reduce((t, p) => { for (const k of Object.keys(p.route_region_in_definition)) t[k] = (t[k] || 0) + p.route_region_in_definition[k]; return t; }, {});
const routeMarkSet = Object.keys(census.route_marks), defMarkSet = Object.keys(census.def_marks);
const inventoryCheck = {
  inventory_rows: invRows.map((p) => ({ provider: p.provider, routes: p.routes, mark_count: p.mark_count, route_region_in_definition: p.route_region_in_definition })),
  inventory_routes: invRoutes, jsonl_routes: rows.length, routes_agree: invRoutes === rows.length,
  inventory_mark_set: [...invMarks], jsonl_route_mark_set: routeMarkSet, jsonl_definition_mark_set: defMarkSet,
  mark_sets_agree: invMarks.size === routeMarkSet.length && routeMarkSet.every((m) => invMarks.has(m)),
  regions_agree: JSON.stringify(invRegion) === JSON.stringify(census.route_region),
};

// ---- 2. shapes -------------------------------------------------------------
// Every occurrence of every mark must fall in exactly one shape. The closed set
// is empty, so there are no shapes to assign and no residue. The loop is kept so
// the same script reports a residue the day a mark arrives.
const SHAPES = []; // { mark, shape, test(text, i) }
const marks = [];
for (const ch of new Set([...routeMarkSet, ...defMarkSet])) {
  const shapeCounts = {}; let unexplained = 0, double = 0;
  for (const r of rows) [...r.route].forEach((c, i, a) => {
    if (c !== ch) return;
    const hit = SHAPES.filter((s) => s.mark === ch && s.test(a.join(""), i));
    if (hit.length === 0) unexplained += 1; else if (hit.length > 1) double += 1; else tally(shapeCounts, hit[0].shape);
  });
  marks.push({ mark: ch, occurrences: census.route_marks[ch] || 0, shapes: shapeCounts, unexplained, double });
}
const unexplainedTotal = marks.reduce((t, m) => t + m.unexplained + m.double, 0);

const spellRoutes = (byKey.get("מורשה") || []).map((r) => r.route);
const spellingPair = spellRoutes.includes("authorised") && spellRoutes.includes("authorized")
  ? "מורשה carries both authorised and authorized, as separate records" : "no spelling pair found on מורשה";
// ---- 4. the declaration -----------------------------------------------------
const n = (x) => x.toLocaleString("en-US");
const declared = {
  label: src.label,
  m_ids: src.m_ids,
  routes: rows.length,
  declared_on: "2026-10-31",
  declared_from: `The entry's own structure, read across all ${n(rows.length)} routes on ${n(byKey.size)} keys (${n(census.rows_by_m.M6 || 0)} under M6, ${n(census.rows_by_m.M62 || 0)} under M62). In ${n(census.route_region.whole)} of ${n(rows.length)} rows the route is the whole definition, character for character. The provider writes no mark at all: ${routeMarkSet.length} distinct marks in route text and ${defMarkSet.length} in definition text (the inventory's test, any character not a letter, digit or whitespace), and ${facts.routes_with_whitespace} routes carry a space, so every route is one word. Where it offers several English words for one Hebrew key it writes them as separate records, never in one field: ${n(multiKeys)} keys carry 2 to ${Math.max(...Object.keys(perKey).map(Number))} routes, ${n(multiRoutes)} routes between them. Its closed set is empty; 0 occurrences; 0 unexplained; no mark divides.`,
  regions: {
    route_regions: census.route_region,
    meaning_depends_on_region: {},
    note: "Every route is its whole definition, a single word with no head, no rendering list and no notes, so the provider has one region.",
  },
  marks: {},
  conventions_without_marks: {
    alternatives: {
      means: "a second English word for the same Hebrew key is a second record, not a second piece of one field",
      governs: multiRoutes,
      evidence: `${n(multiKeys)} keys carry more than one route; ${records.duplicate_key_route_pairs} key+route pairs repeat; ${records.keys_mixing_m6_and_m62} keys mix M6 and M62. ${multiExamples.slice(0, 3).join(" | ")}`,
      falsifier: "A route carrying a comma, semicolon, slash or space (two words in one field). 0 today.",
    },
    case: {
      means: "the provider writes lowercase throughout, proper names included; this is its spelling and it is printed as written",
      governs: rows.length,
      evidence: `${facts.routes_with_uppercase} of ${n(rows.length)} routes carry an uppercase letter. ${["איליין", "אלצהיימר", "קורדובה"].flatMap((k) => (byKey.get(k) || []).map((r) => `${k}: ${w(r.route)}`)).join(" | ")}`,
      falsifier: "A route with an uppercase letter. 0 today.",
    },
    letters_beyond_ascii: {
      means: "precomposed Latin letters of the borrowed name or word (é, ü, ł, ț and the like): letters, not marks, inside one word",
      governs: facts.routes_with_non_ascii_letter,
      evidence: `${facts.routes_with_non_ascii_letter} routes, ${facts.non_ascii_distinct} distinct characters, every one a letter; ${facts.routes_with_combining_mark} combining diacritics (a combining diacritic is not a letter and would count as a mark).`,
      falsifier: "A combining diacritic (Unicode category M) in a route. 0 today.",
    },
  },
  precedence: [],
  refusals: {
    closure: "The mark set is closed and empty. A route that arrives carrying any mark is reported by the machine (unknownMarks) and ships whole; it is not divided under a rule that does not cover it.",
  },
  export: `governed by its posture, ${src.licensePosture}`,
  separates_on: null,
  separates_on_why: "No mark divides, so there is nothing to separate on. Every route ships whole, exactly as it does with no declaration; what the declaration adds is the closed set and its falsifiers.",
  falsifiers: {
    routes_carrying_any_mark: rows.filter((r) => [...r.route].some(isMark)).length,
    definitions_carrying_any_mark: rows.filter((r) => [...r.def].some(isMark)).length,
    whitespace_in_route: facts.routes_with_whitespace,
    route_not_whole_definition: census.route_region.slice + census.route_region.absent,
    combining_mark_in_route: facts.routes_with_combining_mark,
    uppercase_in_route: facts.routes_with_uppercase,
  },
  not_done_here: `No two routes on one key are joined into one field, and no route is divided: the provider already gives each English word as its own record. No case is restored on a proper name and no spelling is respelled (${spellingPair}): the provider's text is printed byte for byte.`,
};

// ---- 5. comparison with today's engine ----------------------------------------
machine.DECLARATIONS.providers[KEY] = declared; // in memory only, never written back
const cmp = {
  engine: `gloss-store packSplit at depth-0 ';', then ${V3} on each sense; a damaged sense prints nothing`,
  declaration_machine: machine.RULE_ID,
  fields_compared: 0, same_division: 0,
  v3_divides_where_declaration_keeps_whole: 0,
  declaration_divides_where_v3_keeps_whole: 0,
  divided_differently: 0, v3_withholds: 0,
  v3_prints_differently_while_both_whole: 0,
  machine_unknown_marks_rows: 0, machine_refused_rows: 0,
  examples: { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [], v3_withholds: [] },
};
const changes = [];
const push = (k, s) => { if (cmp.examples[k].length < 6) cmp.examples[k].push(s); };
for (const r of rows) {
  cmp.fields_compared += 1;
  const v = v3Readings(r.route);
  const d = machine.readingOf(r.route, r.def, KEY);
  if (d.unknownMarks.length) cmp.machine_unknown_marks_rows += 1;
  if (d.refused) cmp.machine_refused_rows += 1;
  if (v.withheld) { cmp.v3_withholds += 1; push("v3_withholds", `${r.key}: ${w(r.route)}`); }
  const vd = v.readings.length > 1, dd = d.readings.length > 1;
  const same = JSON.stringify(v.readings) === JSON.stringify(d.readings);
  let kind = null;
  if (same) cmp.same_division += 1;
  else if (vd && !dd) kind = "v3_divides_where_declaration_keeps_whole";
  else if (!vd && dd) kind = "declaration_divides_where_v3_keeps_whole";
  else if (vd && dd) kind = "divided_differently";
  else cmp.v3_prints_differently_while_both_whole += 1;
  if (kind) { cmp[kind] += 1; push(kind, `${r.key}: ${w(r.route)}`); }
  if (!same) changes.push(JSON.stringify({ key: r.key, m: r.m, kind: kind || "both_whole_text_differs", v3: v.readings.map(w), declaration: d.readings.map(w) }));
}

// ---- 6. open questions --------------------------------------------------------
const open = [
  {
    question: "Merge a declaration whose mark set is empty, or leave the provider undeclared?",
    reading_a: { what: "merge it: the provider is declared with an empty closed set, so a mark arriving in a later store is reported (unknownMarks) and its row ships whole", routes: rows.length, cards_changed_today: cmp.fields_compared - cmp.same_division },
    reading_b: { what: "leave it undeclared: the default already ships every route whole, and a mark arriving later ships whole silently", routes: rows.length, cards_changed_today: 0 },
    data_cannot_settle: "Both print the same thing on every card today; the difference is only whether a future mark is reported.",
  },
  {
    question: "Not a mark question, found in passing: the year field. Is '2026' on these rows the provider's date or this project's ingest stamp?",
    reading_a: { what: "the provider's own year, kept as a dated witness", routes: facts.year_rows_not_no_source_year.length },
    reading_b: { what: "a stamp this project wrote, and the rows read S_NO_SOURCE_YEAR like the other " + n(census.rows_by_year.S_NO_SOURCE_YEAR || 0), routes: facts.year_rows_not_no_source_year.length },
    rows: facts.year_rows_not_no_source_year,
  },
];

const censusOut = {
  schema: "MARK_LEDGER_PILOT_V1", source_key: KEY, m_ids: src.m_ids, routes: rows.length,
  emitted_on: "2026-10-31", script: join(OUT, "ledger.mjs"),
  read_from: { provider: join(PUNCT, "by-source", `${KEY}.jsonl`), inventory: join(PUNCT, "mark-inventory-2026-10-31.json"), ranked: join(PUNCT, "sources-ranked.json"), engine: join(TOOLS, "sense-split-v1.mjs"), machine: join(TOOLS, "declaration-v1.mjs") },
  ranked: src,
  rows_by_m: census.rows_by_m, rows_by_year: census.rows_by_year, cut_values: census.cut_values,
  route_region: census.route_region,
  closed_set: { route_text: census.route_marks, route_text_routes: census.route_mark_routes, definition_text: census.def_marks, definition_text_rows: census.def_mark_rows, route_examples: census.route_mark_examples, definition_examples: census.def_mark_examples },
  inventory_check: inventoryCheck,
  character_facts: facts,
  records,
  marks, shapes_declared: SHAPES.length, unexplained_total: unexplainedTotal,
  precedence: [],
  v3_comparison: cmp,
  open_questions: open,
};
writeFileSync(join(OUT, "census.json"), JSON.stringify(censusOut, null, 1) + "\n");
writeFileSync(join(OUT, "declaration.json"), JSON.stringify({
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  providers: { [KEY]: declared },
}, null, 1) + "\n");
writeFileSync(join(OUT, "changes-vs-v3.jsonl"), changes.join("\n") + (changes.length ? "\n" : ""));
console.log(JSON.stringify({ rows: rows.length, keys: byKey.size, route_marks: census.route_marks, def_marks: census.def_marks, region: census.route_region, inventoryCheck: { routes_agree: inventoryCheck.routes_agree, mark_sets_agree: inventoryCheck.mark_sets_agree, regions_agree: inventoryCheck.regions_agree }, facts: { ...facts, non_ascii_examples: undefined }, records: { ...records, examples: undefined }, unexplainedTotal, cmp: { ...cmp, examples: undefined }, changes: changes.length }, null, 1));
