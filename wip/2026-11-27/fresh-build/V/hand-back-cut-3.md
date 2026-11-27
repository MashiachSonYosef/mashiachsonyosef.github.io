## Third cut: both rules are built and everything holds

Ruth 3:12 word 5 now shows its own record first, and the comparison tool exits 0 on exactly the 141 listed words. Nothing is committed; no tracked file changed (the tree is at ea6e1ad08e with 30 untracked paths); the server is stopped.

### 1. STEP's headword is read without its square brackets

**Rule as built:** for the headword test, STEP's brief lexicon's headword is read without its square-bracketed runs. The reason is stated in the page's rules (`place-answers-page-v1.mjs`): the brackets hold the other words of a combination the number is one word of, as the relation column says. The check reads the brackets by its own code. It also holds that every bracketed headword has a relation said and letters left outside the brackets. The pin names the five, each with its relation: H0518B, H3588B, H3588C, H3651B, H5921B.

Numbers that stand on several records, by number:

| Parted to | Numbers before | Numbers after | Words before | Words after |
|---|---|---|---|---|
| none | 57 | 55 | 2,223 | 1,936 |
| one record | 1,418 | 1,416 | 75,425 | 75,545 |
| several records | 1,479 | 1,483 | 107,659 | 107,826 |

- **H0518B** (150 words): none before, one record now (BDB511).
- **H3588B** (137 words): none before, two records now.
- **On the page:** word by word, none goes from 1,856 to 1,854 and one from 75,076 to 75,078. Only two words show something new, both written and not read, where MACULA has no dictionary form: Ruth 3:12 word 5 and Jeremiah 39:12 entry 10.
- **Ruth 3:12 word 5** now reads "This number stands on 5 records of this file. One has this word's own headword.", with the record of «if» first and the other 4 behind the button.
- **A spoiled copy** (that record taken off the number's own) fails the check.

### 2. The known differences are a list

**Rule as built:** the comparison tool holds the expected differences as a list of 141 words, each with its cause and who lists it. It exits 0 only when the differences found are exactly the list and every cause holds in the data. Any of these fails it: an unlisted difference, a listed word that no longer differs, a cause that no longer holds.

- **The list is a new file beside the pins,** `lines-known-to-differ.tsv`. It is made by the tool with `--write-list --listed <P's table>`. I made P's table afresh with P's tool; it is the same 138.
- **Before:** exit 1 on the three words. **After:** exit 0.
- **Result:** 305,431 words; 305,290 equal the live line; 141 differ, and they are the list.
- **Four spoiled lists** each exit 1: one word left off, one added that does not differ, a wrong cause, a wrong credit.

Counts by cause:

| Cause | Words | Listed by |
|---|---|---|
| different; today's credit M9 | 48 | P |
| different; today's credit PIECE:MACULA | 32 | P |
| no line today | 14 | P |
| different; today's credit PIECE:TAHOT | 13 | P |
| today's line stands under more than one word | 12 | P |
| different; today's credit M4 | 8 | P |
| different; today's credit M14 | 7 | P |
| different: the record gives no parts of STEP's as this word's | 2 | P |
| different; today's credit M3 | 2 | P |
| the live page tests a tied word's whole line with its one-sign test; a word of two signs slips it | 2 | this tool |
| the live line is another source's | 1 | this tool |

P's cause is P's own verdict, with today's credit added where the verdict is "different". Your cause for the two words holds in the data: STEP writes both parts as signs there («<and>» and «<obj.>»), and those are the only two such words in a tied run.

### Commands
- **The one command on the fetched folder:** exit 0, 182 s, everything holds. The places and entries pins are unchanged; the page pin is now sha256 9e718bbc098f…
- **The comparison tool:** exit 0.
- **Browser walk of Ruth 3 and Genesis 1:** 692 words; line, card and «At this word» match the data at all 692; 0 page errors. 6 of 6 taps; 39 cards with 269 whole entries opened and shut; the card did not move.
- **Tree checks:** the same eight pass; the manifest check is red as before, left as you said.

### What moved that I did not expect
- **Three numbers went from one record to several, by number:** H3588C, H3651B and H5921B (10 words each). Before, each had only the combination's own record (BDB3996). Now the records of the single word outside the brackets pass too, giving 3, 5 and 3 records. The page shows the same records as before at those 30 words, because MACULA's dictionary form had already given them.
- **For the same reason the «here» lines did not move** (155,027). What moved is who gives the match: forms with a record by MACULA's form alone went from 1,739 to 1,421, and lines drawn by it alone from 533 to 435.
- **The list is a data file no pin names.** I left the joined pin alone, as you said nothing else changes. The one command does not make the list, so after a build in a fresh tree the tool exits 3 until `--write-list` is run.
- **The record's one line at Ruth 3:12 reads oddly:** «(no meaning in italics; in bold: conjunction)». Its italic «if» is unclassed in the entries file and the one-line rule takes only opening or tagged italics. That rule is unchanged, but it now shows in picture 05b.
- **Inside the opened record, the stub paragraph «mother» is marked as this word's headword.** It has the same consonants as «if».

### Paths
The two pictures, taken again:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/05-ruth-3-12-word-5-written-not-read.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots/05b-ruth-3-12-word-5-dictionaries-unabridged.png

The second cut's versions of the two are kept:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots-cut2-kept/05-ruth-3-12-word-5-written-not-read.png
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/shots-cut2-kept/05b-ruth-3-12-word-5-dictionaries-unabridged.png

Changed or new in the sandbox:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/place-answers-page-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/project-place-answers-page-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/check-place-answers-page-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/tools/compare-place-answers-page-with-resting-lines-v1.mjs
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s14/reader/data/place-answers-v1/lines-known-to-differ.tsv

Logs:
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-make.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-lines-compare.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-lines-differ.tsv
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-places-lines-compare.tsv
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-walk.json
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-plant-headword.log
- /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/s45w/logs/cut3-pin-page-before.json
