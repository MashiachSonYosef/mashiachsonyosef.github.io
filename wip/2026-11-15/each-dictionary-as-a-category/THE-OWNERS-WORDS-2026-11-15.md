# Each dictionary as a category: the owner's words of 15 November 2026

## The words

1. «explain to me the justification for removing Peru and any time we wrote our own rule to remove?»
2. After the page lane answered about the Peru pills at Genesis 1:22:
   «ok but wouldnt the wiser thing be to doubt all wiktionary "name" categories?
   my point here is if we edit card by card we lose out on fixing other stuff, and its impractical
   we need to think in terms of each dictionary as a category
   you keep doing this thing where i say peru and you hear peru or the other bot says genesis 1 and you hear genesis 1. but sometimes people give examples like peru and genesis 1 and it leans into a bigger thing to fix globally»

## What the page lane takes from them

- **An example names a class.** When the owner or the outside reader names a card, a word or a chapter, the answer is about the class it stands for, and the fix is looked for at the level where it mends every case: a dictionary, or a kind of entry within a dictionary. A card is never edited.
- **The unit of decision is the dictionary.** Each dictionary is a category: what it says it is, and what kinds of entry it marks in its own data. The owner rules per dictionary and per kind, and the rule runs over the whole shelf.
- **Row-by-row lists are the wrong shape.** A list that names rows one at a time (the corpus lane's call 6, 448 rows; call 2, 2 rows; the lists of 6 November) mends those rows and nothing like them. Each is to be read again: restated as a rule over a dictionary's own category where one exists, or held.

## What the record already says (the live build, main 857a3dc0fb)

- The Peru pill that left the card on 13 November left by a category rule, not a card edit: the names gate (`reader/data/names/names-v1/RULE.md`, the owner's ruling of 13 November) withholds every row that one of six dictionaries marks a name in its own data (7,412 rows) wherever TAHOT and MACULA do not call the word a name. Wiktionary's «Peru (a country in South America)» carries Wiktionary's own `pos: name`. The rule file says of every other dictionary: «not read for a name ... their names stand», and that it «was not checked for each of them». So OmegaWiki's «Peru» and «Republic of Peru», PanLex's «Tarica» and «country in South America» and ConceptNet's «peru» stand.
- The shelf already sorts every dictionary by the body of text it says it describes (`reader/data/source-corpus-v1.json`, stamped 6 September, rule source-corpus-rule-v1): of 119 dictionaries the store cites, 15 BIBLICAL (403,965 rows as stamped, about 60%), 101 UNDECLARED («general-purpose word list; declares no corpus», 269,691 rows, about 40%), 3 ARAMAIC (2,700 rows). The record is read today only by the era sorter (an order) and by the refusal of languages outside Hebrew and Aramaic. Nothing on a card is set apart by it.
- The 101, by family (rows as stamped): English Wiktionary through Kaikki and DBnary 130,564; PanLex 38,270; Hebrew Wiktionary 25,905; MUSE 24,514; ConceptNet 15,495; Hebrew Wikipedia's titles 12,355; Wikidata 11,764; OmegaWiki 5,363; Hebrew WordNet 4,487; Lexibank 974.
- Jastrow stands beside the store as an overlay (the rabbinic dictionary, by its own title).

## The outside reader's fourteen cards, by kind of dictionary

The fourteen Genesis 1 verb cards the outside reader graded on 12 November, as the live build serves them (264 pills; `../the-accuracy-question/dumps/`), each pill put under one kind by the best-placed dictionary that carries it (`tools/partition.mjs`):

| kind of dictionary | pills | called right | called not right | not graded |
|---|---|---|---|---|
| Bible dictionaries (or the place's own reading) | 193 | 105 | 63 | 25 |
| Wiktionary (English, Hebrew) | 31 | 23 | 8 | 0 |
| word lists and knowledge bases (PanLex, ConceptNet, OmegaWiki, MUSE, Wikipedia's titles, Wikidata) | 24 | 3 | 21 | 0 |
| Jastrow (rabbinic) | 13 | 0 | 13 | 0 |
| Aramaic Wiktionary | 3 | 1 | 2 | 0 |

By family, among the pills no Bible dictionary carries (a pill two families carry counts under both; `tools/by-dictionary.mjs`): English Wiktionary 24 right and 9 not; PanLex 2 and 15; Jastrow 0 and 13; ConceptNet 0 and 6; OmegaWiki 0 and 4; Hebrew Wiktionary 0 and 1; MUSE 1 and 0; Wikipedia's titles 0 and 1; Wikidata 0 and 1.

The 21: «daughter», «kid», «boy», «Peru», «pro», «Republic of Peru», «Tarica», «country in South America», «A country in South America, with capital Lima.», «Seed», «race», «sperm», «sough», «spermatozoa», «wheatberry» and others. Jastrow's 13: «forest», «prairie», «wild», «peel», «outside», «street», «semen» and others.

Fourteen cards of one chapter are a direction, not a measure. And by the owner's rule of 14 November no reader's grade decides what a card shows: these figures are for the owner's ruling on dictionaries, nothing more.

## What the page lane put to the owner

Decide per kind of dictionary, never per card: the Bible dictionaries stand as now, gated by their own marks; Wiktionary stands, its own kinds applied wholesale; the word lists and knowledge bases take one shelf of their own on the card, shut at rest, one switch to open, nothing deleted; Jastrow takes its own rabbinic shelf (the owner's shelving idea, task 39). The heading over each shelf is the dictionary's own description of itself, so the card still makes no claim. Asked: is that the shape, and is the word lists' shelf shut or open at rest.

**Not awaited.** The owner's next words (`../HOW-THE-OWNER-WANTS-TO-WORK-2026-11-15.md`, word 3): nothing agreed is held, a question buried in a write-up is a quiz, the site is where things are tested. So the shape is built as put: each dictionary filed by what it says it is, the word lists and knowledge bases shut at rest behind one switch, Jastrow under its own heading, nothing deleted. It ships after the ledgers; the owner meets it on a card.

## Next

The full table of the 119: what each says it is (quoted), what kinds of entry it marks in its own data (names, parts of speech, labels, senses, pointing, entry numbers, stems), its rows, and what a rule over each kind would move on the whole shelf.

## The first ship of it: the word lists and knowledge bases rest shut (the lead's design calls, 08:05 UTC)

Built without waiting, on the owner's word that nothing agreed is held.

- One record files every dictionary by what it says it is: `reader/data/dictionary-kinds-v1.json` (family, kind, the dictionary's own words for itself and where they stand). Kinds: Bible dictionaries (and the place's own reading); general Hebrew dictionaries with entries (Wiktionary and the like); the rabbinic dictionary (Jastrow); Aramaic dictionaries; word-pair lists, knowledge bases and encyclopedia titles.
- First ship: the last kind rests shut on every card. Nothing leaves the store. The card says how many readings are shut in the dictionaries' own terms, one press on the card or one switch on the rail opens them, the device keeps the choice, reset returns to shut. The line at rest never reads a shut dictionary. A reading a shut dictionary shares with an open one stands, credited to the open one.
- Later ship: headings on the card by kind; an Aramaic dictionary set apart at a Hebrew place.
- Three teams: the table of the 119 and the whole-shelf measures (workflow dictionary-categories), the design from a reading of the page and the pipeline with the effect measured (workflow kinds-shut-at-rest-design; its notes in `kinds-shut-at-rest/`), then the builders.

## Wiktionary's own categories (the owner's question of 15 November: «are there any other categories on wiktionary besides name?»)

**Its part of speech, on the rows the store serves.** From the corpus lane's own receipt of the names rule (`reader/data/names/names-v1/receipt-v1.json`, `rows.marks_met`, read from kaikki.org-dictionary-Hebrew.jsonl, 55,916,128 bytes, sha256 f1c363c3...): verb 83,604; noun 69,247; adj 5,359; prep 2,159; name 2,157; adv 607; particle 234; intj 134; pron 127; num 107; conj 91; character 59; det 39; prefix 27; phrase 24; prep_phrase 9; article 5; suffix 3; contraction 1; symbol 1. (Each is a count of a row meeting an entry of that part of speech.)

**What else Wiktionary keeps, and the store does not carry:** labels on a sense (Biblical Hebrew, Mishnaic, Medieval, Modern Israeli Hebrew; slang, colloquial, military, computing), topics (countries, cities, chemical elements), and where a word came from (borrowed, coined). Measured on the live store (`tools/kaikki-labels.mjs`): of 123,577 rows of English Wiktionary's Hebrew entries (7 tables), 183 open with a parenthesis, and those are content («(of celestial bodies) to be in conjunction»), not labels. The corpus lane carried the plain definition and the part of speech. The class shows through the text all the same: «The Hague (a city, the capital of South Holland, ...)», «a surname: Netanyahu», «abbreviation of ...» (132 rows), «... the fourth letter of the Hebrew alphabet» (25 rows). The host that publishes the file is not reachable from the page lane's machine, and the file is not in the store the page lane can read: the counts of these labels are the corpus lane's to make.

**The lead's calls from it.**
1. English Wiktionary's name category rests off a Bible card everywhere, not only where the word is not a name (the owner: «wouldnt the wiser thing be to doubt all wiktionary "name" categories?»). It rides the first ship of the kinds (the same mechanism). The Bible dictionaries' own name entries keep the gate as it is: they stand where the text's word is a name.
2. «character» (the letters as entries, 59) and «prefix» (27: «in», «the», and the modern «Pro-») go on a review list, met on a card, not taken out: the prefixes are mixed, and the letters may matter to the owner.
3. Asked of the corpus lane: each dictionary's own categories carried on each row. For Wiktionary: every part of speech (not the name alone), the sense's labels, its topics, and the entry's etymology templates (borrowed, derived, coined). That record is also the intake for the next hundred dictionaries.
4. The corpus lane's call 6 restated: its class is mostly the name class («a male given name», «surname»), and that class goes; its test of the English text is the wrong road (it misses «Peru» and «Netanyahu» and takes «verb» off the Hebrew word for verb). The dictionary's own name category takes the class whole.

## The whole shelf by kind of dictionary (measured, 15 November, about 09:00 UTC)

From the table team (workflow dictionary-categories; `TABLE-what-each-dictionary-is.md`, `MEASURES-what-each-kind-supplies.md`, the checkers' `VERIFY-*.md`). Every resting card of the 39 books was rebuilt in node from the page's own code and matched the 14 cards read from the live site exactly (264 of 264 pills, the same carriers) and all 14,354 chain-book cards.

- At rest the 39 books carry 16,348,776 pills on 305,149 cards. No Bible dictionary and no place reading stands behind 4,739,329 of them (29.0%): Wiktionary 1.63M; Jastrow 1.06M (98.6% of its only-it pills on Hebrew verses); word lists, knowledge bases and encyclopedia titles 1.96M (PanLex alone 1.21M); Aramaic Wiktionary 48K (97% on Hebrew verses); the Samaritan overlay 40K (nearly all Cowley).
- The line at rest is 99.0% the place's own reading. Non-Bible sources lead 1,702 lines, nearly all joined runs: English Wiktionary 1,127 («Lord of Hosts», the numbers, «Monday»), Wikidata 523 («the Jewish people», «Homo sapiens»). Shutting the word lists and knowledge bases moves 559 lines (Wikidata's 523 among them) to the place's own reading or the next dictionary.
- Shutting the word lists and knowledge bases leaves 596 cards with only the place's reading (590 through Wikidata) and 62 cards with nothing open but the shut shelf.
- Named classes on Bible words (pill places; regex tests, sizes as corrected by the checker): grammatical notes («a form of ...») 169K, mostly English Wiktionary; given names and surnames 35K (PanLex 19.8K, English Wiktionary 12.3K); alphabet letters 28K; concept labels in capitals 24K (Lexibank, PanLex); encyclopedia titles 17K; modern prefixes and abbreviations about 16K; later Jewish senses 9.7K; species 7.3K; numbers and weekdays 6.5K; modern places, far fewer than the 53K upper bound.
- The Peru shape (a row withheld on its own source's name mark while the same words stand from a dictionary that marks nothing): 15,416 pill places.
- The table's kinds, corrected by its checker: the Lexical Index is an index, not a dictionary; Kethoneth Yoseph an abbreviation list; BiblicalTools a Strong's derivative; Classical Hebrew Words a dictionary of Classical Hebrew (Bible, Ben Sira, the Scrolls, inscriptions); 148,343 of Strong's 171,989 rows are Wikisource's concordance list (King James renderings under each inflected form), so a ruling on «Strong's» falls mostly on that list.
- Name marks that dictionaries carry and the names gate does not read: Strong's (n-pr-*, x-pn), both BDBs (n.pr.m and kin), the Lexical Index, UHAL, Hebrew Wiktionary, TBESH, BiblicalTools, DBnary, Davidson, WordNet, OmegaWiki (13 rows).
