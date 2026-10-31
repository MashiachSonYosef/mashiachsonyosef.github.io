#!/usr/bin/env node
// Independent verifier for the drafted declaration of
// muse_hebrew_english_ground_truth_dictionary (M6, M62). Written from the
// task's stated tests, not from the draft's ledger.mjs. Single process, one
// provider file. Read-only except for verify-result.json beside this script.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const SRC = join(ROOT, "punct/by-source/muse_hebrew_english_ground_truth_dictionary.jsonl");
const DECL = join(ROOT, "punct/pilot/muse_hebrew_english_ground_truth_dictionary/declaration.json");
const CENSUS = join(ROOT, "punct/pilot/muse_hebrew_english_ground_truth_dictionary/census.json");
const INV = join(ROOT, "punct/mark-inventory-2026-10-31.json");
const RANKED = join(ROOT, "punct/sources-ranked.json");
const { senseSplit, RULE_ID: V3 } = await import(join(ROOT, "ghp/reader/tools/sense-split-v1.mjs"));

const SK = "muse_hebrew_english_ground_truth_dictionary";
const decl = JSON.parse(readFileSync(DECL, "utf8")).providers[SK];
const census = JSON.parse(readFileSync(CENSUS, "utf8"));

// ---- the stated mark test: any character not a letter, digit or whitespace
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const cat = (c) => {
  for (const g of ["Lu","Ll","Lt","Lm","Lo","Mn","Mc","Me","Nd","Nl","No","Pc","Pd","Ps","Pe","Pi","Pf","Po","Sm","Sc","Sk","So","Zs","Zl","Zp","Cc","Cf","Co","Cn"])
    if (new RegExp(`^\\p{${g}}$`, "u").test(c)) return g;
  return "?";
};
const hex = (c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
const win = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s);
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };

// packSplit as stated: depth-0 ';' (parentheses depth), trimmed, empties dropped
const packSplit = (t) => {
  const out = []; let start = 0, d = 0; const x = String(t || "");
  for (let i = 0; i < x.length; i += 1) {
    const c = x[i];
    if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; }
    else if (c === ";" && d === 0) { out.push(x.slice(start, i)); start = i + 1; }
  }
  out.push(x.slice(start));
  return out.map((y) => y.trim()).filter(Boolean);
};

const rows = readFileSync(SRC, "utf8").split("\n").filter((l) => l.length);
const R = {
  rows: 0, parse_errors: 0, rows_by_m: {}, rows_by_year: {}, cut_values: {},
  region: { whole: 0, slice: 0, absent: 0 },
  marks_route: {}, marks_route_routes: {}, marks_def: {}, marks_def_rows: {}, marks_key: {},
  mark_occurrences_route: 0, mark_occurrences_def: 0, mark_occurrences_key: 0,
  routes_with_any_mark: 0, defs_with_any_mark: 0, keys_with_any_mark: 0,
  // adversarial: things the inventory's test would NOT call a mark
  route_whitespace_rows: 0, def_whitespace_rows: 0, nonascii_whitespace_rows: 0,
  route_cf_rows: 0, route_combining_rows: 0, route_modifier_letter_rows: 0,
  route_non_latin_letter_rows: 0, route_digit_rows: 0, route_upper_rows: 0, route_titlecase_rows: 0,
  route_hebrew_rows: 0, route_not_nfc_rows: 0, route_untrimmed: 0, route_empty: 0,
  route_nonascii_rows: 0, nonascii_chars: {}, nonascii_cats: {}, nonascii_nonlatin: {},
  len_utf16: {}, len_cp: {},
  v3: { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0,
        declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_withholds: 0,
        v3_prints_differently_while_both_whole: 0, unknown_marks_rows: 0, examples: [] },
};
const keyRoutes = new Map();   // key -> [{route,m}]
const pairSeen = new Map();
let dupPairs = 0;
const yearRows = [];
const bucket = (n) => (n <= 3 ? "1-3" : n <= 10 ? "4-10" : n <= 20 ? "11-20" : n <= 40 ? "21-40" : "41+");

for (const line of rows) {
  let o; try { o = JSON.parse(line); } catch { R.parse_errors += 1; continue; }
  R.rows += 1;
  const { key, route, def, m, year, cut } = o;
  inc(R.rows_by_m, m); inc(R.rows_by_year, String(year)); inc(R.cut_values, String(cut));
  if (String(year) !== "S_NO_SOURCE_YEAR") yearRows.push(`${key}: ${route} (year ${year}, ${m})`);
  const rs = String(route), ds = String(def);
  // region
  if (rs === ds) R.region.whole += 1; else if (ds.includes(rs)) R.region.slice += 1; else R.region.absent += 1;
  // marks: route
  let anyR = false; const seenR = new Set();
  for (const c of rs) if (isMark(c)) { anyR = true; R.mark_occurrences_route += 1; inc(R.marks_route, c); if (!seenR.has(c)) { seenR.add(c); inc(R.marks_route_routes, c); } }
  if (anyR) R.routes_with_any_mark += 1;
  let anyD = false; const seenD = new Set();
  for (const c of ds) if (isMark(c)) { anyD = true; R.mark_occurrences_def += 1; inc(R.marks_def, c); if (!seenD.has(c)) { seenD.add(c); inc(R.marks_def_rows, c); } }
  if (anyD) R.defs_with_any_mark += 1;
  let anyK = false;
  for (const c of String(key)) if (isMark(c)) { anyK = true; R.mark_occurrences_key += 1; inc(R.marks_key, c); }
  if (anyK) R.keys_with_any_mark += 1;
  // adversarial character facts
  if (/\s/u.test(rs)) R.route_whitespace_rows += 1;
  if (/\s/u.test(ds)) R.def_whitespace_rows += 1;
  if (/[^\S \t\n\r]/u.test(rs + ds)) R.nonascii_whitespace_rows += 1;   // NBSP, FEFF, U+2028 ...
  if (/\p{Cf}/u.test(rs)) R.route_cf_rows += 1;
  if (/\p{M}/u.test(rs)) R.route_combining_rows += 1;
  if (/\p{Lm}/u.test(rs)) R.route_modifier_letter_rows += 1;
  if (/[\p{L}--\p{Script=Latin}]/v.test(rs)) R.route_non_latin_letter_rows += 1;
  if (/\p{N}/u.test(rs)) R.route_digit_rows += 1;
  if (/\p{Lu}/u.test(rs)) R.route_upper_rows += 1;
  if (/\p{Lt}/u.test(rs)) R.route_titlecase_rows += 1;
  if (/\p{Script=Hebrew}/u.test(rs)) R.route_hebrew_rows += 1;
  if (rs.normalize("NFC") !== rs) R.route_not_nfc_rows += 1;
  if (rs !== rs.trim()) R.route_untrimmed += 1;
  if (!rs.length) R.route_empty += 1;
  let nonascii = false;
  for (const c of rs) if (c.codePointAt(0) > 0x7f) {
    nonascii = true; inc(R.nonascii_chars, c); inc(R.nonascii_cats, cat(c));
    if (!/\p{Script=Latin}/u.test(c)) inc(R.nonascii_nonlatin, `${c} ${hex(c)} ${cat(c)}`);
  }
  if (nonascii) R.route_nonascii_rows += 1;
  inc(R.len_utf16, bucket(rs.length)); inc(R.len_cp, bucket([...rs].length));
  // records
  if (!keyRoutes.has(key)) keyRoutes.set(key, []);
  keyRoutes.get(key).push({ route: rs, m });
  const pk = key + "\u0000" + rs;
  if (pairSeen.has(pk)) dupPairs += 1; else pairSeen.set(pk, 1);

  // ---- v3 vs declaration
  const V = R.v3; V.fields_compared += 1;
  const senses = packSplit(rs);
  let v3Read = [], withheld = false;
  for (const s of senses) { const x = senseSplit(s); if (x.damaged) { withheld = true; continue; } v3Read.push(...x.readings); }
  // declaration: separates_on null -> one reading, the route as emitted; unknown marks reported
  const declared = new Set(Object.keys(decl.marks || {}));
  const unknown = [...new Set([...rs].filter((c) => isMark(c) && !declared.has(c)))];
  if (unknown.length) V.unknown_marks_rows += 1;
  const declRead = decl.separates_on ? null : [rs];
  if (withheld) V.v3_withholds += 1;
  const v3Div = v3Read.length > 1, dDiv = declRead.length > 1;
  if (!v3Div && !dDiv) {
    V.same_division += 1;
    if (!withheld && (v3Read.length !== 1 || v3Read[0] !== rs)) { V.v3_prints_differently_while_both_whole += 1; if (V.examples.length < 5) V.examples.push(`${key}: ${win(rs)}`); }
  } else if (v3Div && !dDiv) { V.v3_divides_where_declaration_keeps_whole += 1; if (V.examples.length < 5) V.examples.push(`${key}: ${win(rs)}`); }
  else if (!v3Div && dDiv) V.declaration_divides_where_v3_keeps_whole += 1;
  else if (JSON.stringify(v3Read) === JSON.stringify(declRead)) V.same_division += 1;
  else V.divided_differently += 1;
}

// ---- records
const perKey = {}; let multiKeys = 0, multiRoutes = 0, mixing = 0;
for (const [k, list] of keyRoutes) {
  inc(perKey, String(list.length));
  if (list.length > 1) { multiKeys += 1; multiRoutes += list.length; }
  if (new Set(list.map((x) => x.m)).size > 1) mixing += 1;
}
const routesOf = (k) => (keyRoutes.get(k) || []).map((x) => x.route).join(" | ");
const evidenceChecks = {};
for (const k of ["בובות", "בחרי", "מלכודות", "זונות", "נופש", "הולם", "איליין", "אלצהיימר", "קורדובה", "מורשה", "מחל", "טבילה"]) evidenceChecks[k] = routesOf(k);

// ---- adversarial alternatives check (the convention "a second word is a second record"):
// routes on one key that are the same word up to a plural/inflection ending, and
// routes that are a transliteration of the key's sound rather than a rendering
// are reported for the record, not counted as failures of a mark (there is none).
const inflectionPairs = [];
for (const [k, list] of keyRoutes) {
  const rs = list.map((x) => x.route);
  for (const a of rs) for (const b of rs) if (a !== b && (b === a + "s" || b === a + "es" || b === a + "d" || b === a + "ed")) inflectionPairs.push(`${k}: ${a} | ${b}`);
}
// spelling-variant pairs (-ise/-ize, -our/-or) under one key: printed byte for byte, not respelled
const spellPairs = [];
for (const [k, list] of keyRoutes) {
  const rs = list.map((x) => x.route);
  for (const a of rs) for (const b of rs) if (a < b && a.replace(/is/g, "iz") === b.replace(/is/g, "iz") && a.length === b.length) spellPairs.push(`${k}: ${a} | ${b}`);
}

// ---- inventory and ranked cross-check
const inv = JSON.parse(readFileSync(INV, "utf8"));
const invRows = inv.providers.filter((p) => p.provider === "M6" || p.provider === "M62")
  .map((p) => ({ provider: p.provider, routes: p.routes, mark_count: p.mark_count, marks: p.marks, region: p.route_region_in_definition }));
const ranked = JSON.parse(readFileSync(RANKED, "utf8")).sources.find((s) => s.source_key === SK);

// ---- compare against the draft's stated numbers
const want = {
  routes: [decl.routes, R.rows],
  keys: [20057, keyRoutes.size],
  M6: [census.rows_by_m.M6, R.rows_by_m.M6],
  M62: [census.rows_by_m.M62, R.rows_by_m.M62],
  region_whole: [decl.regions.route_regions.whole, R.region.whole],
  region_slice: [decl.regions.route_regions.slice, R.region.slice],
  region_absent: [decl.regions.route_regions.absent, R.region.absent],
  distinct_marks_route: [0, Object.keys(R.marks_route).length],
  distinct_marks_def: [0, Object.keys(R.marks_def).length],
  mark_occurrences_route: [0, R.mark_occurrences_route],
  mark_occurrences_def: [0, R.mark_occurrences_def],
  routes_carrying_any_mark: [decl.falsifiers.routes_carrying_any_mark, R.routes_with_any_mark],
  definitions_carrying_any_mark: [decl.falsifiers.definitions_carrying_any_mark, R.defs_with_any_mark],
  whitespace_in_route: [decl.falsifiers.whitespace_in_route, R.route_whitespace_rows],
  route_not_whole_definition: [decl.falsifiers.route_not_whole_definition, R.region.slice + R.region.absent],
  combining_mark_in_route: [decl.falsifiers.combining_mark_in_route, R.route_combining_rows],
  uppercase_in_route: [decl.falsifiers.uppercase_in_route, R.route_upper_rows],
  keys_with_more_than_one_route: [census.records.keys_with_more_than_one_route, multiKeys],
  routes_on_those_keys: [census.records.routes_on_those_keys, multiRoutes],
  alternatives_governs: [decl.conventions_without_marks.alternatives.governs, multiRoutes],
  case_governs: [decl.conventions_without_marks.case.governs, R.rows - R.route_upper_rows],
  letters_beyond_ascii_governs: [decl.conventions_without_marks.letters_beyond_ascii.governs, R.route_nonascii_rows],
  non_ascii_distinct: [census.character_facts.non_ascii_distinct, Object.keys(R.nonascii_chars).length],
  keys_mixing_m6_and_m62: [census.records.keys_mixing_m6_and_m62, mixing],
  duplicate_key_route_pairs: [census.records.duplicate_key_route_pairs, dupPairs],
  keys_with_a_mark: [census.character_facts.keys_with_a_mark, R.keys_with_any_mark],
  routes_with_digit: [census.character_facts.routes_with_digit, R.route_digit_rows],
  routes_with_hebrew_letter: [census.character_facts.routes_with_hebrew_letter, R.route_hebrew_rows],
  routes_untrimmed: [census.character_facts.routes_untrimmed, R.route_untrimmed],
  routes_empty: [census.character_facts.routes_empty, R.route_empty],
  defs_with_whitespace: [census.character_facts.defs_with_whitespace, R.def_whitespace_rows],
  year_rows_not_no_source_year: [census.character_facts.year_rows_not_no_source_year.length, yearRows.length],
  v3_fields_compared: [census.v3_comparison.fields_compared, R.v3.fields_compared],
  v3_same_division: [census.v3_comparison.same_division, R.v3.same_division],
  v3_divides_where_declaration_keeps_whole: [census.v3_comparison.v3_divides_where_declaration_keeps_whole, R.v3.v3_divides_where_declaration_keeps_whole],
  declaration_divides_where_v3_keeps_whole: [census.v3_comparison.declaration_divides_where_v3_keeps_whole, R.v3.declaration_divides_where_v3_keeps_whole],
  divided_differently: [census.v3_comparison.divided_differently, R.v3.divided_differently],
  v3_withholds: [census.v3_comparison.v3_withholds, R.v3.v3_withholds],
  v3_prints_differently_while_both_whole: [census.v3_comparison.v3_prints_differently_while_both_whole, R.v3.v3_prints_differently_while_both_whole],
  machine_unknown_marks_rows: [census.v3_comparison.machine_unknown_marks_rows, R.v3.unknown_marks_rows],
};
const perKeyWant = census.records.routes_per_key;
for (const k of new Set([...Object.keys(perKeyWant), ...Object.keys(perKey)])) want[`routes_per_key_${k}`] = [perKeyWant[k], perKey[k]];
for (const k of new Set([...Object.keys(census.character_facts.route_length_in_characters), ...Object.keys(R.len_cp)])) want[`len_cp_${k}`] = [census.character_facts.route_length_in_characters[k], R.len_cp[k]];
const mismatches = Object.entries(want).filter(([, [a, b]]) => a !== b).map(([k, [a, b]]) => ({ k, draft: a, mine: b }));

const out = {
  script: fileURLToPath(import.meta.url), v3_rule: V3, rows_read: R.rows, parse_errors: R.parse_errors,
  checks: Object.fromEntries(Object.entries(want).map(([k, [a, b]]) => [k, { draft: a, mine: b, ok: a === b }])),
  mismatches,
  completeness: {
    mark_set_route: R.marks_route, mark_set_def: R.marks_def, mark_set_key: R.marks_key,
    occurrences_total: R.mark_occurrences_route + R.mark_occurrences_def,
    shapes_declared: Object.keys(decl.marks).length,
    occurrences_in_exactly_one_shape: 0,
    occurrences_in_no_shape: R.mark_occurrences_route,
  },
  adversarial: {
    nonascii_whitespace_rows: R.nonascii_whitespace_rows, route_cf_rows: R.route_cf_rows,
    route_modifier_letter_rows: R.route_modifier_letter_rows, route_non_latin_letter_rows: R.route_non_latin_letter_rows,
    route_titlecase_rows: R.route_titlecase_rows, route_not_nfc_rows: R.route_not_nfc_rows,
    nonascii_categories: R.nonascii_cats, nonascii_non_latin: R.nonascii_nonlatin,
    nonascii_chars: Object.keys(R.nonascii_chars).sort().join(""),
    len_utf16: R.len_utf16, len_cp: R.len_cp,
    inflection_pairs_on_one_key: inflectionPairs.length, inflection_examples: inflectionPairs.slice(0, 6),
    ise_ize_pairs_on_one_key: spellPairs.length, ise_ize_examples: spellPairs.slice(0, 6),
  },
  evidence_routes_by_key: evidenceChecks, year_rows: yearRows,
  inventory_rows: invRows, ranked,
  v3_examples: R.v3.examples,
};
writeFileSync(join(HERE, "verify-result.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ mismatches, completeness: out.completeness, adversarial: out.adversarial, evidence: evidenceChecks, year_rows: yearRows, inventory_rows: invRows, ranked, v3_examples: out.v3_examples }, null, 1));
