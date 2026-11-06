// kaikki_wiktionary_aramaic.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.before_quoted_gloss_in_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" && c.after.trimStart().startsWith("\u201C") },
  { id: "comma.in_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.at_a_place_marked_by_hand", mark: ",", divides: false, test: (c) => listKind(c.text) === "marked" && markedBy(PLACES_MARKED_BY_HAND, c) },
  { id: "comma.beside_a_place_marked_by_hand", mark: ",", divides: false, test: (c) => listKind(c.text) === "marked" },
  { id: "comma.between_word_and_definition", mark: ",", divides: false, test: (c) => listKind(c.text) === "definition" && markedBy(WORD_AND_DEFINITION_PLACES, c) },
  { id: "comma.between_note_and_reading", mark: ",", divides: false, test: (c) => listKind(c.text) === "note" && markedBy(NOTE_AND_READING_PLACES, c) },
  { id: "comma.in_list_after_label", mark: ",", divides: false, test: (c) => listKind(c.text) === "note" },
  { id: "comma.in_list_before_tail", mark: ",", divides: false, test: (c) => listKind(c.text) === "tail_list" && markedBy(LIST_BEFORE_REMARK_PLACES, c) },
  { id: "comma.in_tail", mark: ",", divides: false, test: (c) => listKind(c.text) === "tail_list" || listKind(c.text) === "one_reading" },
  { id: "comma.after_name_label", mark: ",", divides: false, test: (c) => listKind(c.text) === "name_label" && NAME_LABELS.includes(c.before.trim().toLowerCase()) },
  { id: "comma.in_name_after_label", mark: ",", divides: false, test: (c) => listKind(c.text) === "name_label" },
  { id: "comma.after_a_label_word", mark: ",", divides: false, test: (c) => listKind(c.text) === "label_word" },
  { id: "comma.after_name_or_capital_head", mark: ",", divides: false, test: (c) => listKind(c.text) === "name_description" },
  { id: "comma.between_a_word_and_its_derived_form", mark: ",", divides: false, test: (c) => withinEntry(DERIVED_FORM_LISTS, c) && !markedBy(DERIVED_FORM_LISTS, c) },
  { id: "comma.in_list_opening_with_a_small_verb", mark: ",", divides: false, test: (c) => listKind(c.text) === "small_verb" },
  { id: "comma.in_list_with_a_bracket", mark: ",", divides: false, test: (c) => listKind(c.text) === "bracket" },
  { id: "comma.in_list_with_a_later_capital", mark: ",", divides: false, test: (c) => listKind(c.text) === "names" },
  { id: "comma.between_one_word_renderings", mark: ",", divides: false, test: (c) => listKind(c.text) === "one_word" },
  { id: "comma.between_verb_renderings", mark: ",", divides: false, test: (c) => listKind(c.text) === "verbs" },
  { id: "comma.in_explanation_after_colon", mark: ",", divides: false, test: (c) => listKind(c.text) === "colon" },
  { id: "comma.between_phrases", mark: ",", divides: false, test: (c) => listKind(c.text) === "phrases" },
  { id: "semicolon.in_round_bracket", mark: ";", divides: false, test: (c) => c.container === "paren" },
  { id: "semicolon.at_a_place_marked_by_hand", mark: ";", divides: false, test: (c) => listKind(c.text) === "marked" && markedBy(PLACES_MARKED_BY_HAND, c) },
  { id: "semicolon.between_word_and_definition", mark: ";", divides: false, test: (c) => listKind(c.text) === "definition" },
  { id: "semicolon.between_note_and_reading", mark: ";", divides: false, test: (c) => listKind(c.text) === "note" },
  { id: "semicolon.in_list_with_a_bracket", mark: ";", divides: false, test: (c) => listKind(c.text) === "bracket" },
  { id: "semicolon.between_one_word_renderings", mark: ";", divides: false, test: (c) => listKind(c.text) === "one_word" },
  { id: "semicolon.between_verb_renderings", mark: ";", divides: false, test: (c) => listKind(c.text) === "verbs" },
  { id: "semicolon.between_phrases", mark: ";", divides: false, test: (c) => listKind(c.text) === "phrases" },
  { id: "colon.before_pointer", mark: ":", divides: false, test: (c) => [...c.after].some(isHebrew) },
  { id: "colon.between_word_and_definition", mark: ":", divides: false, test: (c) => true },
  { id: "period.in_round_bracket", mark: ".", divides: false, test: (c) => c.container === "paren" },
  { id: "period.after_abbreviation", mark: ".", divides: false, test: (c) => ABBREVIATION_LETTERS.includes(lettersBefore(c.before).toLowerCase()) },
  { id: "period.ends_the_text", mark: ".", divides: false, test: (c) => c.after.trim() === "" },
  { id: "period.between_sentences", mark: ".", divides: false, test: () => true },
  { id: "slash.between_two_spellings", mark: "/", divides: false, test: (c) => c.container === "top" && TWO_SPELLINGS.includes(spellingRound(c)) },
  { id: "slash.around_a_sound", mark: "/", divides: false, test: (c) => c.container === "top" && (!isLetterOrDigit(c.before.slice(-1)) || !isLetterOrDigit(c.after[0])) },
  { id: "slash.between_words", mark: "/", divides: false, test: (c) => c.container === "top" },
  { id: "slash.between_words_in_round_bracket", mark: "/", divides: false, test: () => true },
  { id: "hyphen.between_letters", mark: "-", divides: false, test: (c) => isLetterOrDigit(c.before.slice(-1)) && isLetterOrDigit(c.after[0]) },
  { id: "hyphen.opens_or_ends_an_affix", mark: "-", divides: false, test: () => true },
  { id: "apostrophe.before_the_s_of_belonging", mark: "'", divides: false, test: (c) => c.after[0] === "s" && !isLetterOrDigit(c.after[1]) },
  { id: "apostrophe.in_a_word_carried_over", mark: "'", divides: false, test: () => true },
  { id: "right_single_quotation_mark.before_the_s_of_belonging", mark: "\u2019", divides: false, test: () => true },
  { id: "exclamation.ends_a_cry", mark: "!", divides: false, test: () => true },
  { id: "left_double_quotation_mark.opens_a_gloss_or_quoted_wording", mark: "\u201C", divides: false, test: () => true },
  { id: "right_double_quotation_mark.closes_a_gloss_or_quoted_wording", mark: "\u201D", divides: false, test: () => true },
  { id: "quote.around_quoted_words", mark: "\"", divides: false, test: () => true },
  { id: "open_paren.holds_a_figure", mark: "(", divides: false, test: (c) => roundKind(c) === "figure" },
  { id: "close_paren.holds_a_figure", mark: ")", divides: false, test: (c) => roundKind(c) === "figure" },
  { id: "open_paren.opens_the_text", mark: "(", divides: false, test: (c) => roundKind(c) === "opens_text" },
  { id: "close_paren.opens_the_text", mark: ")", divides: false, test: (c) => roundKind(c) === "opens_text" },
  { id: "open_paren.after_hebrew_holds_romanization", mark: "(", divides: false, test: (c) => roundKind(c) === "romanization" },
  { id: "close_paren.after_hebrew_holds_romanization", mark: ")", divides: false, test: (c) => roundKind(c) === "romanization" },
  { id: "open_paren.holds_a_note_with_hebrew", mark: "(", divides: false, test: (c) => roundKind(c) === "hebrew_word" },
  { id: "close_paren.holds_a_note_with_hebrew", mark: ")", divides: false, test: (c) => roundKind(c) === "hebrew_word" },
  { id: "open_paren.after_other_script_holds_romanization", mark: "(", divides: false, test: (c) => roundKind(c) === "other_script" },
  { id: "close_paren.after_other_script_holds_romanization", mark: ")", divides: false, test: (c) => roundKind(c) === "other_script" },
  { id: "open_paren.ends_the_text", mark: "(", divides: false, test: (c) => roundKind(c) === "ends_text" },
  { id: "close_paren.ends_the_text", mark: ")", divides: false, test: (c) => roundKind(c) === "ends_text" },
  { id: "open_paren.in_the_text", mark: "(", divides: false, test: (c) => roundKind(c) === "in_text" },
  { id: "close_paren.in_the_text", mark: ")", divides: false, test: (c) => roundKind(c) === "in_text" },
  { id: "hebrew_point_qamats.in_a_cited_word", mark: "\u05B8", divides: false, test: () => true },
  { id: "hebrew_point_dagesh_or_mapiq.in_a_cited_word", mark: "\u05BC", divides: false, test: () => true },
  { id: "hebrew_point_sheva.in_a_cited_word", mark: "\u05B0", divides: false, test: () => true },
  { id: "hebrew_point_patah.in_a_cited_word", mark: "\u05B7", divides: false, test: () => true },
  { id: "hebrew_point_hiriq.in_a_cited_word", mark: "\u05B4", divides: false, test: () => true },
  { id: "hebrew_point_shin_dot.in_a_cited_word", mark: "\u05C1", divides: false, test: () => true },
  { id: "hebrew_point_tsere.in_a_cited_word", mark: "\u05B5", divides: false, test: () => true },
  { id: "hebrew_point_segol.in_a_cited_word", mark: "\u05B6", divides: false, test: () => true },
  { id: "hebrew_point_hataf_patah.in_a_cited_word", mark: "\u05B2", divides: false, test: () => true },
  { id: "arabic_fatha.in_a_cited_word", mark: "\u064E", divides: false, test: () => true },
  { id: "arabic_sukun.in_a_cited_word", mark: "\u0652", divides: false, test: () => true },
  { id: "arabic_kasra.in_a_cited_word", mark: "\u0650", divides: false, test: () => true },
  { id: "arabic_letter_mark.inside_a_word_in_latin_letters", mark: "\u061C", divides: false, test: () => true },
  { id: "combining_macron.inside_a_word_in_latin_letters", mark: "\u0304", divides: false, test: () => true },
];

// ---- helpers of fragment ledger ----
const PLACES_MARKED_BY_HAND = ["An upper story,| chamber,| or room.","a show,| exhibition;| also metaphorically, a farce","anything used for seasoning;| spices, etc.","as per its sound;| the basic fundamental meaning","awakening,| inspiration,| a type of divine interaction","how strange!,| how surprising!,| what a surprise!, expressing","woe!,| alas!"];
const WORD_AND_DEFINITION_PLACES = ["Havdalah,| a formula of prayer","Lord;| the Christian concept","Mesivta,| an Orthodox Jewish","an adrachta,| a document which permits","beth,| the second letter","foundation,| the earth under","mabarta,| the passageway","shechinah,| the divine presence","shurinqa,| a species of hawk"];
const NOTE_AND_READING_PLACES = ["A greeting;| similar to hello.",",| I am enslaved",",| he/it will be",",| we know"];
const LIST_BEFORE_REMARK_PLACES = ["panelling,| structure,| wall, exact meaning dubious."];
const DERIVED_FORM_LISTS = ["Arab, Arabian","cave, cavern,| tunnel","cold, coldness","dance, dancing","desire, desiring","extensive, extended","fast, fasting","female, feminine","good, goodness","male, masculine","on, upon","other, another","persuasion, persuasiveness","sweet, sweetened"];
const NAME_LABELS = ["a male given name","a surname"];
const NAME_DESCRIPTION_OPENINGS = ["Bozez, the name","God, the single","Iraq, the southern","Jesus, a Biblical","Joshua, a Biblical","Mahoza, an ancient","Seneh, the name"];
const ONE_READING_OPENINGS = ["a half-unit, such as","a type of pulmonary disease, most likely","early stage of ripening, especially","the act of lying something/someone down, especially","the priest’s share of the dough, also called","to be barefaced, i.e. to be impudent"];
const CAPITAL_LISTS_BY_READ = ["Persia, the Persians","Satan, the Devil"];
const CAPITAL_LISTS_KEPT_PLAIN = ["woe, alas, O"];
const OWN_PLURAL_TEXTS = ["life, lives"];
const SMALL_VERBS = ["to be","to become","to grow","be","become"];
const SMALL_VERB_STOPS = ["be","become","get","to"];
const WORDS_NOT_COUNTED_AS_CAPITAL = ["I","A","An","The"];
const ABBREVIATION_LETTERS = ["i","e","etc"];
const TWO_SPELLINGS = ["Hanukkah/Chanukah","Sarah/Sara","centre/center","color/colour","coloured/colored","favour/favor","honour/honor","humour/humor","jasmine/jessamine","labour/labor","labourer/laborer","liquorice/licorice","neighbour/neighbor","neighbourhood/neighborhood","odour/odor","plough/plow","ploughshare/plowshare","ploughshares/plowshares","sepulture/sepulchre/sepulcher","shekel/sheqel","sulphur/sulfur","tamarix/tamarisk","vapour/vapor"];
const isHebrew = (ch) => ch !== undefined && ch >= "\u0590" && ch <= "\u05FF";
function topView(s) { let d = 0, o = ""; for (const ch of s) { if ("([<{".includes(ch)) d++; else if (")]>}".includes(ch)) { if (d > 0) d--; } else if (d === 0) o += ch; } return o; }
function listText(s) { let t = topView(s).trim(); if (t.endsWith(".")) t = t.slice(0, -1).trim(); return t; }
const piecesOf = (t) => t.split(/[,;]/u).map((p) => p.trim());
const wordsOf = (p) => p.split(/\s+/u).filter(Boolean);
const firstLow = (p) => (wordsOf(p)[0] || "").toLowerCase();
const entryPlain = (e) => e.split("|").join("");
const holdsEntry = (list, text) => list.some((e) => text.includes(entryPlain(e)));
function markedBy(list, c) { const pos = c.before.length; for (const e of list) { const at = c.text.indexOf(entryPlain(e)); if (at < 0) continue; let k = 0; for (const ch of e) { if (ch === "|") { if (at + k - 1 === pos) return true; } else k += ch.length; } } return false; }
function withinEntry(list, c) { const pos = c.before.length; for (const e of list) { const p = entryPlain(e); const at = c.text.indexOf(p); if (at >= 0 && pos >= at && pos < at + p.length) return true; } return false; }
const laterCapital = (P) => P.slice(1).some((p) => /^\p{Lu}/u.test(p) && !WORDS_NOT_COUNTED_AS_CAPITAL.includes(wordsOf(p)[0]));
const oneWordList = (P) => P.every((p) => wordsOf(p).length === 1);
const toList = (P) => P.every((p) => firstLow(p) === "to");
const toWordList = (P) => { const w = wordsOf(P[0]); return w.length === 2 && w[0].toLowerCase() === "to" && P.slice(1).every((p) => wordsOf(p).length === 1); };
function ownPlural(P) { const q = P.map((p) => p.toLowerCase()); for (const a of q) for (const b of q) if (b === a + "s" || b === a + "es" || (a.endsWith("y") && b === a.slice(0, -1) + "ies")) return true; return OWN_PLURAL_TEXTS.includes(q.join(", ")); }
function smallVerbList(P) { const f = P[0].toLowerCase(); return SMALL_VERBS.some((v) => f === v || f.startsWith(v + " ")) && P.slice(1).some((p) => !SMALL_VERB_STOPS.includes(firstLow(p))); }
function listKind(T) {
  if (holdsEntry(PLACES_MARKED_BY_HAND, T)) return "marked";
  if (holdsEntry(WORD_AND_DEFINITION_PLACES, T)) return "definition";
  if (holdsEntry(NOTE_AND_READING_PLACES, T)) return "note";
  if (holdsEntry(LIST_BEFORE_REMARK_PLACES, T)) return "tail_list";
  if (NAME_LABELS.some((n) => T.toLowerCase().startsWith(n + ","))) return "name_label";
  if (NAME_DESCRIPTION_OPENINGS.some((n) => T.startsWith(n))) return "name_description";
  if (ONE_READING_OPENINGS.some((n) => T.startsWith(n))) return "one_reading";
  if (T.startsWith("also, ")) return "label_word";
  const t = listText(T), P = piecesOf(t);
  if (t.includes(":")) return "colon";
  if (T.includes("(")) return smallVerbList(P) ? "small_verb" : laterCapital(P) ? "names" : "bracket";
  if (CAPITAL_LISTS_BY_READ.includes(t)) return "names";
  if (ownPlural(P)) return "phrases";
  if (oneWordList(P)) return laterCapital(P) && !CAPITAL_LISTS_KEPT_PLAIN.includes(t) ? "names" : "one_word";
  if (toList(P) || toWordList(P)) return "verbs";
  if (smallVerbList(P)) return "small_verb";
  if (laterCapital(P)) return "names";
  return "phrases";
}
function roundKind(c) {
  const g = c.group, b = c.mark === "(" ? c.before : c.before.slice(0, c.before.length - g.length - 1), a = c.mark === "(" ? c.after.slice(g.length + 1) : c.after, bt = b.trim(), at = a.trim();
  if (/^\p{N}/u.test(g)) return "figure";
  if (bt === "") return "opens_text";
  if (isHebrew(bt.slice(-1))) return "romanization";
  if ([...g].some(isHebrew)) return "hebrew_word";
  if (/[\p{Script=Greek}\p{Script=Arabic}]$/u.test(bt)) return "other_script";
  if (at === "" || at === ".") return "ends_text";
  return "in_text";
}
const lettersBefore = (s) => /\p{L}*$/u.exec(s)[0];
const spellingRound = (c) => /[\p{L}\/]*$/u.exec(c.before)[0] + "/" + /^[\p{L}\/]*/u.exec(c.after)[0];
const isLetterOrDigit = (ch) => ch !== undefined && ch !== "" && /[\p{L}\p{N}]/u.test(ch);

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
