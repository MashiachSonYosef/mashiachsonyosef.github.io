// omw_hebrew_oewn2025_permanent_sense_key_bridge.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "semicolon.before_the_same_wording_again", mark: ";", divides: false, test: (c) => c.after.trim() === c.before.trim() },
  { id: "semicolon.between_two_wordings", mark: ";", divides: false, test: (c) => WORDING_PIECES_AFTER_SEMICOLON.includes(pieceAfter(c)) },
  { id: "semicolon.before_a_grammar_label", mark: ";", divides: false, test: (c) => GRAMMAR_LABEL_OPENERS.includes(firstWordAfter(c)) },
  { id: "semicolon.after_a_label", mark: ";", divides: false, test: (c) => LABEL_HEADS_BEFORE_SEMICOLON.includes(c.before.slice(0, 40)) },
  { id: "semicolon.before_a_note_of_use_or_habit", mark: ";", divides: false, test: (c) => NOTE_OPENER_USE_OR_HABIT.includes(firstWordAfter(c)) },
  { id: "semicolon.before_a_verb_with_no_subject", mark: ";", divides: false, test: (c) => NOTE_OPENER_VERB_WITH_NO_SUBJECT.includes(firstWordAfter(c)) },
  { id: "semicolon.before_a_note", mark: ";", divides: false, test: (c) => true },
  { id: "comma.inside_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.in_a_grammar_label", mark: ",", divides: false, test: (c) => inGrammarLabel(c) },
  { id: "comma.between_two_wordings", mark: ",", divides: false, test: (c) => WORDING_PIECES_AFTER_COMMA.includes(pieceAfter(c)) },
  { id: "comma.before_a_qualifier", mark: ",", divides: false, test: (c) => COMMA_QUALIFIER_OPENERS.includes(firstWordAfter(c)) },
  { id: "comma.in_one_phrase", mark: ",", divides: false, test: (c) => true },
  { id: "colon.ends_the_text", mark: ":", divides: false, test: (c) => c.after === "" },
  { id: "colon.in_a_grammar_label", mark: ":", divides: false, test: (c) => inGrammarLabel(c) },
  { id: "open_paren.heads_the_text", mark: "(", divides: false, test: (c) => c.before === "" },
  { id: "close_paren.heads_the_text", mark: ")", divides: false, test: (c) => c.before === "(" + c.group },
  { id: "open_paren.holds_a_printed_sign", mark: "(", divides: false, test: (c) => PAREN_PRINTED_SIGNS.includes(c.group) },
  { id: "close_paren.holds_a_printed_sign", mark: ")", divides: false, test: (c) => PAREN_PRINTED_SIGNS.includes(c.group) },
  { id: "open_paren.holds_a_grammar_label", mark: "(", divides: false, test: (c) => PAREN_GRAMMAR_LABELS.includes(c.group) },
  { id: "close_paren.holds_a_grammar_label", mark: ")", divides: false, test: (c) => PAREN_GRAMMAR_LABELS.includes(c.group) },
  { id: "open_paren.holds_a_second_wording", mark: "(", divides: false, test: (c) => PAREN_SECOND_WORDINGS.includes(c.group) },
  { id: "close_paren.holds_a_second_wording", mark: ")", divides: false, test: (c) => PAREN_SECOND_WORDINGS.includes(c.group) },
  { id: "open_paren.holds_a_note_on_a_cited_word", mark: "(", divides: false, test: (c) => c.group[0] === "\u2018" },
  { id: "close_paren.holds_a_note_on_a_cited_word", mark: ")", divides: false, test: (c) => c.group[0] === "\u2018" },
  { id: "open_paren.holds_another_wording", mark: "(", divides: false, test: (c) => firstWord(c.group) === "or" },
  { id: "close_paren.holds_another_wording", mark: ")", divides: false, test: (c) => firstWord(c.group) === "or" },
  { id: "open_paren.holds_a_qualifier", mark: "(", divides: false, test: (c) => PAREN_QUALIFIER_OPENERS.includes(firstWord(c.group)) },
  { id: "close_paren.holds_a_qualifier", mark: ")", divides: false, test: (c) => PAREN_QUALIFIER_OPENERS.includes(firstWord(c.group)) },
  { id: "open_paren.holds_what_the_verb_takes", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.holds_what_the_verb_takes", mark: ")", divides: false, test: (c) => true },
  { id: "hyphen.names_itself", mark: "-", divides: false, test: (c) => c.before.slice(-1) === "\u2018" && c.after[0] === "\u2019" },
  { id: "hyphen.joins_one_word", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.before_the_s_of_belonging", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after[0] === "s" && !isLetter(c.after[1]) },
  { id: "left_single_quotation_mark.round_a_printed_sign", mark: "\u2018", divides: false, test: (c) => c.after[0] === "-" || c.after[0] === "." },
  { id: "left_single_quotation_mark.opens_a_cited_word", mark: "\u2018", divides: false, test: (c) => isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.round_a_printed_sign", mark: "\u2019", divides: false, test: (c) => c.before.slice(-1) === "-" || c.before.slice(-1) === "." },
  { id: "right_single_quotation_mark.closes_a_cited_word", mark: "\u2019", divides: false, test: (c) => isLetter(c.before.slice(-1)) },
  { id: "period.names_itself", mark: ".", divides: false, test: (c) => c.before.slice(-1) === "\u2018" && c.after[0] === "\u2019" },
  { id: "period.in_a_decimal_number", mark: ".", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "period.inside_e_g", mark: ".", divides: false, test: (c) => (c.before.slice(-1) === "e" && c.after[0] === "g") || c.before.slice(-3) === "e.g" },
  { id: "period.ends_etc", mark: ".", divides: false, test: (c) => c.before.slice(-3) === "etc" },
  { id: "period.ends_the_text", mark: ".", divides: false, test: (c) => c.after === "" },
  { id: "em_dash.sets_an_aside_into_one_wording", mark: "\u2014", divides: false, test: (c) => c.before.slice(-1) === " " && c.after[0] === " " },
  { id: "horizontal_ellipsis.says_a_number_runs_on", mark: "\u2026", divides: false, test: (c) => c.after === "" },
];

// ---- helpers of fragment ledger ----
const isLetter = (ch) => ch !== undefined && ch !== "" && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && ch !== "" && /^[0-9]$/u.test(ch);
const firstWord = (x) => /^[\p{L}0-9]*/u.exec(x)[0];
const firstWordAfter = (c) => firstWord(c.after.trim());
const pieceAfter = (c) => c.after.split(/[,;]/u)[0].trim().slice(0, 40);
const inGrammarLabel = (c) => c.before.includes(";") && GRAMMAR_LABEL_OPENERS.includes(firstWord(c.before.slice(c.before.lastIndexOf(";") + 1).trim()));
const WORDING_PIECES_AFTER_SEMICOLON = ["the highest stage of development","also a place where good people are belie","having three dimensions","rise above the ground","a field where grass or alfalfa are grown","be adequate","express criticism of","point out real or perceived flaws","or being a reason for pride","talk in a loud voice (usually denoting c","arrive at a compromise","someone who eats no animal or dairy prod","wicked or dishonorable","Completely or entirely","not thorough","a source of unhappiness","a number expressing the ratio of favorab","of the highest quality","having good reason","not false","not superficial or partial","not tall","describing something or someone with a s","not lasting","abutting","touching","permit","able to face and deal with danger or fea"];
const WORDING_PIECES_AFTER_COMMA = ["or the infliction of a penalty","give permission"];
const LABEL_HEADS_BEFORE_SEMICOLON = ["a quantifier that can be used with count"];
const GRAMMAR_LABEL_OPENERS = ["person","pronoun","quantifier","thing"];
const PAREN_GRAMMAR_LABELS = ["object:"];
const PAREN_SECOND_WORDINGS = ["a suffix or inflectional ending or final morpheme"];
const COMMA_QUALIFIER_OPENERS = ["including","typically","either","used","by","usually","as","also","which"];
const PAREN_QUALIFIER_OPENERS = ["such","usually","as","especially","that","which","along","e"];
const PAREN_PRINTED_SIGNS = ["‘-’","‘.’"];
const NOTE_OPENER_USE_OR_HABIT = ["used","usually","often","sometimes","especially","typically"];
const NOTE_OPENER_VERB_WITH_NO_SUBJECT = ["can","may","dries"];

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
