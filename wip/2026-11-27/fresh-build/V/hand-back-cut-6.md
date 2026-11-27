## Builder V6, sixth cut: what was built, what was only measured

I built three rules: (1) a word's language comes from STEP's row at that word, (2) the unabridged BDB's stems, and (3) your item 3, written-and-read pairs. Items 2 and 4 are measured and not built. Item 5 is a list.

All proofs pass:
- **The one command** on `S/s45w/fetched` ends «everything holds» (exit 0, 219 s).
- **The comparison tool** with its list exits 0. The line under the word did not move: 305,290 words equal the live line, and the 141 differences are exactly the list.
- **The eight tree checks** each pass when run alone.
- **Spoiled copies:** each new rule, spoiled on its own, fails its check. That is 4 copies for the entries check and 7 for the page check.

Nothing is committed or pushed. No tracked file changed. `reader/place.html` is untouched (md5 a5e0efe6…).

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

### Rule 1: a word's language comes from STEP's row at the word (built)

- **What changed:** the places already give each part its row's language (the grammar column starts with H or A). The page rules (`rowsLanguage`) now read the language at the word for each number from that. STEP's lexicon is used only where the row says neither.
- **That never happens in this data:** of 299,512 (form, number) pairs, all 299,512 are read from the row.
- **TAHOT rows:** 300,807 H, 4,827 A, 14 empty. The brief's 226,925 is not what I count over the four files.
- **New in the chapter files:**
  - `t.lg` on each form: what its rows say (301,400 h, 4,877 a).
  - `ol` on each form: the records of the other language at this word (135,568 forms have one).
  - The tag files keep only the lexicon's `lg` and no longer carry `ol`.

| Count | Before (lexicon) | After (row) |
|---|---|---|
| «Cites this verse» lines withheld for language | 78 on 70 words | 25 on 25 words |
| Words under a number of several records: one record is the word's | 136,301 | 138,323 |
| … several are | 47,199 | 45,142 |
| … none is | 1,854 | 1,889 |

**Numbers where STEP's rows and its lexicon disagree:**
- **H0426:** the lexicon says Hebrew; all 95 words are Aramaic by their rows. All 95 change: BDB9300 is no longer set behind anywhere, and 51 words gain its «cites this verse» line.
- **H3201:** one Aramaic row (Dan 7:21). BDB9581 (Aramaic) now stands first and cites the verse; BDB3539 goes behind.
- **H5613:** the lexicon says Aramaic; 2 words have Hebrew rows (Esth 3:12, 8:9). Its only record, BDB9740 (Aramaic), is now set behind there.
- **H2269:** the same at 3 words (Hos 6:9, Prov 21:9, 25:24); BDB9504 goes behind.
- **H7121H:** every row says Hebrew, so no word changes. The lead's two words «in the Aramaic passages» stand in Hebrew chapters.

**Something that moved that you did not ask about:**
- The lexicon gives 4,387 numbers no language (names, «N:»). Their rows now say one.
- 163 of them change words, mostly the Aramaic record of a name going behind at its Hebrew words: Israel 2,505, Judah 810, Moses 766, Jerusalem 643, Babylon 262 and others.
- In all, 167 numbers and 5,887 words change. All of them change which records are set behind; 59 also change which records are said to cite the verse.

**Read by hand:**
- **All 95 H0426 words:** right.
- **Dan 7:21 (H3201):** right.
- **20 names spread over the numbers that changed:** 19 right, 1 against what the source means.
  - Gen 31:47 «Jegar-sahadutha» (words 4 and 5): STEP's rows mark Laban's Aramaic name as Hebrew (`HNpl`).
  - So the rule sets its only record, BDB9568 (Aramaic, «(stone-)heap»), behind, and one line is withheld. It follows STEP's row as asked; you may want an exception.

### Rule 2: the unabridged BDB's stems (built)

**What I built:**
- **Entries reader:**
  - Each paragraph keeps its stem headings (`stems`).
  - A bold stem name counts as a heading when it is a div's label, or a label that numbers the stem's point 1 after a finished sentence.
  - It also counts as the head's «verb …», or as running text where its forms list or gloss follows or the sentence before has ended.
  - It never counts after a word that points elsewhere: compare, see, cf., read, Kt, Qr, apparently, others, «=», or an open bracket. Nor inside a bracket of its own sentence, nor in a paragraph that is not a verb's.
- **Verse bridge:** each value now carries the heading it stands under and whether it sits in that stem's own head.
- **Page line:** names the stem with the point. Where the verse stands in both a stem's forms list and a numbered point of that stem, the point leads.
- **Stray labels:** a label the file writes with another stem's name («Qal 2. 2.» under Hiph`il) is marked. There are 297 such lines.

**Counts:**
- 3,373 headings in 1,687 paragraphs.
- Of the file's 165,681 references: 33,052 stand under a stem in a point, 22,305 in a stem's head, 110,324 under no stem.
- Page lines went from 154,949 to 155,175.
- 8,110 words now have the point line leading the stem's head line.
- At 7,743 words the line changes sense: the reference leaves another stem's point for its own stem.

**Agreement with STEP's and MACULA's stem at the word.** «Before» means the stem under which the old line's point stands, read with the same headings.

| Witness | Before: agrees | Before: differs | After: agrees | After: differs |
|---|---|---|---|---|
| STEP | 43,381 | 6,955 | 50,178 | 1,450 |
| MACULA | 43,100 | 7,644 | 49,983 | 2,193 |

- A further 1,095 lines after (915 before) differ from STEP only because another word of the same verse has that stem.
- **The Open Scriptures BDB's line already names the stem rightly:** STEP agrees at 358 and differs at 8 (+5 another word); MACULA agrees at 353 and differs at 12.
- **The auditor's list:** of the 6,038 lines it flags (another stem's unit, confirmed by STEP's grammar), 5,791 now show a line in STEP's stem. 5,635 no longer show any line in another stem. 403 still show one, mostly another word's citation of the verse (item 2).

**Read by hand:**
- **30 changed words, against the raw record:** 30 right. They are placed the same in the built files.
- **Lines that still disagree with STEP:** most are another word of the same verse, or BDB analysing the form differently from STEP.
- **Every remaining fault is a heading the file garbles, which the rule misses.** Examples: «Qal 1 with Hithpa`el»; «Hiph`il = Pi`el»; a heading set in italics; «see 2 d above Hiph`il». The rule leaves these where they stood before.
- The one wrongly read heading I found, «(compare Niph`al Participle)», was removed by the bracket and pointing-word tests.
- My estimate is under 1% of lines with a witness are wrong, so «rarely».

### Item 3: written-and-read pairs (built)

- STEP's grammar gives each form its stem. A line whose stem belongs to one form and not the other now stands on that form only.
- 82 lines were taken off the wrong form, at 45 pairs. I read all 45 and every one is right, e.g. Prov 19:16 and Exod 16:2.
- **Prov 19:16 goes the other way from the audit's sentence:** the audit says the written form takes Qal; STEP's grammar gives the written form Hophal, so it gets «Hoph`al 4.» and the read form gets «Qal 2. d.».
- Lines whose stem matches both forms or neither stay on both. The page change says so.

### Item 2: one record cited at two words of a verse (measured, not built)

- 28,495 lines on 22,911 words stand where the number recurs in the verse; behind them are 34,518 references.
- What I compared: the consonants of each word of the Hebrew run directly before the reference, final letter shapes folded, against each occurrence's consonants as our text writes the word (each form of a pair).
- **The quoted form is absent at 26,018 references (75%).** BDB quotes forms mostly in a stem's list of forms, not at its senses.
- Where a form is quoted:

| The quoted form matches | References |
|---|---|
| exactly one occurrence | 3,253 (this word 1,529, another word 1,724) |
| several occurrences | 1,477 |
| none | 3,770 |

- Your own condition (often absent) says do not build. Sampled readings show the match is reliable where a form is quoted.
- **Possible half-rule for you to decide:** taking off the 1,025 lines whose every quoted form names another occurrence only.

### Item 4: a declared link between the two BDB files (measured)

- Neither file names the other's ids or pages. Both say they keep BDB's order; an alignment by order would be a bridge of ours.
- Both write BDB's homonym numeral: «II.» before the unabridged headword, `mod="II"` on the Open Scriptures entry.
- **By that numeral,** for the Open Scriptures entry the tag reaches exactly:
  - Of 1,483 several-record numbers (107,826 words), 850 have a numeral.
  - 785 numbers (29,868 words) part to one record; 55 stay several; 10 match none.
- It parts your three examples rightly: H5971A → I. «people», not «kinsman»; H6213A → I. «do», not «press»; H6076A/B → «mound» / «tumour». Not built.

### Item 5: numbers that reach only a record of the other language (list)

- 27 numbers on 692 Hebrew-row words reach only Aramaic records. 659 of those words are the H5375G–X family, which reaches only BDB9721.
- 8 numbers on 39 Aramaic-row words reach only Hebrew records, e.g. H8133 (22 words), H0746B, H6211B.
- The list gives each record's own number column, for the corpus lane: `S/s48w/lang-only-other-language.tsv`.

### The page changes for builder H2

The exact code is in `S/s48w/cut6-page-proposed.mjs`. I ran it in node with stand-ins on Gen 1:11, Lev 12:2, Dan 2:20, Prov 19:16, Dan 7:21, Gen 1:1 and Ezra 5:1; the output is `cut6-page-proposed.log`. There are seven changes:

1. **New `unabridgedWhere(b)`:** builds the line from the row's new fields b[10]–b[13].
   - b[10] is the stem name.
   - b[11] is the heading's index.
   - b[12] is 1 for a stem's head; the line reads «Hiph`il, before its numbered senses».
   - b[13] marks a stray label; the line reads «Hiph`il, at a point the file labels «Qal 2. 2.»».
   - Otherwise the line is «Hiph`il 1.».
2. **`drawHere`:** its `if (h.b)` block uses `unabridgedWhere` and adds one sentence where a label is stray.
3. **`openCard`:** after the «At this word» loop, `pairSentence(e, here)` says when a line stands under both forms.
4. **`drawEntries`, `citedB` key:** use `` b[12] ? `${b[1]}|s${b[11]}` : `${b[1]}|${b[2]}|${b[3]}` ``.
5. **`drawEntries`, the `if (isB)` block:** replace it with `partRecords` and `unabridgedSays`.
   - The records set behind come from the forms' `ol`.
   - The language is `t.lg`, said as «STEP's row at this word says», or the tag's `lg` («STEP's lexicon says») where the row says none.
   - This replaces the fifth cut's tag-level proposal.
6. **`unabridgedWhole`:** an inline stem heading starts its own unit (key `` `${bi}|s${x}` ``); a heading that is a point's label marks that point as well.
7. **CSS:** add `.unit.stem { display: inline; }`.

### Paths

**Changed tools** (all in `S/s14/reader/tools/`):
- `place-answers-entries-unabridged-bdb-v1.mjs`
- `place-answers-bridges-v1.mjs`
- `build-place-answers-entries-v1.mjs`
- `check-place-answers-entries-v1.mjs`
- `place-answers-page-v1.mjs`
- `project-place-answers-page-v1.mjs`
- `check-place-answers-page-v1.mjs`

**Data** is in `S/s14/reader/data/place-answers-v1/`. Only the unabridged entries file, its verse bridge, the page files and the pins changed.
- Joined pin: sha256 e78cba16…
- Page pin: e5704fed…
- Entries pin: f307d9c1…
- The chapter files grew from 18.67 MB to 19.28 MB.

**Logs, all in `S/s48w/`:**
- Proofs: `cut6-make.log`, `cut6-lines-compare.log`, `cut6-tree-*.log`, `cut6-spoil-entries-*.log`, `cut6-spoil-page-*.log`
- Rule 1 hand readings: `lang-hand-H0426-H3201.txt`, `lang-hand-20.txt`
- Rule 1 changed words: `lang-changed-words.tsv`, `lang-changes.log`
- Rule 2 hand readings: `hand-30-meaningful.txt`, `hand-24-differ.txt`
- Rule 2 witness and auditor cross-check: `q2-cross.log`
- Item 3: `pairs-measure.log`
- Item 2: `recur-strict.tsv`, `recur-strict.log`
- The fifth cut's data, kept for comparison: `before/`
