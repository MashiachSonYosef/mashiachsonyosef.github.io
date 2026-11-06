// hewiktionary_hebrew_exact_english_translation.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.between_words_of_a_list", mark: ",", divides: false, test: (c) => COMMA_LIST_TEXTS.includes(c.text) },
  { id: "semicolon.between_words_of_a_list", mark: ";", divides: false, test: (c) => SEMICOLON_LIST_TEXTS.includes(c.text) },
  { id: "semicolon.before_a_bracket_at_the_end", mark: ";", divides: false, test: (c) => SEMICOLON_LIST_TEXTS_WITH_A_BRACKET.includes(c.text) },
  { id: "hyphen.opens_a_bare_ending", mark: "-", divides: false, test: (c) => c.before === "" },
  { id: "hyphen.closes_a_bare_beginning", mark: "-", divides: false, test: (c) => c.after === "" },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.opens_a_bare_ending", mark: "'", divides: false, test: (c) => c.before === "" },
  { id: "apostrophe.in_a_shortened_word", mark: "'", divides: false, test: (c) => SHORTENED_WORDS.includes(wordRound(c)) },
  { id: "apostrophe.in_a_word_carried_over_from_hebrew", mark: "'", divides: false, test: (c) => CARRIED_OVER_WORDS.includes(wordRound(c)) },
  { id: "apostrophe.before_the_s_of_belonging", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "right_single_quotation_mark.for_a_short_vowel", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "ampersand.inside_an_abbreviation", mark: "&", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "question_mark.closes_a_question", mark: "?", divides: false, test: (c) => c.after === "" },
  { id: "period.before_the_first_word_of_a_sentence", mark: ".", divides: false, test: (c) => c.before === "" },
  { id: "period.in_an_abbreviation", mark: ".", divides: false, test: (c) => ABBREVIATIONS_WITH_A_STOP.includes(c.text) },
  { id: "open_paren.in_unbalanced_text", mark: "(", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_paren.holds_a_definition_number", mark: "(", divides: false, test: (c) => DEFINITION_NUMBERS.includes(c.group) },
  { id: "open_paren.holds_an_optional_word", mark: "(", divides: false, test: (c) => PAREN_OPTIONAL_WORDS.includes(c.group) },
  { id: "open_paren.narrows_the_word_before", mark: "(", divides: false, test: (c) => PAREN_NARROWING_WORDS.includes(c.group) },
  { id: "close_paren.holds_a_definition_number", mark: ")", divides: false, test: (c) => DEFINITION_NUMBERS.includes(c.group) },
  { id: "close_paren.holds_an_optional_word", mark: ")", divides: false, test: (c) => PAREN_OPTIONAL_WORDS.includes(c.group) },
  { id: "close_paren.narrows_the_word_before", mark: ")", divides: false, test: (c) => PAREN_NARROWING_WORDS.includes(c.group) },
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
const isLetter = (ch) => ch !== undefined && ch !== "" && /\p{L}/u.test(ch);
const wordRound = (c) => /\p{L}*$/u.exec(c.before)[0] + c.mark + /^\p{L}*/u.exec(c.after)[0];
const COMMA_LIST_TEXTS = ["to illustrate, to demonstrate, to make concrete","Orderly, Hospital attendant","coarse,textured","horror, terror","act wilfully, sin knowingly","boil, simmer","to be delayed, to be late","moral, lesson","reliable, trustworthy","there is, there are","lucid, clear-minded","secular object, non-holy object, something profane","opposite, facing","in light of, considering","to pay off, to pay, to repay","rebellious, stubborn","violinist, fiddler"];
const SEMICOLON_LIST_TEXTS = ["completely; totally; entirely; utterly","excellent; great; terrific; very good; ok"];
const SEMICOLON_LIST_TEXTS_WITH_A_BRACKET = ["prove perjury; discredit; impeach (a witness)"];
const SHORTENED_WORDS = ["let's","don't","ma'am","s'more"];
const CARRIED_OVER_WORDS = ["hitpa'el","Pa'al","Pu'al","niph'al","ma'abara","ma'ah","Nevi'im","Ra'anana"];
const ABBREVIATIONS_WITH_A_STOP = ["Mt.","e.g.","i.e.","N.B.","P.S."];
const DEFINITION_NUMBERS = ["1","2","3"];
const PAREN_OPTIONAL_WORDS = ["to be","up"];
const PAREN_NARROWING_WORDS = ["sails","the covering garment","a witness","vertical"];

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
