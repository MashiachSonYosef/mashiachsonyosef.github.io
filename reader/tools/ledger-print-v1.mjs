// GUARDS: ledger-division-rule-v2-a-ledgered-row-divides-prints-a-part-or-prints-no-pill-only-as-its-ledger-and-the-owner-say
// LEDGER: M R
// THE PRINT STEP: the one step of the page's own that a ledger's branch asks for.
//
// A ledger's classifier can only say what a mark is; a declaration can cut a
// row at a mark and can hold it whole, and it can do nothing else. Yet 41 of
// the ledgers' branches ask a question whose answer is neither: a filing tag
// this corpus's own script wrote («he (n, wikt, en 2)»), a name with its
// pointer («Merari. See also»), a bracket that offers a second form
// («fool (ish)»), a row that renders nothing («<the>», «mega-», «[Obj.]»).
// Each such branch says, in its own words, what the page prints under each
// answer and that "it needs a step of its own". This module is that step.
//
// One entry per branch, keyed source:branch. An entry names the option it
// serves and gives, from the branch's own marks on a row, what the page
// prints for that row: a list of texts, each a run of the route's own
// characters in their own order (kept ranges of the text, nothing added, so
// the licence beside it still names the author of every character), or no
// text at all (no pill). The branch's own examples, from its "means", are the
// fixtures below; selfTest() runs them, and apply-ledger-divisions refuses to
// write a store while any fails.
//
// What a row prints is written into row[8] by apply-ledger-divisions: [] for
// no pill, [text, ...] for the texts. The store (gloss-store-v1 readingsOf)
// and the page (zone.html readingsOfRow) read the slot and nothing else.
//
// A ledger whose branches offer only "divides" and its resting option has no
// entry here; a branch answered with its resting option has no effect here.

/** kept ranges: [[from, to), ...] over the text, in order; the printed text is
 *  the kept characters joined, runs of spaces (U+0020 alone: a no-break space
 *  or a tab is the route's own character and stays) collapsed, trimmed */
const collapse = (s) => s.replace(/ {2,}/gu, " ").trim();
/** a branch's own word that a row prints no pill (Wikimedia B02's row list: a row where neither side renders) */
const NONE = Symbol("no pill");
const join = (text, keep) => collapse(keep.map(([a, b]) => text.slice(a, b)).join(""));
const whole = (text) => [[0, text.length]];
const remove = (keep, from, to) => {
  const out = [];
  for (const [a, b] of keep) {
    if (to <= a || from >= b) { out.push([a, b]); continue; }
    if (from > a) out.push([a, from]);
    if (to < b) out.push([to, b]);
  }
  return out;
};
const before = (text, i) => [[0, i]];
const after = (text, i) => [[i + 1, text.length]];
const between = (o, c) => [[o + 1, c]];
const first = (marks, ...shapes) => marks.find((m) => shapes.includes(m.shape)) || null;
const all = (marks, ...shapes) => marks.filter((m) => shapes.includes(m.shape));
const pair = (marks, open, close) => { const o = first(marks, open); const c = o ? marks.find((m) => m.shape === close && m.i > o.i) : null; return o && c ? [o.i, c.i] : null; };
/** the word just before index i: back over spaces, then over the word */
const wordBefore = (text, i) => { let e = i; while (e > 0 && /\s/u.test(text[e - 1])) e -= 1; let s = e; while (s > 0 && !/\s/u.test(text[s - 1])) s -= 1; return [s, e]; };
/** the two forms a bracket offers: the row without the bracket, and the row with the bracket's part joined on */
const twoForms = (text, o, c) => {
  const inner = text.slice(o + 1, c);
  const plain = remove(whole(text), o, c + 1);
  let joined;
  if (!text.slice(0, o).trim()) joined = [[o + 1, c], [c + 1, text.length]];               // «(over) against» → over against
  else {
    const [, e] = wordBefore(text, o);                                                      // the word the part joins, without the space after it
    const start = inner.startsWith("-") && /^[a-z]/u.test(inner.slice(1)) ? o + 2 : o + 1;  // «-s» joins with nothing between; «-Gilead» keeps its hyphen
    joined = [[0, e], [start, c], [c + 1, text.length]];
  }
  return [plain, joined];
};

const T = (option, kind, print) => ({ option, kind, print });
// kind: "none" prints no pill; "keep" prints one or more parts of the row and refuses to combine with a cut; "remove" takes marks
// out of the row and may combine with a cut (each piece prints with its own marks removed); "forms" prints several texts built
// from the row and refuses to combine with a cut.
const noPill = () => T("no_pill", "none", () => []);

export const PRINT_RULES = {
  // --- a name or a word with filing marks around it ----------------------------------------------------------------
  "biblicaltools_living_lexicon:B02": T("name_alone", "keep", (text, marks) => {
    const m = first(marks, "period.before_a_pointer_with_no_target", "open_paren.holds_a_correction_with_its_number_lost");
    return m ? [before(text, m.i)] : null;
  }),
  "biblicaltools_living_lexicon:B03": T("name_alone", "keep", (text, marks) => {
    const ms = all(marks, "semicolon.between_parts_of_a_sentence_on_one_name");
    return ms.length ? [after(text, ms[ms.length - 1].i)] : null;
  }),
  "biblicaltools_living_lexicon:B04": T("two_forms", "forms", (text, marks) => {
    const p = pair(marks, "open_paren.holds_a_part_that_may_join", "close_paren.holds_a_part_that_may_join");
    return p ? twoForms(text, p[0], p[1]) : null;
  }),
  "biblicaltools_living_lexicon:B05": T("name_alone", "keep", (text, marks) => {
    const m = first(marks, "open_paren.holds_a_note_on_the_margin", "open_paren.holds_a_note_on_the_article", "open_paren.holds_a_verse_place_beside_a_name");
    return m ? [[wordBefore(text, m.i)]] : null;
  }),
  "hewiktionary_hebrew_exact_english_translation:B03": T("no_number", "remove", (text, marks) => {
    const p = pair(marks, "open_paren.holds_a_definition_number", "close_paren.holds_a_definition_number");
    return p ? [remove(whole(text), p[0], p[1] + 1)] : null;
  }),
  "lexibank_analysed_v2_2_northeuralex_hebrew:B01": T("two_readings", "forms", (text, marks) => {
    const p = pair(marks, "open_paren.holds_another_wording", "close_paren.holds_another_wording");
    if (!p) return null;
    const out = [before(text, p[0])];
    let from = p[0] + 1;
    for (const m of all(marks, "comma.between_wordings_in_round_brackets")) { if (m.i > p[0] && m.i < p[1]) { out.push([[from, m.i]]); from = m.i + 1; } }
    out.push([[from, p[1]]]);
    return out;
  }),
  "lexibank_analysed_v2_2_northeuralex_hebrew:B02": T("word_alone", "keep", (text, marks) => {
    const m = first(marks, "open_paren.holds_a_stand_in", "open_paren.holds_a_tie_word_phrase", "open_paren.holds_a_kind_label", "open_paren.holds_narrowing_words");
    return m ? [before(text, m.i)] : null;
  }),
  "macula_hebrew_cherith_surface_english_2022:B03": T("number_off", "remove", (text, marks) => {
    const p = pair(marks, "open_paren.holds_one_number", "close_paren.holds_one_number");
    return p ? [remove(whole(text), p[0], p[1] + 1)] : null;
  }),
  "openscriptures_bdb_1906:B04": T("leave_off", "remove", (text, marks) => {
    const m = first(marks, "comma.at_end_of_text", "period.closes_the_text");
    return m ? [remove(whole(text), m.i, text.length)] : null;
  }),
  "openscriptures_lexical_index:B01": T("before_those_words", "keep", (text, marks) => {
    const m = first(marks, "period.before_a_pointing_word", "period.in_unbalanced_text");
    if (m) return [before(text, m.i)];
    const c = first(marks, "close_paren.holds_the_margin_note_before_a_pointing_word");
    return c ? [[[0, c.i + 1]]] : null;
  }),
  "openscriptures_lexical_index:B02": T("two_forms", "forms", (text, marks) => {
    const p = pair(marks, "open_paren.holds_an_ending_that_may_join", "close_paren.holds_an_ending_that_may_join");
    return p ? twoForms(text, p[0], p[1]) : null;
  }),
  "panlex_hebrew_english_definitions_20250201:B02": T("without_marks", "remove", (text, marks) => {
    let keep = whole(text);
    for (const m of all(marks, "apostrophe.doubled_working_mark")) keep = remove(keep, m.i, m.i + 1);
    for (const o of all(marks, "open_angle.opens_a_tag")) { const c = marks.find((m) => m.shape === "close_angle.closes_a_tag" && m.i > o.i); if (c) keep = remove(keep, o.i, c.i + 1); }
    const brace = first(marks, "open_brace.in_unbalanced_text");
    if (brace) keep = remove(keep, brace.i, text.length);
    const link = first(marks, "pipe.between_a_link_target_and_its_word");
    if (link) keep = remove(keep, 0, link.i + 1);
    const quotes = all(marks, "quote.wraps_the_row").map((m) => m.i);
    if (quotes.length >= 2) {
      const inner = quotes.slice(1, -1);
      const drop = [quotes[0], quotes[quotes.length - 1]];
      for (let j = 0; j + 1 < inner.length; j += 1) if (inner[j + 1] === inner[j] + 1) { drop.push(inner[j]); j += 1; }   // a doubled quote prints once
      for (const i of drop) keep = remove(keep, i, i + 1);
    }
    const colon = first(marks, "colon.at_the_head_of_the_text");
    if (colon) keep = remove(keep, colon.i, colon.i + 1);
    return [keep];
  }),
  "panlex_hebrew_english_definitions_20250201:B04": T("without_note", "remove", (text, marks) => {
    let keep = whole(text);
    const h = first(marks, "hyphen.before_a_note_to_the_source_keepers");
    if (h) keep = remove(keep, h.i, text.length);
    const p = pair(marks, "open_paren.holds_a_note_to_the_source_keepers", "close_paren.holds_a_note_to_the_source_keepers");
    if (p) keep = remove(keep, p[0], p[1] + 1);
    return h || p ? [keep] : null;
  }),
  "panlex_hebrew_english_meanings_20240301:B04": T("word_alone", "keep", (text, marks) => {
    const link = first(marks, "pipe.between_a_link_target_and_its_word");
    if (link) return [after(text, link.i)];
    const low = first(marks, "low_line.between_a_word_and_its_kind");
    if (low) return [before(text, low.i)];
    const ap = first(marks, "apostrophe.doubled_with_nothing_inside");
    if (ap) return [before(text, ap.i)];
    const cy = first(marks, "period.after_a_cyrillic_letter");
    if (cy) { const [s] = wordBefore(text, cy.i); return [before(text, s)]; }                    // «lioness ж.» → lioness
    return null;
  }),
  "wikidata_hebrew_lexeme_gloss:B05": T("name_alone", "keep", (text, marks) => {
    const p = pair(marks, "open_paren.holds_a_name_after_its_label", "close_paren.holds_a_name_after_its_label");
    return p ? [between(p[0], p[1])] : null;
  }),
  "wikimedia_hebrew_english_interlanguage_title_20260701:B01": T("name_alone", "keep", (text, marks) => {
    const m = first(marks, "open_paren.around_the_word_disambiguation");
    return m ? [before(text, m.i)] : null;
  }),
  // the branch reads its 13 rows one by one and says which side renders the Hebrew; the table is its words
  "wikimedia_hebrew_english_interlanguage_title_20260701:B02": T("named_part", "keep", (text, marks) => {
    const side = NAMED_PART[text];
    if (side === undefined) throw new Error(`named_part: the branch's list does not name «${text}»`);
    const m = first(marks, "number_sign.between_a_page_and_its_part");
    if (!m) return null;
    if (side === null) return NONE;
    return [side === "after" ? after(text, m.i) : before(text, m.i)];
  }),
  // --- the filing tags this corpus's own script wrote on ConceptNet's rows ---------------------------------------
  // The owner, 6 November: a tag this corpus wrote is not provider text, so it came off the route text itself
  // (row-strike-rule-v3, retext from the definition slot). The corpus lane reissued both ledgers against the
  // retexted store (v113.1: 4 shapes, no branch; v128.2: no mark at all, a note in place of a ledger), so the four
  // tag_off entries that stood here until 7 November reach no shape and are gone; the rulings they applied stand
  // in data/ledger-branch-answers-v1.json under "retired", as the record of what was asked and answered.
  // --- rows that render nothing a translator could print ---------------------------------------------------------
  "classical_hebrew_words:B05": noPill(),
  "dbnary_english_wiktionary_hebrew_translation_gloss:B01": noPill(),
  "hewiktionary_hebrew_exact_english_translation:B02": noPill(),
  "hewiktionary_hebrew_explicit_full_spelling_english_translation:B02": noPill(),
  "hewiktionary_hebrew_explicit_inflection_english_translation:B02": noPill(),
  "hiperbiblia_sdbh:B03": noPill(),
  "kaikki_english_wiktionary_hebrew_translation_table:B01": noPill(),
  "macula_hebrew_cherith_surface_english_2022:B02": noPill(),
  "omegawiki_structured_defined_meaning:B02": noPill(),
  "panlex_hebrew_english_definitions_20250201:B03": noPill(),
  "panlex_hebrew_english_meanings_20240301:B02": noPill(),
  "panlex_hebrew_english_meanings_20240301:B03": noPill(),
  "stepbible_tahot_aligned_translation:B01": noPill(),
  "stepbible_tahot_aligned_translation:B02": noPill(),
  "stepbible_tahot_aligned_translation:B03": noPill(),
  "stepbible_tahot_aligned_translation:B04": noPill(),
  "stepbible_tbesh_gloss:B04": noPill(),
  "stepbible_tbesh_gloss:B05": noPill(),
  "wikidata_hebrew_explicit_form_english_sense:B06": noPill(),
  "wikidata_hebrew_lexeme_gloss:B04": noPill(),
};

/** Wikimedia B02, in the branch's own words: which side of the number sign renders the Hebrew, row by row */
const NAMED_PART = {
  "Quartz#Citrine": "after", "Employment#Employer": "after", "Races of StarCraft#Terrans": "after", "Bereavement in Judaism#Yizkor": "after",
  "Names of God in Judaism#Tzevaot": "after", "Moab#Moabite language": "after", "Paralanguage#Sighs": "after", "Veil#Wedding veils": "after",
  "Brush#Paintbrushes": "before", "Paintbrush#paintbrushes": "before", "Activation#Chemistry": "before",
  "World#Religion and mythology": null, "Hadith studies#The sanad and the matn": null,
};

/** What a row prints under its answered branch: { texts } ([] = no pill), or null where the rule does not reach the row.
 *  `marks` are the row's classified marks (every shape); `cuts` the row's dividing marks (row[7]); the rule's kind says
 *  whether the two may combine. */
export const printOf = (ruleKey, text, marks, cuts = []) => {
  const rule = PRINT_RULES[ruleKey];
  if (!rule) return null;
  const keeps = rule.print(text, marks);
  if (keeps === null) return null;
  if (rule.kind === "none" || keeps === NONE) return { texts: [] };
  // a step that keeps, offers forms or removes marks prints SOMETHING: a row it
  // would print nothing for is an error the caller refuses on, never a silent
  // no pill (the review of 6 November: an empty kept range was counted as "no
  // pill" and no branch had said so)
  const nothing = () => new Error(`${ruleKey} (${rule.option}, ${rule.kind}) prints nothing for «${text.slice(0, 60)}», and no branch says the row has no pill`);
  if (!keeps.length) throw nothing();
  if (cuts.length) {
    if (rule.kind !== "remove") throw new Error(`${ruleKey} (${rule.option}, ${rule.kind}) cannot combine with a cut at [${cuts}] on «${text.slice(0, 60)}»`);
    const [keep] = keeps;
    const pieces = []; let from = 0;
    for (const i of [...cuts, text.length]) { pieces.push(join(text, keep.filter(([a, b]) => b > from && a < i).map(([a, b]) => [Math.max(a, from), Math.min(b, i)]))); from = i + 1; }
    const texts = pieces.filter(Boolean);
    if (!texts.length) throw nothing();
    return { texts };
  }
  const texts = keeps.map((keep) => join(text, keep));
  if (texts.some((t) => !t)) throw nothing();
  return { texts };
};

/** the branch's own examples, from its "means" */
export const FIXTURES = [
  ["biblicaltools_living_lexicon:B02", "Merari. See also", ["Merari"]],
  ["biblicaltools_living_lexicon:B02", "Tikvath (by correction for )", ["Tikvath"]],
  ["biblicaltools_living_lexicon:B03", "once (Psalm 132:6) perhaps for Ephraim; also of an Israelitish woman; Ephrath", ["Ephrath"]],
  ["biblicaltools_living_lexicon:B04", "fool (ish)", ["fool", "foolish"]],
  ["biblicaltools_living_lexicon:B04", "Mede (-s)", ["Mede", "Medes"]],
  ["biblicaltools_living_lexicon:B04", "(over) against", ["against", "over against"]],
  ["biblicaltools_living_lexicon:B04", "Jobesh (-Gilead)", ["Jobesh", "Jobesh-Gilead"]],
  ["biblicaltools_living_lexicon:B04", "to (wards)", ["to", "towards"]],
  ["biblicaltools_living_lexicon:B04", "labour (er)", ["labour", "labourer"]],
  ["biblicaltools_living_lexicon:B05", "Ephai (from margin)", ["Ephai"]],
  ["biblicaltools_living_lexicon:B05", "and Zehoar (from the margin)", ["Zehoar"]],
  ["biblicaltools_living_lexicon:B05", "Hakkatan (including the article)", ["Hakkatan"]],
  ["biblicaltools_living_lexicon:B05", "Micaiah (2 Chronicles 18:8)", ["Micaiah"]],
  ["hewiktionary_hebrew_exact_english_translation:B03", "mount (1)", ["mount"]],
  ["lexibank_analysed_v2_2_northeuralex_hebrew:B01", "LONGING (WISH)", ["LONGING", "WISH"]],
  ["lexibank_analysed_v2_2_northeuralex_hebrew:B01", "LID (COVER, CAP)", ["LID", "COVER", "CAP"]],
  ["lexibank_analysed_v2_2_northeuralex_hebrew:B01", "DWELL (LIVE, RESIDE)", ["DWELL", "LIVE", "RESIDE"]],
  ["lexibank_analysed_v2_2_northeuralex_hebrew:B02", "SWING (SOMETHING)", ["SWING"]],
  ["lexibank_analysed_v2_2_northeuralex_hebrew:B02", "WAIT (FOR)", ["WAIT"]],
  ["macula_hebrew_cherith_surface_english_2022:B03", "Ben (1128)", ["Ben"]],
  ["openscriptures_bdb_1906:B04", "have a just cause,", ["have a just cause"]],
  ["openscriptures_bdb_1906:B04", "security.", ["security"]],
  ["openscriptures_lexical_index:B01", "Kadesh. Compare", ["Kadesh"]],
  ["openscriptures_lexical_index:B01", "Dibon. (Als", ["Dibon"]],
  ["openscriptures_lexical_index:B01", "Iddo (from the margin) See", ["Iddo (from the margin)"]],
  ["openscriptures_lexical_index:B02", "Mede(-s)", ["Mede", "Medes"]],
  ["openscriptures_lexical_index:B02", "Mehunim(-s)", ["Mehunim", "Mehunims"]],
  ["panlex_hebrew_english_definitions_20250201:B02", "tree of the ''Acer'' genus", ["tree of the Acer genus"]],
  ["panlex_hebrew_english_definitions_20250201:B02", "O<sub>3</sub>", ["O3"]],
  ["panlex_hebrew_english_definitions_20250201:B02", "<u>au</u>tomobile", ["automobile"]],
  ["panlex_hebrew_english_definitions_20250201:B02", "to date {{jump|t|date|s", ["to date"]],
  ["panlex_hebrew_english_definitions_20250201:B02", "\"personal pronoun \"\"he\"\"\"", ["personal pronoun \"he\""]],
  ["panlex_hebrew_english_definitions_20250201:B02", "#Barcelona (Englisch)|Barcelona", ["Barcelona"]],
  ["panlex_hebrew_english_definitions_20250201:B02", ": sex partner without emotional attachment", ["sex partner without emotional attachment"]],
  ["panlex_hebrew_english_definitions_20250201:B04", "day after tomorrow - translation entry", ["day after tomorrow"]],
  ["panlex_hebrew_english_definitions_20250201:B04", "David (disambiguation)", ["David"]],
  ["panlex_hebrew_english_definitions_20250201:B04", "a programming language (transliterations)", ["a programming language"]],
  ["panlex_hebrew_english_meanings_20240301:B04", "#Barcelona |Barcelona", ["Barcelona"]],
  ["panlex_hebrew_english_meanings_20240301:B04", "Pole_person", ["Pole"]],
  ["panlex_hebrew_english_meanings_20240301:B04", "labor '' ''", ["labor"]],
  ["panlex_hebrew_english_meanings_20240301:B04", "lioness ж.", ["lioness"]],
  ["wikidata_hebrew_lexeme_gloss:B05", "given name (Adva)", ["Adva"]],
  ["wikidata_hebrew_lexeme_gloss:B05", "family name (Albert)", ["Albert"]],
  ["wikimedia_hebrew_english_interlanguage_title_20260701:B01", "Dolls (disambiguation)", ["Dolls"]],
  ["wikimedia_hebrew_english_interlanguage_title_20260701:B02", "Quartz#Citrine", ["Citrine"]],
  ["wikimedia_hebrew_english_interlanguage_title_20260701:B02", "Moab#Moabite language", ["Moabite language"]],
  ["wikimedia_hebrew_english_interlanguage_title_20260701:B02", "Brush#Paintbrushes", ["Brush"]],
  ["wikimedia_hebrew_english_interlanguage_title_20260701:B02", "World#Religion and mythology", []],
  ["stepbible_tahot_aligned_translation:B01", "<the>", []],
  ["stepbible_tahot_aligned_translation:B03", "Pedah-", []],
  ["dbnary_english_wiktionary_hebrew_translation_gloss:B01", "mega-", []],
  ["hiperbiblia_sdbh:B03", "[untranslated]", []],
];

/** Runs every fixture through the ledger's own classifier. `classifiers` maps source key -> classify(text); a fixture
 *  whose classifier is not given is skipped and named. Returns { failed: [...], skipped: [...] }. */
export const selfTest = (classifiers, declarations) => {
  const failed = [], skipped = [];
  for (const [ruleKey, text, expect] of FIXTURES) {
    const [source, branch] = ruleKey.split(":");
    const classify = classifiers.get(source);
    if (!classify) { skipped.push(ruleKey); continue; }
    const decl = declarations.get(source);
    const b = (decl.branches || []).find((x) => x.id === branch);
    const shapes = new Set(b ? b.shapes || [] : []);
    let marks;
    try { marks = classify(text).filter((m) => shapes.has(m.shape)); } catch (e) { failed.push(`${ruleKey} «${text}»: the classifier refuses it: ${e.message}`); continue; }
    let got;
    try { got = printOf(ruleKey, text, marks, []); } catch (e) { failed.push(`${ruleKey} «${text}»: ${e.message}`); continue; }
    const texts = got ? got.texts : null;
    if (JSON.stringify(texts) !== JSON.stringify(expect)) failed.push(`${ruleKey} «${text}»: expected ${JSON.stringify(expect)}, got ${JSON.stringify(texts)}`);
  }
  return { failed, skipped, ran: FIXTURES.length - skipped.length };
};
