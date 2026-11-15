# What each dictionary is, and what kinds of entry it marks

15 November 2026. The page lane's «declare» part of «each dictionary as a category». Read only; nothing served was changed. This file is the full table: one row per family (one family per underlying work), then one line per M id.

## How it was measured

- The tree read is the one named in the brief, main 857a3dc0fb. The lead's task list says a ship to main 46bbbf7d50 (the default toggles) landed while this was being measured; that tree was not read.
- The live site as read: main 857a3dc0fb, route store 4d1357b26ca5 (sha256 of the 256 shard digests in name order: 367de47cb25f12d7bc023b04459ac37967d36c08feffed1cbdaf832ecb2b764d). One pass over all 256 shards: 652,954 rows under 124,901 keys, the index's own counts. 119 M ids carry rows; the index names 146.
- **Pointed headword**: a row whose headword slot (slot 6) holds at least one string the page's own test calls pointed (pointing-grade-rule-v4: a vowel point U+05B0 to U+05BB after NFKD, or a shureq).
- **Entry number**: a row whose facts slot carries n (the row entries ledger, relay v172).
- **Stem named**: a row whose own m, key, rank and route has a line with stems in the two stems ledgers the live sidecars cite by sha256 (row-stems-v2.jsonl e9d8a201…, row-stems-extension-v1.jsonl a51b8cd2…), the extension's two branches read as the owner set them on 13 November (the_ubs_edition, the_base_stem).
- **Name mark**: a row whose facts slot carries name: 1 (relay v177; 7,412 rows, the list's own count).
- **No mark**: a row with none of the four. No gate of the site can set such a row apart by anything its own source says.
- What a dictionary marks in its own data is read from three records on the live site: the providers' own records in `reader/data/dictionary-store` (field D), tallied by my own pass over its 256 shards (each provider record counted once, by its own bytes: 303,274); `reader/data/route-store/source-declarations-v1.bin` (the corpus lane's declaration store v7, projected 19 September: per source, each field of its file with its values and counts); and the corpus lane's ledgers and letters (`reader/data/ledgers-v1/*/declaration.json`, names v1's RULE and receipt, row entries v1's RULE, the stems extension's RULE, and the letter v194 of 14 November, not yet landed). The providers' own files are not on this machine.
- A quote in «» is the bytes of the record named beside it. Where the only description of a dictionary is a label this project wrote, the row says so.
- Scripts and their outputs: `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v69/declare/` (census.py, families.py, silent.py, dstore_pass1.py, dstore_pass2.py, dstore_pass3.py, kaikki_join.py, overlays.py, build_notes.py; census.json, families.json, silent.json, dstore2.json, dstore3.json, kaikki-join.json, overlays.json).

## The table

| family | shelf | kind | M ids with rows / in the index | rows | keys | pointed headword | entry number | stem named | name mark (rows) | no mark (rows) |
|---|---|---|---|---|---|---|---|---|---|---|
| Strong's Hebrew dictionary (1890) | in the store | bible-dictionary | 2 / 2 | 171,989 | 19,173 | 23.61% | 100.0% | 0.0% | 0 | 0 (0.0%) |
| Brown-Driver-Briggs (1906), the Open Scriptures edition | in the store | bible-dictionary | 1 / 1 | 15,238 | 4,367 | 94.01% | 94.29% | 25.02% | 0 | 796 (5.2%) |
| Brown-Driver-Briggs (1906), the unabridged edition | in the store | bible-dictionary | 1 / 1 | 8,915 | 3,682 | 98.83% | 99.42% | 13.02% | 0 | 20 (0.2%) |
| STEP's TAHOT (Translators Amalgamated Hebrew OT) | in the store | bible-aligned-translation | 1 / 1 | 95,033 | 46,601 | 99.97% | 100.0% | 41.17% | 0 | 0 (0.0%) |
| STEP's TBESH (Translators Brief lexicon of Extended Strongs for Hebrew) | in the store | bible-dictionary | 1 / 1 | 2,645 | 1,814 | 99.89% | 100.0% | 0.0% | 0 | 0 (0.0%) |
| MACULA Hebrew | in the store | bible-aligned-translation | 1 / 1 | 43,294 | 15,871 | 99.84% | 100.0% | 54.89% | 0 | 0 (0.0%) |
| The UBS Dictionary of Biblical Hebrew (v0.9.2) | in the store | bible-dictionary | 1 / 1 | 21,626 | 6,539 | 63.99% | 99.97% | 27.76% | 4,335 | 0 (0.0%) |
| The SDBH (Semantic Dictionary of Biblical Hebrew) as HiperBiblia gives it | in the store | bible-dictionary | 1 / 1 | 14,821 | 3,659 | 61.37% | 100.0% | 21.03% | 449 | 0 (0.0%) |
| Classical Hebrew Words | in the store | other | 1 / 1 | 7,321 | 4,089 | 70.96% | 0.0% | 0.0% | 868 | 2,121 (29.0%) |
| Davidson's Analytical Hebrew and Chaldee Lexicon | in the store | bible-dictionary | 1 / 1 | 85 | 44 | 0.0% | 0.0% | 0.0% | 0 | 85 (100.0%) |
| The Open Scriptures Hebrew Lexical Index | in the store | bible-dictionary | 1 / 1 | 138 | 134 | 98.55% | 99.28% | 0.0% | 0 | 0 (0.0%) |
| The unfoldingWord Hebrew-Aramaic Lexicon (UHAL) | in the store | bible-dictionary | 1 / 1 | 293 | 77 | 100.0% | 100.0% | 0.0% | 0 | 0 (0.0%) |
| The BiblicalTools Living Lexicon | in the store | bible-dictionary | 1 / 1 | 753 | 713 | 99.87% | 100.0% | 0.0% | 0 | 0 (0.0%) |
| Kethoneth Yoseph (1887) | in the store | rabbinic-dictionary | 1 / 1 | 107 | 82 | 0.0% | 0.0% | 0.0% | 0 | 107 (100.0%) |
| English Wiktionary: its Hebrew entries (as Kaikki gives them) | in the store | general-dictionary-with-entries | 5 / 7 | 123,577 | 59,700 | 76.77% | 0.0% | 0.0% | 1,590 | 27,219 (22.0%) |
| English Wiktionary: Hebrew given as a translation under English entries (Kaikki's table, DBnary) | in the store | word-pair-list | 2 / 2 | 7,006 | 5,725 | 41.64% | 0.0% | 0.0% | 0 | 4,089 (58.4%) |
| English Wiktionary: its Aramaic entries (as Kaikki gives them) | in the store | aramaic-dictionary | 3 / 4 | 2,735 | 1,684 | 19.01% | 0.0% | 0.0% | 92 | 2,123 (77.6%) |
| Hebrew Wiktionary | in the store | general-dictionary-with-entries | 71 / 75 | 25,710 | 14,385 | 50.56% | 0.0% | 0.0% | 0 | 12,711 (49.4%) |
| PanLex | in the store | word-pair-list | 2 / 2 | 38,255 | 12,212 | 30.69% | 0.0% | 0.0% | 0 | 26,514 (69.3%) |
| ConceptNet 5.7 | in the store | knowledge-base | 2 / 2 | 13,978 | 9,986 | 0.0% | 0.0% | 0.0% | 0 | 13,978 (100.0%) |
| OmegaWiki | in the store | knowledge-base | 1 / 1 | 5,363 | 2,605 | 13.02% | 0.0% | 0.0% | 0 | 4,665 (87.0%) |
| MUSE | in the store | word-pair-list | 2 / 3 | 24,514 | 20,057 | 0.0% | 0.0% | 0.0% | 0 | 24,514 (100.0%) |
| Hebrew Wikipedia's titles | in the store | encyclopedia-titles | 1 / 1 | 12,354 | 12,354 | 0.0% | 0.0% | 0.0% | 0 | 12,354 (100.0%) |
| Wikidata's Hebrew lexemes | in the store | knowledge-base | 12 / 13 | 11,743 | 10,744 | 38.69% | 0.0% | 0.0% | 78 | 7,169 (61.0%) |
| Hebrew WordNet | in the store | knowledge-base | 2 / 2 | 4,487 | 3,283 | 99.98% | 0.0% | 0.0% | 0 | 1 (0.0%) |
| Lexibank (NorthEuraLex's Hebrew list) | in the store | word-pair-list | 1 / 1 | 974 | 877 | 0.0% | 0.0% | 0.0% | 0 | 974 (100.0%) |
| English Wikipedia's opening sentences | in the store's index, no row | other | 0 / 18 | 0 | 0 |  |  |  | 0 | 0 |
| Jastrow's dictionary (the overlay beside the store) | beside the store (overlay) | rabbinic-dictionary | 6 | 115,918 | 25,210 | 94.55% | 0% | 8.53% | 0 | |
| The Samaritan overlay (five works) | beside the store (overlay) | other | 5 | 2,875 | 2,239 | 1.91% | 0% | 0% | 0 | |
| The dictionary store | beside the store (records) | other | 119 | 345,833 | 86,128 |  |  |  | 0 | |
| The span store and the piece store | beside the store (per book) | other | 4 | 1,698 |  |  |  |  | 0 | |
| STRUCK: Brown-Driver-Briggs as Bolls gives it | struck whole (the license strike) | bible-dictionary | 1 | 0 | 0 |  |  |  | 0 | |
| STRUCK: Jastrow's tables in the store | struck whole (language admission) | rabbinic-dictionary | 8 | 0 | 0 |  |  |  | 0 | |
| STRUCK: Davidson's earlier tables | struck whole (language admission) | bible-dictionary | 17 | 0 | 0 |  |  |  | 0 | |
| STRUCK: the ETCBC BHSA lexeme gloss | struck whole (language admission) | bible-dictionary | 1 | 0 | 0 |  |  |  | 0 | |
| STRUCK: PanLex's «Hebrew-script-language» tables | struck whole (language admission) | word-pair-list | 2 | 0 | 0 |  |  |  | 0 | |
| STRUCK: English Wiktionary's Yiddish and Arabic entries (Kaikki) | struck whole (language admission) | general-dictionary-with-entries | 5 | 0 | 0 |  |  |  | 0 | |
| STRUCK: English Wiktionary's translation tables of other languages in Hebrew script (Kaikki) | struck whole (language admission) | word-pair-list | 3 | 0 | 0 |  |  |  | 0 | |
| STRUCK: STEP's TAHOT Expanded Strong frame | struck whole (language admission) | bible-dictionary | 1 | 0 | 0 |  |  |  | 0 | |
| STRUCK: Harkavy's dictionary (1925) | struck whole (language admission) | general-dictionary-with-entries | 12 | 0 | 0 |  |  |  | 0 | |

Rows in the store by kind: bible-dictionary 236,503 (36.2%); general-dictionary-with-entries 149,287 (22.9%); bible-aligned-translation 138,327 (21.2%); word-pair-list 70,749 (10.8%); knowledge-base 35,571 (5.4%); encyclopedia-titles 12,354 (1.9%); other 7,321 (1.1%); aramaic-dictionary 2,735 (0.4%); rabbinic-dictionary 107 (0.0%).

The body-of-text record the shelf holds (`reader/data/source-corpus-v1.json`, 6 September): 15 BIBLICAL (one of them M20, since struck), 101 UNDECLARED («general-purpose word list; declares no corpus»), 3 ARAMAIC, and M184 unclassified. Its evidence strings are the corpus lane's wording («classified_by: the corpus lane, from each source's own title»), not quotes.

## What stands across the families

1. **The names gate reads six dictionaries.** 7,412 rows carry the name mark: the UBS dictionary 4,335, English Wiktionary's Hebrew entries 1,590, Classical Hebrew Words 868, the SDBH 449, English Wiktionary's Aramaic entries 92, Wikidata 78. English Wiktionary's own part of speech «name» is already read whole: every row whose every entry is a name is withheld where the word is not a name.
2. **More dictionaries mark names in their own data and are not read.** By their own records in the dictionary store: Strong's (pos n-pr-m, n-pr-loc, n-pr-f, n-pr; and xml:lang x-pn), BDB in both editions (n.pr.m and its kin; «proper name»), the Lexical Index (Np), UHAL («Noun Proper»), Hebrew Wiktionary («שם פרטי»). By the corpus lane's letter v194 also TBESH, BiblicalTools, DBnary, Kaikki's tables, Davidson, WordNet (an instance mark, 34 rows), OmegaWiki (its own part of speech on 13 rows), and TAHOT and MACULA at their places. The lane sizes a wider list («names v2») at about 15,838 name rows and 353 partly a name: its figure, not recounted here.
3. **Eight source files mark no names at all** (v194): ConceptNet's two, PanLex's two, MUSE, Wikipedia's titles, Lexibank, Kethoneth Yoseph; 90,182 rows by the lane's count. Their names stand because their source is silent, not because it says they are words.
4. **139,440 rows (21.4%) carry none of the four marks.** All of MUSE (24,514), ConceptNet (13,978), Wikipedia's titles (12,354), Lexibank (974), Kethoneth Yoseph (107) and Davidson (85); PanLex 26,514; English Wiktionary's Hebrew entries 27,219; Hebrew Wiktionary 12,711; Wikidata 7,169; OmegaWiki 4,665; the translation tables 4,089; the Aramaic entries 2,123; Classical Hebrew Words 2,121; BDB (Open Scriptures) 796; the unabridged BDB 20; WordNet 1. On these rows a rule can only speak of the dictionary as a whole, or of a mark the dictionary has that no row carries yet.
5. **Marks the dictionaries have and no row carries.** English Wiktionary: the binyan of a verb sense, a period label on a sense (Biblical Hebrew, Mishnaic Hebrew, Modern Israeli Hebrew), form-of, alt-of and misspelling. Hebrew Wiktionary: the stratum of each definition (the language of the Bible, of the Sages, of the Middle Ages, new Hebrew), part of speech, the binyan. Classical Hebrew Words: attestation in the Hebrew Bible, Ben Sira, the Dead Sea Scrolls, inscriptions. ConceptNet: the relation of the edge and the dataset behind it. The UBS dictionary and the SDBH: lexical domains. BDB: part of speech, sense numbers; in the unabridged edition the label Biblical Hebrew or Biblical Aramaic. Wikidata: the lexical category. WordNet: part of speech. The counts stand in each family's section.
6. **Two kinds inside one family.** English Wiktionary: 16,225 rows are entries; 107,352 are an entry's gloss stood under each form the entry lists; 7,006 are Hebrew words listed as translations under English entries. Hebrew Wiktionary: five kinds of table by what the row is keyed under. OmegaWiki: a definition of the thing or an English word. Strong's: one row per King James rendering under each inflected form (M14) or the lemma's entry (M9).
7. **Two aligned translations are not dictionaries.** TAHOT and MACULA (138,327 rows, 21.2%) give the English of one place; a row stands on every card of the same letters and cites only its first place.

## Each family

### Strong's Hebrew dictionary (1890)

- **M ids**: M9 M14. Source keys: openscriptures_strongs, wikisource_strongs_explicit_forms.
- **Shelf**: in the store. **Kind**: bible-dictionary. A dictionary with numbered entries (headword, part of speech, derivation, meaning, the King James renderings) of the words of the Hebrew Bible.
- **What it says it is**: Hebrew Wikisource's book template, on each of its 9 files: שם ספר «מילון הקונקורדנציה של סטרונג», שם נוסף «המילון העברי הקצר», סוגה «מילון», מחבר «ג'יימס סטרונג (1822-1894)». The Open Scriptures file (HebrewStrong.xml) states no title in any record read; its label «Strong's Hebrew Dictionary via Open Scriptures» is this project's.
- **Where the quote stands**: reader/data/route-store/source-declarations-v1.bin, stems.wikisource_strongs_explicit_forms.channels (work_identity_statement): the digitizer's catalog template, not Strong's title page. Labels: route-store/index.json m_sources. source-corpus-v1.json's evidence «Hebrew dictionary of the Old Testament» is the corpus lane's wording, not a quote.
- **The body of text it names**: The Hebrew Bible (source-corpus: BIBLICAL, in the corpus lane's words).
- **Kinds it marks in its own data**: Open Scriptures XML (8,543 records served in the dictionary store; 8,674 in the file): an entry number on every entry; part of speech on every entry (w/@pos, 52 values: n-m 2,380, v 1,615, n-pr-m 1,457, n-f 1,354, n-pr-loc 671, a 535, n-pr-f 128, n-pr 53); a language mark (xml:lang: heb 5,393, x-pn 2,628, arc 653); pointed headword, pronunciation, transliteration; <source> (derivation, with pointers to other numbers), <meaning> with <def> spans, <usage> (the King James renderings), <note> (162). Wikisource edition: entry number, pointed headword, definition, the inflected forms it files under each number with their verses; no part of speech.
- **What the site acts on today**: Entry number (entry gate; 100% of rows). Pointed headword (pointing gate; M9 100%, M14 11.43%, the family 23.61%). Ledger division (the King James lists: one pill per rendering; 4,610 rows divide). Pointer pills (M14). Made spaces closed at print. Year 1890 (the order).
- **Carried and unused**: The definition text on 156,268 rows (slot 2). The cut flag (8,402 rows). A line in the stems ledger for 60.6% of rows, every one «unknown» (Strong names no stem). The whole XML record in the dictionary store.
- **It has, and no row carries**: Part of speech, and with it Strong's own name marks (n-pr-m, n-pr-loc, n-pr-f, n-pr; and x-pn): the names gate does not read Strong's, though the corpus lane's letter v194 says «Strong's does [mark names], by its part of speech n-pr and also by the language mark x-pn on 263 entries, gentilics and months among them». Strong's own hedges (the lane's v170 ledger, not wired). Known from the dictionary store's records and from source-declarations-v1.bin.
- **Counts and notes**: Two digitizations of one work. M14 (Hebrew Wikisource): 148,343 rows on 17,003 keys, one row per King James rendering under each inflected form Wikisource lists for a number. M9 (Open Scriptures): 23,646 rows on 5,939 keys, lemma-keyed.

### Brown-Driver-Briggs (1906), the Open Scriptures edition

- **M ids**: M5. Source keys: openscriptures_bdb_1906.
- **Shelf**: in the store. **Kind**: bible-dictionary. A lexicon with entries (headword, part of speech, numbered senses, stems, verse references) of Biblical Hebrew and Aramaic.
- **What it says it is**: No title in any record read: the file is BrownDriverBriggs.xml of the Open Scriptures «hebrewlexicon». The label «Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures» is this project's.
- **Where the quote stands**: route-store/index.json m_sources.M5 (label); source-declarations-v1.bin, stems.openscriptures_bdb_1906 (no self-description channel). source-corpus evidence «a lexicon of the Old Testament»: the lane's wording.
- **The body of text it names**: The Hebrew Bible, Hebrew and Aramaic (its parts carry xml:lang heb on 10,993 entries and arc on 852).
- **Kinds it marks in its own data**: Its own entry id (a.bf.ab). <pos> on 8,512 of 11,845 entries, 174 values (vb 1,587; n.pr.m 1,366; n.f 1,282; n.m 1,275; n.pr.loc 610; adj.gent 189; n.pr.f 100; n.pr 70; n.pr.gent 43). Numbered senses <sense n> (7,900 in 1,643 of the 6,251 served records). <stem> (3,132 in 1,382 records). <def> spans. Verse <ref>. Cognates with a language tag (<foreign>: ara 449, syr 123, akk 104). An editor's <status> on every entry (base 6,395; ref 2,312; made 2,123; done 560; new 453). Root entries.
- **What the site acts on today**: Entry: its own entry id on every row (facts.b) and the Strong's number through the lexical index (94.29% of rows): the entry gate. Pointed headword (94.01%). Stems by its own label (25.02% of rows): the stem gate. Ledger division; made spaces.
- **Carried and unused**: The definition text (12,689 rows). The cut flag (755). The whole XML record in the dictionary store.
- **It has, and no row carries**: Part of speech, with its name marks (n.pr.m, n.pr.loc, n.pr.f, n.pr, n.pr.gent, adj.gent): not read by the names gate (v194: both BDBs mark names). The sense number of a row. Verse references. The editor's status. 796 rows carry none of the four marks a gate reads.
- **Counts and notes**: 15,238 rows on 4,367 keys.

### Brown-Driver-Briggs (1906), the unabridged edition

- **M ids**: M46. Source keys: unabridged_bdb_1906.
- **Shelf**: in the store. **Kind**: bible-dictionary. By its own first line a Hebrew and English lexicon, each entry labeled Biblical Hebrew or Biblical Aramaic.
- **What it says it is**: README line 1: «# The Brown-Driver-Briggs Hebrew and English Lexicon»; line 3: «License: Public domain document; formatting developed for use in ... by Eliran Wong.» Each record's own navigation label: «BIBLICAL HEBREW» (9,263 of 10,022 catalog rows) or «BIBLICAL ARAMAIC» (759).
- **Where the quote stands**: source-declarations-v1.bin, stems.unabridged_bdb_1906.channels; and the records themselves, reader/data/dictionary-store (field D: 4,735 Hebrew and 93 Aramaic of the 4,828 served).
- **The body of text it names**: The Hebrew Bible: Biblical Hebrew and Biblical Aramaic, by its own labels.
- **Kinds it marks in its own data**: BDB's entry id with the Strong's number in the heading. The language label of each entry. Part of speech in bold after the headword (verb 935; proper name, masculine 829; noun masculine 708; noun feminine 615; proper name, of a location 314; proper name, feminine 50; adjective, of a people 29). Numbered sense points (8,242 in 2,510 records). Stems in bold (Qal 954, Hiph`il 478, Niph`al 393, Pi`el 333; 1,106 records). Verse references; Greek; transliterations. The formatter's flags <checkingNeeded/> (650) and <wrongReferenceRemoved/> (174).
- **What the site acts on today**: Entry number (99.42%). Pointed headword (98.83%). Stems by its own label (13.02%). The words that open a numbered sense print as a note, not a pill (facts.opens, 2,008 rows; sense-openings-rule-v1). Ledger division (3,838 rows); made spaces.
- **Carried and unused**: The whole record in the dictionary store.
- **It has, and no row carries**: The Hebrew or Aramaic label of the entry. Part of speech, with «proper name»: not read by the names gate. The sense point of a row, except on the 2,008 openings. The flags.
- **Counts and notes**: 8,915 rows on 3,682 keys.

### STEP's TAHOT (Translators Amalgamated Hebrew OT)

- **M ids**: M4. Source keys: stepbible_tahot_aligned_translation.
- **Shelf**: in the store. **Kind**: bible-aligned-translation. Not a dictionary: a translation of the Hebrew Bible aligned word by word, each row the English one place gives its word.
- **What it says it is**: The provider's own field descriptions. Hebrew: «Full Hebrew including pointing, cantillation and punctuation with forward slash ( / ) separating prefixes and suffixes from the root word and backward slash ( \ ) separating punctuation.» Grammar: «Morphology is from ETCBC, with Ketiv forms parsed by Tyndale scholars. Morphology codes follow the form defined by OpenScriptures with some adaptations.» Its folder: «Translators Amalgamated OT+NT». Its header: «Eng (Heb) Ref & Type / Hebrew / Transliteration / Translation / dStrongs / Grammar / Meaning Variants / Spelling Variants / Root dStrong+Instance / Alternative Strongs+Instance / Conjoin word / Expanded Strong tags».
- **Where the quote stands**: source-declarations-v1.bin, stems.stepbible_tahot_aligned_translation (branches and channels); reader/data/dictionary-store/index.json, language_rules.legend_lines. The label «STEP Bible Translators Amalgamated Hebrew OT aligned component translation» is this project's.
- **The body of text it names**: The Hebrew Bible, place by place (231,765 word rows: Hebrew 226,929, Aramaic 4,827).
- **Kinds it marks in its own data**: At each word: the pointed form with its prefixes and suffixes cut; the translation of that place; a Strong's number per piece with STEP's own letters; grammar (language, part of speech with Np a name and Ng a gentilic, stem, person, gender, number, state); written or read (L 230,473; Q(K) 713); meaning and spelling variants.
- **What the site acts on today**: Pointed headword (99.97%). Entry numbers from its tags (100%; STEP's letters on 38,553 rows): the entry gate. Stems by occurrence (41.17%): the stem gate. Its Np grammar names the name places for the names gate. The place's own reading (PIECE:TAHOT). 430 rows print no pill.
- **Carried and unused**: Its readings at all their places stand in the dictionary store (97,363 TAHOT readings) and are read only under the «concordance hud» pill.
- **It has, and no row carries**: The places a row is true at: a row cites its first place only, and stands on every card of the same letters. The grammar of the place on the row.
- **Counts and notes**: 95,033 rows on 46,601 keys. The corpus lane's v190 (not landed) treats «TAHOT rows of another place».

### STEP's TBESH (Translators Brief lexicon of Extended Strongs for Hebrew)

- **M ids**: M19. Source keys: stepbible_tbesh_gloss.
- **Shelf**: in the store. **Kind**: bible-dictionary. By its own file name a brief lexicon keyed by extended Strong's numbers.
- **What it says it is**: Its file name: «TBESH - Translators Brief lexicon of Extended Strongs for Hebrew - STEPBible.org CC BY.txt». Its field descriptions. Gloss: «These were created by Tyndale scholars». Hebrew form: «These are based on BDB, then normalised.» Meaning: «These are based on the Abridged BDB by Online Bible, (c) Larry Pierce of OnlineBible.net. They are for guidance only. Permission should be gained from Online Bible before these are applied in any project.»
- **Where the quote stands**: source-declarations-v1.bin, stems.stepbible_tbesh_gloss (channels provenance_or_crossref).
- **The body of text it names**: The Hebrew Bible.
- **Kinds it marks in its own data**: An extended Strong's number in two schemes (OpenScriptures' and STEP's own letters). The relation of an entry to another («a Meaning of», «a Name of»). A part of speech and name code (N 8,912; V 2,066; A 438 of 11,682 entries; its key: «LG/PG=Gentilic, T=Title»). Language (H 6,489; A 669). The Gloss column (served) and the Meaning column (needs permission; not served).
- **What the site acts on today**: Entry number (100%; STEP's letters on 1,185 rows). Pointed headword (99.89%).
- **Carried and unused**: A line in the stems ledger for 36.9% of rows, all «unknown».
- **It has, and no row carries**: Its name codes (v194: TBESH marks names; 49 gentilic rows by its own key, 5 rows coded TG): not read by the names gate. The relation «a Meaning of».
- **Counts and notes**: 2,645 rows on 1,814 keys.

### MACULA Hebrew

- **M ids**: M3. Source keys: macula_hebrew_cherith_surface_english_2022.
- **Shelf**: in the store. **Kind**: bible-aligned-translation. Not a dictionary: a word-by-word morphology of the Hebrew Bible with an English gloss at each word.
- **What it says it is**: No self-description in any record read. The label «MACULA exact Hebrew morph surfaces with Cherith English definitions» is this project's. The corpus lane's ledger reports that the source's license page «names the English as Cherith's glosses» (the lane's report, not a quote).
- **Where the quote stands**: route-store/index.json m_sources.M3 (label); reader/data/ledgers-v1/macula_hebrew_cherith_surface_english_2022/declaration.json (read_from).
- **The body of text it names**: The Hebrew Bible, word by word (475,911 word rows: H 468,362, A 7,549).
- **Kinds it marks in its own data**: At each word: lemma, Strong's number, sense number (180,502 rows), class and part of speech (noun 146,281; verb 73,055), type (common 110,120; proper 33,966), stem (73,688 rows: qal 50,179, hiphil 9,409, piel 6,484), gender, number, person, state, language.
- **What the site acts on today**: Pointed headword (99.84%). Entry number (100%). Stems by occurrence (54.89%). Its noun/proper names the name places for the names gate. The place's own reading (PIECE:MACULA).
- **Carried and unused**: Its readings at their places in the dictionary store (141,349).
- **It has, and no row carries**: The sense number. The places a row is true at.
- **Counts and notes**: 43,294 rows on 15,871 keys.

### The UBS Dictionary of Biblical Hebrew (v0.9.2)

- **M ids**: M18. Source keys: ubs_sdbh_hebrew_v0_9_2.
- **Shelf**: in the store. **Kind**: bible-dictionary. A dictionary of the words of the Old Testament, with entries, parts of speech, numbered meanings, lexical domains and definitions.
- **What it says it is**: Its README: «SDBH is an ongoing project and to date around 90% of all words found in the Old Testament are included. The remaining 10% will be added once they become available.» Its notice as HiperBiblia prints it: «UBS Dictionary of Biblical Hebrew © United Bible Societies, 2023. Adapted from Semantic Dictionary of Biblical Hebrew © 2000-2023 United Bible Societies.»
- **Where the quote stands**: source-declarations-v1.bin, stems.ubs_sdbh_hebrew_v0_9_2.channels (README.md, prose paragraph 2); the notice in the dictionary store's HiperBiblia records.
- **The body of text it names**: The Hebrew Bible («all words found in the Old Testament»).
- **Kinds it marks in its own data**: Entry id, Strong's codes, HasAramaic (680 of 7,932 entries). Part of speech per base form (noun m 2,470; name 2,454; verb 1,715; noun f 1,398). Per meaning: a lexical domain (380 domains: Names of People 2,808; Names of Locations 905; Names of Groups 324), a form label (the stem: verb qal 2,734, hif 1,235, pi 920, nif 725), an entry code and indent (numbered meanings), collocations, verse references. Per sense: a short definition and glosses.
- **What the site acts on today**: The name mark (4,335 rows; names gate). Entry number (99.97%). Stems (27.76%, by the stems extension). Pointed headword (63.99%). Pointer pills. Ledger division.
- **Carried and unused**: The whole JSON entry in the dictionary store.
- **It has, and no row carries**: The lexical domains (a name is also marked there: Names of People, of Locations, of Groups). Verse references, collocations, HasAramaic.
- **Counts and notes**: 21,626 rows on 6,539 keys. One work with the SDBH below, in two editions (the corpus lane).

### The SDBH (Semantic Dictionary of Biblical Hebrew) as HiperBiblia gives it

- **M ids**: M17. Source keys: hiperbiblia_sdbh.
- **Shelf**: in the store. **Kind**: bible-dictionary. By the notice on every record, the UBS Dictionary of Biblical Hebrew adapted from the Semantic Dictionary of Biblical Hebrew.
- **What it says it is**: Every served record ends: «UBS Dictionary of Biblical Hebrew © United Bible Societies, 2023. Adapted from Semantic Dictionary of Biblical Hebrew © 2000-2023 United Bible Societies. Licensed CC BY-SA 4.0.» 5,248 of the 5,830 open «Brown-Driver-Briggs (BDB) Semantic Dictionary of Biblical Hebrew (SDBH)» (the web page's headings as the crawl kept them).
- **Where the quote stands**: reader/data/dictionary-store, records of M17 (field D).
- **The body of text it names**: The Hebrew Bible.
- **Kinds it marks in its own data**: A Strong's number (H or A and digits). Part of speech (noun m 2,580; name 2,217; verb 1,703 of 8,934 crawled records; «Aramaic» beside some). A lexical domain per meaning, a definition, glosses, verse counts. No stem.
- **What the site acts on today**: The name mark (449 rows). Entry number (100%). Stems borrowed from the UBS edition by the owner's ruling 2 (21.03%). Pointed headword (61.37%).
- **Carried and unused**: The definition text (13,948 rows); the cut flag (547).
- **It has, and no row carries**: The lexical domain.
- **Counts and notes**: 14,821 rows on 3,659 keys.

### Classical Hebrew Words

- **M ids**: M23. Source keys: classical_hebrew_words.
- **Shelf**: in the store. **Kind**: other. A word list with entries (headword, part of speech, homonym number, gloss) of Classical Hebrew, a body wider than the Bible by its own fields; neither a Bible dictionary by its own word nor a general one.
- **What it says it is**: No self-description in any record read. The label «Classical Hebrew Words database» is this project's. The corpus lane's ledger reports the source's landing page (fetched 22 September 2026) as naming the Dictionary of Classical Hebrew (DCH) and its revision (DCHR) and saying the data is still being proofread: the lane's report, not a quote.
- **Where the quote stands**: route-store/index.json m_sources.M23; reader/data/ledgers-v1/classical_hebrew_words/declaration.json (read_from); its fields in source-declarations-v1.bin, stems.classical_hebrew_words.
- **The body of text it names**: Classical Hebrew: each record counts its attestation in the «Hebrew Bible», «Ben Sira», the «Dead Sea Scrolls» and «inscriptions». source-corpus-v1.json sorts it BIBLICAL with the evidence «aligned to the Hebrew Old Testament text», which its fields do not say.
- **Kinds it marks in its own data**: A record id; a homonym numeral (on 7,071 of 15,084 records); part of speech, 144 values (vb. 2,238; n.m. 1,780; pr.n.m. 1,360; prnm 658); a semantic field (1,634 records); attestation counts per body of text; the flags proposed_hb «*» (6,514) and attested_non_hb «•» (2,114).
- **What the site acts on today**: The name mark (868 rows; names gate). Pointed headword (70.96%). Ledger division.
- **Carried and unused**: A line in the stems ledger for 35.35% of rows, all «unknown».
- **It has, and no row carries**: The attestation per body of text (it would tell a word of the Bible from a word of the Scrolls or Ben Sira only). The two flags. The semantic field. The homonym numeral. It names no Strong's number, so the entry gate cannot act: 2,121 rows carry none of the four marks.
- **Counts and notes**: 7,321 rows on 4,089 keys.

### Davidson's Analytical Hebrew and Chaldee Lexicon

- **M ids**: M97. Source keys: davidson_1855_manual_source_image_reviewed_v1.
- **Shelf**: in the store. **Kind**: bible-dictionary. By its title page a lexicon of every word and inflection of the Old Testament Scriptures.
- **What it says it is**: Its title page: «ANALYTICAL HEBREW AND CHALDEE» [lexicon] … «every word and inflection contained in the Old Testament Scriptures, precisely as they occur in the sacred text» … «BY B. DAVIDSON» … «SAMUEL BAGSTER AND SONS» … «SECOND EDITION». The Internet Archive's title: «The analytical Hebrew and Chaldee lexicon ..».
- **Where the quote stands**: source-declarations-v1.bin, stems.davidson_1855_manual_source_image_reviewed_v1 (work_identity_statement, edition_or_version: the title page's lines by byte offset).
- **The body of text it names**: The Old Testament Scriptures.
- **Kinds it marks in its own data**: In the print. The store's rows are boxes read from page images; no field of the source is carried beside the text. v194 lists Davidson among the sources that mark names.
- **What the site acts on today**: Nothing: no pointed headword, no number, no stem, no name mark on any of its 85 rows. Its year (1848, the catalog's) is held.
- **It has, and no row carries**: Whatever the page marks (part of speech, names): not read.
- **Counts and notes**: 85 rows on 44 keys, «only the senses no other dictionary shares» (the store index). Seventeen earlier tables of the same book were struck by language admission (below).

### The Open Scriptures Hebrew Lexical Index

- **M ids**: M33. Source keys: openscriptures_lexical_index.
- **Shelf**: in the store. **Kind**: bible-dictionary. An index of the entries of a Bible lexicon (a headword, a part of speech, a short definition, cross-references to BDB, Strong's and TWOT); judged from its file, since it states no title.
- **What it says it is**: No title in any record read: the file is LexicalIndex.xml of the Open Scriptures «hebrewlexicon». The label is this project's.
- **Where the quote stands**: route-store/index.json m_sources.M33; source-declarations-v1.bin, stems.openscriptures_lexical_index.
- **The body of text it names**: The Hebrew Bible (its parts: heb 9,432 entries, arc 789). source-corpus's evidence «aligned to the Hebrew Old Testament text» is the lane's wording.
- **Kinds it marks in its own data**: Its own entry id; part of speech (N 4,079; Np 2,510; V 1,821; Ng 9 of 10,221 entries); cross-references (BDB id, Strong's number, TWOT); a main, sub or single entry type.
- **What the site acts on today**: Entry number (99.28%). Pointed headword (98.55%).
- **It has, and no row carries**: Part of speech: 286 of the 339 served records are Np, a name, and the names gate does not read it.
- **Counts and notes**: 138 rows on 134 keys.

### The unfoldingWord Hebrew-Aramaic Lexicon (UHAL)

- **M ids**: M7. Source keys: unfoldingword_uhal.
- **Shelf**: in the store. **Kind**: bible-dictionary. A lexicon with entries tied to Strong's numbers, BDB references and citations of Scripture.
- **What it says it is**: No title in any record read; the label «unfoldingWord Hebrew-Aramaic Lexicon» is this project's. Each entry file carries «<!-- Status: S2="NeedsEdits" -->» (7,088 of 7,088) and «Instances in Scripture: TBS» (7,085).
- **Where the quote stands**: route-store/index.json m_sources.M7; source-declarations-v1.bin, stems.unfoldingword_uhal; the records in the dictionary store.
- **The body of text it names**: The Hebrew Bible (source-corpus: «Hebrew-Aramaic lexicon of the Old Testament», the lane's wording).
- **Kinds it marks in its own data**: Strong's number; BDB reference and root; part of speech (Noun Masculine 1,873; Verb 1,196; Noun Proper Masculine 1,174; Noun Feminine 1,067; Noun Proper Locative 520 of 7,088 files); numbered senses, each with definition, glosses, citations.
- **What the site acts on today**: Entry number (100%). Pointed headword (100%).
- **It has, and no row carries**: Part of speech with «Noun Proper» (68 of the 151 served records): not read by the names gate. Its own status «NeedsEdits».
- **Counts and notes**: 293 rows on 77 keys.

### The BiblicalTools Living Lexicon

- **M ids**: M45. Source keys: biblicaltools_living_lexicon.
- **Shelf**: in the store. **Kind**: bible-dictionary. Entries keyed by Strong's numbers carrying Strong's glosses; judged from the corpus lane's account, since no record quotes it.
- **What it says it is**: No self-description in any record read, and it is not in the declarations sidecar. The label «BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas» is this project's.
- **Where the quote stands**: route-store/index.json m_sources.M45; reader/data/ledgers-v1/biblicaltools_living_lexicon/declaration.json (read_from: its manifest gives the origin of its definitions and glosses as «strongs_concordance_public_domain»; 8,640 entries, each with an id and a Strong's number).
- **The body of text it names**: The Hebrew Bible (source-corpus: «Hebrew dictionary of the Old Testament», the lane's wording).
- **Kinds it marks in its own data**: An entry id and a Strong's number. v194 lists it among the sources that mark names.
- **What the site acts on today**: Entry number (100%). Pointed headword (99.87%).
- **It has, and no row carries**: Its name mark.
- **Counts and notes**: 753 rows on 713 keys; 367 of its 798 declared routes stand in no Strong's route under their key (the lane's ledger).

### Kethoneth Yoseph (1887)

- **M ids**: M184. Source keys: kethoneth_yoseph_1887_source_image_reviewed.
- **Shelf**: in the store. **Kind**: rabbinic-dictionary. By its own title a handbook of Hebrew abbreviations for students of the Oral Law and rabbinical literature: a list of abbreviations with their expansions, not a dictionary of words.
- **What it says it is**: Its title as the Internet Archive records it: «Kethoneth Yoseph : a hand-book of Hebrew abbreviations, with their explanations in Hebrew and English, for the use of students of the Oral Law and rabbinical literature». Subject: «Abbreviations, Hebrew». Publisher: «Bombay : Printed at the Anglo-Jewish and Vernacular Press». Date: 1887.
- **Where the quote stands**: source-declarations-v1.bin, stems.kethoneth_yoseph_1887_source_image_reviewed.channels (archive-metadata.json).
- **The body of text it names**: Rabbinical literature, by its title. source-corpus-v1.json leaves it unclassified («the corpus lane's ledger does not carry this label»).
- **Kinds it marks in its own data**: None (v194: Kethoneth marks no names).
- **What the site acts on today**: Nothing: none of its 107 rows carries a pointed headword, a number, a stem or a name mark.
- **Counts and notes**: 107 rows on 82 keys. It stands in the store among the Bible dictionaries' rows with nothing on the card saying its subject.

### English Wiktionary: its Hebrew entries (as Kaikki gives them)

- **M ids**: M11 M13 M25 M50 M69 (no row: M30 M35). Source keys: kaikki_wiktionary_hebrew.
- **Shelf**: in the store. **Kind**: general-dictionary-with-entries. A dictionary with entries (headword, part of speech, numbered senses, labels on single senses) of Hebrew of every period, written by its readers.
- **What it says it is**: Each record's own fields «"lang": "Hebrew"», «"lang_code": "he"» (17,395 of 17,395 records of the file). Kaikki's page footer, kept for its Aramaic and English index pages: «This dictionary is based on structured data extracted on 2026-07-09 from the enwiktionary dump dated 2026-07-06 using wiktextract (e62056b and e7887d5)». The labels («Kaikki machine-readable Hebrew dictionary from English Wiktionary» and four more) are this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.kaikki_wiktionary_hebrew.branches (language) and stems.kaikki_wiktionary_aramaic.channels (the footer); the records in reader/data/dictionary-store (field D).
- **The body of text it names**: None: Hebrew of every period. It labels single senses instead (Biblical Hebrew, Mishnaic Hebrew, Modern Israeli Hebrew).
- **Kinds it marks in its own data**: Part of speech per record, 25 values in the file (noun 8,969; verb 3,559; name 1,612; adj 1,609; root 325 of 17,395 records). On senses, counted in the 13,262 distinct entries the dictionary store serves (18,364 senses): tags, 167 distinct: the binyan (construction-pa'al 1,231 senses, pi'el 997, hif'il 557, hitpa'el 333, nif'al 219, pu'al 218, huf'al 79); form-of 2,188, alt-of 1,398, misspelling 1,043; a period or variety (Biblical-Hebrew 323, archaic 155, Modern-Israeli-Hebrew 122, dated 73, historical 73, obsolete 42); a register (colloquial 173, slang 129, literary 80, rare 75). The same labels written before the gloss («(biblical)» 258, «(Biblical Hebrew)» 214, «(Modern Israeli Hebrew)» 78, «(Mishnaic Hebrew)» 44). Topics, 213 (lifestyle 501, sciences 411, religion 343, biblical 316). Categories («Hebrew given names» 351, «Biblical Hebrew» 324, «Hebrew male given names» 263, «Biblical characters» 150, «Hebrew hapax legomena» 74, «Mishnaic Hebrew» 69). An etymology number on 2,175 entries. Senses in order (3,318 entries have several), examples with their sources (3,699 senses), a pointed canonical form, inflection tables.
- **What the site acts on today**: The name mark, from pos «name» (1,590 rows: M13 1,481, M25 106, M69 2, M50 1): the names gate. Pointed headword (76.77%; M13, the entries themselves, 0.01%; M25 and M50 100%). Pointer pills from the corpus lane's map of the 39 books' pills (FORM_OF 2,140, MIXED 568). Ledger division (53,049 rows).
- **Carried and unused**: The whole Kaikki record in the dictionary store, with every mark above. A line in the stems ledger for 15.72% of rows, every one «unknown».
- **It has, and no row carries**: Every part of speech but «name». The binyan tags: no row of this family has a stem in the stems ledgers; by my own join 4,080 rows have a binyan on every sense behind them. The period and variety tags: the row's text is the gloss without its label; by my join 741 rows have one on every sense behind them (Biblical-Hebrew 325, archaic 140, Modern-Israeli-Hebrew 114). form-of, alt-of and misspelling as marks (my join: 2,166, 1,219 and 981 rows). Topics, categories, the etymology number. My join reaches 18,151 of the 123,577 rows.
- **Counts and notes**: 123,577 rows on 59,700 keys. Five tables: M13, the entries (16,225 rows on unpointed page titles); M25 and M50, «linked forms» (78,344 rows); M11 and M69, «inflection-table forms» (29,008 rows). So 107,352 rows (86.9%) are an entry's gloss stood under each form the entry lists. M30 and M35 hold no row. 27,219 rows carry none of the four marks a gate reads.

### English Wiktionary: Hebrew given as a translation under English entries (Kaikki's table, DBnary)

- **M ids**: M34 M37. Source keys: dbnary_english_wiktionary_hebrew_translation_gloss, kaikki_english_wiktionary_hebrew_translation_table.
- **Shelf**: in the store. **Kind**: word-pair-list. No Hebrew entry stands behind a row: a Hebrew word is listed as a translation under an English entry's sense, so each row pairs a Hebrew string with an English headword.
- **What it says it is**: Kaikki's footer on its English index page (the sentence above). DBnary's own classes: «dbnary:Translation» (3,563,164), «ontolex:LexicalEntry», «ontolex:LexicalSense». The labels are this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.kaikki_english_wiktionary_hebrew_translation_table and stems.dbnary_english_wiktionary_hebrew_translation_gloss.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: The English entry's part of speech (Kaikki's English file: noun 825,898; verb 221,038; name 198,366; DBnary: lexinfo:properNoun 196,890). The English sense's gloss («pygmy chimpanzee», «biblical character»). The target language of a translation.
- **What the site acts on today**: Pointed headword where the translation is written pointed (41.64%). 16 rows print no pill.
- **Carried and unused**: The English sense's gloss, carried as the definition text (6,997 rows) and in the dictionary store.
- **It has, and no row carries**: The English entry's part of speech, so its «name» (v194: DBnary and Kaikki's tables mark names). The corpus lane's ledger: «the source has no entry for the Hebrew at all: a Hebrew word stands here only as a translation on an English page».
- **Counts and notes**: 7,006 rows on 5,725 keys (M37 DBnary 6,156; M34 Kaikki 850). 4,089 rows carry none of the four marks. With the Hebrew entries above this is «English Wiktionary as Kaikki and DBnary give it»: 130,583 rows.

### English Wiktionary: its Aramaic entries (as Kaikki gives them)

- **M ids**: M60 M72 M177 (no row: M112). Source keys: kaikki_wiktionary_aramaic.
- **Shelf**: in the store. **Kind**: aramaic-dictionary. A dictionary with entries of Aramaic of every period and dialect, by its own language field.
- **What it says it is**: The file's own fields «"lang": "Aramaic"», «"lang_code": "arc"». Kaikki's footer on Aramaic-words-index.html (the sentence above). The labels are this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.kaikki_wiktionary_aramaic (channels language, source_self_description).
- **The body of text it names**: None: Aramaic of every period. It labels senses by dialect.
- **Kinds it marks in its own data**: Part of speech (noun 1,142; verb 471; adj 272; name 135 of the file's 2,275 records). Sense tags, counted in the 1,639 distinct entries served (2,357 senses): a dialect (Jewish-Babylonian-Aramaic 52 senses, Jewish-Palestinian-Aramaic 15, Jewish-Literary-Aramaic 9, Syriac 4). Labels before the gloss («Jewish Babylonian Aramaic» 31, «biblical» 31). Categories («Biblical Aramaic» among them).
- **What the site acts on today**: The name mark (92 rows). Pointed headword (19.01%). Pointer pills (M60).
- **Carried and unused**: The record in the dictionary store.
- **It has, and no row carries**: The dialect of a sense (my join: 65 of the 2,221 rows it reaches have one on every sense behind them). Part of speech but «name».
- **Counts and notes**: 2,735 rows on 1,684 keys (M60 2,222; M72 499; M177 14; M112 none). 2,123 rows (77.6%) carry none of the four marks. source-corpus: ARAMAIC, «declares Aramaic».

### Hebrew Wiktionary

- **M ids**: M27 M29 M36 M38 M41 M44 M54 M55 M58 M59 M68 M71 M74 M79 M80 M85 M86 M90 M92 M93 M95 M96 M98 M102 M105 M110 M111 M116 M123 M128 M129 M130 M132 M133 M135 M137 M139 M142 M144 M145 M148 M149 M150 M151 M152 M154 M155 M157 M160 M161 M162 M163 M164 M165 M167 M169 M170 M171 M173 M174 M179 M180 M182 M183 M185 M187 M188 M189 M191 M192 M195 (no row: M134 M186 M190 M196). Source keys: hewiktionary_hebrew_exact_english_translation, hewiktionary_hebrew_explicit_full_spelling_english_translation, hewiktionary_hebrew_explicit_heading_alternate_english_translation, hewiktionary_hebrew_explicit_inflection_english_translation, hewiktionary_hebrew_explicit_inflection_recovery_english_translation.
- **Shelf**: in the store. **Kind**: general-dictionary-with-entries. A dictionary with entries (pointed headword, a grammar box, numbered definitions labeled by stratum, translations) of Hebrew of every period, written by its readers.
- **What it says it is**: Its own site name «ויקימילון» and database name «hewiktionary», in the header of its dump.
- **Where the quote stands**: source-declarations-v1.bin, stems.hewiktionary_hebrew_exact_english_translation.channels (MediaWiki <siteinfo>); the records in the dictionary store (field D, the page's wikitext).
- **The body of text it names**: None: Hebrew of every period. It labels each definition by its stratum.
- **Kinds it marks in its own data**: Counted in the 8,976 distinct pages the dictionary store serves (the dump has 31,167). A grammar box «ניתוח דקדוקי» on 7,935: part of speech (6,810 filled; a proper noun, «שם־עצם פרטי», «שם פרטי», «שם־פרטי», «שם-פרטי», on 58), gender, root, pattern, inflections, and the binyan (953 pages served; in the dump 2,846: קל 970, פיעל 791, הפעיל 316). Numbered definitions (15,724 lines; 3,785 pages have several). A stratum label opening a definition, «{{רובד|…}}», on 4,438 lines («עברית חדשה» 869, «המקרא» 643, «לשון המקרא» 636, «חזל» 448, «לשון חז"ל» 445, «חז"ל» 317, «הביניים» 133; the one-letter values «ח» 552, «מ» 115, «ת» 42, «ב» 18 not read), and the older «{{מקרא}}» 420 and «{{חזל}}» 274. Register «{{משלב}}» 1,128; figurative «{{בהשאלה}}» 1,000; context «{{הקשר}}» 882; slang 131. Categories (hapax of the Tanakh «מילים יחידאיות בתנ"ך» 644; names «שמות» 198; «לשון חז"ל» 177; «מילים מקראיות» 174). Translations, in some entries per meaning.
- **What the site acts on today**: Pointed headword (50.56%: the «pointed inflection forms» tables 100%, the page-title tables 0%). 63 rows print no pill.
- **Carried and unused**: The page's wikitext in the dictionary store, with every mark above.
- **It has, and no row carries**: All of it: part of speech and proper noun, the binyan (its rows have a line in the stems ledger, all «unknown»), the stratum of a definition, the register, the numbered definitions. A row is the English of the entry's translation section, stood under the page title, its full spelling, its heading's alternates or its listed inflections. v194 lists Hebrew Wiktionary among the sources that mark names. Counted on records and lines, not rows: a translation belongs to the entry, a stratum to one definition.
- **Counts and notes**: 25,710 rows on 14,385 keys, 71 tables with rows of 75: page titles 10,403 rows; pointed inflection forms 12,081; full spellings 2,305; recovered inflections 816; heading alternates 105. 12,711 rows (49.4%) carry none of the four marks.

### PanLex

- **M ids**: M21 M42. Source keys: panlex_hebrew_english_definitions_20250201, panlex_hebrew_english_meanings_20240301.
- **Shelf**: in the store. **Kind**: word-pair-list. A database of expressions of every language joined by a meaning id: a row pairs a Hebrew expression with an English one, or with an English definition filed under the same meaning.
- **What it says it is**: Its README, as the record cuts it: «This dataset has been extracted from https://panlex.org (the `20240301` datab…». Its table header: «id langvar txt txt_degr meaning langvar_uid». The labels are this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.panlex_hebrew_english_meanings_20240301 (branches edition_or_version, channels source_self_description).
- **The body of text it names**: Every language.
- **Kinds it marks in its own data**: A language variety on each expression (heb-000 313,099; heb-003 11,089; heb-002 1,513; heb-001 866). A meaning id. Nothing else: the sidecar lists it silent on part of speech, period, register and sense type. v194: PanLex marks no names.
- **What the site acts on today**: Pointed headword where the expression is written pointed (30.69%). Ledger division (592 rows); 27 rows print no pill.
- **It has, and no row carries**: The variety of the Hebrew expression; the meaning id (which would say that two rows are one meaning). 26,514 rows (69.3%) carry none of the four marks.
- **Counts and notes**: 38,255 rows on 12,212 keys (M21, expressions, 28,424; M42, definitions, 9,831). Two more PanLex tables («Hebrew-script-language») were struck by language admission.

### ConceptNet 5.7

- **M ids**: M1 M22. Source keys: conceptnet_5_7_hebrew_english_cc_by_4_0, conceptnet_5_7_hebrew_english_cc_by_sa_4_0.
- **Shelf**: in the store. **Kind**: knowledge-base. A graph of concepts: by the corpus lane's account it has no entries, only edges between a Hebrew node and an English node.
- **What it says it is**: No self-description in any record read; the labels («ConceptNet 5.7 exact Hebrew-English lexical assertions») are this project's. The corpus lane's ledger: «The source has no entries: it holds edges between a Hebrew node and an English node».
- **Where the quote stands**: route-store/index.json m_sources.M1, M22; reader/data/ledgers-v1/conceptnet_5_7_hebrew_english_cc_by_sa_4_0/declaration.json (homonyms); its fields in source-declarations-v1.bin.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: The relation of each edge (/r/Synonym 40,590; /r/ExternalURL 28,382; /r/RelatedTo 19,279; /r/EtymologicallyRelatedTo 6,913; /r/SymbolOf 4,897; /r/DerivedFrom 1,921 of 106,658 edges touching Hebrew). The dataset an edge came from (/d/wiktionary/en 51,649; /d/dbpedia/en 37,725; /d/wiktionary/fr 5,571; /d/emoji 4,897; /d/wordnet/3.1 4,803). An optional part of speech on a node (n 20,464; v 5,257; a 2,824; r 815). v194: ConceptNet marks no names (its InstanceOf means «a kind of»).
- **What the site acts on today**: Nothing on any row: no pointed headword, no number, no stem, no name mark (13,978 rows, 100%). The license splits it in two tables.
- **Carried and unused**: The cut flag (1,142 rows of M1).
- **It has, and no row carries**: The relation: a row does not say whether its edge is a synonym, a related word or an etymology. The dataset behind the edge (much of it is Wiktionary and DBpedia again). The part of speech.
- **Counts and notes**: 13,978 rows on 9,986 keys (M1 10,023; M22 3,955). Every route is in small letters (the source lowercases).

### OmegaWiki

- **M ids**: M32. Source keys: omegawiki_structured_defined_meaning.
- **Shelf**: in the store. **Kind**: knowledge-base. A relational database of defined meanings (concepts), each with a definition and expressions in many languages; its rows are of two kinds, an English expression or the definition of the thing.
- **What it says it is**: Only its dump's own header (a MySQL dump, tables language, uw_defined_meaning and others). The label «OmegaWiki structured Hebrew-English DefinedMeaning relations and definitions» is this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.omegawiki_structured_defined_meaning.channels; reader/data/ledgers-v1/omegawiki_structured_defined_meaning/declaration.json.
- **The body of text it names**: Every language.
- **Kinds it marks in its own data**: A defined-meaning id and an expression id. Class membership. v194: its own part of speech «name» on 13 of the 387 rows the lane takes for names; it gives «noun» to countries (93 rows).
- **What the site acts on today**: Pointed headword where written pointed (13.02%). 21 rows print no pill.
- **It has, and no row carries**: Which of the two kinds a row is: 2,814 routes are a definition (field D), 2,546 an English word (field R), by the lane's ledger. The defined-meaning id. Its part of speech.
- **Counts and notes**: 5,363 rows on 2,605 keys. 4,665 rows (87.0%) carry none of the four marks.

### MUSE

- **M ids**: M6 M62 (no row: M16). Source keys: muse_hebrew_english_ground_truth_dictionary.
- **Shelf**: in the store. **Kind**: word-pair-list. Two columns, a Hebrew word and an English word, on each line: no entry, no sense, no part of speech.
- **What it says it is**: No self-description in any record read; the label «MUSE large-scale ground-truth Hebrew-English bilingual dictionary» is this project's. The corpus lane's ledger: «each line of its two files is two columns split by a tab, with no space in a column and so no entry id, sense number or part of speech beside the word».
- **Where the quote stands**: route-store/index.json m_sources.M6, M62; reader/data/ledgers-v1/muse_hebrew_english_ground_truth_dictionary/declaration.json (homonyms).
- **The body of text it names**: None.
- **Kinds it marks in its own data**: Nothing. The sidecar lists it silent on dialect, edition, part of speech, period, pointing, register, script and sense type. v194: MUSE marks no names.
- **What the site acts on today**: Nothing on any row (24,514 rows, 100%, carry none of the four marks; no headword is pointed).
- **Counts and notes**: 24,514 rows on 20,057 keys (M6 23,065; M62 1,449; M16 none). License cc_by_nc_4_0.

### Hebrew Wikipedia's titles

- **M ids**: M15. Source keys: wikimedia_hebrew_english_interlanguage_title_20260701.
- **Shelf**: in the store. **Kind**: encyclopedia-titles. The title of the English Wikipedia article a Hebrew article links to: the name of a subject, not a rendering of a word.
- **What it says it is**: Only its dump's own tables (hewiki-20260701 page and langlinks; ll_lang «en» 410,531 rows). The label «Hebrew Wikipedia 20260701 direct English interlanguage title» is this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.wikimedia_hebrew_english_interlanguage_title_20260701.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: A page's namespace and whether it is a redirect (271,514). The corpus lane's ledger: 924 of the 933 titles with the word «disambiguation» are disambiguation pages. v194: the titles mark no names.
- **What the site acts on today**: Nothing on any row (12,354 rows, 100%). 946 rows carry a print slot (2 of them print no pill).
- **It has, and no row carries**: The kind of the English page (a disambiguation page, a person, a place): the dump read does not carry it for every row.
- **Counts and notes**: 12,354 rows on 12,354 keys: one row to a key.

### Wikidata's Hebrew lexemes

- **M ids**: M2 M10 M28 M48 M53 M61 M73 M76 M81 M87 M94 M138 (no row: M194). Source keys: wikidata_hebrew_explicit_form_english_sense, wikidata_hebrew_lexeme_gloss.
- **Shelf**: in the store. **Kind**: knowledge-base. Lexemes (an entry with a lexical category, forms and senses) kept inside a knowledge base; most of the English is the label and description of an item a sense points to.
- **What it says it is**: No self-description in any record read; the labels («Wikidata Hebrew lexeme explicit English sense gloss», «Wikidata Hebrew source-explicit form linked to exact English lexeme sense») are this project's.
- **Where the quote stands**: route-store/index.json m_sources; reader/data/ledgers-v1/wikidata_hebrew_lexeme_gloss/declaration.json; its fields in source-declarations-v1.bin.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: A lexeme id and a sense id. A lexical category (Q1084 noun, Q24905 verb, Q34698 adjective, Q147276 proper noun: 204, 203 and 253 bindings in its three files). A variety on the lemma and the form (he; he-x-q21283070). The item a sense names (224 of the 315 senses behind the gloss table name one, and its English label and description is the text).
- **What the site acts on today**: The name mark, from Q147276 (78 rows). Pointed headword (38.69%). Ledger division (1,912 rows); 25 rows print no pill.
- **It has, and no row carries**: The lexical category but proper noun. The variety tags. The lexeme and sense ids. 7,169 rows (61.0%) carry none of the four marks.
- **Counts and notes**: 11,743 rows on 10,744 keys: the forms table 11,419 rows (5 tables), the gloss table 324 (7 tables); M194 holds no row.

### Hebrew WordNet

- **M ids**: M43 M57. Source keys: omw_hebrew_oewn2025_permanent_sense_key_bridge, omw_hebrew_pwn30.
- **Shelf**: in the store. **Kind**: knowledge-base. Hebrew lemmas attached to the concepts (synsets) of the English WordNet; the row's text is the English definition of the concept, with its example.
- **What it says it is**: «Hebrew Wordnet» (omw-hebrew-wordnet.tab, header line 1). «WordNet Release 3.0» (pwn30-LICENSE, line 1). «Open English Wordnet» (english-wordnet-2025.xml.gz, the Lexicon's label).
- **Where the quote stands**: source-declarations-v1.bin, stems.omw_hebrew_pwn30.channels and stems.omw_hebrew_oewn2025_permanent_sense_key_bridge.channels (work_identity_statement).
- **The body of text it names**: None: the concepts are English WordNet's.
- **Kinds it marks in its own data**: The synset's part of speech (n 9,381; a 2,019; v 1,631; r 450 of 13,481 rows). A lexicographer file, 45 domains. Whether a row is a lemma or a definition (heb:lemma 6,872; heb:def 6,609). v194: an instance mark makes 34 rows names.
- **What the site acts on today**: Pointed headword (99.98%). Ledger division (332 rows).
- **Carried and unused**: The definition text (2,135 rows).
- **It has, and no row carries**: The part of speech. The instance mark. The lexicographer file.
- **Counts and notes**: 4,487 rows on 3,283 keys (M43 4,174; M57 313).

### Lexibank (NorthEuraLex's Hebrew list)

- **M ids**: M64. Source keys: lexibank_analysed_v2_2_northeuralex_hebrew.
- **Shelf**: in the store. **Kind**: word-pair-list. A comparative word list: a Hebrew form beside the name of a concept in capitals.
- **What it says it is**: «Lexibank Analysed v2.2» (the Zenodo record of the release). The label is this project's.
- **Where the quote stands**: source-declarations-v1.bin, stems.lexibank_analysed_v2_2_northeuralex_hebrew.channels (work_identity_statement).
- **The body of text it names**: Every language (its collections and languages tables).
- **Kinds it marks in its own data**: The concept's name («BELLY», «HIDE (CONCEAL)»), the form, a transcription. The sidecar lists it silent on part of speech, period, register and sense type. v194: marks no names.
- **What the site acts on today**: Nothing on any row (974 rows, 100%). 167 rows print a part of themselves.
- **Counts and notes**: 974 rows on 877 keys.

### English Wikipedia's opening sentences

- **M ids**:  (no row: M47 M56 M66 M70 M120 M136 M143 M147 M153 M156 M158 M159 M166 M175 M176 M178 M181 M193). Source keys: wikimedia_english_intro_definition_20260715, wikimedia_english_intro_definition_successor_unmatched_v1.
- **Shelf**: in the store's index, no row. **Kind**: other. The opening sentence of an encyclopedia article: none is served.
- **What it says it is**: Nothing: the sidecar lists it silent. The labels («English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink») are this project's.
- **Where the quote stands**: route-store/index.json m_sources (18 M ids, ledger none); source-declarations-v1.bin, stems.wikimedia_english_intro_definition_20260715.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: Not read.
- **What the site acts on today**: Nothing: no shard holds a row of these M ids.
- **Counts and notes**: 18 M ids stand in the index with no row. Why is not in any record I read.

### Jastrow's dictionary (the overlay beside the store)

- **M ids**: M12 M39 M49 M65 M75 M106.
- **Shelf**: beside the store (overlay). **Kind**: rabbinic-dictionary. A dictionary with entries of the Hebrew and Aramaic of rabbinic literature, by the language field of its own record («heb.talmudic»).
- **What it says it is**: Its title is not quoted in any record I read (the corpus lane's copy «carries no front matter»). What is quoted: the title page's imprint, «LONDON,W.C.: LUZAC … NEW YORK: G.P. PUTNAM'S SONS … 1903»; and Sefaria's own lexicon record, «"language":"heb.talmudic"» and «"version_title":"London, Luzac, 1903"». The labels («Marcus Jastrow Dictionary via Sefaria structured MongoDB dump» and five more) are this project's.
- **Where the quote stands**: reader/data/overlays/jastrow/index.json, m_sources.M12 (sourceYear_pins, languageDeclared); the same index gives declared_corpus «RABBINIC» (the corpus lane's word) and the page's shelf name is «rabbinic Hebrew and Aramaic» (zone.html, OVERLAY_DEFS).
- **The body of text it names**: Rabbinic literature (the Talmud, by its record's own language field; the lane's word is RABBINIC).
- **Kinds it marks in its own data**: An entry id; a language code on each entry (ch. marks an Aramaic one); numbered senses; a stem heading over blocks of senses (Pi., Hif., Af.); the English wordings in italics; notes Jastrow sets beside a sense; a pointed headword.
- **What the site acts on today**: Pointed headword (94.55% of rows). Stems (8.53% of rows named, by the stems extension with both branches set). Ledger division (55,814 rows divide). The word senses switch, off at rest (2,974 rows held back). Its shelf and chips on the sources row. Language admission struck it from the store, its label naming no language; it came back as an overlay on the owner's ruling «well i've reflected and i think we can include jastrow and even ben yehuda new hebrew, but i need it to be heavily controlled under toggle».
- **It has, and no row carries**: Whether an entry is Hebrew or Aramaic, as a mark on the row. Sense numbers. It has no Strong's numbers, so the entry gate cannot act; the names gate does not read it. 433 rows whose English is only a stem's name (v194).
- **Counts and notes**: 115,918 rows on 25,210 keys; by the overlay's own count, against the store of its day, 12,724 of them are keys the store had no row for. M12 81,516; M39 21,684; M49 8,673; M75 1,823; M65 1,608; M106 614.

### The Samaritan overlay (five works)

- **M ids**: MSAM1 MSAM2 MSAM3 MSAM4 MSAM5.
- **Shelf**: beside the store (overlay). **Kind**: other. Five glossaries and lexica of Samaritan Hebrew and Aramaic, admitted where an entry prints or declares its word in square letters; two of them define in Latin or stand in a grammar.
- **What it says it is**: Title pages as the overlay quotes them: Cowley, «OXFORD AT THE CLARENDON PRESS 1909» (The Samaritan Liturgy vol. II, GLOSSARY OF THE ARAMAIC TEXTS); Uhlemann, «Lipsiae Sumtibus et Typis Caroli Tauchnitii. 1837.» (Institutiones Linguae Samaritanae, Lexicon Samaritanum, Latin definitions); Florentin and Tal, «©2024 Moshe Florentin and Abraham Tal» (The Samaritan Pentateuch, 7.0 Index of Differences in Meaning); Nicholls, the preface signed «LONDON: 1858,» (A Grammar of the Samaritan Language, Lexicon); English Wiktionary, Category:Samaritan Hebrew lemmas. The long labels are the corpus lane's, made from each title.
- **Where the quote stands**: reader/data/overlays/samaritan/index.json, m_sources (label, year_from, licence_own_words).
- **The body of text it names**: The Samaritan Pentateuch and liturgy: Samaritan Hebrew and Aramaic.
- **Kinds it marks in its own data**: Each row carries its lane's own slot (path «a printed» or «b declared», the page and entry it stands on). No part of speech, number or stem is carried.
- **What the site acts on today**: The shelf «Samaritan Hebrew and Aramaic» and its chips. Uhlemann rests off by the owner's ruling of 3 October 2026 («Latin definitions, not English»). Ledger division for four of the five (Uhlemann has no ledger).
- **Counts and notes**: 2,875 rows on 2,239 keys: Uhlemann 1,850; Cowley 967; Florentin and Tal 40; Wiktionary 11; Nicholls 7. By its own count, against the store of its day, 441 keys were not in the store.

### The dictionary store

- **M ids**: the store's M ids but M97 and M184, with M197 and M199.
- **Shelf**: beside the store (records). **Kind**: other. Not a dictionary: the corpus lane's packaging of every provider's own record, with the exact readings of TAHOT and MACULA at each place.
- **What it says it is**: Its own rule: «dictionary-store-serve-v1-the-lanes-shards-byte-for-byte-a-card-reads-one-key», and «SHARE THE RECORD, NEVER SHARE THE CLAIM». This project's words.
- **Where the quote stands**: reader/data/dictionary-store/index.json.
- **The body of text it names**: None of its own.
- **Kinds it marks in its own data**: For 16 source keys the record's field D is the provider's own record: Kaikki's JSON entry, the UBS JSON entry, Strong's and BDB's XML, the unabridged BDB's HTML, Hebrew Wiktionary's wikitext, UHAL's markdown, HiperBiblia's text, WordNet's gloss, the translation tables' sense gloss. For the others (TAHOT, MACULA, Wikidata, PanLex, MUSE, Wikipedia's titles, ConceptNet, Classical Hebrew Words, TBESH, Lexibank, BiblicalTools) it holds the headword and the reading only.
- **What the site acts on today**: The «concordance hud» pill, off at rest: a word's card opens to the table of its exact readings and the places each stands.
- **Carried and unused**: Every mark in field D: this is where a part of speech, a period label, a binyan or a lexical domain stands on the live site, and no gate reads it.
- **Counts and notes**: 345,833 record slots under 86,128 keys; 321,237 distinct records of 36 source keys; 238,712 readings (TAHOT 97,363, MACULA 141,349) at 1,379,813 places. It holds no record of Davidson (M97) or Kethoneth Yoseph (M184).

### The span store and the piece store

- **M ids**: M197 M199; PIECE:TAHOT PIECE:MACULA.
- **Shelf**: beside the store (per book). **Kind**: other. Two packagings, not dictionaries: entries whose headword is two or more words, and each word's pieces as TAHOT and MACULA divide it.
- **What it says it is**: Their own rules, this project's words: the span store, «one row per dictionary entry whose headword is two or more words as one thing»; the piece store, «a word's pieces as TAHOT and MACULA divide it, each piece a record».
- **Where the quote stands**: reader/data/span-store/index.json; reader/data/piece-store/index.json; zone.html, OVERLAY_DEFS.
- **The body of text it names**: The Hebrew Bible.
- **Kinds it marks in its own data**: The span store carries a pointer mark (form_of) on 162 rows.
- **What the site acts on today**: Shelves «spans» and «pieces» on the sources row; the place's own reading on a card.
- **Counts and notes**: The span store serves 1,698 records. Two of its sources are not in the route store: STEP's TAHOT Expanded Strong frame (M197, 185 records) and the ETCBC BHSA lexeme gloss (M199, 149 records, license cc_by_nc_4_0_noncommercial), the two works language admission struck from the store as M51 and M8. The piece store serves 934,262 claims.

### STRUCK: Brown-Driver-Briggs as Bolls gives it

- **M ids**: M20.
- **Shelf**: struck whole (the license strike). **Kind**: bible-dictionary. The abridged BDB of Online Bible.
- **What it says it is**: Each record's own heading «BDB Definition» (8,674 records). The label «Bolls byte-pinned reformatted Brown-Driver-Briggs Hebrew definition frame» is this project's.
- **Where the quote stands**: reader/data/source-strikes-v1.json; source-declarations-v1.bin, stems.bolls_bdbt_brown_driver_briggs_hebrew_1906.
- **The body of text it names**: The Hebrew Bible.
- **Kinds it marks in its own data**: Part of speech after «Part(s) of speech:» (Noun Masculine 2,317; Verb 1,604; Proper Name Masculine 1,441; Proper Name Location 657).
- **What the site acts on today**: Struck whole on 17 October 2026: «the owner's 8 October 2026 ruling: text that needs a provider's permission is out, permanently».
- **Counts and notes**: 22,007 routes struck on 5,527 keys.

### STRUCK: Jastrow's tables in the store

- **M ids**: M12 M39 M49 M52 M65 M75 M106 M108.
- **Shelf**: struck whole (language admission). **Kind**: rabbinic-dictionary. The same work as the overlay above.
- **What it says it is**: See the overlay.
- **Where the quote stands**: reader/data/language-admission-v1.json, struck_sources.
- **The body of text it names**: Rabbinic literature.
- **Kinds it marks in its own data**: See the overlay.
- **What the site acts on today**: Struck: «NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION» («the record names no language, in its label or its provenance»): a judgment on this project's label, not on the dictionary. It stands now as the overlay.
- **Counts and notes**: 60,926 ranks struck (M12 40,258; M39 14,057; M49 4,388; M75 1,234; M65 617; M106 372; M52 and M108 none).

### STRUCK: Davidson's earlier tables

- **M ids**: M26 M31 M67 M77 M83 M84 M89 M91 M101 M107 M109 M114 M115 M119 M124 M141 M172.
- **Shelf**: struck whole (language admission). **Kind**: bible-dictionary. The same book as M97 above.
- **What it says it is**: See Davidson above. The labels («Davidson 1855 full-book queue source-image-reviewed exact definitions …») are this project's.
- **Where the quote stands**: reader/data/language-admission-v1.json, struck_sources.
- **The body of text it names**: The Old Testament Scriptures.
- **Kinds it marks in its own data**: See Davidson.
- **What the site acts on today**: Struck: «NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION»: the label named no language. M97, whose label says «Hebrew and Chaldee», was kept.
- **Counts and notes**: 12,492 ranks struck; 85 rows of the book stand now (M97).

### STRUCK: the ETCBC BHSA lexeme gloss

- **M ids**: M8.
- **Shelf**: struck whole (language admission). **Kind**: bible-dictionary. A gloss per lexeme of the ETCBC's database of the Hebrew Bible.
- **What it says it is**: No quote read. The label «ETCBC Biblia Hebraica Stuttgartensia Amstelodamensis context-free lexeme gloss» is this project's.
- **Where the quote stands**: reader/data/language-admission-v1.json.
- **The body of text it names**: The Hebrew Bible.
- **Kinds it marks in its own data**: Not read.
- **What the site acts on today**: Struck: «NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION». 149 of its records stand in the span store as M199.
- **Counts and notes**: 4,246 ranks struck.

### STRUCK: PanLex's «Hebrew-script-language» tables

- **M ids**: M24 M82.
- **Shelf**: struck whole (language admission). **Kind**: word-pair-list. PanLex expressions in Hebrew script of languages other than Hebrew.
- **What it says it is**: The labels are this project's («PanLex 2024 exact same-meaning Hebrew-script-language English lexical expression»).
- **Where the quote stands**: reader/data/language-admission-v1.json.
- **The body of text it names**: Every language.
- **Kinds it marks in its own data**: As PanLex.
- **What the site acts on today**: Struck: «DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE».
- **Counts and notes**: 13,221 ranks struck (M24 11,132; M82 2,089).

### STRUCK: English Wiktionary's Yiddish and Arabic entries (Kaikki)

- **M ids**: M40 M63 M104 M168 M131.
- **Shelf**: struck whole (language admission). **Kind**: general-dictionary-with-entries. English Wiktionary's entries of two other languages written in Hebrew letters.
- **What it says it is**: The labels are this project's («Kaikki machine-readable Yiddish dictionary from English Wiktionary», «Kaikki Arabic dictionary literal Hebrew-script source headwords from English Wiktionary»).
- **Where the quote stands**: reader/data/language-admission-v1.json.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: As English Wiktionary.
- **What the site acts on today**: Struck: «NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC» (Yiddish; Arabic).
- **Counts and notes**: 3,767 ranks struck (Yiddish 3,722; Arabic 45).

### STRUCK: English Wiktionary's translation tables of other languages in Hebrew script (Kaikki)

- **M ids**: M78 M99 M103.
- **Shelf**: struck whole (language admission). **Kind**: word-pair-list. Translations into languages other than Hebrew that are written in Hebrew letters.
- **What it says it is**: The label is this project's («Kaikki English Wiktionary source-explicit non-Hebrew-language Hebrew-script translation tables»).
- **Where the quote stands**: reader/data/language-admission-v1.json.
- **The body of text it names**: None.
- **Kinds it marks in its own data**: As the translation tables.
- **What the site acts on today**: Struck: «DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE».
- **Counts and notes**: 925 ranks struck.

### STRUCK: STEP's TAHOT Expanded Strong frame

- **M ids**: M51.
- **Shelf**: struck whole (language admission). **Kind**: bible-dictionary. Read from TAHOT's own last column, «Expanded Strong tags» (a served record: «Maher-shalal-hash-baz»Maher-shalal-hash-baz@Isa.8.1-»).
- **What it says it is**: The label is this project's («STEP Bible TAHOT source-explicit Expanded Strong lexical definition frame»).
- **Where the quote stands**: reader/data/language-admission-v1.json.
- **The body of text it names**: The Hebrew Bible.
- **Kinds it marks in its own data**: Not read.
- **What the site acts on today**: Struck: «NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION». 185 of its records stand in the span store as M197.
- **Counts and notes**: 1,431 ranks struck.

### STRUCK: Harkavy's dictionary (1925)

- **M ids**: M88 M100 M113 M117 M118 M121 M122 M125 M126 M127 M140 M146.
- **Shelf**: struck whole (language admission). **Kind**: general-dictionary-with-entries. A Yiddish-English-Hebrew dictionary, by the name of the folder the lane keeps it in.
- **What it says it is**: No quote read. The labels are this project's («Harkavy 1925 source-image-reviewed exact Hebrew-English dictionary equivalents»).
- **Where the quote stands**: reader/data/language-admission-v1.json (evidence: «Yiddish in …/harkavy-yiddish-english-hebrew-1925-2026-07-15/…manifest…»).
- **The body of text it names**: None read.
- **Kinds it marks in its own data**: Not read.
- **What the site acts on today**: Struck: «PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC» (the manifest's path names Yiddish).
- **Counts and notes**: 376 ranks struck.

## One line per M id: the store

| M | family | source key | label (this project's) | license | year | body (source-corpus) | rows | keys | pointed | number | stem | name | no mark |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M1 | ConceptNet 5.7 | conceptnet_5_7_hebrew_english_cc_by_sa_4_0 | ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY-SA 4.0 edge) | cc_by_sa_4_0 | 2019 | UNDECLARED | 10,023 | 8,269 | 0.0% | 0.0% | 0.0% | 0 | 10,023 |
| M2 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 53 | 47 | 67.9% | 0.0% | 0.0% | 29 | 8 |
| M3 | MACULA Hebrew | macula_hebrew_cherith_surface_english_2022 | MACULA exact Hebrew morph surfaces with Cherith English definitions | cc_by_4_0 | 2022 | BIBLICAL | 43,294 | 15,871 | 99.8% | 100.0% | 54.9% | 0 | 0 |
| M4 | STEP's TAHOT (Translators Amalgamated Hebrew OT) | stepbible_tahot_aligned_translation | STEP Bible Translators Amalgamated Hebrew OT aligned component translation | cc_by_4_0 | S_NO_SOURCE_YEAR | BIBLICAL | 95,033 | 46,601 | 100.0% | 100.0% | 41.2% | 0 | 0 |
| M5 | Brown-Driver-Briggs (1906), the Open Scriptures edition | openscriptures_bdb_1906 | Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures | cc_by_4_0_underlying_public_domain | S_NO_SOURCE_YEAR | BIBLICAL | 15,238 | 4,367 | 94.0% | 94.3% | 25.0% | 0 | 796 |
| M6 | MUSE | muse_hebrew_english_ground_truth_dictionary | MUSE large-scale ground-truth Hebrew-English bilingual dictionary | cc_by_nc_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 23,065 | 18,723 | 0.0% | 0.0% | 0.0% | 0 | 23,065 |
| M7 | The unfoldingWord Hebrew-Aramaic Lexicon (UHAL) | unfoldingword_uhal | unfoldingWord Hebrew-Aramaic Lexicon | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | BIBLICAL | 293 | 77 | 100.0% | 100.0% | 0.0% | 0 | 0 |
| M9 | Strong's Hebrew dictionary (1890) | openscriptures_strongs | Strong's Hebrew Dictionary via Open Scriptures | cc_by_4_0_underlying_public_domain | S_NO_SOURCE_YEAR | BIBLICAL | 23,646 | 5,939 | 100.0% | 100.0% | 0.0% | 0 | 0 |
| M10 | Wikidata's Hebrew lexemes | wikidata_hebrew_explicit_form_english_sense | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 5,294 | 5,184 | 0.4% | 0.0% | 0.0% | 2 | 5,269 |
| M11 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 25,287 | 14,197 | 57.8% | 0.0% | 0.0% | 0 | 10,675 |
| M13 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki machine-readable Hebrew dictionary from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 16,225 | 9,335 | 0.0% | 0.0% | 0.0% | 1,481 | 14,743 |
| M14 | Strong's Hebrew dictionary (1890) | wikisource_strongs_explicit_forms | Strong's Hebrew concordance with explicit source form lists via Hebrew Wikisource | cc_by_sa_4_0_underlying_public_domain | S_NO_SOURCE_YEAR | BIBLICAL | 148,343 | 17,003 | 11.4% | 100.0% | 0.0% | 0 | 0 |
| M15 | Hebrew Wikipedia's titles | wikimedia_hebrew_english_interlanguage_title_20260701 | Hebrew Wikipedia 20260701 direct English interlanguage title | cc_by_sa_4_0_and_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 12,354 | 12,354 | 0.0% | 0.0% | 0.0% | 0 | 12,354 |
| M16 | MUSE | muse_hebrew_english_ground_truth_dictionary | MUSE Hebrew-English ground-truth dictionary - CC BY-NC noncommercial partition | cc_by_nc_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M17 | The SDBH (Semantic Dictionary of Biblical Hebrew) as HiperBiblia gives it | hiperbiblia_sdbh | Semantic Dictionary of Biblical Hebrew via HiperBiblia | cc_by_sa_4_0 | 2023 | BIBLICAL | 14,821 | 3,659 | 61.4% | 100.0% | 21.0% | 449 | 0 |
| M18 | The UBS Dictionary of Biblical Hebrew (v0.9.2) | ubs_sdbh_hebrew_v0_9_2 | UBS Dictionary of Biblical Hebrew v0.9.2 exact definitions and glosses | cc_by_sa_4_0 | 2023 | BIBLICAL | 21,626 | 6,539 | 64.0% | 100.0% | 27.8% | 4,335 | 0 |
| M19 | STEP's TBESH (Translators Brief lexicon of Extended Strongs for Hebrew) | stepbible_tbesh_gloss | STEP Bible Translators Brief Lexicon Hebrew scholar-created Gloss column | cc_by_4_0 | S_NO_SOURCE_YEAR | BIBLICAL | 2,645 | 1,814 | 99.9% | 100.0% | 0.0% | 0 | 0 |
| M21 | PanLex | panlex_hebrew_english_meanings_20240301 | PanLex 2024 exact same-meaning Hebrew-English lexical expression | cc_by_nc_sa_4_0_conservative_current | 2024 | UNDECLARED | 28,424 | 9,859 | 33.3% | 0.0% | 0.0% | 0 | 18,952 |
| M22 | ConceptNet 5.7 | conceptnet_5_7_hebrew_english_cc_by_4_0 | ConceptNet 5.7 exact Hebrew-English lexical assertions (CC BY 4.0 edge) | cc_by_4_0 | 2019 | UNDECLARED | 3,955 | 3,203 | 0.0% | 0.0% | 0.0% | 0 | 3,955 |
| M23 | Classical Hebrew Words | classical_hebrew_words | Classical Hebrew Words database | public_domain | 2026 | BIBLICAL | 7,321 | 4,089 | 71.0% | 0.0% | 0.0% | 868 | 2,121 |
| M25 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki machine-readable Hebrew dictionary strict source-explicit linked forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 72,066 | 36,719 | 100.0% | 0.0% | 0.0% | 106 | 0 |
| M27 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 657 | 446 | 0.0% | 0.0% | 0.0% | 0 | 657 |
| M28 | Wikidata's Hebrew lexemes | wikidata_hebrew_explicit_form_english_sense | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 3,021 | 2,714 | 66.8% | 0.0% | 0.0% | 13 | 1,000 |
| M29 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 2,273 | 1,330 | 0.0% | 0.0% | 0.0% | 0 | 2,273 |
| M30 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki Hebrew strict source-explicit inflection-table forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M32 | OmegaWiki | omegawiki_structured_defined_meaning | OmegaWiki structured Hebrew-English DefinedMeaning relations and definitions | cc_by_chosen_from_dual_cc_by_and_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 5,363 | 2,605 | 13.0% | 0.0% | 0.0% | 0 | 4,665 |
| M33 | The Open Scriptures Hebrew Lexical Index | openscriptures_lexical_index | Open Scriptures Hebrew Lexical Index | cc_by_4_0 | S_NO_SOURCE_YEAR | BIBLICAL | 138 | 134 | 98.6% | 99.3% | 0.0% | 0 | 0 |
| M34 | English Wiktionary: Hebrew given as a translation under English entries (Kaikki's table, DBnary) | kaikki_english_wiktionary_hebrew_translation_table | Kaikki English Wiktionary source-explicit Hebrew translation tables | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 850 | 800 | 52.9% | 0.0% | 0.0% | 0 | 400 |
| M35 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki Hebrew strict source-explicit linked forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M36 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 2,553 | 1,474 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M37 | English Wiktionary: Hebrew given as a translation under English entries (Kaikki's table, DBnary) | dbnary_english_wiktionary_hebrew_translation_gloss | DBnary English Wiktionary source-explicit Hebrew translations and English glosses | cc_by_sa_3_0 | S_NO_SOURCE_YEAR | UNDECLARED | 6,156 | 5,166 | 40.1% | 0.0% | 0.0% | 0 | 3,689 |
| M38 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1,939 | 1,023 | 0.0% | 0.0% | 0.0% | 0 | 1,939 |
| M41 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 3,617 | 1,721 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M42 | PanLex | panlex_hebrew_english_definitions_20250201 | PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew meaning | cc_by_nc_sa_4_0_conservative_current | 2025 | UNDECLARED | 9,831 | 6,705 | 23.1% | 0.0% | 0.0% | 0 | 7,562 |
| M43 | Hebrew WordNet | omw_hebrew_pwn30 | Hebrew WordNet exact Princeton WordNet 3.0 synset alignment and English gloss | dual_open_wordnet_style_licenses_attribution_notice_required | 2007 | UNDECLARED | 4,174 | 3,194 | 100.0% | 0.0% | 0.0% | 0 | 1 |
| M44 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 223 | 147 | 0.4% | 0.0% | 0.0% | 0 | 222 |
| M45 | The BiblicalTools Living Lexicon | biblicaltools_living_lexicon | BiblicalTools Living Lexicon exact Strong glosses and STEPBible Hebrew-Aramaic lemmas | public_domain_strongs_definitions_plus_cc_by_4_0_stepbible_lemma_data | S_NO_SOURCE_YEAR | BIBLICAL | 753 | 713 | 99.9% | 100.0% | 0.0% | 0 | 0 |
| M46 | Brown-Driver-Briggs (1906), the unabridged edition | unabridged_bdb_1906 | Unabridged Brown-Driver-Briggs Hebrew Lexicon structured source | public_domain_document_reformatted_source | S_NO_SOURCE_YEAR | BIBLICAL | 8,915 | 3,682 | 98.8% | 99.4% | 13.0% | 0 | 20 |
| M47 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M48 | Wikidata's Hebrew lexemes | wikidata_hebrew_explicit_form_english_sense | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 1,541 | 1,327 | 75.5% | 0.0% | 0.0% | 3 | 377 |
| M50 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki machine-readable Hebrew dictionary strict source-explicit linked forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 6,278 | 3,921 | 100.0% | 0.0% | 0.0% | 1 | 0 |
| M53 | Wikidata's Hebrew lexemes | wikidata_hebrew_explicit_form_english_sense | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 1,543 | 1,400 | 69.1% | 0.0% | 0.0% | 12 | 475 |
| M54 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1,122 | 661 | 0.0% | 0.0% | 0.0% | 0 | 1,122 |
| M55 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 827 | 543 | 0.0% | 0.0% | 0.0% | 0 | 827 |
| M56 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M57 | Hebrew WordNet | omw_hebrew_oewn2025_permanent_sense_key_bridge | Hebrew WordNet PWN 3.0 alignment bridged to Open English WordNet 2025 by complete permanent-sense-key agreement | omw_wordnet_notice_plus_princeton_wordnet_notice_plus_cc_by_4_0 | 2025 | UNDECLARED | 313 | 298 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M58 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 735 | 455 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M59 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1,779 | 1,009 | 0.0% | 0.0% | 0.0% | 0 | 1,779 |
| M60 | English Wiktionary: its Aramaic entries (as Kaikki gives them) | kaikki_wiktionary_aramaic | Kaikki machine-readable Aramaic dictionary from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | ARAMAIC | 2,222 | 1,385 | 0.3% | 0.0% | 0.0% | 92 | 2,123 |
| M61 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 114 | 114 | 75.4% | 0.0% | 0.0% | 0 | 28 |
| M62 | MUSE | muse_hebrew_english_ground_truth_dictionary | MUSE large-scale ground-truth Hebrew-English bilingual dictionary | cc_by_nc_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1,449 | 1,334 | 0.0% | 0.0% | 0.0% | 0 | 1,449 |
| M64 | Lexibank (NorthEuraLex's Hebrew list) | lexibank_analysed_v2_2_northeuralex_hebrew | Lexibank Analysed v2.2 NorthEuraLex literal Hebrew source values with Concepticon English glosses | cc_by_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 974 | 877 | 0.0% | 0.0% | 0.0% | 0 | 974 |
| M66 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M68 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 130 | 87 | 0.0% | 0.0% | 0.0% | 0 | 130 |
| M69 | English Wiktionary: its Hebrew entries (as Kaikki gives them) | kaikki_wiktionary_hebrew | Kaikki machine-readable Hebrew dictionary strict source-explicit inflection-table forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | UNDECLARED | 3,721 | 2,366 | 51.5% | 0.0% | 0.0% | 2 | 1,801 |
| M70 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M71 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 209 | 130 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M72 | English Wiktionary: its Aramaic entries (as Kaikki gives them) | kaikki_wiktionary_aramaic | Kaikki machine-readable Aramaic dictionary strict source-explicit linked forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | ARAMAIC | 499 | 326 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M73 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 19 | 19 | 36.8% | 0.0% | 0.0% | 11 | 1 |
| M74 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 2,679 | 1,387 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M76 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 46 | 46 | 82.6% | 0.0% | 0.0% | 6 | 5 |
| M79 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 269 | 210 | 0.0% | 0.0% | 0.0% | 0 | 269 |
| M80 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 974 | 645 | 0.0% | 0.0% | 0.0% | 0 | 974 |
| M81 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 7 | 7 | 85.7% | 0.0% | 0.0% | 1 | 1 |
| M85 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 571 | 354 | 0.0% | 0.0% | 0.0% | 0 | 571 |
| M86 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 158 | 105 | 0.0% | 0.0% | 0.0% | 0 | 158 |
| M87 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 73 | 70 | 98.6% | 0.0% | 0.0% | 0 | 1 |
| M90 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 259 | 187 | 0.0% | 0.0% | 0.0% | 0 | 259 |
| M92 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 642 | 399 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M93 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 106 | 82 | 0.0% | 0.0% | 0.0% | 0 | 106 |
| M94 | Wikidata's Hebrew lexemes | wikidata_hebrew_lexeme_gloss | Wikidata Hebrew lexeme explicit English sense gloss | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 12 | 12 | 75.0% | 0.0% | 0.0% | 1 | 2 |
| M95 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 452 | 293 | 0.0% | 0.0% | 0.0% | 0 | 452 |
| M96 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1,059 | 607 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M97 | Davidson's Analytical Hebrew and Chaldee Lexicon | davidson_1855_manual_source_image_reviewed_v1 | Davidson 1855 Analytical Hebrew and Chaldee Lexicon manually source-image-reviewed exact English definitions v1 | public_domain | S_NO_SOURCE_YEAR | BIBLICAL | 85 | 44 | 0.0% | 0.0% | 0.0% | 0 | 85 |
| M98 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 267 | 137 | 99.6% | 0.0% | 0.0% | 0 | 1 |
| M102 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 428 | 271 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M105 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 161 | 105 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M110 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 24 | 13 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M111 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 122 | 54 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M112 | English Wiktionary: its Aramaic entries (as Kaikki gives them) | kaikki_wiktionary_aramaic | Kaikki machine-readable Aramaic dictionary strict source-explicit linked forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M116 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 575 | 338 | 0.0% | 0.0% | 0.0% | 0 | 575 |
| M120 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M123 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 148 | 91 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M128 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 110 | 75 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M129 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 75 | 55 | 0.0% | 0.0% | 0.0% | 0 | 75 |
| M130 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 20 | 16 | 0.0% | 0.0% | 0.0% | 0 | 20 |
| M132 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 13 | 10 | 84.6% | 0.0% | 0.0% | 0 | 2 |
| M133 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 49 | 24 | 91.8% | 0.0% | 0.0% | 0 | 4 |
| M134 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M135 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 107 | 76 | 2.8% | 0.0% | 0.0% | 0 | 104 |
| M136 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M137 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 22 | 15 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M138 | Wikidata's Hebrew lexemes | wikidata_hebrew_explicit_form_english_sense | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | cc0_public_domain | S_NO_SOURCE_YEAR | UNDECLARED | 20 | 20 | 90.0% | 0.0% | 0.0% | 0 | 2 |
| M139 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 8 | 8 | 0.0% | 0.0% | 0.0% | 0 | 8 |
| M142 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 11 | 10 | 0.0% | 0.0% | 0.0% | 0 | 11 |
| M143 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M144 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 5 | 3 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M145 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 4 | 1 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M147 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M148 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 13 | 9 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M149 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 36 | 26 | 0.0% | 0.0% | 0.0% | 0 | 36 |
| M150 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 21 | 16 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M151 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 25 | 23 | 0.0% | 0.0% | 0.0% | 0 | 25 |
| M152 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 48 | 38 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M153 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M154 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 15 | 6 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M155 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 20 | 16 | 0.0% | 0.0% | 0.0% | 0 | 20 |
| M156 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M157 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 9 | 7 | 0.0% | 0.0% | 0.0% | 0 | 9 |
| M158 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M159 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M160 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 11 | 7 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M161 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 8 | 4 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M162 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 39 | 37 | 0.0% | 0.0% | 0.0% | 0 | 39 |
| M163 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 10 | 4 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M164 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 7 | 6 | 0.0% | 0.0% | 0.0% | 0 | 7 |
| M165 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 13 | 8 | 0.0% | 0.0% | 0.0% | 0 | 13 |
| M166 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M167 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 3 | 2 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M169 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 4 | 4 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M170 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 2 | 1 | 0.0% | 0.0% | 0.0% | 0 | 2 |
| M171 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 5 | 5 | 0.0% | 0.0% | 0.0% | 0 | 5 |
| M173 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 5 | 3 | 0.0% | 0.0% | 0.0% | 0 | 5 |
| M174 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 11 | 7 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M175 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M176 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M177 | English Wiktionary: its Aramaic entries (as Kaikki gives them) | kaikki_wiktionary_aramaic | Kaikki machine-readable Aramaic dictionary strict source-explicit linked forms from English Wiktionary | cc_by_sa_gfdl | S_NO_SOURCE_YEAR | ARAMAIC | 14 | 9 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M178 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_successor_unmatched_v1 | English Wikipedia continuation-complete revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M179 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 4 | 2 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M180 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1 | 1 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M181 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M182 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1 | 1 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M183 | Hebrew Wiktionary | hewiktionary_hebrew_exact_english_translation | Hebrew Wiktionary source-explicit English translations at exact Hebrew page titles | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 6 | 3 | 0.0% | 0.0% | 0.0% | 0 | 6 |
| M184 | Kethoneth Yoseph (1887) | kethoneth_yoseph_1887_source_image_reviewed | Kethoneth Yoseph 1887 source-image-reviewed exact Hebrew abbreviation definitions | public_domain | 1887 | not in the record | 107 | 82 | 0.0% | 0.0% | 0.0% | 0 | 107 |
| M185 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1 | 1 | 0.0% | 0.0% | 0.0% | 0 | 1 |
| M186 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M187 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 3 | 3 | 0.0% | 0.0% | 0.0% | 0 | 3 |
| M188 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 2 | 1 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M189 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 2 | 1 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M190 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_recovery_english_translation | Hebrew Wiktionary source-explicit inflections recovered after fail-closed note and markup removal | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M191 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_heading_alternate_english_translation | Hebrew Wiktionary source-explicit heading alternates joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1 | 1 | 100.0% | 0.0% | 0.0% | 0 | 0 |
| M192 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1 | 1 | 0.0% | 0.0% | 0.0% | 0 | 1 |
| M193 | English Wikipedia's opening sentences | wikimedia_english_intro_definition_20260715 | English Wikipedia revision-pinned intro sentence through exact Hebrew page direct langlink | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M194 | Wikidata's Hebrew lexemes | wikidata_hebrew_explicit_form_english_sense | Wikidata Hebrew source-explicit form linked to exact English lexeme sense | cc0_public_domain | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |
| M195 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_full_spelling_english_translation | Hebrew Wiktionary source-explicit full spellings joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | UNDECLARED | 1 | 1 | 0.0% | 0.0% | 0.0% | 0 | 1 |
| M196 | Hebrew Wiktionary | hewiktionary_hebrew_explicit_inflection_english_translation | Hebrew Wiktionary source-explicit pointed inflection forms joined to same-entry English translations | cc_by_sa_4_0 | S_NO_SOURCE_YEAR | not in the record | 0 | 0 | | | | | |

## One line per M id: beside the store

| M | where | label | rows | keys | pointed | stem |
|---|---|---|---|---|---|---|
| M12 | overlays/jastrow | Marcus Jastrow Dictionary via Sefaria structured MongoDB dump | 81,516 | 16,302 | 95.8% | 10.1% |
| M49 | overlays/jastrow | Marcus Jastrow Dictionary source-explicit grammar forms via Sefaria structured MongoDB dump | 8,673 | 3,051 | 83.3% | 16.9% |
| M106 | overlays/jastrow | Marcus Jastrow Dictionary source-explicit grammar forms via Sefaria structured MongoDB dump | 614 | 260 | 100.0% | 0.0% |
| M39 | overlays/jastrow | Marcus Jastrow Dictionary explicit listed forms via Sefaria structured MongoDB dump | 21,684 | 6,507 | 96.8% | 1.0% |
| M65 | overlays/jastrow | Marcus Jastrow Dictionary exact punctuation-bearing forms via Sefaria structured MongoDB dump | 1,608 | 323 | 54.7% | 0.0% |
| M75 | overlays/jastrow | Marcus Jastrow Dictionary explicit listed forms via Sefaria structured MongoDB dump | 1,823 | 689 | 99.0% | 0.0% |
| MSAM2 | overlays/samaritan | Uhlemann, Institutiones Linguae Samaritanae (Leipzig 1837), Lexicon Samaritanum: square Hebrew or Chaldee words the entry itself ties to a Samaritan-script headword, Latin definitions | 1,850 | 1,544 | 0.0% | 0.0% |
| MSAM1 | overlays/samaritan | Cowley, The Samaritan Liturgy vol. II (Oxford 1909), GLOSSARY OF THE ARAMAIC TEXTS: square headwords as printed, English definitions | 967 | 880 | 0.0% | 0.0% |
| MSAM3 | overlays/samaritan | Florentin and Tal, The Samaritan Pentateuch (Open Book Publishers ©2024), 7.0 Index of Differences in Meaning: the MT word with the Samaritan meaning and reading beside it | 40 | 40 | 100.0% | 0.0% |
| MSAM5 | overlays/samaritan | English Wiktionary, Category:Samaritan Hebrew lemmas: square forms the page ties to a Samaritan-script lemma (alt/inh templates), English definitions, pinned revisions | 11 | 11 | 90.9% | 0.0% |
| MSAM4 | overlays/samaritan | Nicholls, A Grammar of the Samaritan Language (London; preface signed 1858), Lexicon: square Hebrew or Chaldee words the entry ties to a Samaritan-script headword, English definitions | 7 | 7 | 71.4% | 0.0% |
| M197 | span store, dictionary store | STEP Bible TAHOT source-explicit Expanded Strong lexical definition frame | 185 records | | | |
| M199 | span store, dictionary store | ETCBC Biblia Hebraica Stuttgartensia Amstelodamensis context-free lexeme gloss | 149 records | | | |

## One line per M id: struck whole

| M | struck by | label | reason, in the record's word | ranks struck | keys |
|---|---|---|---|---|---|
| M20 | the license strike (source-strikes-v1.json) | Bolls byte-pinned reformatted Brown-Driver-Briggs Hebrew definition frame | LICENCE_ASKS_PERMISSION | 22,007 | 5,527 |
| M8 | language admission | ETCBC Biblia Hebraica Stuttgartensia Amstelodamensis context-free lexeme gloss | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 4,246 | 3,713 |
| M12 | language admission | Marcus Jastrow Dictionary via Sefaria structured MongoDB dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 40,258 | 16,229 |
| M24 | language admission | PanLex 2024 exact same-meaning Hebrew-script-language English lexical expression | DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE (Hebrew-script-language) | 11,132 | 3,778 |
| M26 | language admission | Davidson 1855 current-gap-targeted source-image-reviewed exact definitions with separate OCR-key rejections v17 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 6,751 | 2,262 |
| M31 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v6 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 78 | 27 |
| M39 | language admission | Marcus Jastrow Dictionary explicit listed forms via Sefaria structured MongoDB dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 14,057 | 6,267 |
| M40 | language admission | Kaikki machine-readable Yiddish dictionary from English Wiktionary | NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 3,149 | 2,273 |
| M49 | language admission | Marcus Jastrow Dictionary source-explicit grammar forms via Sefaria structured MongoDB dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 4,388 | 2,566 |
| M51 | language admission | STEP Bible TAHOT source-explicit Expanded Strong lexical definition frame | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 1,431 | 779 |
| M52 | language admission | Marcus Jastrow Dictionary explicit listed forms via Sefaria structured dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 0 | 0 |
| M63 | language admission | Kaikki Yiddish strict source-explicit inflection-table lexical forms from English Wiktionary | NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 0 | 0 |
| M65 | language admission | Marcus Jastrow Dictionary exact punctuation-bearing forms via Sefaria structured MongoDB dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 617 | 246 |
| M67 | language admission | Davidson 1855 current-gap-targeted source-image-reviewed exact definitions with separate OCR-key rejections v16 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 856 | 346 |
| M75 | language admission | Marcus Jastrow Dictionary explicit listed forms via Sefaria structured MongoDB dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 1,234 | 689 |
| M77 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v15 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 314 | 270 |
| M78 | language admission | Kaikki English Wiktionary source-explicit non-Hebrew-language Hebrew-script translation tables | DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE (non-Hebrew-language) | 787 | 714 |
| M82 | language admission | PanLex 2025 explicit English definition joined to continuity-confirmed Hebrew-script-language meaning | DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE (Hebrew-script-language) | 2,089 | 1,541 |
| M83 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v9 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 564 | 249 |
| M84 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v13 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 580 | 241 |
| M88 | language admission | Harkavy 1925 source-image-reviewed exact Hebrew-English dictionary equivalents | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 57 | 42 |
| M89 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v12 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 633 | 274 |
| M91 | language admission | Davidson 1855 current-gap-targeted source-image-reviewed exact definitions with separate OCR-key rejections v18 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 898 | 411 |
| M99 | language admission | Kaikki English Wiktionary source-explicit non-Hebrew-language Hebrew-script translation tables | DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE (non-Hebrew-language) | 0 | 0 |
| M100 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 51-100 v4 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 29 | 23 |
| M101 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v11 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 534 | 246 |
| M103 | language admission | Kaikki English Wiktionary source-explicit non-Hebrew-language Hebrew-script translation tables | DECLARES_ITSELF_NON_HEBREW_WITHOUT_NAMING_A_LANGUAGE (non-Hebrew-language) | 138 | 132 |
| M104 | language admission | Kaikki machine-readable Yiddish dictionary strict source-explicit inflection-table lexical forms from English Wiktionary | NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 530 | 343 |
| M106 | language admission | Marcus Jastrow Dictionary source-explicit grammar forms via Sefaria structured MongoDB dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 372 | 260 |
| M107 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v10 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 404 | 203 |
| M108 | language admission | Marcus Jastrow Dictionary source-explicit grammar forms via Sefaria structured dump | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 0 | 0 |
| M109 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v7 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 112 | 57 |
| M113 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 151-200 v6 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 32 | 22 |
| M114 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v14 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 430 | 182 |
| M115 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v8 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 232 | 137 |
| M117 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 301-350 v9 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 40 | 33 |
| M118 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 251-300 v8 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 43 | 31 |
| M119 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v3 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 15 | 6 |
| M121 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 401-450 v11 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 28 | 21 |
| M122 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 451-497 v12 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 18 | 14 |
| M124 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v4 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 20 | 11 |
| M125 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 101-150 v5 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 21 | 18 |
| M126 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 201-250 v7 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 44 | 32 |
| M127 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 351-400 v10 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 39 | 32 |
| M131 | language admission | Kaikki Arabic dictionary literal Hebrew-script source headwords from English Wiktionary | NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Arabic) | 45 | 40 |
| M140 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents ranks 6-50 v3 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 21 | 18 |
| M141 | language admission | Davidson 1855 full-book queue source-image-reviewed exact definitions with separate OCR-key rejections v5 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 49 | 22 |
| M146 | language admission | Harkavy 1925 full-book line-first source-image-reviewed exact Hebrew-English equivalents v2 | PROVENANCE_NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 4 | 1 |
| M168 | language admission | Kaikki machine-readable Yiddish dictionary strict source-explicit inflection-table lexical forms from English Wiktionary | NAMES_A_LANGUAGE_OUTSIDE_HEBREW_AND_ARAMAIC (Yiddish) | 43 | 32 |
| M172 | language admission | Davidson 1855 full-book candidate queue manually source-image-reviewed exact English definitions v2 | NAMES_NO_LANGUAGE__SILENCE_IS_NOT_A_DECLARATION | 22 | 10 |

## What could not be established

- The providers' own files (Kaikki's jsonl, TAHOT, the UBS JSON, the Wikisource pages) are not on this machine. What is said of them is read from the dictionary store's records (the served part of each), the declarations sidecar and the corpus lane's letters.
- Jastrow's own title: no record I read quotes it. The year pin quotes the title page's imprint, and Sefaria's record gives the language «heb.talmudic».
- The titles of Strong's and BDB as Open Scriptures gives them, of TAHOT's own front matter, of MACULA, the UBS dictionary's title page, Classical Hebrew Words, ConceptNet, MUSE, Wikidata, OmegaWiki and BiblicalTools: the records hold file names, field descriptions and this project's labels. source-corpus-v1.json's evidence strings could not be traced to a quote.
- Why 27 M ids stand in the index with no row (the 18 English Wikipedia tables, and M16, M30, M35, M112, M134, M186, M190, M194, M196).
- Which ConceptNet relations and which PanLex varieties stand behind the served rows: the rows carry neither.
- Row counts for Hebrew Wiktionary's marks: a stratum label belongs to one definition and a translation to the whole entry, so the counts are of records and definition lines.
- My join of English Wiktionary's rows to their senses reaches 18,151 of 123,577 Hebrew rows (the rows keyed under an inflected form are not reached) and 2,221 of 2,735 Aramaic rows: its counts are lower bounds.
- Whether the overlays rest on or off for a reader today. In the tree read (857a3dc0fb) the page's code turns off at rest only the sources `source-defaults-v1.json` names (Uhlemann) and holds back Jastrow's word-sense rows; the Jastrow overlay's own index says default off and the letter v194 says «off at rest»; I did not open the page, and a ship of default toggles is in progress.
- The corpus lane's figures in v194 (names v2 at about 15,838 rows; 90,182 rows of sources that mark no names) are the lane's, not recounted.
- Distinct keys of the struck families (the table gives each M id's own).
