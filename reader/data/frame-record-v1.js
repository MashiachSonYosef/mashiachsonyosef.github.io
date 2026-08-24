// The frame · what the corpus lane sealed, and what each letter is
//
// Two statements live here, and they are not the same statement.
//
//   sealed_frame  is the frame string as the sealed HUD manifests wrote it,
//                 quoted verbatim, with the manifests that wrote it named and
//                 hashed. This lane did not choose that order and does not
//                 change it.
//   stated_frame  is this lane's own ordering of the same letters, with Y put
//                 first because the spine sits above the word frame, and with
//                 the two letters this lane cannot name moved into
//                 in_the_sealed_frame_and_not_in_this_statement.
//
// Why the sealed string is written down here at all. It used to be read at
// run time by scanning data/ for any file containing a "frame" field and
// taking the one with the highest manifest_version — which meant the frame
// was whatever proof fixture happened to be lying in the directory. When the
// three Genesis 1:1 fixtures were withdrawn on 2026-08-24 the frame went with
// them, and the check that reads it stopped running. A fact this lane depends
// on does not live inside a proof of concept; it lives in a record, with the
// provenance that lets anyone check it against the history.
//
// It is not a specification and nothing here is grounds for calling a work
// deficient. The frame is what a reader of Hebrew must not be shown less than,
// and what any given work needs is recorded nowhere this lane can read. A
// letter defined here is a thing a check may look for and report.
window.FRAME_RECORD_V1 = Object.freeze({
  "schema_version": "FRAME_RECORD_V1",
  "recorded_on": "2026-08-21",
  "restated_on": "2026-08-24",
  "sealed_frame": "A/N/B/V/W/COMPspan/COMPcell/K/Z/L/D/R/M/CIT/P/S",
  "sealed_frame_basis": {
    "quoted_from": "the frame field of the sealed HUD manifests listed below, verbatim",
    "manifest_version": 81,
    "manifest_status": "PASS",
    "stated_by": [
      {
        "file": "data/nested-onkelos-hud-2026-07-19.js",
        "manifest_version": 81,
        "withdrawn_on": "2026-08-24",
        "withdrawn_because": "a presentation proof over one verse, published where it could be fetched"
      },
      {
        "file": "data/y-title-hud-2026-07-19.js",
        "manifest_version": 81,
        "withdrawn_on": "2026-08-24",
        "withdrawn_because": "a presentation proof over one verse, published where it could be fetched"
      },
      {
        "file": "data/genesis-1-1-full-hud-2026-07-19.js",
        "manifest_version": 75,
        "sha256": "0cb1a75ff2eb33a510f4f919b740285830daf0bd43c4e9bd43ccd2265a848e34",
        "withdrawn_on": "2026-08-24",
        "withdrawn_because": "a presentation proof over one verse, published where it could be fetched"
      }
    ],
    "all_three_agreed": true,
    "still_checkable": "the withdrawn files are in this repository's history; git show <commit>:<file> reproduces the bytes these hashes are over"
  },
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
