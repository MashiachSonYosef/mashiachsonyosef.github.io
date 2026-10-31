// Independent verifier for the drafted declaration of macula_hebrew_cherith_surface_english_2022.
// Written from the shape TESTS as stated in words; does not import or read the draft's census.mjs.
// Single process, one provider file. Output: verify.json next to this script.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUNCT = path.resolve(HERE, "../..");
const SRC = path.join(PUNCT, "by-source/macula_hebrew_cherith_surface_english_2022.jsonl");
const DRAFT = path.join(PUNCT, "pilot/macula_hebrew_cherith_surface_english_2022/declaration.json");
const SS = path.resolve(PUNCT, "../ghp/reader/tools/sense-split-v1.mjs");
const { senseSplit, RULE_ID } = await import(SS);

const W = (s, n = 60) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const isMark = (c) => c !== undefined && !/[\p{L}\p{N}\s]/u.test(c);
const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
const isWord = (c) => c !== undefined && /[\p{L}\p{N}]/u.test(c);
const isWS = (c) => c !== undefined && /\s/u.test(c);
const NUM = String.raw`\d+\p{L}?`;
const RE_NUM = new RegExp(`^${NUM}$`, "u");
const RE_EQ = new RegExp(`^${NUM}=${NUM}\\+${NUM}$`, "u");
const RE_ENG = /^[\p{L}\s]*\p{L}[\p{L}\s]*$/u;

const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const byKey = new Map();
for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, new Set()); byKey.get(r.key).add(r.route); }

// pair parentheses
const pairParens = (a) => {
  const open = [], pairOf = new Map(); let unbalanced = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "(") open.push(i);
    else if (a[i] === ")") { if (open.length) { const o = open.pop(); pairOf.set(o, i); pairOf.set(i, o); } else unbalanced++; }
  }
  unbalanced += open.length;
  return { pairOf, unbalanced };
};
const parenShape = (a, o, c) => {
  const content = a.slice(o + 1, c).join("");
  if (RE_NUM.test(content)) return "strongs_number";
  if (RE_EQ.test(content)) return "number_equation";
  if (RE_ENG.test(content)) {
    if (o === 0 && c === a.length - 1) return "supplied_whole_route";
    const outside = a.slice(0, o).concat(a.slice(c + 1));
    if (outside.some(isLetter)) return "supplied_inside_route";
  }
  return null;
};
const enclosing = (a, i, pairOf) => { // innermost matched pair enclosing i
  let best = null;
  for (const [o, c] of pairOf) if (a[o] === "(" && o < i && c > i && (!best || o > best[0])) best = [o, c];
  return best;
};

// shape tests, each independent; an occurrence's matched list must have length 1
const tests = (mark, a, i, ctx) => {
  const n = a.length, out = [];
  const T = (name, cond) => { if (cond) out.push(name); };
  switch (mark) {
    case "~":
      T("tilde.gap_between_words", a[i - 1] === " " && a[i + 1] === " " && isWord(a[i - 2]) && isWord(a[i + 2]));
      T("tilde.gap_at_head", i === 0 && isLetter(a[1]));
      T("tilde.gap_at_tail", i === n - 1 && isLetter(a[n - 2]));
      break;
    case "’":
      T("apostrophe.possessive_s", isLetter(a[i - 1]) && (a[i + 1] === "s" || a[i + 1] === "S") && !isLetter(a[i + 2]));
      T("apostrophe.plural_possessive", a[i - 1] === "s" && !isLetter(a[i + 1]));
      T("apostrophe.contraction_nt", a[i - 1] === "n" && a[i + 1] === "t");
      break;
    case "-":
      T("hyphen.compound_join", isLetter(a[i - 1]) && isLetter(a[i + 1]));
      T("hyphen.bound_suffix", i === 0 && isLetter(a[1]));
      break;
    case "!": case "?": {
      const p = mark === "!" ? "exclamation" : "question";
      T(`${p}.final_on_word`, i === n - 1 && isLetter(a[i - 1]));
      T(`${p}.final_after_space`, i === n - 1 && a[i - 1] === " ");
      break;
    }
    case "(": case ")": {
      const p = mark === "(" ? "open" : "close";
      if (ctx.pairOf.has(i)) {
        const o = mark === "(" ? i : ctx.pairOf.get(i), c = mark === "(" ? ctx.pairOf.get(i) : i;
        const s = parenShape(a, o, c);
        T(`${p}.strongs_number`, s === "strongs_number");
        T(`${p}.number_equation`, s === "number_equation");
        T(`${p}.supplied_whole_route`, s === "supplied_whole_route");
        T(`${p}.supplied_inside_route`, s === "supplied_inside_route");
      }
      break;
    }
    case "=": case "+": {
      const e = enclosing(a, i, ctx.pairOf);
      const ok = e && RE_EQ.test(a.slice(e[0] + 1, e[1]).join(""));
      T(mark === "=" ? "equals.in_number_equation" : "plus.in_number_equation", !!ok);
      break;
    }
    case ".":
      T("period.at_head_glued", i === 0 && isLetter(a[1]));
      break;
    case "/":
      T("slash.between_words", isLetter(a[i - 1]) && isLetter(a[i + 1]));
      break;
  }
  return out;
};

const DRAFT_COUNTS = {
  "tilde.gap_between_words": 1871, "tilde.gap_at_head": 8, "tilde.gap_at_tail": 1,
  "apostrophe.possessive_s": 229, "apostrophe.plural_possessive": 38, "apostrophe.contraction_nt": 14,
  "hyphen.compound_join": 117, "hyphen.bound_suffix": 1,
  "exclamation.final_on_word": 26, "exclamation.final_after_space": 1,
  "question.final_on_word": 21, "question.final_after_space": 1,
  "open.strongs_number": 4, "open.number_equation": 2, "open.supplied_whole_route": 3, "open.supplied_inside_route": 4,
  "close.strongs_number": 4, "close.number_equation": 2, "close.supplied_whole_route": 3, "close.supplied_inside_route": 4,
  "equals.in_number_equation": 2, "plus.in_number_equation": 2, "period.at_head_glued": 1, "slash.between_words": 1,
};
const DRAFT_MARK_OCC = { "~": 1880, "’": 281, "-": 118, "!": 27, "?": 22, "(": 13, ")": 13, "=": 2, "+": 2, ".": 1, "/": 1 };

const markOcc = {}, markRoutes = {}, shapeCount = {}, shapeEx = {}, unexplained = [], multi = [];
const shapeRows = {}; // shape -> list of {key, route, i}
let routeIsDef = 0, noMark = 0, routeComma = 0, routeSemi = 0, defComma = 0, defSemi = 0, unbalancedRoutes = 0;
let twoTildeRoutes = 0, maxTilde = 0, leadTrailWS = 0;
const undeclaredMarkRoutes = [];
const draft = JSON.parse(fs.readFileSync(DRAFT, "utf8")).providers.macula_hebrew_cherith_surface_english_2022;
const declared = new Set(Object.keys(draft.marks));

// v3 comparison
const v3 = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_damaged: 0, v3_single_reading_not_byte_identical: 0, examples: [] };

for (const r of rows) {
  const R = String(r.route), a = [...R];
  if (R === r.def) routeIsDef++;
  for (const c of R) { if (c === ",") routeComma++; if (c === ";") routeSemi++; }
  for (const c of String(r.def)) { if (c === ",") defComma++; if (c === ";") defSemi++; }
  if (R !== R.trim()) leadTrailWS++;
  const ctx = pairParens(a);
  if (ctx.unbalanced) unbalancedRoutes++;
  const seen = new Set(); let tildes = 0;
  for (let i = 0; i < a.length; i++) {
    const c = a[i]; if (!isMark(c)) continue;
    seen.add(c); markOcc[c] = (markOcc[c] || 0) + 1; if (c === "~") tildes++;
    const m = tests(c, a, i, ctx);
    if (m.length === 0) unexplained.push({ key: r.key, mark: c, at: i, window: W(R) });
    else if (m.length > 1) multi.push({ key: r.key, mark: c, at: i, shapes: m, window: W(R) });
    for (const s of m) {
      shapeCount[s] = (shapeCount[s] || 0) + 1;
      (shapeRows[s] ||= []).push({ key: r.key, route: R, i });
    }
  }
  if (tildes === 2) twoTildeRoutes++; maxTilde = Math.max(maxTilde, tildes);
  if (!seen.size) noMark++;
  for (const c of seen) markRoutes[c] = (markRoutes[c] || 0) + 1;
  const und = [...seen].filter((c) => !declared.has(c)); if (und.length) undeclaredMarkRoutes.push({ key: r.key, und });

  // declaration: separates_on null -> one reading, the route whole
  const decl = draft.separates_on ? null : [R];
  const vs = senseSplit(R);
  v3.fields_compared++;
  if (vs.damaged) v3.v3_damaged++;
  const vDiv = vs.readings.length > 1, dDiv = decl.length > 1;
  if (!vDiv && !dDiv) { v3.same_division++; if (vs.readings[0] !== R) v3.v3_single_reading_not_byte_identical++; }
  else if (vDiv && !dDiv) { v3.v3_divides_where_declaration_keeps_whole++; if (v3.examples.length < 10) v3.examples.push({ key: r.key, window: W(R), v3: vs.readings.map((x) => W(x, 30)) }); }
  else if (!vDiv && dDiv) v3.declaration_divides_where_v3_keeps_whole++;
  else if (JSON.stringify(vs.readings) === JSON.stringify(decl)) v3.same_division++; else v3.divided_differently++;
}

// ---- count comparison
const countCheck = {};
for (const s of new Set([...Object.keys(DRAFT_COUNTS), ...Object.keys(shapeCount)])) {
  countCheck[s] = { draft: DRAFT_COUNTS[s] ?? null, mine: shapeCount[s] || 0, match: (DRAFT_COUNTS[s] ?? -1) === (shapeCount[s] || 0) };
}
const markCheck = {};
for (const m of new Set([...Object.keys(DRAFT_MARK_OCC), ...Object.keys(markOcc)])) {
  markCheck[m] = { draft_occ: DRAFT_MARK_OCC[m] ?? null, mine_occ: markOcc[m] || 0, draft_governs: draft.marks[m]?.governs ?? null, mine_routes: markRoutes[m] || 0 };
}

// ---- secondary numbers in declared_from / evidence
const keys = byKey.size;
const tildeRows = rows.filter((r) => r.route.includes("~"));
const closeGap = (s) => s.replace(/\s*~\s*/gu, " ").replace(/\s+/gu, " ").trim();
const closedSibling = tildeRows.filter((r) => { const c = closeGap(r.route); return c !== r.route && byKey.get(r.key).has(c); });
const PARTICLES5 = new Set(["out", "up", "down", "away", "back"]);
const afterGap = (s) => { const m = s.match(/~\s*(\p{L}+)/u); return m ? m[1].toLowerCase() : null; };
const particle5 = closedSibling.filter((r) => PARTICLES5.has(afterGap(r.route))).length;
const particle5AllTilde = tildeRows.filter((r) => PARTICLES5.has(afterGap(r.route))).length;
const sidesStand = tildeRows.filter((r) => {
  if ((r.route.match(/~/gu) || []).length !== 1) return false;
  const [L, Rt] = r.route.split("~").map((x) => x.trim());
  return L && Rt && byKey.get(r.key).has(L) && byKey.get(r.key).has(Rt);
}).map((r) => ({ key: r.key, window: W(r.route) }));

// ---- falsifier searches stated in the draft
const falsifiers = {
  tilde_mid_without_space_both_sides: 0, apostrophe_no_letter_before: 0, hyphen_space_either_side: 0,
  bang_or_q_not_last: 0, paren_holding_comma_slash_or_other_mark: 0, unbalanced_paren_routes: unbalancedRoutes,
  eq_or_plus_outside_number_paren: 0, period_words_both_sides: 0, slash_routes: 0,
};
for (const r of rows) {
  const a = [...r.route], n = a.length, ctx = pairParens(a);
  a.forEach((c, i) => {
    if (c === "~" && i > 0 && i < n - 1 && !(a[i - 1] === " " && a[i + 1] === " ")) falsifiers.tilde_mid_without_space_both_sides++;
    if (c === "’" && !isLetter(a[i - 1])) falsifiers.apostrophe_no_letter_before++;
    if (c === "-" && (isWS(a[i - 1]) || isWS(a[i + 1]))) falsifiers.hyphen_space_either_side++;
    if ((c === "!" || c === "?") && i !== n - 1) falsifiers.bang_or_q_not_last++;
    if ((c === "=" || c === "+")) { const e = enclosing(a, i, ctx.pairOf); if (!e || !RE_EQ.test(a.slice(e[0] + 1, e[1]).join(""))) falsifiers.eq_or_plus_outside_number_paren++; }
    if (c === "." && isWord(a[i - 1]) && isWord(a[i + 1])) falsifiers.period_words_both_sides++;
    if (c === "(" && ctx.pairOf.has(i)) { const inner = a.slice(i + 1, ctx.pairOf.get(i)); if (inner.some((x) => isMark(x) && x !== "=" && x !== "+")) falsifiers.paren_holding_comma_slash_or_other_mark++; }
  });
  if (r.route.includes("/")) falsifiers.slash_routes++;
}

// ---- falsification probes of stated meanings (keyed windows)
const pick = (s) => (shapeRows[s] || []).map((x) => ({ key: x.key, window: W(x.route) }));
const probes = {};
// slash (the only dividing shape)
const slashRow = (shapeRows["slash.between_words"] || [])[0];
if (slashRow) {
  const sib = [...byKey.get(slashRow.key)];
  const [left, right] = slashRow.route.split("/");
  const rw = right.trim().split(/\s+/u);
  probes.slash = {
    row: { key: slashRow.key, window: W(slashRow.route), def_equals_route: rows.find((r) => r.key === slashRow.key && r.route === slashRow.route).def === slashRow.route },
    siblings_on_key: sib.map((x) => W(x)),
    attempt1_digits_or_fraction_or_date: /\d\/|\/\d/u.test(slashRow.route),
    attempt2_conjunction_pair_and_or: /\b(and|or)\/(and|or)\b/iu.test(slashRow.route),
    attempt3_shared_tail_present: rw.length > 1 ? rw.slice(1).join(" ") : null,
    attempt4_store_wide_head_alternatives: {
      thumb_routes: rows.filter((r) => /\bthumbs?\b/iu.test(r.route)).map((r) => ({ key: r.key, window: W(r.route) })),
      big_toe_routes: rows.filter((r) => /\bbig toes?\b/iu.test(r.route)).map((r) => ({ key: r.key, window: W(r.route) })),
    },
    left_piece: left, right_piece: right,
  };
}
// tilde: sides-stand list (draft's own falsifier), plus alternation words adjacent to the gap
probes.tilde_sides_stand = sidesStand;
probes.tilde_adjacent_or = tildeRows.filter((r) => /\bor\s*~|~\s*or\b/iu.test(r.route)).map((r) => ({ key: r.key, window: W(r.route) }));
probes.tilde_head = pick("tilde.gap_at_head");
probes.tilde_tail = pick("tilde.gap_at_tail");
probes.tilde_two_gap_routes = tildeRows.filter((r) => (r.route.match(/~/gu) || []).length === 2).map((r) => ({ key: r.key, window: W(r.route) }));
// parens
for (const s of ["open.strongs_number", "open.number_equation", "open.supplied_whole_route", "open.supplied_inside_route"]) probes[s] = pick(s);
probes.number_equation_route_has_english_outside = (shapeRows["open.number_equation"] || []).filter((x) => { const a = [...x.route]; const c = pairParens(a).pairOf.get(x.i); return a.slice(0, x.i).concat(a.slice(c + 1)).some(isLetter); }).length;
probes.supplied_inside_more_than_one_word = (shapeRows["open.supplied_inside_route"] || []).filter((x) => { const a = [...x.route]; const c = pairParens(a).pairOf.get(x.i); return a.slice(x.i + 1, c).join("").trim().split(/\s+/u).length > 1; }).map((x) => ({ key: x.key, window: W(x.route) }));
probes.supplied_whole_more_than_one_word = (shapeRows["open.supplied_whole_route"] || []).filter((x) => x.route.slice(1, -1).trim().split(/\s+/u).length > 1).map((x) => ({ key: x.key, window: W(x.route) }));
probes.plus_beside_english = rows.filter((r) => /\+\s*\p{L}{2,}|\p{L}{2,}\s*\+/u.test(r.route)).length;
probes.period = pick("period.at_head_glued");
probes.bang_after_space = pick("exclamation.final_after_space");
probes.q_after_space = pick("question.final_after_space");
probes.hyphen_bound_suffix = pick("hyphen.bound_suffix");
probes.hyphen_digit_side = rows.filter((r) => /\d-|-\d/u.test(r.route)).length;
probes.apostrophe_plural_possessive_capital_S_before = rows.filter((r) => /S’(?!\p{L})/u.test(r.route)).length;
probes.contraction_nt = pick("apostrophe.contraction_nt");
probes.plural_possessive_sample = pick("apostrophe.plural_possessive").slice(0, 40);
// apostrophe meaning probes: a "’s" that is a contraction (it is / let us), not a possessive; an "s’" on a singular name
const CONTR_S = /\b(it|let|that|he|she|there|what|who|here|where|how)’s\b/iu;
probes.possessive_s_that_is_contraction = (shapeRows["apostrophe.possessive_s"] || []).filter((x) => CONTR_S.test(x.route)).map((x) => ({ key: x.key, window: W(x.route) }));
probes.plural_possessive_all = pick("apostrophe.plural_possessive").map((x) => x.window);
probes.plural_possessive_on_capitalized_word = (shapeRows["apostrophe.plural_possessive"] || []).filter((x) => { const w = x.route.slice(0, x.i).split(/\s+/u).pop(); return /^\p{Lu}/u.test(w); }).map((x) => ({ key: x.key, window: W(x.route) }));
// hyphen meaning probe: every compound_join window, and joins where one side is a function word (of, the, to, a)
probes.hyphen_compound_all = [...new Set((shapeRows["hyphen.compound_join"] || []).map((x) => x.route))].map((r) => W(r, 40));
probes.hyphen_function_word_side = (shapeRows["hyphen.compound_join"] || []).filter((x) => { const L = x.route.slice(0, x.i).split(/[\s-]+/u).pop(), R = x.route.slice(x.i + 1).split(/[\s-]+/u)[0]; return /^(of|the|to|a|and|in)$/iu.test(L) && !/^(in|law)$/iu.test(R) && !/-in-law/u.test(x.route); }).map((x) => ({ key: x.key, window: W(x.route) }));


const out = {
  verifier: "independent; shape tests from the draft's words; v3 = " + RULE_ID,
  source_rows: rows.length, keys, route_is_def: routeIsDef, routes_with_no_mark: noMark,
  route_comma: routeComma, route_semicolon: routeSemi, def_comma: defComma, def_semicolon: defSemi,
  routes_with_leading_or_trailing_ws: leadTrailWS,
  total_mark_occurrences: Object.values(markOcc).reduce((x, y) => x + y, 0),
  mark_check: markCheck, count_check: countCheck,
  all_counts_match: Object.values(countCheck).every((x) => x.match),
  completeness: { unexplained: unexplained.length, multi: multi.length, unexplained_list: unexplained.slice(0, 50), multi_list: multi.slice(0, 50) },
  closure_routes_with_undeclared_mark: undeclaredMarkRoutes.length,
  tilde: { two_tilde_routes: twoTildeRoutes, max_per_route: maxTilde, closed_gap_sibling: closedSibling.length, particle5_among_closed_sibling: particle5, particle5_among_all_tilde: particle5AllTilde, sides_stand: sidesStand.length },
  falsifiers, v3, probes,
};
fs.writeFileSync(path.join(HERE, "verify.json"), JSON.stringify(out, null, 1));
const brief = { ...out }; delete brief.probes; delete brief.mark_check; delete brief.count_check;
console.log(JSON.stringify(brief, null, 1));
console.log("COUNT MISMATCHES:", JSON.stringify(Object.entries(countCheck).filter(([, v]) => !v.match)));
console.log("MARK CHECK:", JSON.stringify(markCheck));
