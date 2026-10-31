// Falsification pass over the dividing shapes, plus the X "first in the rendering" diagnostic.
// Same locate/region/paren helpers as verify.mjs (lib.mjs); tests restated here only for the dividing shapes.
import { readFileSync, writeFileSync } from "node:fs";
import { makeLocator, analyzeDef, parenInfo, isLetter, isSpace } from "./lib.mjs";
const [, , SRC, OUT] = process.argv;
const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const loc = makeLocator(); const cache = new Map();
const W = (s, a, b) => s.slice(Math.max(0, a), Math.min(s.length, b));
const occ = {}; // shape -> [{key, left, right, defwin}]
const add = (k, o) => { (occ[k] = occ[k] || []).push(o); };
const xDiag = { whole_by_stated_test_mid_from_route_start: 0, ex: [] };
const listRoutes = { suffix_led: 0, suffix_led_ex: [], lone_group: 0, lone_group_ex: [], bare_function_word: 0, bare_ex: [], digits_only_or_digit_led: 0, digit_ex: [] };
const headSemDefs = new Map(); const listSemDefs = new Map(); const listEndDefs = new Map(); const openerDefs = new Map();
for (const r of rows) {
  const s = r.route, def = r.def; let A = cache.get(def); if (!A) { A = analyzeDef(def); cache.set(def, A); }
  const L = loc(r, A);
  const P = parenInfo(s); const reg = (i) => A.region(L.p + i);
  const headish = (g) => g === "head" || g === "no_opener";
  // whole-route facts in the list
  const allList = [...s].every((_, i) => reg(i) === "list");
  if (allList) {
    const t = s.trim();
    if (/^-\p{L}/u.test(t) || /^\(-/u.test(t)) { listRoutes.suffix_led++; if (listRoutes.suffix_led_ex.length < 8) listRoutes.suffix_led_ex.push(`${r.key}: ${t.slice(0, 30)}`); }
    if (t.startsWith("(") && P.match[s.indexOf("(")] !== -1 && P.match[s.indexOf("(")] === s.lastIndexOf(")") && s.slice(P.match[s.indexOf("(")] + 1).trim() === "") { listRoutes.lone_group++; if (listRoutes.lone_group_ex.length < 8) listRoutes.lone_group_ex.push(`${r.key}: ${t.slice(0, 30)}`); }
    if (/^(and|or|nor|but|the|a|an|of|to|in|that|which|with)$/iu.test(t)) { listRoutes.bare_function_word++; if (listRoutes.bare_ex.length < 12) listRoutes.bare_ex.push(`${r.key}: ${t}`); }
    if (/^\d/u.test(t)) { listRoutes.digits_only_or_digit_led++; if (listRoutes.digit_ex.length < 8) listRoutes.digit_ex.push(`${r.key}: ${t.slice(0, 20)}`); }
  }
  // dividing occurrences in this route
  const cuts = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i], g = reg(i), d = P.depth[i];
    let shape = null;
    if (c === ";") {
      let k = L.p + i + 1; while (k < def.length && isSpace(def[k])) k++;
      const before = A.op && k === A.op.start;
      if (g === "opener") shape = "semicolon.opener";
      else if (headish(g) && d === 0 && !before) shape = "semicolon.head_separator";
      else if (g === "list" && d === 0) shape = "semicolon.rendering_separator";
    } else if (c === ":" && A.op && A.op.kind === ":" && L.p + i === A.op.start) shape = "colon.opener";
    else if (c === "." && g === "list_end") shape = "period.list_end";
    else if (c === "," && g === "list" && d === 0) shape = "comma.rendering_separator";
    else if (c === "-" && g === "opener") shape = "hyphen.opener_tail";
    if (shape && !P.inUnclosed[i]) cuts.push([i, shape]);
    // X diagnostic: stated test (rendering restarts after opener / list end / depth-0 ';' or ',') vs route-start-only
    if (c === "X" && !isLetter(s[i - 1]) && !isLetter(s[i + 1]) && d === 0) {
      let rs = 0; for (let k = 0; k < i; k++) { const gk = reg(k); if (gk === "opener" || gk === "list_end") rs = k + 1; else if ((s[k] === ";" || s[k] === ",") && P.depth[k] === 0 && (gk === "list" || headish(gk))) rs = k + 1; }
      const statedFirst = /^[\s-]*$/u.test(s.slice(rs, i));
      let j = 0; while (j < s.length && (isSpace(s[j]) || (s[j] === "-" && reg(j) === "opener"))) j++;
      const routeStartFirst = j === i;
      if (statedFirst && !routeStartFirst) { xDiag.whole_by_stated_test_mid_from_route_start++; if (xDiag.ex.length < 10) xDiag.ex.push(`${r.key}: ${W(s, i - 30, i + 15)}`); }
    }
  }
  // piece either side of each dividing occurrence (between neighboring cuts)
  const pos = cuts.map((c) => c[0]);
  cuts.forEach(([i, shape], n) => {
    const a = n > 0 ? pos[n - 1] + 1 : 0, b = n + 1 < pos.length ? pos[n + 1] : s.length;
    const strip = (x) => x.replace(/^[\s;:-]+/u, "").replace(/[\s;:-]+$/u, "");
    const o = { key: r.key, left: strip(s.slice(a, i)).slice(-45), right: strip(s.slice(i + 1, b)).slice(0, 45), defpos: L.p + i };
    add(shape, o);
    const dk = `${def}\u0000${L.p + i}`;
    const M = shape === "semicolon.head_separator" ? headSemDefs : shape === "semicolon.rendering_separator" ? listSemDefs : shape === "period.list_end" ? listEndDefs : (shape.endsWith("opener") || shape === "hyphen.opener_tail") ? openerDefs : null;
    if (M && !M.has(dk)) M.set(dk, { key: r.key, kind: A.op ? A.op.kind : "none", defwin: W(def, L.p + i - 30, L.p + i + 30), after: def.slice(L.p + i + 1, L.p + i + 60), before: def.slice(Math.max(0, L.p + i - 50), L.p + i) });
  });
}
// ---------- heuristics ----------
const startsSuffix = (x) => /^-?(ing|s|th|er|ed|ly|ness|est|ion|ation|y|en|ful|less)\b/u.test(x);
const F = {};
// semicolon.rendering_separator: definition-level (distinct) contexts
const LS = [...listSemDefs.values()];
F["semicolon.rendering_separator"] = {
  distinct_in_definitions: LS.length,
  attempt1_right_side_is_a_suffix_syllable: LS.filter((o) => /^\s*-\p{L}/u.test(o.after)).map((o) => `${o.key}: ${o.defwin}`),
  attempt2_right_side_opens_with_a_continuation_word: LS.filter((o) => /^\s*(and|or|but|i\.e\.|that is|which|whose|especially|also)\b/iu.test(o.after)).map((o) => `${o.key}: ${o.defwin}`),
  attempt3_a_side_is_a_note_or_citation: LS.filter((o) => /(Also|Compare|by mistake|margin|\d+:\d+|[א-ת])/u.test(o.after.split(/[;,]/u)[0]) || /(Also|Compare|by mistake|margin|\d+:\d+|[א-ת])/u.test(o.before.split(/[;,]/u).pop())).map((o) => `${o.key}: ${o.defwin}`),
  all: LS.map((o) => `${o.key}: ${o.defwin}`),
};
const HS = [...headSemDefs.values()];
F["semicolon.head_separator"] = {
  distinct_in_definitions: HS.length,
  attempt1_right_side_continues_the_same_clause: HS.filter((o) => /^\s*(and|or|but|i\.e\.|that is|which|whose)\b/iu.test(o.after)).map((o) => `${o.key}: ${o.defwin}`),
  attempt2_right_side_is_a_rendering_list_item_in_a_no_opener_definition: HS.filter((o) => o.kind === "none").map((o) => `${o.key}: ${o.defwin}`),
  attempt3_right_side_is_a_citation_or_grammar_note: HS.filter((o) => /^\s*(\(|\d|compare|see|plural|feminine|masculine|dual|construct|plur|fem)/iu.test(o.after)).map((o) => `${o.key}: ${o.defwin}`),
  first_words_right: Object.entries(HS.reduce((m, o) => { const w = (o.after.trim().split(/\s+/u)[0] || "").toLowerCase(); m[w] = (m[w] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]),
};
const LE = [...listEndDefs.values()];
const afterPiece = (o) => o.after.replace(/^\s+/u, "");
F["period.list_end"] = {
  distinct_in_definitions: LE.length,
  attempt1_after_is_a_lowercase_english_rendering: LE.filter((o) => /^[a-z][a-z' -]*([,.]|$)/u.test(afterPiece(o)) && !/^(i\.e|i\. e|comp|see|prop|lit)/iu.test(afterPiece(o))).map((o) => `${o.key}: ${o.defwin}`),
  attempt2_list_continues_after_the_stop_with_depth0_commas: LE.filter((o) => { const t = afterPiece(o); let d = 0; for (const ch of t) { if (ch === "(") d++; else if (ch === ")") d = Math.max(0, d - 1); else if (ch === "," && d === 0) return /^[A-Za-z]/u.test(t) && !/^(Also|Compare|See|Prop|The|In|Incl|Doubtful|Often|Probably)\b/u.test(t); } return false; }).map((o) => `${o.key}: ${o.defwin}`),
  attempt3_stop_closes_an_abbreviation: LE.filter((o) => /(^|[^\p{L}])(etc|Marg|marg|Prop|Incl|irreg|Prob|i\.e|comp|Comp|ch|ver|Psa)$/u.test(o.before)).map((o) => `${o.key}: ${o.defwin}`),
  after_first_char_classes: LE.reduce((m, o) => { const t = afterPiece(o); const k = t === "" ? "end" : /^\(/u.test(t) ? "paren" : /^[A-Z]/u.test(t) ? "Upper" : /^[a-z]/u.test(t) ? "lower" : /^[א-ת]/u.test(t) ? "Hebrew" : "other:" + t[0]; m[k] = (m[k] || 0) + 1; return m; }, {}),
  all: LE.map((o) => `${o.key}: ${o.defwin}`),
};
const OP = [...openerDefs.values()];
F["opener (colon.opener, semicolon.opener, hyphen.opener_tail)"] = {
  distinct_in_definitions: OP.length,
  attempt1_tail_hyphen_is_really_a_suffix_syllable: OP.filter((o) => /^-?(ing|s|th|er|ed|ly|ness|est|ion|ation|y|en|ful|less)\b/u.test(o.after.replace(/^[\s-]*/u, "")) && /-\s*$/u.test(o.before + "") === false && /^[\s]*-+\p{L}/u.test(o.after)).map((o) => `${o.key}: ${o.defwin}`),
  attempt2_opener_inside_parentheses_or_after_the_list: OP.filter((o) => { let d = 0; for (const ch of o.before) { if (ch === "(") d++; else if (ch === ")") d = Math.max(0, d - 1); } return d > 0; }).map((o) => `${o.key}: ${o.defwin}`),
  attempt3_what_follows_the_opener_is_prose_not_a_list: OP.filter((o) => { const t = o.after.replace(/^[\s-]+/u, ""); return /^(a|an|the|from|i\.e\.|properly|literally|figuratively|compare|see)\b/iu.test(t); }).map((o) => `${o.key}: ${o.defwin}`),
};
const CS = occ["comma.rendering_separator"] || [];
F["comma.rendering_separator"] = {
  route_occurrences: CS.length, occurrences: CS,
  attempt1_store_cut_list_items_that_begin_with_a_suffix_syllable: { routes: listRoutes.suffix_led, ex: listRoutes.suffix_led_ex },
  attempt2_store_cut_list_items_that_are_one_group_alone: { routes: listRoutes.lone_group, ex: listRoutes.lone_group_ex },
  attempt3_store_cut_list_items_that_are_a_bare_function_word: { routes: listRoutes.bare_function_word, ex: listRoutes.bare_ex },
  attempt4_store_cut_list_items_led_by_a_digit: { routes: listRoutes.digits_only_or_digit_led, ex: listRoutes.digit_ex },
};
const counts = Object.fromEntries(Object.entries(occ).map(([k, v]) => [k, v.length]));
const out = { route_occurrences_of_dividing_shapes: counts, x_first_in_rendering_diagnostic: xDiag, falsification: F };
writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ counts, xDiag, listRoutes: { suffix_led: listRoutes.suffix_led, lone_group: listRoutes.lone_group, bare: listRoutes.bare_function_word, bare_ex: listRoutes.bare_ex, digit: listRoutes.digits_only_or_digit_led },
  ls: { n: LS.length, a1: F["semicolon.rendering_separator"].attempt1_right_side_is_a_suffix_syllable.length, a2: F["semicolon.rendering_separator"].attempt2_right_side_opens_with_a_continuation_word.length, a3: F["semicolon.rendering_separator"].attempt3_a_side_is_a_note_or_citation.length },
  hs: { n: HS.length, a1: F["semicolon.head_separator"].attempt1_right_side_continues_the_same_clause.length, a2: F["semicolon.head_separator"].attempt2_right_side_is_a_rendering_list_item_in_a_no_opener_definition.length, a3: F["semicolon.head_separator"].attempt3_right_side_is_a_citation_or_grammar_note.length },
  le: { n: LE.length, a1: F["period.list_end"].attempt1_after_is_a_lowercase_english_rendering.length, a2: F["period.list_end"].attempt2_list_continues_after_the_stop_with_depth0_commas.length, a3: F["period.list_end"].attempt3_stop_closes_an_abbreviation.length, cls: F["period.list_end"].after_first_char_classes },
  op: { n: OP.length, a1: F["opener (colon.opener, semicolon.opener, hyphen.opener_tail)"].attempt1_tail_hyphen_is_really_a_suffix_syllable.length, a2: F["opener (colon.opener, semicolon.opener, hyphen.opener_tail)"].attempt2_opener_inside_parentheses_or_after_the_list.length, a3: F["opener (colon.opener, semicolon.opener, hyphen.opener_tail)"].attempt3_what_follows_the_opener_is_prose_not_a_list.length } }, null, 1));
