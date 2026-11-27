# The accuracy pass on the 39 books and the 12 dictionaries

Page lane, 27 November 2026. The owner, 26 November: «we have unlimited ai tokens. spend them on accuracy for our 39/12 and potentially figuring out which of the other 28 we hold can be reintroduced, not all of them were bad, or maybe some of them we were applying badly».

The plan is `wip/2026-11-25/WEEK-PLAN-39-12.md`; the principle `wip/2026-11-24/THE-PRINCIPLE.md`. Helpers measure and report on a frozen copy of live (main ea6e1ad08e, ship 22); nothing is mended until the lead has proven a finding on the page, and every mend ships with the usual gate.

## Wave 1 (started 27 November, 00:10 UTC)

| Helper | Pass | Brief |
|---|---|---|
| A | The departures list (every rule of ours counted two ways), the homonyms, the 124 words whose line is not STEP's | `briefs/A.md` |
| B | The footing: every source's sha256 chain | `briefs/B.md` |
| C1 | STEP's TAHOT and TBESH, and MACULA, each as it serves itself | `briefs/C1.md` |
| C2 | Strong's and the two Brown-Driver-Briggs, each as it serves itself | `briefs/C2.md` |
| E | The sources off by default, held or refused: which could come back, and which we applied badly | `briefs/E.md` |
| F | The text's own marks, and whose each division of a word is | `briefs/F.md` |

`COMMON.md` is what every helper reads first.

## Wave 2 (started 27 November, 00:28 UTC)

| Helper | Pass | Brief |
|---|---|---|
| G | The chain pages of the twelve minor prophets, link by link against the cards | `briefs/G.md` |
| R, Ruth | The reading loop's pilot: Ruth read whole on the page | `briefs/R.md` |
| R, Genesis 1–5 | The reading loop's pilot: Genesis 1 to 5 read on the page | `briefs/R.md` |

Each pilot reader also reports on the brief and on how many words an honest hour covers, so the loop over all 929 chapters can be planned.

## To follow

- C3a (the UBS dictionary, the SDBH, Davidson) and C3b (the Lexical Index, UHAL, BiblicalTools): `briefs/C3a.md`, `briefs/C3b.md`. They start when C1 and C2 report, with what those two learned.
- The reading loop over the 39 books, in batches, with a ledger here of what was read and what was flagged.

## Beside the pass

- **The card moves when a reader presses another reading** (`../card-hold/`): the record at the card's foot takes a different height per reading, and the card, held by its foot at its word, moves its top and its pills by that amount (2 to 20px on 7 of 7 cards traced; the check that holds the law is red on live). A builder is mending it in a sandbox.
- **Ship 23** is being built in a sandbox: STEP's pieces at the 30 places where STEP writes our spelling, the read form on the 17 written-and-read pairs, and no line under the 8 words written and not read (`../FOR-MOSES-2026-11-27-the-lines-step-does-not-lead.md`, `the-124-words.md`).

## A correction: fourteen words stand under no line

The plan's baseline (`../../2026-11-25/WEEK-PLAN-39-12.md`) said the thirty-nine books hold 305,417 words, none bare. Wrong on both counts: **305,431 words, 14 under no line** (`lead/no-line.txt`; each opened on the page, `lead/no-line-cards.json`: a blank line and a card with no reading). I had read the reading a zone stores for a word, not the line the page draws; the page's own tally in `data/resting-lines/` had the figure all along.

- 7 are written-and-read pairs where the spelling bridge gives STEP's pieces and my tool skipped pairs. Ship 23's 17 pairs include all seven.
- 7 are places the bridge's pin holds for the corpus lane's call 4 (our one written word, two in STEP's text). The hold keeps a line «as it rests», and at these seven nothing rests. Ship 23 adds the rule: a held place takes the bridge's pieces where the word rests under no line. Four of the seven are בַּלְאֻמִּים in Psalms, where STEP's words are «not + peoples» and the word reads «among the peoples»: put to the owner and to the corpus lane (`../FOR-MOSES-2026-11-27-fourteen-words-under-no-line.md`).

## The reading loop's parts

`lead/loop-parts-4000.tsv`: the thirty-nine books cut at chapter ends into 86 parts of about 4,000 words (`lead/loop-plan.cjs`; 110 parts at 3,000, 64 at 6,000). The size is fixed after the two pilots report.

## Reports in

### B, the footing (`B/findings.md`)

No recorded hash is wrong (1,551 files hashed again). The 39 books are the restore's text byte for byte: each served zone's words, rejoined, hash to the rights record's `restore_surface_sha256`, 39 of 39 (the lead ran it again: `lead/surface-rehash.cjs`). Six of the twelve dictionaries were followed back to their provider and match. The gaps are in what holds the chain, not in the bytes:

| # | Gap | Whose | Standing |
|---|---|---|---|
| 1 | No check hashed a book's text again; the check read a flag written on 6 September | page lane | **mended for ship 23**: `check-restore-serve-v1` gains L5 (rejoin and hash the served words) and L4 hashes the rights record; proven both ways (`../ship-23/tools/patch-restore-check.py`: 39 zones pass, a zone with one changed letter passes L1 to L4 and fails L5) |
| 2 | No dictionary's file as received is on the store; one pin names a folder that is gone | corpus lane (the files); page lane (the path map's check) | asked of Moses; the check is the page lane's to widen |
| 3 | Five served stores carry no pin (412 files, 208.5 MB) | page lane | to build: a manifest per served store |
| 4 | Received-file hashes only in relay receipts; nine families have none | both | asked of Moses for the nine |
| 5 | `pins-not-kept-v1.json` out of date and unread | page lane | to build |
| 6 to 8 | The dump's hash, `declarations_sha256`, the store's writer | corpus lane | asked of Moses |

Letter: `../FOR-MOSES-2026-11-27-the-footing.md`.

### C1, STEP's TAHOT and TBESH, and MACULA, each as it serves itself (`C1/findings.md`)

The helper could not write its findings file (the file tool refuses report files from a helper); the lead saved its hand-back as `C1/findings.md` (`lead/save-handback.cjs`).

**The words are the sources' own.** STEP's pieces under 304,463 of the 304,484 words that carry them are TAHOT's translation column byte for byte; the « + » stands exactly at TAHOT's slashes; all 139,204 served rows of the three sources are in their source. What is not the sources' own is which readings a card offers at rest, whose name and year a reading carries, and a few marks.

The lead opened eight of the cited cards on live (`lead/c1-verify-rest.json`); each was as the helper said.

| # | Finding | Count | Whose mend | Seen by the lead |
|---|---|---|---|---|
| T1 | The signs switch (off by default) counts STEP's square bracket as a sign; STEP's own key says bracketed words «are best included in a translation». A reading that holds one is not offered as a pill | 20,048 of STEP's 91,301 served rows (19,193 for the square bracket alone) | page lane; the owner's ruling of 3 October («preselect it off for now») is what it revisits | Genesis 15:9 word 7: no «[is] a goat»; Exodus 22:9 word 6: no «donkey[s]». `zone.html` line 3684 |
| M3 | MACULA gives each English at one place («in its specific context»); the card offers every rendering of the same letters and entry at every place | 30,062 of MACULA's 45,095 served rows are one-place renderings; 4,397 of forms that stand at 50 places or more | page lane, on the owner's call (it changes most cards) | Micah 3:3 word 12 «just + as» offers MACULA's «(happy)» |
| B1, M1, T2 | The store keeps one row for the same words and credits one source, so a reading of one of the twelve stands under another name | TBESH 6,688 of 9,804; MACULA 6,796 of 51,985; TAHOT 5,580 of 76,234; 484 stand only under a source that is off by default | corpus lane (one row per key, text and source); page lane until then (a reading rests open when any source that gives it is open) | Joel 4:13 word 10: TBESH's «wine press» is not a pill (Strong's «wine-press» is) |
| M2 | A reading that holds « ~ » is not offered; MACULA does not declare the sign | 1,862 rows | page lane, with T1 | by the helper, 13 cards |
| T5 | STEP's tag is not carried where our text spells the word otherwise | 1,091 words | corpus lane's rule («No tag is written»); asked | by machine |
| Y | A row prints an older source's year under its own source's name: «STEP … · wording 1890» | 587 rows | page lane | Deuteronomy 1:12 word 4 «a burden»: «1890 · STEP …» |
| B5 | TBESH's row for the place's own tag is withheld as a name | 576 places by machine, 1 read | page lane, after a measure | Joshua 12:7 word 18: the line is right («Halak», MACULA's); TBESH's own row is withheld |
| T6 | The sign rule is uneven: a piece of two signs prints («<in> <the> + it», 336); a sign-only word prints where it stands free (598) and not where a maqaf ties it (6,593); the lone «!» prints («you should die + !», 708 lines) | as given | page lane, on the owner's call for «!» and the sign-only word | by the helper |
| T3 | At the Aramaic ending TAHOT writes its English against its own order | 140 places; at 62 STEP's noun is not among the root's readings | corpus lane | Daniel 2:20 word 10: the line «antiquity», no such pill |
| B2 | Seven TBESH rows whose slash means «or» print with TAHOT's joiner | 7 rows, 19 places at least | page lane | 2 Chronicles 32:1 word 16 «to break up + open» |
| T4 | STEP's brackets are taken off at 13 of the 28 read forms of several words | 13 places | corpus lane (the read-words list) | by the helper, 3 cards |
| C | MACULA's license asks for set wording and a link; STEP asks for a link to its site; neither is on the card | 2 sources | page lane | by the helper |

Letter: `../FOR-MOSES-2026-11-27-step-and-macula-as-served.md`.

## The owner's direction, 27 November

«im the same everytime, i am not married to old versioning. if for example we have 85 errors in STEP and you can easily fix it by: 1. redownloading, 2. reapplying our existing pipeline; as a faster solution thats fine too i dont care about directionality, i see getting here as the discovery».

Taken as: the fastest correct route wins; a source's newer file replaces our pinned one where it mends a thing; old rulings and old versions are not kept for their own sake; either lane may do the work. So the three calls put to the owner that day go ahead (STEP's bracketed readings back on the cards; another place's rendering a press away; the bare «!» hidden and the object marker printed as STEP prints it).

**STEP redownloaded the same hour** (`../step-latest/`): STEPBible-Data's latest revision (5de0a47f) against the one the bridge was built from (b86d26cd). In the data STEP changed exactly the four Psalms places put to the owner that morning (44:15, 57:10, 108:4, 149:7): two rows «not» and «peoples» became one row, «among the/ peoples» (H9003/{H3816}), the old reading kept as a variant. Ship 23 lays STEP's latest row there. Nothing else in the data moved (one white-space cell); the license heading changed (it now names AI servers, drops «without changing the data», and asks for credit to Tyndale House and STEPBible.org with a link to STEPBible.github.io/STEPBible-Data). The slips the passes found («ofK:», «opressors», «God of» + «spring», Ruth 1:6 «if») are still in STEP's latest file: a list for STEP.

### A, the rules counted two ways and the homonyms (`A/findings.md`); the two pilot readers (`R-ruth/`, `R-genesis-1-5/`); E, the sources off by default (`E/findings.md`)

Each helper's hand-back was saved by the lead as its `findings.md`. The lead opened the cited cards on live (`lead/r-verify-rest.json`, `lead/e-verify-open.json`): Genesis 1:3 word 5, the line «and + there was», the card's pressed pill 17th of 81 and the first pill «beacon»; Genesis 1:2 word 9, «[the] spirit of» 53rd of 57; Ruth 1:1 word 1, «it was» 60th of 81; Seth's card (Genesis 4:25) with «foundation», «buttocks» and «six»; «be fat» on «he created» (Genesis 1:1); Ruth 1:1 word 4 «the + judges» showing Jastrow's «judgments» where the same word bare at Deuteronomy 16:18 does not.

**The lines are nearly clean.** Ruth: 5 of 1,296 read wrong, 4 of them where the texts differ (ship 23's ground) and 1 STEP's own («if» for כִּי at 1:6). Genesis 1 to 5: no line reads against the Hebrew in 1,815 words.

**The cards are where a reader stops, and one weakness runs through every report: the blocks of a divided word are second-class.** 145,023 of the 305,431 words are divided, and their card opens on a piece. There:

| What is missing on a piece's block | Count | Report |
|---|---|---|
| The reading the line prints does not lead: the block falls to oldest first, and STEP, which states no year, sorts last | first pill is the line's at 127 of 692 divided words in Ruth, 205 of 866 in Genesis 1 to 5; 145,559 lines have more than one piece | both readers |
| The pointing grade and the stem are not asked: a row with no entry is bound by nothing (the owner's Isaiah 1:22 example, «sproutings» on «dross») | 3,039,636 placings of the sources off by default stand on a core piece; 2,316,693 would be withheld | E |
| The entry gate is not asked on a prefix or suffix block: the zone carries STEP's tag for the core piece only | 12,271,895 placings on 162,177 blocks; the article opens «whether, direct, indirect», the suffix «our» on «habitation», «me» on «Yôdh» | A, both readers |
| A block's own reading is not offered where it is a sign: וְאֵת opens on «self» | 4,066 words | both readers |

**The other findings, by size:**

- **Homonyms.** UBS's and the SDBH's rows carry every number of their lemma, so «mosquito» stands on «so» and «buttocks» on Seth (6,856 and 3,786 rows name more than one number). A row with the place's number and no letter passes where STEP parts the number by letter: «be fat» on «he created» (2,814,272 placings at letters A to F).
- **Pills that are not readings.** The unabridged BDB's «Mensch», «verb», «dative», «seems preferable» (368 cards in Genesis 1 to 5); Strong's lists cut inside his own parentheses («like)», «( ) day») and his «Compare 802» riding on the last reading; UBS's pointers («witness (read …)»); BDB's letter names leading a suffix block.
- **The signs switch**, as C1 found, and unevenly: 6,593 object markers tied by a maqaf print nothing; the plain list under a chapter prints an empty item with a footnote number for each of them.
- **The piece class withholds the unabridged BDB's article** on all 22,773 article blocks (one line of `zone.html`).
- **The year and the credit** of a folded row, as C1 found: 130 pill titles in Ruth alone.
- **A slash printed as STEP's joiner** on 310 rows of other sources (UBS's «and/or»).
- **The names gate at gentilics** (1,138 placings): BDB's «Amorites» withheld at «the Amorite».
- **The maqaf pair's options** (the owner's example of 26 November): gone at rest; under the «as written» switch the pair is still offered at 39,966 chains no dictionary files.
- **The page's own words:** «13 dictionaries» with Strong's counted twice; «57th century AM»; a full working label on a chip; «CHAPTER TITLE no name is on record»; the foot of the page.

**The sources off by default (E): none can reopen as it is; two can after the piece mend.** English Wiktionary's Hebrew entries, by its rows of the place's own entry only (86% right in the sample), and Wikidata's lexemes (89% once the piece is graded). STEP's Expanded Strong tags (held) are the best thing we hold back, and must be served at their own verse and word, never by letters. Four need the corpus lane first; the rest stay off. The table: `E/findings.md`.

**The reading loop's size.** Both pilots: 2,500 to 3,000 words an hour with the tools in hand; the card faults repeat by cause and are counted by machine after the first books, and the lines are almost wholly STEP's own bytes, already checked by machine for all 39 books (C1). So the loop follows the mends: the causes above are mended first, then every card is walked by machine for them, and the hand reading goes to the lines.

## What the reports turned into (27 November, 01:40 UTC)

| Work | What | Where | State |
|---|---|---|---|
| Ship 23 | STEP's pieces where STEP writes our spelling (30), on written-and-read pairs (17), on held places under no line (7, the four Psalms places from STEP's latest file); no line under a word written and not read (8); the check that hashes a book's text again | `../ship-23/` | builder at work |
| The card holds | A press of another reading does not move the card | `../card-hold/` | builder at work |
| Ship 24 | A piece of a divided word is served as a whole word is | `../ship-24/BRIEF.md` | builder at work |
| Ship 25 | Each source's own marks, year and credit | `../ship-25/BRIEF.md` | builder at work |
| U | Each provider's latest file against our pin | `briefs/U.md` | helper at work |
| C3a | The UBS dictionary, the SDBH, Davidson; UBS's numbers per base form, from the source | `briefs/C3a.md` | helper at work |
| C2, F, G | Strong's and the two BDBs; the text's own marks; the chain pages | `briefs/` | helpers at work |
| To follow | The footing mends; other-place renderings a press away; the homonyms by BDB's own entry; pills that are not readings; C3b; the line readers | | queued |

Each builder hands back a patch against live main (ea6e1ad08e); the lead applies them in order on the ship tree, runs the round, the gate and the suite, and ships each as its own ship.

### C2, Strong's in two editions and the two Brown-Driver-Briggs, each as it serves itself (`C2/findings.md`)

**The bytes are right.** Of 196,520 served rows, 196,386 are exactly a field of their source through the declared steps; nothing is respelled; the three source files hash to what the receipts name. The trouble is in which bytes became readings, which marks are honored, and where a reading shows. The lead opened four of the cited cards on live (`lead/c2-verify-rest.json`); each was as reported.

| # | Finding | Size | Whose mend |
|---|---|---|---|
| 1 | **A source filed by entry is found by letters only.** At an inflected word the entry STEP names is the source's own, and its rows do not come: Amos 7:12 word 6 «go» shows nothing from Strong's (Open Scriptures) or either BDB | 116,980, 114,216 and 111,091 words | ship 27 (task 175) |
| 2 | Strong's «×» and «+» renderings are not offered at rest | 15,688 and 752 readings | stays, by the owner's ruling of 3 October: they hold only in a phrase. «(+) word» and «+ word» are treated alike in ship 25 |
| 3 | The Open Scriptures file lost Strong's «+» (39 written; the Wikisource edition has 539): signed renderings print plain. Genesis 49:24 offers «carbuncle» and «mason» as readings of «stone» | 352 readings at 158,412 pill places | ship 25 if it can be held to the sources' bytes; else the next |
| 4 | Strong's condensed forms print condensed: «(fore-) father(-less)» | 11,064 and 1,154 readings | for the owner: an expansion printed beside the source's text |
| 5 | The fold, measured for these four | 4,388 of the unabridged BDB's 12,891 glosses stand only under another name | corpus lane |
| 6 | The unabridged BDB's italics are all taken for readings: «preposition», «es gibt», BDB's remarks, a cited verse's wording at other verses | 10,840 + 742 + 27,276 pill places | ship 26 |
| 7 | The Open Scriptures BDB's tag breaks words («we», «a», «set» for sunset) and takes in root meanings («fear» on «these») | 2,450 + up to 12,008 | ship 26 |
| 8 | Wikisource rows cut where Strong did not: his etymology, his note, a piece inside his bracket («like)» at 3,555 places) | 8,397 + 5,773 + 4,367 + 7,224 | ship 26 |
| 9 | Any square bracket counts as a sign | 22 readings at 12,264 places | ship 25 |
| 10 | Strong's pointer by bare number rides on the last rendering («Levi. See also 3879, 3881») | 253 readings at 13,572 places | ship 26 |
| 11 | A credit line with another source's year | 2,010 rows | ship 25 |
| 12 | The declarations: one ledger says Strong's key was not found while its sister quotes it; «×» is declared «not a plain rendering» against Strong's words | 69 of 181 shapes «unverified:» | corpus lane |
