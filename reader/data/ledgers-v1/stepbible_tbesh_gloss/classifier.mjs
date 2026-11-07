// stepbible_tbesh_gloss.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.between_two_names", mark: ",", divides: false, test: (c) => c.text === "Samgar, Nebu-sar-sekim" },
  { id: "colon.before_the_heads_own_word", mark: ":", divides: false, test: (c) => (c.before.startsWith("to ") ? c.before.slice(3) : c.before) === c.after.slice(1) },
  { id: "colon.before_a_piece_that_waits", mark: ":", divides: false, test: (c) => WAITING_SECOND_PART_TEXTS.includes(c.text) },
  { id: "colon.before_a_bare_small_word", mark: ":", divides: false, test: (c) => BARE_SMALL_WORD_TEXTS.includes(c.text) },
  { id: "colon.between_head_and_sense", mark: ":", divides: false, test: (c) => c.after[0] === " " },
  { id: "slash.between_two_spellings_of_one_name", mark: "/", divides: false, test: (c) => TWO_SPELLINGS_OF_ONE_NAME_TEXTS.includes(c.text) },
  { id: "slash.in_the_head_before_a_colon", mark: "/", divides: false, test: (c) => c.after.includes(":") },
  { id: "slash.in_the_sense_after_a_colon", mark: "/", divides: false, test: (c) => c.before.includes(":") },
  { id: "slash.between_endings_of_one_word", mark: "/", divides: false, test: (c) => ENDINGS_ON_ONE_WORD_TEXTS.includes(c.text) },
  { id: "slash.before_a_shared_last_word", mark: "/", divides: false, test: (c) => SHARED_LAST_WORD_TEXTS.includes(c.text) },
  { id: "slash.in_paren_between_two_endings", mark: "/", divides: false, test: (c) => c.text === "to draw (up/out)" },
  { id: "slash.between_readings", mark: "/", divides: false, test: (c) => SLASH_LIST_TEXTS.includes(c.text) },
  { id: "open_paren.pronoun_label", mark: "(", divides: false, test: (c) => PRONOUN_LABEL_TEXTS.includes(c.text) },
  { id: "close_paren.pronoun_label", mark: ")", divides: false, test: (c) => PRONOUN_LABEL_TEXTS.includes(c.text) },
  { id: "open_paren.optional_ending", mark: "(", divides: false, test: (c) => OPTIONAL_ENDING_TEXTS.includes(c.text) },
  { id: "close_paren.optional_ending", mark: ")", divides: false, test: (c) => OPTIONAL_ENDING_TEXTS.includes(c.text) },
  { id: "open_paren.optional_word", mark: "(", divides: false, test: (c) => OPTIONAL_WORD_TEXTS.includes(c.text) },
  { id: "close_paren.optional_word", mark: ")", divides: false, test: (c) => OPTIONAL_WORD_TEXTS.includes(c.text) },
  { id: "open_paren.around_two_endings", mark: "(", divides: false, test: (c) => c.text === "to draw (up/out)" },
  { id: "close_paren.around_two_endings", mark: ")", divides: false, test: (c) => c.text === "to draw (up/out)" },
  { id: "open_paren.in_the_head_before_a_colon", mark: "(", divides: false, test: (c) => c.after.includes(":") },
  { id: "close_paren.in_the_head_before_a_colon", mark: ")", divides: false, test: (c) => c.after.includes(":") },
  { id: "open_paren.after_a_word_in_the_second_part", mark: "(", divides: false, test: (c) => c.before.includes(":") && /\p{L}/u.test(c.before.slice(-1)) },
  { id: "close_paren.after_a_word_in_the_second_part", mark: ")", divides: false, test: (c) => c.before.includes(":") && c.after === "" },
  { id: "open_paren.before_a_word_in_the_second_part", mark: "(", divides: false, test: (c) => c.before.includes(":") && c.before.slice(-1) === " " },
  { id: "close_paren.before_a_word_in_the_second_part", mark: ")", divides: false, test: (c) => c.before.includes(":") && /\p{L}/u.test(c.after[0] ?? "") },
  { id: "open_paren.around_a_part_of_a_name", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.around_a_part_of_a_name", mark: ")", divides: false, test: (c) => true },
  { id: "open_bracket.around_a_grammar_label", mark: "[", divides: false, test: (c) => c.text === "[Obj.]" },
  { id: "close_bracket.around_a_grammar_label", mark: "]", divides: false, test: (c) => c.text === "[Obj.]" },
  { id: "open_bracket.around_the_sense_after_a_colon", mark: "[", divides: false, test: (c) => c.before.includes(":") },
  { id: "close_bracket.around_the_sense_after_a_colon", mark: "]", divides: false, test: (c) => c.before.includes(":") },
  { id: "open_bracket.around_a_part_of_a_name", mark: "[", divides: false, test: (c) => BRACKET_NAME_TEXTS.includes(c.text) },
  { id: "close_bracket.around_a_part_of_a_name", mark: "]", divides: false, test: (c) => BRACKET_NAME_TEXTS.includes(c.text) },
  { id: "period.in_a_pronoun_label", mark: ".", divides: false, test: (c) => PRONOUN_LABEL_TEXTS.includes(c.text) },
  { id: "period.in_a_grammar_label", mark: ".", divides: false, test: (c) => c.text === "[Obj.]" },
  { id: "period.after_a_shortened_title", mark: ".", divides: false, test: (c) => c.text === "(Mt. Ephron in the) West" },
  { id: "hyphen.ends_a_bare_half_of_a_name", mark: "-", divides: false, test: (c) => c.text === "Ir-" },
  { id: "hyphen.at_the_edge_inside_paren", mark: "-", divides: false, test: (c) => c.before.slice(-1) === "(" || c.after[0] === ")" },
  { id: "hyphen.inside_a_word_in_paren", mark: "-", divides: false, test: (c) => c.container === "paren" && /\p{L}/u.test(c.before.slice(-1)) && /\p{L}/u.test(c.after[0] ?? "") },
  { id: "hyphen.after_a_part_in_paren", mark: "-", divides: false, test: (c) => c.before.slice(-1) === ")" },
  { id: "hyphen.before_a_part_in_paren", mark: "-", divides: false, test: (c) => c.after[0] === "(" },
  { id: "hyphen.inside_a_word", mark: "-", divides: false, test: (c) => /\p{L}/u.test(c.before.slice(-1)) && /\p{L}/u.test(c.after[0] ?? "") },
  { id: "apostrophe.in_a_bare_half_of_a_name", mark: "'", divides: false, test: (c) => HALF_NAME_APOSTROPHE_TEXTS.includes(c.text) },
  { id: "apostrophe.in_a_shortened_word", mark: "'", divides: false, test: (c) => c.text === "isn't?" },
  { id: "apostrophe.of_belonging_in_paren", mark: "'", divides: false, test: (c) => c.container === "paren" },
  { id: "apostrophe.of_belonging_before_a_paren", mark: "'", divides: false, test: (c) => BELONGING_BESIDE_PAREN_TEXTS.includes(c.text) },
  { id: "exclamation.closes_a_cry", mark: "!", divides: false, test: (c) => c.after === "" },
  { id: "question_mark.closes_a_question_word", mark: "?", divides: false, test: (c) => c.after === "" },
  { id: "grave_accent.opens_a_word_for_a_name", mark: "`", divides: false, test: (c) => c.before === "" },
  { id: "grave_accent.closes_a_word_for_a_name", mark: "`", divides: false, test: (c) => c.after === "" },
];

// ---- helpers of fragment ledger ----
const SLASH_LIST_TEXTS = ["YHWH/God","about/through/for","ancient/taken","article/utensil","back/rim/brow","bag/price","be weary/toil","cutting/separation","diadem/doom","he/she/it","here/thus","in/at/by","jubilee/horn","lifetime/world","nail/claw","ointment pot/seasoning","rain/teacher","rejected/fleeting","servant/slave","single/height","street/plaza","thumb/big toe","to burn/pursue","to burst/come out","to devote/destroy","to dislocate/hang","to drag/chew/saw","to drip/prophesy","to gather/restrain/fortify","to lavish/despise","to plow/plot","to reckon/appoint","to saddle/tie","to teach/learn"];
const ENDINGS_ON_ONE_WORD_TEXTS = ["to break up/open","to cut down/off","to pass on/over/away","to wall up/off"];
const SHARED_LAST_WORD_TEXTS = ["to be/bear firstborn","to gather/tend figs"];
const WAITING_SECOND_PART_TEXTS = ["son: type of","voice: [sound of]","master: [master of]","to call: call by","to call: call to","lip: according"];
const BARE_SMALL_WORD_TEXTS = ["hand: by","hand: to","hand: themselves","face: because","face: before","word: because","entrails: among","side: beside","side: beyond","to encounter: toward","bone: same","woman: another","alone: each"];
const PRONOUN_LABEL_TEXTS = ["they(fem.)","they(masc.)","you(f.p.)","you(f.s.)","you(m.p.)","you(m.s.)"];
const OPTIONAL_ENDING_TEXTS = ["fool(ish)","labour(er)","to(wards)"];
const OPTIONAL_WORD_TEXTS = ["baked (food)","guilt (offering)","to bend (down)","(right) time","the man (Adam)"];
const HALF_NAME_APOSTROPHE_TEXTS = ["King's","Serpent's","Washer's","Wildgoats'"];
const BELONGING_BESIDE_PAREN_TEXTS = ["Diviners' (Oak)","People's (Gate)"];
const BRACKET_NAME_TEXTS = ["[Ben]jamin","[Ben]jaminite","Second [Quarter]"];
const TWO_SPELLINGS_OF_ONE_NAME_TEXTS = ["YHWH/Jehovah-nissi","YHWH/Yahweh-shalom","YHWH/Yahweh-shammah","YHWH/Yahweh-tsidkenu"];

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
