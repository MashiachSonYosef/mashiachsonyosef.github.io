# Builder: a piece of a divided word is served as a whole word is (ship 24)

You mend one weakness of the reader page of fireandhail.com and prove the mend. You work in your own sandbox and hand back a patch. You do not commit, push or ship.

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`

- **Your sandbox:** `S/s14` (a git worktree at live `main`, ea6e1ad08e, clean). Change files only there. Your own scripts, logs and data go under `S/s39w/`.
- **Read only:** `S/base` (a frozen copy of live that helpers read), `S/old`, `S/s13`, `S/s11`, `S/s12`, `S/s15` (other builders), and `/home/user/mashiachsonyosef.github.io`.
- The machine has 4 cores and is shared with about nine other agents: one browser and one heavy process at a time; no whole-suite runs.
- House rules (CLAUDE.md is injected): American English; `zone.html` and the tools carry no Hebrew letters in string literals (escape codepoints); a comment says what the code does and why in plain words, as the file's own comments do.
- If a shell command with an inline script is refused, write the script to a file with the Write tool and run it plainly. Never work around a refusal to delete. The file tool refuses report files from a helper: do not work around that either; put your whole report in your final message.
- Read first: `/home/user/mashiachsonyosef.github.io/wip/2026-11-24/THE-PRINCIPLE.md` (the owner's principle: serve each source as it serves itself; on the 39 books STEP decides the division of a word, the entry of each piece and the reading) and `S/w39/COMMON.md` («Where things are»).

## The weakness

145,023 of the 305,431 words of the 39 books are divided by STEP into pieces (prefix, core, suffix). The card of such a word opens on a piece's block, and a piece's block is served worse than a whole word in four ways. Five independent passes found it; their reports are your evidence (read the named sections; each gives the lines of `zone.html` at fault):

| What is missing on a piece's block | Report |
|---|---|
| **The reading the line prints does not lead.** The pressed pill, which is the line's reading, is first at 604 of 604 whole words in Ruth and at 127 of 692 divided words; Genesis 1:3 word 5 («and + there was») opens on «beacon», the pressed «there was» is 17th of 81; Genesis 1:2 word 9 «[the] spirit of» is 53rd of 57. | `S/w39/out/R-ruth/findings.md` §1 (`placeOfCell` ~10968, `sortPool` ~9461–9615); `S/w39/out/R-genesis-1-5/findings.md` §1 |
| **The pointing grade and the stem are not asked on a core piece** (a surface that is not the open word's own key is asked with `pointed: null`). A row with no entry is then bound by nothing: Ruth 1:1 word 4 «the + judges» shows Jastrow's «judgments» with the off sources opened; the same word bare at Deuteronomy 16:18 word 1 does not («1 of 19 pointed otherwise, withheld»). The owner's own example, Isaiah 1:22 word 3, «sproutings» on «dross». | `S/w39/out/E/findings.md` §1 and §2 (`zone.html` 3562–3566, 8871, 8953, 9043) |
| **The entry gate is not asked on a prefix or suffix block**, because the zone carries STEP's tag for the core piece only. The article's block opens «whether, direct, indirect…»; the suffix «our» opens on «habitation, comely»; «me» on «Yôdh». | `S/w39/out/A/findings.md` §1 (`coreTagsAt`, 3532–3537), §5 |
| **Two one-line faults in the grade:** the piece class reads the unabridged BDB's article (he with patah and dagesh) as a suffix's mappiq and withholds it on all 22,773 article blocks; `isPointed` does not count the qatan mark (U+05C7) as a vowel. | `S/w39/out/A/findings.md` §4 (`zone.html` 3441–3448) and §10 (3323) |

I opened these cards on live myself; they are as the reports say (`S/w39/out/lead/r-verify-rest.json`, `e-verify-open.json`).

## The laws to build

1. **On every block of a divided word, the reading the place's own piece has at this place leads the pills and is the pill pressed**, exactly as the line leads a whole word's card. The rest of the pool keeps its order. (Where the piece's own reading is a sign and the signs switch hides it, leave today's behavior: another builder owns the signs.)
2. **A piece is graded as a word is.** The pointing grade, the unpointed-rows rule and the stem gate read the piece's own pointed letters, cut from the word's surface by the piece's span, with `beginsWord` false for a piece that does not begin the word (the flag is already in `gradeRow`). The same word with and without a prefix then offers the same readings for its core.
3. **The entry gate is asked on every block.** Each piece carries STEP's own tag for that piece. STEP's file gives a tag for every part of every word (`H9009/{H2889}`). Find where the tree already holds it (the piece store, `data/piece-store/`, or nowhere); if nowhere, lay it by a tool with a pin from STEP's own files, which stand downloaded and hashed at `S/s38w/dl-step-pinned/` (the revision everything served was built from; read with `python3 -I`, run nothing from inside that folder). Another helper's scripts pair every word of the 39 books with its row of STEP's file: `S/w39/out/C1/scripts/align.py`, `parse_tahot.py`, and the pairing itself in `S/w39/out/C1/data/aligned.jsonl.gz`. MACULA numbers the same pieces by its own scheme (A §5): at a block whose STEP tag is a piece number, a row whose numbers are all another scheme's is not asked the entry gate, and you say what that leaves standing. Invent no crosswalk.
4. **The two one-line faults** of the grade, as A §4 and §10 propose, each with its count before and after.

No card may end with nothing: a block whose own piece reads at the place always offers at least that reading.

**Not yours** (another builder is changing these in `S/s15` at the same time; do not edit them, and keep your edits as local as you can so the two patches merge): the signs (`SOURCE_SIGN`, `signOnly`, `trimSigns`, ~3684–3700, and the pill filter's sign test at ~12858), `spanJoin` (~3802–3806), `printedForm` in `tools/gloss-store-v1.mjs`, the year a pill prints (`yearSaid`, ~9193 and ~12795–12801), the plain list under a chapter. If a law of yours cannot be built without touching one of those, do the least and say exactly which lines.

## Prove it

1. **By machine, every divided word of the 39 books**, before (on `S/base`) and after (on your sandbox). Helper A's model of the page's gates agreed with the page on 388 of 388 blocks (`S/w39/out/A/model.mjs`, `walk.mjs`); helper E's too (`S/w39/out/E/walk2.mjs`). Use or extend one. Report, by the twelve Bible dictionaries and by the sources off by default: placings newly withheld by the pointing grade, the unpointed rule, the stem and the entry gate on pieces; placings that return (the article's); blocks whose first pill is the piece's reading on the line; blocks left with no pill.
2. **On the page.** Walk every card of Ruth and of Genesis 1 to 5 before and after (the readers' scripts: `S/w39/out/R-ruth/walk-cards.mjs`, `analyze-cards.py`): the place of the pressed pill, and every card where a reading of the place's own entry from one of the twelve stood before and does not after (each one explained). Then 30 cards across 10 other books, read by eye, with the off sources both shut and opened (`?kinds=open`). Screenshots (deviceScaleFactor 1) of six cards before and after under `S/s39w/shots/`; look at them.
3. **The lines must not move.** Read `S/s34w/after-words.sh` (what had to be rebuilt after the last `zone.html` change) and `S/s31w/env.sh` (the round's environment). In your sandbox run the round's `lines` step and compare with live: `node S/s7w/lines-diff.mjs S/old/reader S/s14/reader S/s39w/lines-diff.json`. Expected: 0 lines differ. Explain any that does. Do not run the door or the whole round.
4. **The checks.** Run one at a time the checks that open cards or grade rows (grep `#hud`, `gradeRow`, `entryVerdict`, `heldByPointing` in `reader/tools/check-*.mjs`). A check red before and after is not yours: give its figure on `S/base`. Where a check's law changes with yours, change the check and say why. Add laws: on every divided word of a sample across the 39 books the open block's first pill is the piece's reading on the line and is pressed; the same word with and without a prefix offers the same off-by-default readings for its core (Ruth 1:1 word 4 against Deuteronomy 16:18 word 1); no article block withholds the unabridged BDB's «the».
5. **Speed.** The median time a card takes to settle, before and after, on 200 cards. Say so if it is worse by more than a fifth.

## Hand back

- `S/s39w/apply-24.sh <tree>`: applies your change to a clean tree at ea6e1ad08e (a patch applied with `git apply`, plus any tool that must be run, in order); it refuses if the tree's `zone.html` is not the bytes you built against.
- Your final message: the whole report (no word limit): what the cause was in the page's own terms, what you changed and why that and not another, the tables from steps 1 and 2, the checks' results, what a reader sees, what must be rebuilt at ship time, what you found and did not mend. Every figure read from a file you name.
