// wikisource_strongs_explicit_forms.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  // ---- fragment shared ----
  // the shared fragment holds no shape: only the lists and steps of the tests, in shared.helpers.txt
  // ---- fragment paren ----
  // ---- round brackets: an opener and its closer take the same kind, from what the pair holds (pairKind in shared.helpers.txt); nothing here divides
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  { id: "open_paren.inner_holds_word_end", mark: "(", divides: false, test: (c) => pairKind(c) === "inner_end" },
  { id: "open_paren.inner_holds_word_start", mark: "(", divides: false, test: (c) => pairKind(c) === "inner_start" },
  { id: "open_paren.inner_holds_words", mark: "(", divides: false, test: (c) => pairKind(c) === "inner_words" },
  { id: "open_paren.holds_verse_citation", mark: "(", divides: false, test: (c) => pairKind(c) === "citation" },
  { id: "open_paren.holds_note", mark: "(", divides: false, test: (c) => pairKind(c) === "note" },
  { id: "open_paren.holds_label", mark: "(", divides: false, test: (c) => pairKind(c) === "label" },
  { id: "open_paren.in_source_sentence", mark: "(", divides: false, test: (c) => pairKind(c) === "sentence" },
  { id: "open_paren.holds_sign_alone", mark: "(", divides: false, test: (c) => pairKind(c) === "sign" },
  { id: "open_paren.is_the_whole_text", mark: "(", divides: false, test: (c) => pairKind(c) === "whole" },
  { id: "open_paren.holds_only_an_inner_bracket", mark: "(", divides: false, test: (c) => pairKind(c) === "doubled" },
  { id: "open_paren.holds_choices", mark: "(", divides: false, test: (c) => pairKind(c) === "choices" },
  { id: "open_paren.holds_word_end", mark: "(", divides: false, test: (c) => pairKind(c) === "word_end" },
  { id: "open_paren.holds_word_start", mark: "(", divides: false, test: (c) => pairKind(c) === "word_start" },
  { id: "open_paren.holds_letters_against_a_word", mark: "(", divides: false, test: (c) => pairKind(c) === "against" },
  { id: "open_paren.holds_words_before_the_word", mark: "(", divides: false, test: (c) => pairKind(c) === "words_first" },
  { id: "open_paren.holds_words_after_the_word", mark: "(", divides: false, test: (c) => pairKind(c) === "words_last" },
  { id: "open_paren.holds_words_between_words", mark: "(", divides: false, test: (c) => pairKind(c) === "words_between" },
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => c.group === "" && !c.before.endsWith("(") },
  { id: "close_paren.inner_holds_word_end", mark: ")", divides: false, test: (c) => pairKind(c) === "inner_end" },
  { id: "close_paren.inner_holds_word_start", mark: ")", divides: false, test: (c) => pairKind(c) === "inner_start" },
  { id: "close_paren.inner_holds_words", mark: ")", divides: false, test: (c) => pairKind(c) === "inner_words" },
  { id: "close_paren.holds_verse_citation", mark: ")", divides: false, test: (c) => pairKind(c) === "citation" },
  { id: "close_paren.holds_note", mark: ")", divides: false, test: (c) => pairKind(c) === "note" },
  { id: "close_paren.holds_label", mark: ")", divides: false, test: (c) => pairKind(c) === "label" },
  { id: "close_paren.in_source_sentence", mark: ")", divides: false, test: (c) => pairKind(c) === "sentence" },
  { id: "close_paren.holds_sign_alone", mark: ")", divides: false, test: (c) => pairKind(c) === "sign" },
  { id: "close_paren.is_the_whole_text", mark: ")", divides: false, test: (c) => pairKind(c) === "whole" },
  { id: "close_paren.holds_only_an_inner_bracket", mark: ")", divides: false, test: (c) => pairKind(c) === "doubled" },
  { id: "close_paren.holds_choices", mark: ")", divides: false, test: (c) => pairKind(c) === "choices" },
  { id: "close_paren.holds_word_end", mark: ")", divides: false, test: (c) => pairKind(c) === "word_end" },
  { id: "close_paren.holds_word_start", mark: ")", divides: false, test: (c) => pairKind(c) === "word_start" },
  { id: "close_paren.holds_letters_against_a_word", mark: ")", divides: false, test: (c) => pairKind(c) === "against" },
  { id: "close_paren.holds_words_before_the_word", mark: ")", divides: false, test: (c) => pairKind(c) === "words_first" },
  { id: "close_paren.holds_words_after_the_word", mark: ")", divides: false, test: (c) => pairKind(c) === "words_last" },
  { id: "close_paren.holds_words_between_words", mark: ")", divides: false, test: (c) => pairKind(c) === "words_between" },
  // ---- fragment comma ----
  // ---- the comma: the store has already cut the source's list at the commas outside brackets, so nothing here divides
  { id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
  { id: "comma.at_end_of_text", mark: ",", divides: false, test: (c) => c.container === "top" && c.after.trim() === "" },
  { id: "comma.paren_in_note_or_sentence", mark: ",", divides: false, test: (c) => c.depth === 1 && (NOTE_OPENERS.some((w) => c.inner.startsWith(w)) || sentenceText(c.text)) },
  { id: "comma.paren_in_inner_bracket", mark: ",", divides: false, test: (c) => c.depth >= 2 },
  { id: "comma.paren_in_bracket_that_is_the_whole_text", mark: ",", divides: false, test: (c) => c.container === "paren" && isWholeText(c.text, c.inner) },
  { id: "comma.paren_between_word_ends", mark: ",", divides: false, test: (c) => c.container === "paren" && /\p{L}$/u.test(beforeHolder(c.before)) },
  { id: "comma.paren_before_the_word", mark: ",", divides: false, test: (c) => c.container === "paren" && afterHolder(c.after).trim() !== "" },
  { id: "comma.paren_after_the_word", mark: ",", divides: false, test: (c) => c.container === "paren" && afterHolder(c.after).trim() === "" },
  // ---- fragment stops ----
  // ---- the semicolon: one shape divides, by a closed list of texts; two shapes rest in branch B01
  { id: "semicolon.opens_text", mark: ";", divides: false, test: (c) => c.container === "top" && c.before.trim() === "" },
  { id: "semicolon.between_two_renderings", mark: ";", divides: false, test: (c) => c.container === "top" && TWO_RENDERINGS_TEXTS.includes(c.text) },
  { id: "semicolon.between_sentence_and_word", mark: ";", divides: false, test: (c) => c.container === "top" && WORD_AFTER_SENTENCE.includes(c.after.trim()) },
  { id: "semicolon.before_second_sense_in_sentence", mark: ";", divides: false, test: (c) => c.container === "top" && SECOND_SENSES.includes(c.after.trim()) },
  { id: "semicolon.before_word_after_pointer_or_spelling", mark: ";", divides: false, test: (c) => c.container === "top" && WORD_AFTER_POINTER_OR_SPELLING.includes(c.after.trim()) },
  { id: "semicolon.before_second_sense_after_pointer", mark: ";", divides: false, test: (c) => c.container === "top" && SECOND_SENSES_AFTER_POINTER.includes(c.after.trim()) },
  { id: "semicolon.before_word_after_leaning_gloss", mark: ";", divides: false, test: (c) => c.container === "top" && c.after.trim() === "-X abundantly" },
  { id: "semicolon.after_restatement", mark: ";", divides: false, test: (c) => c.container === "top" && c.text.startsWith("i.e. ") },
  { id: "semicolon.before_name_in_name_entry", mark: ";", divides: false, test: (c) => c.container === "top" && NAMES_AFTER_SEMICOLON.includes(c.after.trim()) },
  { id: "semicolon.between_spellings", mark: ";", divides: false, test: (c) => c.container === "top" && SPELLING_CLAUSES.includes(clauseBefore(c)) },
  { id: "semicolon.before_label_that_stands_alone", mark: ";", divides: false, test: (c) => c.container === "top" && LABELS_AFTER_SEMICOLON.includes(c.after.trim()) },
  { id: "semicolon.after_origin_of_the_word", mark: ";", divides: false, test: (c) => c.container === "top" && (ORIGIN_OPENERS.some((w) => clauseBefore(c).startsWith(w)) || /^[א-ת]/u.test(clauseBefore(c))) },
  { id: "semicolon.top_other", mark: ";", divides: false, test: (c) => c.container === "top" },
  { id: "semicolon.paren_in_note_or_sentence", mark: ";", divides: false, test: (c) => c.container === "paren" },
  // ---- the full stop: one shape rests in branch B02
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.between_two_renderings", mark: ".", divides: false, test: (c) => c.container === "top" && TWO_STOP_TEXTS.includes(c.text) },
  { id: "period.doubled_before_note", mark: ".", divides: false, test: (c) => c.container === "top" && c.text === "violent perverting.. gozal" },
  { id: "period.in_ie", mark: ".", divides: false, test: (c) => c.container === "top" && inIe(c) },
  { id: "period.after_abbreviation", mark: ".", divides: false, test: (c) => c.container === "top" && ABBREVIATIONS.includes(wordBeforeStop(c)) },
  { id: "period.in_run_of_dots", mark: ".", divides: false, test: (c) => c.container === "top" && (c.before.endsWith(".") || c.after.startsWith(".")) },
  { id: "period.at_end_of_text", mark: ".", divides: false, test: (c) => c.container === "top" && c.after === "" },
  { id: "period.before_leftover_letters", mark: ".", divides: false, test: (c) => c.container === "top" && /^\p{L}/u.test(c.after) },
  { id: "period.before_word_after_pointer", mark: ".", divides: false, test: (c) => c.container === "top" && WORDS_AFTER_STOP_AFTER_POINTER.includes(c.after.trim()) },
  { id: "period.before_name_after_description", mark: ".", divides: false, test: (c) => c.container === "top" && c.after.trim() === "-- Padon" },
  { id: "period.before_note_after_rendering", mark: ".", divides: false, test: (c) => c.container === "top" },
  { id: "period.paren_in_ie", mark: ".", divides: false, test: (c) => inIe(c) },
  { id: "period.paren_after_abbreviation", mark: ".", divides: false, test: (c) => ABBREVIATIONS.includes(wordBeforeStop(c)) },
  { id: "period.paren_in_run_of_dots", mark: ".", divides: false, test: (c) => c.before.endsWith(".") || c.after.startsWith(".") },
  { id: "period.paren_ends_list_inside_bracket", mark: ".", divides: false, test: (c) => c.text === "with(-in.)" },
  { id: "period.paren_ends_note", mark: ".", divides: false, test: (c) => c.after.startsWith(")") },
  { id: "period.paren_after_book_abbreviation", mark: ".", divides: false, test: (c) => BOOK_ABBREVIATIONS.includes(wordBeforeStop(c)) },
  { id: "period.paren_ends_sentence_in_note", mark: ".", divides: false, test: (c) => /^\s+\p{Lu}/u.test(c.after) },
  // ---- fragment rest ----
  // ---- the hyphen: no shape divides or rests in a branch
  { id: "hyphen.in_unbalanced_text", mark: "-", divides: false, test: (c) => unbalanced(c.text) },
  { id: "hyphen.is_a_word_end_alone", mark: "-", divides: false, test: (c) => c.container === "top" && WORD_ENDS_ALONE.includes(c.text) },
  { id: "hyphen.after_leftover_letter", mark: "-", divides: false, test: (c) => c.container === "top" && c.text === "d-fierce" },
  { id: "hyphen.joins_compound", mark: "-", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.ends_word_part_before_a_space", mark: "-", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && /^\s/u.test(c.after) },
  { id: "hyphen.word_start_before_bracket", mark: "-", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && c.after.startsWith("(") },
  { id: "hyphen.word_end_after_bracket", mark: "-", divides: false, test: (c) => c.container === "top" && c.before.trimEnd().endsWith(")") && /^\p{L}/u.test(c.after) },
  { id: "hyphen.opens_king_james_word", mark: "-", divides: false, test: (c) => c.container === "top" && (c.before === "" || /[\s-]$/u.test(c.before)) },
  { id: "hyphen.paren_beside_inner_bracket", mark: "-", divides: false, test: (c) => c.container === "paren" && (c.before.endsWith(")") || c.after.startsWith("(")) },
  { id: "hyphen.paren_closes_word_start", mark: "-", divides: false, test: (c) => c.container === "paren" && /\p{L}$/u.test(c.before) && /^[),]/u.test(c.after) },
  { id: "hyphen.paren_stands_alone_before_closer", mark: "-", divides: false, test: (c) => c.container === "paren" && c.after.startsWith(")") },
  { id: "hyphen.paren_joins_compound", mark: "-", divides: false, test: (c) => c.container === "paren" && /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.paren_opens_word_end", mark: "-", divides: false, test: (c) => c.container === "paren" },
  // ---- the plus sign: no shape divides or rests in a branch
  { id: "plus.in_unbalanced_text", mark: "+", divides: false, test: (c) => unbalanced(c.text) },
  { id: "plus.on_word_after_a_lost_comma", mark: "+", divides: false, test: (c) => c.container === "top" && c.text === "(give to, leave for) inherit(-ance, -or) + magistrate" },
  { id: "plus.opens_text", mark: "+", divides: false, test: (c) => c.container === "top" && c.before === "" },
  { id: "plus.after_leading_bracket", mark: "+", divides: false, test: (c) => c.container === "top" },
  { id: "plus.paren_alone_in_bracket", mark: "+", divides: false, test: (c) => c.inner === "+" },
  { id: "plus.paren_at_bracket_start", mark: "+", divides: false, test: (c) => c.before.endsWith("(") },
  { id: "plus.paren_before_closer", mark: "+", divides: false, test: (c) => c.after.startsWith(")") },
  { id: "plus.paren_after_comma", mark: "+", divides: false, test: (c) => /,\s*$/u.test(c.before) },
  // ---- the rest
  { id: "colon.after_restatement_before_word", mark: ":", divides: false, test: (c) => c.container === "top" },
  { id: "colon.in_verse_citation", mark: ":", divides: false, test: (c) => c.container === "paren" },
  { id: "exclamation.ends_a_cry_before_a_word", mark: "!", divides: false, test: (c) => c.container === "top" },
  { id: "question_mark.ends_question_word", mark: "?", divides: false, test: (c) => c.container === "top" },
  { id: "ampersand.stands_before_a_word", mark: "&", divides: false, test: (c) => c.container === "top" },
  { id: "grave_accent.in_transliterated_word", mark: "`", divides: false, test: (c) => c.container === "paren" },
  { id: "apostrophe.in_transliterated_word", mark: "'", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) && !/^s(?!\p{L})/u.test(c.after) },
  { id: "apostrophe.marks_possessive", mark: "'", divides: false, test: (c) => true },
  { id: "quote.around_cited_words", mark: "\"", divides: false, test: (c) => true },
  { id: "hebrew_accent_ole.in_cited_hebrew_word", mark: "֫", divides: false, test: (c) => true },
  { id: "hebrew_point_sheva.in_cited_hebrew_word", mark: "ְ", divides: false, test: (c) => true },
  { id: "hebrew_point_hataf_segol.in_cited_hebrew_word", mark: "ֱ", divides: false, test: (c) => true },
  { id: "hebrew_point_hataf_patah.in_cited_hebrew_word", mark: "ֲ", divides: false, test: (c) => true },
  { id: "hebrew_point_hiriq.in_cited_hebrew_word", mark: "ִ", divides: false, test: (c) => true },
  { id: "hebrew_point_tsere.in_cited_hebrew_word", mark: "ֵ", divides: false, test: (c) => true },
  { id: "hebrew_point_segol.in_cited_hebrew_word", mark: "ֶ", divides: false, test: (c) => true },
  { id: "hebrew_point_patah.in_cited_hebrew_word", mark: "ַ", divides: false, test: (c) => true },
  { id: "hebrew_point_qamats.in_cited_hebrew_word", mark: "ָ", divides: false, test: (c) => true },
  { id: "hebrew_point_holam.in_cited_hebrew_word", mark: "ֹ", divides: false, test: (c) => true },
  { id: "hebrew_point_dagesh_or_mapiq.in_cited_hebrew_word", mark: "ּ", divides: false, test: (c) => true },
  { id: "hebrew_point_shin_dot.in_cited_hebrew_word", mark: "ׁ", divides: false, test: (c) => true },
  { id: "hebrew_point_sin_dot.in_cited_hebrew_word", mark: "ׂ", divides: false, test: (c) => true },
];

// ---- the ask's own helper for rule 3 (ASK v1.1, rule 3), copied byte for byte ----
function unbalanced(text) {
  const st = [];
  for (const ch of text) {
    if (OPEN[ch]) st.push(ch);
    else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
  }
  return st.length > 0;
}

// ---- helpers of fragment shared ----
const NOTE_OPENERS = ["by mistake for","by confusion with","by correction for","by exchange for","by union with","by reading","by a false","by including the article","by contraction","including the art","includ. the article","with the article","from the margin","from margin","from the marg.","perhaps by clerical error","as in the margin","as one or two words","as if from","as such unrepresented","often used as a part","not maize","Doubtful.","Prop.","Superlative","Incl.","This seems","Also,","The Hiphil","which is often the rendering"];
const BRACKET_LABELS = ["Aramaic","subjectively","plural","dual","Chald","defective plural"];
const BRACKET_SIGNS = ["+","X"];
const TWO_RENDERINGS_TEXTS = ["(ac-)count; declare","(make to) go (away, up); grow (over) increase","an- (the) other; one sort","at unawares; unwittingly","brother(-ly); kindred","chap(-man); divers","chase (away); drive away","draught house; going forth","great(-ly); many","in (very) deed; of a surety","unrighteousness(-ly); wicked(-ness)"];
const TWO_STOP_TEXTS = ["landmark. place","thing. word","Ludim. Lydians"];
const WORD_AFTER_SENTENCE = ["--alway(-s)","--castle"];
const SECOND_SENSES = ["also a fastness; --castle"];
const WORD_AFTER_POINTER_OR_SPELLING = ["--power","-be removed","--flee","-- blasted","--flower","-extreme burning","-that which he laboured for","-howling","--blossom","--forgetfulness","--what manner","-wax","--ransom","-- cake","brier"];
const SECOND_SENSES_AFTER_POINTER = ["also a hawk (from it flashing speed); --blossom","also (of time) when?; or (of means) how?; --what manner","or (of means) how?; --what manner"];
const WORDS_AFTER_STOP_AFTER_POINTER = ["--holy (One)","-- bird"];
const NAMES_AFTER_SEMICOLON = ["--Enos","Shijon","Jeuel","Almon","Padon","-Jehiel","Ezra","Enosh"];
const SPELLING_CLAUSES = ["or (feminine) mtsuwdah","or mtsudah","or callown","or netsach","or pidyom","also pidyown","or pidyon"];
const LABELS_AFTER_SEMICOLON = ["causatively","by implication","properly","but usually (adverbially)","hence"];
const ORIGIN_OPENERS = ["(Aramaic) corresponding to","(Aramaic) from","a primitive root","apparently from","feminine of","for ","from ","of uncertain derivation","probably identical with","the same as"];
const ABBREVIATIONS = ["Marg","Prop","Incl","marg","includ","etym","etc"];
const BOOK_ABBREVIATIONS = ["Psa","Jer","Ezek","Hos"];
const WORD_ENDS_ALONE = ["-s","-th"];
const sentenceText = (text) => text.includes(";") && !TWO_RENDERINGS_TEXTS.includes(text);
const isWholeText = (text, g) => { const t = text.trim(); return t === "(" + g + ")" || t === "X (" + g + ")"; };
function oneInnerBracket(g) { if (!g.startsWith("(") || !g.endsWith(")")) return false; let d = 0; for (let k = 0; k < g.length; k++) { if (g[k] === "(") d++; else if (g[k] === ")") { d--; if (d === 0 && k < g.length - 1) return false; } } return d === 0; }
const beforePair = (c) => (c.mark === "(" ? c.before : c.before.slice(0, c.before.length - c.group.length - 1));
const afterPair = (c) => (c.mark === ")" ? c.after : c.after.slice(c.group.length + 1));
function pairKind(c) {
  const g = c.group;
  if (c.depth > 0) return /^\s*-/u.test(g) ? "inner_end" : /-\s*$/u.test(g) ? "inner_start" : "inner_words";
  if (/\p{N}:\p{N}/u.test(g)) return "citation";
  if (NOTE_OPENERS.some((w) => g.startsWith(w))) return "note";
  if (BRACKET_LABELS.includes(g)) return "label";
  if (sentenceText(c.text)) return "sentence";
  if (BRACKET_SIGNS.includes(g.trim())) return "sign";
  if (isWholeText(c.text, g)) return "whole";
  if (oneInnerBracket(g)) return "doubled";
  if (g.includes(",")) return "choices";
  if (/^\s*-/u.test(g)) return "word_end";
  if (/-\s*$/u.test(g)) return "word_start";
  const b = beforePair(c), a = afterPair(c);
  if (/\p{L}$/u.test(b) || /^\p{L}/u.test(a)) return "against";
  const bt = b.trim();
  if (bt === "" || bt === "X" || bt === "+" || bt === "-") return "words_first";
  if (a.trim() === "") return "words_last";
  return "words_between";
}
function beforeHolder(before) { let d = 0; for (let k = before.length - 1; k >= 0; k--) { const ch = before[k]; if (ch === ")") d++; else if (ch === "(") { if (d === 0) return before.slice(0, k); d--; } } return ""; }
function afterHolder(after) { let d = 0; for (let k = 0; k < after.length; k++) { const ch = after[k]; if (ch === "(") d++; else if (ch === ")") { if (d === 0) return after.slice(k + 1); d--; } } return ""; }
const clauseBefore = (c) => c.before.slice(c.before.lastIndexOf(";") + 1).trim();
const inIe = (c) => c.before.endsWith("i.e") || (c.before.endsWith("i") && c.after.startsWith("e."));
const wordBeforeStop = (c) => { const m = /\p{L}+$/u.exec(c.before); return m ? m[0] : ""; };

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
