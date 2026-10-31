// Per-occurrence shape for every mark, from the stated tests. Returns {shape, hits[]} where hits
// lists every non-catch-all test that is true (for the overlap / completeness check).
import { isHebLetter, isHebPoint, isLetter, isDigit, isSpace, isMark, isUpper, isLower, words } from "./lib.mjs";
import { isSubjectPronoun, OPTS } from "./classify.mjs";
const R_ARG = /^(?:(?:to|of|with|for|at|on|in|from|into|by|upon|against) )?(?:someone|something|somebody|a person|one|oneself|someone or something|something or someone|something else|someone else|a thing|an object|people)$/i;
const R_GRAM = /\b(?:suffix|prefix) conjugation\b|hence past tense|construct or gerund|^construct state$|^in the construct state$/i;

const MONTH = /^\s*(January|February|March|April|May|June|July|August|September|October|November|December)\b/u;
const hebWordChar = (c) => !!c && c >= "֑" && c <= "״";
const HEB_POINTS = (c) => isHebPoint(c);
const prevNS = (s, i) => { let j = i - 1; while (j >= 0 && s[j] === " ") j--; return j; };
const nextNS = (s, i) => { let j = i + 1; while (j < s.length && s[j] === " ") j++; return j; };

export function parenShape(R, g) {
  const s = R.s; const c = R.content(g); const hits = [];
  const T = {
    "paren.unclosed_opener": g.close < 0,
    "paren.nested": g.depth > 0,
    "paren.lead_label": R.lead === g,
    "paren.trailing_note": R.trailing === g && R.trailingKind === "note",
    "paren.trailing_label": R.trailing === g && R.trailingKind === "label",
    "paren.romanization": g.close >= 0 && R.roman.has(g),
    "paren.mark_display": g.close >= 0 && (c.includes("◌") || (c.trim() !== "" && [...c.trim()].every((x) => isMark(x) || isSpace(x)))),
    "paren.grammar_label": g.close >= 0 && (OPTS.reconcile ? R_GRAM.test(c.trim()) : /\b(conjugation|tense)\b/iu.test(c) && /\bform of\b|\bconjugation\b/iu.test(s)),
    "paren.hebrew_note": g.close >= 0 && !R.roman.has(g) && [...c].some(isHebLetter),
    "paren.subject_pronoun": g.close >= 0 && isSubjectPronoun(c),
     "paren.argument_slot": g.close >= 0 && (OPTS.reconcile ? R_ARG.test(c.trim()) : null) || g.close >= 0 && !OPTS.reconcile && /^\s*((to|for|with|on|at|from|in|into|of|by|about|upon|against|over|toward|towards|onto|after|unto|between|among|under|through|like|as)\s+)?(someone|something|oneself|a person)\s*$/iu.test(c),
  };
  const order = OPTS.reconcile ? ["paren.unclosed_opener", "paren.romanization", "paren.nested", "paren.lead_label", "paren.trailing_note", "paren.trailing_label", "paren.mark_display", "paren.grammar_label", "paren.hebrew_note", "paren.subject_pronoun", "paren.argument_slot"] : ["paren.unclosed_opener", "paren.nested", "paren.lead_label", "paren.trailing_note", "paren.trailing_label", "paren.romanization", "paren.mark_display", "paren.grammar_label", "paren.hebrew_note", "paren.subject_pronoun", "paren.argument_slot"];
  for (const k of order) if (T[k]) hits.push(k);
  return { shape: hits[0] || "paren.qualifier", hits };
}
export function bracketShape(R, g) {
  const s = R.s; const c = R.content(g); const hits = [];
  const T = {
    "bracket.wiki_markup": s.includes("[["),
    "bracket.government": /^with /u.test(c),
    "bracket.cross_reference": /^see /u.test(c),
    "bracket.equivalence": /^=/u.test(c),
    "bracket.elision": /^\s*(\.\.\.|…)\s*$/u.test(c),
    "bracket.phonetic": c.length <= 8 && /\p{M}/u.test(c) && ![...c].some(isHebLetter),
    "bracket.supplied_word": /^[a-z]+( [a-z]+)?$/u.test(c),
  };
  for (const k of Object.keys(T)) if (T[k]) hits.push(k);
  return { shape: hits[0] || "bracket.UNEXPLAINED", hits };
}

export function markShape(R, i) {
  const s = R.s; const c = s[i]; const P = R.P;
  const hits = []; const t = (name, ok) => { if (ok) hits.push(name); };
  const done = (fallback) => ({ shape: hits[0] || fallback, hits });
  switch (c) {
    case ",": { const e = R.commaShape.get(i); return { shape: e ? e.sh : "comma.UNEXPLAINED", hits: e && e.alts && e.alts.length ? e.alts : [], role: e && e.role }; }
    case ".": return { shape: R.periodShape.get(i), hits: [] };
    case ";": return { shape: R.semiShape.get(i), hits: [] };
    case ":": return { shape: R.colonShape.get(i), hits: [] };
    case "(": { const g = R.groupAt.get(i); return parenShape(R, g); }
    case ")": { const g = R.closeOf.get(i); if (!g) return { shape: "paren.UNEXPLAINED_orphan_closer", hits: [] }; return parenShape(R, g); }
    case "[": return bracketShape(R, R.groupAt.get(i));
    case "]": { const g = R.closeOf.get(i); if (!g) return { shape: "bracket.UNEXPLAINED_orphan", hits: [] }; return bracketShape(R, g); }
    case "-": {
      const strongsMarker = (s[i - 1] === ":" || (s[i - 1] === " " && s[i - 2] === ":")) && s[i + 1] === " ";
      const afterStrongs = (() => { const m = s.slice(0, i).search(/: ?[-–] /u); return m >= 0; })();
      t("hyphen.romanization", R.inRoman(i));
      t("hyphen.strongs_list_marker", strongsMarker);
      t("hyphen.strongs_suffix", afterStrongs && !isLetter(s[i - 1]) && !isDigit(s[i - 1]) && isLetter(s[i + 1]));
      const pj = prevNS(s, i), nj = nextNS(s, i);
      const spaced = s[i - 1] === " " && s[i + 1] === " ";
      t("hyphen.range", (isDigit(s[i - 1]) && isDigit(s[i + 1])) || (spaced && isDigit(s[pj]) && (isDigit(s[nj]) || MONTH.test(s.slice(nj)))));
      t("hyphen.compound", ((isLetter(s[i - 1]) || isDigit(s[i - 1])) && (isLetter(s[i + 1]) || isDigit(s[i + 1]))) || (s[i - 1] === ")" && isLetter(s[i + 1])));
      t("hyphen.bound_prefix_gloss", isLetter(s[i - 1]) && (i + 1 >= s.length || isSpace(s[i + 1]) || isMark(s[i + 1])));
      t("hyphen.bound_suffix_gloss", (i === 0 || isSpace(s[i - 1]) || s[i - 1] === "(") && isLetter(s[i + 1]));
      t("hyphen.spaced_dash", spaced && s[pj] !== ":" && !(isDigit(s[pj]) && (isDigit(s[nj]) || MONTH.test(s.slice(nj)))));
      return done("hyphen.UNEXPLAINED");
    }
    case "'": {
      t("apostrophe.romanization", R.inRoman(i));
      t("apostrophe.word_internal", isLetter(s[i - 1]) && isLetter(s[i + 1]));
      t("apostrophe.word_final", isLetter(s[i - 1]) && !isLetter(s[i + 1]));
      t("apostrophe.opening_quote", !isLetter(s[i - 1]) && isLetter(s[i + 1]));
      return done("apostrophe.UNEXPLAINED");
    }
    case "/": {
      const tokA = s.slice(0, i).match(/\S*$/u)[0], tokB = s.slice(i + 1).match(/^\S*/u)[0];
      const tok = tokA + "/" + tokB;
      t("slash.url", /https?:|www\.|\.(com|org|net)\b/iu.test(tok));
      t("slash.phoneme", /\/[^\s/]{1,4}\//u.test(s.slice(Math.max(0, i - 5), i + 6)) && (/^[^\s/]{1,4}\//u.test(s.slice(i + 1)) || /\/[^\s/]{1,4}$/u.test(s.slice(0, i))) && !(isLetter(s[i - 1]) && isLetter(s[i + 1]) && /\p{L}\/\p{L}+\/\p{L}/u.test(tok)));
      t("slash.per_unit", /(^|[^\p{L}])(kcal|km|kg|cm|mm|m|g|h|s|mi|kWh|J|W|mol|l|L|ml)$/u.test(tokA) && isDigit((tokA.match(/\d/u) || [""])[0]) || /\b(kcal|km|kg|cal|m)$/u.test(tokA));
      const hp = s[prevNS(s, i)], hn = s[nextNS(s, i)];
      t("slash.spelling_pair", hebWordChar(hp) && hebWordChar(hn));
      t("slash.alternation_in_reading", isLetter(s[i - 1]) && isLetter(s[i + 1]));
      t("slash.alternation_spaced", (s[i - 1] === " " || s[i + 1] === " ") && isLetter(hp) && !hebWordChar(hp) && isLetter(hn) && !hebWordChar(hn));
      return done("slash.UNEXPLAINED");
    }
    case "\\": { const hp = s[prevNS(s, i)], hn = s[nextNS(s, i)]; t("slash.spelling_pair", hebWordChar(hp) && hebWordChar(hn)); return done("backslash.UNEXPLAINED"); }
    case '"': {
      t("straight_double.gershayim_substitute", isLetter(s[i - 1]) && isLetter(s[i + 1]));
      t("straight_double.quotation", P.sdPaired.has(i));
      return done("straight_double.named_character");
    }
    case "־": { t("maqaf.hebrew", isHeb(s[i - 1]) || isHeb(s[i + 1])); return done("maqaf.named"); }
    case "“": case "”": {
      t("curly_double.romanization_gloss", R.inRoman(i));
      return done("curly_double.quotation");
    }
    case "‘": case "’": {
      // ‘ ’ inside a square bracket
      const pair = P.qpairs.find(([a, b, op]) => op === "‘" && (a === i || b === i));
      t("curly_single.particle_gloss", !!pair && P.brack[pair[0]] > 0);
      if (c === "’") t("curly_single.apostrophe", isLetter(s[i - 1]) && isLetter(s[i + 1]));
      return done("curly_single.quotation");
    }
    case "!": return { shape: "exclamation.terminal", hits: [] };
    case "?": return { shape: "question.terminal", hits: [] };
    case "–": {
      const pj = prevNS(s, i), nj = nextNS(s, i);
      t("en_dash.range", (isDigit(s[pj]) || MONTH.test(lastWord(s, pj))) && (isDigit(s[nj]) || MONTH.test(s.slice(nj))));
      t("en_dash.strongs_list_marker", s[i - 1] === " " && s[i - 2] === ":");
      return done(OPTS.reconcile ? "en_dash.range" : "en_dash.UNEXPLAINED");
    }
    case "°": t("degree.unit", isDigit(s[i - 1])); return done("degree.UNEXPLAINED");
    case "״": t("gershayim.hebrew", isHeb(s[i - 1])); return done("gershayim.named");
    case "׳": t("geresh.hebrew", isHebLetter(s[i - 1]) || (OPTS.reconcile && isHebPoint(s[i - 1]))); return done("geresh.UNEXPLAINED");
    case "{": t("wiki_template.residue", s.includes("{{")); return done("brace.UNEXPLAINED");
    case "|": t("wiki_template.residue", s.includes("{{")); t("bracket.wiki_markup", s.includes("[[")); return done("pipe.UNEXPLAINED");
    case "@": t("symbol.named_or_shown", P.paren[i] > 0); return done("at.UNEXPLAINED");
    case "→": case "~": case "‐": case "♠": case "⟨": case "⟩": case "†": case "#": case "♣": case "♇": case "⯓":
      return { shape: "symbol.named_or_shown", hits: [] };
    case "⁄": case "·": case "%": case "×": case "⁺": case "&": case "<": case ">": case "̞":
      return { shape: "symbol.notation", hits: [] };
    case "…": return { shape: "ellipsis.slot_or_truncation", hits: [] };
    case "◌": return { shape: "dotted_circle.carrier", hits: [] };
    case "+": return { shape: "plus.composition", hits: [] };
    case "=": return { shape: "equals.expansion", hits: [] };
    case "—": return { shape: "em_dash.range_or_aside", hits: [] };
  }
  if (isHebPoint(c)) {
    // next to a dotted circle, or alone in a display parenthesis
    let j = i - 1; while (j >= 0 && isHebPoint(s[j])) j--;
    const display = s[j] === "◌" || s[i + 1] === "◌" || (s[j] === "(" && (() => { let k = i + 1; while (k < s.length && isHebPoint(s[k])) k++; return s[k] === ")"; })());
    t("hebrew_point.mark_display", display);
    t("hebrew_point.on_letter", isHebLetter(s[i - 1]) || isHebPoint(s[i - 1]));
    return done("hebrew_point.UNEXPLAINED");
  }
  return { shape: "UNKNOWN_MARK", hits: [] };
}
const isHeb = (c) => isHebLetter(c) || isHebPoint(c);
const lastWord = (s, j) => (s.slice(0, j + 1).match(/\S+$/u) || [""])[0];
