#!/usr/bin/env node
// Builds declaration.json (PROVIDER_DECLARATIONS_V1 provider shape) for
// openscriptures_strongs (M9) from census.json, which ledger.mjs computes.
// Every number here is read from census.json; nothing is typed in by hand.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const C = JSON.parse(readFileSync(join(HERE, "census.json"), "utf8"));
const f = (n) => Number(n).toLocaleString("en-US");
const M = Object.fromEntries(C.marks.map((m) => [m.mark, m]));
const sh = (mark, shape) => (M[mark].shapes.find((s) => s.shape === shape) || { count: 0, routes: 0 });
const n = (mark, shape) => sh(mark, shape).count;
const r = (mark, shape) => sh(mark, shape).routes;
const ex = (mark, shape, k = 2) => (sh(mark, shape).examples || []).slice(0, k);
const V = C.v3_comparison, D = C.declaration_division, T = C.tagged_gloss_evidence.by_shape, SL = C.sense_lead_after_semicolon;
const RR = C.route_regions, FT = C.definition_field_test;

const markEntry = (mark, extra = {}) => {
  const m = M[mark];
  const shapes = Object.fromEntries(m.shapes.map((s) => [s.shape, s.count]));
  const means = m.shapes.map((s) => `${s.means} (${f(s.count)})`).join("; ");
  return {
    means: means.charAt(0).toUpperCase() + means.slice(1) + ".",
    governs: m.route_occurrences,
    routes: m.routes_carrying_it,
    divides_on: m.shapes.filter((s) => s.divides_readings).map((s) => s.shape),
    region_dependent: m.meaning_depends_on_region,
    regions_seen: Object.keys(m.regions),
    shapes,
    unexplained: m.unexplained,
    evidence: m.shapes.slice(0, 3).flatMap((s) => (s.examples || []).slice(0, 1)).join(" | "),
    ...extra,
  };
};

const marks = {
  ",": markEntry(",", {
    falsifier: `A list piece cut at a depth-0 comma that is not a rendering on its own: ${f(D.pieces_led_by_syllable)} pieces led by a syllable and ${f(D.pieces_lone_group)} pieces that are one group alone ('(perplexed)'), out of ${f(D.pieces_from_divided)} pieces today (open question 7). In the definition field, a comma between two tagged glosses whose right piece is a qualifier rather than a rendering.`,
  }),
  ".": markEntry(".", {
    falsifier: `A list whose full stop is followed by more renderings rather than a note: of ${f(D.note_pieces)} note pieces, ${f(D.note_pieces_by_lead.see_or_compare)} open with See/Compare and ${f(D.note_pieces_by_lead.parenthesized || 0)} are a parenthesis; ${f(D.note_pieces_by_lead.other || 0)} open otherwise, and one of those ('raphah, Raphah. See 7497 ...') holds renderings.`,
  }),
  "(": markEntry("(", {
    falsifier: `A '(' whose group the scan pairs wrongly: the pieces would then fail to rejoin to the route. Checked on every route: ${f(D.refused_rejoin)} refusals.`,
  }),
  ")": markEntry(")", {
    falsifier: `As for '('. A ')' with nothing open is inert (${f(n(")", "paren.closer_with_nothing_open"))}); one whose '(' lies before a slice route's start is the store's cut through a group (${f(n(")", "paren.partner_outside_route"))}).`,
  }),
  ";": markEntry(";", {
    falsifier: `A depth-0 semicolon in Strong's sentence whose next piece is not a sense: ${f(SL.usage_note)} of ${f(SL.label + SL.usage_note + SL.bare)} next pieces open with a usage note (used / only / but used / always / mostly) rather than a sense (open question 6).`,
  }),
  "-": markEntry("-", { falsifier: "A hyphen that divides anything: none is a dividing shape, so a route is never cut at one; syllables are never attached either (that would join pieces the provider did not write together)." }),
  "×": markEntry("×", {
    annotation: true,
    falsifier: `A × in a record the store also cut slices from (Strong's sentence): ${f(FT.corroboration.list_defs_with_a_slice)} of the ${f(FT.by["list:sign"])} records the sign puts in the list field carry a slice route. Never stripped.`,
  }),
  "+": markEntry("+", { annotation: true, falsifier: "As for ×. Never stripped." }),
  "'": markEntry("'", { falsifier: "A quotation the left-to-right reading leaves open at the end of a definition: the shape counts balance (open = close)." }),
  "!": markEntry("!", { falsifier: "A '!' followed by a letter: 0." }),
  "?": markEntry("?", { falsifier: "A '?' followed by a letter: 0." }),
  ":": markEntry(":", { falsifier: "A ':' not between two digits (a definition head or rendering-list opener, as in the Wikisource digitization): 0. This digitization carries Strong's fields apart and writes no ':--' opener." }),
  "[": markEntry("[", { falsifier: "A '[' without its ']': 0." }),
  "]": markEntry("]", { falsifier: "A ']' without its '[': 0." }),
  "}": markEntry("}", { damage: true, falsifier: "A '{' anywhere in the record: 0." }),
  "’": markEntry("’", { falsifier: "A right single quotation mark used as a quote: 0." }),
  "ֲ": markEntry("ֲ", { falsifier: "A Hebrew point outside a Hebrew word: 0." }),
  "ִ": markEntry("ִ", { falsifier: "A Hebrew point outside a Hebrew word: 0." }),
};

const cmp = {
  rule: C.v3.rule,
  applied_as: C.v3.applied_as,
  routes_compared: V.routes,
  same_division: V.same_division,
  of_which_printed_text_differs_only_by_the_list_full_stop: V.same_division_text_differs_by_list_full_stop,
  v3_divides_where_declaration_keeps_whole: V.v3_divides_where_declaration_keeps_whole,
  declaration_divides_where_v3_keeps_whole: V.declaration_divides_where_v3_keeps_whole,
  divided_differently: V.divided_differently,
  why: V.why,
  readings_v3_prints_that_are_not_readings_in_the_definition_field: C.readings_that_are_not_readings,
  v3_damaged: { routes: C.v3.routes_with_damaged_sense, by_region: C.v3.damaged_routes_by_region, the_declaration_divides: C.v3.damaged_routes_the_declaration_divides, note: "today's gloss-store pool drops a damaged sense entirely; the engine's pKey holds it whole" },
  examples: V.examples,
};

const decl = {
  schema_version: "PROVIDER_DECLARATIONS_V1",
  pilot: "mark ledger pilot, 2026-10-31; merge into providers of reader/tools/declarations-v1.json only on the owner's ruling",
  providers: {
    openscriptures_strongs: {
      label: "Strong's Hebrew Dictionary via Open Scriptures",
      m_ids: ["M9"],
      routes: C.routes,
      declared_on: "2026-10-31",
      declared_from: `The entry's own structure, read across all ${f(C.routes)} routes on ${f(C.distinct_definitions)} definition records and ${f(C.keys)} keys. This digitization keeps Strong's two fields apart, so a route's definition is either the KJV rendering list (${f(FT.by["list:sign"] + FT.by["list:full_stop"])} records) or Strong's own sentence (${f(FT.by["definition:trace"] + FT.by["definition:no_full_stop"])} records); the store takes the list whole (${f(RR.list_whole)} routes, ${f(FT.corroboration.list_defs_with_a_slice)} slices) and takes the sentence both whole (${f(RR.definition_whole)}) and in slices (${f(RR.definition_slice)}, from ${f(FT.corroboration.definition_defs_with_a_slice)} records). The same mark reads differently in the two fields: in the list a depth-0 comma separates renderings; in the sentence it is mostly Strong's own punctuation. Every one of the ${f(C.totals.route_mark_occurrences)} mark occurrences in route text falls in exactly one shape; ${f(C.totals.unexplained)} unexplained. The inventory's closed set (${C.inventory_closed_set.marks} marks) agrees mark for mark, occurrences and routes; the definition text uses no mark outside it.`,
      regions: {
        locate: `Field first: ${FT.test}. Corroborated by the store itself: ${f(FT.corroboration.list_defs_with_a_slice)} of ${f(FT.corroboration.list_defs)} list records carry a slice route; ${f(FT.corroboration.definition_defs_with_a_slice)} of ${f(FT.corroboration.definition_defs)} sentence records do. In the list field the list ends at its full stop (period.list_end) and what follows is a note. In the sentence field a space before , ; or . is the trace of the provider's tagging of a definition word (the tag trace).`,
        route_regions: RR,
        slices_located_at_first_of_several_offsets: C.route_slices_with_more_than_one_offset_in_definition,
        meaning_depends_on_region: Object.fromEntries(C.marks.filter((m) => m.meaning_depends_on_region).map((m) => [m.mark, Object.keys(m.regions)])),
        same_meaning_in_every_region: C.marks.filter((m) => !m.meaning_depends_on_region).map((m) => m.mark),
      },
      marks,
      precedence: [
        "field (Strong's sentence | the KJV rendering list)",
        ". (period.list_end: the last rendering | the note after the list)",
        "; (semicolon.rendering_separator in the list; semicolon.sense_separator in the sentence)",
        ", (comma.rendering_separator in the list; comma.def_between_tagged_glosses in the sentence)",
      ],
      precedence_note: "Scope before every cut: nothing inside ( ) or [ ] is cut. The field decides which comma shapes exist at all; the list's full stop decides that commas after it are a note's, not renderings'; ';' and ',' then cut at depth 0. In the sentence the comma test reads the piece bounded by the nearest depth-0 ';' or ',', so ';' is read first.",
      refusals: {
        unbalanced_parentheses: {
          closer_with_nothing_open: { occurrences: n(")", "paren.closer_with_nothing_open"), routes: r(")", "paren.closer_with_nothing_open"), rule: "separate normally; the orphan is inert (August rule, held)" },
          opener_never_closed: { occurrences: n("(", "paren.opener_never_closed"), routes: r("(", "paren.opener_never_closed"), rule: "separate up to it; ship the rest whole (August rule, held)" },
          slice_cut_through_a_group: { occurrences: n(")", "paren.partner_outside_route"), rule: "a slice route is never divided; it ships as the store cut it" },
          conflict: `Today's engine holds a damaged sense back (gloss-store drops it from the pool): ${f(C.v3.routes_with_damaged_sense)} routes carry one; ${f(C.v3.damaged_routes_the_declaration_divides)} of them divide under this declaration and the rest print whole.`,
        },
        hyphen_attachment: { rule: "ship whole: no syllable is attached", occurrences: n("-", "hyphen.suffix_syllable") + n("-", "hyphen.prefix_syllable") },
        pieces_that_do_not_rejoin: { rule: "the route ships whole", routes_today: D.refused_rejoin },
      },
      export: "governed by its posture, cc_by_4_0_underlying_public_domain",
      separates_on: {
        marks: [
          { shapes: ["period.list_end"], divides: "the last rendering | the note after the list", where: "list field, depth 0", occurrences: n(".", "period.list_end"), note_pieces: D.note_pieces },
          { shapes: ["semicolon.rendering_separator", "comma.rendering_separator"], divides: "rendering | rendering", where: "list field, depth 0, before the full stop", occurrences: n(";", "semicolon.rendering_separator") + n(",", "comma.rendering_separator") },
          { shapes: ["semicolon.sense_separator"], divides: "sense | sense", where: "sentence field, depth 0", occurrences: n(";", "semicolon.sense_separator") },
          { shapes: ["comma.def_between_tagged_glosses"], divides: "tagged gloss | tagged gloss", where: "sentence field, depth 0, the tag trace on both sides", occurrences: n(",", "comma.def_between_tagged_glosses") },
        ],
        scope: "( ) [ ]",
        rule: "Locate the field, then cut only at the shapes above, at depth 0 and before any unclosed '('. Every piece is kept and is a run of the provider's own characters; the cut character is the mark, not the reading (so the list's full stop is not printed as part of its last rendering). A note after the list is kept as a piece and marked as a note, never offered as a reading. No piece is joined to another, no group is distributed across its head, no syllable is attached, no × or + is stripped. A slice route is never divided.",
        declared_from: `${f(D.routes_divided)} routes divide into ${f(D.pieces_from_divided)} pieces (${Object.entries(D.by_region).map(([k, v]) => `${k} ${f(v)}`).join(", ")}); ${f(D.note_pieces)} of the pieces are notes. The other ${f(C.routes - D.routes_divided)} routes are one reading each. Pieces that fail to rejoin: ${f(D.refused_rejoin)}.`,
        machine: "declaration-v1.mjs applies separates_on.mark alone and has no field test, no list end and no tag trace; under it this object (no 'mark') ships every route whole. Applying it needs the locate step ledger.mjs codes (fieldOf, listEndOf, shapeOf, declared).",
      },
      v3_comparison: cmp,
      open_for_the_owner: [
        { q: "The comma between two tagged glosses in Strong's sentence ('to expose , dismiss ,').", reading_a: `It divides (declared): ${f(n(",", "comma.def_between_tagged_glosses"))} commas in ${f(r(",", "comma.def_between_tagged_glosses"))} routes; the provider tagged both sides as definition words.`, reading_b: `Each sense stays whole: the store already carries these glosses as slice routes on the same record (left gloss ${f(T["comma.def_between_tagged_glosses"].left_gloss_is_a_slice_route)}, right gloss ${f(T["comma.def_between_tagged_glosses"].right_gloss_is_a_slice_route)} of ${f(T["comma.def_between_tagged_glosses"].commas)}), so dividing prints them a second time in their sentence form ('to expose' beside 'expose').` },
        { q: "The comma after a tagged gloss before the definition's last piece, where the right side's tag cannot be seen.", reading_a: `It divides like the one above: ${f(n(",", "comma.def_gloss_then_last_piece"))} commas in ${f(r(",", "comma.def_gloss_then_last_piece"))} routes; the right piece is itself a slice route in ${f(T["comma.def_gloss_then_last_piece"].right_gloss_is_a_slice_route)}.`, reading_b: "It stays whole (declared): the last piece is sometimes a qualifier ('to carve , whether wood or stone'), and the characters cannot tell which." },
        { q: "A name and its description ('Adar , the 12th Hebrew month').", reading_a: `One reading (declared): ${f(n(",", "comma.def_name_then_description"))} commas in ${f(r(",", "comma.def_name_then_description"))} routes.`, reading_b: `Two readings, name | description, as today's engine prints them in ${f(V.why.v3_divides_where_declaration_keeps_whole.name_then_description || 0)} routes.` },
        { q: "The list's full stop on the last rendering.", reading_a: `It is the list's end mark and is not printed with the last reading (declared): ${f(V.same_division_text_differs_by_list_full_stop)} routes print their last reading without it ('Adar' for 'Adar.').`, reading_b: "Print it as the provider wrote it; the division is the same either way." },
        { q: "The note after the list ('Compare 3402 .', 'See also 1050 .').", reading_a: `Its own piece, marked note, never offered as a reading (declared): ${f(D.note_pieces)} pieces in ${f(D.routes_with_note)} routes.`, reading_b: "Left on the last rendering, as today ('Jareb. Compare 3402 .' printed as one reading)." },
        { q: "A sense after ';' that opens with a usage note ('but used only adverbially ...', 'used adverbially, in mourning weeds').", reading_a: `A sense, printed as a reading (declared): ${f(SL.usage_note)} of ${f(SL.label + SL.usage_note + SL.bare)} senses.`, reading_b: "A note on the sense before it, kept with that sense." },
        { q: "A KJV list item that is one group alone ('(perplexed)', '( well)').", reading_a: `A piece of its own (declared): ${f(D.pieces_lone_group)} pieces.`, reading_b: "Notation for the rendering beside it; left for the store to re-cut at the provider's characters, never joined here." },
        { q: "What today's engine prints from Strong's sentence.", reading_a: `Its comma rule cuts the sentence into ${f(C.readings_that_are_not_readings.v3.label || 0)} bare usage labels ('properly', 'figuratively'), ${f(C.readings_that_are_not_readings.v3.ie || 0)} 'i.e.' pieces and ${f(C.readings_that_are_not_readings.v3.etc || 0)} 'etc.' pieces printed as readings.`, reading_b: `Under this declaration: ${f(Object.values(C.readings_that_are_not_readings.declaration).reduce((a, b) => a + b, 0))}. This is the change on a card; it needs no ruling beyond adopting the declaration, and is listed so the owner sees its size.` },
      ],
      not_done_here: "The definition is never mined for a reading: a route is read where the store cut it. The store's slice routes (cut from Strong's sentence) are not judged here; whether a slice is a separation or a derivation is the derivation section's question (declarations-v1.json, openscriptures_strongs pairs). No group is distributed, no syllable attached, no × or + stripped, no lone group re-joined, nothing withheld for damage.",
    },
  },
};
writeFileSync(join(HERE, "declaration.json"), JSON.stringify(decl, null, 1));
console.log("declaration.json written;", Object.keys(marks).length, "marks");
