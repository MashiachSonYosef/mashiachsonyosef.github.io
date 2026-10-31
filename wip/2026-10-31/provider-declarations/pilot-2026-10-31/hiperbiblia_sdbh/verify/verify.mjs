// Independent verifier for the hiperbiblia_sdbh (M17) mark ledger draft.
// Written from the shape TESTS as stated in words; does not import or read the draft's ledger.mjs.
// Usage: node verify.mjs <by-source/hiperbiblia_sdbh.jsonl> <sense-split-v1.mjs> <outdir>
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const [, , SRC, V3PATH, OUT] = process.argv;
const { senseSplit } = await import(pathToFileURL(V3PATH).href);
const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const W = (s) => (s.length > 60 ? s.slice(0, 57) + "..." : s); // short window
const isL = (c) => c !== undefined && /\p{L}/u.test(c);
const isUp = (c) => c !== undefined && /\p{Lu}/u.test(c);

// ---------- records ----------
const recMap = new Map(); // key\u0000def -> {key, def, routes: []}
const routesByKey = new Map();
for (const r of rows) {
  const k = r.key + "\u0000" + r.def;
  if (!recMap.has(k)) recMap.set(k, { key: r.key, def: r.def, routes: [] });
  recMap.get(k).routes.push(r.route);
  if (!routesByKey.has(r.key)) routesByKey.set(r.key, new Set());
  routesByKey.get(r.key).add(r.route.trim());
}
const recs = [...recMap.values()];
const out = { provider: "hiperbiblia_sdbh", routes: rows.length, keys: routesByKey.size, records_key_def: recs.length };
out.distinct_defs_ignoring_key = new Set(rows.map((r) => r.def)).size;
out.m_ids = [...new Set(rows.map((r) => r.m))];

// depth-aware split of a string at a separator char
const depthArr = (s) => { const d = []; let x = 0; for (let i = 0; i < s.length; i++) { d.push(x); if (s[i] === "(") x++; else if (s[i] === ")") x--; } return d; }; // depth BEFORE char i (i.e. depth at the char, excluding itself)
const splitAll = (s, ch) => s.split(ch).map((p) => p.trim());
const splitDepth0 = (s, ch) => { const d = depthArr(s); const pcs = []; let st = 0; for (let i = 0; i < s.length; i++) if (s[i] === ch && d[i] === 0) { pcs.push(s.slice(st, i)); st = i + 1; } pcs.push(s.slice(st)); return pcs; };

// ---------- semicolons (definition text, per key+def record) ----------
const semi = { "semicolon.between_gloss_items": 0, "semicolon.inside_parentheses": 0, unexplained: 0 };
const semiByUniqueDef = { between: 0, inside: 0 };
let recsWithSemi = 0, defCommas = 0, items0 = 0, itemsAll = 0, itemMatchedOwn = 0, itemMatchedOtherRecSameKey = 0;
const semiInside = [];
let routeIsItemAll = 0, routeIsItem0 = 0, routeWhole = 0, routeSlice = 0, routeAbsent = 0, routesWithSemi = 0;
const recRouteCountMismatch = [];
const loneDashItems = [];
for (const rec of recs) {
  const d = depthArr(rec.def);
  let has = false;
  for (let i = 0; i < rec.def.length; i++) if (rec.def[i] === ";") { has = true; if (d[i] === 0) semi["semicolon.between_gloss_items"]++; else { semi["semicolon.inside_parentheses"]++; semiInside.push(rec.key + ": " + W(rec.def)); } }
  if (has) recsWithSemi++;
  defCommas += (rec.def.match(/,/g) || []).length;
  const itA = splitAll(rec.def, ";"), it0 = splitDepth0(rec.def, ";").map((p) => p.trim());
  itemsAll += itA.length; items0 += it0.length;
  for (const it of it0) { if (it === "-") loneDashItems.push(rec.key); }
  const own = new Set(rec.routes.map((x) => x.trim()));
  for (const it of it0) { if (own.has(it)) itemMatchedOwn++; else if (routesByKey.get(rec.key).has(it)) itemMatchedOtherRecSameKey++; }
  if (rec.routes.length !== itA.filter((x) => x !== "-" && x !== "").length) recRouteCountMismatch.push({ key: rec.key, routes: rec.routes.length, items_split_every_semicolon: itA.length });
}
for (const r of rows) {
  if (r.route.includes(";")) routesWithSemi++;
  const itA = splitAll(r.def, ";"), it0 = splitDepth0(r.def, ";").map((p) => p.trim());
  if (itA.includes(r.route.trim())) routeIsItemAll++;
  if (it0.includes(r.route.trim())) routeIsItem0++;
  if (r.def.trim() === r.route.trim()) routeWhole++; else if (r.def.includes(r.route)) routeSlice++; else routeAbsent++;
}
const uniqDefs = [...new Set(rows.map((r) => r.def))];
for (const df of uniqDefs) { const d = depthArr(df); for (let i = 0; i < df.length; i++) if (df[i] === ";") (d[i] === 0 ? semiByUniqueDef.between++ : semiByUniqueDef.inside++); }
out.semicolon = { counted_over_key_def_records: semi, counted_over_distinct_defs_ignoring_key: semiByUniqueDef, records_with_semicolon: recsWithSemi, inside_paren_examples: semiInside,
  routes_carrying_semicolon: routesWithSemi, route_is_item_split_at_every_semicolon: routeIsItemAll, route_is_item_split_at_depth0_only: routeIsItem0,
  route_region: { whole: routeWhole, slice: routeSlice, absent: routeAbsent }, items_depth0: items0, items_every_semicolon: itemsAll,
  items_depth0_route_on_own_record: itemMatchedOwn, items_depth0_route_on_same_key_other_record_only: itemMatchedOtherRecSameKey,
  def_commas: defCommas, lone_dash_items: loneDashItems, records_whose_route_count_differs_from_item_count: recRouteCountMismatch.length, record_count_mismatch_examples: recRouteCountMismatch.slice(0, 8) };

// ---------- per-route mark classification ----------
const shapeCount = {}; // mark -> shape -> n
const shapeEx = {}; // mark|shape -> [key: route]
const multiMatch = {}; // mark -> {"a+b": n}
const markTotal = {};
const add = (mark, shape, r) => { shapeCount[mark] ??= {}; shapeCount[mark][shape] = (shapeCount[mark][shape] || 0) + 1; const k = mark + "|" + shape; shapeEx[k] ??= []; const e = r.key + ": " + W(r.route); if (!shapeEx[k].includes(e)) shapeEx[k].push(e); };
const tally = (mark, matches, r, ordered) => { // matches: array of shape names whose test holds; ordered first-match wins
  markTotal[mark] = (markTotal[mark] || 0) + 1;
  if (matches.length === 0) { add(mark, "UNEXPLAINED", r); return; }
  if (matches.length > 1) { multiMatch[mark] ??= {}; const k = matches.join(" + "); multiMatch[mark][k] = (multiMatch[mark][k] || 0) + 1; }
  add(mark, matches[0], r);
};
const PLACEHOLDER = new Set(["someone", "something", "somewhere", "one", "one's", "oneself", "another", "X", "Y"]);
const placeholderVariants = { exact: 0, exact_or_possessive: 0, contains_as_word: 0 };
const placeholderNonExactExamples = [];
const INTERROG_STRICT = /^(who|whom|whose|what|which|where|whence|whither|when|why|how|wherefore|whether)\b/i;
const INTERROG_BROAD = /^(who|whom|whose|what|which|where|whence|whither|when|why|how|wherefore|whether|is|are|do|does|did|can|for what|from where|really|truly)\b/i;
const qFinalStrict = { interrogative: 0, uncertainty: 0 };
const SUBORD = /^(whether|which|who|when|where|if|although|because|that|while)\b/i;
const commaRoutes = []; // for v3/decl
const parenPairsNested = [];
const gtLeftVariant = { left_trim_starts_and_ends_with_quote: 0, left_trim_ends_with_quote: 0 };

for (const r of rows) {
  const s = r.route; const n = s.length; const d = depthArr(s);
  // paren pairing
  const stack = []; const pairs = []; const orphanClose = []; let maxDepth = 0;
  for (let i = 0; i < n; i++) { if (s[i] === "(") { stack.push(i); maxDepth = Math.max(maxDepth, stack.length); } else if (s[i] === ")") { if (stack.length) pairs.push([stack.pop(), i]); else orphanClose.push(i); } }
  if (maxDepth > 1) parenPairsNested.push(r.key);
  const openNever = [...stack];
  const insideAnyPair = (i) => pairs.some(([a, b]) => a < i && i < b) || openNever.some((a) => a < i) ; // inside an open parenthesis
  for (const [a, b] of pairs) {
    const c = s.slice(a + 1, b), before = s[a - 1], after = s[b + 1];
    const touches = isL(before) || isL(after);
    const wb = !touches;
    const m = [];
    if (touches || /^-|-$/.test(c)) m.push("paren.optional_part");
    if (c.trim() === "?") m.push("paren.uncertainty");
    if (/^=/.test(c.trim())) m.push("paren.equivalence_aside");
    if (/^>/.test(c.trim())) m.push("paren.extension_aside");
    if (/:$/.test(c.trim()) || c.trim() === "pl") m.push("paren.grammatical_label");
    if (wb && c.includes(",")) m.push("paren.list_inside");
    if (wb && PLACEHOLDER.has(c.trim())) m.push("paren.argument_placeholder");
    // variants for the ambiguous word 'holding'
    if (wb) {
      const ct = c.trim();
      if (PLACEHOLDER.has(ct)) placeholderVariants.exact++;
      if (PLACEHOLDER.has(ct) || PLACEHOLDER.has(ct.replace(/'s$/, ""))) placeholderVariants.exact_or_possessive++;
      if (ct.split(/[\s,]+/).some((w) => PLACEHOLDER.has(w) || PLACEHOLDER.has(w.replace(/'s$/, "")))) { placeholderVariants.contains_as_word++; if (!PLACEHOLDER.has(ct) && placeholderNonExactExamples.length < 400) placeholderNonExactExamples.push(r.key + ": (" + ct + ")"); }
    }
    if (wb) m.push("paren.qualifier"); // catch-all: any other balanced pair at a word boundary
    tally("(", m, r); tally(")", m, r);
  }
  for (const a of openNever) tally("(", ["paren.opener_never_closed"], r);
  for (const b of orphanClose) tally(")", ["paren.closer_with_nothing_open"], r);

  // quotes: pair sequentially
  const qpos = []; for (let i = 0; i < n; i++) if (s[i] === '"') qpos.push(i);
  for (let k = 0; k < qpos.length; k += 2) {
    const a = qpos[k], b = qpos[k + 1];
    const m = [];
    if (b === undefined) { tally('"', [], r); continue; }
    if (s.slice(b + 1, b + 3) === " =" || s.slice(b + 1, b + 3) === " >") m.push("quote.literal_before_eq_or_gt");
    if (a === 0 && b === n - 1 && !/[=>]/.test(s)) m.push("quote.whole_route_sound");
    tally('"', m, r); tally('"', m, r);
  }

  // comma route-level data
  const pieces = splitDepth0(s, ",").map((p) => p.trim());
  const hasD0Comma = pieces.length > 1;
  const cRoute = {};
  if (hasD0Comma) {
    cRoute.inf = pieces.every((p) => p.startsWith("to "));
    cRoute.nom = !s.startsWith("to ") && pieces.every((p) => !/[()]/.test(p) && !/\b(of|to|and|or|whether)\b/i.test(p) && p.split(/\s+/).filter(Boolean).length <= 3);
    cRoute.cop = pieces[0] === "to be" && /^become/.test(pieces[1]);
    cRoute.verb = pieces[0].startsWith("to ") && pieces.slice(1).some((p) => !p.startsWith("to "));
    cRoute.edge = !s.startsWith("to ") && (pieces[0].startsWith("(") || pieces[pieces.length - 1].endsWith(")"));
    cRoute.of = pieces[0].includes(" of ") && pieces.slice(1).every((p) => p.split(/\s+/).filter(Boolean).length === 1);
  }

  let pieceIdx = 0;
  for (let i = 0; i < n; i++) {
    const c = s[i];
    if (/[\p{L}\p{N}\s]/u.test(c)) continue;
    if (c === "(" || c === ")" || c === '"') continue; // handled above
    const inside = d[i] > 0 || insideAnyPair(i);
    const m = [];
    switch (c) {
      case ",": {
        if (inside) { m.push("comma.inside_parentheses"); break; }
        pieceIdx++;
        if (cRoute.inf) m.push("comma.complete_infinitives");
        if (cRoute.nom) m.push("comma.complete_nominal");
        if (cRoute.cop) m.push("comma.copula_elliptic");
        if (cRoute.verb) m.push("comma.verb_head_distributed");
        if (cRoute.edge) m.push("comma.list_with_edge_parenthesis");
        if (cRoute.of) m.push("comma.of_head_distributed");
        if (SUBORD.test(pieces[pieceIdx] || "")) m.push("comma.before_subordinate_clause");
        break; }
      case "'": {
        if (isL(s[i - 1]) && s[i + 1] === "s" && !isL(s[i + 2])) m.push("apos.possessive_s");
        if (s[i - 1] === "s" && !isL(s[i - 2]) === false && (s[i + 1] === " " || i === n - 1)) m.push("apos.plural_possessive");
        break; }
      case ">": {
        if (inside) { m.push("gt.inside_parentheses"); break; }
        const left = s.slice(0, i).trim();
        if (left.startsWith('"') && left.endsWith('"')) gtLeftVariant.left_trim_starts_and_ends_with_quote++;
        if (left.endsWith('"')) gtLeftVariant.left_trim_ends_with_quote++;
        if (left.startsWith('"') && left.endsWith('"')) m.push("gt.quoted_idiom_to_meaning"); else m.push("gt.literal_to_extended");
        break; }
      case "-": {
        if (s[i - 1] === "(" || s[i + 1] === ")" || s[i - 1] === ")" || s[i + 1] === "(") m.push("hyphen.optional_part");
        if (isL(s[i - 1]) && isL(s[i + 1])) {
          let a = i - 1; while (a > 0 && isL(s[a - 1])) a--; let b = i + 1; // word starts
          (isUp(s[a]) || isUp(s[b])) ? m.push("hyphen.name_join") : m.push("hyphen.compound_word");
        }
        break; }
      case ".": {
        let a = i; while (a > 0 && s[a - 1] === ".") a--; let b = i; while (b < n - 1 && s[b + 1] === ".") b++;
        if (b - a + 1 === 3) m.push("period.ellipsis");
        break; }
      case "?": {
        if (s[i - 1] === "(" && s[i + 1] === ")") m.push("q.parenthesized_uncertainty");
        if (s[i + 1] === " " && isL(s[i + 2])) m.push("q.between_uncertain_alternatives");
        if (i === n - 1) {
          if (INTERROG_BROAD.test(s)) m.push("q.route_final_interrogative"); else m.push("q.route_final_uncertainty");
          INTERROG_STRICT.test(s) ? qFinalStrict.interrogative++ : qFinalStrict.uncertainty++;
        }
        break; }
      case "!": {
        if (inside) { m.push("excl.inside_parentheses"); break; }
        if (i === n - 1) m.push("excl.route_final");
        if (s[i + 1] === " " && isL(s[i + 2])) m.push("excl.between_exclamations");
        break; }
      case "=": {
        if (s[i - 2] === '"' && s[i - 1] === " ") m.push("eq.quoted_literal_to_meaning");
        if (inside) m.push("eq.inside_parentheses");
        if (i === 0) m.push("eq.route_initial");
        if (!inside && i > 0 && !s.includes('"') && s.slice(0, i).trim() && s.slice(i + 1).trim()) m.push("eq.rendering_to_explanation");
        break; }
      case ":": {
        if (inside) m.push("colon.label_in_parentheses");
        else if (isL(s[i - 1]) && s[i + 1] === " " && isL(s[i + 2])) m.push("colon.between_two_nouns");
        break; }
      case "/": {
        if (s[i - 1] === " " && s[i + 1] === " ") m.push("slash.spaced_alternatives");
        if (isL(s[i - 1]) && isL(s[i + 1])) m.push("slash.unspaced_alternation");
        break; }
      case "\\": { if (s[i - 1] === " " && isL(s[i + 1])) m.push("backslash.stray_before_word"); break; }
      case "[": case "]": { if (s.startsWith("[") && s.endsWith("]") && (s.match(/\[/g) || []).length === 1 && (s.match(/\]/g) || []).length === 1) m.push("bracket.editorial_note"); break; }
      default: break;
    }
    tally(c, m, r);
  }
  if (hasD0Comma) commaRoutes.push({ key: r.key, route: s, pieces, cRoute });
}
out.marks_total = markTotal;
out.shapes = shapeCount;
out.multi_match_overlaps = multiMatch;
out.paren_nested_routes = parenPairsNested.length;
out.paren_routes = rows.filter((r) => r.route.includes("(")).length;
out.paren_placeholder_variants = placeholderVariants;
out.paren_placeholder_contains_but_not_exact_examples = placeholderNonExactExamples.slice(0, 60);
out.q_route_final_with_strict_wh_word_list = qFinalStrict;
out.gt_left_variants = gtLeftVariant;
out.shape_examples = Object.fromEntries(Object.entries(shapeEx).map(([k, v]) => [k, { distinct_routes: v.length, list: v.length <= 40 ? v : v.slice(0, 12) }]));

// ---------- declaration application and v3 comparison ----------
const unbalanced = (t) => { let x = 0; for (const c of t) { if (c === "(") x++; else if (c === ")") { x--; if (x < 0) return true; } } return x !== 0; };
const shapeOfRoute = (s) => { const p = splitDepth0(s, ",").map((q) => q.trim()); if (p.length < 2) return null; const inf = p.every((q) => q.startsWith("to ")); const nom = !s.startsWith("to ") && p.every((q) => !/[()]/.test(q) && !/\b(of|to|and|or|whether)\b/i.test(q) && q.split(/\s+/).filter(Boolean).length <= 3); return inf ? "inf" : nom ? "nom" : "kept"; };
const cmp = { fields_compared: 0, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_prints_nothing_declaration_prints_whole: 0, both_hold_print_nothing: 0, other_unbalanced: 0 };
const cmpEx = { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [], v3_prints_nothing_declaration_prints_whole: [], both_hold_print_nothing: [] };
const declSplitRoutes = [];
for (const r of rows) {
  cmp.fields_compared++;
  const s = r.route; const v = senseSplit(s);
  if (unbalanced(s)) {
    const defUnb = unbalanced(r.def);
    if (v.damaged && defUnb) { cmp.v3_prints_nothing_declaration_prints_whole++; cmpEx.v3_prints_nothing_declaration_prints_whole.push(r.key + ": " + W(s)); }
    else if (v.damaged && !defUnb) { cmp.both_hold_print_nothing++; cmpEx.both_hold_print_nothing.push(r.key + ": " + W(s)); }
    else cmp.other_unbalanced++;
    continue;
  }
  const sh = shapeOfRoute(s);
  const decl = sh === "inf" || sh === "nom" ? splitDepth0(s, ",").map((q) => q.trim()).filter(Boolean) : [s.trim()];
  if (decl.length > 1) { declSplitRoutes.push(r.key + ": " + W(s)); const rejoin = splitDepth0(s, ","); if (rejoin.join(",") !== s) throw new Error("rejoin " + r.key); }
  const a = v.readings, b = decl;
  const same = a.length === b.length && a.every((x, i) => x === b[i]);
  if (same) cmp.same_division++;
  else if (a.length > 1 && b.length === 1) { cmp.v3_divides_where_declaration_keeps_whole++; cmpEx.v3_divides_where_declaration_keeps_whole.push(r.key + ": " + W(s) + " | v3 [" + a.join(" | ") + "]"); }
  else if (b.length > 1 && a.length === 1) { cmp.declaration_divides_where_v3_keeps_whole++; cmpEx.declaration_divides_where_v3_keeps_whole.push(r.key + ": " + W(s)); }
  else { cmp.divided_differently++; cmpEx.divided_differently.push(r.key + ": " + W(s) + " | v3 [" + a.join(" | ") + "] decl [" + b.join(" | ") + "]"); }
}
out.v3_comparison = cmp;
out.v3_comparison_examples = cmpEx;
out.declaration_separated_routes = { n: declSplitRoutes.length, list: declSplitRoutes };

// ---------- falsification probes ----------
const F = {};
const onKey = (key, t) => routesByKey.get(key).has(t.trim());
// comma shapes: which later/earlier pieces are routes of their own on the key
const commaByShape = {};
for (const c of commaRoutes) {
  const sh = c.cRoute.inf ? "complete_infinitives" : c.cRoute.nom ? "complete_nominal" : c.cRoute.cop ? "copula_elliptic" : c.cRoute.verb ? "verb_head_distributed" : c.cRoute.edge ? "list_with_edge_parenthesis" : c.cRoute.of ? "of_head_distributed" : SUBORD.test(c.pieces[1]) ? "before_subordinate_clause" : "NONE";
  (commaByShape[sh] ??= []).push({ key: c.key, route: W(c.route), pieces_on_key_as_routes: c.pieces.map((p) => onKey(c.key, p)), pieces: c.pieces.map((p) => p.split(/\s+/).length) });
}
F.comma_routes_by_first_matching_shape = commaByShape;
// semicolon: elliptic items after a 'to ' item (an item that would need the previous item's frame)
let semiElliptic = 0; const semiEllEx = [];
for (const rec of recs) { const it = splitDepth0(rec.def, ";").map((p) => p.trim()); for (let k = 1; k < it.length; k++) { if (it[0].startsWith("to ") && !it[k].startsWith("to ") && /^(be|become|make|cause|have|go|come)\b/.test(it[k])) { semiElliptic++; if (semiEllEx.length < 15) semiEllEx.push(rec.key + ": " + W(it[0] + "; ... " + it[k])); } } }
F.semicolon_item_bare_verb_after_to_item = { n: semiElliptic, examples: semiEllEx };
let semiNoteItems = 0; const semiNoteEx = [];
for (const rec of recs) for (const it of splitDepth0(rec.def, ";").map((p) => p.trim())) if (/^(denotes|see|cf\b|i\.e|e\.g|refers|used|lit\b|literally|note)/i.test(it)) { semiNoteItems++; if (semiNoteEx.length < 15) semiNoteEx.push(rec.key + ": " + W(it)); }
F.semicolon_item_reads_as_note_not_gloss = { n: semiNoteItems, examples: semiNoteEx };
let emptyItems = 0; for (const rec of recs) for (const it of splitDepth0(rec.def, ";")) if (!it.trim()) emptyItems++;
F.semicolon_empty_items = emptyItems;
// '>' sides as routes on key
let gtLeft = 0, gtRight = 0, gt0 = 0; const gtRightEx = [];
for (const r of rows) { const s = r.route; const d = depthArr(s); const i = s.indexOf(">"); if (i < 0 || d[i] > 0) continue; gt0++; const L2 = s.slice(0, i).trim(), R2 = s.slice(i + 1).trim(); if (onKey(r.key, L2)) gtLeft++; if (onKey(r.key, R2)) { gtRight++; gtRightEx.push(r.key + ": " + W(s)); } }
F.gt_depth0 = { n: gt0, left_side_route_on_key: gtLeft, right_side_route_on_key: gtRight, right_examples: gtRightEx };
// '=' sides
let eq0 = 0, eqL = 0, eqR = 0; for (const r of rows) { const s = r.route; const d = depthArr(s); const i = s.indexOf("="); if (i <= 0 || d[i] > 0) continue; eq0++; if (onKey(r.key, s.slice(0, i).replace(/"/g, ""))) eqL++; if (onKey(r.key, s.slice(0, i))) eqL += 0; if (onKey(r.key, s.slice(i + 1))) eqR++; }
F.eq_depth0_noninitial = { n: eq0, left_unquoted_route_on_key: eqL, right_route_on_key: eqR };
// paren content as a route on key
let parenAlt = 0; const parenAltEx = [];
for (const r of rows) { const re = /\(([^()]*)\)/g; let mm; while ((mm = re.exec(r.route))) { if (onKey(r.key, mm[1])) { parenAlt++; parenAltEx.push(r.key + ": " + W(r.route)); } } }
F.paren_content_is_route_on_same_key = { n: parenAlt, examples: parenAltEx };
// argument placeholder '(one)' probes: numeral sense?
F.placeholder_one_routes = rows.filter((r) => /\(one\)/.test(r.route)).map((r) => r.key + ": " + W(r.route));
// period not in triple / apostrophe as quote
F.apostrophe_not_possessive = (shapeEx["'|UNEXPLAINED"] || []);
F.spaced_hyphen = rows.filter((r) => / - /.test(r.route)).map((r) => r.key + ": " + W(r.route));
fs.writeFileSync(OUT + "/verify-result.json", JSON.stringify(out, null, 1));
fs.writeFileSync(OUT + "/falsify.json", JSON.stringify(F, null, 1));
console.log(JSON.stringify({ marks_total: out.marks_total, shapes: out.shapes, overlaps: out.multi_match_overlaps, v3: cmp }, null, 0));
