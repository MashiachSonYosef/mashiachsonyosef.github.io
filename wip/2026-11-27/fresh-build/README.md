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

### A third, small cut (builder V, 27 November; done, `V/hand-back-cut-3.md`)

- STEP's lexicon writes square brackets in five headwords (H0518B, H3588B, H3588C, H3651B, H5921B), each one word of a combination with the other words in the brackets. The headword test reads the headword outside the brackets, so Ruth 3:12 word 5 shows its own record (2 of the 57 numbers, 287 words).
- The comparison tool holds the list of the 141 expected differences with their causes and fails on any other.
- Done: Ruth 3:12 word 5 shows the record of «if» first (H0518B, 150 words, from none to one record; H3588B, 137 words, from none to two). The list is `data/place-answers-v1/lines-known-to-differ.tsv` (`V/lines-known-to-differ.tsv`): 138 by builder P's verdicts, 2 by the live page's one-sign test, 1 where the live line is another source's. The one command on the fetched folder: everything holds, 182 seconds.

### Running now (27 November)

- **Builder H** (`BRIEF-H.md`, sandbox `S/s16`): the place card inside the live reader, the old card behind one named switch. Not shipped.
- **Auditor Q** (`BRIEF-Q.md`): an audit of whether every line sits at its word, from the raw source files alone, on a frozen copy.
- **Builder V, a fourth cut** (tools and data only): the unabridged BDB's headword read with its vowels, so a record of another word with the same letters (the stub «mother» inside the record of «if») no longer passes as this word's, measured and read by hand before it is built; and the record's one line never says «no meaning in italics» where the head holds an italic word.

### What a reader still meets on the trial page

- The line under a word is one string read left to right («to <the> + her»); the live reader draws each part under its letters in a frame. The trial page has no frames, no menu, no export and no chain pages: it is a card on trial, not a finished reader.
- A sign-only word tied to the next stands as an empty box (Ruth 3:2); the live reader joins it to its neighbor under one outline.
- The UBS dictionary's gloss for the object marker is «-», and that is what leads there.
- 1,479 numbers still reach several records of the unabridged BDB with the same headword letters; the card says so and shows the one that cites the verse first.

## How the live reader should take the new card (the lead's recommendation, put to the owner 27 November)

Held side by side (`V/shots/15-…` both), the live reader's face is already right: the line under a word is the fresh line at 305,290 of 305,431 words, and the face carries every look the owner has ruled on (the frames, the metals, the bar, export). What is wrong on the live page is the card. So: **the live reader keeps its face and takes the new card on the 39 books; the old card (every reading matched by spelling, with its gates) stays whole behind one named switch, off at rest.** Layer 5 of `../THE-LAYERS.md`, named and switched off, where today it is the card.

Being made ready in a sandbox, not shipped: `BRIEF-H.md` (builder H, `S/s16`). The other way, growing the trial page until it is the reader, would mean drawing the frames, the menu, export and the chain pages again from nothing and leaving the suite's 87 card-reading checks behind; the trial page stays what it is, a card on trial.

Steps after it, each its own ship once the owner says go:

1. The place card in the live reader; the old card behind the switch (builder H's work, then the suite's checks pointed at the switch).
2. The line under the word from the place answers at the 141 words where today's is not STEP's (the 14 bare words, the 8 written and not read, the 4 Psalms places, the rest of the builder's list; the two-sign fault of the live page).
3. A reader's choice of which source's answer at this word stands on the line (STEP at rest; MACULA; the UBS sense): a toggle, reversible, each still its source's own words at this very word.

## The stopped ships, read again against the fresh build

| Stopped | What it was | Under the fresh build |
|---|---|---|
| Ship 23 (#169) | STEP leads at 30 + 17 + 7 words; no line under 8 words written and not read; the L5 hash check | The words become step 2 above, by the places' own rule instead of three lists. The L5 check stands on its own and rides the next ship |
| The card hold (#168) | The card moves when a reading is switched | The place card has no reading switch and holds still (16,251 words pressed). The fault stays only in the old card behind the switch |
| Ship 24 (#173) | A piece of a divided word served as a whole word | Withdrawn as framed. Answered: each part carries STEP's own number; the root's number reaches the dictionaries, a prefix or suffix shows STEP's own word only |
| Ship 25 (#171) | Each source's own signs, joiner, year, credit | In the place card each source's row is its own words exactly, with its own credit. A row's year is still to add |
| Ship 26 (#174) | What a source's own bytes say is a reading | Answered by the entries: BDB's grammar words are held as grammar words, Strong's item is whole, his pointers stand apart, the lost «+» is marked |
| Ship 27 (#175) | A source filed by entry is found by its entry | Answered by the bridges: Strong's and both BDBs at every inflected word, homonyms parted by the files |
| One-place renderings (#172) | Another place's rendering a press away | Answered: «At this word» holds only what a source says at this word |
| Ship 28 (#176) | The text's own marks said truly | Untouched by the card; it is the face's work and still stands as written |
| Ship 29 (#177) | The chain pages say how the reading was reached | To be made again from the place answers once the line is (step 2) |
| The footing mends (#170) | Manifests, the path map, the pins | Stand as written; independent |

## The fourth cut: measured, not built (`V/hand-back-cut-4.md`)

- **The headword with its vowels does not part the records safely.** Read by hand it chose the wrong record at 3 of 60 numbers, from two causes in the files themselves: the unabridged BDB's file points about one headword in twenty with a slip (a vowel on the wrong letter, a vowel left off), and STEP's lexicon points sibling numbers of one Strong's entry alike («Canaan» and «merchant», «quarry» and «missile»: 15 such groups, 36 numbers, 2,959 words). Not built.
- **The language both sources declare does.** STEP's lexicon says Hebrew or Aramaic for a number; each record says its own language. Of the 1,483 numbers still on several records, 357 (61,136 words) part to one record of the declared language, and none is left with no record. All 17 such partings read by hand were right. Asked of builder V as a fifth cut.
- **The record's one line.** At 952 records the line says «no meaning in italics» though the record's head holds italic words the file does not class. The page will print the first two as they stand, said as «in italics in the record», with no claim of what they are. The change is in the page's code and goes to builder H with the card.

## 27 November, later: the stop, and what the helpers had done

At about 06:30 all three helpers stopped at a usage limit of the model they ran on. The owner moved the session to another model; the work each left on disk was read before going on.

- **Builder V's fifth cut was finished** but for its report; the lead wrote it from the logs (`V/hand-back-cut-5.md`). The declared language parts 357 more numbers to one record (61,136 words), but STEP's lexicon says «god» (H0426, 95 words in Daniel and Ezra) is Hebrew where STEP's own word rows say Aramaic. The sixth cut reads the language from the row at the word.
- **Auditor Q had finished its five checks on 599 sampled words** (STEP, MACULA, UBS, BDB, the dictionaries' one lines; the finished audit below corrects this: every line it could test was found in the raw file at the right word but 14 lines of the unabridged BDB), and a sweep that found a placement fault: **the unabridged BDB's «cites this verse» line can name a sense from another stem.** The record numbers its senses afresh under each stem (Qal, Niph`al, Hiph`il …), and the reader of the record keeps the numbered points but not the stems, so a reference standing under one stem is put in the last numbered point of the stem before. The lead read one case in the raw file: at Genesis 1:11 «yielding seed» (Hiphil) the card says «2. be fructified, made pregnant», a sense of the Niph`al; the record lists Gen 1:11 under Hiph`il, whose first sense is «produce seed». The first sweep listed about 4,000 such words (`Q/sweep_unit_label_not_the_references-first-200.tsv`); that was a cap in its script, see below. This goes to the sixth cut with the language.
- **Builder H had begun** seating the place card in the live reader (674 lines in `reader/zone.html` in `S/s16`).

Three new helpers carry each on: the sixth cut (the language from the row; the stems of the unabridged BDB), builder H's card, and auditor Q's report.

## The audit, finished (auditor Q2, `Q/hand-back.md`)

**What holds.** On 599 sampled words, drawn by a stated rule (every 1,000th word and up to 40 of each hard class), 6,008 lines were confirmed in the raw source files at the right word with no failure: STEP's parts (672), MACULA's words (613), the UBS dictionary at this very word (559) and at the verse (74), the Open Scriptures BDB (11), and the one lines of six dictionaries (3,696, plus 19 of unfoldingWord's). The auditor read the raw files with its own readers, never the builders'.

**What fails.** All on the unabridged BDB's «cites this verse» line:

- **Another stem's sense** (14 of 381 sampled lines; 6,052 lines on 6,018 words over the whole page by the auditor's stricter test): 3,457 print a numbered sense of another stem, 2,595 another stem's name with no sense. A further 544 print «the opening» for a verse cited under a later stem, and 236 carry a stray stem label from a cross-reference the file marks up as a point.
- **One record cited at two words of a verse:** where a word's number recurs in its verse (29,728 lines), the citation is often another word's («go» at Exodus 4:18 shows the later «go in peace»).
- **Homonym records standing as the word's own:** II. עַם «kinsman» at «the people»; «press, squeeze» at «doers»; «mound, hill» beside «tumour»; the Aramaic «death» at «we should die».
- **«To lift»** (about 650 Hebrew words): the unabridged file files its Hebrew record under other Strong's numbers, so these words reach only the Aramaic record.
- **Written-and-read pairs** show both forms' stem lines on both forms.

**What the page says that the files cannot show.** unfoldingWord's row says «has an entry» at about 97% of words where its file is not on hand; that cannot be confirmed. Italic runs such as «Special uses:» are printed in «» like meanings.

**Where each goes.** The data faults go to the sixth cut (its scope widened by message); the page's wording goes to builder H2.

## The sixth cut (builder V6, `V/hand-back-cut-6.md`, evidence in `V/cut6/`)

Built, every proof passing (the one command, 219 s; the comparison tool: the line under the word did not move; the eight tree checks; 11 spoiled copies each failing):

- **The word's language from STEP's row at the word**, not from the lexicon's one answer per number. «God» in Daniel and Ezra (95 words) gets its Aramaic record back. Read by hand: all 95, and 19 of 20 names. The one against the source's meaning, Gen 31:47 «Jegar-sahadutha», is STEP's row marking Laban's Aramaic name Hebrew; the rule follows the row, and the place goes on the list for the corpus lane.
- **The unabridged BDB's senses held under their stems.** Agreement of the cited sense's stem with STEP's stem at the word: 43,381 before, 50,178 after; disagreement 6,955 before, 1,450 after, mostly another word of the same verse or BDB analyzing the form otherwise. 30 changed words read by hand, all right. Of the auditor's 6,038 flagged lines, 5,791 now show a line in the word's own stem.
- **Written-and-read pairs:** a line whose stem is one form's stands on that form only (82 lines at 45 pairs, all read and right).

Measured, then decided by the lead (the seventh cut, asked):

- **BDB's own homonym numeral** («II.») is printed by both editions; under the number STEP's letter reaches exactly, it parts 785 numbers (29,868 words) to one record and parts «kinsman», «press, squeeze» and «mound, hill» from the word rightly. To be built, after 30 read by hand.
- **One record cited at two words of a verse:** BDB quotes the form it means at only 25% of such references, so the quoted form can decide only some. The lines whose quoted form names another word go to that word (1,025 lines); the rest are said plainly as «BDB cites this verse; this number stands n times in it, and BDB does not say which word it means».

**For the corpus lane:** 27 numbers on 692 Hebrew words reach only an Aramaic record of the unabridged BDB, 659 of them «to lift» (the file lists its Hebrew record under other Strong's numbers); 8 numbers on 39 Aramaic words reach only Hebrew records (`V/cut6/lang-only-other-language.tsv`).

## The seventh cut (`V/hand-back-cut-7.md`, evidence in `V/cut7/`)

Built, every proof passing (the one command, 210 s; the line under the word did not move; 5 spoiled copies each failing; the eight tree checks):

- **BDB's own homonym numeral** parts the records: 661 numbers (17,985 words) parted to one record. Words whose number now reaches exactly one own record: 138,323 before, 156,287 after. All 30 read by hand were the same BDB entry in both editions. «Kinsman», «press, squeeze» and «mound, hill» no longer stand as the word's own.
- **One record cited at two words of a verse:** 1,114 lines withheld at the word BDB's quoted form does not name; 25,085 lines (21,682 words) marked so the card says «BDB cites this verse; this number stands n times in it, and BDB does not say which word it means». Read by hand: 27 of 30, then 28 of 30, then 12 of 12; each miss was a reading of the quote (a maqaf joining two words, another verse's wording, a quote without its proclitic), each mended.
- **The page changes of the fifth, sixth and seventh cuts are one file** for builder H2: `V/cut7/page-changes-cuts-5-6-7.mjs` (9 exact edits, run in node).

One refinement asked: where a record of another numeral cites this very verse (Exod 30:33: BDB reads «cut off from his kinsmen», STEP's letter «people»), the card shows both sources' readings with a sentence, instead of withholding BDB's own citation.

## The eighth cut: BDB's own citation under another numeral (`V/hand-back-cut-8.md`, evidence in `V/cut8/`)

Where a record of another numeral cites this very verse, the card now shows BDB's reading beside STEP's, with one sentence: «BDB files this verse under another word of the same letters (II. «kinsman»); STEP's number is I.» (Exod 30:33). 106 such lines on 104 words. Withheld, each by the source's own words: 46 where BDB itself sends the verse elsewhere («see II.», «read»), 15 where another word of the verse holds the same paragraph under its own numeral, 1 where BDB's quoted form names another word. Read by hand: 15 drawn (12 plainly BDB's reading of this word; 3 from BDB's form lists citing under the other homonym, drawn as BDB gives them), all 46 pointers (45 plain, 1 borderline), all 15 others.

Proofs: the one command (203 s, everything holds), the comparison tool (the line under the word did not move), the page check with four spoiled copies each failing, the eight tree checks.

The page changes of cuts 5 to 8 are one file of 9 exact edits: `V/cut8/page-changes-cuts-5-6-7.mjs`. Builder H2 applies it once its present proofs are done.

The lists for the corpus lane are in `V/cut8/` and the letter `../FOR-MOSES-2026-11-27-what-the-fresh-build-found-in-the-sources.md`.

## 27 November, afternoon: the card inside the live reader (builder H2)

Builder H2 (S/s16) finished the place card inside `reader/zone.html`. Its report is in `H2/hand-back.md`; three of its pictures are in `H2/shots/`; the suite's table is in `H2/suite-table.txt`.

- **Seated in the live sheet.** The head, the silver number and closing are the live page's own. The body is drawn by one block, `reader/tools/place-card-v1.mjs`, carried line for line by both pages and held equal by `check-place-card-one-place-v1` (P1–P9).
- **The old card** is kept whole behind one switch in the menu, «readings matched by spelling», off at rest. `?card=spelling|place` sets it for one load, and `fh.card` keeps it on the device. A head line `<meta name="reader-card" content="spelling">` makes the old card the rest state, which is how the old suite keeps running against it.
- **Proofs:**
  - 13,497 words pressed and 13,497 cards opened, each matching the file. Median 13.1 ms to open. The sheet held still across 5,320 entries opened and shut.
  - Switch on equals S/base at 200 of 200 places. 189 matched on the first reading, 10 once their late-landing files arrived, and 1 differs only in the old card's fit.
  - Resting lines of five books (30,559) are unmoved with the switch off, on and off again.
  - The Tikkunei Zohar and a Targum's cards are untouched.
- **The suite:**
  - With the place card at rest, 70 card-reading checks look for the old card's parts and are red for that reason alone. Two were the page's own laws (inks; parts read right to left); the card broke both, and both are mended.
  - With the old card forced on, 82 pass and 3 are red: chain-book-v2 (the hash of zone.html, expected), and clean-address and press-paints-before-seen (both red before).
- **The audit's two page items:**
  - unfoldingWord rows are drawn only where the entry's file is on hand, with one credit sentence.
  - «» marks only what the record classes as meaning or opening; any other italics print plain, after «in italics in the record:».
- **Left for the owner:** «Special uses:» (90 lines) is classed by our reader of the file as an opening (the first italic run of a point), so it keeps «».

Next: H2 brings S/s16 to cut 8 (S/s16 is now the one tree; S/s14 is frozen), puts the cut 5–8 page changes into the block, removes the `say`/`why` hooks no data writes, proves again and retakes the pictures under `S/s46w/shots-cut8/`. Nothing ships.

## 27 November, evening: the card at cut 8 (builder H2)

H2 brought S/s16 to the eighth cut and put the page changes of cuts 5 to 8 into the card's one block. Its report is in `H2/hand-back-cut-8.md`. S/s16 is now the one tree of the fresh build; S/s14 is frozen.

**The data:**
- The pins equal S/s14's. The comparison tool exits 0 (141 known differences).
- Each citation's italic runs now carry their kind in the page files ([words, kind]), so the card no longer fetches the record. The chapter files grow by 214 KB gzipped (+1.1%).
- `lineAgain` in the page check builds the runs the same way, so G6 now also holds the kinds.

**The card:**
- The `say`/`why` hooks are gone.
- Six new laws (P10–P15: †, ‡, stem placement, the stray label, the pair, the language) and a reworked P8. Each fails on a spoiled copy.
- The ‡ gloss is quoted run by run (Isaiah 38:13).
- The switch's note is shortened to «every reading any dictionary files under these letters».

**The proofs:**
- The walk: 13,497 words pressed, opened and matched; median 13.2 ms to open.
- Switch on equals S/base at 50 of 50 places.
- Resting lines unmoved (30,559).
- All eight tree checks pass.
- With the old card forced on, 10 of 10 suite checks pass.

**Pictures:** in `S/s46w/shots-cut8/`.
- Genesis 1:11 «yielding» now reads «Hiph`il 1. «produce seed»» (it read «2. be fructified» under the stem fault).
- Daniel 2:20 «God» stands on its Aramaic record by the row.
- Exodus 30:33 shows the ‡ sentence. It said «STEP's number is I.», which is not true; it is being reworded to name STEP's tag («STEP's number H5971A is BDB's I.»).

**Still reads badly:**
- the «**» label as the file gives it;
- «the opening» without saying of what;
- long row sentences;
- «Special uses:» (left for the owner);
- the line under the 8 written-not-read words (Ruth 3:12 still «mother»: the later step of the 141).

The ‡ sentence now names both numbers: «‡ BDB files this verse under another word of the same letters (II. «kinsman»); STEP's number H5971A is BDB's I.» P11 checks the new wording, and its spoiled copy still fails. Reports are in `H2/hand-back-cut-8-fix.md`. The pictures sent to the owner are in `H2/shots-cut8/`.

## 27 November, night: the owner on the card, and the pills

The owner, on picture 01: «this part is fine but you dont get to skip R pills and compspan and selectable gloss just because we can play around with how the cards list off D/M».

The listing stands. The card seated in S/s16 had dropped today's frame:
- the line at the top;
- the divisions (the whole form, its pieces, the covers, the maqaf run's card, a chain's card);
- the R pills;
- the pressed pill setting the line.

That frame was never the fault. The fault was where the pills came from: the pool matched by letters («beacon», «break», «faint» at Genesis 1:3).

**The next step** (`BRIEF-H2-PILLS.md`, builder H2): the card at rest is today's card in every part of its frame, reusing today's code, with its pills filled from the place answers by each source's own address. Under the pills stands the listing.
- **The cells:** a cell's pills are STEP's and MACULA's readings of that part at this place (MACULA held by its own division where it divides otherwise), and each dictionary's marked meanings under the number STEP gives that piece. The marked meanings are each «» run, each `<def>`, each UBS gloss, and STEP's lexicon gloss.
- **What is not a pill:** plain italics and Strong's KJV renderings.
- **A cell no source reads** has no pills and says so.
- **The line at rest does not move**, and a pressed pill sets the line as today.
- **The proof:** the 70 card checks that were red only for want of this frame are run again at rest. Their laws are not edited.

## 27 November, night: relay v223 from the corpus lane

Moses answered all nine letters (relay v223). Copies of the letter and its register are in `../from-moses-v223/`; my answer is `../FOR-MOSES-2026-11-27-v223-received.md`.

- **unfoldingWord and Hebrew Wikisource's Strong's**, both whole, are on the store as received:
  - unfoldingWord's zip, commit 0a2b9bf1, 8,235 entries;
  - Wikisource's nine pages, 8,674 entries, no revision recorded.
  - **The ninth cut** (builder V7, `BRIEF-V7-CUT-9.md`, in S/s14 with the two tools H2 changed at cut 8 synced in) reads them by their own structure.
- **The forty sources by their own address:** (a) 1, (a+b) 4, (b) 9, (c) 26. Beyond the ten already in the fresh build, four can come back by rule, one at a time:
  - BiblicalTools (b);
  - HiperBiblia's SDBH (the lane's stated bridge, 8,910 of 8,934);
  - ETCBC's BHSA glosses (a, needing the files that put a slot in a verse);
  - STEP's expanded Strong (already held in TAHOT's columns).
  - The 26 of class (c), Davidson among them, stand only behind «readings matched by spelling».
- **The unabridged BDB at Genesis 1:11:** the cause is in the file's own divisions (the niphal division runs on through the form lists while the stem in force at the reference is hiphil). The fresh build's reader already resolves it.
- **For the owner:** the downloads for one pin (STEP 5de0a47f, UBS v0.9.4, and Wikisource's pages again to pin a revision); a word to STEP on its five slips; Davidson's place.
