#!/usr/bin/env node
// Mark ledger pilot · ubs_sdbh_hebrew_v0_9_2 (M18) · 2026-10-31
//
// Reads one provider file, the closed-set inventory, and today's engine rule,
// and writes census.json (every mark, every shape, every count) and
// compare.json (today's display division against the declaration's).
// Single process, one provider file. Read-only outside this folder.
//
//   node ledger.mjs            -> writes census.json, compare.json, changes-vs-v3.jsonl
//
// Every number in declaration.json comes from census.json / compare.json.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SHAPES } from "./shape-meanings.mjs";
import { senseSplit } from "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/ghp/reader/tools/sense-split-v1.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/punct";
const SOURCE_KEY = "ubs_sdbh_hebrew_v0_9_2";
const M_IDS = ["M18"];
const FILE = join(ROOT, "by-source", `${SOURCE_KEY}.jsonl`);

const rows = readFileSync(FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const inventory = JSON.parse(readFileSync(join(ROOT, "mark-inventory-2026-10-31.json"), "utf8"));
const ranked = JSON.parse(readFileSync(join(ROOT, "sources-ranked.json"), "utf8"));

const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch);
const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const win = (s, i, half = 25) => {
  const a = Math.max(0, i - half), z = Math.min(s.length, i + half + 1);
  return (a > 0 ? "…" : "") + s.slice(a, z) + (z < s.length ? "…" : "");
};

// ---------------------------------------------------------------- per-route scan
const NOTE = new Set(["◄", "►", "≈"]);
const STRUCT = /[;◄►≈=:]/u; // a route carrying none of these is "marker-free"

function scan(s) {
  const n = s.length;
  const depth = new Array(n).fill(0);     // paren depth before char i (orphan closers inert)
  const inQuote = new Array(n).fill(false);
  const inItalic = new Array(n).fill(false);
  const noteBefore = new Array(n).fill(false);
  const groupOf = new Array(n).fill(-1);  // for ( and ): index of its group
  const groups = [];                      // {open, close, text}
  const orphanClosers = new Set(), unclosedOpeners = new Set();
  let d = 0, q = false, it = false, note = false;
  const stack = [];
  for (let i = 0; i < n; i += 1) {
    const c = s[i];
    depth[i] = d; inQuote[i] = q; inItalic[i] = it; noteBefore[i] = note;
    if (c === "(") { stack.push(i); d += 1; }
    else if (c === ")") {
      if (stack.length) { const o = stack.pop(); const g = groups.length; groups.push({ open: o, close: i, text: s.slice(o + 1, i) }); groupOf[o] = g; groupOf[i] = g; d -= 1; }
      else orphanClosers.add(i);
    } else if (c === '"') q = !q;
    else if (c === "“") q = true;
    else if (c === "”") q = false;
    else if (c === "|" && s[i + 1] === "i") { it = s[i + 2] !== "*"; }
    else if (NOTE.has(c) && d === 0 && !q && !it) note = true;
  }
  for (const o of stack) unclosedOpeners.add(o);
  const markerFree = !STRUCT.test(s);
  // v3's gloss test over depth-0 comma pieces, used to name the short marker-free register
  const pieces = []; { let st = 0, dd = 0; for (let i = 0; i < n; i += 1) { const c = s[i]; if (c === "(") dd += 1; else if (c === ")") { if (dd > 0) dd -= 1; } else if (c === "," && dd === 0) { pieces.push(s.slice(st, i)); st = i + 1; } } pieces.push(s.slice(st)); }
  const words = (p) => p.replace(/\([^()]*\)/gu, " ").trim().split(/\s+/u).filter(Boolean).length;
  const shortPieces = pieces.every((p) => words(p) <= 4);
  return { depth, inQuote, inItalic, noteBefore, groupOf, groups, orphanClosers, unclosedOpeners, markerFree, shortRegister: markerFree && shortPieces && pieces.length > 1 };
}

const prevWord = (s, i) => (s.slice(0, i).match(/([^\s]+)\s*$/u) || [, ""])[1];
const nextTok = (s, i) => (s.slice(i + 1).match(/^\s*([^\s]+)/u) || [, ""])[1];
const nextNonSpace = (s, i) => { const m = s.slice(i + 1).match(/^\s*(\S)/u); return m ? m[1] : ""; };
const prevNonSpace = (s, i) => { const m = s.slice(0, i).match(/(\S)\s*$/u); return m ? m[1] : ""; };

function regionOf(ctx, i) {
  if (ctx.markerFree) return "marker_free";
  if (ctx.noteBefore[i]) return "notes";
  return "head";
}

// ---------------------------------------------------------------- shape tests
const LIT = /^["“]?lit[a-z]*ly[,:]?$/iu;
const DERIVED_WORD = /^(hence|therefore)\b/iu;
const HEDGE_WORD = /^(possibly|probably|perhaps|possible|one possible|among the possibilities|conjectured)\b/iu;
const ALT_LABEL = /^(or|either|alternatively)\s*:|^or\s*\(\d\)|^alternatively\b/iu;
const CONJ = /^(and|or|nor|but|and\/or|either|whether|though|although|yet|while|so|then|thus|as well|whereas|except|rather)$/iu;
const APPOSITIVE = /^(son|sons|daughter|daughters|wife|husband|father|mother|brother|sister|descendant|descendants|ancestor|tribe|territory|town|king|queen|chief|the|a|an|also|better|later|known|called|used|related|suitable|destroyed|selectively|probably|possibly|perhaps|from|if|sometimes|often|usually|including|such|especially|enclosed|lined|capable|located|found|made|which|who|whose|where|when|with|whether|either|in|on|at|by|for|of|like|than|not|only|primarily|mainly|mostly|typically|generally|normally)$/iu;
const ABBREV = /(?:^|[\s(])(etc|e\.g|i\.e|ca|c|cf|esp|Mt|m|mm|cm|km|E|W|N|S|B\.C|B\.C\.E|C\.E|A\.D|BCE|vs|no|lit|approx|viz|St|ff|Gen|Ex|Num|Deut|Josh|Judg|Sam|Kgs|Chr|Isa|Jer|Ezek|Ps|Prov)$/u;

function shapeOf(mark, s, i, ctx) {
  const c = mark;
  const inParen = ctx.depth[i] > 0;
  const inQ = ctx.inQuote[i] || ctx.inItalic[i];
  // Hebrew points and the cited Hebrew they sit in
  if (/[֑-ׇֽֿׁׂׅׄ]/u.test(c)) return "hebrew_point.in_cited_hebrew_word";
  switch (c) {
    case ";": {
      if (inParen) return "semicolon.in_parentheses";
      if (inQ) return "semicolon.in_quote_or_italic";
      const nx = nextTok(s, i), nn = nextNonSpace(s, i);
      if (NOTE.has(nn)) return "semicolon.before_note_marker";
      if (ALT_LABEL.test(s.slice(i + 1).trimStart())) return "semicolon.before_alternative_label";
      if (/^(or|either)\b/iu.test(nx)) return "semicolon.before_or_clause";
      if (DERIVED_WORD.test(nx)) return "semicolon.before_derived_meaning";
      if (LIT.test(nx)) return "semicolon.before_literal_rendering";
      if (HEDGE_WORD.test(s.slice(i + 1).trimStart())) return "semicolon.before_hedged_meaning";
      if (nn === "=") return "semicolon.before_definition_equals";
      if (nn === "") return "semicolon.route_final";
      if (ctx.noteBefore[i]) return "semicolon.between_note_items";
      return "semicolon.head_to_further_clause";
    }
    case ",": {
      if (inParen) return "comma.in_parentheses";
      if (inQ) return "comma.in_quote_or_italic";
      const nx = nextTok(s, i), nn = nextNonSpace(s, i), pw = prevWord(s, i);
      if (NOTE.has(nn)) return "comma.before_note_marker";
      if (ALT_LABEL.test(s.slice(i + 1).trimStart())) return "comma.before_alternative_label";
      if (LIT.test(pw + ",") || /^(hence|therefore|possibly|probably|perhaps)$/iu.test(pw) || /^[a-z]+:$/iu.test(nx) && /^(possibly|probably|hence|or|either|perhaps|literally):?$/iu.test(nx)) return "comma.label_punctuation";
      if (nn === "") return "comma.route_final";
      if (CONJ.test(nx.replace(/[,:;]$/u, ""))) return "comma.before_conjunction";
      // a list closed later in the same clause by ", and" / ", or" / " and " / " or "
      {
        let j = i + 1, dd = 0; let rest = "";
        for (; j < s.length; j += 1) { const ch = s[j]; if (ch === "(") dd += 1; else if (ch === ")") { if (dd > 0) dd -= 1; } else if (dd === 0 && (ch === ";" || NOTE.has(ch))) break; rest += ch; }
        const nextComma = rest.indexOf(",");
        const upto = nextComma === -1 ? rest : rest.slice(0, nextComma);
        const wordsUpto = upto.trim().split(/\s+/u).filter(Boolean);
        if (nextComma !== -1 && wordsUpto.length <= 4 && /,\s*(and|or|and\/or)\s/iu.test(rest)) return "comma.series_item";
        // "A, B and C": the item before this comma and the one after it are short, and the one after ends the list with and/or
        const back = s.slice(0, i); const lastStop = Math.max(back.lastIndexOf(","), back.lastIndexOf(";"), back.lastIndexOf(":"), back.lastIndexOf("◄"), back.lastIndexOf("►"), back.lastIndexOf("≈"), back.lastIndexOf("("));
        const itemBefore = back.slice(lastStop + 1).trim().split(/\s+/u).filter(Boolean);
        if (nextComma === -1 && !ctx.shortRegister && itemBefore.length <= 3 && /^\s*\S+(\s+\S+){0,2}\s+(and|or|and\/or)\s+\S/iu.test(upto)) return "comma.series_item_closed_by_conjunction_without_comma";
      }
      if (ctx.shortRegister) {
        const nxb = nx.replace(/[,:;]$/u, "");
        if (APPOSITIVE.test(nxb) || /-in-law$/iu.test(nxb) || /^(oldest|eldest|youngest|firstborn)$/iu.test(nxb)) return "comma.short_route_appositive";
        // the comma that closes a phrase an earlier comma opened with whether / if / either / or
        { let j = -1, dd = 0; for (let k = 0; k < i; k += 1) { const ch = s[k]; if (ch === "(") dd += 1; else if (ch === ")") { if (dd > 0) dd -= 1; } else if (ch === "," && dd === 0) j = k; }
          if (j !== -1 && /^\s*(whether|if|either|or)\b/iu.test(s.slice(j + 1))) return "comma.short_route_closes_interruption"; }
        const pwb = pw.replace(/^[("]+/u, "");
        const nextPiece = (s.slice(i + 1).split(",")[0] || "").trim();
        if (/^\p{Lu}\p{Ll}+$/u.test(pwb) && /^\p{Lu}\p{Ll}+$/u.test(nextPiece)) return "comma.short_route_name_variant";
        // coordinate modifiers before one head noun: "a long, rigid piece", "thin, biscuit-like product"
        const beforeWord = (s.slice(0, i).match(/(\S+)\s+\S+\s*$/u) || [, "^"])[1];
        const atStart = /^\s*\S+\s*$/u.test(s.slice(0, i));
        if (/^\p{Ll}/u.test(pwb) && (atStart || /^(a|an|the|of|not)$/iu.test(beforeWord)) && nextPiece.split(/\s+/u).length >= 2 && !/^to\s/iu.test(nextPiece) && !/^to\s/iu.test(s)) return "comma.short_route_coordinate_modifiers";
        // the pieces either side of the comma, at depth 0
        const piecesAll = []; { let st = 0, dd = 0; for (let k = 0; k < s.length; k += 1) { const ch = s[k]; if (ch === "(") dd += 1; else if (ch === ")") { if (dd > 0) dd -= 1; } else if (ch === "," && dd === 0) { piecesAll.push(s.slice(st, k).trim()); st = k + 1; } } piecesAll.push(s.slice(st).trim()); }
        const toLed = piecesAll.map((p) => /^to\s/iu.test(p));
        const bare = (p) => p.replace(/\([^()]*\)/gu, " ").trim();
        const w = piecesAll.map((p) => bare(p).split(/\s+/u).filter(Boolean));
        const FUNC = /^(of|in|to|from|for|with|by|on|at|a|an|the)$/iu;
        const allTo = toLed.every(Boolean) && w.every((x) => x.length >= 2);
        const noneTo = toLed.every((x) => !x);
        const nominal = noneTo && w.every((x) => x.length <= 2 && !x.some((t) => FUNC.test(t)) && !x.some((t) => /^\p{Lu}/u.test(t) && x.length === 1 && false));
        if (allTo || nominal) return "comma.short_route_packed_renderings_complete";
        return "comma.short_route_packed_renderings_elliptic";
      }
      return "comma.definition_prose";
    }
    case "◄": case "►": case "≈": {
      const nm = { "◄": "back_arrow", "►": "forward_arrow", "≈": "approx" }[c];
      if (inParen) return `${nm}.in_parentheses`;
      if (inQ) return `${nm}.in_quote_or_italic`;
      const p = prevNonSpace(s, i);
      if (p === "") return `${nm}.route_initial`;
      if (p === ";" || p === "׃") return `${nm}.after_semicolon`;
      if (p === ",") return `${nm}.after_comma`;
      if (p === "*" && s.slice(Math.max(0, i - 4), i).includes("|i*")) return `${nm}.after_italic_close`;
      return `${nm}.inline_without_punctuation`;
    }
    case "=": {
      if (inParen) return "equals.in_parentheses";
      if (inQ) return "equals.in_quote";
      const p = prevNonSpace(s, i);
      if (p === ":") return "equals.after_label_colon";
      if (p === ";") return "equals.after_semicolon";
      if (/^(therefore|hence|likely|possibly|probably|unkown|unknown|uncertain|term|participle|literally)$/iu.test(prevWord(s, i))) return "equals.after_label_word_without_colon";
      if (p === '"' || p === "”") return "equals.after_quoted_literal";
      if (/ = /u.test(s.slice(i - 1, i + 2)) || /, = /u.test(s.slice(i - 2, i + 2))) return "equals.between_phrase_and_its_meaning";
      if (/^\s*$/u.test(s.slice(0, i))) return "equals.route_initial";
      if (s[i - 1] === " " && /\p{L}/u.test(s[i + 1] || "")) return "equals.stray_before_word";
      return "equals.other";
    }
    case ":": {
      const a = s[i - 1] || "", b = s[i + 1] || "";
      if (/\d/u.test(a) && /\d/u.test(b)) return "colon.citation_number";
      const pw = prevWord(s, i).replace(/^[("“]+/u, "").replace(/["”]+$/u, "");
      if (nextNonSpace(s, i) === "=") return "colon.before_definition_equals";
      if (/^lit[a-z]*ly$/iu.test(pw)) return "colon.after_literally";
      if (/^(or|either|alternatively)$/iu.test(pw)) return "colon.after_alternative_label";
      if (/^(hence|possibly|probably|perhaps|also)$/iu.test(pw)) return "colon.after_hedge_or_derivation_label";
      return "colon.introduces_explanation";
    }
    case "(": case ")": {
      const g = ctx.groupOf[i];
      if (c === ")" && ctx.orphanClosers.has(i)) return "paren.close_with_nothing_open";
      if (c === "(" && ctx.unclosedOpeners.has(i)) return "paren.open_never_closed";
      const t = ctx.groups[g].text.trim();
      const side = c === "(" ? "open" : "close";
      let k;
      if (/^(one's|one|oneself|someone's|someone|someone else|someone else's|something|something else|other|others|another)$/iu.test(t)) k = "slot_placeholder";
      else if (/^(ABD|HALOT|DCH|NIDB|NIDOTTE|NJB|BDB|KBL|LXX|MT|NIV|NRSV|NJPS|TDOT)\b/u.test(t)) k = "reference_siglum";
      else if (/^(or|or:|or,)\s/iu.test(t) || /^or:/iu.test(t)) k = "alternative_wording";
      else if (/^=/u.test(t)) k = "equivalence";
      else if (/^(see|cf\.?)\s/iu.test(t)) k = "cross_reference";
      else if (/^[\d\s\/\-–‑.,ca]*\d[\d\s\/\-–‑.,]*(ABD|BCE|BC|B\.C\.)?$/u.test(t) || /^(ca\.?\s*)?\d/u.test(t)) k = "number_or_date";
      else if (/^-|-$/u.test(t)) k = "optional_affix";
      else if (/^\|i/u.test(t)) k = "scientific_name";
      else if (/^[\p{Script=Hebrew}\s־"]+$/u.test(t)) k = "cited_hebrew";
      else if (t === "?" ) k = "query";
      else k = "aside_or_optional_words";
      return `paren.${side}.${k}`;
    }
    case "'": {
      const a = s[i - 1] || "", b = s[i + 1] || "";
      if (/\p{L}/u.test(a) && b === "s" && !/\p{L}/u.test(s[i + 2] || "")) return "apostrophe.possessive_s";
      const openedBefore = /(^|[\s(])'\p{L}/u.test(s.slice(0, i));
      if (!/\p{L}/u.test(a) && /\p{L}/u.test(b)) return "apostrophe.single_quote_open";
      if (/\p{L}/u.test(a) && !/\p{L}/u.test(b) && openedBefore) return "apostrophe.single_quote_close";
      if ((/[sxz]/u.test(a) || /sh$/u.test(s.slice(Math.max(0, i - 2), i))) && !/\p{L}/u.test(b)) return "apostrophe.possessive_after_sibilant";
      return "apostrophe.other";
    }
    case "’": return /\p{L}/u.test(s[i - 1] || "") && s[i + 1] === "s" && !/\p{L}/u.test(s[i + 2] || "") ? "right_single_quote.possessive_s" : (s[i - 1] === "s" && !/\p{L}/u.test(s[i + 1] || "") ? "right_single_quote.possessive_after_s" : "right_single_quote.other");
    case "-": {
      const a = s[i - 1] || "", b = s[i + 1] || "";
      if (a === "-" || b === "-") return "hyphen.double_hyphen_dash";
      if (a === " " && b === " ") return "hyphen.spaced_dash";
      if (/\d/u.test(a) && /\d/u.test(b)) return "hyphen.numeric_range";
      if (/\d/u.test(s.slice(Math.max(0, i - 3), i)) && /\d/u.test(s.slice(i + 1, i + 3))) return "hyphen.numeric_range";
      if ((a === "(" || b === ")") && ctx.depth[i] > 0) return "hyphen.optional_affix_in_parentheses";
      if (/\p{L}/u.test(a) && /\p{L}/u.test(b)) return "hyphen.compound_join";
      return "hyphen.other";
    }
    case "–": case "‑": return /\d/u.test(s[i - 1] || "") && /\d/u.test(s[i + 1] || "") ? "dash.numeric_range" : "dash.other";
    case "/": {
      const a = prevWord(s, i).split("/").pop(), seg = s.slice(Math.max(0, i - 12), i + 12);
      if (/and\/or/iu.test(s.slice(Math.max(0, i - 3), i + 3))) return "slash.and_or";
      if (/\b(his\/her|her\/his|he\/she|she\/he|s\/he|him\/her|himself\/herself)\b/iu.test(seg)) return "slash.pronoun_pair";
      if (/\d/u.test(s[i - 1] || "") && /\d/u.test(s[i + 1] || "")) return "slash.number_pair";
      if (/\p{L}/u.test(s[i - 1] || "") && /\p{L}/u.test(s[i + 1] || "")) return "slash.word_pair";
      if (s[i - 1] === " " && s[i + 1] === " ") return "slash.spaced_between_phrases";
      return "slash.other";
    }
    case ".": {
      const a = s[i - 1] || "", b = s[i + 1] || "";
      if (a === "." || b === ".") return "period.ellipsis";
      if (/\d/u.test(a) && /\d/u.test(b)) return "period.decimal";
      const before = s.slice(0, i);
      if (ABBREV.test(before) || /(^|[\s(])(e\.g|i\.e|B\.C|C\.E|A\.D|B\.C\.E)$/u.test(before) || /(^|[\s(.])(e|i|B|C|A)$/u.test(before) && /[a-zA-Z]/u.test(b)) return "period.abbreviation";
      if (i === s.length - 1 || /^\s*["”)]*\s*$/u.test(s.slice(i + 1))) return "period.route_final";
      return "period.sentence_break";
    }
    case ">": return / > /u.test(s.slice(i - 1, i + 2)) ? "gt.literal_to_figurative" : "gt.other";
    case '"': case "“": case "”": {
      // which quote of the route this is, counting ASCII and curly together
      const before = s.slice(0, i);
      const nQ = (before.match(/["“”]/gu) || []).length;
      return nQ % 2 === 0 ? "quote.open" : "quote.close";
    }
    case "|": return s.slice(i, i + 3) === "|i*" ? "pipe.italic_close" : s.slice(i, i + 2) === "|i" ? "pipe.italic_open" : "pipe.other";
    case "*": return s.slice(i - 2, i + 1) === "|i*" ? "star.italic_close" : "star.other";
    case "?": {
      if (inParen) return "question.in_parentheses";
      if (inQ) return "question.in_quote";
      if (i === s.length - 1) return "question.route_final";
      return "question.other";
    }
    case "!": {
      if (i === s.length - 1) return "exclamation.route_final";
      if (/^\s+\p{L}/u.test(s.slice(i + 1)) && ctx.markerFree) return "exclamation.between_interjections";
      return "exclamation.in_literal_rendering";
    }
    case "+": return / \+ /u.test(s.slice(i - 1, i + 2)) ? "plus.added_circumstance" : "plus.other";
    case "׃": return NOTE.has(nextNonSpace(s, i)) ? "sof_pasuq.in_place_of_semicolon_before_note" : "sof_pasuq.other";
    case "[": case "]": return /\[[a-z]\]/u.test(s.slice(Math.max(0, i - 2), i + 3)) ? `bracket.${c === "[" ? "open" : "close"}.sense_letter_reference` : "bracket.other";
    case "־": return /[א-ת֑-ׇ]/u.test(s[i - 1] || "") && /[א-ת]/u.test(s[i + 1] || "") ? "maqaf.in_cited_hebrew_compound" : "maqaf.other";
    case "…": return "ellipsis_char.slot_in_correlative";
    default: return `${c}.unclassified`;
  }
}

// ---------------------------------------------------------------- siblings
// the routes the provider wrote on each key, to test whether a piece cut at a
// mark is something the provider also wrote as a reading of its own
const byKey = new Map();
for (const r of rows) { if (!byKey.has(r.key)) byKey.set(r.key, new Set()); byKey.get(r.key).add(r.route.trim().toLowerCase()); }
const sameMarkBounds = (s, i, ch, ctx) => {
  // the run on either side of this occurrence, bounded by the same mark at the same depth, or the route's edges
  let a = 0, z = s.length;
  for (let k = i - 1; k >= 0; k -= 1) if (s[k] === ch && ctx.depth[k] === ctx.depth[i]) { a = k + 1; break; }
  for (let k = i + 1; k < s.length; k += 1) if (s[k] === ch && ctx.depth[k] === ctx.depth[i]) { z = k; break; }
  return [s.slice(a, i), s.slice(i + 1, z)];
};
// 0 = no hit; "head" = the matching piece runs from the route's first character; "other" = any other piece
const siblingHit = (r, s, i, ch, ctx) => {
  const sib = byKey.get(r.key); const self = s.trim().toLowerCase();
  const [L, R] = sameMarkBounds(s, i, ch, ctx);
  const hit = (p) => { const t = p.trim().toLowerCase(); return t && t !== self && sib.has(t); };
  if (hit(L) && s.startsWith(L)) return "head";
  if (hit(L) || hit(R)) return "other";
  return 0;
};

// ---------------------------------------------------------------- census
const routeMarks = {}, defMarks = {};
const shapes = {}; // mark -> shape -> {count, routes:Set, regions:{}, examples:[]}
const UNEXPLAINED = /\.(unclassified|other)$/u;
for (const r of rows) {
  const s = r.route;
  for (const [text, tbl] of [[s, routeMarks], [r.def, defMarks]]) {
    const seen = new Set();
    for (const ch of text) if (isMark(ch)) { tbl[ch] ||= { occurrences: 0, rows: 0 }; tbl[ch].occurrences += 1; if (!seen.has(ch)) { seen.add(ch); tbl[ch].rows += 1; } }
  }
  const ctx = scan(s);
  // iterate by UTF-16 index but marks here are all BMP
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (!isMark(ch)) continue;
    const sh = shapeOf(ch, s, i, ctx);
    const m = (shapes[ch] ||= {});
    const e = (m[sh] ||= { count: 0, routes: new Set(), regions: {}, examples: [], sibling_hits: 0, sibling_head: 0, sibling_examples: [] });
    e.count += 1; e.routes.add(r.key + "\u0001" + s);
    const sh2 = siblingHit(r, s, i, ch, ctx);
    if (sh2) { e.sibling_hits += 1; if (sh2 === "head") e.sibling_head += 1; if (e.sibling_examples.length < 4) e.sibling_examples.push(`${r.key}: ${win(s, i)}`); }
    inc(e.regions, regionOf(ctx, i));
    if (e.examples.length < 6 && !e.examples.some((x) => x.startsWith(r.key + ": "))) e.examples.push(`${r.key}: ${win(s, i)}`);
  }
}

// closed set from inventory
const invP = inventory.providers.find((p) => M_IDS.includes(p.provider));
const invMarks = Object.fromEntries(invP.marks.map((m) => [m.mark, m]));

// ---------------------------------------------------------------- engine (today) vs declaration
// today's display path, as the engine and gloss-store-v1 run it: a route packs
// senses at depth-0 ';' (orphan closers inert; pieces must rejoin), each sense
// divides under sense-split-rule-v3 (imported), a damaged sense neither prints
// nor pools, and a page citation ("p. 323") is never offered as a reading.
const packSplit = (t) => {
  const out = []; let start = 0, d = 0;
  for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === ";" && d === 0) { out.push(t.slice(start, i)); start = i + 1; } }
  out.push(t.slice(start));
  if (out.join(";") !== t) return [t.trim()].filter(Boolean);
  return out.map((x) => x.trim()).filter(Boolean);
};
let pageCitationFiltered = 0;
const engineReadings = (text) => {
  const out = []; let damagedSenses = 0;
  for (const sense of packSplit(text)) {
    const r = senseSplit(sense);
    if (r.damaged) { damagedSenses += 1; continue; }
    const kept = r.readings.filter((p) => !/^p{1,2}\.\s*\d/u.test(p));
    if (kept.length !== r.readings.length) pageCitationFiltered += 1;
    out.push(...(kept.length ? kept : r.readings));
  }
  return { readings: out, damagedSenses };
};
const commaOnly = (text) => { const r = senseSplit(text); return { readings: r.damaged ? [] : r.readings, damaged: r.damaged }; };

// the declaration: no mark of this provider separates readings; every route ships whole
// (the rule in code first; after declaration.json is written it is read back
// and every comparison is run again from the file, and must come out the same)
let declared = { marks: Object.fromEntries(Object.keys(routeMarks).map((m) => [m, {}])), separates_on: null };
let declaredMarks = new Set(Object.keys(declared.marks));
const declarationReadings = (text) => {
  const unknownMarks = [...new Set([...text].filter((c) => isMark(c) && !declaredMarks.has(c)))];
  if (!declared.separates_on) return { readings: [text], unknownMarks };
  throw new Error("this pilot's declaration separates on nothing; a separates_on was found");
};

const sameList = (a, b) => a.length === b.length && a.every((x, k) => x === b[k]);
function compare(kindFn, label) {
  const tally = { routes: rows.length, same_division: 0, v3_divides_where_declaration_keeps_whole: 0, declaration_divides_where_v3_keeps_whole: 0, divided_differently: 0, v3_prints_nothing_where_declaration_prints_whole: 0 };
  const sub = {}; const ex = {}; const changes = [];
  let unknownMarkRoutes = 0;
  for (const r of rows) {
    const D = declarationReadings(r.route); if (D.unknownMarks.length) unknownMarkRoutes += 1;
    const E = kindFn(r.route);
    const dWhole = D.readings.length === 1, eWhole = E.readings.length === 1;
    let kind;
    if (sameList(E.readings.map((x) => x.trim()), D.readings.map((x) => x.trim()))) kind = "same_division";
    else if (E.readings.length === 0) kind = "v3_prints_nothing_where_declaration_prints_whole";
    else if (dWhole) kind = "v3_divides_where_declaration_keeps_whole";
    else if (eWhole) kind = "declaration_divides_where_v3_keeps_whole";
    else kind = "divided_differently";
    tally[kind] += 1;
    if (kind !== "same_division") {
      let why;
      if (E.readings.length === 0) why = "every sense held as damaged (unbalanced parentheses): v3 prints nothing";
      else {
        const senses = label === "engine" ? packSplit(r.route) : [r.route];
        const atSemi = label === "engine" && /;/u.test(r.route) && senses.length >= 1 && (senses.length > 1 || /;\s*$/u.test(r.route));
        const atComma = senses.some((p) => { const q = senseSplit(p); return !q.damaged && q.readings.length > 1; });
        const parts = [];
        if (atSemi) parts.push("';'");
        if (atComma) parts.push("','");
        why = `v3 divides at ${parts.join(" and ") || "(nothing)"}`;
        if (atComma) {
          const beside = senses.some((p) => { const q = senseSplit(p); return !q.damaged && q.readings.length > 1 && q.readings.includes(p.trim()); });
          const only = senses.some((p) => { const q = senseSplit(p); return !q.damaged && q.readings.length > 1 && !q.readings.includes(p.trim()); });
          why += beside && only ? " (rule 5 both ways)" : beside ? " (rule 5: gloss-shaped comma pieces printed beside the whole sense)" : " (every comma piece gloss-shaped: the sense is printed only as its pieces)";
        }
        if (E.damagedSenses) why += ", and holds a damaged sense back";
        if (/;\s*$/u.test(r.route) && senses.length === 1) why += " (the route ends on ';': the empty piece after it is dropped)";
      }
      inc(sub, `${kind} :: ${why}`);
      // provider text only inside one 60-character window of the route; a pill
      // beyond the window is described by where it starts and how long it is
      const W = 60, shown = r.route.slice(0, W);
      const pills = E.readings.map((x) => { const at = r.route.indexOf(x); return at >= 0 && at + x.length <= W ? `«${x}»` : `[pill at char ${at}, ${x.trim().split(/\s+/u).length} words]`; });
      (ex[`${kind} :: ${why}`] ||= []).length < 6 && ex[`${kind} :: ${why}`].push(`${r.key}: «${shown}${r.route.length > W ? "…" : ""}» ⇒ v3 prints ${E.readings.length}: ${pills.join(" | ")} ; declaration prints 1 (the route whole)`);
      if (label === "engine") changes.push({ key: r.key, route_window: shown + (r.route.length > W ? "…" : ""), route_length: r.route.length, v3_pills: E.readings.length, v3_pill_word_counts: E.readings.map((x) => x.trim().split(/\s+/u).length), declaration_pills: D.readings.length, kind, why });
    }
  }
  return { tally, by_cause: sub, examples: ex, unknown_mark_routes: unknownMarkRoutes, changes };
}
const engineCmp = compare((t) => engineReadings(t), "engine");
const commaCmp = compare((t) => commaOnly(t), "comma");

// what today's card prints from this provider that the declaration does not print alone
const v3Pieces = { total_pieces_not_the_route: 0, opens_with_note_marker: 0, opens_with_label: 0, one_word: 0, other: 0 };
const v3PieceFreq = {};
for (const r of rows) {
  const E = engineReadings(r.route).readings;
  if (E.length === 1 && E[0].trim() === r.route.trim()) continue;
  for (const p of E) {
    if (p.trim() === r.route.trim()) continue;
    v3Pieces.total_pieces_not_the_route += 1;
    if (byKey.get(r.key).has(p.trim().toLowerCase())) v3Pieces.also_written_as_a_route_on_the_key = (v3Pieces.also_written_as_a_route_on_the_key || 0) + 1;
    inc(v3PieceFreq, p);
    if (/^[◄►≈]/u.test(p)) v3Pieces.opens_with_note_marker += 1;
    else if (/^(hence|therefore|possibly|probably|perhaps|literally|or|either|alternatively)\b[,:]?/iu.test(p) || /^=/u.test(p)) v3Pieces.opens_with_label += 1;
    else if (!/\s/u.test(p.trim())) v3Pieces.one_word += 1;
    else v3Pieces.other += 1;
  }
}
const v3TopPieces = Object.entries(v3PieceFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([t, n]) => `${n} × ${t.slice(0, 60)}`);

// reading counts printed
let engineReadingTotal = 0, declReadingTotal = rows.length;
for (const r of rows) engineReadingTotal += engineReadings(r.route).readings.length;

// ---------------------------------------------------------------- what the open questions would move
const oq = { packed_renderings_complete: new Set(), packed_renderings_elliptic: new Set(), coordinate_modifiers: new Set(), short_route_appositive: new Set(), alternative_label_depth0: new Set(), alternative_label_in_parentheses: new Set(), or_clause_semicolon: new Set(), name_variant: new Set(), gt: new Set(), interjection: new Set(), routes_with_head_note_or_further_clause_semicolon: new Set() };
for (const r of rows) {
  const s = r.route, ctx = scan(s);
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i]; if (!isMark(ch)) continue;
    const sh = shapeOf(ch, s, i, ctx);
    if (sh === "comma.short_route_packed_renderings_complete") oq.packed_renderings_complete.add(r.key + "\u0001" + s);
    if (sh === "comma.short_route_packed_renderings_elliptic") oq.packed_renderings_elliptic.add(r.key + "\u0001" + s);
    if (sh === "comma.short_route_coordinate_modifiers") oq.coordinate_modifiers.add(r.key + "\u0001" + s);
    if (sh === "comma.short_route_appositive") oq.short_route_appositive.add(r.key + "\u0001" + s);
    if (sh === "semicolon.before_alternative_label" || sh === "comma.before_alternative_label") oq.alternative_label_depth0.add(r.key + "\u0001" + s);
    if (sh === "semicolon.before_or_clause") oq.or_clause_semicolon.add(r.key + "\u0001" + s);
    if (sh === "comma.short_route_name_variant") oq.name_variant.add(r.key + "\u0001" + s);
    if (sh === "paren.open.alternative_wording") oq.alternative_label_in_parentheses.add(r.key + "\u0001" + s);
    if (sh === "gt.literal_to_figurative") oq.gt.add(r.key + "\u0001" + s);
    if (sh === "exclamation.between_interjections") oq.interjection.add(r.key + "\u0001" + s);
    if (sh === "semicolon.before_note_marker" || sh === "semicolon.between_note_items" || sh === "semicolon.head_to_further_clause") oq.routes_with_head_note_or_further_clause_semicolon.add(r.key + "\u0001" + s);
  }
  if (/^(either|or|alternatively)\s*:/iu.test(s) || /[.:=]\s*(either|or)\s*:/iu.test(s) || /\.\s+Or alternatively/u.test(s)) oq.alternative_label_depth0.add(r.key + "\u0001" + s);
}
const listOf = (set, n = 1e9) => [...set].slice(0, n).map((x) => { const [k, t] = x.split("\u0001"); return `${k}: ${t.slice(0, 60)}`; });

// ---------------------------------------------------------------- write
const markOrder = Object.keys(routeMarks).sort((a, b) => routeMarks[b].occurrences - routeMarks[a].occurrences);
const marksOut = markOrder.map((ch) => {
  const sh = shapes[ch] || {};
  const list = Object.entries(sh).sort((a, b) => b[1].count - a[1].count).map(([k, v]) => {
    const info = SHAPES[k];
    if (!info) throw new Error(`shape ${k} has no meaning in shape-meanings.mjs`);
    return {
      shape: k, test: info.test, count: v.count, routes: v.routes.size, means: info.means, divides_readings: info.divides,
      ...(info.note ? { note: info.note } : {}),
      regions: v.regions,
      piece_also_a_route_on_the_key: v.sibling_hits, ...(v.sibling_hits ? { of_which_the_piece_is_the_route_head: v.sibling_head } : {}), ...(v.sibling_examples.length ? { piece_also_a_route_examples: v.sibling_examples } : {}),
      examples: v.examples,
    };
  });
  const unexplained = list.filter((x) => UNEXPLAINED.test(x.shape)).reduce((a, b) => a + b.count, 0);
  const sumShapes = list.reduce((a, b) => a + b.count, 0);
  return {
    mark: ch, codepoint: "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    occurrences: routeMarks[ch].occurrences, routes: routeMarks[ch].rows,
    definition_text: defMarks[ch] ? { occurrences: defMarks[ch].occurrences, rows_carrying_it: defMarks[ch].rows } : null,
    inventory: invMarks[ch] ? { occurrences: invMarks[ch].occurrences, routes_carrying_it: invMarks[ch].routes_carrying_it, agrees: invMarks[ch].occurrences === routeMarks[ch].occurrences && invMarks[ch].routes_carrying_it === routeMarks[ch].rows } : null,
    shapes_sum_equals_occurrences: sumShapes === routeMarks[ch].occurrences,
    unexplained,
    shapes: list,
  };
});

const regionCounts = { whole: 0, slice: 0, absent: 0 };
for (const r of rows) { if (r.route === r.def) regionCounts.whole += 1; else if (r.def.includes(r.route)) regionCounts.slice += 1; else regionCounts.absent += 1; }
const registers = { marker_free_routes: 0, short_marker_free_comma_routes: 0, routes_with_note_marker: 0, routes_with_label_colon: 0, routes_with_no_mark: 0 };
for (const r of rows) {
  const ctx = scan(r.route);
  if (ctx.markerFree) registers.marker_free_routes += 1;
  if (ctx.shortRegister) registers.short_marker_free_comma_routes += 1;
  if (/[◄►≈]/u.test(r.route)) registers.routes_with_note_marker += 1;
  if (/:/u.test(r.route)) registers.routes_with_label_colon += 1;
  if (![...r.route].some(isMark)) registers.routes_with_no_mark += 1;
}
const rk = ranked.sources.findIndex((x) => x.source_key === SOURCE_KEY);
// what each note marker opens: its next two words, counted
const openings = { "◄": {}, "►": {}, "≈": {} };
for (const r of rows) { const s2 = r.route; for (let i = 0; i < s2.length; i += 1) if (openings[s2[i]]) { const m2 = s2.slice(i + 1).match(/^\s*([^\s;,]+(?:\s+[^\s;,]+)?)/u); inc(openings[s2[i]], m2 ? m2[1] : "<end>"); } }
const census = {
  schema: "MARK_LEDGER_CENSUS_V1 (pilot)",
  source_key: SOURCE_KEY, m_ids: M_IDS, routes: rows.length, emitted_on: "2026-10-31",
  read_from: { routes: FILE, inventory: join(ROOT, "mark-inventory-2026-10-31.json"), store: inventory.emitted_from, engine_rule: "sense-split-rule-v3-a-comma-divides-glosses-never-a-sentence (ghp/reader/tools/sense-split-v1.mjs, imported), behind the ';' pack split of ghp/reader/tools/gloss-store-v1.mjs and the engine" },
  ranked: { ...ranked.sources[rk], rank_by_routes: rk + 1, of_source_keys: ranked.sources.length, total_routes: ranked.total_routes },
  distinct_keys: new Set(rows.map((r) => r.key)).size,
  rows_by_year: rows.reduce((o, r) => (inc(o, r.year), o), {}),
  route_region: regionCounts,
  registers,
  closed_set: {
    route_text: Object.keys(routeMarks), definition_text: Object.keys(defMarks), inventory: invP.marks.map((m) => m.mark),
    agrees_with_inventory: Object.keys(routeMarks).length === invP.marks.length && invP.marks.every((m) => routeMarks[m.mark] && routeMarks[m.mark].occurrences === m.occurrences && routeMarks[m.mark].rows === m.routes_carrying_it),
    distinct: Object.keys(routeMarks).length,
    occurrences: Object.values(routeMarks).reduce((a, b) => a + b.occurrences, 0),
  },
  shapes_total: marksOut.reduce((a, m) => a + m.shapes.length, 0),
  unexplained_total: marksOut.reduce((a, m) => a + m.unexplained, 0),
  marks: marksOut,
  note_marker_openings: Object.fromEntries(Object.entries({ "◄": 0, "►": 0, "≈": 0 }).map(([c]) => [c, Object.fromEntries(Object.entries(openings[c] || {}).sort((a, b) => b[1] - a[1]).slice(0, 15))])),
  open_question_sets: Object.fromEntries(Object.entries(oq).map(([k, v]) => [k, { routes: v.size, all: v.size <= 80 ? listOf(v) : listOf(v, 12) }])),
};
writeFileSync(join(HERE, "census.json"), JSON.stringify(census, null, 1) + "\n");

const compareOut = {
  schema: "MARK_LEDGER_COMPARE_V1 (pilot)", source_key: SOURCE_KEY, emitted_on: "2026-10-31",
  declaration: "declaration.json in this folder: no mark separates readings; every route ships whole (separates_on null)",
  engine_display_path: {
    what: "today's card: ';' at parenthesis depth 0 packs senses (gloss-store-v1.mjs and the engine's senseSplit), each sense then divides under sense-split-rule-v3 (sense-split-v1.mjs senseSplit, imported), a sense held as damaged neither prints nor pools, a page citation is never a reading",
    ...engineCmp.tally, by_cause: engineCmp.by_cause, examples: engineCmp.examples,
    readings_printed: { v3: engineReadingTotal, declaration: declReadingTotal },
    v3_pieces_that_are_not_the_route: v3Pieces,
    v3_most_frequent_pieces: v3TopPieces,
    page_citation_filter_fired: pageCitationFiltered,
    declaration_unknown_mark_routes: engineCmp.unknown_mark_routes,
  },
  sense_split_alone: {
    what: "senseSplit from sense-split-v1.mjs applied to the whole route text, with no ';' pack split (the literal function); a damaged field counts as printing nothing",
    ...commaCmp.tally, by_cause: commaCmp.by_cause, examples: commaCmp.examples,
  },
};
writeFileSync(join(HERE, "compare.json"), JSON.stringify(compareOut, null, 1) + "\n");
writeFileSync(join(HERE, "changes-vs-v3.jsonl"), engineCmp.changes.map((c) => JSON.stringify(c)).join("\n") + "\n");


// ---------------------------------------------------------------- the declaration, from the census
const fmt = (n) => Number(n).toLocaleString("en-US");
const M = Object.fromEntries(marksOut.map((m) => [m.mark, m]));
const shapeCount = (mark, shape) => ((M[mark] && M[mark].shapes.find((x) => x.shape === shape)) || { count: 0 }).count;
const shapeRoutes = (mark, shape) => ((M[mark] && M[mark].shapes.find((x) => x.shape === shape)) || { routes: 0 }).routes;
const sib = (mark) => (M[mark] ? M[mark].shapes.reduce((a, x) => a + x.piece_also_a_route_on_the_key, 0) : 0);
const sibHead = (mark) => (M[mark] ? M[mark].shapes.reduce((a, x) => a + (x.of_which_the_piece_is_the_route_head || 0), 0) : 0);
const sibShape = (mark, shape) => ((M[mark] && M[mark].shapes.find((x) => x.shape === shape)) || { piece_also_a_route_on_the_key: 0 }).piece_also_a_route_on_the_key;
const dividing = (mark) => (M[mark] ? M[mark].shapes.filter((x) => x.divides_readings) : []);
const divSum = (mark) => dividing(mark).reduce((a, x) => a + x.count, 0);
const regionsOf = (mark) => { const o = {}; for (const x of (M[mark] || { shapes: [] }).shapes) for (const [k, v] of Object.entries(x.regions)) inc(o, k, v); return o; };
const markEntry = (mark, base) => {
  const m = M[mark];
  const out = {
    means: base.means,
    governs: m.occurrences,
    routes: m.routes,
    divides_readings: divSum(mark) === 0 ? "never" : `in meaning, at ${fmt(divSum(mark))} of ${fmt(m.occurrences)} occurrences (${dividing(mark).map((x) => `${x.shape} ${fmt(x.count)}`).join("; ")}); not separated`,
    shape_occurrences: Object.fromEntries(m.shapes.map((x) => [x.shape, x.count])),
    regions: regionsOf(mark),
    ...(base.region_dependent ? { region_dependent: base.region_dependent } : { region_dependent: false }),
    evidence: base.evidence,
    falsifier: base.falsifier,
  };
  if (base.extra) Object.assign(out, base.extra);
  return out;
};
const gtSiblings = shapeCount(">", "gt.literal_to_figurative") ? M[">"].shapes[0].piece_also_a_route_on_the_key : 0;
// ">" glosses: does the same key carry an idiom definition written "literally: ...; hence"?
let gtWithLiteralDef = 0;
const litDefKeys = new Set(rows.filter((r) => /^lit[a-z]*ly[:,]/iu.test(r.route) && /hence|therefore|=/u.test(r.route)).map((r) => r.key));
for (const r of rows) if (r.route.includes(" > ") && litDefKeys.has(r.key)) gtWithLiteralDef += 1;
let semiAfterMan = 0;
for (const r of rows) { const s2 = r.route; for (let i = 0; i < s2.length; i += 1) if (s2[i] === ";" && /(^|\s)man$/u.test(s2.slice(0, i))) semiAfterMan += 1; }
const shortNoMarkGlosses = rows.filter((r) => ![...r.route].some(isMark) && r.route.trim().split(/\s+/u).length <= 4).length;

const quoteOpens = ["\"", "“", "”"].reduce((a, c) => a + shapeCount(c, "quote.open"), 0);
const quoteCloses = ["\"", "“", "”"].reduce((a, c) => a + shapeCount(c, "quote.close"), 0);
const topOpen = (c, n = 7) => Object.entries(openings[c]).sort((a, b) => b[1] - a[1]).slice(0, n).map(([t, k]) => `'${t}' ${fmt(k)}`).join(", ");
const commaHeadOther = M[","].shapes.filter((x) => x.shape !== "comma.short_route_packed_renderings_complete").reduce((a, x) => a + (x.of_which_the_piece_is_the_route_head || 0), 0);
const T = {
  ";": { means: "Divides the parts of one SDBH record, never two readings: the head from a note (before ◄ ► ≈), one note item from the next, an idiom's literal rendering from its meaning ('literally: ...; hence: = ...'), a hedge ('meaning unsure') from the tentative definition, a label from the definition, the head from a further clause. One record describes one lexical meaning. The one exception is a second meaning the provider labels 'or:', 'either:' or 'alternatively', which divides in meaning and is not separated.",
    region_dependent: `Yes, in what it divides, not in whether it divides readings: in the head it closes the definition proper or its label (${fmt(regionsOf(";").head || 0)} occurrences); after a note marker it divides one note item from the next (${fmt(regionsOf(";").notes || 0)}). It never occurs in a marker-free route, by that region's definition.`,
    evidence: `${fmt(shapeCount(";", "semicolon.before_note_marker"))} of ${fmt(M[";"].occurrences)} stand immediately before ◄, ► or ≈; ${fmt(shapeCount(";", "semicolon.before_derived_meaning"))} before 'hence'/'therefore'; ${fmt(shapeCount(";", "semicolon.between_note_items"))} between note items after a marker; ${fmt(shapeCount(";", "semicolon.before_hedged_meaning"))} before a hedge ('possibly', 'probably'). ${fmt(semiAfterMan)} follow the head 'man' of a name entry ('man; ◄ son of Heman; ► temple singer; time of king David'), which today's card prints as four pills: 'man', '◄ son of Heman', '► temple singer', 'time of king David'. ${fmt(sib(";"))} of ${fmt(M[";"].occurrences)} occurrences have a piece on either side that the provider also writes as a route of its own on the same key.`,
    falsifier: `A ';' (not an alternative label) whose piece on either side the provider also writes as a route of its own on the same key, i.e. treats as a reading: ${fmt(sib(";"))} today (census: piece_also_a_route_on_the_key). In ${fmt(sibHead(";"))} of them the piece is the record's head, which the provider also writes as a separate gloss or a sister definition ('man', 'hill', 'terebinth', 'one of the city gates of Jerusalem'): the head is attested as a reading there, but the record still joins it to its notes. The other ${fmt(sib(";") - sibHead(";"))} is a gloss the provider appended after ';' to a definition it also writes alone ('...so that it can move or slip; to waver' beside a route 'to waver'): a provider slip, kept whole. A ';' between two pieces that each read as a whole definition of a different meaning with no 'or:'/'either:'/'alternatively' label would also falsify it; the census found none it could name, and owner question 2 lists the ${fmt(shapeCount(";", "semicolon.before_or_clause"))} unlabeled 'or'/'either' clauses for reading.` },
  ",": { means: "Punctuation of the provider's English: list commas, commas before conjunctions, appositions, clauses and modifiers inside one definition or one gloss. The provider writes separate glosses as separate routes, so a comma does not divide readings — except in a handful of short glosses where it packs two or three renderings into one route ('pain, trouble'; 'to be, become happy'), a second form of a name, or a labeled alternative. Those divide in meaning and are not separated.",
    region_dependent: `Yes: only in a short marker-free route (no ; ◄ ► ≈ = :, every comma piece at most four words, ${fmt(registers.short_marker_free_comma_routes)} routes) can a comma pack renderings; in the head and notes of a definition (${fmt((regionsOf(",").head || 0) + (regionsOf(",").notes || 0))} occurrences) and in longer marker-free routes it is prose.`,
    evidence: `${fmt(shapeCount(",", "comma.definition_prose"))} prose commas in definitions, ${fmt(shapeCount(",", "comma.before_conjunction"))} before a conjunction, ${fmt(shapeCount(",", "comma.series_item") + shapeCount(",", "comma.series_item_closed_by_conjunction_without_comma"))} list commas, ${fmt(shapeCount(",", "comma.before_note_marker"))} before a note marker, ${fmt(shapeCount(",", "comma.short_route_appositive"))} appositions in short definitions ('descendant of Zerah, son of Simeon'). Packed renderings: ${fmt(shapeCount(",", "comma.short_route_packed_renderings_complete"))} complete ('pain, trouble') and ${fmt(shapeCount(",", "comma.short_route_packed_renderings_elliptic"))} elliptic ('to be, become happy'). ${fmt(shortNoMarkGlosses)} routes are a gloss of at most four words with no mark at all: the provider's ordinary way of giving one more reading is one more route. The owner ruled on 2026-10-30, of a UBS name entry cut at its commas: 'a comma in ubs doesnt mean different entrys'.`,
    falsifier: `A comma piece the provider also writes as a route of its own on the same key: ${fmt(sib(","))} occurrences today (census). ${fmt(sibShape(",", "comma.short_route_packed_renderings_complete"))} are packed renderings whose pieces are also glosses ('to go, to arrive' beside routes 'to go' and 'to arrive'; 'hemorrhoids, tumors, ulcers' beside 'tumors' and 'ulcers'): evidence for owner question 1. Of the other ${fmt(sib(",") - sibShape(",", "comma.short_route_packed_renderings_complete"))}, ${fmt(commaHeadOther)} are a definition's head before a comma-opened clause or note that the provider also writes alone ('one of the city gates of Jerusalem, ► used specifically by...'), and ${fmt(sib(",") - sibShape(",", "comma.short_route_packed_renderings_complete") - commaHeadOther)} are list members inside a definition that are also glosses ('wisdom, intelligence, or proficiency' beside a route 'intelligence').` },
  "◄": { means: "Opens a note of origin and context inside one definition: whom the referent descends from or belongs to, where it is, what it is made of or caused by, what it is like ('son of', 'tribe of', 'territory of', 'made of', 'caused by', 'as if'). Never a reading of its own.",
    evidence: `${fmt(M["◄"].occurrences)} occurrences in ${fmt(M["◄"].routes)} routes: ${fmt(shapeCount("◄", "back_arrow.after_semicolon"))} after ';', ${fmt(shapeCount("◄", "back_arrow.after_comma"))} after ',', ${fmt(shapeCount("◄", "back_arrow.inline_without_punctuation"))} mid-sentence. Most frequent openings: ${topOpen("◄")}. Today's card prints ${fmt(v3Pieces.opens_with_note_marker)} pills that open with ◄, ► or ≈.`,
    falsifier: `A piece opened by ◄ that the provider also writes as a route of its own on the same key: ${fmt(sib("◄"))} today.` },
  "►": { means: "Opens a note of role, purpose and consequence inside one definition: what the referent did or was, what it is used for, what followed ('father of', 'king of', 'family head', 'used for', 'in order to', 'after exile'). Never a reading of its own.",
    evidence: `${fmt(M["►"].occurrences)} occurrences in ${fmt(M["►"].routes)} routes: ${fmt(shapeCount("►", "forward_arrow.after_semicolon"))} after ';', ${fmt(shapeCount("►", "forward_arrow.after_comma"))} after ',', ${fmt(shapeCount("►", "forward_arrow.inline_without_punctuation"))} mid-sentence. Most frequent openings: ${topOpen("►")}.`,
    falsifier: `A piece opened by ► that the provider also writes as a route of its own on the same key: ${fmt(sib("►"))} today.` },
  "≈": { means: "Opens a note of association and connotation inside one definition: what the referent is associated with, regarded as, or a symbol of ('associated with', 'regarded as', 'used figuratively'). Never a reading of its own.",
    evidence: `${fmt(M["≈"].occurrences)} occurrences in ${fmt(M["≈"].routes)} routes: ${fmt(shapeCount("≈", "approx.after_semicolon"))} after ';', ${fmt(shapeCount("≈", "approx.after_comma"))} after ','. Most frequent openings: ${topOpen("≈")}.`,
    falsifier: `A piece opened by ≈ that the provider also writes as a route of its own on the same key: ${fmt(sib("≈"))} today.` },
  ":": { means: "Closes a label: 'literally:', 'hence:', 'possibly:', 'meaning unsure:', 'or:', 'poetic language:'. The label and what follows are one record. Once, a volume:page number.",
    evidence: `${fmt(shapeCount(":", "colon.before_definition_equals"))} of ${fmt(M[":"].occurrences)} are followed by '='; ${fmt(shapeCount(":", "colon.after_literally"))} follow 'literally'; ${fmt(shapeCount(":", "colon.introduces_explanation"))} introduce an explanation or named item.`,
    falsifier: `A ':' whose text before it (the label) the provider also writes as a route on the same key: ${fmt(sib(":"))} today, all in routes where the provider wrote ':' for ';' before 'hence' ('literally: to come up: hence: = ...') and also writes the literal rendering as a gloss route; a provider slip, read as the ';' it stands for, kept whole.` },
  "=": { means: "Opens the definition proper after a label or literal rendering ('hence: = action by which...'), or, in a gloss or aside, gives what a phrase means ('father's house = family', '(= delay)'). Never between two readings.",
    evidence: `${fmt(shapeCount("=", "equals.after_label_colon"))} of ${fmt(M["="].occurrences)} follow a label colon, ${fmt(shapeCount("=", "equals.after_semicolon"))} follow ';'.`,
    falsifier: `An '=' whose two sides the provider also writes as two routes on the same key: ${fmt(sib("="))} occurrences have one side so written (the definition after '=' also stands as a route without its 'literally ... hence' head): the provider writes the meaning both ways, and the record with the head is still one record.` },
  "(": { means: "An aside or notation inside one reading: the open slot of an idiom ('(one's)', '(someone)'), optional words, an alternative word ('(or: time)'), a date, a citation ('(ABD)'), a scientific name, an equivalence ('(= delay)'). Never a scope over alternative renderings as in Strong's.",
    evidence: `${fmt(M["("].occurrences)} openers: ${fmt(shapeCount("(", "paren.open.slot_placeholder"))} slot placeholders, ${fmt(shapeCount("(", "paren.open.aside_or_optional_words"))} asides or optional words, ${fmt(shapeCount("(", "paren.open.alternative_wording"))} alternative wordings, ${fmt(shapeCount("(", "paren.open.number_or_date"))} numbers or dates, ${fmt(shapeCount("(", "paren.open.reference_siglum"))} citations. ${fmt(shapeCount(",", "comma.in_parentheses"))} commas stand inside parentheses.`,
    falsifier: `A comma inside parentheses dividing renderings that distribute over a head (Strong's 'bring (forth, in, into, to pass)'): measured as a comma inside parentheses whose piece the provider also writes as a route on the key: ${fmt(shapeCount(",", "comma.in_parentheses") ? M[","].shapes.find((x) => x.shape === "comma.in_parentheses").piece_also_a_route_on_the_key : 0)} today.`,
    extra: { unbalanced: { closer_with_nothing_open: shapeCount(")", "paren.close_with_nothing_open"), opener_never_closed: shapeCount("(", "paren.open_never_closed") } } },
  ")": { means: "Closes the aside. A closer with nothing open is the provider's typo ('to shake (one's) head)') and is inert.",
    evidence: `${fmt(M[")"].occurrences)} closers; ${fmt(shapeCount(")", "paren.close_with_nothing_open"))} close nothing.`,
    falsifier: "As for '('." },
  "'": { means: "The apostrophe of English spelling (possessive 's, possessive after a sibilant), and once a pair of single quotes around a quoted word. Inside one word.",
    evidence: `${fmt(shapeCount("'", "apostrophe.possessive_s"))} possessive 's (incl. ${fmt(shapeCount("(", "paren.open.slot_placeholder"))} slot groups like '(one's)'), ${fmt(shapeCount("'", "apostrophe.possessive_after_sibilant"))} after a sibilant ('Moses' assistant').`,
    falsifier: "A ' with a space on both sides (a quote standing between two readings): 0 today." },
  "’": { means: "The typographic apostrophe of a possessive ('earth’s surface').", evidence: `${fmt(M["’"].occurrences)} occurrences, all possessive.`, falsifier: "A ’ not touching a letter: 0 today." },
  "-": { means: "Joins one compound word or name ('mother-in-law', 'Hazar-Addar'), writes a numeric range ('841-835'), or doubled as '--' sets off an inserted phrase. Inside one reading.",
    evidence: `${fmt(shapeCount("-", "hyphen.compound_join"))} compound joins, ${fmt(shapeCount("-", "hyphen.numeric_range"))} ranges, ${fmt(shapeCount("-", "hyphen.double_hyphen_dash"))} halves of '--', ${fmt(shapeCount("-", "hyphen.spaced_dash"))} spaced dashes.`,
    falsifier: "A hyphen at the head of a route or of a list item as in Strong's '-tering' attachments: 0 today (no shape 'attach at the stem' occurs)." },
  "/": { means: "Two words for one slot inside one phrase: 'and/or', 'his/her', a month span 'February/March', a double name 'Gideon/Jerubbaal', a category pair 'state/process', a double year '870/69'. Inside one reading.",
    evidence: `${fmt(shapeCount("/", "slash.and_or"))} and/or, ${fmt(shapeCount("/", "slash.pronoun_pair"))} pronoun pairs, ${fmt(shapeCount("/", "slash.word_pair"))} word pairs, ${fmt(shapeCount("/", "slash.number_pair"))} year pairs, ${fmt(shapeCount("/", "slash.spaced_between_phrases"))} spaced.`,
    falsifier: `A '/' whose two sides the provider also writes as routes on the same key: ${fmt(sib("/"))} today ('state/process by which ...' beside the same definition with one of the two words).` },
  ".": { means: "Abbreviation, decimal point, '...' standing for the open slot of a frame gloss ('either ... or'), or a sentence end inside a long definition. Inside one reading.",
    evidence: `${fmt(shapeCount(".", "period.abbreviation"))} abbreviations, ${fmt(shapeCount(".", "period.decimal"))} decimals, ${fmt(shapeCount(".", "period.ellipsis"))} in '...', ${fmt(shapeCount(".", "period.route_final"))} route-final, ${fmt(shapeCount(".", "period.sentence_break"))} sentence breaks.`,
    falsifier: "A sentence break whose two sentences describe two different meanings: one today reads so, 'booths. Or alternatively, olive tree' (עץ), counted in owner question 2." },
  ">": { means: "In an idiom's gloss, leads from the literal rendering to what the idiom means ('to sanctify (one's) name > to show (one's) greatness'): one gloss for one lexical meaning, paired the way the provider's definitions pair 'literally: ...; hence: = ...'.",
    evidence: `${fmt(M[">"].occurrences)} occurrences, all ' > ' in marker-free routes; ${fmt(gtWithLiteralDef)} of them stand on a key that also carries a 'literally: ...; hence ...' definition.`,
    falsifier: `A '>' whose side the provider also writes as a gloss route on the same key: ${fmt(gtSiblings)} of ${fmt(M[">"].occurrences)} today ('to hunt down > to oppress' beside a route 'to oppress'). Owner question 3.` },
  "\"": { means: "Quotes a rendering inside one reading: a name's meaning ('\"Valley of Vision\"'), a literal translation, a cited term.", evidence: `${fmt(shapeCount("\"", "quote.open"))} open, ${fmt(shapeCount("\"", "quote.close"))} close (one route opens with “ and closes with \").`, falsifier: "A quoted span that is the whole of a reading the card should print alone: the quote marks stay with it, so nothing here separates on them." },
  "|": { means: "Formatting code carried from the source: '|i' turns italics on and '|i*' turns them off around a scientific name. Inside one reading.", evidence: `${fmt(shapeCount("|", "pipe.italic_open"))} openers and ${fmt(shapeCount("|", "pipe.italic_close"))} closers, every one paired.`, falsifier: "An unpaired '|i' or '|i*': 0 today." },
  "*": { means: "The last character of the italics-off code '|i*'.", evidence: `${fmt(M["*"].occurrences)} occurrences, every one in '|i*'.`, falsifier: "A '*' outside '|i*': 0 today." },
  "?": { means: "The gloss is uncertain or is itself a question ('tunic?', 'really?', '(= Shunem?)').", evidence: `${fmt(M["?"].occurrences)} occurrences.`, falsifier: "A '?' followed by another rendering: 0 today." },
  "+": { means: "Adds the typical instrument or manner to an action inside one definition ('+ with a sharp-bladed instrument').", evidence: `${fmt(M["+"].occurrences)} occurrences, all ' + '.`, falsifier: "A '+' joining two glosses: 0 today." },
  "!": { means: "Ends an interjection ('hey!'); where one interjection follows another in the same gloss route ('come on! hey!', 'brother! alas!') it divides in meaning and is not separated.", evidence: `${fmt(M["!"].occurrences)} occurrences in ${fmt(M["!"].routes)} routes; ${fmt(shapeCount("!", "exclamation.between_interjections"))} stand between two interjections.`, falsifier: `A '!' followed by a further rendering in a definition route (not a marker-free gloss): ${fmt(M["!"].shapes.filter((x) => x.shape === "exclamation.between_interjections").reduce((a, x) => a + (x.regions.head || 0) + (x.regions.notes || 0), 0))} today.` },
  "׃": { means: "A sof pasuq typed where the provider's ';' stands before a note ('son of Judah׃ ►').", evidence: `${fmt(M["׃"].occurrences)} occurrences, every one before a note marker.`, falsifier: "A sof pasuq not before a note marker: 0 today." },
  "“": { means: "Opens a quoted phrase.", evidence: `${fmt(M["“"].occurrences)} occurrences.`, falsifier: `An unpaired quotation mark: openers ${fmt(quoteOpens)} and closers ${fmt(quoteCloses)} across ASCII and curly marks today.` },
  "”": { means: "Closes a quoted phrase.", evidence: `${fmt(M["”"].occurrences)} occurrences.`, falsifier: "As for '“'." },
  "[": { means: "Opens a cross-reference to a lettered sense or homonym ('[a]').", evidence: `${fmt(M["["].occurrences)} occurrences, all '[a]' or '[b]'.`, falsifier: "Square brackets holding a supplied English word: 0 today." },
  "]": { means: "Closes it.", evidence: `${fmt(M["]"].occurrences)} occurrences.`, falsifier: "As for '['." },
  "־": { means: "The maqaf of a cited Hebrew compound.", evidence: `${fmt(M["־"].occurrences)} occurrences, all between Hebrew letters.`, falsifier: "A maqaf outside a cited Hebrew word: 0 today." },
  "–": { means: "A range of numbers.", evidence: `${fmt(M["–"].occurrences)} occurrences, all between digits.`, falsifier: "A dash between words, standing between two readings: 0 today." },
  "‑": { means: "A range of numbers (non-breaking hyphen).", evidence: `${fmt(M["‑"].occurrences)} occurrence, between digits.`, falsifier: "As for '–'." },
  "…": { means: "The open slot of a correlative gloss ('both … and').", evidence: `${fmt(M["…"].occurrences)} occurrence.`, falsifier: "An ellipsis between two complete renderings: 0 today." },
};
const POINTS = Object.keys(routeMarks).filter((c) => /[֑-ׇֽֿׁׂׅׄ]/u.test(c));
for (const c of POINTS) T[c] = { means: "A Hebrew vowel point, dagesh or shin/sin dot inside a Hebrew word the definition cites ('see הַקָּטָן'): part of the letters, not punctuation.", evidence: `${fmt(M[c].occurrences)} occurrences in ${fmt(M[c].routes)} routes, every one inside a cited Hebrew word.`, falsifier: "A point standing on no Hebrew letter: 0 today." };
for (const c of Object.keys(routeMarks)) if (!T[c]) throw new Error(`mark ${c} has no declaration text`);

const marksDecl = Object.fromEntries(Object.keys(routeMarks).sort((a, b) => routeMarks[b].occurrences - routeMarks[a].occurrences).map((c) => [c, markEntry(c, T[c])]));
const dividingTotal = Object.keys(routeMarks).reduce((a, c) => a + divSum(c), 0);
const dividingRoutes = new Set();
for (const r of rows) { const s2 = r.route, ctx = scan(s2); for (let i = 0; i < s2.length; i += 1) { if (!isMark(s2[i])) continue; const sh = shapeOf(s2[i], s2, i, ctx); if (SHAPES[sh] && SHAPES[sh].divides) { dividingRoutes.add(r.key + "\u0001" + s2); break; } } }
const E = engineCmp.tally;
// ---------------------------------------------------------------- open questions, counted
const routesOfShape = (shape) => { const out = new Set(); for (const r of rows) { const s2 = r.route, ctx = scan(s2); for (let i = 0; i < s2.length; i += 1) if (isMark(s2[i]) && shapeOf(s2[i], s2, i, ctx) === shape) { out.add(r.key + "\u0001" + s2); break; } } return out; };
const depth0CommaPieces = (t) => { const out = []; let st = 0, d = 0; for (let i = 0; i < t.length; i += 1) { const c = t[i]; if (c === "(") d += 1; else if (c === ")") { if (d > 0) d -= 1; } else if (c === "," && d === 0) { out.push(t.slice(st, i)); st = i + 1; } } out.push(t.slice(st)); return out.map((x) => x.trim()).filter(Boolean); };
const qComplete = routesOfShape("comma.short_route_packed_renderings_complete");
const qElliptic = routesOfShape("comma.short_route_packed_renderings_elliptic");
const qName = routesOfShape("comma.short_route_name_variant");
const qBang = routesOfShape("exclamation.between_interjections");
const qAltSemi = routesOfShape("semicolon.before_alternative_label");
const qOrClause = routesOfShape("semicolon.before_or_clause");
const qGt = routesOfShape("gt.literal_to_figurative");
const qNoteSemi = routesOfShape("semicolon.before_note_marker");
let completePills = 0; for (const x of qComplete) completePills += depth0CommaPieces(x.split("\u0001")[1]).length;
const keyed = (set, n = 6) => [...set].slice(0, n).map((x) => { const [k, t] = x.split("\u0001"); return `${k}: «${t.slice(0, 60)}${t.length > 60 ? "…" : ""}»`; });
// heads: the text before the first ';' at depth 0 in routes where that ';' stands before a note marker
const headFreq = {};
for (const x of qNoteSemi) { const t = x.split("\u0001")[1]; const h = packSplit(t)[0]; inc(headFreq, h); }
const topHeads = Object.entries(headFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([h, n]) => `${n} × «${h.slice(0, 40)}»`);
const openQuestions = [
  { id: 1, question: "A gloss route that packs two or three renderings with a comma (or two interjections with '!'): one reading or several?",
    reading_a: { says: "One reading: the provider wrote one gloss, and the owner ruled that a comma in UBS does not mean different entries (declared here).", routes: new Set([...qComplete, ...qElliptic, ...qName, ...qBang]).size },
    reading_b: { says: "Several readings, separated where each piece stands alone ('pain' | 'trouble'; 'to go' | 'to arrive'), never where a piece leans on another's words ('to be, become happy'), which no separation can print without completing it.", routes_that_would_separate: qComplete.size, pills_they_would_print: completePills, routes_still_whole_because_elliptic: qElliptic.size, name_variant_routes: qName.size, interjection_routes: qBang.size },
    evidence: `The provider's ordinary second gloss is a second route (${fmt(shortNoMarkGlosses)} mark-free glosses of at most four words); in ${fmt(sibShape(",", "comma.short_route_packed_renderings_complete"))} of ${fmt(shapeCount(",", "comma.short_route_packed_renderings_complete"))} complete packed commas a piece is also written as its own route on the key ('to go, to arrive' beside 'to go' and 'to arrive').`,
    examples: [...keyed(qComplete, 4), ...keyed(qElliptic, 3), ...keyed(qName, 2), ...keyed(qBang, 1)] },
  { id: 2, question: "A definition that offers a labeled second meaning ('possibly: = musical term; or: = musical instrument; or: = melody'): one reading or one per alternative?",
    reading_a: { says: "One reading: the record is one entry for an uncertain word; the head ('meaning unknown') and any trailing note belong to every alternative (declared here).", routes: qAltSemi.size },
    reading_b: { says: "One reading per alternative, cut at the ';' before 'or:'/'either:'/'alternatively'; the shared head stays on the first piece and a trailing note on the last.", routes: qAltSemi.size, semicolons: shapeCount(";", "semicolon.before_alternative_label") },
    also: `${fmt(qOrClause.size)} routes add an unlabeled '; or ...' / '; either ...' clause (${fmt(shapeCount(";", "semicolon.before_or_clause"))} semicolons), mostly a further referent inside one definition ('...; or a person or deity who is referred to as such') and sometimes an alternative identification ('...; or possibly a thorny bush'); both readings would keep these whole unless the owner says otherwise. Labeled alternatives also occur after ',' (${fmt(shapeCount(",", "comma.before_alternative_label"))}) and once after a sentence break ('booths. Or alternatively, olive tree').`,
    examples: [...keyed(qAltSemi, 4), ...keyed(qOrClause, 2)] },
  { id: 3, question: "An idiom gloss 'literal > meaning' ('to see the light > to live'): one reading or two?",
    reading_a: { says: "One reading: the provider's one gloss for one lexical meaning, written as the literal phrase leading to its sense, as its definitions write 'literally: ...; hence: = ...' (declared here).", routes: qGt.size },
    reading_b: { says: "Two readings, the literal and the meaning, cut at ' > '.", routes: qGt.size, pills_they_would_print: qGt.size * 2 },
    evidence: `${fmt(gtWithLiteralDef)} of ${fmt(qGt.size)} stand on a key with a 'literally: ...; hence' definition; in ${fmt(gtSiblings)} one side is also written as its own gloss route on the key.`,
    examples: keyed(qGt, 4) },
  { id: 4, question: "A definition with notes ('man; ◄ son of Heman; ► temple singer; time of king David'): is the head a reading, and are the notes readings?",
    reading_a: { says: "The record is one reading and prints whole, notes included (declared here). No head is printed alone and no note is a pill.", routes: qNoteSemi.size },
    reading_b: { says: "The head is the reading and the notes are annotation: cut at the first ';' before ◄ ► ≈, print the head as the pill and the notes beside it as notes, not pills. This is a separation (both pieces kept), but it makes 'man' and 'town' readings of proper names.", routes: qNoteSemi.size, most_frequent_heads: topHeads },
    today: `Today's card goes further than either: it prints every ';' piece as a pill, ${fmt(v3Pieces.opens_with_note_marker)} pills that open with a note marker and ${fmt(v3Pieces.opens_with_label)} that open with a label ('hence: = ...', 'possibly: = ...'), and 'man' alone ${fmt(v3PieceFreq["man"] || 0)} times.`,
    examples: keyed(qNoteSemi, 4) },
];

const declaration = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  computed_by: "ledger.mjs in this folder (every number below is read from census.json / compare.json, which the same run writes)",
  providers: {
    [SOURCE_KEY]: {
      label: ranked.sources[rk].label,
      m_ids: M_IDS,
      routes: rows.length,
      declared_on: "2026-10-31",
      declared_from: `The entry's own structure, read across all ${fmt(rows.length)} routes on ${fmt(census.distinct_keys)} keys. In ${fmt(regionCounts.whole)} of ${fmt(rows.length)} rows the route is the whole definition, character for character: each route is one SDBH record, either one gloss ('to distribute') or one definition ('man; ◄ son of Heman; ► temple singer; time of king David'), and the provider gives a meaning several glosses by writing several routes. ${fmt(registers.routes_with_no_mark)} routes carry no mark at all; ${fmt(shortNoMarkGlosses)} are a mark-free gloss of at most four words. A definition has a head and, in ${fmt(registers.routes_with_note_marker)} routes, notes opened by ◄ (origin, context), ► (role, purpose) and ≈ (association); idioms are written 'literally: X; hence: = Y' (${fmt(shapeCount(";", "semicolon.before_derived_meaning"))} times). The closed set is ${census.closed_set.distinct} marks and ${fmt(census.closed_set.occurrences)} occurrences, agreeing with the inventory; every occurrence falls in exactly one of ${census.shapes_total} shapes, ${census.unexplained_total} unexplained. ${fmt(dividingTotal)} occurrences in ${fmt(dividingRoutes.size)} routes divide readings in meaning (a labeled second meaning, a gloss packing two renderings, a second form of a name, two interjections); none is separated (see separates_on).`,
      regions: {
        route_regions: regionCounts,
        registers: { marker_free: registers.marker_free_routes, short_marker_free_with_comma: registers.short_marker_free_comma_routes, with_note_marker: registers.routes_with_note_marker, with_colon: registers.routes_with_label_colon, no_mark: registers.routes_with_no_mark },
        meaning_depends_on_region: { ";": T[";"].region_dependent, ",": T[","].region_dependent, others: "No: every other mark means the same in the head, the notes and a marker-free route." },
        note: "Region here is a part of the route's own text, since the route is always the whole definition: 'marker-free' (no ; ◄ ► ≈ = :), 'head' (before the first note marker at depth 0) and 'notes' (after it).",
      },
      marks: marksDecl,
      precedence: ["|", "\"", "(", ";", "◄", "►", "≈", ":", "=", ",", "!", ">", "/"],
      precedence_note: "Nothing separates, so precedence decides only which mark's scope governs where two meet: the italic code, quotes and parentheses first (nothing inside them is structure), then ';' (the parts of one record), then the note openers, then ':' and '=' (label and definition), then ',' and '!' inside one part, then '>' and '/' inside one phrase.",
      refusals: {
        unbalanced_parentheses: { rows: new Set(rows.filter((r) => scan(r.route).orphanClosers.size || scan(r.route).unclosedOpeners.size).map((r) => r.key + "\u0001" + r.route)).size, closer_with_nothing_open: shapeCount(")", "paren.close_with_nothing_open"), opener_never_closed: shapeCount("(", "paren.open_never_closed"), rule: "Nothing to refuse: nothing separates, so a damaged scope cannot mis-cut anything. The route ships whole with the orphan character where the provider left it. Today's engine holds such a sense back as damaged and prints nothing for it." },
      },
      export: `governed by its posture, ${ranked.sources[rk].licensePosture}`,
      separates_on: null,
      separates_on_why: `Every route is one record of one meaning. The marks that divide in meaning do so in ${fmt(dividingRoutes.size)} of ${fmt(rows.length)} routes, and in each a cut would either print a piece that leans on the other's words ('to be' from 'to be, become happy'), leave a shared head or note attached to one alternative ('meaning unknown; possibly: = musical term' | 'or: = musical instrument' | 'or: = melody; ≈ ...'), or contradict the owner's ruling that a comma in UBS does not mean different entries. The provider's own way of offering a second reading is a second route (${fmt(shortNoMarkGlosses)} mark-free glosses of at most four words). So nothing is separated until the owner rules on the open questions.`,
      not_done_here: "The head is never taken as the reading: 'man' is not printed for 'man; ◄ son of Heman; ...', and 'hence: = action by which ...' is not printed without its literal rendering. A note is never printed as a reading. A packed gloss is never completed ('to be happy' is not manufactured from 'to be, become happy'). All three would be derivations.",
      open_questions: openQuestions,
      what_changes_on_a_card: {
        engine_path: "today: ';' at depth 0 packs senses, each sense divides under sense-split-rule-v3, damaged senses neither print nor pool",
        routes: E.routes,
        same_division: E.same_division,
        v3_divides_where_declaration_keeps_whole: E.v3_divides_where_declaration_keeps_whole,
        declaration_divides_where_v3_keeps_whole: E.declaration_divides_where_v3_keeps_whole,
        divided_differently: E.divided_differently,
        v3_prints_nothing_where_declaration_prints_whole: E.v3_prints_nothing_where_declaration_prints_whole,
        by_cause: engineCmp.by_cause,
        readings_printed_from_this_provider: { today: engineReadingTotal, declared: declReadingTotal },
        pills_today_that_are_not_the_route: v3Pieces,
        most_frequent_pills_today: v3TopPieces,
      },
    },
  },
};
writeFileSync(join(HERE, "declaration.json"), JSON.stringify(declaration, null, 1) + "\n");

// read it back and run the comparison again from the file: it must come out the same
declared = JSON.parse(readFileSync(join(HERE, "declaration.json"), "utf8")).providers[SOURCE_KEY];
declaredMarks = new Set(Object.keys(declared.marks));
const again = compare((t) => engineReadings(t), "engine");
if (JSON.stringify(again.tally) !== JSON.stringify(engineCmp.tally)) throw new Error("the declaration as written does not reproduce the comparison");
if (again.unknown_mark_routes !== 0) throw new Error(`${again.unknown_mark_routes} routes carry a mark the declaration does not cover`);

// console summary
console.log("routes", rows.length, "keys", census.distinct_keys, "region", regionCounts, registers);
console.log("closed set", census.closed_set.distinct, "marks,", census.closed_set.occurrences, "occurrences; agrees with inventory:", census.closed_set.agrees_with_inventory);
console.log("shapes", census.shapes_total, "unexplained", census.unexplained_total);
for (const m of marksOut) console.log(m.mark, m.occurrences, m.routes, "sum ok", m.shapes_sum_equals_occurrences, "unexpl", m.unexplained, "|", m.shapes.map((x) => `${x.shape}=${x.count}`).join(" "));
console.log("engine", engineCmp.tally, engineCmp.by_cause);
console.log("comma-only", commaCmp.tally);
console.log("readings printed", engineReadingTotal, "vs", declReadingTotal, "pagecite", pageCitationFiltered);
console.log(v3Pieces, v3TopPieces);
console.log("OQ", Object.fromEntries(Object.entries(oq).map(([k, v]) => [k, v.size])));
