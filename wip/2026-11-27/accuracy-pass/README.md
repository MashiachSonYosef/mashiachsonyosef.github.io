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
