// panlex_hebrew_english_meanings_20240301.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.inside_a_fixed_saying", mark: ",", divides: false, test: (c) => c.text === "hook, line and sinker" },
  { id: "comma.between_a_city_and_its_state", mark: ",", divides: false, test: (c) => c.text === "New York, New York" },
  { id: "comma.before_the_word_to", mark: ",", divides: false, test: (c) => c.after === " to" },
  { id: "comma.before_words_that_complete_the_first", mark: ",", divides: false, test: (c) => c.text === "get, become late" },
  { id: "slash.between_two_names", mark: "/", divides: false, test: (c) => isLetter(c.after[0]) },
  { id: "hyphen.alone_between_spaces", mark: "-", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "hyphen.opens_a_bare_ending", mark: "-", divides: false, test: (c) => c.before === "" },
  { id: "hyphen.closes_a_bare_beginning", mark: "-", divides: false, test: (c) => c.after === "" },
  { id: "hyphen.beside_a_digit", mark: "-", divides: false, test: (c) => isDigit(c.before.slice(-1)) || isDigit(c.after[0]) },
  { id: "hyphen.before_a_curly_apostrophe", mark: "-", divides: false, test: (c) => c.after[0] === "\u2019" },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.at_the_head_of_a_word", mark: "\u2019", divides: false, test: (c) => !isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.at_the_end_of_a_word", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && !isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.before_a_final_s", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "right_single_quotation_mark.in_a_shortened_word", mark: "\u2019", divides: false, test: (c) => SHORTENED_WORDS.includes(wordRound(c)) },
  { id: "right_single_quotation_mark.after_a_joined_short_word", mark: "\u2019", divides: false, test: (c) => JOINED_ARTICLE_WORDS.includes(wordRound(c)) },
  { id: "right_single_quotation_mark.inside_a_carried_over_word", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.doubled_with_nothing_inside", mark: "'", divides: false, test: (c) => c.before.endsWith("'") || c.after.startsWith("'") },
  { id: "apostrophe.at_the_head_of_a_short_form", mark: "'", divides: false, test: (c) => c.before === "" },
  { id: "apostrophe.before_a_final_s_of_an_owner", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "apostrophe.after_a_joined_short_word", mark: "'", divides: false, test: (c) => c.before.endsWith(" d") },
  { id: "apostrophe.inside_a_carried_over_word", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "period.after_a_lone_v", mark: ".", divides: false, test: (c) => c.text === "v." },
  { id: "period.after_a_cyrillic_letter", mark: ".", divides: false, test: (c) => c.before.endsWith("\u0436") },
  { id: "period.inside_a_web_name", mark: ".", divides: false, test: (c) => isLetter(c.after[0]) && isLetter(c.before.slice(-1)) && isLetter(c.before.slice(-2, -1)) },
  { id: "period.after_a_lone_letter", mark: ".", divides: false, test: (c) => isLetter(c.before.slice(-1)) && !isLetter(c.before.slice(-2, -1)) },
  { id: "period.closes_a_shortened_word", mark: ".", divides: false, test: (c) => isLetter(c.before.slice(-1)) },
  { id: "question_mark.closes_a_title", mark: "?", divides: false, test: (c) => c.before.endsWith("!") },
  { id: "question_mark.after_a_lone_name", mark: "?", divides: false, test: (c) => c.text === "Hayward?" },
  { id: "exclamation.before_a_question_mark", mark: "!", divides: false, test: (c) => c.after[0] === "?" },
  { id: "exclamation.writes_a_click_sound", mark: "!", divides: false, test: (c) => c.before === "" },
  { id: "colon.in_a_clock_time", mark: ":", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "colon.before_a_subtitle", mark: ":", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after.startsWith(" ") },
  { id: "low_line.between_a_word_and_its_kind", mark: "_", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "number_sign.opens_a_link_target", mark: "#", divides: false, test: (c) => c.before === "" },
  { id: "pipe.between_a_link_target_and_its_word", mark: "|", divides: false, test: (c) => c.before.endsWith(" ") && isLetter(c.after[0]) },
  { id: "open_paren.holds_capitals_only", mark: "(", divides: false, test: (c) => /^[A-Z]+$/u.test(c.group ?? "") },
  { id: "close_paren.holds_capitals_only", mark: ")", divides: false, test: (c) => /^[A-Z]+$/u.test(c.group ?? "") },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && /[0-9]/u.test(ch);
const wordRound = (c) => /\p{L}*$/u.exec(c.before)[0] + c.mark + /^\p{L}*/u.exec(c.after)[0];
const COMMA_LIST_TEXTS = ["dam, fence, barrier","luggage, baggage","container, ferry, vessel, vat, trough, tub, manger","baton, cane","deportment, behaviour"];
const SHORTENED_WORDS = ["o\u2019clock","don\u2019t","Don\u2019t","I\u2019m","you\u2019re","y\u2019all","ma\u2019am"];
const JOINED_ARTICLE_WORDS = ["d\u2019etat","L\u2019Orfeo","l\u2019eau","nell\u2019Emilia","Ha\u2019Nephilim"];

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
