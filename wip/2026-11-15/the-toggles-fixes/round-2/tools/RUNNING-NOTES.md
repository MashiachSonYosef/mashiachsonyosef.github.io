# The toggles fixes, round 2, the tools part: running notes (15 November 2026)

Tree: scratch pt, branch toggles-fixes (from cdd93e381f). This part edits no zone.html. Scratch: v75/tools (probes in
v75/tools/probes, logs in v75/tools/logs, commit messages in v75/tools/commits). The runs that needed a page other than
the tree's own used a shadow reader in scratch (tools copied, data and page linked to the tree, the receipt baked in
scratch in place of the tree's), so nothing in the tree was written; it is deleted now, with the scratch pages.

A hazard of this machine's hand, met on the first edit: a backslash-u escape typed into a tool call reaches the file as
its character. Every escape in these edits was typed braced and set right by v75/tools/probes/unbrace.mjs, and every
changed tool was scanned for raw invisible characters and Hebrew letters (v75/tools/probes/scan-chars.mjs: none; HEAD's
gloss-store had one, the raw gap at SIGN_GAP).

## Commits (branch toggles-fixes, in order)

- ac005067ae  compare-resting-lines-v1 (new) and its step in round-v1.sh
- 9d671a18f1  gloss-store-v1 escapes; check-same-product-v1 imports the sign helpers and fails a page that never says ready
- 312ae4bebf  check-line-follows-card-v1, check-reset-pill-v1, check-word-senses-v1: the readiness wait is a fault
- 6559ae7181  check-default-picks-v1: w5 for D7, D20's named-row cells, the gap beside STEP's words over every record, ready()
- 3e2e86f059  build-toggle-design-v1: says where a book page serves each switch, photographs rows clear of the page

Two files are shared with the page builder in this tree (check-default-picks-v1, check-same-product-v1): their
uncommitted hunks (the units printed once; the parts over several words) stood in the working files when I committed,
so I staged my own versions by blob (HEAD plus my hunks only) and left theirs unstaged for them.

## 1. N6, the page about the switches

The page said the default source and the second source were «drawn only with the switches»; both stand on every book
page the default picks reach (a pill per source in the row of pills; the chooser of the second in the note under it),
and the word senses pill stands there too. The builder now says so per switch and in the lede, and checks it against
the reader opened as a reader opens it (without ?rail=all): a claim that disagrees with what it finds refuses the page.
Rows are scrolled to the top of the window before each picture and a row anything stands over refuses the page; the
fixed bar «Home Menu Top Chapter 1» lay across the default source's sentence in HEAD's picture. With no --url the
builder serves this tree on a free port (serve-tree-v1) instead of the typed port 8899.

Built in scratch only: v75/tools/toggles-mine (index.html and shots); HEAD's picture kept beside it as
v75/tools/toggles-head-photo/row-defaults.head.png. Viewed: the new row-defaults.png shows the whole sentence; so does
row-second.png. Page text against HEAD's on the same reader: exactly 4 lines differ (the lede, and the try-line of word
senses, default source, second source). Refusals shown on scratch variants: HEAD's claim (defaults and second not
said served) refused; rows scrolled to the window's foot refused, naming #nav and its buttons over every row.

The ship command, for the lead, on the ship tree once the page part is in (it photographs the tree's own reader):

    cd reader && nice -n 10 node tools/build-toggle-design-v1.mjs && cd .. \
      && git rm -q toggles/shots/row-order.png \
      && git add toggles/index.html toggles/shots

(row-order.png is an orphan: the reading order is a placeholder the page does not draw or reference.)

## 2. The readiness wait, five checks

Each waits on (no default, or ready, or failed) for 30 s; a page that does not say so is a fault said in its law.
Timed before (HEAD's check) and after (this one) on HEAD's page of this branch, then this one on a scratch copy that
never says ready (ready: false):

| check | before | after | never ready |
|---|---|---|---|
| check-reset-pill-v1 | green 26 s | green 26 s | red R1, 56 s (HEAD's: all green, 297 s) |
| check-line-follows-card-v1 | green 232 s | green 226 s | red F6 under MACULA, UBS, BDB, 284 s |
| check-word-senses-v1 | green 33 s | green 34 s | red W5 under UBS, 57 s (HEAD's: green, «not judged», 58 s) |
| check-same-product-v1 (S1/S2, --every 38, Amos 1 and 5, Zephaniah 1 and 2, against 8914) | 155 s | 156 s, same output | red S1 and S2, «failed to read», 232 s |
| check-default-picks-v1 (whole) | green 343 s | green 317 s | red D4-D19, «it threw», 210 s |

S1 on the tree's build (8922) is red before and after at Amos 5 (4 lines): the tree's built engine is main's, which
does not yet hold a reading across words. The round's rebuild owes it; not a fault of either check.

## 3. One rule, one place for the signs

gloss-store-v1: SIGN_GAP and signOnly's «¿» and «×» are escapes now; 14 of 14 probe lines answer as HEAD's helpers did,
SIGN_GAP one character, U+200B. check-same-product-v1 imports SIGN_GAP, signOnly and signsOff from gloss-store-v1 and
drops its own five helpers. Merged with kinds-build (which adds its own import from gloss-store-v1): no conflict; the
lead may fold the two imports into one.

## 4. check-default-picks-v1

- D7 now judges w5, found from the data: the smallest work where each source other than STEP reads a reading across
  words in part outside any run drawn whole (Hosea: MACULA 2:25:9, UBS 1:8:3 and 2:25:6, BDB 2:25:9). On a scratch
  page with the hold taken out: HEAD's D7 red at 14 (II Samuel, in runs; red since d4a0b0972e), this one at 18.
- D20 recounts each cell's named-row counts with the ledger (names_a_row_of_its_own_source,
  names_another_sources_row_only, names_no_row, printed_whole_by_a_row_it_names).
- D5 holds the neighbors of STEP's words over all 39 records read with the default sources laid: 3 where today's line
  was bare (II Kings 11:18:8, II Chronicles 11:11:2, Daniel 1:16:4), 9 where STEP's words are today's line.
- A wrong receipt (one STEP pill moved between cells) and a wrong record (II Kings 11:18:8 drawn «<obj.>»): HEAD's
  check green, this one red at exactly D20 and D5. Self-test: H14 and H15 added; H1-H15 green.
- The receipt the tree holds is stale for HEAD's own D20 too (7: STEP's pills 232 here, 1,015 in the receipt). A
  receipt baked in scratch from this tree (bake-default-picks-v1 --receipt-only) makes D20 green; the tree's file was
  not touched. The lead's round with --default-picks writes it.

## 5. compare-resting-lines-v1, wired into the round

Every record before (a git revision, HEAD by default) and after (on disk), every moved line with the work, the place,
before and after, how it moved, and counts by book and by credit; a JSON report and a summary; fails only where it
cannot read. round-v1.sh runs it after the lines step into build/round-v1/resting-lines-compare.json. Proven: tree
against HEAD 0 moved of 400,474 (2 s); against 857a3dc0fb 234 moved (232 bare before, 2 text: II Chronicles 11:11:2,
II Kings 11:18:8); two books with lines moved in scratch copies, exactly those 3; a revision that does not exist and a
truncated record each exit 1 with «cannot read ...».

## Checks run and not run

Lint (v29 eslint config) on my final versions against HEAD's: the same 2 warnings, none new. Three-way merge of every
committed file with kinds-build over 46bbbf7d50: 0 conflicts, each parses. Not run: the suite, the round, the gate (on
purpose, per the rules); HEAD's line-follows, same-product and default-picks checks on the never-ready page (each would
run out its waits and pass; the code shows the swallow).

## Seen, outside this part

- check-blob-every-v1.mjs (line 30, and a raw gap at 44) and check-live-line-asks-its-own-word-v1.mjs (line 53, and a
  raw gap at 55) keep their own copies of signOnly with raw «¿» and «×»: the same fold into gloss-store-v1 applies.
- check-rulings-under-sources-v1 open()/ready() still swallow a 120 s wait (the page builder has the file open).
- The switch id «licence» in zone.html's TOGGLES (its label reads «license»); renaming an id touches stored state.
