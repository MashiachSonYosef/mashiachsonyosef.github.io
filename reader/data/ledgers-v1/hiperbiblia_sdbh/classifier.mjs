// hiperbiblia_sdbh.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.between_renderings_in_one_gloss", mark: ",", divides: false, test: (c) => atCut(c) },
  { id: "comma.between_renderings_that_share_words", mark: ",", divides: false, test: (c) => GLOSS_SHARED_WORDS.includes(c.text) },
  { id: "comma.after_to_be", mark: ",", divides: false, test: (c) => c.before === "to be" },
  { id: "comma.inside_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.any_other", mark: ",", divides: false, test: (c) => true },
  { id: "semicolon.inside_round_bracket", mark: ";", divides: false, test: (c) => c.container === "paren" },
  { id: "period.one_of_three_in_a_row", mark: ".", divides: false, test: (c) => c.before.endsWith(".") || c.after.startsWith(".") },
  { id: "question_mark.between_renderings_in_one_gloss", mark: "?", divides: false, test: (c) => atCut(c) },
  { id: "question_mark.doubt_in_round_bracket", mark: "?", divides: false, test: (c) => c.container === "paren" },
  { id: "question_mark.closes_a_question", mark: "?", divides: false, test: (c) => QUESTION_TEXTS.includes(c.text) },
  { id: "question_mark.any_other", mark: "?", divides: false, test: (c) => true },
  { id: "exclamation.between_renderings_in_one_gloss", mark: "!", divides: false, test: (c) => atCut(c) },
  { id: "exclamation.inside_round_bracket", mark: "!", divides: false, test: (c) => c.container === "paren" },
  { id: "exclamation.any_other", mark: "!", divides: false, test: (c) => true },
  { id: "colon.between_renderings_in_one_gloss", mark: ":", divides: false, test: (c) => atCut(c) },
  { id: "colon.closes_label_in_round_bracket", mark: ":", divides: false, test: (c) => c.container === "paren" },
  { id: "equals.inside_round_bracket", mark: "=", divides: false, test: (c) => c.container === "paren" },
  { id: "equals.opening_the_text", mark: "=", divides: false, test: (c) => c.before === "" },
  { id: "equals.between_wording_and_meaning", mark: "=", divides: false, test: (c) => c.container === "top" && c.before !== "" },
  { id: "close_angle.inside_round_bracket", mark: ">", divides: false, test: (c) => c.container === "paren" },
  { id: "close_angle.wording_to_meaning", mark: ">", divides: false, test: (c) => true },
  { id: "quote.around_wording_before_a_sign", mark: "\"", divides: false, test: (c) => c.text.includes("=") || c.text.includes(">") },
  { id: "quote.around_the_sound", mark: "\"", divides: false, test: (c) => true },
  { id: "apostrophe.before_final_s", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "apostrophe.after_final_s", mark: "'", divides: false, test: (c) => c.before.endsWith("s") && c.after[0] === " " },
  { id: "hyphen.between_two_letters", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "hyphen.first_in_round_bracket", mark: "-", divides: false, test: (c) => c.before.endsWith("(") },
  { id: "hyphen.last_in_round_bracket", mark: "-", divides: false, test: (c) => c.after.startsWith(")") },
  { id: "slash.between_two_pronouns", mark: "/", divides: false, test: (c) => isLetter(c.before.slice(-1)) },
  { id: "slash.between_two_plants_under_one_head", mark: "/", divides: false, test: (c) => c.before.endsWith(" ") },
  { id: "backslash.before_a_word", mark: "\\", divides: false, test: (c) => c.after.startsWith("birth") },
  { id: "open_bracket.holds_no_english", mark: "[", divides: false, test: (c) => c.group === "untranslated" },
  { id: "close_bracket.holds_no_english", mark: "]", divides: false, test: (c) => c.group === "untranslated" },
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => c.group === "" && !c.before.endsWith("(") },
  { id: "open_paren.part_of_a_word", mark: "(", divides: false, test: (c) => { const s = pairSides(c); return isLetter(s.left.slice(-1)) || isLetter(s.right[0]); } },
  { id: "close_paren.part_of_a_word", mark: ")", divides: false, test: (c) => { const s = pairSides(c); return isLetter(s.left.slice(-1)) || isLetter(s.right[0]); } },
  { id: "open_paren.doubt", mark: "(", divides: false, test: (c) => c.group === "?" },
  { id: "close_paren.doubt", mark: ")", divides: false, test: (c) => c.group === "?" },
  { id: "open_paren.label", mark: "(", divides: false, test: (c) => BRACKET_LABELS.includes(c.group) },
  { id: "close_paren.label", mark: ")", divides: false, test: (c) => BRACKET_LABELS.includes(c.group) },
  { id: "open_paren.restatement", mark: "(", divides: false, test: (c) => c.group.startsWith("=") || c.group.startsWith(">") },
  { id: "close_paren.restatement", mark: ")", divides: false, test: (c) => c.group.startsWith("=") || c.group.startsWith(">") },
  { id: "open_paren.second_half", mark: "(", divides: false, test: (c) => SECOND_HALF_TEXTS.includes(c.group) },
  { id: "close_paren.second_half", mark: ")", divides: false, test: (c) => SECOND_HALF_TEXTS.includes(c.group) },
  { id: "open_paren.remark", mark: "(", divides: false, test: (c) => BRACKET_REMARKS.includes(c.group) },
  { id: "close_paren.remark", mark: ")", divides: false, test: (c) => BRACKET_REMARKS.includes(c.group) },
  { id: "open_paren.first_slot_of_an_or_pair", mark: "(", divides: false, test: (c) => OR_PAIR_FIRST_SLOTS.includes(c.group) },
  { id: "close_paren.first_slot_of_an_or_pair", mark: ")", divides: false, test: (c) => OR_PAIR_FIRST_SLOTS.includes(c.group) },
  { id: "open_paren.first_in_the_text", mark: "(", divides: false, test: (c) => pairSides(c).left === "" },
  { id: "close_paren.first_in_the_text", mark: ")", divides: false, test: (c) => pairSides(c).left === "" },
  { id: "open_paren.stand_in_word", mark: "(", divides: false, test: (c) => STAND_IN_WORDS.includes(c.group) },
  { id: "close_paren.stand_in_word", mark: ")", divides: false, test: (c) => STAND_IN_WORDS.includes(c.group) },
  { id: "open_paren.after_a_joining_word", mark: "(", divides: false, test: (c) => { const m = /^[A-Za-z]+/.exec(c.group); return !!m && JOINING_WORDS.includes(m[0]); } },
  { id: "close_paren.after_a_joining_word", mark: ")", divides: false, test: (c) => { const m = /^[A-Za-z]+/.exec(c.group); return !!m && JOINING_WORDS.includes(m[0]); } },
  { id: "open_paren.any_other", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.any_other", mark: ")", divides: false, test: (c) => true },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && /^[A-Za-z]$/.test(ch);
function pairSides(c) { return c.mark === "(" ? { left: c.before, right: c.after.slice(c.group.length + 1) } : { left: c.before.slice(0, c.before.length - c.group.length - 1), right: c.after }; }
function atCut(c) { for (const e of SIDE_BY_SIDE_CUTS) { if (e.split(" | ").join("") !== c.text) continue; let shown = 0; let idx = e.indexOf(" | "); while (idx >= 0) { if (idx - 3 * shown === c.i) return true; shown += 1; idx = e.indexOf(" | ", idx + 3); } } return false; }
const SIDE_BY_SIDE_CUTS = ["to rush (upon) | , to come (over)","to possess | , grip | , take control","loins | , sides","to serve | , worship (a deity)","joy | , delight","congregation | , company","to make | , work","to remain | , be left","spotted | , speckled | , colorful","clothes | , garment","to pass from | , to be removed","wicked | , evil","to have regard for | , pay attention to","to proclaim | , to announce","serious | , grievous (suffering)","pain | , trouble","something | , anything","killing | , slaughter | , butchering","Ephrathah | , Ephrath","solemn assembly | , gathering","load | , fill","dispute | , quarrel | , strife | , argument","cover | , lid (of the ark of the covenant)","to stay | , dwell","to go | , to arrive","frightening | , terrifying","plaque | ? tablet | ? panel | ? block?","horn | ? trumpet?","woe | ! alas!","kneel | ! bow down!","would that ... | ! if only ...!","sorcerer | : sorceress"];
const GLOSS_SHARED_WORDS = ["(images of) hemorrhoids, tumors, ulcers","(what used to be done) before, in the past"];
const OR_PAIR_FIRST_SLOTS = ["either X","be it X"];
const QUESTION_TEXTS = ["where?","how?","why?","for what purpose?","what?","really?","truly?","is it true?","from where?","when?","is there ...?"];
const BRACKET_LABELS = ["pl","plural:","both in the collective sense"];
const SECOND_HALF_TEXTS = ["then God may punish me!","... the other"];
const BRACKET_REMARKS = ["that will pass away again","symbolizing semen","animals are not to be sacrificed","but not to be trusted","said of hardship","used as a symbol of battle","committed by one human to another","when they flee"];
const STAND_IN_WORDS = ["one's","someone","someone's","something","someone else","someone else's","oneself","their","others","somewhere","one's own","his","his own","Y"];
const JOINING_WORDS = ["about","against","and","around","as","at","by","down","for","from","in","into","of","on","out","over","to","up","upon","with","without"];

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
