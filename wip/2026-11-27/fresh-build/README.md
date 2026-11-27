# The fresh build

Page lane, 27 November 2026. The owner: «if you did a new one now with everything you know and can process it would take you like 5 mins flat and without all the weird artifact errors»; «you do it however you want». The frame is `../THE-LAYERS.md`; the build's one rule is in `FRAME.md`: a reading stands at a word only where a source puts it there by its own address, or by a bridge a source declares. Nothing is matched by bare letters, and nothing comes from what the site serves today.

## Where it stands

| Part | What | Made by | State |
|---|---|---|---|
| The entries and the bridges | Eight dictionaries read from their own files into their own entries, structure kept whole, every string held byte for byte; STEP's tag to each dictionary's entry (exact, ambiguous or absent, never guessed); verse to the senses that cite it | builder E, `E/hand-back.md`, tools in `E/tools/` | made; the lead ran the one command (19 seconds) and the check (passes) |
| The places | Every one of our 305,431 words met with STEP's row and MACULA's words by rule (the same letters; spelled otherwise; one for two; written and read; verses numbered otherwise), each source's columns held whole | builder P, `P/hand-back.md`, tools in `P/tools/` | made; the lead ran the one command (71 seconds with its check; passes) |
| The new card as words | Seven passages printed whole | builder P's printer | `THE-NEW-CARD-AS-WORDS.txt`, sent to the owner |
| A page built on it | A small second reader, `reader/place.html`: a chapter with STEP's English under each word, a card that shows what each source says at this word and then each dictionary's own entry | builder V, `BRIEF-V.md`, `V/hand-back.md` (first cut), `V/hand-back-cut-2.md` (second cut) | made, in a sandbox; not linked, not shipped. The lead ran the one command on a folder fetched from nothing (184 seconds, «everything holds») and looked at the pictures |
| The one command | `reader/tools/make-place-answers-v1.sh <sources folder>` makes the places, the entries and bridges, the page files and the joined pin, and runs every check; `fetch-place-answers-sources-v1.sh` fetches 17 of the 20 source files at their pinned revision and sha256 and says plainly which three it cannot (unfoldingWord's record file, the Wikisource record file, one Wikisource page) | builder V | made |

The data itself (78 MB with the page files: places 28, page 32, entries 15, bridges 2.4) is in the sandbox `S/s14/reader/data/place-answers-v1/` and is made again from the public source files by the one command.

## What the fresh build settles that the passes found (each read from the printout or the reports)

- 305,293 words read the same as today's line (20,837 of them but for signs the page hides); 138 differ, each listed with its cause (`P/differences-short.txt`): the 14 words bare today all take STEP's own row; the 8 words written and not read take STEP's own word («if» where today says «mother»); the four Psalms places read «among the + peoples».
- Homonyms: STEP's lexicon names the Open Scriptures letter for each lettered tag and the Lexical Index carries it beside BDB's id, so the bridge to BDB is exact at 11,407 of 11,412 tags («be fat» cannot stand on «he created»).
- Strong's and BDB are reached at every inflected word through the tag («go», Amos 7:12).
- The UBS dictionary cites a verse and a word for each sense, so «so» and «mosquito» part by the word; at 96.44% of words the reckoned word number is corroborated, and an uncorroborated sense is said as the verse's, never as the word's.
- Strong's bracketed item under «to be» is one item; his lost «+» is marked with the other edition as witness; BDB's grammar words are held as grammar words.

## What the files do not tell (held as ambiguous, never guessed)

- The unabridged BDB's numbers are loose: 2,926 tags on 185,307 words reach several records. All are held; the record that cites the verse is named where one does.
- UBS's Strong's codes sit on the whole entry, not on a base form: under a tag the entry's first gloss can be a homograph's («mattock» under the object marker's number); the answer at the place is the sense that cites the word.
- Two words of our text have no reading from either source (2 Samuel 7:22 word 5; Psalms 68:27 word 4): the editions have another word there.
- UHAL and the Wikisource edition could not be fetched whole from this machine (151 files; 6,178 of 8,674 entries). The second SDBH copy, BiblicalTools and Davidson are left out for now.

## The second cut of the page (27 November, later)

Seven things, each by rule with counts before and after (`V/hand-back-cut-2.md`):

1. **A record of another word is never shown at this word.** A record of the unabridged BDB is this word's where its own headword has the letters of STEP's lexicon headword for the number, the Lexical Index's, or MACULA's dictionary form on this very word. 4,718 lines withheld on 4,136 words. Of the 2,954 numbers that stand on several records, the test parts 1,418 to one record (75,425 words), leaves 1,479 at several (107,659) and 57 at none (2,223).
2. **The UBS dictionary under a number leads with the base form whose sense cites this very word** (259,169 of 306,929 word-rows have one; at 20,632 the leader is no longer the entry's first base form, so «mattock» no longer leads the object marker).
3. **Strong's one line is his meaning**, not the first of his alphabetical list («beacon» led «to be» at 3,561 words).
4. **A sign under a word is drawn as the live reader draws it** (a part that is only a sign is a gap; where every part is a sign they stand), by the live reader's own functions. The line is the live line character for character at 305,290 of 305,431 words; 141 differ, all listed with their cause.
5. **MACULA's row prints its plain English**, the sentence gloss smaller beside it only where it differs.
6. **The numbers that stand only in STEP's variants column** are bridged (75 tags; 72 numbers on 93 written forms gain their dictionaries).
7. **From nothing:** the fetch script and the one command, proven on a folder fetched fresh.

### The three words beyond the builder's list of 138 (the lead's reading)

- Judges 19:13 entry 2: the live line is MACULA's «come»; STEP's own parts are «come» and «!». Ours prints STEP's.
- 2 Samuel 5:8 entry 9 and Isaiah 10:15 entry 12, both the word «and + object marker» tied to the next word: the live page prints «<and> + <obj.>»; ours draws two gaps. The cause is in the live page (`reader/zone.html` near line 13678): across a tied run it hides a word whose whole line passes the one-sign test, and a word of two signs fails that test, so it stands while a word of one sign beside it becomes a gap. By the live rule's own comment («a part that is a sign alone keeps its place as a gap, unless every part is one») both are gaps. A fault of the live page at exactly two words; the fresh rule is kept.

### A third, small cut (asked of builder V, 27 November)

- STEP's lexicon writes square brackets in five headwords (H0518B, H3588B, H3588C, H3651B, H5921B), each one word of a combination with the other words in the brackets. The headword test reads the headword outside the brackets, so Ruth 3:12 word 5 shows its own record (2 of the 57 numbers, 287 words).
- The comparison tool holds the list of the 141 expected differences with their causes and fails on any other.

### What a reader still meets on the trial page

- The line under a word is one string read left to right («to <the> + her»); the live reader draws each part under its letters in a frame. The trial page has no frames, no menu, no export and no chain pages: it is a card on trial, not a finished reader.
- A sign-only word tied to the next stands as an empty box (Ruth 3:2); the live reader joins it to its neighbor under one outline.
- The UBS dictionary's gloss for the object marker is «-», and that is what leads there.
- 1,479 numbers still reach several records of the unabridged BDB with the same headword letters; the card says so and shows the one that cites the verse first.
