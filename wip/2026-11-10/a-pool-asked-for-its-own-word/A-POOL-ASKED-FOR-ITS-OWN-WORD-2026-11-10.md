# A pool is asked for its own word (10 November 2026, late)

The first of the review's unproven findings, taken up after the underline went. The review's first reader, finding 5: "poolFor and sortPool gate and sort by `openPointed`/`openKey`, the last card's word, which closeHud never clears and which the exporter and the live line cannot set, so their pool for a key depends on which card was opened last." It is proven, mended and checked here. The tools, logs and dumps named are beside this file.

## 1. The fault

The pool of readings for a key (`poolFor`, with its sort `sortPool`) withholds, under "only this pointing", the rows whose source points the word otherwise. To do that it has to know which word it is asked for. It read that from three variables of the page (`openPointed`, `openKey`, `openVerse`) that only a card sets as it opens.

Two other callers ask the pool about words no card was opened on:

- **The line read live.** When a reader switches sources off, a word's line is the baked leader, or the baked alternate when the leader's carriers are all off. When the alternate's carriers are all off too, the page asks the store (`repaintLive`).
- **The exported file.** Each word's record is found by asking the pool for the reading the line shows (`attributionFor`).

For those callers the pool was gated by no pointing at all, or, when the last card opened happened to share the word's letters, by that card's pointing.

## 2. Proven on the live build

**The line.** `tools/probes/live-lines.mjs` switches sources off, reads every line the page marks as read live, and then opens each word's own card under the same switches. Every line is read before any card is opened. Amos, with the source of the place's reading and the four sources that carry the most lines off (`logs/p3-live-lines-amos-the-live-build.log`): of the first 859 words, 519 lines are read live. Of 120 words standing alone:

| | the live build | the new build |
|---|---|---|
| the line is the first reading the word's card has from the store | 50 | 56 |
| another reading | 11 | 5 |
| of those, an overlay's row ranks the card's reading (the owner's open call) | 6 | 5 |
| of those, no such row | 5 | 0 |
| the line reads and the card has no reading | 4 | 0 |
| bare, and the card has none | 55 | 59 |

The live build's lines: «bases» under Adonai, «Domesticated» under "from the house of", «to stage» under "in the days of", «thunders» under "the shepherds", «fugitive» where the card's first reading is «bar», «garment» where it is «full». None of those is on the word's own card.

**How far it reaches.** `tools/probes/live-lines-diff.mjs` sets the two builds' live lines side by side, word by word, for the first sixty sections of four books under the same five sources off (`logs/p10-live-lines-before-and-after-four-books.log`):

| book | lines read live | the same reading | bare on both | another reading | now bare |
|---|---|---|---|---|---|
| Amos | 519 | 217 | 200 | 79 | 23 |
| Genesis | 432 | 185 | 178 | 59 | 10 |
| Ruth | 511 | 184 | 216 | 77 | 34 |
| Psalms | 254 | 118 | 89 | 38 | 9 |
| | 1,716 | 704 | 683 | 253 | 76 |

Genesis 1:2's "face of" read «a fractional monetary unit of Ireland and the United Kingdom; equal to one hundredth of a pound». It reads «before».

A reader meets this only with several sources off: with one off the baked leader answers, with its carriers off the baked alternate. The rail's rows of sources and its shelf switches are on every book page.

**The file.** `tools/probes/export-sections.mjs` saves the file a reader gets for a verse; `export-diff.mjs` compares two sets record by record; `export-vs-card.mjs` sets a file's records beside the words' own cards.

- Amos 2:10 exported fresh, and again after one card of the verse was opened and closed (`logs/p9-export-depends-on-the-last-card.log`): on the live build 1 of 14 records changes, from Strong's (CC BY 4.0) to the concordance from Hebrew Wikisource (CC BY-SA 4.0). On the new build the two files are the same.
- Forty verses at rest, both builds (`logs/p6-export-diff-rest.log`): of 548 records 523 are the same, 10 move to another source (7 of them to another license class) and 15 to another record of the same source (the place's own reading, where the store's row is of a headword pointed otherwise: Amos 1:2's vayomar with a patah, whose store row is headed by the form with a segol).
- Those 25 beside their words' cards (`logs/p7-export-vs-card-the-25-on-the-live-build.log`, `...-on-the-new-build.log`): 4 are words whose card answers for several words. Of the other 21, the file cited the source the card credits its first reading to at 13 on the live build and at 21 on the new one.
- All 548 on the new build (`logs/p8-export-vs-card-all-548-on-the-new-build.log`): the file cites the source the card credits at 399 of the 399 words whose card is their own; 149 are words whose card answers for several.

## 3. The mend

`tools/edits/35-a-pool-is-asked-for-its-own-word.mjs`, 17 exact-text edits to `reader/zone.html`:

- `askedWord(surface, named)`: the word a pool is asked for. A caller that names its word (`opts.word`: its pointed surface, its own key, its verse) is answered for that word; with none it is the word standing open, as before, so a card's pool is the pool it was. The pointing is asked only under the word's own key: a pool asked under a headword's key holds that headword's rows.
- `poolFor` and `sortPool` read that word wherever they read the page's memory.
- The live line keeps each key's own pointed surface and the verse with its stand, and names them when it asks.
- The exporter asks an unruled line first of the pool the word's own card stands on, then of the whole pool as before, so a reading the file found until now it still finds. A ruled line goes straight to the whole pool: a ruling outranks the pointing as it outranks a switch.

## 4. A consequence, named

The file now follows the card where the card withholds an older record as pointed otherwise, and a license class can move with it (7 of 548 words in forty verses). At Amos 2:10 the file cited Strong's dictionary for Egypt and cites the concordance from Hebrew Wikisource, because the word stands in pause and the card withholds the entries filed under the ordinary form.

That led to section 6, which is larger than this fault.

## 5. Checks

- **New: `check-live-line-asks-its-own-word-v1`** (`tools/new/`). The sources switched off are read off the page's own records (the source of the place's reading, and the four that carry the most of the table's lines). V1 the page reads lines live; V2 every live line that prints is a reading its word's own card offers, and none prints where the card has no reading; V3 a line that is not the card's first from the store stands behind a reading an overlay's row ranks (counted, not judged: the owner's open call). On the live build's Amos V2 fails, 4 of 20 printing lines (`logs/p4-new-check-on-the-live-build-amos.log`); on the new build's two pages all three pass, 32 of 32 on their cards (`logs/p4-new-check-on-the-new-build.log`).
- **The same product.** `logs/p12-gate.log`: 9,403 lines on 18 pages and 54 first cards are the same on the live build and the new one. The gate moves no source switch, so this says the cards and the resting lines did not move.
- **The suite.** `logs/p13-suite.log`, run on the tree with the page change: 144 of 146. `check-nothing-unlanded-v1` is red until the change is pushed. `check-no-line-under-hebrew-v1` gave no verdict in 600 s, which is section 7. After sections 7 and 8, the checks that read the changed files pass: 12 (`logs/p23-suite-targeted.log`), then 9 (`logs/p26-suite-targeted-after-36.log`), and all 13 once more after the machine was restarted on 12 November (`logs/p27-suite-targeted-after-the-restart.log`).

## 6. Found on the way: the pointing filter withholds a word's own entry

Not caused by this change, and not changed. Under "only this pointing", where a place is spelled with its own headword's letters and is another form of that word (a construct, a pausal form, a participle), every entry headed by the dictionary's citation form grades "pointed otherwise" and is withheld, wherever some row attests the place's exact pointing.

`tools/probes/own-headword-withheld.mjs` (`logs/p15-own-headword-withheld.log`), over the 40 served works, with the zone's own headword for each place and the tools' own grade: 99,947 places are spelled with their own headword's letters; 19,197 of them are pointed otherwise than the headword; at 18,465 the filter is at work; at **18,343 places** at least one row of the word's own headword form is withheld, 1,097,389 rows in all. A floor: rows that carry no headwords are not counted. Strong's own entry is withheld at 17,773 of those places, BDB's at 16,800. At the same places the filter withholds 753,269 rows headed by other forms, which are the other words on the same letters that it is there to part, and keeps 959,379: a rule that kept a word's own entry would give back the first number and leave the second withheld.

The forms: the object marker before a maqaf (6,707 places), ben- (1,451), beit (731), ein (357), mah- (238), devar- (227), Mitsrayim in pause (185), and participles and piel forms against the verb's citation form (noten 83, oseh 72, dibber and dabber 249, tsivvah 187).

Read off the live page (`tools/probes/card-withheld.mjs`, `logs/p14-card-withheld-two-words.log`): Amos 2:10 word 5, "42 of 62 pointed otherwise, withheld", and nothing shown from the SDBH, the UBS dictionary, STEP's Brief Lexicon or either BDB; Amos 2:11 word 7, "96 of 168".

This is the owner's to rule and the corpus lane's to weigh: which vowel changes are the same word is not the page lane's to decide. The letter is `../FOR-MOSES-2026-11-10-the-pointing-filter-withholds-a-words-own-entry.md`.

## 7. Found on the way: a test browser that stops answering

The suite's one unexpected red was `check-no-line-under-hebrew-v1`: no verdict in 600 s, stopped by the runner, with nothing said.

- **Where.** Daniel's English reader, at the scroll step to 16,500 px (the first step past 16,384 px). The test browser stops answering and never comes back.
- **What it is doing.** Nothing. `tools/probes/hang-hunt.mjs` samples the processor time of the browser's processes at the stall: the browser, its drawing process and the page's process each use about one tick in 3 s. `tools/probes/pause-test.mjs` shows a running script can be paused from outside; at the stall there is no script to pause.
- **How old.** Older than this change and older than the underline's removal. The rounds are in `logs/hunt/`: 1 stall in 1,170 rounds on the build before the underline went (2a92ca6e), 2 in 328 on this tree, none in 78 on the build that was live (6aae17d8).
- **What I supposed and was wrong about.** That Daniel's Aramaic lines are read live at rest and the page was busy: 0 lines are read live at rest on either build (`logs/p17-daniel-at-rest-shipped-and-new.log`), and three builds ask the server for nothing while scrolled (`logs/p18-scroll-activity-three-builds.log`).
- **Not known.** Whether a reader's own browser can meet it. Everything seen is the headless test browser on this machine.
- **The mend, in the checks.** The two checks that scroll (`tools/new/check-no-line-under-hebrew-v1.mjs` and the new `check-live-line-asks-its-own-word-v1.mjs`) give each page a time (`PAGE_STALL_MS`, 120 s and 300 s). A stall is named, the browser is closed whole and opened again, and the page is read once more; a page unread twice fails "every page was read". Proven by giving pages too little time: every stall named and a FAIL in 66 s (`logs/p20-no-line-check-every-page-stalled.log`), a partial reading failed in 212 s (`logs/p20-no-line-check-some-pages-stalled.log`), the live-line check failed in 25 s (`logs/p21-live-line-check-every-page-stalled.log`); with their ordinary time both pass (`logs/p19-...`, `logs/p21-live-line-check-hardened.log`).
- **Left.** Every other page check waits on the runner's 600 s the same way. One guard for all of them is in the review's list (section 5 of the review's status).

## 8. Found on the way: the recount dated itself by the clock

The round run a little past midnight of 11 November with the stamp of the 10th changed one record: `data/pointing-grade-recount-v1.json`, whose every count was the same and whose `"on"` had become the 11th. The round's other records were taken off the clock on the 10th; this one was missed.

`tools/edits/36-the-recount-is-dated-by-the-round.mjs`: the recount takes the round's stamp (`--stamp`, which `round-v1.sh` passes). With none, the day the record already carries stands, so a run by hand does not re-date it; with neither, it refuses. The four cases, each run: `logs/p25-recount-dated-by-the-round.log`.

## 9. Not done

The rest of the readers' list in section 1 of the review: the pairs' ruling keys and the pair's line under the source switches, the card's drag and witness key, the failed dictionary shard asked again without a pause, the load faults, the rail's four, the search's final letters. Each wants its own proof.

## 10. The ship

The machine this lane works on was restarted several times between 11 and 12 November, before the push. Nothing on disk was lost; the 13 checks that read the changed files were run again and pass.

Pushed on 12 November 2026: `main` dc3254cf4d, `gh-pages` fb63562bab ("gh-pages follows main"). The commit message is `logs/commit-message-dc3254cf.txt`. `check-nothing-unlanded-v1` passes on the pushed tree (321 sources, all landed). SHIP_RESULT
