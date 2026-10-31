// Independent classifier for ubs_sdbh_hebrew_v0_9_2, written from the shape TESTS as stated in words
// in the draft summary. Does not import or copy the draft's ledger.mjs / shape-meanings.mjs.
import { readFileSync } from "node:fs";

export const SCRATCH = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad";
export const SRC = `${SCRATCH}/punct/by-source/ubs_sdbh_hebrew_v0_9_2.jsonl`;
export const load = () => readFileSync(SRC, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

export const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
export const isLetter = (c) => c !== undefined && /\p{L}/u.test(c);
export const isDigit = (c) => c !== undefined && /\p{N}/u.test(c);
export const NOTE = new Set(["◄", "►", "≈"]);
export const QUOTES = new Set(['"', "“", "”"]);
export const win = (s, i, n = 28) => (i > n ? "…" : "") + s.slice(Math.max(0, i - n), i + n).replace(/\s+/g, " ") + (i + n < s.length ? "…" : "");
const words = (t) => String(t).trim().split(/\s+/u).filter(Boolean);
export const wordsOutsideParens = (t) => words(String(t).replace(/\([^()]*\)/gu, " "));
export let LIT = "(?:literally|literaly|literallly|litterally)";
export const setAmend = (o) => { if (o.amend) LIT = "(?:literally|literaly|literallly|litterally|liteallly)"; };

/** Per-route context: paren depth (closer with nothing open ignored), match of parens, quote ordinal, italic span. */
export const context = (s) => {
  const n = s.length;
  const depth = new Array(n).fill(0);       // depth before char i
  const match = new Array(n).fill(-1);      // paren partner
  const stack = [];
  let d = 0;
  for (let i = 0; i < n; i += 1) {
    depth[i] = d;
    if (s[i] === "(") { stack.push(i); d += 1; }
    else if (s[i] === ")") { if (stack.length) { const o = stack.pop(); match[o] = i; match[i] = o; d -= 1; } }
  }
  // quotes: ASCII and curly counted together
  const qOrd = new Array(n).fill(0); const inQuote = new Array(n).fill(false);
  let q = 0;
  for (let i = 0; i < n; i += 1) {
    if (QUOTES.has(s[i])) { q += 1; qOrd[i] = q; }
    else inQuote[i] = q % 2 === 1;
  }
  // italic |i ... |i*
  const inItal = new Array(n).fill(false);
  let it = false;
  for (let i = 0; i < n; i += 1) {
    if (s.startsWith("|i*", i)) { it = false; i += 2; continue; }
    if (s.startsWith("|i", i)) { it = true; i += 1; continue; }
    inItal[i] = it;
  }
  return { depth, match, qOrd, inQuote, inItal, totalQuotes: q };
};

const prevNonSpace = (s, i) => { let j = i - 1; while (j >= 0 && /\s/u.test(s[j])) j -= 1; return j >= 0 ? s[j] : null; };
const nextNonSpace = (s, i) => { let j = i + 1; while (j < s.length && /\s/u.test(s[j])) j += 1; return j < s.length ? s[j] : null; };
const prevWord = (s, i) => { const m = s.slice(0, i).match(/([\p{L}\p{N}'’-]+)\s*$/u); return m ? m[1] : null; };
const after = (s, i) => s.slice(i + 1);
const before = (s, i) => s.slice(0, i);

export const markerFree = (s) => !/[;◄►≈=:]/u.test(s);
/** depth-0 comma pieces */
export const commaPieces = (s, ctx) => {
  const out = []; let st = 0;
  for (let i = 0; i < s.length; i += 1) if (s[i] === "," && ctx.depth[i] === 0) { out.push(s.slice(st, i)); st = i + 1; }
  out.push(s.slice(st));
  return out;
};
export const isShort = (s, ctx) => markerFree(s) && commaPieces(s, ctx).every((p) => wordsOutsideParens(p).length <= 4);

const noteMarkerBeforeDepth0 = (s, ctx, i) => { for (let j = 0; j < i; j += 1) if (NOTE.has(s[j]) && ctx.depth[j] === 0) return true; return false; };

// ---------------- semicolon ----------------
const semicolon = (s, i, ctx, opts) => {
  const a = after(s, i);
  const tests = [
    ["semicolon.in_quote_or_italic", () => ctx.inQuote[i] || ctx.inItal[i]],
    ["semicolon.route_final", () => a.trim() === ""],
    ["semicolon.before_note_marker", () => ctx.depth[i] === 0 && !ctx.inQuote[i] && !ctx.inItal[i] && /^\s*[◄►≈]/u.test(a)],
    ["semicolon.before_derived_meaning", () => /^\s*(hence|therefore)\b/iu.test(a)],
    ["semicolon.before_hedged_meaning", () => /^\s*(possibly|probably|perhaps|possible|one possible|among the possibilities|conjectured)\b/iu.test(a)],
    ["semicolon.before_definition_equals", () => /^\s*=/u.test(a)],
    ["semicolon.before_literal_rendering", () => new RegExp(`^\\s*${LIT}\\b`, "iu").test(a)],
    ["semicolon.before_alternative_label", () => /^\s*(or:|either:|alternatively:|alternatively\b|or \(2\))/iu.test(a)],
    ["semicolon.before_or_clause", () => /^\s*(or|either)\b/iu.test(a) && !/^\s*(or|either)\s*:/iu.test(a) && !/^\s*or \(2\)/iu.test(a)],
  ];
  const hits = tests.filter(([, f]) => f()).map(([n]) => n);
  if (hits.length) return hits;
  return [noteMarkerBeforeDepth0(s, ctx, i) ? "semicolon.between_note_items" : "semicolon.head_to_further_clause"];
};

// ---------------- comma ----------------
const CONJ = /^\s*(and\/or|and|or|nor|but|either|whether|though|although|yet|while|so|then|thus|whereas|except|rather)\b/iu;
const LABELW = /^(literally|literaly|literallly|litterally|hence|therefore|possibly|probably|perhaps)$/iu;
const APPOS = new Set(["son", "daughter", "wife", "father", "tribe", "territory", "town", "a", "an", "the", "also", "better", "later", "used", "related", "from", "with", "which", "who", "in", "of", "oldest"]);
export const APPOS_EXTRA = new Set((process.env.APPOS_EXTRA || "suitable,probably,possibly,destroyed,selectively,lined,if,capable").split(",").filter(Boolean));
const FUNC = new Set(["of", "in", "to", "from", "for", "with", "by", "on", "at", "a", "an", "the"]);
let CLAUSE_COLON = false;
const clauseEnd = (s, i, ctx) => { for (let j = i + 1; j < s.length; j += 1) if ((s[j] === ";" || NOTE.has(s[j]) || (CLAUSE_COLON && (s[j] === ":" || s[j] === "="))) && ctx.depth[j] === 0) return j; return s.length; };
const clauseStart = (s, i, ctx) => { for (let j = i - 1; j >= 0; j -= 1) if ((s[j] === ";" || NOTE.has(s[j]) || s[j] === ":" || s[j] === "=") && ctx.depth[j] === 0) return j + 1; return 0; };

const comma = (s, i, ctx, opts) => {
  const a = after(s, i);
  const hits = [];
  if (ctx.depth[i] > 0) hits.push("comma.in_parentheses");
  if (ctx.inQuote[i] || ctx.inItal[i]) hits.push("comma.in_quote_or_italic");
  if (/^\s*(or|either):/iu.test(a)) hits.push("comma.before_alternative_label");
  if (/^\s*[◄►≈]/u.test(a)) hits.push("comma.before_note_marker");
  const pw = prevWord(s, i);
  if ((pw && LABELW.test(pw)) || (opts.amend ? (opts.labelHence === false ? /^\s*(possibly|probably|perhaps|possible)\s*:/iu : opts.labelPossible === false ? /^\s*(possibly|probably|perhaps|hence)\s*:/iu : /^\s*(possibly|probably|perhaps|possible|hence)\s*:/iu) : /^\s*(possibly|probably|perhaps)\s*:/iu).test(a)) hits.push("comma.label_punctuation");
  if (CONJ.test(a)) hits.push("comma.before_conjunction");
  // series item
  {
    const ce = clauseEnd(s, i, ctx);
    const clause = s.slice(i + 1, ce);
    const nc = opts.seriesDepth0 ? (() => { for (let j = i + 1; j < ce; j += 1) if (s[j] === "," && ctx.depth[j] === 0) return j; return -1; })() : (clause.indexOf(",") >= 0 ? i + 1 + clause.indexOf(",") : -1);
    if (nc >= 0) {
      const between = s.slice(i + 1, nc);
      const wn = opts.seriesTokens ? (between.match(/[\p{L}\p{N}]+/gu) || []).length : opts.seriesWordsOutside ? wordsOutsideParens(between).length : words(between).length;
      const lim = opts.seriesLt4 ? 3 : 4;
      const closer = opts.seriesAndAfterNext ? /,\s*(and|or)\b/iu.test(s.slice(nc, ce)) : /,\s*(and|or)\b/iu.test(clause);
      if (wn <= lim && wn >= (opts.seriesMin1 ? 1 : 0) && closer) hits.push("comma.series_item");
    }
  }
  if (hits.length) return hits;
  const short = isShort(s, ctx);
  if (!short) {
    // series item closed by conjunction without comma
    const cst = clauseStart(s, i, ctx);
    const pcomma = (() => { for (let j = i - 1; j >= cst; j -= 1) if (s[j] === "," && ctx.depth[j] === 0) return j; return -1; })();
    const cs = Math.max(cst, pcomma + 1);
    const itemBefore = s.slice(cs, i);
    const ce = clauseEnd(s, i, ctx);
    const rest = s.slice(i + 1, ce);
    const m = rest.match(/^([^,]*?)\b(and|or)\b/iu);
    const needPrev = opts.closedNeedsPrevComma ? pcomma >= 0 : true;
    const restOk = opts.closedRestTo === "clause" ? (m && words(rest).length >= 3 && words(m[1]).length >= 1 && words(m[1]).length <= 3 && !rest.includes(",")) : (m && words(m[1]).length >= 1 && words(m[1]).length <= 3);
    if (needPrev && words(itemBefore).length <= 3 && restOk) return ["comma.series_item_closed_by_conjunction_without_comma"];
    return ["comma.definition_prose"];
  }
  // short marker-free route
  const pieces = commaPieces(s, ctx).map((p) => p.trim());
  const nw = (a.trim().match(/^[\p{L}'’-]+/u) || [""])[0];
  const out = [];
  if ((APPOS.has(nw.toLowerCase()) || (opts.amend && APPOS_EXTRA.has(nw.toLowerCase()))) || /^-in-law/u.test(a.trim()) || /-in-law\b/u.test(a.trim().split(/\s+/)[0] || "")) out.push("comma.short_route_appositive");
  {
    const lastBefore = (pw || "");
    const pieceAfter = (() => { const r = a; const k = r.indexOf(","); return (k >= 0 ? r.slice(0, k) : r).trim(); })();
    if (/^\p{Lu}/u.test(lastBefore) && words(pieceAfter).length === 1 && /^\p{Lu}/u.test(pieceAfter)) out.push("comma.short_route_name_variant");
  }
  {
    // previous depth-0 comma followed by whether / if / either / or
    let pc = -1; for (let j = i - 1; j >= 0; j -= 1) if (s[j] === "," && ctx.depth[j] === 0) { pc = j; break; }
    if (pc >= 0 && /^\s*(whether|if|either|or)\b/iu.test(s.slice(pc + 1))) out.push("comma.short_route_closes_interruption");
  }
  {
    const ledByTo = /^to\s/iu.test(s.trim());
    const pre = words(s.slice(0, i));
    const pieceAfter = (() => { const k = a.indexOf(","); return (k >= 0 ? a.slice(0, k) : a).trim(); })();
    const w = pre[pre.length - 1] || "";
    const okPrev = (pre.length === 1 && /^\p{Ll}/u.test(w)) || (pre.length >= 2 && /^(a|an|the|of|not)$/iu.test(pre[pre.length - 2]) && /^\p{Ll}/u.test(w));
    if (!ledByTo && okPrev && words(pieceAfter).length >= 2) out.push("comma.short_route_coordinate_modifiers");
  }
  {
    const allTo = pieces.every((p) => /^to\s/u.test(p) && words(p).length >= 2);
    const noneTo = pieces.every((p) => !/^to\s/u.test(p));
    const W = (p) => opts.amend ? wordsOutsideParens(p) : words(p);
    const small = pieces.every((p) => W(p).length <= 2 && !W(p).some((w) => FUNC.has(w.toLowerCase())));
    if (allTo || (noneTo && small)) out.push("comma.short_route_packed_renderings_complete");
  }
  if (out.length) return out;
  return ["comma.short_route_packed_renderings_elliptic"];
};

// ---------------- colon ----------------
const colon = (s, i, ctx) => {
  const a = after(s, i); const pw = (prevWord(s, i) || "");
  const hits = [];
  if (isDigit(s[i - 1]) && isDigit(s[i + 1])) hits.push("colon.citation_number");
  if (/^\s*=/u.test(a)) hits.push("colon.before_definition_equals");
  if (new RegExp(`^${LIT}$`, "iu").test(pw)) hits.push("colon.after_literally");
  if (/^(hence|possibly|probably|perhaps|also)$/iu.test(pw) && !/^\s*=/u.test(a)) hits.push("colon.after_hedge_or_derivation_label");
  if (/^(or|either|alternatively)$/iu.test(pw)) hits.push("colon.after_alternative_label");
  return hits.length ? hits : ["colon.introduces_explanation"];
};

// ---------------- equals ----------------
const equals = (s, i, ctx) => {
  const p = prevNonSpace(s, i); const pw = prevWord(s, i) || "";
  const hits = [];
  if (s.slice(0, i).trim() === "") hits.push("equals.route_initial");
  if (p === ":") hits.push("equals.after_label_colon");
  if (p === ";") hits.push("equals.after_semicolon");
  if (/^(therefore|hence|likely|possibly|probably|unknown|unkown|uncertain|term|participle|literally|literaly|literallly|litterally)$/iu.test(pw) && /\s*$/u.test(s.slice(0, i)) && p !== ":" && isLetter(p)) hits.push("equals.after_label_word_without_colon");
  if (ctx.depth[i] > 0) hits.push("equals.in_parentheses");
  if (p !== null && QUOTES.has(p)) hits.push("equals.after_quoted_literal");
  if (s[i - 1] === " " && isLetter(s[i + 1])) hits.push("equals.stray_before_word");
  if ((s[i - 1] === " " && s[i + 1] === " ") || p === ",") hits.push("equals.between_phrase_and_its_meaning");
  return hits;
};

// ---------------- parentheses ----------------
let SLOT = /^(one's|one|oneself|someone|someone's|someone else|something|something else|other|others|another)$/iu;
const SLOT_AMENDED = /^(one's|one|oneself|someone|someone's|someone else|someone else's|something|something else|other|others|another)$/iu;
const SIGLA = /^(ABD|HALOT|DCH|NIDB|NIDOTTE|NJB|BDB|KBL|LXX|MT|NIV|NRSV|NJPS|TDOT)\b/u;
const groupKind = (inner) => {
  const t = inner.trim();
  const hits = [];
  if ((AMEND ? SLOT_AMENDED : SLOT).test(t)) hits.push("slot_placeholder");
  if ((AMEND ? /^(\p{N}|ca\.|c\.)/u : /^(\p{N}|ca\.)/u).test(t)) hits.push("number_or_date");
  if (SIGLA.test(t)) hits.push("reference_siglum");
  if (/^or(\b|:|,)/u.test(t)) hits.push("alternative_wording");
  if (/^-|-$/u.test(t)) hits.push("optional_affix");
  if (/^\|i/u.test(t)) hits.push("scientific_name");
  if (/^=/u.test(t)) hits.push("equivalence");
  if (/^(see|cf\.)/u.test(t) && !(AMEND && /^see\s*$/u.test(t))) hits.push("cross_reference");
  if (t === "?") hits.push("query");
  return hits.length ? hits : ["aside_or_optional_words"];
};
const parenOpen = (s, i, ctx) => ctx.match[i] < 0 ? ["paren.open_never_closed"] : groupKind(s.slice(i + 1, ctx.match[i])).map((k) => `paren.open.${k}`);
const parenClose = (s, i, ctx) => ctx.match[i] < 0 ? ["paren.close_with_nothing_open"] : groupKind(s.slice(ctx.match[i] + 1, i)).map((k) => `paren.close.${k}`);

// ---------------- apostrophes ----------------
const apostrophe = (s, i, ctx) => {
  const hits = [];
  const b = s[i - 1], c = s[i + 1];
  if (isLetter(b) && c === "s" && !isLetter(s[i + 2])) hits.push("apostrophe.possessive_s");
  const openedEarlier = (() => { for (let j = 0; j < i; j += 1) if (s[j] === "'" && !isLetter(s[j - 1]) && isLetter(s[j + 1])) return true; return false; })();
  if ((/[sxz]$/u.test(b || "") || s.slice(i - 2, i) === "sh") && !isLetter(c) && !openedEarlier) hits.push("apostrophe.possessive_after_sibilant");
  if (!isLetter(b) && isLetter(c)) hits.push("apostrophe.single_quote_open");
  if (isLetter(b) && !isLetter(c) && openedEarlier) hits.push("apostrophe.single_quote_close");
  return hits;
};
const rsquo = (s, i) => {
  const hits = []; const b = s[i - 1], c = s[i + 1];
  if (isLetter(b) && c === "s" && !isLetter(s[i + 2])) hits.push("right_single_quote.possessive_s");
  if (b === "s" && !isLetter(c)) hits.push("right_single_quote.possessive_after_s");
  return hits;
};

// ---------------- note markers ----------------
const noteMark = (prefix, opts) => (s, i, ctx) => {
  const hits = [];
  const p = prevNonSpace(s, i);
  if (s.slice(0, i).trim() === "") hits.push(`${prefix}.route_initial`);
  if (p === ";" && ctx.depth[i] === 0) hits.push(`${prefix}.after_semicolon`);
  if (p === "׃" && opts.sofAsSemicolon) hits.push(`${prefix}.after_semicolon`);
  if (p === ",") hits.push(`${prefix}.after_comma`);
  if (p !== null && (isLetter(p) || isDigit(p) || /\p{M}/u.test(p))) hits.push(`${prefix}.inline_without_punctuation`);
  if (s.slice(0, i).trimEnd().endsWith("|i*")) hits.push(`${prefix}.after_italic_close`);
  if (!hits.length && AMEND) { if (p === "׃") hits.push(`${prefix}.after_semicolon`); else if (p !== null) hits.push(`${prefix}.inline_without_punctuation`); }
  return hits;
};

// ---------------- others ----------------
const hyphen = (s, i, ctx) => {
  const hits = []; const b = s[i - 1], c = s[i + 1];
  if (isLetter(b) && isLetter(c)) hits.push("hyphen.compound_join");
  const dBefore = /\p{N}/u.test(s.slice(Math.max(0, i - 3), i)), dAfter = /\p{N}/u.test(s.slice(i + 1, i + 4));
  if ((isDigit(b) && isDigit(c)) || (dBefore && dAfter)) hits.push("hyphen.numeric_range");
  if (b === "-" || c === "-") hits.push("hyphen.double_hyphen_dash");
  if (ctx.depth[i] > 0 && (b === "(" || c === ")")) hits.push("hyphen.optional_affix_in_parentheses");
  if (b === " " && c === " ") hits.push("hyphen.spaced_dash");
  return hits;
};
const slash = (s, i) => {
  const hits = [];
  const w = s.slice(Math.max(0, i - 8), i + 9);
  if (/and$/iu.test(s.slice(0, i)) && /^or\b/iu.test(s.slice(i + 1))) hits.push("slash.and_or");
  const lw = (s.slice(0, i).match(/([\p{L}]+)$/u) || [, ""])[1].toLowerCase();
  const rw = (s.slice(i + 1).match(/^([\p{L}]+)/u) || [, ""])[1].toLowerCase();
  const PR = ["his/her", "he/she", "s/he", "him/her", "himself/herself"];
  const tokAt = (() => { let a = i, z = i; while (a > 0 && /[\p{L}\/]/u.test(s[a - 1])) a -= 1; while (z < s.length - 1 && /[\p{L}\/]/u.test(s[z + 1])) z += 1; return s.slice(a, z + 1).toLowerCase().split("/"); })();
  const tokHasPair = tokAt.some((w, k) => k > 0 && PR.includes(`${tokAt[k - 1]}/${w}`));
  if (PR.includes(`${lw}/${rw}`) || (AMEND && tokHasPair)) hits.push("slash.pronoun_pair");
  if (isLetter(s[i - 1]) && isLetter(s[i + 1]) && !hits.length) hits.push("slash.word_pair");
  if (isDigit(s[i - 1]) && isDigit(s[i + 1])) hits.push("slash.number_pair");
  if (s[i - 1] === " " && s[i + 1] === " ") hits.push("slash.spaced_between_phrases");
  return hits;
};
export const ABBR_LIST = ["etc", "e.g", "i.e", "ca", "c", "cf", "esp", "Mt", "m", "mm", "cm", "km", "E", "W", "N", "S", "B.C", "B.C.E", "C.E", "A.D"];
const period = (s, i, opts) => {
  const hits = [];
  if (s[i - 1] === "." || s[i + 1] === ".") hits.push("period.ellipsis");
  if (isDigit(s[i - 1]) && isDigit(s[i + 1])) hits.push("period.decimal");
  // the abbreviation token: the maximal run of letters and dots around this dot
  let a = i, z = i; while (a > 0 && /[\p{L}.]/u.test(s[a - 1])) a -= 1; while (z < s.length - 1 && /[\p{L}.]/u.test(s[z + 1])) z += 1;
  const tok = s.slice(a, z + 1).replace(/\.+$/u, "");
  if ((opts.abbr || ABBR_LIST).includes(tok) && !(s[i - 1] === "." || s[i + 1] === ".")) hits.push("period.abbreviation");
  if (/^[\s"”')\]]*$/u.test(s.slice(i + 1))) hits.push("period.route_final");
  return hits.length ? hits : ["period.sentence_break"];
};
const quote = (s, i, ctx) => [ctx.qOrd[i] % 2 === 1 ? "quote.open" : "quote.close"];
const pipe = (s, i) => s.startsWith("|i*", i) ? ["pipe.italic_close"] : (s[i + 1] === "i" ? ["pipe.italic_open"] : []);
const star = (s, i) => s.slice(i - 2, i + 1) === "|i*" ? ["star.italic_close"] : [];
const gt = (s, i) => (s[i - 1] === " " && s[i + 1] === " ") ? ["gt.literal_to_figurative"] : [];
const question = (s, i, ctx) => { const h = []; if (i === s.length - 1) h.push("question.route_final"); if (ctx.depth[i] > 0) h.push("question.in_parentheses"); if (ctx.inQuote[i]) h.push("question.in_quote"); return h; };
const plus = (s, i) => (s[i - 1] === " " && s[i + 1] === " ") ? ["plus.added_circumstance"] : [];
const bang = (s, i, ctx) => { const h = []; if (markerFree(s) && /^ \p{L}/u.test(s.slice(i + 1))) h.push("exclamation.between_interjections"); if (i === s.length - 1) h.push("exclamation.route_final"); return h.length ? h : ["exclamation.in_literal_rendering"]; };
const sof = (s, i) => /^\s*[◄►≈]/u.test(s.slice(i + 1)) ? ["sof_pasuq.in_place_of_semicolon_before_note"] : [];
const brOpen = (s, i) => /^\[[ab]\]/u.test(s.slice(i)) ? ["bracket.open.sense_letter_reference"] : [];
const brClose = (s, i) => /\[[ab]\]$/u.test(s.slice(0, i + 1)) ? ["bracket.close.sense_letter_reference"] : [];
const HEB = /[א-ת֑-ׇ]/u;
const maqaf = (s, i) => (HEB.test(s[i - 1] || "") && HEB.test(s[i + 1] || "")) ? ["maqaf.in_cited_hebrew_compound"] : [];
const dash = (s, i) => (isDigit(s[i - 1]) && isDigit(s[i + 1])) ? ["dash.numeric_range"] : [];
const ell = () => ["ellipsis_char.slot_in_correlative"];
const heb = (s, i) => {
  const cp = s.codePointAt(i);
  return (cp >= 0x0591 && cp <= 0x05C7 && ![0x05BE, 0x05C0, 0x05C3, 0x05C6].includes(cp)) ? ["hebrew_point.in_cited_hebrew_word"] : [];
};

let AMEND = false;
export const classifyAll = (s, opts = {}) => {
  AMEND = !!opts.amend; setAmend(opts); CLAUSE_COLON = !!opts.clauseColon;
  const ctx = context(s);
  const out = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (!isMark(c)) continue;
    let hits;
    switch (c) {
      case ";": hits = semicolon(s, i, ctx, opts); break;
      case ",": hits = comma(s, i, ctx, opts); break;
      case ":": hits = colon(s, i, ctx); break;
      case "=": hits = equals(s, i, ctx); break;
      case "(": hits = parenOpen(s, i, ctx); break;
      case ")": hits = parenClose(s, i, ctx); break;
      case "'": hits = apostrophe(s, i, ctx); break;
      case "’": hits = rsquo(s, i); break;
      case "◄": hits = noteMark("back_arrow", { sofAsSemicolon: true })(s, i, ctx); break;
      case "►": hits = noteMark("forward_arrow", { sofAsSemicolon: !!opts.sofForward })(s, i, ctx); break;
      case "≈": hits = noteMark("approx", {})(s, i, ctx); break;
      case "-": hits = hyphen(s, i, ctx); break;
      case "/": hits = slash(s, i); break;
      case ".": hits = period(s, i, opts); break;
      case '"': case "“": case "”": hits = quote(s, i, ctx); break;
      case "|": hits = pipe(s, i); break;
      case "*": hits = star(s, i); break;
      case ">": hits = gt(s, i); break;
      case "?": hits = question(s, i, ctx); break;
      case "+": hits = plus(s, i); break;
      case "!": hits = bang(s, i, ctx); break;
      case "׃": hits = sof(s, i); break;
      case "[": hits = brOpen(s, i); break;
      case "]": hits = brClose(s, i); break;
      case "־": hits = maqaf(s, i); break;
      case "–": case "‑": hits = dash(s, i); break;
      case "…": hits = ell(); break;
      default: hits = heb(s, i);
    }
    out.push({ i, mark: c, hits });
  }
  return out;
};
