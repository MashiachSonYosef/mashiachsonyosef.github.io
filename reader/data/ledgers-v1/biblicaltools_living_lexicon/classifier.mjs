// biblicaltools_living_lexicon.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "semicolon.between_parts_of_a_sentence_on_one_name", mark: ";", divides: false, test: (c) => c.after.endsWith("Ephrath") },
  { id: "period.before_a_pointer_with_no_target", mark: ".", divides: false, test: (c) => POINTERS_WITH_NO_TARGET.includes(c.after) },
  { id: "period.between_two_renderings", mark: ".", divides: false, test: (c) => c.text === "Ludim. Lydians" },
  { id: "period.after_a_shortened_note_word", mark: ".", divides: false, test: (c) => MARGIN_NOTES.includes(c.inner) || ARTICLE_NOTES.includes(c.inner) },
  { id: "period.in_a_grammar_label", mark: ".", divides: false, test: (c) => GRAMMAR_LABELS.includes(c.inner) },
  { id: "hyphen.opens_a_part_that_may_join", mark: "-", divides: false, test: (c) => PARTS_THAT_MAY_JOIN.includes(c.inner) },
  { id: "hyphen.joins_the_parts_of_one_word", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.opens_a_quoted_gloss", mark: "'", divides: false, test: (c) => c.before === "" },
  { id: "apostrophe.closes_a_quoted_gloss", mark: "'", divides: false, test: (c) => c.after === "" },
  { id: "left_single_quotation_mark.opens_a_rendering_in_quotes", mark: "\u2018", divides: false, test: (c) => c.before === "" },
  { id: "right_single_quotation_mark.closes_a_rendering_in_quotes", mark: "\u2019", divides: false, test: (c) => c.after === "" },
  { id: "right_single_quotation_mark.before_the_s_of_belonging", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" },
  { id: "colon.in_a_verse_place_beside_a_name", mark: ":", divides: false, test: (c) => VERSE_PLACES_BESIDE_A_NAME.includes(c.inner) },
  { id: "colon.in_a_verse_place_in_a_sentence", mark: ":", divides: false, test: (c) => VERSE_PLACES_IN_A_SENTENCE.includes(c.inner) },
  { id: "question_mark.closes_a_question", mark: "?", divides: false, test: (c) => c.after === "" },
  { id: "slash.between_two_renderings", mark: "/", divides: false, test: (c) => c.text === "country/planet" },
  { id: "open_paren.holds_a_part_that_may_join", mark: "(", divides: false, test: (c) => PARTS_THAT_MAY_JOIN.includes(c.group) },
  { id: "close_paren.holds_a_part_that_may_join", mark: ")", divides: false, test: (c) => PARTS_THAT_MAY_JOIN.includes(c.group) },
  { id: "open_paren.holds_a_correction_with_its_number_lost", mark: "(", divides: false, test: (c) => CORRECTION_NOTES.includes(c.group) },
  { id: "close_paren.holds_a_correction_with_its_number_lost", mark: ")", divides: false, test: (c) => CORRECTION_NOTES.includes(c.group) },
  { id: "open_paren.holds_a_note_on_the_margin", mark: "(", divides: false, test: (c) => MARGIN_NOTES.includes(c.group) },
  { id: "close_paren.holds_a_note_on_the_margin", mark: ")", divides: false, test: (c) => MARGIN_NOTES.includes(c.group) },
  { id: "open_paren.holds_a_note_on_the_article", mark: "(", divides: false, test: (c) => ARTICLE_NOTES.includes(c.group) },
  { id: "close_paren.holds_a_note_on_the_article", mark: ")", divides: false, test: (c) => ARTICLE_NOTES.includes(c.group) },
  { id: "open_paren.holds_a_verse_place_beside_a_name", mark: "(", divides: false, test: (c) => VERSE_PLACES_BESIDE_A_NAME.includes(c.group) },
  { id: "close_paren.holds_a_verse_place_beside_a_name", mark: ")", divides: false, test: (c) => VERSE_PLACES_BESIDE_A_NAME.includes(c.group) },
  { id: "open_paren.holds_a_verse_place_in_a_sentence", mark: "(", divides: false, test: (c) => VERSE_PLACES_IN_A_SENTENCE.includes(c.group) },
  { id: "close_paren.holds_a_verse_place_in_a_sentence", mark: ")", divides: false, test: (c) => VERSE_PLACES_IN_A_SENTENCE.includes(c.group) },
  { id: "open_paren.holds_a_grammar_label", mark: "(", divides: false, test: (c) => GRAMMAR_LABELS.includes(c.group) },
  { id: "close_paren.holds_a_grammar_label", mark: ")", divides: false, test: (c) => GRAMMAR_LABELS.includes(c.group) },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && ch !== "" && /\p{L}/u.test(ch);
const POINTERS_WITH_NO_TARGET = [" See also"," Compare also"," Comp"];
const PARTS_THAT_MAY_JOIN = ["-s","-Gilead","ish","er","wards","over"];
const CORRECTION_NOTES = ["by correction for "];
const MARGIN_NOTES = ["from margin","from the margin","from the marg."];
const ARTICLE_NOTES = ["including the art","including the article","includ. the article"];
const VERSE_PLACES_BESIDE_A_NAME = ["2 Chronicles 18:8"];
const VERSE_PLACES_IN_A_SENTENCE = ["Psalm 132:6"];
const GRAMMAR_LABELS = ["fem.","masc.","m.s."];

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
