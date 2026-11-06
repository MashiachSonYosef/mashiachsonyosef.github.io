// macula_hebrew_cherith_surface_english_2022.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "tilde.one_of_two_gaps", mark: "~", divides: false, test: (c) => c.text.split("~").length - 1 > 1 },
  { id: "tilde.glued_to_the_word_after", mark: "~", divides: false, test: (c) => c.before === "" && isLetter(c.after[0]) },
  { id: "tilde.glued_to_the_word_before", mark: "~", divides: false, test: (c) => c.after === "" && isLetter(c.before.slice(-1)) },
  { id: "tilde.between_the_two_words_of_a_frame", mark: "~", divides: false, test: (c) => FRAME_TEXTS.includes(c.text) },
  { id: "tilde.in_a_phrase", mark: "~", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "right_single_quotation_mark.contraction_of_is", mark: "\u2019", divides: false, test: (c) => { const m = /\p{L}+$/u.exec(c.before); return !!m && IS_CONTRACTION_WORDS.includes(m[0]) && c.after[0] === "s" && !isLetter(c.after[1]); } },
  { id: "right_single_quotation_mark.contraction_of_not", mark: "\u2019", divides: false, test: (c) => c.before.endsWith("n") && c.after[0] === "t" && !isLetter(c.after[1]) },
  { id: "right_single_quotation_mark.after_final_s", mark: "\u2019", divides: false, test: (c) => c.before.endsWith("s") && !isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.possessive_s", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && (c.after[0] === "s" || c.after[0] === "S") && !isLetter(c.after[1]) },
  { id: "hyphen.opens_an_ending", mark: "-", divides: false, test: (c) => c.before === "" && isLetter(c.after[0]) },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "exclamation.after_a_space", mark: "!", divides: false, test: (c) => c.after === "" && c.before.endsWith(" ") },
  { id: "exclamation.on_the_last_word", mark: "!", divides: false, test: (c) => c.after === "" && isLetter(c.before.slice(-1)) },
  { id: "question_mark.after_a_space", mark: "?", divides: false, test: (c) => c.after === "" && c.before.endsWith(" ") },
  { id: "question_mark.on_the_last_word", mark: "?", divides: false, test: (c) => c.after === "" && isLetter(c.before.slice(-1)) },
  { id: "open_paren.holds_a_sum_of_numbers", mark: "(", divides: false, test: (c) => c.group.includes("=") },
  { id: "open_paren.holds_one_number", mark: "(", divides: false, test: (c) => /^[0-9]+$/u.test(c.group) },
  { id: "open_paren.holds_the_whole_text", mark: "(", divides: false, test: (c) => c.text === "(" + c.group + ")" },
  { id: "open_paren.holds_a_word_beside_other_words", mark: "(", divides: false, test: (c) => isLetter(c.group[0]) },
  { id: "close_paren.holds_a_sum_of_numbers", mark: ")", divides: false, test: (c) => c.group.includes("=") },
  { id: "close_paren.holds_one_number", mark: ")", divides: false, test: (c) => /^[0-9]+$/u.test(c.group) },
  { id: "close_paren.holds_the_whole_text", mark: ")", divides: false, test: (c) => c.text === "(" + c.group + ")" },
  { id: "close_paren.holds_a_word_beside_other_words", mark: ")", divides: false, test: (c) => isLetter(c.group[0]) },
  { id: "equals.in_a_sum_of_numbers", mark: "=", divides: false, test: (c) => c.container === "paren" },
  { id: "plus.in_a_sum_of_numbers", mark: "+", divides: false, test: (c) => c.container === "paren" },
  { id: "period.at_the_head_of_a_word", mark: ".", divides: false, test: (c) => c.before === "" && isLetter(c.after[0]) },
  { id: "slash.between_two_renderings", mark: "/", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && /\p{L}/u.test(ch);
const IS_CONTRACTION_WORDS = ["he","that","what"];
const FRAME_TEXTS = ["and ~ alike","as ~ as","both ~ and","either ~ or","if ~ not","in order ~ to","isn\u2019t ~ enough","more ~ than","no ~ yet","not ~ atall","not ~ enough","oh ~ that","so ~ not","so as ~ to","so that ~ nolonger","so that ~ not","such ~ as","such ~ that","that ~ not","too ~ for","too ~ that","too ~ to","whether ~ or"];

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
