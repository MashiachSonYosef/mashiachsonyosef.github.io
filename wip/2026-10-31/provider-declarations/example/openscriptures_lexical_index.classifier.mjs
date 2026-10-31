// openscriptures_lexical_index.classifier.mjs · the worked example under ask v1.1, made from classifier-template-v1
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
  // "(" — the bracket character sits in what encloses it
  { id: "open_paren.optional_letters", mark: "(", divides: false, test: (c) => c.group !== null && /^-[a-z]+$/u.test(c.group) },
  { id: "open_paren.margin_note", mark: "(", divides: false, test: (c) => c.group !== null && /^from the margin$/u.test(c.group) },
  { id: "open_paren.aside", mark: "(", divides: false, test: (c) => c.group !== null && /^[a-z][a-z ]+$/u.test(c.group) },
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  // ")"
  { id: "close_paren.optional_letters", mark: ")", divides: false, test: (c) => /^-[a-z]+$/u.test(c.group || "") },
  { id: "close_paren.margin_note", mark: ")", divides: false, test: (c) => c.group === "from the margin" },
  { id: "close_paren.aside", mark: ")", divides: false, test: (c) => /^[a-z][a-z ]+$/u.test(c.group || "") },
  // "-" inside optional letters: attach the ending to the stem
  { id: "hyphen.attach_ending", mark: "-", divides: false, test: (c) => c.container === "paren" && /^-[a-z]+$/u.test(c.inner) },
  // "."
  { id: "period.before_pointer", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s*(Compare|See)\b/u.test(c.after) },
  { id: "period.before_cut_note", mark: ".", divides: false, test: (c) => c.container === "top" && /^\s*\(/u.test(c.after) },
];

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
