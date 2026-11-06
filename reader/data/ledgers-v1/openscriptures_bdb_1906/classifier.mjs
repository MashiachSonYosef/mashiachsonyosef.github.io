// openscriptures_bdb_1906.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  // ---- fragment comma ----
  { id: "comma.at_end_of_text", mark: ",", divides: false, test: (c) => nothingAfter(c) },
  { id: "comma.before_half_word", mark: ",", divides: false, test: (c) => (() => { const t = c.after.trim(); return t.startsWith("-") || t.endsWith("'"); })() },
  { id: "comma.in_cited_loanwords", mark: ",", divides: false, test: (c) => LISTS.loanword_lists.includes(c.text) },
  { id: "comma.in_a_sentence", mark: ",", divides: false, test: (c) => LISTS.prose_openings.some((o) => c.text.startsWith(o)) },
  { id: "comma.marked_before_a_part_that_stands_alone", mark: ",", divides: false, test: (c) => standsAtMark(c) },
  { id: "comma.marked_beside_a_part_that_leans", mark: ",", divides: false, test: (c) => isMarked(c) },
  { id: "comma.between_one_word_parts", mark: ",", divides: false, test: (c) => piecesOf(c.text).every(isOneWord) },
  { id: "comma.in_list_opened_by_be_or_make", mark: ",", divides: false, test: (c) => LISTS.opening_words.includes(firstWordOf(c.text)) },
  // ---- fragment paren ----
  { id: "open_paren.holds_a_label", mark: "(", divides: false, test: (c) => LISTS.paren_labels.includes(c.group) },
  { id: "close_paren.holds_a_label", mark: ")", divides: false, test: (c) => LISTS.paren_labels.includes(c.group) },
  { id: "open_paren.holds_optional_letters", mark: "(", divides: false, test: (c) => isLetter(charBeforeOpener(c)) },
  { id: "close_paren.holds_optional_letters", mark: ")", divides: false, test: (c) => isLetter(charBeforeCloserPair(c)) },
  { id: "open_paren.holds_a_supplied_word", mark: "(", divides: false, test: (c) => LISTS.supplied_words.includes(c.group) },
  { id: "close_paren.holds_a_supplied_word", mark: ")", divides: false, test: (c) => LISTS.supplied_words.includes(c.group) },
  // ---- fragment rest ----
  { id: "hyphen.after_a_bracket", mark: "-", divides: false, test: (c) => charBefore(c) === ")" },
  { id: "hyphen.in_a_transliterated_name", mark: "-", divides: false, test: (c) => LISTS.names_with_hyphens.includes(c.text) },
  { id: "hyphen.opens_a_half_word", mark: "-", divides: false, test: (c) => !isLetter(charBefore(c)) && isLetter(charAfter(c)) },
  { id: "hyphen.ends_a_half_word", mark: "-", divides: false, test: (c) => isLetter(charBefore(c)) && !isLetter(charAfter(c)) },
  { id: "hyphen.inside_a_compound", mark: "-", divides: false, test: (c) => isLetter(charBefore(c)) && isLetter(charAfter(c)) },
  { id: "semicolon.marked_between_two_groups", mark: ";", divides: false, test: (c) => standsAtMark(c) },
  { id: "period.marked_between_two_renderings", mark: ".", divides: false, test: (c) => standsAtMark(c) },
  { id: "period.in_a_row_of_periods", mark: ".", divides: false, test: (c) => charBefore(c) === "." || charAfter(c) === "." },
  { id: "period.after_a_shortened_word", mark: ".", divides: false, test: (c) => LISTS.abbreviations.includes(runBefore(c.before)) },
  { id: "period.closes_the_text", mark: ".", divides: false, test: (c) => nothingAfter(c) },
  { id: "question_mark.marked_between_two_renderings", mark: "?", divides: false, test: (c) => standsAtMark(c) },
  { id: "question_mark.closes_the_text", mark: "?", divides: false, test: (c) => nothingAfter(c) },
  { id: "exclamation.closes_the_text", mark: "!", divides: false, test: (c) => nothingAfter(c) },
  { id: "right_single_quotation_mark.closes_a_quote", mark: "’", divides: false, test: (c) => c.before.includes("\u2018") },
  { id: "right_single_quotation_mark.stands_for_a_letter", mark: "’", divides: false, test: (c) => isLetter(charAfter(c)) && charAfter(c) !== "s" },
  { id: "right_single_quotation_mark.in_a_possessive", mark: "’", divides: false, test: (c) => isLetter(charBefore(c)) && charAfter(c) === "s" },
  { id: "left_single_quotation_mark.opens_a_quote", mark: "‘", divides: false, test: (c) => true },
  { id: "single_high_reversed_9_quotation_mark.stands_for_a_letter", mark: "‛", divides: false, test: (c) => true },
  { id: "apostrophe.in_a_possessive", mark: "'", divides: false, test: (c) => isLetter(charBefore(c)) && charAfter(c) === "s" },
  { id: "apostrophe.after_a_final_s", mark: "'", divides: false, test: (c) => charBefore(c) === "s" },
  { id: "ampersand.marked_between_two_renderings", mark: "&", divides: false, test: (c) => standsAtMark(c) },
  { id: "ampersand.joins_inside_a_rendering", mark: "&", divides: false, test: (c) => /\s/u.test(charBefore(c)) && /\s/u.test(charAfter(c)) },
  { id: "horizontal_ellipsis.stands_for_a_gap", mark: "…", divides: false, test: (c) => true },
  { id: "combining_caron.over_a_vowel", mark: "̌", divides: false, test: (c) => true },
  { id: "geresh.shortens_the_divine_name", mark: "׳", divides: false, test: (c) => true },
];

// ---- helpers of fragment comma ----
const LISTS = {"opening_words":["be","became","become","grow","make"],"loanword_lists":["algebra, Alhambra, alkali, alcohol, alcove"],"prose_openings":["who were pricked off","will brace up","as for their hands","after my skin","Ephraim, among","in front of the land of Canaan","let me drink","Gog of the land","Ethan the Ezrahite","yea, it","they grasp each other","Oh, your perversity","Nebo, protect","Bel, protect"],"marked_lists":["furnish with a rim | , enclose | , set","fall to the ground | , kneel","cover up | , hide","wind about | , wrap up","set up | , erect","strengthen | , make firm","prepare | , improve | , manure land","labour | , take pains | , strive","move | , rise | , come forth","pass by | , go","wash gently | , rub","lend | , give a gift","beads strung together | , neck-ornament","beauty | , all excellence","peel of bark | , strip off leaves","turbid | , dusky | , mixed with yellowish red","drive away and despise | , drive","overthrow | , overturn | , cast down","contract affinity | , be joined by affinity","decline | , turn aside | , avoid","mix | , prepare by mixing","run right and left | , run swiftly","come to meet | , receive","gather fruit | , pluck","wipe out | , efface","strike | , beat | , extend by beating | , shape iron into a helmet","beat with a club | , chastise","wrap round | , wrap up","prolong | , make to continue","in the form of | , as","down to | , upon","with | , for | , at the cost of","through | , on account of","falthough | , in spite of","stony ground | , stones","possess | , own exclusively","cut | , cut off","difficult place | , mountain","swell | , swell up","fence in | , enclose","wonder at | , admire","stretch out | , extend","impeded in speech | , tongue-tied","raise | , make high","a step | , stair","wash away | , rub off","washing away | , obliteration","reconcile | , bring together","great mass of stone | , heap of stones","lash with the tail | , move spear up and down | , shake | , quiver","boil | , boil up","stream | , flow abundantly","give light | , shine","hollow | , depressed ground between hills","put under command | , rule over","project | , be convex","observe | , attend to","aim at | , purpose","drive in peg | , be firm","stretch out to | , reach after","bray | , pound | , grind coarse","heap up | , accumulate","overthrow | , lay prostrate","turn round | , bring back","pour | , pour out","cut off | , cut up","strip off | , erase","skim | , slide along","latch | , sliding bolt","cut off | , sever","be digestible | , agree with","be many | , increase","be glorious | , excel in glory","be bright | , shine","make hollow | , dig","make firm | , fasten","be in front of | , meet","be in front of | , precede | , lead","be high | , lift","be sent | , wait on | , minister","be present | , settle or dwell","become dusky, dingy | , inclining to black","contract the face | , look hard, stern","away, draw together | , contract","thing to be protected | , thing sacred, inviolable","go on foot, step by step | , walk","be at rest, at ease | , enjoy life of plenty","be tall, long, quivering | , be light, quick","congeal | , become solid | ; be hard, stern","by means of what | ? how?","strip | . strip off","fear  | & object of fear","to intertwine, net","to desire, request","blocks, make compact","rise in grade, rank","common, vulgar people","one soft, tender, impressible","hard, unproductive soil","run vehemently, easily","place of refuge, protection","that which veils, conceals, hides","particles of straw, sand, dust","one enjoying a life of ease, freedom from toil & trouble"],"names_with_hyphens":["Adar-malik","abal-idinna","Hā-Rāphā","Nabû-kudurri-uṣur","Nabû-zêr-iddin","Nabû-šêzib-anni","Pe-nehasi","Sin-aḩê-irba"],"abbreviations":["D","Isr","covt","fr","id","instr","mt","mts","obj"],"supplied_words":["he","moist","oil","ruinously","the","true","was"],"paren_labels":["Aramaism"]};
function marksOfEntries(list) { const m = new Map(); for (const e of list) { const parts = e.split(" | "); const at = new Set(); let pos = 0; for (let k = 0; k < parts.length - 1; k++) { pos += parts[k].length; at.add(pos); } m.set(parts.join(""), at); } return m; }
const MARKED = marksOfEntries(LISTS.marked_lists);
function standsAtMark(c) { const at = MARKED.get(c.text); return !!at && at.has(c.i); }
function isMarked(c) { return MARKED.has(c.text); }
function piecesOf(t) { return t.split(",").map((p) => p.trim()); }
function isOneWord(p) { return p !== "" && !/\s/u.test(p); }
function firstWordOf(t) { return t.split(/\s/u)[0]; }
function isLetter(ch) { return !!ch && /^\p{L}$/u.test(ch); }
function charBefore(c) { const a = [...c.before]; return a.length ? a[a.length - 1] : ""; }
function charAfter(c) { const a = [...c.after]; return a.length ? a[0] : ""; }
function nothingAfter(c) { return c.after.trim() === ""; }
function runBefore(before) { const m = /\p{L}+$/u.exec(before); return m ? m[0] : ""; }
function charBeforeOpener(c) { return charBefore(c); }
function charBeforeCloserPair(c) { const a = [...c.before]; const g = [...(c.group || "")]; const k = a.length - g.length - 2; return k >= 0 ? a[k] : ""; }
// ---- helpers of fragment paren ----

// ---- helpers of fragment rest ----


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
