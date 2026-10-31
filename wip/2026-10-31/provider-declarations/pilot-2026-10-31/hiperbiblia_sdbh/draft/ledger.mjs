#!/usr/bin/env node
// Mark ledger pilot · hiperbiblia_sdbh (M17) · 2026-10-31
//
// Reads ONE provider file (by-source/hiperbiblia_sdbh.jsonl), the mark
// inventory and today's engine rule (sense-split-v1.mjs, imported read-only),
// and writes, into this folder only: census.json, compare.json,
// changes-vs-v3.jsonl, declaration.json. Every number in those files is
// computed here. Single process, no server, no network.
//
//   node ledger.mjs <punct-dir> <ghp-tools-dir>

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const PUNCT = process.argv[2];
const TOOLS = process.argv[3];
const SOURCE_KEY = "hiperbiblia_sdbh";
const M_IDS = ["M17"];
const { senseSplit, RULE_ID: V3_RULE } = await import(pathToFileURL(join(TOOLS, "sense-split-v1.mjs")).href);

const rows = readFileSync(join(PUNCT, "by-source", `${SOURCE_KEY}.jsonl`), "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l));
const inventory = JSON.parse(readFileSync(join(PUNCT, "mark-inventory-2026-10-31.json"), "utf8"));
const invEntries = inventory.providers.filter((p) => M_IDS.includes(p.provider));

const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const W = 60;
const win = (s, i = 0) => (s.length <= W ? s : s.slice(Math.max(0, Math.min(i - 28, s.length - W)), Math.max(0, Math.min(i - 28, s.length - W)) + W));
const norm = (x) => x.replace(/\s+/g, " ").trim();

// ---------------------------------------------------------------- structure
// parenthesis structure: matched pairs, orphan closers (inert), unclosed openers
const parens = (s) => {
  const st = [], pairOf = new Map(), orphanClose = [], depth = new Array(s.length).fill(0);
  for (let i = 0; i < s.length; i += 1) {
    depth[i] = st.length;
    if (s[i] === "(") st.push(i);
    else if (s[i] === ")") { if (st.length) { const a = st.pop(); pairOf.set(a, i); pairOf.set(i, a); depth[i] = st.length; } else orphanClose.push(i); }
  }
  return { pairOf, orphanClose, orphanOpen: [...st], depth };
};
// pieces at depth-zero occurrences of a mark (orphan closers inert, unclosed openers open)
const topPieces = (s, mark) => {
  const { depth } = parens(s); const out = []; let start = 0;
  for (let i = 0; i < s.length; i += 1) if (s[i] === mark && depth[i] === 0) { out.push(s.slice(start, i)); start = i + 1; }
  out.push(s.slice(start));
  return out;
};

// ---------------------------------------------------------------- shapes
// Each shape: the mark, a deterministic test (as code below and as words here),
// what the mark means there in this provider, whether a reader would see two
// readings (divides), and whether this declaration separates there (separated).
const SHAPES = {
  // ; (definition text only — no route carries it)
  "semicolon.between_gloss_items": { mark: ";", test: "';' at parenthesis depth 0 in the definition", means: "Divides one gloss from the next in the provider's list; every route is exactly one of these items, so the division is already made upstream.", divides: true, separated: "upstream (one route per item)" },
  "semicolon.inside_parentheses": { mark: ";", test: "';' inside an open parenthesis in the definition", means: "Punctuation inside the provider's aside, not a division between glosses; the ingest nevertheless cut the route there.", divides: false, separated: false },
  // ( )
  "paren.optional_part": { mark: "()", test: "a balanced pair touching a letter outside it on either side, or whose content begins or ends with '-'", means: "Optional letters or an optional word part, read with or without it: way(s), (day)light, (re)unite, (Beth-)Geder; one reading.", divides: false, separated: false },
  "paren.uncertainty": { mark: "()", test: "a balanced pair holding only '?'", means: "The provider flags the rendering before it as uncertain; one reading.", divides: false, separated: false },
  "paren.equivalence_aside": { mark: "()", test: "a balanced pair whose content begins with '='", means: "An aside giving what the reading amounts to: to catch up with (= happen); one reading.", divides: false, separated: false },
  "paren.extension_aside": { mark: "()", test: "a balanced pair whose content begins with '>'", means: "An aside giving the extended sense of the word before it: heart (> allegiance); one reading.", divides: false, separated: false },
  "paren.grammatical_label": { mark: "()", test: "a balanced pair whose content ends with ':' or is 'pl'", means: "A grammatical label on the reading (plural); one reading.", divides: false, separated: false },
  "paren.list_inside": { mark: "()", test: "a balanced pair at a word boundary whose content holds a comma", means: "The typical objects or settings of the reading, listed inside one qualifier: to wear (clothes, armor); one reading, and the commas inside are the qualifier's own.", divides: false, separated: false },
  "paren.argument_placeholder": { mark: "()", test: "a balanced pair at a word boundary whose content holds someone, something, somewhere, one, one's, oneself, another, X or Y", means: "The slot the context fills (the object, possessor or partner of the verb): to beat (one's) breast; one reading.", divides: false, separated: false },
  "paren.qualifier": { mark: "()", test: "any other balanced pair at a word boundary", means: "An optional or explanatory word or phrase inside the reading (the object, a complement, the domain): to flow (with tears), (most) holy place; one reading.", divides: false, separated: false },
  "paren.opener_never_closed": { mark: "()", test: "a '(' with no ')' after it in the route", means: "A parenthesis left open: either the provider's own text is truncated, or the ingest cut the provider's item inside its parenthesis; not a division.", divides: false, separated: false },
  "paren.closer_with_nothing_open": { mark: "()", test: "a ')' with no '(' open before it in the route", means: "A closer with nothing open: either the provider's own text carries it, or the ingest cut the provider's item inside its parenthesis; not a division.", divides: false, separated: false },
  // ,
  "comma.inside_parentheses": { mark: ",", test: "',' inside an open parenthesis", means: "Lists the members of one qualifier (objects, settings); the reading is the whole route.", divides: false, separated: false },
  "comma.complete_infinitives": { mark: ",", test: "',' at depth 0 where every comma piece of the route begins 'to '", means: "Packs two complete renderings of one meaning into one gloss: to go, to arrive.", divides: true, separated: true },
  "comma.complete_nominal": { mark: ",", test: "',' at depth 0, route not beginning 'to ', where no comma piece holds a parenthesis or the words of/to/and/or/whether and every piece is at most 3 words", means: "Packs two or more complete renderings of one meaning into one gloss: loins, sides; Ephrathah, Ephrath.", divides: true, separated: true },
  "comma.copula_elliptic": { mark: ",", test: "',' at depth 0 where the first piece is exactly 'to be' and the next begins 'become'", means: "Packs 'to be X' and 'to become X' with X written once: to be, become weak. Two readings in meaning, but the first piece alone ('to be') is not one.", divides: true, separated: false },
  "comma.verb_head_distributed": { mark: ",", test: "',' at depth 0 where the first piece begins 'to ' and a later piece does not", means: "Packs renderings of one verb with the infinitive (and any causative or passive frame) written once on the first: to cause (mountains) to skip, jump. Two readings in meaning, but a later piece alone ('jump') is not one.", divides: true, separated: false },
  "comma.list_with_edge_parenthesis": { mark: ",", test: "',' at depth 0, route not beginning 'to ', where the first piece begins with '(' or the last piece ends with ')'", means: "Packs renderings under a qualifier written once at the edge of the list, whose scope over the other members the provider does not write: (images of) hemorrhoids, tumors, ulcers. Divides in meaning; a piece alone would lose or misplace the qualifier.", divides: true, separated: false },
  "comma.of_head_distributed": { mark: ",", test: "',' at depth 0 where the first piece holds ' of ' and every later piece is one word", means: "Packs a head phrase written once with several completions: mouth of well, cave, pit. Divides in meaning; 'cave' alone is not a reading of the word.", divides: true, separated: false },
  "comma.before_subordinate_clause": { mark: ",", test: "',' at depth 0 followed by a piece beginning whether/which/who/when/where/if/although/because/that/while", means: "Sets off a clause that qualifies the reading: everyone, whether great or small; one reading.", divides: false, separated: false },
  // >
  "gt.literal_to_extended": { mark: ">", test: "'>' at depth 0 whose left side is not a quoted phrase", means: "One reading: the literal or source sense on the left, the extended sense the word carries in this use on the right (dwelling > behavior).", divides: false, separated: false },
  "gt.quoted_idiom_to_meaning": { mark: ">", test: "'>' at depth 0 whose left side is a phrase in double quotes", means: "One reading: an idiom quoted literally on the left, what it comes to on the right (\"deep of tongue\" > obscure speech).", divides: false, separated: false },
  "gt.inside_parentheses": { mark: ">", test: "'>' inside parentheses", means: "Inside an aside, the extended sense of the word before the parenthesis; one reading.", divides: false, separated: false },
  // =
  "eq.quoted_literal_to_meaning": { mark: "=", test: "'=' preceded by a closing double quote and a space", means: "One reading: an idiom quoted literally, then what it means (\"straight way\" = safe journey).", divides: false, separated: false },
  "eq.inside_parentheses": { mark: "=", test: "'=' inside parentheses", means: "Inside an aside, what the reading amounts to; one reading.", divides: false, separated: false },
  "eq.route_initial": { mark: "=", test: "'=' as the route's first character", means: "Opens a gloss that states what the word amounts to in a given use; one reading.", divides: false, separated: false },
  "eq.rendering_to_explanation": { mark: "=", test: "'=' at depth 0 between two unquoted phrases", means: "One reading: a rendering, then the explanation of what it denotes (filthy things = objects stained by menstruation).", divides: false, separated: false },
  // "
  "quote.literal_before_eq_or_gt": { mark: "\"", test: "a double-quote pair whose closing quote is followed by ' =' or ' >'", means: "Marks the literal wording of an idiom before its meaning; one reading.", divides: false, separated: false },
  "quote.whole_route_sound": { mark: "\"", test: "a double-quote pair enclosing the whole route, with no '=' or '>'", means: "Marks the reading as a sound or cry given as written (\"heidad\"); one reading.", divides: false, separated: false },
  // '
  "apos.possessive_s": { mark: "'", test: "an apostrophe between a letter and 's' that ends the word", means: "Possessive inside a word (one's, someone's, God's); one reading.", divides: false, separated: false },
  "apos.plural_possessive": { mark: "'", test: "an apostrophe after a word-final 's', followed by a space or the end", means: "Plural possessive inside a name (Wildgoats' Rocks); one reading.", divides: false, separated: false },
  // -
  "hyphen.compound_word": { mark: "-", test: "'-' between two letters where neither joined word is capitalized", means: "Joins a compound word (dwelling-place, father-in-law); one reading.", divides: false, separated: false },
  "hyphen.name_join": { mark: "-", test: "'-' between two letters where a joined word is capitalized", means: "Joins the parts of a place or personal name (Paddan-Aram, El-roi); one reading.", divides: false, separated: false },
  "hyphen.optional_part": { mark: "-", test: "'-' adjacent to a parenthesis", means: "Part of an optional word piece written in parentheses (plough(-point), (Beth-)Geder); one reading.", divides: false, separated: false },
  "hyphen.lone_item_no_rendering": { mark: "-", test: "a definition item that is only '-' (definition text only)", means: "The provider's sign that this use has no English rendering; the ingest emitted no route for it.", divides: false, separated: false },
  // .
  "period.ellipsis": { mark: ".", test: "'.' inside a run of exactly three periods", means: "An ellipsis: the slot the context fills (at the age of ...); one reading.", divides: false, separated: false },
  // ?
  "q.parenthesized_uncertainty": { mark: "?", test: "'?' alone inside parentheses", means: "The provider flags the rendering before it as uncertain; one reading.", divides: false, separated: false },
  "q.between_uncertain_alternatives": { mark: "?", test: "'?' followed by a space and a letter", means: "Closes one uncertain rendering before the next (plaque? tablet? panel? block?). Divides in meaning; not separated, since the mark belongs to the piece before it.", divides: true, separated: false },
  "q.route_final_interrogative": { mark: "?", test: "route-final '?' where the route begins with an interrogative (where, how, why, what, when, who, really, truly, is, are, optionally after from/for/to)", means: "The reading is itself a question word or question (where?, is it true?); one reading.", divides: false, separated: false },
  "q.route_final_uncertainty": { mark: "?", test: "route-final '?' where the route does not begin with an interrogative", means: "The provider flags the rendering as uncertain (chisel?, to cheat?); one reading.", divides: false, separated: false },
  // !
  "excl.route_final": { mark: "!", test: "route-final '!' outside parentheses", means: "The reading is an exclamation (behold!, alas!); one reading.", divides: false, separated: false },
  "excl.between_exclamations": { mark: "!", test: "'!' at depth 0 followed by a space and a letter", means: "Closes one exclamation before the next (woe! alas!). Divides in meaning; not separated, since the mark belongs to the piece before it.", divides: true, separated: false },
  "excl.inside_parentheses": { mark: "!", test: "'!' inside parentheses", means: "Ends an aside that completes the formula (if ... (then God may punish me!)); one reading.", divides: false, separated: false },
  // :
  "colon.label_in_parentheses": { mark: ":", test: "':' inside parentheses", means: "Ends a grammatical label ((plural:) cavalry); one reading.", divides: false, separated: false },
  "colon.between_two_nouns": { mark: ":", test: "':' at depth 0 between two words", means: "Stands between a masculine and a feminine noun (sorcerer: sorceress). Divides in meaning; not separated (one route).", divides: true, separated: false },
  // /
  "slash.spaced_alternatives": { mark: "/", test: "'/' with a space on each side", means: "Alternatives completing one head phrase written once (juice of purslane / mallows). Divides in meaning; 'mallows' alone is not the reading.", divides: true, separated: false },
  "slash.unspaced_alternation": { mark: "/", test: "'/' between two letters", means: "Alternation inside one reading (his/her); one reading.", divides: false, separated: false },
  // \
  "backslash.stray_before_word": { mark: "\\", test: "'\\' after a space and before a letter", means: "A stray character in the provider's text (to cause to bring \\birth; the same record also has 'to cause to bring forth'); one reading.", divides: false, separated: false },
  // [ ]
  "bracket.editorial_note": { mark: "[]", test: "a square-bracket pair enclosing the whole route", means: "An editorial note, not a rendering: the provider says the word is left untranslated in some use.", divides: false, separated: false },
};
const markOfShape = (id) => SHAPES[id].mark;

const SUBORD = /^(whether|which|who|whom|whose|when|where|if|although|though|because|that|while)\b/i;
const INTERROG = /^(?:(?:from|for|to)\s+)?(where|how|why|what|when|who|whom|whose|which|whence|whither|really|truly|is|are)\b/i;
const PLACEHOLDER = /\b(someone|something|somewhere|somebody|oneself|one|another|X|Y)\b/;

/** Route-level shape of the depth-zero commas of a text (null if it has none). */
const commaShape = (s) => {
  const pieces = topPieces(s, ",").map((p) => p.trim());
  if (pieces.length < 2) return { shape: null, pieces };
  const rest = pieces.slice(1);
  let shape = null;
  if (rest.some((p) => SUBORD.test(p))) shape = "comma.before_subordinate_clause";
  else if (pieces[0] === "to be" && /^become\b/.test(pieces[1])) shape = "comma.copula_elliptic";
  else if (pieces.every((p) => /^to /.test(p))) shape = "comma.complete_infinitives";
  else if (/^to /.test(pieces[0])) shape = "comma.verb_head_distributed";
  else if (/^\(/.test(pieces[0]) || /\)$/.test(pieces[pieces.length - 1])) shape = "comma.list_with_edge_parenthesis";
  else if (/\sof\s/.test(pieces[0]) && rest.every((p) => !/\s/.test(p))) shape = "comma.of_head_distributed";
  else if (pieces.every((p) => !/[()]/.test(p) && p.split(/\s+/).length <= 3 && !/\b(of|to|and|or|whether)\b/i.test(p))) shape = "comma.complete_nominal";
  return { shape, pieces };
};

/** Every mark occurrence in one text (a route, or one definition item) with its shape (null = unexplained). */
const classify = (s, { defItem = false } = {}) => {
  const out = [];
  const { pairOf, orphanClose, orphanOpen, depth } = parens(s);
  const oc = new Set(orphanClose), oo = new Set(orphanOpen);
  const cs = commaShape(s);
  const quotes = [...s].map((c, i) => (c === "\"" ? i : -1)).filter((i) => i >= 0);
  const L = (c) => c !== undefined && /\p{L}/u.test(c);
  if (defItem && s.trim() === "-") return [{ i: s.indexOf("-"), mark: "-", shape: "hyphen.lone_item_no_rendering" }];
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (!isMark(c)) continue;
    let shape = null;
    if (c === "(" || c === ")") {
      if (oo.has(i)) shape = "paren.opener_never_closed";
      else if (oc.has(i)) shape = "paren.closer_with_nothing_open";
      else {
        const a = c === "(" ? i : pairOf.get(i), z = c === ")" ? i : pairOf.get(i);
        const inner = s.slice(a + 1, z);
        if (L(s[a - 1]) || L(s[z + 1]) || /^-|-$/.test(inner)) shape = "paren.optional_part";
        else if (inner === "?") shape = "paren.uncertainty";
        else if (/^=/.test(inner)) shape = "paren.equivalence_aside";
        else if (/^>/.test(inner)) shape = "paren.extension_aside";
        else if (/:$/.test(inner) || inner === "pl") shape = "paren.grammatical_label";
        else if (inner.includes(",")) shape = "paren.list_inside";
        else if (PLACEHOLDER.test(inner)) shape = "paren.argument_placeholder";
        else shape = "paren.qualifier";
      }
    } else if (c === ";") {
      shape = depth[i] > 0 ? "semicolon.inside_parentheses" : "semicolon.between_gloss_items";
    } else if (c === ",") {
      shape = depth[i] > 0 ? "comma.inside_parentheses" : cs.shape;
    } else if (c === ">") {
      if (depth[i] > 0) shape = "gt.inside_parentheses";
      else { const left = s.slice(0, i).trim(); shape = /^".*"$/.test(left) ? "gt.quoted_idiom_to_meaning" : "gt.literal_to_extended"; }
    } else if (c === "=") {
      if (depth[i] > 0) shape = "eq.inside_parentheses";
      else if (i === 0) shape = "eq.route_initial";
      else if (s.slice(0, i).endsWith("\" ")) shape = "eq.quoted_literal_to_meaning";
      else if (L(s[i - 2]) && s[i - 1] === " " && s[i + 1] === " " && L(s[i + 2])) shape = "eq.rendering_to_explanation";
    } else if (c === "\"") {
      const k = quotes.indexOf(i);
      if (quotes.length % 2 === 0) {
        const close = quotes[k % 2 === 0 ? k + 1 : k];
        const open = quotes[k % 2 === 0 ? k : k - 1];
        const after = s.slice(close + 1, close + 3);
        if (after === " =" || after === " >") shape = "quote.literal_before_eq_or_gt";
        else if (open === 0 && close === s.length - 1 && quotes.length === 2 && !/[=>]/.test(s)) shape = "quote.whole_route_sound";
      }
    } else if (c === "'") {
      if (L(s[i - 1]) && s[i + 1] === "s" && !L(s[i + 2])) shape = "apos.possessive_s";
      else if (s[i - 1] === "s" && (s[i + 1] === " " || s[i + 1] === undefined)) shape = "apos.plural_possessive";
    } else if (c === "-") {
      if (s[i - 1] === "(" || s[i + 1] === ")" || s[i - 1] === ")" || s[i + 1] === "(") shape = "hyphen.optional_part";
      else if (L(s[i - 1]) && L(s[i + 1])) {
        const left = s.slice(0, i).match(/(\p{L}+)$/u)[1], right = s.slice(i + 1).match(/^(\p{L}+)/u)[1];
        shape = /^\p{Lu}/u.test(left) || /^\p{Lu}/u.test(right) ? "hyphen.name_join" : "hyphen.compound_word";
      }
    } else if (c === ".") {
      let a = i, z = i; while (s[a - 1] === ".") a -= 1; while (s[z + 1] === ".") z += 1;
      if (z - a + 1 === 3) shape = "period.ellipsis";
    } else if (c === "?") {
      if (s[i - 1] === "(" && s[i + 1] === ")") shape = "q.parenthesized_uncertainty";
      else if (s[i + 1] === " " && L(s[i + 2])) shape = "q.between_uncertain_alternatives";
      else if (i === s.length - 1) shape = INTERROG.test(s) ? "q.route_final_interrogative" : "q.route_final_uncertainty";
    } else if (c === "!") {
      if (depth[i] > 0) shape = "excl.inside_parentheses";
      else if (s[i + 1] === " " && L(s[i + 2])) shape = "excl.between_exclamations";
      else if (i === s.length - 1) shape = "excl.route_final";
    } else if (c === ":") {
      if (depth[i] > 0) shape = "colon.label_in_parentheses";
      else if (L(s[i - 1]) && s[i + 1] === " " && L(s[i + 2])) shape = "colon.between_two_nouns";
    } else if (c === "/") {
      if (s[i - 1] === " " && s[i + 1] === " ") shape = "slash.spaced_alternatives";
      else if (L(s[i - 1]) && L(s[i + 1])) shape = "slash.unspaced_alternation";
    } else if (c === "\\") {
      if (s[i - 1] === " " && L(s[i + 1])) shape = "backslash.stray_before_word";
    } else if (c === "[" || c === "]") {
      if (/^\[[^\[\]]*\]$/.test(s)) shape = "bracket.editorial_note";
    }
    out.push({ i, mark: c, shape });
  }
  return out;
};

// ---------------------------------------------------------------- census: routes
const byKey = new Map();
for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, new Set()); byKey.get(r.key).add(r.route); }
const regionOf = (r) => (r.route === r.def ? "whole" : r.def.includes(r.route) ? "slice" : "absent");
const regions = { whole: 0, slice: 0, absent: 0 };
const itemExact = { routes_equal_to_one_definition_item: 0, not: 0 };
const markC = new Map();     // mark -> {occ, routes:Set(idx), texts:Set, region:{}, shapes: Map}
const shapeC = new Map();    // shape -> {count, routes:Set, region:{whole,slice}, examples:[]}
const unexplained = [];
const routeShapes = [];      // per row: Set of shapes
const bump = (m, k, init) => { if (!m.has(k)) m.set(k, init()); return m.get(k); };
rows.forEach((r, idx) => {
  const reg = regionOf(r); regions[reg] += 1;
  if (r.def.split("; ").includes(r.route)) itemExact.routes_equal_to_one_definition_item += 1; else itemExact.not += 1;
  const occ = classify(r.route);
  const set = new Set();
  for (const o of occ) {
    const m = bump(markC, o.mark, () => ({ occ: 0, routes: new Set(), texts: new Set(), region: { whole: 0, slice: 0, absent: 0 } }));
    m.occ += 1; m.routes.add(idx); m.texts.add(r.route); m.region[reg] += 1;
    if (!o.shape) { unexplained.push({ key: r.key, mark: o.mark, window: win(r.route, o.i) }); continue; }
    if (markOfShape(o.shape).indexOf(o.mark) < 0) throw new Error(`shape ${o.shape} given to mark ${o.mark}`);
    const sc = bump(shapeC, o.shape, () => ({ count: 0, routes: new Set(), region: { whole: 0, slice: 0, absent: 0 }, examples: [], exTexts: new Set() }));
    sc.count += 1; sc.routes.add(idx); sc.region[reg] += 1; set.add(o.shape);
    if (sc.examples.length < 6 && !sc.exTexts.has(r.route)) { sc.exTexts.add(r.route); sc.examples.push(`${r.key}: ${win(r.route, o.i)}`); }
  }
  routeShapes.push(set);
});

// closed set against the inventory
const inv = new Map();
for (const e of invEntries) for (const m of e.marks) { const x = bump(inv, m.mark, () => ({ occ: 0, routes: 0 })); x.occ += m.occurrences; x.routes += m.routes_carrying_it; }
const closedSet = {};
for (const mk of new Set([...inv.keys(), ...markC.keys()])) {
  const a = inv.get(mk) || { occ: 0, routes: 0 }, b = markC.get(mk) || { occ: 0, routes: new Set() };
  closedSet[mk] = { inventory_occurrences: a.occ, inventory_routes: a.routes, jsonl_occurrences: b.occ || 0, jsonl_routes: b.routes ? b.routes.size : 0, agree: a.occ === (b.occ || 0) && a.routes === (b.routes ? b.routes.size : 0) };
}
const invRegions = invEntries.reduce((acc, e) => { for (const k of Object.keys(e.route_region_in_definition)) acc[k] = (acc[k] || 0) + e.route_region_in_definition[k]; return acc; }, {});

// ---------------------------------------------------------------- census: definitions
const records = new Map();
for (const r of rows) { const k = `${r.key}\u0000${r.def}`; if (!records.has(k)) records.set(k, { key: r.key, def: r.def, routes: new Set(), rows: 0 }); const x = records.get(k); x.routes.add(r.route); x.rows += 1; }
const defMarkPerRow = new Map(), defMarkPerRecord = new Map(), defShape = new Map(), defUnexplained = [];
for (const r of rows) for (const c of r.def) if (isMark(c)) bump(defMarkPerRow, c, () => ({ occ: 0 })).occ += 1;
let itemsTotal = 0, itemsWithRoute = 0, itemsWithoutRoute = 0, itemsWithoutRouteOnKeyElsewhere = 0, ingestCutsInsideParens = 0;
const itemsWithoutRouteEx = [], ingestCutEx = [];
for (const rec of records.values()) {
  for (const c of rec.def) if (isMark(c)) bump(defMarkPerRecord, c, () => ({ occ: 0, records: 0, _s: null })).occ += 1;
  const marksHere = new Set([...rec.def].filter(isMark)); for (const c of marksHere) defMarkPerRecord.get(c).records += 1;
  // semicolons by depth on the whole definition
  const { depth } = parens(rec.def);
  for (let i = 0; i < rec.def.length; i += 1) if (rec.def[i] === ";") {
    const sh = depth[i] > 0 ? "semicolon.inside_parentheses" : "semicolon.between_gloss_items";
    const x = bump(defShape, sh, () => ({ count: 0, records: new Set(), examples: [] })); x.count += 1; x.records.add(rec.key + rec.def);
    if (x.examples.length < 3) x.examples.push(`${rec.key}: ${win(rec.def, i)}`);
    if (sh === "semicolon.inside_parentheses") { ingestCutsInsideParens += 1; ingestCutEx.push(`${rec.key}: ${win(rec.def, i)}`); }
  }
  // the provider's items: depth-zero ';' (the ingest split at every ';')
  const items = topPieces(rec.def, ";").map((x) => x.trim());
  for (const it of items) {
    itemsTotal += 1;
    if (rec.routes.has(it)) itemsWithRoute += 1; else { itemsWithoutRoute += 1; if (byKey.get(rec.key).has(it)) itemsWithoutRouteOnKeyElsewhere += 1; else if (itemsWithoutRouteEx.length < 12) itemsWithoutRouteEx.push(`${rec.key}: ${win(it)}`); }
    for (const o of classify(it, { defItem: true })) {
      if (o.mark === ";") continue; // counted on the whole definition above
      if (!o.shape) { defUnexplained.push(`${rec.key}: ${win(it, o.i)}`); continue; }
      const x = bump(defShape, o.shape, () => ({ count: 0, records: new Set(), examples: [] })); x.count += 1; x.records.add(rec.key + rec.def);
      if (x.examples.length < 3) x.examples.push(`${rec.key}: ${win(it, o.i)}`);
    }
  }
}
// pair marks: split the pair shapes back by character for the definition
const defPairCount = (open, close) => {
  let o = 0, c = 0;
  for (const rec of records.values()) for (const it of topPieces(rec.def, ";")) for (const x of classify(it.trim(), { defItem: true })) { if (x.shape && x.mark === open) o += 1; if (x.shape && x.mark === close) c += 1; }
  return { [open]: o, [close]: c };
};

// ---------------------------------------------------------------- attestation (falsifiers)
const attest = {};
const commaRoutes = new Map();
rows.forEach((r, idx) => {
  const { shape, pieces } = commaShape(r.route);
  if (!shape) return;
  const sib = byKey.get(r.key);
  const a = pieces.map((p) => sib.has(p));
  const x = bump(commaRoutes, shape, () => ({ routes: 0, some_piece_is_a_route_on_the_key: 0, every_piece_is_a_route_on_the_key: 0, examples_some: [] }));
  x.routes += 1; if (a.some(Boolean)) { x.some_piece_is_a_route_on_the_key += 1; if (x.examples_some.length < 4) x.examples_some.push(`${r.key}: ${win(r.route)} [${a.map((b) => (b ? "A" : "-")).join("")}]`); } if (a.every(Boolean)) x.every_piece_is_a_route_on_the_key += 1;
});
attest.comma_pieces_by_route_shape = Object.fromEntries(commaRoutes);
// separated nominal lists where the first piece carries a modifier the later one-word pieces lack (could be read as written once)
const nominalModifier = [];
for (const r of rows) { const { shape, pieces } = commaShape(r.route); if (shape === "comma.complete_nominal" && pieces[0].split(/\s+/).length > 1 && pieces.slice(1).some((p) => p.split(/\s+/).length === 1)) nominalModifier.push(`${r.key}: ${win(r.route)}`); }
attest.complete_nominal_first_piece_longer = { routes: nominalModifier.length, examples: nominalModifier.slice(0, 6) };
let gtN = 0, gtL = 0, gtR = 0; const gtREx = [];
for (const r of rows) {
  const { depth } = parens(r.route);
  for (let i = 0; i < r.route.length; i += 1) if (r.route[i] === ">" && depth[i] === 0) {
    gtN += 1; const sib = byKey.get(r.key);
    if (sib.has(r.route.slice(0, i).trim())) gtL += 1;
    if (sib.has(r.route.slice(i + 1).trim())) { gtR += 1; gtREx.push(`${r.key}: ${win(r.route, i)}`); }
  }
}
let eqN = 0, eqL = 0, eqR = 0; const eqEx = [];
for (const r of rows) {
  const { depth } = parens(r.route);
  for (let i = 1; i < r.route.length; i += 1) if (r.route[i] === "=" && depth[i] === 0) {
    eqN += 1; const sib = byKey.get(r.key);
    const left = r.route.slice(0, i).trim(), right = r.route.slice(i + 1).trim();
    if (sib.has(left) || sib.has(left.replace(/^"|"$/g, ""))) eqL += 1;
    if (sib.has(right)) { eqR += 1; eqEx.push(`${r.key}: ${win(r.route, i)}`); }
  }
}
attest.eq_sides = { depth_zero_not_initial: eqN, left_side_is_a_route_on_the_key: eqL, right_side_is_a_route_on_the_key: eqR, right_examples: eqEx.slice(0, 6) };
attest.gt_sides = { depth_zero_occurrences: gtN, left_side_is_a_route_on_the_key: gtL, right_side_is_a_route_on_the_key: gtR, right_examples: gtREx.slice(0, 6) };
let parenInnerIsRoute = 0; const parenInnerEx = [];
for (const r of rows) for (const m of r.route.matchAll(/\(([^()]*)\)/g)) if (byKey.get(r.key).has(m[1].trim()) && m[1].trim() !== r.route) { parenInnerIsRoute += 1; if (parenInnerEx.length < 6) parenInnerEx.push(`${r.key}: ${win(r.route, m.index)}`); }
attest.paren_content_is_a_route_on_the_key = { count: parenInnerIsRoute, examples: parenInnerEx };
// unbalanced routes: provider's own text, or the ingest's cut?
const unbalanced = [];
rows.forEach((r) => { const p = parens(r.route); if (p.orphanClose.length || p.orphanOpen.length) { const dp = parens(r.def); const defBal = !dp.orphanClose.length && !dp.orphanOpen.length; unbalanced.push({ key: r.key, route: win(r.route), definition_balanced: defBal, cause: defBal ? "ingest_cut_inside_parentheses" : "provider_text_unbalanced" }); } });

// ---------------------------------------------------------------- the declaration's division
const SEPARATED = new Set(Object.entries(SHAPES).filter(([, v]) => v.separated === true).map(([k]) => k));
let rejoinRefusals = 0;
const declaration = (r) => {
  const p = parens(r.route);
  if (p.orphanClose.length || p.orphanOpen.length) {
    const dp = parens(r.def);
    if (!dp.orphanClose.length && !dp.orphanOpen.length) return { readings: [], held: "ingest_cut_inside_parentheses" };
    return { readings: [r.route], held: null };
  }
  const { shape, pieces } = commaShape(r.route);
  if (!shape || !SEPARATED.has(shape)) return { readings: [r.route], held: null, shape };
  if (norm(pieces.join(", ")) !== norm(r.route)) { rejoinRefusals += 1; return { readings: [r.route], held: null, shape }; }
  return { readings: pieces, held: null, shape };
};
// what readingOf in declaration-v1.mjs would do with separates_on {mark:",", scope:"( )"} and no shape gate
const ungated = (route) => {
  const p = parens(route);
  const bounds = []; let start = 0, d = 0;
  for (let i = 0; i < route.length; i += 1) { const c = route[i]; if (c === "(") { d += 1; continue; } if (c === ")") { if (d > 0) d -= 1; continue; } if (c === "," && d === 0) { bounds.push([start, i]); start = i + 1; } }
  bounds.push([start, route.length]);
  let cut = bounds;
  if (p.orphanOpen.length) { const f = p.orphanOpen[0]; const at = bounds.findIndex(([a, z]) => f >= a && f < z); cut = bounds.slice(0, at); cut.push([bounds[at][0], route.length]); }
  const pieces = cut.map(([a, z]) => route.slice(a, z).trim()).filter(Boolean);
  return pieces.length < 2 ? [route] : pieces;
};
// today's display path: gloss-store-v1.mjs packSplit (';' at depth 0, orphan closers inert) then senseSplit; a damaged sense prints nothing
const packSplit = (t) => { const out = []; let start = 0, d = 0; for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } } out.push(t.slice(start)); if (out.join(";") !== t) return [t.trim()].filter(Boolean); return out.map((x) => x.trim()).filter(Boolean); };
const v3 = (route) => { const out = []; let damaged = 0; let semi = 0; const senses = packSplit(route); if (senses.length > 1) semi = 1; for (const s of senses) { const r = senseSplit(s); if (r.damaged) { damaged += 1; continue; } out.push(...r.readings); } return { readings: out, damaged, semi }; };

// ---------------------------------------------------------------- compare
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const cmp = { routes: rows.length, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_prints_nothing_where_declaration_prints_whole: 0, both_print_nothing: 0, v3_semicolon_step_divided: 0 };
const byCause = {}; const ex = {}; const changes = []; const v3PillsByKind = {}; const v3Pieces = { total: 0, also_a_route_on_the_key: 0, not_a_route_on_the_key: 0, exactly_to_be: 0 };
let ungatedDiffers = 0; const ungatedEx = []; let ungatedVsV3Same = 0;
rows.forEach((r, idx) => {
  const v = v3(r.route); if (v.semi) cmp.v3_semicolon_step_divided += 1;
  const d = declaration(r);
  const u = ungated(r.route);
  let kind;
  if (!v.readings.length && !d.readings.length) kind = "both_print_nothing";
  else if (!v.readings.length) kind = "v3_prints_nothing_where_declaration_prints_whole";
  else if (same(v.readings, d.readings)) kind = "same_division";
  else if (v.readings.length > 1 && d.readings.length === 1) kind = "v3_divides_where_declaration_keeps_whole";
  else if (d.readings.length > 1 && v.readings.length === 1) kind = "declaration_divides_where_v3_keeps_whole";
  else kind = "divided_differently";
  cmp[kind] += 1;
  if (d.readings.length && !same(u, d.readings)) { ungatedDiffers += 1; if (ungatedEx.length < 6) ungatedEx.push(`${r.key}: ${win(r.route)}`); }
  if (kind !== "same_division") {
    const { shape } = commaShape(r.route);
    const cause = kind === "v3_prints_nothing_where_declaration_prints_whole" || kind === "both_print_nothing"
      ? (d.held || "provider_text_unbalanced") + " (v3 holds a field with unbalanced parentheses as damaged: it neither prints nor pools)"
      : `comma shape ${shape}`;
    const ck = `${kind} :: ${cause}`; byCause[ck] = (byCause[ck] || 0) + 1;
    const line = { key: r.key, route_window: win(r.route), kind, cause, v3_readings: v.readings.map((x) => win(x)), declaration_readings: d.readings.map((x) => win(x)) };
    changes.push(line);
    ((ex[kind] ||= {})[cause] ||= []).push({ key: r.key, route: win(r.route), v3: v.readings.map((x) => win(x)), declaration: d.readings.map((x) => win(x)) });
    v3PillsByKind[kind] = (v3PillsByKind[kind] || 0) + v.readings.length;
    if (kind === "v3_divides_where_declaration_keeps_whole") for (const x of v.readings) { v3Pieces.total += 1; if (byKey.get(r.key).has(x)) v3Pieces.also_a_route_on_the_key += 1; else v3Pieces.not_a_route_on_the_key += 1; if (x === "to be") v3Pieces.exactly_to_be += 1; }
  }
  if (same(u, v.readings)) ungatedVsV3Same += 1;
});

// ---------------------------------------------------------------- emit census
const shapeOut = (id) => {
  const s = SHAPES[id], c = shapeC.get(id);
  return { mark: s.mark, test: s.test, means: s.means, divides_readings: s.divides, separated: s.separated, count: c ? c.count : 0, routes: c ? c.routes.size : 0, by_region: c ? c.region : { whole: 0, slice: 0, absent: 0 }, examples: c ? c.examples : [] };
};
const marksOut = {};
const markOrder = [...markC.entries()].sort((a, b) => b[1].occ - a[1].occ).map(([k]) => k);
for (const mk of markOrder) {
  const m = markC.get(mk);
  const ids = Object.keys(SHAPES).filter((id) => SHAPES[id].mark.includes(mk) && shapeC.has(id) && [...shapeC.get(id).routes].some((ri) => rows[ri].route.includes(mk)));
  const shapes = {};
  let explained = 0;
  for (const id of ids) {
    // count only this character's occurrences inside the shape
    let n = 0; const routesSet = new Set(); const region = { whole: 0, slice: 0, absent: 0 }; const exs = []; const exT = new Set();
    rows.forEach((r, ri) => { if (!routeShapes[ri].has(id)) return; for (const o of classify(r.route)) if (o.mark === mk && o.shape === id) { n += 1; routesSet.add(ri); region[regionOf(r)] += 1; if (exs.length < 6 && !exT.has(r.route)) { exT.add(r.route); exs.push(`${r.key}: ${win(r.route, o.i)}`); } } });
    if (!n) continue;
    explained += n;
    shapes[id] = { test: SHAPES[id].test, means: SHAPES[id].means, divides_readings: SHAPES[id].divides, separated: SHAPES[id].separated, count: n, routes: routesSet.size, by_region: region, examples: exs };
  }
  const un = unexplained.filter((u) => u.mark === mk);
  marksOut[mk] = { occurrences: m.occ, routes: m.routes.size, distinct_route_texts: m.texts.size, by_region: m.region, shapes, unexplained: un.length, unexplained_examples: un.slice(0, 6).map((u) => `${u.key}: ${u.window}`), every_occurrence_in_one_shape: explained + un.length === m.occ };
}
const defOut = {};
for (const [mk, v] of [...defMarkPerRecord].sort((a, b) => b[1].occ - a[1].occ)) defOut[mk] = { occurrences_per_distinct_record: v.occ, records_carrying_it: v.records, occurrences_per_row: defMarkPerRow.get(mk).occ };
const defShapesOut = {};
for (const [id, x] of [...defShape].sort((a, b) => b[1].count - a[1].count)) defShapesOut[id] = { mark: SHAPES[id].mark, count: x.count, records: x.records.size, examples: x.examples };
// definition: per-character totals over shapes, to check every definition occurrence is explained
const defExplainedByChar = {};
for (const rec of records.values()) {
  const { depth } = parens(rec.def);
  for (let i = 0; i < rec.def.length; i += 1) if (rec.def[i] === ";") defExplainedByChar[";"] = (defExplainedByChar[";"] || 0) + 1;
  for (const it of topPieces(rec.def, ";")) for (const o of classify(it.trim(), { defItem: true })) if (o.shape && o.mark !== ";") defExplainedByChar[o.mark] = (defExplainedByChar[o.mark] || 0) + 1;
}
for (const mk of Object.keys(defOut)) { defOut[mk].explained = defExplainedByChar[mk] || 0; defOut[mk].unexplained = defOut[mk].occurrences_per_distinct_record - (defExplainedByChar[mk] || 0); }

const totalOcc = [...markC.values()].reduce((a, m) => a + m.occ, 0);
const census = {
  schema: "MARK_LEDGER_CENSUS_V1 (pilot)",
  source_key: SOURCE_KEY, m_ids: M_IDS, emitted_on: "2026-10-31", computed_by: "ledger.mjs in this folder",
  inputs: { jsonl: `by-source/${SOURCE_KEY}.jsonl`, inventory: "mark-inventory-2026-10-31.json", v3: `sense-split-v1.mjs (${V3_RULE})` },
  routes: rows.length, keys: byKey.size, distinct_records_key_and_definition: records.size,
  route_regions: { jsonl: regions, inventory: invRegions, agree: JSON.stringify(regions) === JSON.stringify({ whole: invRegions.whole, slice: invRegions.slice, absent: invRegions.absent }) },
  route_is_one_definition_item: itemExact,
  definition_items: { total: itemsTotal, with_a_route_on_the_same_record: itemsWithRoute, without: itemsWithoutRoute, without_but_a_route_on_the_same_key_elsewhere: itemsWithoutRouteOnKeyElsewhere, without_examples: itemsWithoutRouteEx },
  closed_set: { route_marks: markOrder.length, total_occurrences: totalOcc, agrees_with_inventory: Object.values(closedSet).every((x) => x.agree), per_mark: closedSet },
  route_text: { marks: marksOut, unexplained_total: unexplained.length },
  definition_text: { note: "Counted over distinct (key, definition) records, and per row as the inventory counts a route's own text. The definition is the provider's ';'-list of glosses; every mark but ';' occurs inside one item and is classified there by the same tests as a route.", marks: defOut, shapes: defShapesOut, unexplained_total: defUnexplained.length, unexplained_examples: defUnexplained.slice(0, 6), semicolon_inside_parentheses_examples: ingestCutEx, pair_marks_explained: defPairCount("(", ")") },
  unbalanced_routes: unbalanced,
  attestation: attest,
  region_dependence: "None found: the definition is one region, a ';'-list of glosses with no head and no notes; each route is one item. Every shape's by_region split is shown; no shape is confined to whole or slice routes by its meaning.",
};
writeFileSync(join(OUT, "census.json"), JSON.stringify(census, null, 1) + "\n");

const compare = {
  schema: "MARK_LEDGER_COMPARE_V1 (pilot)", source_key: SOURCE_KEY, emitted_on: "2026-10-31",
  engine_display_path: `today's card: gloss-store-v1.mjs packSplit (';' at parenthesis depth 0) then ${V3_RULE} (sense-split-v1.mjs senseSplit, imported); a damaged sense neither prints nor pools`,
  declaration: "declaration.json in this folder: ',' at depth 0 separates only in comma.complete_infinitives and comma.complete_nominal; a route whose parentheses do not balance prints whole when the provider's own definition carries the same imbalance, and is held when the ingest cut it inside the provider's parenthesis",
  ...cmp,
  by_cause: byCause,
  v3_pills_on_disagreeing_routes: v3PillsByKind,
  v3_pieces_where_v3_divides_and_declaration_keeps_whole: v3Pieces,
  examples: Object.fromEntries(Object.entries(ex).map(([kind, causes]) => {
    // up to 6 per kind, one cause at a time so every cause is shown
    const lists = Object.values(causes).map((l) => [...l]); const pick = [];
    while (pick.length < 6 && lists.some((l) => l.length)) for (const l of lists) if (l.length && pick.length < 6) pick.push(l.shift());
    return [kind, pick];
  })),
  rejoin_refusals: rejoinRefusals,
  ungated_machine: { what: "declaration-v1.mjs readingOf with separates_on {mark: ',', scope: '( )'} and no shape gate (it separates every depth-0 comma)", routes_where_it_differs_from_this_declaration: ungatedDiffers, examples: ungatedEx, routes_where_it_equals_v3: ungatedVsV3Same },
};
writeFileSync(join(OUT, "compare.json"), JSON.stringify(compare, null, 1) + "\n");
writeFileSync(join(OUT, "changes-vs-v3.jsonl"), changes.map((c) => JSON.stringify(c)).join("\n") + "\n");


// ---------------------------------------------------------------- co-occurrence and the terminal-mark series
const cooc = {};
rows.forEach((r) => { const { shape } = commaShape(r.route); if (!shape) return; const others = [...new Set([...r.route].filter((c) => isMark(c) && c !== ","))].sort().join(""); const k = `${shape} :: other marks [${others}]`; cooc[k] = (cooc[k] || 0) + 1; });
const otherDividing = { excl: [], q: [], colon: [], slash: [] };
rows.forEach((r, ri) => {
  const sh = routeShapes[ri];
  if (sh.has("excl.between_exclamations")) otherDividing.excl.push({ key: r.key, route: win(r.route), pieces_if_cut_after_the_mark: r.route.split(/(?<=!) (?=\p{L})/u).length });
  if (sh.has("q.between_uncertain_alternatives")) otherDividing.q.push({ key: r.key, route: win(r.route), pieces_if_cut_after_the_mark: r.route.split(/(?<=\?) (?=\p{L})/u).length });
  if (sh.has("colon.between_two_nouns")) otherDividing.colon.push({ key: r.key, route: win(r.route) });
  if (sh.has("slash.spaced_alternatives")) otherDividing.slash.push({ key: r.key, route: win(r.route) });
});
// does any dividing-in-meaning mark share a route with a depth-0 comma or with another one?
let dividingMixed = 0;
rows.forEach((r, ri) => { const kinds = new Set([...routeShapes[ri]].filter((id) => SHAPES[id].divides === true).map((id) => SHAPES[id].mark)); if (kinds.size > 1) dividingMixed += 1; });
census.cooccurrence = { routes_with_a_depth_zero_comma_by_shape_and_other_marks: cooc, routes_carrying_more_than_one_dividing_mark: dividingMixed };
census.dividing_in_meaning_not_separated = otherDividing;
census.terminal_mark_series = { routes: otherDividing.excl.length + otherDividing.q.length, pieces_if_cut_after_the_mark: [...otherDividing.excl, ...otherDividing.q].reduce((a, x) => a + x.pieces_if_cut_after_the_mark, 0) };
const shapesUsed = [...shapeC.keys()].length;
const defOnlyShapes = Object.keys(defShapesOut).filter((id) => !shapeC.has(id));
census.shapes_used = { route_text: shapesUsed, definition_only: defOnlyShapes, declared: Object.keys(SHAPES).length };
writeFileSync(join(OUT, "census.json"), JSON.stringify(census, null, 1) + "\n");

// ---------------------------------------------------------------- the declaration
const f = (n) => Number(n).toLocaleString("en-US");
const M = census.route_text.marks;
const sc = (mk, id) => (M[mk] && M[mk].shapes[id] ? M[mk].shapes[id].count : 0);
const shapeOcc = (mk) => Object.fromEntries(Object.entries(M[mk].shapes).map(([k, v]) => [k, v.count]));
const dividesOcc = (mk) => Object.entries(M[mk].shapes).filter(([, v]) => v.divides_readings === true).reduce((a, [, v]) => a + v.count, 0);
const sepOcc = (mk) => Object.entries(M[mk].shapes).filter(([, v]) => v.separated === true).reduce((a, [, v]) => a + v.count, 0);
const CA = attest.comma_pieces_by_route_shape;
const keptComma = ["comma.copula_elliptic", "comma.verb_head_distributed", "comma.list_with_edge_parenthesis", "comma.of_head_distributed", "comma.before_subordinate_clause"];
const keptAll = keptComma.reduce((a, k) => a + (CA[k] ? CA[k].every_piece_is_a_route_on_the_key : 0), 0);
const keptRoutes = keptComma.reduce((a, k) => a + (CA[k] ? CA[k].routes : 0), 0);
const sepRoutes = ["comma.complete_infinitives", "comma.complete_nominal"].reduce((a, k) => a + (CA[k] ? CA[k].routes : 0), 0);
const semiD = defShapesOut["semicolon.between_gloss_items"].count, semiP = (defShapesOut["semicolon.inside_parentheses"] || { count: 0 }).count;
const pairs = M["("].occurrences;
const unbProv = unbalanced.filter((u) => u.cause === "provider_text_unbalanced"), unbCut = unbalanced.filter((u) => u.cause === "ingest_cut_inside_parentheses");
const decl = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  computed_by: "ledger.mjs in this folder (every number below is read from census.json / compare.json, which the same run writes)",
  providers: {
    [SOURCE_KEY]: {
      label: invEntries[0].label,
      m_ids: M_IDS,
      routes: rows.length,
      declared_on: "2026-10-31",
      declared_from: `The entry's own structure, read across all ${f(rows.length)} routes on ${f(byKey.size)} keys (${f(records.size)} key-and-definition records). The definition is the provider's list of glosses divided by '; ' and in ${f(itemExact.routes_equal_to_one_definition_item)} of ${f(rows.length)} rows the route is exactly one item of it (${f(regions.whole)} the whole definition, ${f(regions.slice)} one item of several, ${f(regions.absent)} absent); no route carries ';'. So the provider's own division between readings is ';', and it is already made upstream: one route per item. Inside a route the closed set is ${census.closed_set.route_marks} marks and ${f(totalOcc)} occurrences, agreeing with the inventory mark for mark; every occurrence falls in exactly one of ${shapesUsed} shapes, ${unexplained.length} unexplained. ${f(dividesOcc(",") + sc("!", "excl.between_exclamations") + sc("?", "q.between_uncertain_alternatives") + sc(":", "colon.between_two_nouns") + sc("/", "slash.spaced_alternatives"))} occurrences divide readings in meaning; ${f(sepOcc(","))} of them (commas in ${f(sepRoutes)} routes, where every piece is a whole rendering) are separated.`,
      regions: {
        route_regions: regions,
        definition_regions: "one: a ';'-list of glosses, with no head and no notes",
        meaning_depends_on_region: "No. Every mark means the same in a route that is the whole definition and in a route that is one item of several (each shape's by_region split is in census.json), and the definition has no head or notes for a mark to mean something else in.",
      },
      marks: {
        ";": {
          means: "Divides one gloss from the next in the provider's definition. Definition text only: the ingest made each item a route, so no route carries it.",
          governs: semiD + semiP, records: defOut[";"].records_carrying_it, divides_readings: `yes, at ${f(semiD)} of ${f(semiD + semiP)} (between items at depth 0); separated upstream, one route per item`,
          shape_occurrences: { "semicolon.between_gloss_items": semiD, "semicolon.inside_parentheses": semiP },
          evidence: `${f(itemExact.routes_equal_to_one_definition_item)} of ${f(rows.length)} routes are exactly one '; '-item of their definition; ${f(itemsWithRoute)} of ${f(itemsTotal)} items are a route on their own record and ${f(itemsWithoutRouteOnKeyElsewhere)} more are a route on the same key under another record.`,
          falsifier: `A ';' inside the provider's parentheses: ${semiP} today (${ingestCutEx.join("; ")}). The provider wrote one item there, 'yellowish (of hair; denotes sickness)'; the ingest cut it into the routes 'yellowish (of hair' and 'denotes sickness)' (see refusals.unbalanced_parentheses).`,
        },
        "(": {
          means: "Notation inside one reading, never a division: optional letters or word part, the slot the context fills (one's, someone), an optional or explanatory qualifier, the qualifier's own list of objects, an uncertainty flag (?), a label (plural), an aside (= …, > …). It is also a scope: no mark inside it divides the route.",
          governs: pairs, routes: M["("].routes, divides_readings: "no",
          shape_occurrences: shapeOcc("("),
          evidence: `${f(sc("(", "paren.argument_placeholder"))} placeholders ('to beat (one's) breast'), ${f(sc("(", "paren.qualifier"))} qualifiers ('to flow (with tears)', '(most) holy place'), ${f(sc("(", "paren.optional_part"))} optional parts ('way(s)', '(day)light'), ${f(sc("(", "paren.list_inside"))} lists of objects ('to wear (clothes, armor)'), ${f(sc("(", "paren.uncertainty"))} '(?)'. Nested parentheses: 0.`,
          falsifier: `A parenthesis holding an alternative to the reading rather than notation inside it. Tested as: its content is itself a route of this provider on the same key: ${attest.paren_content_is_a_route_on_the_key.count} today (${attest.paren_content_is_a_route_on_the_key.examples.slice(0, 3).join("; ")}), each a homograph under the same letters (a noun the letters also spell) standing as the object of the verb or the noun of the adjective, not as an alternative.`,
        },
        ")": { means: "Closes the parenthesis it pairs with; same shapes as '('.", governs: M[")"].occurrences, routes: M[")"].routes, divides_readings: "no", shape_occurrences: shapeOcc(")") },
        ",": {
          means: "Inside one ';'-item, packs renderings of one meaning into one gloss, or punctuates within one reading. Where every piece is a whole rendering ('to go, to arrive'; 'loins, sides') it divides readings and is separated. Where a head, a frame or a qualifier is written once for all pieces ('to be, become weak'; 'to cause (mountains) to skip, jump'; 'mouth of well, cave, pit'; '(images of) hemorrhoids, tumors, ulcers') it divides readings in meaning, but a piece alone is not one of them, and the route ships whole. Inside parentheses and before a subordinate clause it divides nothing.",
          governs: M[","].occurrences, routes: M[","].routes, scoped_by: "(",
          divides_readings: `in meaning at ${f(dividesOcc(","))} of ${f(M[","].occurrences)}; separated at ${f(sepOcc(","))} (${f(sepRoutes)} routes)`,
          shape_occurrences: shapeOcc(","),
          evidence: `Separated: ${f(CA["comma.complete_infinitives"].routes)} routes of complete infinitives ('to proclaim, to announce') and ${f(CA["comma.complete_nominal"].routes)} of complete nominal renderings ('joy, delight', 'Ephrathah, Ephrath'); in ${f(CA["comma.complete_nominal"].every_piece_is_a_route_on_the_key)} of the nominal ones every piece is also a route of its own on the key ('killing, slaughter, butchering'). Kept whole: ${f(CA["comma.copula_elliptic"].routes)} 'to be, become X', ${f(CA["comma.verb_head_distributed"].routes)} with the verb frame written once, ${f(CA["comma.list_with_edge_parenthesis"].routes)} under an edge qualifier, ${f(CA["comma.of_head_distributed"].routes)} with an 'of' head written once, ${f(CA["comma.before_subordinate_clause"].routes)} before a clause. ${f(sc(",", "comma.inside_parentheses"))} commas stand inside parentheses. Across its ${f(records.size)} definitions the provider writes ',' ${f(defOut[","].occurrences_per_distinct_record)} times and ';' between items ${f(semiD)} times: one more reading is ordinarily one more item.`,
          falsifier: `For a kept-whole shape: a route whose every piece the provider also writes as a route of its own on the key, i.e. treats as a reading alone: ${keptAll} of ${keptRoutes} today. One partial hit argues the other way: '(images of) hemorrhoids, tumors, ulcers' (טחרים), where 'tumors' and 'ulcers' are routes of their own under the disease sense, so cutting would move them out from under '(images of)'. For a separated shape: pieces that do not rejoin into the route: ${rejoinRefusals} today; and a nominal list whose first piece carries a modifier the later one-word pieces lack, which could be written once for all: ${attest.complete_nominal_first_piece_longer.routes} today (${attest.complete_nominal_first_piece_longer.examples.join("; ")}), separated here because 'gathering' is a whole rendering on its own.`,
        },
        ">": {
          means: "One reading: the literal or source sense on the left, the extended sense the word carries in this use on the right ('dwelling > behavior', '\"deep of tongue\" > obscure speech'). Not a division.",
          governs: M[">"].occurrences, routes: M[">"].routes, divides_readings: "no", shape_occurrences: shapeOcc(">"),
          evidence: `Of ${f(attest.gt_sides.depth_zero_occurrences)} at depth 0, the left side is a route of its own on the key ${f(attest.gt_sides.left_side_is_a_route_on_the_key)} times (the provider lists the literal sense separately) and the right side ${f(attest.gt_sides.right_side_is_a_route_on_the_key)} times: the extended sense is never given alone.`,
          falsifier: `The right side written as a route of its own on the same key: ${attest.gt_sides.right_side_is_a_route_on_the_key} today.`,
        },
        "'": { means: "Apostrophe inside a word: possessive (one's, someone's, God's) or plural possessive (Wildgoats' Rocks).", governs: M["'"].occurrences, routes: M["'"].routes, divides_readings: "no", shape_occurrences: shapeOcc("'"), falsifier: "An apostrophe used as a quotation mark: 0 today." },
        "-": { means: "Hyphen inside a word: a compound (dwelling-place), the parts of a name (Paddan-Aram), or part of an optional piece in parentheses (plough(-point)). In the definition only, an item that is only '-' is the provider's sign that the use has no English rendering; it has no route.", governs: M["-"].occurrences, routes: M["-"].routes, divides_readings: "no", shape_occurrences: shapeOcc("-"), definition_only: { "hyphen.lone_item_no_rendering": (defShapesOut["hyphen.lone_item_no_rendering"] || { count: 0 }).count }, falsifier: "A spaced hyphen or dash between two renderings: 0 today." },
        ".": { means: "Only ever in a three-dot ellipsis: the slot the context fills ('at the age of ...', 'here ... there ...'). Not a division.", governs: M["."].occurrences, routes: M["."].routes, divides_readings: "no", shape_occurrences: shapeOcc("."), falsifier: "A period that is not one of three: 0 today." },
        "?": { means: "A question word or question that is itself the reading ('where?'), or the provider's uncertainty about a rendering ('chisel?', 'amethyst (?)'). Between two renderings ('plaque? tablet? panel? block?') it closes one uncertain rendering before the next: divides in meaning, not separated, because the mark belongs to the piece before it.", governs: M["?"].occurrences, routes: M["?"].routes, divides_readings: `in meaning at ${sc("?", "q.between_uncertain_alternatives")} of ${M["?"].occurrences}; not separated`, shape_occurrences: shapeOcc("?") },
        "!": { means: "Ends an exclamation that is the reading ('behold!'), or an aside. Between two exclamations ('woe! alas!') it closes one before the next: divides in meaning, not separated, because the mark belongs to the piece before it.", governs: M["!"].occurrences, routes: M["!"].routes, divides_readings: `in meaning at ${sc("!", "excl.between_exclamations")} of ${M["!"].occurrences}; not separated`, shape_occurrences: shapeOcc("!") },
        "\"": { means: "Quotes the literal wording of an idiom before its meaning ('\"straight way\" = safe journey'), or a cry given as written ('\"heidad\"'). Not a division.", governs: M["\""].occurrences, routes: M["\""].routes, divides_readings: "no", shape_occurrences: shapeOcc("\"") },
        "=": { means: "One reading: what the wording before it amounts to ('\"mother's house\" = mother's household', 'to catch up with (= happen)'). Not a division.", governs: M["="].occurrences, routes: M["="].routes, divides_readings: "no", shape_occurrences: shapeOcc("="), falsifier: `The right side of a depth-0 '=' written as a route of its own on the key, i.e. given as a reading apart from its wording: ${attest.eq_sides.right_side_is_a_route_on_the_key} of ${attest.eq_sides.depth_zero_not_initial} today (the left side: ${attest.eq_sides.left_side_is_a_route_on_the_key}).` },
        ":": { means: "Ends a grammatical label ('(plural:) cavalry'); once, between a masculine and a feminine noun ('sorcerer: sorceress'), where it divides in meaning and is not separated.", governs: M[":"].occurrences, routes: M[":"].routes, divides_readings: `in meaning at ${sc(":", "colon.between_two_nouns")} of ${M[":"].occurrences}; not separated`, shape_occurrences: shapeOcc(":") },
        "/": { means: "Alternation: inside one reading between two words ('his/her'), or, spaced, between completions of a head written once ('juice of purslane / mallows'), which divides in meaning and is not separated because 'mallows' alone is not the reading.", governs: M["/"].occurrences, routes: M["/"].routes, divides_readings: `in meaning at ${sc("/", "slash.spaced_alternatives")} of ${M["/"].occurrences}; not separated`, shape_occurrences: shapeOcc("/") },
        "\\": { means: "A stray character in the provider's text before a word ('to cause to bring \\birth'); not notation and not a division. Kept, as every provider character is.", governs: M["\\"].occurrences, routes: M["\\"].routes, divides_readings: "no", shape_occurrences: shapeOcc("\\") },
        "[": { means: "Opens an editorial note that stands in place of a rendering ('[untranslated]'): the provider says the word goes untranslated in some use. Not a reading and not a division.", governs: M["["].occurrences, routes: M["["].routes, divides_readings: "no", shape_occurrences: shapeOcc("[") },
        "]": { means: "Closes the editorial note.", governs: M["]"].occurrences, routes: M["]"].routes, divides_readings: "no", shape_occurrences: shapeOcc("]") },
      },
      precedence: [";", "(", ","],
      precedence_note: `';' first, and upstream: the definition divides into items, one route each. '(' next, as a scope: nothing inside a parenthesis divides. ',' last, at depth 0, and only in the two separated shapes. No route carries two dividing marks (${dividingMixed} today), so no other order is exercised; '!', '?', ':' and '/' divide in meaning in ${f(otherDividing.excl.length + otherDividing.q.length + otherDividing.colon.length + otherDividing.slash.length)} routes and separate nowhere, so they take no place in the order.`,
      refusals: {
        unbalanced_parentheses: {
          routes: unbalanced.length,
          provider_text_unbalanced: { routes: unbProv.length, rule: "ship whole", why: "The definition carries the same imbalance, so the route is the provider's own characters. As in the August Strong's declaration, an orphan closer is inert and an unclosed opener holds everything after it; neither route has a comma, so each ships whole.", keys: unbProv.map((u) => `${u.key}: ${u.route}`) },
          ingest_cut_inside_parentheses: { routes: unbCut.length, rule: "hold (print nothing)", why: "The definition balances: the provider wrote one item, and the ingest's split at every ';' cut it inside the provider's parenthesis. Neither piece is a reading the provider wrote. Restoring the item is the store's work, not the page's (open question).", keys: unbCut.map((u) => `${u.key}: ${u.route}`) },
        },
        pieces_that_do_not_rejoin: { routes: rejoinRefusals, rule: "ship whole" },
        elliptic_packing: { routes: keptRoutes - (CA["comma.before_subordinate_clause"] ? CA["comma.before_subordinate_clause"].routes : 0), rule: "ship whole", why: "A piece alone is not the reading: the shared head, frame or qualifier is written once. Completing a piece ('to become weak') would join characters the provider never wrote together, which is a derivation." },
      },
      export: "governed by its posture, cc_by_sa_4_0",
      separates_on: {
        mark: ",",
        scope: "( )",
        only_in_shapes: ["comma.complete_infinitives", "comma.complete_nominal"],
        shape_tests: { "comma.complete_infinitives": SHAPES["comma.complete_infinitives"].test, "comma.complete_nominal": SHAPES["comma.complete_nominal"].test },
        declared_from: `${f(M[","].occurrences)} commas in ${f(M[","].routes)} routes; ${f(sc(",", "comma.inside_parentheses"))} stand inside parentheses and ${f(sepOcc(","))} (in ${f(sepRoutes)} routes) stand between whole renderings. The other ${f(keptRoutes)} routes with a depth-0 comma write a shared part once, or set off a clause.`,
        rule: "Separate on commas outside every parenthesis, in the two shapes only. Every piece is kept, each a run of the provider's characters; nothing is completed, distributed or stripped.",
        machinery: `declaration-v1.mjs readingOf separates on every depth-0 comma once separates_on names one; it has no shape gate. Merged as it is, it would cut ${compare.ungated_machine.routes_where_it_differs_from_this_declaration} routes this declaration keeps whole. The gate (only_in_shapes with its tests) must be in the machine first.`,
      },
      open_questions_for_owner: [
        `1. Commas this declaration keeps whole and v3 cuts, ${f(compare.v3_divides_where_declaration_keeps_whole)} routes (copula ${CA["comma.copula_elliptic"].routes}, verb frame written once ${CA["comma.verb_head_distributed"].routes}, edge qualifier ${CA["comma.list_with_edge_parenthesis"].routes}, 'of' head ${CA["comma.of_head_distributed"].routes}, clause ${CA["comma.before_subordinate_clause"].routes}). Reading A, this declaration: one pill, the provider's gloss whole ('to be, become weak'). Reading B, today's card (v3): ${f(compare.v3_pieces_where_v3_divides_and_declaration_keeps_whole.total)} pills, ${f(compare.v3_pieces_where_v3_divides_and_declaration_keeps_whole.not_a_route_on_the_key)} of them a text the provider never gives alone on the key, among them 'to be' ${compare.v3_pieces_where_v3_divides_and_declaration_keeps_whole.exactly_to_be} times, 'jump', 'set foot', 'cave', 'pit'.`,
        `2. Terminal-mark series, ${census.terminal_mark_series.routes} routes ('woe! alas!', 'kneel! bow down!', 'would that ...! if only ...!', 'plaque? tablet? panel? block?', 'horn? trumpet?'). Reading A, today and this declaration: one pill each. Reading B: cut after the mark, the mark kept on each piece: ${census.terminal_mark_series.pieces_if_cut_after_the_mark} pills. B needs a separation mode the machine lacks (it drops the separator).`,
        `3. Unbalanced parentheses, ${unbalanced.length} routes. (a) ${unbProv.length} routes whose own definition carries the imbalance (${unbProv.map((u) => u.key).join(", ")}): A, this declaration: print whole, as the August Strong's declaration treats an orphan closer and an unclosed opener; B, today (v3 rule 4): print nothing. (b) ${unbCut.length} routes the ingest cut out of one provider item inside its parenthesis (${[...new Set(unbCut.map((u) => u.key))].join(", ")}): A, today and this declaration: hold both; B: the route store re-emits the provider's item 'yellowish (of hair; denotes sickness)' as one route.`,
        `4. '[untranslated]' (${M["["].routes} route): A, today and this declaration: printed as a reading, whole; B: withheld as the provider's editorial note, not a rendering.`,
        `5. 'sorcerer: sorceress' (${sc(":", "colon.between_two_nouns")} route), the only colon between two nouns: A, today and this declaration: one pill; B: two readings divided at the colon.`,
      ],
      not_done_here: "No piece is completed or distributed: 'to be, become weak' is not rewritten as 'to be weak' and 'to become weak', and 'mouth of well, cave, pit' does not become 'mouth of cave'. No mark is stripped: '?', '!', '(?)', '(one's)', '\"…\"' and '>' stay where the provider wrote them. The definition is not mined for a reading. The ingest's cut inside צהב's parenthesis is reported, not repaired.",
    },
  },
};
writeFileSync(join(OUT, "declaration.json"), JSON.stringify(decl, null, 1) + "\n");

export { census, compare, SHAPES, shapeC, commaRoutes, unbalanced };
console.log(JSON.stringify({ routes: rows.length, marks: markOrder.length, totalOcc, unexplained: unexplained.length, defUnexplained: defUnexplained.length, closedSetAgrees: census.closed_set.agrees_with_inventory, regions: census.route_regions, cmp, rejoinRefusals, ungatedDiffers }, null, 1));
