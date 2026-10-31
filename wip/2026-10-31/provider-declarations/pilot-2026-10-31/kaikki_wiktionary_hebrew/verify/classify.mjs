// Independent classifier for the kaikki_wiktionary_hebrew mark ledger, written from the
// shape TESTS as stated in words in the draft's summary and census (no draft code reused).
// Where a stated list ends in "...", the list below is this verifier's own completion and is
// marked as such (OWN_*). Every route is analyzed once: labels, groups, segments, parts.
import { parse, isHebLetter, isHebPoint, isLetter, isDigit, isSpace, isMark, isUpper, isLower, words, stripGroups, hebOutsideParens, hebOutsideScopes } from "./lib.mjs";

export const OPTS = { hebrewOutside: "scopes", nestedFirst: true, reconcile: false };

const w0 = (t) => (words(t)[0] || "");
const lc = (t) => t.toLowerCase();
const opensWith = (t, list) => { const x = lc(t.trim()); return list.some((p) => x === p || x.startsWith(p + " ") || x.startsWith(p + ",") || (p.endsWith(".") && x.startsWith(p))); };

// stated: used, see, said of, indicating, also, for example, in full, it, this, ...
export const NOTE_OPENERS = ["used", "see", "said of", "indicating", "also", "for example", "in full", "it", "this"];
// stated: especially, such, usually, used, equivalent, e.g., i.e., representing, transliterated, ...
export const CLAUSE_OPENERS = ["especially", "such", "usually", "used", "equivalent", "e.g.", "i.e.", "representing", "transliterated",
  /* OWN completion */ "particularly", "typically", "often", "generally", "mainly", "mostly", "chiefly", "commonly", "normally", "traditionally", "including", "indicating", "namely", "sometimes", "frequently", "originally", "primarily", "notably", "viz.", "e.g", "i.e"];
export const SERIAL = ["or", "and", "nor", "but"];
// stated: as, like, that, which, who, whose, where, when, from, about, rather, hence, ...
export const RELATIVE = ["as", "like", "that", "which", "who", "whose", "where", "when", "from", "about", "rather", "hence",
  /* OWN completion */ "whom", "while", "whereas", "whereby", "wherein", "than", "unlike", "thus"];
// stated: figuratively, specifically, by extension, ...
export const LABELS = ["figuratively", "specifically", "by extension",
  /* OWN completion */ "literally", "metaphorically", "colloquially", "informally", "formally", "slang", "by implication", "in particular", "generally", "broadly", "loosely", "euphemistically", "idiomatically", "in general", "hence", "archaic", "rare", "poetic", "biblical", "dated", "obsolete", "figurative", "transitive", "intransitive", "especially"];
export const FUNCTION_WORDS = new Set(("a an the as like when while that which who whom whose where if or and nor but so then also even only just still yet thus hence therefore because since though although for to from of in on at by with without about after before until till into onto upon over under than rather not no either neither both such here there how why what whether indeed however too very already again ever never more most less least much many some any all each every this these those it its he she they we you i me him her them us my your his our their one ones whoever whatever whenever wherever whichever unless lest except besides beside between among against toward towards through throughout via per").split(" "));
export const PREPOSITIONS = new Set("of to for with from in on at by about into onto upon over under toward towards against between among through after before without within like as unto".split(" "));
export const ABBR = new Set("e.g i.e etc esp lit cf vs ca c st mt mr mrs ms dr jr sr no num approx fig blvd prof gen rev min max vol pl sing fem masc ft km kg cm mm co inc ltd jan feb mar apr jun jul aug sep sept oct nov dec r b d fl q.v".split(" "));

// ---- RECONCILE lists: copied from the draft's declaration-kaikki.mjs constants, used only with OPTS.reconcile
const R_ALWAYS = new Set(("especially particularly specifically notably chiefly mainly mostly primarily principally generally typically usually often sometimes commonly normally frequently occasionally rarely traditionally collectively originally formerly literally figuratively such e.g i.e eg ie viz cf esp including excluding except used indicating equivalent corresponding referring said known also namely see representing meaning denoting relating consisting containing involving describing expressing signifying transliterated identified translated anglicized").split(" "));
const R_SERIAL = new Set(["or", "and", "nor", "but"]);
const R_ETC = new Set(["etc", "etcetera", "et"]);
const R_FUNCTION = new Set("as like that which who whom whose where when while whereas whether although though unless rather hence thus therefore than from about so".split(" "));
const R_PREP = "in on at by for with without of after before under over into onto upon through toward towards against among between within around near behind beyond during since until till unto according next due regarding concerning via per because if".split(" ");
const R_FUNCTION_FIRST = new Set([...R_FUNCTION, ...R_ALWAYS, ...R_SERIAL, ...R_ETC, ...R_PREP, ..."not no just only very more most less least even still already yet here there now again once how what whatever whoever".split(" ")]);
const R_LABELS = new Set("figuratively literally specifically especially particularly generally usually often also hence thus colloquially informally formally slang rarely formerly originally euphemistically metaphorically idiomatically mostly chiefly mainly broadly loosely strictly technically now nowadays today".split(" ").concat(["in particular", "by extension", "by implication", "that is", "for example", "in full", "i.e", "e.g", "in general", "in other words", "in the plural", "in plural", "by metonymy", "by analogy"]));
const R_PRONOUNS = new Set("this it he she they we you i these those".split(" "));
const R_END_PREP = new Set("of to from with for in on at by about into onto upon toward towards against over under after".split(" "));
const R_LABEL1 = new Set("figuratively literally specifically especially particularly also colloquially informally formally euphemistically metaphorically idiomatically hence thus".split(" "));
export const R_NOTE_START = /^(used\b|see\b|said of\b|indicating\b|also\b|compare\b|cf\.|for example\b|in full\b|it\b|this\b|located\b|further\b|as opposed to\b|possibilities include\b|\(see\b)/i;
const normWord = (w) => String(w || "").toLowerCase().replace(/^[("“'‘\[]+/u, "").replace(/[)\]”’"',;:!?.]+$/u, "");
const bareWords = (t) => { let o = "", d = 0; for (const c of t) { if (c === "(" || c === "[") d++; else if (c === ")" || c === "]") { if (d > 0) d--; o += " "; } else if (d === 0) o += c; } return o.trim().split(/\s+/u).filter(Boolean); };
const MONTHS = /^(January|February|March|April|May|June|July|August|September|October|November|December)\b/u;
const hebWordChar = (c) => !!c && c >= "֑" && c <= "״"; // letters, points, maqaf, geresh, gershayim

export function analyzeRoute(s) {
  const P = parse(s);
  const n = s.length;
  const groupAt = new Map(); for (const g of P.groups) groupAt.set(g.open, g);
  const closeOf = new Map(); for (const g of P.groups) if (g.close >= 0) closeOf.set(g.close, g);
  const parenGroups = P.groups.filter((g) => g.kind === "(");
  const content = (g) => s.slice(g.open + 1, g.close);
  // ---- labels over the line
  const first = s.search(/\S/u);
  let lead = null;
  if (first >= 0 && s[first] === "(") {
    const g = groupAt.get(first);
    if (g && g.close >= 0 && s.slice(g.close + 1).trim() !== "" && !isSubjectPronoun(content(g))) lead = g;
  }
  let trailing = null, trailingKind = null;
  {
    const t = s.replace(/\s+$/u, "");
    let endClose = -1;
    if (t.endsWith(")")) endClose = t.length - 1;
    else if (t.endsWith(").")) endClose = t.length - 2;
    const g = endClose >= 0 ? closeOf.get(endClose) : null;
    if (g && g.kind === "(" && g.depth === 0 && g.bdepth === 0) {
      const before = s.slice(0, g.open).replace(/\s+$/u, "");
      const pi = before.length - 1;
      if (pi >= 0 && before[pi] === "." && !P.inScope(pi)) {
        const c1 = s.slice(g.open + 1).match(/\S/u); const c = c1 ? c1[0] : "";
        if (isUpper(c)) trailingKind = "note";
        else if (isLower(c) && !isAbbrevPeriod(s, pi)) trailingKind = "label";
        if (trailingKind) trailing = g;
      }
    }
  }
  const ledByLabel = !!lead;
  const closedByLabel = trailingKind === "label";
  // ---- romanization groups (needed by '-', "'", '“' tests)
  const roman = new Set();
  for (const g of parenGroups) if (g.close >= 0 && isRomanization(s, g)) roman.add(g);
  const inRoman = (i) => { for (const g of roman) if (g.open < i && i < g.close) return true; return false; };
  // ---- periods at depth 0
  const periodShape = new Map();
  for (let i = 0; i < n; i++) if (s[i] === ".") periodShape.set(i, classifyPeriod(s, i, P, { lead, trailing, trailingKind }));
  // ---- semicolons
  const semiShape = new Map();
  for (let i = 0; i < n; i++) if (s[i] === ";") {
    let sh;
    if (P.paren[i] > 0) sh = "semicolon.in_parentheses";
    else if (P.inScope(i)) sh = "semicolon.UNSTATED_in_bracket_or_quote";
    else if (ledByLabel) sh = "semicolon.under_lead_label";
    else if (opensAsNote(s.slice(i + 1))) sh = "semicolon.note_follows";
    else sh = "semicolon.sense_boundary";
    semiShape.set(i, sh);
  }
  // ---- segments
  const cuts = [];
  for (const [i, sh] of semiShape) if (sh === "semicolon.sense_boundary" || sh === "semicolon.note_follows") cuts.push(i);
  for (const [i, sh] of periodShape) if (sh === "period.sentence_boundary" || sh === "period.before_trailing_note") cuts.push(i);
  cuts.sort((a, b) => a - b);
  const segs = []; { let st = 0; for (const c of cuts) { segs.push([st, c, s[c]]); st = c + 1; } segs.push([st, n, null]); }
  const segOf = (i) => segs.find(([a, b]) => i >= a && i < b) || segs[segs.length - 1];
  const segIsNote = (seg) => opensAsNote(s.slice(seg[0], seg[1]));
  // ---- strongs colon (route level)
  let strongsAt = -1;
  // ---- colons
  const colonShape = new Map();
  const depth0Colons = [];
  for (let i = 0; i < n; i++) if (s[i] === ":") {
    let sh = null;
    if (P.paren[i] > 0) sh = "colon.in_parentheses";
    else if (P.inScope(i)) sh = "colon.UNSTATED_in_bracket_or_quote";
    else if (isDigit(s[i - 1]) && isDigit(s[i + 1])) sh = "colon.citation";
    else if (ledByLabel) sh = "colon.under_lead_label";
    else if (/^ [-–] /u.test(s.slice(i + 1, i + 4))) sh = "colon.strongs_list";
    if (sh) colonShape.set(i, sh); else depth0Colons.push(i);
    if (sh === "colon.strongs_list" && strongsAt < 0) strongsAt = i;
  }
  const hebOut = OPTS.hebrewOutside === "parens" ? hebOutsideParens : hebOutsideScopes;
  for (const i of depth0Colons) {
    const seg = segOf(i);
    const sameSeg = [...colonShape.keys(), ...depth0Colons].filter((j) => j >= seg[0] && j < seg[1] && j !== i && !(colonShape.get(j) === "colon.citation" || colonShape.get(j) === "colon.in_parentheses" || colonShape.get(j) === "colon.UNSTATED_in_bracket_or_quote")).sort((a, b) => a - b);
    const prev = sameSeg.filter((j) => j < i).pop(); const next = sameSeg.find((j) => j > i);
    const before = s.slice(prev === undefined ? seg[0] : prev + 1, i);
    const after = s.slice(i + 1, next === undefined ? seg[1] : next);
    let sh;
    if (s.slice(i + 1, seg[1]).trim() === "") sh = "colon.introduces_absent_list";
    else if (before.trim() === "") sh = "colon.UNSTATED_nothing_before";
    else if (hebOut(before)) sh = "colon.pointer_gloss";
    else if (hebOut(after)) sh = "colon.gloss_pointer";
    else sh = "colon.head_explanation";
    colonShape.set(i, sh);
  }
  const DIVIDING_COLON = new Set(["colon.head_explanation", "colon.pointer_gloss", "colon.gloss_pointer", "colon.strongs_list"]);
  // ---- parts: a segment cut at its dividing colons
  const parts = [];
  for (const seg of segs) {
    const cs = [...colonShape].filter(([i, sh]) => i >= seg[0] && i < seg[1] && DIVIDING_COLON.has(sh)).map(([i, sh]) => [i, sh]).sort((a, b) => a[0] - b[0]);
    let st = seg[0], role = "head";
    const note = segIsNote(seg);
    for (const [c, sh] of cs) {
      parts.push({ a: st, b: c, role, seg, note });
      st = c + 1;
      role = sh === "colon.head_explanation" ? "explanation" : sh === "colon.pointer_gloss" ? "gloss" : sh === "colon.gloss_pointer" ? "pointer_after" : "strongs";
    }
    parts.push({ a: st, b: seg[1], role, seg, note });
  }
  for (const p of parts) { p.text = s.slice(p.a, p.b); p.hebrew = hebOut(p.text); }
  // ---- commas
  const commaShape = new Map();
  const partOf = (i) => parts.find((p) => i >= p.a && i < p.b);
  for (const p of parts) {
    const cs = []; for (let i = p.a; i < p.b; i++) if (s[i] === "," && !P.inScope(i)) cs.push(i);
    if (!cs.length) continue;
    p.commas = cs;
    const pieces = []; { let st = p.a; for (const c of cs) { pieces.push(s.slice(st, c)); st = c + 1; } pieces.push(s.slice(st, p.b)); }
    p.pieces = pieces;
    const firstPiece = pieces[0].trim();
    const firstWords = words(stripGroups(firstPiece));
    const fnGloss = firstWords.length >= 1 && firstWords.length <= 2 && firstWords.every((x) => FUNCTION_WORDS.has(lc(x).replace(/[^a-z]/g, "")));
    const firstContent = firstWords.length > 0 && !FUNCTION_WORDS.has(lc(firstWords[0]).replace(/[^a-z]/g, ""));
    const isPrepPiece = (pc) => { const w = words(pc); if (w.length < 1 || w.length > 2) return false; if (w.length === 2 && lc(w[0]) === "to") return false; return PREPOSITIONS.has(lc(w[w.length - 1])); };
    const lastPiece = pieces[pieces.length - 1].trim();
    const sharedPart = isPrepPiece(firstPiece) && /^(or|and)\s/iu.test(lastPiece) && !PREPOSITIONS.has(lc(words(lastPiece).pop() || ""));
    const firstIsLabel = LABELS.includes(lc(firstPiece));
    const firstOpensLabel = LABELS.filter((l) => !l.includes(" ")).includes(lc(w0(firstPiece)).replace(/[^a-z]/g, "")) || firstPiece.startsWith("(");
    const holding = new Map();
    if (OPTS.reconcile) {
      const qs = pieces; const q0 = qs[0].trim(); const q0w = bareWords(q0); const q0first = normWord(q0w[0]);
      const q0isLabel = R_LABELS.has(q0.toLowerCase().replace(/\.$/u, ""));
      const q0ledByLabel = (q0.startsWith("(") && !qs.every((q) => q.trim().startsWith("("))) || (q0w.length >= 2 && R_LABEL1.has(q0first));
      const q0function = q0w.length <= 2 && R_FUNCTION_FIRST.has(q0first);
      const lastW = bareWords(qs[qs.length - 1].trim().replace(/[.;:!?]+$/u, ""));
      const endsPrep = (q) => { const w = bareWords(q.trim().replace(/[.;:!?]+$/u, "")); return w.length > 0 && w.length <= 2 && normWord(w[0]) !== "to" && R_END_PREP.has(normWord(w[w.length - 1])); };
      const shared = qs.length >= 2 && endsPrep(qs[0]) && lastW.length >= 2 && R_SERIAL.has(normWord(lastW[0])) && !R_END_PREP.has(normWord(lastW[lastW.length - 1]));
      cs.forEach((c, k) => {
        const q = qs[k + 1].trim(); const w = bareWords(q); const fw = normWord(w[0]); let x = null;
        if (isDigit(s[c - 1]) && isDigit(s[c + 1])) x = "comma.number";
        else if (!q) x = "comma.trailing";
        else if (/^\([^()]*(?:\([^()]*\)[^()]*)*\)[.;:!?]*$/u.test(q)) x = "comma.before_bare_group";
        else if (k === 0 && ((q0isLabel && w.length >= 2 && !R_FUNCTION_FIRST.has(fw) && !R_PRONOUNS.has(fw)) || q0ledByLabel)) x = "comma.after_label";
        else if (R_ETC.has(fw) && w.length <= 2 && !q0function) x = "comma.before_etc";
        else if (w.length >= 2 && R_ALWAYS.has(fw) && !q0function) x = "comma.before_clause";
        else if (w.length >= 2 && R_SERIAL.has(fw) && (shared || !(q0function && w.length <= 3))) x = "comma.before_serial_conjunction";
        else if (w.length >= 2 && R_FUNCTION.has(fw) && !R_FUNCTION_FIRST.has(q0first)) x = "comma.before_relative";
        else if (shared && endsPrep(qs[k])) x = "comma.shared_object";
        holding.set(c, x ? [x] : []);
      });
    } else
    cs.forEach((c, k) => {
      const nx = pieces[k + 1].trim();
      const nw = words(nx);
      const tests = [];
      if (isDigit(s[c - 1]) && isDigit(s[c + 1])) tests.push("comma.number");
      if (/^etc\.?$/iu.test(nx)) tests.push("comma.before_etc");
      if (/^\([^()]*\)$/u.test(nx)) tests.push("comma.before_bare_group");
      if (sharedPart && isPrepPiece(pieces[k].trim())) tests.push("comma.shared_object");
      if (k === 0 && ((firstIsLabel && nw.length >= 2) || firstOpensLabel)) tests.push("comma.after_label");
      if (nw.length >= 2 && opensWith(nx, CLAUSE_OPENERS) && !fnGloss) tests.push("comma.before_clause");
      if (nw.length >= 2 && opensWith(nx, SERIAL) && !fnGloss) tests.push("comma.before_serial_conjunction");
      if (nw.length >= 2 && opensWith(nx, RELATIVE) && firstContent) tests.push("comma.before_relative");
      holding.set(c, tests);
    });
    const anyHolding = [...holding.values()].some((t) => t.some((x) => x !== "comma.number" && x !== "comma.trailing"));
    for (const c of cs) {
      let sh, alts = [];
      if (ledByLabel || closedByLabel) sh = "comma.under_lead_label";
      else if (strongsAt >= 0 && c > strongsAt) sh = "comma.strongs_list";
      else if (OPTS.reconcile && p.hebrew) sh = "comma.pointer";
      else if (p.note) sh = "comma.in_note";
      else if (p.hebrew) sh = "comma.pointer";
      else {
        const t = holding.get(c); alts = t;
        if (t.length) sh = t[0];
        else if (anyHolding) sh = "comma.list_inside_sentence";
        else sh = "comma.gloss_boundary";
      }
      commaShape.set(c, { sh, alts, role: p.role });
    }
  }
  for (let i = 0; i < n; i++) if (s[i] === "," && !commaShape.has(i)) {
    if (P.paren[i] > 0) commaShape.set(i, { sh: "comma.in_parentheses", alts: [] });
    else if (P.inScope(i)) commaShape.set(i, { sh: "comma.UNSTATED_in_bracket_or_quote", alts: [] });
  }
  return { s, P, lead, trailing, trailingKind, ledByLabel, closedByLabel, roman, inRoman, periodShape, semiShape, colonShape, commaShape, segs, parts, strongsAt, groupAt, closeOf, content };
}

export function isSubjectPronoun(c) {
  return /^\s*((he|she|it|they|we|you|i)(\s*\/\s*(he|she|it|they|we|you|i))*|and)\s*$/iu.test(c);
}
export function isRomanization(s, g) {
  let j = g.open - 1;
  if (s[j] === " ") j--;
  if (!hebWordChar(s[j])) return false;
  const f = s[g.open + 1];
  return !(isHebLetter(f) || isHebPoint(f));
}
export function opensAsNote(t) { const x = t.replace(/^\s+/u, ""); return OPTS.reconcile ? R_NOTE_START.test(x) : opensWith(x, NOTE_OPENERS); }

// the token around a period: letters and periods on both sides
export function isAbbrevPeriod(s, i) {
  let a = i; while (a > 0 && /[\p{L}.]/u.test(s[a - 1])) a--;
  let b = i + 1; while (b < s.length && /[\p{L}.]/u.test(s[b])) b++;
  const tok = s.slice(a, b);
  const core = tok.replace(/^\.+|\.+$/gu, "");
  if (/\p{L}\.\p{L}/u.test(tok)) return true;           // dotted abbreviation: U.S.S.R., e.g., i.e., q.v.
  const before = s.slice(a, i).replace(/\./gu, "");
  return ABBR.has(lc(before)) || ABBR.has(lc(core));
}
function classifyPeriod(s, i, P, L) {
  if (P.paren[i] > 0 || P.brack[i] > 0) return "period.in_parentheses";
  if (isDigit(s[i - 1]) && isDigit(s[i + 1])) return "period.decimal";
  if (OPTS.reconcile && s.slice(i + 1).trim() === "") return "period.terminal";
  if (s[i - 1] === "." || s[i + 1] === ".") return "period.ellipsis";
  if (s.slice(i + 1).trim() === "") return "period.terminal";
  if (P.quote[i]) return "period.UNSTATED_in_quote";
  // a depth-0 period followed only by a parenthetical group that opens uppercase
  if (L.trailing && L.trailingKind === "note") { const rest = s.slice(i + 1); if (rest.trim().startsWith("(") && i + 1 + rest.search(/\S/u) === L.trailing.open) return "period.before_trailing_note"; }
  const sentence = s[i + 1] === " " && (isUpper(s[i + 2]) || isDigit(s[i + 2]) || s[i + 2] === "(" || /["“‘']/u.test(s[i + 2] || "")) && !isAbbrevPeriod(s, i);
  if (sentence && (L.lead || (L.trailing && L.trailingKind === "label"))) return "period.under_lead_label";
  if (isAbbrevPeriod(s, i) || (isMark(s[i + 1]) && !isSpace(s[i + 1]))) return "period.abbreviation";
  if (sentence) return "period.sentence_boundary";
  if (s[i + 1] === " " && isLower(s[i + 2])) return "period.lowercase_continuation";
  return "period.UNEXPLAINED";
}
