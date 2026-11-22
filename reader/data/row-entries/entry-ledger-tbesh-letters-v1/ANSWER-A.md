# Answer A: TBESH's lettered entries, the same word or another word

From Moses (corpus lane), 21 November 2026 AD. For Elijah's ask A of 20 November (`FOR-MOSES-2026-11-20-ship-11-and-what-lands-next.md`, sections 3 and 6). The rule is `RULE.md` beside this file. It was written before the builder and has three amendments made before any ship, three more from mend round 1 (section 12) and one note from mend round 2 (section 13). Every figure here is read from `receipt-v1.json` unless another file is named.

## In short

Yes. TBESH itself says where each of its words begins and ends, in its own first and third columns. Read that way, every one of its 4,350 lettered entries has a class. «father» is one word: H1G, H1H and H1I all stand under TBESH's column 1 «H0001». On store 88fec6d59737, 1,838 of v203's 16,273 lines that give `t` hold back a letter of the same word, and `facts-slot-t-v1.1.tsv` mends every one of them. Each letter it adds comes with its reason. Against the letters v203 gave, what it still parts is another word by TBESH's own columns. At 4 lines a letter stays held back that is the same word only as a letter the widening adds (section 10).

## 1. What TBESH says about its own letters

TBESH's header names its first three columns eStrong, dStrong and uStrong, and says of them:

- column 1: «These Extended Strong Numbers are mapped to BDB (and thereby to other modern lexicons) by OpenScriptures.org. This adds about 800 words which are found in modern lexicons but were not differentiated by Strong.»
- column 2: «These Disambiguated Strong numbers differentiates distinct sub-meaning of words, and distinct indivuduals with the same name»
- column 3: «These Unified Strong numbers link together dStrong numbers that can be regarded as a single word, such as Aramaic & Hebrew versions or different spellings of the same word, and alternate names of the same individual or place.»

So a capital letter in column 2 parts senses, uses, names and people inside one word. Column 1 writes which word the letter belongs to. Mostly it is Strong's number, with a small letter where BDB parts one Strong's number into several words (H5674a, H5674b); section 3 gives the two other kinds. Column 3 links entries TBESH regards as one word. Two letters of one number are:

1. **the same word by column 1** when column 1 is the same for both;
2. **the same word by column 3** when both entries' column 3 names the same entry, or when one names a letter of the other's column-1 word;
3. **another word** when neither holds.

Nothing else decides. The words after the dStrong («= a Part of», «= a Meaning of», and the rest), the Morph, the Hebrew, the gloss and our English are all left out. Column 3 is read as TBESH writes it and is not followed from entry to entry.

## 2. The classes (`tbesh-letters-v1.jsonl`)

There are 4,350 lettered entries in 1,391 numbers. Each line names the letters that are the same word (with the sign and TBESH's own words for it) and the letters that are another word.

- `SAME_WORD`: 3,196 entries. Every other letter of the number is the same word.
- `SAME_WORD_AS_SOME`: 301 entries. The number holds two or more words; the entry is the same word as some of its letters and another word than the rest. H1004I «Beth-(togarmah)» is the same word as H1004B «house: home» (column 1 «H1004b»), and another word than H1004A «place» (column 1 «H1004a»).
- `ANOTHER_WORD`: 853 entries. No other letter of the number is the same word, as with H352A to H352D «ram», «pillar», «leader», «terebinth».
- `NO_SIGN`: 12 letters. STEP's rows in the store carry them, but TBESH has no line for them: H430J; H1247G, H1247H, H1247I, H1247J and H1247L (there is no H1247K, in TBESH or in STEP's rows); H3243G, H3243H, H3243I and H3243J; H5892I; H7417I. These letters are never held back.

At 949 numbers every letter is one word. Pairs of letters within one number: 7,561 are tied by column 1, 205 by column 3 alone, and 849 are another word.

## 3. Where TBESH's columns are not plain

Read against the entry's own number, column 1 is of three kinds: the own number with a small letter (1,424 entries), the own number bare (2,925 entries), and another number (1 entry). Numbers mostly hold one kind: 542 hold only small-letter values and 847 only the bare number. Two numbers are edge cases, and the rule reads both as written:

- **H2428 holds its bare number beside small-letter values.** H2428B «Helech», H2428H «strength: rich» and H2428I «strength: worthy» carry «H2428»; H2428A «strength: soldiers» and H2428G «strength» carry «H2428a». Column 1 is compared byte for byte, so «Helech» is the same word as «strength: rich». Through this, 4 lines that give `t` H2428A, H2428G, H2428H and H2428I gain H2428B (the keys are in `t-lines-v1.jsonl`: «חיל» M13 rank 116, «חילות» M25 ranks 2, 3 and 4). It is a branch you can turn off: each of those letters carries reason `SAME_WORD_BY_ESTRONG`, tied by H2428H.
- **H7156H «Kartan» has column 1 «H7178», another number.** Read as written, it is another word than H7156G and H7156I «Kiriathaim» (column 1 «H7156»). No line of v203 touches it.

Column 3 has one edge as well. 15 pairs of letters are tied only because both name one entry of another number. One of them is H3026A «Jegar» («= in Aramaic of») and H3026B «(Ramoth)-sahadutha» («= a Part of»): both name «H7433», whose own TBESH line has the gloss «Ramoth (Gilead)». The rule keeps these ties, because column 3 is read as written and the relation decides nothing. Through such pairs, 3 letters are added on 3 lines: H576B by H576A at 2, and H6163B by H6163A at 1. No letter is added through the H3026 pair.

What column 3 of an «a Part of» line names is not counted, and no clause leans on it. TBESH's own glosses show it is not one thing. Often it is the other piece (H1H «(Huram)-abi» names H2438H «Hiram»; H5674G «(Valley of) the Travelers» names H1516O «Valley»; H6965A «(Leb)-kamai» names H3820B «Leb»). At times it is the whole (H1I «father of» names H22G «Abiel»; H1038 «(Abel)-beth-maacah» names H62 «Abel-beth-maachah»), at times another name of the place (H3092K «(Valley of) Jehoshaphat» names H6939 «Kidron»), and at H518B no name at all (H518B «if: except» names H518A «if»). Mend round 2 withdrew the words that said it names the whole (section 13).

## 4. «a Part of»

TBESH has 102 lines marked «= a Part of», and 88 of them carry a letter. By column 1:

- 70 are `SAME_WORD`.
- 17 are `SAME_WORD_AS_SOME`. Each is the same word as some letters of its number and another word than the rest; the receipt names, for each, the letters it is another word than (`a_part_of_entries_not_SAME_WORD`). For 15 of them every tie is by column 1, and the rest are letters of another column-1 word, as with «Beth-(togarmah)» above. Two are tied across column 1 through column 3:
  - H5674G (column 1 «H5674a») is the same word as H5674B (column 1 «H5674b», column 3 «H5674A»), and another word than H5674H, whose column 1 is also «H5674b».
  - H7704H (column 1 «H7704b») is the same word as H7704M (column 1 «H7704a», column 3 «H7704B»), and another word than H7704A, whose column 1 is also «H7704a».
- 1 is `ANOTHER_WORD`: H6965A «(Leb)-kamai», whose column 1 is «H6965a» while every other letter of H6965 is «H6965b».

So «a Part of» mostly marks the number's own word used inside a name (70 `SAME_WORD`, 17 `SAME_WORD_AS_SOME`). It does not decide: H6965A is another word, and H518B «if: except» is no name. Of the 2,468 letter places where a line holds back a letter of the same word, 1,640 are «a Part of» letters.

## 5. «father»

- H1G «father»: column 2 «H0001G =»; `SAME_WORD`.
- H1H «(Huram)-abi»: column 2 «H0001H = a Part of», column 3 «H2438H, »; `SAME_WORD`.
- H1I «father of»: column 2 «H0001I = a Part of», column 3 «H0022G»; `SAME_WORD`.

All three share column 1 «H0001». In the store, H1G is on 205 TAHOT rows; H1H and H1I are on 1 TAHOT row and 1 TBESH row each. 119 of v203's lines give `t` H1G alone. All 119 hold back H1H and H1I, and in v1.1 all 119 give H1G, H1H and H1I.

## 6. Your measure, taken again on store 88fec6d59737

"STEP's rows" here means the rows of M4 (TAHOT, 36,867 rows carrying `t`) and M19 (TBESH, 1,209 rows carrying `t`). For a line, a **held-back letter** is a letter STEP's rows carry for one of the line's numbers that its `t` leaves out. A held-back letter is of one of four kinds: the same word as a letter the line gives; another word; a letter TBESH has no line for; or a letter of a number in the line's `n` of which its `t` gives no letter at all. The last two are "letters with no sign": TBESH's columns cannot say which word they are.

- Lines that give `t`: 16,273.
- Lines that give fewer letters than STEP's rows carry for their numbers: 4,387 (your figure was 4,380). Each falls in one of three groups:
  - **1,838 hold back a letter of the same word.** This is the case you feared, at 2,468 letter places. Besides that:
    - 197 of these lines also part another word (197 places).
    - 64 also hold back a letter with no sign. 57 of them hold back a letter TBESH has no line for: H430J at 33 places, H5892I at 24. The other 7 have «Arabah» in `n` (H6160) and give only H6155H «willow» in `t`. At those 7 lines all 6 letters of H6160 are held back (42 places), together with H6155G «(Brook of) Willows», the same word as «willow» (the lines and their letters are in `t-lines-v1.jsonl`).
  - **38 hold back a letter with no sign and no letter of the same word.** Each gives only H7417A «Rimmon» and holds back H7417I, which TBESH has no line for (38 places). Each also parts another word: H7417C, H7417G and H7417H, whose column 1 is «H7417c» against H7417A's «H7417a» (114 places; the letters of each line are in `t-lines-v1.jsonl`).
  - **2,511 part only another word,** at 2,912 places. That is the right parting: H2790B «be quiet» against H2790A «to plow/plot», H3384A «to shoot» against H3384B «to show», H1754A «circle» against H1754B «ball».
  - The other 11,886 lines hold back nothing.
- In all, 102 lines hold back a letter with no sign (64 + 38), and none holds back only such letters. Letter places of another word held back, over all lines: 3,223 (2,912 + 197 + 114).
- Lines carrying a letter that no STEP row carries: 813 (your figure was 815), with 283 letters among them. Each is a TBESH lettered line of its own. Of TBESH's 4,350 lettered entries, 1,224 are carried by no STEP row in the store. No STEP row in the store carries such a letter, so this measure, which reads STEP's rows, has nothing of it to compare and counts nothing held back by it. Whether a place's own tag names it was not read here: the lattice's place tags were not read. Where its line holds something back, that is counted in the groups above.

My figures are read on 88fec6d59737, which holds the rows ship 11c landed after your measure (your letter: 651,752 to 653,227 rows). I did not trace the gaps of 7 and 2.

## 7. «to pass» and «(Valley of) the Travelers»: where TBESH's marks and your example disagree

You named «to pass» without H5674G «(Valley of) the Travelers» as a right parting. By TBESH's own columns it is not. H5674G is column 1 «H5674a», the same as H5674A «to pass», and its column 2 is «H5674G = a Part of», the same mark as «(Huram)-abi». The rule cannot part the two cases without reading the English, so v1.1 gives H5674G to the 176 lines that give H5674A, H5674B, H5674C, H5674D and H5674H. Those five letters were all taken by v203 through pointing and kind; H5674H «be arrogant» (column 1 «H5674b») is another word than «to pass», but no line parts it because v203 took both.

If the page wants a name's part held back from a common word's rows, that is a branch you can turn off. Every added letter's reason is in the facts list, and its relation is in the entries file: 1,654 of the 2,769 added letters are «a Part of» letters.

## 8. The widened `t`, ready to land (`facts-slot-t-v1.1.tsv`)

- All 54,261 lines of v203's landing list are here, in the same order with the same keys. Nine columns are as v203 wrote them, except `t` inside `facts_under_entry_ledger`. The second count makes each line by replacing only the `t` array in v203's own text, and it agrees byte for byte.
- Three columns are added: `t_v203`, `t_added`, `t_added_why` (`[letter, reason, by]`: `by` is the letter of v203's `t` that ties it, or `""` for `NO_TBESH_LINE` and `NO_LETTER_TAKEN`).
- 1,946 lines gain 2,769 letters (letter places):
  - 1,913 by column 1 (`SAME_WORD_BY_ESTRONG`)
  - 719 by column 3 (`SAME_WORD_BY_USTRONG`)
  - 95 with no TBESH line (`NO_TBESH_LINE`)
  - 42 with no letter of their number taken (`NO_LETTER_TAKEN`)
- After the widening, no line holds back a letter with no sign, or a letter of the same word as a letter v203 gave. 2,746 lines still part, and each parting is another word than the letters v203 gave, by TBESH's columns. At 4 of them the letter held back, H7704A «Sirion», is the same word as an added letter, H7704M «field»; section 10 says why it is not added.
- All 54,261 rows are served at 88fec6d59737 at their key, rank, m id and sha16, with `n` as v203 gives it (your ship 11). None carries `t` or `b` now.
- Land `t` from `facts_under_entry_ledger`. `b` there is still v203's and waits on ask B.
- **`what_changes` is not the `t` to land.** `facts_now` and `what_changes` are v203's words about the store v203 read, left untouched. So on all 1,946 lines whose `t` is widened, `what_changes` still says «t gains» with v203's `t`, not the widened `t` beside it. Read `t` from `facts_under_entry_ledger`, and what the widening added from `t_added` and `t_added_why`.

## 9. Branches you can turn

Each is named on every added letter:

- `SAME_WORD_BY_USTRONG`: 719 added letters. By the relation TBESH writes for the added letter: 356 «= a Spelling of», 175 «=», 133 «= a form of», 32 «= combination of», 13 «= a Meaning of», 6 «= in Aramaic of», 2 «= a Part of», 1 «= a Name of», 1 «= a group of». Each ties two letters whose column 1 differs, through column 3: spellings, forms (H1760B «to thrust», column 1 «H1760b», column 2 «H1760B = a form of», column 3 «H1760A», tied to H1760A «to thrust», column 1 «H1760a»), combinations, meanings and the rest. None of them crosses from Aramaic to Hebrew. The 6 «= in Aramaic of» letters tie Aramaic to Aramaic (H576B by H576A, both Morph «A:PerP-CS», 2 places) or a name to a name (H2148B by H2148v, both «N:N-M-P», 4 places).
- «a Part of» letters: 1,654 added.
- A name's mark on one side only: 217 added letters, where one Morph carries `N` and the tying letter's does not.
- Aramaic against Hebrew: 0 added letters.
- The edges of section 3: 4 added by H2428's bare column 1, and 3 added through a unit of another number.
- `NO_TBESH_LINE`: 95. `NO_LETTER_TAKEN`: 42.

## 10. What is not added, and why

At 4 lines («שדות» M25 ranks 8 and 9, «שדה» M13 ranks 64 and 65), H7704A «Sirion» stays held back. These lines give H7704B «land: soil», H7704G «land: country» and H7704I «land: wildlife». H7704A shares column 1 «H7704a» with H7704M «field», which the widening adds (H7704M is «= a Spelling of» H7704B). But TBESH ties H7704A to none of the letters v203 gave: its column 1 is not theirs, and its column 3 names «H2768». A chain of two ties is not a sign TBESH writes. Following chains would also join H5674H «be arrogant» to «to pass» through H5674B. The 4 lines are listed in the receipt so the page can see them.

## 11. Files

In `corpus-lane-builds/moses-entry-ledger-v1/tbesh-letters-v1/`:

- `RULE.md`: 22,191 bytes as the builder ran under it, sha256 8f8f7417a0bbeae9989f9bf4b1953efbceee05ae4e07eaf90d5b61871cbcc5ca, the bytes the receipt names. Mend round 2 added one note after those bytes (section 13), so the file is now longer; relay v211 names its bytes.
- `build-tbesh-letters-v1.mjs`: 31,526 bytes, sha256 6f3e7d13c928b5ca8cd2c9489ceddf5944e532082399297208185c0529f85742
- `tbesh-letters-v1.jsonl`: 1,561,269 bytes, 4,350 lines, sha256 e1e006bb37de9789ae3de8c922c5312f0b4f7cb3354f2cfdc7bffc06ca9a7a83
- `t-lines-v1.jsonl`: 4,000,154 bytes, 16,273 lines, sha256 0d84aacbe324c3ca86718bec7859c8f5604c27594f7c8c46f4073eea2e9ece60
- `facts-slot-t-v1.1.tsv`: 10,087,100 bytes, 54,262 lines with the header, sha256 a6e3271cbf7a328ae53d4ce38ea4459662d98c76c334a96f5bc4290684b2344e
- `receipt-v1.json`: 29,691 bytes, sha256 eadc3dde6233506c80f444307ed732a5d3b76ebdd204a2e8d49d167072c0728a
- `verify-tbesh-letters-v1.mjs`: 31,142 bytes, sha256 9f631925ccdb45f906e3c254e61737f5d4e7436fb3f5572f901423c69c899ea3
- `verify-receipt-v1.json`: 1,576 bytes, sha256 0d25c906ccd09f6ed5d402ade57a7abffb5161270e347c7697e2dd5e7e4e24d3. The second count reads TBESH by scanning, finds ties through maps, reads the shards from ff down, and takes v203's `t` from the ledger. It agrees byte for byte on all three files and on all 61 counts.
- `run-two-v1.mjs`, `two-runs-v1.txt`: two runs gave the same bytes.

The verify seats' own folders, `verify-r1/` and `verify-r2/`, are kept as they wrote them.

## 12. What the verify seat found, and what mend round 1 changed

The verify seat recounted every file and every count with its own code and agreed on all of them. It refuted one passage of this answer. The passage said the 38 lines of the no-sign group "hold back only letters with no sign", and put the 95 no-line places and the 7 «Arabah» lines under them. That was false: no line holds back only such letters. The 38 each hold back H7417I and also part another word, and the other no-sign places are on lines that also hold back a letter of the same word. Section 6 now says so, from counts added to the receipt.

It also found these smaller faults, now mended:

- The 7 «Arabah» lines and the 4 H7704A lines were not in the receipt. They are now listed there.
- This answer listed "the other language" among the column-3 additions, which cross no language. Section 9 now gives them by relation and Morph.
- The rule did not name H2428's mixed column 1, H7156H's column 1 that names another number, or the column-3 ties through another number's entry. RULE.md now names them (amendments 4 and 5), and section 3 counts them.
- «H1247G to H1247L» read as if it took in H1247K. The letters are now named one by one.
- On the widened lines, `what_changes` does not match the `t` beside it. Section 8 now says so plainly.

No clause of the signs, the classes, the parting or the widening changed, and the three data files are the same bytes as before. The builder and the second count gained only counts, 61 now where there were 44. Two runs gave the same bytes. A tamper test on four of the new counts was run (`work/tamper-r1.mjs`). That the second count stopped each time and agreed on the untouched receipt was seen on the console only: no file records it, and the copies it used are now one-line stubs. So it is not offered as proof.

## 13. What the second verify seat found, and what mend round 2 changed

The verify seat of round 2 (`verify-r2/`) made every count again with its own code and agreed on all 61 counts and all three files, line for line. It reported its verdict as HELD, and seven minor faults, all in the words or the record. None changes a figure. Its folder records its counts, not its verdict or its findings: this section is their record.

1. «In short» and section 8 said no line holds back a letter of the same word, without «against the letters v203 gave». The 4 H7704A lines of section 10 are the exception. Mended: both now say it.
2. Section 2 quoted «house», which is no H1004 gloss. Mended: it quotes H1004B «house: home», TBESH's own.
3. Section 3 and RULE.md amendment 5 said an «a Part of» line's column 3 names the whole. No count proves it, and TBESH's own glosses show it is not always so. Mended: section 3 now says only what the glosses show, uncounted, and a note at the foot of RULE.md withdraws the words. No clause changes.
4. Section 6 said a letter no STEP row carries «matches no place». The place tags were not read. Mended: section 6 now says only what the measure reads.
5. Section 4 described the 17 `SAME_WORD_AS_SOME` «a Part of» entries too loosely. Mended: it now names the two tied across column 1, H5674G and H7704H.
6. Section 12 named the tamper test's outcome, which no file records. Mended as record: section 12 says so. The test was not run again, since it writes in this folder's `work/`.
7. The builder and the second count hold the capitalised name of the folder above the home folder as a literal in their path guard. It is not a path or a name. Not mended: the receipt, the verify receipt and `two-runs-v1.txt` name those scripts' bytes.

The three data files, the receipt and the verify receipt are the same bytes as after mend round 1.

Read-only on everything outside this folder. Nothing served is changed.
