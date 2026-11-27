## Fourth cut: both rules are measured; neither is built

The vowel rule chose the wrong record in 3 of 60 numbers I read, from two systematic causes, so I did not build it. The one-line rule cannot be done in the data alone; the exact change `reader/place.html` needs is below. Nothing in the tree changed this cut. `place.html` is untouched, no tracked file changed, and the pins are those of the third cut.

### 1. The headword with its vowels: measured, not built

**How I read a headword's vowels**
- **Kept:** sheva, the three hataf vowels, hiriq, tsere, segol, patah, qamats, holam, qubuts; the dot of shin and sin; the point inside vav, which is a vowel there.
- **Folded:** the separate "holam for vav" sign into holam (the record file writes it 1,186 times where the others write plain holam); qamats qatan into qamats (the record file never writes it).
- **Not compared:** the point inside any other letter. It is no vowel, and comparing it parts 461 numbers against 462 without it.
- **Off:** cantillation, the stress mark, meteg, maqaf, rafe and everything else.
- **Letters as today:** a vowel letter is still a letter, so a full and a defective spelling remain different words.

**Counts for the rule as you gave it** (same vowels mark for mark, else the letters decide)

| Of the 1,483 numbers at several | Numbers | Words |
|---|---|---|
| part to one record | 462 | 42,028 |
| stay at several | 982 | 57,622 |
| no record has the vowels, letters decide | 39 | 8,176 |

- **Word by word, with MACULA's form:** of 108,438 words at several, 42,302 part to one, 57,964 stay, 8,172 fall back.
- **Inside an opened record:** fewer paragraphs are marked in 66 (number, record) pairs, on 2,836 words.
- **Where a number has only one record,** so the record is surely the word, 399 of 8,131 headwords do not match mark for mark. The record file leaves a vowel off, puts holam on the wrong letter, or points the headword otherwise.

**Hand reading**
- **First reading, 30 of the 462 (every 15th): 29 right, 1 wrong.** H7531A «pavement»: the vowels choose BDB8087 «glowing stone». The record of «pavement» (BDB8084) has its hiriq before the resh in the file, so it fails. 17 of the 30 are a Hebrew record against an Aramaic one.
- **I then measured a gentler rule,** since that slip is common: a record goes behind only where its headword contradicts the vowels, and a vowel left off contradicts nothing. It parts 393 numbers (37,214 words). 217 are Hebrew against Aramaic; 176 have a same-language record behind.
- **Second reading, 30 of those 176 (every 5th): 28 right, 2 wrong.**
  - H3228G «[Ben]jaminite»: chooses BDB3576 «Jaminite», not BDB3572.
  - H3667B «merchant»: chooses BDB4093 «Canaan», not BDB4094.
- **Cause of those two:** STEP's lexicon gives sibling numbers of one Strong's entry the same pointed headword, while the record file points the two words differently. The vowels then send both siblings to one record. By machine, 15 such groups stand among the 176 (36 numbers, 2,959 words): H4551A «quarry» with H4551B «missile», H4915A «likeness» with H4915B «dominion», H6282A «worshiper» with H6282B «odour».

**One thing measured that you did not ask for:** the language both sources declare. STEP's lexicon says Hebrew or Aramaic in its morph column, and the record says it in its own line. Not built.

| Of the 1,483 numbers at several | Numbers | Words |
|---|---|---|
| part to one record of the declared language | 357 | 61,136 |
| several records of that language | 873 | 34,309 |
| no record of that language | 0 | 0 |
| STEP says no language (names) | 253 | 12,381 |

That is more words than the vowels part, with no pointing compared. All 17 such partings in the first reading were right.

### 2. The record's one line: measured; the page must change

**Why the data cannot do it:** the page prints «…» only for italics the entries file classes as the entry's meaning or the opening, and it builds both "no meaning" sentences itself. The data could make it print the unclassed italics only by classing them as one of those, which is a claim.

**Counts**

| One line now, of 9,140 records reached by a number | Records |
|---|---|
| the entry's meaning | 6,946 |
| the opening | 67 |
| «(no meaning in italics; in bold: …)» | 1,678 |
| «(its opening carries no meaning in italics)» | 449 |

- **Would change:** 952 records (861 and 91 of the last two rows), under 1,936 numbers on 52,662 words. The changed record is shown first at 32,054 of those words.
- **The sentence stays** at 1,175 records whose head truly holds none.
- **I also left out abbreviations and outline letters,** beside the three kinds you named; 40 heads hold only those.
- **Runs to print:** one at 641 records, two at 164, three at 57, four or more at 90.

**The exact change:** replace `unabridgedFirst` in `reader/place.html` with this. I ran it in node with stand-ins for the page's helpers on all 9,140 heads; it says the new wording at 952. It is not tested in a browser.

```js
function unabridgedFirst(hd, several) {
  const its = hd.head.italics || [];
  const of = (kind) => its.filter((x) => x.kind === kind).map((x) => tidy(x.t));
  const main = of("main_gloss"), open = of("opening");
  // italic runs the file does not class as a grammar word, a word of another language, a verse's wording, an
  // abbreviation or an outline letter: printed as they stand, as the record's italics, with no claim of what they are
  const SKIP = ["main_gloss", "opening", "grammar_word", "other_language", "verse_wording", "abbreviation", "outline_letter"];
  const plain = [...new Set(its.filter((x) => !SKIP.includes(x.kind)).map((x) => tidy(x.t)))];
  const q = (list) => list.map((x) => `«${x}»`).join(", ");
  const said = main.length ? [rd(q(main))]
    : open.length ? [rd(q(open))]
    : plain.length ? [el("span", "gap", "in italics in the record: "), rd(q(plain.slice(0, 3))), plain.length > 3 ? el("span", "gap", ` … (${plain.length})`) : ""]
    : (hd.head.bold || []).length ? [el("span", "gap", `(no meaning in italics; in bold: ${hd.head.bold.map((x) => tidy(x.t)).join(", ")})`)]
    : [el("span", "gap", "(its opening carries no meaning in italics)")];
  return [hd.head.headword ? he(hd.head.headword.t) : "", " ", ...said, several ? el("span", "gap", ` (${hd.language === "BIBLICAL ARAMAIC" ? "Biblical Aramaic" : "Biblical Hebrew"})`) : ""];
}
```

At Ruth 3:12 word 5 it prints: in italics in the record: «if», «if not, except», «§mma» … (5). The third run is the file's garbled transliteration, left unclassed there.

### Commands
- **The one command on the fetched folder:** exit 0, 189 s, everything holds.
- **The comparison tool with its list:** exit 0; the 141 differences are exactly the list.
- **The page check:** exit 0.

### What I did not expect
- **STEP's lexicon points sibling numbers alike,** so vowels cannot tell «Canaan» from «merchant».
- **About one headword in twenty in the record file is pointed with a slip or otherwise** than STEP's.
- **Over half of what the vowels part is Hebrew against Aramaic,** which both sources say outright.
- **If the vowel rule is ever built, the «mother» stub under H0518B needs a page change too.** STEP's headword outside the brackets is unpointed there, so only MACULA's form could unmark it, and the page marks paragraphs by number only.

### Paths
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-hand-reading-30.txt
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-hand-reading-same-language-30.txt
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-measure-no-dagesh.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-compat.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-why-not.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-language.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-one-line.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut4-make.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/scripts/cut4-one-line-proposed.mjs
