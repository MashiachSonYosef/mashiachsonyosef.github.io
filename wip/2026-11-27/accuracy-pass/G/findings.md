# Helper G: the chain pages of the twelve minor prophets, link by link against the cards

Measured on the frozen tree (`S/base`, main at ea6e1ad08e), 27 November 2026. Nothing was changed and nothing shipped. `S` is the scratchpad folder; every file named without a path is in `S/w39/out/G/`.

## The short answer

- **Does each link say what the card of the same word says?** Yes, everywhere. Every word of the twelve books was pressed in a browser and its card set beside the chain: at rest 14,354 of 14,354 cards (512,247 pills) are the chain's, pill for pill, reading, source, year, the sources behind, the pill pressed; with every switch lifted 14,354 of 14,354 (1,325,807 pills). The chain page under each word prints the card's first six pills in order (240 words read by hand, 1,388 printed links recomputed, none off).
- **Does each link name the right source?** Each link names the source the pill's title names, which is not always the source the page credits the line to. The line under the word is credited to STEP at 14,350 of the 14,354 words; the link the card opens on names another dictionary at **7,574 words (52.8%)**. The chain is faithful to the card; the card and the line disagree.
- **Does the chain tell the truth about how the reading under the word was reached?** Not yet. The chain page prints six links and does not say which is the reading under the word; at 6,687 words the line's fingerprint is not on the chain page at all; at 110 words the pill the card opens on is not what the place reads; the chain holds no link for the entry (Strong's number, STEP's tag) the card is held to; and the lines the card carries from MACULA, the UBS dictionary and BDB (31,969 of them) are not in the chain.

## Summary table

| # | Finding | Places | Verified | Whose | Class |
|---|---|---|---|---|---|
| 1 | The lines of the sources at the place («here MACULA reads», «here UBS reads», «here BDB reads») stand on the card and in no chain file | 31,969 lines on 14,248 of 14,354 cards | by machine, all words; by hand, 240 | the chain's reader of cards | a step skipped |
| 2 | The lines the chain does record as «above the pills» are folded away on about nine cards in ten | 1,458 of 1,579 cards measured (three books), at the size the chain was read at | by machine in a browser, 3 books; by hand, 240 | the chain's reader of cards | the chain says «prints» of what is not drawn |
| 3 | The link the card opens on names another source than the line's credit | 7,574 of 14,354 words | by machine, all words; by hand, 240; on the page | the page's credit rule; the chain records it | overrides (the credit of the place's own source) |
| 4 | The chain page does not print, or mark, the reading under the word | 6,687 words where the line's fingerprint is not on the chain page; 3,908 where the pressed pill is past the six printed | by machine, from the files | the chain page's builder | a step skipped |
| 5 | One source under two labels, one of them carrying an internal name in brackets | 22,419 pills with a piece name behind them; 9,733 with STEP behind them under both labels; 624 pill titles print «(PIECE:TAHOT)» or «(PIECE:MACULA)» | by machine, all pills | the piece store's index; the chain fingerprints it | a source named differently; an internal term |
| 6 | Links whose text the page formed, in no source's file as printed | 5,578 pills of 512,247 (5,415 respelled, 163 composed) | by machine, all pills | the page's print rules; the chain's lede | overrides (a source's own spelling) at 477 of them |
| 7 | The line carries a gap where a sign is hidden, so its fingerprint is nowhere in the chain for the word | 851 words | by machine, from the files | the chain's shape | not a fault of a rule; a link missing |
| 8 | The pill the card opens on is not what the place reads | 110 words: 96 where the place's piece is a sign switched off (80 of them Strong's «self» for the object marker), 14 at words written one way and read another | by machine, all words; on the page (3 places, with pictures) | the page's rule for which pill opens pressed | overrides at 96; fired with nothing to decide at 14 |
| 9 | The chain holds no link for the entry the card is held to | all words; 652 links stand on a row with no number | by machine, all pills | the chain's shape | a step skipped |
| 10 | The chain pages' own sentences say more than the fingerprints prove, and one is stale | 3 sentences | by reading | the chain page's builder | plain words |
| 11 | Plain words: candidates on the chain pages | 9 candidates | by reading | the chain page's builder | taste |

Found on the way and not the chain's (for the passes they belong to): section «Found on the way».

## What a chain is made of, what the check proves, and what it does not

**The builder** (`reader/tools/build-chain-book-v2.mjs`, with `reader/tools/card-readings-v1.mjs`). A chain is a recording of cards. Every word of a book is pressed in a browser, twice (at rest, as a first visit finds the page; and with every switch that withholds a reading lifted), and what the card shows is fingerprinted (sha256 of the string, first 12 digits printed, all 64 in the file). For each word the file holds: the word and its key; the card's rows of buttons (forms, the run, divisions, blocks) and the one pressed; the «lines above the pills» (only the elements of class `r-piece`: «here STEP reads …» and the BSB's suggested line); the list of pills in the card's order, each with its text, the source its title names, the year its title says and the sources behind it; and which pill stands pressed. The page (`chain/<book>/index.html`) prints, under each word, the word's and the key's fingerprints and the first six links at rest, then «and N more at rest · M with the switches lifted, in the file».

So the chain as built has three links: word, key, pills. It has no link for the line under the word, none for the entry, and none for the record under a pressed pill. The brief's «from the Hebrew word through its entry to the reading printed» is more than the files hold.

**The check** (`reader/tools/check-chain-book-v2.mjs`). Run here on the frozen tree; the part that needs no browser passed whole (`log-check-chain-book-v2.txt`): the shape is the book's shape (12 books); every word and key fingerprint recomputed from the zone (15,603 entries); each file is of this tree (7,896 file fingerprints); each hangs together (18,534 lists of pills, 309,023 fingerprints); the counts are what a walk finds; the page prints the first six links in the file's order; the index's sha256 of each file is the file's; no Hebrew and no reading printed on a chain page. I stopped its browser part (the machine's load was near 20 and its per-chapter time limit would have failed on load, not on the site); my own walk does what that part does and more.

**What the check proves.** That the file is a true recording of the cards of this tree, for the things the builder chose to read: in a browser it opens the middle chapter of each book and holds every card there to the chain, in both states, and for every other chapter it relies on the file fingerprints (the same page over the same files prints the same cards).

**What it does not prove, and nothing else does.**
- That the card outside the middle chapter is the chain's. (Held here: all 14,354 at rest and all 14,354 lifted.)
- Anything about the line under the word: the chain is never set beside `data/resting-lines`.
- That the «lines above the pills» are every line the card carries from a source, or that they are drawn.
- That a pill's source is the source the page credits the reading to.
- Anything about the entry at the place.
- That no reading leaks onto a chain page beyond a sample of 40 readings a book (K8).

## Findings, ranked by the places they touch

### 1. The lines of the sources at the place stand on the card and in no chain file (31,969 lines, 14,248 cards)

**Seen.** Every card of a word carries, in its readings band, one line for each default source that reads the word: «here MACULA reads Obadiah», «here UBS reads Obadiah», «here BDB reads · 1 (no words given) (sense 1)» (Obadiah 1:1 word 2). Counted on every card at rest: 31,969 such lines on 14,248 cards (MACULA 14,003, UBS 11,973, BDB 5,959, STEP's own picks apart from its pieces 34). The chain files hold none of them. The chain's count «lines above the pills» (28,409 at rest: 14,256 «here … reads» of the place's pieces and 14,153 of the BSB) is the lines of class `r-piece` only.

**Cause.** `reader/tools/card-readings-v1.mjs` line 140 reads `:scope > .r-piece`. The lines of the sources at the place are of class `r-dflt` (zone.html lines 12044 to 12073, default-picks-rule-v1, which came after the chain's reader was written). The check reads cards through the same function, so it cannot see what the function leaves out.

**Why it matters.** The chain says of itself «the links under a word are what that word's card prints», and its file's recipe counts «a line the card prints above its pills» as a reading. These 31,969 lines are a source's own words at the place, each with its license chip; they are the card's answer to «what does each of the twelve read here», and a stranger auditing the card against the chain finds them left over on the card's side.

**Class.** Not a rule on a reading. A step the recording skips.

**Mend, by rule.** The card's reader takes every line of a source in the readings band (`r-piece` and `r-dflt`), each with the source its chip names; the builder fingerprints them as it fingerprints the others; the check then holds them. The count per word is column 34 of `per-word.tsv`.

### 2. The lines the chain does record are folded away on about nine cards in ten

**Seen.** A card the page fits tight folds its lines away: zone.html line 1648 sets `display: none` on `#hud.tight .rows .band > .r-piece` and `> .r-dflt` and `> .kq-role`. Pressing every word of Obadiah, Jonah and Haggai (each word scrolled to the middle of the screen first) at 412 by 915, the size the chain was read at (`card-readings-v1.mjs` line 205): 1,458 of 1,579 cards are tight and their «here STEP reads …» line is not drawn. At 1280 by 900: 1,453 of 1,579. In the hand sample, 12 of 237 such lines were drawn. `tight-census.tsv`.

The chain's reader takes the line's text from the document whether or not it is drawn, so the chain records as «a line the card prints above its pills» a line a reader does not see on 92 cards in 100.

**What the reader does see.** The same words stand at the top of the card (the card's own first line, class `r-now`; 236 of 237 sampled). What is folded away is who reads them: the words «here STEP reads» and the license chip. On a tight card nothing says the reading is STEP's (the small source tag after the reading is drawn only under a source other than STEP: zone.html lines 11289 to 11300). The only credit a reader sees is the record's foot under the pressed pill, which is finding 3.

**Class.** The chain says «prints» of what is not drawn. Not a rule on a reading.

**Mend, by rule.** Either the chain records for each line whether the card draws it, and the recipe says so; or the chain records the card's first line (the reading the card says stands on the line), which is always drawn, as its own link.

### 3. The link the card opens on names another source than the line's credit (7,574 words)

**Seen.** The line under the word is STEP's at 14,350 of 14,354 words (credited to STEP's pieces at 14,320, to STEP's rows at 30; to MACULA's pieces at 2, to Strong's at 2). The card's «here STEP reads …» line names STEP at all 14,256 cards that have one. The pill the card opens on, which prints the same words, is titled and recorded otherwise at 7,574 words:

| The pressed pill's title names | words |
|---|---|
| Brown-Driver-Briggs via Open Scriptures, 1906 | 2,065 |
| Strong's via Open Scriptures, 1890 | 2,010 |
| MACULA, 2022 | 1,807 |
| Strong's via Hebrew Wikisource, 1890 | 538 |
| the SDBH, 2023 | 509 |
| BDB unabridged, 1906 | 394 |
| MACULA's pieces | 227 |
| STEP's Brief Lexicon | 22 |
| the Open Scriptures Lexical Index | 2 |

At 7,466 of them STEP stands among the sources behind the pill (the card's record says «also given by 2 more sources … STEPBible TAHOT: the aligned translation's pieces»); at 108 STEP is not behind it at all (105 of those are among the 110 words of finding 8). By kind of word: 3,682 whole words, 3,859 divided, 17 in a run, 16 written one way and read another.

By fingerprint alone, from the files (`line-in-chain.tsv`): the pressed link's source is the fingerprint of the line's credited label at 6,612 words and is not at 7,742 (168 of those only because STEP's pieces carry a second label, finding 5).

Examples. Obadiah 1:1 word 2: the line «Obadiah», chip STEP; the pill «Obadiah» titled «1890 · Strong's Hebrew Dictionary via Open Scriptures»; the record's foot «Strong's Hebrew Dictionary via Open Scriptures · wording 1890»; the chain page's first link for the word names Strong's. Hosea 2:20 word 18 (`shots/card-hosea-2_20-18.png`): the line «from»; the card shows «from» and, under it, «Brown-Driver-Briggs Hebrew Lexicon via Open Scriptures · wording 1906 · CC BY 4.0»; nothing drawn on the card says STEP. Hosea 7:7 word 1: STEP's «all of» is credited to MACULA (2022), because MACULA's row states a year and STEP's states none, and the pill's credit goes to the oldest dated row.

**Cause.** zone.html `poolFor`: readings that print alike are one pill (lines 9181 to 9212), its rows put oldest first (line 9220), and the pill's title names the first row (`makePill`, lines 12795 to 12801; the record's foot follows the same order). The place's own reading is credited to the place's source only where no row of the store prints it, or where a default source other than STEP is in force (lines 9297 to 9347, the `credit` step under `opts.place.why === "default"`, line 9340). And a block of a divided word is given no place at all (`placeOfCell`, line 10979), so its pill is whatever row prints the piece.

**Class.** Merging two sources' same words into one pill reconciles (the owner's ruling of 2 October, «one pill with 2 M»). Crediting that pill to the oldest dated carrier, at a place where the line itself is credited to STEP, **overrides the place's own source in the credit**: the page says two things about one reading at one place, and the chain, the record's foot and (on a tight card) everything a reader can see say the other dictionary. It moves no reading.

**Mend, by rule.** A pill that prints the place's own reading (the whole word's, or the open block's piece) carries the place's source first among its carriers, as the line's chip does, with the older carriers behind it: the step the page already takes for a default source's pick. The chain then names STEP where the line does, with no change to the chain's builder. The owner rules it, since it changes what the card credits at half the words.

Data: `chain-disagreements.tsv` (7,574 rows of kind `link-source-is-not-the-lines-credit`), `per-word.tsv` columns 14 to 19, `pill-titles.tsv`.

### 4. The chain page does not print, or mark, the reading under the word

**Seen**, from the files alone (`line-in-chain.tsv`, `chain-files-counted.tsv`). Setting the fingerprint of the line (`data/resting-lines`) beside the chain, word by word:

| | words |
|---|---|
| the line is the pressed link | 7,667 |
| the line is in the file only as the line above the pills (the word is divided; the links are one block's) | 5,836 |
| the line is nowhere in the chain for the word (finding 7) | 851 |

The chain page prints the pills' links and not the lines above them, so the line's fingerprint is on the chain page at 7,667 words and is not at 6,687; with the line's own credit beside it at 3,966. And the page prints six links without saying which one the card opened on: the pressed pill is link 1 at 8,865 words, link 2 to 6 at 1,581, and **past the six printed at 3,908** (Zechariah 10:11 word 1: link 243 of 244; Hosea 3:4 word 15: link 75 of 76; Micah 2:13 word 9: 108 of 109). At those words the six links the page shows are Strong's first six for the block's letters and the reading under the word is not among them.

For a divided word the file holds one block's pills: 6,533 cards have more than one block, and 7,255 other blocks (the «and», the «the», the «his») are a press away. The chain says so («what is not here»), and counts 15,320 buttons a press away on 6,578 cards at rest.

**Cause.** `build-chain-book-v2.mjs` `pageOf` (lines 298 to 319): `rest.slice(0, PAGE_SHOWS)` (line 310), no mark for `on`, no line printed for `here`.

**Class.** A step the page skips; the file has what is needed.

**Mend, by rule.** Under each word the page prints first the line above the pills with its source, then the pressed link, marked, then the card's next links to the count it shows; and says in its recipe which is which.

### 5. One source under two labels, one of them with an internal name in brackets

**Seen.** STEP's aligned translation is named four ways on one card and fingerprinted two ways in one chain:

| Where | The name |
|---|---|
| the line above the pills, in words | «STEP» |
| the chip of the line under the word and of the line above the pills (its title), and the title of a pill of STEP's own row | «STEP Bible Translators Amalgamated Hebrew OT aligned component translation» |
| the record, «also given by» | «STEPBible TAHOT: the aligned translation's pieces» |
| the sources behind a pill, as the chain fingerprints them, and 169 pill titles | «STEPBible TAHOT: the aligned translation's pieces (PIECE:TAHOT)» |

The last is the label the piece store's index gives the name `PIECE:TAHOT` (`reader/data/piece-store/index.json`), and the chain takes labels from the indexes (`labelsFor`). MACULA likewise: «MACULA exact Hebrew morph surfaces with Cherith English definitions» and «MACULA Hebrew: the morphology's pieces (PIECE:MACULA)» (455 pill titles). Counted over all pills at rest: 22,419 carry a piece name among the sources behind them; 9,733 carry STEP under both labels as if two sources stood behind them; 624 pill titles print the bracketed internal name to a reader who hovers (Obadiah 1:5 word 16, Jonah 2:7 word 8, Micah 4:2 word 24 in the hand sample). `labels.tsv`.

So a stranger who walks the fingerprints cannot tell that the source of the line above the pills and a source behind the pressed pill are one source, and a reader who hashes the name the card draws in the record («… the aligned translation's pieces») does not get the fingerprint the chain holds (the label with « (PIECE:TAHOT)» after it).

**Class.** A source named differently on the two pages; an internal term in a label a reader meets (sour).

**Mend, by rule.** One label for one source in every index the card reads (the piece store's label for a source's pieces is the store's label for that source, with what the pieces are said beside it and not inside it), and no internal name in a label that prints.

### 6. Links whose text the page formed (5,578 of 512,247)

**Seen.** Each pill at rest was set beside the rows of the store that stand behind it, read by the page's own function (`tools/page-reading-v1.mjs`):

| The pill's text is | pills |
|---|---|
| a row's text whole, byte for byte | 484,155 |
| a part of a row's text, cut where its ledger cuts it, byte for byte | 21,341 |
| a row's reading respelled by the page (a closing stop dropped, «/» pieces joined with « + », or another row's capitals) | 5,160 |
| the same, where the stop dropped was the last dot of the source's own «...» | 255 |
| composed by the page (a pointer's resolution with the pointer beside it; a read word named) | 163 |
| the place's own reading or the place's pieces, no row of the store behind it | 1,173 |

Of the respelled, two kinds change what the source wrote: **222 pills on 206 cards print «and + or» where the source wrote «and/or»** (the UBS dictionary: «… from a certain location and + or position», Obadiah 1:1 word 14), and **255 pills print a source's «...» as «..»** («at the age of ..», «one that is ..», «in the continuance of ..», «do not . . ., let not . . »).

**Why it matters to the chain.** The chain pages say «Nothing here is written by this project» and «custody: the bytes served are the bytes received». The fingerprint of a pill is the fingerprint of what the card prints, as the recipe says; for 5,578 links that string is in no source's file, so no stranger can reach it from the source's bytes without this page's rules.

**Cause.** zone.html `spanJoin` (lines 3802 to 3806): every «/» divides, one closing «.» is dropped.

**Class.** The joining and the stop are the owner's rulings on how a reading prints. Where they fire on «and/or» and on «...» they **override a source's own spelling with nothing to decide** (477 pills). The rest is the declared print form.

**Mend, by rule.** The corpus lane's ledgers already say, source by source, which «/» divides; «and/or» and a closing «...» are theirs to declare as not dividing and not closing. For the chain: the pages say «as the card prints it» in the lede too, and count the links that are not a row's bytes. Samples: `pills-respelled-sample.tsv`, `pills-unmatched-sample.tsv`.

### 7. The line carries a gap where a sign is hidden (851 words)

**Seen.** With signs at rest off, a piece that is a source's sign alone is drawn as a gap (a zero-width space keeps its place): the line under Obadiah 1:8 word 1 is a gap and «not» where STEP reads «¿ + not»; under Joel 4:19 word 5 a gap and «a wilderness of» for «<into> + a wilderness of». 849 lines carry such a gap (the owner's ruling of 16 October; not a fault). The card's line above the pills prints the signs. So the string under the word and the string on the card differ, and the line's fingerprint is nowhere in the chain for the word at 851 words (the 849, and two lines of STEP's rows drawn the same way).

**Class.** Not a fault of a rule. A link the chain lacks.

**Mend, by rule.** The chain carries the line under the word as a link of its own (the line as drawn, and who its chip credits), read in the same visit; then line, line above the pills and pressed pill can be walked in order, and where they differ the difference is the sign, which the file can say.

### 8. The pill the card opens on is not what the place reads (110 words)

**Seen.**

(a) 96 words whose place gives a sign for the piece the card opens on. Obadiah 1:19 word 13 (`shots/card-obadiah-1_19-13.png`): STEP reads «and + <obj.>»; the line prints «and» and a gap; the card says at its top «and + <obj.>», opens on the block «את», and the pill pressed is **«self»**, Strong's, 1890, with Strong's record under it. The chain's pressed link for the word is «self». The same at 80 places («self» for the object marker with a prefix or a suffix: «and + <obj.>» 38, «<obj.> + you» 23, and so on), 9 more with Strong's «(as such unrepresented in English)», 4 with «against» for «<to>», 3 others. Where the object marker stands alone the card keeps «<obj.>» pressed (Amos 1:3 word 16).

(b) 14 words written one way and read another (13), or marked by the source as a pair printed in one form (Amos 9:6 word 3), whose read half is divided. Nahum 1:3 word 4 (`shots/card-nahum-1_3-4.png`): the line «and + great of»; the card opens on the block «גדל» with **«elder(-est)»** pressed, though «great of» is on the card further down. Nahum 2:1 word 17: «beyond» for «pass». Nahum 3:3 word 14: «bereave (from the margin)» for «people will stumble». Haggai 1:8 word 9: «abounding with» for «let me be honored». Of the 14 such words whose read half is divided, 13 open on another reading; the 11 that are not divided open on the place's.

**Cause.** zone.html, the reading a block opens on (`lineSaid`, lines 12272 to 12326, and line 12329). A block of a division opens on the line's own piece for it (lines 12298 to 12321). In (a) that piece is the gap, which no pill prints, and the sign's own pill is not offered while signs are off (lines 12853 to 12860), so the card falls to the first pill of the pool. In (b) the line's pieces are not found as the division's blocks for a pair, and the card falls to the book's baked reading for the block's letters (lines 12322 to 12325).

**Class.** (a) **overrides** the source's own answer on the card: STEP answers «<obj.>» for the piece, the owner's ruling hides the sign on the line, and no ruling puts another dictionary's reading in its place as the one pressed. (b) **fired with nothing to decide**: STEP gives the piece of the read half, and the card does not look there.

**Mend, by rule.** A block opens on the place's own piece wherever the place gives one: where that piece is a sign switched off, the card keeps the sign's pill and presses it (as it does for the object marker alone), or opens with no pill pressed; a pair's read half is asked for its pieces as a plain word is. Rows: `chain-disagreements.tsv`, kind `pressed-link-is-not-the-places-reading` (110).

### 9. The chain holds no link for the entry

**Seen.** The card is held to an entry at every tagged place and says it («78 of another entry than H853, withheld»; the page keeps it in `window.__cardEntry`, zone.html line 10427, and on the pills' row). The chain records neither the entry nor what was withheld. Measured against `tools/entry-gate-v1.mjs` over the zone's own tags:

| | |
|---|---|
| the tags the card is held to are the zone's tags for the place | 14,258 of 14,258 compared (3 places have no tag; 68 words of runs and 25 written-and-read words open cards whose tags are not the word's own and were not compared) |
| the entry the card's pills are held to is what the entry gate gives for the open form | 14,325 of 14,325 (4 open forms are asked none; the 25 pairs not compared) |
| pills that stand on a row of the place's entry | 509,464 |
| pills that stand on a row with no number (the gate leaves it to the pointing) | 652: BDB via Open Scriptures 595, BDB unabridged 26, Davidson 31 |
| pills that stand only on rows of another entry | 0 |
| the place's own reading | 554 |
| pills on the place's pieces alone | 624 |
| pills not matched to a row (the «..» class of finding 6) | 255 |
| pills on cards whose open form is asked no entry | 698 |

So the gate does on the card what the tool says, at every word, and the chain inherits it. What the chain cannot show is that it did.

**Mend, by rule.** The chain carries, per card, the entry as the card says it (a fingerprint of the tag or tags) and the card's withheld counts; the recipe says where a reader sees them.

The 652 links with no number are in `links-with-no-number.tsv`; see «Found on the way».

### 10. The chain pages' own sentences

- **«Nothing here is written by this project.»** (both pages, in bold.) True of the fingerprints as strings; not true of what 5,578 of them are fingerprints of (finding 6), and the lede does not carry the recipe's «as the card prints it».
- **«what it proves: custody: the bytes served are the bytes received»**. The chain proves the card is the chain. It does not set a pill beside a source's file; 94.5% of pills are a row's bytes whole, and the page does not say which.
- **«Lifted: with every switch that withholds a reading lifted, which is the pointing kept whatever a source points, a source's own signs printed, every source on and the word senses shown.»** (book pages, `build-chain-book-v2.mjs` line 335.) Stale: the file's own state adds «the dictionaries that rest shut opened» (`card-readings-v1.mjs` line 111), which is most of what lifting brings on these books.
- **«This is 12 books of the 40 the reading side serves — 14,354 words of 453,713.»** Exact by the builder's count (the Tikkunei Zohar is the fortieth); a reader who knows thirty-nine books will stop on forty.
- The book's name is printed as its slug: `<title>obadiah · the same book with the meaning taken out</title>`, and «amos», «habakkuk» as the index's links. The repository's convention is that a displayed title is never lowercased.

### 11. Plain words on the chain pages: candidates only

One reading of every string on `chain/index.html` and a book's page, by the owner's test. Nothing changed.

| The words | Where | Taste | Why |
|---|---|---|---|
| «route store 2882324f8ff3» | a book's counts line | sour | our working name, and twelve hex digits that look like a fingerprint and are not one |
| «0 cards print none», «0 print none» | a book's counts line | sour | a double negative to chew through; «every card prints a reading» |
| «197 sections» | counts line, index rows | sour | our working word for verses |
| «Read off the reading page by tools/build-chain-book-v2.mjs … in the same round that built the page» | footers | sour | a path that is no link and does not open from /chain/ (the file is at /reader/tools/), and «round» is ours |
| «the reading side», «chaining the whole shelf» | the index's paragraph of what is away | sour | lane language; the owner already named «sealed from the shelf» |
| «and 138 more at rest · 400 with the switches lifted, in the file» | under every word | sour, mild | «at rest» and «the switches lifted» are ours and are explained only inside a folded recipe |
| «sha256 over the FILES» | the index's recipe | sour, mild | capitals |
| «Strip the language away» | both ledes | bitter, mild | «strip»; the sentence before already says «with the meaning taken out» |
| «a pill's text», «hash each pill» | recipes | weak | the site's word; the reading page uses it to a reader at written-and-read words only |

Not candidates, though they could be put otherwise: «custody», «a stranger», «one of them is wrong, and both are published», «Nothing was chosen for being clean».

## Found on the way (not the chain's; verified where said)

- **Strings on the card a reader stumbles on** (read by hand; all on the card, none in the chain): «here UBS reads · 1 «-»» (Obadiah 1:19 word 13, Zechariah 8:17 word 13); «here BDB reads · 1 (no words given) (sense 1)» (Joel 2:23 word 1, Jonah 1:14 word 13); «day / are combined · sense 3» (Joel 1:15 word 2); «· 2 «weariness» (another number)» (Malachi 1:13 word 3); «(a meaning variant, K)» (Amos 9:6 word 3). At Malachi 1:8 word 2 the card prints one reading two ways: «here STEP reads you bring near/ ! · on the line» and the pill «you bring near + !».
- **Links with no number are mostly another word or no word** (verified by machine, 652 pills, `links-with-no-number.tsv`): BDB's letter names on the cards of one-letter pieces («Yôdh» 58, «Wāw» 51, «Hē» 30); BDB's root «possess», «own exclusively», «counsel», «advise», «counsellor» on the card of «king» at 14 places (Jonah 3:7 word 5, `shots/card-jonah-3_7-5.png`); BDB's guesses at the root of «God» («trepide confugere ad», «the one whom men strive to reach») at 11 places; and a book's title, «Semitic Studies in Memory of Dr. Kohut», as a reading on the card of «heart» at 14 places (BDB unabridged). For the homonym pass and the pass on each dictionary.
- **A row filed under several numbers passes the gate at each** (seen at one key, suspected wider): the SDBH's rows under «את» carry H853, H854 and H855 together, so «mattock», «with» and «together with» stand on the object marker's card (Obadiah 1:19 word 13). Not counted over the books.
- **A year beside a source that states none** (verified by machine, `pills-step-with-a-year.tsv`, `pill-titles.tsv`): 556 pill titles set a year beside STEP's aligned translation (1890 at 501: «1890 · STEP Bible Translators Amalgamated Hebrew OT aligned component translation» for «a king», Amos 1:1 word 13; the row's own year slot in the store says 1890), and 1,322 set 1890 beside MACULA. The chain records the year as the title says it. Cause not traced; the corpus lane's.
- **Two lines in these books are Strong's and not STEP's**: Zephaniah 2:9 word 27 («nation»; the card says «here STEP reads nation/ my») and Zechariah 7:2 word 4 («Sharezer»); two more are MACULA's pieces (Habakkuk 3:4 word 9, Zechariah 2:8 word 2). For the pass on the 124 words.

## What I checked and found clean

- **The card is the chain, at rest: 14,354 of 14,354 words, 512,247 pills, 12 books.** Every word pressed in a browser as a reader presses it, the card read in the clear, hashed here with a hash of my own, and set beside the chain file: rows of buttons, lines above the pills, every pill in order with its source, year and the sources behind it, the pill pressed, the run. No pill that is no link, no link that is no pill. (`walk.mjs`, `analyze.mjs`, `per-word.tsv` column 35, `summary.json`.) The walk moved no line and ruled no word; no page error.
- **The card is the chain, lifted: 14,354 of 14,354 words, 1,325,807 pills, 12 books** (`summary-lifted.json`, `log-walk-lifted.txt`, `log-analyze-lifted.txt`). The pill counts are the index's own totals in both states.
- **The chain page is the file's first six, as a browser draws it: 240 words by hand** (20 a book, evenly through each book), 1,388 printed links: each is the card's pill at that place, reading and source; the word's fingerprint is the Hebrew the reading page prints (240 of 240); the key's fingerprint is on the card as a block's or a division's button (239 of 239 printed); the count «and N more at rest» is the card's count (240 of 240). `chain-read-by-hand.tsv`, `hand-sample.jsonl`.
- **The record of the lines is the lines the page draws**: all 1,050 verses' lines as my walk's page drew them are `data/resting-lines` byte for byte.
- **The line is the place's own**: the line under the word is the place's pieces at 14,322 words (STEP's at 14,320, MACULA's at 2; 13,473 as given, 849 with a sign left as a gap), a row of STEP's at 30 and of Strong's at 2; no line differs from what the zone's pieces say.
- **The card opens on the place's reading at 14,244 of 14,354 words** (7,888 whole, 6,331 the open block's piece, 25 with a capital's difference).
- **The line above the pills is the line** and is credited as the line is, at all 14,256 cards that carry one (13,406 the same string, 849 the same with its signs, 1 by a capital).
- **The entry**: finding 9's table; nothing off.
- **The site's own check, K0 to K8**, on the frozen tree: all pass (`log-check-chain-book-v2.txt`).
- **Labels**: 164 names, 59 labels; where several names share a label they are one source's (`labels.tsv`); no label is the tail of another, so a pill's title is never read as the wrong source.

## What I could not check, and why

- **The check's own browser part (C1 to C3)** was stopped by hand: the machine's load was near 20 and the check gives each chapter 240 seconds. My walk covers C1 and C2 for every word. C3 (the page's own account of the pool it offered) was not run again.
- **The live site.** Everything here is the frozen tree; the chain files name the files they were read off and those stand (K3), so the live pages should be the same, but I did not open them.
- **The readings a press away** (15,320 buttons at rest): not in the chain by its own statement, and not walked here.
- **Whether a tight card is tight on a real phone.** Measured in a desktop browser at two sizes on three books (1,579 cards), each word scrolled to the middle first; the chain's builder does not scroll.
- **The cause of the years** set beside STEP's and MACULA's rows; **how far** a row filed under several numbers reaches. Both are named as suspected.
- **The 27 books with no chain.**

## The files beside this one

| File | What |
|---|---|
| `chain-disagreements.tsv` | every disagreement, one row a word: 7,574 where the link's source is not the line's credit, 110 where the pressed link is not what the place reads |
| `chain-read-by-hand.tsv` | the 240 words read by hand: what the chain page prints, what the card shows, each link recomputed, the machine's flags, and my remark (34 words carry one; `notes-by-hand.json`) |
| `per-word.tsv` | all 14,354 words: the line and its credit, the pressed pill and its source, the line above the pills, the tags, the entry, the pills by verdict, the lines not in the chain, card against chain |
| `per-book.tsv`, `summary.json` | the counts by book and whole |
| `line-in-chain.tsv`, `chain-files-counted.tsv` | from the files alone: the line's fingerprint in the chain; what each chain file holds |
| `tight-census.tsv` | cards fitted tight and lines drawn, three books, two sizes |
| `links-with-no-number.tsv`, `pill-titles.tsv`, `pills-step-with-a-year.tsv`, `pills-respelled-sample.tsv`, `pills-unmatched-sample.tsv`, `labels.tsv` | behind findings 5, 6, 9 and «Found on the way» |
| `chain-disagreements-lifted.tsv` (empty but for its heading), `per-word-lifted.tsv`, `summary-lifted.json` | the lifted walk against the chain |
| `walk-rest/`, `walk-lifted/` | every card as read, in the clear, one file a book |
| `hand-sample.jsonl`, `hand-verify.jsonl`, `shots/` | the hand sample and the places confirmed on the page, with pictures |
| `walk.mjs`, `analyze.mjs`, `hand.mjs`, `hand-table.mjs`, `tight.mjs`, `line-in-chain.mjs`, `chainstats.mjs`, `titles.mjs`, `labels.mjs`, `rows.mjs`, `show.mjs` | the scripts, all read-only on the tree |
| `log-check-chain-book-v2.txt`, `log-walk-rest.txt`, `log-walk-lifted.txt`, `log-analyze-lifted.txt`, `log-hand.txt`, `log-tight.txt` | the logs |
