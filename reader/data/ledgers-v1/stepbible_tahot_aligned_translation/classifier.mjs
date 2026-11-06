// stepbible_tahot_aligned_translation.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "slash.around_an_empty_part", mark: "/", divides: false, test: (c) => c.after.startsWith("/") || c.after.startsWith(" /") || c.before.endsWith("/") || c.before.endsWith("/ ") },
  { id: "slash.around_the_link_part", mark: "/", divides: false, test: (c) => c.after.startsWith("-/") || c.before.endsWith("/-") },
  { id: "slash.spaced_on_both_sides", mark: "/", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "slash.with_a_space_before_only", mark: "/", divides: false, test: (c) => c.before.endsWith(" ") },
  { id: "slash.with_no_space", mark: "/", divides: false, test: (c) => !c.after.startsWith(" ") },
  { id: "slash.between_word_parts", mark: "/", divides: false, test: (c) => c.after.startsWith(" ") },
  { id: "open_bracket.never_closed", mark: "[", divides: false, test: (c) => c.group === null },
  { id: "open_bracket.in_unbalanced_text", mark: "[", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_bracket.in_a_row_with_no_bare_word", mark: "[", divides: false, test: (c) => holdsNoBareWord(c.text) },
  { id: "open_bracket.after_the_last_piece_of_a_word", mark: "[", divides: false, test: (c) => TAIL_TEXTS_OF_WORDS.includes(c.text) },
  { id: "open_bracket.inside_a_square_bracket", mark: "[", divides: false, test: (c) => c.container === "bracket" },
  { id: "open_bracket.inside_an_angle_bracket", mark: "[", divides: false, test: (c) => c.container === "angle" },
  { id: "open_bracket.holds_a_question_mark", mark: "[", divides: false, test: (c) => c.group === "?" },
  { id: "open_bracket.holds_a_gender_label", mark: "[", divides: false, test: (c) => GENDER_LABELS.includes(c.group) },
  { id: "open_bracket.holds_the_ending_ever", mark: "[", divides: false, test: (c) => c.group === "-ever" },
  { id: "open_bracket.holds_the_rest_of_a_word", mark: "[", divides: false, test: (c) => isLetter(c.before.slice(-1)) || c.before.endsWith("]") },
  { id: "open_bracket.holds_implied_words", mark: "[", divides: false, test: () => true },
  { id: "close_bracket.never_opened", mark: "]", divides: false, test: (c) => c.group === "" && !c.before.endsWith("[") },
  { id: "close_bracket.in_unbalanced_text", mark: "]", divides: false, test: (c) => unbalanced(c.text) },
  { id: "close_bracket.in_a_row_with_no_bare_word", mark: "]", divides: false, test: (c) => holdsNoBareWord(c.text) },
  { id: "close_bracket.after_the_last_piece_of_a_word", mark: "]", divides: false, test: (c) => TAIL_TEXTS_OF_WORDS.includes(c.text) },
  { id: "close_bracket.inside_a_square_bracket", mark: "]", divides: false, test: (c) => c.container === "bracket" },
  { id: "close_bracket.inside_an_angle_bracket", mark: "]", divides: false, test: (c) => c.container === "angle" },
  { id: "close_bracket.holds_a_question_mark", mark: "]", divides: false, test: (c) => c.group === "?" },
  { id: "close_bracket.holds_a_gender_label", mark: "]", divides: false, test: (c) => GENDER_LABELS.includes(c.group) },
  { id: "close_bracket.holds_the_ending_ever", mark: "]", divides: false, test: (c) => c.group === "-ever" },
  { id: "close_bracket.holds_the_rest_of_a_word", mark: "]", divides: false, test: (c) => { const b = beforeOpener(c); return isLetter(b.slice(-1)) || b.endsWith("]"); } },
  { id: "close_bracket.holds_implied_words", mark: "]", divides: false, test: () => true },
  { id: "open_angle.in_unbalanced_text", mark: "<", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_angle.in_a_row_with_no_bare_word", mark: "<", divides: false, test: (c) => holdsNoBareWord(c.text) },
  { id: "open_angle.before_the_last_piece_of_a_name", mark: "<", divides: false, test: (c) => TAIL_TEXTS_OF_NAMES.includes(c.text) },
  { id: "open_angle.inside_a_square_bracket", mark: "<", divides: false, test: (c) => c.container === "bracket" },
  { id: "open_angle.holds_a_plural_ending", mark: "<", divides: false, test: (c) => isLetter(c.before.slice(-1)) },
  { id: "open_angle.holds_the_object_sign", mark: "<", divides: false, test: (c) => c.group === "obj." },
  { id: "open_angle.holds_words_in_the_hebrew", mark: "<", divides: false, test: () => true },
  { id: "close_angle.never_opened", mark: ">", divides: false, test: (c) => c.group === "" && !c.before.endsWith("<") },
  { id: "close_angle.in_unbalanced_text", mark: ">", divides: false, test: (c) => unbalanced(c.text) },
  { id: "close_angle.in_a_row_with_no_bare_word", mark: ">", divides: false, test: (c) => holdsNoBareWord(c.text) },
  { id: "close_angle.before_the_last_piece_of_a_name", mark: ">", divides: false, test: (c) => TAIL_TEXTS_OF_NAMES.includes(c.text) },
  { id: "close_angle.inside_a_square_bracket", mark: ">", divides: false, test: (c) => c.container === "bracket" },
  { id: "close_angle.holds_a_plural_ending", mark: ">", divides: false, test: (c) => isLetter(beforeOpener(c).slice(-1)) },
  { id: "close_angle.holds_the_object_sign", mark: ">", divides: false, test: (c) => c.group === "obj." },
  { id: "close_angle.holds_words_in_the_hebrew", mark: ">", divides: false, test: () => true },
  { id: "hyphen.in_unbalanced_text", mark: "-", divides: false, test: (c) => unbalanced(c.text) },
  { id: "hyphen.in_the_ending_ever", mark: "-", divides: false, test: (c) => c.container === "bracket" },
  { id: "hyphen.as_its_own_part", mark: "-", divides: false, test: (c) => c.before.endsWith("/") && c.after.startsWith("/") },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "hyphen.before_a_slash", mark: "-", divides: false, test: (c) => c.after.startsWith("/") },
  { id: "hyphen.ends_a_row_on_a_whole_word", mark: "-", divides: false, test: (c) => c.after === "" && WHOLE_WORD_HEADS.includes(runBefore(c.before)) },
  { id: "hyphen.ends_a_row_on_a_cut_word", mark: "-", divides: false, test: (c) => c.after === "" && /^[a-z]/u.test(runBefore(c.before)) },
  { id: "hyphen.ends_a_row_on_a_cut_name", mark: "-", divides: false, test: (c) => c.after === "" && /^[A-Z]/u.test(runBefore(c.before)) },
  { id: "hyphen.opens_the_directional_ending", mark: "-", divides: false, test: (c) => c.after === "ward" || c.after === "wards" },
  { id: "hyphen.opens_the_tail_of_a_word", mark: "-", divides: false, test: (c) => WORD_TAILS.includes(runAfter(c.after)) },
  { id: "hyphen.opens_the_tail_of_a_name", mark: "-", divides: false, test: (c) => (c.before === "" || c.before.endsWith("/ ")) && isLetter(c.after[0]) },
  { id: "exclamation.as_its_own_part", mark: "!", divides: false, test: (c) => c.after === "" && c.before.endsWith("/ ") },
  { id: "exclamation.on_a_word", mark: "!", divides: false, test: (c) => isLetter(c.before.slice(-1)) || c.before.endsWith("]") },
  { id: "question_mark.inside_a_square_bracket", mark: "?", divides: false, test: (c) => c.container === "bracket" },
  { id: "question_mark.as_its_own_part", mark: "?", divides: false, test: (c) => c.before.endsWith("/ ") },
  { id: "question_mark.before_the_word_of", mark: "?", divides: false, test: (c) => c.after === " of" },
  { id: "question_mark.before_a_slash", mark: "?", divides: false, test: (c) => c.after.startsWith("/") },
  { id: "question_mark.at_the_end", mark: "?", divides: false, test: (c) => c.after === "" },
  { id: "question_inverted.as_its_own_part", mark: "\u00BF", divides: false, test: (c) => (c.before === "" || c.before.endsWith("/ ")) && (c.after === "" || c.after.startsWith("/")) },
  { id: "period.in_the_object_sign", mark: ".", divides: false, test: (c) => c.before.endsWith("<obj") },
  { id: "apostrophe.in_a_possessive", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) },
  { id: "colon.after_the_word_this", mark: ":", divides: false, test: (c) => c.before.endsWith("this") },
  { id: "colon.after_the_letters_of_k", mark: ":", divides: false, test: (c) => c.before.endsWith("ofK") },
  { id: "semicolon.before_a_supplied_word", mark: ";", divides: false, test: (c) => c.after.startsWith(" [") },
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
function holdsNoBareWord(text) { let depth = 0; for (const ch of text) { if (ch === "[" || ch === "<") depth++; else if (ch === "]" || ch === ">") depth--; else if (depth === 0 && isLetter(ch)) return false; } return true; }
const beforeOpener = (c) => c.before.slice(0, c.before.length - c.group.length - 1);
const runBefore = (s) => (/\p{L}+$/u.exec(s) || [""])[0];
const runAfter = (s) => (/^\p{L}+/u.exec(s) || [""])[0];
const WORD_TAILS = ["fore","lease","cacies","caci"];
const GENDER_LABELS = ["masc","fem"];
const WHOLE_WORD_HEADS = ["four","six","seven","eight","nine","west","there","in","In"];
const TAIL_TEXTS_OF_WORDS = ["teen [cubits]"];
const TAIL_TEXTS_OF_NAMES = ["<the>/ jaminite"];

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
