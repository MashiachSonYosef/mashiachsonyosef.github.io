// lexibank_analysed_v2_2_northeuralex_hebrew.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "open_paren.holds_another_wording", mark: "(", divides: false, test: (c) => ANOTHER_WORDINGS.includes(c.group) },
  { id: "close_paren.holds_another_wording", mark: ")", divides: false, test: (c) => ANOTHER_WORDINGS.includes(c.group) },
  { id: "comma.between_wordings_in_round_brackets", mark: ",", divides: false, test: (c) => ANOTHER_WORDINGS.includes(c.inner) },
  { id: "open_paren.holds_a_stand_in", mark: "(", divides: false, test: (c) => STAND_INS.includes(c.group) },
  { id: "close_paren.holds_a_stand_in", mark: ")", divides: false, test: (c) => STAND_INS.includes(c.group) },
  { id: "open_paren.holds_a_tie_word_phrase", mark: "(", divides: false, test: (c) => TIE_WORDS.includes(c.group.split(" ")[0]) },
  { id: "close_paren.holds_a_tie_word_phrase", mark: ")", divides: false, test: (c) => TIE_WORDS.includes(c.group.split(" ")[0]) },
  { id: "open_paren.holds_a_kind_label", mark: "(", divides: false, test: (c) => KIND_LABELS.includes(c.group) },
  { id: "close_paren.holds_a_kind_label", mark: ")", divides: false, test: (c) => KIND_LABELS.includes(c.group) },
  { id: "open_paren.holds_narrowing_words", mark: "(", divides: false, test: (c) => NARROWING_WORDS.includes(c.group) },
  { id: "close_paren.holds_narrowing_words", mark: ")", divides: false, test: (c) => NARROWING_WORDS.includes(c.group) },
];

// ---- helpers of fragment ledger ----
const ANOTHER_WORDINGS = ["GUIDE","WISH","SUCH","POTHOLE","HARASS","POSITION","APPEAR","BE AFRAID","MOVE IN HASTE","MAKE SOUND","APPEAL","SOIL","IGNITE","CONCEAL","FALL DOWN","TETHER","FINAL","BECOME DIFFERENT","GET TOGETHER","AGED","DISTANCE","REST","CLEAVE","ASSISTANCE","LABOUR","REFLECT","STREAM","BECOME SPOILED","PAINTING","CHILL","TAKE A WALK","YOUNG HUMAN","IMMEDIATELY","BRING UP","THIGH","QUANTITY","INJURY","INQUIRE","SHRED","OBESE","SLIM","ANNOY","LET","IN THE PAST","COVER, CAP","SMELL","MOVE THROUGH AIR","REQUEST","FLOW CONTINUOUSLY","FALSEHOOD","STOP","EMIT SMOKE","FIGHT","PITFALL","RIGHT","LIVE, RESIDE","WHERE TO"];
const STAND_INS = ["SOMETHING","SOMEONE","SOMEBODY","ONESELF","SOMEBODY OR SOMETHING"];
const TIE_WORDS = ["OF","FOR","WITH","FROM","INTO"];
const KIND_LABELS = ["VERB","ACTION","STATE","MANNER","MOVEMENT","DIRECTION","ACTIVITY","THING","MONTH","INSECT","FISH","TOOL","MUSIC","POLITICS","ANATOMY","FOOD","ORGANIC SUBSTANCE","PRECIPITATION","RADIATION","PIGMENTS"];
const NARROWING_WORDS = ["A MESSAGE","CATTLE","DEW","HEAVENLY BODIES","TACTUALLY","AVAILABLE","NOT NIGHT","PERCEIVE","DESCEND","MOVE UPWARDS","CONTINUING","EXHAUST","HERE TO","THERE TO","DESTROY OR GET DESTROYED"];

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
