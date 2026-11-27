## Builder H2, cut 8: S/s16 brought up to the eighth cut, cuts 5 to 8 in the card's one block, proved again, pictures retaken (nothing committed, pushed or shipped)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

**Summary:**
- Every proof you asked for passed.
- The card no longer fetches the record for the words at a citation. Each citation's italic runs now carry their kind in the page files, so the card reads them there.
- The `say` and `why` hooks are gone.
- Six new laws are in the one-place check, P10 to P15. I also reworked P8. Each of those seven fails on a spoiled copy.

**Three things I need you to know:**
1. **The ‡ gloss is quoted per run.** Your edit put one «» around all the gloss runs joined together. I quote each run on its own, as everywhere else on the card. P11 found the case at Isaiah 38:13: «be even, smooth», «agree with, be like, resemble» would otherwise have printed as one quoted meaning.
2. **I changed one check.** `check-place-answers-page-v1.mjs` builds each line again from the record (`lineAgain`). It now builds each run as [words, kind], the same way the projection does. G6's law is unchanged: the line built from the record must equal the file, and that now holds the kinds too. Nothing was loosened.
3. **I deleted `S/s46w/h2-before/`.** It was my copy of the first builder's four files as found, and the last hand-back lists it. `zone.html` as found survives as `S/s46w/logs/zone-diff-as-found.patch`. The first builder's `place-card-v1.mjs` and its check as found are no longer on disk.

### 1. What moved and why

**Tools brought over.**
- I copied the 7 named tools from S/s14 into `S/s16/reader/tools/`, each byte-identical (checked with `cmp`). I did not copy S/s14's `place.html`.
- `make-place-answers-v1.sh S/s45w/fetched` ended «everything holds» (exit 0, 198 s).
- **Pins:** all four PIN.json files were byte-equal to S/s14's:
  - joined 4fe7034f28306c53…
  - places 641953e29f93…
  - entries f307d9c101b3…
  - page e54e17f6e846…
- **Comparison tool:** exit 0. Of 305,431 words, 305,290 are equal and 141 differ, exactly the list.

**The block** (`tools/place-card-v1.mjs`, now 621 lines). I applied the meaning of all 9 edits:
- `unabridgedWhere` places each line: the stem with its point's labels; «Qal, before its numbered senses» in a stem's own head; the labels or «the opening» under no stem; the label as written where it names another stem.
- `drawUnabridgedHere` draws the † and ‡ marks, the stray-label sentence, the † sentence once, and one ‡ sentence per paragraph.
- `pairSentence` is called in `draw`.
- `unabridgedSays` gives the language sentences (from `ol`, and `t.lg` else `lg`) and the numeral sentences (from `on` and `nm`), including the one under a record.
- The cited key now covers a stem's own head (`b[12]`).
- A stem heading starts its own unit in the whole record (`isCited`), with `.unit.stem` added to the style rules.

**Removed from the block:**
- The `say` and `why` hooks: `dataSays`, `say()`, `whyOf`, `sentences`, `labelsOf` and their comment. The comment now says only the record's language and the citation's place come from the data.
- `unitOf`, `CITED_KINDS`, and the record fetch with its wait.

**Kept:**
- `b[4]` and `b[5]` are read only inside `unabridgedWhere`.
- `(f.t || {}).say` (STEP's sentences) is as it was.
- «Special uses:» is left as the file classes it, for the owner.

**Where I departed from the edits' letter:**
- A citation's runs keep the italics rule: only the entry's meaning or an opening goes inside «», anything else prints plain after «in italics in the record:». The kinds now come from the file.
- The ‡ gloss is quoted per run (see the top of this report).
- `pairSentence` compares the first 13 fields as JSON, not with `join("|")`, because joining would flatten the new [words, kind] pairs. The meaning is the same.

I carried the block to `place.html` (lines 161–729) and `zone.html` (lines 4179–4747) with `carry-place-card.py`.

**The record fetch: done, and the fetch is dropped.**
- `place-answers-page-v1.mjs`: `unabridgedLine` writes each run as [words, kind]. I updated the schema text and the comment to match.
- `check-place-answers-page-v1.mjs`: `lineAgain` builds the runs the same way.
- The conditions all held:
  - make held again («everything holds», 191 s, G1–G11 all ok; G6 held 1,540,532 strings and 153,999 unabridged lines);
  - the comparison tool exited 0 with the same counts;
  - the one-place check and the walk passed.
- **Pins now:** places and entries still equal S/s14's. Page is now ab1afe1e4c50… and joined is b35795b49e41…, so neither equals S/s14's any more.
- **Cost:** the chapter files grow by 214 KB gzipped (+1.1%).
- **Effect:** «At this word» is drawn at once. In the walk, all 16 record-file requests happened while whole entries were opened and shut; none happened on a plain press.

**The switch note.**
- Was: «every reading any dictionary files under these letters, wherever it comes from».
- Now: «every reading any dictionary files under these letters».
- Measured at 412 px under the pill (168 px wide), it goes from 3 lines to 2. «Every» already says «wherever it comes from», and the pill's name says «matched by spelling». The pill's tooltip keeps the full sentence.
- In the Menu the row is still 3 lines tall, because the pill's own name wraps to 3 lines there.

### 2. The proofs

1. **make and the comparison:** both held, before and after the projection change (counts above).
2. **`check-place-card-one-place-v1`:** exit 0, all 17 results ok.
   - P1–P5: 556 block lines, each the module's.
   - P6: 37,075 words in 114 chapters, every one as the file gives it. 36,420 numbers; 219,287 rows; 35,653 rows not drawn because the entry is not on hand.
   - P7: 741 words, 5,298 whole entries opened, 462 files asked, none twice.
   - P8: planted at Genesis 1:1 entry 1, under H1254A (record BDB1300).
   - P9: 9,140 records; 952 say «in italics in the record», 147 of them with more than two runs.
   - P10: 25,096 lines marked †, across 135,592 words judged.
   - P11: 106 lines marked ‡.
   - P12: 153,999 lines.
   - P13: 295 lines whose label names another stem.
   - P14: 301 words with lines under both forms.
   - P15: 17,542 rows, from 38,027 words drawn whole (1,073 cases).
3. **Browser walk** at 412 wide, scale 2, touch: Ruth 1–4, Genesis 1–5 and the 20 other chapters (29 chapters).
   - Pressed = opened = matched the file = 13,497. The head matched the word 13,497 times, and 87 of 87 real taps opened a card.
   - The walk now also holds each unabridged line's place words, its † and ‡ marks, the row's sentences and the pair sentence to the file.
   - No page errors and no card faults. The browser logged 51 aborted requests: 32 tag files and 16 record files, from cards shut mid-load, and 3 of the page's own shards at a chapter's end.
   - **Median time:** 13.2 ms from press to card body (95th percentile 24.8, worst 290); 14.1 ms with the dictionaries drawn (95th 26.6, worst 464).
   - **Sheet:** 748 cards, 5,320 entries, all opened and all shut. The sheet held still on 742 of the 748 cards. On 6 it moved, none of them caused by an entry:
     - 3 were the first card of a chapter (Numbers 7:1, 1 Samuel 17:1, Psalms 44:1), where the sheet's opening growth animation was still running while it was measured;
     - 3 were Psalms 119:1 words 1–3, where the sheet stood still and the page scrolled 14–69 px underneath it.
4. **Switch on = S/base** on 50 of the 200 places (every 4th), each card read twice: 50 of 50 identical in every field, no page errors.
5. **Resting lines with the switch off:** 30,559 lines across Ruth, Amos, Jonah, Daniel and Genesis. Base live matches its record. At rest, with the switch on, and with it off again, all equal S/base (lines, credits and state), with no errors.
6. **The eight tree checks, each alone, all pass:**

| Check | Laws |
|---|---|
| build-derived | 6 |
| ledger-declared | 3 |
| no-import-side-effects | 2 |
| nothing-hand-typed | 6 |
| nothing-hard-wired | 3 |
| scope-derived | 6 |
| sidecars-all-named | 4 |
| k-maqaf-preserved-v2 | 9 (483,108 words agree) |

7. **Suite:**
   - At rest: color-channels ok (46 laws) and parts-read-right-to-left ok (4 laws).
   - With the meta line forced: 10 of 10 that passed before pass again: card-channels, dictionary-toggle, hud-toggles, names-pill, usable-card, run-cards, reset-pill, landing-holds-the-card, row-and-card-name-sources, source-switch. Afterwards the four swapped files were restored and match their sha256.
   - The trial page on Exodus 30: 468 of 468 words drawn, no errors.

### 3. The new laws, each failing on a spoiled copy

For each law I spoiled the module, ran the check, and restored the module (confirmed with `cmp`). Each time only the target law failed, plus P2/P3, because the pages then differed from the module.

| Law | Spoil | Result |
|---|---|---|
| P10 † | the † mark dropped | 25,096 wrong |
| P11 ‡ | the two numerals swapped in the sentence | 104 wrong |
| P12 stem placement | a stem's own head said as the bare stem | 18,530 wrong («Qal» where the file says «Qal, before its numbered senses») |
| P13 stray label | the sentence said only where the line also has † | 236 wrong |
| P14 pair | lines matched by record alone | 37 wrong (Exodus 16:2) |
| P15 language | «STEP's lexicon says» even where the row says | 17,542 wrong |
| P8 (reworked) | the language forced | «not as planted: the record's language» |

P8 now plants a citation's stem and labels and a record's language, and nothing else; `say` and `why` are no longer planted. P6 reads the kinds from the chapter file.

### 4. Pictures

New folder `S/s46w/shots-cut8/`: 19 pictures at phone size, scale 2, from the real `zone.html`. The old `shots/` folder is kept.

- **01 Genesis 1:3 word 5:** the citation now reads «Qal 1. a. «arise, appear, come»» and «Qal, before its numbered senses».
- **01b:** its dictionaries. The unabridged row says one of the 3 records is Biblical Aramaic, the row says Hebrew, and one record has the word's own headword.
- **02 Genesis 1:1 word 4:** «1. a. †» and the † sentence («stands 2 times»).
- **03 / 03b Ruth 3:12 word 5:** 03b's row says «2 are Biblical Aramaic records», then the record with «in italics in the record: if · if not, except … (5)».
- **04 Amos 7:12 word 6.**
- **05 Psalms 44:15 word 6:** «the opening «people»».
- **06:** the whole record opened. The Qal head is now marked as citing the verse.
- **07 (extra) / 07b:** the note is 2 lines under the pill; in the Menu the row is still 3 lines.
- **08:** the old card with the switch on.
- **09 Ruth 2:11 word 5:** «Hoph`al, before its numbered senses †».
- **10 2 Samuel 15:21 word 12:** «b. «Special uses:» †».
- **12 Genesis 1:11 word 7 (Hiphil):** «Hiph`il 1. «produce seed»» and «Hiph`il, before its numbered senses».
- **13 Exodus 30:33 word 11:** «** ‡» and «‡ BDB files this verse under another word of the same letters (II. «kinsman»); STEP's number is I.»
- **13b (extra):** its dictionary row: 3 records, one Biblical Aramaic, one with the word's own headword, «One BDB numbers as another word of the same letters, and it waits behind».
- **14 / 14b Daniel 2:20 word 7 «God» (H0426):** the row says Aramaic, so the Aramaic record stands as the word's own («the opening «god, God»», cites this verse). Nothing is set behind and no language sentence appears.
- **15 Genesis 1:11 word 8 «seed»:** taken from `recur-strict.tsv`. «2. c. «seed» †» next to an unmarked «2. e.», then the † sentence.

### 5. What still reads badly

- **The «**» label:** at Exodus 30:33 the file's label for the point is «**», so the line reads «עַם ** ‡».
- **«STEP's number is I.»:** «I» is BDB's numeral for the entry STEP's number reaches, not STEP's number (H5971A).
- **Stem names keep the source's backtick:** «Hiph`il», «Hoph`al», as the file spells them; source spelling is not changed.
- **«the opening»** under no stem or label does not say what it is the opening of (Psalms 44:15, Daniel 2:20).
- **The language and numeral sentences are long.** Exodus 30:33's row has four sentences before its one record, and the record that cites the verse waits behind «Other records…: 2». At Genesis 1:3 the third record, spelled otherwise, is not named.
- **Daniel 2:20:** nothing on the card says the lexicon calls the word Hebrew.
- **From before, unchanged:**
  - «Special uses:» in «»;
  - UBS «-» and a «1. a.» line with no words (Genesis 1:1 word 4);
  - MACULA «among not»;
  - the Menu row still 3 lines;
  - the line from the word to the card crosses the card's head.

### 6. Paths

**Changed in the sandbox** (S/s16; nothing committed, HEAD unchanged at ea6e1ad08e):
- `S/s16/reader/tools/place-card-v1.mjs`
- `S/s16/reader/tools/check-place-card-one-place-v1.mjs` (now 550 lines)
- `S/s16/reader/place.html`
- `S/s16/reader/zone.html` (+790 / −7 against HEAD)
- `S/s16/reader/tools/place-answers-page-v1.mjs`
- `S/s16/reader/tools/check-place-answers-page-v1.mjs`
- the 7 tools copied from S/s14
- `S/s16/reader/data/place-answers-v1/` (made again)

**Logs** in `S/s46w/logs/`:
- make and comparison: `make-cut8.log`, `lines-compare-cut8.log`, `make-cut8-kinds.log`, `lines-compare-cut8-kinds.log`
- one-place check: `one-place-cut8.log`, `spoiled-laws-cut8.log`
- walk: `walk-cut8.json`, `walk-cut8.log`
- 50 places: `places-50.json`, `oldcard50-base.json`, `oldcard50-switch.json`, `oldcard50.log`
- resting lines: `lines-cut8.json`, `lines-cut8.log`
- tree checks: `tree-cut8/`
- suite: `suite-cut8-rest/`, `suite-cut8-rest.txt`, `suite-cut8-forced/`, `suite-cut8-forced.log`, `suite-cut8-forced.txt`
- pictures: `shot-jobs-cut8.json`, `shot-jobs-cut8-extra.json`
- `page-changes-dump.txt`

**Scripts** in `S/s46w/scripts/`:
- new: `h2-cut8-card.py`, `h2-cut8-check.py`, `h2-cut8-laws.js`, `h2-spoil.py`, `h2-note.mjs`
- updated: `h2-walk.mjs`, `h2-shot.mjs`

**Kept for comparison:** `S/s46w/cut4-as-handed-back/` holds the block and its check as handed back last time.

**Pictures:** `S/s46w/shots-cut8/` (19 files).

**Deleted to save disk:**
- `S/s46w/h2-before/` (see the top of this report)
- `S/s46w/h2-swap/after/` (the swap script makes it again)
- my copies of S/s14's two projection files (identical to S/s14's)

The first builder's `S/s46w/kept/` is still there. Disk free: 3.3 GB.
