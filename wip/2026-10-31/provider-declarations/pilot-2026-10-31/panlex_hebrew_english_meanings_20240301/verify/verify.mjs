// Independent verifier for the PanLex (M21) draft declaration.
// Classifier written from the shape TESTS as stated in words; the draft's census.mjs is not used.
// Single process, one provider file. Read-only except writing results.json next to this script.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const SRC = path.join(ROOT, "by-source/panlex_hebrew_english_meanings_20240301.jsonl");
const DECL = path.join(ROOT, "pilot/panlex_hebrew_english_meanings_20240301/declaration.json");
const V3 = path.resolve(ROOT, "../ghp/reader/tools/sense-split-v1.mjs");
const { senseSplit } = await import(V3);

const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const decl = JSON.parse(fs.readFileSync(DECL, "utf8")).providers.panlex_hebrew_english_meanings_20240301;

const isL = (c) => c != null && /\p{L}/u.test(c);
const isD = (c) => c != null && /\p{N}/u.test(c);
const isUp = (c) => c != null && /\p{Lu}/u.test(c);
const isLo = (c) => c != null && /\p{Ll}/u.test(c);
const isSp = (c) => c != null && /\s/u.test(c);
const isApos = (c) => c === "'" || c === "’";
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const win = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s);
const wordStart = (s, i) => i === 0 || isSp(s[i - 1]) || s[i - 1] === "-";
const words = (p) => p.split(/\s+/u).filter(Boolean);
const oneWord = (p) => p.length > 0 && !/\s/u.test(p);
const CONJ = /^(and|or|nor|but)$/iu;
const hasAndOr = (p) => words(p).some((w) => /^(and|or)$/iu.test(w));

// parenthesis depth at each index (depth of the character's context, before applying it if it is a paren)
const depths = (s) => { const d = []; let k = 0; for (let i = 0; i < s.length; i++) { if (s[i] === ")") k--; d.push(k); if (s[i] === "(") k++; } return d; };
const splitDepth0 = (s, ch) => { const d = depths(s); const out = []; let st = 0; for (let i = 0; i < s.length; i++) if (s[i] === ch && d[i] === 0) { out.push(s.slice(st, i)); st = i + 1; } out.push(s.slice(st)); return out; };

// comma field-level shape tests (as worded)
const commaShapes = (field, i, d) => {
  const out = [];
  if (d[i] > 0) { out.push("comma-inside-parentheses"); return out; }
  const pieces = splitDepth0(field, ",").map((p) => p.trim());
  const last = pieces[pieces.length - 1];
  if (pieces.every(oneWord) && !pieces.some((p) => CONJ.test(p)) && last !== "to") out.push("comma-single-word-list");
  if (last === "to") out.push("comma-before-postposed-to");
  if (pieces.some((p) => !oneWord(p) && hasAndOr(p))) out.push("comma-in-coordinated-idiom");
  if (pieces.every((p) => isUp(p[0])) && pieces.some((p) => !oneWord(p)) && !pieces.some(hasAndOr)) out.push("comma-in-proper-name");
  if (!/\p{Lu}/u.test(field) && pieces.slice(0, -1).every(oneWord) && words(last).length > 1 && !pieces.some(hasAndOr)) out.push("comma-before-shared-tail");
  return out;
};

const classify = (s, i) => {
  const c = s[i], p = s[i - 1], n = s[i + 1], d = depths(s);
  const out = [];
  switch (c) {
    case "-":
      if ((isL(p) || isApos(p)) && (isL(n) || isApos(n))) out.push("hyphen-in-compound-word");
      if ((isL(p) || isD(p)) && (isL(n) || isD(n)) && (isD(p) || isD(n))) out.push("hyphen-in-designation");
      if (i === s.length - 1 && isL(p)) out.push("hyphen-ending-prefix");
      if (i === 0 && isL(n)) out.push("hyphen-opening-suffix");
      if (isSp(p) && isSp(n)) out.push("hyphen-between-spaces");
      break;
    case "’":
      if (isL(p) && isL(n)) out.push("curly-apostrophe-inside-word");
      if (wordStart(s, i) && isLo(n)) out.push("curly-apostrophe-clipped-front");
      if (wordStart(s, i) && isUp(n)) out.push("curly-apostrophe-opening-name");
      if (isL(p) && (n == null || isSp(n) || n === "/")) out.push("curly-apostrophe-word-final");
      break;
    case ".": {
      const dom = isL(p) && /^(com|org|net|edu|gov)(?![\p{L}\p{N}])/u.test(s.slice(i + 1));
      if (dom) out.push("period-in-domain-name");
      if (isL(p) && !isL(s[i - 2])) out.push("period-after-one-letter");
      if (isL(p) && isL(s[i - 2]) && !dom) out.push("period-after-abbreviation");
      break;
    }
    case ",": out.push(...commaShapes(s, i, d)); break;
    case "'": {
      if (isL(p) && isL(n)) out.push("ascii-apostrophe-inside-word");
      if (wordStart(s, i) && isLo(n)) out.push("ascii-apostrophe-clipped-front");
      // whole whitespace-bounded token made of exactly two apostrophes
      let a = i; while (a > 0 && !isSp(s[a - 1])) a--; let b = i; while (b < s.length - 1 && !isSp(s[b + 1])) b++;
      if (s.slice(a, b + 1) === "''") out.push("ascii-apostrophe-pair-token");
      break;
    }
    case "/": {
      if (d[i] === 0 && !isSp(p) && !isSp(n) && p != null && n != null) {
        const sides = splitDepth0(s, "/");
        if (sides.every((x) => oneWord(x) && isUp(x[0]))) out.push("slash-between-capitalized-names");
        if (sides.every((x) => x.startsWith("the "))) out.push("slash-between-the-phrases");
      }
      break;
    }
    case "?": if (p === "!") out.push("question-in-title"); break;
    case ":":
      if (isD(p) && isD(n)) out.push("colon-in-clock-time");
      if (isL(p) && n === " " && isUp(s[i + 2])) out.push("colon-before-subtitle");
      break;
    case "!":
      if (wordStart(s, i) && isL(n)) out.push("exclamation-click-letter");
      if (isL(p) && n === "?") out.push("exclamation-in-title");
      break;
    case "_": if (isL(p) && isL(n)) out.push("underscore-sense-tag"); break;
    case "(": {
      const j = s.indexOf(")", i);
      if (isSp(p) && j > i && /^\p{Lu}{2,}$/u.test(s.slice(i + 1, j))) out.push("paren-acronym-aside");
      break;
    }
    case ")": {
      const j = s.lastIndexOf("(", i);
      if (j >= 0 && /^\p{Lu}+$/u.test(s.slice(j + 1, i))) out.push("paren-acronym-aside-close");
      break;
    }
    case "#": if (wordStart(s, i) && isL(n) && s.includes("|")) out.push("hash-anchor"); break;
    case "|": if (isL(n) && /(^|\s)#/u.test(s)) out.push("pipe-link-label"); break;
  }
  return out;
};

const DIVIDES = new Set(["comma-single-word-list", "slash-between-capitalized-names", "slash-between-the-phrases"]);

// ---- census ----
const markTot = {}, markRoutes = {}, shapeCount = {}, shapeRoutes = {}, unexplained = {}, multi = {};
let occ = 0, exactlyOne = 0, none = 0, many = 0, regionWhole = 0, routeDefDiffer = 0;
const shapeExamples = {};
for (const r of rows) {
  const s = r.route;
  if (s === r.def) regionWhole++; else routeDefDiffer++;
  const seenM = new Set(), seenS = new Set();
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!isMark(c)) continue;
    occ++; markTot[c] = (markTot[c] || 0) + 1; seenM.add(c);
    const sh = classify(s, i);
    if (sh.length === 1) exactlyOne++;
    else if (sh.length === 0) { none++; (unexplained[c] ??= []).push(`${r.key} | ${win(s)}`); }
    else { many++; (multi[c] ??= []).push(`${r.key} | ${win(s)} :: ${sh.join("+")}`); }
    for (const x of sh) { shapeCount[x] = (shapeCount[x] || 0) + 1; seenS.add(x); ((shapeExamples[x] ??= new Set()).size < 60) && shapeExamples[x].add(`${r.key} | ${win(s)}`); }
  }
  for (const c of seenM) markRoutes[c] = (markRoutes[c] || 0) + 1;
  for (const x of seenS) shapeRoutes[x] = (shapeRoutes[x] || 0) + 1;
}

// ---- compare against the draft ----
const countDiffs = [];
for (const [m, v] of Object.entries(decl.marks)) {
  if ((markTot[m] || 0) !== v.governs) countDiffs.push(`mark ${m}: governs ${v.governs} vs measured ${markTot[m] || 0}`);
  if ((markRoutes[m] || 0) !== v.routes) countDiffs.push(`mark ${m}: routes ${v.routes} vs measured ${markRoutes[m] || 0}`);
  for (const [sn, sv] of Object.entries(v.shapes || {})) {
    if ((shapeCount[sn] || 0) !== sv.count) countDiffs.push(`shape ${sn}: count ${sv.count} vs measured ${shapeCount[sn] || 0}`);
    if (sv.routes != null && (shapeRoutes[sn] || 0) !== sv.routes) countDiffs.push(`shape ${sn}: routes ${sv.routes} vs measured ${shapeRoutes[sn] || 0}`);
    if (!!sv.divides !== DIVIDES.has(sn)) countDiffs.push(`shape ${sn}: divides flag ${sv.divides} vs verifier ${DIVIDES.has(sn)}`);
  }
  const declaredUnexpl = v.unexplained || 0;
  const measuredUnexpl = (unexplained[m] || []).length;
  if (declaredUnexpl !== measuredUnexpl) countDiffs.push(`mark ${m}: unexplained ${declaredUnexpl} vs measured ${measuredUnexpl}`);
}
for (const m of Object.keys(markTot)) if (!decl.marks[m]) countDiffs.push(`mark ${m} present (${markTot[m]}) but undeclared`);
const noMarkRoutes = rows.filter((r) => ![...r.route].some(isMark)).length;
const noCommaRoutes = rows.filter((r) => !r.route.includes(",")).length;

// ---- declaration division (as separates_on states it) ----
const declSplit = (s) => {
  const slashIdx = [];
  for (let i = 0; i < s.length; i++) if (s[i] === "/" && classify(s, i).some((x) => DIVIDES.has(x))) slashIdx.push(i);
  const sides = []; let st = 0; for (const i of slashIdx) { sides.push(s.slice(st, i)); st = i + 1; } sides.push(s.slice(st));
  const out = [];
  for (const side of sides) {
    const ci = []; for (let i = 0; i < side.length; i++) if (side[i] === "," && classify(side, i).includes("comma-single-word-list")) ci.push(i);
    let a = 0; for (const i of ci) { out.push(side.slice(a, i)); a = i + 1; } out.push(side.slice(a));
  }
  // every piece a run of the provider's characters; rejoin check (by position) – pieces come from slices, so rejoin with the cut marks
  return out.map((p) => p.trim()).filter(Boolean);
};
const cmp = { fields_compared: 0, same_division: 0, both_whole: 0, both_divided_same: 0, v3_divides_decl_whole: 0, decl_divides_v3_whole: 0, divided_differently: 0, v3_damaged: 0 };
const cmpEx = { v3_divides_decl_whole: [], decl_divides_v3_whole: [], divided_differently: [], both_divided_same: [] };
let declReadings = 0, declDividedRoutes = 0, declByComma = 0, declBySlash = 0;
for (const r of rows) {
  const s = r.route; cmp.fields_compared++;
  const v = senseSplit(s); if (v.damaged) cmp.v3_damaged++;
  const vr = v.readings.map((x) => x.trim());
  const dr = declSplit(s);
  if (dr.length > 1) { declDividedRoutes++; declReadings += dr.length; if (s.includes("/")) declBySlash++; else declByComma++; }
  const vWhole = vr.length <= 1, dWhole = dr.length <= 1;
  const tag = `${r.key} | ${win(s)} -> v3: ${vr.join(" ‖ ")} / decl: ${dr.join(" ‖ ")}`;
  if (vWhole && dWhole) { cmp.same_division++; cmp.both_whole++; }
  else if (!vWhole && !dWhole && JSON.stringify(vr) === JSON.stringify(dr)) { cmp.same_division++; cmp.both_divided_same++; cmpEx.both_divided_same.push(tag); }
  else if (!vWhole && dWhole) { cmp.v3_divides_decl_whole++; cmpEx.v3_divides_decl_whole.push(tag); }
  else if (vWhole && !dWhole) { cmp.decl_divides_v3_whole++; cmpEx.decl_divides_v3_whole.push(tag); }
  else { cmp.divided_differently++; cmpEx.divided_differently.push(tag); }
}

// ---- falsification probes ----
const routesByKey = new Map(); for (const r of rows) { if (!routesByKey.has(r.key)) routesByKey.set(r.key, new Set()); routesByKey.get(r.key).add(r.route); }
const allRoutes = new Set(rows.map((r) => r.route));
const FUNC = /^(a|an|the|to|of|in|on|at|by|for|with|from|up|down|out|off|as|be|is|not|no|very|more|most|so|too|than|that|this|it)$/iu;
const fals = { comma_single_word_list: {}, slash: {}, hyphen_compound: {}, period: {}, apostrophe: {}, other: {} };
// comma list probes
const commaRows = rows.filter((r) => [...r.route].some((c, i) => c === "," && classify(r.route, i).includes("comma-single-word-list")));
const cl = fals.comma_single_word_list;
cl.routes = commaRows.length;
cl.attempt1_function_word_piece = commaRows.filter((r) => splitDepth0(r.route, ",").some((p) => FUNC.test(p.trim()))).map((r) => `${r.key} | ${win(r.route)}`);
cl.attempt2_capitalized_piece_possible_proper_name = commaRows.filter((r) => splitDepth0(r.route, ",").some((p) => isUp(p.trim()[0]))).map((r) => `${r.key} | ${win(r.route)}`);
cl.attempt3_duplicate_piece = commaRows.filter((r) => { const ps = splitDepth0(r.route, ",").map((p) => p.trim().toLowerCase()); return new Set(ps).size !== ps.length; }).map((r) => `${r.key} | ${win(r.route)}`);
cl.attempt4_piece_with_adjective_or_adverb_suffix = commaRows.filter((r) => splitDepth0(r.route, ",").some((p) => /(ly|ous|ful|ive|able|ible|al|ic)$/iu.test(p.trim()))).map((r) => `${r.key} | ${win(r.route)}`);
cl.attempt5_piece_also_standalone_route_anywhere = commaRows.map((r) => { const ps = splitDepth0(r.route, ",").map((p) => p.trim()); return `${r.key} | ${win(r.route)} :: standalone ${ps.filter((p) => allRoutes.has(p)).length}/${ps.length}; same key ${ps.filter((p) => routesByKey.get(r.key).has(p)).length}/${ps.length}`; });
cl.attempt6_whole_field_repeated_under_other_keys = [...new Set(commaRows.map((r) => r.route))].map((f) => `${win(f)} :: keys ${rows.filter((x) => x.route === f).map((x) => x.key).join(" ")}`);
cl.all_rows = commaRows.map((r) => `${r.key} | ${win(r.route)} -> ${declSplit(r.route).join(" ‖ ")}`);
// slash probes
const slashRows = rows.filter((r) => r.route.includes("/"));
const sl = fals.slash;
sl.attempt1_digit_side_fraction_or_date = slashRows.filter((r) => /\p{N}/u.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);
sl.attempt2_pronoun_or_andor_pair = slashRows.filter((r) => /\b(he|she|his|her|him|and|or|s)\/|\/(he|she|his|her|him|and|or|s)\b/iu.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);
sl.attempt3_side_fragment_shared_head_or_tail = slashRows.map((r) => { const sides = r.route.split("/"); return `${r.key} | ${win(r.route)} :: side words ${sides.map((x) => words(x).length).join("/")}; sides end alike ${sides.every((x) => x.endsWith(sides[0].slice(-4)))}`; });
sl.attempt4_side_also_a_route_same_key = slashRows.map((r) => `${r.key} | ${win(r.route)} :: ${r.route.split("/").map((x) => `${x}=${routesByKey.get(r.key).has(x)}`).join(", ")}; other routes of key: ${[...routesByKey.get(r.key)].filter((x) => x !== r.route).slice(0, 8).map(win).join(" ; ")}`);
// hyphen compound probe: both hyphen parts are themselves routes of the same key (hyphen joining two alternatives?)
const hc = [];
for (const r of rows) { const s = r.route; for (let i = 0; i < s.length; i++) if (s[i] === "-" && classify(s, i).includes("hyphen-in-compound-word")) { const a = s.slice(0, i).split(/\s/).pop(), b = s.slice(i + 1).split(/[\s-]/)[0]; if (routesByKey.get(r.key).has(a) && routesByKey.get(r.key).has(b)) hc.push(`${r.key} | ${win(s)}`); } }
fals.hyphen_compound.both_parts_are_routes_of_same_key = hc;
fals.hyphen_compound.between_spaces_rows = rows.filter((r) => / - /.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);
fals.hyphen_compound.edge_hyphen_rows = rows.filter((r) => /^-|-$/.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);
// period: followed by space + capital (possible sentence end), and periods mid-field after a word of 3+ letters
fals.period.followed_by_space_capital = rows.filter((r) => /\.\s\p{Lu}/u.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);
fals.period.abbreviation_rows = [...(shapeExamples["period-after-abbreviation"] || [])];
fals.period.one_letter_rows = [...(shapeExamples["period-after-one-letter"] || [])];
// apostrophes: fields with an opener at word start and a closer at word end (quotation pair)
fals.apostrophe.quote_pair_candidates = rows.filter((r) => /(^|\s)['’]\p{L}.*\p{L}['’](\s|$)/u.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);
fals.apostrophe.word_final_rows = [...(shapeExamples["curly-apostrophe-word-final"] || [])];
fals.apostrophe.clipped_front_rows = [...(shapeExamples["curly-apostrophe-clipped-front"] || []), ...(shapeExamples["ascii-apostrophe-clipped-front"] || [])];
fals.apostrophe.opening_name_rows = [...(shapeExamples["curly-apostrophe-opening-name"] || [])];
fals.other.designation_rows = [...(shapeExamples["hyphen-in-designation"] || [])];
fals.other.question_unexplained_other_routes_of_key = (unexplained["?"] || []).map((u) => { const k = u.split(" | ")[0]; return `${k} :: ${[...routesByKey.get(k)].slice(0, 12).map(win).join(" ; ")}`; });
fals.other.hayward_without_question = rows.filter((r) => /Hayward/u.test(r.route)).map((r) => `${r.key} | ${win(r.route)}`);

// inventory cross-check
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, "mark-inventory-2026-10-31.json"), "utf8")).providers.find((e) => e.provider === "M21");
const invDiffs = [];
for (const e of inv.marks) { if ((markTot[e.mark] || 0) !== e.occurrences || (markRoutes[e.mark] || 0) !== e.routes_carrying_it) invDiffs.push(`${e.mark}: inv ${e.occurrences}/${e.routes_carrying_it} vs ${markTot[e.mark] || 0}/${markRoutes[e.mark] || 0}`); }
for (const m of Object.keys(markTot)) if (!inv.marks.some((e) => e.mark === m)) invDiffs.push(`${m} missing from inventory`);
const inventory_check = { inventory_marks: inv.marks.length, measured_marks: Object.keys(markTot).length, diffs: invDiffs, region: inv.route_region_in_definition };
const commaPieces = commaRows.map((r) => splitDepth0(r.route, ",").map((p) => p.trim()));
const piece_tally = { pieces: commaPieces.flat().length, standalone_anywhere: commaPieces.flat().filter((p) => allRoutes.has(p)).length, same_key: commaRows.reduce((n, r, k) => n + commaPieces[k].filter((p) => routesByKey.get(r.key).has(p)).length, 0) };
const result = { inventory_check, piece_tally,
  rows: rows.length, region: { whole: regionWhole, route_differs_from_def: routeDefDiffer },
  occurrences: occ, exactly_one_shape: exactlyOne, no_shape: none, two_or_more_shapes: many,
  no_mark_routes: noMarkRoutes, no_comma_routes: noCommaRoutes,
  marks: Object.fromEntries(Object.keys(markTot).map((m) => [m, { occurrences: markTot[m], routes: markRoutes[m] }])),
  shapes: Object.fromEntries(Object.keys(shapeCount).map((s) => [s, { count: shapeCount[s], routes: shapeRoutes[s], divides: DIVIDES.has(s) }])),
  unexplained, multi, count_diffs_vs_draft: countDiffs,
  decl_division: { divided_routes: declDividedRoutes, readings: declReadings, by_comma: declByComma, by_slash: declBySlash },
  v3_comparison: cmp, v3_examples: cmpEx, falsification: fals,
};
fs.writeFileSync(path.join(HERE, "results.json"), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ ...result, v3_examples: undefined, falsification: undefined }, null, 1));
