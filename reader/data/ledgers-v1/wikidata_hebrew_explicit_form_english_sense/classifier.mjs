// wikidata_hebrew_explicit_form_english_sense.classifier.mjs · made from classifier-template-v1 under ask v1.1
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
  { id: "comma.between_words_for_one_sense", mark: ",", divides: false, test: (c) => ONE_SENSE_COMMA_TEXTS.includes(c.text) },
  { id: "comma.marked_between_a_word_and_a_second_wording", mark: ",", divides: false, test: (c) => ONE_SENSE_MARKED_COMMAS.some((e) => { const [a, b] = e.split(","); return c.before === a && (c.after === b || c.after.startsWith(b + ";")); }) },
  { id: "comma.marked_beside_a_tail_or_a_bracket", mark: ",", divides: false, test: (c) => MARKED_COMMAS.some((e) => { const [a, b] = e.split(","); return c.before.endsWith(a) && c.after.startsWith(b); }) },
  { id: "comma.between_two_descriptions", mark: ",", divides: false, test: (c) => SECOND_DESCRIPTION_OPENINGS.some((x) => c.after.startsWith(x)) },
  { id: "comma.inside_one_phrase", mark: ",", divides: false, test: (c) => PHRASE_OPENINGS.some((x) => c.text.startsWith(x)) },
  { id: "comma.inside_round_brackets", mark: ",", divides: false, test: (c) => c.container === "paren" },
  { id: "comma.after_the_head_word", mark: ",", divides: false, test: (c) => !c.before.includes(",") },
  { id: "comma.inside_a_description", mark: ",", divides: false, test: () => true },
  { id: "semicolon.between_words_for_one_sense", mark: ";", divides: false, test: (c) => ONE_SENSE_SEMICOLON_TEXTS.includes(c.text) },
  { id: "semicolon.between_two_descriptions", mark: ";", divides: false, test: (c) => TWO_DESCRIPTION_OPENINGS.some((x) => c.text.startsWith(x)) && !c.after.startsWith(" specifically") },
  { id: "semicolon.in_a_row_that_only_describes", mark: ";", divides: false, test: (c) => DESCRIBING_ROW_OPENINGS.some((x) => c.text.startsWith(x)) },
  { id: "semicolon.before_a_remark", mark: ";", divides: false, test: () => true },
  { id: "slash.around_a_sound", mark: "/", divides: false, test: (c) => c.container === "paren" && c.text.includes("/i/") },
  { id: "slash.inside_round_brackets", mark: "/", divides: false, test: (c) => c.container === "paren" },
  { id: "slash.between_words_beside_a_bracket", mark: "/", divides: false, test: (c) => c.text.includes("(") },
  { id: "slash.after_to_be", mark: "/", divides: false, test: (c) => c.text.startsWith("to be ") },
  { id: "slash.after_to", mark: "/", divides: false, test: (c) => c.text.startsWith("to ") },
  { id: "slash.between_forms_of_one_verb", mark: "/", divides: false, test: (c) => c.text === "is/was/will be tortured" },
  { id: "slash.between_words_that_lean", mark: "/", divides: false, test: (c) => LEANING_SLASH_TEXTS.includes(c.text) },
  { id: "slash.between_words_for_one_sense", mark: "/", divides: false, test: (c) => ONE_SENSE_SLASH_TEXTS.includes(c.text) },
  { id: "slash.inside_a_number", mark: "/", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "slash.in_and_or", mark: "/", divides: false, test: (c) => c.before.endsWith("and") && c.after.startsWith("or") },
  { id: "slash.inside_a_description", mark: "/", divides: false, test: (c) => c.text === "acorn, fruit/nut of the oak tree" },
  { id: "open_paren.in_unbalanced_text", mark: "(", divides: false, test: (c) => unbalanced(c.text) },
  { id: "open_paren.holds_the_whole_row", mark: "(", divides: false, test: (c) => beforePair(c) === "" && afterPair(c) === "" },
  { id: "close_paren.holds_the_whole_row", mark: ")", divides: false, test: (c) => beforePair(c) === "" && afterPair(c) === "" },
  { id: "open_paren.holds_letters_of_one_word", mark: "(", divides: false, test: (c) => isLetter(beforePair(c).slice(-1)) || isLetter(afterPair(c)[0]) },
  { id: "close_paren.holds_letters_of_one_word", mark: ")", divides: false, test: (c) => isLetter(beforePair(c).slice(-1)) || isLetter(afterPair(c)[0]) },
  { id: "open_paren.holds_a_qualifier_before_the_word", mark: "(", divides: false, test: (c) => beforePair(c) === "" },
  { id: "close_paren.holds_a_qualifier_before_the_word", mark: ")", divides: false, test: (c) => beforePair(c) === "" },
  { id: "open_paren.holds_a_name_after_its_label", mark: "(", divides: false, test: (c) => beforePair(c) === "given name " },
  { id: "close_paren.holds_a_name_after_its_label", mark: ")", divides: false, test: (c) => beforePair(c) === "given name " },
  { id: "open_paren.holds_a_pointer_to_another_item", mark: "(", divides: false, test: (c) => /Q[0-9]/u.test(c.group) },
  { id: "close_paren.holds_a_pointer_to_another_item", mark: ")", divides: false, test: (c) => /Q[0-9]/u.test(c.group) },
  { id: "open_paren.holds_a_place_in_scripture", mark: "(", divides: false, test: (c) => /[0-9]:[0-9]/u.test(c.group) },
  { id: "close_paren.holds_a_place_in_scripture", mark: ")", divides: false, test: (c) => /[0-9]:[0-9]/u.test(c.group) },
  { id: "open_paren.holds_an_example_or_a_use", mark: "(", divides: false, test: (c) => EXAMPLE_OPENERS.some((x) => c.group.startsWith(x)) },
  { id: "close_paren.holds_an_example_or_a_use", mark: ")", divides: false, test: (c) => EXAMPLE_OPENERS.some((x) => c.group.startsWith(x)) },
  { id: "open_paren.holds_an_aside_inside_a_description", mark: "(", divides: false, test: (c) => beforePair(c).includes(",") },
  { id: "close_paren.holds_an_aside_inside_a_description", mark: ")", divides: false, test: (c) => beforePair(c).includes(",") },
  { id: "open_paren.holds_a_note_on_the_word_before", mark: "(", divides: false, test: () => true },
  { id: "close_paren.holds_a_note_on_the_word_before", mark: ")", divides: false, test: () => true },
  { id: "period.in_the_letters_e_g", mark: ".", divides: false, test: (c) => (c.before.endsWith("e") && c.after.startsWith("g.")) || c.before.endsWith("e.g") },
  { id: "period.after_etc", mark: ".", divides: false, test: (c) => c.before.endsWith("etc") },
  { id: "period.after_a_shortened_word", mark: ".", divides: false, test: (c) => SHORTENED_WORDS.includes(/\p{L}*$/u.exec(c.before)[0]) },
  { id: "period.inside_a_number", mark: ".", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "period.in_three_dots", mark: ".", divides: false, test: (c) => c.after.startsWith(".") || c.before.endsWith(".") },
  { id: "period.ends_the_text", mark: ".", divides: false, test: (c) => c.after === "" },
  { id: "hyphen.with_a_space_on_each_side", mark: "-", divides: false, test: (c) => c.before.endsWith(" ") && c.after.startsWith(" ") },
  { id: "hyphen.joins_the_parts_of_a_word", mark: "-", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.before_the_letter_s", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && c.after.startsWith("s") && !isLetter(c.after[1]) },
  { id: "apostrophe.inside_a_name", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.opens_a_quoted_word", mark: "'", divides: false, test: (c) => !isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
  { id: "apostrophe.closes_a_quoted_word", mark: "'", divides: false, test: (c) => isLetter(c.before.slice(-1)) && !isLetter(c.after[0]) },
  { id: "right_single_quotation_mark.before_the_letter_s", mark: "\u2019", divides: false, test: (c) => c.after.startsWith("s") },
  { id: "right_single_quotation_mark.ends_a_name", mark: "\u2019", divides: false, test: (c) => c.after.startsWith(",") },
  { id: "quote.opens_a_quoted_phrase", mark: "\"", divides: false, test: (c) => (c.before.match(/"/gu) || []).length % 2 === 0 },
  { id: "quote.closes_a_quoted_phrase", mark: "\"", divides: false, test: (c) => (c.before.match(/"/gu) || []).length % 2 === 1 },
  { id: "left_double_quotation_mark.opens_what_a_name_means", mark: "\u201C", divides: false, test: (c) => c.before === "" },
  { id: "right_double_quotation_mark.closes_what_a_name_means", mark: "\u201D", divides: false, test: (c) => c.after.startsWith(";") },
  { id: "colon.between_a_word_and_its_description", mark: ":", divides: false, test: (c) => c.after.startsWith(" ") },
  { id: "colon.between_chapter_and_verse", mark: ":", divides: false, test: (c) => isDigit(c.before.slice(-1)) && isDigit(c.after[0]) },
  { id: "exclamation.after_a_cry", mark: "!", divides: false, test: (c) => c.after.startsWith("/") || c.after === "" },
  { id: "times.before_a_hybrid_name", mark: "\u00D7", divides: false, test: (c) => isLetter(c.after[0]) },
  { id: "union.names_a_sign_of_set_theory", mark: "\u222A", divides: false, test: (c) => c.before.endsWith("denoted by ") },
  { id: "em_dash.around_an_aside", mark: "\u2014", divides: false, test: (c) => isLetter(c.before.slice(-1)) && isLetter(c.after[0]) },
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
const isLetter = (ch) => ch !== undefined && /\p{L}/u.test(ch);
const isDigit = (ch) => ch !== undefined && /[0-9]/u.test(ch);
const beforePair = (c) => c.mark === "(" ? c.before : c.before.slice(0, c.before.length - c.group.length - 1);
const afterPair = (c) => c.mark === "(" ? c.after.slice(c.group.length + 1) : c.after;
const ONE_SENSE_COMMA_TEXTS = ["Salvation, freeing someone, redemption","a writing, something written","alive, living","arrogance, audacity, chutzpah","attempt to kill someone, assassination","cadaver, dead body","celebration, special social event, party","chaos, mess","comparable, similar","complete, intact","credit, loan","deity, natural or supernatural god or goddess, divine being","ditch, indentation","ebb, low tide","evil, wickedness","fee, premium","fitting, proper, suitable","forgiving, lenient","glorious, splendid","goy, non-Jew","hate speech, hateful statements","hell, perdition","high level person, executive","hostility, enmity, hatred","in, inside","isolationism, separatism","loved one, significant other","order, command, instruction","person, human, man","power, ability, strength","present, gift","prod, encourage","request, application","saying, speach","stub, shred","the act of distinguishing, separation","thus; so, such; in that way","to guard, to protect","treatment, medical treatment","undershirt, tank top","valuable, prized","weighty, influential"];
const ONE_SENSE_MARKED_COMMAS = ["nation, ethnic group","stone, rock","wardrobe, storage cabinet","rehearsal, practice performance","bank, edge of river","kashrut, Jewish dietary laws","tahini, sesame seeds paste","hello, salutation or greeting","woman, female adult human","man, male adult human","sow, female pig","husband, male spouse","brother, male sibling","sister, female sibling","father, male parent","son, male offspring","daughter, female offspring","chick, young bird","herd, group of animals","archipelago, group of islands","darkness, lack of light","biology, study of life","fatherhood, being a father","Legalization, making somethin legal"];
const ONE_SENSE_SEMICOLON_TEXTS = ["cereal; grain","round frame used in transportation; wheel","thus; so, such; in that way","to communicate something by speech; to say"];
const ONE_SENSE_SLASH_TEXTS = ["about/with regard to/concerning","accessory/apparatus","according to/per","actually/as a matter of fact","alas!/woe!","ancient/prehistoric","big/large","bookkeeping/accounting","central/middle","chief/main/head/primary","closed/sealed","come on/let's go/hurry up","cream/ointment","crisp/brittle","discovery/revelation","duty/obligation","evil/malicious","exact/precise","excessive/extra/redundant","exterior/external","fast/quick","fattened/overfed","festivity/holiday spirit","glory/splendor/magnificence","glued/attached/connected","grinder/sharpener","ground/crushed","huge/enormous/vast","industry/manufacturing","intermediate/middle","joining/connection/combination","justice/righteousness","majesty/glory","manifest/obvious","mourning/grieving","of/pertaining to","partition/barrier","popular/common/folk","present/gift","pure/perfect","purpose/aim/objective","raised/built-up","rear/posterior","relation/association","righteous/true","robe/mantle","salvation/help/rescue","similar to/like","small/tiny","smoky/smoking","so much/very much","sown/seeded","spring chicken/pullet","strong/powerful","test/exam","this/that","trouble/a calamity","upper/higher","walking/marching","weak/exhausted","youth/juvenescence"];
const LEANING_SLASH_TEXTS = ["body that performs administration/management","evil/bad thing","evil/depraved person","one who is poor/needy","seized/taken by/suffering from","someone who is crippled/disabled/invalid","something fruitless/futile/yielding no benefit"];
const MARKED_COMMAS = ["of plant, citron","of plants, the mandrakes","real-time, unedited","construction worker, tradesman","tradesman, labourer","labourer, or professional","tubercle, round nodule","round nodule, small eminence","small eminence, or warty","writing system, alphabet","alphabet, character set","detective, investigator"];
const SECOND_DESCRIPTION_OPENINGS = [" single representation of"," formal type of literature"," the side opposite of"," a circular item that"," unique extant species"," or the manner in which"," or the mental processes"," quartz variety"," mineral, gemstone"," gemstone"];
const PHRASE_OPENINGS = ["Biblical name; an Edomite,","a juvenile mammal, e.g.","culture, sports,","director of film,","historical name of land","large, flat bowl","the set of books"];
const TWO_DESCRIPTION_OPENINGS = ["apathy, state of indifference","ash, waste product of fire;","cylinder, surface formed","daughter, female offspring;","ear, organ that detects sound;","gold, chemical element with symbol","jaw, opposable articulated","landmass, contiguous area","mathematical expression, combination","occurrence, occurrence of a fact","organism, any contiguous","pulley, simple machine;","ruler, instrument used","son, male offspring;","stone, rock;","text, object that can be","thigh, area between","venom, form of toxin","writing, representation of language"];
const DESCRIBING_ROW_OPENINGS = ["Biblical name; ","the country of Job;","\u201Cwhom Jehovah heals\u201D;"];
const EXAMPLE_OPENERS = ["e.g. ","such as ","as "];
const SHORTENED_WORDS = ["adj","subg"];

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
