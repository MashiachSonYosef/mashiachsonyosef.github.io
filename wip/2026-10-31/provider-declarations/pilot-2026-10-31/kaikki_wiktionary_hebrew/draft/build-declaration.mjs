#!/usr/bin/env node
// Writes declaration.json (the declarations-v1.json provider shape) for kaikki_wiktionary_hebrew
// from census.json, which ledger.mjs measured. Every number here is read from census.json;
// the prose is the reading of the shapes. Usage: node build-declaration.mjs <out dir>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
const C = JSON.parse(readFileSync(join(OUT, "census.json"), "utf8"));
const R = Object.fromEntries(C.route_text.map((m) => [m.mark, m]));
const sh = (mark, id) => (R[mark].shapes.find((s) => s.shape === id) || { count: 0, routes: 0 });
const n = (x) => x.toLocaleString("en-US");
const ex = (mark, id, k = 0) => (sh(mark, id).examples || [])[k] || "";
const D = C.declaration_division, CMP = C.comparison;
const shapesOf = (m) => Object.fromEntries(m.shapes.map((s) => [s.shape, s.count]));
const divides = (m) => m.shapes.filter((s) => s.divides_readings).reduce((t, s) => t + s.count, 0);

// ---- the marks that carry the division, read by hand from their shapes ----
const HAND = {
  ",": {
    means: `Alternation in the gloss line: Wiktionary's list of English equivalents, one rendering to the next (${n(sh(",", "comma.gloss_boundary").count)} of ${n(R[","].occurrences)}). It does not divide inside a parenthesis or bracket (${n(sh(",", "comma.in_parentheses").count + sh(",", "comma.in_brackets").count)}), inside a form pointer (${n(sh(",", "comma.pointer").count)}), a usage note (${n(sh(",", "comma.in_note").count)}) or a copied Strong's list (${n(sh(",", "comma.strongs_list").count)}), or where the part is a sentence: a clause opener, a serial conjunction, a relative, a label, etc., a shared object or a bare qualifier group after it (${n(["comma.before_clause", "comma.before_serial_conjunction", "comma.before_relative", "comma.after_label", "comma.before_etc", "comma.shared_object", "comma.before_bare_group", "comma.list_inside_sentence"].reduce((t, s) => t + sh(",", s).count, 0))}, the part held whole).`,
    region_dependent: true,
    regions: "Divides in the head gloss list, in the explanation after ':' and in the gloss list after a form pointer; never in a pointer, a note or a Strong's list.",
    evidence: [ex(",", "comma.gloss_boundary"), ex(",", "comma.before_clause"), ex(",", "comma.in_parentheses")],
    falsifier: `A comma.gloss_boundary piece that is a clause, not a rendering. The contested class is a piece of more than 4 words beside such a comma: ${n(D.long_comma_pieces.pieces)} pieces in ${n(D.long_comma_pieces.routes)} routes (most are a describing gloss after the short ones, 'cobra, snake of the family Elapidae'; some are clauses the opener lists miss, 'Kach, a far-right Israeli political party ..., banned in 1994'). See open question 2.`,
  },
  ";": {
    means: `Sense boundary at depth 0 (${n(sh(";", "semicolon.sense_boundary").count)}); before a usage note (${n(sh(";", "semicolon.note_follows").count)}) it divides the glosses from the note, which is its own piece and no reading. Inside a parenthesis it is the note's own punctuation (${n(sh(";", "semicolon.in_parentheses").count)}).`,
    region_dependent: false,
    evidence: [ex(";", "semicolon.sense_boundary"), ex(";", "semicolon.note_follows"), ex(";", "semicolon.in_parentheses")],
    falsifier: "A depth-0 ';' whose two sides are one reading (a ';' inside one clause). None was found in the samples read.",
  },
  ":": {
    means: `Divides the head gloss(es) from the explanation that defines them (${n(sh(":", "colon.head_explanation").count)}: 'A tunnel: an underground passage'), a form pointer from the glosses of that form (${n(sh(":", "colon.pointer_gloss").count)}), a gloss from the pointer giving its grammar (${n(sh(":", "colon.gloss_pointer").count)}), or a copied Strong's definition from its KJV list (${n(sh(":", "colon.strongs_list").count)}). Between digits it is a citation (${n(sh(":", "colon.citation").count)}); with nothing after it, it introduces sub-senses the route does not carry (${n(sh(":", "colon.introduces_absent_list").count)}).`,
    region_dependent: false,
    evidence: [ex(":", "colon.head_explanation"), ex(":", "colon.pointer_gloss"), ex(":", "colon.gloss_pointer")],
    falsifier: "A depth-0 ':' with text on both sides whose right side is neither an explanation, a gloss list nor a pointer of its left side (a time, a title, a quotation). Digits on both sides and a colon with nothing after are already set apart.",
  },
  ".": {
    means: `Ends the gloss (${n(sh(".", "period.terminal").count)}). A depth-0 period followed by a capital, a digit or a group ends one sentence and starts another (${n(sh(".", "period.sentence_boundary").count)}: 'a surname. Frumkin'; 'Also, a servant.'), and before a closing note group it divides the note off (${n(sh(".", "period.before_trailing_note").count)}: '(See usage note below.)'). Everything else is notation: inside a group (${n(sh(".", "period.in_parentheses").count)}), an abbreviation (${n(sh(".", "period.abbreviation").count)}), a decimal (${n(sh(".", "period.decimal").count)}), an ellipsis (${n(sh(".", "period.ellipsis").count)}).`,
    region_dependent: false,
    evidence: [ex(".", "period.sentence_boundary"), ex(".", "period.before_trailing_note"), ex(".", "period.abbreviation")],
    falsifier: "A dividing period that ends an abbreviation the declared list misses ('Mt. Sinai' would divide as 'Mt.' and 'Sinai').",
  },
  "(": {
    means: `Never divides, and is never distributed over its head. A qualifier or sense description on the English before it (${n(sh("(", "paren.qualifier").count)}: 'father (a male parent, ...)'), the romanization of the Hebrew word before it (${n(sh("(", "paren.romanization").count)}), an argument slot inside one reading (${n(sh("(", "paren.argument_slot").count)}: 'to make (someone) laugh'), a nested note (${n(sh("(", "paren.nested").count)}), a grammar label in a form pointer (${n(sh("(", "paren.grammar_label").count)}), a note citing Hebrew (${n(sh("(", "paren.hebrew_note").count)}), a subject pronoun in a verb-form gloss (${n(sh("(", "paren.subject_pronoun").count)}: '(he/it) went'), a displayed point (${n(sh("(", "paren.mark_display").count)}). At the head of the line (${n(sh("(", "paren.lead_label").count)}) or closing it after the final period (${n(sh("(", "paren.trailing_label").count)}) it is a context label over the whole line, and the line ships whole; a capitalized closing group is a note (${n(sh("(", "paren.trailing_note").count)}). It scopes every divider.`,
    region_dependent: true,
    regions: "At the head or the close of the line a label over all of it; after a Hebrew word its romanization; elsewhere a note on the English before it.",
    evidence: [ex("(", "paren.qualifier"), ex("(", "paren.romanization"), ex("(", "paren.lead_label")],
    falsifier: "A group the qualifier shape covers that is a second reading of the word rather than a note on the first ('father (dad)' as two renderings).",
  },
  ")": { means: "Closes the group its '(' opened; same shapes, same counts, minus the unclosed openers.", region_dependent: true },
  "[": {
    means: `Never divides. The preposition or particle the Hebrew word governs (${n(sh("[", "bracket.government").count)}: '[with מִן (mín)]'), a cross-reference (${n(sh("[", "bracket.cross_reference").count)}), unrendered wiki links (${n(sh("[", "bracket.wiki_markup").count)}), and one each of a supplied word, phonetic notation, an elided slot and an equivalent name. It scopes every divider.`,
    region_dependent: false, evidence: [ex("[", "bracket.government"), ex("[", "bracket.cross_reference")],
    falsifier: "A bracket holding a word the English supplies as an alternative reading rather than notation inside one.",
  },
  "]": { means: "Closes the bracket; same shapes, same counts.", region_dependent: false },
  "/": {
    means: `Never divides. Alternatives packed inside one reading's frame (${n(sh("/", "slash.alternation_in_reading").count)}: 'happy is/was/will be', '(he/it) went'), the unpointed and pointed spellings of one cited Hebrew lemma (${n(sh("/", "slash.spelling_pair").count)}), phonemes, units, URLs and spaced alternatives inside one phrase.`,
    region_dependent: false, evidence: [ex("/", "slash.alternation_in_reading"), ex("/", "slash.spelling_pair")],
    falsifier: "A slash between letters dividing two whole readings, so that each side stands alone ('cup/glass' as two renderings); dividing 'happy is/was/will be' would leave 'happy is', which no source wrote.",
  },
  "-": {
    means: `Never divides. A compound (${n(sh("-", "hyphen.compound").count)}), a bound syllable in a romanization (${n(sh("-", "hyphen.romanization").count)}), an English prefix or suffix that is itself the gloss, a range, the dash of a copied Strong's ':-' and its suffix notation, and a spaced dash inside one reading.`,
    region_dependent: false, evidence: [ex("-", "hyphen.compound"), ex("-", "hyphen.romanization")],
    falsifier: "A spaced dash that opens a second reading rather than an apposition inside one.",
  },
};

const marks = {};
for (const m of C.route_text) {
  const h = HAND[m.mark] || {};
  const auto = m.shapes.map((s) => `${s.means} (${n(s.count)})`).join("; ");
  marks[m.mark] = {
    codepoint: m.codepoint,
    means: h.means || auto,
    divides_readings: divides(m) ? `in ${n(divides(m))} of ${n(m.occurrences)} occurrences` : false,
    governs: m.occurrences,
    routes: m.routes,
    region_dependent: h.region_dependent ?? false,
    ...(h.regions ? { regions: h.regions } : {}),
    shapes: shapesOf(m),
    evidence: (h.evidence || m.shapes.slice(0, 2).map((s) => s.examples[0])).filter(Boolean),
    falsifier: h.falsifier || "An occurrence the shapes above do not cover; the census counts them (unexplained).",
    ...(m.unexplained ? { unexplained: m.unexplained, unexplained_is: "a lone '@' opening the route at key קשיטה (M13), before a quoted gloss and a colon; it reads as residue of the source's markup, its meaning cannot be read from the text, and it does not divide" } : {}),
  };
}

const providers = {
  kaikki_wiktionary_hebrew: {
    label: "Kaikki machine-readable Hebrew dictionary from English Wiktionary",
    m_ids: C.m_ids,
    routes: C.routes,
    declared_on: "2026-10-31",
    declared_from: `The entry's own structure, read across all ${n(C.routes)} routes. The route is the whole definition in ${n(C.route_region_in_definition.whole)} rows and the definition's tail after a leading label group in ${n(C.route_region_in_definition.slice_tail_after_lead_label)} (M50, M69: the store cut '(anatomy)', '(clothing)' and the like off the front). The provider writes Wiktionary's gloss line: English equivalents divided by commas (${n(sh(",", "comma.gloss_boundary").count)} dividing commas in ${n(sh(",", "comma.gloss_boundary").routes)} routes), senses by semicolons (${n(sh(";", "semicolon.sense_boundary").count + sh(";", "semicolon.note_follows").count)}), a head and its explanation by a colon (${n(sh(":", "colon.head_explanation").count)}), and every parenthesis a note, never an alternative (${n(R["("].occurrences)} groups, 0 divide). Under this declaration ${n(D.routes_divided)} routes divide into ${n(D.pieces)} pieces, and ${n(D.rejoin_failures)} fail to rejoin character for character.`,
    census_check: (() => {
      const DF = Object.fromEntries(C.definition_text.map((m) => [m.mark, m]));
      const diff = C.route_text.filter((m) => DF[m.mark] && DF[m.mark].occurrences !== m.occurrences).map((m) => `'${m.mark}' +${n(DF[m.mark].occurrences - m.occurrences)}`);
      return {
        inventory: `${C.inventory_check.marks_in_inventory} marks in mark-inventory-2026-10-31.json for these M ids, ${C.inventory_check.marks_in_jsonl_route_text} in the route text of the JSONL, ${C.inventory_check.mismatches.length} mismatches in occurrences or routes`,
        definition_text: `the definition text carries ${C.definition_text.length} marks; it differs from the route text only in the ${n(C.route_region_in_definition.slice_tail_after_lead_label)} rows whose lead label the store cut (${diff.join(", ")})`,
        unexplained: `route text ${C.route_text.reduce((t, m) => t + m.unexplained, 0)}, definition text ${C.definition_text.reduce((t, m) => t + m.unexplained, 0)}: the one '@' at key קשיטה`,
      };
    })(),
    regions: {
      locate: "The route is read as it stands; the definition is never mined. Within the route: ';' and a sentence '.' cut segments; a segment that opens as a note (used, see, said of, indicating, also, it, this, ...) is a note; ':' cuts a segment into parts: the head before it, then an explanation, a gloss list after a form pointer, a pointer after a gloss, or a copied Strong's KJV list after ': -'. A part carrying Hebrew letters outside parentheses is a form pointer.",
      pieces_by_role: D.by_role,
      role_meaning: "head, explanation, gloss: readings. pointer: a form-of pointer ('plural of X (x)'), kept as a piece, no reading. note: a usage note or cross-reference, kept as a piece, no reading. strongs_list: a copied Strong's KJV list, kept whole.",
    },
    marks,
    precedence: ["( ) [ ] and quotation marks scope every divider", "a lead or closing context label holds the line", "an unclosed '(' holds everything from it", ";", ". (sentence boundary)", ":", ","],
    precedence_note: "Each divider divides only at depth 0, outside quotations, and in order: ';' and the sentence '.' cut the line into senses, ':' cuts a sense into head and explanation (or pointer and glosses), ',' cuts a part into renderings. A part that carries any holding comma (clause opener, serial conjunction, relative, label, etc., shared object, bare qualifier group) is held whole, commas and all. '/', '-', quotes, apostrophes, Hebrew points, maqaf, geresh and the symbols never divide.",
    refusals: {
      line_label: { routes: D.lead_label_routes + D.trailing_label_routes, lead: D.lead_label_routes, lead_by_m: D.lead_label_by_m, closing: D.trailing_label_routes, closing_by_m: D.trailing_label_by_m, rule: "ship whole", why: "A label at the head of the line ('(intransitive) to soak, permeate') or after its last period ('To leaven, ferment. (of dough)') governs every gloss in it; dividing would leave the label on one piece and strip it from the rest (the August Bolls binyan-header precedent)." },
      unbalanced: { routes: D.unclosed_routes, rule: "separate up to the first unclosed '(' or '['; ship the rest whole (the August opener_never_closed rule)", note: `Today's card prints nothing for these ${n(CMP.v3_prints_nothing_damaged)} routes (a damaged sense is dropped); this declaration ships each whole.` },
      pieces_that_do_not_rejoin: { routes: D.rejoin_failures, rule: "ship whole" },
    },
    export: "governed by its posture, cc_by_sa_gfdl",
    separates_on: {
      marks: [
        { mark: ";", shapes: ["semicolon.sense_boundary", "semicolon.note_follows"], divides: "sense from sense, glosses from a note" },
        { mark: ".", shapes: ["period.sentence_boundary", "period.before_trailing_note"], divides: "sentence from sentence, the gloss from a closing note" },
        { mark: ":", shapes: ["colon.head_explanation", "colon.pointer_gloss", "colon.gloss_pointer", "colon.strongs_list"], divides: "head from explanation, pointer from glosses, gloss from pointer, definition from a Strong's list" },
        { mark: ",", shapes: ["comma.gloss_boundary"], divides: "one rendering from the next" },
      ],
      scope: "( ) [ ] “ ” ‘ ’ \" ⟨ ⟩",
      rule: "Separate at the declared shapes only. Every piece is kept; no piece is joined to another; no label is carried onto a piece it was not written on; no group is distributed over its head; no sigil, label or romanization is stripped.",
      measured: { routes_divided: D.routes_divided, pieces: D.pieces, rejoin_failures: D.rejoin_failures, by_m: D.by_m },
    },
    compared_with_v3: {
      engine: CMP.engine,
      path: "the card's path: zone.html's depth-0 ';' split, then sense-split-v1.mjs's senseSplit on each sense (the card's readingSplit equals it on all " + n(CMP.card_comma_rule_equals_sense_split_v1.senses) + " senses)",
      routes: CMP.routes, same_division: CMP.same_division,
      v3_divides_where_declaration_keeps_whole: CMP.v3_divides_where_declaration_keeps_whole,
      declaration_divides_where_v3_keeps_whole: CMP.declaration_divides_where_v3_keeps_whole,
      divided_differently: CMP.divided_differently,
      v3_prints_nothing: CMP.v3_prints_nothing_damaged,
      causes: CMP.causes_of_disagreement,
      sense_split_v1_alone: (({ ex, note, ...rest }) => rest)(CMP.literal_sense_split_v1_only),
    },
    open_for_the_owner: [],
    not_done_here: "The definition is never mined for a reading: the route is read where the store cut it. No explanation is substituted for its head, no label is carried forward onto the pieces after it, no group is distributed, no romanization or label is stripped, no pointer is resolved to the form it names. The 92 routes the store already cut after a lead label are read as cut; whether that cut stands is the owner's (open question 5).",
  },
};
const longP = D.long_comma_pieces;
const colonDivides = sh(":", "colon.head_explanation").count;
providers.kaikki_wiktionary_hebrew.open_for_the_owner = [
  `1. The colon. ${n(colonDivides)} depth-0 colons stand between a head gloss and the explanation that defines it ('A tunnel: an underground or underwater passage'). Reading A (declared): the colon divides, the head and the explanation are each a reading. Reading B: the explanation defines the head and is no reading of its own; the head alone is the reading and the explanation prints as the record's note. v3 never divides at ':' and so prints the whole sentence, or cuts at the commas around it. Colon divisions are a cause in ${n((CMP.causes_of_disagreement.decl_divides_v3_whole || {})["declaration divides at ':' (v3 never does)"] || 0)} + ${n((CMP.causes_of_disagreement.divided_differently || {})["declaration divides at ':' (v3 never does)"] || 0)} disagreeing routes.`,
  `2. A long piece in a gloss list. ${n(longP.pieces)} pieces of more than 4 words stand beside a dividing comma in ${n(longP.routes)} routes ('cobra, snake of the family Elapidae'; 'to pass, to not fail a test'). Reading A (declared): Wiktionary's comma lists equivalents, a describing equivalent among them, and the comma divides wherever no clause, conjunction, relative, label or etc. follows it. Reading B (v3): a piece over 4 words makes the field a sentence; the short pieces are readings and the whole field stands beside them.`,
  `3. Pieces that are no readings. Division keeps ${n(D.by_role.note || 0)} note pieces and ${n(D.by_role.pointer || 0)} form-pointer pieces ('used in forming questions.'; 'defective spelling of ייצר'). Reading A: each prints as the record's note or pointer, not as a pill. Reading B: each prints as a pill like any piece. The declaration marks the role and leaves the printing to the owner.`,
  `4. Labels over the line. ${n(D.lead_label_routes)} routes open with a context label and ${n(D.trailing_label_routes)} close with one after the final period; held whole (declared). Reading B: divide them like any line; the label stays on the one piece it was written on and the other pieces print without it. v3 divides ${n((CMP.causes_of_disagreement.v3_divides_decl_whole || {})["declaration holds the line under a lead or trailing label"] || 0)} of them.`,
  `5. The store's own cut. In ${n(C.route_region_in_definition.slice_tail_after_lead_label)} rows (${Object.entries(C.route_region_in_definition.slice_tail_by_m).map(([m, k]) => `${m} ${n(k)}`).join(", ")}) the route is the definition with its lead label removed ('(anatomy) vagina' printed 'vagina'); in ${n(D.lead_label_routes)} other rows (${Object.entries(D.lead_label_by_m).map(([m, k]) => `${m} ${n(k)}`).join(", ")}) the lead label stays on the route. Reading A: the store's cut stands (the label is a topic tag, not part of the reading). Reading B: it is a derivation and the route should be the whole definition, as it is in the other rows.`,
  `6. Strong's text inside Wiktionary. ${n(sh(":", "colon.strongs_list").count)} routes carry a copied Strong's ':-' KJV list (${n(sh(",", "comma.strongs_list").count)} commas, held whole here). Reading A: hold it whole (declared). Reading B: divide it under the Strong's declaration (wikisource_strongs_explicit_forms), whose list it is.`,
  `7. Unbalanced groups. ${n(D.unclosed_routes)} routes carry a '(' that never closes (truncated notes). Today's card prints nothing for their damaged sense; this declaration ships each route whole. Reading A: ship whole (declared). Reading B: keep today's drop.`,
];
const doc = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  measured_by: "ledger.mjs + declaration-kaikki.mjs over punct/by-source/kaikki_wiktionary_hebrew.jsonl; census.json holds every shape and count",
  providers,
};
writeFileSync(join(OUT, "declaration.json"), JSON.stringify(doc, null, 1));
console.log("declaration.json written;", Object.keys(marks).length, "marks");
