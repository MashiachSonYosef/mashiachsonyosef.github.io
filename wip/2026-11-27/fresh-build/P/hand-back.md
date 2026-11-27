HAND-BACK FROM BUILDER P: what STEP and MACULA say at every word of our text (the places), with the whole-answer printer

Nothing was committed, pushed or shipped. `reader/zone.html` is untouched. No tracked file changed: the sandbox (git worktree at main ea6e1ad08e1938a5d9d10daeedc819cfaca1ce97) holds 10 new untracked tools and one new untracked data folder. Everything else I wrote is in my work folder.

Order of this message: 0 essentials, 1 sources, 2 the rule of meeting as built, 3 the record, 4 the counts, 5 the check and its proofs, 6 against today's lines by class, 7 the hand reading, 8 the whole-answer printer and what I measured for it, 9 what I could not settle, 10 notes for the lead, 11 sizes, the one command, the paths, 12 THE PRINTED VERSES (what the owner reads first), 13 appendix: every word whose line differs from today's, with cause.

## 0. Essentials

- 305,431 words of ours; every one has a record. 305,429 carry STEP's parts, 305,423 carry MACULA's morphs, 2 carry neither (both named below).
- 39 files, 28,371,887 bytes (aim was under 40 MB), and they hold every one of STEP's 12 columns and MACULA's 32 columns whole for every row met. Nothing is cut, joined or hidden.
- One command makes all of it again and checks it, in about 1 minute 11 seconds. Two runs give byte-identical files. The check says "the places hold".
- MACULA's table as fetched has sha256 965cb0599beed2fe31283b615bcc369178141c0e718a66d97518d94309cfc124: identical to the receipt's 965cb059….
- Against today's lines: 284,456 the same, 20,837 the same but for signs the page hides (together 305,293, the figure COMMON.md gives), and 138 listed one by one with cause (14 of them have no line today, 4 of those the Psalms places).

## 1. Sources (pinned in places/PIN.json with bytes and full sha256)

- STEP: STEPBible-Data at revision 5de0a47f35f0fc13dfe1430d104e5db8a4285f9c (still the provider's head when I looked), the four TAHOT files read from `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s38w/dl-step-latest/`: Gen-Deu 18,190,495 bytes (sha256 7763ef36…216d70), Jos-Est 24,500,357 (b79add01…526a7), Job-Sng 9,540,663 (e0416880…72e8), Isa-Mal 17,977,558 (d5a609f5…f540). 305,648 rows: 305,634 with Hebrew, each cut into the same number of pieces in all four cells, and 14 rows of type Q(K) with empty Hebrew (written, not read).
- MACULA: Clear-Bible/macula-hebrew at revision 47db250bd55d0d8577f2a94fba114ef16c35b23c (the provider's latest, and the revision of the tree's receipt), `macula-hebrew.tsv`, 84,382,719 bytes, sha256 as above. 32 columns, 475,911 morph rows, 305,517 words, Hebrew verse numbers, the read form.
- Ours: only `data/zones/<book>.bin`, and of it only the section labels, the marks, a plain word's letters, and a pair's forms with their roles. Nothing the site serves today was read to build.
- The tool also runs on STEP's older revision b86d26cd: only the four Psalms places change (latest: one row «among the/ peoples» of type V; older: two rows «not» + «peoples»).

## 2. The rule of meeting, as built

Rule id written into every file: `place-answers-rule-v1-a-reading-stands-at-a-word-only-where-a-source-puts-it-there-by-that-sources-own-address`.

Words meet by place, never by letters alone. Letters are compared as consonants only, with the end-of-word letter shapes folded (so לך and לכה are compared as letters, not as shapes).

Lines. For STEP there are two lines: the read line (our plain words and read forms against each row's main Hebrew) and the written line (our plain words and written forms against the Hebrew of the row's «K=» variant where the row has one, else its main Hebrew). For MACULA one line (plain words, read forms, and written-not-read forms), since MACULA carries the read form.

Pass 1. A verse under the same Hebrew number that meets whole stands: every word and every row is accounted for as the same letters, spelled otherwise, or one for two with the same letters. Verses met whole: STEP read line 23,138 of 23,206; STEP written line 23,139; MACULA 23,169.

Pass 2. What stands between verses met whole is laid side by side in order, across verse bounds, by least cost: same letters 0; one for two 0.25 or 0.5; spelled otherwise 1 + 0.5 per letter changed; another word 3.2 and up; no partner 2; and 1 for the items expected to have no partner (STEP's rows of type R and X; our written-not-read form on MACULA's line). "Spelled otherwise" means at most 2 letter changes and at most half the longer word. Order is never broken. Stretches that needed pass 2: 40 (STEP read), 39 (STEP written), 13 (MACULA).

The ways a word meets, as the record says them:
- one for one, the same letters;
- one for one, spelled otherwise: the letters are named among THEIR letters as «+X@n» (they have a letter more at n), «-X@n», «X>Y@n», «X<>Y@n» (two neighbors in the other order);
- one word of ours, two (or three) rows of theirs (with STEP's maqaf mark between the rows where it has one);
- two words of ours, one row of theirs: at STEP's own seam mark, named («/ /» 30 forms, «/־/» 16, «//» 8), or at STEP's «/» part cut, or with no mark of STEP's;
- one row STEP marks as two words (Numbers 7:59);
- another word stands in their text;
- asked, no row.

Written and read. The read form meets the row STEP reads; the written form meets STEP's «K=» variant of that row (its Hebrew, English, tags and grammar, cut as STEP cuts them). A word written and not read meets the «K=» of a row whose Hebrew is empty (7), or, once (2 Samuel 15:21), a row STEP reads as an ordinary L row. A word read and not written is the second word of a row at STEP's own seam mark (9).

Verses numbered otherwise. Where their number differs the record carries their own: 396 words (Exodus 20:13–23 ↔ STEP 20:13–26; Deuteronomy 5:17–30 ↔ 5:17–33; the first words of Numbers 26:1 ↔ STEP's Hebrew 25:19).

STEP's cut on our letters, only where certain. Same letters: STEP's cut is ours. Spelled otherwise: the cut is carried only when the change cannot move a bound: a letter more inside one part and not at or near a bound through a run of the same letter; a letter less that belongs to one part without emptying it; a substitution moves nothing; touching changes only if all inside one part. And where one of STEP's own variants of the row («L=», «K=», or the A/H/B witnesses) writes the row in OUR letters and cuts it into as many parts, that cut is used and said to be the variant's. Where both ways apply (235 words) they agree at every one. Otherwise the record says "not carried" and gives STEP's parts whole beside our uncut word.

262 plain words stand on rows that STEP reads one way and writes another; our letters are the written form's at 248 of them. The record says so and holds both.

## 3. The record

`places/<book>.json.gz`, one per book; the head says the shape in words (schema `PLACE_ANSWERS_PLACES_V1`, the rule, the lists of ways, kinds and roles, the source pins). `sections[s]` is a list of `[entryIndex, kind, forms]`; kind is plain / written and read / written, not read / read, not written; a form is `[role, R, W, M]` = its meeting on STEP's read line, STEP's written line, MACULA's line; a meeting is `[way, letters, spans, cut, share, verse, alike, cutOf]` with trailing zeros trimmed, `[0]` meaning asked, no row. STEP's rows and MACULA's words are stored whole, column by column, with a per-book string table. `openPlaces(path)` in `place-answers-places-v1.mjs` opens a file and gives `record(section, entry)`, `wordAt(section, entry)`, `stepRow(i)`, `maculaWord(w)`.

## 4. The counts (39 books; recounted by the check and equal to the pin)

Words 305,431: plain 304,369; written and read 1,045; read, not written 9; written, not read 8.

With neither source (2): 2 Samuel 7:22 אֱלֹהִים (section 179, entry 4): no row; Psalms 68:27 אֲדֹנָי (section 1035, entry 3): another word stands in STEP's and MACULA's text (יהוה).

STEP rows no word of ours meets (180): type X 152 (Greek-based), type R 27 (restored: Joshua 21:36–37, where our text has its empty-verse marks, and Nehemiah 7:67b), type L 1 (2Sa.7.22#04 אֲדֹנָי). MACULA words unmet: 21.

Every word, by how the editions meet (STEP):

```
302863  plain: one for one, the same letters
   962  written and read: one read form, one written form, each one for one with the same letters (read on STEP's row, written on its «K=»)
   749  plain: one for one, spelled otherwise, cut carried by rule
   396  plain: one for one, the same letters · verse numbered otherwise
   232  plain: one for one, spelled otherwise, cut STEP's own (a variant of the row writes our letters) [our letters are STEP's written form]
    49  written and read: a form spelled otherwise than STEP's (letters named)
    42  plain: one of ours, two rows of theirs, the same letters
    34  written and read: the forms are not one for one (two for one, one for two, a seam of STEP's, or the written form on STEP's main row)
    24  plain: one for one, spelled otherwise, cut not carried
    14  plain: two of ours, one of theirs: at their part cut, the same letters
    10  plain: two of ours, one of theirs: no mark at the seam, the same letters
     9  plain: two of ours, one row: their seam mark between, the same letters [on a row read one way and written another]
     9  read, not written: two of ours, one row: their seam mark between · the same letters
     7  plain: one for one, the same letters [STEP reads the row one way and gives another as written; the read form's]
     7  written, not read: one for one · the same letters · on STEP's written form (K=)
     5  plain: one for one, spelled otherwise, cut carried by rule [on a row read one way and written another]
     4  plain: one for one, spelled otherwise, cut carried by rule [our letters are STEP's written form]
     4  plain: one for one, spelled otherwise, cut STEP's own (a variant of the row writes our letters)
     2  plain: one for one, spelled otherwise, cut not carried [our letters are STEP's written form]
     2  plain: two of ours, one row: their seam mark between, the same letters
     1  plain: no row of STEP's
     1  plain: another word stands in STEP's text
     1  plain: one for one, spelled otherwise, cut STEP's own (a variant of the row writes our letters) [on a row read one way and written another]
     1  plain: one for one, the same letters [STEP reads the row one way and gives another as written; both]
     1  plain: one of ours, one row marked as two words, the same letters
     1  plain: two of ours, one of theirs: no mark at the seam, the same letters [on a row read one way and written another]
     1  written, not read: one for one · the same letters (2 Samuel 15:21, on a row STEP reads)
305431  in all
```

A cross-proof I did not have to build but ran: at the 299,368 forms that meet both sources, STEP's root number is one of MACULA's Strong numbers at 297,174 (99.27%); the rest are lexical neighbors (2895/2896, 582/376), not misplaced words.

## 5. The check, and that it has teeth

`reader/tools/check-place-answers-places-v1.mjs` (marked `// RUN: given`: it needs the pinned source files, which are not in the tree; exit 2 without `--step`/`--macula`, exit 3 with no pin). Laws: P1 the pin and each file's bytes and sha256; P2 the sources given are the pin's by sha256; P3 every word of the zones has a record with the zone's own forms; P4 every STEP cell held is byte for byte the cell of the pinned file's line; P5 the same for MACULA; P6 every meeting is true to the bytes (the way, the letters named, the cut, the variant said to write our letters); P7 rows are met in order; P8 every row and every MACULA word is met or listed unmet; P9 the counts recounted equal the pin's.

Proved against spoiled copies: one STEP string changed in a file fails P4; one meeting changed fails P6 and P9; STEP's older files given in place of the pinned ones fail P2. With my tools present these tree checks still pass: check-ledger-declared-v1, check-no-import-side-effects-v1, check-nothing-hand-typed-v1, check-nothing-hard-wired-v1, check-sidecars-all-named-v1, check-build-derived-v1, check-scope-derived-v1. The tools carry no Hebrew letters in string literals (searched: 0 lines).

## 6. Against today's lines (`S/base/reader/data/resting-lines/<book>.json.gz`), by class

- the same: 284,456
- the same but for signs the page hides: 20,837 (a whole `<…>` part left out 20,085; «¿» 754; `<…>` inside a part 85; a «[…]» part 3; «!» 1; a word can have more than one)
- together 305,293, the figure COMMON.md gives
- listed, 138: different 110 + 2; under a line today drawn once over two words 12; no line today 14

The 138 by cause (each word is listed in section 13):

| words | cause |
|---|---|
| 13 | today's line IS STEP's, with its square brackets taken off (read forms of words written and read); the record keeps STEP's brackets |
| 12 | today's line is drawn once under two words (another source's); the record gives each word its own share of STEP's row(s) |
| 4 | no line today: the four Psalms places (44:15, 57:10, 108:4, 149:7) |
| 7 | no line today: a pair whose read form STEP spells otherwise |
| 3 | no line today: one word of ours, two rows of STEP's |
| 14 | two words of ours, one row of STEP's (parted at STEP's «/» cut, or no mark of STEP's); today another source's |
| 17 | a plain word STEP spells otherwise (ours is the written form, STEP reads another); today MACULA's or Strong's |
| 7 | a pair whose read form STEP spells otherwise; today another row |
| 13 | two words of ours at STEP's own seam mark (a word read and not written, and its neighbor); today another source's |
| 37 | one word of ours, two rows of STEP's (Rabshakeh ×16, Asahel, Malchishua, Mephibosheth, Zurishaddai, Pedahzur, Ichabod, Sharezer, Nebuzaradan) |
| 8 | a word written and not read: today another source's reading of the bare letters («mother», «raw», «sign», «archer», «fifth»); STEP's own word is «if», «except», «please», «<obj.>», «he bend», «five» |
| 3 | the two editions have another word (2 Samuel 7:22 ×2, Psalms 68:27) |

Against the brief's expectation (about 130 not STEP's, 14 with no line, 4 Psalms places): 14 with no line and the 4 Psalms places are exactly so; of the other 124, 13 are in fact STEP's own line with brackets removed, and 111 are another source's or another row's.

## 7. The hand reading

67 sample lines (66 distinct words; 60 were asked), drawn across every hard class: spelled otherwise with the cut carried, with the cut from STEP's variant, with the cut not carried; one for two rows; two for one row at each of STEP's seam marks, at a part cut, with no mark; pairs one for one, with a form spelled otherwise, not one for one; read, not written; written, not read; verses numbered otherwise; the two with no reading. For each I printed the record opened, and beside it STEP's own lines from the pinned file, and read them against each other. Every record says what STEP's row says at that word, with the right letters named and the right seam. The reading found two slips in my printer (a Hebrew-only «;K=» variant printed as "undefined"; variant lines not shown per row at Job 40:6), both fixed, and one slip of STEP's (below). The reading itself is at `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/hand-read.txt`.

Slips of STEP's seen and held whole, not corrected: at 2Sa.18.20#18 the «K=» variant's Hebrew lacks the maqaf its tags name (its cells do not cut alike; the record says so); the English «quano<s>» (2 Kings 6:25), «opressors», «ofK:».

## 8. The whole-answer printer (the lead's addition), and what I measured for it

`reader/tools/say-place-answers-verse-v1.mjs [--tight | --long] <book> <chapter:verse[-verse][#entry]> …` prints for any verse each word of ours and under it: STEP's parts with their English and tags; MACULA's morphs; for each part's tag what each dictionary says by E's bridge (the entry, exact or ambiguous or absent with the reason, its first glosses or renderings in the source's own order); and the senses of a source that cite this place, marked as that source's own answer here.

E's `entries/`, `bridges/` and top-level `PIN.json` are copied unchanged beside my `places/`, so one tree holds the whole of `place-answers-v1`; all 20 files E's pin names are there with the pin's sha256. I did not copy E's library: the printer reads the gzip JSON itself (see note 10.1).

Measured, because the printer depends on it:
- All three citing sources cite under the HEBREW verse number (BDB Open Scriptures 304 against 3; unabridged BDB 10,455 against 381; UBS 16,765 against 3, on the verses where the two numberings differ).
- The UBS word number. It is not the word's place. Reckoned as 2 × the place of MACULA's morph row in the verse, where suffixes are not counted, the Aramaic article ending is not counted, and a word number MACULA skips counts as one, the tag's UBS entry cites the word's reckoned number at 96.44% of the 266,487 words whose entry cites the verse (all morphs counted: 59.6%; suffixes left out: 94.56%; plus skipped numbers: 95.72%; plus the Aramaic article: 96.44%). Because it is reckoned, a UBS sense is laid on a word only when it is corroborated: its entry is one the word's tag reaches, or its lemma has the letters of MACULA's lemma (said as "[by MACULA's lemma]"). Otherwise it is said as a citation of the verse at another number ("UBS (the verse, its word n)"), never as this word's.
- MACULA's SDBH sense mark is held as MACULA gives it and is not used as a bridge, as E said.
- BDB cites a verse, not a word: a BDB "here" stands under each word of the verse whose tag reaches the citing entry.

Three forms of print. The default is "a few lines per source per word" as asked; for the seven passages it is 221,063 bytes, too long for a message. `--tight` runs the sources together, says a tag's dictionaries once and points back, and is 54,239 bytes: that is the one in section 12. Both are on disk (paths in 11).

## 9. What I could not settle

1. 2 Samuel 7:22. Ours reads «יְהֹוָה אֱלֹהִים», STEP and MACULA «אֲדֹנָי יְהוִה». The record pairs our יהוה with STEP's #05 «Yahweh» {H3069} (the same letters), leaves our אלהים with no row, and lists STEP's #04 אֲדֹנָי as unmet. Whether our אלהים is STEP's #05 read aloud is a person's call; I gave no reading where the letters do not meet.
2. Psalms 68:27: ours אֲדֹנָי, theirs יהוה. No reading given.
3. Fourteen spellings that touch a consonant and may be another reading, for a person's eye: 2 Kings 10:2 (כ>ב); 2 Kings 12:22 (יוזכר/יוזבד); 2 Chronicles 34:6 written form (ח>ה); Job 10:11 and 34:37 (ש>ס); Job 22:24, Ezekiel 16:47, Daniel 10:19 (כ>ב); Job 36:12 (ב>כ); Isaiah 27:2 (ר>ד, STEP «wine» H2561); Isaiah 44:25 (ס>ש); Jeremiah 15:8; Daniel 3:5 (ש>ס); Malachi 3:16 (אל/את). Each is recorded as spelled otherwise with the letters named.
4. About 26 plain words (24 + 2, and a few on rows read and written otherwise) where STEP's cut is not carried onto our letters: STEP's parts stand whole, our word uncut.
5. MACULA has no word for 6 of the 8 words written and not read.
6. The UBS word number is reckoned (96.44%), not given by any file I have; hence the corroboration rule.
7. The unabridged BDB is shown as E's bridge gives it: where a number reaches several records the print says "[one of n]" and names the record that cites.
8. Under a tag the "first gloss in the source's own order" can be a homograph's: UBS 000791 «mattock» for את, UBS 000349 «almost» for אין, BDB-un's first of three for היה is «Yahweh». That is what the bridge and the source's order give; the "here" line is the source's own answer at the place.
9. Our edition's own "trivial written/read" flag was not used (160 words; 126 on rows STEP reads and writes otherwise, 34 on plain L rows).

## 10. Notes for the lead

1. E's `place-answers-entries-lib-v1.mjs`, placed in a tree, makes two tree checks fail: check-ledger-declared-v1 (it writes a record with no LEDGER line) and check-no-import-side-effects-v1 (4 writes in an imported module). I removed my copy and inlined the two small readers; both checks pass in my sandbox.
2. My pin is `places/PIN.json`. The top-level `PIN.json` in my tree is E's, unchanged. Joining them is yours.
3. The check is `RUN: given` and needs the source files by path.
4. The four Psalms places depend on STEP's revision; the pin names the revision.
5. Hosts used: only the two providers' public files; no name or detail of the project was sent.

## 11. Sizes, the one command, the paths

Sizes: `places/` 28,413,930 bytes (39 book files 28,371,887; the largest is Psalms at about 1.95 MB; PIN.json about 42 KB). E's copied `entries/` 14,698,469, `bridges/` 2,376,970, top-level `PIN.json` 40,654. Whole folder about 44 MB.

The one command (build, then check):

```
cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader && tools/make-place-answers-places-v1.sh /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s38w/dl-step-latest 5de0a47f35f0fc13dfe1430d104e5db8a4285f9c /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/dl-macula/macula-hebrew.tsv 47db250bd55d0d8577f2a94fba114ef16c35b23c
```

From nothing: `tools/fetch-place-answers-sources-v1.sh <a new folder>` then `tools/make-place-answers-places-v1.sh <that folder>`.

The printed verses again:

```
cd /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader && node tools/say-place-answers-verse-v1.mjs --tight genesis 1:1-5 ruth 1:1 ruth 3:12 amos 7:12 psalms 44:15 ii-samuel 7:22 daniel 2:20
```

Paths, sandbox:
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/data/place-answers-v1/places/` (39 `<book>.json.gz` and `PIN.json`: mine)
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/data/place-answers-v1/entries/`, `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/data/place-answers-v1/bridges/`, `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/data/place-answers-v1/PIN.json` (E's, copied unchanged)
- tools, all in `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/`: `place-answers-sources-v1.mjs` (readers of the zones, TAHOT, MACULA), `place-answers-meet-v1.mjs` (the meeting and the cut rule), `place-answers-places-v1.mjs` (the shape and the opener), `build-place-answers-places-v1.mjs`, `check-place-answers-places-v1.mjs`, `print-place-answers-v1.mjs` (a verse as words, STEP and MACULA only), `say-place-answers-verse-v1.mjs` (the whole answer), `compare-place-answers-with-resting-lines-v1.mjs`, `fetch-place-answers-sources-v1.sh`, `make-place-answers-places-v1.sh`

Paths, work folder:
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/dl-macula/macula-hebrew.tsv` (the MACULA table as fetched)
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/whole-tight.txt` (section 12 byte for byte; 54,239 bytes; sha256 28b95ef5022a8e9a46c8dda750831ecd6de79a0a93bc89e02e493e1b13f7c945)
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/whole-default.txt` (the same seven passages, a few lines per source per word; 221,063 bytes)
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/verses-brief.txt` (the seven passages as words, STEP and MACULA only)
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/differences-short.txt` (section 13), `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/differences-by-cause.txt` (longer), `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/lines-compare.tsv` (the 138 as a table)
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/meetings-not-plain.tsv` (every word that does not meet one for one with the same letters), `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/rollup.txt`, `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/hand-sample.tsv`, `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/out/hand-read.txt`
- `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/logs/` (the build and check run, the comparison, the spoiled-copy runs, the tree checks) and `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s43w/scripts/` (surveys and side checks; `explore-meet.mjs` and `survey-shape.mjs` there are early exploration and stale)

## 12. THE PRINTED VERSES: the whole answer at each word

Genesis 1:1–5, Ruth 1:1, Ruth 3:12, Amos 7:12, Psalms 44:15, 2 Samuel 7:22, Daniel 2:20, in the tight form. How to read it is said once at the end of the print. What to look at first:
- Ruth 3:12 word 5, (אם), written and not read: STEP's row has no Hebrew; the answer is STEP's own «if», from its variants column; MACULA has no word. Today the page says «mother».
- Psalms 44:15 word 6: one row of STEP's of type V, «among the/ peoples», with the other reading («not// peoples») held in its variants; MACULA has two words. Today there is no line.
- 2 Samuel 7:22 words 4 and 5: the two editions differ; word 5 has no reading.
- Ruth 1:1 words 10 and 11: STEP writes one name over two words («Beth-» with its «+», «-lehem»).
- Amos 7:12 word 8 and Daniel 2:20 word 17: the root's tag is STEP's own number; no dictionary has it.
- Genesis 1:2 words 9 and 10: the UBS dictionary cites this very word under two senses («Spirit» and «breeze», «wind»; «God» and «mighty»), and both are shown.

```
=== Genesis 1:1 ===
1. בְּרֵאשִׁ֖ית
   STEP #01=L: «in» H9003 | « beginning» {H7225G}
   MACULA !1: «in» 0871a prep | «beginning» 7225 noun s1
   {H7225G}: TBESH «first: beginning» · Strong OS H7225 beginning | chief(-est)… (4) · LexIndex «beginning» · BDB-OS t.ad.ag «beginning», «chief»… (4) · BDB-un BDB7684 «beginning, chief» · UBS 006658 «first» | «beginning»… (6)
   here: BDB-un 1. a. «beginning» · UBS «beginning»
2. בָּרָ֣א
   STEP #02=L: «he created» {H1254A}
   MACULA !2: «he.created»/«created» 1254 verb qal s1
   {H1254A}: TBESH «to create» · Strong OS H1254 choose | create (creator)… (6) · LexIndex «shape» · BDB-OS b.cw.aa (root) «shape», «create»… (5) · BDB-un [one of 2] BDB1300 «shape, create» ¦ +1 · UBS 001155 «to create» | «to create (an event)», «to cause to happen»… (5)
   here: BDB-un BDB1300 Qal… (2) [1 of 2 records] · UBS «to create»
3. אֱלֹהִ֑ים
   STEP #03=L: «God» {H0430G}
   MACULA !3: «God» 0430 noun s1
   {H0430G}: TBESH «God» · Strong OS H430 angels | × exceeding… (6) · LexIndex «gods» · BDB-OS a.dl.ad 1. a. «rulers», «judges»… (9) · BDB-un [one of 3] BDB430 (no gloss) ¦ +2 · UBS 000396 «heavenly beings» | «god (of someone)», «God (of someone)»… (10)
   here: UBS «God»
4. אֵ֥ת
   STEP #04=L: «<obj.>» {H0853}
   MACULA !4: «(et)»/«» 0853 om
   {H0853}: TBESH «[Obj.]» · Strong OS H853 [as such unrepresented in English] · Strong WS H853 (as such unrepresented in English) · LexIndex «mark of the accusative» · BDB-OS a.gm.aa (root) «mark of the accusative» · BDB-un [one of 2] BDB853 (no gloss) ¦ +1 · UBS 000791 «mattock» | «with», «together with»… (3)
   here: BDB-un BDB853 1. a. [1 of 2 records] · UBS «-»
5. הַשָּׁמַ֖יִם
   STEP #05=L: «the» H9009 | « heavens» {H8064}
   MACULA !5: «the» 1886a art | «heavens» 8064 noun s1
   {H8064}: TBESH «heaven» · Strong OS H8064 air | × astrologer… (3) · LexIndex «heavens» · BDB-OS v.dy.ab «heavens», «sky»… (2) · BDB-un [one of 2] BDB8792 «heavens, sky» ¦ +1 · UBS 007463 «heaven», «sky» | «heavenly beings»
   here: BDB-un BDB8792 the head «heavens, sky»… (2) [1 of 2 records] · UBS «heaven», «sky»
6. וְאֵ֥ת
   STEP #06=L: «and» H9002 | « <obj.>» {H0853}
   MACULA !6: «and» 2050b cj | «(et)»/«» 0853 om
   {H0853}: as at Genesis 1:1 word 4
   here: BDB-un BDB853 1. a. [1 of 2 records] · UBS «-»
7. הָאָֽרֶץ
   STEP #07=L: «the» H9009 | « earth» {H0776G}
   MACULA !7: «the» 1886a art | «earth» 0776 noun s2
   {H0776G}: TBESH «land: country/planet» · Strong OS H776 × common | country… (10) · LexIndex «earth» · BDB-OS a.fx.aa (root) «earth», «land»… (13) · BDB-un [one of 2] BDB780 «earth, land» ¦ +1 · UBS 000714 «earth», «ground», «land», «country», «region», «area» | «short distance»… (3)
   here: UBS «earth», «ground», «land», «country», «region», «area»

=== Genesis 1:2 ===
1. וְהָאָ֗רֶץ
   STEP #01=L: «and» H9002 | « the» H9009 | « earth» {H0776G}
   MACULA !1: «and»/«now» 2050b cj | «the» 1886a art | «earth» 0776 noun s2
   {H0776G}: as at Genesis 1:1 word 7
   here: BDB-un BDB780 1. a. b. «earth» [1 of 2 records] · UBS «earth», «ground», «land», «country», «region», «area»
2. הָיְתָ֥ה
   STEP #02=L: «<it> was» {H1961}
   MACULA !2: «it.was»/«was» 1961 verb qal
   {H1961}: TBESH «to be» · Strong OS H1961 beacon | × altogether… (17) · LexIndex «fall out» · BDB-OS e.bf.aa (root) «fall out», «come to pass», «become», «be»… (17) · BDB-un [one of 3] BDB2100 «Yahweh» ¦ +2 · UBS 001806 «to be», «to become» | «to serve as», «to act as»… (84)
   here: BDB-un BDB2145 Qal… (2) [1 of 3 records] · UBS «to be», «to become»
3. תֹ֙הוּ֙
   STEP #03=L: «formlessness» {H8414}
   MACULA !3: «formlessness»/«formless» 8414 noun s1
   {H8414}: TBESH «formlessness» · Strong OS H8414 confusion | empty place… (9) · LexIndex «formlessness» · BDB-OS w.ag.ab «formlessness», «confusion», «unreality», «emptiness»… (3) · BDB-un BDB9112 «formlessness, confusion, unreality, emptiness» · UBS 007725 «waste», «desolation», «chaos» | «nothing», «useless», «worthless», «in vain», «emptiness»
   here: BDB-un 1. «formlessness» · UBS «waste», «desolation», «chaos»
4. וָבֹ֔הוּ
   STEP #04=L: «and» H9002 | « emptiness» {H0922}
   MACULA !4: «and» 2050b cj | «emptiness»/«empty» 0922 noun s1
   {H0922}: TBESH «void» · Strong OS H922 emptiness | void · LexIndex «emptiness» · BDB-OS b.aj.ab «emptiness» · BDB-un BDB931 «emptiness» · UBS 000856 «emptiness», «wasteland», «desolation»
   here: BDB-un the head «emptiness» · UBS «emptiness», «wasteland», «desolation»
5. וְחֹ֖שֶׁךְ
   STEP #05=L: «and» H9002 | « darkness» {H2822}
   MACULA !5: «and»/«» 2050b cj | «darkness» 2822 noun s1
   {H2822}: TBESH «darkness» · Strong OS H2822 dark(-ness) | night… (3) · LexIndex «darkness» · BDB-OS h.gt.ab «darkness», «obscurity»… (3) · BDB-un [one of 2] BDB3219 «darkness, obscurity» ¦ +1 · UBS 002602 «darkness»
   here: BDB-un BDB3219 the head «darkness, obscurity»… (2) [1 of 2 records] · UBS «darkness»
6. עַל־
   STEP #06=L: «[was] over» {H5921A}
   MACULA !6: «[was].over»/«over» 5921 prep
   {H5921A}: TBESH «upon» · Strong OS H5921 above | according to(-ly)… (26) · LexIndex «above» · BDB-OS p.cs.ar I. «height»… (19) · BDB-un [one of 4] BDB3996 (no gloss) ¦ +3 · UBS: no entry
7. פְּנֵ֣י
   STEP #07=L: «[the] surface of» {H6440J}
   MACULA !7: «the.surface»/«surface» 6440 noun s2
   {H6440J}: TBESH «face: surface» · Strong OS H6440 accept [sign lost in this file; Wikisource writes +] | a-(be-) fore(-time)… (66) · Strong WS H6440 + accept | a-(be-)fore(-time)… (66) · LexIndex «face» · BDB-OS q.bu.ab «face», «faces»… (8) · BDB-un [one of 3] BDB4446 (no gloss) ¦ +2 · UBS 005922 «face» | «person»… (91)
   here: BDB-un BDB6680 5. «face (= surface)»… (2) [1 of 3 records] · UBS «surface», «front»
8. תְה֑וֹם
   STEP #08=L: «[the] deep» {H8415}
   MACULA !8: «of.the.deep»/«deep» 8415 noun s1
   {H8415}: TBESH «abyss» · Strong OS H8415 deep (place) | depth · LexIndex «deep» · BDB-OS w.ah.ab «deep», «sea», «abyss»… (6) · BDB-un BDB9115 «deep, sea, abyss» · UBS 007726 «ocean», «great deep» | «spring»
   here: BDB-un the head «deep, sea, abyss»… (2) · UBS «ocean», «great deep»
9. וְר֣וּחַ
   STEP #09=L: «and» H9002 | « [the] spirit of» {H7307G}
   MACULA !9: «and» 2050b cj | «the.spirit»/«Spirit» 7307 noun s1
   {H7307G}: TBESH «spirit» · Strong OS H7307 air | anger… (13) · LexIndex «breath» · BDB-OS t.bk.ab «breath», «wind», «spirit»… (7) · BDB-un [one of 2] BDB7797 «breath, wind, spirit» ¦ +1 · UBS 006723 «Spirit» | «spirit»… (10)
   here: BDB-un BDB7797 9. e. [1 of 2 records] · UBS «Spirit» · UBS «breeze», «wind»
10. אֱלֹהִ֔ים
   STEP #10=L: «God» {H0430G}
   MACULA !10: «of.God»/«God» 0430 noun s1
   {H0430G}: as at Genesis 1:1 word 3
   here: UBS «God» · UBS «mighty», «exceedingly», «great (in intensity)»
11. מְרַחֶ֖פֶת
   STEP #11=L: «[was] hovering» {H7363B}
   MACULA !11: «[was].hovering»/«hovering» 7363 verb piel s1
   {H7363B}: TBESH «to hover» · Strong OS H7363 flutter | move… (3) · LexIndex «hover» · BDB-OS t.cd.aa (root) «hover», «move gently», «cherish», «brood»… (2) · BDB-un [one of 2] BDB7878 «grow soft, relax» ¦ +1 · UBS 006771 «to tremble» | «to hover»
   here: BDB-OS t.cd.aa, sense Pi: «hovering», «hovering», «brooding» · BDB-un BDB7879 Pi`el [1 of 2 records] · UBS «to hover»
12. עַל־
   STEP #12=L: «over» {H5921A}
   MACULA !12: «over» 5921 prep
   {H5921A}: as at Genesis 1:2 word 6
13. פְּנֵ֥י
   STEP #13=L: «[the] surface of» {H6440J}
   MACULA !13: «the.surface»/«surface» 6440 noun s2
   {H6440J}: as at Genesis 1:2 word 7
   here: BDB-un BDB6680 5. «face (= surface)»… (2) [1 of 3 records] · UBS «surface», «front»
14. הַמָּֽיִם
   STEP #14=L: «the» H9009 | « waters» {H4325G}
   MACULA !14: «of»/«the» 1886a art | «the.waters»/«waters» 4325 noun s1
   {H4325G}: TBESH «water» · Strong OS H4325 piss [sign lost in this file; Wikisource writes +] | wasting… (3) · Strong WS H4325 + piss | wasting… (3) · LexIndex «waters» · BDB-OS m.bt.aa (root) «waters», «water» · BDB-un [one of 2] BDB4535 (no gloss) ¦ +1 · UBS 003956 «water» | «Water Gate»… (4)
   here: BDB-un BDB4612 the head «waters, water»… (2) [1 of 2 records] · UBS «water»

=== Genesis 1:3 ===
1. וַיֹּ֥אמֶר
   STEP #01=L: «and» H9001 | « he said» {H0559}
   MACULA !1: «and» 2050b cj | «he.said»/«said» 0559 verb qal s1
   {H0559}: TBESH «to say» · Strong OS H559 answer | appoint… (38) · LexIndex «utter» · BDB-OS a.ea.aa (root) «utter», «say»… (8) · BDB-un [one of 2] BDB557 «utter, say» ¦ +1 · UBS 000511 «to say», «to speak», «to tell», «to command», «to think», «to call» | «to mention»… (5)
   here: BDB-un BDB557 the head «utter, say»… (2) [1 of 2 records] · UBS «to say», «to speak», «to tell», «to command», «to think», «to call»
2. אֱלֹהִ֖ים
   STEP #02=L: «God» {H0430G}
   MACULA !2: «God» 0430 noun s1
   {H0430G}: as at Genesis 1:1 word 3
   here: UBS «God»
3. יְהִ֣י
   STEP #03=L: «let it be» {H1961}
   MACULA !3: «let.it.be»/«be» 1961 verb qal
   {H1961}: as at Genesis 1:2 word 2
   here: BDB-un BDB2145 Qal… (2) [1 of 3 records] · UBS «to be (in existence)», «to exist»
4. א֑וֹר
   STEP #04=L: «light» {H0216}
   MACULA !4: «light» 0216 noun s1
   {H0216}: TBESH «light» · Strong OS H216 bright | clear… (6) · LexIndex «light» · BDB-OS a.cd.ab «light»… (11) · BDB-un BDB237 «light» · UBS 000206 «light» | «smile», «favor» · UHAL H0216 «light» | «daylight»… (15)
   here: BDB-un the head «light»… (2) · UBS «light»
5. וַֽיְהִי־
   STEP #05=L: «and» H9001 | « there was» {H1961}
   MACULA !5: «and» 2050b cj | «it.was»/«there was» 1961 verb qal
   {H1961}: as at Genesis 1:2 word 2
   here: BDB-un BDB2145 Qal… (2) [1 of 3 records] · UBS «to be (in existence)», «to exist»
6. אֽוֹר
   STEP #06=L: «light» {H0216}
   MACULA !6: «light» 0216 noun s1
   {H0216}: as at Genesis 1:3 word 4
   here: BDB-un the head «light»… (2) · UBS «light»

=== Genesis 1:4 ===
1. וַיַּ֧רְא
   STEP #01=L: «and» H9001 | « he saw» {H7200G}
   MACULA !1: «and» 2050b cj | «he.saw»/«saw» 7200 verb qal s1
   {H7200G}: TBESH «to see: see» · Strong OS H7200 advise self | appear… (32) · LexIndex «see» · BDB-OS t.ab.aa (root) «see»… (20) · BDB-un [one of 3] BDB7656 «see» ¦ +2 · UBS 006639 «to see», «to look», «to notice» | «to be seen», «to become visible», «to appear»… (15)
   here: BDB-un BDB7656 2. «see» [1 of 3 records] · UBS «to see», «to look», «to notice»
2. אֱלֹהִ֛ים
   STEP #02=L: «God» {H0430G}
   MACULA !2: «God» 0430 noun s1
   {H0430G}: as at Genesis 1:1 word 3
   here: UBS «God»
3. אֶת־
   STEP #03=L: «<obj.>» {H0853}
   MACULA !3: «(et)»/«» 0853 om
   {H0853}: as at Genesis 1:1 word 4
   here: UBS «-»
4. הָא֖וֹר
   STEP #04=L: «the» H9009 | « light» {H0216}
   MACULA !4: «the» 1886a art | «light» 0216 noun s1
   {H0216}: as at Genesis 1:3 word 4
   here: BDB-un 1. «light» · UBS «light»
5. כִּי־
   STEP #05=L: «that» {H3588A}
   MACULA !5: «(dm).that»/«that» 3588 cj
   {H3588A}: TBESH «for» · Strong OS H3588 and | (forasmuch, inasmuch, where-) as [sign lost in this file; Wikisource writes +]… (30) · Strong WS H3588 and | + (forasmuch, inasmuch, where-)as… (30) · LexIndex «that» · BDB-OS k.bg.aa (root) «that», «for», «when»… (6) · BDB-un [one of 6] BDB3937 «burning, branding» ¦ +5 · UBS: no entry · UHAL H3588 «forasmuch as»
6. ט֑וֹב
   STEP #06=L: «[it was] good» {H2895}
   MACULA !6: «[it.was].good»/«good» 2896 adj s1
   {H2895}: TBESH «be pleasing» · Strong OS H2895 be (do) better | cheer… (6) · LexIndex «pleasing» · BDB-OS i.ai.aa (root) «pleasing», «good»… (7) · BDB-un [one of 3] BDB3304 «pleasing, good» ¦ +2 · UBS 002668 «to be good» | «to be good»… (6)
   here: UBS «to be good»
7. וַיַּבְדֵּ֣ל
   STEP #07=L: «and» H9001 | « he separated» {H0914}
   MACULA !7: «and» 2050b cj | «he.separated»/«separated» 0914 verb hiphil s1
   {H0914}: TBESH «to separate» · Strong OS H914 (make, put) difference | divide (asunder)… (5) · LexIndex «be divided» · BDB-OS b.ah.aa (root) «be divided», «separate»… (7) · BDB-un BDB919 «be divided, separate» · UBS 000848 «to separate», «to sever» | «to separate oneself», «to defect», «to sequester oneself»… (4)
   here: BDB-un Hiph`il «divide, separate; Perfect»… (2) · UBS «to separate», «to sever»
8. אֱלֹהִ֔ים
   STEP #08=L: «God» {H0430G}
   MACULA !8: «God» 0430 noun s1
   {H0430G}: as at Genesis 1:1 word 3
   here: UBS «God»
9. בֵּ֥ין
   STEP #09=L: «between» {H0996G}
   MACULA !9: «between» 0996 prep
   {H0996G}: TBESH «between» · Strong OS H996 among | asunder… (9) · LexIndex «interval» · BDB-OS b.bo.ac «interval», «space between»… (3) · BDB-un [one of 3] BDB1037 «interval, space between» ¦ +2 · UBS 000925 «between», «among» | «the middle of (an area)»… (6)
   here: UBS «between (two events)»
10. הָא֖וֹר
   STEP #10=L: «the» H9009 | « light» {H0216}
   MACULA !10: «the» 1886a art | «light» 0216 noun s1
   {H0216}: as at Genesis 1:3 word 4
   here: BDB-un 1. «light» · UBS «light»
11. וּבֵ֥ין
   STEP #11=L: «and» H9002 | « between» {H0996G}
   MACULA !11: «and» 2050b cj | «between»/«from» 0996 prep
   {H0996G}: as at Genesis 1:4 word 9
   here: UBS «between (two events)»
12. הַחֹֽשֶׁךְ
   STEP #12=L: «the» H9009 | « darkness» {H2822}
   MACULA !12: «the» 1886a art | «darkness» 2822 noun s1
   {H2822}: as at Genesis 1:2 word 5
   here: BDB-un BDB3219 1. «darkness» [1 of 2 records] · UBS «darkness»

=== Genesis 1:5 ===
1. וַיִּקְרָ֨א
   STEP #01=L: «and» H9001 | « he called» {H7121H}
   MACULA !1: «and» 2050b cj | «he.called»/«called» 7121 verb qal s1
   {H7121H}: TBESH «to call: call by» · Strong OS H7121 bewray (self) | that are bidden… (16) · LexIndex «call» · BDB-OS s.cy.aa (root) «call», «proclaim», «read»… (12) · BDB-un [one of 2] BDB7550 «call, proclaim, read» ¦ +1 · UBS 006561 «to cry out» | «to read», «to recite»… (19)
   here: BDB-un BDB7550 6. e. «give name to» [1 of 2 records] · UBS «to name»
2. אֱלֹהִ֤ים
   STEP #02=L: «God» {H0430G}
   MACULA !2: «God» 0430 noun s1
   {H0430G}: as at Genesis 1:1 word 3
   here: UBS «God»
3. לָאוֹר֙
   STEP #03=L: «<to> the» H9005 | « light» {H0216}
   MACULA !3: «(to)»/«to» 3807a prep | «the» 1886a art | «light» 0216 noun s1
   {H0216}: as at Genesis 1:3 word 4
   here: BDB-un 1. «light» · UBS «light»
4. י֔וֹם
   STEP #04=L: «day» {H3117G}
   MACULA !4: «day» 3117 noun s1
   {H3117G}: TBESH «day» · Strong OS H3117 age | always [sign lost in this file; Wikisource writes +]… (34) · Strong WS H3117 age | + always… (34) · LexIndex «day» · BDB-OS j.ay.aa (root) «day»… (7) · BDB-un BDB3494 «day» · UBS 002858 «day» | «day», «time», «when»… (23)
   here: BDB-un the head «day»… (3) · UBS «day», «time», «when»
5. וְלַחֹ֖שֶׁךְ
   STEP #05=L: «and» H9002 | « <to> the» H9005 | « darkness» {H2822}
   MACULA !5: «and» 2050b cj | «(to)»/«to» 3807a prep | «the» 1886a art | «darkness» 2822 noun s1
   {H2822}: as at Genesis 1:2 word 5
   here: BDB-un BDB3219 1. «darkness» [1 of 2 records] · UBS «darkness»
6. קָ֣רָא
   STEP #06=L: «he called» {H7121H}
   MACULA !6: «he.called»/«called» 7121 verb qal s1
   {H7121H}: as at Genesis 1:5 word 1
   here: BDB-un BDB7550 6. e. «give name to» [1 of 2 records] · UBS «to name»
7. לָ֑יְלָה
   STEP #07=L: «night» {H3915}
   MACULA !7: «night» 3915 noun s1
   {H3915}: TBESH «night» · Strong OS H3915 (mid-)night (season) · Strong WS H3915 ((mid-))night (season) · LexIndex «night» · BDB-OS l.bm.ad «night» · BDB-un [one of 2] BDB4409 «night» ¦ +1 · UBS 003584 «night»
   here: BDB-un BDB4409 the head «night»… (2) [1 of 2 records] · UBS «night»
8. וַֽיְהִי־
   STEP #08=L: «and» H9001 | « there was» {H1961}
   MACULA !8: «and» 2050b cj | «it.was»/«there was» 1961 verb qal
   {H1961}: as at Genesis 1:2 word 2
   here: BDB-un BDB2145 1. a. «arise, appear, come» [1 of 3 records] · UBS «to happen», «to come», «to come to pass», «to take place»
9. עֶ֥רֶב
   STEP #09=L: «evening» {H6153}
   MACULA !9: «evening» 6153 noun s1
   {H6153}: TBESH «evening» · Strong OS H6153 day [sign lost in this file; Wikisource writes +] | even(-ing, tide)… (3) · Strong WS H6153 + day | even(-ing, tide)… (3) · LexIndex «set» · BDB-OS p.ff.ab «(sun)set», «evening»… (4) · BDB-un BDB6363 «(sun)set, evening» · UBS 005654 «evening» | «mixed rabble», «foreigners»
   here: UBS «evening»
10. וַֽיְהִי־
   STEP #10=L: «and» H9001 | « there was» {H1961}
   MACULA !10: «and» 2050b cj | «it.was»/«there was» 1961 verb qal
   {H1961}: as at Genesis 1:2 word 2
   here: BDB-un BDB2145 1. a. «arise, appear, come» [1 of 3 records] · UBS «to happen», «to come», «to come to pass», «to take place»
11. בֹ֖קֶר
   STEP #11=L: «morning» {H1242}
   MACULA !11: «morning» 1242 noun s1
   {H1242}: TBESH «morning» · Strong OS H1242 ( ) day | early… (4) · Strong WS H1242 (+) day | early… (4) · LexIndex «morning» · BDB-OS b.cu.ad «morning»… (3) · BDB-un BDB1293 «morning» · UBS 001148 «morning»
   here: BDB-un the head «morning»… (2) · UBS «morning»
12. י֥וֹם
   STEP #12=L: «day» {H3117G}
   MACULA !12: «day» 3117 noun s1
   {H3117G}: as at Genesis 1:5 word 4
   here: BDB-un the head «day»… (3) · UBS «day», «time», «when»
13. אֶחָֽד
   STEP #13=L: «one» {H0259}
   MACULA !13: «one»/«first» 0259 num
   {H0259}: TBESH «one» · Strong OS H259 a | alike… (22) · LexIndex «one» · BDB-OS a.cj.aa (root) «one»… (7) · BDB-un [one of 3] BDB281 «one» ¦ +2 · UBS 000243 «one» | «each»… (4)
   here: BDB-un BDB281 the head «one»… (2) [1 of 3 records] · UBS «one»

=== Ruth 1:1 ===
1. וַיְהִ֗י
   STEP #01=L: «and» H9001 | « it was» {H1961}
   MACULA !1: «and» 2050b cj | «it.was»/«happened» 1961 verb qal
   {H1961}: as at Genesis 1:2 word 2
   here: BDB-un BDB2145 1. a. «arise, appear, come» [1 of 3 records] · UBS «to happen», «to come to pass»
2. בִּימֵי֙
   STEP #02=L: «in» H9003 | « [the] days of» {H3117G}
   MACULA !2: «in» 0871a prep | «the.days»/«days» 3117 noun s1
   {H3117G}: as at Genesis 1:5 word 4
   here: BDB-un 7. d. «the day of» · UBS «days», «time», «period», «season», «life»
3. שְׁפֹ֣ט
   STEP #03=L: «[the] judging of» {H8199}
   MACULA !3: «of.the.judging»/«ruled» 8199 verb qal s5
   {H8199}: TBESH «to judge» · Strong OS H8199 avenge [sign lost in this file; Wikisource writes +] | × that condemn… (10) · Strong WS H8199 + avenge | X that condemn… (10) · LexIndex «judge» · BDB-OS v.fg.aa (root) «judge», «govern»… (7) · BDB-un [one of 2] BDB8955 «judge, govern» ¦ +1 · UBS 007570 «to judge», «to pronounce judgement», «to administer justice», «to decide (a case)» | «to play the judge», «to play the ruler»… (7)
   here: BDB-un BDB8955 Qal… (2) [1 of 2 records] · UBS «to judge», «to rule», «to govern»
4. הַשֹּׁפְטִ֔ים
   STEP #04=L: «the» H9009 | « judges» {H8199}
   MACULA !4: «of»/«the» 1886a art | «the.judges»/«judges» 8199 verb qal s1
   {H8199}: as at Ruth 1:1 word 3
   here: BDB-un BDB8955 Qal… (2) [1 of 2 records] · UBS «judge», «ruler»
5. וַיְהִ֥י
   STEP #05=L: «and» H9001 | « it was» {H1961}
   MACULA !5: «and»/«that» 2050b cj | «it.was»/«there was» 1961 verb qal
   {H1961}: as at Genesis 1:2 word 2
   here: BDB-un BDB2145 1. a. «arise, appear, come» [1 of 3 records] · UBS «to happen», «to come», «to come to pass», «to take place»
6. רָעָ֖ב
   STEP #06=L: «a famine» {H7458}
   MACULA !6: «a.famine»/«famine» 7458 noun s1
   {H7458}: TBESH «famine» · Strong OS H7458 dearth | famine… (4) · LexIndex «famine» · BDB-OS t.di.ab «famine», «hunger» · BDB-un BDB7988 «famine, hunger» · UBS 006855 «hunger», «famine»
   here: UBS «hunger», «famine»
7. בָּאָ֑רֶץ
   STEP #07=L: «in the» H9003 | « land» {H0776G}
   MACULA !7: «in» 0871a prep | «the» 1886a art | «land» 0776 noun s1
   {H0776G}: as at Genesis 1:1 word 7
   here: UBS «earth», «ground», «land», «country», «region», «area»
8. וַיֵּ֨לֶךְ
   STEP #08=L: «and» H9001 | « he went» {H1980G}
   MACULA !8: «and» 2050b cj | «he.went»/«went» 1980 verb qal s1
   {H1980G}: TBESH «to go: went» · Strong OS H1980 (all) along | apace… (41) · LexIndex «go» · BDB-OS e.bn.aa (root) «go», «come», «walk»… (13) · BDB-un [one of 3] BDB2162 «go, come, walk» ¦ +2 · UBS 001824 «to move», «to go», «to walk», «to flow» | «to go», «to come»… (19)
   here: UBS «to go», «to come»
9. אִ֜ישׁ
   STEP #09=L: «a man» {H0376G}
   MACULA !9: «a.man»/«man» 0376 noun s1
   {H0376G}: TBESH «man» · Strong OS H376 also | another… (24) · LexIndex «man» · BDB-OS a.da.ab «man» · BDB-un BDB389 «man» · UBS 000354 «person», «someone», «man» | «people», «men»… (12)
   here: UBS «person», «someone», «man»
10. מִבֵּ֧ית
   STEP #10=L: «from» H9006 | « Beth-» {H1035G}+
   MACULA !10: «from»/«of» 4480 prep | «Bethlehem»/«» 1035 noun
   {H1035G}: TBESH «Bethlehem» · Strong OS H1035 Bethlehem · Strong WS H1035 Beth-lehem · LexIndex «Bethlehem» · BDB-OS b.bp.az (no def tagged) · BDB-un BDB1069 (no gloss) · UBS 000961 «Bethlehem» | «Bethlehem»
   here: BDB-un proper name, of a location 1. «in Judah» · UBS «Bethlehem»
11. לֶ֣חֶם
   STEP #11=L: «-lehem» {H1035G}
   MACULA !11: «Bethlehem»/«» 1035 noun
   {H1035G}: as at Ruth 1:1 word 10
   here: BDB-un proper name, of a location 1. «in Judah» · UBS (the verse, its word 36) «Bethlehem»
12. יְהוּדָ֗ה
   STEP #12=L: «Judah» {H3063G}
   MACULA !12: «Judah» 3063 noun
   {H3063G}: TBESH «Judah» · Strong OS H3063 Judah · LexIndex «Judah» · BDB-OS j.av.ai «Judah»… (5) · BDB-un [one of 2] BDB3477 «Judah» ¦ +1 · UBS 002823 «Judah» | «Judah»… (6)
   here: UBS (the verse, its word 38) «Judah»
13. לָגוּר֙
   STEP #13=L: «to» H9005 | « sojourn» {H1481A}
   MACULA !13: «to» 3807a prep | «sojourn» 1481 verb qal s1
   {H1481A}: TBESH «to sojourn» · Strong OS H1481 abide | assemble… (12) · LexIndex «sojourn» · BDB-OS c.bf.aa (root) «sojourn»… (4) · BDB-un [one of 3] BDB1562 «sojourn» ¦ +2 · UBS 001357 «to sojourn», «to live as alien», «to dwell» | «to plot», «to conspire»… (3)
   here: BDB-un BDB1562 1. «sojourn» [1 of 3 records] · UBS «to sojourn», «to live as alien», «to dwell»
14. בִּשְׂדֵ֣י
   STEP #14=L: «in» H9003 | « [the] region<s> of» {H7704G}
   MACULA !14: «in» 0871a prep | «the.region(s)»/«country» 7704 noun s3
   {H7704G}: TBESH «land: country» · Strong OS H7704 country | field… (6) · LexIndex «field» · BDB-OS u.ak.ac 1. «field»… (3) · BDB-un [one of 2] BDB8170 «field, land» ¦ +1 · UBS [one of 2] 006988 «countryside», «bush», «uninhabited land» | «field», «landholding», «property»… (6) ¦ +1
   here: BDB-un BDB8171 the head… (2) [1 of 2 records] · UBS «territory»
15. מוֹאָ֔ב
   STEP #15=L: «Moab» {H4124G}
   MACULA !15: «of.Moab»/«Moab» 4124 noun
   {H4124G}: TBESH «Moab» · Strong OS H4124 Moab · LexIndex «Moab» · BDB-OS m.as.ac «Moab»… (3) · BDB-un BDB4536 «Moab» · UBS [one of 2] 003769 «Moab» | «Moab» ¦ +1
   here: BDB-un 2. b. · UBS (the verse, its word 48) «Moab»
16. ה֥וּא
   STEP #16=L: «he» {H1931}
   MACULA !16: «he» 1931 pron
   {H1931}: TBESH «he/she/it» · Strong OS H1931 he | as for her… (14) · LexIndex «he» · BDB-OS e.aw.aa (root) «he», «she», «it»… (3) · BDB-un [one of 3] BDB2086 (no gloss) ¦ +2 · UBS [one of 2] 001778 «he», «that (one)» ¦ +1
   here: UBS (the verse, its word 50) «he», «that (one)»
17. וְאִשְׁתּ֖וֹ
   STEP #17=L: «and» H9002 | « wife» {H0802H} | « his» H9023
   MACULA !17: «and» 2050b cj | «wife» 0802 noun s1 | «his» 2050c pron
   {H0802H}: TBESH «woman: wife» · Strong OS H802 (adulter) ess | each… (10) · Strong WS H802 (adulter)ess | each… (10) · LexIndex «woman» · BDB-OS a.eq.ab «woman», «wife», «female»… (5) · BDB-un [one of 2] BDB612 «woman, wife, female» ¦ +1 · UBS 000737 «woman», «wife» | «mate»… (4)
   here: UBS «woman», «wife»
18. וּשְׁנֵ֥י
   STEP #18=L: «and» H9002 | « [the] two» {H8147}
   MACULA !18: «and» 2050b cj | «the.two»/«two» 8147 num
   {H8147}: TBESH «two» · Strong OS H8147 both | couple… (10) · LexIndex «two» · BDB-OS v.em.ab «two» · BDB-un [one of 2] BDB8886 «two» ¦ +1 · UBS 007533 «two»
   here: UBS «two»
19. בָנָֽיו
   STEP #19=L: «sons» {H1121A} | « his» H9023
   MACULA !19: «sons» 1121 noun s1 | «his» 2050c pron
   {H1121A}: TBESH «son: child» · Strong OS H1121 afflicted | age… (49) · Strong WS H1121 + afflicted | age… (49) · LexIndex «son» · BDB-OS b.ca.aa (root) «son»… (8) · BDB-un [one of 3] BDB1160 (no gloss) ¦ +2 · UBS [one of 2] 001040 «son», «child», «descendant» | «young», «colt», «calf», «foal», «cub»… (15) ¦ +1
   here: UBS (the verse, its word 60) «son», «child», «descendant»

=== Ruth 3:12 ===
1. וְעַתָּה֙
   STEP #01=L: «and» H9002 | « therefore» {H6258}
   MACULA !1: «and» 2050b cj | «therefore»/«now» 6258 adv
   {H6258}: TBESH «now» · Strong OS H6258 henceforth | now… (5) · LexIndex «now» · BDB-OS p.dt.ae «now» · BDB-un BDB6199 «now» · UBS 005749 «now» | «right now»… (3)
   here: UBS «therefore», «now then», «and now», «so then», «so», «so now»
2. כִּ֣י
   STEP #02=L: «for» {H3588A}
   MACULA !2: «(dm)»/«though» 3588 cj
   {H3588A}: as at Genesis 1:4 word 5
   here: BDB-un BDB3995 1. e. «yea, surely, certainly»… (2) [1 of 6 records]
3. אׇמְנָ֔ם
   STEP #03=L: «truly» {H0551}
   MACULA !3: «truly»/«true» 0551 cj
   {H0551}: TBESH «truly» · Strong OS H551 indeed | no doubt… (4) · LexIndex «verily» · BDB-OS a.dy.al «verily», «truly» · BDB-un BDB538 «verily, truly» · UBS 000503 «it is true», «truly», «indeed»
   here: BDB-un the head «verily, truly» · UBS «it is true», «truly», «indeed»
4. כִּ֥י
   STEP #04=L: «that» {H3588A}
   MACULA !4: «(dm)»/«that» 3588 cj
   {H3588A}: as at Genesis 1:4 word 5
   here: BDB-un BDB3995 1. e. «yea, surely, certainly»… (2) [1 of 6 records]
5. (אם)   (written, not read)
   the written form (אם)
      STEP Rut.3.12#05=Q(K) · one for one · the same letters · STEP's WRITTEN form, from its variants column · «if» H0518B
           the variant taken: K= 'im (אִם) "if" (H0518B=HTc)
           row Rut.3.12#05=Q(K) whole: (no Hebrew) | [ ] |  |  | meaning variants: K= 'im (אִם) "if" (H0518B=HTc) | spelling variants: L= אם ¦ ;
      MACULA: no word of MACULA's
      {H0518B}: TBESH «if: except» · Strong OS H518 (and, can-, doubtless, if, that) (not) | + but… (24) · LexIndex «that if» · BDB-OS k.bg.ab 1. a. «that if»… (5) · BDB-un [one of 5] BDB511 (no gloss) ¦ +4 · UBS 000479 «if», «when», «whether» | «even if», «though», «even though»… (9) · UHAL H0518 «that if» | «for if»… (12)
      here: BDB-un BDB3995 1. e. «yea, surely, certainly»… (2) [1 of 5 records]
6. גֹאֵ֖ל
   STEP #06=L: «[am] a kinsman-redeemer» {H1350A}
   MACULA !6: «[am].a.kinsman-redeemer»/«redeemer» 1350 verb qal s3
   {H1350A}: TBESH «to redeem: redeem» · Strong OS H1350 × in any wise | × at all… (9) · LexIndex «redeem» · BDB-OS c.ac.aa (root) «redeem», «act as kinsman»… (6) · BDB-un BDB1405 «redeem, act as kinsman» · UBS [one of 2] 001241 «redemption», «deliverance» ¦ +1
   here: BDB-un 1. «act as kinsman, do the part of next of kin» · UBS «kinship-redeemer», «to fulfil one's duty as kinsman», «avenger»
7. אָנֹ֑כִי
   STEP #07=L: «I» {H0595}
   MACULA !7: «I» 0595 pron
   {H0595}: TBESH «I» · Strong OS H595 I | me… (3) · LexIndex «I» · BDB-OS a.ei.aa (root) «I» · BDB-un [one of 2] BDB593 «I» ¦ +1 · UBS 000544 «I»
   here: UBS «I»
8. וְגַ֛ם
   STEP #08=L: «and» H9002 | « also» {H1571}
   MACULA !8: «and» 2050b cj | «also»/«but» 1571 cj
   {H1571}: TBESH «also» · Strong OS H1571 again | alike… (18) · LexIndex «also» · BDB-OS c.ck.ab «also», «moreover», «yea» · BDB-un BDB1688 (no main gloss; the head opens with «addition») · UBS 001439 «also», «too», «even», «moreover», «what is more», «what is worse», «furthermore», «besides», «and», «both … and» | «so», «therefore»… (4)
   here: UBS «also», «too», «even», «moreover», «what is more», «what is worse», «furthermore», «besides», «and», «both … and»
9. יֵ֥שׁ
   STEP #09=L: «there» {H3426}
   MACULA !9: «there.[is]»/«there is» 3426 adv
   {H3426}: TBESH «there» · Strong OS H3426 (there) are | (he, it, shall, there, there may, there shall, there should) be… (14) · LexIndex «being» · BDB-OS j.dr.ae «being», «substance», «existence»… (3) · BDB-un [one of 3] BDB3773 «being, substance, existence» ¦ +2 · UBS: no entry
   here: BDB-un BDB3773 2. b. «there is» [1 of 3 records]
10. גֹּאֵ֖ל
   STEP #10=L: «[is] a kinsman-redeemer» {H1350A}
   MACULA !10: «a.kinsman-redeemer»/«redeemer» 1350 verb qal s3
   {H1350A}: as at Ruth 3:12 word 6
   here: BDB-un 1. «act as kinsman, do the part of next of kin» · UBS «kinship-redeemer», «to fulfil one's duty as kinsman», «avenger»
11. קָר֥וֹב
   STEP #11=L: «near» {H7138}
   MACULA !11: «near»/«closer» 7138 adj s9
   {H7138}: TBESH «near» · Strong OS H7138 allied | approach… (11) · LexIndex «near» · BDB-OS s.da.ae «near»… (5) · BDB-un BDB7562 «near» · UBS 006574 «near», «close» | «near», «close»… (9)
   here: BDB-un 2. c. · UBS «close relative», «kinsman»
12. מִמֶּֽנִּי
   STEP #12=L: «more than» {H4480A} | « I» H9030
   MACULA !12: «more»/«than» 4480 prep | «than.I»/«I» 2967a pron
   {H4480A}: TBESH «from» · Strong OS H4480 above | after… (17) · LexIndex «out of» · BDB-OS m.cl.aa (root) «out of», «from», «on account of», «off», «on the side of», «since», «above», «than», «so that not»… (13) · BDB-un [one of 3] BDB4709 «out of, from, on account of, off, on the side of, since, above, than, so that not» ¦ +2 · UBS: no entry

=== Amos 7:12 ===
1. וַיֹּ֤אמֶר
   STEP #01=L: «and» H9001 | « he said» {H0559}
   MACULA !1: «and»/«then» 2050b cj | «he.said»/«said» 0559 verb qal s1
   {H0559}: as at Genesis 1:3 word 1
   here: UBS «to say», «to speak», «to tell», «to command», «to think», «to call»
2. אֲמַצְיָה֙
   STEP #02=L: «Amaziah» {H0558J}
   MACULA !2: «Amaziah» 0558 noun
   {H0558J}: TBESH «Amaziah» · Strong OS H558 Amaziah · LexIndex «Amaziah» · BDB-OS a.dz.ah «has been mighty» · BDB-un BDB555 (no gloss) · UBS 000510 «Amaziah» | «Amaziah»… (4)
   here: BDB-un 4. · UBS «Amaziah»
3. אֶל־
   STEP #03=L: «to» {H0413}
   MACULA !3: «to» 0413 prep
   {H0413}: TBESH «to(wards)» · Strong OS H413 about | according to… (25) · LexIndex «motion to» · BDB-OS a.di.aa (root) «motion to», «direction towards»… (10) · BDB-un BDB420 «denoting motion to or direction towards» · UBS: no entry
4. עָמ֔וֹס
   STEP #04=L: «Amos» {H5986}
   MACULA !4: «Amos» 5986 noun
   {H5986}: TBESH «Amos» · Strong OS H5986 Amos · LexIndex «Amos» · BDB-OS p.dl.ab «Amos» · BDB-un BDB6160 «Amos the prophet» · UBS 005499 «Amos»
   here: BDB-un the head «Amos the prophet» · UBS «Amos»
5. חֹזֶ֕ה
   STEP #05=L: «O seer» {H2374}
   MACULA !5: «O.seer»/«seer» 2374 noun s1
   {H2374}: TBESH «seer» · Strong OS H2374 agreement | prophet… (5) · LexIndex «seer» · BDB-OS h.bp.ac «seer»… (3) · BDB-un BDB2661 «seer» · UBS 002191 «seer» | «contract», «agreement»
   here: BDB-un the head «seer»… (2) · UBS «seer»
6. לֵ֥ךְ
   STEP #06=L: «go» {H1980G}
   MACULA !6: «go» 1980 verb qal s3
   {H1980G}: as at Ruth 1:1 word 8
   here: UBS «to go», «to come»
7. בְּרַח־
   STEP #07=L: «flee» {H1272}
   MACULA !7: «flee»/«flee away» 1272 verb qal s1
   {H1272}: TBESH «to flee» · Strong OS H1272 chase (away); drive away | fain… (8) · LexIndex «go through» · BDB-OS b.dc.aa (root) «go through», «flee»… (6) · BDB-un BDB1320 «go through, flee» · UBS 001173 «to flee» | «to put to flight», «to chase away»… (4)
   here: BDB-un 2. «flee» · UBS «to flee»
8. לְךָ֖
   STEP #08=L: «<for>» H9005 | « yourself» {H9031}
   MACULA !8: «(for»/«for» 3807a prep | «yourself»/«you» 3509b pron
9. אֶל־
   STEP #09=L: «to» {H0413}
   MACULA !9: «to» 0413 prep
   {H0413}: as at Amos 7:12 word 3
10. אֶ֣רֶץ
   STEP #10=L: «[the] land of» {H0776G}
   MACULA !10: «the.land»/«land» 0776 noun s1
   {H0776G}: as at Genesis 1:1 word 7
   here: UBS «earth», «ground», «land», «country», «region», «area»
11. יְהוּדָ֑ה
   STEP #11=L: «Judah» {H3063G}
   MACULA !11: «of.Judah»/«Judah» 3063 noun
   {H3063G}: as at Ruth 1:1 word 12
   here: UBS «Judah»
12. וֶאֱכׇל־
   STEP #12=L: «and» H9002 | « eat» {H0398}
   MACULA !12: «and» 2050b cj | «eat»/«earn» 0398 verb qal s1
   {H0398}: TBESH «to eat» · Strong OS H398 × at all | burn up… (12) · LexIndex «eat» · BDB-OS a.dc.aa (root) «eat»… (13) · BDB-un [one of 2] BDB398 «eat» ¦ +1 · UBS 000372 «to eat» | «to make (someone) eat», «to give (someone) to eat»… (10)
   here: BDB-un BDB398 1. «eat» [1 of 2 records] · UBS «to eat»
13. שָׁ֣ם
   STEP #13=L: «there» {H8033G}
   MACULA !13: «there» 8033 adv
   {H8033G}: TBESH «there» · Strong OS H8033 in it | thence [sign lost in this file; Wikisource writes +]… (5) · Strong WS H8033 in it | + thence… (5) · LexIndex «there» · BDB-OS v.dv.aa (root) «there», «thither» · BDB-un [one of 2] BDB8775 «there, thither» ¦ +1 · UBS 007442 «there» | «here ... there ...»… (5)
   here: UBS «there»
14. לֶ֔חֶם
   STEP #14=L: «bread» {H3899H}
   MACULA !14: «bread» 3899 noun s1
   {H3899H}: TBESH «food: bread» · Strong OS H3899 (shew-) bread | × eat… (7) · Strong WS H3899 ((shew-))bread | X eat… (7) · LexIndex «bread» · BDB-OS l.bi.ab «bread», «food» · BDB-un [one of 2] BDB4396 «bread, food» ¦ +1 · UBS 003569 «bread», «food» | «bread of the Presence», «sacred bread»… (3)
   here: UBS «bread», «food»
15. וְשָׁ֖ם
   STEP #15=L: «and» H9002 | « there» {H8033G}
   MACULA !15: «and» 2050b cj | «there» 8033 adv
   {H8033G}: as at Amos 7:12 word 13
   here: UBS «there»
16. תִּנָּבֵֽא
   STEP #16=L: «you will prophesy» {H5012}
   MACULA !16: «you.will.prophesy»/«prophesy» 5012 verb niphal s1
   {H5012}: TBESH «to prophesy» · Strong OS H5012 prophesy(-ing) | make self a prophet · LexIndex «prophesy» · BDB-OS n.ai.ac «prophesy»… (4) · BDB-un [one of 2] BDB4929 «prophesy» ¦ +1 · UBS 004601 «to prophesy»
   here: BDB-un BDB4929 1. b. [1 of 2 records] · UBS «to prophesy»

=== Psalms 44:15 ===
1. תְּשִׂימֵ֣נוּ
   STEP #01=L: «you have made» {H7760A} | « us» H9035
   MACULA !1: «you»/«made» 7760 verb qal s2 | «have.made.us»/«us» 5105a pron
   {H7760A}: TBESH «to set: make» · Strong OS H7760 × any wise | appoint… (46) · LexIndex «put» · BDB-OS u.ap.aa (root) «put», «place», «set»… (23) · BDB-un [one of 3] BDB8185 «put, place, set» ¦ +2 · UBS [one of 2] 007032 «to take position» | «to place», «to put», «to lay», «to set», «to keep»… (38) ¦ +1
   here: UBS «to turn into», «to change»
2. מָ֭שָׁל
   STEP #02=L: «a byword» {H4912}
   MACULA !2: «a.byword»/«byword» 4912 noun s1
   {H4912}: TBESH «proverb» · Strong OS H4912 byword | like… (4) · LexIndex «proverb» · BDB-OS m.dv.ab «proverb», «parable», «parallelism» · BDB-un BDB4874 «proverb, parable» · UBS 004504 «saying», «oracle», «proverb», «byword», «parable» | «Mashal»
   here: BDB-un 2. «by-word» · UBS «saying», «oracle», «proverb», «byword», «parable»
3. בַּגּוֹיִ֑ם
   STEP #03=L: «among the» H9003 | « nations» {H1471A}
   MACULA !3: «among» 0871a prep | «the» 1886a art | «nations» 1471 noun s1
   {H1471A}: TBESH «nation» · Strong OS H1471 Gentile | heathen… (4) · LexIndex «nation» · BDB-OS c.ba.ag «nation», «people» · BDB-un [one of 3] BDB1551 «nation, people» ¦ +2 · UBS [one of 2] 001347 «nation» | «people», «band» ¦ +1
   here: UBS «nation»
4. מְנֽוֹד־
   STEP #04=L: «a shaking of» {H4493}
   MACULA !4: «a.shaking»/«shaking» 4493 noun s1
   {H4493}: TBESH «shaking» · Strong OS H4493 shaking · LexIndex «a shaking» · BDB-OS n.bu.af «a shaking», «wagging» · BDB-un BDB5039 «a shaking, wagging» · UBS 004112 «shaking of the head > laughingstock»
   here: BDB-un the head «a shaking, wagging» · UBS «shaking of the head > laughingstock»
5. רֹ֝֗אשׁ
   STEP #05=L: «head» {H7218A}
   MACULA !5: «of.head»/«head» 7218 noun s1
   {H7218A}: TBESH «head» · Strong OS H7218 band | beginning… (20) · LexIndex «head» · BDB-OS t.ad.aa (root) 1. a. «head»… (16) · BDB-un [one of 2] BDB7678 «head» ¦ +1 · UBS 006653 «head» | «beginning»… (17)
   here: BDB-un BDB7678 8. «see, further» [1 of 2 records] · UBS «head»
6. בַּלְאֻמִּֽים
   STEP #06=V: «among the» H9003 | « peoples» {H3816}
        row Psa.44.14(44.15)#06=V whole: בָּ/לְאֻמִּים\׃ | among the/ peoples | H9003/{H3816}\H9016 | HRd/Ncfpa | meaning variants: L= bal/-/'u.Mim (בַּל/־/אֻמִּֽים\׃) "not// peoples" (H1077//H0523=Hn//Ncfpa)
   MACULA PSA 44:15!6 + PSA 44:15!7 · one word of ours is two (or three) rows of theirs · the same letters · «not»/«among» 1077 adv | «peoples» 0523 noun
   {H3816}: TBESH «people» · Strong OS H3816 nation | people · LexIndex «people» · BDB-OS l.ag.ab «people» · BDB-un BDB4286 «people» · UBS 003497 «people»
   here: BDB-un the head «people» · UBS «tribe», «people» [by MACULA's lemma]

=== II Samuel 7:22 ===
1. עַל־
   STEP #01=L: «there-» {H5921A}
   MACULA !1: «therefore»/«for this» 5921 prep
   {H5921A}: as at Genesis 1:2 word 6
2. כֵּ֥ן
   STEP #02=L: «-fore» {H3651C}
   MACULA !2: «» 3651 adv
   {H3651C}: TBESH «so» · Strong OS H3651 after that (this, -ward, -wards) [sign lost in this file; Wikisource writes +] | as... as… (20) · Strong WS H3651 + after that (this, -ward, -wards) | as... as… (20) · LexIndex «so» · BDB-OS k.by.aa (root) «so» · BDB-un [one of 5] BDB3945 «right, veritable, honest» ¦ +4 · UBS 003347 «thus», «in this manner», «in this way», «so» | «pedestal», «base»… (10)
   here: BDB-un BDB4076 3. e. [1 of 5 records] · UBS «thus», «in this manner», «in this way», «so»
3. גָּדַ֖לְתָּ
   STEP #03=L: «you are great» {H1431}
   MACULA !3: «you.are.great»/«great» 1431 verb qal s1
   {H1431}: TBESH «to magnify» · Strong OS H1431 advance | boast… (17) · LexIndex «grow up» · BDB-OS c.aq.aa (root) «grow up», «become great»… (12) · BDB-un BDB1494 «grow up, become great» · UBS 001312 «to be large», «to grow large» | «to cause to grow», «to let grow», «to make big»… (12)
   here: BDB-un 2. e. «of God» · UBS «to be great», «to become great»
4. יְהֹוָ֣ה
   STEP #05=L: «Yahweh» {H3069}
   MACULA !5: «Yahweh»/«GOD» 3069 noun
   {H3069}: TBESH «YHWH/God» · Strong OS H3069 God · LexIndex «God» · BDB-OS e.az.ae «Yahweh», «the one bringing into being», «life-giver» · BDB-un [one of 2] BDB2100 «Yahweh» ¦ +1 · UBS 002827 «YHWH»
   here: BDB-un BDB2100 II. 1. h. [1 of 2 records] · UBS «YHWH»
5. אֱלֹהִ֑ים
   STEP: no row of STEP's
   MACULA: no word of MACULA's
6. כִּֽי־
   STEP #06=L: «for» {H3588A}
   MACULA !6: «(dm)»/«for» 3588 cj
   {H3588A}: as at Genesis 1:4 word 5
7. אֵ֣ין
   STEP #07=L: «there not» {H0369}
   MACULA !7: «there.[is].not»/«there is no» 0369 adv
   {H0369}: TBESH «nothing» · Strong OS H369 else | except… (19) · LexIndex «nothing» · BDB-OS a.cz.aa (root) «nothing», «nought»… (5) · BDB-un [one of 2] BDB374 (no gloss) ¦ +1 · UBS 000349 «almost», «nearly» | «from where?»
8. כָּמ֗וֹךָ
   STEP #08=L: «[is] like» {H3644G} | « you» H9031
   MACULA !8: «like» 3644 prep | «you» 3509b pron
   {H3644G}: TBESH «like» · Strong OS H3644 according to | (such) as (it were, well as)… (7) · LexIndex «like» · BDB-OS k.ab.ac «like», «as», «when», «the like of what» · BDB-un BDB3872 «like, as, when» · UBS [one of 2] 003218 «as», «like» | «as», «like»… (10) ¦ +1
   here: UBS «as», «like»
9. וְאֵ֤ין
   STEP #09=L: «and» H9002 | « there not» {H0369}
   MACULA !9: «and» 2050b cj | «there.[is].not»/«there is no» 0369 adv
   {H0369}: as at II Samuel 7:22 word 7
10. אֱלֹהִים֙
   STEP #10=L: «[is] a God» {H0430G}
   MACULA !10: «a.God»/«God» 0430 noun s1
   {H0430G}: as at Genesis 1:1 word 3
   here: BDB-un BDB2100 II. 1. h. [1 of 3 records] · UBS «god (of someone)», «God (of someone)»
11. זוּלָתֶ֔ךָ
   STEP #11=L: «except» {H2108} | « you» H9031
   MACULA !11: «except»/«besides» 2108 prep | «you» 3509b pron
   {H2108}: TBESH «exception» · Strong OS H2108 beside | but… (4) · LexIndex «removal» · BDB-OS g.au.ab «removal», «except», «only», «save that» · BDB-un BDB2318 «removal», «except, only, save that» · UBS 001951 «except», «besides»
   here: BDB-un the head «removal»… (2) · UBS «except», «besides»
12. בְּכֹ֥ל
   STEP #12=L: «in» H9003 | « all» {H3605}
   MACULA !12: «in»/«according to» 0871a prep | «all» 3605 noun
   {H3605}: TBESH «all» · Strong OS H3605 (in) all (manner, (ye)) | altogether… (12) · LexIndex «the whole» · BDB-OS k.bn.ab «the whole», «all»… (4) · BDB-un [one of 2] BDB4037 «the whole, all» ¦ +1 · UBS: no entry
13. אֲשֶׁר־
   STEP #13=L: «that» {H0834A}
   MACULA !13: «that» 0834 rel
   {H0834A}: TBESH «which» · Strong OS H834 × after | × alike… (20) · LexIndex «who» · BDB-OS a.gk.aa (root) (no def tagged) · BDB-un [one of 8] BDB844 (no gloss) ¦ +7 · UBS 000770 «that», «which», «where», «when», «how» | «that»… (4)
   here: UBS «that», «which», «where», «when», «how»
14. שָׁמַ֖עְנוּ
   STEP #14=L: «we have heard» {H8085G}
   MACULA !14: «we.have.heard»/«heard» 8085 verb qal s1
   {H8085G}: TBESH «to hear: hear» · Strong OS H8085 × attentively | call (gather) together… (29) · LexIndex «hear» · BDB-OS v.ed.aa (root) «hear»… (6) · BDB-un [one of 2] BDB8819 «hear» ¦ +1 · UBS 007479 «to hear», «to listen» | «to cause to hear», «to proclaim, to announce»… (10)
   here: UBS «to hear», «to listen»
15. בְּאׇזְנֵֽינוּ
   STEP #15=L: «with» H9003 | « ears» {H0241G} | « our» H9025
   MACULA !15: «with» 0871a prep | «ears» 0241 noun s1 | «our» 5105a pron
   {H0241G}: TBESH «ear» · Strong OS H241 advertise [sign lost in this file; Wikisource writes +] | audience… (6) · Strong WS H241 + advertise | audience… (6) · LexIndex «ear» · BDB-OS a.cg.ab «ear»… (4) · BDB-un BDB263 (no gloss) · UBS 000226 «ear»
   here: BDB-un 2. a. · UBS «ear»

=== Daniel 2:20 ===
1. עָנֵ֤ה
   STEP #01=L: «[was] replying» {H6032}
   MACULA !1: «[was].replying»/«said» 6032 verb peal s1
   {H6032}: TBESH «to answer» · Strong OS H6032 answer | speak · LexIndex «answer» · BDB-OS xp.ai.aa (root) «answer» · BDB-un BDB9780 «answer» · UBS 005543 «to answer», «to respond», «to speak up» | «to testify», «to give evidence»… (11)
   here: BDB-un 2. «respond» · UBS «to answer», «to respond», «to speak up»
2. דָֽנִיֵּאל֙
   STEP #02=L: «Daniel» {H1841H}
   MACULA !2: «Daniel» 1841 noun
   {H1841H}: TBESH «Daniel» · Strong OS H1841 Daniel · LexIndex «Daniel» · BDB-OS xd.ah.ae «Daniel» · BDB-un BDB9445 «Daniel» · UBS 001695 «Daniel» | «Daniel»… (4)
   here: UBS «Daniel»
3. וְאָמַ֔ר
   STEP #03=L: «and» H9002 | « [was] saying» {H0560}
   MACULA !3: «and.[was]»/«and» 2050d cj | «saying»/«said» 0560 verb peal s1
   {H0560}: TBESH «to say» · Strong OS H560 command | declare… (5) · LexIndex «say» · BDB-OS xa.at.aa (root) «say», «tell», «command» · BDB-un BDB9309 «say, tell, command» · UBS 000511 «to say», «to speak», «to tell», «to command», «to think», «to call» | «to mention»… (5)
   here: UBS «to say», «to speak», «to tell», «to command», «to think», «to call»
4. לֶהֱוֵ֨א
   STEP #04=L: «let it be» {H1934}
   MACULA !4: «let.it.be»/«be» 1934 verb peal s7
   {H1934}: TBESH «to be» · Strong OS H1934 be | become… (23) · LexIndex «come to pass» · BDB-OS xe.ae.aa (root) «come to pass», «become», «be» · BDB-un BDB9470 «come to pass, become, be» · UBS: no entry
   here: BDB-un Pe`al… (2)
5. שְׁמֵ֤הּ
   STEP #05=L: «name» {H8036} | « his» H9023
   MACULA !5: «name» 8036 noun s1 | «his» 1886h pron
   {H8036}: TBESH «name» · Strong OS H8036 name · LexIndex «name» · BDB-OS xv.at.ac «name» · BDB-un BDB9963 «name» · UBS 007443 «name» | «name», «authority»… (3)
   here: BDB-un the head «name» · UBS «name», «self»
6. דִּֽי־
   STEP #06=L: «of» {H1768}
   MACULA !6: «(diy).of»/«of» 1768 rel
   {H1768}: TBESH «that» · Strong OS H1768 × as | but… (15) · LexIndex «who» · BDB-OS xd.ag.aa (root) «who», «which», «that», «that», «because» · BDB-un [one of 2] BDB9440 «who, which, that», «that, because» ¦ +1 · UBS: no entry
   here: BDB-un BDB9440 2.… (2) [1 of 2 records]
7. אֱלָהָא֙
   STEP #07=L: «true God» {H0426} | « the» H9010
   MACULA !7: «the.true»/«god» 0426 noun s1 | «God»/«the» 0001b art
   {H0426}: TBESH «god» · Strong OS H426 God | god · LexIndex «god» · BDB-OS xa.an.ab «god», «God» · BDB-un BDB9300 «god, God» · UBS 000391 «divine being», «heavenly being», «god» | «God»
   here: BDB-un the head «god, God» · UBS «God»
8. מְבָרַ֔ךְ
   STEP #08=L: «[be] blessed» {H1289}
   MACULA !8: «[be].blessed»/«blessed» 1289a verb pael s2
   {H1289}: TBESH «to bless» · Strong OS H1289 bless | kneel · LexIndex «kneel» · BDB-OS xb.am.aa (root) «kneel», «bless»… (4) · BDB-un BDB9387 «kneel, bless» · UBS 001187 «to cause to kneel down» | «to kneel down»… (5)
   here: BDB-un 2. · UBS «to bless», «to praise», «to greet», «to congratulate», «to commend»
9. מִן־
   STEP #09=L: «from» {H4481}
   MACULA !9: «from» 4481 prep
   {H4481}: TBESH «from» · Strong OS H4481 according | after… (16) · LexIndex «from» · BDB-OS xm.ak.aa (root) «from», «out of», «by», «by reason of», «at», «more then» · BDB-un BDB9670 «from, out of, by, by reason of, at, more than» · UBS: no entry
   here: BDB-un 4. «from»
10. עָלְמָ֖א
   STEP #10=L: «<the>» {H5957} | « antiquity» H9010
   MACULA !10: «(the)»/«forever» 5957 noun s1 | «antiquity»/«the» 0001b art
   {H5957}: TBESH «perpetuity» · Strong OS H5957 for (n-)ever (lasting) | old · Strong WS H5957 for ((n-))ever (lasting) | old · LexIndex «perpetuity» · BDB-OS xp.ag.ac «perpetuity», «antiquity» · BDB-un BDB9773 «perpetuity, antiquity» · UBS 005476 «eternity», «forever»
   here: BDB-un the head «perpetuity, antiquity» · UBS «eternity», «forever»
11. וְעַ֣ד
   STEP #11=L: «and» H9002 | « to» {H5705}
   MACULA !11: «and» 2050d cj | «to» 5705 prep
   {H5705}: TBESH «till» · Strong OS H5705 × and | at… (8) · Strong WS H5705 (the edition writes no sign for the list here; the definition is held whole) · LexIndex «even to» · BDB-OS xp.ac.aa (root) «even to», «until» · BDB-un BDB9752 «even to, until» · UBS 005244 «to», «as far as» | «until», «up to»… (21)
   here: BDB-un 1. c. «until» · UBS «until», «up to»
12. עָלְמָ֑א
   STEP #12=L: «<the>» {H5957} | « perpetuity» H9010
   MACULA !12: «(the)»/«forever» 5957 noun s1 | «perpetuity»/«the» 0001b art
   {H5957}: as at Daniel 2:20 word 10
   here: BDB-un the head «perpetuity, antiquity» · UBS «eternity», «forever»
13. דִּ֧י
   STEP #13=L: «that» {H1768}
   MACULA !13: «that»/«for» 1768 rel
   {H1768}: as at Daniel 2:20 word 6
   here: BDB-un BDB9440 2.… (2) [1 of 2 records]
14. חׇכְמְתָ֛א
   STEP #14=L: «<the>» {H2452} | « wisdom» H9010
   MACULA !14: «(the)»/«wisdom» 2452 noun s1 | «wisdom»/«the» 0001b art
   {H2452}: TBESH «wisdom» · Strong OS H2452 wisdom · LexIndex «wisdom» · BDB-OS xh.ai.ab «wisdom» · BDB-un BDB9526 «wisdom» · UBS 002268 «wisdom», «intelligence», «skill»
   here: BDB-un the head «wisdom» · UBS «wisdom», «intelligence», «skill»
15. וּגְבוּרְתָ֖א
   STEP #15=L: «and» H9002 | « <the>» {H1370} | « power» H9010
   MACULA !15: «and» 2050d cj | «(the)»/«power» 1370 noun s1 | «power»/«the» 0001b art
   {H1370}: TBESH «might» · Strong OS H1370 might · LexIndex «might» · BDB-OS xc.ab.ac «might» · BDB-un BDB9401 «might» · UBS 001260 «greatness», «ability», «might» | «great ones», «mighty people», «able people»… (3)
   here: BDB-un the head «might» · UBS «greatness», «ability», «might»
16. דִּ֥י
   STEP #16=L: «which» {H1768}
   MACULA !16: «that» 1768 rel
   {H1768}: as at Daniel 2:20 word 6
   here: BDB-un BDB9440 2.… (2) [1 of 2 records]
17. לֵֽהּ־
   STEP #17=L: «[is] to» H9005 | « him» {H9033}
   MACULA !17: «[is].to»/«to» 3807b prep | «him» 1886h pron
18. הִֽיא
   STEP #18=L: «it» {H1932}
   MACULA !18: «it»/«she» 1931b pron
   {H1932}: TBESH «he/she/it» · Strong OS H1932 × are | it… (3) · LexIndex «he» · BDB-OS xe.af.aa (root) «he», «she», «it» · BDB-un [one of 2] BDB9314 «they, those» ¦ +1 · UBS 001778 «he», «that (one)»
   here: BDB-un BDB9471 the head «he, she, it» [1 of 2 records] · UBS «she», «that (one)» [by MACULA's lemma]

Said once for the print above:
  STEP and MACULA: only what is not «one for one, the same letters» is said of a meeting; a part is «English as STEP writes it» and its tag, the root's tag in curly brackets (its Hebrew and grammar are in the default print); a morph is «gloss»/«english» (once where the two are the same), MACULA's Strong number, class, stem, sense number (its Hebrew, lemma, SDBH mark and domains are in the default print).
  {tag}: what each dictionary says under the tag by the bridge: the entry, exact unless [one of n] (ambiguous: the number reaches n entries; the first is shown) or a reason is given; then its first glosses or renderings in the source's own order, cut short with the count in brackets. Strong OS is Strong's in the Open Scriptures file; Strong WS (the Wikisource edition) is printed only where its list reads otherwise.
  here: the source's own citation of this place. BDB-OS, BDB-un: the entry the tag reaches cites this verse (its sense or point; the first, with the count where more; the record named where the bridge is ambiguous). UBS: a sense of the tag's entry cites this very word (verse and word); [by MACULA's lemma] where the tag reaches no UBS entry and the sense's entry has the letters of MACULA's lemma; «UBS (the verse, its word n)» where the tag's entry cites the verse at another number than this word's. A prefix's own UBS citation is in the default print.
  STEP's own numbers for a prefix, a suffix or a mark (no dictionary of Strong's numbers has them), with TBESH's gloss: H9001 «&» · H9002 «and» · H9003 «in/on/with» · H9005 «to/for» · H9006 «from» · H9009 «[the]» · H9010 «[the]» · H9023 «his» · H9025 «our» · H9030 «me» · H9031 «you» · H9033 «him» · H9035 «us»
  Not printed under a tag where the source has the entry but its file is not on hand: UHAL, Strong WS.
```

## 13. Appendix: every word whose line differs from today's, with both lines and the cause

Addresses are book chapter:verse#entry index in our zones. "today" is the line in the resting-lines tree, with the source it names; "STEP" is what the record holds, parts joined with « + ».

```
[13] today's line is STEP's with its square brackets taken off (the read form of a word written and read) · the record keeps STEP's brackets
  Exo 4:2#3: today «what + is this?» (STEP); STEP «what + [is] this?»
  2Sa 5:2#9: today «you were + the + one who led out» (STEP); STEP «you were + the + [one who] led out»
  2Sa 8:3#11: today «at + the river + Euphrates» (STEP); STEP «at + [the] river + Euphrates»
  2Sa 21:12#21: today «they had hung up + them + there + towards + the Philistines» (STEP); STEP «they had hung up + them + there + <towards> + [the] Philistines»
  2Ki 18:27#23, Isa 36:12#22: today «the water of + feet + their» (STEP); STEP «[the] water of + feet + their»
  1Ch 27:12#5: today «of the + Ben + jaminites» (STEP); STEP «of the + Ben + jaminite[s]»
  Neh 2:13#16: today «they + were broken down» (STEP); STEP «they + [were] broken down»
  Psa 10:10#4: today «an army + of disheartened people» (STEP); STEP «an army + of disheartened [people]»
  Isa 3:15#0: today «what + is to + you?» (STEP); STEP «what + [is] to + you?»
  Jer 14:14#17: today «and + an idol + and + the deceitfulness of» (STEP); STEP «and + an idol + and + [the] deceitfulness of»
  Ezk 8:6#6: today «what + are they?» (STEP); STEP «what + [are] they?»
  Ezk 42:9#0: today «and + was from + under + the + rooms» (STEP); STEP «and + [was] from + under + the + rooms»

[12] today's line is drawn once under two words (another source's) · the record gives each word its own share of STEP's row(s)
  Psa 9:1#2: today «‘To die for the son’» (Lexical Index); STEP «alumoth»
  Psa 9:1#3: today «‘To die for the son’» (Lexical Index); STEP «labben»
  Sng 6:12#5: today «Amminadib» (TBESH); STEP «people of»
  Sng 6:12#6: today «Amminadib» (TBESH); STEP «prince»
  Jer 39:3#8, Jer 39:3#16: today «Nergal-sar-ezer» (TBESH); STEP «Nergal-»
  Jer 39:3#9, Jer 39:3#17: today «Nergal-sar-ezer» (TBESH); STEP «Shar- + ezer»
  Dan 1:13#7, Dan 1:13#8, Dan 1:15#13, Dan 1:15#14: today «food» (SDBH); STEP «[the] delicaci[es] of»

[4] no line today · the four Psalms places: STEP's latest file writes one row here («among the/ peoples»); the older file had two («not» + «peoples»)
  Psa 44:15#5, Psa 57:10#5, Psa 108:4#5, Psa 149:7#4: today «»; STEP «among the + peoples»

[7] no line today · a word written and read whose read form STEP spells otherwise (the letters named in the record)
  Jdg 16:26#8: today «»; STEP «and + let feel + me»
  1Sa 25:18#10: today «»; STEP «prepared»
  2Sa 5:8#13: today «»; STEP «[who are] hated»
  2Ki 2:16#25: today «»; STEP «the + valleys»
  2Ki 16:6#13: today «»; STEP «and + Edomites»
  Isa 10:13#12: today «»; STEP «and + provisions + their»
  Jer 48:5#2: today «»; STEP «<the> + Luhith»

[3] no line today · one word of ours, two rows of STEP's
  1Sa 14:49#5: today «»; STEP «and + Malki- + Shua»
  Job 18:15#2: today «»; STEP «because + not + [belonging] to + him»
  Psa 102:4#5: today «»; STEP «like + a hearth»

[14] two words of ours, one row of STEP's (parted at STEP's «/» cut, or no mark of STEP's) · today's line is another source's; the record gives each word its share of STEP's row
  2Ki 6:25#15: today «bear» (Strong OS); STEP «quano<s>»
  1Ch 20:4#1, 2Ch 20:1#1, 2Ch 24:4#1: today «behind» (Strong WS); STEP «after»
  1Ch 20:4#2, 2Ch 20:1#2, 2Ch 20:35#1, 2Ch 24:4#2, Ezr 3:5#1: today «thus» (Strong OS); STEP «this»
  Psa 106:1#1: today «Lord» (MACULA); STEP «Yahweh»
  Isa 9:5#17: today «father» (MACULA); STEP «father of»
  Isa 9:5#18: today «everlasting» (MACULA); STEP «perpetuity»
  Dan 1:8#8: today «portion (provision) of meat» (Strong WS); STEP «[the] delicaci[es] of»
  Dan 1:16#4: today «delicaci[es] + their» (STEP row); STEP «delicaci[es]»

[17] a plain word STEP spells otherwise (our letters are the written form's, STEP reads another) · today's line is another source's; the record gives STEP's read row with the letters named
  Exo 32:17#5: today «as + shouted + they» (MACULA); STEP «in + shouting + its»
  Num 3:51#4: today «the + redemption» (MACULA); STEP «the + ransom<s>»
  1Sa 3:18#13: today «in + sight + him» (MACULA); STEP «in + eyes + his»
  1Sa 18:14#3: today «undertakings + his» (MACULA); STEP «ways + his»
  2Ki 19:23#21: today «farthest + its» (MACULA); STEP «end + its»
  Pro 23:3#1: today «desire» (MACULA); STEP «you crave»
  Jer 2:3#4: today «harvest + his» (MACULA); STEP «produce + his»
  Jer 22:18#23: today «majesty + his» (MACULA); STEP «splendor + his»
  Lam 3:25#2: today «to + wait for + him» (MACULA); STEP «to + [those who] wait for + him»
  Ezk 3:20#17: today «righteous deeds + his» (MACULA); STEP «righteousness<es> + his»
  Ezk 31:18#24, Ezk 32:32#14, Ezk 39:11#24: today «hordes + his» (MACULA); STEP «multitude + his»
  Ezk 40:31#0: today «and + portico + its» (MACULA); STEP «and + porches + its»
  Ezk 43:11#11: today «design + its» (MACULA); STEP «designs + its»
  Hab 3:4#8: today «power + his» (MACULA); STEP «strength + his»
  Zep 2:9#26: today «nation» (Strong OS); STEP «nation + my»

[7] a word written and read whose read form STEP spells otherwise · today's line is another row (the written form's or another source's); the record gives STEP's read row
  Rut 4:5#12: today «attain» (Strong WS); STEP «you have acquired»
  2Sa 18:12#4: today «and + [will belong] to + him» (STEP row); STEP «and + if»
  2Ki 22:5#0: today «and + they have put + it» (STEP row); STEP «and + let them put + it»
  2Ch 34:9#26: today «and + they turned back» (STEP row); STEP «and + they returned of»
  Est 4:4#0: today «when + came» (MACULA); STEP «and + they came»
  Psa 140:10#4: today «they have covered + them» (STEP row); STEP «may it cover + them»
  Dan 5:16#4: today «be able» (Strong WS); STEP «you are able»

[13] two words of ours, one row of STEP's with its own seam mark (a word read and not written, and the word before it) · today's line is another source's; the record gives each word its side of the seam
  Jdg 20:13#13: today «would» (MACULA); STEP «they were willing»
  Jdg 20:13#14: today «descendants» (MACULA); STEP «[the] descendants»
  Rut 3:5#4: today «say» (MACULA); STEP «you are saying»
  Rut 3:17#7: today «said» (MACULA); STEP «he said»
  2Sa 16:23#7: today «inquired» (MACULA); STEP «he enquires»
  2Sa 16:23#8: today «one» (MACULA); STEP «anyone»
  2Sa 18:20#17: today «for» (MACULA); STEP «since»
  2Sa 18:20#18: today «thus» (Strong OS); STEP «<thus>»
  2Ki 19:31#8: today «LORD» (MACULA); STEP «Yahweh»
  2Ki 19:31#9: today «hosts» (MACULA); STEP «of hosts»
  Jer 31:38#2: today «coming» (MACULA); STEP «[are] coming»
  Jer 50:29#12: today «there ~ be» (MACULA); STEP «it be»
  Jer 50:29#13: today «for + her» (MACULA); STEP «to <the> + it»

[37] one word of ours, two rows of STEP's · today's line is another source's (or the two rows run together); the record gives STEP's two rows as they stand
  Num 2:12#9, Num 10:19#7: today «Zurishaddai» (Strong OS); STEP «Zuri- + -shaddai»
  Num 7:54#7, Num 10:23#7: today «Pedahzur» (Strong OS); STEP «Pedah- + -zur»
  1Sa 4:21#2: today «Ichabod’s» (MACULA row); STEP «I- + -chabod»
  1Sa 31:2#13, 1Ch 8:33#13, 1Ch 9:39#13, 1Ch 10:2#13: today «Malchishua» (Strong OS); STEP «Malki- + Shua»
  2Sa 2:30#14, 1Ch 2:16#7: today «and + Asahel» (STEP row); STEP «and + Asah- + -el»
  2Sa 3:27#16, 2Sa 23:24#0, 1Ch 11:26#2, 1Ch 27:7#3: today «Asahel» (Strong OS); STEP «Asah- + -el»
  2Sa 16:1#7, 2Sa 21:7#3: today «Mephibosheth» (Strong OS); STEP «Mephi- + -bosheth»
  2Sa 16:4#7: today «[belonged] to + Mephibosheth» (STEP row); STEP «[belonged] to + Mephi- + -bosheth»
  2Ki 18:17#10, 2Ki 18:19#2, 2Ki 18:26#7, 2Ki 18:27#2, 2Ki 18:28#1, 2Ki 18:37#20, 2Ki 19:4#8, 2Ki 19:8#1, Isa 36:2#5, Isa 36:4#2, Isa 36:11#5, Isa 36:12#1, Isa 36:13#1, Isa 36:22#21, Isa 37:4#7, Isa 37:8#1: today «Rabshakeh, a Babylonian official» (Strong OS); STEP «[the] chief + commander»
  Jer 39:9#15: today «Nebuzaradan» (Strong OS); STEP «Nebuzar- + -adan»
  Jer 39:13#8: today «Sharezer» (MACULA row); STEP «Shar- + ezer»
  Zec 7:2#3: today «Sharezer» (Strong OS); STEP «Shar- + -ezer»

[8] a word written and not read · today's line is another source's reading of the bare letters; the record gives STEP's own word for the written form
  Rut 3:12#4: today «mother» (Strong OS); STEP «if»
  2Sa 13:33#14, 2Sa 15:21#11, Jer 39:12#10: today «mother» (Strong OS); STEP «except»
  2Ki 5:18#23: today «raw» (Strong OS); STEP «please»
  Jer 38:16#9: today «sign» (Strong OS); STEP «<obj.>»
  Jer 51:3#2: today «archer» (Strong WS); STEP «he bend»
  Ezk 48:16#11: today «fifth» (Strong OS); STEP «five»

[3] the two editions have another word here · today's line is another source's; the record gives no reading of STEP's as this word's
  2Sa 7:22#3: today «God» (Strong OS); STEP «Yahweh»
  2Sa 7:22#4: today «judges» (Strong OS); STEP «»
  Psa 68:27#3: today «Yahweh» (STEP row); STEP «»
```

End of hand-back.