// Independent classifier: every mark occurrence in route text -> exactly one shape, from the tests as stated in words.
import { isMark, isLetter, isDigit, traceAt, fieldOf, parse, words } from "./common.mjs";
import { isLabel as ownIsLabel, stripLabelLead as ownStrip, draftIsLabel, draftStripLabelLead } from "./labels.mjs";
let isLabel = ownIsLabel, stripLead = ownStrip;
export const useLabels = (mode) => { if (mode === "draft") { isLabel = draftIsLabel; stripLead = draftStripLabelLead; } else { isLabel = ownIsLabel; stripLead = ownStrip; } };
// VARIANT=1 tries looser readings of four tests, only to locate where the draft code departs from its words.
const VAR = process.env.VARIANT === "1";
const stripG = (t) => { let x = t, y; do { y = x; x = x.replace(/\([^()]*\)|\[[^[\]]*\]/gu, " "); } while (x !== y); return x.replace(/\s+/gu, " ").trim(); };
export const ORDER = { tagged: ["ie", "etc", "name", "between", "last", "untagged"] };

const SEP = (c) => c === "," || c === ";";
// find list end: first '.' at depth 0 not next to another '.' and not followed by ','
export const listEndOf = (s, p) => {
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== "." || p.depth[i] !== 0) continue;
    if (s[i - 1] === "." || s[i + 1] === ".") continue;
    if (s[i + 1] === ",") continue;
    return i;
  }
  return -1;
};
// depth-0 separator positions (',' ';') up to a limit
const sepsOf = (s, p, limit) => {
  const out = [];
  for (let i = 0; i < limit; i++) if (SEP(s[i]) && p.depth[i] === 0) out.push(i);
  return out;
};
export const analyze = (def) => {
  const s = def; const p = parse(s); const field = fieldOf(s);
  const end = field === "list" ? listEndOf(s, p) : -1;
  const limit = field === "list" ? (end >= 0 ? end : s.length) : s.length;
  const seps = sepsOf(s, p, limit);
  const prevSep = (i) => { let b = -1; for (const x of seps) { if (x < i) b = x; else break; } return b; };
  const nextSep = (i) => { for (const x of seps) if (x > i) return x; return -1; };
  const pieceBefore = (i) => s.slice(prevSep(i) + 1, i);
  const pieceAfter = (i) => { const j = nextSep(i); return { text: s.slice(i + 1, j < 0 ? limit : j), j }; };
  const after = (i) => s.slice(i + 1);
  const shape = new Map(); const flags = new Map();
  const groupShape = new Map(); // opener index -> shape (for its closer)
  let quoteOpen = false;
  const afterEnd = (i) => end >= 0 && i > end;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!isMark(c)) continue;
    const d = p.depth[i];
    let sh = null;
    if (c === ",") {
      if (field === "list") {
        if (afterEnd(i)) sh = "comma.in_note";
        else if (d > 0) sh = "comma.in_group";
        else {
          const nx = pieceAfter(i).text.trim();
          if (VAR ? (/^-/u.test(after(i)) || /^\s*\(\s*-[^()]*\)\s*(?:$|[,;.])/u.test(after(i))) : (nx.startsWith("-") || /^\(-[^()]*\)$/u.test(nx))) sh = "comma.attaches_syllable";
          else sh = "comma.rendering_separator";
        }
      } else if (d > 0) sh = "comma.def_in_aside";
      else {
        const pb = pieceBefore(i).trim();
        const { text: nxRaw, j } = pieceAfter(i);
        const nx = nxRaw.trim();
        if (traceAt(s, i)) {
          const f = {
            ie: /^\s*i\.e\./u.test(after(i)),
            etc: /^\s*etc\b/u.test(after(i)),
            name: /^\p{Lu}/u.test(stripLead(pb)),
            between: j >= 0 && traceAt(s, j),
            last: j < 0,
          };
          f.untagged = !f.between && !f.last;
          flags.set(i, f);
          for (const k of ORDER.tagged) if (f[k]) { sh = "comma.def_" + { ie: "gloss_then_ie", etc: "gloss_then_etc", name: "name_then_description", between: "between_tagged_glosses", last: "gloss_then_last_piece", untagged: "gloss_then_untagged" }[k]; break; }
        } else if (isLabel(pb) || (VAR && isLabel(stripG(pb)))) sh = "comma.def_after_label";
        else if (words(pb).length <= 4 && words(nx).length <= 4) sh = "comma.def_short_series";
        else sh = "comma.def_clause";
      }
    } else if (c === ".") {
      if (s[i - 1] === "." || s[i + 1] === ".") sh = "period.ellipsis";
      else if (field === "list") {
        if (i === end) sh = "period.list_end";
        else if (afterEnd(i)) sh = "period.in_note";
        else if (d > 0) sh = "period.in_group";
        else if (s[i + 1] === ",") sh = "period.stray_before_comma";
      } else {
        const ie = (s.slice(i - 3, i + 1) === "i.e." ) || (s.slice(i - 1, i + 3) === "i.e.");
        if (ie) sh = "period.ie";
        else if (s.slice(i - 3, i) === "etc") sh = "period.etc";
        else if (s[i - 1] === " " && /^ \p{Ll}/u.test(after(i))) sh = "period.stray_for_comma";
        else if (s[i - 1] === " " && !/^\s*\p{Ll}/u.test(after(i))) sh = "period.trace_end";
        else if (s[i + 1] === ")") sh = "period.aside_sentence_end";
        else if (isLetter(s[i - 1]) && (s[i + 1] === "," || /^\s*\p{Ll}/u.test(after(i)))) sh = "period.abbreviation";
        else if (i === s.length - 1 || /^ [\p{Lu}֐-׿\p{N}]/u.test(after(i))) sh = "period.sentence_end";
      }
    } else if (c === "(") {
      if (p.unclosed.has(i)) sh = "paren.opener_never_closed";
      else {
        const content = s.slice(i + 1, p.partner[i]).trim();
        const cp = parse(content);
        const ownComma = [...content].some((ch, k) => ch === "," && cp.depth[k] === 0);
        if (field === "list") {
          if (afterEnd(i)) sh = "paren.note";
          else if (/\p{N}/u.test(content) || /^(?:by mistake|by confusion|by exchange|by including|from margin|which|but|the word)\b/u.test(content) || (VAR && /^(?:including|includ\.|from the marg|by correction)/u.test(content))) sh = "paren.list_aside";
          else if (content.endsWith("-") && content.includes(",")) sh = "paren.list_prefix_syllables";
          else if (content.startsWith("-") || (VAR && /^[(\[\s]*-/u.test(content))) sh = "paren.list_suffix_syllable";
          else if (content.endsWith("-")) sh = "paren.list_prefix_syllable";
          else if (ownComma) sh = "paren.list_alternatives";
          else sh = "paren.list_optional_words";
        } else {
          if (content.startsWith("-") || content.endsWith("-")) sh = "paren.def_syllable";
          else if (isLabel(content)) sh = "paren.def_label";
          else if (/^([^,]+),\s*\S/u.test(content) && isLabel(content.split(",")[0])) sh = "paren.def_labelled_alternative";
          else sh = "paren.def_aside";
        }
        groupShape.set(i, sh);
      }
    } else if (c === ")") {
      if (p.orphan.has(i)) sh = "paren.closer_with_nothing_open";
      else sh = { pairOf: p.partner[i] };
    } else if (c === "[") {
      if (p.unclosed.has(i)) sh = null;
      else {
        const content = s.slice(i + 1, p.partner[i]).trim();
        if (field === "def") sh = "bracket.def_note";
        else if (content.startsWith("-")) sh = "bracket.list_syllable";
        else sh = "bracket.list_note";
        groupShape.set(i, sh);
      }
    } else if (c === "]") {
      if (p.orphan.has(i)) sh = null; else sh = { pairOf: p.partner[i] };
    } else if (c === ";") {
      if (field === "list") {
        if (afterEnd(i)) sh = "semicolon.in_note";
        else if (d > 0) sh = "semicolon.in_group_note";
        else sh = "semicolon.rendering_separator";
      } else if (d > 0) sh = "semicolon.def_in_aside";
      else if (/^\s*i\.e\./u.test(after(i))) sh = "semicolon.before_ie";
      else if (isLabel(pieceBefore(i))) sh = "semicolon.after_bare_label";
      else sh = "semicolon.sense_separator";
    } else if (c === "-") {
      const a = s[i - 1], b = s[i + 1];
      const Q = (x) => x === "'" || x === "’" || x === '"' || x === "‘";
      if (field === "list" && afterEnd(i)) sh = "hyphen.in_note";
      else if (field === "list" && (a === "(" || a === ",") && b === ")") sh = "hyphen.bare_in_group";
      else if (field === "def" && a === " " && b === " ") sh = "hyphen.elided_part_of_name";
      else if (field === "def" && ((isLetter(a) && b === " " && isLetter(s[i + 2])) || (a === " " && isLetter(b) && isLetter(s[i - 2])))) sh = "hyphen.compound_split_by_space";
      else if (isLetter(a) && isLetter(b)) sh = "hyphen.compound";
      else if ((i === 0 || a === "(" || a === " " || a === "," || a === "[" || Q(a)) && isLetter(b)) sh = "hyphen.suffix_syllable";
      else if (isLetter(a) && (b === ")" || b === " " || b === "," || b === "(" || b === "." || Q(b))) sh = "hyphen.prefix_syllable";
    } else if (c === "×" || c === "+") {
      const nm = c === "×" ? "times" : "plus";
      if (field === "list" && !afterEnd(i)) {
        if (d > 0) sh = nm + ".in_group";
        else sh = s.slice(prevSep(i) + 1, i).trim() === "" ? nm + ".whole_rendering" : nm + ".mid_rendering";
      }
    } else if (c === "'" ) {
      const a = s[i - 1], b = s[i + 1];
      if (b === "s" && !isLetter(s[i + 2])) sh = "apostrophe.possessive";
      else if (quoteOpen) { sh = "apostrophe.quote_close"; quoteOpen = false; }
      else if (a === "s") sh = "apostrophe.plural_possessive";
      else if (!isLetter(a) && (isLetter(b) || b === "-")) { sh = "apostrophe.quote_open"; quoteOpen = true; }
    } else if (c === "’") {
      if (s[i - 1] === "s" && !quoteOpen) sh = "apostrophe.plural_possessive";
    } else if (c === "!" || c === "?") {
      const b = s[i + 1];
      if (b === undefined || b === " " || b === "," || b === ";" || b === ")" || b === ".") sh = (c === "!" ? "exclamation" : "question") + ".ends_gloss";
    } else if (c === ":") {
      if (isDigit(s[i - 1]) && isDigit(s[i + 1])) sh = "colon.verse_citation";
    } else if (/\p{M}/u.test(c) && /[֑-ׇ]/u.test(c)) sh = "point.cited_hebrew_word";
    else if (c === "}") { if (!s.includes("{")) sh = "brace.stray_closer"; }
    shape.set(i, sh);
  }
  // closers take their pair's shape
  for (const [i, sh] of shape) if (sh && typeof sh === "object") shape.set(i, groupShape.get(sh.pairOf) || null);
  return { field, end, p, shape, flags, seps, limit };
};
