## Seventh cut: both rules are built, and every proof passes

- **The one command** on `S/s45w/fetched` ends «everything holds» (exit 0, 210 s).
- **The comparison tool** with its list exits 0. The line under the word did not move: the 141 known differences are exactly the list.
- **The page check** holds. Each new rule, spoiled on its own copy, fails its own law (5 of 5).
- **The entries check** holds; this cut does not change the entries.
- **The eight tree checks** each pass when run alone.

Nothing is committed. No tracked file changed, and `reader/place.html` is untouched (md5 a5e0efe6…).

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

### Gen 31:47 «Jegar-sahadutha»: no exception, as you decided
The rules' comment now records the decision. The companion list is `S/s48w/lang-row-says-otherwise-than-the-passage.tsv`. It is measured: every word where STEP's row says another language than MACULA marks for the same word. It holds only these two words (words 4–5, STEP Hebrew, MACULA Aramaic).

### 1. BDB's own homonym numeral (built)
- **The rule as built:** the Open Scriptures entry the number reaches exactly carries a numeral (`mod`). Among the records that pass the headword and language tests:
  - A record whose own paragraph bears another numeral goes behind the button, with «BDB numbers this another word of the same letters (I., II.)».
  - A citing paragraph of another numeral is not said to cite the word.
  - Where either side has no numeral, nothing changes.
- **The data:** tag lines carry `nm` (the entry's numeral) and `on` (the records of another numeral).

**Counts by number** (numbers with several own records):

| Result | Numbers | Words |
|---|---|---|
| Parted to one record | 661 | 17,985 |
| Still several | 119 | 7,536 |
| None left | 1 | 1 |
| The one own record bears another numeral | 17 | 312 |

**Counts by word** (under a number of several records):

| A word's own records | Before | After |
|---|---|---|
| exactly one | 138,323 | 156,287 |
| several | 45,142 | 27,169 |
| none | 1,889 | 1,898 |

- 168 lines (50 + 118) are no longer drawn, on 161 words.

**Read by hand:** 30 numbers against both raw files, your 3 examples and 27 spread across the alphabet. In all 30, the unabridged record that bears the Open Scriptures entry's numeral is the same BDB entry (same numeral, same gloss). Two things to know:
- **H2254C «be in labour»:** the Lexical Index's own xref sends «travail» to I. חָבַל «bind». Neither file has a III. חָבַל record, so I. «bind» stands first. The chain is followed as declared, but the meaning is not the word's.
- **Exod 30:33 «cut off from his people»:** BDB cites this phrase under II. «kinsman», while STEP's letter says I. «people». So the rule now withholds BDB's own citation there.

### 2. One record cited at two words of a verse (built as the half-rule)
**The comparison:** the consonants of each word of the Hebrew run BDB writes right before the reference, final letters folded. They are matched against each occurrence's consonants as our text writes them, each form of a pair. Three refinements came from the hand readings:
- An occurrence also matches with one or two proclitics (ו ה ב כ ל מ ש) taken off, since BDB's quotes leave them off.
- Words the file joins with its maqaf mark (U+05BF on the next word's first letter; 5,568 runs) are read as two.
- A quoted run with two or more words that are not in this verse is another verse's wording, and names no word here.

**What the rule does:**
- A line is withheld at this word when every reference behind it quotes another occurrence and not this one.
- A line whose references no quote parts stays, and carries how many times the number stands in the verse (field b[14]). The card says once: «BDB cites this verse; this number stands n times in it, and BDB does not say which word it means.»

**Counts:**
- **Lines withheld:** 1,114, on 1,087 words.
- **Lines moved:** 0. In 1,192 of the 1,195 cases, the named word already draws the line. At the other 3, that word's own tests (numeral or headword) reject the record, so the line is not added there either. Two of them are Josh 19:13 and Eccl 7:6.
- **Lines marked:** 25,085, on 21,682 words.
- **Unabridged lines in all:** 155,175 before, 153,893 after.

**Read by hand:**
- **First 30:** 27 right. The 3 wrong came from the joined maqaf (Ps 100:5, Isa 45:9) and another verse's wording (Amos 7:14); all three are fixed.
- **A fresh 30:** 28 right. The 2 wrong came from a quote without its proclitic (Exod 34:7, Lev 12:6); both are fixed, and 3 borderline cases now stay.
- **The 12 that the proclitic change newly withholds:** 12 right, Isa 66:8's Hoph`al line among them.

### The page changes: one file for builder H2
`S/s48w/page-changes-cuts-5-6-7.mjs` replaces `cut6-page-proposed.mjs` and the fifth cut's proposal. It holds 9 exact edits (`EDITS`, each an old/new pair). Every old text was taken from `place.html` and stands there exactly once.

| Area | What changes | Cut |
|---|---|---|
| drawHere | The stem with its point; a label that names another stem; the † line with its sentence | 6, 7 |
| New functions | `unabridgedWhere`, `drawUnabridgedHere`, `pairSentence`, `unabridgedSays` | 6, 7 |
| openCard | The pair's sentence | 6 |
| drawEntries | The cited key of a stem's head | 6 |
| drawEntries | Records parted by headword, the word's language, and BDB's numeral | 5, 6, 7 |
| drawRecords | The numeral sentence on a record set behind | 7 |
| unabridgedWhole | A stem's head as a unit of its own (2 edits) | 6 |
| CSS | `.unit.stem` | 6 |

The file's harness applies the 9 edits to a copy of the page and runs the patched script in node with stand-ins. I ran it on these words; the output is in `cut7-page-run.log`:
- Gen 1:11, with BDB2463 opened whole
- Lev 12:2
- 2 Sam 24:15
- Exod 30:33
- Gen 1:6 and Gen 1:1 (the † sentence)
- Dan 2:20
- Prov 19:16

### Paths
- **Tools changed, in `S/s14/reader/tools/`:**
  - `place-answers-page-v1.mjs` (the rules, with their comment)
  - `project-place-answers-page-v1.mjs`
  - `check-place-answers-page-v1.mjs`
- **Data:** `S/s14/reader/data/place-answers-v1/`. Joined pin afcc2040…; page pin b13a1cae…
- **Hand readings, in `S/s48w/`:** `numeral-30.txt`, `recur-hand-30.txt`, `recur-hand-30b.txt`
- **The withheld lines:** `recur-withheld-3.tsv` (final) and `recur-withheld-new.tsv` (those the proclitic change added)
- **Logs and lists, in `S/s48w/`:** `cut7-make.log`, `cut7-lines-compare.log`, `cut7-tree-*.log`, `cut7-spoil-page-*.log`, `lang-only-other-language.tsv`, `lang-row-says-otherwise-than-the-passage.tsv`
