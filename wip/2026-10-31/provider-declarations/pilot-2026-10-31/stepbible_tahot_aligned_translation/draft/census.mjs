#!/usr/bin/env node
// Mark ledger pilot · stepbible_tahot_aligned_translation (M4) · 2026-10-31
//
// Reads every route of the provider (one JSONL, one process), counts every
// mark in the route text and, separately, in the definition text, assigns
// every occurrence to exactly one shape by an ordered deterministic test,
// runs the alignment tests that say what the "/" segments are, compares the
// declaration's division with today's engine (gloss-store packSplit at
// depth-0 ';', then sense-split-v1 senseSplit), and writes census.json and
// declaration.json. Every number in either file comes from this run.
//
//   node census.mjs
//
// Read-only on everything but this folder.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUNCT = join(HERE, "..", "..");
const SCRATCH = join(PUNCT, "..");
const SOURCE_KEY = "stepbible_tahot_aligned_translation";
const JSONL = join(PUNCT, "by-source", `${SOURCE_KEY}.jsonl`);
const INVENTORY = join(PUNCT, "mark-inventory-2026-10-31.json");
const RANKED = join(PUNCT, "sources-ranked.json");
const SENSE_SPLIT = join(SCRATCH, "ghp", "reader", "tools", "sense-split-v1.mjs");
const MACHINE = join(SCRATCH, "ghp", "reader", "tools", "declaration-v1.mjs");

const { senseSplit, RULE_ID: V3_RULE } = await import(SENSE_SPLIT);
const { readingOf, DECLARATIONS } = await import(MACHINE);

// gloss-store-v1.mjs packSplit (lines 106-118), copied verbatim: today's
// engine packs senses at depth-0 ';' before senseSplit divides at commas
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
/** What today's engine prints for one route: packSplit, then senseSplit; a damaged sense prints nothing. */
const v3Readings = (R) => {
  const out = [];
  for (const sense of packSplit(R)) {
    const r = senseSplit(sense);
    if (r.damaged) continue;
    out.push(...r.readings.map((x) => x.trim()));
  }
  return out;
};
// zone.html spanJoin (line 4192), copied verbatim: how the page prints a "/"-packed reading
const spanJoin = (t) => String(t).split("/").map((x) => x.trim()).filter(Boolean).join(" + ").replace(/\.$/, "");

const rows = readFileSync(JSONL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const inv = JSON.parse(readFileSync(INVENTORY, "utf8"));
const ranked = JSON.parse(readFileSync(RANKED, "utf8"));
const rankedEntry = (Array.isArray(ranked) ? ranked : ranked.sources || ranked.ranked || Object.values(ranked).find(Array.isArray) || [])
  .find((x) => x && x.source_key === SOURCE_KEY) || null;

const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
const win = (s, i) => s.slice(Math.max(0, i - 28), i + 29);           // at most 57 characters
const keyed = (r, i) => `${r.key} | ${i === undefined ? r.route.slice(0, 57) : win(r.route, i)}`;
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const HEB_KEY = (k) => String(k).replace(/־/gu, "");            // maqaf is not a letter of the key
const FINAL = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

// ---------------------------------------------------------------- facts
const keys = new Map();
let routeEqDef = 0; const mIds = {}; const yearCounts = {}; const cutCounts = {};
const keyRoute = new Set(); let dupKeyRoute = 0;
for (const r of rows) {
  if (r.route === r.def) routeEqDef += 1;
  bump(mIds, r.m); bump(yearCounts, r.year); bump(cutCounts, String(r.cut));
  keys.set(r.key, (keys.get(r.key) || 0) + 1);
  const kr = `${r.key}\u0001${r.route}`; if (keyRoute.has(kr)) dupKeyRoute += 1; else keyRoute.add(kr);
}
const perKey = [...keys.values()];
const keysWithOneRoute = perKey.filter((n) => n === 1).length;

// ---------------------------------------------------------------- census, route and definition separately
const census = { route: {}, def: {} };
for (const r of rows) {
  for (const field of ["route", "def"]) {
    const s = r[field]; const seen = new Set();
    for (const c of s) if (isMark(c)) { (census[field][c] ||= { occurrences: 0, rows: 0 }).occurrences += 1; seen.add(c); }
    for (const c of seen) census[field][c].rows += 1;
  }
}
const invM = inv.providers.find((p) => p.provider === "M4");
const invMarks = Object.fromEntries(invM.marks.map((m) => [m.mark, m]));

// ---------------------------------------------------------------- shapes
// Every occurrence of every mark gets exactly one shape. The tests are run in
// the order written; the first that holds names the shape. An occurrence no
// test holds for is counted unexplained, with its window kept.
const SHAPES = {};          // mark -> shape -> {count, routes:Set, examples:[]}
const shapeDef = {};        // shape -> {test, means, divides_readings}
const def = (name, test, means, divides = false) => { shapeDef[name] = { test, means, divides_readings: divides }; };
const UNEXPLAINED = {};
const put = (mark, shape, r, i) => {
  const m = (SHAPES[mark] ||= {});
  const e = (m[shape] ||= { count: 0, routes: new Set(), examples: [] });
  e.count += 1; e.routes.add(r.__n);
  if (e.examples.length < 6) e.examples.push(keyed(r, i));
};
const unexplained = (mark, r, i) => { (UNEXPLAINED[mark] ||= []).push(keyed(r, i)); };

def("slash.segment_boundary", "a single '/' with a non-empty segment on each side (any spacing: 'x/ y' standard; 'x/y', 'x /y', 'x / y' variants)",
  "boundary between the English of two consecutive segments of one Hebrew word (prefix, stem, suffix, maqaf), written in Hebrew order: 'father/ your' is the one rendering 'your father' of one word");
def("slash.empty_segment", "a '/' that bounds a segment holding only whitespace or nothing ('//' or '/ /')",
  "a segment boundary with an empty segment beside it: a seam in the Hebrew word that the provider gives no English (here, the join of a form that is two words elsewhere: a name, Yahweh of hosts, a ketiv)");
def("square.supplied_words", "'[' ... ']' (matched) whose '[' is not directly after a letter and whose content holds a letter and does not start with '-'",
  "words the translators supply in English that no Hebrew segment carries (article, copula, relative, subject, noun understood)");
def("square.supplied_letters", "'[' ... ']' (matched) whose '[' stands directly after a letter and whose content holds a letter",
  "letters the translators supply to complete an English word the Hebrew does not inflect that way ('Gebalite[s]': plural in English for a collective singular; 'be[longed]')");
def("square.supplied_suffix", "'[' ... ']' (matched) whose content starts with '-'",
  "a supplied English suffix that attaches to the word before it across the segment boundary ('who/ [-ever] carries' is 'whoever carries')");
def("square.supplied_punctuation", "'[' ... ']' (matched) whose content holds no letter",
  "punctuation the translators supply ('you[?]': the question mark is supplied, no interrogative segment carries it)");
def("square.open_continues_elsewhere", "'[' that no ']' in the route closes",
  "a supplied span that opens in this word and closes in a neighboring word's route (the provider's bracket straddles two Hebrew words)");
def("square.close_opened_elsewhere", "']' with no '[' open before it in the route",
  "the close of a supplied span that opened in a neighboring word's route");
def("angle.object_marker", "'<obj.>'",
  "the Hebrew object marker (et), present in the Hebrew and given no English word");
def("angle.hebrew_letters", "'<' ... '>' (matched) whose '<' stands directly after a letter",
  "an inflection the Hebrew carries that natural English drops ('love<s>/ your': Hebrew plural, English singular)");
def("angle.hebrew_words", "'<' ... '>' (matched) not after a letter and not '<obj.>'",
  "words the Hebrew carries that natural English drops: an article in the preposition's vowel ('in <the>/ days'), a preposition, an infinitive absolute ('<to know>')");
def("angle.close_opened_nowhere", "'>' with no '<' open before it in the route",
  "a stray closer: '<into> the>' — the provider's own text carries one '>' more than it opens");
def("hyphen.maqaf_segment", "'-' standing alone between two '/' ('/-/')",
  "the maqaf, given its own segment and rendered as a hyphen");
def("hyphen.supplied_suffix", "'-' directly after '['",
  "the attaching hyphen of a supplied suffix ('[-ever]')");
def("hyphen.word_continues_after", "'-' after a letter at the end of the route or directly before '/'",
  "the English word is cut here and finished by the next Hebrew word or segment ('thir-', finished by 'teen' on the next word; 'west-/ -ward')");
def("hyphen.word_continued_from_before", "'-' that is the first character of its segment and is followed by a letter",
  "the English word began in the previous Hebrew word or segment and is finished here ('-zedek', 'north/ -ward')");
def("hyphen.compound", "'-' between two letters",
  "part of one English compound word ('fire-pans', 'daughters-in-law')");
def("bang.mark_only_segment", "a segment that is '!' and nothing else",
  "a Hebrew segment (the long or energic ending: final he or nun) that the provider renders by emphasis alone, with no English word");
def("bang.exclamation", "'!' directly after a letter or ']'",
  "an exclamation in the English rendering ('woe!', 'how blessed!')");
def("question.mark_only_segment", "a segment that is '?' and nothing else", "a Hebrew segment rendered by a question mark alone");
def("question.supplied", "'?' inside square brackets ('[?]')", "a question mark the translators supply (the '?' of square.supplied_punctuation)");
def("question.before_construct_of", "'?' after a letter and followed by ' of' (the construct 'of' that ends the rendering)",
  "the question the verse asks, placed before the construct 'of' the rendering ends on ('[the] striking? of')");
def("question.end_of_rendering", "'?' at the end of the route or directly before '/'",
  "the verse's question mark, carried at the word where the English question ends");
def("inverted.interrogative_segment", "a segment that is '¿' and nothing else",
  "the Hebrew interrogative prefix he: a question is opened here and the English carries no word for it");
def("period.abbreviation", "'.' inside '<obj.>'", "the abbreviation point of 'obj.' (object marker)");
def("apostrophe.possessive", "''' between two letters, or after 's' and before a space or the end",
  "the English possessive ('ram's horn', 'rams' horns'), part of one word");
def("colon.route_final", "':' as the last character of the route",
  "the verse's colon, carried at the word that introduces what follows ('this:'); nothing follows it in the field");
def("semicolon.clause_end_before_supplied", "';' at depth 0 followed by a space and a square-bracketed supplied word",
  "the verse's own clause punctuation carried inside one word's rendering; the bracket after it opens the next clause with a supplied word");

// segment helper: for an index i, the trimmed segment (between slashes) that holds it
const segmentAt = (s, i) => {
  const a = s.lastIndexOf("/", i - 1) + 1;
  let z = s.indexOf("/", i + 1); if (z < 0) z = s.length;
  return { a, z, text: s.slice(a, z) };
};

let n = 0;
for (const r of rows) {
  r.__n = n++;
  const s = r.route;
  // match brackets, each kind on its own stack
  const pair = {}; const orphan = {};
  for (const [o, c] of [["[", "]"], ["<", ">"]]) {
    const st = [];
    for (let i = 0; i < s.length; i += 1) {
      if (s[i] === o) st.push(i);
      else if (s[i] === c) { if (st.length) { const j = st.pop(); pair[j] = i; pair[i] = j; } else orphan[i] = "close"; }
    }
    for (const j of st) orphan[j] = "open";
  }
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]; if (!isMark(c)) continue;
    const prev = s[i - 1], next = s[i + 1];
    let shape = null;
    if (c === "/") {
      const left = s.slice(s.lastIndexOf("/", i - 1) + 1, i);
      let z = s.indexOf("/", i + 1); if (z < 0) z = s.length;
      const right = s.slice(i + 1, z);
      if (!left.trim() || !right.trim()) shape = "slash.empty_segment";
      else shape = "slash.segment_boundary";
    } else if (c === "[" || c === "]") {
      if (orphan[i] === "open") shape = "square.open_continues_elsewhere";
      else if (orphan[i] === "close") shape = "square.close_opened_elsewhere";
      else {
        const o = c === "[" ? i : pair[i]; const z = c === "[" ? pair[i] : i;
        const content = s.slice(o + 1, z);
        if (!/\p{L}/u.test(content)) shape = "square.supplied_punctuation";
        else if (content.startsWith("-")) shape = "square.supplied_suffix";
        else if (isLetter(s[o - 1])) shape = "square.supplied_letters";
        else shape = "square.supplied_words";
      }
    } else if (c === "<" || c === ">") {
      if (orphan[i] === "close") shape = "angle.close_opened_nowhere";
      else if (orphan[i] === "open") shape = null;
      else {
        const o = c === "<" ? i : pair[i]; const z = c === "<" ? pair[i] : i;
        const content = s.slice(o + 1, z);
        if (content === "obj.") shape = "angle.object_marker";
        else if (isLetter(s[o - 1])) shape = "angle.hebrew_letters";
        else shape = "angle.hebrew_words";
      }
    } else if (c === "-") {
      const seg = segmentAt(s, i);
      if (prev === "/" && next === "/") shape = "hyphen.maqaf_segment";
      else if (prev === "[") shape = "hyphen.supplied_suffix";
      else if (isLetter(prev) && (next === undefined || next === "/")) shape = "hyphen.word_continues_after";
      else if (isLetter(next) && s.slice(seg.a, i).trim() === "") shape = "hyphen.word_continued_from_before";
      else if (isLetter(prev) && isLetter(next)) shape = "hyphen.compound";
    } else if (c === "!") {
      if (segmentAt(s, i).text.trim() === "!") shape = "bang.mark_only_segment";
      else if (isLetter(prev) || prev === "]") shape = "bang.exclamation";
    } else if (c === "?") {
      if (segmentAt(s, i).text.trim() === "?") shape = "question.mark_only_segment";
      else if (prev === "[" && next === "]") shape = "question.supplied";
      else if ((isLetter(prev) || prev === "]" || prev === ">") && /^ of( |\/|$)/u.test(s.slice(i + 1))) shape = "question.before_construct_of";
      else if ((isLetter(prev) || prev === "]" || prev === ">") && (next === undefined || next === "/")) shape = "question.end_of_rendering";
    } else if (c === "¿") {
      if (segmentAt(s, i).text.trim() === "¿") shape = "inverted.interrogative_segment";
    } else if (c === ".") {
      if (s.slice(i - 3, i + 2) === "obj.>") shape = "period.abbreviation";
    } else if (c === "'") {
      if (isLetter(prev) && isLetter(next)) shape = "apostrophe.possessive";
      else if (prev === "s" && (next === undefined || next === " ")) shape = "apostrophe.possessive";
    } else if (c === ":") {
      if (i === s.length - 1) shape = "colon.route_final";
    } else if (c === ";") {
      if (/^ \[[^\]]*\p{L}[^\]]*\]/u.test(s.slice(i + 1)) && !/[()]/u.test(s)) shape = "semicolon.clause_end_before_supplied";
    }
    if (shape) put(c, shape, r, i); else unexplained(c, r, i);
  }
}

// spacing of the standard slash
const slashSpacing = {};
for (const r of rows) {
  const s = r.route;
  for (let i = 0; i < s.length; i += 1) if (s[i] === "/") {
    const k = `${s[i - 1] === " " ? "space" : "tight"} / ${s[i + 1] === " " ? "space" : "tight"}`; bump(slashSpacing, k);
  }
}

// ---------------------------------------------------------------- content of the brackets
const sqContent = {}, anContent = {};
for (const r of rows) {
  for (const m of r.route.matchAll(/\[([^\[\]]*)\]/gu)) bump(sqContent, m[1]);
  for (const m of r.route.matchAll(/<([^<>]*)>/gu)) bump(anContent, m[1]);
}
const top = (o, k) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k);
const ARTICLE = /^(the|a|an)$/u;
const BE = /^((it|he|she|they|you|we|i|there|that|this|who|which) )?(is|was|are|were|am|be|been|will be|shall be|has been|have been|had been|belong|belongs|belonged|will belong)( the| a)?$/iu;
const sqClass = { article: 0, be_or_belong: 0, other: 0 };
for (const [c, k] of Object.entries(sqContent)) sqClass[ARTICLE.test(c) ? "article" : BE.test(c) ? "be_or_belong" : "other"] += k;

// ---------------------------------------------------------------- evidence: the '/' segments are the Hebrew word's segments
const ev = {};
const tally = (name, ok, r) => { const e = (ev[name] ||= { routes: 0, holds: 0, fails: [] }); e.routes += 1; if (ok) e.holds += 1; else if (e.fails.length < 6) e.fails.push(keyed(r)); };
for (const r of rows) {
  const s = r.route; if (!s.includes("/")) continue;
  const segs = s.split("/").map((x) => x.trim());
  const k = HEB_KEY(r.key);
  const last = FINAL[k[k.length - 1]] || k[k.length - 1];
  if (segs[0] === "and") tally("first segment 'and' : key begins with vav", k[0] === "ו", r);
  if (segs[0] === "the") tally("first segment 'the' : key begins with he", k[0] === "ה", r);
  if (segs[0] === "¿") tally("first segment '¿' : key begins with he", k[0] === "ה", r);
  if (segs[0] === "and" && segs[1] === "¿") tally("segments 'and', '¿' : key begins with vav he", k.startsWith("וה"), r);
  if (/^(in|like|to|for|at) <the>$/u.test(segs[0])) tally("first segment '<prep> <the>' : key begins with bet, kaf or lamed", /^[בכל]/u.test(k), r);
  if (segs[0] === "in" || segs[0] === "in <the>") tally("first segment 'in' : key begins with bet", k[0] === "ב", r);
  if (segs[segs.length - 1] === "your") tally("last segment 'your' : a kaf among the key's last three letters", /כ|ך/u.test([...k].slice(-3).join("")), r);
  if (segs[segs.length - 1] === "his") tally("last segment 'his' : key ends with vav, he or yod", /[והי]$/u.test(k), r);
  if (segs[segs.length - 1] === "!") tally("last segment '!' : key ends with he or nun", last === "ה" || last === "נ", r);
}
for (const r of rows) if (r.route.includes("<obj.>")) {
  const k = HEB_KEY(r.key);
  tally("'<obj.>' : key holds alef-tav (Hebrew et/ot-)", /את|אות/u.test(k), r);
  tally("'<obj.>' : key holds et/ot-, Aramaic yat, or opens on lamed (the object lamed)", /את|אות|ית/u.test(k) || /^ו?ל/u.test(k), r);
}
// a segment count can never exceed the letters of the word it segments
for (const r of rows) if (r.route.includes("/")) {
  const segs = r.route.split("/").filter((x) => x.trim()).length;
  tally("segments at most the key's letters", segs <= [...HEB_KEY(r.key)].length, r);
}
const evidence = Object.fromEntries(Object.entries(ev).map(([k, v]) => [k, { routes: v.routes, holds: v.holds, fails: v.fails }]));

// ---------------------------------------------------------------- is any field a packed alternation?
const alt = {
  routes_with_a_comma: rows.filter((r) => r.route.includes(",")).length,
  routes_with_a_parenthesis: rows.filter((r) => /[()]/u.test(r.route)).length,
  routes_with_a_semicolon: rows.filter((r) => r.route.includes(";")).length,
  routes_with_the_word_or: rows.filter((r) => /(^|[\s/])or([\s/]|$)/iu.test(r.route)).length,
  routes_with_the_word_or_examples: rows.filter((r) => /(^|[\s/])or([\s/]|$)/iu.test(r.route)).slice(0, 6).map((r) => keyed(r)),
  routes_that_are_only_supplied_brackets: rows.filter((r) => r.route.replace(/\[[^\[\]]*\]/gu, "").trim() === "").length,
  routes_that_are_only_supplied_brackets_examples: rows.filter((r) => r.route.replace(/\[[^\[\]]*\]/gu, "").trim() === "").slice(0, 6).map((r) => keyed(r)),
  routes_containing_surely_supplied: rows.filter((r) => r.route.includes("[surely]")).length,
  routes_where_surely_supplied_is_followed_by_a_rendering: rows.filter((r) => /\[surely\]\s*\S/u.test(r.route)).length,
};

// ---------------------------------------------------------------- comparison with today's engine
// The declaration divides on no mark: every route is one reading. Its division is therefore [route.trim()].
const declReadings = (R) => [String(R).trim()].filter(Boolean);
const cmp = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_withholds_where_declaration_prints: 0 };
const cmpEx = { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [], v3_withholds_where_declaration_prints: [] };
const alone = { senseSplit_alone_divides: 0, senseSplit_alone_damaged: 0, packSplit_divides: 0 };
const machine = { same_as_declaration: 0, differs: 0, examples: [] };
let pageJoinChanges = 0, pageJoinDropsEmpty = 0; const pageJoinEx = [];
for (const r of rows) {
  const R = r.route;
  const v = v3Readings(R), d = declReadings(R);
  cmp.fields_compared += 1;
  const ss = senseSplit(R); if (ss.damaged) alone.senseSplit_alone_damaged += 1; else if (ss.readings.length > 1) alone.senseSplit_alone_divides += 1;
  if (packSplit(R).length > 1) alone.packSplit_divides += 1;
  let kind;
  if (v.length === 0) kind = "v3_withholds_where_declaration_prints";
  else if (v.length === d.length && v.every((x, i) => x === d[i])) kind = "same_division";
  else if (v.length > 1 && d.length === 1) kind = "v3_divides_where_declaration_keeps_whole";
  else if (d.length > 1 && v.length === 1) kind = "declaration_divides_where_v3_keeps_whole";
  else kind = "divided_differently";
  cmp[kind] += 1;
  if (cmpEx[kind] && cmpEx[kind].length < 6) cmpEx[kind].push({ key: r.key, route: R.slice(0, 57), v3: v, declaration: d });
  const m = readingOf(R, r.def, SOURCE_KEY).readings.map((x) => x.trim());
  if (m.length === d.length && m.every((x, i) => x === d[i])) machine.same_as_declaration += 1;
  else { machine.differs += 1; if (machine.examples.length < 6) machine.examples.push({ key: r.key, route: R.slice(0, 57), machine: m }); }
  if (R.includes("/")) {
    pageJoinChanges += 1;
    if (R.split("/").some((x) => !x.trim())) { pageJoinDropsEmpty += 1; if (pageJoinEx.length < 6) pageJoinEx.push(`${r.key} | ${R.slice(0, 40)} -> ${spanJoin(R).slice(0, 40)}`); }
  }
}

// ---------------------------------------------------------------- assemble
const shapesOut = {};
let unexplainedTotal = 0;
const allMarks = [...new Set([...Object.keys(census.route), ...Object.keys(census.def)])]
  .sort((a, b) => (census.route[b]?.occurrences || 0) - (census.route[a]?.occurrences || 0));
const marksOut = allMarks.map((mark) => {
  const sh = SHAPES[mark] || {};
  const shapes = Object.entries(sh).sort((a, b) => b[1].count - a[1].count).map(([name, e]) => ({
    shape: name, test: shapeDef[name].test, count: e.count, routes: e.routes.size, means: shapeDef[name].means,
    divides_readings: shapeDef[name].divides_readings, examples: e.examples,
  }));
  const u = UNEXPLAINED[mark] || []; unexplainedTotal += u.length;
  const sum = shapes.reduce((a, x) => a + x.count, 0);
  const im = invMarks[mark];
  return {
    mark, codepoint: `U+${mark.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    route_text: census.route[mark] || { occurrences: 0, rows: 0 },
    definition_text: census.def[mark] || { occurrences: 0, rows: 0 },
    inventory: im ? { occurrences: im.occurrences, routes_carrying_it: im.routes_carrying_it, agrees: im.occurrences === census.route[mark]?.occurrences && im.routes_carrying_it === census.route[mark]?.rows } : null,
    shapes_sum: sum, every_occurrence_in_one_shape: sum + u.length === (census.route[mark]?.occurrences || 0),
    shapes, unexplained: u.length, unexplained_examples: u.slice(0, 6),
    region_dependent: false,
  };
});
const invOnly = invM.marks.filter((m) => !census.route[m.mark]).map((m) => m.mark);

const share = (a, b) => `${(100 * a / b).toFixed(2)}%`;
const shapeCount = (mark, shape) => SHAPES[mark]?.[shape]?.count || 0;
const shapeRoutes = (mark, shape) => SHAPES[mark]?.[shape]?.routes.size || 0;

const censusOut = {
  schema: "MARK_LEDGER_CENSUS_V1 (pilot)",
  source_key: SOURCE_KEY, m_ids: Object.keys(mIds), routes: rows.length,
  label: rankedEntry?.label || invM.label, licence_posture: rankedEntry?.licensePosture || null,
  emitted_on: "2026-10-31",
  read_from: { routes: JSONL, inventory: INVENTORY, store: inv.emitted_from, engine: `${V3_RULE} via gloss-store-v1.mjs packSplit + sense-split-v1.mjs senseSplit`, machine: "declaration-v1.mjs readingOf", page_print: "zone.html spanJoin (line 4192)" },
  structure: {
    route_equals_definition: routeEqDef,
    inventory_route_region: invM.route_region_in_definition,
    distinct_keys: keys.size,
    keys_with_one_route: keysWithOneRoute,
    most_routes_on_one_key: Math.max(...perKey),
    duplicate_key_route_pairs: dupKeyRoute,
    m_ids: mIds, years: yearCounts, cut: cutCounts,
    reading: "Every route is the provider's whole definition: one aligned English rendering of one Hebrew word as it stands at one place. A key's alternatives are separate routes (one per distinct rendering), never packed into one field.",
    regions: "There is no head, rendering list or notes: the definition is one rendering. No mark's meaning depends on a region.",
  },
  packed_alternation_tests: alt,
  marks: marksOut,
  marks_in_inventory_not_in_route: invOnly,
  marks_in_definition_not_in_route: allMarks.filter((m) => !census.route[m]),
  unexplained_total: unexplainedTotal,
  slash_spacing: slashSpacing,
  square_bracket_content: { distinct: Object.keys(sqContent).length, by_class: sqClass, top: top(sqContent, 30) },
  angle_bracket_content: { distinct: Object.keys(anContent).length, top: top(anContent, 30) },
  segment_alignment_evidence: evidence,
  v3_comparison: { engine: "gloss-store packSplit at depth-0 ';', then senseSplit on each sense; a damaged sense prints nothing", ...cmp, ...alone, examples: cmpEx },
  machine_comparison: { machine: "declaration-v1.mjs readingOf with today's declarations-v1.json (this provider undeclared: ships whole)", ...machine },
  page_print: {
    rule: "zone.html spanJoin: split at '/', trim, drop empty pieces, join with ' + ', drop one final '.'",
    routes_with_a_slash: pageJoinChanges,
    routes_where_an_empty_segment_is_dropped: pageJoinDropsEmpty,
    examples: pageJoinEx,
  },
};
writeFileSync(join(HERE, "census.json"), JSON.stringify(censusOut, null, 1) + "\n");

// ---------------------------------------------------------------- the declaration
const E = (k) => evidence[k] || { routes: 0, holds: 0 };
const fmt = (x) => x.toLocaleString("en-US");
const ex = (mark, shape, k = 3) => (SHAPES[mark]?.[shape]?.examples || []).slice(0, k).join(" ; ");
const markDecl = {
  "/": {
    means: "Segment boundary inside one rendering: the English of each segment of the Hebrew word (prefix, stem, suffix, maqaf), in Hebrew order. 'father/ your' is one reading of one word. Never alternation.",
    divides_readings: false,
    segments: true,
    governs: census.route["/"].occurrences, routes: census.route["/"].rows,
    shapes: { "slash.segment_boundary": shapeCount("/", "slash.segment_boundary"), "slash.empty_segment": shapeCount("/", "slash.empty_segment") },
    evidence: `${fmt(E("first segment 'and' : key begins with vav").holds)} of ${fmt(E("first segment 'and' : key begins with vav").routes)} routes opening on the segment 'and' have a key beginning with vav (the other ${fmt(E("first segment 'and' : key begins with vav").routes - E("first segment 'and' : key begins with vav").holds)} begin with lamed: ${(E("first segment 'and' : key begins with vav").fails || []).slice(0, 2).join(" ; ")}); ${fmt(E("first segment 'the' : key begins with he").holds)} of ${fmt(E("first segment 'the' : key begins with he").routes)} opening on 'the' begin with he; ${fmt(E("last segment 'your' : a kaf among the key's last three letters").holds)} of ${fmt(E("last segment 'your' : a kaf among the key's last three letters").routes)} ending on 'your' carry a kaf in the key's last three letters; ${fmt(E("segments at most the key's letters").holds)} of ${fmt(E("segments at most the key's letters").routes)} slash routes have no more segments than the key has letters. 0 routes carry a comma, ${fmt(alt.routes_with_the_word_or)} the word 'or'.`,
    falsifier: "A route whose '/' pieces are two whole renderings of the same word (an English 'x/y' alternative such as 'he/she'), or a segment whose English the key's letters cannot carry. 0 found: every slash route passes the segment-count test above.",
    prints: "The page's spanJoin prints the segments joined by ' + ' and drops empty ones; that is a print of one reading, not a division into readings. It agrees with this provider's meaning.",
    empty_segment: `${shapeCount("/", "slash.empty_segment")} slashes in ${shapeRoutes("/", "slash.empty_segment")} routes bound an empty segment ('//' or '/ /'): ${ex("/", "slash.empty_segment")}`,
  },
  "[": {
    means: "Opens words (or letters, a suffix, a question mark) the translators supply in English that no Hebrew segment carries. Part of the one reading.",
    divides_readings: false, annotation: true,
    governs: census.route["["].occurrences, routes: census.route["["].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["["]).map(([k, v]) => [k, v.count])),
    evidence: `content by class over matched pairs: article ${fmt(sqClass.article)}, be/belong ${fmt(sqClass.be_or_belong)}, other ${fmt(sqClass.other)}; ${alt.routes_that_are_only_supplied_brackets} routes consist of nothing but a supplied bracket (${alt.routes_that_are_only_supplied_brackets_examples.slice(0, 3).join(" ; ")}).`,
    falsifier: "A bracket whose content the key's own letters carry (a supplied word that is in the Hebrew). Not tested from this file: the key is letters only, not segmented.",
  },
  "]": { means: "Closes the supplied span.", divides_readings: false, governs: census.route["]"].occurrences, routes: census.route["]"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["]"]).map(([k, v]) => [k, v.count])) },
  "<": {
    means: "Opens what the Hebrew carries and natural English drops: the object marker '<obj.>', an article held in a preposition's vowel ('in <the>/'), an infinitive absolute ('<to know>'), a Hebrew plural ('love<s>'). Part of the one reading.",
    divides_readings: false, annotation: true,
    governs: census.route["<"].occurrences, routes: census.route["<"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["<"]).map(([k, v]) => [k, v.count])),
    evidence: `${fmt(E("'<obj.>' : key holds et/ot-, Aramaic yat, or opens on lamed (the object lamed)").holds)} of ${fmt(E("'<obj.>' : key holds et/ot-, Aramaic yat, or opens on lamed (the object lamed)").routes)} routes with '<obj.>' carry an object marker in the key (et/ot- ${fmt(E("'<obj.>' : key holds alef-tav (Hebrew et/ot-)").holds)}; the rest Aramaic yat or the object lamed); ${fmt(E("first segment '<prep> <the>' : key begins with bet, kaf or lamed").holds)} of ${fmt(E("first segment '<prep> <the>' : key begins with bet, kaf or lamed").routes)} routes opening 'in|like|to|for|at <the>/' begin with bet, kaf or lamed.`,
    falsifier: "An angle bracket holding English that no Hebrew segment of the key carries. Not tested beyond the two key tests in the evidence.",
  },
  ">": { means: "Closes the dropped span.", divides_readings: false, governs: census.route[">"].occurrences, routes: census.route[">"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES[">"]).map(([k, v]) => [k, v.count])),
    damage: `${shapeCount(">", "angle.close_opened_nowhere")} closers open nothing (${ex(">", "angle.close_opened_nowhere", 2)}); the row ships whole, as written.` },
  "-": {
    means: "Inside one English word: a compound, a word cut across two Hebrew words or segments ('thir-' ... 'teen', 'west-/ -ward'), the attaching hyphen of a supplied suffix, or the maqaf's own segment. Never a separator.",
    divides_readings: false,
    governs: census.route["-"].occurrences, routes: census.route["-"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["-"]).map(([k, v]) => [k, v.count])),
    evidence: `${ex("-", "hyphen.word_continues_after", 2)} ; ${ex("-", "hyphen.word_continued_from_before", 2)} ; ${ex("-", "hyphen.maqaf_segment", 1)}`,
    unresolved: "A word cut across two Hebrew words is finished in the neighbor's route; that join is not made here (it would join pieces from two records).",
  },
  "!": {
    means: "Either an exclamation in the English ('woe!'), or, standing alone as a segment, a Hebrew ending (final he or nun) rendered by emphasis with no English word.",
    divides_readings: false,
    governs: census.route["!"].occurrences, routes: census.route["!"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["!"]).map(([k, v]) => [k, v.count])),
    evidence: `${fmt(E("last segment '!' : key ends with he or nun").holds)} of ${fmt(E("last segment '!' : key ends with he or nun").routes)} routes ending on the segment '!' have a key ending in he or nun.`,
  },
  "?": {
    means: "The verse's question mark, carried at the word where the English question ends (or, supplied, in '[?]'). Part of the one reading.",
    divides_readings: false,
    governs: census.route["?"].occurrences, routes: census.route["?"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["?"]).map(([k, v]) => [k, v.count])),
  },
  "¿": {
    means: "The Hebrew interrogative prefix he, given its own segment; no English word.",
    divides_readings: false, annotation: true,
    governs: census.route["¿"].occurrences, routes: census.route["¿"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["¿"]).map(([k, v]) => [k, v.count])),
    evidence: `${fmt(E("first segment '¿' : key begins with he").holds)} of ${fmt(E("first segment '¿' : key begins with he").routes)} routes opening on '¿' have a key beginning with he; ${fmt(E("segments 'and', '¿' : key begins with vav he").holds)} of ${fmt(E("segments 'and', '¿' : key begins with vav he").routes)} opening 'and/ ¿' begin with vav he.`,
  },
  ".": { means: "The abbreviation point of '<obj.>'.", divides_readings: false, governs: census.route["."].occurrences, routes: census.route["."].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["."]).map(([k, v]) => [k, v.count])) },
  "'": { means: "The English possessive, inside one word.", divides_readings: false, governs: census.route["'"].occurrences, routes: census.route["'"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES["'"]).map(([k, v]) => [k, v.count])) },
  ":": { means: "The verse's colon at the word that introduces what follows ('this:'); nothing follows it in the field.", divides_readings: false,
    governs: census.route[":"].occurrences, routes: census.route[":"].rows,
    shapes: Object.fromEntries(Object.entries(SHAPES[":"]).map(([k, v]) => [k, v.count])),
    evidence: ex(":", "colon.route_final", 3) },
  ";": {
    means: "The verse's clause punctuation carried inside one word's rendering; the supplied word after it opens the next clause. One occurrence.",
    divides_readings: false,
    governs: census.route[";"]?.occurrences || 0, routes: census.route[";"]?.rows || 0,
    shapes: Object.fromEntries(Object.entries(SHAPES[";"] || {}).map(([k, v]) => [k, v.count])),
    evidence: `${ex(";", "semicolon.clause_end_before_supplied", 1)}. The piece after it is a supplied bracket alone; ${alt.routes_that_are_only_supplied_brackets} of ${fmt(rows.length)} routes are a supplied bracket alone, and '[surely]' stands before a rendering in ${alt.routes_where_surely_supplied_is_followed_by_a_rendering} of its other ${alt.routes_containing_surely_supplied - 1} routes.`,
    falsifier: "A second ';' in this provider followed by a whole rendering the key's letters carry.",
    open_question: true,
  },
};

// every mark carries evidence (its shapes' own windows where none is written above) and a falsifier
const FALSIFIER = {
  "]": "As '[': and a ']' that closes a span in its own route must close one opened before it there; the 2 that do not are counted under square.close_opened_elsewhere.",
  ">": "As '<': and a '>' that opens nothing is counted under angle.close_opened_nowhere (4), never read as a boundary.",
  "-": "A hyphen with a space on each side (a dash between two clauses or renderings). 0 found: every hyphen falls in one of the five shapes.",
  "!": "A '!' with a second rendering of the same word after it. 0 found: every '!' ends a word or stands alone as a segment.",
  "?": "A '?' with a second rendering of the same word after it. 0 found: every '?' ends the route or a segment, stands before the construct 'of', stands alone as a segment, or sits in '[?]'.",
  "¿": "A '¿' segment on a key that does not begin with he (after an optional vav). 0 of 405.",
  ".": "A '.' outside '<obj.>'. 0 of 113.",
  "'": "An apostrophe used as a quotation mark. 0 of 38.",
  ":": "A ':' with text after it in the route (a head before a list). 0 of 8.",
};
for (const [mark, d] of Object.entries(markDecl)) {
  if (!d.evidence) d.evidence = Object.entries(SHAPES[mark] || {}).sort((x, y) => y[1].count - x[1].count).map(([k, v]) => `${k} ${v.count}: ${v.examples[0]}`).join(" ; ");
  if (!d.falsifier) d.falsifier = FALSIFIER[mark];
}

const declaration = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  providers: {
    [SOURCE_KEY]: {
      label: censusOut.label,
      m_ids: Object.keys(mIds),
      routes: rows.length,
      declared_on: "2026-10-31",
      declared_from: `The record's own structure, read across all ${fmt(rows.length)} routes on ${fmt(keys.size)} keys. Route equals definition in ${fmt(routeEqDef)} of ${fmt(rows.length)}: each record is one aligned English rendering of one Hebrew word at one place, and a key's alternatives are separate routes (most on one key: ${Math.max(...perKey)}). ${alt.routes_with_a_comma} routes carry a comma, ${alt.routes_with_a_parenthesis} a parenthesis, ${alt.routes_with_a_semicolon} a semicolon. ${fmt(census.route["/"].rows)} routes (${share(census.route["/"].rows, rows.length)}) carry '/', which segments one rendering in the Hebrew word's own order. Every one of the ${fmt(Object.values(census.route).reduce((a, x) => a + x.occurrences, 0))} mark occurrences falls in exactly one of ${Object.values(SHAPES).reduce((a, x) => a + Object.keys(x).length, 0)} shapes; ${unexplainedTotal} unexplained. The inventory's closed set (${invM.mark_count} marks) agrees mark for mark.`,
      regions: { meaning_depends_on_region: {}, note: censusOut.structure.regions },
      marks: markDecl,
      precedence: [],
      precedence_note: "No mark divides readings in this provider, so there is no order to apply. '/' segments a reading for print and is applied last, after any division a later ruling adds.",
      refusals: {
        unbalanced_square_brackets: { rows: rows.filter((r) => [...r.route].filter((c) => c === "[").length !== [...r.route].filter((c) => c === "]").length).length, rule: "ship whole; a supplied span straddling two words is the provider's, not damage to repair" },
        unbalanced_angle_brackets: { rows: rows.filter((r) => [...r.route].filter((c) => c === "<").length !== [...r.route].filter((c) => c === ">").length).length, rule: "ship whole, as written" },
      },
      export: "governed by its posture, cc_by_4_0",
      separates_on: null,
      segments_on: {
        mark: "/",
        rule: "Inside one reading, '/' bounds the English of each segment of the Hebrew word. Every segment is a run of the provider's own characters and the segments rejoin to the route with the slashes that divided them. Segments are pieces of one reading, never readings, and are never reordered into English order.",
        governs: census.route["/"].rows,
      },
      not_done_here: "No segment is reordered ('father/ your' is not turned into 'your father'), no bracket or sign is stripped, no supplied or dropped word is removed or added, and no word cut across two Hebrew words is joined to its other half in a neighbor's route. Each would join or discard pieces the provider wrote apart, which is a derivation.",
    },
  },
};
writeFileSync(join(HERE, "declaration.json"), JSON.stringify(declaration, null, 1) + "\n");

// ---------------------------------------------------------------- the declaration run through the one machine, in memory only
// declarations-v1.json is not touched: the machine's exported object gets this provider for the length of this process.
DECLARATIONS.providers[SOURCE_KEY] = declaration.providers[SOURCE_KEY];
const merged = { rows: 0, whole: 0, separated: 0, refused: 0, rows_with_an_undeclared_mark: 0, readings_equal_declaration_division: 0 };
for (const r of rows) {
  const out = readingOf(r.route, r.def, SOURCE_KEY);
  merged.rows += 1;
  if (out.region === "whole") merged.whole += 1; else merged.separated += 1;
  if (out.refused) merged.refused += 1;
  if (out.unknownMarks.length) merged.rows_with_an_undeclared_mark += 1;
  const d = declReadings(r.route); const m = out.readings.map((x) => x.trim());
  if (m.length === d.length && m.every((x, i) => x === d[i])) merged.readings_equal_declaration_division += 1;
}
delete DECLARATIONS.providers[SOURCE_KEY];
censusOut.machine_with_this_declaration = merged;
writeFileSync(join(HERE, "census.json"), JSON.stringify(censusOut, null, 1) + "\n");
console.log("merged", JSON.stringify(merged));

console.log(JSON.stringify({ rows: rows.length, routeEqDef, keys: keys.size, unexplainedTotal, UNEXPLAINED, cmp, alone, machine: { same: machine.same_as_declaration, differs: machine.differs }, evidence: Object.fromEntries(Object.entries(evidence).map(([k, v]) => [k, `${v.holds}/${v.routes}`])), alt, sqClass, slashSpacing, pageJoinChanges, pageJoinDropsEmpty }, null, 1));
for (const m of marksOut) console.log(m.mark, m.route_text.occurrences, m.inventory?.agrees, m.every_occurrence_in_one_shape, m.shapes.map((s) => `${s.shape}=${s.count}`).join(" "), "unexpl", m.unexplained);

// ---------------------------------------------------------------- sign-only segments against the page's signs switch
// zone.html signOnly (line 2970), copied verbatim
const signOnly = (t) => /^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$/u.test(String(t).trim());
const signSeg = {};
for (const r of rows) {
  if (!r.route.includes("/")) continue;
  const seen = new Set();
  for (const seg of r.route.split("/").map((x) => x.trim()).filter(Boolean)) {
    if (/[\p{L}\p{N}]/u.test(seg.replace(/<[^>]*>|\[[^\]]*\]/gu, "")) && !/^(<[^>]*>|\[[^\]]*\])$/u.test(seg)) continue;
    const kind = seg === "!" ? "!" : seg === "?" ? "?" : seg === "¿" ? "¿" : seg === "-" ? "-" : /^<[^>]*>$/u.test(seg) ? "<...>" : /^\[[^\]]*\]$/u.test(seg) ? "[...]" : `other:${seg}`;
    if (seen.has(kind)) continue; seen.add(kind);
    const e = (signSeg[kind] ||= { routes: 0, page_signOnly_matches: 0 });
    e.routes += 1; if (signOnly(seg)) e.page_signOnly_matches += 1;
  }
}
const sq = (o, c) => rows.filter((r) => [...r.route].filter((x) => x === o).length !== [...r.route].filter((x) => x === c).length).length;
const oq = [
  {
    question: "Is TAHOT's one ';' (פלט, 'deliverance; [surely]') clause punctuation inside one reading, or a boundary between two readings?",
    reading_a: { rule: "one reading, shipped whole (this declaration)", routes: census.route[";"]?.rows || 0 },
    reading_b: { rule: "two readings, 'deliverance' and '[surely]' (today's engine, packSplit)", routes: cmp.v3_divides_where_declaration_keeps_whole },
    what_the_data_says: `${alt.routes_where_surely_supplied_is_followed_by_a_rendering} of the other ${alt.routes_containing_surely_supplied - 1} routes carrying '[surely]' have a rendering after it; ${alt.routes_that_are_only_supplied_brackets} of ${rows.length} routes are a supplied bracket alone. One occurrence cannot settle a convention.`,
  },
  {
    question: "Are the '/' segments only printed joined (' + '), or do they also stand as separable pieces of the one reading under their Hebrew segments (the RMD '+' pieces)?",
    reading_a: { rule: "one reading, printed joined with ' + ' (today's spanJoin; this declaration's segments_on)", routes: census.route["/"].rows },
    reading_b: { rule: "one reading whose segments are also pieces, each a run of the provider's characters placed under its Hebrew segment; still never a reading of the whole word", routes: census.route["/"].rows, boundaries: census.route["/"].occurrences },
    what_the_data_says: "The segments align with the key's prefixes and suffixes (see segment_alignment_evidence); either reading is a separation, not a derivation. This is a page design ruling, not a reading of the data.",
  },
  {
    question: "Is a segment that is '!' or '?' alone a sign (undrawn when the signs switch is off, as '¿' and '<...>' segments are) or text (always drawn)?",
    reading_a: { rule: "a sign: the Hebrew ending carries no English word", routes: (signSeg["!"]?.routes || 0) + (signSeg["?"]?.routes || 0) },
    reading_b: { rule: "text, drawn as '+ !' (what the page does today)", routes: (signSeg["!"]?.routes || 0) + (signSeg["?"]?.routes || 0) },
    what_the_data_says: `The page's signOnly treats ${(signSeg["!"]?.page_signOnly_matches || 0) + (signSeg["?"]?.page_signOnly_matches || 0)} of these as signs today; it does treat '¿' (${signSeg["¿"]?.page_signOnly_matches || 0} of ${signSeg["¿"]?.routes || 0} routes) and a lone '<...>' (${signSeg["<...>"]?.page_signOnly_matches || 0} of ${signSeg["<...>"]?.routes || 0}) as signs. Also unlisted: a segment of two brackets and no other word ('[is] <to>', ${Object.entries(signSeg).filter(([k]) => k.startsWith("other:")).reduce((a2, [, v]) => a2 + v.routes, 0)} routes) and the maqaf segment '-' (${signSeg["-"]?.routes || 0}).`,
    sign_only_segments: signSeg,
  },
  {
    question: "Are unbalanced brackets the provider's text (a supplied span straddling two Hebrew words; a stray '>') to print as written, or damage to hold back as today's engine holds back unbalanced parentheses?",
    reading_a: { rule: "print as written (this declaration, and today's engine, whose damage rule reads only '(' and ')')", routes: sq("[", "]") + sq("<", ">") },
    reading_b: { rule: "hold back as damaged", routes: sq("[", "]") + sq("<", ">") },
    detail: { square_open_continues_elsewhere: SHAPES["["]["square.open_continues_elsewhere"]?.routes.size || 0, square_close_opened_elsewhere: SHAPES["]"]["square.close_opened_elsewhere"]?.routes.size || 0, angle_close_opened_nowhere: SHAPES[">"]["angle.close_opened_nowhere"]?.routes.size || 0,
      examples: [...(SHAPES["["]["square.open_continues_elsewhere"]?.examples || []).slice(0, 2), ...(SHAPES["]"]["square.close_opened_elsewhere"]?.examples || []).slice(0, 1), ...(SHAPES[">"]["angle.close_opened_nowhere"]?.examples || []).slice(0, 1)] },
  },
];
censusOut.sign_only_segments = signSeg;
censusOut.open_questions_for_owner = oq;
declaration.providers[SOURCE_KEY].open_questions = oq.map((q) => q.question);
writeFileSync(join(HERE, "census.json"), JSON.stringify(censusOut, null, 1) + "\n");
writeFileSync(join(HERE, "declaration.json"), JSON.stringify(declaration, null, 1) + "\n");
console.log("signSeg", JSON.stringify(signSeg));
console.log("oq", JSON.stringify(oq.map((q) => [q.reading_a.routes, q.reading_b.routes])));
