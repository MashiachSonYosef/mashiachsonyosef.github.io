// cowley-1909-samaritan-liturgy-vol2-glossary.classifier.mjs · made from classifier-template-v1 under ask v1.1
//
// A classifier is a declaration made runnable. It is a pure function: no file
// reads, no network, no state kept between calls. classify(text) returns one
// {i, mark, shape} for EVERY mark in the text, where a mark is any character
// that is not a letter, a digit or whitespace, and i is its index in the
// JavaScript string. Do not change anything above the SHAPES line; the
// checker reads containers the same way.
//
// Each shape's test receives a context:
//   c.text       the whole route text
//   c.i          the mark's index
//   c.mark       the mark itself
//   c.container  "top" | "paren" | "bracket" | "angle" | "brace": the innermost
//                bracket the mark sits in (a bracket character sits in what
//                encloses it, not in itself)
//   c.depth      how many brackets enclose it
//   c.unclosed   true when an opener before it never closes
//   c.before     the text before the mark;  c.after  the text after it
//   c.inner      the text inside the innermost enclosing bracket ("" at top)
//   c.group      for an opening or closing bracket: the text it opens or closes
//                (null for an opener that never closes); "" for other marks
// Order matters: for each mark, the first shape whose test returns true names
// it. If no shape matches, classify throws and names the place, so a missing
// shape is never silently swallowed. Put specific shapes before general ones.
const isMark = (ch) => !/[\p{L}\p{N}\s]/u.test(ch);
const OPEN = { "(": ")", "[": "]", "<": ">", "{": "}" };
const CLOSE = { ")": "(", "]": "[", ">": "<", "}": "{" };
const CONTAINER = { "(": "paren", "[": "bracket", "<": "angle", "{": "brace" };

const SHAPES = [
  // ---- fragment ledger ----
  { id: "comma.in_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.in_square_brackets", mark: ",", divides: false, test: (c) => c.container === "bracket" },
  { id: "comma.at_the_head_of_the_row", mark: ",", divides: false, test: (c) => c.before === "" },
  { id: "comma.before_a_page_reference", mark: ",", divides: false, test: (c) => PAGE_WORDS.includes(wordAfter(c.after)) },
  { id: "comma.between_page_numbers", mark: ",", divides: false, test: (c) => isDigit(wordAfter(c.after)[0]) },
  { id: "comma.before_a_script_placeholder", mark: ",", divides: false, test: (c) => wordAfter(c.after).startsWith("[") },
  { id: "comma.before_a_label", mark: ",", divides: false, test: (c) => LABELS.includes(bare(wordAfter(c.after))) },
  { id: "comma.before_a_small_word_of_prose", mark: ",", divides: false, test: (c) => PROSE_WORDS.includes(bare(wordAfter(c.after))) },
  { id: "comma.after_a_hebrew_or_samaritan_form", mark: ",", divides: false, test: (c) => isHebrew(runBefore(c.before).slice(-1)) || runBefore(c.before).endsWith("]") },
  { id: "comma.before_a_label_with_its_own_comma_or_of_use", mark: ",", divides: false, test: (c) => LABELS.includes(bareOfEveryStop(wordAfter(c.after))) || LABELS_OF_USE.includes(bareOfEveryStop(wordAfter(c.after))) },
  { id: "comma.before_the_pointer_ibid", mark: ",", divides: false, test: (c) => POINTERS.includes(bareOfEveryStop(wordAfter(c.after))) },
  { id: "comma.beside_a_note_on_the_word", mark: ",", divides: false, test: (c) => NOTE_OPENINGS.some((s) => opensWith(c.after, s)) || CLOSING_NOTES_ON_THE_ENTRY.some((s) => c.text.includes(s)) || OPENING_NOTES.some((s) => c.text.startsWith(s)) },
  { id: "comma.before_a_word_that_finishes_the_gloss_before", mark: ",", divides: false, test: (c) => COMPLETING_WORDS.includes(bare(wordAfter(c.after))) },
  { id: "comma.beside_a_latin_gloss", mark: ",", divides: false, test: (c) => LATIN_GLOSSES.includes(bareOfStopsAndDoubt(runBefore(c.before))) || LATIN_GLOSSES.includes(bareOfStopsAndDoubt(wordAfter(c.after))) },
  { id: "comma.between_english_glosses", mark: ",", divides: false, test: (c) => isLatin(runBefore(c.before).slice(-1)) && isLatin(wordAfter(c.after)[0]) },
  { id: "comma.any_other_at_top_level", mark: ",", divides: false, test: (c) => true },
  { id: "semicolon.before_a_page_reference", mark: ";", divides: false, test: (c) => PAGE_WORDS.includes(wordAfter(c.after)) },
  { id: "semicolon.before_a_script_placeholder", mark: ";", divides: false, test: (c) => wordAfter(c.after).startsWith("[") },
  { id: "semicolon.before_a_label", mark: ";", divides: false, test: (c) => LABELS.includes(bare(wordAfter(c.after))) },
  { id: "semicolon.before_a_small_word_of_prose", mark: ";", divides: false, test: (c) => PROSE_WORDS.includes(bare(wordAfter(c.after))) },
  { id: "semicolon.before_a_hebrew_form", mark: ";", divides: false, test: (c) => isHebrew(wordAfter(c.after)[0]) },
  { id: "semicolon.before_a_label_with_its_own_comma", mark: ";", divides: false, test: (c) => LABELS.includes(bareOfEveryStop(wordAfter(c.after))) },
  { id: "semicolon.beside_a_latin_gloss", mark: ";", divides: false, test: (c) => LATIN_GLOSSES.includes(bareOfStopsAndDoubt(runBefore(c.before))) || LATIN_GLOSSES.includes(bareOfStopsAndDoubt(wordAfter(c.after))) },
  { id: "semicolon.before_an_english_gloss", mark: ";", divides: false, test: (c) => isLatin(wordAfter(c.after)[0]) },
  { id: "semicolon.any_other_at_top_level", mark: ";", divides: false, test: (c) => true },
  { id: "period.is_the_whole_row", mark: ".", divides: false, test: (c) => c.text === "." },
  { id: "period.after_a_page_reference", mark: ".", divides: false, test: (c) => /^[0-9]+$/u.test(runBefore(c.before)) || /^[\u05D0-\u05EA]{1,2}$/u.test(runBefore(c.before)) },
  { id: "period.after_an_abbreviation", mark: ".", divides: false, test: (c) => ABBREVIATIONS.includes(lettersBefore(c.before)) },
  { id: "period.at_the_end_of_the_text", mark: ".", divides: false, test: (c) => c.after === "" },
  { id: "period.any_other", mark: ".", divides: false, test: (c) => true },
  { id: "open_paren.holds_a_script_placeholder", mark: "(", divides: false, test: (c) => firstWord(c.group).startsWith("[") },
  { id: "close_paren.holds_a_script_placeholder", mark: ")", divides: false, test: (c) => firstWord(c.group).startsWith("[") },
  { id: "open_paren.holds_a_source_label", mark: "(", divides: false, test: (c) => SOURCE_LABELS.includes(bare(firstWord(c.group))) },
  { id: "close_paren.holds_a_source_label", mark: ")", divides: false, test: (c) => SOURCE_LABELS.includes(bare(firstWord(c.group))) },
  { id: "open_paren.holds_a_variant_or_cross_reference", mark: "(", divides: false, test: (c) => VARIANT_OPENERS.includes(firstWord(c.group)) },
  { id: "close_paren.holds_a_variant_or_cross_reference", mark: ")", divides: false, test: (c) => VARIANT_OPENERS.includes(firstWord(c.group)) },
  { id: "open_paren.holds_a_note", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.holds_a_note", mark: ")", divides: false, test: (c) => true },
  { id: "open_bracket.holds_a_script_placeholder", mark: "[", divides: false, test: (c) => PLACEHOLDERS.includes(c.group ?? "") },
  { id: "close_bracket.holds_a_script_placeholder", mark: "]", divides: false, test: (c) => PLACEHOLDERS.includes(c.group ?? "") },
  { id: "open_bracket.holds_the_readers_description", mark: "[", divides: false, test: (c) => true },
  { id: "close_bracket.holds_the_readers_description", mark: "]", divides: false, test: (c) => true },
  { id: "equals.points_to_another_spelling", mark: "=", divides: false, test: (c) => true },
  { id: "question_mark.marks_a_doubt", mark: "?", divides: false, test: (c) => true },
  { id: "prime.marks_a_shortened_hebrew_word", mark: "′", divides: false, test: (c) => true },
  { id: "ampersand.in_the_abbreviation_etc", mark: "&", divides: false, test: (c) => true },
  { id: "pipe.before_a_see_also_note", mark: "|", divides: false, test: (c) => true },
  { id: "maqaf.inside_a_hebrew_form", mark: "־", divides: false, test: (c) => true },
  { id: "hyphen.inside_an_english_compound", mark: "-", divides: false, test: (c) => true },
  { id: "exclamation.ends_a_cry", mark: "!", divides: false, test: (c) => true },
  { id: "apostrophe.in_a_possessive", mark: "'", divides: false, test: (c) => true },
  { id: "colon.before_a_quoted_form", mark: ":", divides: false, test: (c) => true },
  { id: "section_sign.in_a_grammar_reference", mark: "§", divides: false, test: (c) => true },
  { id: "double_prime.marks_a_shortened_word", mark: "″", divides: false, test: (c) => true },
  { id: "hebrew_point_tsere.in_a_cited_form", mark: "ֵ", divides: false, test: (c) => true },
];

// ---- helpers of fragment ledger ----
const PAGE_WORDS = ["p.","pp."];
const LABELS = ["i.e","&c","ptcp","c","pl","v","3rd","2nd","1st","impf","impft","imperat","imper","imp","infin","inf","emph","id","q","opp","cf","i","e","ut","sq","adj","fut","plur","sing","fem","masc","constr","suff","pass","Af","Pa","Pe","Po","Ithp","Hif","Ittaf","Ethp","abs","esp","usually","s","l","al","lit","sc","ib","vid","cp","part","subst","noun","verb","act","gen","dat","acc","nom","voc","pron","prep","conj","interj","num","ord","pf","perf","aor","ptc","pt","f","m"];
const PROSE_WORDS = ["and","or","but","with","for","as","so","thou","then","not","in","to","of","if","also","like","a","the","on","at","by","from","upon","which","who","that","when","where","it","he","they","we","ye","you","is","was","be","being","there","here","thus","only","even","all","no","nor","yet","than","because","though","whether","either","neither","both","each","after","before","over","under","into","unto","out","up","down"];
const ABBREVIATIONS = ["p","pp","ptcp","pl","Ithp","c","Af","sing","suff","impf","impft","infin","inf","Pa","v","id","imperat","imper","imp","fem","masc","l","pass","i","e","s","al","q","opp","cf","Hif","Ar","emph","constr","Heb","Targ","Pe","Po","abs","esp","usu","adj","plur","fut","cp","lit","sc","ib","vid","ut","Ittaf","Ethp","Cr","Syr","Sam","Gr","Lat","Arab","Chald","Aram","MS","MSS","ed","edd","sq","sqq","ibid","loc","cit","op","viz","etc","part","subst","act","gen","dat","acc","nom","voc","pron","prep","conj","interj","num","ord","pf","perf","aor","ptc","pt","f","m","xlix","xxiv","xxv","xxvi","xxvii","xxviii","xxix","xxx","ii","iii","iv","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","xxi","xxii","xxiii","xl","xli","xlii","xliii","xliv","xlv","xlvi","xlvii","xlviii","l","li","lii","liii","liv","lv","lvi","lvii","lviii","lix","lx"];
const PLACEHOLDERS = ["Arabic","Greek"];
const SOURCE_LABELS = ["Heb","Targ","Cr","V","K","Ar","Syr"];
const VARIANT_OPENERS = ["v.","or","=","cf.","i.e.","i."];
const LABELS_OF_USE = ["metaph","trans","cc"];
const POINTERS = ["ibid"];
const NOTE_OPENINGS = ["used of God","generally","often","variant for","confused with","always as one word","name of a prayer"];
const CLOSING_NOTES_ON_THE_ENTRY = [", often.",", unless it be a mistake for "];
const OPENING_NOTES = ["in the phrase "];
const COMPLETING_WORDS = ["wickedly","away","every"];
const LATIN_GLOSSES = ["juxta","exitus","missiones"];
const isLatin = (ch) => ch !== undefined && /[A-Za-z]/u.test(ch); const isHebrew = (ch) => ch !== undefined && /[\u05D0-\u05EA]/u.test(ch); const isDigit = (ch) => ch !== undefined && /[0-9]/u.test(ch);
function runBefore(before) { const m = /\S+$/u.exec(before); return m ? m[0] : ""; }
function wordAfter(after) { const m = /^\s*(\S+)/u.exec(after); return m ? m[1] : ""; }
function bare(w) { return w.replace(/[.,]$/u, ""); }
function lettersBefore(before) { const m = /\p{L}+$/u.exec(before); return m ? m[0] : ""; }
function firstWord(g) { const m = /^\S+/u.exec(g ?? ""); return m ? m[0] : ""; }
function bareOfEveryStop(w) { return w.replace(/[.,;]+$/u, ""); }
function bareOfStopsAndDoubt(w) { return w.replace(/[.,;]+$/u, "").replace(/\?$/u, ""); }
function opensWith(after, s) { const a = after.replace(/^\s+/u, ""); return a.startsWith(s) && !/^\p{L}/u.test(a.slice(s.length)); }

export function classify(text) {
  const chars = [...text];
  const pos = []; let i16 = 0;
  for (const ch of chars) { pos.push(i16); i16 += ch.length; }
  const st = [], match = new Map();
  chars.forEach((ch, k) => {
    if (OPEN[ch]) st.push(k);
    else if (CLOSE[ch] && st.length && chars[st[st.length - 1]] === CLOSE[ch]) { const o = st.pop(); match.set(o, k); match.set(k, o); }
  });
  const never = new Set(st);
  const firstUnclosed = st.length ? Math.min(...st) : Infinity;
  const stack = [], out = [];
  chars.forEach((ch, k) => {
    if (CLOSE[ch] && stack.length && chars[stack[stack.length - 1]] === CLOSE[ch]) stack.pop();
    if (isMark(ch)) {
      const top = stack.length ? stack[stack.length - 1] : -1;
      const inner = top >= 0 ? chars.slice(top + 1, match.get(top)).join("") : "";
      let group = "";
      if (OPEN[ch]) group = match.has(k) ? chars.slice(k + 1, match.get(k)).join("") : null;
      else if (CLOSE[ch] && match.has(k)) group = chars.slice(match.get(k) + 1, k).join("");
      const c = { text, i: pos[k], mark: ch, container: top >= 0 ? CONTAINER[chars[top]] : "top", depth: stack.length, unclosed: k >= firstUnclosed, before: chars.slice(0, k).join(""), after: chars.slice(k + 1).join(""), inner, group };
      const s = SHAPES.find((x) => x.mark === ch && x.test(c));
      if (!s) throw new Error(`no shape for "${ch}" (${c.container}) at ${pos[k]} in: ${text.slice(Math.max(0, pos[k] - 30), pos[k] + 30)}`);
      out.push({ i: pos[k], mark: ch, shape: s.id });
    }
    if (OPEN[ch] && !never.has(k)) stack.push(k);
  });
  return out;
}
export const SHAPE_IDS = SHAPES.map((s) => s.id);
