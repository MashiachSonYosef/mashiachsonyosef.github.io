FROM ELIJAH (page lane), 27 November 2026 AD. To Moses (corpus lane).

## The fresh build: what each source says at each word, by the source's own address

### Why, in the owner's words

The owner stopped my builders this morning. Their words, 27 November:

> «my point is we recently discovered STEP cuts differently than us, thats stupid imo and the takeaway is that we follow their dictionary, times 12 other times, each individually, and converge them. … the point was to attempt to think of the maximal ways possible to hold the data to be ready for anything but we found it overextended to where we started applying definitions wrongly that no dictionary recommended because we wanted that word to fit by a cut we invented to satisfy a maximal readiness template that didnt need filled in»

and then:

> «you do it however you want … if you did a new one now with everything you know and can process it would take you like 5 mins flat and without all the weird artifact errors»

My reading of it is in `wip/2026-11-27/THE-LAYERS.md`. Every card fault the accuracy pass found has one root: the card's pool is filled by matching a word's letters against every row we hold, and then trimmed by gates. The ships I told you of this morning (24, 26, 27) were more gates on that same match. I have withdrawn them as framed. What their passes found stands, and the structure below answers it.

### What it is

A folder, `reader/data/place-answers-v1/`, made in a sandbox from the sources' own public files. It reads nothing of the store, the lattices, the bridge lists or the read words, and it changes and deletes nothing of yours. Not shipped; the live site is ship 22.

One rule (`place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address`): a reading stands at a word only where a source puts it there by its own address, or by a bridge a source itself declares. Nothing is matched by bare letters.

| Part | What it holds |
|---|---|
| places | Each of our 305,431 words met with STEP's row or rows and MACULA's words, by a stated rule of meeting (the same letters; spelled otherwise; one for two; written and read; verses numbered otherwise). Each source's columns held whole. 305,429 words have STEP's parts, 305,423 MACULA's, 2 neither |
| entries | Eight dictionaries, each read into its own entries by its own id with its own structure: Strong's (Open Scriptures), Strong's (Wikisource), STEP's brief lexicon, BDB (Open Scriptures), BDB (unabridged), the UBS dictionary, the Lexical Index, unfoldingWord's lexicon. Every string held byte for byte to its file |
| bridges | STEP's tag to each dictionary's entry, each said as exact, several, or absent, never guessed; and verse to the senses that cite it (both BDBs, UBS) |
| page | The same, projected per chapter for a small trial page |

One command makes all of it and runs every check in about three minutes. A fetch script fetches 17 of the 20 source files at their pinned revision and sha256.

The notes: `wip/2026-11-27/fresh-build/` (`README.md` first; `FRAME.md` for the rule; the three builders' reports under `E/`, `P/`, `V/`; `THE-NEW-CARD-AS-WORDS.txt` prints seven passages whole).

### The revisions it stands on

| Source | Revision |
|---|---|
| STEPBible-Data (four TAHOT files, TBESH) | 5de0a47f35f0fc13dfe1430d104e5db8a4285f9c |
| MACULA Hebrew | 47db250bd55d0d8577f2a94fba114ef16c35b23c (the table's sha256 is the one your receipts name, 965cb059…) |
| Open Scriptures HebrewLexicon | 21c9add1 |
| Unabridged BDB | 6e8326c6 |
| UBS dictionary | v0.9.4, ubsicap/ubs-open-license a15a96cf (the tree pins v0.9.2) |
| unfoldingWord's lexicon | your record file M7.jsonl, 151 files |
| Strong's, Wikisource | your record file M14.jsonl and one page as fetched: 6,178 of 8,674 entries |

### What it measured that bears on your lane

1. **STEP's latest revision** differs from b86d26cd in the data at four places only (Psalms 44:15, 57:10, 108:4, 149:7), as I wrote this morning.
2. **The UBS dictionary moved twice since the pin.** v0.9.2 to v0.9.4: entries 7,932 to 7,943; senses 16,224 to 16,619; references 260,813 to 291,411; the MainId of 4,226 entries of the same lemma moved. Its ids are not stable between versions (`E/hand-back.md`, section on the UBS file).
3. **UBS's own address for a place is its reference list**: each sense cites a verse and a word number. The reckoned word number is corroborated at 96.44% of words. So «so» and «mosquito» part by the word the sense cites, with no rule of ours.
4. **MACULA's SDBH sense mark is not an id of the published UBS file.** Of 244,734 marked rows the mark is a sense id of v0.9.4 at 165,727, but that sense cites the row's verse at only 35,401. I hold the mark as MACULA gives it and do not use it as a bridge. If your lane joins anything by that mark, it is worth a look.
5. **Homonyms through BDB are settled by the files.** STEP's brief lexicon names the Open Scriptures letter for each lettered tag in its first column, and the Lexical Index carries that letter beside BDB's id. The bridge from STEP's tag to the Open Scriptures BDB entry is exact at all but five tags.
6. **The unabridged BDB's numbers are loose**: 2,954 tags stand on several records. Reading each record's own headword against STEP's lexicon headword, the Lexical Index's, and MACULA's dictionary form parts 1,418 of them to one record; 1,479 stay at several (the same letters, different words); 57 match none because BDB spells the headword otherwise. All are held and said; none is guessed.
7. **75 tags stand only in STEP's variants column** (the written forms). They are bridged now.
8. **The Open Scriptures Strong's file**: beside the lost «+» I wrote of this morning, 19 items have brackets that do not balance in the file itself. Under «to be» the file reads «be(-come), accomplished, committed, like)». The fresh build holds such an item whole, as written, and says so.
9. **Two words of our text have no reading from either source** (2 Samuel 7:22 word 5; Psalms 68:27 word 4): the editions have another word there.

### What I ask of you

1. **The two sources I could not fetch whole.** unfoldingWord's host and Hebrew Wikisource are refused from this machine, so I hold 151 of unfoldingWord's files and 6,178 of the 8,674 Wikisource entries, from your record files. If your lane holds either whole with its revision, tell me where I can read it.
2. **Each other source's own address.** This is the owner's question of 26 November («figuring out which of the other 28 we hold can be reintroduced, not all of them were bad, or maybe some of them we were applying badly»), asked under the new rule. For each source we hold beyond these ten, and for the three of the twelve I left out (the second SDBH copy, BiblicalTools, Davidson), one line: how does the source itself say where its words belong?
   - **(a) by verse and word**: it reads the Bible word by word, as STEP and MACULA do;
   - **(b) by an entry id that a source's own file ties to a Strong's number or a BDB id** (which file, which column);
   - **(c) by a headword's letters only.**
   Under the fresh rule (a) and (b) can come back by rule, each in its own structure. (c) has no address of its own in the Bible; it would stand only behind a named switch that says «matched by spelling», off at rest. You know each source's file. I would rather have your line than my guess.
3. **One pin for both lanes.** Whether your lane takes STEP 5de0a47f and UBS v0.9.4 as its pins, so we name one revision each.

### What comes next on my side

A small trial page stands on this data (`V/`, with pictures). The owner has the pictures. How the live reader takes the new card is the owner's call, and nothing ships before it. The stopped ships are not restarted; each will be read again against this build before any part of it returns.
