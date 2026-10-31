#!/usr/bin/env node
// Mark ledger pilot · openscriptures_bdb_1906 (M5) · 2026-10-31
//
// One script, one provider file, one process. It reads the provider's routes,
// takes the closed mark set from today's inventory, confirms it from the route
// text and (separately) from the definition text, classifies every mark
// occurrence in the route text into exactly one shape (first test that holds,
// in the order SHAPES lists them), divides each route by this declaration,
// divides the same text by today's engine (sense-split-rule-v3), and writes
// census.json, declaration.json and changes-vs-v3.jsonl beside itself.
// Every number in those files is computed here.
//
// usage: node ledger.mjs <by-source/openscriptures_bdb_1906.jsonl> <mark-inventory.json> <sense-split-v1.mjs>

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const [ROUTES, INVENTORY, SENSE_SPLIT] = process.argv.slice(2);
if (!ROUTES || !INVENTORY || !SENSE_SPLIT) { console.error("usage: node ledger.mjs <routes.jsonl> <mark-inventory.json> <sense-split-v1.mjs>"); process.exit(2); }
const { senseSplit, RULE_ID: V3_RULE } = await import(pathToFileURL(SENSE_SPLIT).href);

const SOURCE_KEY = "openscriptures_bdb_1906";
const M_IDS = ["M5"];
const W = 60; // quote window
const win = (s) => (s.length <= W ? s : s.slice(0, W - 1) + "…");
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const cp = (c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");

const rows = readFileSync(ROUTES, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

// ---------------------------------------------------------------- regions
// Where the route sits in the provider's definition: the whole definition, or
// a slice of it at parenthesis/bracket depth zero (the entry's own senses,
// stem paragraphs and quoted renderings), inside the definition's parentheses
// (root etymology with cognate glosses, a proper name's meaning), or inside its
// square brackets. First occurrence; the store does not say which occurrence.
const regionOf = (R, D) => {
  if (R === D) return "whole";
  const i = D.indexOf(R);
  if (i < 0) return "absent";
  let p = 0, b = 0;
  for (const c of D.slice(0, i)) {
    if (c === "(") p += 1; else if (c === ")") p = Math.max(0, p - 1);
    else if (c === "[") b += 1; else if (c === "]") b = Math.max(0, b - 1);
  }
  return p ? "def_parentheses" : b ? "def_brackets" : "def_top";
};

// ---------------------------------------------------------------- structure
const depthAt = (R, i) => { let d = 0; for (let k = 0; k < i; k += 1) { if (R[k] === "(") d += 1; else if (R[k] === ")" && d > 0) d -= 1; } return d; };
/** depth-zero spans divided by `mark` inside [a, z) */
const spans = (R, mark, a = 0, z = R.length) => {
  const out = []; let s = a, d = 0;
  for (let i = a; i < z; i += 1) {
    const c = R[i];
    if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; }
    else if (c === mark && d === 0) { out.push([s, i]); s = i + 1; }
  }
  out.push([s, z]);
  return out;
};
const sensesOf = (R) => spans(R, ";");
const senseAt = (R, i) => sensesOf(R).find(([a, z]) => i >= a && i <= z);
const piecesOf = (R, [a, z]) => spans(R, ",", a, z).map(([x, y]) => R.slice(x, y).trim());

// A rendering written as a sentence or a quotation of the verse, not a list of
// glosses: a pronoun or finite-verb word from this closed list, a comma piece
// that opens on "and", a field that opens on a capital (a name, a vocative,
// an interjection), or a capitalized word inside a piece (a name inside a
// clause). Read from all 310 comma routes; "which" is left out on purpose
// ("that which veils, conceals, hides" is a gloss list).
const CLAUSE_WORDS = ["I", "me", "my", "mine", "thee", "thou", "thy", "thine", "he", "him", "his", "himself", "she", "her", "it", "its", "we", "us", "our", "ye", "you", "your", "they", "them", "their", "who", "whom", "whose", "doth", "hath", "didst", "dost", "shalt", "wilt", "shall", "will", "let", "pray", "yea", "oh", "were", "was", "is", "are"];
const CLAUSE = new RegExp(`(^|[^\\p{L}])(${CLAUSE_WORDS.join("|")})(?![\\p{L}])`, "iu");
const sentenceWhy = (text) => {
  const pieces = spans(text, ",").map(([a, z]) => text.slice(a, z).trim());
  const why = [];
  const m = text.match(CLAUSE); if (m) why.push(`word "${m[2]}"`);
  if (pieces.slice(1).some((p) => /^and(?!\p{L})/iu.test(p))) why.push("a piece opens on \"and\"");
  if (/^\p{Lu}/u.test(text.trim())) why.push("opens on a capital");
  if (pieces.some((p) => p.split(/\s+/u).slice(1).some((w) => /^\p{Lu}/u.test(w)))) why.push("a capitalized word inside a piece");
  return why;
};
// A head word on the first gloss that the later glosses leave unsaid:
// "be fatigued, tired" is be fatigued, (be) tired.
const HEADS = ["be", "become", "to", "make", "one", "that", "a", "an", "the"];
const headCarried = (pieces) => {
  const w = pieces[0].split(/\s+/u);
  if (w.length < 2 || !HEADS.includes(w[0].toLowerCase())) return false;
  return pieces.slice(1).some((p) => p.split(/\s+/u)[0].toLowerCase() !== w[0].toLowerCase());
};
const ABBREV = ["fr", "id", "instr", "obj", "covt", "Isr", "mt", "mts", "D"];
const wordBefore = (R, i) => (R.slice(0, i).match(/(\p{L}+)$/u) || [, ""])[1];
const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
const nextPiece = (R, i) => { const s = senseAt(R, i); const sp = spans(R, ",", s[0], s[1]).find(([a]) => a === i + 1); return sp ? R.slice(sp[0], sp[1]).trim() : ""; };
const matchOpen = (R, i) => { let d = 0; for (let k = i; k >= 0; k -= 1) { if (R[k] === ")") d += 1; else if (R[k] === "(") { d -= 1; if (d === 0) return k; } } return -1; };
const parenShape = (R, o) => {
  const close = R.indexOf(")", o);
  const inner = R.slice(o + 1, close);
  if (isLetter(R[o - 1])) return "optional_letters";
  if (/^\p{Lu}/u.test(inner)) return "label";
  return "supplied_word";
};

// ---------------------------------------------------------------- shapes
// For each mark the first test that holds names the shape. Every shape carries
// what the mark means there, whether a reader would see two readings on its
// two sides (divides), and the test in words.
const SHAPES = [
  // ";" ------------------------------------------------------------
  { id: "semicolon.between_senses", mark: ";", divides: true,
    means: "ends one sense and opens the next in one gloss field, as BDB divides senses",
    test: "a ';' at parenthesis depth zero followed by a space",
    fn: ({ R, i, d }) => d === 0 && /\s/u.test(R[i + 1] || "") },
  { id: "semicolon.other", mark: ";", divides: false,
    means: "a semicolon in any other position; held whole",
    test: "any ';' the first test does not take", fn: () => true },
  // "," ------------------------------------------------------------
  { id: "comma.inside_parentheses", mark: ",", divides: false,
    means: "a comma inside the provider's parentheses, notation inside one reading",
    test: "a ',' at parenthesis depth one or more", fn: ({ d }) => d > 0 },
  { id: "comma.trailing", mark: ",", divides: false,
    means: "the comma that followed this gloss in the source, carried into the route where it was cut from the next gloss; nothing follows it",
    test: "a ',' that is the last character of the route", fn: ({ R, i }) => R.slice(i + 1).trim() === "" },
  { id: "comma.no_space_after", mark: ",", divides: false,
    means: "two glosses written with no space after the comma; the separation could not rejoin on the declared ', ' so the field is held whole",
    test: "a ',' followed directly by a non-space character", fn: ({ R, i }) => !/\s/u.test(R[i + 1]) },
  { id: "comma.in_sentence", mark: ",", divides: false,
    means: "punctuation inside one rendered sentence: a quoted verse, a name's meaning, a list of names in one clause",
    test: "the comma's sense is sentence-shaped: it holds a pronoun or finite-verb word from the closed CLAUSE list, or a comma piece opens on 'and', or it opens on a capital, or a piece has a capitalized word after its first",
    fn: ({ R, i }) => { const [a, z] = senseAt(R, i); return sentenceWhy(R.slice(a, z)).length > 0; } },
  { id: "comma.before_bound_suffix", mark: ",", divides: false,
    means: "the next piece is a bound second element ('-woman') that attaches to the stem of the gloss before it; dividing would print a hyphen-led fragment",
    test: "the piece after the comma begins with '-'", fn: ({ R, i }) => nextPiece(R, i).startsWith("-") },
  { id: "comma.before_open_possessive", mark: ",", divides: false,
    means: "the next piece is a possessive whose noun stands outside the route ('hornets'' of 'hornets' or bees' nest'); dividing would print a possessive with no noun",
    test: "the piece after the comma ends with an apostrophe (' or ’)", fn: ({ R, i }) => /['’]$/u.test(nextPiece(R, i)) },
  { id: "comma.between_glosses_after_head_word", mark: ",", divides: true,
    means: "separates one gloss from the next where the first gloss opens on a head word (be, make, to, one, that …) the later glosses do not repeat: sometimes the head is carried ('be fatigued, tired' is be fatigued, be tired), sometimes the later gloss stands alone ('be bright, shine')",
    test: "a ',' at depth zero followed by a space in a gloss list (no earlier comma test holds) whose first piece has two or more words, the first in HEADS, and some later piece does not open on that word",
    fn: ({ R, i }) => headCarried(piecesOf(R, senseAt(R, i))) },
  { id: "comma.between_glosses", mark: ",", divides: true,
    means: "separates one gloss from the next: alternative English renderings the source wrote in one gloss run",
    test: "a ',' at depth zero followed by a space in a field no earlier comma test takes",
    fn: ({ R, i, d }) => d === 0 && /\s/u.test(R[i + 1]) },
  // "-" ------------------------------------------------------------
  { id: "hyphen.compound_join", mark: "-", divides: false,
    means: "joins two parts into one English word or one transliterated name (threshing-floor, Hā-Rāphā, (he)-ass)",
    test: "a '-' with a letter or ')' before it and a letter after it",
    fn: ({ R, i }) => (isLetter(R[i - 1]) || R[i - 1] === ")") && isLetter(R[i + 1]) },
  { id: "hyphen.suspended_first_part", mark: "-", divides: false,
    means: "the first element of a hyphenated compound whose second element stands outside the route ('resting-' of 'resting- or dwelling-place')",
    test: "a '-' with a letter before it that ends the route", fn: ({ R, i }) => isLetter(R[i - 1]) && i === R.length - 1 },
  { id: "hyphen.bound_second_part", mark: "-", divides: false,
    means: "the second element of a compound whose first element stands outside the route or in the gloss before it ('-place' of 'lodging (-place)', '-woman' of 'freed-man, -woman')",
    test: "a '-' at the start of the route or after a space, with a letter after it", fn: ({ R, i }) => (i === 0 || /\s/u.test(R[i - 1])) && isLetter(R[i + 1]) },
  // "(" ")" --------------------------------------------------------
  { id: "paren.optional_letters", mark: "(", divides: false,
    means: "letters that may be read or left off one word: be(come), place(s), Yah(u)",
    test: "a '(' with a letter immediately before it", fn: ({ R, i }) => parenShape(R, i) === "optional_letters" },
  { id: "paren.label", mark: "(", divides: false,
    means: "a note on the rendering, not part of it: (Aramaism)",
    test: "a '(' at the start or after a space whose content opens on a capital", fn: ({ R, i }) => parenShape(R, i) === "label" },
  { id: "paren.supplied_word", mark: "(", divides: false,
    means: "a word the one rendering may be read with or without: supplied, optional or alternative (spiced (oil), the (true) God, there is (was) not)",
    test: "a '(' at the start or after a space whose content opens lowercase", fn: ({ R, i }) => parenShape(R, i) === "supplied_word" },
  { id: "paren_close.optional_letters", mark: ")", divides: false, means: "closes optional letters", test: "a ')' whose opener is paren.optional_letters",
    fn: ({ R, i }) => parenShape(R, matchOpen(R, i)) === "optional_letters" },
  { id: "paren_close.label", mark: ")", divides: false, means: "closes a note on the rendering", test: "a ')' whose opener is paren.label",
    fn: ({ R, i }) => parenShape(R, matchOpen(R, i)) === "label" },
  { id: "paren_close.supplied_word", mark: ")", divides: false, means: "closes a supplied or optional word", test: "a ')' whose opener is paren.supplied_word",
    fn: ({ R, i }) => matchOpen(R, i) >= 0 && parenShape(R, matchOpen(R, i)) === "supplied_word" },
  // "!" "?" --------------------------------------------------------
  { id: "exclamation.final", mark: "!", divides: false,
    means: "the rendering is an exclamation or a wish; it ends the one reading (O that!, how is the gold dimmed!)",
    test: "a '!' that is the last character of the route", fn: ({ R, i }) => i === R.length - 1 },
  { id: "question.final", mark: "?", divides: false,
    means: "the rendering is a question; it ends the one reading (Where?, Who is like God?)",
    test: "a '?' that is the last character of the route", fn: ({ R, i }) => i === R.length - 1 },
  { id: "question.before_second_question", mark: "?", divides: false,
    means: "ends one interrogative rendering and a second follows in the same field with no separator but a space (by means of what? how?)",
    test: "a '?' followed by a space and more text", fn: ({ R, i }) => /\s/u.test(R[i + 1] || "") && R.slice(i + 1).trim() !== "" },
  // "’" "'" "‘" ----------------------------------------------------
  { id: "apostrophe_curly.possessive", mark: "’", divides: false,
    means: "English possessive inside one word: husband’s, one’s",
    test: "a '’' after a letter, followed by 's' and then no letter", fn: ({ R, i }) => isLetter(R[i - 1]) && R[i + 1] === "s" && !isLetter(R[i + 2]) },
  { id: "apostrophe_curly.closing_quote", mark: "’", divides: false,
    means: "closes a quoted rendering opened by ‘ in the same route",
    test: "a '’' at the end of the route with a '‘' earlier in it", fn: ({ R, i }) => i === R.length - 1 && R.slice(0, i).includes("‘") },
  { id: "apostrophe_curly.aleph_sign", mark: "’", divides: false,
    means: "the transliteration sign for aleph inside a transliterated Hebrew word: ’Abaddôn, Shᵉ’ōl",
    test: "a '’' with a letter after it (any '’' the possessive test does not take)", fn: ({ R, i }) => isLetter(R[i + 1]) },
  { id: "apostrophe.possessive_singular", mark: "'", divides: false,
    means: "English possessive inside one word: one's, wife's",
    test: "a ''' after a letter, followed by 's' and then no letter", fn: ({ R, i }) => isLetter(R[i - 1]) && R[i + 1] === "s" && !isLetter(R[i + 2]) },
  { id: "apostrophe.possessive_plural", mark: "'", divides: false,
    means: "English plural possessive at a word's end: bees' nest",
    test: "a ''' after 's' with no letter after it", fn: ({ R, i }) => R[i - 1] === "s" && !isLetter(R[i + 1]) },
  { id: "quote_open.quoted_rendering", mark: "‘", divides: false,
    means: "opens a rendering quoted as a phrase, closed by ’ in the same route",
    test: "a '‘' at the start of the route with a '’' at its end", fn: ({ R, i }) => i === 0 && R.endsWith("’") },
  // "." -------------------------------------------------------------
  { id: "period.ellipsis_ascii", mark: ".", divides: false,
    means: "one of three dots standing for words left out of one quoted rendering (to them ... shall be delight)",
    test: "a '.' that is part of a run of three '.'", fn: ({ R, i }) => /\.\.\./u.test(R.slice(Math.max(0, i - 2), i + 3)) },
  { id: "period.abbreviation", mark: ".", divides: false,
    means: "ends one of BDB's abbreviations inside the rendering: fr., id., instr., obj., covt., Isr., mt., mts., D.",
    test: "a '.' right after a word in the closed ABBREV list", fn: ({ R, i }) => ABBREV.includes(wordBefore(R, i)) },
  { id: "period.final", mark: ".", divides: false,
    means: "the full stop ending a rendering written as a sentence (security.)",
    test: "a '.' that is the last character of the route after a word not in ABBREV", fn: ({ R, i }) => i === R.length - 1 },
  { id: "period.mid_after_word", mark: ".", divides: false,
    means: "a stop after a whole word inside the field, before a second form of the same gloss (strip. strip off); the source likely meant a comma",
    test: "a '.' after a word not in ABBREV, followed by a space and more text", fn: ({ R, i }) => isLetter(R[i - 1]) && /\s/u.test(R[i + 1] || "") },
  // the rest ----------------------------------------------------------
  { id: "ayin_sign.in_transliteration", mark: "‛", divides: false,
    means: "the transliteration sign for ayin inside a transliterated Hebrew name: ‛Arḳa, Sē‛ir, Gilboa‛",
    test: "a '‛' with a letter on at least one side", fn: ({ R, i }) => isLetter(R[i - 1]) || isLetter(R[i + 1]) },
  { id: "caron.on_transliterated_vowel", mark: "̌", divides: false,
    means: "a combining caron on a vowel of a transliterated Hebrew letter name (Dā̌leth)",
    test: "U+030C after a letter or a combining mark", fn: ({ R, i }) => i > 0 },
  { id: "geresh.divine_name_abbreviation", mark: "׳", divides: false,
    means: "BDB's abbreviation of the divine name inside an English rendering (unto י׳ are mine eyes)",
    test: "a '׳' right after a Hebrew letter", fn: ({ R, i }) => /[א-ת]/u.test(R[i - 1] || "") },
  { id: "ellipsis.gap_in_phrase", mark: "…", divides: false,
    means: "stands for the words the phrase takes in context (one … another, from … even to, If only …!); one reading",
    test: "a '…' with a space before it", fn: ({ R, i }) => /\s/u.test(R[i - 1] || "") },
  { id: "ampersand.and_inside_gloss", mark: "&", divides: false,
    means: "'and' inside one gloss (turn this way & that, fear & object of fear)",
    test: "a '&' with a space on both sides", fn: ({ R, i }) => /\s/u.test(R[i - 1] || "") && /\s/u.test(R[i + 1] || "") },
];
const SHAPES_BY_MARK = new Map();
for (const s of SHAPES) { if (!SHAPES_BY_MARK.has(s.mark)) SHAPES_BY_MARK.set(s.mark, []); SHAPES_BY_MARK.get(s.mark).push(s); }

// ---------------------------------------------------------------- census
const inv = JSON.parse(readFileSync(INVENTORY, "utf8"));
const invEntries = inv.providers.filter((p) => M_IDS.includes(p.provider));
const invMarks = new Map();
for (const e of invEntries) for (const m of e.marks) invMarks.set(m.mark, { occurrences: (invMarks.get(m.mark)?.occurrences || 0) + m.occurrences, routes: (invMarks.get(m.mark)?.routes || 0) + m.routes_carrying_it });

const routeMarks = new Map(); // mark -> {occ, routes}
const defMarksRows = new Map(); // over every row's definition
const defMarksDistinct = new Map(); // over distinct definitions
const seenDefs = new Set();
const bump = (map, c, n, r) => { const e = map.get(c) || { occurrences: 0, carrying: 0 }; e.occurrences += n; e.carrying += r; map.set(c, e); };
const count = (s) => { const m = new Map(); for (const c of s) if (isMark(c)) m.set(c, (m.get(c) || 0) + 1); return m; };

const regionTotals = {};
const shapeCount = new Map(); // id -> occurrences
const shapeRoutes = new Map(); // id -> Set(route index)
const shapeRegion = new Map(); // id -> {region: n}
const shapeExamples = new Map(); // id -> [key | window]
const unexplained = [];
const perRoute = []; // per route index: [{i, mark, shape}]

rows.forEach((r, idx) => {
  const R = r.route, D = r.def;
  const rm = count(R); for (const [c, n] of rm) bump(routeMarks, c, n, 1);
  const dm = count(D); for (const [c, n] of dm) bump(defMarksRows, c, n, 1);
  if (!seenDefs.has(D)) { seenDefs.add(D); for (const [c, n] of dm) bump(defMarksDistinct, c, n, 1); }
  const region = regionOf(R, D);
  regionTotals[region] = (regionTotals[region] || 0) + 1;
  const occ = [];
  for (let i = 0; i < R.length; i += 1) {
    const c = R[i];
    if (!isMark(c)) continue;
    const list = SHAPES_BY_MARK.get(c) || [];
    const ctx = { R, i, d: depthAt(R, i) };
    const s = list.find((x) => x.fn(ctx));
    if (!s) { unexplained.push({ key: r.key, mark: c, at: i, route: win(R) }); occ.push({ i, mark: c, shape: null }); continue; }
    occ.push({ i, mark: c, shape: s.id });
    shapeCount.set(s.id, (shapeCount.get(s.id) || 0) + 1);
    if (!shapeRoutes.has(s.id)) shapeRoutes.set(s.id, new Set());
    shapeRoutes.get(s.id).add(idx);
    const reg = shapeRegion.get(s.id) || {}; reg[region] = (reg[region] || 0) + 1; shapeRegion.set(s.id, reg);
    const ex = shapeExamples.get(s.id) || [];
    if (ex.length < 8 && !ex.some((e) => e.startsWith(r.key + " | " + win(R)))) ex.push(`${r.key} | ${win(R)}`);
    shapeExamples.set(s.id, ex);
  }
  perRoute[idx] = occ;
});

// ---------------------------------------------------------------- division
// The declaration's division: a route divides at a semicolon of shape
// semicolon.between_senses, and inside each sense at its commas only when
// every comma in that sense is of a dividing shape. Pieces are runs of the
// provider's own characters and must rejoin, character for character.
const DIVIDING = new Set(SHAPES.filter((s) => s.divides).map((s) => s.id));
let mixedSenses = 0;
const declDivide = (R, occ) => {
  const shapeAt = new Map(occ.map((o) => [o.i, o.shape]));
  const semis = occ.filter((o) => o.mark === ";" && DIVIDING.has(o.shape)).map((o) => o.i);
  const senseBounds = []; let s = 0;
  for (const i of semis) { senseBounds.push([s, i]); s = i + 1; }
  senseBounds.push([s, R.length]);
  const cuts = []; // [a, z, sepAfter]
  for (const [a, z] of senseBounds) {
    const commas = occ.filter((o) => o.mark === "," && o.i >= a && o.i < z);
    const allDivide = commas.length > 0 && commas.every((o) => DIVIDING.has(o.shape));
    if (commas.length && !allDivide && commas.some((o) => DIVIDING.has(o.shape))) mixedSenses += 1;
    if (!allDivide) { cuts.push([a, z]); continue; }
    let x = a;
    for (const o of commas) { cuts.push([x, o.i]); x = o.i + 1; }
    cuts.push([x, z]);
  }
  const pieces = cuts.map(([a, z]) => R.slice(a, z).trim()).filter(Boolean);
  // rejoin: the pieces in order, with the provider's own separators between them, are the route
  let rebuilt = ""; let ok = true;
  { let pos = 0; for (const [a, z] of cuts) { rebuilt += R.slice(pos, z); pos = z; } rebuilt += R.slice(pos); ok = rebuilt === R; }
  for (const p of pieces) if (!/[\p{L}\p{N}]/u.test(p)) ok = false; // a piece of marks only is no reading
  if (!ok) return { readings: [R], refused: true };
  return { readings: pieces.length ? pieces : [R], refused: false };
};
// Today's engine: the engine's own semicolon split (reader/engine-*.js,
// `const senseSplit = (text)`: ';' at depth zero, orphan ')' inert, rejoin or
// whole), then the shared tool's comma rule on each sense (sense-split-v1.mjs
// senseSplit), a damaged sense held whole.
const engineSemicolons = (text) => {
  const t = String(text || ""); const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
const v3Divide = (R) => engineSemicolons(R).flatMap((s) => { const r = senseSplit(s); return r.damaged ? [s] : r.readings; });
const v3ToolOnly = (R) => { const r = senseSplit(R); return r.damaged ? [R] : r.readings; };

const cmp = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, both_whole_but_v3_prints_other_text: 0 };
const cmpEx = { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [], both_whole_but_v3_prints_other_text: [] };
const cmpByShape = {}; // disagreement kind -> {comma shape: routes}
const changes = [];
const kindOf = [];
let declDivides = 0, declReadings = 0, v3Divides = 0, v3Readings = 0, refusedRejoin = 0, toolOnlyDiffers = 0;
const sameArr = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);
rows.forEach((r, idx) => {
  const R = r.route;
  const dec = declDivide(R, perRoute[idx]);
  if (dec.refused) refusedRejoin += 1;
  const v3 = v3Divide(R);
  if (!sameArr(v3, v3ToolOnly(R))) toolOnlyDiffers += 1;
  cmp.fields_compared += 1;
  if (dec.readings.length > 1) declDivides += 1; declReadings += dec.readings.length;
  if (v3.length > 1) v3Divides += 1; v3Readings += v3.length;
  let kind;
  if (sameArr(dec.readings, v3)) kind = "same_division";
  else if (dec.readings.length === 1 && v3.length > 1) kind = "v3_divides_where_declaration_keeps_whole";
  else if (v3.length === 1 && dec.readings.length > 1) kind = "declaration_divides_where_v3_keeps_whole";
  else if (v3.length === 1 && dec.readings.length === 1) kind = "both_whole_but_v3_prints_other_text";
  else kind = "divided_differently";
  cmp[kind] += 1;
  kindOf[idx] = kind;
  if (kind !== "same_division") {
    const commaShapes = [...new Set(perRoute[idx].filter((o) => o.mark === "," || o.mark === ";").map((o) => o.shape))].join("+") || "(no comma)";
    cmpByShape[kind] ||= {}; cmpByShape[kind][commaShapes] = (cmpByShape[kind][commaShapes] || 0) + 1;
    const line = { key: r.key, route: win(R), kind, shapes: commaShapes, declaration: dec.readings.map(win), v3: v3.map(win) };
    changes.push(line);
    if (cmpEx[kind].length < 6) cmpEx[kind].push(`${r.key} | ${win(R)} | declaration ${dec.readings.length} reading${dec.readings.length > 1 ? "s" : ""} · v3 ${v3.length}: ${v3.map((x) => `"${win(x)}"`).join(" / ")}`);
  }
});

// ---------------------------------------------------------------- side measures
const commaRouteIdx = rows.map((r, i) => (r.route.includes(",") ? i : -1)).filter((i) => i >= 0);
const glossShapes = new Set(["comma.between_glosses", "comma.between_glosses_after_head_word"]);
const glossRouteIdx = commaRouteIdx.filter((i) => perRoute[i].some((o) => glossShapes.has(o.shape)));
const glossByRegion = {}; for (const i of glossRouteIdx) { const g = regionOf(rows[i].route, rows[i].def); glossByRegion[g] = (glossByRegion[g] || 0) + 1; }
// a gloss list whose first piece begins mid-gloss: the definition has " or " right before the route
const startsAfterOr = glossRouteIdx.filter((i) => { const D = rows[i].def, k = D.indexOf(rows[i].route); return k >= 4 && D.slice(k - 4, k) === " or "; });
const headCarriedIdx = rows.map((r, i) => (perRoute[i].some((o) => o.shape === "comma.between_glosses_after_head_word") ? i : -1)).filter((i) => i >= 0);
// counted per sense: only the senses whose commas are head-carried
const headSenses = headCarriedIdx.flatMap((i) => { const R = rows[i].route; return sensesOf(R).filter(([a, z]) => perRoute[i].some((o) => o.shape === "comma.between_glosses_after_head_word" && o.i >= a && o.i < z)).map((sp) => piecesOf(R, sp)); });
const headWordCounts = {}; for (const p of headSenses) { const w = p[0].split(/\s+/u)[0].toLowerCase(); headWordCounts[w] = (headWordCounts[w] || 0) + 1; }
const headPiecesPrintedBare = headSenses.reduce((t, p) => { const h = p[0].split(/\s+/u)[0].toLowerCase(); return t + p.slice(1).filter((x) => x.split(/\s+/u)[0].toLowerCase() !== h).length; }, 0);
const headPiecesKeepingHead = headSenses.reduce((t, p) => { const h = p[0].split(/\s+/u)[0].toLowerCase(); return t + p.slice(1).filter((x) => x.split(/\s+/u)[0].toLowerCase() === h).length; }, 0);
const sentenceIdx = rows.map((r, i) => (perRoute[i].some((o) => o.shape === "comma.in_sentence") ? i : -1)).filter((i) => i >= 0);
const sentenceWhyCounts = {}; for (const i of sentenceIdx) for (const w of sentenceWhy(rows[i].route)) { const k = w.startsWith("word") ? "a CLAUSE word" : w; sentenceWhyCounts[k] = (sentenceWhyCounts[k] || 0) + 1; }
const sentenceRegion = {}; for (const i of sentenceIdx) { const g = regionOf(rows[i].route, rows[i].def); sentenceRegion[g] = (sentenceRegion[g] || 0) + 1; }
// pieces of a dividing gloss list longer than v3's four words
const longPieceRoutes = glossRouteIdx.filter((i) => declDivide(rows[i].route, perRoute[i]).readings.some((p) => p.replace(/\([^()]*\)/gu, " ").trim().split(/\s+/u).length > 4));
// a dividing gloss list that opens on a capitalized piece after the first, or cites English words
const capitalPieceIdx = glossRouteIdx.filter((i) => piecesOf(rows[i].route, [0, rows[i].route.length]).slice(1).some((p) => /^\p{Lu}/u.test(p)));
const routesWithRouteFragmentFlag = rows.filter((r) => r.cut === 1).length;
const keysMultiText = (() => { const m = new Map(); for (const r of rows) { if (!m.has(r.key)) m.set(r.key, new Set()); m.get(r.key).add(r.route); } return [...m.values()].filter((s) => s.size > 1).length; })();

// ---------------------------------------------------------------- falsifier searches
const routeSetByKey = new Map(); for (const r of rows) { if (!routeSetByKey.has(r.key)) routeSetByKey.set(r.key, new Set()); routeSetByKey.get(r.key).add(r.route); }
const F = {
  hyphen_spaced_both_sides: rows.filter((r) => / - /u.test(r.route)).length,
  paren_holding_separator: rows.filter((r) => /\([^()]*[,;/][^()]*\)/u.test(r.route)).length,
  paren_unbalanced_routes: rows.filter((r) => r.route.includes("(") || r.route.includes(")")).filter((r) => { let d = 0; for (const c of r.route) { if (c === "(") d += 1; else if (c === ")") { d -= 1; if (d < 0) return true; } } return d !== 0; }).length,
  paren_pairs: rows.reduce((t, r) => t + [...r.route].filter((c) => c === "(").length, 0),
  exclamation_not_last: rows.filter((r) => r.route.slice(0, -1).includes("!")).length,
  question_not_last: rows.filter((r) => r.route.slice(0, -1).includes("?")).length,
  curly_apostrophe_spaced_both_sides: rows.filter((r) => / ’ /u.test(r.route)).length,
  apostrophe_with_no_letter_before: rows.filter((r) => /(^|[^\p{L}])'/u.test(r.route)).length,
  ayin_spaced_both_sides: rows.filter((r) => /(^|\s)‛(\s|$)/u.test(r.route)).length,
  open_quote_without_close: rows.filter((r) => r.route.includes("‘") && !r.route.slice(r.route.indexOf("‘")).includes("’")).length,
  caron_not_after_letter: rows.filter((r) => /(^|[^\p{L}])\u030C/u.test(r.route)).length,
  geresh_not_after_hebrew_letter: rows.filter((r) => /(^|[^\u05D0-\u05EA])\u05F3/u.test(r.route)).length,
  ampersand_sides_both_routes_on_key: rows.filter((r) => r.route.includes(" & ")).filter((r) => { const [a, b] = r.route.split(" & "); const set = routeSetByKey.get(r.key); return set.has(a.trim()) && set.has(b.trim()); }).length,
  ellipsis_sides_both_routes_on_key: rows.filter((r) => r.route.includes("…")).filter((r) => { const [a, b] = r.route.split("…").map((x) => x.trim()); const set = routeSetByKey.get(r.key); return a && b && set.has(a) && set.has(b); }).length,
  semicolon_sense_sentence_shaped: rows.filter((r) => r.route.includes(";")).filter((r) => sensesOf(r.route).some(([a, z]) => sentenceWhy(r.route.slice(a, z)).length)).length,
  question_mid_route: rows.filter((r) => r.route.slice(0, -1).includes("?")).map((r) => `${r.key} | ${win(r.route)}`),
};

// ---------------------------------------------------------------- open questions
const routesOf = (id) => [...(shapeRoutes.get(id) || [])];
const sameAsV3 = (ids) => ids.filter((i) => kindOf[i] === "same_division").length;
const keyed = (ids, k = 4) => ids.slice(0, k).map((i) => `${rows[i].key} | ${win(rows[i].route)}`);
const headIdx = routesOf("comma.between_glosses_after_head_word");
const cognateIdx = glossRouteIdx.filter((i) => regionOf(rows[i].route, rows[i].def) === "def_parentheses");
const one = (id) => routesOf(id);
const OPEN_QUESTIONS = [
  { id: "B01", question: "In BDB, a gloss list whose first gloss opens on a head word the later glosses do not repeat ('be fatigued, tired'): does the comma divide two readings, the later one printed as the provider wrote it ('tired'), or is the list one reading?",
    options: [
      { id: "divides", means: `each gloss a reading, printed as written; ${headPiecesPrintedBare} later pieces print without the head word`, count: headIdx.length },
      { id: "whole", means: "the list prints as one reading, head and all", count: headIdx.length }],
    resting: "divides", why_resting: `the August Strong's precedent (pieces kept as written, no head distributed) and today's card: v3 already gives the same division on ${sameAsV3(headIdx)} of these ${headIdx.length} routes`, examples: keyed(headIdx) },
  { id: "B02", question: "Inside the definition's parentheses BDB gives a cognate's or a root's meaning (Arabic, Aramaic, Assyrian, Ethiopic, NH), not a rendering of the Hebrew word. Where the store made such a list a route, does its comma divide readings the card prints, or does the list stand whole as a note?",
    options: [
      { id: "divides", means: "the cognate's glosses print as separate readings, like any gloss list", count: cognateIdx.length },
      { id: "whole", means: "the list prints as one reading (or, a store ruling, is not offered as a reading at all)", count: cognateIdx.length }],
    resting: "divides", why_resting: `v3 gives the same division on ${sameAsV3(cognateIdx)} of these ${cognateIdx.length} today; whether a cognate's gloss is a reading of the Hebrew word at all is a route question for the store (${regionTotals.def_parentheses} routes in all sit inside the definition's parentheses, proper-name meanings among them)`, examples: keyed(cognateIdx.filter((i) => rows[i].route !== "algebra, Alhambra, alkali, alcohol, alcove").slice(0, 3)).concat(keyed(cognateIdx.filter((i) => /Alhambra/u.test(rows[i].route)), 1)) },
  { id: "B03", question: "A route that ends on the comma that divided it from its sibling ('have a just cause,' beside the route 'be in the right'): print it with the comma as stored, or read the comma as the separator's tail, as the August Strong's head_mark rule reads ':--'?",
    options: [
      { id: "as_stored", means: "the reading prints with its trailing comma", count: one("comma.trailing").length },
      { id: "separator_tail", means: "the reading ends before the comma (what v3 prints today)", count: one("comma.trailing").length }],
    resting: "as_stored", examples: keyed(one("comma.trailing")) },
  { id: "B04", question: "Two glosses written with no space after the comma ('break,split'): two readings, or held whole because the pieces cannot rejoin on the declared ', '?",
    options: [{ id: "divides", means: "two readings", count: one("comma.no_space_after").length }, { id: "whole", means: "one field as written", count: one("comma.no_space_after").length }],
    resting: "whole", examples: keyed(one("comma.no_space_after")) },
  { id: "B05", question: "Two interrogative renderings in one field with only a space between them ('by means of what? how?'): two readings divided after the '?', or one?",
    options: [{ id: "divides", means: "two readings, each keeping its '?'", count: one("question.before_second_question").length }, { id: "whole", means: "one field as written", count: one("question.before_second_question").length }],
    resting: "whole", examples: keyed(one("question.before_second_question")) },
  { id: "B06", question: "A stop between two forms of one gloss ('strip. strip off'), likely a comma in the source: two readings, or one?",
    options: [{ id: "divides", means: "two readings", count: one("period.mid_after_word").length }, { id: "whole", means: "one field as written", count: one("period.mid_after_word").length }],
    resting: "whole", examples: keyed(one("period.mid_after_word")) },
  { id: "B07", question: "A comma before a piece that is half a word ('freed-man, -woman', 'blacksmith's fire-place, hornets''): hold the field whole (the August hyphen-attachment precedent), or divide and print '-woman' and 'hornets'' as readings (what v3 does today)?",
    options: [{ id: "whole", means: "one field as written", count: one("comma.before_bound_suffix").length + one("comma.before_open_possessive").length }, { id: "divides", means: "the half-word prints as a reading of its own", count: one("comma.before_bound_suffix").length + one("comma.before_open_possessive").length }],
    resting: "whole", examples: keyed([...one("comma.before_bound_suffix"), ...one("comma.before_open_possessive")]) },
];

// ---------------------------------------------------------------- closed set
const closed = [...routeMarks.keys()].sort((a, b) => routeMarks.get(b).occurrences - routeMarks.get(a).occurrences);
const closedSetCheck = {
  inventory_marks: invMarks.size, jsonl_route_marks: routeMarks.size,
  same_set: invMarks.size === routeMarks.size && [...invMarks.keys()].every((c) => routeMarks.has(c)),
  same_counts: [...invMarks].every(([c, v]) => routeMarks.get(c)?.occurrences === v.occurrences && routeMarks.get(c)?.carrying === v.routes),
};

const markName = (c) => ({ "-": "hyphen-minus", ",": "comma", "!": "exclamation mark", "’": "right single quotation mark", "?": "question mark", "'": "apostrophe", ".": "full stop", "(": "left parenthesis", ")": "right parenthesis", "‛": "single high-reversed-9 quotation mark", "…": "horizontal ellipsis", "&": "ampersand", "‘": "left single quotation mark", "̌": "combining caron", "׳": "Hebrew punctuation geresh", ";": "semicolon" }[c] || cp(c));

const shapesOut = SHAPES.filter((s) => shapeCount.get(s.id)).map((s) => ({
  id: s.id, mark: s.mark, count: shapeCount.get(s.id), routes: shapeRoutes.get(s.id).size, divides_readings: s.divides,
  means: s.means, test: s.test, by_region: shapeRegion.get(s.id), examples: shapeExamples.get(s.id),
}));
const searchedAbsent = SHAPES.filter((s) => !shapeCount.get(s.id)).map((s) => ({ id: s.id, mark: s.mark, test: s.test, count: 0 }));

const census = {
  schema: "MARK_LEDGER_PILOT_CENSUS_V1",
  source_key: SOURCE_KEY, m_ids: M_IDS, routes: rows.length, made_on: "2026-10-31",
  read_from: { routes: "punct/by-source/openscriptures_bdb_1906.jsonl (route store 87b13b1169b4 per the inventory)", inventory: inv.rule_id, v3: V3_RULE },
  closed_set_check: closedSetCheck,
  route_regions: regionTotals,
  route_text_marks: closed.map((c) => ({ mark: c, codepoint: cp(c), name: markName(c), occurrences: routeMarks.get(c).occurrences, routes_carrying_it: routeMarks.get(c).carrying, inventory: invMarks.get(c) || null })),
  definition_text_marks: {
    distinct_definitions: seenDefs.size,
    note: "counted over every row's definition (rows) and over distinct definitions; Hebrew points, accents and the geresh are marks under the inventory's rule",
    marks: [...defMarksRows.keys()].sort((a, b) => defMarksRows.get(b).occurrences - defMarksRows.get(a).occurrences).map((c) => ({ mark: c, codepoint: cp(c), over_rows: { occurrences: defMarksRows.get(c).occurrences, rows_carrying_it: defMarksRows.get(c).carrying }, over_distinct_definitions: { occurrences: defMarksDistinct.get(c).occurrences, definitions_carrying_it: defMarksDistinct.get(c).carrying }, in_route_text: routeMarks.has(c) })),
  },
  shapes: shapesOut,
  searched_absent: searchedAbsent,
  unexplained: { count: unexplained.length, occurrences: unexplained.slice(0, 20) },
  side_measures: {
    comma_routes: commaRouteIdx.length,
    gloss_list_routes: glossRouteIdx.length,
    gloss_list_routes_by_region: glossByRegion,
    gloss_list_routes_whose_first_piece_begins_mid_gloss: startsAfterOr.length,
    gloss_list_routes_whose_first_piece_begins_mid_gloss_examples: startsAfterOr.slice(0, 6).map((i) => `${rows[i].key} | ${win(rows[i].route)}`),
    head_carried_routes: headCarriedIdx.length,
    head_carried_head_words: headWordCounts,
    head_carried_senses: headSenses.length,
    head_carried_pieces_printed_without_the_head: headPiecesPrintedBare,
    head_carried_later_pieces_that_repeat_the_head: headPiecesKeepingHead,
    head_carried_examples: headCarriedIdx.slice(0, 12).map((i) => `${rows[i].key} | ${win(rows[i].route)}`),
    sentence_routes: sentenceIdx.length,
    sentence_routes_by_test: sentenceWhyCounts,
    sentence_routes_by_region: sentenceRegion,
    gloss_list_routes_with_a_piece_over_four_words: longPieceRoutes.length,
    gloss_list_routes_with_a_later_piece_opening_on_a_capital: capitalPieceIdx.map((i) => `${rows[i].key} | ${win(rows[i].route)}`),
    senses_with_dividing_and_holding_commas_mixed: mixedSenses,
    falsifier_searches: F,
    routes_refused_on_rejoin: refusedRejoin,
    routes_flagged_cut_in_store: routesWithRouteFragmentFlag,
    keys_with_more_than_one_route_text: keysMultiText,
    v3_tool_alone_vs_engine_semicolon_presplit_differs_on: toolOnlyDiffers,
  },
  division: { declaration_divides: declDivides, declaration_readings: declReadings, v3_divides: v3Divides, v3_readings: v3Readings },
  v3_comparison: { ...cmp, by_comma_shape: cmpByShape, examples: cmpEx },
  open_questions: OPEN_QUESTIONS,
};
writeFileSync(join(here, "census.json"), JSON.stringify(census, null, 1) + "\n");
writeFileSync(join(here, "changes-vs-v3.jsonl"), changes.map((c) => JSON.stringify(c)).join("\n") + (changes.length ? "\n" : ""));

// ---------------------------------------------------------------- declaration
const n = (x) => x.toLocaleString("en-US");
const sc = (id) => shapeCount.get(id) || 0;
const sr = (id) => (shapeRoutes.get(id) ? shapeRoutes.get(id).size : 0);
const markEntry = (c, extra = {}) => {
  const list = SHAPES_BY_MARK.get(c).filter((s) => sc(s.id));
  const divides = list.filter((s) => s.divides);
  return {
    means: extra.means,
    governs: routeMarks.get(c).carrying,
    occurrences: routeMarks.get(c).occurrences,
    divides_readings: divides.length ? `only in ${divides.map((s) => s.id).join(", ")}` : false,
    shape_occurrences: Object.fromEntries(list.map((s) => [s.id, sc(s.id)])),
    shapes: Object.fromEntries(list.map((s) => [s.id, { means: s.means, test: s.test, count: sc(s.id), routes: sr(s.id), divides_readings: s.divides, by_region: shapeRegion.get(s.id) }])),
    evidence: extra.evidence,
    falsifier: extra.falsifier,
    ...(extra.more || {}),
  };
};
const ex = (id, k = 3) => (shapeExamples.get(id) || []).slice(0, k).join(" ; ");
const declaration = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  computed_by: "pilot/openscriptures_bdb_1906/ledger.mjs (every number below is that script's output)",
  providers: {
    [SOURCE_KEY]: {
      label: "Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures",
      m_ids: M_IDS,
      routes: rows.length,
      declared_on: "2026-10-31",
      declared_from: `The entry's own structure, read across all ${n(rows.length)} routes on ${n(new Set(rows.map((r) => r.key)).size)} keys and ${n(seenDefs.size)} distinct definitions. The route is never absent from its definition: ${n(regionTotals.whole || 0)} routes are the whole definition and the rest are slices of it, ${n(regionTotals.def_top || 0)} at the definition's top level (senses, stem paragraphs, quoted renderings), ${n(regionTotals.def_parentheses || 0)} inside its parentheses (root etymologies giving a cognate's glosses, a proper name's meaning) and ${n(regionTotals.def_brackets || 0)} inside its square brackets. The definition writes ' , ' (a space on both sides) between the glosses the store already cut into separate routes; the route keeps only the source's own ', ' inside one gloss run, which is why only ${n(routeMarks.get(",").carrying)} of ${n(rows.length)} routes carry a comma at all. The closed set is ${routeMarks.size} marks, ${n([...routeMarks.values()].reduce((t, v) => t + v.occurrences, 0))} occurrences, identical in set and count to the 2026-10-31 inventory; every occurrence falls in exactly one of ${shapesOut.length} shapes; ${unexplained.length} unexplained. Two marks divide readings: ';' between senses (${sc("semicolon.between_senses")}) and ',' between glosses (${sc("comma.between_glosses") + sc("comma.between_glosses_after_head_word")} occurrences in ${glossRouteIdx.length} routes). ${sc("comma.in_sentence")} commas in ${sentenceIdx.length} routes punctuate a sentence and do not divide.`,
      regions: {
        route_regions: regionTotals,
        meaning_depends_on_region: false,
        note: `No mark's meaning changes with the region. What changes is whose reading it is: of the ${glossRouteIdx.length} gloss-list routes, ${glossByRegion.def_parentheses || 0} sit inside the definition's parentheses, where BDB gives the glosses of a cognate (Arabic, Aramaic, Assyrian, Ethiopic, NH) or of a root, and ${(glossByRegion.def_top || 0) + (glossByRegion.whole || 0) + (glossByRegion.def_brackets || 0)} sit outside them. The comma divides glosses the same way in both; whether a cognate's gloss is a reading of the Hebrew word is the store's question, not this ledger's. All ${sentenceIdx.length} sentence-shaped comma routes: ${JSON.stringify(sentenceRegion)}.`,
      },
      marks: {
        ";": markEntry(";", {
          means: "sense boundary: ends one sense and opens the next inside one gloss field",
          evidence: `${ex("semicolon.between_senses", 1)}: two senses, each a gloss list of its own`,
          falsifier: `A depth-zero ';' with a sentence-shaped sense on either side (one clause cut in two): ${F.semicolon_sense_sentence_shaped} today; the one ';' stands between two gloss lists.`,
        }),
        ",": markEntry(",", {
          means: "alternation: separates one English gloss from the next in one gloss run, except where the run is a rendered sentence, where it is the sentence's own punctuation",
          evidence: `between_glosses: ${ex("comma.between_glosses")}. after_head_word: ${ex("comma.between_glosses_after_head_word")}. in_sentence: ${ex("comma.in_sentence")}. ${glossByRegion.def_parentheses || 0} of the ${glossRouteIdx.length} gloss-list routes are a cognate's glosses inside the definition's parentheses.`,
          falsifier: `A comma the gloss tests divide whose two sides are not two renderings: a clause of a quoted verse the CLAUSE list misses, or a cited example. Searched: a later piece opening on a capital, ${capitalPieceIdx.length} routes (${capitalPieceIdx.map((i) => rows[i].key + " | " + win(rows[i].route)).join(" ; ")}); at הגר and אלה the capital is a gloss (Hegira, God); at אל the list cites English loanwords from the etymology, still a list but not renderings. A first piece that begins mid-gloss (the definition has ' or ' right before the route): ${startsAfterOr.length}; the division is unaffected, the cut is the store's.`,
          more: { scoped_by: "(", commas_inside_parentheses: sc("comma.inside_parentheses"), holds_whole_when: ["comma.in_sentence", "comma.trailing", "comma.no_space_after", "comma.before_bound_suffix", "comma.before_open_possessive"] },
        }),
        "-": markEntry("-", {
          means: "joins parts of one word; at a route's edge, half of a compound whose other half stands outside the route",
          evidence: `${ex("hyphen.compound_join")} ; suspended: ${ex("hyphen.suspended_first_part")} ; bound: ${ex("hyphen.bound_second_part")}`,
          falsifier: `A '-' with a space on both sides (a dash standing between two glosses): ${F.hyphen_spaced_both_sides} today.`,
        }),
        "(": markEntry("(", {
          means: "notation inside one reading: optional letters, a supplied or optional word, a note; never a scope over alternatives",
          evidence: `${ex("paren.optional_letters")} ; ${ex("paren.supplied_word")} ; ${ex("paren.label")}`,
          falsifier: `A ',' ';' or '/' inside the parentheses (an alternation the parenthesis would scope, as in Strong's): ${F.paren_holding_separator} today. ${F.paren_pairs} openers; ${F.paren_unbalanced_routes} routes unbalanced.`,
        }),
        ")": markEntry(")", { means: "closes the parenthesis it pairs with; every ')' has an opener in the same route", evidence: `${F.paren_pairs} openers, ${routeMarks.get(")").occurrences} closers, ${F.paren_unbalanced_routes} unbalanced routes`, falsifier: `A ')' with nothing open: ${F.paren_unbalanced_routes} routes today.` }),
        "!": markEntry("!", { means: "exclamation or wish; ends the one reading", evidence: ex("exclamation.final"), falsifier: `A '!' anywhere but the last character: ${F.exclamation_not_last} today.` }),
        "?": markEntry("?", { means: "interrogative; ends a reading", evidence: `${ex("question.final")} ; ${ex("question.before_second_question", 1)}`, falsifier: `A '?' anywhere but the last character: ${F.question_not_last} today (${F.question_mid_route.join(" ; ")}), the second-question shape, held whole and put to the owner.` }),
        "’": markEntry("’", { means: "English possessive, a closing quotation mark, or the aleph sign of a transliteration; inside one reading", evidence: `${ex("apostrophe_curly.possessive")} ; ${ex("apostrophe_curly.aleph_sign")} ; ${ex("apostrophe_curly.closing_quote", 2)}`, falsifier: `A '’' with a space on both sides: ${F.curly_apostrophe_spaced_both_sides} today.` }),
        "'": markEntry("'", { means: "English possessive inside one reading", evidence: `${ex("apostrophe.possessive_singular")} ; ${ex("apostrophe.possessive_plural", 2)}`, falsifier: `A ''' opening a quotation (no letter before it): ${F.apostrophe_with_no_letter_before} today.` }),
        ".": markEntry(".", { means: "ends a BDB abbreviation, ends a sentence-shaped rendering, or is part of '...'; once a stop between two forms of one gloss", evidence: `${ex("period.abbreviation")} ; ${ex("period.final", 1)} ; ${ex("period.ellipsis_ascii", 1)} ; ${ex("period.mid_after_word", 1)}`, falsifier: "A '.' between two complete glosses that a reader would take as two readings: 1 candidate today (period.mid_after_word), held whole and put to the owner." }),
        "‛": markEntry("‛", { means: "the ayin sign of a transliterated Hebrew name; inside one word", evidence: ex("ayin_sign.in_transliteration"), falsifier: `A '‛' with a space on both sides: ${F.ayin_spaced_both_sides} today.` }),
        "…": markEntry("…", { means: "a gap inside one phrase for the words the context supplies", evidence: ex("ellipsis.gap_in_phrase"), falsifier: `A '…' whose two sides each stand as a route of their own on the same key (two alternatives, not one phrase): ${F.ellipsis_sides_both_routes_on_key} today.` }),
        "&": markEntry("&", { means: "'and' inside one gloss", evidence: ex("ampersand.and_inside_gloss"), falsifier: `A '&' whose two sides each stand as a route of their own on the same key: ${F.ampersand_sides_both_routes_on_key} today.` }),
        "‘": markEntry("‘", { means: "opens a quoted rendering", evidence: ex("quote_open.quoted_rendering", 2), falsifier: `A '‘' with no '’' after it in the route: ${F.open_quote_without_close} today.` }),
        "̌": markEntry("̌", { means: "combining caron on a transliterated vowel", evidence: ex("caron.on_transliterated_vowel", 1), falsifier: `A U+030C not after a letter: ${F.caron_not_after_letter} today.` }),
        "׳": markEntry("׳", { means: "abbreviates the divine name inside an English rendering", evidence: ex("geresh.divine_name_abbreviation", 1), falsifier: `A '׳' not after a Hebrew letter: ${F.geresh_not_after_hebrew_letter} today.` }),
      },
      precedence: [";", ","],
      precedence_note: "'(' is a scope, not a divider: a comma or semicolon inside parentheses would not divide (0 occurrences today). Then ';' divides senses, then ',' divides glosses inside each sense, and only in a sense where every comma is of a dividing shape. No ':' '/' '[' '+' or 'X' occurs in this provider's route text.",
      refusals: {
        unbalanced_parentheses: { rows: F.paren_unbalanced_routes, rule: "as wikisource_strongs_explicit_forms: separate up to an unclosed opener; a closer with nothing open is inert" },
        sense_with_mixed_commas: { rows: mixedSenses, rule: "a sense holding any comma of a non-dividing shape is held whole" },
        pieces_do_not_rejoin: { rows: refusedRejoin, rule: "the route ships whole" },
      },
      export: "governed by its posture, cc_by_4_0_underlying_public_domain",
      open_questions: OPEN_QUESTIONS,
      separates_on: {
        marks: [";", ","],
        scope: "( )",
        declared_from: `${glossRouteIdx.length} of the ${routeMarks.get(",").carrying} comma routes are gloss lists; ${sentenceIdx.length} are sentences; ${sr("comma.trailing") + sr("comma.no_space_after") + sr("comma.before_bound_suffix") + sr("comma.before_open_possessive")} carry a comma that would leave a fragment or cannot rejoin.`,
        rule: "Separate at depth-zero semicolons, then at the depth-zero commas of each sense whose commas are all comma.between_glosses or comma.between_glosses_after_head_word. Every piece is kept as the provider wrote it; no head word is carried to a later piece ('be fatigued, tired' prints 'be fatigued' and 'tired'), no piece is joined to another, no parenthesis is distributed.",
        holds_whole_when: Object.fromEntries(["comma.in_sentence", "comma.trailing", "comma.no_space_after", "comma.before_bound_suffix", "comma.before_open_possessive"].map((id) => [id, { routes: sr(id), test: SHAPES.find((s) => s.id === id).test }])),
        clause_words: CLAUSE_WORDS,
        head_words: HEADS,
        abbreviations: ABBREV,
        machine_note: "reader/tools/declaration-v1.mjs readingOf takes one separates_on.mark and no route-level hold. Wiring this declaration needs both: two marks in precedence and the holds_whole_when tests. Applied as written by that machine (',' only, no holds), it would divide the sentence and fragment routes listed in holds_whole_when.",
        refusals: { "unbalanced parentheses": "the route ships whole up to the declared August rule", "pieces that do not rejoin": "the route ships whole" },
      },
      not_done_here: "The definition is never mined for a reading, and the route boundaries are the store's: a route the store cut mid-gloss ('away, draw together' of 'put aside or away'), a cognate's gloss offered as a reading of the Hebrew word, and English words cited by the etymology ('algebra, Alhambra …') are route questions this ledger reports but does not settle. The definition's own marks (" + `${defMarksRows.size}` + " in all, Hebrew points among them) are counted in census.json but not declared: the page prints the route, not the definition.",
    },
  },
};
writeFileSync(join(here, "declaration.json"), JSON.stringify(declaration, null, 1) + "\n");

console.log(JSON.stringify({ closedSetCheck, regionTotals, unexplained: unexplained.length, shapes: shapesOut.length, shapeCounts: Object.fromEntries(shapesOut.map((s) => [s.id, s.count])), cmp, cmpByShape, division: census.division, side: census.side_measures }, null, 1));
