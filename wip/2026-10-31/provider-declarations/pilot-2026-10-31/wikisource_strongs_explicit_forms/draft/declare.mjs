#!/usr/bin/env node
// Writes declaration.json (declarations-v1.json provider shape) for
// wikisource_strongs_explicit_forms from census.json. Every number is read
// from the census; the words are the ledger's. Run census.mjs first.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const C = JSON.parse(readFileSync(join(HERE, "census.json"), "utf8"));
const n = (x) => Number(x || 0).toLocaleString("en-US");
const M = new Map(C.marks.map((m) => [m.mark, m]));
const sh = (mark, shape) => ((M.get(mark) || { shapes: [] }).shapes.find((s) => s.shape === shape) || { count: 0 }).count;
const ex = (mark, shape, k = 0) => (((M.get(mark) || { shapes: [] }).shapes.find((s) => s.shape === shape) || { examples: [] }).examples[k] || "");
const shapesOf = (mark) => Object.fromEntries((M.get(mark) || { shapes: [] }).shapes.map((s) => [s.shape, s.count]));
const divs = (mark) => (M.get(mark) || { shapes: [] }).shapes.filter((s) => s.divides_readings).map((s) => s.shape);
const regionsOf = (mark) => [...new Set((M.get(mark) || { shapes: [] }).shapes.flatMap((s) => Object.keys(s.region)))];
const A = C.august_test, V = C.v3_comparison, F = C.falsifier_tests, R = C.route_region.counts, D = C.damage;
const entry = (mark, o) => ({ ...o, governs: M.get(mark).occurrences, routes: M.get(mark).routes, shapes: shapesOf(mark), divides_on: divs(mark), regions_seen: regionsOf(mark), unexplained: M.get(mark).unexplained });

const POINTS = C.marks.filter((m) => m.shapes.length === 1 && m.shapes[0].shape === "point.in_hebrew_word");
const marks = {
  "(": entry("(", {
    means: `In the rendering list, the provider's own sign for a word or syllable sometimes given with the principal word it is annexed to: one optional word (${n(sh("(", "paren.optional_words"))}), alternatives for that word (${n(sh("(", "paren.alternatives"))}), a suffix syllable (${n(sh("(", "paren.suffix_syllable"))}) or a prefix syllable (${n(sh("(", "paren.prefix_syllable"))}); or the provider's note on an irregular rendering ('from the margin', 'by mistake for ...', a citation: ${n(sh("(", "paren.list_aside"))}). In the definition head it is an aside in Strong's own sentence (${n(sh("(", "paren.head_aside"))}); after the list it wraps a note (${n(sh("(", "paren.note"))}). It never divides a reading, and a group is never distributed across its head.`,
    region_dependent: true,
    evidence: `${ex("(", "paren.optional_words")} | ${ex("(", "paren.alternatives")} | ${ex("(", "paren.suffix_syllable")} | ${ex("(", "paren.prefix_syllable")} | ${ex("(", "paren.list_aside")}`,
    falsifier: `A route in the rendering list that is one group with nothing outside it has no principal word to annex to: ${n(F.list_route_that_is_one_group_with_nothing_outside.routes)} routes today ('(put)', '(deal, make)', '(-ing father)'), the provider set each between depth-0 commas, and the store's division at those commas left it with no principal word. They are notation, printed as they stand; see open question 3.`,
    august: { said: "scope over the alternation: the group distributes across its head", verdict: "corrected", why: A.paren.verdict },
  }),
  ")": entry(")", {
    means: `Closes the group its '(' opened, with that group's meaning. A ')' with nothing open (${n(sh(")", "paren.closer_with_nothing_open"))}) is damage and is inert: it stays inside whichever piece it falls in.`,
    region_dependent: true,
    evidence: `${ex(")", "paren.closer_with_nothing_open")} — the provider's own text has the stray closer`,
    falsifier: `Pieces that do not rejoin to their route once the orphan is held inert: checked on every route, ${n(C.declaration_division.refused_rejoin)} today.`,
    august: { said: "closes the scope", verdict: "held" },
  }),
  ",": entry(",", {
    means: `In the definition's rendering list a depth-0 comma separates one KJV rendering from the next; the store has already divided there, so in route text a depth-0 comma survives in ${n(sh(",", "comma.rendering_separator"))} route (a trailing comma). Inside a group it separates the alternatives of the optional part and divides nothing (${n(sh(",", "comma.in_group"))}; ${n(sh(",", "comma.in_unclosed_group"))} more inside a group that never closes; ${n(sh(",", "comma.in_aside"))} inside a note group). In the head it sits only inside asides in today's routes (${n(sh(",", "comma.in_head_aside"))}); after the list it is prose (${n(sh(",", "comma.note_prose"))}).`,
    region_dependent: true,
    evidence: `${ex(",", "comma.in_group")} | ${ex(",", "comma.rendering_separator")} | ${n(A.comma.now.routes_with_a_comma_inside_a_group)} routes carry a comma inside a group`,
    falsifier: `A depth-0 list comma whose right side is a syllable, not a rendering: the store cut ${n(F.suffix_led_list_items)} routes that begin with a syllable ('-s', '-th', '(-ing father)'); the provider wrote 'seven(-fold),-s', where the comma attaches the syllable to the rendering before it. The page does not re-join them (that would join pieces the store divided); see open question 3.`,
    august: { said: "alternation — separates one rendering from the next, scoped by (", verdict: "held", why: A.comma.verdict },
  }),
  ";": entry(";", {
    means: `At depth 0 in the definition head, separates etymology from sense and one sense from the next (${n(sh(";", "semicolon.head_separator"))}). At depth 0 in the rendering list, separates one rendering from the next as a comma does (${n(sh(";", "semicolon.rendering_separator"))}; ${n(A.semicolon.now.definitions_with_a_depth0_semicolon_in_the_list)} definitions write it there). Part of the list opener where the text has no colon ('; -', '; --': ${n(sh(";", "semicolon.opener"))}). Inside head asides (${n(sh(";", "semicolon.in_head_aside"))}) and in notes (${n(sh(";", "semicolon.note_prose"))}) it is prose and divides nothing.`,
    region_dependent: true,
    evidence: `${ex(";", "semicolon.rendering_separator")} | ${ex(";", "semicolon.head_separator")} | ${ex(";", "semicolon.opener")}`,
    falsifier: `A depth-0 list ';' whose two sides are one rendering. The ${n(sh(";", "semicolon.rendering_separator"))} occurrences in ${n(A.semicolon.now.definitions_with_a_depth0_semicolon_in_the_list)} definitions were not each read; the examples in census.json were, and each divides two renderings.`,
    august: { said: "separates etymology from sense, and sense from sense, in the head", verdict: "extended", why: A.semicolon.verdict },
  }),
  ":": entry(":", {
    means: `The list opener: the last colon in the definition not followed by a digit separates Strong's definition from the KJV rendering list (${n(sh(":", "colon.opener"))} inside a route; in ${n(A.colon.now.rows_whose_definition_has_a_list_opener)} rows the definition has an opener). Between digits it is a chapter:verse citation and divides nothing (${n(sh(":", "colon.citation"))}).`,
    region_dependent: true,
    evidence: `${ex(":", "colon.opener")} | ${ex(":", "colon.citation")} | opener kinds over ${n(C.distinct_definitions)} definitions: ${JSON.stringify(C.definition_list_opener.by_kind_over_distinct_definitions)}`,
    falsifier: `A definition where an earlier non-citation colon carries more of its routes than the last one: ${n(F.opener_last_colon.definitions_where_an_earlier_colon_covers_more_routes_than_the_last)} of ${n(F.opener_last_colon.definitions_with_two_or_more_non_citation_colons)} definitions with two or more.`,
    august: { said: "separates the definition from the KJV rendering list", verdict: "extended", why: A.colon.verdict },
  }),
  ".": entry(".", {
    means: `Three dots inside a rendering: the KJV phrase runs on through words that render other Hebrew words (${n(sh(".", "period.ellipsis"))}). The first depth-0 full stop after the opener ends the rendering list and divides the last rendering from the note after it (${n(sh(".", "period.list_end"))}). Elsewhere it closes an abbreviation (${n(sh(".", "period.abbreviation"))}) or a sentence of a note or of the head (${n(sh(".", "period.note_sentence_end"))}, ${n(sh(".", "period.head_sentence_end"))}), or is a stray stop inside one rendering (${n(sh(".", "period.stray_in_rendering"))}); none of those divides.`,
    region_dependent: true,
    evidence: `${ex(".", "period.ellipsis")} | ${ex(".", "period.list_end")} | ${ex(".", "period.list_end", 2)}`,
    falsifier: "A piece after the list's full stop that is a rendering, not a note: 'Ludim. Lydians' and 'landmark. place' read as a stop written for a comma. The division is the same either way; what the second piece is, is open question 1.",
  }),
  "-": entry("-", {
    means: `Syllable notation inside one rendering: a suffix that attaches to the end of the principal word (${n(sh("-", "hyphen.suffix_syllable"))}), a prefix that attaches to the start of the next word (${n(sh("-", "hyphen.prefix_syllable"))}), a syllable mark parted from its syllable by a stray space (${n(sh("-", "hyphen.detached_syllable"))}), or the hyphen itself as the optional element (${n(sh("-", "hyphen.bare_in_group"))}). Between letters, part of a compound or a name (${n(sh("-", "hyphen.compound"))}). Inside the opener, the opener's tail (${n(sh("-", "hyphen.opener_tail"))}; once written after the first rendering, ${n(sh("-", "hyphen.misplaced_opener_tail"))}). It divides nothing itself; the opener it ends divides.`,
    region_dependent: true,
    evidence: `${ex("-", "hyphen.suffix_syllable")} | ${ex("-", "hyphen.prefix_syllable")} | ${ex("-", "hyphen.opener_tail", 1)} | ${ex("-", "hyphen.compound")}`,
    falsifier: `A route whose first character is a hyphen that does not sit in the definition's opener: ${n(F.hyphen_at_route_head_not_in_the_opener)} today (${Object.entries(C.head_mark_test.not_opener_tail_texts || {}).map(([k, v]) => `'${k}' ${v}`).join(", ")}), all suffix syllables. So the head-dash rule reads the definition position, never the route's first character.`,
    rule: "Not expanded. A syllable is never attached and a group never distributed: 'in(-curable)' stays as written.",
    august: { said: "attach at the stem, not concatenate", verdict: "extended", why: A.hyphen.verdict },
  }),
  "+": entry("+", {
    means: `The provider's sign on a rendering that renders this Hebrew word only together with one or more other Hebrew words: on the whole rendering (${n(sh("+", "plus.whole_rendering"))}), on one alternative inside a group (${n(sh("+", "plus.in_group"))}), or on the words after it inside one rendering (${n(sh("+", "plus.mid_rendering"))}). An annotation; it divides nothing and is never stripped.`,
    annotation: true, region_dependent: false,
    evidence: `${ex("+", "plus.whole_rendering")} | ${ex("+", "plus.in_group")} | ${ex("+", "plus.mid_rendering")} | ${n(A.X.now.definitions_with_plus_or_X_in_the_head)} definitions carry '+' or 'X' in the head; ${n(A.plus.now.definitions_with_plus_in_the_list)} carry '+' in the list`,
    falsifier: "A '+' in the definition head, where no rendering stands: 0 today.",
    august: { said: "the word is supplied by the translators and is not in the Hebrew", verdict: "corrected", why: A.plus.verdict },
  }),
  X: {
    means: `The provider's sign (a standalone capital X) on a rendering that results from an idiom peculiar to the Hebrew: on the whole rendering (${n(sh("X", "x.whole_rendering"))}), inside a group (${n(sh("X", "x.in_group"))}), or mid-rendering (${n(sh("X", "x.mid_rendering"))}). An annotation; never stripped. It is a letter, so the mark inventory does not see it and the closure check does not cover it.`,
    annotation: true, region_dependent: false,
    governs: M.get("X").occurrences, routes: M.get("X").routes, shapes: shapesOf("X"), divides_on: [], regions_seen: regionsOf("X"), unexplained: 0,
    evidence: `${ex("X", "x.whole_rendering")} | ${ex("X", "x.in_group")} | ${n(A.X.now.definitions_with_X_in_the_list)} definitions carry X in the list, 0 in the head`,
    falsifier: "An X in the definition head: 0 today.",
    august: { said: "the word appears only inside an idiom, never as a bare equivalent", verdict: "held", why: A.X.verdict },
  },
  "`": entry("`", { means: "Ayin in a romanized Hebrew word, inside the provider's note on a rendering ('by mistake for `anah'). Part of the word.", region_dependent: false, evidence: ex("`", "backtick.ayin_in_transliteration"), falsifier: "A backtick touching no letter: 0." }),
  "'": entry("'", { means: "An English apostrophe ('one's', 'father's') or aleph in a romanized word. Part of the word.", region_dependent: false, evidence: ex("'", "apostrophe.english"), falsifier: "An apostrophe touching no letter: 0." }),
  '"': entry('"', { means: "Quotation marks around a rendering or phrase quoted in the provider's note. Divides nothing.", region_dependent: false, evidence: ex('"', "quote.quotation"), falsifier: "A quotation mark inside a plain rendering outside any note: not seen." }),
  "&": entry("&", { means: "Written inside the rendering list where the list elsewhere writes words or a sign ('& presume', 'lay & to (take a) pledge'). Unresolved (open question 5); it divides nothing either way.", region_dependent: false, evidence: ex("&", "ampersand.in_rendering"), falsifier: "None the data can run; the provider's printed page settles it." }),
  "?": entry("?", { means: "An interrogative rendering or sense ('where?'). Part of the reading.", region_dependent: false, evidence: ex("?", "question.interrogative"), falsifier: "A '?' after no letter: 0." }),
  "!": entry("!", { means: "An exclamation inside one rendering ('+ O that! what'). Part of the reading.", region_dependent: false, evidence: ex("!", "exclamation.in_rendering"), falsifier: "A '!' after no letter: 0." }),
};
for (const m of POINTS) {
  marks[m.mark] = {
    means: `A vowel point or accent (${m.codepoint}) of a Hebrew word quoted in the route — an etymology or cross-reference such as 'corresponding to' or 'Marg. for'.${m.codepoint === "U+05AB" ? " U+05AB is the stress accent the provider prints on the quoted word." : ""} Part of that word; divides nothing.`,
    region_dependent: false, governs: m.occurrences, routes: m.routes, shapes: shapesOf(m.mark), divides_on: [], regions_seen: regionsOf(m.mark), unexplained: m.unexplained,
    evidence: ex(m.mark, "point.in_hebrew_word"),
    falsifier: "A point not preceded by a Hebrew letter or point: 0.",
  };
}

const DD = C.declaration_division, PR = DD.pieces_by_region_of_the_definition;
const OPEN = [
  `1. Pieces that are not KJV renderings. Where a route runs across the opener, the list's full stop or a head ';', the cut leaves ${n(PR.head + PR.no_opener)} pieces from Strong's own definition (${n(PR.head_etymology_shaped + PR.no_opener_etymology_shaped)} etymology-shaped: 'a primitive root', 'from ...', '(Aramaic) corresponding to ...') and ${n(PR.notes)} notes after the list ('(Superlative of ...)', 'Yrechow', 'Often unexpressed in English'), in ${n(DD.routes_with_a_piece_from_the_head_or_notes)} routes. Reading A: each prints as a reading, as today's engine already prints the head pieces it cuts at ';'. Reading B: each is kept and printed beside the readings as the provider's definition or note, not as a reading (nothing discarded; the piece carries its region). Some note pieces read as a stop written for a comma ('Ludim. Lydians', 'landmark. place'); those are renderings under either reading.`,
  `2. Damaged parentheses. ${n(V.v3_withholds_where_declaration_prints)} routes print nothing today (sense-split rule 4 with gloss-store holds a damaged sense back) and print whole under the August refusal rule this declaration keeps; ${n(V.v3_withholds_by_cause.definition_itself_unbalanced)} come from a definition whose own parentheses do not balance ('selves)', the provider's 'circumcise(-ing), selves)'), ${n(V.v3_withholds_by_cause.definition_balanced_store_cut_through_a_group)} from the store cutting through a group the provider closed ('irreg.)', '48 marg)'). Reading A: print whole (August: refusing cost the reader every reading in the row). Reading B: withhold (v3: a text that cannot balance is a text something already edited). A third course, for the ${n(V.v3_withholds_by_cause.definition_balanced_store_cut_through_a_group)} only: ask the store to re-cut at the provider's own group.`,
  `3. Notation with no principal word. ${n(F.suffix_led_or_lone_group_list_items_union)} list routes are a syllable or a group standing alone (${n(F.suffix_led_list_items)} suffix-led: '-s', '-th', '-or)', '(-ing father)'; ${n(F.list_route_that_is_one_group_with_nothing_outside.routes)} one group with nothing outside: '(put)', '(deal, make)', '(depart)'), because the provider set them between depth-0 commas and the store divided there. Reading A: print them as they stand. Reading B: the store re-cuts so each stays in one route with the rendering the provider attached it to ('seven(-fold),-s'), which keeps the provider's characters in one run and is a store change, not a page derivation.`,
  `4. What '+' means (${n(M.get("+").occurrences)} occurrences, ${n(M.get("+").routes)} routes). August: 'supplied by the translators and not in the Hebrew'. This declaration: the provider's own sign, a rendering made in connection with one or more other Hebrew words. The store does not carry Strong's 'signs employed' page; the owner confirms from it. The division is the same under both; only the gloss on the sign changes.`,
  `5. '&' in the rendering list (${n(M.get("&").routes)} routes: '& presume', 'lay & to (take a) pledge'): 'and', or a sign (X or +) damaged in transcription. Nothing divides either way.`,
  `6. License. The August export line names cc_by_4_0_underlying_public_domain; the store's M14 record says cc_by_sa_4_0_underlying_public_domain (share-alike). This declaration follows the store; the owner confirms, since it governs the export of all ${n(C.routes)} routes.`,
  `7. Routes cut after a chapter:verse colon (${n(V.routes_cut_after_a_citation_colon.routes)}: '3', '10', '18', '48 marg)'): the store took a citation's verse number as a rendering. Today's engine prints ${n(V.routes_cut_after_a_citation_colon.v3_prints)} and withholds ${n(V.routes_cut_after_a_citation_colon.v3_withholds)} (unbalanced); this declaration prints all ${n(V.routes_cut_after_a_citation_colon.declaration_prints)} whole. Reading A: print, as the provider's characters. Reading B: the store re-cuts the definition with the citation colon read as a citation.`,
];
const decl = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  providers: {
    wikisource_strongs_explicit_forms: {
      label: "Strong's Hebrew concordance with explicit source form lists",
      m_ids: C.m_ids,
      routes: C.routes,
      declared_on: "2026-10-31",
      supersedes: `the declaration of 2026-08-17, read across ${n(A.routes_then)} routes`,
      declared_from: `The entry's own structure, read across all ${n(C.routes)} routes on ${n(C.distinct_definitions)} definitions and ${n(C.distinct_keys)} keys. ${n(R.list_item)} routes (${(100 * R.list_item / C.routes).toFixed(2)}%) are exactly one depth-0 item of the KJV rendering list after the opener, so the store now divides at the provider's depth-0 comma before the page sees the text; ${n(A.colon.now.routes_equal_to_the_whole_multi_item_list)} routes are a whole multi-item list. The remaining ${n(C.routes - R.list_item)} sit in the head (${n(R.head)}), run across the opener (${n(R.spans_opener)}) or the list's full stop (${n(R.spans_list_end)}), lie in the notes (${n(R.notes)}), inside the list but not one item (${n(R.list_part)}), or in a definition with no opener (${n((R.no_opener || 0) + (R.whole_definition_no_opener || 0))}). Every one of the ${n(C.marks.reduce((t, m) => t + (m.mark === "X" ? 0 : m.occurrences), 0))} mark occurrences and ${n(M.get("X").occurrences)} X signs falls in exactly one shape; ${n(C.unexplained_total)} unexplained. The inventory's closed set (${n(C.marks.filter((m) => m.inventory).length)} marks) agrees with this count mark for mark: ${C.marks.filter((m) => m.inventory).every((m) => m.inventory.agrees) ? "every occurrence and route count matches" : "SOME COUNTS DIFFER"}.`,
      regions: {
        locate: "The opener is the last ':' (with any '-' after it) not followed by a digit; failing that the first '--', failing that the last '; -'. The list ends at the first depth-0 '.' after the opener that is not part of '...', not 'i.e.' and not '.,'. Head is before the opener, notes after the list's full stop.",
        route_regions: R,
        meaning_depends_on_region: Object.fromEntries(Object.entries(marks).filter(([, v]) => v.region_dependent).map(([k, v]) => [k, v.regions_seen])),
        same_meaning_in_every_region: Object.keys(marks).filter((k) => !marks[k].region_dependent),
      },
      marks,
      marks_in_the_definition_never_in_a_route: C.marks_in_definition_never_in_route.map((x) => x.codepoint),
      absent: { "/": `in the August precedence; ${n(A.slash_in_precedence.slash_occurrences_route)} in routes, ${n(A.slash_in_precedence.slash_occurrences_definition)} in definitions — dropped`, "[": "the provider's own sign for an additional word in the Hebrew; 0 in this text, so closure reports it if it arrives" },
      precedence: ["opener (':', ':--', '--', '; -')", ". (the list's full stop)", ";", ","],
      precedence_note: "Each divides only at depth 0 and only in its region: the opener divides head from list; the list's full stop divides list from notes; ';' divides in the head and in the list, never in notes or asides; ',' divides only in the list. '(' ')' scope every one of them. '-', '+', 'X', '...', '`', \"'\", '\"', '&', '?', '!', a citation ':' and the Hebrew points never divide.",
      refusals: {
        unbalanced_parentheses: {
          routes: D.unbalanced_parentheses_by_cause.routes,
          closer_with_nothing_open: { routes: D.orphan_closer_routes, rule: "separate normally; the orphan is inert (August rule, held)" },
          opener_never_closed: { routes: D.never_closed_routes, rule: "separate up to it; ship the rest whole (August rule, held)" },
          causes: { definition_itself_unbalanced: D.unbalanced_parentheses_by_cause.definition_itself_unbalanced, definition_balanced_store_cut_through_a_group: D.unbalanced_parentheses_by_cause.definition_balanced_store_cut_through_a_group },
          conflict: `Today's engine (sense-split rule 4 with gloss-store) holds a damaged sense back entirely: ${n(V.v3_withholds_where_declaration_prints)} routes print nothing under it and print whole under this rule. Open question 2.`,
        },
        hyphen_attachment: { rule: "ship whole: no syllable is attached", alternatives: sh("-", "hyphen.suffix_syllable") + sh("-", "hyphen.prefix_syllable") + sh("-", "hyphen.detached_syllable") + sh("-", "hyphen.bare_in_group") },
        pieces_that_do_not_rejoin: { rule: "the route ships whole", routes_today: C.declaration_division.refused_rejoin },
      },
      export: `governed by its posture, cc_by_sa_4_0_underlying_public_domain — the store's M14 record today; the August line named cc_by_4_0_underlying_public_domain (open question 6)`,
      separates_on: {
        marks: [
          { shapes: ["colon.opener", "semicolon.opener", "hyphen.opener_tail", "hyphen.misplaced_opener_tail"], divides: "Strong's definition | the KJV rendering list", where: "a route that runs across the opener" },
          { shapes: ["period.list_end"], divides: "the last rendering | the note after the list", where: "a route that runs across the list's full stop" },
          { shapes: ["semicolon.head_separator"], divides: "etymology | sense | sense", where: "head, depth 0" },
          { shapes: ["semicolon.rendering_separator"], divides: "rendering | rendering", where: "list, depth 0" },
          { shapes: ["comma.rendering_separator"], divides: "rendering | rendering", where: "list, depth 0" },
        ],
        scope: "( )",
        rule: "Locate the route in its definition, then cut only at the shapes above, at parenthesis depth 0 and before any unclosed '('. Every piece is kept and is a run of the provider's own characters; the cut characters (and the opener's spaces and dashes) are the mark, not the reading. No piece is joined to another, no group is distributed, no syllable attached, no sign stripped.",
        declared_from: `${n(C.declaration_division.routes_divided)} routes divide into ${n(C.declaration_division.pieces_from_divided)} pieces: ${JSON.stringify(C.declaration_division.by_region)}. Of the pieces, ${n(C.declaration_division.pieces_by_region_of_the_definition.list)} are renderings, ${n(C.declaration_division.pieces_by_region_of_the_definition.head + C.declaration_division.pieces_by_region_of_the_definition.no_opener)} come from Strong's definition (${n(C.declaration_division.pieces_by_region_of_the_definition.head_etymology_shaped + C.declaration_division.pieces_by_region_of_the_definition.no_opener_etymology_shaped)} of them etymology-shaped: 'a primitive root', 'from ...', '(Aramaic) corresponding to ...'), ${n(C.declaration_division.pieces_by_region_of_the_definition.notes)} are notes after the list. The other ${n(C.routes - C.declaration_division.routes_divided)} routes are one reading each.`,
        head_mark: {
          mark: "one or two hyphens at the head of the route that lie in the definition's opener",
          means: "the tail of the opener; the reading begins after them",
          governs: C.head_mark_test.def_has_opener_immediately_before,
          declared_from: `${n(C.head_mark_test.routes_beginning_with_hyphen)} routes begin with a hyphen; in ${n(C.head_mark_test.def_has_opener_immediately_before)} the hyphen sits in the definition's ':--' opener. In the other ${n(F.hyphen_at_route_head_not_in_the_opener)} it is a suffix syllable the store cut off as its own item.`,
          rule: "Read the definition position, not the route's first character. Strip only an opener tail; '-s' stays '-s'.",
          falsifier: `A route whose head hyphen is stripped although it does not lie in the opener. 0 under this rule; ${n(F.hyphen_at_route_head_not_in_the_opener)} under the August test.`,
        },
        machine: "declaration-v1.mjs applies separates_on.mark alone and has no regions; under it this object (no 'mark') ships every route whole. Applying it needs the locate step census.mjs uses. On today's text the August declaration's own separation (depth-0 comma) divides 0 routes, because the store divides at that comma first.",
      },
      changes_from_august: [
        { mark: ":", verdict: "extended", what: A.colon.verdict },
        { mark: ";", verdict: "extended", what: A.semicolon.verdict },
        { mark: ",", verdict: "held", what: A.comma.verdict },
        { mark: "(", verdict: "corrected", what: A.paren.verdict },
        { mark: ")", verdict: "held", what: "closes the group" },
        { mark: "-", verdict: "extended", what: A.hyphen.verdict },
        { mark: "X", verdict: "held", what: A.X.verdict },
        { mark: "+", verdict: "corrected", what: A.plus.verdict },
        { mark: "head_mark", verdict: "corrected", what: A.head_mark.verdict },
        { mark: "refusals.unbalanced_parentheses", verdict: "held", what: `${n(A.unbalanced_parentheses.august)} rows then (${n(A.unbalanced_parentheses.august_closer)} closer, ${n(A.unbalanced_parentheses.august_opener)} opener); ${n(A.unbalanced_parentheses.now_routes_with_either)} routes now (${n(A.unbalanced_parentheses.now_routes_with_a_closer_with_nothing_open)} with a closer, ${n(A.unbalanced_parentheses.now_routes_with_an_opener_never_closed)} with an opener)` },
        { mark: "/", verdict: "corrected", what: A.slash_in_precedence.verdict },
        { mark: "export", verdict: "corrected", what: A.export_posture.verdict },
        { mark: ". ` ' \" & ? ! and the Hebrew points", verdict: "extended", what: "undeclared in August; declared here so the closed set covers every mark the routes carry" },
      ],
      open_for_the_owner: OPEN,
      not_done_here: "The definition is never mined for a reading: a route is read where the store cut it, and a head or note piece the store's cut carried in is kept, not swapped for something better. No group is distributed across its head, no syllable is attached, no '+' or 'X' is stripped, no suffix-led or lone-group route is re-joined to the rendering beside it (that is the store's cut to make, at the provider's characters), and nothing is withheld here for damage — whether a damaged route prints is the owner's ruling.",
    },
  },
};
writeFileSync(join(HERE, "declaration.json"), JSON.stringify(decl, null, 1) + "\n");
console.log("declaration.json written;", Object.keys(marks).length, "marks declared");
