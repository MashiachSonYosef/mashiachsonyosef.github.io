// kaikki_wiktionary_hebrew.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  // ---- fragment all ----
  { id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
  { id: "comma.in_a_figure_in_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" && /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "comma.in_a_figure", mark: ",", divides: false, test: (c) => c.container === "top" && /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "comma.before_quoted_gloss_in_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" && /^\s*\u201C/u.test(c.after) },
  { id: "comma.in_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.at_a_place_marked_by_hand", mark: ",", divides: false, test: (c) => c.container === "top" && placeIn(c, LISTS.places_marked_by_hand) === "marked" },
  { id: "comma.between_note_and_reading", mark: ",", divides: false, test: (c) => c.container === "top" && placeIn(c, LISTS.note_and_reading_marks) === "marked" },
  { id: "comma.after_a_label_word", mark: ",", divides: false, test: (c) => c.container === "top" && labelWordBefore(c) },
  { id: "comma.before_a_bracketed_ending", mark: ",", divides: false, test: (c) => c.container === "top" && /^\s*\(-/u.test(c.after) },
  { id: "comma.in_copied_rendering_list", mark: ",", divides: false, test: (c) => c.container === "top" && dashColon(c, false) },
  { id: "comma.before_copied_rendering_list", mark: ",", divides: false, test: (c) => c.container === "top" && dashColon(c, true) },
  { id: "comma.between_forms_of_one_word", mark: ",", divides: false, test: (c) => c.container === "top" && placeIn(c, LISTS.one_word_twice) === "unmarked" },
  { id: "comma.between_a_word_and_its_derived_form", mark: ",", divides: false, test: (c) => c.container === "top" && placeIn(c, LISTS.derived_form_lists) === "unmarked" },
  { id: "comma.between_one_head_said_twice", mark: ",", divides: false, test: (c) => c.container === "top" && placeIn(c, LISTS.same_head_lists) === "unmarked" },
  { id: "comma.in_one_construction", mark: ",", divides: false, test: (c) => c.container === "top" && placeIn(c, LISTS.one_construction_lists) === "unmarked" },
  { id: "comma.in_head_with_a_capital", mark: ",", divides: false, test: (c) => c.container === "top" && capitalHead(c) },
  { id: "comma.in_list_opening_with_a_small_verb", mark: ",", divides: false, test: (c) => c.container === "top" && smallVerbHere(c) },
  { id: "comma.in_head_before_definition", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && (() => { const n = nearColon(c); return n.side === "right" && (n.kind === "definition" || n.kind === "at_end") && isListStretch(n.stretch); })() },
  { id: "comma.in_head_before_note", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && (() => { const n = nearColon(c); return n.side === "right" && (n.kind === "before_pointer" || n.kind === "before_note") && isListStretch(n.stretch); })() },
  { id: "comma.in_head_before_description", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && (() => { const n = nearColon(c); return n.side === "right" && n.kind === "name"; })() },
  { id: "comma.in_list_after_definition_colon", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && (() => { const n = nearColon(c); return n.side === "left" && n.kind === "definition" && isListStretch(n.stretch) && isWordList(piecesOf(n.stretch)); })() },
  { id: "comma.in_list_after_label", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && (() => { const n = nearColon(c); return n.side === "left" && (n.kind === "label" || n.kind === "after_pointer") && isListStretch(n.stretch); })() },
  { id: "comma.in_explanation_after_colon", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && nearColon(c).side === "left" },
  { id: "comma.before_other_colon", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" },
  { id: "comma.in_line_with_hebrew", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "hebrew" },
  { id: "comma.after_name_label", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "name_label" && LISTS.name_labels.includes(topView(c.before).trim().toLowerCase()) && !/^\s*(equivalent|from|of)\b/u.test(c.after) },
  { id: "comma.in_name_after_label", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "name_label" },
  { id: "comma.in_usage_line", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "usage_line" },
  { id: "comma.in_tail", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "tail" && inTail(c) },
  { id: "comma.in_list_before_tail", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "tail" },
  { id: "comma.after_name_or_capital_head", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "name_description" },
  { id: "comma.in_list_with_a_bracket", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "bracket" },
  { id: "comma.between_one_word_renderings", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "one_word" },
  { id: "comma.between_verb_renderings", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "verbs" },
  { id: "comma.between_article_renderings", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "articles" },
  { id: "comma.in_list_with_a_later_capital", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "names" },
  { id: "comma.in_explanation_after_word", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "definition" && separatorsBefore(c) + 1 > explanationStart(c.text) },
  { id: "comma.between_word_and_definition", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "definition" && separatorsBefore(c) + 1 === explanationStart(c.text) },
  { id: "comma.between_words_before_definition", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "definition" },
  { id: "comma.between_phrases", mark: ",", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "phrases" },
  { id: "comma.before_the_last_bracket", mark: ",", divides: false, test: (c) => c.container === "top" && !listText(c.after) },
  { id: "comma.any_other", mark: ",", divides: false, test: (c) => c.container === "top" },
  { id: "semicolon.in_round_bracket", mark: ";", divides: false, test: (c) => c.container === "paren" },
  { id: "semicolon.at_a_place_marked_by_hand", mark: ";", divides: false, test: (c) => placeIn(c, LISTS.places_marked_by_hand) === "marked" },
  { id: "semicolon.between_note_and_reading", mark: ";", divides: false, test: (c) => placeIn(c, LISTS.note_and_reading_marks) === "marked" },
  { id: "semicolon.before_usage_note", mark: ";", divides: false, test: (c) => listKind(c.text) !== "usage_line" && opensWith(c.after.trimStart(), LISTS.usage_note_openers) },
  { id: "semicolon.between_forms_of_one_word", mark: ";", divides: false, test: (c) => placeIn(c, LISTS.one_word_twice) === "unmarked" },
  { id: "semicolon.between_one_head_said_twice", mark: ";", divides: false, test: (c) => placeIn(c, LISTS.same_head_lists) === "unmarked" },
  { id: "semicolon.in_list_opening_with_a_small_verb", mark: ";", divides: false, test: (c) => c.container === "top" && smallVerbHere(c) },
  { id: "semicolon.in_list_after_definition_colon", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" && (() => { const n = nearColon(c); return n.side === "left" && n.kind === "definition" && isListStretch(n.stretch) && isWordList(piecesOf(n.stretch)); })() },
  { id: "semicolon.in_text_with_a_colon", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "colon" },
  { id: "semicolon.in_line_with_hebrew", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "hebrew" },
  { id: "semicolon.after_name_label", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "name_label" && LISTS.name_labels.includes(topView(c.before).trim().toLowerCase()) },
  { id: "semicolon.before_note_or_in_tail", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "tail" && inTail(c) },
  { id: "semicolon.before_a_remark_word", mark: ";", divides: false, test: (c) => c.container === "top" && ["bracket", "tail"].includes(listKind(c.text)) && remarkNext(c) },
  { id: "semicolon.in_list_before_tail", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "tail" },
  { id: "semicolon.after_name_or_capital_head", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "name_description" },
  { id: "semicolon.in_list_with_a_bracket", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "bracket" },
  { id: "semicolon.between_one_word_renderings", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "one_word" },
  { id: "semicolon.between_verb_renderings", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "verbs" },
  { id: "semicolon.between_article_renderings", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "articles" },
  { id: "semicolon.in_list_with_a_later_capital", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "names" },
  { id: "semicolon.in_explanation_after_word", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "definition" && separatorsBefore(c) + 1 > explanationStart(c.text) },
  { id: "semicolon.between_word_and_definition", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "definition" },
  { id: "semicolon.between_phrases", mark: ";", divides: false, test: (c) => c.container === "top" && listKind(c.text) === "phrases" },
  { id: "semicolon.any_other", mark: ";", divides: false, test: (c) => true },
  { id: "colon.in_round_bracket_in_a_reference", mark: ":", divides: false, test: (c) => c.container === "paren" && /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "colon.in_round_bracket", mark: ":", divides: false, test: (c) => c.container === "paren" },
  { id: "colon.in_a_reference", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "reference" },
  { id: "colon.with_nothing_after_it", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "at_end" },
  { id: "colon.before_copied_rendering_list", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "before_dash" },
  { id: "colon.after_name_before_description", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "name" },
  { id: "colon.between_two_notes", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "between_notes" },
  { id: "colon.after_label", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "label" },
  { id: "colon.after_pointer", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "after_pointer" },
  { id: "colon.before_pointer", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "before_pointer" },
  { id: "colon.before_note", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "before_note" },
  { id: "colon.before_words_that_point_back", mark: ":", divides: false, test: (c) => colonKind(c.text, c.i) === "points_back" },
  { id: "colon.between_word_and_definition", mark: ":", divides: false, test: (c) => true },
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.in_round_bracket_in_a_number", mark: ".", divides: false, test: (c) => c.container === "paren" && /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "period.in_round_bracket_after_abbreviation", mark: ".", divides: false, test: (c) => c.container === "paren" && LISTS.abbreviations.includes(runBefore(c.before)) },
  { id: "period.in_round_bracket", mark: ".", divides: false, test: (c) => c.container === "paren" },
  { id: "period.ends_the_text", mark: ".", divides: false, test: (c) => !c.after.trim() },
  { id: "period.at_a_place_marked_by_hand", mark: ".", divides: false, test: (c) => placeIn(c, LISTS.places_marked_by_hand) === "marked" },
  { id: "period.in_a_number", mark: ".", divides: false, test: (c) => /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "period.in_an_ellipsis", mark: ".", divides: false, test: (c) => c.before.endsWith(".") || c.after.startsWith(".") },
  { id: "period.after_abbreviation", mark: ".", divides: false, test: (c) => LISTS.abbreviations.includes(runBefore(c.before)) },
  { id: "period.after_name_label", mark: ".", divides: false, test: (c) => LISTS.name_labels.includes(c.before.trim().toLowerCase()) },
  { id: "period.before_a_closing_bracket_remark", mark: ".", divides: false, test: (c) => /^\s*\(/u.test(c.after) },
  { id: "period.between_sentences", mark: ".", divides: false, test: (c) => true },
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => neverOpened(c) },
  { id: "open_paren.inside_square_bracket", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "in_square" },
  { id: "close_paren.inside_square_bracket", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "in_square" },
  { id: "open_paren.inside_round_bracket", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "in_round" },
  { id: "close_paren.inside_round_bracket", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "in_round" },
  { id: "open_paren.word_part", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "word_part" },
  { id: "close_paren.word_part", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "word_part" },
  { id: "open_paren.holds_only_signs", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "only_signs" },
  { id: "close_paren.holds_only_signs", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "only_signs" },
  { id: "open_paren.after_hebrew_holds_quoted_gloss", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "quoted_after_hebrew" },
  { id: "close_paren.after_hebrew_holds_quoted_gloss", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "quoted_after_hebrew" },
  { id: "open_paren.after_hebrew_holds_note", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "note_after_hebrew" },
  { id: "close_paren.after_hebrew_holds_note", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "note_after_hebrew" },
  { id: "open_paren.after_hebrew_holds_romanization", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "romanization" },
  { id: "close_paren.after_hebrew_holds_romanization", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "romanization" },
  { id: "open_paren.holds_a_note_with_hebrew", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "holds_hebrew" },
  { id: "close_paren.holds_a_note_with_hebrew", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "holds_hebrew" },
  { id: "open_paren.holds_subject_word", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "subject" },
  { id: "close_paren.holds_subject_word", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "subject" },
  { id: "open_paren.holds_gender_word", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "gender" },
  { id: "close_paren.holds_gender_word", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "gender" },
  { id: "open_paren.holds_conjugation_note", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "conjugation" },
  { id: "close_paren.holds_conjugation_note", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "conjugation" },
  { id: "open_paren.holds_object_slot", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "object" },
  { id: "close_paren.holds_object_slot", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "object" },
  { id: "open_paren.opens_the_text", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "opens_text" },
  { id: "close_paren.opens_the_text", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "opens_text" },
  { id: "open_paren.after_the_final_stop", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "after_stop" },
  { id: "close_paren.after_the_final_stop", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "after_stop" },
  { id: "open_paren.ends_the_text", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "ends_text" },
  { id: "close_paren.ends_the_text", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "ends_text" },
  { id: "open_paren.in_the_text", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c) === "in_text" },
  { id: "close_paren.in_the_text", mark: ")", divides: false, test: (c) => !neverOpened(c) && roundKind(c) === "in_text" },
  { id: "open_bracket.in_link_markup", mark: "[", divides: false, test: (c) => squareKind(c) === "link_markup" },
  { id: "close_bracket.in_link_markup", mark: "]", divides: false, test: (c) => squareKind(c) === "link_markup" },
  { id: "open_bracket.holds_with_word", mark: "[", divides: false, test: (c) => squareKind(c) === "with" },
  { id: "close_bracket.holds_with_word", mark: "]", divides: false, test: (c) => squareKind(c) === "with" },
  { id: "open_bracket.holds_see", mark: "[", divides: false, test: (c) => squareKind(c) === "see" },
  { id: "close_bracket.holds_see", mark: "]", divides: false, test: (c) => squareKind(c) === "see" },
  { id: "open_bracket.holds_equal_name", mark: "[", divides: false, test: (c) => squareKind(c) === "equals" },
  { id: "close_bracket.holds_equal_name", mark: "]", divides: false, test: (c) => squareKind(c) === "equals" },
  { id: "open_bracket.holds_only_signs", mark: "[", divides: false, test: (c) => squareKind(c) === "only_signs" },
  { id: "close_bracket.holds_only_signs", mark: "]", divides: false, test: (c) => squareKind(c) === "only_signs" },
  { id: "open_bracket.holds_a_sound", mark: "[", divides: false, test: (c) => squareKind(c) === "sound" },
  { id: "close_bracket.holds_a_sound", mark: "]", divides: false, test: (c) => squareKind(c) === "sound" },
  { id: "open_bracket.holds_supplied_word", mark: "[", divides: false, test: (c) => squareKind(c) === "supplied" },
  { id: "close_bracket.holds_supplied_word", mark: "]", divides: false, test: (c) => squareKind(c) === "supplied" },
  { id: "open_angle.around_a_spelling", mark: "<", divides: false, test: (c) => true },
  { id: "close_angle.around_a_spelling", mark: ">", divides: false, test: (c) => true },
  { id: "open_brace.left_from_wiki_markup", mark: "{", divides: false, test: (c) => true },
  { id: "pipe.left_from_wiki_markup", mark: "|", divides: false, test: (c) => true },
  { id: "hyphen.in_unbalanced_text", mark: "-", divides: false, test: (c) => unbalanced(c.text) },
  { id: "hyphen.opens_copied_rendering_list", mark: "-", divides: false, test: (c) => c.container === "top" && c.before.trimEnd().endsWith(":") && /^\s/u.test(c.after) },
  { id: "hyphen.between_letters", mark: "-", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.ends_a_romanized_prefix", mark: "-", divides: false, test: (c) => c.container === "paren" && /^\s*\)/u.test(c.after) && /[\p{L}']$/u.test(c.before) },
  { id: "hyphen.between_numbers", mark: "-", divides: false, test: (c) => /\p{N}\s*$/u.test(c.before) && /^\s*\p{N}/u.test(c.after) },
  { id: "hyphen.spaced_between_words", mark: "-", divides: false, test: (c) => /\s$/u.test(c.before) && /^\s/u.test(c.after) },
  { id: "hyphen.opens_or_ends_an_affix", mark: "-", divides: false, test: (c) => true },
  { id: "apostrophe.in_romanization", mark: "'", divides: false, test: (c) => c.container === "paren" && pairFollowsHebrew(c) },
  { id: "apostrophe.between_letters", mark: "'", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "apostrophe.after_a_letter", mark: "'", divides: false, test: (c) => /\p{L}$/u.test(c.before) },
  { id: "apostrophe.opens_a_word", mark: "'", divides: false, test: (c) => true },
  { id: "slash.between_hebrew_spellings", mark: "/", divides: false, test: (c) => c.container === "top" && (HEB.test(prevChar(c.before)) || HEB.test(nextChar(c.after))) },
  { id: "slash.between_words", mark: "/", divides: false, test: (c) => c.container === "top" && /[\p{L}\p{N}]$/u.test(c.before) && /^[\p{L}\p{N}]/u.test(c.after) },
  { id: "slash.spaced_between_words", mark: "/", divides: false, test: (c) => c.container === "top" && /\s$/u.test(c.before) && /^\s/u.test(c.after) },
  { id: "slash.around_a_sound", mark: "/", divides: false, test: (c) => c.container === "top" },
  { id: "slash.between_words_in_round_bracket", mark: "/", divides: false, test: (c) => /[\p{L}\p{N}]$/u.test(c.before) && /^[\p{L}\p{N}]/u.test(c.after) },
  { id: "slash.in_round_bracket_other", mark: "/", divides: false, test: (c) => true },
  { id: "backslash.between_hebrew_spellings", mark: "\\", divides: false, test: (c) => true },
  { id: "quote.between_letters", mark: "\"", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "quote.around_quoted_words", mark: "\"", divides: false, test: (c) => true },
  { id: "left_double_quotation_mark.opens_a_gloss_or_quoted_wording", mark: "“", divides: false, test: (c) => true },
  { id: "right_double_quotation_mark.closes_a_gloss_or_quoted_wording", mark: "”", divides: false, test: (c) => true },
  { id: "left_single_quotation_mark.opens_the_english_of_a_governed_word", mark: "‘", divides: false, test: (c) => true },
  { id: "right_single_quotation_mark.between_letters", mark: "’", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "right_single_quotation_mark.closes_the_english_of_a_governed_word", mark: "’", divides: false, test: (c) => true },
  { id: "exclamation.at_a_place_marked_by_hand", mark: "!", divides: false, test: (c) => placeIn(c, LISTS.places_marked_by_hand) === "marked" },
  { id: "exclamation.ends_a_cry", mark: "!", divides: false, test: (c) => true },
  { id: "question_mark.ends_a_question", mark: "?", divides: false, test: (c) => true },
  { id: "equals.opens_a_full_form", mark: "=", divides: false, test: (c) => true },
  { id: "plus.joins_two_items", mark: "+", divides: false, test: (c) => true },
  { id: "times.in_a_figure_or_a_species_name", mark: "×", divides: false, test: (c) => true },
  { id: "ampersand.joins_two_book_names", mark: "&", divides: false, test: (c) => true },
  { id: "percent_sign.after_a_figure", mark: "%", divides: false, test: (c) => true },
  { id: "number_sign.named_or_shown_as_itself", mark: "#", divides: false, test: (c) => true },
  { id: "commercial_at.named_or_shown_as_itself", mark: "@", divides: false, test: (c) => true },
  { id: "black_spade_suit.shown_as_itself", mark: "♠", divides: false, test: (c) => true },
  { id: "black_club_suit.shown_as_itself", mark: "♣", divides: false, test: (c) => true },
  { id: "pluto.shown_as_itself", mark: "♇", divides: false, test: (c) => true },
  { id: "pluto_form_two.shown_as_itself", mark: "⯓", divides: false, test: (c) => true },
  { id: "superscript_plus_sign.in_a_formula", mark: "⁺", divides: false, test: (c) => true },
  { id: "dagger.shown_as_itself", mark: "†", divides: false, test: (c) => true },
  { id: "mathematical_left_angle_bracket.around_a_sign_shown", mark: "⟨", divides: false, test: (c) => true },
  { id: "mathematical_right_angle_bracket.around_a_sign_shown", mark: "⟩", divides: false, test: (c) => true },
  { id: "middle_dot.in_a_unit", mark: "·", divides: false, test: (c) => true },
  { id: "em_dash.in_a_range_or_an_aside", mark: "—", divides: false, test: (c) => true },
  { id: "fraction_slash.in_a_fraction", mark: "⁄", divides: false, test: (c) => true },
  { id: "hyphen.shown_as_itself_u2010", mark: "‐", divides: false, test: (c) => true },
  { id: "tilde.shown_as_itself", mark: "~", divides: false, test: (c) => true },
  { id: "degree_sign.after_a_figure", mark: "°", divides: false, test: (c) => true },
  { id: "rightwards_arrow.shown_as_itself", mark: "→", divides: false, test: (c) => true },
  { id: "horizontal_ellipsis.stands_for_left_out_words", mark: "…", divides: false, test: (c) => true },
  { id: "en_dash.opens_copied_rendering_list", mark: "–", divides: false, test: (c) => c.before.trimEnd().endsWith(":") },
  { id: "en_dash.in_round_bracket", mark: "–", divides: false, test: (c) => c.container === "paren" },
  { id: "en_dash.spaced_before_a_description", mark: "–", divides: false, test: (c) => true },
  { id: "dotted_circle.carries_a_point_shown_alone", mark: "◌", divides: false, test: (c) => true },
  { id: "combining_down_tack_below.in_a_sound", mark: "̞", divides: false, test: (c) => true },
  { id: "hebrew_point_sheva.on_cited_hebrew", mark: "ְ", divides: false, test: (c) => true },
  { id: "hebrew_point_hataf_segol.on_cited_hebrew", mark: "ֱ", divides: false, test: (c) => true },
  { id: "hebrew_point_hataf_patah.on_cited_hebrew", mark: "ֲ", divides: false, test: (c) => true },
  { id: "hebrew_point_hataf_qamats.on_cited_hebrew", mark: "ֳ", divides: false, test: (c) => true },
  { id: "hebrew_point_hiriq.on_cited_hebrew", mark: "ִ", divides: false, test: (c) => true },
  { id: "hebrew_point_tsere.on_cited_hebrew", mark: "ֵ", divides: false, test: (c) => true },
  { id: "hebrew_point_segol.on_cited_hebrew", mark: "ֶ", divides: false, test: (c) => true },
  { id: "hebrew_point_patah.on_cited_hebrew", mark: "ַ", divides: false, test: (c) => true },
  { id: "hebrew_point_qamats.on_cited_hebrew", mark: "ָ", divides: false, test: (c) => true },
  { id: "hebrew_point_holam.on_cited_hebrew", mark: "ֹ", divides: false, test: (c) => true },
  { id: "hebrew_point_qubuts.on_cited_hebrew", mark: "ֻ", divides: false, test: (c) => true },
  { id: "hebrew_point_dagesh_or_mapiq.on_cited_hebrew", mark: "ּ", divides: false, test: (c) => true },
  { id: "hebrew_point_rafe.on_cited_hebrew", mark: "ֿ", divides: false, test: (c) => true },
  { id: "hebrew_point_shin_dot.on_cited_hebrew", mark: "ׁ", divides: false, test: (c) => true },
  { id: "hebrew_point_sin_dot.on_cited_hebrew", mark: "ׂ", divides: false, test: (c) => true },
  { id: "hebrew_point_qamats_qatan.on_cited_hebrew", mark: "ׇ", divides: false, test: (c) => true },
  { id: "maqaf.after_or_inside_cited_hebrew", mark: "־", divides: false, test: (c) => true },
  { id: "geresh.in_cited_hebrew", mark: "׳", divides: false, test: (c) => true },
  { id: "gershayim.in_cited_hebrew", mark: "״", divides: false, test: (c) => true },
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

// ---- helpers of fragment all ----
const LISTS = {"not_list_openings":["to, standardize, unify","to sit, to move into such a position","any of Passover","A pleasant, precious, or lovely thing","A rough, informal measure","A strong, violent person","A very loud, sudden sound","A religious, orthodox Jew","A person's condition, position, standing","A person's spirit, soul","The lower, narrow part","The more succulent, aroma-rich part","The proper, personal name","The state of being in vain","The act of turning, rotating","The state of being moderate","a buried feeling, emotion or memory","a collection, assemblage of idols","a loud, low-class, uncultured young man","An aromatic, sweet-smelling spice","An officer of David","A son of Zerah","One of the Acharonim","One of the Amoraim","One of the Tannaim","one of a number of legumes","one of several repeated trips","one of the Rishonim","The carcass of an animal","The son of a kohen","for footbaths, washbowl","girl under 17","knife for slaughtering","someone who is evil","son of Eliphaz","the Sanhedrin, historical","the land occupied by the descendants","the twelve minor prophets","to be wanted by others","violent, with many characters","a glass, bottle, or can","a generic pot, tub","A Jew who is forced","A way of prayer","Specifically, to prepare","a musical term of uncertain meaning","girl of a transitional age","the latter rain, the spring rain","Muhammad, Islamic final prophet","Bowing down, kneeling","A dweller of a field hut","the region of the nose","Hallel, Psalms","a member of the genus Tadarida","a sea creature from which","an epithet applied to","a team of horses","a strong, muscular man","act of dwelling","yeah right, whatever","a young, unmarried","an affliction of the skin","a sweetened drink flavored","an accumulated fund","Yiddish, Ladino, and any of","Specifically, to be prepared","synonym of נִיס","A group of people who share","A hole in cloth for the insertion","diagonally; in a slanted","To travel a place or a land","To fall, to suffer defeat","to shear, to cut hair","the process of learning","To get, become tired","Something hard, unbearable","Is finished, done","to receive a hit, blow","to make foul-smelling, fetid","I wish, hope","A channel in the geographic sense","amount, quantity of money","to fall, hence to befall","a rod, six cubits","Of a beast to devour","Of or relating to a kibbutz","Euphemistic form of the name"],"places_marked_by_hand":["To fall,| to suffer defeat, ruin or distraction","a rod,| six cubits","to shear,| to cut hair, wool","Of a beast to devour;| hunger","the twelve minor prophets,| or their books as a unit","Is finished,| done","to fall, hence to befall;| to take place;| become","diagonally;| in a slanted, sloped, or angled direction","…; times;| -fold;| multiplied by","A chairman,| a head","Damn!,| Hell!","Double-,| two-,| bi-,| di-,| ambi-,| amphi-.","Etc.;| et al.","Forward!,| Onward!,| Keep going!","Forward!,| Onward!,| Let's go!","Infra-,| sub-,| under-.","Multi-,| poly-,| multiple-;| many.","Single-,| one-,| uni-,| mono-.","triple-,| three-,| tri-","Ms / Ms.,| Mrs / Mrs.","Sh!| Hush!| Shush!","Wow!,| really?,| you don't say!,| no kidding!","actually!,| true that!","all right,| okay, O.K.","all right,| okay, O.K.,| fine","at the foot/feet of...,| at the bottom of...","behold!,| this, here is","come on!| let's go!","cool!,| great!","fie!;| for shame!; shame on you!","girl,| gal (as a female adult, not a female child),| bird","having a certain trait,| -able","lack,| absence,| deficiency,| in-","moderation,| temperance.| Self-control.","naught,| nothing;","boy,| physically able young man.| Also, a servant.","oh!,| ah!","silence!| quiet!","stop it!| enough!","stop!,| enough!,| cease!","a wand,| a staff;| a swatting rod.| cattle prod","woe!,| ah!| alas!","To be/get vaccinated,| to be/get immunized","A cub,| pup,| kit,| calf,| puppy,| kitten, or similar","Then, then-,| at that time","A defiant, obstinate, or insubordinate (male) person;|","Of blessed memory,| may he/she/they rest in peace","to give,| to grant;| to chose;| to ascribe to.","the region of the nose,| the face","a generic pot,| tub,| vat,| skeel","A person's spirit,| soul","A person's condition,| position,| standing","the latter rain,| the spring rain","to, standardize,| unify","to be wanted by others,| or to be such","Bowing down,| kneeling","a member of the genus Tadarida,| a type","Yiddish,| Ladino,| and any of","a strong, muscular man;| he-man,| macho,| tough guy","…,| Hexaplex trunculus","act of dwelling,| residing","…;| Alternatively, an innkeeper.","…;| chav,| douchebag.","…,| Ethiopia,| Somalia","yeah right,| whatever;| oh, please","…;| hitbodedut.","in the absence of,| in the case where ... is not found,|","…,| when lacking,| if there is not","lest,| [[[in order","…,| for otherwise; used in constructing warnings.","…;| bimbo,| hoochie.","To lead astray, that is, (mentally) to delude,|","…,| or (morally) to seduce,| to beguile,| to deceive","…;| casualty","…;| a grouch","…;| a generic name;| so-and-so","additionally,| also,| in addition","together,| as one","…;| lodging,| sojourn.","that is,| which means,| in other words","…;| or, a (bus) stop.","…;| a headstone,| gravestone.","…;| pavilion,| tent,| shed","Used figuratively;| shallow,| superficial.","…;| a canyon,| ravine,| crevice,| gully,| or gorge."],"note_and_reading_marks":["for footbaths,|","for ashes,| ashcan","an epithet applied to Roman emperors,|","In Israeli politics,|","An interrogative particle,|","Honorific form of Hebrew patronymic formula,|","We;|","…,| elections","…,| to rebel.","…,| to laugh.","…,| a female hunter","long live,|","blvd.,|","…,| an approximately equal Hebrew unit of liquid volume.","To be remembered;|","To be convinced or persuaded (by someone or something);|","…;| final nun","…;| final pe","…;| final mem","…;| final kaph","…;| final sadhe, tsadi, tzaddik","…;| mamad","dachshund,|","ellipsis of ספירת העומר,|","Min.;|","…,| thus, a fortnight or two weeks.","blue,|","…;| teeth","…;| times; -fold; multiplied by"],"usage_note_openers":["used","often used","also used","usually used","chiefly used","indicating","indicates","passive of","see","found","the first part of"],"one_word_twice":["to break into,| to burglarize, to burgle","revolutionary, revolutionist","to smooth, smoothen","intercessor; interceder","floc, floccule","stairway, stairs","stairs, stairway","To telephone, to phone,| to call (via the phone)","women; women's,| feminine,| effeminate,| female","sledge, sleigh, sled","Tzfat, Safed","Jaffa, Yafo, Joppa","Sarepta, Zarephath","Asmodeus; Ashmedai","To plow, plough","center, centre","color, colour","molt, moult","tyre, tire","kcal, kilocalorie","a gross, 144","bicycle, bike","19, nineteen","photograph, photo,| picture","telephone, phone","quotation, quote","quote, quotation","cooperative, co-op","lupin, lupine","taxi, cab, taxicab","influenza, flu","soy, soya","porn, porno","yogurt, yoghurt","yeah, ya, ye, yeh","v, vb, verb","ch, chap, chapter","80, eighty","OK, okay","4, four,| 4th, fourth","armour, armor","armouring, armoring","advertisement, ad, advert","catalog, catalogue","backward, backwards,| astern","contents; content","Beth, Bet","Judah, Judea","Rhone, Rhône","Sedom, Sodom","Shechem, Sichem","Simeon, Simon","Vav, waw","Yaziz, Jaziz","a krone, krona","aleph, alef","he, hei, hey","kaf, kaph","khet, chet, kheth, cheth, het, heth","lamed, lamedh","tet, teth","yod, yud, yodh","zayin, zain, zayn, zay","A (male) Kushite, Cushite","A (male) antisemite, anti-Semite","Antisemitic, anti-Semitic","Aging, ageing,| growing old","Hagbaha, hagbah","Mail, e-mail","Cushite, Kushite","Rebekah, Rebecca","Hasidic, Hassidic","Chaldean, Chaldee","a Chaldean, Chaldee","Ashkenazi, Ashkenazic","Shia, Shiite","ISIS, ISIL","Zoroaster, Zarathustra","white, White","A deli, a delicatessen","An exam, an examination,| a test","Shabbat, Sabbath"],"derived_form_lists":["to crumb, to crumble","particle, particulate","to make a reference, to refer to,| to quote","to be referenced, to be referred to,| to be quoted","common,| widespread,| popular,| prevailing, prevalent","medicine, medication, medicament,| drug","permissible, permitted,| allowed","to block, to blockade","pack, packet","Decisive,| definite, definitive,| decided","deserving,| worthy, worthwhile","shocking,| horrifying, horrific,| disturbing","Desired, desirable,| wanted","Middling, middle,| medium,| average,| intermediate,| between","expense, expenditure","registry, registration","complicated, complex","humanity, humanness, humankind","Memorialization, memorializing, a memorial","pleasure, pleasantness","Near, nearby,| next,| adjacent,| alongside","continuous, continual;| perpetual;| constant","Dada, dadaism","wash, washing","Speech, speaking","temper, temperament","institute, institution","noise, noisiness","establishing, establishment","stab, stabbing","developing, development","growing, growth","loose, loosened","import, importation","fill, filling","searching, search","vaccine, vaccination,| immunization","to organize, to get organized","down, downwards,| below","relation, relationship","hurt, hurting,| painful","round, rounded","Fall, falling,| decline","rabbinic, rabbinical","reign,| rule, rulership","run, running","An institute, institution,| association","mercy, mercifulness","sting, stinger","Fantastic, fantastical","permanence, regularity, permanent","Health, healthiness, healthfulness","associative, associativity","Care, carefulness,| watchfulness,| caution","cold, coldness","quaking, quake, earthquake","slip, slipping","screaming, scream","gravity, gravitation","dryness, drying","bargaining, bargain","intent, intention","boil, boiling","documentary, documentative","leap,| spring,| jump, jumping","eastern, east","red, redness","up, upward","Terror, terrorism","down, downward","separating, separation","packaging, packing","photography, photographing","mixing, mixture","excavating, excavation","transportation, transport","up, upwards,| above","A descent, descending,| going down","A return, returning,| going back","ascent, ascending,| going up","healthy, healthful","sportsman, sportsperson","skilled, skillful,| proficient","Hellenizing, Hellenization","Zionist, Zionistic","Aramean, Aramaic","A freeze, a freezing","Drink, drinking","Installation, installing","Security, security-related","An entrance, an entry","Civilian, civil","family, familial","Editing, an edit","A percent, a percentage","A voting, a vote","Brown, brown-colored","accountancy, accounting","aggression, aggressivity","Electric, electrical","North, northern, northerly","South, southern, southerly","Arab, Arabic","pedagogical, pedagogic","West, western, westerly,| occidental","comic, comedic, comical","Warmth,| fever, feverishness","complainer, complainant,| faultfinder","Israelian, Israelitish"],"same_head_lists":["to turn, to turn aside","to turn, to turn around","to equalize, to make equal","to cover up; to cover one's tracks","to undress, to get undressed","to get burned, to burn oneself","…to become acquainted, to make the acquaintance of","To proliferate, to become proliferated,| to become numerous","to bend over, to bend down,| to stoop,| to duck","to prophesy, to be a prophet","to be stopped, to stop","To clear, to clear-cut,| to cut down","A corridor,| hallway, hall","bathtub, bath","grave, gravesite","A flap, an airplane wing flap","A flat, a flat sign","A little, a bit, a little bit","A maple tree, a maple","a parallel, a parallel line","A seal, a seal ring","A service, a prayer service","a caffè mocha, a mochaccino, a mocha","A professor, a college professor, a university professor","to bald, to go bald","To be canceled, to get canceled","To break, to be broken, to get broken","To damage, to do damage,| to hurt","To get angry, to anger, to become angry","To get angry, to become angry, to anger","To get wet, to become wet","to hear, to be able to hear","to lie, to tell a lie","to make green, to green","To parallel, to be parallel to","to peek, to take a peek,| to glance","to pepper, to spice with pepper","To photocopy,| to xerox,| to copy, to make a copy of","To photograph, to take a photograph of","to risk, to take a risk,","to sacrifice, to offer a sacrifice","to saddle, to attach a saddle","To salt, to add salt to,","…, to sprinkle or pour salt on or into, to season with salt.","to shake out, to shake","to use, to make use of","to wake up, to awaken, to wake","To wake up, to awaken, to wake","to waste, to let go to waste","to curtain, to cover with a curtain, to curtain off","…, to make progress,| to move forward","To inscribe,| to write down,| to note, to make a note","A shelf; a bookshelf; a store shelf","A female convert to Judaism, a convert,| a proselyte","A living, making a living","Double, folded double","Dried, dried out","Enough; that's enough","Since, ever since","Than, more than","This, this one","this, this one","Tied, tied up,| bound","active, active voice","app, phone app,| applet","background, desktop background","behind; from behind","brand, brand name","camera flash, flash","care, medical care,| treatment","ebony, ebony tree","embarrassed, easily embarrassed,| shy","factory,| plant, manufacturing plant","first of all, first","frame, picture frame","funeral, funeral procession","ink, India ink","just, just now","light, light source","lighter, cigarette lighter","luck, good luck,| good fortune","luxury, luxury good","memory, computer memory","naked,| nude, in the nude","natron,| niter,| soda, carbonate of soda","not, do not","passive, passive voice","period, time period","place, place of human abode","please, if you please","process, computer process","reaction, chemical reaction","roast, roast meat","stamp, postage stamp","time, period of time","to attack, initiate an attack","to cause to forget, make forget","to cool, cool off, cool down,| decrease in temperature","to decree, issue a decree","to dress, dress oneself, get dressed","to fire,| lay off,| terminate, terminate the employment of","to hide, hide oneself,| secrete oneself","to hurry, hurry up,| speed up,| make haste","to leave, leave behind,| depart","to oil, lubricate with oil","to raise, raise up,| put up","to shape, give a shape to","to shower, take a shower","to sprout, cause to sprout","to stress, stress out","to turn or colour something blue, to blue, bluen","to turn, turn around,| rotate,| swivel,| or spin","to wait, wait for","to weigh, weigh in","town, small town","trust, trust fund","very much, very,| extremely","to stop,| to terminate,| to end,| to cut off, cut short","To wake, awaken, wake up","To illuminate,| light, light up,| brighten","To double, fold double, double over","here,| this place, at this place, in this place","in front, in the front,| ahead","at the time; at that time;|","according to;| in one's opinion; in the opinion of","in the eyes of; in someone's eyes;|","As opposed to;| compared to; compared with;|","In place, in its place,| in order","to be thrown, thrown down,| dropped","to be wise, become wise,| learn","to become empty, empty out,| clear out","(uncertain) to cause to let drop, to cause to drop","America, United States of America","Avot, Pirkei Avot","Dressed up (in a costume), in costume, costumed,","…, wearing a costume.","Hither,| (to) here, over (to) here","hither,| (to) here, over (to) here","Luxembourg, Luxembourg City","Michigan, Lake Michigan","Mississippi, Mississippi River","Rome, Ancient Rome","Washington, Washington State","To close, close up","To fold (something); to fold (something) up","To light, light up,| ignite","To meet (with someone), to have a meeting with, to meet","To play (music), to play music","To stop, to stop moving,| to halt,| to stop the motion of","Until, till, up until","broad bean, fava bean, fava","investment, an investment","just, just now (a short","security, internal security","to heat, to heat up,| to warm, to warm up","to join (person), to join in,","to run (someone) over, run (someone) down","to spread, spread (something) out","to throw (something), to throw (something) down","toilet bowl, toilet","use,| utilization,| using, making use","A (female) minor, a (female) legal minor","A (male) lieutenant, a (male) first lieutenant","A (male) minor, a (male) legal minor","A (male) twin, a twin brother","A class, a ship class","A greenfinch, a European greenfinch","A phalanx, a phalanx bone","A sector, an economic sector","An album, a photo album","An album, a stamp album","An offensive, a military offensive","Autonomy, local autonomy","Autonomy, personal autonomy","Climate, a climate","Diet, a diet","Half, one half","Release, a release,| an act of releasing","Release, a release:","Sale, a sale","The environment, the natural environment","To be fried, to become fried,| to undergo frying","To cool, cool off, cool down:","To dry, to dry out","Wind, a wind","Worry, a worry","clinic, medical clinic","light, visible light","to be fried, to become fried,| to undergo frying","to dry, to dry out","A Jubilee, a Jubilee year","A direction, a cardinal direction","A unit, a unit of measure","A unit, an organizational unit","Celebration, a celebration","Commitment, a commitment,| a pledge","Legislation, a piece of legislation","So, so anyway","A bible, A Bible","A campus, a college or university campus","A conservative, a Conservative","An expression, a mathematical or algebraic expression","Force, a force","Relief, a sense of relief, a feeling of relief","Without, without the existence or presence of","hundred, one hundred","thousand, one thousand","new moon, the day of the new moon","one, one of","suddenly, all of a sudden, of a sudden","For a long time, since a long time ago","Drugged, on drugs, under the influence of drugs","Thunder, a clap of thunder, thunderclap","Long ago, a long time ago","Most, the most","Politics; a politics","The Left, the political left","The West, the Western world","the Muslim world, the Muslims"],"one_construction_lists":["if, should, had"],"word_and_definition_openings":["A ram, a male sheep","A day, a 24-hour period","A preparation, an act of preparing","A shofar, a ram's-horn trumpet","A girlfriend; a female romantic partner","a golem, a clay automaton","A shot glass, a cup, a glass especially small","to sit, to be in a position","To run; to move forward quickly","to be sold, to be transferred","To crash, to suddenly","to egg on, to provoke","To rise in standing; to progress","To remember suddenly; to remember after","to uncover the corona, to split","To reach an age, to become","to google, to look something up","To be killed; to die suddenly","to pass, to not fail a test","to chuckle, to laugh quietly","to be made definite, to be put","To act as a usurer, to lend","to realize, to become aware","to trust, to have faith","To understand, to have understanding, to be one who","A (male) secretary, a man tasked","a representative, a chosen or elected","(of celestial bodies) to be in conjunction","A counselor, a diplomat who","a godlike figure, someone with","sister-in-law, brother's wife","a minute (one sixtieth","the other side [of], the region","babysitter; a (male) person","to babysit; to act as a babysitter","to officially adopt, to ratify (give","(plural) regulations, delegated legislation","An ephah, a former Hebrew unit","To be exempt (from), to have satisfied","oxytone; on the ult","paroxytone; on the penult","Bride price, the money paid","In-law, A relative","Order, the state of being","shekel, unit of weight","a wall, a structure built","a course, strong fiber","negro, a (male) black person","bachelorette (bachelor girl), an unmarried"],"plain_list_openings":["A blessing, a toast","at first glance, on the face","now, for the time being","far be it, it is forbidden","gone, wasted, damaged","lesser, inferior, of low","With, among, at the place","criticism, critique, critical","a secretarial department, or","scripture, the Bible","universe, the world","head, beginning, start;","branch, bough, a wooden stick","From, of, from inside","Of, belonging to, owned by","sex, a fuck","logic, a reason","a rebellion, insurrection, mutiny","explained, made clear","stub, shred, a small piece","subordinate or secondary thing;","attachment, an appendix","a trifle, minor thing","Friends, gang, guys","quarter, one fourth","innocent, honest, having integrity","exit, leaving, departure","Recently, lately, of late","Necessarily, of necessity","how, the way how","guard, protector, one who protects","sure, of course","restriction, a protective condition","awesome, the best","An evil, trouble;","Mistake, flaw, defect","that which, the thing that","Next; the one after"],"name_description_openings":["A poem inserted into the leader's","a kind of bat, Desmodus","Israelian, Israelitish, of or pertaining","Shabbat, Sabbath; weekly","A collective term for the Kenites","A one of the sons of Shimhi","an abbreviation for the Arba'ah Turim","the Assyrian nation","the children of Israel","The mother of Jehozabad","tsade ("],"capital_lists_kept_plain":["spanish, portuguese","upright, god-fearing"],"label_pieces":["for example","figuratively","literally","especially","specifically","also"],"name_labels":["a male given name","a female given name","a male or female given name","a female or male given name","a unisex given name","a surname"],"usage_line_openers":["used","introducing","with incorporated","with third-person","vocative particle","alternative form of the prefix","in the context of"],"tail_openers":["especially","particularly","specifically","usually","often","oftentimes","typically","generally","chiefly","mainly","mostly","primarily","commonly","normally","traditionally","originally","formerly","now","probably","possibly","perhaps","most likely","likely","such as","like a","like an","like in","e.g.","i.e.","that is","including","used","said","found","known","called","also","better known","located","mentioned","equivalent","sometimes anglicized","either","both","as","in relation","in the sense","in the context","in accordance","considered","identified","corresponding","referring","associated","or similar","or the like","or other","or otherwise","or more generally","or possibly","or someone","banned","first published","taken as","collectively","from which","which","whose","who","where","whom","than","written","named","made from","opposed","even","see","expression of","an exclamation","a cynical exclamation","a weakly positive","for example","done","thought","trained","recited","centered","further details"],"etc_pieces":["i.e","i.e.","e.g","e.g.","etc","etc.","et cetera","and so on","and the like","or similar","or the like","that is","also"],"lists_with_an_opener_word":["goodbye, bye, see you later","with regard to, in re, as to","as if, as though","yeah, right, as if","now, for the time being","despite, in spite of","in other words, that is to say","et cetera, and the like"],"description_openers":["a","an","the","one","son","daughter","husband","wife","father","mother","brother","sister","grandson","king","queen","better"],"common_word_heads":["Force","Release","Relief","Shade","Walking","Implementation","Discussion","Binding","Order","Mistake","Friends","Convergence","Leading","Editing","Creation","Knowledge","Thunder","All the more so","Exhibiting both male and female characteristics","Infinity","Next","One who uses","One's allotted portion","Someone who is very physically attractive","Something amazing or beautiful","Testosterone","We","Specifically","L-shaped","Long ago","Most","Politics"],"definition_openers":["a","an","the","one","someone","something","having","lacking","being","of","made","relating","related","referring","pertaining","belonging","possessing"],"small_verbs":["to be","to become","to grow","be","become"],"small_verb_stops":["be","become","get","to"],"own_plural_texts":["datum, data"],"note_openers":["used","use","indicating","indicates","denoting","expressing","found","said","especially","often","usually","typically","chiefly","mainly","mostly","generally","compared","introducing","preceding","followed","also used","in modern usage","further details","appended","plural","passive","feminine","masculine","singular","dual","starts","see","a term of","a negative","an expression","forming"],"label_openers":["used ","indicates ","expresses ","appended to ","epithet of ","epithet for ","a title for ","a female given name","a male given name","a surname","the meaning of this term is uncertain","one of the 613 commandments","a representation of ","negative interrogative particle","interrogative particle","multiplicative particle","see there"],"name_heads":["Chazal","Jackson","Lilith","Megiddo or Megiddon","Nabu","Nakh","Nebo","Nevo","Pe'ah","Reuben, Reuven","Toronto","Fa","Do","Sol","433 Eros","The northern parts of Israel","master of the world/universe","Amharic"],"name_head_openings":["A curse, specifically","Canaan, the land"],"points_back_heads":["Copper","Chickpeas, garbanzo beans","A mail, an e-mail","A disappointment","Salmon","A salmon","Savory","A tragedy"],"abbreviations_in_lists":["e.g.","i.e.","etc."],"notes_after_hebrew":["see ","sometimes ","literally","lit.","often ","always ","usually ","followed ","with ","plural ","feminine ","masculine ","singular ","also ","or ","the ","a ","an ","form of "],"subject_words":["he/it","she/it","he","she","it","they","you","i","and"],"conjugation_notes":["suffix conjugation","prefix conjugation","hence past tense","hence future tense","infinitive construct or gerund"],"object_slots":["something","someone","oneself","someone or something","something or someone","a person","a thing","an object","people"],"abbreviations":["e.g","g","i.e","e","i","etc","Etc","spp","lit","esp","c","r","J","expl","q","q.v","v","n","m","f","St","st","No","num","Min","blvd","Ms","Mrs","Prof","Dr","Mr","U","U.S","U.S.S","U.S.S.R","S","R","K","M","M.K","M.P","P","P.M","O","O.K","C","C.E","B","B.C","vs","abbr","Uni","pron","et","al","N","BC","CE"]};
const HEB = /[\u0590-\u05FF]/u;
const ARTS = ["a", "an", "the"];
function topView(s) { let d = 0, out = ""; for (const ch of s) { if (OPEN[ch]) { d++; continue; } if (CLOSE[ch]) { if (d) d--; continue; } if (!d) out += ch; } return out; }
function listText(s) { let t = topView(s).trim(); if (t.endsWith(".")) t = t.slice(0, -1).trim(); return t; }
function wordsOf(p) { return p.trim().split(/\s+/u).filter(Boolean); }
function piecesOf(t) { return t.split(/[,;]/u).map((p) => p.trim()); }
function firstWord(p) { return (wordsOf(p)[0] || "").toLowerCase(); }
function isPlain(t) {
  if (HEB.test(t)) return false;
  let u = t; for (const ab of LISTS.abbreviations_in_lists) u = u.split(ab).join("");
  const chars = [...u];
  return chars.every((ch, k) => !isMark(ch) || ch === "," || ch === ";" || ((ch === "-" || ch === "'" || ch === "\u2019") && /[\p{L}\p{N}]/u.test(chars[k - 1] || "") && /[\p{L}\p{N}]/u.test(chars[k + 1] || "")));
}
function opensWith(p, list) { const s = p.toLowerCase(); return list.some((e) => s.startsWith(e) && /^\s/u.test(s.slice(e.length))); }
function beginsWithAny(text, list) { return list.some((e) => text.startsWith(e)); }
function tailStart(P) { for (let k = 1; k < P.length; k++) if (opensWith(P[k], LISTS.tail_openers) || LISTS.etc_pieces.includes(P[k].toLowerCase())) return k; return -1; }
function separatorsBefore(c) { return (topView(c.before).match(/[,;]/gu) || []).length; }
function inTail(c) { return separatorsBefore(c) + 1 >= tailStart(piecesOf(listText(c.text))); }
function namedFirst(P) { const w = wordsOf(P[0]); if (!w.length || w[0] === "To") return false; const f = ARTS.includes(w[0].toLowerCase()) && w.length > 1 ? w[1] : w[0]; return /^\p{Lu}/u.test(f) && !LISTS.common_word_heads.includes(P[0]); }
function isOneWordList(P) { return P.every((p) => wordsOf(p).length === 1); }
function laterCapital(P) { return P.slice(1).some((p) => /^\p{Lu}/u.test(p) && !["I", "A", "An", "The"].includes(wordsOf(p)[0])); }
function isToList(P) { return P.every((p) => firstWord(p) === "to"); }
function isToWordList(P) { const w = wordsOf(P[0]); return w.length === 2 && w[0].toLowerCase() === "to" && P.slice(1).every((p) => wordsOf(p).length === 1); }
function isArticleList(P) { return P.every((p) => { const w = wordsOf(p); return ARTS.includes(firstWord(p)) && w.length <= 4 && !w.slice(1).some((x) => /\p{Lu}/u.test(x)); }); }
function isArticleWordList(P) { const w = wordsOf(P[0]); return w.length === 2 && ARTS.includes(w[0].toLowerCase()) && !/\p{Lu}/u.test(w[1]) && !laterCapital(P) && P.slice(1).every((p) => wordsOf(p).length === 1); }
function isArticleNameList(P) { const w = wordsOf(P[0]); return w.length === 2 && ARTS.includes(w[0].toLowerCase()) && /^\p{Lu}/u.test(w[1]) && P.slice(1).every((p) => wordsOf(p).length === 1); }
function isOwnPlural(P) { const low = P.map((p) => p.toLowerCase()); return low.some((a) => low.some((b) => b === a + "s" || b === a + "es" || (a.endsWith("y") && b === a.slice(0, -1) + "ies"))) || LISTS.own_plural_texts.includes(low.join(", ")); }
function isSmallVerbList(P) { const f = P[0].toLowerCase(); if (!LISTS.small_verbs.some((v) => f === v || f.startsWith(v + " "))) return false; return P.slice(1).some((p) => !LISTS.small_verb_stops.includes(firstWord(p))); }
function isDefinitionList(P) { return wordsOf(P[0]).length <= 4 && P.slice(1).some((p) => LISTS.definition_openers.includes(firstWord(p)) || wordsOf(p).length >= 5); }
function isWordList(P) { return isOneWordList(P) || isToList(P) || isToWordList(P) || isArticleList(P) || isArticleWordList(P); }
function listKind(text) {
  if (beginsWithAny(text.trim(), LISTS.not_list_openings)) return "not_list";
  if (beginsWithAny(text.trim(), LISTS.word_and_definition_openings)) return "definition";
  const t = listText(text);
  if (t.includes(":")) return "colon";
  if (HEB.test(t)) return "hebrew";
  const P = piecesOf(t);
  if (!isPlain(t) || P.some((p) => !p)) return "signs";
  const low = t.toLowerCase();
  if (LISTS.name_labels.some((e) => low === e || (low.startsWith(e) && /^[\s,;]/u.test(low.slice(e.length))))) return "name_label";
  if (opensWith(t, LISTS.usage_line_openers)) return "usage_line";
  if (beginsWithAny(text.trim(), LISTS.name_description_openings) || (namedFirst(P) && P.slice(1).some((p) => LISTS.description_openers.includes(firstWord(p))))) return "name_description";
  if (!LISTS.lists_with_an_opener_word.some((e) => low.startsWith(e)) && tailStart(P) >= 0) return "tail";
  if (/[()\[\]]/u.test(text)) { if (isSmallVerbList(P)) return "small_verb"; if (laterCapital(P)) return "names"; return "bracket"; }
  if (isOwnPlural(P)) return "phrases";
  if (isOneWordList(P)) return laterCapital(P) && !LISTS.capital_lists_kept_plain.includes(low) ? "names" : "one_word";
  if (isToList(P) || isToWordList(P)) return "verbs";
  if (isArticleList(P) || isArticleWordList(P)) return "articles";
  if (isArticleNameList(P)) return "names";
  if (isSmallVerbList(P)) return "small_verb";
  if (laterCapital(P)) return "names";
  if (firstWord(P[0]) === "to") return "phrases";
  if (isDefinitionList(P) && !beginsWithAny(text.trim(), LISTS.plain_list_openings)) return "definition";
  return "phrases";
}
function explanationStart(text) { if (beginsWithAny(text.trim(), LISTS.word_and_definition_openings)) return 1; const P = piecesOf(listText(text)); for (let k = 1; k < P.length; k++) if (LISTS.definition_openers.includes(firstWord(P[k])) || wordsOf(P[k]).length >= 5) return k; return 1; }
function topColons(text) { const out = []; let d = 0; for (let i = 0; i < text.length; i++) { const ch = text[i]; if (OPEN[ch]) d++; else if (CLOSE[ch]) { if (d) d--; } else if (ch === ":" && d === 0) out.push(i); } return out; }
function colonKind(text, i) {
  const left = topView(text.slice(0, i)).trim(), R = listText(text.slice(i + 1)), low = left.toLowerCase();
  if (!R) return "at_end";
  if (/\p{N}$/u.test(text.slice(0, i)) && /^\p{N}/u.test(text.slice(i + 1))) return "reference";
  if (/^[-\u2013](\s|$)/u.test(R)) return "before_dash";
  if (R.startsWith("the ") && R.includes("letter of the Hebrew alphabet")) return "name";
  const label = LISTS.label_openers.some((x) => low.startsWith(x)), lh = HEB.test(left), rh = HEB.test(R), note = opensWith(R, LISTS.note_openers);
  if ((label || lh) && (rh || note)) return "between_notes";
  if (label) return "label";
  if (lh) return "after_pointer";
  if (rh) return "before_pointer";
  if (note) return "before_note";
  if (LISTS.name_heads.includes(left) || LISTS.name_head_openings.some((e) => left.startsWith(e))) return "name";
  if (LISTS.points_back_heads.includes(left) && /(^|[^\p{L}])(this|these)([^\p{L}]|$)/u.test(R)) return "points_back";
  return "definition";
}
function nearColon(c) { const cs = topColons(c.text); const right = cs.find((i) => i > c.i); const left = [...cs].reverse().find((i) => i < c.i); if (right !== undefined) return { side: "right", kind: colonKind(c.text, right), stretch: listText(c.text.slice(left === undefined ? 0 : left + 1, right)) }; if (left !== undefined) return { side: "left", kind: colonKind(c.text, left), stretch: listText(c.text.slice(left + 1)) }; return { side: "", kind: "", stretch: "" }; }
function isListStretch(s) { const P = piecesOf(s); return isPlain(s) && !P.some((p) => !p) && tailStart(P) < 0; }
function dashColon(c, after) { return topColons(c.text).some((i) => (after ? i > c.i : i < c.i) && colonKind(c.text, i) === "before_dash"); }
function placeIn(c, list) { let held = ""; for (const e of list) { const atEnd = e.startsWith("\u2026"); const raw = atEnd ? e.slice(1) : e; const s = raw.replace(/\|/gu, ""); if (atEnd ? !c.text.endsWith(s) : !c.text.startsWith(s)) continue; const off = atEnd ? c.text.length - s.length : 0; let k = 0; for (let n = 0; n < raw.length; n++) { if (raw[n] === "|") continue; if (k + off === c.i) { if (raw[n + 1] === "|") return "marked"; held = "unmarked"; } k++; } } return held; }
function labelWordBefore(c) { if (c.text.startsWith("Also, ") || listKind(c.text) === "one_word") return false; const parts = topView(c.before).split(/[,;:]/u); return LISTS.label_pieces.includes(parts[parts.length - 1].trim().toLowerCase()); }
function capitalHead(c) { if (listKind(c.text) !== "colon") return false; const n = nearColon(c); return n.side === "right" && (n.kind === "definition" || n.kind === "at_end") && isListStretch(n.stretch) && laterCapital(piecesOf(n.stretch)); }
function remarkNext(c) { const f = piecesOf(listText(c.after))[0] || ""; return LISTS.tail_openers.includes(f.toLowerCase()) || opensWith(f, LISTS.tail_openers); }
function smallVerbHere(c) { const k = listKind(c.text); if (k === "small_verb") return true; if (k === "tail") { const P = piecesOf(listText(c.text)); return !inTail(c) && isSmallVerbList(P.slice(0, tailStart(P))); } if (k === "colon") { const n = nearColon(c); return n.side === "right" && (n.kind === "definition" || n.kind === "at_end") && isListStretch(n.stretch) && isSmallVerbList(piecesOf(n.stretch)); } return false; }
function pairBefore(c) { return OPEN[c.mark] ? c.before : c.text.slice(0, c.i - c.group.length - 1); }
function pairAfter(c) { return OPEN[c.mark] ? c.after.slice(c.group.length + 1) : c.after; }
function neverOpened(c) { return c.group === "" && !c.before.endsWith(CLOSE[c.mark]); }
function roundKind(c) {
  const g = c.group, b = pairBefore(c), a = pairAfter(c), low = g.trim().toLowerCase();
  if (c.container === "bracket") return "in_square";
  if (c.container === "paren") return "in_round";
  if (/^\p{L}/u.test(a) || (/\p{L}$/u.test(b) && /^[\p{L}-]*$/u.test(g))) return "word_part";
  if (!/[\p{L}\p{N}]/u.test(g)) return "only_signs";
  if (HEB.test(b.trimEnd().slice(-1)) || /[\u0590-\u05FF]\s+[mf]\s*$/u.test(b)) {
    if (/^["\u201C]/u.test(g.trim())) return "quoted_after_hebrew";
    if (g.trim().startsWith("=") || HEB.test(g) || LISTS.notes_after_hebrew.some((x) => low.startsWith(x))) return "note_after_hebrew";
    return "romanization";
  }
  if (HEB.test(g)) return "holds_hebrew";
  if (LISTS.subject_words.includes(low)) return "subject";
  if (low === "male" || low === "female") return "gender";
  if (LISTS.conjugation_notes.includes(low)) return "conjugation";
  if (LISTS.object_slots.includes(low)) return "object";
  if (!b.trim() && a.trim()) return "opens_text";
  if (!/[\p{L}\p{N}]/u.test(a) && b.trimEnd().endsWith(".")) return "after_stop";
  if (!/[\p{L}\p{N}]/u.test(a)) return "ends_text";
  return "in_text";
}
function squareKind(c) { const g = c.group.trim(); if (c.text.includes("[[")) return "link_markup"; if (g.startsWith("with ")) return "with"; if (g.startsWith("see ")) return "see"; if (g.startsWith("=")) return "equals"; if (!/[\p{L}\p{N}]/u.test(g)) return "only_signs"; if (g.includes("\u031E")) return "sound"; return "supplied"; }
function pairFollowsHebrew(c) { let d = 0; const b = c.before; for (let i = b.length - 1; i >= 0; i--) { const ch = b[i]; if (CLOSE[ch]) d++; else if (OPEN[ch]) { if (d) d--; else return HEB.test(b.slice(0, i).trimEnd().slice(-1)); } } return false; }
function runBefore(b) { const m = /[\p{L}\p{N}.]*[\p{L}\p{N}]$/u.exec(b); return m ? m[0] : ""; }
function nextChar(a) { const m = /\S/u.exec(a); return m ? m[0] : ""; }
function prevChar(b) { const t = b.trimEnd(); return t ? t[t.length - 1] : ""; }

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
