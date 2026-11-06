// omegawiki_structured_defined_meaning.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.inside_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.inside_square_brackets", mark: ",", divides: false, test: (c) => c.container === "bracket" },
  { id: "comma.between_two_wordings", mark: ",", divides: false, test: (c) => matchesCuts(c, COMMA_CUTS) },
  { id: "comma.in_a_number", mark: ",", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "comma.any_other_at_top", mark: ",", divides: false, test: (c) => true },
  { id: "semicolon.between_two_wordings", mark: ";", divides: false, test: (c) => matchesCuts(c, SEMICOLON_CUTS) },
  { id: "semicolon.any_other_at_top", mark: ";", divides: false, test: (c) => true },
  { id: "period.between_two_wordings", mark: ".", divides: false, test: (c) => matchesCuts(c, PERIOD_CUTS) },
  { id: "period.closes_a_note_on_the_kind_of_word", mark: ".", divides: false, test: (c) => isWholeNote(c.text) },
  { id: "period.in_a_number", mark: ".", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "period.in_a_short_form", mark: ".", divides: false, test: (c) => SHORT_FORMS.includes(/[\p{L}.]*$/u.exec(c.before)[0]) },
  { id: "period.in_three_dots", mark: ".", divides: false, test: (c) => c.before.endsWith(".") || c.after.startsWith(".") },
  { id: "period.closes_the_text", mark: ".", divides: false, test: (c) => c.after === "" },
  { id: "period.before_a_source_credit", mark: ".", divides: false, test: (c) => CREDIT_OPENERS.some((x) => c.after.startsWith(" (" + x)) },
  { id: "period.between_two_sentences", mark: ".", divides: false, test: (c) => c.after[0] === " " && (isUpper(c.after[1]) || isDigit(c.after[1])) },
  { id: "period.any_other", mark: ".", divides: false, test: (c) => true },
  { id: "colon.after_the_word_source", mark: ":", divides: false, test: (c) => c.before.endsWith("Source") || c.before.endsWith("source") },
  { id: "colon.in_a_clock_time", mark: ":", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "colon.after_a_field_name", mark: ":", divides: false, test: (c) => FIELD_NAMES.some((x) => c.before.endsWith(x)) },
  { id: "colon.after_a_subject_label", mark: ":", divides: false, test: (c) => SUBJECT_LABELS.includes(c.before) },
  { id: "colon.any_other", mark: ":", divides: false, test: (c) => true },
  { id: "hyphen.alone_between_spaces", mark: "-", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "hyphen.beside_a_digit", mark: "-", divides: false, test: (c) => isDigit(c.before.slice(-1)) || isDigit(c.after[0]) },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "en_dash.in_a_range", mark: "\u2013", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "en_dash.between_two_names", mark: "\u2013", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "em_dash.around_an_aside", mark: "\u2014", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "slash.in_a_web_tag", mark: "/", divides: false, test: (c) => c.container === "angle" },
  { id: "slash.in_a_source_credit", mark: "/", divides: false, test: (c) => c.container === "paren" && c.before.endsWith(" ") },
  { id: "slash.inside_round_brackets_between_two_names", mark: "/", divides: false, test: (c) => c.container === "paren" },
  { id: "slash.between_and_and_or", mark: "/", divides: false, test: (c) => c.before.endsWith("and") && c.after.startsWith("or") },
  { id: "slash.in_a_fraction", mark: "/", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "slash.between_two_names_at_top", mark: "/", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.doubled_for_italics", mark: "'", divides: false, test: (c) => c.before.endsWith("'") || c.after.startsWith("'") },
  { id: "apostrophe.opens_a_short_form", mark: "'", divides: false, test: (c) => c.before === "" },
  { id: "apostrophe.before_a_final_s", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "apostrophe.after_a_plural_owner", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && !isLetter(c.after[0]) && c.after !== "" },
  { id: "apostrophe.in_a_shortened_word", mark: "'", divides: false, test: (c) => SHORTENED_WORDS.includes(wordRound(c)) },
  { id: "apostrophe.inside_a_carried_over_name", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.before_a_final_s", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "right_single_quotation_mark.closes_a_carried_over_name", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && !isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.inside_a_carried_over_name", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "left_single_quotation_mark.inside_a_carried_over_name", mark: "\u2018", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "quote.after_a_measure", mark: "\"", divides: false, test: (c) => isDigit(c.before.slice(-1)) },
  { id: "quote.opens_a_quoted_word", mark: "\"", divides: false, test: (c) => c.before.endsWith(" ") },
  { id: "quote.closes_a_quoted_word", mark: "\"", divides: false, test: (c) => isLetter(c.before.slice(-1)) || c.before.endsWith("\u20AC") },
  { id: "open_paren.inside_a_round_bracket", mark: "(", divides: false, test: (c) => c.container === "paren" },
  { id: "close_paren.inside_a_round_bracket", mark: ")", divides: false, test: (c) => c.container === "paren" },
  { id: "open_paren.in_a_chemical_name", mark: "(", divides: false, test: (c) => c.text === "(RS)-2-(4-(2-methylpropyl)phenyl)propanoic acid" },
  { id: "close_paren.in_a_chemical_name", mark: ")", divides: false, test: (c) => c.text === "(RS)-2-(4-(2-methylpropyl)phenyl)propanoic acid" },
  { id: "open_paren.inside_a_square_bracket", mark: "(", divides: false, test: (c) => c.container === "bracket" },
  { id: "close_paren.inside_a_square_bracket", mark: ")", divides: false, test: (c) => c.container === "bracket" },
  { id: "open_paren.holds_a_source_credit", mark: "(", divides: false, test: (c) => CREDIT_OPENERS.some((x) => (c.group ?? "").startsWith(x)) },
  { id: "close_paren.holds_a_source_credit", mark: ")", divides: false, test: (c) => CREDIT_OPENERS.some((x) => (c.group ?? "").startsWith(x)) },
  { id: "open_paren.at_the_head_of_the_text", mark: "(", divides: false, test: (c) => c.before === "" },
  { id: "close_paren.at_the_head_of_the_text", mark: ")", divides: false, test: (c) => c.before === "(" + c.group },
  { id: "open_paren.holds_an_alternative", mark: "(", divides: false, test: (c) => (c.group ?? "").startsWith("or ") },
  { id: "close_paren.holds_an_alternative", mark: ")", divides: false, test: (c) => (c.group ?? "").startsWith("or ") },
  { id: "open_paren.holds_an_aside", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.holds_an_aside", mark: ")", divides: false, test: (c) => true },
  { id: "open_bracket.in_unbalanced_text", mark: "[", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_bracket.holds_a_whole_note", mark: "[", divides: false, test: (c) => c.text.startsWith("[") && c.text.endsWith("]") },
  { id: "close_bracket.holds_a_whole_note", mark: "]", divides: false, test: (c) => c.text.startsWith("[") && c.text.endsWith("]") },
  { id: "open_bracket.holds_a_note_at_the_head", mark: "[", divides: false, test: (c) => c.text.startsWith("[") },
  { id: "close_bracket.holds_a_note_at_the_head", mark: "]", divides: false, test: (c) => c.text.startsWith("[") },
  { id: "open_bracket.holds_a_note_after_a_wording", mark: "[", divides: false, test: (c) => isUpper((c.group ?? "")[0]) },
  { id: "close_bracket.holds_a_note_after_a_wording", mark: "]", divides: false, test: (c) => isUpper((c.group ?? "")[0]) },
  { id: "open_bracket.holds_a_supplied_word", mark: "[", divides: false, test: (c) => c.group === "images" },
  { id: "close_bracket.holds_a_supplied_word", mark: "]", divides: false, test: (c) => c.group === "images" },
  { id: "close_brace.in_unbalanced_text", mark: "}", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_angle.holds_a_web_tag", mark: "<", divides: false, test: (c) => c.group === "sup" || c.group === "/sup" },
  { id: "close_angle.holds_a_web_tag", mark: ">", divides: false, test: (c) => c.group === "sup" || c.group === "/sup" },
  { id: "ampersand.opens_a_short_form", mark: "&", divides: false, test: (c) => c.after.startsWith("c") },
  { id: "percent_sign.after_a_number", mark: "%", divides: false, test: (c) => isDigit(c.before.slice(-1)) },
  { id: "degree_sign.after_a_number", mark: "\u00B0", divides: false, test: (c) => isDigit(c.before.slice(-1)) || (c.before.endsWith(" ") && isDigit(c.before.slice(-2, -1))) },
  { id: "prime.in_a_coordinate", mark: "\u2032", divides: false, test: (c) => isDigit(c.before.slice(-1)) },
  { id: "double_prime.in_a_coordinate", mark: "\u2033", divides: false, test: (c) => isDigit(c.before.slice(-1)) },
  { id: "circumflex_accent.before_a_power", mark: "^", divides: false, test: (c) => isDigit(c.after[0]) },
  { id: "equals.in_a_sum_in_a_bracket", mark: "=", divides: false, test: (c) => c.after.startsWith(" ") },
  { id: "number_sign.before_an_issue_number", mark: "#", divides: false, test: (c) => isDigit(c.after[0]) },
  { id: "euro_sign.cited_as_a_symbol", mark: "\u20AC", divides: false, test: (c) => c.after.startsWith("\"") },
  { id: "plus.in_a_chemical_formula", mark: "+", divides: false, test: (c) => isDigit(c.after[0]) },
  { id: "question_mark.closes_a_question", mark: "?", divides: false, test: (c) => c.after === "" },
  { id: "exclamation.closes_a_command", mark: "!", divides: false, test: (c) => c.after === "" },
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

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && /\p{L}/u.test(ch);
const isUpper = (ch) => ch !== undefined && /\p{Lu}/u.test(ch);
const isDigit = (ch) => ch !== undefined && /[0-9]/u.test(ch);
const wordRound = (c) => /\p{L}*$/u.exec(c.before)[0] + c.mark + /^\p{L}*/u.exec(c.after)[0];
const matchesCuts = (c, list) => list.some((e) => { const i = e.indexOf(c.mark); return c.before.endsWith(e.slice(0, i)) && c.after.startsWith(e.slice(i + 1)); });
const isWholeNote = (t) => (t.startsWith("[") && t.endsWith("]")) || KIND_NOTES.includes(t) || KIND_NOTE_OPENINGS.some((x) => t.startsWith(x));
const SEMICOLON_CUTS = ["Not rough; having a surface","and urination; the tubular","giving its details; to give","a certain goal; to put into","other organization; an associate","one has fun; to engage","handed something; to come","for amusement; to speak","reproductive tract; a moist","low temperature; mildly","particular language; to express","Not large or big; small","being the truth; to accept","By one's self; apart","or people; which person","In concern with; engaged","engaged in; intent","Act of forgiving; act","interpreted as language; to communicate","to a halt; to cease","and the chin; the outer","Not alive; lacking","The time ahead; those","reflection of none; dark","Dark and colourless; not","in essence or nature; to undergo","A male other; the male","previously mentioned; himself","A female other; the female","part of any room; the supporting","as a hillslope; also, a broad","stimulation of the penis; fellatio","Resurrection of Christ; the first","emperor; a country","toward somewhere; to take","With the use of; by means","To lack confidence in; to disbelieve","In an immediate manner; instantly","from the air; to arrive","written attack; the practice","to somebody; to seek","To be scared of; to have","words to sing\"); prose","bone of the head; the cranium","In part; in some","in some degree; not wholly","limit points; to extend","sixty minutes; one twenty","or more children; a sister","or action; to be in unison","or concord; to be united","entire earth; not limited","or features; having no","Unable to speak; lacking","The bishop of Rome; the head","own body; to cause","Bright and colourless; reflecting","Bright and colorless; reflecting","ISO 8601 norm; the seventh","non-toxic to humans; suitable","skill or effort; posing","of a clear sky; the primary","being pregnant; the period","large creek; a body","mature orange; a reddish","ripe orange; a reddish","To clothe oneself; to put","husband or wife; to take","of the abdomen; the thorax","or bent; having a constant","mental condition; free","as its colour; having the hue","containing chlorophyll; the colour","visible spectrum; one of the primary","Disappointingly unsuccessful; suffering","governmental conditions; the overthrow","from a place; to leave","Not good; unfavorable","unfavorable; negative","To adapt something; to alter","Approbation; a sanctioning","internal forces; pressure variation","In all likelihood; in a probable","larger vessels ; a small towboat","pass through; impenetrable","chest and throat; to produce","Free from risk; harmless","for transmitted light; the colour"];
const COMMA_CUTS = ["To be in motion, to go","Not closed, something","a dark colour, somewhat","harmless, riskless","Irritated, in a temper","in a temper, feeling","Pulled, striving","any deviation, immediately","Great beauty, splendor","certain occasions, or in","for granted, or accepting","without harm, non-toxic","A cluster of stars, or a cloud","Having six edges, or having","of a letter, or the name","in any format, or the knowledge","How big something is, how much"];
const PERIOD_CUTS = ["right on maps. The direction","no predecessor. The ordinal","cold or hot. A property","called Jesus Christ. That belongs","inflammable liquid. The simplest","green and blue from white. A primary"];
const KIND_NOTES = ["The second person singular masculine object pronoun.","The second person singular feminine subject pronoun.","The second person singular masculine subject pronoun.","The second person plural masculine object pronoun.","The second person plural feminine object pronoun.","The second person plural masculine subject pronoun.","The second person plural feminine subject pronoun.","1st person plural subject pronoun.","A preposition that stands before a definite direct object.","The definite article.","A word that introduces a yes-no question phrase.","A word used to show disagreement of something.","A word used to show agreement or affirmation of something.","An interjection expressing regret, remorse, or sorrow."];
const KIND_NOTE_OPENINGS = ["A grammatical particle and preposition"];
const SHORT_FORMS = ["etc","e","e.g","g","i","i.e","p","p.m","c","esp","spp","L","U","U.S","P","Hann"];
const SHORTENED_WORDS = ["g'bye","don't","isn't"];
const CREDIT_OPENERS = ["Source:","source:","source "];
const FIELD_NAMES = ["Symbol","atomic number","unit symbol","Coordinates"];
const SUBJECT_LABELS = ["Physics","In bookkeeping"];

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
