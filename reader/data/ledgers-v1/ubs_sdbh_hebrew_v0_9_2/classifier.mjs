// ubs_sdbh_hebrew_v0_9_2.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  // ---- fragment structure ----
  { id: "semicolon.in_unbalanced_text", mark: ";", divides: false, test: (c) => unbalanced(c.text) },
  { id: "semicolon.before_alternative_that_leans", mark: ";", divides: false, test: (c) => nextIs(c.after, ["or: = similar in appearance"]) },
  { id: "semicolon.before_other_meaning", mark: ";", divides: false, test: (c) => nextIs(c.after, ["or, in a loosely sense"]) },
  { id: "semicolon.before_alternative_under_shared_note", mark: ";", divides: false, test: (c) => nextIs(c.after, ALTS) && sharedNote(c.text) },
  { id: "semicolon.before_alternative_under_head_label", mark: ";", divides: false, test: (c) => nextIs(c.after, ALTS) && opensWithLabel(c.text) },
  { id: "semicolon.before_alternative_under_opening_wording", mark: ";", divides: false, test: (c) => nextIs(c.after, ALTS) && opensWithOpener(c.text) },
  { id: "semicolon.before_alternative", mark: ";", divides: false, test: (c) => nextIs(c.after, ALTS) && !sharedNote(c.text) && !opensWithLabel(c.text) && !opensWithOpener(c.text) },
  { id: "semicolon.after_hence_typed_for_colon", mark: ";", divides: false, test: (c) => prevIs(c.before, ["hence"]) },
  { id: "semicolon.after_label_inside_the_meaning", mark: ";", divides: false, test: (c) => opensWithOpener(c.text) && prevIs(c.before, ["exact meaning unsure", "exact meaning unknown", "exact meaning uncertain", "meaning unsure", "meaning unknown", "meaning uncertain"]) },
  { id: "semicolon.before_black_left_pointing_pointer", mark: ";", divides: false, test: (c) => nextChar(c.after) === "◄" },
  { id: "semicolon.before_black_right_pointing_pointer", mark: ";", divides: false, test: (c) => nextChar(c.after) === "►" },
  { id: "semicolon.before_almost_equal_to", mark: ";", divides: false, test: (c) => nextChar(c.after) === "≈" },
  { id: "semicolon.after_opening_label", mark: ";", divides: false, test: (c) => LABELS.includes(c.before) },
  { id: "semicolon.after_guess_about_the_hebrew", mark: ";", divides: false, test: (c) => opensWithLabel(c.text) && /[\u05D0-\u05EA]/u.test(c.before) && nextIs(c.after, ["hence"]) },
  { id: "semicolon.before_meaning_under_opening_label", mark: ";", divides: false, test: (c) => opensWithLabel(c.text) && (nextIs(c.after, ["hence"]) || (OPENERS.some((w) => c.before.includes(w)) && (nextIs(c.after, ["possibly", "probably"]) || nextChar(c.after) === "="))) },
  { id: "semicolon.before_meaning_under_label_in_the_wording", mark: ";", divides: false, test: (c) => wordingMeaningSemi(c) && LABIN.some((l) => c.before.includes(l)) },
  { id: "semicolon.between_literal_name_and_its_description", mark: ";", divides: false, test: (c) => wordingMeaningSemi(c) && (opensWithLiteralName(c.text) || pieceOpensWithTitle(c.after)) },
  { id: "semicolon.after_wording_that_speaks_of_the_turn", mark: ";", divides: false, test: (c) => wordingMeaningSemi(c) && speaksOfTurn(c.before) },
  { id: "semicolon.after_description_inside_the_wording", mark: ";", divides: false, test: (c) => wordingMeaningSemi(c) && c.before.includes("; particle") },
  { id: "semicolon.between_wording_and_meaning", mark: ";", divides: false, test: (c) => wordingMeaningSemi(c) },
  { id: "semicolon.before_definition_mark", mark: ";", divides: false, test: (c) => nextChar(c.after) === "=" },
  { id: "semicolon.before_or_that_leans", mark: ";", divides: false, test: (c) => nextIs(c.after, ["or", "alternatively"]) },
  { id: "semicolon.ending_the_text", mark: ";", divides: false, test: (c) => c.after.trim() === "" },
  { id: "semicolon.any_other", mark: ";", divides: false, test: (c) => true },
  { id: "colon.in_unbalanced_text", mark: ":", divides: false, test: (c) => unbalanced(c.text) },
  { id: "colon.in_citation_number", mark: ":", divides: false, test: (c) => /[0-9]$/u.test(c.before) && /^[0-9]/u.test(c.after) },
  { id: "colon.inside_round_bracket", mark: ":", divides: false, test: (c) => c.container === "paren" },
  { id: "colon.after_literal_opener", mark: ":", divides: false, test: (c) => prevIs(c.before, OPENERS) },
  { id: "colon.after_hence", mark: ":", divides: false, test: (c) => prevIs(c.before, ["hence"]) },
  { id: "colon.after_alternative_label", mark: ":", divides: false, test: (c) => prevIs(c.before, ["or", "either", "alternatively"]) },
  { id: "colon.after_label_word", mark: ":", divides: false, test: (c) => prevIs(c.before, LABELW) },
  { id: "colon.between_literal_name_and_its_description", mark: ":", divides: false, test: (c) => wordingMeaningColon(c) && opensWithLiteralName(c.text) },
  { id: "colon.after_wording_that_speaks_of_the_turn", mark: ":", divides: false, test: (c) => wordingMeaningColon(c) && speaksOfTurn(c.before) },
  { id: "colon.before_meaning_under_opening_label", mark: ":", divides: false, test: (c) => opensWithLabel(c.text) && OPENERS.some((w) => c.before.includes(w)) && nextChar(c.after) === "=" },
  { id: "colon.between_wording_and_meaning", mark: ":", divides: false, test: (c) => wordingMeaningColon(c) },
  { id: "colon.any_other", mark: ":", divides: false, test: (c) => true },
  { id: "equals.in_unbalanced_text", mark: "=", divides: false, test: (c) => unbalanced(c.text) },
  { id: "equals.inside_round_bracket", mark: "=", divides: false, test: (c) => c.container === "paren" },
  { id: "equals.opening_the_text", mark: "=", divides: false, test: (c) => c.before.trim() === "" },
  { id: "equals.after_label_and_colon", mark: "=", divides: false, test: (c) => prevChar(c.before) === ":" },
  { id: "equals.after_semicolon", mark: "=", divides: false, test: (c) => prevChar(c.before) === ";" },
  { id: "equals.between_literal_name_and_its_description", mark: "=", divides: false, test: (c) => opensWithLiteralName(c.text) && !c.before.includes(";") },
  { id: "equals.between_wording_and_meaning", mark: "=", divides: false, test: (c) => GE.includes(c.before.trim()) || (opensWithOpener(c.text) && !c.before.includes(";") && !bareOpener(c.before)) },
  { id: "equals.after_label_without_colon", mark: "=", divides: false, test: (c) => prevIs(c.before, EQLAB) },
  { id: "equals.any_other", mark: "=", divides: false, test: (c) => true },
  { id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
  { id: "comma.inside_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.between_two_renderings_in_one_gloss", mark: ",", divides: false, test: (c) => G2.includes(c.text) },
  { id: "comma.between_renderings_that_share_words", mark: ",", divides: false, test: (c) => GS.includes(c.text) },
  { id: "comma.before_alternative_under_shared_note", mark: ",", divides: false, test: (c) => nextIs(c.after, ["or:"]) && noteOnlyAfter(c) },
  { id: "comma.before_other_meaning_under_label_or_note", mark: ",", divides: false, test: (c) => nextIs(c.after, COMMAALT) && (opensWithLabel(c.text) || noteOnlyAfter(c)) },
  { id: "comma.before_other_meaning", mark: ",", divides: false, test: (c) => nextIs(c.after, COMMAALT) },
  { id: "comma.between_wording_and_meaning", mark: ",", divides: false, test: (c) => opensWithOpener(c.text) && !c.before.includes(";") && nextIs(c.after, ["hence"]) },
  { id: "comma.after_literal_opener", mark: ",", divides: false, test: (c) => opensWithOpener(c.text) && bareOpener(c.before) },
  { id: "comma.before_hedge_label", mark: ",", divides: false, test: (c) => nextIs(c.after, HEDGEC) },
  { id: "comma.in_literal_wording", mark: ",", divides: false, test: (c) => opensWithOpener(c.text) && !c.before.includes(";") && !c.before.includes("=") },
  { id: "comma.before_note_mark", mark: ",", divides: false, test: (c) => ["◄", "►", "≈"].includes(nextChar(c.after)) },
  { id: "comma.before_name_description", mark: ",", divides: false, test: (c) => nextIs(c.after, NAMEDESC) },
  { id: "comma.before_small_word", mark: ",", divides: false, test: (c) => nextIs(c.after, SMALL) },
  { id: "comma.any_other", mark: ",", divides: false, test: (c) => true },
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.before_alternative", mark: ".", divides: false, test: (c) => nextIs(c.after, ["Or alternatively"]) },
  { id: "period.in_three_dots", mark: ".", divides: false, test: (c) => c.before.endsWith(".") || c.after.startsWith(".") },
  { id: "period.decimal_point", mark: ".", divides: false, test: (c) => /[0-9]$/u.test(c.before) && /^[0-9]/u.test(c.after) },
  { id: "period.after_etc", mark: ".", divides: false, test: (c) => prevIs(c.before, ETC) },
  { id: "period.in_abbreviation", mark: ".", divides: false, test: (c) => prevIs(c.before, ABBR) },
  { id: "period.any_other", mark: ".", divides: false, test: (c) => true },
  { id: "black_left_pointing_pointer.opens_note", mark: "◄", divides: false, test: (c) => true },
  { id: "black_right_pointing_pointer.opens_note", mark: "►", divides: false, test: (c) => true },
  { id: "almost_equal_to.opens_note", mark: "≈", divides: false, test: (c) => true },
  // ---- fragment brackets ----
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => c.group === "" && !c.before.endsWith("(") },
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  { id: "open_paren.inside_round_bracket", mark: "(", divides: false, test: (c) => c.container === "paren" },
  { id: "close_paren.inside_round_bracket", mark: ")", divides: false, test: (c) => c.container === "paren" },
  { id: "open_paren.holds_nothing", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "nothing" },
  { id: "close_paren.holds_nothing", mark: ")", divides: false, test: (c) => roundKind(c.group) === "nothing" },
  { id: "open_paren.holds_ending", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "ending" },
  { id: "close_paren.holds_ending", mark: ")", divides: false, test: (c) => roundKind(c.group) === "ending" },
  { id: "open_paren.holds_prefix", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "prefix" },
  { id: "close_paren.holds_prefix", mark: ")", divides: false, test: (c) => roundKind(c.group) === "prefix" },
  { id: "open_paren.holds_item", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "item" },
  { id: "close_paren.holds_item", mark: ")", divides: false, test: (c) => roundKind(c.group) === "item" },
  { id: "open_paren.holds_citation", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "citation" },
  { id: "close_paren.holds_citation", mark: ")", divides: false, test: (c) => roundKind(c.group) === "citation" },
  { id: "open_paren.holds_date", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "date" },
  { id: "close_paren.holds_date", mark: ")", divides: false, test: (c) => roundKind(c.group) === "date" },
  { id: "open_paren.holds_pointer", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "pointer" },
  { id: "close_paren.holds_pointer", mark: ")", divides: false, test: (c) => roundKind(c.group) === "pointer" },
  { id: "open_paren.holds_slot", mark: "(", divides: false, test: (c) => c.group !== null && roundKind(c.group) === "slot" },
  { id: "close_paren.holds_slot", mark: ")", divides: false, test: (c) => roundKind(c.group) === "slot" },
  { id: "open_paren.any_other", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.any_other", mark: ")", divides: false, test: (c) => true },
  { id: "open_bracket.holds_sense_letter", mark: "[", divides: false, test: (c) => true },
  { id: "close_bracket.holds_sense_letter", mark: "]", divides: false, test: (c) => true },
  { id: "close_angle.wording_to_meaning", mark: ">", divides: false, test: (c) => true },
  // ---- fragment rest ----
  { id: "slash.and_or", mark: "/", divides: false, test: (c) => prevIs(c.before, ["and"]) && nextIs(c.after, ["or"]) },
  { id: "slash.pronoun_pair", mark: "/", divides: false, test: (c) => prevIs(c.before, PROL) && nextIs(c.after, PROR) },
  { id: "slash.month_pair", mark: "/", divides: false, test: (c) => prevIs(c.before, MONTHS) && nextIs(c.after, MONTHS) },
  { id: "slash.state_or_process", mark: "/", divides: false, test: (c) => prevIs(c.before, ["state"]) && nextIs(c.after, ["process"]) },
  { id: "slash.between_two_capitalized_names", mark: "/", divides: false, test: (c) => /(^|[^\p{L}])\p{Lu}\p{L}*$/u.test(c.before) && /^\p{Lu}/u.test(c.after) },
  { id: "slash.in_year", mark: "/", divides: false, test: (c) => /[0-9]$/u.test(c.before) && /^[0-9]/u.test(c.after) },
  { id: "slash.inside_round_bracket_any_other", mark: "/", divides: false, test: (c) => c.container === "paren" },
  { id: "slash.any_other", mark: "/", divides: false, test: (c) => true },
  { id: "apostrophe.around_quoted_word", mark: "'", divides: false, test: (c) => c.after.startsWith("arrow'") || c.before.endsWith("'arrow") },
  { id: "apostrophe.inside_word", mark: "'", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "apostrophe.after_word", mark: "'", divides: false, test: (c) => /\p{L}$/u.test(c.before) },
  { id: "right_single_quotation_mark.possessive", mark: "’", divides: false, test: (c) => true },
  { id: "quote.around_cited_words", mark: "\"", divides: false, test: (c) => true },
  { id: "left_double_quotation_mark.opens_cited_words", mark: "“", divides: false, test: (c) => true },
  { id: "right_double_quotation_mark.closes_cited_words", mark: "”", divides: false, test: (c) => true },
  { id: "hyphen.in_number_range", mark: "-", divides: false, test: (c) => /[0-9]$/u.test(c.before) && /^[0-9]/u.test(c.after) },
  { id: "hyphen.as_dash", mark: "-", divides: false, test: (c) => c.before.endsWith("-") || c.after.startsWith("-") || (/\s$/u.test(c.before) && /^\s/u.test(c.after)) },
  { id: "hyphen.ending_a_prefix", mark: "-", divides: false, test: (c) => c.after.startsWith(")") },
  { id: "hyphen.opening_an_ending", mark: "-", divides: false, test: (c) => c.before.endsWith("(") },
  { id: "hyphen.inside_word", mark: "-", divides: false, test: (c) => /\p{L}$/u.test(c.before) },
  { id: "en_dash.in_number_range", mark: "–", divides: false, test: (c) => true },
  { id: "non_breaking_hyphen.in_number_range", mark: "‑", divides: false, test: (c) => true },
  { id: "question_mark.in_rendering_that_asks", mark: "?", divides: false, test: (c) => c.text === "really?" || c.after.startsWith("\"") },
  { id: "question_mark.doubtful", mark: "?", divides: false, test: (c) => true },
  { id: "exclamation.between_two_interjections", mark: "!", divides: false, test: (c) => GI.includes(c.text) && c.after.trim() !== "" },
  { id: "exclamation.closing_an_interjection", mark: "!", divides: false, test: (c) => true },
  { id: "plus.before_added_means", mark: "+", divides: false, test: (c) => true },
  { id: "horizontal_ellipsis.between_paired_words", mark: "…", divides: false, test: (c) => true },
  { id: "hebrew_punctuation_sof_pasuq.typed_for_semicolon", mark: "׃", divides: false, test: (c) => true },
  { id: "maqaf.in_hebrew_citation", mark: "־", divides: false, test: (c) => true },
  { id: "pipe.opens_italic_name", mark: "|", divides: false, test: (c) => c.after.startsWith("i") && !c.after.startsWith("i*") },
  { id: "pipe.closes_italic_name", mark: "|", divides: false, test: (c) => c.after.startsWith("i*") },
  { id: "asterisk.closes_italic_name", mark: "*", divides: false, test: (c) => c.before.endsWith("|i") },
  { id: "hebrew_point_sheva.in_hebrew_citation", mark: "ְ", divides: false, test: (c) => true },
  { id: "hebrew_point_hataf_patah.in_hebrew_citation", mark: "ֲ", divides: false, test: (c) => true },
  { id: "hebrew_point_hiriq.in_hebrew_citation", mark: "ִ", divides: false, test: (c) => true },
  { id: "hebrew_point_tsere.in_hebrew_citation", mark: "ֵ", divides: false, test: (c) => true },
  { id: "hebrew_point_segol.in_hebrew_citation", mark: "ֶ", divides: false, test: (c) => true },
  { id: "hebrew_point_patah.in_hebrew_citation", mark: "ַ", divides: false, test: (c) => true },
  { id: "hebrew_point_qamats.in_hebrew_citation", mark: "ָ", divides: false, test: (c) => true },
  { id: "hebrew_point_holam.in_hebrew_citation", mark: "ֹ", divides: false, test: (c) => true },
  { id: "hebrew_point_dagesh_or_mapiq.in_hebrew_citation", mark: "ּ", divides: false, test: (c) => true },
  { id: "hebrew_point_shin_dot.in_hebrew_citation", mark: "ׁ", divides: false, test: (c) => true },
  { id: "hebrew_point_sin_dot.in_hebrew_citation", mark: "ׂ", divides: false, test: (c) => true },
];

// ---- helpers of fragment structure ----
function unbalanced(text) {
  const st = [];
  for (const ch of text) {
    if (OPEN[ch]) st.push(ch);
    else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
  }
  return st.length > 0;
}

const OPENERS = ["literally","literaly","liteallly","litterally","literallly"];
const ALTS = ["or:","alternatively:","or (2)","or possibly a thorny bush","or, a large drum","or a term referring","(b) state of extreme cold","(c) snow or hail","in a wider sense:"];
const HEADLAB = ["exact meaning","meaning","the meaning","probably","possible literal meaning","poetic term","text unsure","in Hebrew, used in poetry only","used in poetry only","a euphemish","a euphemism","euphemism"];
const LITNAMES = ["hill of the foreskins","hill of foreskins","tent of meeting","tent of testimony","cherethite and pelethite","broad wall","entrace to hamath","valley of (the son(s) of) hinnom","valley of hinnom","house of the sun","city of the sun","valley of decision","queen of heaven","yhwh (or one of the other names of god","sea of egypt","the river","lord of the flies","house of the forest of lebanon","the sea of salt","the sea behind","the eastern sea","court of the guard","the sea; hence: = a large body of salt water","the sea; hence: = a body of water in the area","the sea; hence: = a large river flowing","the fallen ones","the ones given"];
const TITLEW = ["title","epithet","name","designation","honorific"];
const TURNW = ["but","here","used","extended","with the focus","as the part","as a metonym"];
const TURNP = ["used metaphorically","used metonymically","used figuratively","used in a figurative","with focus on","extended to","as a metonym","figurative","(but"];
const LABIN = ["only found in poetry"];
const LABELS = ["meaning unsure","exact meaning unsure","exact meaning unknown","poetic term","exact meaning uncertain","meaning unknown","used in poetry only","text uncertain","meaning uncertain","only used in poetry","exact meaning unkown","mostly used in a negated clause","text unsure","in Hebrew, used in poetry only","meanung unsure","exact meaning usure","a euphemish","Egyptian loanword","possibly Israelite Hebrew and Aramaic","probably a Persian loanword","exact meaning unknow","singular only","Persian loanword","meaning not entirely clear","found in ketiv only","found in ketiv only; meaning unsure","a euphemism","exact meaning discussed","only found in plural","only found in poetry","euphemism"];
const G2 = ["pain, trouble","oppression, affliction","to make a wager, bet","to give strength, to fortify","to surround, ensnare","to lift up, uphold","Ephrathah, Ephrath","to go, to arrive","to pass from, to be removed","God, the God of Israel","solemn assembly, gathering","joy, delight"];
const GS = ["to deal, treat harshly","to be, become confident","to be, become happy","to keep (one) occupied, busy","to hold, carry, have (in one's luggage)","mouth of well, cave, pit","to bring down disaster, ruin","(images of) hemorrhoids, tumors, ulcers","sun, moon, and stars","(what used to be done) before, in the past","to deliver, bring forth a child"];
const GI = ["come on! hey!","brother! alas!"];
const GE = ["father's house","\"to ungird (someone's) sackcloth\"","\"to ungird (someone's) correction\"","\"to ungird (someone's) loins\"","\"to loose bonds of wickedness\"","\"to loose (someone's) bonds\"","\"to untie (someone's) bowstring\"","to lift up oneself"];
const COMMAALT = ["or the place where the trading","or the doorframe","or the pins on which a door","or a fortified place within a town","or the young of an animal","or a metal device or image","or the front or upper part of the body of an animal","or a type of flower","or a branch that is planted","(2) throwing the body","(3) placing the body","(4) cutting the body"];
const HEDGEC = ["possibly:","probably:","possible:"];
const NAMEDESC = ["also known as","also called","also referred to","better known as","later called","formerly called","formerly known as","son of","daughter of","wife of","father of","mother of","brother of","sister of","husband of","king of","queen of","chief of","tribe of","time of","oldest son of","youngest son of","firstborn of","territory of","descendant of","ancestor of"];
const SMALL = ["and","or","nor","but","yet","though","although","which","who","whose","whom","where","when","while","whereas","that","because","since","so","if","unless","until","as","such","either","whether","with","without","including","especially","particularly","usually","often","sometimes","normally","mostly","mainly","primarily","possibly","probably","perhaps","in","by","for","from","of","at","on","under","between","to","the","a","an","also","after","before","used","etc","like","not","than","then","thus","hence","therefore","both","any","all","each","even","only","more","most","very","being","having","this","these","those","their","its","his","her"];
const LABELW = ["possibly","probably","perhaps","possible","likely","unsure","unknown","unkown","unknow","uncertain","usure","meaning","sure","clear","unclear","possibilities","term","only","collective","poetry","texts","contexts","aramaic","language","participle","noun","figuratively","traditionally","better","extension","sense"];
const EQLAB = ["term","unkown","possibly","probably","hence","likely","therefore","participle","literally","(1)","(2)"];
const ETC = ["etc"];
const ABBR = ["i","e","g","B","C","E","Mt","ca","c","esp","m","cm","mm","km"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PROL = ["his","him","himself","s","her","he"];
const PROR = ["her","herself","he","their","she"];
const CITE = ["ABD","ABYD","AYBC","AYBD","HALOT","DCH","NIDB","REB","RSV","NIV","NRSV","NJPS","NJB","GNT","CEV"];
const SLOT = ["one's","one","someone's","someone","something","other","others","oneself","somebody","somewhere","another","their","its"];
const SLOTP = ["to","on","of","from","against","with","for","upon","at","in","by","over","towards","under"];
const startsWith = (t, w) => t.startsWith(w) && !/^[\p{L}\p{N}_]/u.test(t.slice(w.length));
function nextIs(after, list) { const t = after.replace(/^\s+/u, ""); return list.some((w) => startsWith(t, w)); }
function prevIs(before, list) { const t = before.replace(/\s+$/u, ""); return list.some((w) => t.endsWith(w) && !/[\p{L}\p{N}_]$/u.test(t.slice(0, t.length - w.length))); }
function nextChar(after) { const t = after.replace(/^\s+/u, ""); return t ? [...t][0] : ""; }
function prevChar(before) { const t = before.replace(/\s+$/u, ""); return t ? [...t].pop() : ""; }
function opensWithOpener(text) { return OPENERS.some((w) => startsWith(text, w)); }
function opensWithLabel(text) { return HEADLAB.some((w) => startsWith(text, w)); }
function opensWithLiteralName(text) {
  const op = OPENERS.find((w) => startsWith(text, w)); if (op === undefined) return false;
  const t = text.slice(op.length).replace(/^[\s:,"]+/u, "").toLowerCase(); return LITNAMES.some((n) => t.startsWith(n.toLowerCase()));
}
function pieceOpensWithTitle(after) {
  const skip = (t, words) => { for (const w of words) if (startsWith(t, w)) return t.slice(w.length); return t; };
  const ws = (t) => t.replace(/^\s+/u, ""); const one = (t) => (/^[,:;]/u.test(t) ? t.slice(1) : t);
  let t = ws(after); t = ws(skip(t, ["hence", "therefore"])); t = ws(skip(t, ["also"])); t = ws(one(t)); t = ws(skip(t, ["possibly", "probably"])); t = ws(one(t)); if (t.startsWith("=")) t = ws(t.slice(1));
  const low = t.toLowerCase().replace(/^(a|an|the)\s+/u, ""); return TITLEW.some((w) => startsWith(low, w.toLowerCase()));
}
function speaksOfTurn(before) {
  for (let i = before.indexOf(","); i >= 0; i = before.indexOf(",", i + 1)) { const t = before.slice(i + 1).replace(/^\s+/u, ""); if (TURNW.some((w) => startsWith(t, w))) return true; }
  return TURNP.some((p) => before.includes(p));
}
function sharedNote(text) {
  const cuts = []; for (let i = 0; i < text.length; i++) if (text[i] === ";" && nextIs(text.slice(i + 1), ALTS)) cuts.push(i);
  if (!cuts.length) return false;
  const first = text.slice(0, cuts[0]), last = text.slice(cuts[cuts.length - 1] + 1); const note = (t) => /[◄►≈]/u.test(t);
  return (last.includes("►") && !first.includes("►")) || (note(last) && !note(first));
}
const noteOnlyAfter = (c) => /[◄►≈]/u.test(c.after) && !/[◄►≈]/u.test(c.before);
function roundKind(g) {
  if (g.trim() === "") return "nothing"; if (g === "s") return "ending"; if (g === "semi-" || g === "-point") return "prefix"; if (/^([0-9]|[abc])$/u.test(g)) return "item";
  const w = g.split(/\s+/u).filter(Boolean).map((x) => x.replace(/,$/u, ""));
  if (w.length && CITE.includes(w[0])) return "citation"; if (/^[0-9]/u.test(g) || w[0] === "c." || w[0] === "ca.") return "date"; if (w[0] === "see") return "pointer";
  if (w.length && (SLOT.includes(w[0]) || (SLOTP.includes(w[0]) && SLOT.includes(w[1])))) return "slot"; return "other";
}
function wordingMeaningSemi(c) {
  if (opensWithOpener(c.text)) return nextIs(c.after, ["hence", "therefore"]) || nextChar(c.after) === "=" || (!c.before.includes(";") && nextIs(c.after, ["exact", "possibly", "probably", "figuratively"]));
  return !c.before.includes(";") && nextIs(c.after, ["hence"]);
}
const wordingMeaningColon = (c) => opensWithOpener(c.text) && !c.before.includes(";") && (nextChar(c.after) === "=" || nextIs(c.after, ["hence"]));
const bareOpener = (before) => OPENERS.includes(before.trim());

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
