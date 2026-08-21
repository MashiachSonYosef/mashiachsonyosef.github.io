// The frame, letter by letter · recorded 2026-08-21
//
// The sealed manifests state the frame as a string — A/N/B/V/W/COMPspan/
// COMPcell/K/Z/L/D/R/M/CIT/P/S — and do not say what any of it means. This
// says what each letter is, so a check reading the manifest can report on
// something rather than print a letter.
//
// It is not a specification and nothing here is grounds for calling a work
// deficient. The frame is what a reader of Hebrew must not be shown less than,
// and what any given work needs is recorded nowhere this lane can read. A
// letter defined here is a thing a check may look for and report.
window.FRAME_DEFINITIONS_2026_08_21 = Object.freeze({
  "schema_version": "FRAME_DEFINITIONS_V1",
  "recorded_on": "2026-08-21",
  "stated_frame": "Y/A/N/B/V/COMPspan/COMPcell/K/W/L/P/R/D/M/S",
  "stated_frame_note": "Y is the spine above the word frame and is placed first",
  "definitions": {
    "Y": "the organizational spine — hierarchy, order, anchors, collapse state, navigation",
    "A": "a section of hebrew with 1 license",
    "N": "hebrew license",
    "B": "our grouping of As",
    "V": "commentary",
    "COMPspan": "a complete division of a W into its components, each used once — a form of n components has 2^(n-1) of them",
    "COMPcell": "a contiguous run of one W's components — n(n+1)/2 of them, derived, never stored",
    "K": "the byte-exact key a form is asked by",
    "W": "an occurrence in a text — the thing every COMPspan and COMPcell is drawn on, and the thing K reaches",
    "L": "lemma identity",
    "P": "the grouper for M, when 2 M's report the exact same D",
    "R": "a reading — the text a route prints",
    "D": "the definition record a reading was taken from",
    "M": "the source record a reading and its definition stand on",
    "S": "the source year"
  },
  "in_the_sealed_frame_and_not_in_this_statement": {
    "Z": "no layer this lane emits and none it can name — it stays in the sealed manifest string and nothing here removes it",
    "CIT": "superseded by M, which carries the same licence pointer and more — still in the sealed manifest string, still measured, and no work is asked to carry it"
  },
  "not_a_specification":
    "a letter defined here is a thing a check may look for and report · it is never grounds to declare a work deficient, because what a work needs is not recorded anywhere this lane can read"
});
