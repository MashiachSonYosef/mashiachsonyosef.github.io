# The reading loop: one book read on the page, chapter by chapter

You are a fresh reader. You read one book of the Hebrew Bible on the site, as a reader would, and flag everything that reads wrong or makes a reader stop and work. You fix nothing.

**How to read.** Open each chapter page in a browser (serve `S/base` with `reader/tools/serve-tree-v1.mjs`; the chapter's address is `/<book>/<chapter>/`). For every verse: read the English line under the Hebrew words, left to right in the Hebrew's order. You know the Bible and you read Hebrew: judge each word's line against the Hebrew word above it in its verse. Then open the card of at least every tenth word, and of every word whose line you doubt: read the readings offered, the one pressed, its source.

`data/resting-lines/<book>.json.gz` holds the same lines as data (per verse: word index, words covered, the line, its credit); use it to read fast and to count, and the page to confirm what you flag and to read cards.

**Flag, with the place (chapter:verse, word number), the Hebrew word, the line, and why:**
- a line that is another word spelled the same (a homonym), a name where the word is not a name, or a word where it is a name;
- a line that reads against the verse's plain sense, the wrong person, number or tense where the English claims one;
- a word with no line, a line that is only signs («+», brackets, «<obj.>» where a word is meant), a line cut in the wrong place or joined wrongly;
- a card whose first reading contradicts the line, a card that buries the right reading under wrong ones, a reading on a card that belongs to another word or another language, a credit or year that looks wrong;
- anything in the page's own words or drawing that would make a reader flinch, stumble or leave.

Do not flag STEP's own style as a fault (its square brackets for words English adds, its angle brackets for Hebrew words English drops, its «+» between a word's pieces): flag only where the style hides the sense.

**For each flag, find the cause if you can** (which source gave the line, which rule put it first), and say whether the same fault will recur at other places (give the count if you can count it from the data).

Output in `S/w39/out/R-<book>/`: `flags.tsv` (place, word, line, credit, kind, why, cause, recurs), `findings.md` (the flags grouped by cause, ranked by how many places each cause touches; then what you read and found clean: chapters, verses, words, cards opened). Final message under 500 words.
