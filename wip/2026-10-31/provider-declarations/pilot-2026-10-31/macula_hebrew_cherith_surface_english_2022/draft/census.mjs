#!/usr/bin/env node
// Mark ledger pilot, 2026-10-31 · macula_hebrew_cherith_surface_english_2022 (M3)
//
// Reads every route of the provider once (one provider file, one process),
// takes the closed mark set from the inventory, confirms it over route text
// and, separately, definition text, puts every mark occurrence into exactly
// one shape, writes census.json and declaration.json, and then compares the
// declaration's division with today's engine (gloss-store packSplit at
// depth-0 ';', then sense-split-rule-v3 on each sense) on every route.
//
// The declaration is applied by the project's one machine,
// reader/tools/declaration-v1.mjs, with this provider's declaration placed in
// its in-memory DECLARATIONS object. No file under ghp/ is written.
//
// usage: node census.mjs   (paths are fixed below; read-only except OUT)

import { readFileSync, writeFileSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { join } from "node:path";

const SCR = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const SOURCE_KEY = "macula_hebrew_cherith_surface_english_2022";
const M_IDS = ["M3"];
const IN = join(SCR, "punct/by-source", `${SOURCE_KEY}.jsonl`);
const INVENTORY = join(SCR, "punct/mark-inventory-2026-10-31.json");
const RANKED = join(SCR, "punct/sources-ranked.json");
const OUT = join(SCR, "punct/pilot", SOURCE_KEY);
const TOOLS = join(SCR, "ghp/reader/tools");

const { senseSplit, RULE_ID: V3_RULE } = await import(join(TOOLS, "sense-split-v1.mjs"));
const machine = await import(join(TOOLS, "declaration-v1.mjs"));

const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
const short = (s) => (s.length > 60 ? `${s.slice(0, 57)}...` : s);

// ---------------------------------------------------------------- shapes
// Each shape: id, mark, test (plain words), and the predicate over (text, i).
// Order matters only where noted; every occurrence lands in the first shape
// whose predicate holds, and a falsifier pass below checks that no occurrence
// matches two shapes of the same mark.

// parenthesis content, for the paren family and for '=' and '+'
const parenSpans = (t) => {
  const spans = []; const open = [];
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] === "(") open.push(i);
    else if (t[i] === ")" && open.length) { const a = open.pop(); spans.push([a, i]); }
  }
  return spans;
};
const spanAt = (t, i) => parenSpans(t).find(([a, z]) => i >= a && i <= z) || null;
const NUM = /^\d+[a-z]?$/;
const EQUATION = /^\d+[a-z]?=\d+[a-z]?(\+\d+[a-z]?)+$/;
const ENGLISH = /^[\p{L} ]+$/u;
const parenKind = (t, i) => {
  const s = spanAt(t, i); if (!s) return null;
  const inner = t.slice(s[0] + 1, s[1]);
  const whole = s[0] === 0 && s[1] === t.length - 1;
  if (NUM.test(inner)) return "strongs_number";
  if (EQUATION.test(inner)) return "number_equation";
  if (ENGLISH.test(inner)) return whole ? "supplied_whole_route" : "supplied_inside_route";
  return null;
};

const SHAPES = [
  // ~
  { id: "tilde.gap_between_words", mark: "~", divides: false,
    test: "'~' with one space on each side and a word on each side",
    means: "A gap inside one English phrase: the place where English that belongs to another Hebrew word or morph of the verse stands ('bring ~ back' reads 'bring [him] back'; 'corner of ~ garment' reads 'corner of [his] garment'). It is notation inside one reading.",
    pred: (t, i) => t[i - 1] === " " && t[i + 1] === " " && isLetter(t[i - 2]) && isLetter(t[i + 2]) },
  { id: "tilde.gap_at_head", mark: "~", divides: false,
    test: "'~' at the first character of the route, glued to the word after it",
    means: "The same gap, standing before this word's English: English carried by another word comes first ('~south', '~rise of').",
    pred: (t, i) => i === 0 && isLetter(t[1]) },
  { id: "tilde.gap_at_tail", mark: "~", divides: false,
    test: "'~' at the last character of the route, glued to the word before it",
    means: "The same gap, standing after this word's English ('apart~').",
    pred: (t, i) => i === t.length - 1 && isLetter(t[i - 1]) },
  // ’
  { id: "apostrophe.contraction_nt", mark: "’", divides: false,
    test: "'’' between 'n' and 't' (n’t)",
    means: "The apostrophe of a contracted negative ('don’t'); a letter-level mark inside one word.",
    pred: (t, i) => t[i - 1] === "n" && t[i + 1] === "t" && !isLetter(t[i + 2]) },
  { id: "apostrophe.possessive_s", mark: "’", divides: false,
    test: "'’' after a letter and before a final 's' or 'S' that ends the word",
    means: "The possessive ’s on one word ('donkey’s', 'Merari’s', 'LORD’S'); part of the word.",
    pred: (t, i) => isLetter(t[i - 1]) && (t[i + 1] === "s" || t[i + 1] === "S") && !isLetter(t[i + 2]) },
  { id: "apostrophe.plural_possessive", mark: "’", divides: false,
    test: "'’' after a word-final 's' with no letter after it",
    means: "The plural possessive s’ ('eagles’', 'sons’'); part of the word.",
    pred: (t, i) => t[i - 1] === "s" && !isLetter(t[i + 1]) },
  // -
  { id: "hyphen.compound_join", mark: "-", divides: false,
    test: "'-' with a letter immediately on each side",
    means: "Joins two parts into one word or one name ('father-in-law', 'one-fifth', 'beth-arabah', 'Esh-baal'); notation inside one reading.",
    pred: (t, i) => isLetter(t[i - 1]) && isLetter(t[i + 1]) },
  { id: "hyphen.bound_suffix", mark: "-", divides: false,
    test: "'-' at the first character of the route, glued to the word after it",
    means: "The English is a bound suffix that attaches to the English of a neighboring word ('-self'); one reading, written as a suffix.",
    pred: (t, i) => i === 0 && isLetter(t[1]) },
  // ! ?
  { id: "exclamation.final_on_word", mark: "!", divides: false,
    test: "'!' as the last character of the route, directly after a letter",
    means: "The gloss's own mood: an imperative or exclamation ('count!', 'far be it!'); part of the one reading.",
    pred: (t, i) => i === t.length - 1 && isLetter(t[i - 1]) },
  { id: "exclamation.final_after_space", mark: "!", divides: false,
    test: "'!' as the last character of the route, after a space",
    means: "The same mood mark, set off by a space ('love !'); part of the one reading.",
    pred: (t, i) => i === t.length - 1 && t[i - 1] === " " },
  { id: "question.final_on_word", mark: "?", divides: false,
    test: "'?' as the last character of the route, directly after a letter",
    means: "The gloss is interrogative ('how?', 'how many?'); part of the one reading.",
    pred: (t, i) => i === t.length - 1 && isLetter(t[i - 1]) },
  { id: "question.final_after_space", mark: "?", divides: false,
    test: "'?' as the last character of the route, after a space",
    means: "The same interrogative mark, set off by a space ('for why ?'); part of the one reading.",
    pred: (t, i) => i === t.length - 1 && t[i - 1] === " " },
  // ( )
  ...["(", ")"].flatMap((m) => [
    { id: `${m === "(" ? "open" : "close"}.strongs_number`, mark: m, divides: false,
      test: `'${m}' of a parenthesis holding only a number (digits, then at most one letter)`,
      means: "A lexicon number tying this name-part to the compound name it belongs to: the two halves of one name carry the same number ('Ben (1128)' with 'Deker (1128)'; 'Ben (1127)' with 'Geber (1127)'). An annotation, not a reading.",
      pred: (t, i) => parenKind(t, i) === "strongs_number" },
    { id: `${m === "(" ? "open" : "close"}.number_equation`, mark: m, divides: false,
      test: `'${m}' of a parenthesis holding only number=number+number (each number digits, then at most one letter)`,
      means: "A cross-reference in the provider's lexicon numbering, standing where an English gloss would: the entry on the left is composed of the entries on the right. No English at all.",
      pred: (t, i) => parenKind(t, i) === "number_equation" },
    { id: `${m === "(" ? "open" : "close"}.supplied_whole_route`, mark: m, divides: false,
      test: `'${m}' of a parenthesis of English words that encloses the whole route`,
      means: "The whole English is marked as supplied: an implied word rather than a rendering of letters this form carries ('(namely)' on a conjunction). One reading.",
      pred: (t, i) => parenKind(t, i) === "supplied_whole_route" },
    { id: `${m === "(" ? "open" : "close"}.supplied_inside_route`, mark: m, divides: false,
      test: `'${m}' of a parenthesis of English words standing beside other words of the route`,
      means: "One word of the gloss is marked as supplied for sense ('face of (him)', '(just) above'); notation inside one reading.",
      pred: (t, i) => parenKind(t, i) === "supplied_inside_route" },
  ]),
  // = +
  { id: "equals.in_number_equation", mark: "=", divides: false,
    test: "'=' inside a parenthesis whose content is number=number+number",
    means: "Is composed of: the left entry number equals the sum on the right.",
    pred: (t, i) => parenKind(t, i) === "number_equation" },
  { id: "plus.in_number_equation", mark: "+", divides: false,
    test: "'+' inside a parenthesis whose content is number=number+number",
    means: "And: joins the component entry numbers. Not Strong's KJV '+' (supplied word) — this provider never uses '+' outside these equations.",
    pred: (t, i) => parenKind(t, i) === "number_equation" },
  // .
  { id: "period.at_head_glued", mark: ".", divides: false,
    test: "'.' at the first character of the route, glued to the word after it",
    means: "A full stop with nothing before it in the field, glued to 'and'. It ends nothing this route holds, so it divides nothing; the data has one instance and cannot say whether it is a stray or the end of the preceding English sentence carried onto this conjunction.",
    pred: (t, i) => i === 0 && isLetter(t[1]) },
  // /
  { id: "slash.between_words", mark: "/", divides: true,
    test: "'/' with a letter immediately on each side",
    means: "Alternation between two renderings of one head that share the words after them: 'thumbs/big toes of' is 'thumbs of' or 'big toes of'. A reader sees two readings, but the shared tail belongs to both, so a cut at the slash leaves the first without its 'of'.",
    pred: (t, i) => isLetter(t[i - 1]) && isLetter(t[i + 1]) },
];

// ---------------------------------------------------------------- read
const inv = JSON.parse(readFileSync(INVENTORY, "utf8"));
const invEntries = inv.providers.filter((p) => M_IDS.includes(p.provider));
const invMarks = new Map();
for (const e of invEntries) for (const m of e.marks) {
  const x = invMarks.get(m.mark) || { occurrences: 0, routes_carrying_it: 0 };
  x.occurrences += m.occurrences; x.routes_carrying_it += m.routes_carrying_it; invMarks.set(m.mark, x);
}
const ranked = JSON.parse(readFileSync(RANKED, "utf8"));
const rankedRow = (ranked.sources || []).find((p) => p.source_key === SOURCE_KEY) || null;
const rankedPosition = (ranked.sources || []).findIndex((p) => p.source_key === SOURCE_KEY) + 1;

const census = { route: new Map(), def: new Map() };
const bump = (field, mark, routeId) => {
  const x = field.get(mark) || { occurrences: 0, routes: new Set() };
  x.occurrences += 1; x.routes.add(routeId); field.set(mark, x);
};
const shapeHits = new Map(SHAPES.map((s) => [s.id, { count: 0, routes: new Set(), examples: [] }]));
const shapeHitsDef = new Map(SHAPES.map((s) => [s.id, 0]));
const unexplained = new Map(); // mark -> [{key, route, at}]
const doubleShape = []; // an occurrence matched by two shapes of the same mark
let rows = 0; const keys = new Set(); const mCount = {}; const years = {};
const region = { whole: 0, slice: 0, absent: 0 };
let routesWithNoMark = 0;
const byKeyRoutes = new Map();
const tildeRows = []; const numberParens = [];
const allRows = []; // kept small: key, route, def only (one provider, 43k rows)

const classify = (t, i) => {
  const c = t[i];
  const hits = SHAPES.filter((s) => s.mark === c && s.pred(t, i));
  return hits;
};

const rl = createInterface({ input: createReadStream(IN, "utf8"), crlfDelay: Infinity });
for await (const line of rl) {
  if (!line) continue;
  const r = JSON.parse(line);
  const id = rows; rows += 1;
  keys.add(r.key); mCount[r.m] = (mCount[r.m] || 0) + 1; years[r.year] = (years[r.year] || 0) + 1;
  const R = String(r.route), D = String(r.def);
  if (R === D) region.whole += 1; else if (D.includes(R)) region.slice += 1; else region.absent += 1;
  allRows.push([r.key, R, D]);
  if (!byKeyRoutes.has(r.key)) byKeyRoutes.set(r.key, new Set());
  byKeyRoutes.get(r.key).add(R);
  let any = false;
  for (let i = 0; i < R.length; i += 1) {
    const c = R[i]; if (!isMark(c)) continue;
    any = true; bump(census.route, c, id);
    const hits = classify(R, i);
    if (hits.length > 1) doubleShape.push({ key: r.key, route: short(R), at: i, shapes: hits.map((h) => h.id) });
    if (!hits.length) { const u = unexplained.get(c) || []; u.push({ key: r.key, route: short(R), at: i }); unexplained.set(c, u); continue; }
    const h = shapeHits.get(hits[0].id);
    h.count += 1; h.routes.add(id);
    if (h.examples.length < 6 && !h.examples.some((e) => e.endsWith(`: ${short(R)}`))) h.examples.push(`${r.key}: ${short(R)}`);
  }
  if (!any) routesWithNoMark += 1;
  for (let i = 0; i < D.length; i += 1) {
    const c = D[i]; if (!isMark(c)) continue;
    bump(census.def, c, id);
    const hits = classify(D, i);
    if (hits.length) shapeHitsDef.set(hits[0].id, shapeHitsDef.get(hits[0].id) + 1);
  }
  if (R.includes("~")) tildeRows.push([r.key, R]);
  for (const [a, z] of parenSpans(R)) { const inner = R.slice(a + 1, z); if (NUM.test(inner)) numberParens.push({ key: r.key, route: R, number: inner }); }
}

// ---------------------------------------------------------------- tests on the data
// ~ : is it a gap in one phrase, or a separator between two glosses?
const PARTICLES = new Set(["out", "up", "down", "away", "back", "over", "off", "in", "on", "aside", "apart", "together", "forth", "around", "through", "near", "far", "along", "by", "into", "astray", "again", "alone", "free", "low"]);
let tildeTwin = 0, bothSidesAreRoutes = 0, afterIsParticle = 0;
const bothSidesEx = [], twinEx = [];
const afterWord = {}, beforeWord = {};
let tildeTwoGaps = 0;
for (const [k, R] of tildeRows) {
  const set = byKeyRoutes.get(k);
  const joined = R.replace(/\s*~\s*/g, " ").trim();
  if (set.has(joined)) { tildeTwin += 1; if (twinEx.length < 6) twinEx.push(`${k}: ${short(R)} | ${short(joined)}`); }
  if ((R.match(/~/g) || []).length > 1) tildeTwoGaps += 1;
  const parts = R.split("~").map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.every((p) => set.has(p))) { bothSidesAreRoutes += 1; if (bothSidesEx.length < 20) bothSidesEx.push(`${k}: ${short(R)}`); }
  const after = (R.split("~")[1] || "").trim().split(/\s+/)[0];
  const before = (R.split("~")[0] || "").trim().split(/\s+/).pop();
  if (after) afterWord[after] = (afterWord[after] || 0) + 1;
  if (before) beforeWord[before] = (beforeWord[before] || 0) + 1;
  if (PARTICLES.has(after)) afterIsParticle += 1;
}
const top = (o, n) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n));
// number parentheses: which routes share each number
const numberGroups = {};
for (const x of numberParens) (numberGroups[x.number] ??= []).push(`${x.key}: ${x.route}`);

// falsifier counts over the route text
const F = {
  tilde_with_space_on_only_one_side_or_none_mid_route: 0,
  hyphen_with_space_on_a_side: 0,
  apostrophe_not_inside_or_closing_a_word: 0,
  exclamation_or_question_not_at_route_end: 0,
  paren_holding_a_comma_or_other_mark: 0,
  comma_or_semicolon_anywhere_in_route: 0,
  comma_or_semicolon_anywhere_in_definition: 0,
  unbalanced_parentheses: 0,
};
for (const [, R, D] of allRows) {
  for (let i = 0; i < R.length; i += 1) {
    const c = R[i];
    if (c === "~" && i > 0 && i < R.length - 1 && !(R[i - 1] === " " && R[i + 1] === " ")) F.tilde_with_space_on_only_one_side_or_none_mid_route += 1;
    if (c === "-" && (R[i - 1] === " " || R[i + 1] === " ")) F.hyphen_with_space_on_a_side += 1;
    if (c === "’" && !isLetter(R[i - 1])) F.apostrophe_not_inside_or_closing_a_word += 1;
    if ((c === "!" || c === "?") && i !== R.length - 1) F.exclamation_or_question_not_at_route_end += 1;
    if (c === "," || c === ";") F.comma_or_semicolon_anywhere_in_route += 1;
  }
  for (const c of D) if (c === "," || c === ";") F.comma_or_semicolon_anywhere_in_definition += 1;
  for (const [a, z] of parenSpans(R)) if (/[^\p{L}\p{N}\s=+]/u.test(R.slice(a + 1, z))) F.paren_holding_a_comma_or_other_mark += 1;
  let d = 0, bad = false; for (const c of R) { if (c === "(") d += 1; else if (c === ")") { d -= 1; if (d < 0) bad = true; } }
  if (bad || d !== 0) F.unbalanced_parentheses += 1;
}

// ---------------------------------------------------------------- census.json
const markOrder = [...census.route.keys()].sort((a, b) => census.route.get(b).occurrences - census.route.get(a).occurrences);
const allMarks = new Set([...census.route.keys(), ...census.def.keys(), ...invMarks.keys()]);
const marksOut = [...allMarks].sort((a, b) => (census.route.get(b)?.occurrences || 0) - (census.route.get(a)?.occurrences || 0)).map((m) => {
  const rc = census.route.get(m), dc = census.def.get(m), iv = invMarks.get(m);
  const shapes = SHAPES.filter((s) => s.mark === m).map((s) => {
    const h = shapeHits.get(s.id);
    return { shape: s.id, test: s.test, count: h.count, routes: h.routes.size, definition_text_count: shapeHitsDef.get(s.id), means: s.means, divides_readings: s.divides, examples: h.examples };
  });
  const explained = shapes.reduce((n, s) => n + s.count, 0);
  return {
    mark: m, codepoint: `U+${m.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    occurrences: rc?.occurrences || 0, routes: rc?.routes.size || 0,
    definition_text: { occurrences: dc?.occurrences || 0, rows_carrying_it: dc?.routes.size || 0 },
    inventory: iv ? { ...iv, agrees: iv.occurrences === (rc?.occurrences || 0) && iv.routes_carrying_it === (rc?.routes.size || 0) } : null,
    region_dependent: false,
    shapes,
    unexplained: (rc?.occurrences || 0) - explained,
    unexplained_occurrences: unexplained.get(m) || [],
  };
});
const unexplainedTotal = marksOut.reduce((n, m) => n + m.unexplained, 0);

// ---------------------------------------------------------------- declaration.json
const g = (id) => shapeHits.get(id).count;
const gr = (id) => shapeHits.get(id).routes.size;
const mk = (m) => marksOut.find((x) => x.mark === m);
const fmt = (n) => n.toLocaleString("en-US");
const decl = {
  label: "MACULA exact Hebrew morph surfaces with Cherith English definitions",
  m_ids: M_IDS,
  routes: rows,
  declared_on: "2026-10-31",
  declared_from: `The entry's own structure, read across all ${fmt(rows)} routes on ${fmt(keys.size)} keys. In ${fmt(region.whole)} of ${fmt(rows)} rows the route is the whole definition, character for character: each record is one contextual English gloss for one Hebrew surface, with no head, no rendering list and no notes, so no mark's meaning depends on a region. ${fmt(routesWithNoMark)} routes carry no mark at all. The provider writes no comma and no semicolon anywhere (route ${F.comma_or_semicolon_anywhere_in_route}, definition ${F.comma_or_semicolon_anywhere_in_definition}). Its closed set is ${markOrder.length} marks, ${fmt(marksOut.reduce((n, m) => n + m.occurrences, 0))} occurrences; every occurrence falls in exactly one of ${SHAPES.length} shapes; ${unexplainedTotal} unexplained. Exactly one mark, '/', divides readings in meaning, once, and it is not separated (see its entry).`,
  regions: { route_regions: region, meaning_depends_on_region: {}, note: "Every route is its whole definition, so the provider has one region." },
  marks: {
    "~": {
      means: "a gap inside one English phrase: the place where English carried by another Hebrew word or morph of the verse stands ('bring ~ back' is 'bring [him] back'). Never a boundary between two readings.",
      governs: mk("~").routes,
      occurrences: mk("~").occurrences,
      shape_occurrences: { gap_between_words: g("tilde.gap_between_words"), gap_at_head: g("tilde.gap_at_head"), gap_at_tail: g("tilde.gap_at_tail") },
      routes_with_two_gaps: tildeTwoGaps,
      evidence: `${fmt(tildeTwin)} of the ${fmt(tildeRows.length)} routes carrying '~' have a sibling route on the same key that is the same text with the gap closed (e.g. ${twinEx.slice(0, 2).join("; ")}); the word after the gap is a verbal particle (out, up, down, away, back and the like) in ${fmt(afterIsParticle)} of them; in ${bothSidesAreRoutes} does each side stand as a route of its own on the same key.`,
      falsifier: `A '~' whose two sides are two alternative renderings rather than two halves of one phrase. Searched as: each side stands as a route of its own on the same key. ${bothSidesAreRoutes} today, and each reads as one phrase split around its gap, not as two alternatives: correlative frames, phrasal verbs, a noun phrase (${bothSidesEx.join("; ")}). Also a '~' mid-route without a space on both sides: ${F.tilde_with_space_on_only_one_side_or_none_mid_route} today.`,
      divides_readings: false,
    },
    "’": {
      means: "the apostrophe of English spelling inside one word: possessive ’s, plural possessive s’, contracted n’t",
      governs: mk("’").routes,
      occurrences: mk("’").occurrences,
      shape_occurrences: { possessive_s: g("apostrophe.possessive_s"), plural_possessive: g("apostrophe.plural_possessive"), contraction_nt: g("apostrophe.contraction_nt") },
      evidence: shapeHits.get("apostrophe.possessive_s").examples.slice(0, 3).concat(shapeHits.get("apostrophe.plural_possessive").examples.slice(0, 2), shapeHits.get("apostrophe.contraction_nt").examples.slice(0, 1)).join(" | "),
      falsifier: `A '’' with no letter before it (an opening quotation mark): ${F.apostrophe_not_inside_or_closing_a_word} today.`,
      divides_readings: false,
    },
    "-": {
      means: "joins two parts into one English word or one name (father-in-law, one-fifth, beth-arabah, Esh-baal); once, at the head, it writes the gloss as a bound suffix (-self)",
      governs: mk("-").routes,
      occurrences: mk("-").occurrences,
      shape_occurrences: { compound_join: g("hyphen.compound_join"), bound_suffix: g("hyphen.bound_suffix") },
      evidence: shapeHits.get("hyphen.compound_join").examples.slice(0, 4).concat(shapeHits.get("hyphen.bound_suffix").examples).join(" | "),
      falsifier: `A '-' with a space on either side (a dash standing between two glosses): ${F.hyphen_with_space_on_a_side} today.`,
      divides_readings: false,
    },
    "!": {
      means: "the gloss's own mood, imperative or exclamation, at the end of the one reading",
      governs: mk("!").routes,
      occurrences: mk("!").occurrences,
      shape_occurrences: { final_on_word: g("exclamation.final_on_word"), final_after_space: g("exclamation.final_after_space") },
      evidence: shapeHits.get("exclamation.final_on_word").examples.slice(0, 3).concat(shapeHits.get("exclamation.final_after_space").examples).join(" | "),
      falsifier: `A '!' anywhere but the last character, which would end one gloss and begin another: ${F.exclamation_or_question_not_at_route_end} '!' or '?' today.`,
      divides_readings: false,
    },
    "?": {
      means: "the gloss is interrogative; at the end of the one reading",
      governs: mk("?").routes,
      occurrences: mk("?").occurrences,
      shape_occurrences: { final_on_word: g("question.final_on_word"), final_after_space: g("question.final_after_space") },
      evidence: shapeHits.get("question.final_on_word").examples.slice(0, 3).concat(shapeHits.get("question.final_after_space").examples).join(" | "),
      falsifier: "As for '!': a '?' anywhere but the last character.",
      divides_readings: false,
    },
    "(": {
      means: "an annotation or a supplied word inside one reading, never a scope over alternatives: a lexicon number tying a name-part to its compound name, a number equation standing where the gloss would, or English supplied for sense",
      governs: mk("(").routes,
      occurrences: mk("(").occurrences,
      shape_occurrences: { strongs_number: g("open.strongs_number"), number_equation: g("open.number_equation"), supplied_whole_route: g("open.supplied_whole_route"), supplied_inside_route: g("open.supplied_inside_route") },
      evidence: `numbers shared by the halves of one name: ${Object.entries(numberGroups).map(([n, xs]) => `${n} on ${xs.join(" and ")}`).join("; ")}. Supplied English: ${shapeHits.get("open.supplied_inside_route").examples.slice(0, 4).join(" | ")}`,
      falsifier: `A parenthesis holding a comma, a slash or any mark but '=' and '+' (a scope over alternatives): ${F.paren_holding_a_comma_or_other_mark} today. Unbalanced parentheses: ${F.unbalanced_parentheses} today.`,
      divides_readings: false,
    },
    ")": { means: "closes the annotation or supplied word", governs: mk(")").routes, occurrences: mk(")").occurrences, divides_readings: false },
    "=": {
      means: "inside a number equation only: the entry on the left is composed of the entries on the right",
      governs: mk("=").routes, occurrences: mk("=").occurrences,
      evidence: shapeHits.get("equals.in_number_equation").examples.join(" | "),
      falsifier: `An '=' outside a parenthesis of numbers: ${mk("=").occurrences - g("equals.in_number_equation")} today.`,
      divides_readings: false,
    },
    "+": {
      means: "inside a number equation only: joins the component entry numbers. This is not Strong's KJV '+' (a word supplied by the translators); the provider never writes '+' beside English",
      governs: mk("+").routes, occurrences: mk("+").occurrences,
      evidence: shapeHits.get("plus.in_number_equation").examples.join(" | "),
      falsifier: `A '+' outside a parenthesis of numbers (e.g. before an English word, as Strong's writes it): ${mk("+").occurrences - g("plus.in_number_equation")} today.`,
      divides_readings: false,
    },
    ".": {
      means: "once, a full stop glued to the head of 'and', with nothing before it in the field: it ends nothing the route holds, so it divides nothing. Whether it is a stray or the end of the preceding English sentence carried onto the conjunction, one instance cannot say.",
      governs: mk(".").routes, occurrences: mk(".").occurrences,
      evidence: shapeHits.get("period.at_head_glued").examples.join(" | "),
      falsifier: `A '.' with words on both sides of it (a sentence boundary inside one field): ${mk(".").occurrences - g("period.at_head_glued")} today.`,
      divides_readings: false,
    },
    "/": {
      means: "alternation between two renderings of one head that share the words after them: 'thumbs/big toes of' is 'thumbs of' or 'big toes of'",
      governs: mk("/").routes, occurrences: mk("/").occurrences,
      evidence: shapeHits.get("slash.between_words").examples.join(" | "),
      divides_readings: true,
      separated: false,
      rule: "Not separated. A cut at the slash keeps both pieces and each is the provider's run, but the first piece, 'thumbs', loses the 'of' the provider wrote once for both; printing 'thumbs of' would join pieces the provider never wrote together, which is a derivation. Held whole until the owner rules (open question).",
      falsifier: "A second '/' route whose pieces each stand alone as complete glosses; then the slash is a plain separator and the rule can be written from more than one instance.",
    },
  },
  precedence: [],
  precedence_note: "No mark separates in this provider, so no order arises. If the owner rules the single '/' a separator, it is the only one and stands alone.",
  closure: "The mark set above is closed. A route carrying any mark not listed (a comma or a semicolon included) is reported and ships whole.",
  export: "governed by its posture, cc_by_4_0",
  separates_on: null,
  separates_on_note: `Every route ships whole. That is the default for an undeclared provider too; what this declaration adds is the closed set, the meanings, and the record that the provider writes one reading per field: ${fmt(region.whole)} of ${fmt(rows)} routes are their whole definition, no field carries a comma or a semicolon, and the one mark that divides in meaning (the '/', 1 route) shares a tail across its alternatives.`,
  not_done_here: "No gap is filled: '~' is never replaced by the English it stands for, since that English belongs to another word's record. No supplied-word parenthesis is stripped and no lexicon number is removed. The provider's run-together words (e.g. 'havetrodden', 'toanger', 'greatamount', several after a '~') are its own spelling and are not respaced here.",
};

// apply: the one machine, this declaration placed in its in-memory set
machine.DECLARATIONS.providers[SOURCE_KEY] = decl;

// today's engine, as gloss-store-v1 runs it: packSplit at depth-0 ';', then senseSplit
const packSplit = (text) => {
  const t = String(text || ""); const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; }
    else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; }
  }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
const engine = (t) => {
  const readings = []; let withheld = 0;
  for (const sense of packSplit(t)) { const r = senseSplit(sense); if (r.damaged) { withheld += 1; continue; } readings.push(...r.readings); }
  return { readings, withheld };
};
const cmp = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_withholds: 0, v3_prints_differently_while_both_whole: 0 };
const ex = { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [], v3_withholds: [] };
let unknownMarkRows = 0; const unknownEx = []; let refusedRejoin = 0;
for (const [k, R, D] of allRows) {
  cmp.fields_compared += 1;
  const v3 = engine(R);
  const dc = machine.readingOf(R, D, SOURCE_KEY);
  if (dc.unknownMarks.length) { unknownMarkRows += 1; if (unknownEx.length < 6) unknownEx.push(`${k}: ${short(R)} [${dc.unknownMarks.join("")}]`); }
  if (dc.refused) refusedRejoin += 1;
  if (v3.withheld) { cmp.v3_withholds += 1; if (ex.v3_withholds.length < 6) ex.v3_withholds.push(`${k}: ${short(R)}`); }
  const a = v3.readings, b = dc.readings;
  const v3div = a.length > 1, ddiv = b.length > 1;
  if (!v3div && !ddiv) { cmp.same_division += 1; if ((a[0] ?? "") !== (b[0] ?? "")) cmp.v3_prints_differently_while_both_whole += 1; }
  else if (v3div && !ddiv) { cmp.v3_divides_where_declaration_keeps_whole += 1; if (ex.v3_divides_where_declaration_keeps_whole.length < 6) ex.v3_divides_where_declaration_keeps_whole.push(`${k}: ${short(R)} -> ${JSON.stringify(a)}`); }
  else if (!v3div && ddiv) { cmp.declaration_divides_where_v3_keeps_whole += 1; if (ex.declaration_divides_where_v3_keeps_whole.length < 6) ex.declaration_divides_where_v3_keeps_whole.push(`${k}: ${short(R)} -> ${JSON.stringify(b)}`); }
  else if (JSON.stringify(a) === JSON.stringify(b)) cmp.same_division += 1;
  else { cmp.divided_differently += 1; if (ex.divided_differently.length < 6) ex.divided_differently.push(`${k}: v3 ${JSON.stringify(a)} | decl ${JSON.stringify(b)}`); }
}

const censusOut = {
  schema: "MARK_LEDGER_CENSUS_V1 (pilot)",
  source_key: SOURCE_KEY, m_ids: M_IDS, routes: rows, emitted_on: "2026-10-31",
  read_from: { routes: IN, inventory: INVENTORY, store: inv.emitted_from },
  ranked: rankedRow ? { ...rankedRow, rank_by_routes: rankedPosition, of_source_keys: (ranked.sources || []).length, total_routes: ranked.total_routes } : null,
  distinct_keys: keys.size, rows_by_m: mCount, rows_by_year: years,
  route_region: region,
  routes_with_no_mark_at_all: routesWithNoMark,
  closed_set: { route_text: markOrder, definition_text: [...census.def.keys()], inventory: [...invMarks.keys()],
    agrees_with_inventory: marksOut.every((m) => m.inventory && m.inventory.agrees) && invMarks.size === census.route.size },
  marks: marksOut,
  unexplained_total: unexplainedTotal,
  occurrences_matching_two_shapes: doubleShape.length, double_shape_examples: doubleShape.slice(0, 6),
  tilde_tests: { routes: tildeRows.length, routes_with_two_gaps: tildeTwoGaps, sibling_with_gap_closed: tildeTwin, sibling_examples: twinEx,
    word_after_gap_is_particle: afterIsParticle, particles_counted: [...PARTICLES], both_sides_are_routes_on_same_key: bothSidesAreRoutes, both_sides_examples: bothSidesEx,
    word_after_gap_top: top(afterWord, 20), word_before_gap_top: top(beforeWord, 20) },
  number_parentheses: numberGroups,
  falsifier_tests: F,
  open_questions: [
    { mark: "/", routes: gr("slash.between_words"), examples: shapeHits.get("slash.between_words").examples,
      readings: { ship_whole: `one reading, 'thumbs/big toes of', as today (${gr("slash.between_words")} route, 1 piece)`, separate_at_slash: `two pieces, 'thumbs' and 'big toes of' (${gr("slash.between_words")} route, 2 pieces); the first prints without the 'of' both share` } },
    { mark: "( = +", routes: gr("open.number_equation"), examples: shapeHits.get("open.number_equation").examples,
      readings: { a_reading: `print the equation as this provider's reading for the article, as today (${gr("open.number_equation")} routes, no English in them)`, an_annotation: `treat a route of numbers alone as an annotation with no English reading, so this provider puts no pill there (${gr("open.number_equation")} routes)` } },
    { mark: "( )", routes: gr("open.strongs_number"), examples: shapeHits.get("open.strongs_number").examples,
      readings: { part_of_reading: `the lexicon number prints inside the reading as written, as today (${gr("open.strongs_number")} routes)`, set_apart: `the page shows the number as the provider's cross-reference beside the name-part, not as words of the reading (${gr("open.strongs_number")} routes; the characters stay, only their presentation differs)` } },
    { mark: ".", routes: gr("period.at_head_glued"), examples: shapeHits.get("period.at_head_glued").examples,
      readings: { stray: `a stray full stop, printed as written (${gr("period.at_head_glued")} route)`, carried_sentence_end: `the end of the preceding English sentence carried onto the conjunction (${gr("period.at_head_glued")} route); either way nothing divides` } },
  ],
  declaration_division: { separates_on: null, routes_divided: 0, closure_rows_with_undeclared_marks: unknownMarkRows, closure_examples: unknownEx, refused_rejoin: refusedRejoin },
  v3_comparison: { engine: `gloss-store packSplit at depth-0 ';', then ${V3_RULE} on each sense; a damaged sense prints nothing`, declaration_machine: machine.RULE_ID, ...cmp, examples: ex },
};
writeFileSync(join(OUT, "census.json"), `${JSON.stringify(censusOut, null, 1)}\n`);
writeFileSync(join(OUT, "declaration.json"), `${JSON.stringify({
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  providers: { [SOURCE_KEY]: decl },
}, null, 1)}\n`);
console.log(JSON.stringify({ rows, keys: keys.size, region, routesWithNoMark, unexplainedTotal, doubleShape: doubleShape.length, closure: censusOut.closed_set.agrees_with_inventory, F, cmp, unknownMarkRows, refusedRejoin,
  shapes: Object.fromEntries([...shapeHits].map(([k, v]) => [k, v.count])), unexplained: Object.fromEntries([...unexplained].map(([k, v]) => [k, v])) }, null, 1));
