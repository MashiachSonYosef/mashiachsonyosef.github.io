#!/usr/bin/env node
// Mark ledger census for one provider: wikisource_strongs_explicit_forms (M14).
//
// Reads the provider's routes (one JSONL, loaded once, single process), locates
// each route in its definition (head | list opener | KJV rendering list | notes),
// sorts every occurrence of every mark into exactly one shape, applies the
// declaration's division and today's engine (packSplit + senseSplit v3) and the
// August machine (declaration-v1.mjs readingOf) to the same text, and writes
// census.json beside this script. Every number in the ledger comes from here.
//
//   node census.mjs
//
// Read-only on everything but this folder.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRATCH = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
const SOURCE_KEY = "wikisource_strongs_explicit_forms";
const M_IDS = ["M14"];
const JSONL = join(SCRATCH, "punct/by-source", `${SOURCE_KEY}.jsonl`);
const INVENTORY = join(SCRATCH, "punct/mark-inventory-2026-10-31.json");
const TOOLS = join(SCRATCH, "ghp/reader/tools");

const { senseSplit, RULE_ID: V3_RULE } = await import(join(TOOLS, "sense-split-v1.mjs"));
const { readingOf } = await import(join(TOOLS, "declaration-v1.mjs"));

// today's engine divides a route text at depth-0 semicolons before senseSplit:
// gloss-store-v1.mjs packSplit (lines 106-118), copied verbatim
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
/** What today's page prints for one route: packSplit, then senseSplit; a damaged sense neither prints nor pools. */
const v3Print = (R) => {
  const out = []; let withheld = 0;
  for (const sense of packSplit(R)) {
    const r = senseSplit(sense);
    if (r.damaged) { withheld += 1; continue; }
    out.push(...r.readings.map((x) => x.trim()));
  }
  return { readings: out, withheld };
};

// ---------------------------------------------------------------- locate
/** The opener of the KJV rendering list. Strong's writes ":--"; this text mostly ":". */
const opener = (D) => {
  let m, last = null;
  const re1 = /:\s*-{1,2}\s*/g; while ((m = re1.exec(D))) last = { a: m.index, z: m.index + m[0].length, kind: ":--" };
  if (last) return last;
  // a colon followed by a digit is a chapter:verse citation, never the opener
  const re2 = /:(?!\s*\d)\s*/g; while ((m = re2.exec(D))) last = { a: m.index, z: m.index + m[0].length, kind: ":" };
  if (last) return last;
  const re3 = /\s*-{2}\s*/g; if ((m = re3.exec(D))) return { a: m.index, z: m.index + m[0].length, kind: "--" };
  const re4 = /;\s*-(?=\S)/g; while ((m = re4.exec(D))) last = { a: m.index, z: m.index + m[0].length, kind: "; -" };
  return last;
};
/** End of the rendering list: the first depth-0 period after the opener that is not an ellipsis, not "i.e.", not ".,". */
const listEndOf = (D, from) => {
  let d = 0;
  for (let i = from; i < D.length; i++) {
    const ch = D[i];
    if (ch === "(") d++; else if (ch === ")") { if (d > 0) d--; }
    else if (ch === "." && d === 0) {
      if (D[i - 1] === "." || D[i + 1] === ".") continue;
      if (D.slice(i - 1, i + 3) === "i.e." || D.slice(i - 3, i + 1) === "i.e.") continue;
      if (D[i + 1] === ",") continue;
      return i;
    }
  }
  return D.length;
};
const itemsOf = (D, a, z) => {
  const out = []; let s = a, d = 0;
  const push = (x, y) => { while (x < y && /\s/.test(D[x])) x++; while (y > x && /\s/.test(D[y - 1])) y--; out.push([x, y]); };
  for (let i = a; i < z; i++) {
    const ch = D[i];
    if (ch === "(") d++; else if (ch === ")") { if (d > 0) d--; }
    else if (ch === "," && d === 0) { push(s, i); s = i + 1; }
  }
  push(s, z);
  return out;
};
const defCache = new Map();
const defInfo = (D) => {
  let x = defCache.get(D);
  if (!x) {
    const o = opener(D);
    const listEnd = o ? listEndOf(D, o.z) : D.length;
    const items = o ? itemsOf(D, o.z, listEnd) : [];
    x = { o, listEnd, items, itemSet: new Map(items.map(([a, z]) => [D.slice(a, z), a])) };
    defCache.set(D, x);
  }
  return x;
};
const locate = (R, D) => {
  const { o, listEnd, items, itemSet } = defInfo(D);
  if (!o) {
    const at = D.indexOf(R);
    return { region: at < 0 ? "absent" : (R === D ? "whole_definition_no_opener" : "no_opener"), at, o: null, listEnd };
  }
  if (itemSet.has(R)) return { region: "list_item", at: itemSet.get(R), o, listEnd };
  const first = items[0];
  if (first) {
    const dashAt = D.slice(o.a, o.z).search(/-/);
    if (dashAt >= 0 && D.slice(o.a + dashAt, first[1]) === R) return { region: "list_item", at: o.a + dashAt, o, listEnd, openerTail: true };
  }
  const occ = []; let p = -1;
  while ((p = D.indexOf(R, p + 1)) >= 0) occ.push(p);
  if (!occ.length) return { region: "absent", at: -1, o, listEnd };
  const regionAt = (x) => {
    const y = x + R.length;
    if (y <= o.a) return "head";
    if (x >= o.z && y <= listEnd) return "list_part";
    if (x >= listEnd) return "notes";
    if (x < o.z) return "spans_opener";
    return "spans_list_end";
  };
  const regs = occ.map((x) => [x, regionAt(x)]);
  const pick = regs.find(([, r]) => r === "list_part") || regs[0];
  return { region: pick[1], at: pick[0], o, listEnd };
};
const charRegion = (L, i) => {
  if (!L.o) return "no_opener";
  const pos = L.at + i;
  if (pos < L.o.a) return "head";
  if (pos < L.o.z) return "opener";
  if (pos < L.listEnd) return "list";
  if (pos === L.listEnd) return "list_end";
  return "notes";
};

// ---------------------------------------------------------------- parse a route
const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
const isHebLetter = (c) => c !== undefined && /[א-ת]/.test(c);
const isHebPoint = (c) => c !== undefined && /[֑-ׇ]/.test(c);
const MARK = /[^\p{L}\p{N}\s]/u;
const ASIDE = /^(by (mistake|confusion|exchange|correction|union|reading|including|a false)|perhaps by|from the marg|as in the margin|in the margin|margin|includ|with the article|often used as|as such unrepresented|as one or two words|as if from|figuratively|literally|aramaic|chald|dual|plural|compare|see )/i;
const CITATION = /\d\s*:\s*\d/;
const ABBREV = /(?:^|[^\p{L}])(i\.e|e\.g|etc|Marg|marg|Psa|Ps|Ezek|Hos|Prop|Incl|incl|includ|irreg|Comp|comp|Chald|rath|absol|abs|rel|euphem|concr|fig|lit|Gen|Ex|Lev|Num|Deut|Josh|Judg|Sam|Kings|Chron|Neh|Esth|Prov|Eccl|Isa|Jer|Lam|Dan|Mic|Nah|Hab|Zeph|Hag|Zech|Mal|etym|art|Heb|Aram|ver|ch|prop|pl|sing|fem|masc|adj|adv|prep|conj|i|e)$/u;

const parse = (R) => {
  const match = new Array(R.length).fill(null);
  const depth = new Array(R.length).fill(0);
  const innermost = new Array(R.length).fill(-1);
  const st = [];
  for (let i = 0; i < R.length; i++) {
    depth[i] = st.length; innermost[i] = st.length ? st[st.length - 1] : -1;
    if (R[i] === "(") st.push(i);
    else if (R[i] === ")") { if (st.length) { const j = st.pop(); match[j] = i; match[i] = j; } else match[i] = -2; }
  }
  for (const j of st) match[j] = -1;
  const firstUnclosed = st.length ? st[0] : -1;
  return { match, depth, innermost, firstUnclosed };
};
const groupShape = (R, a, z, region) => {
  if (region === "head" || region === "no_opener") return "paren.head_aside";
  if (region === "notes" || region === "list_end") return "paren.note";
  if (region === "opener") return "paren.opener_aside";
  const inner = R.slice(a + 1, z);
  if (ASIDE.test(inner.trim()) || CITATION.test(inner)) return "paren.list_aside";
  if (/^\(?\s*-/.test(inner)) return "paren.suffix_syllable";
  if (/-\)?$/.test(inner)) return "paren.prefix_syllable";
  let d = 0; for (const c of inner) { if (c === "(") d++; else if (c === ")") d--; else if (c === "," && d === 0) return "paren.alternatives"; }
  return "paren.optional_words";
};
/** First non-space index of the rendering after any opener-tail dashes. */
const renderingStart = (R, L) => { let i = 0; while (i < R.length && (/\s/.test(R[i]) || (R[i] === "-" && charRegion(L, i) === "opener"))) i++; return i; };

/** One shape per occurrence. Returns shape id. */
const shapeOf = (R, i, P, L) => {
  const c = R[i], reg = charRegion(L, i), d = P.depth[i];
  const prev = R[i - 1], next = R[i + 1];
  const inUnclosed = P.firstUnclosed >= 0 && i > P.firstUnclosed;
  const grp = P.innermost[i];
  const grpAside = grp >= 0 && P.match[grp] >= 0 && groupShape(R, grp, P.match[grp], charRegion(L, grp)) === "paren.list_aside";
  switch (c) {
    case "(": return P.match[i] === -1 ? "paren.opener_never_closed" : groupShape(R, i, P.match[i], reg);
    case ")": return P.match[i] === -2 ? "paren.closer_with_nothing_open" : groupShape(R, P.match[i], i, charRegion(L, P.match[i]));
    case ",":
      if (reg === "notes" || reg === "list_end") return "comma.note_prose";
      if (reg === "head" || reg === "no_opener") return d > 0 || inUnclosed ? "comma.in_head_aside" : "comma.head_prose";
      if (reg === "list") {
        if (inUnclosed) return "comma.in_unclosed_group";
        if (d > 0) return grpAside ? "comma.in_aside" : "comma.in_group";
        return "comma.rendering_separator";
      }
      return null;
    case ";":
      if (reg === "opener") return "semicolon.opener";
      if (reg === "head" || reg === "no_opener") {
        if (L.o && reg === "head" && /^\s*$/.test(L.defText.slice(L.at + i + 1, L.o.a))) return "semicolon.opener";
        return d > 0 || inUnclosed ? "semicolon.in_head_aside" : "semicolon.head_separator";
      }
      if (reg === "list") return d > 0 || inUnclosed ? "semicolon.in_group" : "semicolon.rendering_separator";
      if (reg === "notes" || reg === "list_end") return "semicolon.note_prose";
      return null;
    case ":":
      if (/\d\s*$/.test(R.slice(0, i)) && /^\s*\d/.test(R.slice(i + 1))) return "colon.citation";
      if (reg === "opener") return "colon.opener";
      return null;
    case ".":
      if (prev === "." || next === ".") return "period.ellipsis";
      if (reg === "list_end") return "period.list_end";
      if (ABBREV.test(R.slice(0, i))) return "period.abbreviation";
      if (reg === "notes") return "period.note_sentence_end";
      if (reg === "head" || reg === "no_opener" || reg === "opener") return "period.head_sentence_end";
      if (reg === "list") return "period.stray_in_rendering";
      return null;
    case "-":
      if (reg === "opener") return "hyphen.opener_tail";
      if (reg === "list" && P.depth[i] === 0 && /;\s$/.test(R.slice(0, i)) && isLetter(next)) return "hyphen.misplaced_opener_tail";
      if (isLetter(prev) && isLetter(next)) return "hyphen.compound";
      if ((next !== undefined && (isLetter(next) || next === "(")) && (prev === undefined || prev === "(" || prev === "," || prev === " " || prev === "-" || prev === ")")) return "hyphen.suffix_syllable";
      if (isLetter(prev) && (next === undefined || next === ")" || next === "," || next === " " || next === "(")) return "hyphen.prefix_syllable";
      if ((prev === " " || prev === "(") && next === " ") return "hyphen.detached_syllable";
      if ((prev === "(" || prev === ",") && (next === ")" || next === ",")) return "hyphen.bare_in_group";
      return null;
    case "+": {
      if (i === renderingStart(R, L)) return "plus.whole_rendering";
      if (d > 0 || inUnclosed) return "plus.in_group";
      return "plus.mid_rendering";
    }
    case "`": return isLetter(prev) || isLetter(next) ? "backtick.ayin_in_transliteration" : null;
    case "'": return isLetter(prev) || isLetter(next) ? "apostrophe.english" : null;
    case '"': return "quote.quotation";
    case "&": return reg === "list" ? "ampersand.in_rendering" : "ampersand.and_in_head";
    case "?": return isLetter(prev) ? "question.interrogative" : null;
    case "!": return isLetter(prev) ? "exclamation.in_rendering" : null;
    default:
      if (isHebPoint(c)) return (isHebLetter(prev) || isHebPoint(prev)) ? "point.in_hebrew_word" : null;
      return null;
  }
};
/** The X sigil is a letter, so the inventory cannot see it: a standalone capital X. */
const xTokens = (R) => { const out = []; for (let i = 0; i < R.length; i++) if (R[i] === "X" && !isLetter(R[i - 1]) && !isLetter(R[i + 1])) out.push(i); return out; };
const xShapeOf = (R, i, P, L) => {
  if (i === renderingStart(R, L)) return "x.whole_rendering";
  if (P.depth[i] > 0 || (P.firstUnclosed >= 0 && i > P.firstUnclosed)) return "x.in_group";
  return "x.mid_rendering";
};

// ---------------------------------------------------------------- the declaration's division
// Cut shapes, in declared precedence. Everything else is notation inside one piece.
const CUT_SHAPES = new Set([
  "colon.opener", "hyphen.opener_tail", "semicolon.opener", "hyphen.misplaced_opener_tail", // 1. the list opener: definition | rendering list
  "period.list_end",                                          // 2. the list's own full stop: rendering list | notes
  "semicolon.head_separator", "semicolon.rendering_separator",// 3. depth-0 semicolon: etymology | sense | sense; rendering ; rendering
  "comma.rendering_separator",                                // 4. depth-0 comma in the rendering list: rendering , rendering
]);
const declare = (R, L, shapesAt) => {
  const P = parse(R);
  const cut = new Array(R.length).fill(false);
  for (const [i, s] of shapesAt) if (CUT_SHAPES.has(s) && !(P.firstUnclosed >= 0 && i > P.firstUnclosed)) cut[i] = true;
  // the opener's whitespace belongs to it
  for (let i = 0; i < R.length; i++) if (!cut[i] && /\s/.test(R[i]) && charRegion(L, i) === "opener") cut[i] = true;
  const pieces = []; let s = -1;
  for (let i = 0; i <= R.length; i++) {
    if (i < R.length && !cut[i]) { if (s < 0) s = i; continue; }
    if (s >= 0) { pieces.push([s, i]); s = -1; }
  }
  const texts = pieces.map(([a, z]) => R.slice(a, z).trim()).filter(Boolean);
  // rejoin: the pieces and the cut characters between them are the route, in order
  let rebuilt = ""; for (let i = 0; i < R.length; i++) rebuilt += R[i];
  const gapsOnlyCuts = pieces.every(([a, z], k) => { const nz = k + 1 < pieces.length ? pieces[k + 1][0] : R.length; for (let j = z; j < nz; j++) if (!cut[j]) return false; return true; })
    && (pieces.length === 0 || [...Array(pieces[0][0]).keys()].every((j) => cut[j]));
  if (!gapsOnlyCuts || rebuilt !== R) return { readings: [R.trim()], refused: "pieces do not rejoin", spans: [[0, R.length]] };
  const spans = pieces.map(([a, z]) => { while (a < z && /\s/.test(R[a])) a++; while (z > a && /\s/.test(R[z - 1])) z--; return [a, z]; }).filter(([a, z]) => z > a);
  return { readings: texts.length ? texts : [R.trim()], refused: null, spans: texts.length ? spans : [[0, R.length]] };
};

// ---------------------------------------------------------------- run
const rows = readFileSync(JSONL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const win = (key, R, i) => `${key}: ${R.slice(Math.max(0, i - 28), i + 28)}`.slice(0, 66);
const short = (key, R) => `${key}: ${R.length > 60 ? R.slice(0, 57) + "..." : R}`;

const regionCount = {}; const regionCut = {}; const regionEx = {};
const markOcc = new Map(), markRoutes = new Map();
const shapeCount = new Map(), shapeEx = new Map(), shapeRegion = new Map();
const unexplained = new Map(), unexEx = new Map();
const defMarkRows = new Map(), defMarkRowRoutes = new Map();
const add = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const addEx = (m, k, e, cap = 6) => { if (!m.has(k)) m.set(k, []); const a = m.get(k); if (a.length < cap && !a.includes(e)) a.push(e); };

const cmp = { fields_compared: 0, same_division: 0, same_division_print_differs: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_withholds_where_declaration_prints: 0 };
const cmpEx = {}; const cmpByRegion = {}; const wholeListRoutes = [];
const held = { same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0 }; const heldEx = {};
const alone = { same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_withholds_where_declaration_prints: 0 };
const withheldCause = { definition_itself_unbalanced: 0, definition_balanced_store_cut_through_a_group: 0 };
const citationCut = { routes: 0, v3_prints: 0, v3_withholds: 0, declaration_prints: 0 };
const aug = { same: 0, august_divides_where_declaration_keeps_whole: 0, declaration_divides_where_august_keeps_whole: 0, divided_differently: 0 };
const augEx = {};
const augCase = {};
const declStats = { routes_divided: 0, pieces_from_divided: 0, refused_rejoin: 0, by_region: {} };
const damage = { orphan_closer_routes: 0, never_closed_routes: 0, routes_starting_after_citation_colon: 0, examples_after_citation: [] };
const headDash = { routes_beginning_with_hyphen: 0, def_has_opener_immediately_before: 0, by_opener_kind: {} };
let xTotal = 0; const xRoutes = new Set();
const ETYMOLOGY = /^(a primitive (root|word|particle)|(probably |apparently |perhaps |prob\. )?(from|for|the same as|identical with|corresponding to|feminine of|masculine of|plural of|a form of|a variation of|contracted from|by permutation|of foreign|of uncertain|of Egyptian|of Persian|of Greek|of Chaldee|of Aramaic|or |also |\(Aramaic\)|\(Chald\)|patronymic|denominative|intensive|causative|participle|active participle|passive participle))/i;
const pieceRoles = { list: 0, head: 0, head_etymology_shaped: 0, notes: 0, opener: 0, no_opener: 0, no_opener_etymology_shaped: 0, examples: {} };
const unbalancedCause = { routes: 0, definition_itself_unbalanced: 0, definition_balanced_store_cut_through_a_group: 0, examples: { definition_itself_unbalanced: [], definition_balanced_store_cut_through_a_group: [] } };
const suffixLed = { routes: 0, distinct_route_texts: new Set(), examples: [] };
let routesWithNonRenderingPiece = 0; let routeEqualsWholeMultiItemList = 0, routesCommaInGroup = 0, routesNoMark = 0, augustDividesRoutes = 0, defRowsWithSemicolon = 0, defRowsWithOpener = 0;
const defBalanced = new Map();
const balancedText = (t) => { let d = 0; for (const c of t) { if (c === "(") d++; else if (c === ")") { d--; if (d < 0) return false; } } return d === 0; };

rows.forEach((r, n) => {
  const R = r.route, D = r.def;
  const L = locate(R, D); L.defText = D;
  regionCount[L.region] = (regionCount[L.region] || 0) + 1;
  if (r.cut) regionCut[L.region] = (regionCut[L.region] || 0) + 1;
  if (!regionEx[L.region]) regionEx[L.region] = [];
  if (regionEx[L.region].length < 6 && !regionEx[L.region].some((e) => e.startsWith(r.key + ":"))) regionEx[L.region].push(short(r.key, R));

  const P = parse(R);
  if (P.match.some((x) => x === -2)) damage.orphan_closer_routes++;
  if (P.firstUnclosed >= 0) damage.never_closed_routes++;
  if (L.at > 0 && /\d\s*:\s*$/.test(D.slice(0, L.at)) && /^\d/.test(R)) { damage.routes_starting_after_citation_colon++; if (damage.examples_after_citation.length < 6) damage.examples_after_citation.push(short(r.key, R)); }
  if (/^-/.test(R)) {
    headDash.routes_beginning_with_hyphen++;
    if (L.o && L.at >= L.o.a && L.at < L.o.z) { headDash.def_has_opener_immediately_before++; headDash.by_opener_kind[L.o.kind] = (headDash.by_opener_kind[L.o.kind] || 0) + 1; }
    else { headDash.not_opener_tail_texts = headDash.not_opener_tail_texts || {}; headDash.not_opener_tail_texts[R] = (headDash.not_opener_tail_texts[R] || 0) + 1; }
  }

  if (P.match.some((x) => x === -2 || x === -1)) {
    unbalancedCause.routes++;
    if (!defBalanced.has(D)) defBalanced.set(D, balancedText(D));
    const k = defBalanced.get(D) ? "definition_balanced_store_cut_through_a_group" : "definition_itself_unbalanced";
    unbalancedCause[k]++; if (unbalancedCause.examples[k].length < 6 && !unbalancedCause.examples[k].some((e) => e.startsWith(r.key + ":"))) unbalancedCause.examples[k].push(short(r.key, R));
  }
  if (L.region === "list_item" && !L.openerTail && /^\(*\s*-/.test(R)) { suffixLed.routes++; suffixLed.distinct_route_texts.add(R); if (suffixLed.examples.length < 8 && !suffixLed.examples.some((e) => e.endsWith(": " + R))) suffixLed.examples.push(short(r.key, R)); }
  if (L.o) { defRowsWithOpener++; const whole = D.slice(L.o.z, L.listEnd).trim(); let flat = whole; for (let k = 0; k < 8; k++) flat = flat.replace(/\([^()]*\)/g, "");
    if (R === whole && /,/.test(flat)) { routeEqualsWholeMultiItemList++; if (wholeListRoutes.length < 6) wholeListRoutes.push(short(r.key, R)); } }
  if (D.includes(";")) defRowsWithSemicolon++;
  if (!MARK.test(R) && !xTokens(R).length) routesNoMark++;
  const seenHere = new Set();
  const shapesAt = [];
  for (let i = 0; i < R.length; i++) {
    const c = R[i];
    if (!MARK.test(c)) continue;
    add(markOcc, c); seenHere.add(c);
    const s = shapeOf(R, i, P, L);
    if (s === null) { add(unexplained, c); addEx(unexEx, c, win(r.key, R, i)); continue; }
    shapesAt.push([i, s]);
    add(shapeCount, c + "\u0000" + s); addEx(shapeEx, c + "\u0000" + s, win(r.key, R, i), 4);
    const rk = c + "\u0000" + s; if (!shapeRegion.has(rk)) shapeRegion.set(rk, new Map()); add(shapeRegion.get(rk), charRegion(L, i));
  }
  for (const c of seenHere) add(markRoutes, c);
  const xs = xTokens(R);
  if (xs.length) xRoutes.add(n);
  for (const i of xs) { xTotal++; const s = xShapeOf(R, i, P, L); add(shapeCount, "X\u0000" + s); addEx(shapeEx, "X\u0000" + s, win(r.key, R, i), 4); const rk = "X\u0000" + s; if (!shapeRegion.has(rk)) shapeRegion.set(rk, new Map()); add(shapeRegion.get(rk), charRegion(L, i)); }

  // definition text, per row
  const dseen = new Set();
  for (const c of D) if (MARK.test(c)) { add(defMarkRows, c); dseen.add(c); }
  for (const c of dseen) add(defMarkRowRoutes, c);

  // division
  const dec = declare(R, L, shapesAt);
  if (dec.refused) declStats.refused_rejoin++;
  if (shapesAt.some(([, sh]) => sh === "comma.in_group")) routesCommaInGroup++;
  if (dec.readings.length > 1 && dec.spans.some(([a]) => !["list", "list_end"].includes(charRegion(L, a)))) routesWithNonRenderingPiece++;
  if (dec.readings.length > 1) {
    for (const [a] of dec.spans) {
      const reg = charRegion(L, a); const txt = R.slice(a, a + 60);
      const role = reg === "list" || reg === "list_end" ? "list" : reg;
      pieceRoles[role] = (pieceRoles[role] || 0) + 1;
      if ((role === "head" || role === "no_opener") && ETYMOLOGY.test(txt)) pieceRoles[role === "head" ? "head_etymology_shaped" : "no_opener_etymology_shaped"]++;
      if (!pieceRoles.examples[role]) pieceRoles.examples[role] = [];
      if (pieceRoles.examples[role].length < 6 && !pieceRoles.examples[role].some((e) => e.endsWith(": " + R.slice(a, dec.spans.find(([x]) => x === a)[1]).slice(0, 50)))) pieceRoles.examples[role].push(`${r.key}: ${R.slice(a, dec.spans.find(([x]) => x === a)[1]).slice(0, 50)}`);
    }
  }
  if (dec.readings.length > 1) { declStats.routes_divided++; declStats.pieces_from_divided += dec.readings.length; declStats.by_region[L.region] = (declStats.by_region[L.region] || 0) + 1; }
  const v3 = v3Print(R);
  cmp.fields_compared++;
  const same = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);
  // the opener's dashes and a separator left at a piece's edge are the mark, not the reading
  const stripTail = (a) => a.map((x) => x.replace(/^-{1,2}\s*/, "").replace(/\s*[,;]$/, "").trim());
  let kind;
  if (same(v3.readings, dec.readings)) kind = "same_division";
  else if (v3.readings.length === 0) kind = "v3_withholds_where_declaration_prints";
  else if (same(stripTail(v3.readings), dec.readings)) kind = "same_division_print_differs";
  else if (v3.readings.length > 1 && dec.readings.length === 1) kind = "v3_divides_where_declaration_keeps_whole";
  else if (dec.readings.length > 1 && v3.readings.length === 1) kind = "declaration_divides_where_v3_keeps_whole";
  else kind = "divided_differently";
  cmp[kind]++;
  {
    // senseSplit alone, without gloss-store's packSplit at ';' first
    const s1 = senseSplit(R); const ar1 = s1.damaged ? [] : s1.readings.map((x) => x.trim());
    let k1;
    if (same(ar1, dec.readings) || same(stripTail(ar1), dec.readings)) k1 = "same_division";
    else if (ar1.length === 0) k1 = "v3_withholds_where_declaration_prints";
    else if (ar1.length > 1 && dec.readings.length === 1) k1 = "v3_divides_where_declaration_keeps_whole";
    else if (dec.readings.length > 1 && ar1.length === 1) k1 = "declaration_divides_where_v3_keeps_whole";
    else k1 = "divided_differently";
    alone[k1]++;
  }
  {
    // the rule as sense-split-v1.mjs states it: packSplit at depth-0 ';', then senseSplit, and a damaged
    // field held whole as one reading (senseSplit returns it so) instead of withheld as the card's pool does
    const hr = []; for (const sense of packSplit(R)) hr.push(...senseSplit(sense).readings.map((x) => x.trim()));
    let k2;
    if (same(hr, dec.readings) || same(stripTail(hr), dec.readings)) k2 = "same_division";
    else if (hr.length > 1 && dec.readings.length === 1) k2 = "v3_divides_where_declaration_keeps_whole";
    else if (dec.readings.length > 1 && hr.length === 1) k2 = "declaration_divides_where_v3_keeps_whole";
    else k2 = "divided_differently";
    held[k2]++;
    if (k2 !== "same_division" && (!heldEx[k2] || heldEx[k2].length < 6) && !(heldEx[k2] || []).some((e) => e.route === R.slice(0, 60))) { (heldEx[k2] = heldEx[k2] || []).push({ key: r.key, route: R.slice(0, 60), v3: hr.map((x) => x.slice(0, 60)), declaration: dec.readings.map((x) => x.slice(0, 60)) }); }
  }
  if (kind === "v3_withholds_where_declaration_prints") { if (!defBalanced.has(D)) defBalanced.set(D, balancedText(D)); withheldCause[defBalanced.get(D) ? "definition_balanced_store_cut_through_a_group" : "definition_itself_unbalanced"]++; }
  if (L.at > 0 && /\d\s*:\s*$/.test(D.slice(0, L.at)) && /^\d/.test(R)) { citationCut.routes++; if (v3.readings.length) citationCut.v3_prints++; else citationCut.v3_withholds++; if (dec.readings.length) citationCut.declaration_prints++; }
  if (!cmpByRegion[kind]) cmpByRegion[kind] = {}; cmpByRegion[kind][L.region] = (cmpByRegion[kind][L.region] || 0) + 1;
  if (kind === "same_division_print_differs") cmp.same_division++;
  if (kind !== "same_division") { if (!cmpEx[kind]) cmpEx[kind] = []; if (cmpEx[kind].length < 6 && !cmpEx[kind].some((e) => e.route === R)) cmpEx[kind].push({ key: r.key, route: R.slice(0, 60), region: L.region, v3: v3.readings.map((x) => x.slice(0, 60)), v3_withheld_senses: v3.withheld, declaration: dec.readings.map((x) => x.slice(0, 60)) }); }

  const a = readingOf(R, D, SOURCE_KEY);
  augCase[a.caseName || (a.refused ? "refused" : "none")] = (augCase[a.caseName || (a.refused ? "refused" : "none")] || 0) + 1;
  const ar = a.readings.map((x) => x.trim());
  if (ar.length > 1) augustDividesRoutes++;
  let ak;
  if (same(ar, dec.readings)) ak = "same";
  else if (same(stripTail(ar), dec.readings)) ak = "same";
  else if (ar.length > 1 && dec.readings.length === 1) ak = "august_divides_where_declaration_keeps_whole";
  else if (dec.readings.length > 1 && ar.length === 1) ak = "declaration_divides_where_august_keeps_whole";
  else ak = "divided_differently";
  aug[ak]++;
  if (ak !== "same") { if (!augEx[ak]) augEx[ak] = []; if (augEx[ak].length < 4 && !augEx[ak].some((e) => e.route === R)) augEx[ak].push({ key: r.key, route: R.slice(0, 60), august: ar.map((x) => x.slice(0, 50)), declaration: dec.readings.map((x) => x.slice(0, 50)) }); }
});
cmp.same_division_exact = cmp.same_division - cmp.same_division_print_differs;

// falsifier for the opener: an earlier colon whose tail carries more of the definition's routes than the last one's
const routesByDef = new Map();
for (const r of rows) { if (!routesByDef.has(r.def)) routesByDef.set(r.def, new Set()); routesByDef.get(r.def).add(r.route); }
let defsWithTwoOrMoreOpenerColons = 0, defsWhereAnEarlierColonCoversMore = 0;
for (const [D, rs] of routesByDef) {
  const cs = []; const re = /:(?!\s*\d)/g; let m; while ((m = re.exec(D))) cs.push(m.index);
  if (cs.length < 2) continue;
  defsWithTwoOrMoreOpenerColons++;
  const score = cs.map((c) => [...rs].filter((R) => D.indexOf(R, c + 1) >= 0).length);
  if (score.slice(0, -1).some((x) => x > score[score.length - 1])) defsWhereAnEarlierColonCoversMore++;
}
// falsifier for '( )' as notation annexed to a principal word: a list route that is one group with nothing outside it
const loneGroup = { routes: 0, texts: {} };
let notationWithoutPrincipalWord = 0;
for (const r of rows) {
  const R = r.route; const L = locate(R, r.def); if (L.region !== "list_item" || L.openerTail) continue;
  const P = parse(R);
  const suffixLedHere = /^\(*\s*-/.test(R);
  const loneHere = /^\(.*\)$/.test(R) && P.match[0] === R.length - 1;
  if (suffixLedHere || loneHere) notationWithoutPrincipalWord++;
}
for (const r of rows) {
  const R = r.route; if (!/^\(.*\)$/.test(R)) continue;
  const P = parse(R); if (P.match[0] !== R.length - 1) continue;
  const L = locate(R, r.def); if (L.region !== "list_item") continue;
  loneGroup.routes++; loneGroup.texts[R] = (loneGroup.texts[R] || 0) + 1;
}

// distinct definitions: marks by region of the definition
const defs = [...new Set(rows.map((r) => r.def))];
const defRegionMarks = new Map();
const defOpenerKinds = {};
let defsWithCitationColon = 0, defsListSemicolon = 0, defsHeadPlusOrX = 0, defsListPlus = 0, defsListX = 0;
for (const D of defs) {
  const { o, listEnd } = defInfo(D);
  defOpenerKinds[o ? o.kind : "none"] = (defOpenerKinds[o ? o.kind : "none"] || 0) + 1;
  if (/\d\s*:\s*\d/.test(D)) defsWithCitationColon++;
  let d = 0, listSemi = false, headPX = false, listP = false, listX = false;
  for (let i = 0; i < D.length; i++) {
    const c = D[i];
    const reg = !o ? "no_opener" : i < o.a ? "head" : i < o.z ? "opener" : i < listEnd ? "list" : i === listEnd ? "list_end" : "notes";
    if (c === "(") d++; else if (c === ")") { if (d > 0) d--; }
    if (MARK.test(c)) { if (!defRegionMarks.has(c)) defRegionMarks.set(c, {}); const m = defRegionMarks.get(c); m[reg] = (m[reg] || 0) + 1; }
    if (c === ";" && reg === "list" && d === 0) listSemi = true;
    const isX = c === "X" && !isLetter(D[i - 1]) && !isLetter(D[i + 1]);
    if ((c === "+" || isX) && reg === "head") headPX = true;
    if (c === "+" && reg === "list") listP = true;
    if (isX && reg === "list") listX = true;
  }
  if (listSemi) defsListSemicolon++; if (headPX) defsHeadPlusOrX++; if (listP) defsListPlus++; if (listX) defsListX++;
}

// inventory check
const inv = JSON.parse(readFileSync(INVENTORY, "utf8"));
const invP = inv.providers.find((p) => p.provider === "M14");
const invByMark = new Map(invP.marks.map((m) => [m.mark, m]));

// ---------------------------------------------------------------- shape ledger text
const SHAPES = {
  "paren.optional_words": ["( ) in the rendering list holding word(s), no comma inside the group, not an aside", "a word sometimes given with the principal word it is annexed to: '(become) glorious' is glorious, or become glorious", false],
  "paren.alternatives": ["( ) in the rendering list with a comma at the group's own depth, not led by a hyphen", "several words, any one of which is sometimes given with the principal word: 'break (down, through)'", false],
  "paren.suffix_syllable": ["( ) in the rendering list whose content begins with '-' (optionally after a nested '(')", "a syllable (or syllables, or words after a comma) sometimes added to the end of the principal word it is glued to: 'in(-curable)'", false],
  "paren.prefix_syllable": ["( ) in the rendering list whose content ends with '-'", "a syllable sometimes added to the start of the principal word that follows: '(father-)less'", false],
  "paren.list_aside": ["( ) in the rendering list whose content begins 'by mistake for', 'by confusion with', 'from the margin', 'including the article' and the like, or holds a chapter:verse citation", "the provider's explanation of an irregular rendering (the original's italic note), not part of the rendering", false],
  "paren.head_aside": ["( ) in the definition head, before the list opener", "an aside inside Strong's own definition sentence: a qualifier such as 'literally or figuratively', or a note on the etymology", false],
  "paren.note": ["( ) after the rendering list's full stop", "a note after the list: '(Superlative of ...)', '(In Psa. 141:3, dal, irreg.)'", false],
  "paren.opener_aside": ["( ) inside the list opener", "never seen", false],
  "paren.closer_with_nothing_open": ["')' with no '(' open before it in the route", "damage: either the provider's own stray closer or a route the store cut inside a group the provider wrote", false],
  "paren.opener_never_closed": ["'(' with no ')' after it in the route", "damage: a group whose close lies outside the route (the store cut through it) or that the provider never closed", false],
  "comma.in_group": ["',' at parenthesis depth >= 1 in the rendering list, group not an aside", "separates the alternatives inside one optional group; the route stays one rendering", false],
  "comma.in_aside": ["',' inside a list aside or citation group", "punctuation inside the provider's note or a citation list ('13:10, 14')", false],
  "comma.in_unclosed_group": ["',' after an unclosed '(' in the rendering list", "a comma inside a group whose extent is unknown; nothing after the opener is divided", false],
  "comma.rendering_separator": ["',' at depth 0 in the rendering list", "separates one KJV rendering from the next", true],
  "comma.in_head_aside": ["',' inside parentheses in the definition head", "punctuation inside an aside of Strong's own definition ('(literally, to go downwards; ...)')", false],
  "comma.head_prose": ["',' at depth 0 in the definition head", "punctuation of Strong's own definition sentence ('by implication, safe, strong'); prose, not a list of readings", false],
  "comma.note_prose": ["',' after the rendering list's full stop", "punctuation inside a note", false],
  "semicolon.rendering_separator": ["';' at depth 0 in the rendering list", "separates one KJV rendering from the next, as a comma does: 'draught house; going forth'", true],
  "semicolon.in_group": ["';' inside a group in the rendering list", "punctuation inside a group", false],
  "semicolon.head_separator": ["';' at depth 0 in the definition head (or in a definition with no opener), not directly before the opener", "separates etymology from sense and one sense from the next", true],
  "semicolon.in_head_aside": ["';' inside parentheses in the head", "punctuation inside an aside of the definition ('(literally, to go downwards; or ...)')", false],
  "semicolon.opener": ["';' that is part of the list opener ('; -', '; --', or ';' with only space before '--')", "opens the KJV rendering list where the text has no colon", true],
  "semicolon.note_prose": ["';' after the rendering list's full stop", "punctuation inside a note", false],
  "colon.citation": ["':' between digits (chapter:verse)", "a Bible citation", false],
  "colon.opener": ["':' that is the definition's list opener (the last colon not followed by a digit)", "separates Strong's definition from the KJV rendering list", true],
  "period.ellipsis": ["'.' that is part of '...'", "the KJV phrase continues with words that render other Hebrew words: 'come to...estate'", false],
  "period.list_end": ["the first depth-0 '.' after the opener (not an ellipsis, 'i.e.' or '.,')", "ends the rendering list; what follows is a note or a cross-reference stub", true],
  "period.abbreviation": ["'.' closing an abbreviation token (i.e, Marg, Psa, Ezek, Hos, Prop, Incl, irreg, etc and the like)", "abbreviation", false],
  "period.note_sentence_end": ["'.' after the list end that closes no abbreviation", "ends a sentence of a note", false],
  "period.head_sentence_end": ["'.' in the head that closes no abbreviation", "ends a sentence of the definition", false],
  "period.stray_in_rendering": ["'.' inside the rendering list that is none of the above", "a stray full stop inside one rendering ('(make) crooked.')", false],
  "hyphen.opener_tail": ["'-' inside the list opener (':--', ': -', '; -', '--')", "the tail of the opener; the reading begins after it", false],
  "hyphen.misplaced_opener_tail": ["'-' at depth 0 in the rendering list directly after '; ' and before a letter", "the ':--' opener's tail written after the first rendering ('excrement; -dung' where Strong's prints 'excrement:--dung')", false],
  "hyphen.compound": ["'-' between two letters", "joins an English compound or a hyphenated name ('stiff-necked', 'Dibon-gad'); part of the word", false],
  "hyphen.suffix_syllable": ["'-' at the route's start or after '(', ')', ',', space or '-', and before a letter or '('", "marks a syllable that attaches to the end of the principal word: '-ing', '-er'", false],
  "hyphen.prefix_syllable": ["'-' after a letter and before ')', ',', space, '(' or the end", "marks a syllable that attaches to the start of the following word: 'father-', 'be-'", false],
  "hyphen.detached_syllable": ["'-' between a space or '(' and a space", "a syllable marker separated from its syllable by a stray space ('- ness')", false],
  "hyphen.bare_in_group": ["'-' standing alone between '(' or ',' and ')' or ','", "the hyphen itself is the optional element: written joined or apart ('dwelling((-)place)')", false],
  "plus.whole_rendering": ["'+' first in the rendering (after any opener tail)", "Strong's sign: this rendering renders the word only together with one or more other Hebrew words", false],
  "plus.in_group": ["'+' inside a group", "the same sign on one alternative inside the group", false],
  "plus.mid_rendering": ["'+' at depth 0 after the rendering has begun", "the same sign on the words that follow it inside one rendering", false],
  "x.whole_rendering": ["standalone capital X first in the rendering (after any opener tail)", "Strong's sign: this rendering results from an idiom peculiar to the Hebrew", false],
  "x.in_group": ["standalone X inside a group", "the same sign on one alternative inside the group", false],
  "x.mid_rendering": ["standalone X at depth 0 after the rendering has begun", "the same sign on the words that follow it inside one rendering", false],
  "backtick.ayin_in_transliteration": ["'`' touching a letter", "the transliteration of ayin inside a romanized Hebrew word ('`anah')", false],
  "apostrophe.english": ["\"'\" touching a letter", "an English apostrophe ('one's', 'father's') or the aleph in a transliteration ('me'ah')", false],
  "quote.quotation": ["'\"' anywhere", "quotation marks around a rendering or phrase quoted in a note", false],
  "ampersand.in_rendering": ["'&' in the rendering list", "unresolved: '&' where the list elsewhere writes words or a sign ('& presume')", false],
  "ampersand.and_in_head": ["'&' in the head", "'and' in Strong's definition sentence", false],
  "question.interrogative": ["'?' after a letter", "an interrogative rendering ('where?')", false],
  "exclamation.in_rendering": ["'!' after a letter", "an exclamation inside one rendering ('+ O that! what')", false],
  "point.in_hebrew_word": ["a Hebrew point or accent following a Hebrew letter or point", "a vowel point or accent of a Hebrew word quoted in the route (an etymology or cross-reference); U+05AB is the stress accent Strong's prints on the quoted word", false],
};

const marksOut = [];
const allMarks = [...new Set([...markOcc.keys(), ...invByMark.keys()])].sort((a, b) => (markOcc.get(b) || 0) - (markOcc.get(a) || 0));
for (const c of [...allMarks, "X"]) {
  const shapes = [];
  for (const [k, v] of shapeCount) {
    const [m, s] = k.split("\u0000"); if (m !== c) continue;
    const t = SHAPES[s] || ["?", "?", false];
    shapes.push({ shape: s, test: t[0], count: v, means: t[1], divides_readings: t[2], region: Object.fromEntries(shapeRegion.get(k)), examples: shapeEx.get(k) });
  }
  shapes.sort((a, b) => b.count - a.count);
  const inv = invByMark.get(c);
  marksOut.push({
    mark: c, codepoint: c === "X" ? "U+0058 (sigil token, not in the inventory: a letter)" : "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    occurrences: c === "X" ? xTotal : (markOcc.get(c) || 0),
    routes: c === "X" ? xRoutes.size : (markRoutes.get(c) || 0),
    inventory: inv ? { occurrences: inv.occurrences, routes_carrying_it: inv.routes_carrying_it, agrees: inv.occurrences === (markOcc.get(c) || 0) && inv.routes_carrying_it === (markRoutes.get(c) || 0) } : null,
    definition_text: c === "X" ? null : { occurrences_over_rows: defMarkRows.get(c) || 0, rows_whose_definition_carries_it: defMarkRowRoutes.get(c) || 0, by_definition_region_over_distinct_definitions: defRegionMarks.get(c) || {} },
    shapes, unexplained: unexplained.get(c) || 0, unexplained_examples: unexEx.get(c) || [],
  });
}
const defOnly = [...defRegionMarks.keys()].filter((c) => !markOcc.has(c));

// ---------------------------------------------------------------- the August declaration, claim by claim
const AUG = JSON.parse(readFileSync(join(TOOLS, "declarations-v1.json"), "utf8")).providers[SOURCE_KEY];
const ranked = JSON.parse(readFileSync(join(SCRATCH, "punct/sources-ranked.json"), "utf8")).sources.find((x) => x.source_key === SOURCE_KEY);
const fmt = (x) => Number(x || 0).toLocaleString("en-US");
const sc = (mark, shape) => shapeCount.get(mark + "\u0000" + shape) || 0;
const sumShapes = (mark, prefix) => [...shapeCount].filter(([k]) => k.startsWith(mark + "\u0000" + prefix)).reduce((t, [, v]) => t + v, 0);
const augustTest = {
  routes_then: AUG.routes, routes_now: rows.length,
  colon: { august: AUG.marks[":"], now: { rows_whose_definition_has_a_list_opener: defRowsWithOpener, opener_kinds_over_distinct_definitions: defOpenerKinds, routes_that_are_one_item_of_the_list: regionCount.list_item, routes_equal_to_the_whole_multi_item_list: routeEqualsWholeMultiItemList, routes_equal_to_the_whole_multi_item_list_examples: wholeListRoutes, definitions_with_a_chapter_verse_colon: defsWithCitationColon, routes_starting_right_after_a_chapter_verse_colon: damage.routes_starting_after_citation_colon, colon_in_route_text: { citation: sc(":", "colon.citation"), opener: sc(":", "colon.opener") } }, verdict: `holds, extended: the opener is spelled ':' (${fmt(defOpenerKinds[":"])} definitions), ':--' (${fmt(defOpenerKinds[":--"])}), '--' (${fmt(defOpenerKinds["--"])}) or '; -' (${fmt(defOpenerKinds["; -"])}), and ${fmt(defOpenerKinds.none)} have none; a colon between digits is a chapter:verse citation, never the opener` },
  semicolon: { august: AUG.marks[";"], now: { rows_whose_definition_carries_it: defRowsWithSemicolon, route_occurrences: markOcc.get(";"), head_separator: sc(";", "semicolon.head_separator"), rendering_separator_in_the_list: sc(";", "semicolon.rendering_separator"), part_of_the_opener: sc(";", "semicolon.opener"), inside_head_asides: sc(";", "semicolon.in_head_aside"), in_notes: sc(";", "semicolon.note_prose"), definitions_with_a_depth0_semicolon_in_the_list: defsListSemicolon }, verdict: `holds for the head, extended: in ${fmt(defsListSemicolon)} definitions a depth-0 ';' also separates renderings inside the list, and ';' is part of the '; -' opener` },
  comma: { august: AUG.marks[","], now: { route_occurrences: markOcc.get(","), in_group: sc(",", "comma.in_group"), routes_with_a_comma_inside_a_group: routesCommaInGroup, depth0_in_the_list: sc(",", "comma.rendering_separator"), in_unclosed_group: sc(",", "comma.in_unclosed_group"), head_prose: sc(",", "comma.head_prose"), note_prose: sc(",", "comma.note_prose") }, verdict: `holds in the definition; in today's route text the store has already divided at the depth-0 comma, so ${fmt(sc(",", "comma.rendering_separator"))} depth-0 comma is left in the list region and ${fmt(sc(",", "comma.in_group"))} of ${fmt(markOcc.get(","))} sit inside groups` },
  paren: { august: AUG.marks["("], now: { groups: sc("(", "paren.optional_words") + sc("(", "paren.alternatives") + sc("(", "paren.suffix_syllable") + sc("(", "paren.prefix_syllable") + sc("(", "paren.list_aside") + sc("(", "paren.head_aside") + sc("(", "paren.note"), optional_words: sc("(", "paren.optional_words"), alternatives: sc("(", "paren.alternatives"), suffix_syllable: sc("(", "paren.suffix_syllable"), prefix_syllable: sc("(", "paren.prefix_syllable"), list_aside: sc("(", "paren.list_aside"), head_aside: sc("(", "paren.head_aside"), note: sc("(", "paren.note") }, verdict: `corrected: 'scope over the alternation' fits the ${fmt(sc("(", "paren.alternatives"))} groups that hold a comma; ${fmt(sc("(", "paren.optional_words"))} groups hold one optional word and ${fmt(sc("(", "paren.suffix_syllable") + sc("(", "paren.prefix_syllable"))} hold a syllable, which is the provider's own sign — a word or syllable sometimes given with the principal word; ${fmt(sc("(", "paren.list_aside"))} list groups and ${fmt(sc("(", "paren.head_aside"))} head groups are asides, not part of any rendering` },
  hyphen: { august: AUG.marks["-"], now: { suffix_syllable: sc("-", "hyphen.suffix_syllable"), prefix_syllable: sc("-", "hyphen.prefix_syllable"), detached_syllable: sc("-", "hyphen.detached_syllable"), bare_in_group: sc("-", "hyphen.bare_in_group"), compound: sc("-", "hyphen.compound"), opener_tail: sc("-", "hyphen.opener_tail") }, verdict: "holds for the suffix syllable (still not expanded), extended: a prefix syllable attaches to the start of the next word, a hyphen between letters is part of a compound or name, and a hyphen in the opener is the opener's tail" },
  X: { august: AUG.marks.X, now: { tokens: xTotal, routes: xRoutes.size, whole_rendering: sc("X", "x.whole_rendering"), in_group: sc("X", "x.in_group"), mid_rendering: sc("X", "x.mid_rendering"), definitions_with_plus_or_X_in_the_head: defsHeadPlusOrX, definitions_with_X_in_the_list: defsListX }, verdict: "holds, wording refined to the provider's own sign: a rendering that results from an idiom peculiar to the Hebrew" },
  plus: { august: AUG.marks["+"], now: { occurrences: markOcc.get("+"), whole_rendering: sc("+", "plus.whole_rendering"), in_group: sc("+", "plus.in_group"), mid_rendering: sc("+", "plus.mid_rendering"), definitions_with_plus_in_the_list: defsListPlus }, verdict: "corrected: the provider's own sign says a rendering made in connection with one or more other Hebrew words; 'supplied by the translators and not in the Hebrew' cannot be right for a word Strong's files under this Hebrew entry" },
  unbalanced_parentheses: { august: AUG.refusals.unbalanced_parentheses.rows, august_closer: AUG.refusals.unbalanced_parentheses.closer_with_nothing_open.rows, august_opener: AUG.refusals.unbalanced_parentheses.opener_never_closed.rows, now_routes_with_a_closer_with_nothing_open: damage.orphan_closer_routes, now_routes_with_an_opener_never_closed: damage.never_closed_routes, now_routes_with_either: unbalancedCause.routes, causes: { definition_itself_unbalanced: unbalancedCause.definition_itself_unbalanced, definition_balanced_store_cut_through_a_group: unbalancedCause.definition_balanced_store_cut_through_a_group }, verdict: "both rules hold; the count moved" },
  head_mark: { august: { governs: AUG.separates_on.head_mark.governs, falsifier: AUG.separates_on.head_mark.falsifier }, now: headDash, falsifier_fires: headDash.routes_beginning_with_hyphen - headDash.def_has_opener_immediately_before, verdict: `corrected: ${fmt(headDash.routes_beginning_with_hyphen - headDash.def_has_opener_immediately_before)} routes begin with a hyphen that is a suffix syllable the store cut off as its own item ('-s', '-th'), not the opener's tail; the test must read the definition position, not the route's first character` },
  slash_in_precedence: { august_precedence: AUG.precedence, slash_occurrences_route: markOcc.get("/") || 0, slash_occurrences_definition: defMarkRows.get("/") || 0, verdict: "'/' is in the August precedence but this provider never writes it; dropped" },
  square_bracket: { route: markOcc.get("[") || 0, definition: defMarkRows.get("[") || 0, verdict: "the provider's own sign for an additional Hebrew word is absent from this text; if it arrives, closure reports it" },
  export_posture: { august: AUG.export, store_today: ranked.licensePosture, agrees: AUG.export.includes(ranked.licensePosture), verdict: `the August export line reads '${AUG.export}'; the store's M14 record today says ${ranked.licensePosture}` },
  august_machine_on_todays_text: { routes_it_divides: augustDividesRoutes },
};

const out = {
  schema: "MARK_LEDGER_CENSUS_V1 (pilot)",
  source_key: SOURCE_KEY, m_ids: M_IDS, routes: rows.length, emitted_on: "2026-10-31",
  read_from: { routes: JSONL, inventory: INVENTORY, store: inv.emitted_from, engine: `${V3_RULE} via gloss-store-v1.mjs packSplit + sense-split-v1.mjs senseSplit`, august_machine: "declaration-v1.mjs readingOf" },
  distinct_definitions: defs.length, distinct_keys: new Set(rows.map((r) => r.key)).size,
  definition_list_opener: { by_kind_over_distinct_definitions: defOpenerKinds, definitions_with_a_chapter_verse_colon: defsWithCitationColon },
  definition_region_facts: { definitions_with_a_depth0_semicolon_inside_the_rendering_list: defsListSemicolon, definitions_with_plus_or_X_in_the_head: defsHeadPlusOrX, definitions_with_plus_in_the_list: defsListPlus, definitions_with_X_in_the_list: defsListX },
  route_region: { meaning: { list_item: "the route is exactly one depth-0 comma item of the KJV rendering list after the opener (or that item with the opener's own dashes at its head)", head: "the route lies wholly in Strong's definition before the opener", spans_opener: "the route runs from the head across the opener into the list (the store missed the opener)", list_part: "the route lies inside the list but is not one item (cut inside a group or at a citation colon)", spans_list_end: "the route runs across the list's full stop into the note after it", notes: "the route lies wholly after the list's full stop", no_opener: "the definition has no list opener", whole_definition_no_opener: "the route is the whole definition, which has no opener" }, counts: regionCount, of_which_store_cut_flag: regionCut, examples: regionEx },
  damage: { ...damage, unbalanced_parentheses_by_cause: unbalancedCause, suffix_led_list_items: { routes: suffixLed.routes, distinct_texts: suffixLed.distinct_route_texts.size, examples: suffixLed.examples, means: "the provider wrote a depth-0 comma before a syllable that extends the previous rendering ('seven(-fold),-s'); the store cut it into a route of its own" } },
  routes_with_no_mark_at_all: routesNoMark,
  head_mark_test: headDash,
  marks: marksOut,
  marks_in_definition_never_in_route: defOnly.map((c) => ({ mark: c, codepoint: "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"), by_definition_region_over_distinct_definitions: defRegionMarks.get(c) })),
  unexplained_total: [...unexplained.values()].reduce((a, b) => a + b, 0),
  declaration_division: { cut_shapes_in_precedence: [...CUT_SHAPES], ...declStats, pieces_by_region_of_the_definition: pieceRoles, routes_with_a_piece_from_the_head_or_notes: routesWithNonRenderingPiece },
  august_test: augustTest,
  falsifier_tests: {
    opener_last_colon: { definitions_with_two_or_more_non_citation_colons: defsWithTwoOrMoreOpenerColons, definitions_where_an_earlier_colon_covers_more_routes_than_the_last: defsWhereAnEarlierColonCoversMore },
    list_route_that_is_one_group_with_nothing_outside: { routes: loneGroup.routes, texts: loneGroup.texts },
    plus_or_X_in_the_definition_head: defsHeadPlusOrX,
    hyphen_at_route_head_not_in_the_opener: headDash.routes_beginning_with_hyphen - headDash.def_has_opener_immediately_before,
    suffix_led_list_items: suffixLed.routes,
    suffix_led_or_lone_group_list_items_union: notationWithoutPrincipalWord,
  },
  v3_comparison: { engine: "gloss-store packSplit at depth-0 ';', then senseSplit on each sense; a damaged sense prints nothing", ...cmp, sense_split_alone_without_packSplit: alone, damaged_held_whole_as_sense_split_returns_it: { ...held, examples: heldEx }, by_route_region: cmpByRegion, v3_withholds_by_cause: withheldCause, routes_cut_after_a_citation_colon: citationCut, examples: cmpEx },
  august_machine_comparison: { ...aug, august_case_names: augCase, examples: augEx },
};
writeFileSync(join(HERE, "census.json"), JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ routes: rows.length, regions: regionCount, unexplained: Object.fromEntries(unexplained), v3: cmp, aug, decl: declStats, damage, headDash }, null, 1));
