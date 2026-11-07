// florentin-tal-2025-index-of-differences-in-meaning.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "pipe.first_of_the_pair_between_two_meanings", mark: "|", divides: false, test: (c) => c.after[0] === "|" },
  { id: "pipe.second_of_the_pair_between_two_meanings", mark: "|", divides: false, test: (c) => c.before.endsWith("|") },
  { id: "colon.after_a_cell_label", mark: ":", divides: false, test: (c) => CELL_LABELS.includes(wordBefore(c.before)) },
  { id: "semicolon.between_places_in_round_brackets", mark: ";", divides: false, test: (c) => c.container === "paren" },
  { id: "semicolon.before_a_cell_label", mark: ";", divides: false, test: (c) => CELL_LABELS_WITH_COLON.includes(c.after.trimStart().split(" ")[0]) },
  { id: "semicolon.between_places", mark: ";", divides: false, test: (c) => lastCellLabel(c.before) === "Reference:" },
  { id: "comma.between_verses_in_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.inside_the_quoted_gloss", mark: ",", divides: false, test: (c) => lastCellLabel(c.before) === "MT:" },
  { id: "comma.inside_the_sp_cell", mark: ",", divides: false, test: (c) => lastCellLabel(c.before) === "SP:" },
  { id: "comma.inside_the_reference_cell", mark: ",", divides: false, test: (c) => lastCellLabel(c.before) === "Reference:" },
  { id: "period.after_a_book_or_latin_abbreviation", mark: ".", divides: false, test: (c) => ABBREVIATIONS.includes(wordBefore(c.before)) },
  { id: "period.between_chapter_and_verse", mark: ".", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "period.in_an_ellipsis_of_a_quoted_phrase", mark: ".", divides: false, test: (c) => c.before.endsWith(".") || c.after[0] === "." },
  { id: "period.ends_a_note", mark: ".", divides: false, test: (c) => c.after.trimStart() === "" || c.after.trimStart().startsWith("|") },
  { id: "apostrophe.inside_a_word", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.opens_the_quoted_gloss", mark: "'", divides: false, test: (c) => c.before.slice(-1) === " " },
  { id: "apostrophe.closes_the_quoted_gloss", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && (c.after[0] === ";" || c.after[0] === " ") },
  { id: "open_paren.holds_a_place", mark: "(", divides: false, test: (c) => BOOK_ABBREVIATIONS.some((b) => (c.group ?? "").startsWith(b + ".")) },
  { id: "close_paren.holds_a_place", mark: ")", divides: false, test: (c) => BOOK_ABBREVIATIONS.some((b) => (c.group ?? "").startsWith(b + ".")) },
  { id: "open_paren.holds_a_count", mark: "(", divides: false, test: (c) => /^[0-9]+x$/u.test(c.group ?? "") },
  { id: "close_paren.holds_a_count", mark: ")", divides: false, test: (c) => /^[0-9]+x$/u.test(c.group ?? "") },
  { id: "open_paren.holds_a_hebrew_context", mark: "(", divides: false, test: (c) => isHebrewLetter((c.group ?? "")[0]) },
  { id: "close_paren.holds_a_hebrew_context", mark: ")", divides: false, test: (c) => isHebrewLetter((c.group ?? "")[0]) },
  { id: "open_paren.holds_a_note", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.holds_a_note", mark: ")", divides: false, test: (c) => true },
  { id: "open_bracket.holds_a_count_in_a_place", mark: "[", divides: false, test: (c) => true },
  { id: "close_bracket.holds_a_count_in_a_place", mark: "]", divides: false, test: (c) => true },
  { id: "left_single_quotation_mark.writes_ayin_in_a_transliteration", mark: "‘", divides: false, test: (c) => true },
  { id: "circumflex_accent.opens_a_footnote_number", mark: "^", divides: false, test: (c) => true },
  { id: "slash.between_two_transliterations", mark: "/", divides: false, test: (c) => lastCellLabel(c.before) === "SP:" },
  { id: "slash.between_two_groups_of_places", mark: "/", divides: false, test: (c) => lastCellLabel(c.before) === "Reference:" },
  { id: "en_dash.between_a_stem_label_and_a_form", mark: "–", divides: false, test: (c) => true },
  { id: "asterisk.marks_a_reconstructed_form", mark: "*", divides: false, test: (c) => true },
];

// ---- helpers of fragment ledger ----
const CELL_LABELS = ["MT","SP","Reference"];
const CELL_LABELS_WITH_COLON = ["MT:","SP:","Reference:"];
const ABBREVIATIONS = ["Gen","Exod","Lev","Num","Deut","e","g","etc"];
const BOOK_ABBREVIATIONS = ["Gen","Exod","Lev","Num","Deut"];
function lastCellLabel(before) { let best = null, at = -1; for (const l of CELL_LABELS_WITH_COLON) { const i = before.lastIndexOf(l); if (i > at) { at = i; best = l; } } return best; }
function wordBefore(before) { const m = /\p{L}+$/u.exec(before); return m ? m[0] : ""; }
const isLetter = (ch) => ch !== undefined && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && /[0-9]/u.test(ch);
const isHebrewLetter = (ch) => ch !== undefined && /[\u05D0-\u05EA]/u.test(ch);

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
