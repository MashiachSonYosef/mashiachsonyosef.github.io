# Genesis 1–5 read on the page: findings

Read on the frozen tree (main at ea6e1ad08e), 27 November 2026. Nothing was changed and no server is left running.

## How it was read

- **Lines:** all 1,815 words of the 138 verses, read from `data/resting-lines` beside the Hebrew and STEP's tags.
- **Page check of lines:** the line the page draws under every word was read from the chapter page and compared with the data.
- **Cards by machine:** every word was pressed on the page and its card recorded (name, blocks, pills with sources, pressed pill, record shown).
- **Cards by eye:** 242 cards, being every tenth word (181) plus 61 doubted words. On these, every other block was pressed too.
- **Source bytes:** STEP's file and the Open Scriptures Strong's file were read where another helper had them on disk.

## Summary table

| # | Finding | Words here | In the 39 books | Class | State |
|---|---|---|---|---|---|
| 1 | A card of a word of several pieces buries the reading the line draws | 661 of 866 | about 145,000 such words | rule of ours, fired with nothing to decide | outcome verified on the page; mechanism read, not run |
| 2 | UBS and SDBH readings of another word stand on the card | 174 read; 549 upper bound | 6,856 UBS rows, 3,786 SDBH rows | gate reconciles, but the row's numbers are the lemma's | verified on the page and in the store |
| 3 | BDB unabridged pills that are not readings | 368 | not counted | unknown until the source file is read | verified on the page; cause suspected |
| 4 | Strong's pieces with broken or empty brackets | 86 | 225 store rows | source's own answer | verified in the source file |
| 5 | Nothing drawn under אֶת־ in a maqaf pair | 67 | 6,593 | declared display rule; for the owner | verified |
| 6 | STEP's reading of another form of the word on the card | 63 | not counted | ruled rule's consequence; for the owner | verified on the page |
| 7 | UBS «/» printed as « + » | 37 | 310 store rows | rule of ours, fired with nothing to decide | verified |
| 8 | Card opens on another reading where STEP's piece is a sign | 24 | 4,066 | rule of ours, overrides STEP's answer | verified |
| 9 | «God of» + «spring» | 2 | 6 | source's own answer (STEP's error) | verified in STEP's file for Genesis |
| 10 | Two signs in one piece are drawn | 1 | 205 | rule of ours misses its own case | verified |

## Findings

### 1. The card of a longer word buries the line's reading (661 words)

- **Seen:** on a one-piece word the pressed pill, which is the line's reading, is the first pill at 949 of 949. On a word of several pieces it is first at only 205 of 866.
- **How far down:** it is 10 or more down at 420 words and 20 or more down at 237. The middle case is 10th and the worst is 203rd.
- **Examples:**
  - 1:2 word 9 וְרוּחַ: «[the] spirit of» is 53rd of 57; the card opens on «mind, wind, breath, exhalation».
  - 1:3 word 5 וַיְהִי: «there was» is 17th of 81; the first pill is «beacon».
  - 1:10 word 5: «[the] collection of» is 21st of 22; the first pill is «hope».
  - 2:7 word 15: «a creature» is 123rd of 123.
  - 4:9 word 11: «[the] keeper» is 96th of 101.
- **Other blocks, pressed by hand:**
  - The article ה shows «the» 51st of 51, behind «whether, direct, indirect, ob, seeing», at 15 of 27 presses.
  - מ shows «from» 107th of 107.
  - The suffix נו opens with «habitation», and י with «Yôdh».
  - ו and ל lead correctly with «and» and «to».
- **Cause:** `sortPool` in `zone.html` (lines 9592–9614, with 9482–9484). The place's own reading leads only where the block is the whole word. A block of a longer word falls to oldest first, where STEP has no year and sorts last.
- **Proposed mend:** on every block, the reading STEP gives that piece at this place leads the pills, as it does on a one-block word.
- **Data:** `pressed-position.tsv`, `prefix-blocks.tsv`.

### 2. Readings of another word from the UBS dictionary and the SDBH (174 read, 549 upper bound)

- **Seen on the page:**

| Card | Reading of another word |
|---|---|
| Seth (4:25) | «foundation», «buttocks», «six», «the fleshy backside of a human body…» |
| כֵן «so» | «pedestal», «base», «mosquito», «a small flying insect…» |
| אֵת, object marker (93 cards) | «mattock», «with», a mattock definition |
| Ham | «father-in-law», «hot» |
| Abel | «breeze», «worthless idol», «futility» |
| Cain | «spearhead» |
| Eden | «delightful things» |
| Eve | «settlement» |
| Enosh | «human being» |
| אַף | «nose», «nostrils» |
| אַיִן | «from where?» |
| «ground» | «Adamah» |
| «onyx» | «Shoham» |
| «helper» | «Ezer» |
| «alone» | «linen», «pole» |

- **Cause:** in the store every UBS and SDBH row of a lemma carries all the lemma's Strong's numbers. For example, every row under כן, the mosquito's included, carries H3651, H3652, H3653 and H3654. The entry gate keeps a row that holds one of the place's numbers, so each row passes at each of the lemma's words.
- **Count:** 6,856 UBS rows and 3,786 SDBH rows name more than one number. 549 of the 1,815 cards here carry such a pill, which is an upper bound because some share a meaning.
- **Proposed mend:** give a UBS row the numbers of its own base form. Or, where UBS names the verses of a sense (the page already holds UBS's pick per place), withhold the rows of a base form UBS does not place here.
- **Data:** `ubs-sdbh-rows-of-several-numbers.tsv`.

### 3. BDB unabridged pills that are not readings (368 cards)

- **Seen:** 483 distinct pills from this source stand on 856 cards. I read the whole list. At 45 blocks some are not readings:
  - **Other languages:** «Mensch» (אָדָם), «ašru», «quod» (אֲשֶׁר), «dass» (כִּי), «de chez» (אֵת), «Morgen, morgen» (בֹּקֶר), «dicendi» (כֵּן), «terminus a quo» (מִן), «pascere», «ficus carica», «anstatt dass», «hoch am Tage».
  - **Grammar labels:** «verb», «dative», «adverb», «preposition», «demonstrative», «Plural intensive», «Compounds».
  - **Editorial phrases:** «seems preferable», «dispensed with», «very anomalously», «less often», «note here», «other numerals».
  - **Fragments:** «the», «true», «Yahweh is» on אֱלֹהִים (65 cards); «that (belongs, belong» and «belonged) to» on אֲשֶׁר.
  - **Another word:** «burning», «branding» on the conjunction כִּי (29 cards).
- **Cause:** the store's rows for this source. I did not read its source file, so whether the file tags these as glosses or our cut makes them is not known.
- **Proposed next step:** the BDB unabridged unit of pass 5 compares these rows with the file.
- **Data:** `bdb-unabridged-pills.tsv`.

### 4. Strong's pieces with broken brackets (86 cards)

- **Seen:**
  - «like)» on 59 cards of הָיָה.
  - «( ) day» on בֹּקֶר; «( ) arrow», «( ) man», «( ) people» on בֵּן; «( ) army», «( ) battle» on צָבָא.
  - «two) time(-s)», «times)», «third-story cell)».
  - «hypocrite», «common sort» and «postage» stand as plain readings of אָדָם and בֵּן.
- **Cause, verified in the Open Scriptures file:** the file itself reads «committed, like)», «( ) day», and «× another,   hypocrite,   common sort». The plus sign is gone in the file and a space stands in its place. The Wikisource edition keeps «+ hypocrite».
- **Class:** the source's own bytes, cut at commas by the declared steps. Not a fault of ours.
- **For the owner:** whether a piece whose brackets do not pair should stay joined to its neighbors.
- **Data:** `odd-pills.tsv`, `store-scan.json`.

### 5. Nothing drawn under אֶת־ (67 words)

- **Seen:** the object marker reads «<obj.>» at the 3 places it stands alone (1:1, 2:11, 2:13) and nothing at the 67 places a maqaf joins it to the next word. The card names «<obj.>» at all 70.
- **Cause:** `zone.html` 13672–13678. Under signs off, a word of a maqaf run that is a sign alone becomes a gap beside the other word.
- **Note:** the owner's ruling of 3 October («the 4th word of genesis loaded blank») covers the lone word. The comment for the run cites no ruling.
- **Recurs:** 6,593 words in the 39 books.

### 6. STEP's reading of another form on the card (63 cards)

- **Seen:** «after + me» and «behind + me» on אַחֲרֵי «after»; «days + my» on יְמֵי; «brother + my» on אָחִיו «brother + his»; «father + my» on אֲבִי; «life + my» on חַיֶּיךָ.
- **Cause:** the entry gate keeps a row of the word's own entry whatever its points, so STEP's row for the suffixed form stands.
- **Class:** a consequence of a ruled rule (13 November). For the owner to judge.
- **Data:** `whole-word-pills-on-a-piece.tsv`.

### 7. UBS «/» printed as « + » (37 cards)

- **Seen:** «…of a high quality and + or a pleasure to look at» on טוֹב. Also «him + her», «Canaan + Israel», «s + he».
- **Cause:** `spanJoin` in `zone.html` 3802–3806 prints every «/» as « + », which is STEP's piece divider. The store holds UBS's «and/or» as written.
- **Count in the store:** 259 UBS rows, 47 TBESH rows and 4 others hold a slash between letters.
- **Proposed mend:** split on «/» only for the sources whose declaration says «/» packs pieces.

### 8. The card opens on a reading that is not STEP's (24 words)

- **Seen:** at וְאֵת, אֹתָם, אֹתוֹ and אֹתִי (23 words), STEP reads «<obj.>» for the block אֵת. The card opens with «self» pressed and shows Strong's record «properly, self…». At 1:17 word 2 the line reads «them» and the card opens on «self».
- **Also:** at מֵעַל (1:7) the card presses «over» where STEP reads «<above>». Pressing the article where STEP reads «<the>» gives «whether» at 6 of 27 presses.
- **Contrast:** on the one-piece אֵת the pill «<obj.>» stands and is pressed.
- **Cause:** `zone.html` 12858. Under signs off, a sign reading keeps its pill only where it is the reading the card opened on, and a block of a longer word opens on the first reading left.
- **Recurs:** 4,066 words in the 39 books (3,504 with אֵת, 339 with אוֹת).
- **Proposed mend:** a block's own reading at the place keeps its pill and is the one pressed, whatever sign it carries.
- **Data:** `pressed-not-steps-reading.tsv`, `hidden-core-pieces.tsv`.

### 9. «God of» + «spring» (4:25 words 15–16)

- **Seen:** the line reads «he has appointed · for <the> + me · God of · spring · another». The card of זֶרַע opens on «spring».
- **Cause:** STEP's file itself writes `Gen.4.25#15 God of` and `#16 spring` for God + offspring.
- **Recurs:** 6 places by the page's data: Genesis 4:25, 19:32, 19:34; 1 Samuel 1:11; Isaiah 1:4, 57:4. STEP's file was read for the three in Genesis only.
- **Class:** STEP's own error, served faithfully. A report to STEP is the mend; a listed departure is the owner's call.
- **Data:** `offspring-cut.tsv`.

### 10. Two signs in one piece (3:3 word 13)

- **Seen:** «<in> <the> + it» is drawn in full, while a piece that is one sign alone is left undrawn.
- **Cause:** `signOnly` in `zone.html` 3687 knows one sign, not a run of two.
- **Recurs:** 205 words in the 39 books.
- **Proposed mend:** a piece made only of signs is a sign piece.

### The page's own words

- The top panel says «13 dictionaries» and «13 SOURCES, ALL ON»; Strong's is counted twice.
- Its shelves read «57th century AM», «58th century AM», «no year given».
- Davidson stands under «no year given». The page lane's own held list records 1848 as held, so this is known.
- «concordance hud» is working language.
- One chip prints a full working label: «Kaikki English Wiktionary source-explicit non-Hebrew-language Hebrew-script translation tables».
- Every chapter heading says «CHAPTER TITLE no name is on record».

### STEP's own style where a reader stops (not flagged)

- «to <the> + you», «in <the> + it»: 24 here, 3,240 in the 39 books.
- «you should die + !»: 2 here, 714 in the 39 books.
- «and + water» for אֵד (2:6); «to + only + him» (2:18); «from + to + before» (4:16); «it» for אֹתוֹ (1:27).
- «fif-» «teen»; «there-» «-fore».

## What I read and found clean

- **Lines:** 5 chapters, 138 verses, 1,815 words. The line the page draws equals `data/resting-lines` at 1,815 of 1,815, every one credited to STEP's pieces.
- **Names and words:** none swapped. Checked: שֵׁם and Shem, חָם and Ham, אָדָם as humankind, the man and Adam, אֵת as «with» at 4:1, 5:22 and 5:24, and all proper names.
- **Grammar:** no person, number or tense reads against the Hebrew.
- **Cards:** 1,815 opened. All settled, each with one pressed pill; the card names the line's reading at every word; there was no page error. The middle settle time was 0.33 seconds.
- **Chapter pages:** `/genesis/1/` to `/genesis/5/` each open at their first verse with no failed request.

## What I could not check, and why

- The English reader, the word senses and concordance switches, export, and «the record, whole»: not opened.
- The 17 sources off by default: out of scope.
- Long pill lists in chapters 2–5: read to about 1,200 characters by eye; the machine checks covered every pill.
- STEP's file for the three places of «spring» outside Genesis, and BDB unabridged's file: the first download was gone when I returned, and the second was not on disk.
- **Outside my part, suspected only:** in Daniel the zone gives an Aramaic noun's letters the reading «<the>» and its ending א the English (2:38 דַהֲבָא, 3:26 אֱלָהָא). 141 places have a core piece reading «<the>». Not opened on the page.

## On the brief

- **What helped:**
  - The list of what to flag.
  - The line «do not flag STEP's own style».
  - The resting-lines pointer; reading lines from data and proving them on the page by machine was fast and exact.
- **What was unclear:**
  - Which block of a card to read. The card opens on the core piece only.
  - That a pill's source is its oldest carrier, not the line's credit.
  - Which years are already held.
  - Whether a helper may write findings.md.
- **What to tell a reader of a longer part:**
  - Scribal marks are words in the markup; skip them or each press waits 25 seconds.
  - A paseq shifts entry numbers against word numbers.
  - A maqaf pair's drawn line lives on the pair, not on the word.
  - Name the ten causes above so the reader counts them and moves on.
  - Print a pill list once per block.
  - Add STEP's «<the>» before a pronoun, «+ !» and «¿» to the style list.
- **Pace:** this part took about 40 minutes of clock, with the browser running 17 minutes for 1,815 cards (0.57 seconds a word). With these scripts standing, 2,500 to 3,000 words an hour is honest; a first part without them is nearer 1,800. One browser opens about 6,300 cards an hour, so the 305,417 words need about 48 browser hours.

## Data files (in the work folder)

- **Flags and lines:** `flags.tsv`, `lines-gen-1-5.tsv`, `read.txt`.
- **Cards:** `cards-0-137.jsonl`, `card-checks.tsv`, `pressed-position.tsv`, `prefix-blocks.tsv`, `pressed-not-steps-reading.tsv`.
- **Pills:** `odd-pills.tsv`, `bdb-unabridged-pills.tsv`, `whole-word-pills-on-a-piece.tsv`, `ubs-sdbh-rows-of-several-numbers.tsv`.
- **Counts across the 39 books:** `line-pattern-counts.json`, `hidden-core-pieces.tsv`, `offspring-cut.tsv`, `store-scan.json`.
- **Page:** `chapter-pages.json`, `shots/` (pictures and `notes.json`).
- **Scripts:** beside the data, in the same folder.
