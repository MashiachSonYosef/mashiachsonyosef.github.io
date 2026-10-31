#!/usr/bin/env node
// Mark ledger pilot · openscriptures_strongs (M9) · 2026-10-31
//
// Reads one provider file (by-source/openscriptures_strongs.jsonl), one row per
// route: {key, route, def, m, year, cut}. Every mark occurrence in route text
// is located in the definition it was taken from and given exactly one shape.
// The declaration's division is computed from those shapes and compared with
// today's engine (packSplit on depth-0 ";" then senseSplit, sense-split-rule-v3).
//
// Writes, next to this file: census.json, declaration.json, changes-vs-v3.jsonl
// (key + line + category + piece counts, no provider text).
// Single process, one provider file. Read-only outside this folder.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUNCT = join(HERE, "..", "..");
const GHP = join(PUNCT, "..", "ghp");
const SRC = process.argv[2] || join(PUNCT, "by-source", "openscriptures_strongs.jsonl");
const { senseSplit, RULE_ID: V3_RULE } = await import(join(GHP, "reader", "tools", "sense-split-v1.mjs"));
const { SHAPES } = await import(join(HERE, "shapes-meaning.mjs"));

const rows = readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const INV = JSON.parse(readFileSync(join(PUNCT, "mark-inventory-2026-10-31.json"), "utf8"));
const invM9 = INV.providers.find((p) => p.provider === "M9");

const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const W = (t, i, before = 24, after = 34) => t.slice(Math.max(0, i - before), Math.min(t.length, i + after)); // <= 58 chars
const head = (t, n = 60) => (t.length > n ? t.slice(0, n) : t);

// ---------- field: which of Strong's two fields the definition text is -------
// OpenScriptures carries Strong's entry as separate fields; the store's `def`
// is one of them. strongs_def = Strong's own sentence; kjv_def = the KJV
// rendering list (ends at its full stop, carries the x and + signs).
// The <def> tagging of strongs_def survives as a space before , ; . after a
// tagged word ("to expand , i.e. ..."): the trace.
const TRACE = /[^\d\s] [,;.]/u;
const fieldOf = (d) => {
  if (/[×+]/u.test(d)) return { field: "list", by: "sign" };
  if (/\.(?:\s*\[[^\]]*\])?$/u.test(d.trimEnd()) && !TRACE.test(d)) return { field: "list", by: "full_stop" };
  return { field: "definition", by: TRACE.test(d) ? "trace" : "no_full_stop" };
};

// ---------- scan: depths and pairs over the definition text ------------------
const scan = (t) => {
  const n = t.length;
  const pd = new Int32Array(n + 1), bd = new Int32Array(n + 1);
  const partner = new Int32Array(n).fill(-2);
  const sp = [], sb = [];
  for (let i = 0; i < n; i += 1) {
    pd[i] = sp.length; bd[i] = sb.length;
    const c = t[i];
    if (c === "(") sp.push(i);
    else if (c === ")") { if (sp.length) { const o = sp.pop(); partner[o] = i; partner[i] = o; } else partner[i] = -1; }
    else if (c === "[") sb.push(i);
    else if (c === "]") { if (sb.length) { const o = sb.pop(); partner[o] = i; partner[i] = o; } else partner[i] = -1; }
  }
  pd[n] = sp.length; bd[n] = sb.length;
  for (const o of sp) partner[o] = -1;
  for (const o of sb) partner[o] = -1;
  const firstUnclosed = Math.min(...[...sp, ...sb, Infinity]);
  return { pd, bd, partner, firstUnclosed };
};
const inside = (S, i) => S.pd[i] > 0 || S.bd[i] > 0;

// The list's full stop: the first '.' at depth 0 that is not part of '...' and
// not a stray stop written before a comma ('crooked.,').
const listEndOf = (t, S) => {
  for (let i = 0; i < t.length; i += 1) {
    if (t[i] !== "." || inside(S, i)) continue;
    if (t[i - 1] === "." || t[i + 1] === ".") continue;
    if (t[i + 1] === ",") continue;
    return i;
  }
  return -1;
};

// Strong's usage labels: the words that open a sense and qualify it.
const LABEL_CORE =
  "properly|figuratively|literally|by implication|by impl\\.?|hence|specifically|generally|by analogy|by extension|" +
  "causatively|concretely|abstractly|adverbially|intensively|reflexively|transitively|intransitively|collectively|" +
  "abstract|concrete|adverb|morally|technically|elliptically|rarely|sometimes|occasionally|especially|usually|often|" +
  "mostly|chiefly|poetically|euphemistically|metaphorically|ironically|primarily|originally|also|" +
  "as (?:a |an )?(?:noun|adverb|adjective|preposition|conjunction|verb|interjection|particle|participle)|" +
  "(?:but )?(?:used|often|only)(?: only)? (?:adverbially|as an? \\w+|adverb)|in a (?:good|bad|wide|literal|figurative|peculiar) sense|" +
  "(?:as )?(?:a )?(?:masculine|feminine|plural|singular)|by (?:way of )?\\w+";
const LABEL = new RegExp(`^(?:(?:also|and|or|but|hence|i\\.e\\.|and so|and thus|so)\\s+)?\\(?(?:${LABEL_CORE})\\)?$`, "iu");
const USAGE_LEAD = /^(?:but\s+)?(?:used|often used|only|always|mostly)\b/iu;
const LABEL_LEAD = new RegExp(`^(?:(?:also|and|or|but|hence|i\\.e\\.|and so|and thus|so)\\s+)?\\(?(?:${LABEL_CORE})\\)?(?=[,\\s)]|$)`, "iu");
const stripGroups = (s) => { let x = s, y; do { y = x; x = x.replace(/\([^()]*\)|\[[^[\]]*\]/gu, " "); } while (x !== y); return x.replace(/\s+/gu, " ").trim(); };
const words = (s) => stripGroups(s).split(" ").filter(Boolean).length;

// piece of t at depth 0 that ends at i: back to the previous depth-0 , or ; (or start)
const pieceBefore = (t, S, i) => {
  let j = i - 1;
  for (; j >= 0; j -= 1) if ((t[j] === "," || t[j] === ";") && !inside(S, j)) break;
  return t.slice(j + 1, i);
};
const pieceAfter = (t, S, i) => {
  let j = i + 1;
  for (; j < t.length; j += 1) if ((t[j] === "," || t[j] === ";") && !inside(S, j)) break;
  return t.slice(i + 1, j);
};

// apostrophes: possessive or quotation, read left to right over the definition
const apostropheShapes = (t) => {
  const out = new Map(); let open = false;
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (c !== "'" && c !== "’") continue;
    const a = t[i - 1] || "", b = t[i + 1] || "", b2 = t[i + 2] || "";
    if (b === "s" && !/\p{L}/u.test(b2)) { out.set(i, "apostrophe.possessive"); continue; }
    if (!/\p{L}/u.test(a) && /[\p{L}-]/u.test(b) && !open) { out.set(i, "apostrophe.quote_open"); open = true; continue; }
    if (open) { out.set(i, "apostrophe.quote_close"); open = false; continue; }
    if (a === "s" && !/\p{L}/u.test(b)) { out.set(i, "apostrophe.plural_possessive"); continue; }
    out.set(i, "UNEXPLAINED");
  }
  return out;
};

// ---------- shapes ------------------------------------------------------------
// shape(t, ctx, i) -> name. ctx = {field, S, end, apos, routeSpan:[a,z]}
const DIVIDES = new Set(["comma.rendering_separator", "semicolon.rendering_separator", "period.list_end", "semicolon.sense_separator", "comma.def_between_tagged_glosses"]);

const groupShapeList = (t, S, o, c, region) => {
  if (region === "notes") return "paren.note";
  const g = t.slice(o + 1, c);
  const gt = g.trim();
  if (/\d/u.test(gt) || /^(?:by (?:mistake|confusion|exchange|including)|from (?:the )?marg|marg|which|but |the word|incl|prop\b)/iu.test(gt)) return "paren.list_aside";
  if (/^[×+]?\s*\[?-/u.test(gt)) return "paren.list_suffix_syllable";
  if (/-$/u.test(gt) && !/,/u.test(gt.slice(0, -1).replace(/\([^()]*\)/gu, ""))) return "paren.list_prefix_syllable";
  if (/-$/u.test(gt)) return "paren.list_prefix_syllables";
  // a comma at the group's own depth
  let d = 0;
  for (const ch of g) { if (ch === "(" || ch === "[") d += 1; else if (ch === ")" || ch === "]") d -= 1; else if (ch === "," && d === 0) return "paren.list_alternatives"; }
  return "paren.list_optional_words";
};
const groupShapeDef = (t, o, c) => {
  const g = t.slice(o + 1, c).trim();
  if (LABEL.test(g)) return "paren.def_label";
  const m = g.match(/^([^,]+),\s*(.+)$/u);
  if (m && LABEL.test(m[1].trim())) return "paren.def_labelled_alternative";
  if (/^-|-$/u.test(g)) return "paren.def_syllable";
  return "paren.def_aside";
};

const shapeOf = (t, ctx, i) => {
  const { field, S, end, apos, span } = ctx;
  const c = t[i];
  const region = field === "list" ? (end < 0 || i < end ? "body" : i === end ? "end" : "notes") : "definition";
  const ins = inside(S, i);
  const prev = t[i - 1] || "", next = t[i + 1] || "";

  if (c === "(" || c === ")" || c === "[" || c === "]") {
    const p = S.partner[i];
    const isParen = c === "(" || c === ")";
    if (p === -1) return isParen ? (c === "(" ? "paren.opener_never_closed" : "paren.closer_with_nothing_open") : "bracket.unbalanced";
    if (span && (p < span[0] || p >= span[1])) return isParen ? "paren.partner_outside_route" : "bracket.partner_outside_route";
    const o = Math.min(i, p), z = Math.max(i, p);
    if (!isParen) {
      const g = t.slice(o + 1, z);
      if (field === "list") return /^-/u.test(g) ? "bracket.list_syllable" : "bracket.list_note";
      return "bracket.def_note";
    }
    return field === "list" ? groupShapeList(t, S, o, z, region) : groupShapeDef(t, o, z);
  }
  if (c === ",") {
    if (field === "list") {
      if (region === "notes") return "comma.in_note";
      if (ins) return "comma.in_group";
      const after = t.slice(i + 1);
      if (/^-/u.test(after) || /^\s*\(\s*-[^()]*\)\s*(?:$|[,;.])/u.test(after)) return "comma.attaches_syllable";
      if (!after.trim() || /^\s*\.\s*$/u.test(after)) return "comma.trailing";
      return "comma.rendering_separator";
    }
    if (ins) return "comma.def_in_aside";
    const before = stripGroups(pieceBefore(t, S, i));
    if (LABEL.test(before)) return "comma.def_after_label";
    if (prev === " ") {
      // the left piece carries the provider's tag trace: a tagged definition word
      const rest = t.slice(i + 1).trimStart();
      if (/^i\.e\./u.test(rest)) return "comma.def_gloss_then_ie";
      if (/^etc\b/u.test(rest)) return "comma.def_gloss_then_etc";
      const lead = before.match(LABEL_LEAD);
      const core = (lead ? before.slice(lead[0].length) : before).replace(/^[,\s]+/u, "");
      if (/^\p{Lu}/u.test(core)) return "comma.def_name_then_description";
      const j = i + 1 + pieceAfter(t, S, i).length;           // the next depth-0 , or ; (or the end)
      if (j >= t.length) return "comma.def_gloss_then_last_piece";
      if (t[j - 1] === " ") return "comma.def_between_tagged_glosses";
      return "comma.def_gloss_then_untagged";
    }
    const after = pieceAfter(t, S, i);
    return words(before) <= 4 && words(after) <= 4 ? "comma.def_short_series" : "comma.def_clause";
  }
  if (c === ";") {
    if (field === "list") {
      if (region === "notes") return "semicolon.in_note";
      if (ins) return "semicolon.in_group_note";
      return "semicolon.rendering_separator";
    }
    if (ins) return "semicolon.def_in_aside";
    if (/^\s*i\.e\./u.test(t.slice(i + 1))) return "semicolon.before_ie";
    if (LABEL.test(stripGroups(pieceBefore(t, S, i)))) return "semicolon.after_bare_label";
    return "semicolon.sense_separator";
  }
  if (c === ".") {
    if (prev === "." || next === ".") return "period.ellipsis";
    if (field === "list") {
      if (region === "end") return "period.list_end";
      if (region === "notes") return "period.in_note";
      if (ins) return "period.in_group";
      if (next === ",") return "period.stray_before_comma";
      return "UNEXPLAINED";
    }
    if ((prev === "e" && t[i - 2] === "." && t[i - 3] === "i") || (prev === "i" && next === "e" && t[i + 2] === ".")) return "period.ie";
    if (/etc$/u.test(t.slice(0, i))) return "period.etc";
    if (prev === " ") return /^ \p{Ll}/u.test(t.slice(i + 1, i + 3)) ? "period.stray_for_comma" : "period.trace_end";
    const rest = t.slice(i + 1);
    if (next === ")") return "period.aside_sentence_end";
    if (!rest.trim() || /^\s+[\p{Lu}\p{Script=Hebrew}\d]/u.test(rest)) return "period.sentence_end";
    if (/\p{L}$/u.test(t.slice(0, i))) return "period.abbreviation";
    return "UNEXPLAINED";
  }
  if (c === "-") {
    if (field === "list" && region === "notes") return "hyphen.in_note";
    const L = (x) => /\p{L}/u.test(x);
    if (L(prev) && L(next)) return "hyphen.compound";
    if (field === "list") {
      if ((/[(\s,[']/u.test(prev) || i === 0) && (L(next) || next === "(")) return "hyphen.suffix_syllable";
      if (L(prev) && /[)\s,(.']/u.test(next)) return "hyphen.prefix_syllable";
      if (/[(,]/u.test(prev) && next === ")") return "hyphen.bare_in_group";
      return "UNEXPLAINED";
    }
    // definition
    if (L(prev) && next === " " && L(t[i + 2] || "")) return "hyphen.compound_split_by_space";
    if (prev === " " && L(next) && L(t[i - 2] || "")) return "hyphen.compound_split_by_space";
    if ((/[(\s,']/u.test(prev) || i === 0) && L(next)) return "hyphen.suffix_syllable";
    if (L(prev) && /[)\s,(.']/u.test(next)) return "hyphen.prefix_syllable";
    if (prev === " " && next === " ") return "hyphen.elided_part_of_name";
    return "UNEXPLAINED";
  }
  if (c === "×" || c === "+") {
    const k = c === "×" ? "times" : "plus";
    if (ins) return `${k}.in_group`;
    const before = t.slice(0, i).trimEnd();
    if (!before || /[,;]$/u.test(before)) return `${k}.whole_rendering`;
    return `${k}.mid_rendering`;
  }
  if (c === "'" || c === "’") return apos.get(i) || "UNEXPLAINED";
  if (c === "!") return /^($|[\s,;).])/u.test(next) ? "exclamation.ends_gloss" : "UNEXPLAINED";
  if (c === "?") return /^($|[\s,;).])/u.test(next) ? "question.ends_gloss" : "UNEXPLAINED";
  if (c === ":") return /\d/u.test(prev) && /\d/u.test(next) ? "colon.verse_citation" : "UNEXPLAINED";
  if (c === "}") return t.includes("{") ? "UNEXPLAINED" : "brace.stray_closer";
  if (/\p{M}/u.test(c) && /\p{Script=Hebrew}/u.test(c)) return "point.cited_hebrew_word";
  return "UNEXPLAINED";
};

// ---------- per-row context ------------------------------------------------------
const ctxCache = new Map();
const defCtx = (d) => {
  let x = ctxCache.get(d);
  if (!x) {
    const f = fieldOf(d); const S = scan(d);
    x = { ...f, S, end: f.field === "list" ? listEndOf(d, S) : -1, apos: apostropheShapes(d) };
    ctxCache.set(d, x);
  }
  return x;
};

// ---------- the declaration's division ------------------------------------------
// Cut only at the dividing shapes. Pieces are runs of the route's own characters;
// the cut character is the mark, not the reading. The list's full stop ends the
// list: what follows it is a note, kept as a piece and marked note.
const declared = (row) => {
  const R = row.route, D = row.def;
  const X = defCtx(D);
  const off = D.indexOf(R);
  const whole = R === D;
  if (!whole) return { pieces: [{ text: R.trim(), note: false }], cuts: [], region: "definition_slice" };
  const cuts = [];
  for (let i = 0; i < R.length; i += 1) {
    if (!isMark(R[i])) continue;
    const s = shapeOf(D, { ...X, span: null }, i + off);
    if (DIVIDES.has(s)) cuts.push([i, s]);
  }
  const pieces = []; let start = 0, afterEnd = false;
  for (const [i, s] of cuts) {
    const text = R.slice(start, i).trim();
    if (text) pieces.push({ text, note: afterEnd });
    if (s === "period.list_end") afterEnd = true;
    start = i + 1;
  }
  const tail = R.slice(start).trim();
  if (tail) pieces.push({ text: tail, note: afterEnd });
  // rejoin: the pieces and the cut marks, in order, are the route
  let rebuilt = ""; start = 0;
  for (const [i] of cuts) { rebuilt += R.slice(start, i) + R[i]; start = i + 1; }
  rebuilt += R.slice(start);
  const norm = (x) => x.replace(/\s+/gu, " ").trim();
  const cutAt = new Set(cuts.map(([i]) => i));
  const piecesOk = norm(pieces.map((p) => p.text).join(" ")) === norm([...R].map((ch, i) => (cutAt.has(i) ? " " : ch)).join(""));
  if (norm(rebuilt) !== norm(R) || !piecesOk) return { pieces: [{ text: R.trim(), note: false }], cuts: [], region: X.field, refused: "pieces do not rejoin" };
  return { pieces: pieces.length ? pieces : [{ text: R.trim(), note: false }], cuts, region: X.field };
};

// ---------- today's engine ---------------------------------------------------------
// gloss-store-v1.mjs packSplit (depth-0 ';', orphan closers inert) then senseSplit
// (sense-split-rule-v3) on each sense; a damaged sense is held whole here (the
// engine's pKey does this; gloss-store's pool drops it — counted apart).
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
const v3 = (R) => {
  const out = []; let damaged = 0;
  for (const s of packSplit(R)) { const r = senseSplit(s); if (r.damaged) { damaged += 1; out.push(s.trim()); } else out.push(...r.readings); }
  return { readings: out, damaged };
};

// ---------- run ---------------------------------------------------------------------
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const census = { route: {}, def_rows: {}, def_distinct: {} };
const shapes = {};          // mark -> shape -> {count, routes:Set, examples:[], regions:Set}
const regionsOfMark = {};
const unexplainedEx = [];
const rowRegion = {};
const fieldBy = {};
const defsSeen = new Set();
const defHasSlice = new Map();
for (const r of rows) { if (r.route !== r.def) defHasSlice.set(r.def, true); else if (!defHasSlice.has(r.def)) defHasSlice.set(r.def, false); }

let multiOffset = 0;
rows.forEach((row, li) => {
  const R = row.route, D = row.def;
  const X = defCtx(D);
  // census
  const seenR = new Set(), seenD = new Set();
  for (const c of R) if (isMark(c)) { inc(census.route, c); seenR.add(c); }
  for (const c of seenR) inc(census.route, `${c}#routes`);
  for (const c of D) if (isMark(c)) { inc(census.def_rows, c); seenD.add(c); }
  for (const c of seenD) inc(census.def_rows, `${c}#rows`);
  if (!defsSeen.has(D)) { defsSeen.add(D); for (const c of D) if (isMark(c)) inc(census.def_distinct, c); inc(fieldBy, `${X.field}:${X.by}`); }
  // region of the route
  const off = D.indexOf(R);
  if (off < 0) throw new Error(`route not inside its definition at line ${li + 1}`);
  if (D.indexOf(R, off + 1) >= 0 && R !== D) multiOffset += 1;
  const reg = R === D ? (X.field === "list" ? "list_whole" : "definition_whole") : "definition_slice";
  inc(rowRegion, reg);
  const span = R === D ? null : [off, off + R.length];
  for (let i = 0; i < R.length; i += 1) {
    const c = R[i];
    if (!isMark(c)) continue;
    const j = i + off;
    const s = shapeOf(D, { ...X, span }, j);
    const sub = X.field === "list" ? (X.end < 0 || j < X.end ? "list_body" : j === X.end ? "list_end" : "list_notes") : reg;
    const M = (shapes[c] ||= {});
    const e = (M[s] ||= { count: 0, routes: new Set(), examples: [], regions: {} });
    e.count += 1; e.routes.add(li); inc(e.regions, sub);
    if (e.examples.length < 4 && !e.examples.some((x) => x.startsWith(row.key + ":"))) e.examples.push(`${row.key}: ${W(D, j)}`);
    ((regionsOfMark[c] ||= {})[sub] ||= new Set()).add(s);
    if (s === "UNEXPLAINED" && unexplainedEx.length < 40) unexplainedEx.push(`${row.key} [${c}] ${W(D, j)}`);
  }
});

// ---------- evidence beyond shapes ------------------------------------------------
// 1. The field test against the store's own behaviour: the store cuts slices only
//    from Strong's sentence, never from the KJV list.
const fieldEvidence = { list_defs_with_a_slice: 0, definition_defs_with_a_slice: 0, definition_defs_without_slice: 0, list_defs: 0, definition_defs: 0 };
for (const [d, has] of defHasSlice) {
  const f = defCtx(d).field;
  if (f === "list") { fieldEvidence.list_defs += 1; if (has) fieldEvidence.list_defs_with_a_slice += 1; }
  else { fieldEvidence.definition_defs += 1; if (has) fieldEvidence.definition_defs_with_a_slice += 1; else fieldEvidence.definition_defs_without_slice += 1; }
}
// 2. A tagged gloss before a spaced comma in Strong's sentence: is it already its
//    own slice route on the same record?
const slicesByDef = new Map();
for (const r of rows) if (r.route !== r.def) { const k = `${r.key}\u0001${r.def}`; (slicesByDef.get(k) || slicesByDef.set(k, new Set()).get(k)).add(r.route.toLowerCase()); }
const tagged = { spaced_commas_in_whole_definitions: 0, by_shape: {}, absent_examples: [] };
for (const r of rows) {
  if (r.route !== r.def) continue;
  const X = defCtx(r.def); if (X.field !== "definition") continue;
  const sl = slicesByDef.get(`${r.key}\u0001${r.def}`) || new Set();
  for (let i = 0; i < r.def.length; i += 1) {
    if (r.def[i] !== "," || r.def[i - 1] !== " " || inside(X.S, i)) continue;
    const s = shapeOf(r.def, { ...X, span: null }, i);
    if (!/^comma\.def_(gloss|between|name)/u.test(s)) continue;
    tagged.spaced_commas_in_whole_definitions += 1;
    const B = (tagged.by_shape[s] ||= { commas: 0, left_gloss_is_a_slice_route: 0, right_gloss_is_a_slice_route: 0 });
    B.commas += 1;
    { let gr = stripGroups(pieceAfter(r.def, X.S, i)); const L2 = gr.match(LABEL_LEAD); if (L2) gr = gr.slice(L2[0].length).replace(/^[,\s]+/u, "");
      if ([gr, gr.replace(/^(?:to|a|an|the)\s+/iu, "")].map((x) => x.trim().toLowerCase()).some((x) => sl.has(x))) B.right_gloss_is_a_slice_route += 1; }
    let g = stripGroups(pieceBefore(r.def, X.S, i)).replace(/^(?:i\.e\.\s+)/u, "");
    const LBL = g.match(LABEL_LEAD); if (LBL) g = g.slice(LBL[0].length).replace(/^[,\s]+/u, "");
    const cands = [g, g.replace(/^(?:to|a|an|the)\s+/iu, "")].map((x) => x.trim().toLowerCase());
    if (cands.some((x) => sl.has(x))) B.left_gloss_is_a_slice_route += 1;
    else if (s === "comma.def_between_tagged_glosses" && tagged.absent_examples.length < 6) tagged.absent_examples.push(`${r.key}: ${W(r.def, i)}`);
  }
}
// 3. Senses after a depth-0 ';' in Strong's sentence: what opens them
const senseLead = { label: 0, usage_note: 0, bare: 0, examples: { label: [], usage_note: [], bare: [] } };
for (const r of rows) {
  if (r.route !== r.def) continue;
  const X = defCtx(r.def); if (X.field !== "definition") continue;
  for (let i = 0; i < r.def.length; i += 1) {
    if (r.def[i] !== ";" || inside(X.S, i)) continue;
    if (shapeOf(r.def, { ...X, span: null }, i) !== "semicolon.sense_separator") continue;
    const nxt = r.def.slice(i + 1).trimStart();
    const k = USAGE_LEAD.test(nxt) ? "usage_note" : LABEL_LEAD.test(nxt) ? "label" : "bare";
    senseLead[k] += 1;
    if (senseLead.examples[k].length < 4) senseLead.examples[k].push(`${r.key}: ${head(nxt, 50)}`);
  }
}

// ---------- division and comparison ----------------------------------------------
const cmp = { routes: 0, same_division: 0, same_division_text_differs_by_list_full_stop: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0 };
const ex = { v3_divides_where_declaration_keeps_whole: [], declaration_divides_where_v3_keeps_whole: [], divided_differently: [] };
const why = { v3_divides_where_declaration_keeps_whole: {}, declaration_divides_where_v3_keeps_whole: {}, divided_differently: {} };
const divStats = { routes_divided: 0, pieces_from_divided: 0, note_pieces: 0, refused_rejoin: 0, by_region: {}, pieces_led_by_syllable: 0, pieces_lone_group: 0, lone_group_examples: [] };
const v3Stats = { routes_divided: 0, damaged_senses: 0, routes_with_damaged_sense: 0, routes_with_whole_beside_glosses: 0, damaged_routes_the_declaration_divides: 0, damaged_routes_by_region: {} };
const changes = [];
const SHOW = new Set((process.env.SHOW || "").split(",").filter(Boolean));
const whyByShape = {};
const oddReadings = { v3: {}, declaration: {}, examples: { v3: [], declaration: [] } };
const nrm = (x) => x.replace(/\s+/gu, " ").trim().replace(/\.$/u, "").trim().toLowerCase();
const ms = (arr) => arr.map(nrm).sort().join("\u0001");
const showPieces = (arr) => arr.slice(0, 4).map((p) => `«${head(p, 18)}»`).join(" ") + (arr.length > 4 ? ` +${arr.length - 4}` : "");
rows.forEach((row, li) => {
  const d = declared(row);
  const V = v3(row.route);
  cmp.routes += 1;
  if (d.refused) divStats.refused_rejoin += 1;
  const dp = d.pieces.map((p) => p.text);
  if (d.pieces.some((p) => p.note)) divStats.routes_with_note = (divStats.routes_with_note || 0) + 1;
  if (SHOW.has(row.key)) console.error(`${row.key} [${d.region}] ${dp.map((x) => `«${head(x, 40)}»`).join(" ")}  || v3: ${V.readings.map((x) => `«${head(x, 30)}»`).join(" ")}`);
  if (dp.length > 1) {
    divStats.routes_divided += 1; divStats.pieces_from_divided += dp.length; inc(divStats.by_region, d.region);
    for (const p of d.pieces) {
      if (p.note) { divStats.note_pieces += 1; const k = /^(?:See|Compare|Comp)\b/u.test(p.text) ? "see_or_compare" : /^\(/u.test(p.text) ? "parenthesized" : "other"; inc(divStats.note_pieces_by_lead ||= {}, k); if (k === "other") (divStats.note_other_examples ||= []).length < 8 && divStats.note_other_examples.push(`${row.key}: ${head(p.text, 40)}`); }
      if (/^-/u.test(p.text)) divStats.pieces_led_by_syllable += 1;
      if (/^\([^()]*\)$/u.test(p.text)) { divStats.pieces_lone_group += 1; if (divStats.lone_group_examples.length < 6) divStats.lone_group_examples.push(`${row.key}: ${p.text}`); }
    }
  }
  if (V.readings.length > 1) v3Stats.routes_divided += 1;
  if (V.damaged) { v3Stats.routes_with_damaged_sense += 1; v3Stats.damaged_senses += V.damaged; inc(v3Stats.damaged_routes_by_region, d.region); if (dp.length > 1) v3Stats.damaged_routes_the_declaration_divides += 1; }
  if (V.readings.length > 1 && V.readings.some((x) => packSplit(row.route).includes(x) && /,/u.test(x))) v3Stats.routes_with_whole_beside_glosses += 1;
  // what each side would print as a reading that is not one: a bare usage label, an 'i.e.' explanation, 'etc.'
  const odd = (x) => (LABEL.test(x.replace(/[.,;]$/u, "").trim()) ? "label" : /^i\.e\./u.test(x) ? "ie" : /^etc\.?$/u.test(x) ? "etc" : null);
  for (const [side, arr] of defCtx(row.def).field !== "definition" ? [] : [["v3", V.readings.length > 1 ? V.readings : []], ["declaration", dp.length > 1 ? dp : []]]) {
    for (const x of arr) { const k = odd(x); if (k) { inc(oddReadings[side], k); if (oddReadings.examples[side].length < 6 && !oddReadings.examples[side].some((e) => e.startsWith(row.key + ":"))) oddReadings.examples[side].push(`${row.key}: «${head(x, 40)}»`); } }
  }
  let cat;
  if (ms(dp) === ms(V.readings)) {
    cat = "same_division";
    if (dp.join("|") !== V.readings.join("|")) {
      const strip = (a) => a.map((x) => x.replace(/\s*\.$/u, "")).join("|");
      if (strip(dp) === strip(V.readings)) cmp.same_division_text_differs_by_list_full_stop += 1; else cmp.same_division_text_differs_otherwise = (cmp.same_division_text_differs_otherwise || 0) + 1;
    }
  } else if (dp.length === 1 && V.readings.length > 1) cat = "v3_divides_where_declaration_keeps_whole";
  else if (V.readings.length === 1 && dp.length > 1) cat = "declaration_divides_where_v3_keeps_whole";
  else cat = "divided_differently";
  cmp[cat] += 1;
  if (cat !== "same_division") {
    // why: the shape that decides it
    const X = defCtx(row.def);
    let reason;
    if (cat === "v3_divides_where_declaration_keeps_whole") {
      if (d.region === "definition_slice") reason = "slice";
      else if (X.field === "definition") {
        const shp = new Set(); for (let i = 0; i < row.def.length; i += 1) if (row.def[i] === "," && !inside(X.S, i)) shp.add(shapeOf(row.def, { ...X, span: null }, i));
        for (const s of shp) inc(whyByShape, s);
        reason = shp.has("comma.def_name_then_description") ? "name_then_description" : shp.has("comma.def_after_label") ? "after_label" : shp.has("comma.def_gloss_then_ie") ? "gloss_then_ie" : shp.has("comma.def_gloss_then_last_piece") ? "gloss_then_last_piece" : shp.has("comma.def_short_series") ? "short_series" : [...shp].sort().join("+") || "other";
      } else {
        const shp = new Set(); for (let i = 0; i < row.def.length; i += 1) if (row.def[i] === ",") { const s = shapeOf(row.def, { ...X, span: null }, i); if (s !== "comma.rendering_separator") shp.add(s); }
        reason = "list:" + ([...shp].sort().join("+") || "other");
      }
    } else if (cat === "declaration_divides_where_v3_keeps_whole") {
      reason = `${X.field}:` + (V.damaged ? "v3_holds_damaged" : d.pieces.some((p) => p.note) ? "note_after_list" : "v3_clause_rule");
    } else {
      const senses = packSplit(row.route);
      reason = `${X.field}:` + (d.pieces.some((p) => p.note) ? "note_after_list" : V.damaged ? "v3_holds_damaged_sense" : V.readings.some((x) => senses.includes(x) && senses.length && !dp.includes(x)) ? "v3_adds_whole_sense_beside_glosses" : "both_divide_at_different_marks");
    }
    inc(why[cat], reason);
    if (ex[cat].length < 6 && !ex[cat].some((x) => x.startsWith(row.key + ":")) && (ex[cat].length < 3 || !ex[cat].some((x) => x.includes(`{${reason}}`)))) {
      ex[cat].push(`${row.key}: "${head(row.route, 60)}" — v3 ${V.readings.length} ${showPieces(V.readings)} | declaration ${dp.length} ${showPieces(dp)} {${reason}}`);
    }
    changes.push({ line: li + 1, key: row.key, category: cat, reason, v3_readings: V.readings.length, declaration_pieces: dp.length, region: d.region });
  }
});

// ---------- assemble census ----------------------------------------------------------
const markList = [...new Set([...Object.keys(census.route).filter((k) => !k.includes("#")), ...Object.keys(census.def_rows).filter((k) => !k.includes("#"))])];
markList.sort((a, b) => (census.route[b] || 0) - (census.route[a] || 0));
const invBy = Object.fromEntries(invM9.marks.map((m) => [m.mark, m]));
const marksOut = markList.map((m) => {
  const S = shapes[m] || {};
  const shapeArr = Object.entries(S).map(([shape, e]) => ({
    shape, test: (SHAPES[shape] || ["(no test written)"])[0], means: (SHAPES[shape] || [, "(no meaning written)"])[1],
    count: e.count, routes: e.routes.size, divides_readings: DIVIDES.has(shape), regions: e.regions, examples: e.examples,
  })).sort((a, b) => b.count - a.count);
  const unexplained = (S.UNEXPLAINED || { count: 0 }).count;
  const regs = regionsOfMark[m] || {};
  const regionMeaning = Object.fromEntries(Object.entries(regs).map(([k, v]) => [k, [...v].sort()]));
  return {
    mark: m, codepoint: `U+${m.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    route_occurrences: census.route[m] || 0, routes_carrying_it: census.route[`${m}#routes`] || 0,
    definition_occurrences_per_row: census.def_rows[m] || 0, definition_rows_carrying_it: census.def_rows[`${m}#rows`] || 0,
    definition_occurrences_distinct_definitions: census.def_distinct[m] || 0,
    inventory_agrees: !!invBy[m] && invBy[m].occurrences === (census.route[m] || 0) && invBy[m].routes_carrying_it === (census.route[`${m}#routes`] || 0),
    shapes: shapeArr, unexplained, regions: regionMeaning,
    meaning_depends_on_region: new Set(Object.values(regionMeaning).map((v) => v.join("+"))).size > 1,
  };
});
const totalOcc = marksOut.reduce((a, m) => a + m.route_occurrences, 0);
const totalShaped = marksOut.reduce((a, m) => a + m.shapes.reduce((b, s) => b + s.count, 0), 0);
const totalUnexplained = marksOut.reduce((a, m) => a + m.unexplained, 0);

const out = {
  schema_version: "MARK_LEDGER_PILOT_V1",
  source_key: "openscriptures_strongs", m_ids: ["M9"], computed_on: "2026-10-31",
  script: "ledger.mjs", input: "punct/by-source/openscriptures_strongs.jsonl",
  routes: rows.length, distinct_definitions: defsSeen.size, keys: new Set(rows.map((r) => r.key)).size,
  route_regions: rowRegion,
  definition_field_test: {
    test: "a definition carrying the x (U+00D7) or + sign is the KJV rendering list; else one that ends with '.' (or with '.' and one bracketed note) and carries no tag trace (a non-digit, a space, then , ; or .) is the KJV rendering list; else it is Strong's own definition sentence",
    by: fieldBy, corroboration: fieldEvidence,
  },
  route_slices_with_more_than_one_offset_in_definition: multiOffset,
  inventory_closed_set: { marks: invM9.marks.length, all_agree: marksOut.every((m) => m.inventory_agrees), extra_marks_in_definitions_only: markList.filter((m) => !invBy[m]) },
  totals: { route_mark_occurrences: totalOcc, shaped: totalShaped, unexplained: totalUnexplained },
  marks: marksOut,
  unexplained_examples: unexplainedEx,
  tagged_gloss_evidence: tagged,
  sense_lead_after_semicolon: senseLead,
  declaration_division: divStats,
  v3: { rule: V3_RULE, applied_as: "gloss-store-v1 packSplit on depth-0 ';' (orphan closers inert), then senseSplit per sense; a damaged sense held whole (the engine's pKey does this; gloss-store's pool drops it)", ...v3Stats },
  v3_comparison: { ...cmp, why, v3_divides_where_declaration_keeps_whole_routes_by_comma_shape_present: whyByShape, examples: ex },
  readings_that_are_not_readings: oddReadings,
};
writeFileSync(join(HERE, "census.json"), JSON.stringify(out, null, 1));
writeFileSync(join(HERE, "changes-vs-v3.jsonl"), changes.map((c) => JSON.stringify(c)).join("\n") + "\n");
console.log(JSON.stringify(oddReadings));
console.log(JSON.stringify({ routes: out.routes, route_regions: rowRegion, field: out.definition_field_test, totals: out.totals, inv: out.inventory_closed_set, cmp, why, divStats, v3Stats, tagged: { ...tagged }, senseLead: { label: senseLead.label, usage_note: senseLead.usage_note, bare: senseLead.bare } }, null, 1));
for (const m of marksOut) console.log(m.mark, m.route_occurrences, m.routes_carrying_it, "unexpl", m.unexplained, m.shapes.map((s) => `${s.shape}=${s.count}`).join(" "));
console.log(unexplainedEx.join("\n"));
