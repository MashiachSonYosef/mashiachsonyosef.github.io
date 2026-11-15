# Checking «what each dictionary is» (the declare part)

15 November 2026. A skeptic's check of TABLE-what-each-dictionary-is.md. Read only; nothing served was changed. Tree read: the live copy at scratchpad/old (main 857a3dc0fb). Scripts and outputs: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v69/verify-declare/ (mycensus.py, fam.py, ds1.py, ds2.py; mycensus.json, ds1.json, decl-compact.txt). The census and ds1 passes are from the earlier run that was stopped; I re-ran fam.py on them and checked their method before relying on them.

## Counts: all reproduced

My own pass over all 256 shards (mycensus.py) gives 652,954 rows under 124,901 keys, 119 M ids with rows, and 146 M ids in the index. The shard digest is 367de47c…, the same one the table names. For every one of the 27 families with rows, these figures match the table to the hundredth: rows, keys (the union across the family's M ids), pointed headword %, entry-number %, stem-named %, name-mark rows and no-mark rows. The totals are 7,412 name rows and 139,440 no-mark rows.
- No index M id is left out of a family, and none is counted twice. Every M id the table files as having no row really has none.
- The 49 struck M ids match language-admission-v1.json struck_sources exactly. The reasons there are 27 NAMES_NO_LANGUAGE, 12 PROVENANCE…, 5 DECLARES_ITSELF_NON_HEBREW… and 5 NAMES_A_LANGUAGE_OUTSIDE….
- The Jastrow overlay has 115,918 rows on 25,210 keys and the Samaritan overlay 2,875 on 2,239, with per-M splits as stated.
- The dictionary store has 86,128 keys and 345,833 record slots. Readings are TAHOT 97,363 and MACULA 141,349, at places 611,068 and 768,745, which sum to 1,379,813.

## Quotes: checked at the place named

These quotes were found byte for byte in route-store/source-declarations-v1.bin, which I gunzipped directly, not only through the earlier decode:
- Strong's: Wikisource «מילון הקונקורדנציה של סטרונג» ×9.
- The unabridged BDB: README line 1.
- The UBS dictionary: README «SDBH is an ongoing project…».
- Kethoneth Yoseph: the IA title.
- Davidson: the title page.
- Kaikki: the footer, cited on English-words-index.html.
- Hebrew WordNet: «Hebrew Wordnet».
- Lexibank: «Lexibank Analysed v2.2».
- PanLex: the README.
- TAHOT: field descriptions.
- TBESH: «based on BDB, then normalised».
- Bolls: «BDB Definition».

The Jastrow overlay index holds the Luzac imprint pin and «"version_title":"London, Luzac, 1903"». I confirm that no record quotes Jastrow's title; the phrase «carries no front matter» was not found in the overlay index.

source-corpus-v1.json:
- by_value is BIBLICAL 15, UNDECLARED 101, ARAMAIC 3.
- M184 is unclassified («the corpus lane's ledger does not carry this label»).
- M23's evidence is «aligned to the Hebrew Old Testament text», the same string given for M4, TAHOT. It is boilerplate, not a quote.

Classical Hebrew Words: the lane's declaration (dl-moses3 …/classical_hebrew_words/v1.2-r2) says the landing page names DCH and DCHR. This is the lane's paraphrase, as the table says.

## Marks in the dictionaries' own data: spot-checked

- Kaikki sense tags in the dictionary store, each record once: Biblical-Hebrew 323, Modern-Israeli-Hebrew 122, form-of 2,188, alt-of 1,398, misspelling 1,043, construction-pa'al 1,231, construction-pi'el 997. All match exactly.
- My Kaikki totals differ slightly from the table's: 13,298 records and 18,429 senses (the table has 13,262 and 18,364). My dedup is by the D string.
- Hebrew Wiktionary: I did not reproduce the exact figures. My count by distinct D string is 4,721 «{{רובד|» occurrences, 684 «המקרא» and 878 «עברית חדשה», with a grammar box on 8,906 distinct D strings. The table has 4,438, 643, 869 and 7,935 of 8,976 pages. The store holds 13,658 distinct D strings for these keys, so D is not one per page. The order of magnitude holds; the exact page counts are the reader's own dedup.
- Sidecar values confirmed:
  - Strong's: n-pr-m 1,457, x-pn 2,628, arc 653.
  - BDB: n.pr.m 1,366.
  - UBS: name 2,454.
  - The SDBH: name 2,217.
  - Kaikki Hebrew: name 1,612.
  - Kaikki English: name 198,366.
  - ConceptNet: /r/Synonym 40,590.
  - PanLex: heb-000 313,099.
  - The unabridged BDB: BIBLICAL HEBREW 9,263 and BIBLICAL ARAMAIC 759.
  - Wikidata: Q147276.
  - Classical Hebrew Words: Ben Sira and Dead Sea Scrolls.
  - UHAL: NeedsEdits.
- names-v1/RULE.md confirms the names gate reads exactly six sources: M23, Kaikki Hebrew and Aramaic, M17, M18 and the two Wikidata keys. TAHOT and MACULA decide the name places, not row marks.

## Corrections and challenges

1. **Kethoneth Yoseph's kind contradicts its own note.** It is filed as rabbinic-dictionary, but the note says «a list of abbreviations … not a dictionary of words». The rows bear the note out: בה״א «the college of Hillel says.», ש״ק «the holy Sabbath.». The kind should be other (an abbreviation list), with rabbinic literature as its body of text.
2. **BiblicalTools (M45) is very likely Strong's again.** The ledger declaration gives the origin of its definitions and glosses as «strongs_concordance_public_domain». The rows read «Emims», «Partsite», «Machlite», in Strong's/KJV style. Filed as its own bible-dictionary family, it hides that it is a derivative of Strong's. Group it under Strong's, or at least mark it as derived.
3. **The Lexical Index (M33) is filed bible-dictionary, though the table itself calls it an index.** Its rows are name glosses with a dangling cross-reference: «Kadesh. Compare», «Zebul. Compare», «Nephisesim (from the margin)». Kind: other (an index); the English is not its own definition.
4. **Classical Hebrew Words is filed «other», though it has entries.** It has a homonym numeral, a part of speech, a semantic field and attestation per corpus, so by the brief's own test it is a dictionary with entries. «Other» understates it. Its corpus is Classical Hebrew (Bible, Ben Sira, Scrolls, inscriptions).
5. **The struck kinds are guesses.**
   - M8 (the ETCBC BHSA lexeme gloss) and M51 (TAHOT's Expanded Strong frame) are filed bible-dictionary, but neither is a dictionary: one is a gloss field of a text database, the other a column of TAHOT.
   - Harkavy is filed general-dictionary-with-entries with «nothing read».
6. **The dictionary store's «16 source keys» with the provider's record in D is an undercount.** ds1 finds D on 21 source keys. The extra ones are OmegaWiki (2,970 slots), the Lexical Index (339) and stepbible_tahot_expanded_strong (185, which is M197); the rest follow from counting the five Hebrew Wiktionary keys, two WordNet keys and the two Strong's keys separately. OmegaWiki is not «headword and reading only».
7. **Two different measures of distinct records.** The table counts 303,274 provider records by their bytes; I count 321,237 distinct rids. Both are valid; the reader should not take them as the same measure.
8. **M14's kind needs a note.** The bulk of Strong's rows (148,343 of 171,989) are KJV renderings filed under each inflected form, with Strong's definition as the definition field. That is a concordance list beside a dictionary, which is what its own Wikisource title says (מילון הקונקורדנציה).

## «Has it, never carried»: shown versus guessed

Shown on disk, in the providers' own records in the dictionary store or in the sidecar's counts of the provider's file:
- Strong's part of speech and x-pn.
- Both BDBs' part of speech, with the unabridged BDB's HEBREW/ARAMAIC label.
- UBS lexical domains.
- English Wiktionary's binyan, period, form-of and alt-of tags.
- Hebrew Wiktionary's stratum, part of speech and binyan.
- Classical Hebrew Words' attestation and flags.
- ConceptNet's relation and dataset.
- OmegaWiki's D-versus-R split.
- UHAL's Noun Proper.
- WordNet's synset part of speech.
- The Wikidata category.
- PanLex's variety.

The lane's word only (v194, read at dl-v195/v2/letters/…/FOR-ELIJAH-v194.md, not recounted):
- BiblicalTools «marks names».
- Davidson «marks names».
- WordNet's 34 instance rows.
- OmegaWiki's 13 «name» rows.
- TBESH's key «LG/PG=Gentilic, T=Title» and its 49 rows. This key is not in the sidecar.
- DBnary's and Kaikki's tables marking names. The sidecar's name count, 198,366, is for the whole English file, not for the Hebrew translations served.
- Names v2 at about 15,838 rows.

Guess: Davidson «whatever the page marks»; Harkavy and the struck ETCBC and M51 «kinds it marks».
