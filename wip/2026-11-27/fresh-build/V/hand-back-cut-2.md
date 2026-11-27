## Second cut: all seven are built; one of them misses its mark at 3 words

The one command, run on a folder fetched from nothing, ends "everything holds" in 181 s. The browser walks pass on 13,497 + 2,754 words with no page error. The one miss is in item 4: the line under a word equals the live reader's at 305,290 of the 305,293 words where P's comparison says "same", so the comparison tool exits 1 on three named words.

Nothing is committed or pushed. No tracked file changed (`git diff --stat` is empty at ea6e1ad08e; the 30 new paths are all untracked). `reader/zone.html` and every served page are untouched, the trial page is linked from nowhere, and the local server is stopped.

### The seven

**1. A record of another word is never shown at this word.**
- **Rule as built:** a record of the unabridged Brown-Driver-Briggs is this word's where the record's own headword (consonants only, final shapes folded) is one of three: STEP's brief lexicon's headword for the number, the Lexical Index's headword for the number, or MACULA's dictionary form on this very word (only from the word's parts that carry the same number).
- **Under «At this word»:** a citing record that fails the test is not drawn.
- **Under «In the dictionaries»:** where a number stands on several records, the own-headword records come first and the rest wait behind one button, «Other records this number also stands on: n». A number's only record still shows when it fails, with a sentence saying its headword is spelled otherwise.
- **«Here» lines:** 159,642 before, 155,027 after. 4,718 lines are withheld on 4,136 words (1,241 under a number of one record, 3,477 under a number of several); item 6 added 103. MACULA's form alone keeps 533 lines.
- **Ruth 3:12 word 5:** no Brown-Driver-Briggs line under «At this word»; below, "This number stands on 5 records of this file. None has this word's own headword.", with the five behind the button.

Numbers that stand on several records (2,954), parted by STEP's and the Lexical Index's headword:

| Parted to | Numbers | Words |
|---|---|---|
| one record | 1,418 | 75,425 |
| several records | 1,479 | 107,659 |
| none | 57 | 2,223 |

Word by word on the page, where MACULA's form also speaks, the same three are 75,076 / 108,422 / 1,856. The two totals differ by 47 words, which I did not trace.

Numbers of one record: the record is the word's for 8,072 numbers (111,480 words) and is not for 395 numbers (2,121 words).

**2. The UBS dictionary under a number.**
- **Rule as built:** the base form holding the sense that cites this very word leads. Where no sense cites the word, the base forms stand in the file's order and the card says so. The other base forms wait behind «Other words under this entry: n».
- **Before:** the entry's first base form always led.
- **After:** of 306,929 word-rows with a UBS entry, 259,169 have a sense cited at the very word. In 67,435 of those the entry holds several base forms, and in 20,632 the leading one is no longer the entry's first.
- **No sense at the very word:** 47,760 rows, of which 5,055 are on entries of several base forms, shown in the file's order.
- **Genesis 1:1 word 4:** leads with base form 3 of 3 (the preposition, gloss «-»); «mattock» is behind the button.

**3. Strong's one line is his meaning.**
- **Rule as built:** the line is his meaning field with its tagged glosses marked. Where he gives none, his derivation is shown and said as such. His list stays in the opened entry.
- **Before:** the first of his list at all 299,655 word-rows; «beacon» led H1961 on 3,561 words.
- **After:** his meaning at 297,289 rows, his derivation at 2,366. 8,435 of his 8,674 entries have a meaning.

**4. STEP's signs under a word follow the live reader.**
- **Rule as built:** the page uses the live reader's own functions (`printedForm`, `signOnly`, `joinDrawn` from `gloss-store-v1.mjs`). A part that is only a sign is drawn as a gap; where every part is a sign, they stand. This is judged over a run of words tied by a maqaf, pairs of written and read forms included. The card's STEP row keeps STEP's words exactly.
- **Before:** every sign was printed, so the line could not match at the words where the live reader hides one.
- **After:** 20,863 forms are drawn with a gap (6,596 are nothing but gaps); 597 forms whose every part is a sign stand.
- **Against the live lines:** of 305,431 words, 305,290 are equal character for character (20,836 of them with a gap). 141 differ: 138 are on P's list, 3 are not.
- **The three:**
  - Judges 19:13 entry 2: the live line is «come», credited to MACULA; mine is «come + !».
  - 2 Samuel 5:8 entry 9 and Isaiah 10:15 entry 12: the live line is «<and> + <obj.>»; mine is two gaps. I did not find the live rule that makes these two stand.

**5. MACULA's row prints its plain English.**
- **Rule as built:** the `english` column is the reading. The sentence gloss stands smaller beside it only where it differs once dots are read as spaces. Nothing is shown where both are empty.
- **Before:** the dotted gloss was the reading.
- **After, over 475,884 parts:**

| Case | Parts |
|---|---|
| English alone (gloss the same) | 217,440 |
| gloss differs, shown small beside it | 241,566 |
| English empty, only the small gloss shows | 13,769 |
| both empty | 3,109 |

**6. The numbers that stand only in STEP's variants column.**
- **Rule as built:** the bridge builder now reads the variants column's tags. A line of the bridge carries `v` = [rows, parts] beside the main column's `n`.
- **Tags:** 11,461 before, 11,536 after; 75 stand only in the variants column.
- **Against your count of 74 numbers on 95 words:** 72 numbers on 93 written forms are now bridged. The other 2 on 2 words are tags written in an odd shape (`{H7992} ` at Ezekiel 21:19, `{H2435} ` at 2 Kings 16:18); the page reads the number out of them. Three more of the 75 (H2316, H3738A, H5993) stand on forms the chapter files do not draw.
- **Variants column:** 1,039 rows carry tags, with 1,041 items and 1,969 parts; none is of another shape.
- **Bytes:** only the 9 `bridges/step-tag-to-*` files changed; the entries files and verse bridges are identical.
- **On the page:** Open Scriptures Brown-Driver-Briggs «here» lines went from 3,581 to 3,606; UBS lines at a verse with no word of MACULA's went from 635 to 702.

What else changes in the bridge's counts (the main column's counts and rows are unchanged):

| Source | How reached | Before | After |
|---|---|---|---|
| Strong's | by number | 11,412 | 11,487 |
| Wikisource Strong's | by number | 7,887 | 7,941 |
| Wikisource Strong's | H | 3,525 | 3,546 |
| STEP's brief lexicon | by tag | 11,440 | 11,515 |
| Lexical Index and Open Scriptures BDB | N | 10,025 | 10,090 |
| Lexical Index and Open Scriptures BDB | E | 1,382 | 1,392 |
| Unabridged BDB | none | 62 | 66 |
| Unabridged BDB | one record | 8,424 | 8,467 |
| Unabridged BDB | several records | 2,926 | 2,954 |
| UBS | none | 56 | 61 |
| UBS | A | 988 | 991 |
| UBS | N | 10,368 | 10,435 |
| unfoldingWord | H | 11,274 | 11,341 |
| unfoldingWord | N | 138 | 146 |

**7. From nothing.**
- **Rule as built:** `fetch-place-answers-sources-v1.sh <new folder> [<folder of the files that cannot be fetched>]` reads its plan from the last build's own map and pins. It fetches each file at the pinned revision and holds it to the pin's sha256.
- **Before:** the one command had only run on a folder of links to files already on this disk.
- **With no folder given:** 17 files fetched in about 10 s, each the pinned bytes. Three are said plainly as "NOT FETCHED" and the script exits 4: the unfoldingWord record file, the Wikisource record file, and the one Wikisource page.
- **With the folder given:** 20 files, exit 0, about 8 s.
- **The build from that folder:** everything holds. The entries pin is byte-identical to the build from the folder of links, and the places pin is unchanged since the hand-over.

### Proofs
- **Plants:** 17 of 17 caught.
- **Walk 1** (the same 29 chapters): 13,497 words; line, card and «At this word» match the data at every word. 87 of 87 taps; 748 cards with 5,320 whole entries opened and shut. Card opens in a median 1.2 ms (max 8.5); with the dictionaries, a median 1.7 ms (max 45.7).
- **Walk 2:** 5 chapters, 2,754 words, all pass.
- **Second witness** (P's printer): 5,178 words the same.
- **Tree checks:** the seven named ones and `check-k-maqaf-preserved-v2` pass.
- **Red:** `check-manifest-prints-unguarded-v1` is red before and after, because the committed manifest does not print the new rule id. `check-nothing-unlanded-v1` was not re-run this cut; it is red by nature while nothing is committed.
- **Pictures:** 27 at 412 wide, scale 2. I looked at 11 in their final form (02, 03c, 05, 05b, 08d, 13, 13b, and both of 14 and 15). The other 16 were retaken with no page error but I did not look at them.
- **One edit after the pictures:** it changed only how three invisible characters are written in the page's code. The data pin is identical and a 947-word walk after it passed.

### What still reads badly
- **True records lost to spelling:** the headword test withholds records whose headword Brown-Driver-Briggs spells otherwise than the dictionary form: 57 several-record numbers (2,223 words) and 395 one-record numbers (2,121 words). The largest are H2088 (1,180 words), H8064 «heavens» (421), H0136 (440) and H0085 (175).
- **Ruth 3:12 word 5** shows no record first for that reason. Measured, not built: reading STEP's headword without its square-bracketed word would give a record to 2 of the 57 (287 words, this one among them).
- **Still several:** 1,479 numbers still part to several records (same letters, different words).
- **The object marker:** UBS's gloss for it is «-», and it now leads at Genesis 1:1 word 4. In a tied run it stands as a box with an empty line, where the live reader joins it to the next word under one outline (Ruth 3:2).
- **Order under a word:** the line reads left to right as one string («to <the> + her»); the live reader draws each part under its letters.
- **MACULA:** its English is empty at 13,769 parts, so only the small gloss shows there.
- **Unchanged from cut 1:** the Open Scriptures Brown-Driver-Briggs is thin; the unabridged file has `[…]` gaps; the card takes two thirds of a phone window; the page needs `DecompressionStream`; the largest chapter is 66,429 bytes packed (Psalms 119).

### Paths
Sandbox, all untracked:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/place.html
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/data/place-answers-v1/PIN.json (the joined pin; the data folder is its parent)
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/make-place-answers-v1.sh (the one command)
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/fetch-place-answers-sources-v1.sh
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/say-place-answers-fetch-plan-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/place-answers-page-v1.mjs (the page's rules)
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/project-place-answers-page-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/check-place-answers-page-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/compare-place-answers-page-with-resting-lines-v1.mjs (exits 1 on the three words)
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/place-answers-bridges-v1.mjs (E's bridge builder, now reading the variants column)

Work folder:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/fetched (the folder fetched from nothing, 211 MB)
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-make-final.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-fetch-alone.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-fetch-given.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-lines-compare.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-lines-differ.tsv (the 141 words)
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-counts.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-plants.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-walk.json
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut2-walk-2.json
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots-cut1 (the first cut's 19 pictures, kept)

The four new pictures you asked for:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/13-genesis-1-1-word-4-object-marker.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/13b-genesis-1-1-word-4-ubs-row.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/05-ruth-3-12-word-5-written-not-read.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/05b-ruth-3-12-word-5-dictionaries-unabridged.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/03c-genesis-1-3-word-5-strongs-row-unopened.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/14-genesis-1-4-hidden-signs-second-reader.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/14-live-genesis-1-4-the-live-reader.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/15-ruth-3-1-hidden-signs-second-reader.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/15-live-ruth-3-1-the-live-reader.png

The same pictures as the first cut, taken again:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/01-genesis-1-top.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/02-genesis-1-1-word-1-card.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/02b-genesis-1-1-word-1-card-dictionaries.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/03-genesis-1-3-word-5-and-there-was.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/03b-genesis-1-3-word-5-dictionaries.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/04-amos-7-12-word-6-go.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/04b-amos-7-12-word-6-dictionaries.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/06-psalms-44-15-word-6.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/07a-ii-samuel-7-22-word-4.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/07b-ii-samuel-7-22-word-5.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/08a-entry-opened-strongs-list.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/08b-entry-opened-bdb-open-scriptures.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/08c-entry-opened-bdb-unabridged.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/08d-entry-opened-ubs.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/09-ruth-3-14-word-6-written-and-read.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/10-books-and-chapters.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/11-foot-credits.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/12-genesis-8-20-word-11-spelled-otherwise.png

### For you to decide
1. **The three words in item 4.** The comparison tool stays red on them as built. Either the two «<and> + <obj.>» words get a rule I have not found in the live reader, or the three are listed as known and the tool passes on them.
2. **The bracket-less headword in item 1.** It would restore a record at 287 words, Ruth 3:12 word 5 among them, and changes nothing else I measured. I did not build it because your rule names STEP's headword as given.
3. **The manifest check** goes green only when the manifest is emitted again with the new rule id, which is outside this sandbox's brief.
