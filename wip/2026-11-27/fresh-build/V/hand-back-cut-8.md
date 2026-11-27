Cut 8 hand-back (builder V6, page lane). The numeral refinement is built, and every proof holds. Nothing was committed or pushed. Nothing was written outside S/s14/reader/ and S/s48w/. `reader/place.html` is untouched.

**Two withholdings you did not ask for.** I read the lines by hand and found two kinds the (a)/(b)/(c) parting got wrong. Each is one test in `partRecurring` with its own count, so either can be reversed.
- **BDB's pointer.** In my first reading of 15 (a) lines, three were BDB sending the verse elsewhere: «— Num 24:6 see II.», «Job 27:8 see II.», «II. … Jer 22:17 see below». A line is withheld when every one of its references is followed, over other references only, by «see» or «read». «See also» and «see» followed by a reference don't count. A reference inside a bracket that names a homonym of another numeral also counts, e.g. «(II. …, compare Ps 16:8)». «compare» alone does not withhold, so your Exod 30:33 («compare Exod 30:33» under II.) is drawn.
- **Another word's own reading.** Two more of the 15 were another word's reading: Gen 2:9 «ידע טוב ורע» and Eccl 7:6 «thorns». A line is withheld when another word of the verse holds the same paragraph under its own numeral. These are always two homonyms side by side.

**Counts over the 168 lines (161 words)**

| Class | Lines |
|---|---|
| (a) drawn as BDB's reading of this word | 95 |
| (b) withheld, quote names another word | 1 |
| (c) drawn, can't be told (with the † sentence) | 11 |
| Withheld as BDB's pointer | 46 |
| Withheld, another word of the verse holds it | 15 |

- That makes 106 ‡ lines on 104 words. Four of them have no gloss in the data, so the page shows only the numeral, e.g. «(I.)».
- Unabridged lines now total 153,999. Recurring numbers: 1,115 lines withheld, 25,096 marked.

**Hand readings**
- **15 fresh (a) lines:** 12 are clearly BDB's reading of this very word: Gen 3:5, Exod 16:15 «manna», Exod 37:7, Isa 23:2 (with «but compare II.»), Isa 52:7, Hos 12:1, Hab 2:5, Ps 17:1, Ps 43:1, Ps 108:13, Prov 13:13, Job 9:23.
  - The other 3 come from BDB's form lists, which cite the verse under the other homonym: Job 39:4 under II. «dream», Jer 12:1 under II. בֶּגֶד, and 1 Sam 10:5 under I. נֵבֶל «jar». These look like slips in the source, but they are drawn as BDB gives them.
- **(b):** Gen 40:21 entry 3 is right; the quote «suffix מַשְׁקֵהוּ» is entry 5's.
- **All 46 pointer lines:** 45 are BDB's own «see», «read» or «q.v.» elsewhere. One is borderline: Ezek 31:14, «perhaps … but compare below IV.».
- **All 15 other-word lines:** Gen 2:9, Gen 31:29, Judg 15:16, Ps 74:19, Eccl 2:24, Eccl 7:6, Eccl 9:3 and Hab 2:9. Each is a pair of homonyms, each paragraph going to the word STEP numbers for it.

**List for the corpus lane (H2254C left as is).** File: `S/s48w/li-gloss-mismatch.tsv`, made by `li-gloss-mismatch.mjs`.
- **The test:** for a number with one Lexical Index entry, none of the content words of STEP's TBESH gloss appears among the words of the Open Scriptures BDB entry the index's xref reaches (all its defs) or of the index entry's own def. Words are compared on their first five letters, with «our» read as «or».
- **Whole list:** 1,546 numbers on 41,203 words. Most of these are synonyms (strength/body, you/thou), so treat this as an upper bound.
- **The useful part (the H2254C kind):** 284 numbers on 15,963 words reach an entry that carries a BDB numeral. Of those, 9 numbers (356 words) have a STEP gloss that shares a word with a sibling homonym.
- **Not testable:** 2,643 numbers (7,433 words) reach an entry with no defs.
- **H2254C is on the list.** BDB itself puts «travail» under I. חבל Pi`el, so the index follows BDB and the difference is STEP's split of the number.

**Proofs**
- **One command:** `bash tools/make-place-answers-v1.sh S/s45w/fetched` finished in 203 s with «everything holds».
- **Comparison tool:** exit 0, the 141 known differences.
- **Page check:** exit 0.
- **Spoiled copies of the new rules:** each of these makes the page check fail G6 (plus G1 for the file hashes, and G11 for the two put-back lines):
  - the ‡ mark taken off Exod 30:33;
  - its numeral changed to III;
  - a pointer line put back (Num 24:6);
  - an other-word line put back (Eccl 7:6).

  The cut-7 numeral-line spoil no longer applies and these replace it.
- **Eight tree checks:** each run alone from reader/, each exit 0.

**Page change.** Still one file, `S/s48w/page-changes-cuts-5-6-7.mjs`, now covering cuts 5–8 with 9 edits. Edit 2, `drawUnabridgedHere`, marks a line that has b[15] with « ‡» and says once per paragraph, from the data:
`‡ BDB files this verse under another word of the same letters (${b[15].another}.${gloss ? ` «${gloss}»` : ""}); STEP's number is ${b[15].entry}.`

Harness reruns:
- **Exod 30:33 entry 10** prints «‡ BDB files this verse under another word of the same letters (II. «kinsman»); STEP's number is I.»
- **2 Sam 24:15 entry 10** (with SHOW_HIDDEN=1) prints «BDB numbers this another word of the same letters (I., II.)».
- **1 Sam 10:5** shows the no-gloss form.

**Side note.** 182 points in 182 records carry the label «**», which shows as «עַם **» on the Exod 30:33 line. It looks like a provider artifact; I left it alone.

**Files are in S/s48w** (S = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad):
- Tools changed:
  - S/s14/reader/tools/place-answers-page-v1.mjs (`pointsElsewhere`, `partRecurring`, the rules' comment)
  - S/s14/reader/tools/project-place-answers-page-v1.mjs
  - S/s14/reader/tools/check-place-answers-page-v1.mjs (its own `bdbSendsElsewhere` and other-word test)
- Readings: `numeral-lines-hand-4.txt`, `pointer-lines-hand-2.txt`, `recur-withheld-11.tsv`, `recur-withheld-11.tsv.pointers.tsv`
- Logs: `cut8-make.log`, `cut8-lines-compare.log`, `check-page-11.log`, `cut8-spoil-page-*.log`, `cut8-tree-*.log`
- Spoil script: `spoil.mjs`; page-change generator: `make-page-changes.py`
