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
    "revised_within_the_day": "first recorded earlier on 2026-08-31 and revised before the day was out: Y widened to receive a measure of the address space, Q given a fifth kind, and the shared Q rules restated around the two-property law. One statement, revised, not two statements.",
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
      "Y": "for locating \u2014 how you address a part of a work once you're inside it, and the measures of that address space when a source states them. Chapter 22, daf 92a, tikkun 58, the title of a section; 23,204 verses, the midpoint at I Samuel 28:24. Attested to whoever devised the scheme, or to whoever counted.",
      "X": "attestations for B, Y, V and U.",
      "Z": "dual: the catchword as quoted and where it lands in C0, with a miss counting as variant evidence \u2014 dibur hamatchil (\u05d3\u05d9\u05d1\u05d5\u05e8 \u05d4\u05de\u05ea\u05d7\u05d9\u05dc), or abbreviated (\u05d3\"\u05d4)",
      "Q": "a pointer for the source's own marks \u2014 kind: ketiv/qere \u00b7 petuchah \u00b7 setumah \u00b7 inverted nun \u00b7 masorah. C0 holds the actual mark; plus the ruling, e.g. \u05c6 must not carry a key for the letter nun.",
      "U": "work to work relationals: edition-of, translation-of, recension-of",
      "O": "the named stream including which copy is broken"
    },
    "notes": {
      "compspan_vs_compcell": "COMPspan is the entire set. COMPcell is each selectable member of that set. \u05d1\u05b0\u05bc + \u05e1\u05b4\u05e4\u05b0\u05e8 + \u05d5\u05b9 is therefore the maximal COMPcell, not another COMPspan.",
      "w_surface": "the attested word exactly as it occurs in the Hebrew text",
      "maximal_compcell": "the selectable compositional interpretation containing every component",
      "chaldee": "Chaldee appears on M and never on A. It is an obsolete English name for Jewish Aramaic, born of the mistaken idea that the Aramaic of Daniel and Ezra was the language of the Chaldeans. It is admitted because one source title page uses it \u2014 Davidson's Analytical Hebrew and Chaldee Lexicon, 1855 \u2014 so M, which matches labels, must know the word. A describes the language itself, where there is no third language to name."
    },
    "marks_named": {
      "ketiv": "(\u05dc\u05e2\u05d1\u05d3\u05d9\u05da) \u2014 the written form, in round delimiters",
      "qere": "[\u05dc\u05b0\u05e2\u05b7\u05d1\u05b0\u05d3\u05b8\u0596\u05da\u05b0] \u2014 the read form, in square delimiters",
      "setumah": "\u05e1\u05b0\u05ea\u05d5\u05bc\u05de\u05b8\u05d4, abbreviated {\u05e1} \u2014 closed",
      "petuchah": "\u05e4\u05b0\u05bc\u05ea\u05d5\u05bc\u05d7\u05b8\u05d4, abbreviated {\u05e4} \u2014 open",
      "nun_hafukhah": "\u05e0\u05d5\u05bc\u05df \u05d4\u05b2\u05e4\u05d5\u05bc\u05db\u05b8\u05d4 \u2014 inverted nun",
      "masorah_finalis": "\u05de\u05e1\u05d5\u05e8\u05d4 \u05e1\u05d5\u05e4\u05d9\u05ea \u2014 the scribes' bookkeeping at the end of a book"
    }
  },
  "q_rules_2026_08_31": {
    "statement": "Q points. C0 holds. These are the rules Q carries per kind.",
    "shared": [
      "Q never holds text. Every mark, branch or note Q names must be findable inside the carrier, in order. If it isn't, the build refuses rather than retyping the text.",
      "Every Q site carries two properties, and they are independent questions. counts_as_book_word (ON | OFF) asks whether it counts when the book is measured; lexical_key (key | none) asks whether its surface opens the catalog. An ordinary word counts and opens. A numeral counts and does not open. The masorah does not count and does open. {\u05e4} {\u05e1} \u05c6 neither count nor open.",
      "OFF MEANS DOES NOT COUNT. It does not mean \"carries no key.\" Nothing may be typed OFF for being unkeyable, and nothing denied a key for being OFF.",
      "A numeral is a word of the book: written, read, counted. It does not open the catalog because \u05e7 naming a hundred is not an occurrence of qof \u2014 the precedent already in build-zone: a token the ledger marks as a NUMBER carries no lexical key, it reuses a letter's identity to name a number and is not an occurrence of that letter, so the catalog is not asked about it.",
      "The masorah is its mirror: real Hebrew words meaning what they say, which are not words of the book. \u05d7\u05e6\u05d9 means half, and defining it as half is correct. It simply is not part of what the book says.",
      "THE COUNT IS OVER POSITIONS, NEVER OVER ROWS. A written/read site is two rows at one word position: both ON, both read, both keyed, and we refuse to choose between them \u2014 but the position counts once. Same shape as the B law, where the census counts realizations and never members. Counting rows inflates every book carrying a pair.",
      "A reading attaches to a word. A mark attaches to a position. Nothing welds. Any token whose surface is a mark concatenated with Hebrew is refused \u2014 refused meaning the build stops, never meaning the real word inside it is dropped. The cause is known: the tokenizer splits on literal spaces and a non-breaking space is not one, so a mark and the next word survived as a single token.",
      "Absence is not evidence. A book with no Q sites is not a book without marks. It may be a book that arrived flattened \u2014 eight are: esther, haggai, leviticus, malachi, numbers, obadiah, ruth, song-of-songs. It may also be a book whose apparatus is intact in another copy: eight more were called flattened and are not, because the copy read had been stripped. And the whole end-of-book masorah is missing from every Tanakh stream either lane holds. A book known flattened must not present as complete, and a book called flattened on one copy is not flattened until every copy says so.",
      "An implicit maqaf is not a Q. A maqaf joins words, so it belongs to W and the COMPspan lattice, not to a pointer at a mark.",
      "Key the gate on MAM's own class, never on the glyph or the delimiter form. The delimiters are inconsistent across our streams; the classes are not, and no apparatus row has lost its class. Counting by normalized key has produced a wrong number in both lanes: a pointed ordinary word normalizes to the same bare letter as the mark.",
      "A STREAM IDENTITY CANNOT BE ITS POSITION COUNT. One work may hold several copies under one filename \u2014 including the content hash in that filename, which therefore identifies nothing. Copies of a book can carry the same row count, the same C0 span and the same first id, and differ only in whether the source own class labels survived: one capture generation kept them, two discarded them. Every integrity check either lane has is blind to that, because arithmetic over positions cannot see a label that is gone. So: the seal covers apparatus content, a hash over the stream own bytes, and not position arithmetic alone. Exactly one copy per work is designated canonical by a recorded rule, never by directory order, and a capture that preserves the source own labels dominates one that discards them. The others are kept: two good captures of i-kings disagree by two marks, and that is a variant carrying information, not noise.",
      "OFF travels with C0 from the corpus, not from the build, and so does NUMBER. A zone checks its word count against a sealed figure, so a flag decided at build time while the seal is cut corpus-side makes the sealed and served counts disagree. Whoever seals C0 decides both. Carrier flags into C0 and the seals recut to the ON-POSITION count come first; masorah acquisition second. Reversed, the verification's first act is to accuse the scribes of miscounting with numbers we broke ourselves."
    ],
    "kinds": {
      "kq": {
        "title": "written / read",
        "counts": "ON",
        "key": "keyed",
        "what_the_source_wrote": "both forms at one site. Round ( ) around the written, square [ ] around the read. Order varies by site \u2014 genesis-14-2 is written-first, genesis-36-5 is read-first. The bracket identifies, the position does not.",
        "c0": "one C0. One word block, one card. Both branches live inside that single carrier. The corpus currently emits two rows per site and must collapse them before sealing, or the carrier does not exist to render into.",
        "lexical_key": "one per branch, taken from inside the delimiters, delimiters stripped. Two keys at one C0. This is the only Q kind that is ON.",
        "the_card_answers_for": "both readings. The lattice sits inside the card; selecting a half underlines that half in the line and shows that half's English only. One English at a time.",
        "multi_word_branches": "a branch may be more than one word \u2014 psalms-123-4 writes (\u05dc\u05d2\u05d0\u05d9\u05d5\u05e0\u05d9\u05dd) and reads [\u05dc\u05d2\u05d0\u05d9 \u05d9\u05d5\u05e0\u05d9\u05dd]. The branch carries its words as separate keys in order. Never one welded key.",
        "the_gate_refuses": [
          "a branch that opens a delimiter and never closes it",
          "a delimiter surviving into the key",
          "a branch not found inside its own carrier",
          "a site with one branch \u2014 a pair with one half is not a pair",
          "a multi-word branch collapsed into a single key"
        ]
      },
      "petuchah": {
        "title": "open section",
        "counts": "OFF",
        "key": "unkeyed",
        "what_the_source_wrote": "{\u05e4}, class mam-spi-pe. An abbreviation for \u05e4\u05b0\u05bc\u05ea\u05d5\u05bc\u05d7\u05b8\u05d4.",
        "c0": "a position, standing after the last word of the section that closes. Not a word, not part of one.",
        "lexical_key": "none, because the surface is not the word it means: \u05e4 here abbreviates petuchah and is not an occurrence of the letter pe. Every apparatus row in the body carries a lexical key today \u2014 not most, all \u2014 and all of them come out. No figure is cited here: the two lanes' class-based counts differ by about twelve percent and the cause is not yet found.",
        "the_card_answers_for": "the word \u2014 petuchah, \"open\" \u2014 and what it does: this section ends here, and the next begins on a fresh line.",
        "display_obligation": "if the renderer can't give the break its line, the card says so in plain English at the top. A petuchah drawn as nothing is a flattening.",
        "the_gate_refuses": [
          "a bare \u05e4 carrying a lexical key",
          "a mark welded to an adjacent word",
          "a mark given a word's C0 instead of its own position",
          "a mark counted among the book's words",
          "a mark rendered identically to a setumah"
        ]
      },
      "setumah": {
        "title": "closed section",
        "counts": "OFF",
        "key": "unkeyed",
        "what_the_source_wrote": "{\u05e1}, class mam-spi-samekh. An abbreviation for \u05e1\u05b0\u05ea\u05d5\u05bc\u05de\u05b8\u05d4.",
        "structurally": "identical to petuchah. Everything there holds. Two differences follow.",
        "the_card_answers_for": "the word \u2014 setumah, \"closed\" \u2014 and what it does: this section ends, and the next begins on the same line, after a gap.",
        "display_obligation": "petuchah means a new line. Setumah means a visible gap without one. A renderer that draws both the same has erased a distinction the source made, and must say which one it can't honor."
      },
      "invnun": {
        "title": "inverted nun",
        "counts": "OFF",
        "key": "unkeyed",
        "what_the_source_wrote": "\u05c6 \u2014 U+05C6 HEBREW PUNCTUATION NUN HAFUKHA, class mam-spi-invnun. The name is \u05e0\u05d5\u05bc\u05df \u05d4\u05b2\u05e4\u05d5\u05bc\u05db\u05b8\u05d4.",
        "c0": "a position. It marks a passage, not a word.",
        "lexical_key": "none, and the clearest case of the three unkeyed kinds: \u05c6 is a punctuation character, not the letter nun. It never carries a key.",
        "the_card_answers_for": "the mark's name, and what the tradition says with it \u2014 this passage is marked as standing apart.",
        "pairing": "the source's business, not a requirement. In Psalm 107 the marks stand singly. In Numbers 10:35-36 two of them bracket the passage. So Q records whether a mark opens, closes, or stands alone \u2014 it does not demand a partner.",
        "the_gate_refuses": [
          "a key for the letter nun",
          "a mark counted among the book's words",
          "a claim of completeness the body can't support"
        ]
      },
      "masorah": {
        "title": "the book's own count",
        "counts": "OFF",
        "key": "keyed",
        "what_the_source_wrote": "the masorah finalis (\u05de\u05e1\u05d5\u05e8\u05d4 \u05e1\u05d5\u05e4\u05d9\u05ea), the scribes' bookkeeping at the end of a book: \u05e1\u05db\u05d5\u05dd \u05e4\u05e1\u05d5\u05e7\u05d9 \u05d4\u05e1\u05e4\u05e8 the verse total \u00b7 \u05d7\u05e6\u05d9 \u05d4\u05e1\u05e4\u05e8 \u05d1\u05e4\u05e1\u05d5\u05e7\u05d9\u05dd the midpoint by verses \u00b7 \u05d7\u05e6\u05d9 \u05d4\u05e1\u05e4\u05e8 \u05d1\u05ea\u05d9\u05d1\u05d5\u05ea by words \u00b7 \u05d7\u05e6\u05d9 \u05d4\u05e1\u05e4\u05e8 \u05d1\u05d0\u05d5\u05ea\u05d9\u05d5\u05ea by letters \u00b7 \u05e1\u05d9\u05de\u05df a gematria mnemonic for the count \u00b7 \u05d5\u05e4\u05e8\u05e9\u05d9\u05d5\u05ea\u05d9\u05d5 and \u05d5\u05e1\u05d3\u05e8\u05d9\u05d5 the parashah and seder counts, which tie to U.",
        "four_letters": "The mark and the mark's claim are two objects. C0 holds the ink \u2014 positions after the last verse, the scribe's own hand, inside the book, flagged OFF; a chapter number has no C0 id and could never have one, which is what makes this C0 and not Y. Q says which kind of mark it is and which measure it states. Y receives the claim: \"N verses, the middle here\" is a structural assertion about the book's division, which is Y's shape exactly. X holds which manuscript said it.",
        "verification": "Y against Y \u2014 our counted division against the scribe's asserted division. Two structural claims about one book, settled by arithmetic, in letters that already exist.",
        "off_is_load_bearing": "these are not words of the book and are excluded from every count the book reports \u2014 verses, words, letters. A masorah counted among the book's words inflates the total, which then disagrees with the masorah's own figure, and the check files CONTRADICTED against a number that was right for a fault that was ours.",
        "keyed": "yes, and the only OFF kind that is. These are ordinary Hebrew words meaning what they say. \u05d7\u05e6\u05d9 opens to \"half\" like any other word. The phrase means the midpoint of the book; the words mean what they mean; the reader is shown both, and neither is forced to stand for the other.",
        "the_card_answers_for": "that it is not a word of the book, and what the scribes recorded here \u2014 then the ordinary card beneath it, same lattice, same routes, same licenses. The banner stands above an ordinary card, never instead of one.",
        "recording_is_not_attesting": {
          "rule": "a count written down is an assertion until someone counts. HELD_UNCOUNTED may not be cited anywhere a reader can see. A disagreement is a finding and is published as one: neither side is corrected toward the other, and the two counts stand together with their editions named.",
          "states": {
            "NOT_HELD": "we do not have the claim",
            "HELD_UNCOUNTED": "we have it and have not verified it \u2014 still an assumption",
            "VERIFIED": "we counted from C0 and it agrees",
            "CONTRADICTED": "we counted from C0 and it does not"
          }
        },
        "the_gate_refuses": [
          "a masorah site counted among the book's words",
          "a claim cited while HELD_UNCOUNTED",
          "a count silently corrected toward the masorah, or the masorah toward it",
          "a VERIFIED state without a count derived from C0 on record"
        ]
      }
    }
  },
  "not_a_specification":
    "a letter defined here is a thing a check may look for and report · it is never grounds to declare a work deficient, because what a work needs is not recorded anywhere this lane can read"
});
