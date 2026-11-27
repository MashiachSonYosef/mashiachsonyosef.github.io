# Builder: each source's own marks, its own year, its own credit (ship 25)

You mend a family of faults in the reader page of fireandhail.com where one rule of ours is applied to every source alike, against what a source says of itself. You work in your own sandbox and hand back a patch. You do not commit, push or ship.

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

- **Your sandbox:** `S/s15` (a git worktree at live `main`, ea6e1ad08e, clean). Change files only there. Your own scripts, logs and data go under `S/s40w/`.
- **Read only:** `S/base` (a frozen copy of live that helpers read), `S/old`, `S/s13`, `S/s11`, `S/s12`, `S/s14` (other builders), and `/home/user/mashiachsonyosef.github.io`.
- The machine has 4 cores and is shared with about nine other agents: one browser and one heavy process at a time; no whole-suite runs.
- House rules (CLAUDE.md is injected): American English; `zone.html` and the tools carry no Hebrew letters in string literals (escape codepoints); a comment says what the code does and why in plain words, as the file's own comments do.
- If a shell command with an inline script is refused, write the script to a file with the Write tool and run it plainly. Never work around a refusal to delete. The file tool refuses report files from a helper: do not work around that either; put your whole report in your final message.
- Read first: `/home/user/mashiachsonyosef.github.io/wip/2026-11-24/THE-PRINCIPLE.md` (the owner's principle: serve each source as it serves itself; a rule of ours that overrides a source's own answer, or fires where nothing needed deciding, is the fault) and `S/w39/COMMON.md` («Where things are»).

## The faults, with their evidence

The reports are in `S/w39/out/C1/findings.md` (STEP's two files and MACULA against their own bytes; findings T1, M2, T6, B2, Y, C), `S/w39/out/R-genesis-1-5/findings.md` (§5, §7, §8, §10) and `S/w39/out/R-ruth/findings.md` (§4, §6, §8, §12). Each names the lines of `zone.html`. I opened the cited cards on live; they are as reported (`S/w39/out/lead/c1-verify-rest.json`).

| # | Fault | Count |
|---|---|---|
| 1 | **The signs switch (off by default) uses one list of signs for every source** (`SOURCE_SIGN`, `zone.html` ~3684; the pill filter at ~12858). It withholds any reading that holds a square bracket. STEP's own key: «Words in [square brackets] aren't in the Hebrew but are implied and are best included in a translation». Genesis 15:9 word 7 does not offer «[is] a goat». | 20,048 of STEP's 91,301 served rows, 19,193 for the square bracket alone |
| 2 | The same list withholds MACULA readings that hold « ~ », a mark MACULA does not declare a sign; Strong's pattern («X » at the head) catches MACULA's «X and». The switch also hides wiki brackets and the corpus lane's «[Arabic]» placeholder as if they were a source's signs (`S/w39/out/E/findings.md` §8). | 1,862 MACULA rows; 15,654 pills of the off sources |
| 3 | **A piece made of two signs is drawn** («<in> <the> + it», Genesis 3:3 word 13), because `signOnly` (~3687) knows one sign. | 336 places by rows, 205 lines |
| 4 | **STEP's lone «!»** (its sign for the emphatic ending, tags H9012 and H9013) prints as a piece: «you should die + !». | 708 lines |
| 5 | **A block's own reading at the place is not offered where it is a sign**: at וְאֵת the block's reading is STEP's «<obj.>», the pill is hidden, and the card opens with «self» pressed. | 4,066 words |
| 6 | **A slash printed as STEP's joiner.** `printedForm` (`tools/gloss-store-v1.mjs` ~86) and `spanJoin` (`zone.html` ~3802–3806) print every «/» as « + », which is STEP's mark for the parts of one Hebrew word. TBESH's «to break up/open» prints «to break up + open»; UBS's «and/or» prints «and + or». | 7 TBESH rows the ledger keeps whole; 259 UBS rows, 47 TBESH, 4 others hold a slash between letters |
| 7 | **A pill prints an older source's year beside its own source's name**: «1890 · STEP …», «MACULA … · wording 1890», «STEP … · wording 2026» (`yearSaid`, ~9193 and ~12795–12801; `tools/apply-source-years-v1.mjs` says why the row carries it). | 587 rows of STEP's and MACULA's; 130 pill titles in Ruth alone |
| 8 | **The credit a source asks for is not on the card.** MACULA's license: «You must attribute the work as follows: "MACULA Hebrew Linguistic Datasets, available at https://github.com/Clear-Bible/macula-hebrew/"». STEP's latest files: «Attribute the data to Tyndale House and STEPBible.org, and include a link to STEPBible.github.io/STEPBible-Data as the source of this data» (the heading of the files in `S/s38w/dl-step-latest/`; read with `python3 -I`). `data/dictionary-kinds-v1.json` says of MACULA «No self-description in any record read»; C1 quotes its own pages. | 2 sources (3 families) |
| 9 | **The plain list under each chapter prints an empty item with a dangling footnote number** for a word whose line is a gap (the object marker joined by a maqaf; in the reader it shares the next word's cell, by ruling, and reads well). | 6,584 lines |
| 10 | **One reading as two pills** where two editions print different apostrophes («husband's mother», «husband’s mother»). | 16 cards in Ruth |

## The laws to build

1. **A source's signs are its own.** Which marks of a reading count as signs for the signs switch is read per source from that source's declaration (`data/ledgers-v1/<source key>/`, `data/ledger-index-v1.json`), not from one list. Where a source's declaration names no sign, nothing of it is a sign. Fixed points:
   - STEP's TAHOT: the angle bracket, «¿» and the lone «!» are signs; **the square bracket is not**, on rows and on pieces alike.
   - MACULA: « ~ » is not a sign. Strong's patterns act on Strong's rows only.
   - A mark our own build put in a row (wiki brackets, a placeholder) is no source's sign.
   First tabulate, for every source served: each mark today's patterns catch, how many rows, and what the source's declaration says of it. Apply the law; then list for me every source where it brings back pills that read oddly, with five examples each, so the owner can rule on them. Do not decide those by taste.
2. **A piece made only of signs, whatever their number, is a sign piece.**
3. **A block's own reading at the place keeps its pill and is the one pressed, whatever sign it carries.**
4. **The joiner « + » prints only where a source's declaration says the slash joins the parts of one word** (STEP's pieces and rows; the page's own span joins). Elsewhere a slash the ledger keeps prints as the source wrote it.
5. **A year printed beside a source's name is that source's own year** (from `data/source-years-v1/` and the store index), or none. Do not change the order of the pills in this ship; if the order reads the same slot, say so and leave it.
6. **The credit each source asks for stands where its credit is printed** (the record under the pills, and wherever the page lists its sources): MACULA's wording and link; STEP's as its latest files ask. The kinds record quotes MACULA's own description of itself.
7. **The plain list prints no empty item**: a line that is only a gap is printed with the word it is joined to, as the reader draws it, or left out with its dot; the list's build already refuses when it does not match the reader, so keep that law true.
8. **One reading, one pill** across apostrophe glyphs (the pooling key).

**Not yours** (another builder is changing these in `S/s14` at the same time; do not edit them, and keep your edits local so the two patches merge): the order of the pills and which pill a card presses on a piece's block (`sortPool` ~9461–9615, `placeOfCell` ~10968), the pointing grade and the stem on a piece (~3562–3566, ~8953, ~9043), the tags a piece carries (`coreTagsAt` ~3532–3537), `isPointed` (~3323) and the piece class (~3441–3448). Your law 3 meets that builder's work at the pill filter (~12858): do the least there and say exactly which lines you changed.

**Not in this ship:** the names gate; the unabridged BDB's and Strong's pills that are not readings (another helper is reading those sources against their bytes); a rendering of another place a press away.

## Prove it

1. **By machine, every served row and every line of the 39 books**, before and after: per source, rows withheld by the signs switch at rest (the 19,193 must return); lines that change (expected: the 3 hidden bracketed pieces of C1's T1, the two-sign pieces, the lone «!»; list every changed line's before and after, grouped by cause, with counts); rows whose printed form changes for the joiner; rows whose printed year changes.
2. **The resting lines.** Read `S/s34w/after-words.sh` and `S/s31w/env.sh`. In your sandbox run the round's `lines` step and `node S/s7w/lines-diff.mjs S/old/reader S/s15/reader S/s40w/lines-diff.json`. Every line that moves is one you predicted in step 1; explain any other. The plain list under a chapter is built by the door from the recorded lines: say what must be rebuilt at ship time and prove your law 7 on Ruth's four chapter pages built in a scratch folder, not in the tree's served pages, if the door's own build is too heavy to run.
3. **On the page.** The cards the reports cite, before and after, and 40 more across 15 books chosen from your step 1 lists (ten per cause), read by eye. Screenshots (deviceScaleFactor 1) of eight under `S/s40w/shots/`; look at them and say what a reader sees.
4. **The checks.** Run one at a time the checks that read signs, joins, years, credits or the plain list (grep `signs`, `printedForm`, `wording`, `license`, `resting-lines` in `reader/tools/check-*.mjs`). A check red before and after is not yours: give its figure on `S/base`. Where a check's law changes with yours, change it and say why. Add laws for 1 (a STEP row with a square bracket is offered at rest; a MACULA row with « ~ » is offered), 3, 4, 5 and 7.

## Hand back

- `S/s40w/apply-25.sh <tree>`: applies your change to a clean tree at ea6e1ad08e (a patch applied with `git apply`, plus any tool that must be run, in order); it refuses if the tree's `zone.html` is not the bytes you built against.
- Your final message: the whole report (no word limit): the table of law 1 (every source, every mark, the count, what the declaration says), what you changed and why, every line that moves grouped by cause, the list of sources whose returned pills read oddly, the checks' results, what must be rebuilt at ship time, what you found and did not mend. Every figure read from a file you name.
