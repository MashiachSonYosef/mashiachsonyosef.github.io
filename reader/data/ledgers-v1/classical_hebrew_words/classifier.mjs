// classical_hebrew_words.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.in_unbalanced_text", mark: ",", divides: false, test: (c) => unbalanced(c.text) },
  { id: "comma.in_round_bracket", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.in_square_bracket", mark: ",", divides: false, test: (c) => c.container === "bracket" },
  { id: "comma.in_a_text_with_a_comma_at_its_edge", mark: ",", divides: false, test: (c) => c.text.startsWith(",") || c.text.endsWith(",") },
  { id: "comma.before_a_restatement", mark: ",", divides: false, test: (c) => c.after.startsWith(" i.e. ") },
  { id: "comma.inside_a_remark", mark: ",", divides: false, test: (c) => REMARK_TEXTS.includes(c.text) },
  { id: "comma.between_a_name_and_its_description", mark: ",", divides: false, test: (c) => NAME_AND_DESCRIPTION_TEXTS.includes(c.text) },
  { id: "comma.before_words_that_lean", mark: ",", divides: false, test: (c) => LEANING_LIST_TEXTS.includes(c.text) },
  { id: "comma.between_two_names", mark: ",", divides: false, test: (c) => TWO_NAMES_TEXTS.includes(c.text) },
  { id: "comma.beside_a_bracket_or_tag_on_the_list", mark: ",", divides: false, test: (c) => TAGGED_LIST_TEXTS.includes(c.text) },
  { id: "comma.between_words_with_their_own_signs", mark: ",", divides: false, test: (c) => LIST_WITH_SIGNS_TEXTS.includes(c.text) || c.text.startsWith("panakes (a plant) or its resin,") },
  { id: "comma.between_plain_words", mark: ",", divides: false, test: (c) => /^[\p{L} ,\-']+$/u.test(c.text) },
  { id: "period.in_unbalanced_text", mark: ".", divides: false, test: (c) => unbalanced(c.text) },
  { id: "period.between_two_words", mark: ".", divides: false, test: (c) => STOP_BETWEEN_WORDS_TEXTS.includes(c.text) },
  { id: "period.in_a_row_that_names_the_full_word", mark: ".", divides: false, test: (c) => c.text.startsWith("abbrev. of") || c.text.startsWith("abbrev. for") },
  { id: "period.in_a_row_that_is_a_note", mark: ".", divides: false, test: (c) => NOTE_ONLY_TEXTS.includes(c.text) },
  { id: "period.closes_the_last_word_of_a_list", mark: ".", divides: false, test: (c) => c.text === "bake, make cakes." },
  { id: "period.in_a_verse_number", mark: ".", divides: false, test: (c) => /\p{N}$/u.test(c.before) && /^\p{N}/u.test(c.after) },
  { id: "period.closes_an_abbreviation", mark: ".", divides: false, test: (c) => true },
  { id: "slash.in_unbalanced_text", mark: "/", divides: false, test: (c) => unbalanced(c.text) },
  { id: "slash.between_two_renderings", mark: "/", divides: false, test: (c) => c.text === "be light / be bright" },
  { id: "slash.between_two_editions", mark: "/", divides: false, test: (c) => SLASH_EDITION_TEXTS.includes(c.text) },
  { id: "slash.in_round_bracket", mark: "/", divides: false, test: (c) => c.container === "paren" },
  { id: "slash.before_a_citation_or_remark", mark: "/", divides: false, test: (c) => true },
  { id: "question_mark.in_unbalanced_text", mark: "?", divides: false, test: (c) => unbalanced(c.text) },
  { id: "question_mark.between_two_guesses", mark: "?", divides: false, test: (c) => GUESS_SERIES_TEXTS.includes(c.text) && !c.before.includes("?") },
  { id: "question_mark.closes_the_last_guess", mark: "?", divides: false, test: (c) => GUESS_SERIES_TEXTS.includes(c.text) },
  { id: "question_mark.closes_a_question", mark: "?", divides: false, test: (c) => QUESTION_TEXTS.includes(c.text) },
  { id: "question_mark.doubt_in_round_bracket", mark: "?", divides: false, test: (c) => c.container === "paren" },
  { id: "question_mark.in_square_bracket", mark: "?", divides: false, test: (c) => c.container === "bracket" },
  { id: "exclamation.closes_a_cry", mark: "!", divides: false, test: (c) => c.container === "top" },
  { id: "exclamation.in_square_bracket", mark: "!", divides: false, test: (c) => c.container === "bracket" },
  { id: "exclamation.in_round_bracket", mark: "!", divides: false, test: (c) => c.container === "paren" },
  { id: "hyphen.in_a_row_that_is_a_note", mark: "-", divides: false, test: (c) => NOTE_ONLY_TEXTS.includes(c.text) },
  { id: "hyphen.joins_a_compound", mark: "-", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^\p{L}/u.test(c.after) },
  { id: "hyphen.beside_a_bracket_or_a_space", mark: "-", divides: false, test: (c) => true },
  { id: "open_paren.never_closed", mark: "(", divides: false, test: (c) => c.group === null },
  { id: "close_paren.never_opened", mark: ")", divides: false, test: (c) => c.group === "" && !c.before.endsWith("(") },
  { id: "open_paren.inside_a_round_bracket", mark: "(", divides: false, test: (c) => c.container === "paren" },
  { id: "close_paren.inside_a_round_bracket", mark: ")", divides: false, test: (c) => c.container === "paren" },
  { id: "open_paren.label_for_a_kind_of_name", mark: "(", divides: false, test: (c) => NAME_KIND_LABELS.includes(c.group) },
  { id: "close_paren.label_for_a_kind_of_name", mark: ")", divides: false, test: (c) => NAME_KIND_LABELS.includes(c.group) },
  { id: "open_paren.label_for_sex_or_number", mark: "(", divides: false, test: (c) => SEX_AND_NUMBER_LABELS.includes(c.group) },
  { id: "close_paren.label_for_sex_or_number", mark: ")", divides: false, test: (c) => SEX_AND_NUMBER_LABELS.includes(c.group) },
  { id: "open_paren.doubt", mark: "(", divides: false, test: (c) => c.group === "?" },
  { id: "close_paren.doubt", mark: ")", divides: false, test: (c) => c.group === "?" },
  { id: "open_paren.section_number", mark: "(", divides: false, test: (c) => c.group.includes("§") },
  { id: "close_paren.section_number", mark: ")", divides: false, test: (c) => c.group.includes("§") },
  { id: "open_paren.label_for_a_stem_or_word_class", mark: "(", divides: false, test: (c) => GRAMMAR_LABELS.includes(c.group) },
  { id: "close_paren.label_for_a_stem_or_word_class", mark: ")", divides: false, test: (c) => GRAMMAR_LABELS.includes(c.group) },
  { id: "open_paren.citation", mark: "(", divides: false, test: (c) => REFERENCE_CONTENTS.includes(c.group) },
  { id: "close_paren.citation", mark: ")", divides: false, test: (c) => REFERENCE_CONTENTS.includes(c.group) },
  { id: "open_paren.editors_remark", mark: "(", divides: false, test: (c) => ROUND_BRACKET_REMARKS.includes(c.group) },
  { id: "close_paren.editors_remark", mark: ")", divides: false, test: (c) => ROUND_BRACKET_REMARKS.includes(c.group) },
  { id: "open_paren.part_of_a_word", mark: "(", divides: false, test: (c) => /\p{L}$/u.test(pairLeft(c)) || /^\p{L}/u.test(pairRight(c)) },
  { id: "close_paren.part_of_a_word", mark: ")", divides: false, test: (c) => /\p{L}$/u.test(pairLeft(c)) || /^\p{L}/u.test(pairRight(c)) },
  { id: "open_paren.any_other", mark: "(", divides: false, test: (c) => true },
  { id: "close_paren.any_other", mark: ")", divides: false, test: (c) => true },
  { id: "open_bracket.in_unbalanced_text", mark: "[", divides: false, test: (c) => unbalanced(c.text) },
  { id: "close_bracket.in_unbalanced_text", mark: "]", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_bracket.whole_row_names_the_full_word", mark: "[", divides: false, test: (c) => pairLeft(c) === "" && pairRight(c) === "" && c.group.startsWith("abbreviation of") },
  { id: "close_bracket.whole_row_names_the_full_word", mark: "]", divides: false, test: (c) => pairLeft(c) === "" && pairRight(c) === "" && c.group.startsWith("abbreviation of") },
  { id: "open_bracket.whole_row_is_a_label", mark: "[", divides: false, test: (c) => pairLeft(c) === "" && pairRight(c) === "" },
  { id: "close_bracket.whole_row_is_a_label", mark: "]", divides: false, test: (c) => pairLeft(c) === "" && pairRight(c) === "" },
  { id: "open_bracket.inside_a_round_bracket", mark: "[", divides: false, test: (c) => c.container === "paren" },
  { id: "close_bracket.inside_a_round_bracket", mark: "]", divides: false, test: (c) => c.container === "paren" },
  { id: "open_bracket.part_of_a_word", mark: "[", divides: false, test: (c) => /\p{L}$/u.test(pairLeft(c)) },
  { id: "close_bracket.part_of_a_word", mark: "]", divides: false, test: (c) => /\p{L}$/u.test(pairLeft(c)) },
  { id: "open_bracket.editors_doubt", mark: "[", divides: false, test: (c) => /^[?!]/u.test(c.group) },
  { id: "close_bracket.editors_doubt", mark: "]", divides: false, test: (c) => /^[?!]/u.test(c.group) },
  { id: "open_bracket.note_on_the_edition", mark: "[", divides: false, test: (c) => c.group.includes("DCH") || c.group.startsWith("GRD") },
  { id: "close_bracket.note_on_the_edition", mark: "]", divides: false, test: (c) => c.group.includes("DCH") || c.group.startsWith("GRD") },
  { id: "open_bracket.editors_query", mark: "[", divides: false, test: (c) => EDITOR_QUERIES.includes(c.group) },
  { id: "close_bracket.editors_query", mark: "]", divides: false, test: (c) => EDITOR_QUERIES.includes(c.group) },
  { id: "open_bracket.label_for_a_kind_of_word", mark: "[", divides: false, test: (c) => SQUARE_BRACKET_LABELS.includes(c.group) },
  { id: "close_bracket.label_for_a_kind_of_word", mark: "]", divides: false, test: (c) => SQUARE_BRACKET_LABELS.includes(c.group) },
  { id: "open_bracket.any_other", mark: "[", divides: false, test: (c) => true },
  { id: "close_bracket.any_other", mark: "]", divides: false, test: (c) => true },
  { id: "open_angle.in_font_keystrokes", mark: "<", divides: false, test: (c) => c.text.includes("$$") },
  { id: "close_angle.before_the_revised_edition", mark: ">", divides: false, test: (c) => c.after.startsWith(" DCHR") },
  { id: "open_brace.typed_for_a_square_bracket", mark: "{", divides: false, test: (c) => c.group === null },
  { id: "close_brace.in_font_keystrokes", mark: "}", divides: false, test: (c) => c.container === "paren" },
  { id: "close_brace.typed_for_another_closer", mark: "}", divides: false, test: (c) => c.container === "top" },
  { id: "dollar_sign.marks_font_keystrokes", mark: "$", divides: false, test: (c) => true },
  { id: "section_sign.opens_a_section_number", mark: "§", divides: false, test: (c) => true },
  { id: "degree_sign.beside_a_number", mark: "°", divides: false, test: (c) => c.container === "bracket" },
  { id: "degree_sign.marks_font_keystrokes", mark: "°", divides: false, test: (c) => true },
  { id: "low_line.around_a_word", mark: "_", divides: false, test: (c) => true },
  { id: "equals.says_the_same_as", mark: "=", divides: false, test: (c) => true },
  { id: "asterisk.in_a_section_number", mark: "*", divides: false, test: (c) => c.container === "paren" },
  { id: "asterisk.in_a_transliteration", mark: "*", divides: false, test: (c) => c.container === "top" },
  { id: "apostrophe.in_a_possessive", mark: "'", divides: false, test: (c) => true },
  { id: "right_single_quotation_mark.in_a_possessive", mark: "’", divides: false, test: (c) => /\p{L}$/u.test(c.before) && /^s(?!\p{L})/u.test(c.after) },
  { id: "right_single_quotation_mark.closes_a_quote", mark: "’", divides: false, test: (c) => c.container === "top" },
  { id: "right_single_quotation_mark.in_a_transliteration", mark: "’", divides: false, test: (c) => c.container === "paren" },
  { id: "left_single_quotation_mark.opens_a_quote", mark: "‘", divides: false, test: (c) => c.container === "top" },
  { id: "left_single_quotation_mark.in_a_transliteration", mark: "‘", divides: false, test: (c) => true },
  { id: "quote.in_font_keystrokes", mark: "\"", divides: false, test: (c) => c.text.includes("$$") },
  { id: "quote.around_a_word", mark: "\"", divides: false, test: (c) => c.container === "bracket" },
  { id: "acute_accent.in_a_transliteration", mark: "´", divides: false, test: (c) => true },
  { id: "macron.in_a_transliteration", mark: "¯", divides: false, test: (c) => true },
  { id: "ampersand.in_initials", mark: "&", divides: false, test: (c) => true },
];

// ---- the ask's own helper for rule 3 (ASK v1.1, rule 3), copied byte for byte ----
function unbalanced(text) {
  const st = [];
  for (const ch of text) {
    if (OPEN[ch]) st.push(ch);
    else if (CLOSE[ch]) { if (st.length && st[st.length - 1] === CLOSE[ch]) st.pop(); else return true; }
  }
  return st.length > 0;
}

// ---- helpers of fragment ledger ----
// the pair's two sides (pair_sides): for an opener the left side is the text before it and the right side what follows its partner; for a closer the other way round
function pairLeft(c) { return OPEN[c.mark] ? c.before : c.before.slice(0, c.before.length - c.group.length - 1); }
function pairRight(c) { return OPEN[c.mark] ? c.after.slice(c.group.length + 1) : c.after; }
const REMARK_TEXTS = ["hey! cry of drunken reveller, echoing °ayqi° _vomit_","guard-house DCH / DCHR I, not II"];
const NAME_AND_DESCRIPTION_TEXTS = ["Mercury, the planet","Sheol, underworld","Death, place of death","Shaddai, Almighty (One)","Meni (Destiny), divine name"];
const LEANING_LIST_TEXTS = ["be ugly, displeasing","be dark, dim","be presumptuous, reckless","consecrated one, place, thing","one counted, numbered, registered, enrolled","forsaken, abandoned woman","be anxious, agitated","be reasonable, careful","one who is called, elected","be wicked, deceiving","move rapdily, unsteadily","one who insults, taunts","be disdainful, ungrateful","one who allows oneself to be advised, seeks advice","furnish with cushions, pillows","sandy, stony plateau","banished, strayed female","be prudent, thoughtful","be strong, heavy","be high, conspicuous","be dry, desolate","one stricken, plagued","one who leads back, repels, restores","one who holds, wields","that which is formed, created","go between, among","crushed, contrite one","trustworthy, faithful one","oppressing, violent man","so much, then for!","abandoned, deserted place(s)","keeper of granary, warehouse"];
const TWO_NAMES_TEXTS = ["Shebna, Shebnah","Jeshua, Joshua","Madai, Media","Shebuel, Shubael","Saul, Shaul","No, Thebes","Shelomzion, Salome","Gebal, Byblos","Kain, Kenites","Samuel, Shemuel","Sin, Pelusium","Aija, Ayyah","Hosea, Hoshea","Omenon, Amana","Tigris, Hiddekel","Raphael, Rephael","Sikkuth, Sakkuth","Eliasaph, Eljasaph","Iyim, Iim","Enoch, Hanoch (pr.n.)"];
const TAGGED_LIST_TEXTS = ["melt, refine (byform of ssm melt)","swoop, stoop (of bird of prey)","sink, cast (lot)","(male) official, steward","(double-pronged) hooks, pegs","touch, strike (lyre)","drop, distil [°1]","press, importune [???]","(female) dweller, inhabitant","(female) official, attendant","(female) ruler, tyrant","(male) perfumer, apothecary","htp. withdraw, retire","pour, pay out (a rope)","watch over, be watchful [NOT IN DCHR YET]","HI. withdraw, remove, save","(object of) whispering, derision","provisions, sustenance (for journey)","throat, neck [not temple]","rule, authority [DCHR writing]","leader, noble [as DCHR, but \"noble\" deleted in A&C]","(legal) opponent, adversary","weak one, sick one (fem.)","indeed, verily [emphatic]","(female) gatekeeper, porter","loaf, slice (of bread)","shock, stook (of grain)","(female) delicate one, pampered one","thin, emaciated [prev. II]","(military) ofﬁcer, commander","(civil) ofﬁcer, ofﬁcial, administrator","release, theft [DCHR release, letting out]","decree, command [infixed -t-]","comber, carder (masc.)","loins, testicles [??]","one sprouting, one budding (fem.)","flying one, bird (fem.)","holder, wielder (of staff)","leading man, noble [DCHR just leader]","maltreat, destroy DCH","be addicted to, be devoted to, cling to DCHR","DCH settlement, transportation"];
const LIST_WITH_SIGNS_TEXTS = ["in, at, by (means of)","one who hides oneself (craftily), dissembler, hypocrit","buy, buy (food)","bud(s), blossom(s)","fourth part, (four) sides","be a potter, perh. scrape an unfired pot","bake, make cakes.","gnawing pain, or perh. sinew","shouting (noun), thunder","exile(s), diaspora","worm(s), maggot(s)","mighty flame, flame of Y.","piece(s), joint","shake, stir. worry (of an animal with its prey)","hated one (fem.), unloved one (fem.)","crushed (one), oppressed (one)","(wet-)nurse, nursemaid","dry wood, perh. driftwood","source (of waters), fountain","(fore)court, porch","seller, (?) purchaser","fir tree, timber of a fir tree, perh. pine","lack (of words), speechlessness","bad (thing), evil","dominion, (landed) property","commander’s staff, sceptre","wing (of a porch), door post","listen!, take heed!","survivor(s), refugee(s)","that which is left over, remaining (one), residue","anointed one, ‘messiah’","archer, one who draws (bow)"];
const STOP_BETWEEN_WORDS_TEXTS = ["murderer. slayer","foundation. beginning","shake, stir. worry (of an animal with its prey)","woe!. alas!"];
const NOTE_ONLY_TEXTS = ["interrog. part.","object-marker"];
const SLASH_EDITION_TEXTS = ["tamarisk DCH / [DCHR juniper]","Neehebeth DCHR / DCH Nahabath"];
const QUESTION_TEXTS = ["where?","is?","how?","is it not?"];
const GUESS_SERIES_TEXTS = ["messenger? refuter? etc"];
const NAME_KIND_LABELS = ["pr.n.","pl.n.","pl..n.","pr.n.f.","pr.n.m.","pr.n.div.","deity","a deity","divine name","name of a constellation","territory"];
const SEX_AND_NUMBER_LABELS = ["m.","f.","masc.","fem.","male","female","masc,","fem. sg.","masc. sg.","masc. pl.","fem. pl."];
const GRAMMAR_LABELS = ["qal","pi.","ni.","n.","noun","pl.","as prep.","plur. as coll."];
const REFERENCE_CONTENTS = ["Is 30.15","Ps 42.9","Ps 89.10","s.v. rz‘ba"];
const ROUND_BRACKET_REMARKS = ["> DCHR","to be deleted","error","!","DCHR (wet-)nurse","byform of ssm melt","byform of srb","perh. shaphel of ns´’ / lift up","cf. Arab. ’âda press down, incline, come on [of evening]","5x, neder 20x","not blaspheme","not wine skin"];
const EDITOR_QUERIES = ["ORDER!","CHECK HOM NO.","SOURCE?","IS THIS DIFF FROM I?"];
const SQUARE_BRACKET_LABELS = ["emphatic","enclitic","vocative","asseverative","affirmative particle","pr.n.","pl.n.","infixed -t-"];

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
