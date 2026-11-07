// openscriptures_strongs.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  // ---- fragment comma ----
// comma.shapes.txt · reader "comma" · openscriptures_strongs · ask v1.1 · 31 October 2026 AD
// Entries for the template's SHAPES, inserted verbatim. For the comma, the first entry whose test is true names the occurrence.
// Nothing here divides (rule 12): the shapes that a guess about the field admits rest in branch b1.
{ id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
// ---- top level: the usage field's list of King James renderings and what stands around it
{ id: "comma.at_end_of_text", mark: ",", divides: false, test: (c) => c.container === "top" && /^\s*$/u.test(c.after) },
{ id: "comma.between_pointer_numbers", mark: ",", divides: false, test: (c) => c.container === "top" && /\d\s*$/u.test(c.before) && /^\s*\d/u.test(c.after) },
{ id: "comma.right_after_period", mark: ",", divides: false, test: (c) => c.container === "top" && /\.$/u.test(c.before) },
{ id: "comma.in_note_after_list", mark: ",", divides: false, test: (c) => c.container === "top" && commaIsListRoute(c.text) && COMMA_CLOSING_PERIOD.test(COMMA_STRIP(c.before)) },
{ id: "comma.in_list_with_trailing_note", mark: ",", divides: false, test: (c) => c.container === "top" && commaHasTrailingNote(c.text) },
{ id: "comma.in_list_ending_in_grammar_label", mark: ",", divides: false, test: (c) => { if (c.container !== "top" || !commaIsListRoute(c.text)) return false; const w = COMMA_STRIP(c.text); return !COMMA_CLOSING_PERIOD.test(w) && !/;/u.test(w) && commaLabelLastPiece(c.text); } },
{ id: "comma.in_list_with_irregular_piece", mark: ",", divides: false, test: (c) => c.container === "top" && commaIsListRoute(c.text) && commaHasIrregularPiece(c.text) },
{ id: "comma.in_list_with_semicolons", mark: ",", divides: false, test: (c) => c.container === "top" && commaIsListRoute(c.text) && COMMA_CLOSING_PERIOD.test(COMMA_STRIP(c.after)) && /;/u.test(COMMA_STRIP(c.text)) && !semiLaterPiecesUnlabelled(c.text) },
// ---- the three shapes below cut a King James list at its commas (branch B01); the two shapes before them take the commas of such a list that stand beside a flagged piece (a piece that opens with the multiplication sign or the plus sign, after any bracket groups at its start):
// the comma after a flagged piece that opens a list or a group, and the comma before a flagged piece; whether a flagged piece is a reading of its own is branch B02
{ id: "comma.after_opening_flagged_piece", mark: ",", divides: false, test: (c) => c.container === "top" && commaOpeningFlaggedPiece(c) !== null && commaListComma(c) },
{ id: "comma.before_flagged_piece", mark: ",", divides: false, test: (c) => c.container === "top" && COMMA_FLAG_START.test(COMMA_STRIP(c.after)) && commaListComma(c) },
{ id: "comma.between_renderings_in_semicolon_list", mark: ",", divides: false, test: (c) => commaCutAtSemicolons(c) },
{ id: "comma.between_kjv_renderings", mark: ",", divides: false, test: (c) => commaBetweenKjv(c) },
{ id: "comma.in_long_list_without_final_period", mark: ",", divides: false, test: (c) => commaInLongList(c) },
{ id: "comma.in_short_list_without_final_period", mark: ",", divides: false, test: (c) => {
    if (c.container !== "top" || !commaIsListRoute(c.text)) return false;
    const w = COMMA_STRIP(c.text);
    if (COMMA_CLOSING_PERIOD.test(w) || /;/u.test(w)) return false;
    if (COMMA_ADVERB_OPENERS.includes(commaLastClause(c.before))) return false;
    return w.split(",").every((p) => { const q = p.replace(/\u0001/gu, " ").trim(); const ws = q.split(/\s+/u).filter(Boolean); return ws.length >= 1 && ws.length <= 3 && !/^\p{Lu}/u.test(q) && !ws.some((x) => COMMA_FUNCTION_WORDS.includes(x.toLowerCase())); });
  } },
// ---- top level: the meaning field's running definition
{ id: "comma.before_ie", mark: ",", divides: false, test: (c) => c.container === "top" && /^\s*i\.e\./u.test(c.after) },
{ id: "comma.before_etc", mark: ",", divides: false, test: (c) => c.container === "top" && /^\s*etc\./u.test(c.after) },
{ id: "comma.after_proper_name", mark: ",", divides: false, test: (c) => {
    if (c.container !== "top") return false;
    const clause = c.before.slice(c.before.lastIndexOf(";") + 1).trim();
    return /^\p{Lu}[\p{L}'’-]*(?:\s*\([^()]*\))?(?:\s*(?:,|or)\s*\p{Lu}[\p{L}'’-]*(?:\s*\([^()]*\))?)*$/u.test(clause);
  } },
{ id: "comma.after_adverb_opener", mark: ",", divides: false, test: (c) => c.container === "top" && COMMA_ADVERB_OPENERS.includes(commaLastClause(c.before)) },
{ id: "comma.before_joining_word", mark: ",", divides: false, test: (c) => { if (c.container !== "top") return false; const m = /^\s*(\p{L}+)/u.exec(c.after); return !!m && COMMA_JOINING_WORDS.includes(m[1].toLowerCase()); } },
{ id: "comma.after_tagged_gloss", mark: ",", divides: false, test: (c) => c.container === "top" && /\s$/u.test(c.before) },
{ id: "comma.in_definition", mark: ",", divides: false, test: (c) => c.container === "top" },
// ---- inside round brackets
{ id: "comma.paren_in_nested_group", mark: ",", divides: false, test: (c) => c.container === "paren" && c.depth >= 2 },
{ id: "comma.paren_beside_hyphen", mark: ",", divides: false, test: (c) => c.container === "paren" && (/-$/u.test(c.before) || /^\s*-/u.test(c.after)) },
{ id: "comma.paren_in_note_after_list", mark: ",", divides: false, test: (c) => c.container === "paren" && commaIsListRoute(c.text) && COMMA_CLOSING_PERIOD.test(COMMA_STRIP(commaBeforeGroup(c.before))) },
{ id: "comma.paren_between_optional_words", mark: ",", divides: false, test: (c) => c.container === "paren" && commaIsListRoute(c.text) && COMMA_CLOSING_PERIOD.test(COMMA_STRIP(c.text)) },
{ id: "comma.paren_after_opener", mark: ",", divides: false, test: (c) => c.container === "paren" && COMMA_ADVERB_OPENERS.includes(commaLastClause(commaInsideBefore(c.before))) },
{ id: "comma.paren_before_ie", mark: ",", divides: false, test: (c) => c.container === "paren" && /^\s*i\.e\./u.test(c.after) },
{ id: "comma.paren_before_etc", mark: ",", divides: false, test: (c) => c.container === "paren" && /^\s*etc\./u.test(c.after) },
{ id: "comma.paren_before_joining_word", mark: ",", divides: false, test: (c) => { if (c.container !== "paren") return false; const m = /^\s*(\p{L}+)/u.exec(c.after); return !!m && COMMA_JOINING_WORDS.includes(m[1].toLowerCase()); } },
{ id: "comma.paren_after_tagged_gloss", mark: ",", divides: false, test: (c) => c.container === "paren" && /\s$/u.test(c.before) },
{ id: "comma.paren_in_aside", mark: ",", divides: false, test: (c) => c.container === "paren" },
// ---- inside square brackets
{ id: "comma.bracket_after_tagged_gloss", mark: ",", divides: false, test: (c) => c.container === "bracket" && /\s$/u.test(c.before) },
{ id: "comma.bracket_before_correction", mark: ",", divides: false, test: (c) => c.container === "bracket" && /^\s*corrected\b/u.test(c.after) },
{ id: "comma.bracket_in_note", mark: ",", divides: false, test: (c) => c.container === "bracket" },
  // ---- fragment period-semicolon ----
  // ---- SEMICOLON (reader period-semicolon, version 1.1) ----
  { id: "semicolon.in_unbalanced_text", mark: ";", divides: false, test: (c) => unbalanced(c.text) },
  { id: "semicolon.top_ends_text", mark: ";", divides: false, test: (c) => c.container === "top" && /^\s*$/u.test(c.after) },
  { id: "semicolon.top_beside_another_mark", mark: ";", divides: false, test: (c) => c.container === "top" && (!/[\p{L}\p{N})\]?!]\s*$/u.test(c.before) || !/^\s*[\p{L}\p{N}(\[]/u.test(c.after)) },
  { id: "semicolon.top_in_name_entry", mark: ";", divides: false, test: (c) => c.container === "top" && /^\s*\p{Lu}[\p{L}'’-]*(?:\s+\p{Lu}[\p{L}'’-]*)*\s*(?:,|;|\.|or\s|\(or(?![\p{L}]))/u.test(c.text) },
  { id: "semicolon.top_before_restatement", mark: ";", divides: false, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "restatement" },
  { id: "semicolon.top_before_usage_note", mark: ";", divides: false, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "note" },
  { id: "semicolon.top_before_name_description", mark: ";", divides: false, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "name_description" },
  { id: "semicolon.top_beside_stranded_label", mark: ";", divides: false, test: (c) => c.container === "top" && (!semiHasHead(semiPieceBefore(c)) || !semiHasHead(semiPieceAfter(c))) },
  { id: "semicolon.top_between_kjv_groups", mark: ";", divides: false, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "other" && semiLooksLikeKjvList(c.text) && semiLaterPiecesUnlabelled(c.text) && !commaHasTrailingNote(c.text) },
  { id: "semicolon.top_before_unlabelled_sense", mark: ";", divides: false, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "other" },
  { id: "semicolon.top_in_text_with_leaning_piece", mark: ";", divides: false, test: (c) => c.container === "top" && semiCutsCleanly(c.text) && !semiAllStandAlone(c.text) },
  { id: "semicolon.top_in_text_not_cut_cleanly", mark: ";", divides: false, test: (c) => c.container === "top" && !semiCutsCleanly(c.text) },
  { id: "semicolon.top_before_also", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "also" },
  { id: "semicolon.top_before_hence", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "hence" },
  { id: "semicolon.top_before_transfer", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "transfer" },
  { id: "semicolon.top_before_figurative", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "figurative" },
  { id: "semicolon.top_before_narrowing", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "narrowing" },
  { id: "semicolon.top_before_named_use", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "named_use" },
  { id: "semicolon.top_before_plain_sense", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "plain" },
  { id: "semicolon.top_before_alternative", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "alternative" },
  { id: "semicolon.top_before_bracketed_label", mark: ";", divides: true, test: (c) => c.container === "top" && semiKind(semiPieceAfter(c)) === "bracketed" },
  { id: "semicolon.paren_before_sense_label", mark: ";", divides: false, test: (c) => c.container === "paren" && SEMI_PAREN_LABEL_KINDS.includes(semiKind(c.after)) },
  { id: "semicolon.paren_inside_aside", mark: ";", divides: false, test: (c) => c.container === "paren" },
  // ---- PERIOD (reader period-semicolon, version 1.1) ----
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.top_in_run_of_dots", mark: ".", divides: false, test: (c) => c.container === "top" && periodInRun(c) },
  { id: "period.top_in_ie", mark: ".", divides: false, test: (c) => c.container === "top" && periodInIe(c) },
  { id: "period.top_in_eg", mark: ".", divides: false, test: (c) => c.container === "top" && periodInEg(c) },
  { id: "period.top_ends_text", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s*$/u.test(c.after) },
  { id: "period.top_after_abbreviation", mark: ".", divides: false, test: (c) => c.container === "top" && PERIOD_ABBREVIATIONS.includes(periodWordBefore(c.before)) },
  { id: "period.top_before_pointer", mark: ".", divides: false, test: (c) => c.container === "top" && periodStartsWithPointer(c.after) },
  { id: "period.top_before_bracketed_note", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s*[(\[]/u.test(c.after) },
  { id: "period.top_before_ie_restatement", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s*(?:i\.e|e\.g)(?![\p{L}])/u.test(c.after) },
  { id: "period.top_before_closing_quote", mark: ".", divides: false, test: (c) => c.container === "top" && c.after.startsWith("'") },
  { id: "period.top_before_stray_letters", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s*\p{Ll}{1,2}\s*$/u.test(c.after) },
  { id: "period.top_before_last_word", mark: ".", divides: false, test: (c) => c.container === "top" && /[\p{L})]$/u.test(c.before) && /^\s+[\p{L}'-]+\.\s*$/u.test(c.after) },
  { id: "period.top_before_sentence_note", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s+[\p{Lu}\p{Script=Hebrew}]/u.test(c.after) },
  { id: "period.top_other", mark: ".", divides: false, test: (c) => c.container === "top" },
  { id: "period.paren_in_run_of_dots", mark: ".", divides: false, test: (c) => c.container === "paren" && periodInRun(c) },
  { id: "period.paren_in_ie", mark: ".", divides: false, test: (c) => c.container === "paren" && periodInIe(c) },
  { id: "period.paren_in_eg", mark: ".", divides: false, test: (c) => c.container === "paren" && periodInEg(c) },
  { id: "period.paren_after_abbreviation", mark: ".", divides: false, test: (c) => c.container === "paren" && PERIOD_ABBREVIATIONS.includes(periodWordBefore(c.before)) },
  { id: "period.paren_ends_aside", mark: ".", divides: false, test: (c) => c.container === "paren" && /^\s*\)/u.test(c.after) },
  { id: "period.paren_other", mark: ".", divides: false, test: (c) => c.container === "paren" },
  { id: "period.bracket_after_abbreviation", mark: ".", divides: false, test: (c) => c.container === "bracket" && PERIOD_ABBREVIATIONS.includes(periodWordBefore(c.before)) },
  { id: "period.bracket_other", mark: ".", divides: false, test: (c) => c.container === "bracket" },
  // ---- fragment paren ----
// paren.shapes.txt · reader "paren" · openscriptures_strongs · ask v1.1 · 31 October 2026 AD
// Entries for the template's SHAPES, inserted verbatim. For each mark the first entry whose test is true names the occurrence.
// Nothing here divides: a round bracket never stands between two readings (see the meanings), and no shape of mine rests in a branch.
{ id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.container === "top" && c.group === null },
{ id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => c.container === "top" && c.group === "" && !c.before.endsWith("(") },
{ id: "open_paren.holds_blank", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.blank(c.group) },
{ id: "close_paren.holds_blank", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.blank(c.group) },
{ id: "open_paren.holds_doubt", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.doubt(c.group) },
{ id: "close_paren.holds_doubt", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.doubt(c.group) },
{ id: "open_paren.holds_round", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.round(c.group) },
{ id: "close_paren.holds_round", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.round(c.group) },
{ id: "open_paren.holds_square", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.square(c.group) },
{ id: "close_paren.holds_square", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.square(c.group) },
{ id: "open_paren.holds_verse", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.verse(c.group) },
{ id: "close_paren.holds_verse", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.verse(c.group) },
{ id: "open_paren.holds_number", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.number(c.group) },
{ id: "close_paren.holds_number", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.number(c.group) },
{ id: "open_paren.holds_times", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.times(c.group) },
{ id: "close_paren.holds_times", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.times(c.group) },
{ id: "open_paren.holds_plus", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.plus(c.group) },
{ id: "close_paren.holds_plus", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.plus(c.group) },
{ id: "open_paren.holds_quotation", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.quotation(c.group) },
{ id: "close_paren.holds_quotation", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.quotation(c.group) },
{ id: "open_paren.holds_hyphen_piece", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.hyphen_piece(c.group) },
{ id: "close_paren.holds_hyphen_piece", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.hyphen_piece(c.group) },
{ id: "open_paren.holds_restatement", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.restatement(c.group) },
{ id: "close_paren.holds_restatement", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.restatement(c.group) },
{ id: "open_paren.holds_alternative", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.alternative(c.group) },
{ id: "close_paren.holds_alternative", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.alternative(c.group) },
{ id: "open_paren.holds_label", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.label(c.group) },
{ id: "close_paren.holds_label", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.label(c.group) },
{ id: "open_paren.holds_small_words", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.small(c.group) },
{ id: "close_paren.holds_small_words", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.small(c.group) },
{ id: "open_paren.holds_source", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.source(c.group) },
{ id: "close_paren.holds_source", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.source(c.group) },
{ id: "open_paren.holds_joining", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.joining(c.group) },
{ id: "close_paren.holds_joining", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.joining(c.group) },
{ id: "open_paren.holds_rest_of_word", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.one_word(c.group) && /\p{L}/u.test(c.before.slice(-1)) },
{ id: "close_paren.holds_rest_of_word", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.one_word(c.group) && /\p{L}/u.test(c.before.charAt(c.before.length - c.group.length - 2)) },
{ id: "open_paren.holds_start_of_word", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.one_word(c.group) && PAREN_WORD_START_WORDS.includes(c.group.trim()) },
{ id: "close_paren.holds_start_of_word", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.one_word(c.group) && PAREN_WORD_START_WORDS.includes(c.group.trim()) },
{ id: "open_paren.holds_one_word", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.one_word(c.group) },
{ id: "close_paren.holds_one_word", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.one_word(c.group) },
{ id: "open_paren.holds_other", mark: "(", divides: false, test: (c) => c.container === "top" && c.group !== null && PAREN_HOLDS.other(c.group) },
{ id: "close_paren.holds_other", mark: ")", divides: false, test: (c) => c.container === "top" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.other(c.group) },
{ id: "open_paren.in_paren_holds_hyphen_piece", mark: "(", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.hyphen_piece(c.group) },
{ id: "close_paren.in_paren_holds_hyphen_piece", mark: ")", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.hyphen_piece(c.group) },
{ id: "open_paren.in_paren_holds_label", mark: "(", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.label(c.group) },
{ id: "close_paren.in_paren_holds_label", mark: ")", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.label(c.group) },
{ id: "open_paren.in_paren_holds_one_word", mark: "(", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.one_word(c.group) },
{ id: "close_paren.in_paren_holds_one_word", mark: ")", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.one_word(c.group) },
{ id: "open_paren.in_paren_holds_other", mark: "(", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.other(c.group) },
{ id: "close_paren.in_paren_holds_other", mark: ")", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.other(c.group) },
{ id: "hyphen.in_paren_ending_piece", mark: "-", divides: false, test: (c) => c.container === "paren" && !/\p{L}/u.test(c.before.slice(-1)) && /\p{L}/u.test(c.after.slice(0, 1)) },
{ id: "hyphen.in_paren_beginning_piece", mark: "-", divides: false, test: (c) => c.container === "paren" && /\p{L}/u.test(c.before.slice(-1)) && !/\p{L}/u.test(c.after.slice(0, 1)) },
{ id: "hyphen.in_paren_inside_word", mark: "-", divides: false, test: (c) => c.container === "paren" && /\p{L}/u.test(c.before.slice(-1)) && /\p{L}/u.test(c.after.slice(0, 1)) },
{ id: "hyphen.in_paren_standing_alone", mark: "-", divides: false, test: (c) => c.container === "paren" && !/\p{L}/u.test(c.before.slice(-1)) && !/\p{L}/u.test(c.after.slice(0, 1)) },
{ id: "times.in_paren_phrase_flag", mark: "×", divides: false, test: (c) => c.container === "paren" },
{ id: "apostrophe.in_paren_possessive", mark: "'", divides: false, test: (c) => c.container === "paren" && c.after.slice(0, 1) === "s" && !/\p{L}/u.test(c.after.slice(1, 2)) },
{ id: "apostrophe.in_paren_opens_quotation", mark: "'", divides: false, test: (c) => c.container === "paren" && !/[\p{L}\p{N}]/u.test(c.before.slice(-1)) && /\p{L}/u.test(c.after.slice(0, 1)) },
{ id: "apostrophe.in_paren_closes_quotation", mark: "'", divides: false, test: (c) => c.container === "paren" && c.before.slice(-1) !== "" && !/\s/u.test(c.before.slice(-1)) && !/\p{L}/u.test(c.after.slice(0, 1)) },
{ id: "colon.in_paren_between_chapter_and_verse", mark: ":", divides: false, test: (c) => c.container === "paren" && /\d/u.test(c.before.slice(-1)) && /\d/u.test(c.after.slice(0, 1)) },
{ id: "question_mark.in_paren_doubt", mark: "?", divides: false, test: (c) => c.container === "paren" && c.inner.trim() === "?" },
{ id: "question_mark.in_paren_after_question_word", mark: "?", divides: false, test: (c) => c.container === "paren" && /\p{L}/u.test(c.before.slice(-1)) },
{ id: "exclamation.in_paren_after_exclamation_word", mark: "!", divides: false, test: (c) => c.container === "paren" && /\p{L}/u.test(c.before.slice(-1)) },
{ id: "plus.in_paren_before_added_pieces", mark: "+", divides: false, test: (c) => c.container === "paren" },
{ id: "open_bracket.in_paren_holds_number", mark: "[", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.number(c.group) },
{ id: "close_bracket.in_paren_holds_number", mark: "]", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.number(c.group) },
{ id: "open_bracket.in_paren_holds_hyphen_piece", mark: "[", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.hyphen_piece(c.group) },
{ id: "close_bracket.in_paren_holds_hyphen_piece", mark: "]", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.hyphen_piece(c.group) },
{ id: "open_bracket.in_paren_holds_other", mark: "[", divides: false, test: (c) => c.container === "paren" && c.group !== null && PAREN_HOLDS.other(c.group) },
{ id: "close_bracket.in_paren_holds_other", mark: "]", divides: false, test: (c) => c.container === "paren" && PAREN_CLOSER_PAIRED(c) && PAREN_HOLDS.other(c.group) },
  // ---- fragment rest ----
// rest reader (ask v1.1): the multiplication sign, plus sign, hyphen, apostrophe, exclamation and question marks, square brackets at top level, the hyphen inside square brackets, two Hebrew points, the right single quotation mark and a stray closing curly brace. No shape here divides: none of these marks is a boundary between two readings.
  { id: "times.opens_route", mark: "×", divides: false, test: (c) => c.container === "top" && c.before === "" },
  { id: "times.after_comma", mark: "×", divides: false, test: (c) => c.container === "top" && /,\s$/u.test(c.before) },
  { id: "times.after_closing_paren", mark: "×", divides: false, test: (c) => c.container === "top" && /\)\s$/u.test(c.before) },
  { id: "times.after_word_in_rendering", mark: "×", divides: false, test: (c) => c.container === "top" && /\p{L}\s$/u.test(c.before) },
  { id: "plus.opens_route", mark: "+", divides: false, test: (c) => c.container === "top" && c.before === "" },
  { id: "plus.after_comma", mark: "+", divides: false, test: (c) => c.container === "top" && /,\s$/u.test(c.before) },
  { id: "hyphen.joins_compound_word", mark: "-", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.joins_split_compound", mark: "-", divides: false, test: (c) => c.container === "top" && ((/\p{L}$/u.test(c.before) && /^\s/u.test(c.after)) || (/\p{L}\s$/u.test(c.before) && /^\p{L}/u.test(c.after))) },
  { id: "hyphen.joins_across_bracketed_insertion", mark: "-", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && c.after.startsWith("(") },
  { id: "hyphen.ends_cited_name_start", mark: "-", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && (c.after.startsWith("'") || c.after.startsWith(".")) },
  { id: "hyphen.begins_cited_name_ending", mark: "-", divides: false, test: (c) => c.container === "top" && c.before.endsWith("'") && /^\p{L}/u.test(c.after) },
  { id: "hyphen.begins_ending_in_unclosed_bracket", mark: "-", divides: false, test: (c) => c.container === "top" && c.before.endsWith("(") && /^\p{L}/u.test(c.after) },
  { id: "hyphen.begins_loose_ending", mark: "-", divides: false, test: (c) => c.container === "top" && !/\p{L}$/u.test(c.before) && !/\p{L}\s$/u.test(c.before) && !c.before.endsWith("(") && !c.before.endsWith("'") && /^\p{L}/u.test(c.after) },
  { id: "hyphen.begins_ending_in_square_bracket", mark: "-", divides: false, test: (c) => c.container === "bracket" && c.before.endsWith("[") && /^\p{L}/u.test(c.after) },
  { id: "apostrophe.possessive_before_s", mark: "'", divides: false, test: (c) => c.container === "top" && /\p{L}$/u.test(c.before) && c.after.startsWith("s") },
  { id: "apostrophe.opens_quotation", mark: "'", divides: false, test: (c) => c.container === "top" && (c.before === "" || /\s$/u.test(c.before)) && /^\S/u.test(c.after) },
  { id: "apostrophe.closes_quotation", mark: "'", divides: false, test: (c) => c.container === "top" && /\S$/u.test(c.before) && !/^\p{L}/u.test(c.after) && restUnpairedApostrophesBefore(c.text, c.i) % 2 === 1 },
  { id: "apostrophe.possessive_after_s", mark: "'", divides: false, test: (c) => c.container === "top" && c.before.endsWith("s") && !/^\p{L}/u.test(c.after) && restUnpairedApostrophesBefore(c.text, c.i) % 2 === 0 },
  { id: "right_single_quotation_mark.possessive_after_s", mark: "’", divides: false, test: (c) => c.container === "top" && c.before.endsWith("s") },
  { id: "exclamation.ends_interjection", mark: "!", divides: false, test: (c) => c.container === "top" },
  { id: "question_mark.ends_question_word", mark: "?", divides: false, test: (c) => c.container === "top" },
  { id: "open_bracket.holds_strongs_number", mark: "[", divides: false, test: (c) => c.container === "top" && c.group !== null && /^\s*[0-9]+\s*$/u.test(c.group) },
  { id: "open_bracket.holds_doubtful_note", mark: "[", divides: false, test: (c) => c.container === "top" && c.group === "Doubtful." },
  { id: "open_bracket.holds_whole_field_note", mark: "[", divides: false, test: (c) => c.container === "top" && c.group !== null && c.before === "" },
  { id: "open_bracket.holds_added_words", mark: "[", divides: false, test: (c) => c.container === "top" && c.group !== null && /\p{L}/u.test(c.group) },
  { id: "close_bracket.holds_strongs_number", mark: "]", divides: false, test: (c) => c.container === "top" && c.group !== "" && /^\s*[0-9]+\s*$/u.test(c.group) },
  { id: "close_bracket.holds_doubtful_note", mark: "]", divides: false, test: (c) => c.container === "top" && c.group === "Doubtful." },
  { id: "close_bracket.holds_whole_field_note", mark: "]", divides: false, test: (c) => c.container === "top" && c.group !== "" && c.before === "[" + c.group },
  { id: "close_bracket.holds_added_words", mark: "]", divides: false, test: (c) => c.container === "top" && c.group !== "" && /\p{L}/u.test(c.group) },
  { id: "hebrew_point_hataf_patah.under_hebrew_letter", mark: "ֲ", divides: false, test: (c) => c.container === "top" && /[א-ת]$/u.test(c.before) },
  { id: "hebrew_point_hiriq.under_hebrew_letter", mark: "ִ", divides: false, test: (c) => c.container === "top" && /[א-ת]$/u.test(c.before) },
  { id: "close_brace.never_opened", mark: "}", divides: false, test: (c) => c.container === "top" && !c.text.includes("{") },
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

// ---- helpers of fragment comma ----
// comma.helpers.txt · reader "comma" · openscriptures_strongs · ask v1.1 · 31 October 2026 AD
// Word lists and steps used by the comma tests; each is also written out in comma.meta.json under definitions. Every name starts with comma/COMMA so that it cannot meet another reader's helper.
const COMMA_STRIP = (t) => { let p; do { p = t; t = t.replace(/\([^()]*\)|\[[^\[\]]*\]/gu, "\u0001"); } while (t !== p); return t; };
const COMMA_CLOSING_PERIOD = /[\p{L}\p{N}\u0001)\]]\.(?:\s|$|['’"])/u;
function commaIsListRoute(text) {
  const w = COMMA_STRIP(text);
  return !/\s,(?!\s*\d)/u.test(w) && !/\s;/u.test(w) && !/i\.e\.|e\.g\./u.test(text);
}
// the stripped text after the first closing period, trimmed; null when there is no closing period
function commaTailOf(text) {
  const w = COMMA_STRIP(text);
  const m = COMMA_CLOSING_PERIOD.exec(w);
  return m ? w.slice(m.index + 2).trim() : null;
}
// the definition "trailing_note": a list route whose tail after the first closing period is not empty, is not one word of letters, apostrophes and hyphens with one full stop (the last rendering, written after a full stop where a comma would stand),
// is not one lowercase letter and nothing else (a stray letter of the source's text), and does not begin with See or Compare
const COMMA_LAST_WORD_TAIL = /^[\p{L}'-]+\.$/u;
function commaHasTrailingNote(text) {
  if (!commaIsListRoute(text)) return false;
  const t = commaTailOf(text);
  return t !== null && t !== "" && !COMMA_LAST_WORD_TAIL.test(t) && !/^\p{Ll}$/u.test(t) && !/^(?:See|Compare)\b/u.test(t);
}
// some comma-separated piece of the stripped text up to and including its first closing period is empty, only signs and groups, begins with a hyphen,
// or (when it is not the last piece) ends in a full stop
function commaHasIrregularPiece(text) {
  const w = COMMA_STRIP(text);
  const m = COMMA_CLOSING_PERIOD.exec(w);
  if (!m) return false;
  const ps = w.slice(0, m.index + 2).split(",");
  return ps.some((p, k) => /^[\s×+\u0001.]*$/u.test(p) || /^\s*-/u.test(p) || (k < ps.length - 1 && /\.\s*$/u.test(p)));
}
// the tests of the three shapes that cut a King James list at its commas (comma.between_renderings_in_semicolon_list, comma.between_kjv_renderings, comma.in_long_list_without_final_period);
// the shapes comma.after_opening_flagged_piece and comma.before_flagged_piece, which stand before them, take the commas of those three that stand beside a flagged piece
const commaCutAtSemicolons = (c) => c.container === "top" && commaIsListRoute(c.text) && COMMA_CLOSING_PERIOD.test(COMMA_STRIP(c.after)) && /;/u.test(COMMA_STRIP(c.text)) && semiLaterPiecesUnlabelled(c.text);
const commaBetweenKjv = (c) => c.container === "top" && commaIsListRoute(c.text) && COMMA_CLOSING_PERIOD.test(COMMA_STRIP(c.after));
const commaInLongList = (c) => { if (c.container !== "top" || !commaIsListRoute(c.text)) return false; const w = COMMA_STRIP(c.text); return !COMMA_CLOSING_PERIOD.test(w) && !/;/u.test(w) && w.split(",").length - 1 >= 5; };
// the definition "list_comma": the comma satisfies one of the three tests above, each read by itself as if no shape stood above it
const commaListComma = (c) => commaCutAtSemicolons(c) || commaBetweenKjv(c) || commaInLongList(c);
// the definition "flag_start" (of a stripped text): after its leading whitespace and after any number of groups (each one U+0001 of the stripped text, followed by any amount of whitespace, possibly none) the next character is the multiplication sign or the plus sign
const COMMA_FLAG_START = /^\s*(?:\u0001\s*)*[×+]/u;
// the definition "opening_flagged_piece" (of the text before a comma): that text with its groups replaced by U+0001, cut after its last semicolon (all of it when it has none); null when what is left holds a comma or does not start with a flag (flag_start)
const commaOpeningFlaggedPiece = (c) => { const s = COMMA_STRIP(c.before); const t = s.slice(s.lastIndexOf(";") + 1); if (/,/u.test(t)) return null; const u = t.trim(); return COMMA_FLAG_START.test(u) ? u : null; };
// the definition "label_last_piece": the part of the stripped text after its last comma, with the whitespace and U+0001 at its start removed, begins with one of the grammar labels as its first run of letters
const commaLabelLastPiece = (text) => { const w = COMMA_STRIP(text); const t = w.slice(w.lastIndexOf(",") + 1).replace(/^[\s\u0001]+/u, ""); const m = /^\p{L}+/u.exec(t); return !!m && COMMA_GRAMMAR_LABELS.includes(m[0]); };
const COMMA_ADVERB_OPENERS = ["properly", "figuratively", "by implication", "hence", "specifically", "by analogy", "causatively", "concretely", "by extension", "abstractly", "generally", "adverbially", "intensively", "reflexively", "transitively", "intransitively", "as noun", "by euphemism", "euphemistically", "locally", "technically", "literally", "collectively", "abstract", "concrete", "used adverbially", "also", "adverb", "subjectively", "objectively", "physically"];
const COMMA_JOINING_WORDS = ["or", "and", "but", "also", "either", "both", "besides", "including", "especially", "literally", "figuratively", "whether", "probably", "perhaps", "often", "usually"];
const COMMA_GRAMMAR_LABELS = ["participle", "singular"];
const COMMA_FUNCTION_WORDS = ["a", "an", "the", "to", "of", "in", "for", "with", "by", "from", "that", "which", "whether", "perhaps", "probably", "especially", "properly", "hence", "literally", "figuratively", "generally", "usually", "as", "it", "is", "used", "and", "or", "also", "but", "subjectively", "objectively", "physically", "morally", "abstractly", "concretely", "causatively", "specifically"];
// the text between the innermost round bracket that holds the comma and the comma
function commaInsideBefore(before) { let d = 0; for (let k = before.length - 1; k >= 0; k--) { const ch = before[k]; if (ch === ")") d++; else if (ch === "(") { if (d === 0) return before.slice(k + 1); d--; } } return ""; }
// the text before the round bracket that holds the comma
function commaBeforeGroup(before) { return before.slice(0, before.length - commaInsideBefore(before).length - 1); }
// the text after its last semicolon (the whole text if it has none), trimmed and in lowercase
const commaLastClause = (s) => s.slice(s.lastIndexOf(";") + 1).trim().toLowerCase();
// ---- helpers of fragment period-semicolon ----
// ---- helpers of reader period-semicolon (version 1.1): the word lists and steps the tests use; each is a definition of the same name in the meta file ----
// the definition "also words"
const SEMI_ALSO = ["also", "likewise"];
// the definition "hence words"
const SEMI_HENCE = ["hence"];
// the definition "transfer words"
const SEMI_TRANSFER = ["by"];
// the definition "figurative words"
const SEMI_FIGURATIVE = ["figuratively", "figurative"];
// the definition "narrowing words"
const SEMI_NARROWING = ["specifically", "especially", "generally"];
// the definition "named-use words"
const SEMI_NAMED_USE = ["causatively", "intensively", "reflexively", "transitively", "intransitively", "collectively", "concretely", "abstractly", "mentally", "morally", "locally", "technically", "architecturally", "passively", "euphemistically", "adverbially", "concrete", "abstract", "transitive", "intransitive", "adverb", "as", "feminine", "reflex", "reflexive", "intensive", "reciprocal", "dual", "physical", "mental", "moral", "architectural", "architecture", "religious", "relatively", "conventionally", "frequentatively", "indefinitely", "medically", "inceptively", "incipiently", "ceremonially", "definitely", "imperatively", "violently", "positively", "adversatively", "objectively", "elliptically", "trans", "poet"];
// the definition "in-sense words"
const SEMI_IN_SENSE = ["good", "bad", "qualified"];
// the definition "plain-opener words"
const SEMI_PLAIN = ["to", "a", "an", "the"];
// the definition "alternative words"
const SEMI_ALTERNATIVE = ["or"];
// the definition "usage-note words"
const SEMI_NOTE = ["used", "only", "often", "usually", "sometimes", "occasionally", "rarely", "mostly", "chiefly", "spoken", "others", "but"];
// the definition "label words"
const SEMI_LABEL_WORDS = ["also", "likewise", "hence", "figuratively", "figurative", "specifically", "especially", "generally", "causatively", "intensively", "reflexively", "transitively", "intransitively", "collectively", "concretely", "abstractly", "mentally", "morally", "locally", "technically", "architecturally", "passively", "euphemistically", "adverbially", "concrete", "abstract", "transitive", "intransitive", "adverb", "as", "feminine", "reflex", "reflexive", "intensive", "reciprocal", "dual", "physical", "mental", "moral", "architectural", "architecture", "religious", "relatively", "conventionally", "frequentatively", "indefinitely", "medically", "inceptively", "incipiently", "ceremonially", "definitely", "imperatively", "violently", "positively", "adversatively", "objectively", "elliptically", "trans", "poet", "or", "properly", "literally"];
// the definition "boundary kinds"
const SEMI_BOUNDARY_KINDS = ["also", "hence", "transfer", "figurative", "narrowing", "named_use", "plain", "alternative", "bracketed"];
// the definition "paren label kinds"
const SEMI_PAREN_LABEL_KINDS = ["also", "hence", "transfer", "figurative", "narrowing", "named_use", "alternative"];
// part of the definition "kind of a piece": the lead of a piece is the piece with its leading whitespace removed and, if what remains begins with an opening round bracket, that bracket removed
function semiLead(piece) { const t = piece.replace(/^\s+/u, ""); return t.startsWith("(") ? t.slice(1) : t; }
// part of the definition "kind of a piece": the first word of the lead is the first maximal run of letters at its start ("" if it does not begin with a letter)
function semiFirstWord(lead) { const m = /^\p{L}+/u.exec(lead); return m ? m[0] : ""; }
// the definition "kind of a piece" (the first match in this order wins)
function semiKind(piece) {
  const lead = semiLead(piece), w = semiFirstWord(lead);
  if (/^(?:i\.e|e\.g)(?![\p{L}])/u.test(lead) || /^(?:that is|namely)(?![\p{L}])/u.test(lead)) return "restatement";
  if (/^the (?:name|designation)(?![\p{L}])/u.test(lead) || /^also of(?![\p{L}])/u.test(lead)) return "name_description";
  if (SEMI_ALSO.includes(w)) return "also";
  if (SEMI_HENCE.includes(w)) return "hence";
  if (SEMI_TRANSFER.includes(w)) return "transfer";
  if (SEMI_FIGURATIVE.includes(w)) return "figurative";
  if (SEMI_NARROWING.includes(w)) return "narrowing";
  if (SEMI_NAMED_USE.includes(w)) return "named_use";
  if (w === "in") { const m = /^in a (\p{L}+)/u.exec(lead); if (m && SEMI_IN_SENSE.includes(m[1])) return "named_use"; }
  if (SEMI_ALTERNATIVE.includes(w)) return "alternative";
  if (SEMI_PLAIN.includes(w)) return "plain";
  if (SEMI_NOTE.includes(w)) return "note";
  if (piece.replace(/^\s+/u, "").startsWith("(")) return "bracketed";
  return "other";
}
// part of the definition "head word of its own": the piece with every bracket character and everything read at a bracket count above zero removed
function semiOutside(piece) { let d = 0, out = ""; for (const ch of piece) { if (OPEN[ch]) d++; else if (CLOSE[ch]) { d = Math.max(0, d - 1); } else if (d === 0) out += ch; } return out; }
// the definition "head word of its own"
function semiHasHead(piece) { const ws = semiOutside(piece).replace(/(^|[^\p{L}])by(?![\p{L}])(?:\s+\p{L}+)?/gu, "$1").match(/\p{L}+/gu) || []; return ws.some((w) => !SEMI_LABEL_WORDS.includes(w)); }
// the definition "pieces of a text": a text cut at its semicolons that sit outside every bracket pair
function semiPieces(text) { const out = []; let d = 0, s = 0; for (let k = 0; k < text.length; k++) { const ch = text[k]; if (OPEN[ch]) d++; else if (CLOSE[ch]) d = Math.max(0, d - 1); else if (ch === ";" && d === 0) { out.push(text.slice(s, k)); s = k + 1; } } out.push(text.slice(s)); return out; }
// the definition "cuts cleanly"
function semiCutsCleanly(text) { const ps = semiPieces(text); return ps.length > 1 && ps.every((p, k) => semiHasHead(p) && (k === 0 || SEMI_BOUNDARY_KINDS.includes(semiKind(p)))); }
// the definition "pronoun words": words that point back at another piece when they stand outside brackets in a later piece
const SEMI_PRONOUN = ["it", "its", "itself", "both", "them", "they", "their", "one"];
// the definition "back words": words that point back at another piece wherever they stand in a later piece
const SEMI_BACK = ["above", "same", "former", "latter"];
// the definition "front words": the words taken off the front of a piece before its first word of its own is read (every word of label words except the word as, together with the three words and, probably and perhaps, which label words does not hold)
const SEMI_FRONT = SEMI_LABEL_WORDS.filter((w) => w !== "as").concat(["and", "probably", "perhaps"]);
// the definition "non-opening words": words that cannot be the first word of a reading's own text once the front words are off
const SEMI_NOT_OPENING = ["used", "as", "by", "with", "from", "for", "through", "meaning"];
// the definition "stands alone" (first is true for the first piece of a text)
function semiStandsAlone(piece, first) {
  const all = piece.match(/\p{L}+/gu) || [], out = semiOutside(piece).match(/\p{L}+/gu) || [];
  if (!first && (out.some((w) => SEMI_PRONOUN.includes(w)) || all.some((w) => SEMI_BACK.includes(w)) || /^in an? \p{L}+ one(?![\p{L}])/u.test(semiLead(piece)))) return false;
  let k = out[0] === "by" || out[0] === "as" ? 2 : 0;
  while (k < out.length && SEMI_FRONT.includes(out[k])) k++;
  return k < out.length && !SEMI_NOT_OPENING.includes(out[k]);
}
// the definition "all pieces stand alone"
function semiAllStandAlone(text) { return semiPieces(text).every((p, k) => semiStandsAlone(p, k === 0)); }
// the definitions "piece after the mark" and "piece before the mark":the piece that begins just after / ends just before the semicolon at index c.i
function semiPieceAfter(c) { const ps = semiPieces(c.text); let pos = 0; for (let k = 0; k < ps.length - 1; k++) { pos += ps[k].length; if (pos === c.i) return ps[k + 1]; pos += 1; } return c.after; }
function semiPieceBefore(c) { const ps = semiPieces(c.text); let pos = 0; for (let k = 0; k < ps.length - 1; k++) { pos += ps[k].length; if (pos === c.i) return ps[k]; pos += 1; } return c.before; }
// the definition "looks like a King James list" (a guess about the kind of field: it only ever holds text whole, see the branch b1)
function semiLooksLikeKjvList(text) { return /\.$/u.test(text.replace(/\s+$/u, "")) && !/\s,/u.test(text); }
// the definition "later pieces unlabelled"
function semiLaterPiecesUnlabelled(text) { const ps = semiPieces(text); return ps.length > 1 && ps.slice(1).every((p) => semiKind(p) === "other"); }
// ---- helpers for the period ----
// the definition "period abbreviations"
const PERIOD_ABBREVIATIONS = ["etc", "itc", "poet", "reflex", "trans", "card", "correl", "Marg", "marg", "Comp", "Prop", "Incl", "includ", "techn", "phys", "pos", "interj", "adj", "compar", "usu", "etym", "gen", "abs", "interch", "orig", "ellip", "intrans", "exten", "caus", "intens", "absol", "pron"];
// the definition "pointer words"
const PERIOD_POINTER_WORDS = ["Compare", "Comp", "See", "Marg"];
// the definition "word before the mark"
function periodWordBefore(before) { const m = /\p{L}+$/u.exec(before.replace(/\s+$/u, "")); return m ? m[0] : ""; }
// the definition "dots of ie"
function periodInIe(c) { return (/(?:^|[^\p{L}])i$/u.test(c.before) && /^e(?![\p{L}])/u.test(c.after)) || /(?:^|[^\p{L}])i\.e$/u.test(c.before); }
// the definition "dots of eg"
function periodInEg(c) { return (/(?:^|[^\p{L}])e$/u.test(c.before) && /^g(?![\p{L}])/u.test(c.after)) || /(?:^|[^\p{L}])e\.g$/u.test(c.before); }
// the definition "run of dots"
function periodInRun(c) { return c.before.endsWith(".") || c.after.startsWith("."); }
// the definition "starts with a pointer word"
function periodStartsWithPointer(after) { const t = after.replace(/^\s+/u, ""); return PERIOD_POINTER_WORDS.some((w) => t.startsWith(w) && !/^\p{L}/u.test(t.slice(w.length))); }
// ---- helpers of fragment paren ----
// paren.helpers.txt · reader "paren" · openscriptures_strongs · ask v1.1 · 31 October 2026 AD
// Word lists and conditions used by the tests of the round-bracket shapes; every name starts with PAREN so that it cannot meet another reader's helper.
// Each list is also written out in paren.meta.json under definitions (paren_label_words, paren_label_phrases, paren_source_words, paren_joining_words).
const PAREN_RUNS = (g) => g.match(/[\p{L}\p{N}]+/gu) || [];
const PAREN_LABEL_WORDS = ["figuratively","literally","collectively","causatively","concretely","abstractly","specifically","especially","generally","usually","often","adverbially","morally","intensively","transitively","intransitively","reflexively","subjectively","objectively","properly","hence","also","plural","singular","dual","adverb","ordinal","transitive","intransitive","causative","reflex","participle","passive","active","technically","physically","locally"];
const PAREN_LABEL_PHRASES = ["by implication","by analogy","by extension","by euphemism","by euphemistically","by inference","as noun","as a noun","as adjective","as an adjective","as adverb","as an adverb","as preposition","as a preposition","as demonstrative","as ordinal","as an ordinal","as a patronymic","as feminine noun"];
const PAREN_SOURCE_WORDS = ["as","like","because","from","through"];
const PAREN_JOINING_WORDS = ["of","in","with","for","by","to","on","at","into","upon","unto","about","against","under","over","after","before","between","within","without","among","toward","towards","along","during","up","down","out","off","away","forth","back","together","abroad","aside","asunder","again"];
const PAREN_SMALL_WORDS = ["as","like","because","from","through","a","an","the","for","in","so","than","to","unto","off","whether","while"];
// the one-word groups that are the beginning of a longer word whose rest the source writes after a space (paren_word_start_words; also written out in paren.meta.json under definitions)
const PAREN_WORD_START_WORDS = ["adulter"];
// the closing bracket pairs with its partner (see paren_pairing): its group is not empty, or the character just before it is the opening bracket of its own kind (an empty pair)
const PAREN_OPENER_OF = { ")": "(", "]": "[" };
const PAREN_CLOSER_PAIRED = (c) => c.group !== "" || c.before.endsWith(PAREN_OPENER_OF[c.mark]);
// what a round bracket's group holds: one condition per kind of content, the same for the opener and the closer of a pair (g is the group)
const PAREN_HOLDS = {
  blank: (g) => /^\s+$/u.test(g),
  doubt: (g) => g.trim() === "?",
  round: (g) => g.includes("("),
  square: (g) => g.includes("["),
  verse: (g) => /\d:\d/u.test(g),
  number: (g) => /\d/u.test(g),
  times: (g) => g.includes("\u00d7"),
  plus: (g) => g.includes("+"),
  quotation: (g) => /(?:^|[^\p{L}\p{N}])['\u2019](?!s(?:[^\p{L}]|$))\p{L}/u.test(g),
  hyphen_piece: (g) => /(?:^|[^\p{L}])-|-(?:[^\p{L}]|$)/u.test(g),
  restatement: (g) => /^\s*i\.e\./u.test(g),
  alternative: (g) => PAREN_RUNS(g)[0] === "or",
  label: (g) => { const s = PAREN_RUNS(g).join(" ") + " "; return PAREN_LABEL_WORDS.some((w) => s.startsWith(w + " ")) || PAREN_LABEL_PHRASES.some((p) => s.startsWith(p + " ")); },
  small: (g) => { const r = PAREN_RUNS(g); return PAREN_SOURCE_WORDS.includes(r[0]) && r.every((w) => PAREN_SMALL_WORDS.includes(w)); },
  source: (g) => PAREN_SOURCE_WORDS.includes(PAREN_RUNS(g)[0]),
  joining: (g) => PAREN_JOINING_WORDS.includes(PAREN_RUNS(g)[0]),
  one_word: (g) => /^\s*[\p{L}\p{M}'\u2019-]+\s*$/u.test(g),
  other: (g) => true,
};
// ---- helpers of fragment rest ----
// rest.helpers.txt · reader "rest" · openscriptures_strongs · ask v1.1 · 31 October 2026 AD
// The one helper used by the apostrophe tests; it is also written out in rest.meta.json under definitions (unpaired_apostrophes_before). Its name starts with rest so that it cannot meet another reader's helper.
// the number of apostrophes (U+0027) before index i of the route text, not counting an apostrophe that has a letter directly before it and a letter directly after it
function restUnpairedApostrophesBefore(text, i) {
  let n = 0;
  for (let k = 0; k < i; k++) {
    if (text[k] !== "'") continue;
    const prev = k > 0 ? text[k - 1] : "", next = k + 1 < text.length ? text[k + 1] : "";
    if (!(/^\p{L}$/u.test(prev) && /^\p{L}$/u.test(next))) n++;
  }
  return n;
}

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
