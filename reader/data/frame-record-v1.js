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
  "owner_stated_frame_2026_08_31": {
    "stated_on": "2026-08-31",
    "stated_by": "the owner, in conversation",
    "quoted": "his own wording throughout, except where a line was drafted here and he adopted it",
    "supersedes_nothing": "the sealed_frame above is history and does not change; this is the frame as the owner states it now, and the two are recorded side by side rather than one overwriting the other",
    "letters": {
      "A": "a licensable span of Hebrew or Aramaic \u2014 never Syriac, Mandaic, Yiddish or Arabic. Syriac and Mandaic are named because they ARE Aramaic, and \"Aramaic\" alone would let them in.",
      "N": "the license for A.",
      "B": "an attestable grouping, identified by its Hebrew name, and carrying every name the world uses to find it \u2014 \"Book of Kings,\" \"Tikkunei Zohar,\" what a reader types into a search box. The Hebrew name identifies the grouping; the finding-names are a list on it, each attested separately to catalogs and usage. A name typed here because none is attested says so.",
      "C0": "the exact location and unique identifier for the specific occurrence",
      "W": "the compositional holder for the Hebrew word \u2014 \u05d1\u05b0\u05bc\u05e1\u05b4\u05e4\u05b0\u05e8\u05d5\u05b9",
      "COMPspan": "the complete set of licensable spans a Hebrew word divides into. For \u05d1\u05b0\u05bc\u05e1\u05b4\u05e4\u05b0\u05e8\u05d5\u05b9 that set is: \u05d1\u05b0\u05bc \u00b7 \u05e1\u05b4\u05e4\u05b0\u05e8 \u00b7 \u05d5\u05b9 \u00b7 \u05d1\u05b0\u05bc+\u05e1\u05b4\u05e4\u05b0\u05e8 \u00b7 \u05e1\u05b4\u05e4\u05b0\u05e8+\u05d5\u05b9 \u00b7 \u05d1\u05b0\u05bc+\u05e1\u05b4\u05e4\u05b0\u05e8+\u05d5\u05b9",
      "COMPcell": "a given COMPspan selectable such as \u05d1\u05b0\u05bc + \u05e1\u05b4\u05e4\u05b0\u05e8, making it premappable as the \"things\" we need licenses for and map out for every word before even having a definition per formulaic hebrew",
      "K": "a search key that discards evidence through normalization, and that a D matched on K alone is weaker than one matched on the pointed surface. Being a searchable form.",
      "D": "the exact licensable definition of a given COMPcell",
      "R": "the debundler selection gloss layer when a COMPcell comes with several definitions in a single license to allow any one to hold the full frame",
      "M": "the license record and the book it came from. Its language must be Hebrew or Aramaic (Chaldee). Struck: any source naming a language outside that set \u2014 Syriac and Mandaic included, though both are Aramaic \u2014 and any source that declares itself non-Hebrew without naming which language it is. A source that cannot say it is not Yiddish is not admitted for not having been asked.",
      "P": "assigns M to R pills",
      "S": "a pointer for source year that helps sort only",
      "V": "attaches commentary, counter-commentary, super-commentary and other attachable works to a location \u2014 a C0, not a work. Work-to-work standing is U's.",
      "Y": "for locating \u2014 how you address a part of a work once you're inside it. Chapter 22, daf 92a, tikkun 58, the title of a section. Attested to whoever devised the scheme.",
      "X": "attestations for B, Y, V and U.",
      "Z": "dual: the catchword as quoted and where it lands in C0, with a miss counting as variant evidence \u2014 dibur hamatchil (\u05d3\u05d9\u05d1\u05d5\u05e8 \u05d4\u05de\u05ea\u05d7\u05d9\u05dc), or abbreviated (\u05d3\"\u05d4)",
      "Q": "a pointer for the source's own marks \u2014 kind: ketiv/qere \u00b7 petuchah \u00b7 setumah \u00b7 inverted nun. C0 holds the actual mark; plus the ruling, e.g. \u05c6 must not carry a key for the letter nun.",
      "U": "work to work relationals: edition-of, translation-of, recension-of",
      "O": "the named stream including which copy is broken"
    },
    "notes": {
      "compspan_vs_compcell": "COMPspan is the entire set. COMPcell is each selectable member of that set. \u05d1\u05b0\u05bc + \u05e1\u05b4\u05e4\u05b0\u05e8 + \u05d5\u05b9 is therefore the maximal COMPcell, not another COMPspan.",
      "w_surface": "the attested word exactly as it occurs in the Hebrew text",
      "maximal_compcell": "the selectable compositional interpretation containing every component"
    },
    "marks_named": {
      "ketiv": "(\u05dc\u05e2\u05d1\u05d3\u05d9\u05da) \u2014 the written form, in round delimiters",
      "qere": "[\u05dc\u05b0\u05e2\u05b7\u05d1\u05b0\u05d3\u05b8\u0596\u05da\u05b0] \u2014 the read form, in square delimiters",
      "setumah": "\u05e1\u05b0\u05ea\u05d5\u05bc\u05de\u05b8\u05d4, abbreviated {\u05e1} \u2014 closed",
      "petuchah": "\u05e4\u05ea\u05d5\u05d7\u05d4, abbreviated {\u05e4} \u2014 open",
      "nun_hafukhah": "\u05e0\u05d5\u05bc\u05df \u05d4\u05b2\u05e4\u05d5\u05bc\u05db\u05b8\u05d4 \u2014 inverted nun"
    }
  },
  "q_rules_2026_08_31": {
    "statement": "Q points. C0 holds. These are the rules Q carries per kind.",
    "shared": [
      "Q never holds text. Every mark or branch Q names must be findable inside the carrier, in order. If it isn't, the build refuses rather than retyping the text.",
      "A mark's card answers for the word it abbreviates, never for the glyph as a letter. The precedent already in build-zone: a token the ledger marks as a NUMBER carries no lexical key \u2014 it reuses a letter's identity to name a number and is not an occurrence of that letter, so the catalog is not asked about it. Same shape, same ruling.",
      "A reading attaches to a word. A mark attaches to a position. Nothing welds. Any token whose surface is a mark concatenated with Hebrew is refused. (91 of those live now: \u05e1\u05d5\u05d9\u05d0\u05de\u05e8, \u05e1\u05d6\u05d0\u05ea, \u05e1\u05d1\u05e0\u05d9\u05d4.)",
      "Absence is not evidence. A book with no Q sites is not a book without marks \u2014 it may be a book that arrived flattened. Seven of ours did. A book known flattened must not present as complete.",
      "An implicit maqaf is not a Q. MAM marks 103 of them; a maqaf joins words, so it belongs to W and the COMPspan lattice, not to a pointer at a mark."
    ],
    "kinds": {
      "kq": {
        "title": "written / read",
        "what_the_source_wrote": "both forms at one site. Round ( ) around the written, square [ ] around the read. Order varies by site \u2014 genesis-14-2 is written-first, genesis-36-5 is read-first. The bracket identifies, the position does not.",
        "c0": "one C0. One word block, one card. Both branches live inside that single carrier.",
        "lexical_key": "yes \u2014 one per branch, taken from inside the delimiters, delimiters stripped. Two keys at one C0.",
        "the_card_answers_for": "both readings. The lattice sits inside the card; selecting a half underlines that half in the line and shows that half's English only. One English at a time.",
        "multi_word_branches": "a branch may be more than one word \u2014 psalms-123-4 writes (\u05dc\u05d2\u05d0\u05d9\u05d5\u05e0\u05d9\u05dd) and reads [\u05dc\u05d2\u05d0\u05d9 \u05d9\u05d5\u05e0\u05d9\u05dd]. The branch then carries its words as separate keys in order. Never one welded key.",
        "the_gate_refuses": [
          "a branch that opens a delimiter and never closes it \u2014 21 of these, 13 written, 8 read, across 18 units",
          "a delimiter surviving into the key (\u05dc\u05d2\u05d0\u05d9 keyed with its bracket still on)",
          "a branch not found inside its own carrier",
          "a site with one branch \u2014 a pair with one half is not a pair",
          "a multi-word branch collapsed into a single key"
        ]
      },
      "petuchah": {
        "title": "open section",
        "what_the_source_wrote": "{\u05e4}, class mam-spi-pe. An abbreviation for \u05e4\u05b0\u05bc\u05ea\u05d5\u05bc\u05d7\u05b8\u05d4.",
        "c0": "a position, standing after the last word of the section that closes. Not a word, not part of one.",
        "lexical_key": "none. \u05e4 here names a word; it is not an occurrence of the letter pe. 2,373 bare \u05e1/\u05e4 keys currently route to dictionary entries for the letters. All of them come out.",
        "the_card_answers_for": "the word \u2014 petuchah, \"open\" \u2014 and what it does: this section ends here, and the next begins on a fresh line.",
        "display_obligation": "if the renderer can't give the break its line, the card says so in plain English at the top. A petuchah drawn as nothing is a flattening.",
        "the_gate_refuses": [
          "a bare \u05e4 carrying a lexical key",
          "a mark welded to an adjacent word",
          "a mark given a word's C0 instead of its own position",
          "a mark rendered identically to a setumah"
        ]
      },
      "setumah": {
        "title": "closed section",
        "what_the_source_wrote": "{\u05e1}, class mam-spi-samekh. An abbreviation for \u05e1\u05b0\u05ea\u05d5\u05bc\u05de\u05b8\u05d4.",
        "structurally": "identical to petuchah. Everything there holds. Two differences follow.",
        "the_card_answers_for": "the word \u2014 setumah, \"closed\" \u2014 and what it does: this section ends, and the next begins on the same line, after a gap.",
        "display_obligation": "petuchah means a new line. Setumah means a visible gap without one. A renderer that draws both the same has erased a distinction the source made, and must say which one it can't honor."
      },
      "invnun": {
        "title": "inverted nun",
        "what_the_source_wrote": "\u05c6 \u2014 U+05C6 HEBREW PUNCTUATION NUN HAFUKHA, class mam-spi-invnun. The name is \u05e0\u05d5\u05bc\u05df \u05d4\u05b2\u05e4\u05d5\u05bc\u05db\u05b8\u05d4.",
        "c0": "a position. It marks a passage, not a word.",
        "lexical_key": "none \u2014 the owner's ruling, and the clearest case of the three: \u05c6 is a punctuation character, not the letter nun. It never carries a key.",
        "the_card_answers_for": "the mark's name, and what the tradition says with it \u2014 this passage is marked as standing apart.",
        "pairing": "the source's business, not a requirement. In Psalm 107 the marks stand singly. In Numbers 10:35-36 two of them bracket the passage. So Q records whether a mark opens, closes, or stands alone \u2014 it does not demand a partner.",
        "the_gate_refuses": [
          "a key for the letter nun",
          "a claim of completeness the body can't support"
        ]
      }
    }
  },
  "not_a_specification":
    "a letter defined here is a thing a check may look for and report · it is never grounds to declare a work deficient, because what a work needs is not recorded anywhere this lane can read"
});
