// The division declared for kaikki_wiktionary_hebrew (M13, M25, M11, M69, M50),
// as code: the provider's closed word lists, every mark's shapes in order,
// and parse(route) -> { occ: Map(index -> shape id), readings, rejoins, ... }.
// Imported by ledger.mjs; nothing here reads or writes a file.

// ---- character classes ---------------------------------------------------
const isMark = (c) => !/[\p{L}\p{N}\s]/u.test(c);
const HEB_LETTER = /[א-תװ-ײ]/;
const HEB_POINT = /[֑-ׇֽֿׁׂׅׄ]/;
const isHebLetter = (c) => HEB_LETTER.test(c || "");
const isHebPoint = (c) => HEB_POINT.test(c || "");
const isHeb = (c) => isHebLetter(c) || isHebPoint(c) || c === "־" || c === "׳" || c === "״";
const isLatin = (c) => /\p{Script=Latin}/u.test(c || "");
const isLetter = (c) => /\p{L}/u.test(c || "");
const isDigit = (c) => /\p{N}/u.test(c || "");
const isSpace = (c) => /\s/.test(c || "");

// ---- the provider's closed word lists (read from this provider's text) ---
// A comma whose next piece opens with one of these (and runs two words or
// more) is inside a sentence: what follows qualifies what came before.
export const ALWAYS = new Set(("especially particularly specifically notably chiefly mainly mostly primarily principally generally typically usually often " +
  "sometimes commonly normally frequently occasionally rarely traditionally collectively originally formerly literally figuratively " +
  "such e.g i.e eg ie viz cf esp including excluding except used indicating equivalent corresponding referring said known also namely " +
  "see representing meaning denoting relating consisting containing involving describing expressing signifying transliterated identified translated anglicized").split(" "));
export const SERIAL = new Set(["or", "and", "nor", "but"]);
export const ETC = new Set(["etc", "etcetera", "et"]);
// A piece opening with one of these relative or comparative words attaches
// a clause to the gloss before it ("A destination, as of a voyage"; "a dryer,
// like a hair dryer"; "a male given name, Aziz, from Arabic"). Bare
// prepositions are not on the list: in this provider "patiently, with
// patience", "certainly, for sure" and "bad, of poor quality" are glosses.
export const FUNCTION = new Set(("as like that which who whom whose where when while whereas whether although though unless rather hence thus " +
  "therefore than from about so").split(" "));
const PREPOSITIONS = "in on at by for with without of after before under over into onto upon through toward towards against among between within " +
  "around near behind beyond during since until till unto according next due regarding concerning via per because if";
// A list whose first piece opens on one of these is a list of function-word
// glosses ("excluding, except for"; "et cetera, and the like"; "rather, but,
// but rather"), and an opener inside it is one more gloss, not a clause.
export const FUNCTION_FIRST = new Set([...FUNCTION, ...ALWAYS, ...SERIAL, ...ETC, ...PREPOSITIONS.split(" "), ..."not no just only very more most less least even still already yet here there now again once how what whatever whoever".split(" ")]);
// A first piece that is one of these is a label over what follows it.
export const LABELS = new Set(("figuratively literally specifically especially particularly generally usually often also hence thus colloquially informally " +
  "formally slang rarely formerly originally euphemistically metaphorically idiomatically mostly chiefly mainly broadly loosely strictly technically " +
  "now nowadays today").split(" ").concat(["in particular", "by extension", "by implication", "that is", "for example", "in full", "i.e", "e.g",
  "in general", "in other words", "in the plural", "in plural", "by metonymy", "by analogy"]));
const PRONOUNS = new Set("this it he she they we you i these those".split(" "));
// A list whose earlier pieces end on a preposition and whose last piece carries
// the object writes that object once for all of them: "of, pertaining to, or
// being the descendants of Jacob". The earlier pieces are not readings alone.
const END_PREP = new Set("of to from with for in on at by about into onto upon toward towards against over under after".split(" "));
const LABEL1 = new Set("figuratively literally specifically especially particularly also colloquially informally formally euphemistically metaphorically idiomatically hence thus".split(" "));
export const NOTE_START = /^(used\b|see\b|said of\b|indicating\b|also\b|compare\b|cf\.|for example\b|in full\b|it\b|this\b|located\b|further\b|as opposed to\b|possibilities include\b|\(see\b)/i;
export const ABBREV = new Set(("etc esp cf viz vs st no num mrs ms mr dr min lit expl approx ca c r al f m n pl sg v adj abbr ed vol p pp fig jr sr mt co inc ltd " +
  "ft oz lb km cm kg sq ibid op cit var def sing masc fem obs arch dial lat gr heb eng").split(" "));
const ARG_SLOT = /^(?:(?:to|of|with|for|at|on|in|from|into|by|upon|against) )?(?:someone|something|somebody|a person|one|oneself|someone or something|something or someone|something else|someone else|a thing|an object|people)$/i;
// a group holding only a subject pronoun, or the rendering of the prefixed conjunction, in a verb-form gloss: (he/it) went, (And) (she/it) brought
export const SUBJECT = /^(?:and|he|she|it|they|we|you|i)(?:\/(?:he|she|it|they|we|you|i))*$/i;
const GRAMMAR_LABEL = /\b(?:suffix|prefix) conjugation\b|hence past tense|construct or gerund|^construct state$|^in the construct state$/i;

const normWord = (w) => String(w || "").toLowerCase().replace(/^[("“'‘\[]+/u, "").replace(/[)\]”’"',;:!?.]+$/u, "");
// the words of a piece outside its parentheses and brackets
const bareWords = (p) => {
  let d = 0, b = 0, out = "";
  for (const c of p) {
    if (c === "(") { d += 1; out += " "; continue; }
    if (c === ")") { if (d) d -= 1; out += " "; continue; }
    if (c === "[") { b += 1; out += " "; continue; }
    if (c === "]") { if (b) b -= 1; out += " "; continue; }
    if (!d && !b) out += c;
  }
  return out.split(/\s+/u).filter(Boolean);
};

// ---- shapes: id -> { mark, test, means, divides } ------------------------
export const SHAPES = {};
const shape = (id, mark, divides, test, means) => { SHAPES[id] = { mark, divides, test, means }; };
// scopes
shape("paren.romanization", "( )", false, "the group follows a Hebrew word (one space allowed) and opens on a non-Hebrew character", "the romanization of the Hebrew word just before it, sometimes with that word's gloss in curly quotes: (av), (khamishá, “five”)");
shape("paren.lead_label", "( )", false, "the group opens the route, text follows it, and it is not a subject pronoun", "a context label over the whole line: (intransitive), (uncertain), (of celestial bodies); the line ships whole (see refusals)");
shape("paren.trailing_label", "( )", false, "the group ends the route (a '.' may follow), stands after a depth-0 sentence period, and opens lowercase", "a context label written after the gloss, over the whole line: To leaven, ferment. (of dough); the line ships whole, as under a lead label");
shape("paren.trailing_note", "( )", false, "the group ends the route (a '.' may follow), stands after a depth-0 sentence period, and opens uppercase", "a note on the whole line: (See usage note below.), (In the construct state); divided off as a note piece, never a reading");
shape("paren.subject_pronoun", "( )", false, "the group holds only he, she, it, they, we, you, I (slash-joined) or And", "the subject pronoun, or the rendering of the prefixed vav, inside a verb-form gloss: (he/it) went, (And) (she/it) brought; part of the reading");
shape("paren.nested", "( )", false, "the group opens inside another parenthesis", "notation inside the outer note: a romanization, an aside or an example within it");
shape("paren.mark_display", "( )", false, "the group holds a dotted circle or nothing but marks", "displays a Hebrew point on its own: (ִ◌ָ)");
shape("paren.hebrew_note", "( )", false, "the group (not a romanization) holds Hebrew letters", "a usage note citing Hebrew: (see also צליל), (sometimes followed by מֵת), (with לְ־ (l'-))");
shape("paren.argument_slot", "( )", false, "the group holds only an argument word: someone, something, oneself, a person (optionally after a preposition)", "the verb's object or argument slot inside one reading: to make (someone) laugh");
shape("paren.grammar_label", "( )", false, "the group names a conjugation in a form-of line: (suffix conjugation), (hence past tense)", "a grammatical label inside a form pointer");
shape("paren.qualifier", "( )", false, "any other balanced group at depth 0", "a qualifier or sense description on the English it follows (translation-table style): father (a male parent, ...), to close (window, door, shutter); never a second reading");
shape("paren.unclosed_opener", "(", false, "an opener that never closes", "a truncated or damaged note; from it onward nothing divides (the August opener_never_closed rule)");
shape("bracket.government", "[ ]", false, "the bracket opens with 'with '", "the preposition or particle the Hebrew word governs: [with מִן (mín) or מִ־ (mí-)]");
shape("bracket.cross_reference", "[ ]", false, "the bracket opens with 'see '", "a cross-reference to a usage note: [see usage note regarding the plural]");
shape("bracket.wiki_markup", "[ ] |", false, "the route carries '[[' (a wiki link the export did not render)", "wiki link markup left in the text: [[[in order that|in order]]]");
shape("bracket.elision", "[ ]", false, "the bracket holds only an ellipsis", "an elided slot: Who is […] ?");
shape("bracket.equivalence", "[ ]", false, "the bracket opens with '='", "an equivalent name: [=Jonathan]");
shape("bracket.supplied_word", "[ ]", false, "the bracket holds one or two lowercase English words", "an optional English word inside one reading: the other side [of]");
shape("bracket.phonetic", "[ ]", false, "the bracket holds a short form carrying a combining mark", "phonetic notation: [o̞]");
// dividers
shape("semicolon.sense_boundary", ";", true, "outside every scope; the next segment does not open as a note", "divides one sense group from the next: to blossom, bloom; to flourish");
shape("semicolon.note_follows", ";", true, "outside every scope; the next segment opens as a note (used, see, said of, indicating, also, for example, in full, it, this, ...)", "divides the glosses from a usage note that follows them; the note is kept whole as its own piece (an aside, not a reading)");
shape("period.before_trailing_note", ".", true, "a depth-0 period followed only by a parenthetical group that opens uppercase", "ends the gloss before a note on the whole line: ... to terminate. (See usage note below.); the note is its own piece (role note)");
shape("period.sentence_boundary", ".", true, "outside every scope, followed by a space and an uppercase letter, '(' or a quote, and the word before it is not an abbreviation", "ends one sentence of the gloss and starts another (usually a note: 'Also known as ...', '(See usage note below.)'); divides like a semicolon");
shape("colon.head_explanation", ":", true, "outside every scope, text on both sides, neither part carries Hebrew outside parentheses", "divides the head gloss(es) from the explanation that defines them: A tunnel: an underground or underwater passage; the explanation is kept whole as one piece");
shape("colon.pointer_gloss", ":", true, "outside every scope, text on both sides, the part before carries Hebrew letters outside parentheses (a form pointer)", "divides a form pointer from the English glosses of that form: plural indefinite form of כּוֹס (kos): cups, glasses, tumblers; the part after it is a reading list");
shape("colon.gloss_pointer", ":", true, "outside every scope, text on both sides, the part before carries no Hebrew outside parentheses and the part after does (a form pointer)", "divides the gloss from the form pointer that gives its grammar: (he/it) went: third-person masculine singular ... of הָלַךְ (halákh); the pointer is its own piece (role pointer), never a reading");
shape("colon.strongs_list", ":", true, "outside every scope and followed by ' - ' or ' – ' (Strong's ':-')", "a Strong's entry copied into Wiktionary: divides the definition from Strong's KJV rendering list, which is kept whole");
shape("comma.gloss_boundary", ",", true, "outside every scope, in a part (head, explanation or post-pointer) with no Hebrew outside parentheses and not in a note, and no comma of that part is a label, etc., clause, conjunction or relative comma", "alternation: divides one English gloss from the next (Wiktionary's synonym list): defect, deficiency, blemish");
// non-dividing outside occurrences of the dividers
shape("semicolon.in_parentheses", ";", false, "inside a parenthesis", "divides senses inside a parenthetical description; the parenthesis is one note");
shape("semicolon.in_quotation", ";", false, "inside a quotation at depth 0", "punctuation of the quoted text");
shape("semicolon.under_lead_label", ";", false, "outside every scope in a route led by a context label", "a sense boundary under a label that governs the whole line; held (the route ships whole)");
shape("period.terminal", ".", false, "nothing but whitespace follows it", "ends the gloss; part of the last piece");
shape("period.in_parentheses", ".", false, "inside a parenthesis or bracket", "an abbreviation, a decimal point or the note's own sentence end, inside the note");
shape("period.in_quotation", ".", false, "inside a quotation at depth 0", "punctuation of the quoted text");
shape("period.decimal", ".", false, "between two digits", "decimal point: 44.3 cm");
shape("period.ellipsis", ".", false, "next to another period", "an ellipsis written as dots: what is ...?, a slot for a word");
shape("period.abbreviation", ".", false, "outside every scope, not terminal, and either the word before it is an abbreviation (e.g., U.S.S.R., St.) or punctuation follows it directly", "the period of an abbreviation inside a run: e.g. by paying a fee; St., st., street");
shape("period.lowercase_continuation", ".", false, "outside every scope, followed by a space and a lowercase letter, the word before it not an abbreviation", "a sentence end the provider continued in lowercase; held, not divided (3 occurrences; see open questions)");
shape("period.under_lead_label", ".", false, "a sentence boundary in a route led (or, after its last period, closed) by a context label", "held: the route ships whole");
shape("colon.in_parentheses", ":", false, "inside a parenthesis", "head/explanation or citation inside a parenthetical note");
shape("colon.citation", ":", false, "between two digits", "chapter:verse in a citation: Ezra 2:56");
shape("colon.introduces_absent_list", ":", false, "nothing follows it in its segment", "introduces sub-senses this route does not carry: to be:, Possibilities include:");
shape("colon.under_lead_label", ":", false, "outside every scope in a route led by a context label", "held: the route ships whole");
shape("comma.in_parentheses", ",", false, "inside a parenthesis", "notation inside a parenthetical: a list of objects (window, door, shutter), a romanization and its gloss (khamishá, “five”), or the note's own prose");
shape("comma.in_brackets", ",", false, "inside a square bracket", "notation inside a government note");
shape("comma.in_quotation", ",", false, "inside a quotation at depth 0", "punctuation of the quoted text");
shape("comma.number", ",", false, "between two digits", "digit grouping");
shape("comma.trailing", ",", false, "nothing but whitespace follows it in its part", "a comma closing a truncated list; no piece follows");
shape("comma.under_lead_label", ",", false, "outside every scope in a route led by a context label", "held: the route ships whole");
shape("comma.pointer", ",", false, "outside every scope in a part that carries Hebrew letters outside parentheses", "inside a form pointer: plural indefinite form of X (x), defective spelling; ... of X, with a first-person singular pronoun suffix");
shape("comma.in_note", ",", false, "outside every scope in a segment that opens as a note (used, see, said of, indicating, also, it, this, ...)", "inside a usage note's own sentence: What; used in forming exclamations, may be used to express ...; the note is held whole");
shape("comma.strongs_list", ",", false, "outside every scope after a Strong's ': -'", "Strong's KJV list comma; the list is held whole (see open questions)");
shape("comma.after_label", ",", false, "the first piece of the part is a label (figuratively, specifically, by extension, ...) and the next piece runs two words or more, or the first piece opens with a one-word label or a parenthesis", "follows a label that governs the rest of the part: figuratively, to perceive; the part is held whole");
shape("comma.before_etc", ",", false, "the next piece is etc.", "the list is open-ended inside one phrase: to board (a plane), to enter (a street via a junction), etc.; the part is held whole");
shape("comma.before_clause", ",", false, "the next piece runs two words or more and opens with especially, such, usually, used, equivalent, e.g., i.e., representing, transliterated, ... (unless the first piece is a one- or two-word function-word gloss)", "opens a qualifying clause: song, singing, especially traditional ...; the part is a sentence and is held whole");
shape("comma.before_serial_conjunction", ",", false, "the next piece runs two words or more and opens with or, and, nor, but (unless the first piece is a one- or two-word function-word gloss)", "the last item of an enumeration inside one phrase: any of Passover, Shavuot, Sukkot, or Shemini Atzeret; the part is held whole");
shape("comma.before_relative", ",", false, "the next piece runs two words or more and opens with as, like, that, which, who, whose, where, when, from, about, rather, hence, ... while the part's first piece opens on a content word", "attaches a relative or comparative clause to the gloss before it: A destination, as of a voyage; a male given name, Aziz, from Arabic; the part is held whole");
shape("comma.shared_object", ",", false, "the piece before it is one or two words ending on a preposition (not a 'to' infinitive), the part's first piece is such a piece, and its last piece opens with or/and and does not end on a preposition", "the pieces share one object written once at the end: of, pertaining to, or being the descendants of Jacob; the part is held whole");
shape("comma.before_bare_group", ",", false, "the next piece is nothing but one parenthetical group", "the group qualifies the gloss before it and is no reading of its own: chicken, (female); Wren, (Troglodytes troglodytes); the part is held whole");
shape("comma.list_inside_sentence", ",", false, "a gloss-shaped comma in a part that carries one of the holding commas above", "an item boundary of a list inside a sentence: To bring in, take in, send in, or otherwise cause ...; held with its sentence");
// other marks
shape("hyphen.romanization", "-", false, "inside a romanization parenthesis", "marks a bound prefix or compound in the romanization: (mi-), (sákh-hakól)");
shape("hyphen.strongs_list_marker", "-", false, "follows ':' (and a space) and precedes a space", "the dash of Strong's ':-' that opens the KJV rendering list");
shape("hyphen.strongs_suffix", "-", false, "after a Strong's ':-' in the same route, opening a suffix", "Strong's suffix notation inside the KJV list: (-r, over), chief (-est)");
shape("hyphen.range", "-", false, "between two digits, or spaced between two dates or numbers", "a range: 8-6th centuries, Psalms 113-118, April 21 - May 21");
shape("hyphen.compound", "-", false, "between two letters or digits (or after ')' before a letter)", "joins a compound word: third-person, living room-kitchen, 24-hour, pre-1948");
shape("hyphen.bound_prefix_gloss", "-", false, "ends a word (letter before, space, punctuation or end after)", "the gloss is an English prefix, or a suspended compound: pre-, Single-, cup- or trumpet-shaped");
shape("hyphen.bound_suffix_gloss", "-", false, "opens a word (start, space or '(' before, letter after)", "the gloss is an English suffix: -less, -ie, -able");
shape("hyphen.spaced_dash", "-", false, "a space on both sides, not after a colon, not between numbers or dates", "a dash introducing an apposition inside one reading: a 'kibbutz' - a collective settlement");
shape("slash.spelling_pair", "/ \\", false, "Hebrew on both sides (a space allowed)", "separates the unpointed and pointed spellings of one cited Hebrew lemma: קובל / קֻבַּל");
shape("slash.phoneme", "/", false, "part of a /phoneme/ pair", "phonemic notation: /e/, /u/");
shape("slash.url", "/", false, "part of a URL", "a web address");
shape("slash.per_unit", "/", false, "after a unit abbreviation (kcal, km, ...)", "'per' in a unit: kcal/gram");
shape("slash.alternation_in_reading", "/", false, "letters on both sides, no space", "packs alternatives inside one reading's shared frame: happy is/was/will be, Screw him/her/it!; dividing would leave fragments ('happy is')");
shape("slash.alternation_spaced", "/", false, "a space on at least one side, English on both", "alternative words inside one reading or note: Jewish feast / festival / holiday");
shape("maqaf.hebrew", "־", false, "next to a Hebrew letter or point", "the Hebrew hyphen of a cited bound form or compound: מִ־, סַךְ־הַכֹּל");
shape("maqaf.named", "־", false, "not next to a Hebrew letter", "the maqaf character itself, named by the gloss: the Hebrew script hyphen (־)");
shape("hebrew_point.on_letter", "Hebrew points", false, "follows a Hebrew letter or another point", "a vowel point, dagesh or shin/sin dot of a cited Hebrew form");
shape("hebrew_point.mark_display", "Hebrew points", false, "next to a dotted circle or alone in a display parenthesis", "the point shown on its own, as the thing the entry names");
shape("dotted_circle.carrier", "◌", false, "always", "the dotted circle that carries a displayed point");
shape("geresh.hebrew", "׳", false, "follows a Hebrew letter", "geresh: an abbreviation mark or a foreign-sound mark on a Hebrew letter (ז׳, נפ׳)");
shape("gershayim.hebrew", "״", false, "follows a Hebrew letter or point", "gershayim: the acronym mark inside a Hebrew word (שד״ר)");
shape("gershayim.named", "״", false, "not after a Hebrew letter", "the gershayim character named by the gloss");
shape("apostrophe.romanization", "'", false, "inside a romanization parenthesis", "a glottal stop or shva in the romanization: (n'kevá), ('ír)");
shape("apostrophe.word_internal", "'", false, "letters on both sides", "English elision or possessive: one's, doesn't, y'all");
shape("apostrophe.word_final", "'", false, "letter before, no letter after", "plural possessive or a closing single quote: brides' parents, Tuqu'");
shape("apostrophe.opening_quote", "'", false, "no letter before, letter after", "an opening single quote: a 'kibbutz', also called 'Zaccur'");
shape("straight_double.gershayim_substitute", "\"", false, "letters on both sides", "an ASCII quote standing for gershayim in a romanized acronym: Shu\"m");
shape("straight_double.quotation", "\"", false, "one of a pair in the route", "quotation marks around a quoted gloss or term: (\"quail\"), \"Lady of the night\"");
shape("straight_double.named_character", "\"", false, "the route's quotes do not pair and this one is left over", "the double-quote character named by the gloss");
shape("curly_double.romanization_gloss", "“ ”", false, "inside a romanization parenthesis", "quotes the gloss of the cited Hebrew word: (khamishá, “five”)");
shape("curly_double.quotation", "“ ”", false, "anywhere else", "quotation marks around a quoted meaning or phrase");
shape("curly_single.apostrophe", "’", false, "’ with letters on both sides", "an apostrophe typed as a curly quote: one’s");
shape("curly_single.particle_gloss", "‘ ’", false, "‘ ’ inside a square bracket", "quotes the gloss of the governed particle: [with ל־ (l'-) ‘to’]");
shape("curly_single.quotation", "‘ ’", false, "anywhere else", "single quotation marks");
shape("exclamation.terminal", "!", false, "always", "ends an interjection or imperative gloss; part of the reading: Wow!, move!");
shape("question.terminal", "?", false, "always", "ends a question gloss; part of the reading: Is it true?");
shape("en_dash.range", "–", false, "digits or dates on both sides", "a range: 6:4–9, May 22 – June 21");
shape("en_dash.strongs_list_marker", "–", false, "follows ':' and a space", "the dash of Strong's ':–' list marker");
shape("em_dash.range_or_aside", "—", false, "always", "a range (879 — 912 CE) or a parenthetical dash inside one reading");
shape("degree.unit", "°", false, "after a digit", "degrees: 270°");
shape("ellipsis.slot_or_truncation", "…", false, "always", "an elided slot or a cut-off passage: והאופנים…, still, …");
shape("plus.composition", "+", false, "always", "composition in a grammatical note: את + ה־, (+ activity)");
shape("equals.expansion", "=", false, "always", "introduces the full form an abbreviation stands for: =לירה ישראלית, [=Jonathan]");
shape("symbol.named_or_shown", "~ ‐ ♠ ♣ ♇ ⯓ † # → ⟨ ⟩ @", false, "always (for @: inside a parenthesis)", "the symbol itself, shown or named by the gloss; the Hebrew word names the symbol (tilde, spade, dagger, number sign)");
shape("symbol.notation", "⁄ · % × ⁺ ̞ & < >", false, "always", "notation inside one reading: a fraction slash, a unit dot (N·m), percent, a times sign, an ion charge, an IPA diacritic, an ampersand, grapheme brackets <th>");
shape("wiki_template.residue", "{ |", false, "the route carries '{{'", "a wiki template the export did not render: ({{taxlink|Citrus × aurantium f");

// ---- one route -------------------------------------------------------------
export const parse = (R) => {
  const n = R.length;
  const pd = new Int16Array(n), bd = new Int16Array(n);
  const match = new Int32Array(n).fill(-1);
  const opens = [], bopens = [];
  let d = 0, b = 0;
  for (let i = 0; i < n; i += 1) {
    pd[i] = d; bd[i] = b;
    const c = R[i];
    if (c === "(") { opens.push(i); d += 1; }
    else if (c === ")") { if (opens.length) { const j = opens.pop(); match[i] = j; match[j] = i; d -= 1; } }
    else if (c === "[") { bopens.push(i); b += 1; }
    else if (c === "]") { if (bopens.length) { const j = bopens.pop(); match[i] = j; match[j] = i; b -= 1; } }
  }
  const unclosedAt = Math.min(opens.length ? opens[0] : n, bopens.length ? bopens[0] : n);
  // matched-group cover: inside[i] true when a matched ( ) or [ ] encloses i strictly
  const cover = new Int16Array(n + 1);
  const bcover = new Int16Array(n + 1);
  for (let i = 0; i < n; i += 1) if (match[i] > i) {
    const arr = R[i] === "(" ? cover : bcover;
    arr[i + 1] += 1; arr[match[i]] -= 1;
  }
  const inP = new Uint8Array(n), inB = new Uint8Array(n);
  for (let i = 0, a = 0, bb = 0; i < n; i += 1) { a += cover[i]; bb += bcover[i]; inP[i] = a > 0 ? 1 : 0; inB[i] = bb > 0 ? 1 : 0; }
  const held = (i) => i > unclosedAt;                     // after the first unclosed opener
  const top = (i) => !inP[i] && !inB[i] && !held(i);       // outside every paren/bracket scope
  // quotation spans at depth 0
  const inQ = new Uint8Array(n);
  const spanPairs = (openC, closeC) => {
    for (let i = 0; i < n; i += 1) if (R[i] === openC && top(i)) {
      const j = R.indexOf(closeC, i + 1);
      if (j > i) { for (let k = i + 1; k < j; k += 1) inQ[k] = 1; i = j; }
    }
  };
  spanPairs("“", "”"); spanPairs("‘", "’"); spanPairs("⟨", "⟩");
  const sq = []; for (let i = 0; i < n; i += 1) if (R[i] === '"' && top(i)) sq.push(i);
  for (let k = 0; k + 1 < sq.length; k += 2) for (let x = sq[k] + 1; x < sq[k + 1]; x += 1) inQ[x] = 1;
  const free = (i) => top(i) && !inQ[i];                   // a divider may stand here
  // straight quotes paired across the whole route (for their own shapes)
  const allSq = []; for (let i = 0; i < n; i += 1) if (R[i] === '"') allSq.push(i);
  const sqPaired = new Set(allSq.slice(0, allSq.length - (allSq.length % 2)));

  // paren group shapes
  const groupShape = new Map();
  const firstNonSpace = R.search(/\S/);
  const leadGroup = firstNonSpace >= 0 && R[firstNonSpace] === "(" && match[firstNonSpace] > firstNonSpace && R.slice(match[firstNonSpace] + 1).trim() !== "";
  const leadIsSubject = leadGroup && SUBJECT.test(R.slice(firstNonSpace + 1, match[firstNonSpace]).trim());
  // a group that ends the route after a depth-0 sentence period: ". (of dough)" is a label over the line, ". (See usage note below.)" a note on it
  let trailOpen = -1, trailKind = null;
  { const tail = R.replace(/[\s.]+$/u, ""); const close = tail.length - 1;
    if (close > 0 && R[close] === ")" && match[close] >= 0 && match[close] < close && pd[match[close]] === 0 && bd[match[close]] === 0) {
      const o = match[close]; const before = R.slice(0, o).replace(/\s+$/u, "");
      const tok = before.slice(0, -1).split(/\s+/u).pop().replace(/^[("“'‘\[]+/u, "");
      const abbrevBefore = /^(?:[A-Za-z]\.)+[A-Za-z]$/.test(tok) || ABBREV.has(tok.toLowerCase()) || tok.length === 1;
      if (o > 0 && before.endsWith(".") && !abbrevBefore && R.slice(o - 1, o) === " " && before.length && !/\.\.$/.test(before)) {
        const inner = R.slice(o + 1, close).trim();
        trailOpen = o; trailKind = /^\p{Lu}/u.test(inner) ? "note" : /^\p{Ll}/u.test(inner) ? "label" : null;
        if (!trailKind) trailOpen = -1;
      } } }
  const leadLabel = (leadGroup && !leadIsSubject) || trailKind === "label";
  for (let i = 0; i < n; i += 1) if (R[i] === "(" && match[i] > i) {
    const inner = R.slice(i + 1, match[i]);
    let k = i - 1; if (k >= 0 && R[k] === " ") k -= 1;
    let s;
    if (leadGroup && !leadIsSubject && i === firstNonSpace) s = "paren.lead_label";
    else if (i === trailOpen) s = trailKind === "label" ? "paren.trailing_label" : "paren.trailing_note";
    else if (SUBJECT.test(inner.trim())) s = "paren.subject_pronoun";
    else if (pd[i] > 0 && !(k >= 0 && isHeb(R[k]) && inner.length && !isHeb(inner[0]))) s = "paren.nested";
    else if (k >= 0 && isHeb(R[k]) && inner.length && !isHeb(inner[0]) && !/^[\s◌]/.test(inner)) s = "paren.romanization";
    else if (/◌/.test(inner) || (inner.trim() && [...inner].every((c) => isSpace(c) || isHebPoint(c)))) s = "paren.mark_display";
    else if (/[א-ת]/.test(inner)) s = "paren.hebrew_note";
    else if (ARG_SLOT.test(inner.trim())) s = "paren.argument_slot";
    else if (GRAMMAR_LABEL.test(inner.trim())) s = "paren.grammar_label";
    else s = "paren.qualifier";
    groupShape.set(i, s); groupShape.set(match[i], s);
  }
  const enclosingGroup = (i) => { // innermost matched paren enclosing i
    for (let j = i - 1; j >= 0; j -= 1) if (R[j] === "(" && match[j] > i) return j;
    return -1;
  };
  const inRomanization = (i) => { const g = enclosingGroup(i); return g >= 0 && groupShape.get(g) === "paren.romanization"; };

  // ---- level 1: ";" and sentence "." ----
  const occ = new Map(); // index -> shape
  const tokenBefore = (i) => { let k = i - 1; while (k >= 0 && !isSpace(R[k])) k -= 1; return R.slice(k + 1, i).replace(/^[("“'‘\[]+/u, ""); };
  const isAbbrevToken = (t) => /^(?:[A-Za-z]\.)+[A-Za-z]$/.test(t) || ABBREV.has(t.toLowerCase()) || t.length === 1;
  const level1 = [];
  for (let i = 0; i < n; i += 1) {
    const c = R[i];
    if (c === ";" && free(i)) level1.push(i);
    if (c === "." && free(i) && R[i - 1] !== "." && R[i + 1] !== "." && isSpace(R[i + 1])) {
      const j = R.slice(i + 1).search(/\S/);
      if (j >= 0) {
        const nx = R[i + 1 + j];
        if (/[A-Z0-9(“"]/.test(nx) && !isAbbrevToken(tokenBefore(i))) level1.push(i);
      }
    }
  }
  const segs = []; { let a = 0; for (const i of level1) { segs.push([a, i]); a = i + 1; } segs.push([a, n]); }
  const pieceText = (a, z) => R.slice(a, z);
  for (let s = 0; s < level1.length; s += 1) {
    const i = level1[s];
    const nextSeg = pieceText(segs[s + 1][0], segs[s + 1][1]).trim();
    if (R[i] === ";") occ.set(i, leadLabel ? "semicolon.under_lead_label" : (NOTE_START.test(nextSeg) ? "semicolon.note_follows" : "semicolon.sense_boundary"));
    else occ.set(i, leadLabel ? "period.under_lead_label" : (trailKind === "note" && R.slice(i + 1, trailOpen).trim() === "" ? "period.before_trailing_note" : "period.sentence_boundary"));
  }

  // ---- level 2 and 3 within each segment: ":" then "," ----
  const hasHebOutside = (a, z) => { for (let k = a; k < z; k += 1) if (isHebLetter(R[k]) && top(k) && !inQ[k]) return true; return false; };
  const parts = []; // {a, z, role}
  const occRole = new Map(); // comma index -> the role of the part it stands in
  for (const [sa, sz] of segs) {
    const cols = [];
    for (let i = sa; i < sz; i += 1) if (R[i] === ":" && free(i)) {
      if (isDigit(R[i - 1]) && isDigit(R[i + 1])) { occ.set(i, "colon.citation"); continue; }
      if (R.slice(i + 1, sz).trim() === "") { occ.set(i, "colon.introduces_absent_list"); continue; }
      if (leadLabel) { occ.set(i, "colon.under_lead_label"); continue; }
      cols.push(i);
    }
    let a = sa; const segParts = [];
    for (const i of cols) { segParts.push([a, i]); a = i + 1; }
    segParts.push([a, sz]);
    let strongs = false;
    segParts.forEach(([pa, pz], k) => {
      let role = "head";
      if (k > 0) {
        const ci = cols[k - 1];
        const prevPointer = hasHebOutside(segParts[k - 1][0], segParts[k - 1][1]);
        if (strongs || /^\s*[-–]\s/.test(R.slice(ci + 1, pz))) { strongs = true; role = "strongs_list"; occ.set(ci, "colon.strongs_list"); }
        else if (prevPointer) { role = "gloss"; occ.set(ci, "colon.pointer_gloss"); }
        else if (hasHebOutside(pa, pz)) { role = "pointer"; occ.set(ci, "colon.gloss_pointer"); }
        else { role = "explanation"; occ.set(ci, "colon.head_explanation"); }
      }
      parts.push({ a: pa, z: pz, role, pointer: hasHebOutside(pa, pz), note: NOTE_START.test(R.slice(sa, sz).trim()) });
    });
  }
  for (const p of parts) {
    const commas = [];
    for (let i = p.a; i < p.z; i += 1) if (R[i] === "," && free(i)) {
      if (isDigit(R[i - 1]) && isDigit(R[i + 1])) { occ.set(i, "comma.number"); continue; }
      commas.push(i);
    }
    if (!commas.length) continue;
    for (const i of commas) occRole.set(i, p.note ? "note" : p.pointer ? "pointer" : p.role);
    const fixed = leadLabel ? "comma.under_lead_label" : p.role === "strongs_list" ? "comma.strongs_list" : p.pointer ? "comma.pointer" : p.note ? "comma.in_note" : null;
    if (fixed) { for (const i of commas) occ.set(i, fixed); continue; }
    const bounds = [p.a, ...commas.map((i) => i + 1)];
    const ends = [...commas, p.z];
    const qs = bounds.map((a, k) => R.slice(a, ends[k]));
    const q0 = qs[0].trim();
    const q0w = bareWords(q0);
    const q0first = normWord(q0w[0]);
    const q0isLabel = LABELS.has(q0.toLowerCase().replace(/\.$/, ""));
    // a parenthesis opening only the first piece is a label over the part; one opening every piece is each piece's own notation: (he) colored, (he) dyed
    const q0ledByLabel = (q0.startsWith("(") && !qs.every((q) => q.trim().startsWith("("))) || (q0w.length >= 2 && LABEL1.has(q0first));
    const q0function = q0w.length <= 2 && FUNCTION_FIRST.has(q0first);
    const lastWords = bareWords(qs[qs.length - 1].trim().replace(/[.;:!?]+$/, ""));
    // a dangling piece is one or two words ending on a preposition and not a "to" infinitive: "of", "pertaining to" (not "to break into")
    const endsPrep = (q) => { const w = bareWords(q.trim().replace(/[.;:!?]+$/, "")); return w.length > 0 && w.length <= 2 && normWord(w[0]) !== "to" && END_PREP.has(normWord(w[w.length - 1])); };
    // shared object: the list opens on a dangling piece and closes on ", or/and ..." that carries the object: of, from, or pertaining to Africa
    const sharedObject = qs.length >= 2 && endsPrep(qs[0]) && lastWords.length >= 2 && SERIAL.has(normWord(lastWords[0])) && !END_PREP.has(normWord(lastWords[lastWords.length - 1]));
    let anyHold = false; const cand = [];
    commas.forEach((i, k) => {
      const q = qs[k + 1].trim();
      const w = bareWords(q);
      const fw = normWord(w[0]);
      let s = null;
      if (!q) s = "comma.trailing";
      else if (/^\([^()]*(?:\([^()]*\)[^()]*)*\)[.;:!?]*$/u.test(q)) s = "comma.before_bare_group";
      else if (k === 0 && ((q0isLabel && w.length >= 2 && !FUNCTION_FIRST.has(fw) && !PRONOUNS.has(fw)) || q0ledByLabel)) s = "comma.after_label";
      else if (ETC.has(fw) && w.length <= 2 && !q0function) s = "comma.before_etc";
      else if (w.length >= 2 && ALWAYS.has(fw) && !q0function) s = "comma.before_clause";
      else if (w.length >= 2 && SERIAL.has(fw) && (sharedObject || !(q0function && w.length <= 3))) s = "comma.before_serial_conjunction";
      else if (w.length >= 2 && FUNCTION.has(fw) && !FUNCTION_FIRST.has(q0first)) s = "comma.before_relative";
      else if (sharedObject && endsPrep(qs[k])) s = "comma.shared_object";
      if (s) { occ.set(i, s); if (s !== "comma.trailing") anyHold = true; } else cand.push(i);
    });
    for (const i of cand) occ.set(i, anyHold ? "comma.list_inside_sentence" : "comma.gloss_boundary");
  }

  // ---- every other occurrence ----
  const routeHasWiki = R.includes("[[");
  const routeHasTemplate = R.includes("{{");
  const strongsAt = R.search(/:\s*[-–]\s/);
  for (let i = 0; i < n; i += 1) {
    const c = R[i];
    if (!isMark(c) || occ.has(i)) continue;
    const pv = R[i - 1], nx = R[i + 1];
    let s = null;
    if (c === "(" || c === ")") s = groupShape.get(i) || (c === "(" ? "paren.unclosed_opener" : null);
    else if (c === "[" || c === "]") {
      if (routeHasWiki) s = "bracket.wiki_markup";
      else {
        const o = c === "[" ? i : match[i];
        const inner = o >= 0 && match[o] > o ? R.slice(o + 1, match[o]) : null;
        if (inner === null) s = null;
        else if (/^with /i.test(inner)) s = "bracket.government";
        else if (/^see /i.test(inner)) s = "bracket.cross_reference";
        else if (/^\s*…\s*$/.test(inner)) s = "bracket.elision";
        else if (/^=/.test(inner)) s = "bracket.equivalence";
        else if (/^[a-z]+(?: [a-z]+)?$/.test(inner)) s = "bracket.supplied_word";
        else if (/^[\p{L}\p{M}]{1,4}$/u.test(inner) && /\p{M}/u.test(inner)) s = "bracket.phonetic";
      }
    }
    else if (c === "|") s = routeHasWiki ? "bracket.wiki_markup" : routeHasTemplate ? "wiki_template.residue" : null;
    else if (c === "{" || c === "}") s = routeHasTemplate ? "wiki_template.residue" : null;
    else if (c === ";") s = inP[i] || inB[i] || held(i) ? "semicolon.in_parentheses" : inQ[i] ? "semicolon.in_quotation" : null;
    else if (c === ":") s = inP[i] || inB[i] || held(i) ? "colon.in_parentheses" : null;
    else if (c === ",") s = inP[i] || held(i) ? "comma.in_parentheses" : inB[i] ? "comma.in_brackets" : inQ[i] ? "comma.in_quotation" : null;
    else if (c === ".") {
      if (inP[i] || inB[i] || held(i)) s = "period.in_parentheses";
      else if (inQ[i]) s = "period.in_quotation";
      else if (R.slice(i + 1).trim() === "") s = "period.terminal";
      else if (pv === "." || nx === "." || pv === "…") s = "period.ellipsis";
      else if (isDigit(pv) && isDigit(nx)) s = "period.decimal";
      else if (isAbbrevToken(tokenBefore(i)) || !isSpace(nx)) s = "period.abbreviation";
      else { const j = R.slice(i + 1).search(/\S/); s = /[a-z]/.test(R[i + 1 + j]) ? "period.lowercase_continuation" : null; }
    }
    else if (c === "-") {
      if (inRomanization(i)) s = "hyphen.romanization";
      else if (/:\s?$/.test(R.slice(Math.max(0, i - 2), i)) && isSpace(nx)) s = "hyphen.strongs_list_marker";
      else if (strongsAt >= 0 && i > strongsAt + 1 && isLetter(nx) && (pv === "(" || isSpace(pv))) s = "hyphen.strongs_suffix";
      else if (isDigit(pv) && isDigit(nx)) s = "hyphen.range";
      else if (isSpace(pv) && isSpace(nx) && /\d\s$/.test(R.slice(Math.max(0, i - 2), i)) && /^\s\p{L}+ \d/u.test(R.slice(i + 1))) s = "hyphen.range";
      else if ((isLetter(pv) || isDigit(pv) || pv === ")") && (isLetter(nx) || isDigit(nx))) s = "hyphen.compound";
      else if ((isLetter(pv)) && (nx === undefined || isSpace(nx) || /[.,;:)]/.test(nx))) s = "hyphen.bound_prefix_gloss";
      else if ((pv === undefined || isSpace(pv) || pv === "(") && isLetter(nx)) s = "hyphen.bound_suffix_gloss";
      else if (isSpace(pv) && isSpace(nx)) s = "hyphen.spaced_dash";
    }
    else if (c === "/" || c === "\\") {
      const before = R.slice(Math.max(0, i - 3), i), after = R.slice(i + 1, i + 4);
      if (/[֐-׿]\s?$/.test(before) && /^\s?[֐-׿]/.test(after)) s = "slash.spelling_pair";
      else if (c === "/" && /https?:\/\/\S*$/.test(R.slice(0, i + 1) + R.slice(i + 1).split(/\s/)[0]) && /https?:/.test(R.slice(Math.max(0, i - 40), i + 1))) s = "slash.url";
      else if (c === "/" && (/(^|[\s(\[])\/[^\s\/]{1,6}$/.test(R.slice(Math.max(0, i - 8), i)) || /^\/[^\s\/]{1,6}\/([\s).,]|$)/.test(R.slice(i)))) s = "slash.phoneme";
      else if (c === "/" && /(?:kcal|km|kg|cm|mm|mi)$/.test(R.slice(Math.max(0, i - 4), i))) s = "slash.per_unit";
      else if (c === "/" && isLetter(pv) && isLetter(nx)) s = "slash.alternation_in_reading";
      else if (c === "/" && (isSpace(pv) || isSpace(nx))) s = "slash.alternation_spaced";
    }
    else if (c === "־") s = isHeb(pv) || isHeb(nx) ? "maqaf.hebrew" : "maqaf.named";
    else if (isHebPoint(c)) {
      const g = enclosingGroup(i);
      if (pv === "◌" || nx === "◌" || (g >= 0 && groupShape.get(g) === "paren.mark_display")) s = "hebrew_point.mark_display";
      else if (isHebLetter(pv) || isHebPoint(pv)) s = "hebrew_point.on_letter";
    }
    else if (c === "◌") s = "dotted_circle.carrier";
    else if (c === "׳") s = isHebLetter(pv) || isHebPoint(pv) ? "geresh.hebrew" : null;
    else if (c === "״") s = isHebLetter(pv) || isHebPoint(pv) ? "gershayim.hebrew" : "gershayim.named";
    else if (c === "'") {
      if (inRomanization(i)) s = "apostrophe.romanization";
      else if (isLetter(pv) && isLetter(nx)) s = "apostrophe.word_internal";
      else if (isLetter(pv)) s = "apostrophe.word_final";
      else if (isLetter(nx)) s = "apostrophe.opening_quote";
    }
    else if (c === '"') s = isLetter(pv) && isLetter(nx) ? "straight_double.gershayim_substitute" : sqPaired.has(i) ? "straight_double.quotation" : "straight_double.named_character";
    else if (c === "“" || c === "”") s = inRomanization(i) ? "curly_double.romanization_gloss" : "curly_double.quotation";
    else if (c === "’" && isLetter(pv) && isLetter(nx)) s = "curly_single.apostrophe";
    else if (c === "‘" || c === "’") s = inB[i] ? "curly_single.particle_gloss" : "curly_single.quotation";
    else if (c === "!") s = "exclamation.terminal";
    else if (c === "?") s = "question.terminal";
    else if (c === "–") s = /:\s$/.test(R.slice(Math.max(0, i - 2), i)) ? "en_dash.strongs_list_marker" : "en_dash.range";
    else if (c === "—") s = "em_dash.range_or_aside";
    else if (c === "°") s = isDigit(pv) ? "degree.unit" : null;
    else if (c === "…") s = "ellipsis.slot_or_truncation";
    else if (c === "+") s = "plus.composition";
    else if (c === "=") s = "equals.expansion";
    else if ("~‐♠♣♇⯓†#→⟨⟩".includes(c) || (c === "@" && inP[i])) s = "symbol.named_or_shown";
    else if ("⁄·%×⁺̞&<>".includes(c)) s = "symbol.notation";
    occ.set(i, s || `UNEXPLAINED:${c}`);
  }

  // ---- the division ----
  const cuts = [...occ.entries()].filter(([, s]) => SHAPES[s] && SHAPES[s].divides).map(([i]) => i).sort((x, y) => x - y);
  const roleAt = (i) => { const p = parts.find((x) => i >= x.a && i < x.z); return p ? (p.pointer ? "pointer" : p.role) : "head"; };
  const pieces = [];
  { let a = 0; for (const i of [...cuts, n]) {
      const raw = R.slice(a, i); const t = raw.trim();
      if (t) { const st = a + raw.search(/\S/); pieces.push({ text: t, at: st, role: (st === trailOpen && trailKind === "note") || (NOTE_START.test(t) && a > 0 && R[a - 1] !== ",") ? "note" : roleAt(st) }); }
      a = i + 1;
  } }
  // rejoin: between consecutive pieces only whitespace and exactly one dividing mark
  let rejoins = true;
  { let pos = 0; for (const p of pieces) {
      const gap = R.slice(pos, p.at);
      if (pos === 0 ? gap.trim() !== "" : gap.replace(/\s/g, "").length !== 1 || !cuts.includes(pos + gap.search(/\S/))) rejoins = false;
      if (R.slice(p.at, p.at + p.text.length) !== p.text) rejoins = false;
      pos = p.at + p.text.length;
  } if (R.slice(pos).replace(/\s/g, "").length > 1 || (R.slice(pos).trim() && !cuts.includes(pos + R.slice(pos).search(/\S/)))) rejoins = false; }
  const readings = rejoins && pieces.length ? pieces : [{ text: R.trim(), at: 0, role: "whole" }];
  return { occ, occRole, readings, rejoins, leadLabel, trailKind, unclosed: unclosedAt < n, parts };
};

