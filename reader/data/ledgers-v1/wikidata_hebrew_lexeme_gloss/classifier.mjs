// wikidata_hebrew_lexeme_gloss.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.between_words_for_one_sense", mark: ",", divides: false, test: (c) => ONE_SENSE_COMMA_TEXTS.includes(c.text) },
  { id: "comma.marked_between_a_word_and_a_second_wording", mark: ",", divides: false, test: (c) => SECOND_WORDING_TEXTS.includes(c.text) },
  { id: "comma.between_two_descriptions", mark: ",", divides: false, test: (c) => SECOND_DESCRIPTION_OPENINGS.some((x) => c.after.startsWith(x)) },
  { id: "comma.in_a_row_that_only_describes", mark: ",", divides: false, test: (c) => DESCRIBING_ROW_OPENINGS.some((x) => c.text.startsWith(x)) },
  { id: "comma.inside_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.after_the_head_word", mark: ",", divides: false, test: (c) => !c.before.includes(",") },
  { id: "comma.inside_a_description", mark: ",", divides: false, test: () => true },
  { id: "semicolon.between_two_descriptions", mark: ";", divides: false, test: (c) => TWO_DESCRIPTION_OPENINGS.some((x) => c.text.startsWith(x)) },
  { id: "slash.after_to_be", mark: "/", divides: false, test: (c) => c.text.startsWith("to be ") },
  { id: "slash.between_words_that_lean", mark: "/", divides: false, test: (c) => LEANING_SLASH_TEXTS.includes(c.text) },
  { id: "slash.between_words_for_one_sense", mark: "/", divides: false, test: (c) => ONE_SENSE_SLASH_TEXTS.includes(c.text) },
  { id: "slash.inside_a_number", mark: "/", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "open_paren.in_a_row_that_only_labels", mark: "(", divides: false, test: (c) => DESCRIBING_ROW_OPENINGS.some((x) => c.text.startsWith(x)) },
  { id: "close_paren.in_a_row_that_only_labels", mark: ")", divides: false, test: (c) => DESCRIBING_ROW_OPENINGS.some((x) => c.text.startsWith(x)) },
  { id: "open_paren.holds_a_qualifier_before_the_word", mark: "(", divides: false, test: (c) => beforePair(c) === "" },
  { id: "close_paren.holds_a_qualifier_before_the_word", mark: ")", divides: false, test: (c) => beforePair(c) === "" },
  { id: "open_paren.holds_a_name_after_its_label", mark: "(", divides: false, test: (c) => NAME_LABELS.includes(beforePair(c)) },
  { id: "close_paren.holds_a_name_after_its_label", mark: ")", divides: false, test: (c) => NAME_LABELS.includes(beforePair(c)) },
  { id: "open_paren.holds_an_aside_inside_a_description", mark: "(", divides: false, test: (c) => beforePair(c).includes(",") },
  { id: "close_paren.holds_an_aside_inside_a_description", mark: ")", divides: false, test: (c) => beforePair(c).includes(",") },
  { id: "open_paren.holds_a_note_on_the_word_before", mark: "(", divides: false, test: () => true },
  { id: "close_paren.holds_a_note_on_the_word_before", mark: ")", divides: false, test: () => true },
  { id: "period.after_a_shortened_word", mark: ".", divides: false, test: (c) => SHORTENED_WORDS.includes((/\p{L}*$/u.exec(c.before) || [""])[0]) },
  { id: "hyphen.joins_the_parts_of_a_word", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.before_the_letter_s", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "gershayim.names_the_sign_itself", mark: "\u05F4", divides: false, test: (c) => c.before.endsWith("(") && c.after.startsWith(")") },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && /[0-9]/u.test(ch);
const beforePair = (c) => c.mark === "(" ? c.before : c.before.slice(0, c.before.length - c.group.length - 1);
const ONE_SENSE_COMMA_TEXTS = ["a blessings booklet, bentsher","arrogance, audacity, chutzpah","cadaver, dead body","ditch, indentation","hedge, wall","loved one, significant other","nothing, nothingness","saying, speach","trouble, disaster","undershirt, tank top","whereto, to where"];
const SECOND_WORDING_TEXTS = ["nation, ethnic group"];
const ONE_SENSE_SLASH_TEXTS = ["grief/mourning"];
const LEANING_SLASH_TEXTS = ["pot used for cooking food by boiling/seething"];
const SECOND_DESCRIPTION_OPENINGS = [" a barrel-aged distilled spirit"," or the manner in which"," mineral, gemstone"," gemstone"];
const TWO_DESCRIPTION_OPENINGS = ["occurrence, occurrence of a fact"];
const DESCRIBING_ROW_OPENINGS = ["\u05D1, second letter of the Hebrew alphabet","\u05DB, eleventh letter in the Hebrew alphabet","\u05DE, thirteenth letter in the Hebrew alphabet","\u05E2, sixteenth letter in the Hebrew alphabet","Hebrew letter, sounds like h or a","Hebrew letter sounds like N, word ending form","a given name, (first name)","either an item which provides a name-source,"];
const NAME_LABELS = ["given name ","family name "];
const SHORTENED_WORDS = ["subg"];

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
