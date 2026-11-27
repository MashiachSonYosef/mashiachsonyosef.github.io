# Builder V: the fresh card on a page — a small reader built on the place answers alone

Read `S/s42w/FRAME.md` first (the why, the rule, the house rules). `S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`. Then the two builders' reports this page stands on: `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build/E/hand-back.md` (the dictionaries' entries and the bridges) and `…/P/hand-back.md` (STEP and MACULA at every word; its sections 2, 3, 8, 9 and 10), and the printout the owner is reading: `…/THE-NEW-CARD-AS-WORDS.txt`.

**Your sandbox:** `S/s14` (a git worktree at live `main`; it holds the whole of `reader/data/place-answers-v1/`: `places/`, `entries/`, `bridges/`, and the tools that make and print them, all untracked and new). Work there. Your scratch, logs and pictures go in `S/s45w/`. Everything else is read only. No commit, push or ship. Do not edit `reader/zone.html` or any page the site serves; do not link your page from any of them.

## What you make

A second, small reader page that shows the 39 books from the place answers alone, so the owner can hold it beside the live reader on a phone and judge. It matches nothing by letters and has no pool of pills. One rule: **the card shows what each source says here, by that source's own address, and then each dictionary's own entry.**

### 1. One pin, one command

Join the two parts' pins into the folder's top-level `PIN.json` (each part's own record kept as it is, under its own key), and one command (`reader/tools/make-place-answers-v1.sh <sources folder>`) that makes both parts from the source files and runs both checks. Builder P's note 10.1: E's library fails two tree checks if copied into the tree (`check-ledger-declared-v1`, `check-no-import-side-effects-v1`); the tools that live in the tree must pass both.

### 2. The page's data, projected by rule from the place answers

A tool (`reader/tools/project-place-answers-page-v1.mjs`) that writes, from `places/`, `entries/`, `bridges/` and the zones (for our own Hebrew, marks and verse labels) and nothing else:

- `reader/data/place-answers-v1/page/<book>/<chapter>.json.gz`: per verse, each entry of ours in order (a word, a scribal mark, a written-and-read pair with its forms), and for each word: STEP's parts (English exactly as STEP writes it, the tag, which part is the root); how the two editions meet where it is not one for one with the same letters, in plain words; MACULA's morphs (its English); **here**: the senses that cite this very place (the UBS dictionary by verse and word, under P's corroboration rule; BDB, both files, by verse under the entry the tag reaches), each with enough to print one line; and for each part its tag as the key to the entries. Small enough for a phone: aim under 150 KB a chapter.
- `reader/data/place-answers-v1/page/entries/<shard>.json.gz`: by STEP tag, what each dictionary holds under it as the card shows it: the bridge's word (exact; one of n; absent and why), a first line, and the whole entry in the source's own structure (Strong's list of renderings as he lists it with his signs, his pointers apart; BDB's senses in their nesting; the unabridged BDB's head and points with each italic run's kind; the UBS entry's base forms and senses; TBESH's line; the Lexical Index; UHAL where on hand). Sharded so a card fetches one small file.
- A check (`reader/tools/check-place-answers-page-v1.mjs`): every chapter of every book has its file; every string in it is the string in `places/` or `entries/`; the counts.

### 3. The page

`reader/place.html`, one file, plain JavaScript, no library, addressed `place.html?b=<book slug>&c=<chapter>` (and a small list of books and chapters to get about). A reader on a phone (412 wide) is the first reader.

- **The chapter:** our Hebrew right to left, verse by verse, each word with STEP's English under it (STEP's parts joined with « + », as the live reader joins them). Scribal marks drawn as marks. A written-and-read pair shows both forms as our text writes them, the English under the read form; a word written and not read shows STEP's own word for the written form and says «written, not read». Where the editions differ in a word, a small mark; the card says how.
- **Press a word: its card**, a sheet that does not move while it is open:
  1. **Here.** One line each, in this order, each with its source's name and license: STEP (its parts and English); MACULA (its English); the UBS dictionary's sense at this very word; BDB's sense at this verse (each file that cites it). A source with no answer here is not drawn.
  2. **The entries**, for the root's tag: each dictionary in a fixed order (STEP's TBESH; Strong's; BDB, Open Scriptures; BDB, unabridged; the UBS dictionary; the Lexical Index; UHAL), each one line (its first gloss or renderings in the source's own order) that opens to the whole entry in the source's own structure, the sense cited here marked. An ambiguous bridge is said in plain words («this number reaches 3 records of this dictionary; nothing in the files says which»), with the record that cites this verse first where one does. For a part that is a prefix or a suffix, STEP's own tag and English only: no dictionary files STEP's own numbers.
  3. Where the editions meet otherwise than one for one, one plain sentence saying how (a letter more or less; one word of ours for two of STEP's; STEP reads one form and writes another).
- **Nothing else.** No reading matched by letters, no filters, no switches in this first cut.
- **Looks:** the live reader's own look. Read `reader/zone.html`'s style block for its palette (the tabernacle colors as variables), its fonts (`fonts/`, the reading face) and how it draws a word and its line; use the same variables and faces so the two pages are plainly one site. Hebrew is red as there.
- **Credit as each source asks**, on the card where its words stand and once at the foot of the page: STEP («Attribute the data to Tyndale House and STEPBible.org», with a link to STEPBible.github.io/STEPBible-Data; CC BY 4.0); MACULA («MACULA Hebrew Linguistic Datasets, available at https://github.com/Clear-Bible/macula-hebrew/»; CC BY 4.0; the English is Cherith's); Open Scriptures for its Strong's and BDB files (CC BY 4.0; the works public domain); the unabridged BDB's provider as its README names him (public domain); the UBS dictionary as its LICENSE file asks (read it in `S/s44w/dl-ubs-0.9.4/`); our text as the live reader credits it (`data/mam-restore-v5-rights-v1.json`, the credit line). Each pin names the file and revision.
- **Words on the page:** plain American English a first-time reader understands; none of our working words (no «pill», «pool», «bridge», «tag» without saying what it is, «zone», «ledger»). No Hebrew letters in the page's own strings (the data carries the Hebrew).

## Prove it

1. **By machine:** the check passes for all 929 chapters; sizes (a chapter file's median and largest; an entries shard's); the one command's time.
2. **In a browser** (one at a time; the machine is shared lightly now): open every chapter of Ruth and of Genesis 1 to 5 and 20 chapters across other books; press every word; no page error, every word opens a card, what the card prints under «here» is what the data holds; the median time a card takes to open; the card does not move when its entries are opened and shut.
3. **Pictures for the owner** at a phone's size, deviceScaleFactor 2, under `S/s45w/shots/`: the top of Genesis 1; the card of Genesis 1:1 word 1; Genesis 1:3 word 5 («and there was»); Amos 7:12 word 6 («go»); Ruth 3:12 word 5 (written, not read); Psalms 44:15 word 6; 2 Samuel 7:22 words 4 and 5; one card with an entry opened whole (Strong's list and a BDB entry). Look at each yourself and say what a reader sees and what still reads badly.
4. **The tree's checks** that walk every tool or every page (`check-no-import-side-effects-v1`, `check-ledger-declared-v1`, `check-nothing-hand-typed-v1`, `check-nothing-hard-wired-v1`, `check-sidecars-all-named-v1`, `check-build-derived-v1`, `check-scope-derived-v1`, and any that lists the pages under `reader/`): each run alone, each result named; red before and after is not yours.

## Hand back

Your final message, whole: what the page shows and why each part stands, the sizes and times, the browser walk's counts, the pictures' paths with what each shows, what still reads badly, what you left out and why, the one command, and the paths of everything.
