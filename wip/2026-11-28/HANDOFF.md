# Handoff: the page lane (Elijah), 28 November 2026

For whichever session picks this up next. The owner is away for a month or more. Read `HOW-WE-WORK.md` first. The lane owns its end: decide on the evidence and write the reasons where the decision is made.

## Where the site stands

- The site is the `main` branch. GitHub Pages serves `gh-pages`, which follows `main` after every ship (commit «gh-pages follows main»).
- **Ship 23** seats the place card at rest: the card built from each source's own address (the one rule, `wip/2026-11-27/fresh-build/FRAME.md`). Today's card stands behind the switch «readings matched by spelling».
  - Ship 23 also fixes the chapter head and the front door's title glosses, and puts STEP's asked credit on both cards and in the export.
  - Its plan is `wip/2026-11-27/ship-23/SHIP-23-PLAN.md`, and its runner and edits are in `wip/2026-11-27/ship-23/tools/`.
- **The notes branch** is `claude/awesome-hypatia-2pxz43`. Everything written down lives there under `wip/<date>/`.

## How the new card is built

- **The fresh build.** `reader/tools/make-place-answers-v1.sh <sources folder>` makes the place answers from the public sources at pinned revisions. unfoldingWord and Wikisource come from the corpus lane's store. The command checks everything it makes.
  - The page reads `reader/data/place-answers-v1/page/` only.
  - The intermediates (`entries/`, `places/`, `bridges/`) are not committed, because they hold whole copies of the sources' files (STEP asks for no copies). The one command makes them again.
- **The card's code** is one block, `reader/tools/place-card-v1.mjs`, carried into `place.html` and `zone.html` by the builder's carry script. Its proof is `check-place-card-one-place-v1.mjs`.
- **A safety copy** of the tools and the page change sits at `wip/2026-11-28/fresh-build-snapshot/`.
- **The laws of the spelling card:** 24 of the 70 card checks test features that stand only behind «readings matched by spelling». They are listed with reasons in `wip/2026-11-27/fresh-build/H2/laws-of-the-spelling-card.md`, and all 70 pass with today's card forced.

## Next, in order

1. **The numbers in gold.** «Chapter: 2» in the chapter head: «Chapter:» purple, the number in the page's one gold. The verse label stays bronze. The basis note says what the gold means. The metals rule and the color contract change with it. See the plan's last sections.
2. **The lines rebuild.** Rebuild every resting line from the place answers through the pipeline, not by editing lines.
   - The comparison tool already draws the line for all 305,431 words, and 141 differ from today's.
   - The 46 places where STEP reads two of our words as one rest as one run card across them, with each word a press away.
   - The groups are sorted in `wip/2026-11-27/accuracy-pass/the-124-words.md`.
   - This closes default-picks D5 (Daniel 1:16:5) and the 73 words where the card presses nothing today.
3. **The front door's title card.** Pressing a title on the door still opens a card matched by spelling. The gloss under the title is read at its place since ship 23; the card should be too.
4. **What the builder found still reads badly** (`wip/2026-11-27/fresh-build/H2/hand-back-frame-laws.md`, section 7):
   - runs that say «Bethel» against «Beth- + -el»;
   - four cells with no pill;
   - the record slot's «Also given by…» without the lead record's own line;
   - the live lines under the source switches.
5. **Sources to bring back by rule, one at a time:** BiblicalTools (its own field `strongs`), the SDBH as HiperBiblia gives it (the corpus lane's stated bridge), and ETCBC's BHSA glosses (they need oslots and the book, chapter and verse files).
6. **For the corpus lane:** the lexicon's own title is «Unlocked Hebrew and Aramaic Lexicon», while both lanes' files say «unfoldingWord Hebrew and Aramaic Lexicon». It is a name that must match across files.

## How a ship runs

`wip/2026-11-27/ship-23/tools/run-ship-23.sh` is the pattern:
1. the round's page steps: lines, chain, door, switches;
2. the lines against live, with the expected moves;
3. the gate, `check-same-product-v1`, against live;
4. the whole suite in two lanes;
5. commit on main, merge into gh-pages, push both;
6. the live check (`live-check.yml`, workflow dispatch).

The environment for the round is `S/s31w/env.sh`. S is the session's scratchpad, which a new session will not have. A new session rebuilds the sources folder with `fetch-place-answers-sources-v1.sh` and needs read access to the corpus lane's store for the two received sources.
