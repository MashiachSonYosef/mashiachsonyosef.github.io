// wikimedia_hebrew_english_interlanguage_title_20260701.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.inside_a_note_on_a_person", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.before_inc", mark: ",", divides: false, test: (c) => c.after === " Inc." },
  { id: "comma.before_son_of", mark: ",", divides: false, test: (c) => c.after.startsWith(" son of ") || c.after.startsWith(" Son of ") },
  { id: "comma.inside_one_title", mark: ",", divides: false, test: (c) => COMMA_ONE_TITLE_TEXTS.includes(c.text) },
  { id: "comma.between_a_place_and_where_it_stands", mark: ",", divides: false, test: (c) => true },
  { id: "hyphen.before_a_digit", mark: "-", divides: false, test: (c) => isDigit(c.after[0]) },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.at_the_head_of_a_text", mark: "'", divides: false, test: (c) => c.before === "" },
  { id: "apostrophe.before_a_final_s", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "apostrophe.closes_a_word", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && !isLetter(c.after[0]) },
  { id: "apostrophe.in_a_plain_spelling", mark: "'", divides: false, test: (c) => APOSTROPHE_PLAIN_SPELLINGS.includes(wordRound(c)) },
  { id: "apostrophe.between_two_letters", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "period.after_inc_or_ltd", mark: ".", divides: false, test: (c) => (c.before.endsWith("Inc") || c.before.endsWith("Ltd")) && c.after === "" },
  { id: "period.after_a_lone_capital", mark: ".", divides: false, test: (c) => /[A-Z]/u.test(c.before.slice(-1)) && !isLetter(c.before.slice(-2, -1)) },
  { id: "period.after_the_short_form_subg", mark: ".", divides: false, test: (c) => c.before.endsWith("subg") },
  { id: "period.in_the_dots_before_a_title", mark: ".", divides: false, test: (c) => /^[. ]*$/u.test(c.before) && c.after.startsWith(" ") },
  { id: "colon.before_a_subtitle", mark: ":", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after.startsWith(" ") },
  { id: "en_dash.inside_one_title", mark: "–", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "exclamation.closes_a_word_of_a_title", mark: "!", divides: false, test: (c) => isLetter(c.before.slice(-1)) },
  { id: "plus.between_two_words_of_a_title", mark: "+", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "slash.between_a_virus_and_its_illness", mark: "/", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "number_sign.between_a_page_and_its_part", mark: "#", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "open_paren.around_the_word_disambiguation", mark: "(", divides: false, test: (c) => c.group === "disambiguation" },
  { id: "close_paren.around_the_word_disambiguation", mark: ")", divides: false, test: (c) => c.group === "disambiguation" },
  { id: "open_paren.around_a_year_and_a_kind_of_work", mark: "(", divides: false, test: (c) => /^[0-9]{4} /u.test(c.group ?? "") },
  { id: "close_paren.around_a_year_and_a_kind_of_work", mark: ")", divides: false, test: (c) => /^[0-9]{4} /u.test(c.group ?? "") },
  { id: "open_paren.around_what_says_which_one", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.around_what_says_which_one", mark: ")", divides: false, test: (c) => true },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && ch !== "" && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && /^[0-9]$/u.test(ch);
const wordRound = (c) => /\p{L}*$/u.exec(c.before)[0] + c.mark + /^\p{L}*/u.exec(c.after)[0];
const COMMA_ONE_TITLE_TEXTS = ["Lost, mislaid, and abandoned property","When I am dead, my dearest","Shmendrik, oder di komishe Chaseneh","Lo Nivcharot, Lo Bocharot","Walker, Texas Ranger"];
const APOSTROPHE_PLAIN_SPELLINGS = ["L'Orfeo","L'Africaine","d'Oise","d'état","O'Dell","O'Neill","Mo'Nique","Don't"];

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
