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
