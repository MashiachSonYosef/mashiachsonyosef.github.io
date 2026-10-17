# Plan for Opus: finish the piece store ship (17 October 2026) — DONE, see STATUS-2026-10-16.md, 17 October night

Written by Elijah (the serving lane) at 5% of the week's tokens. The code is
done and pushed; what remains is running the suite to green, the build, the
push to main, and the gh-pages merge. Read CLAUDE.md first (American English,
no typed Hebrew in zone.html or tools, gh-pages follows main).

## Where the work is

Branch `piece-store-2026-10-17` on origin, three commits (0940eab54,
7d0cd9fa8, a4253dc6d) on top of `finale-2026-10-10` (= main, 6a3f532e1).
It carries:

- `reader/zone.html`: OVERLAY_DEFS entry `piece-store` (place: true);
  globals PIECE_BOOK / pieceBookP / openPlace / pieceBookReady; the `o.place`
  branch at the top of overlayRowsFor (claims at the open place whose letters
  equal the pressed key's letters, inclusive [a, b]); openPlace set in
  openHud; in sortPool `rk()` / `pieceOnly()` / `pieceLast()` so piece rows
  witness a reading but never rank or lead it; in poolFor TAHOT's own row is
  stood up before a group the piece store alone reads.
- `reader/tools/bake-piece-store-v1.mjs`: bakes Moses's piece store v2
  (R2: corpus-lane-builds/moses-piece-store-v2/build/piece-store-v2/, i.e.
  index.json, claims/, records/) into `data/piece-store/<book>.json` =
  `{ book, places: { "c:v:w": [[pi, src, kind, reading, a, b, R, rid, cut,
  sign], ...] }, records: { rid: [m, headword, R, year] } }` and index.json.
  The lane's joins (a whole-word claim naming two records, or two ranges of
  one record) are counted (`joins_not_served`, 362,671) and not served;
  served claims 934,323 of 1,296,994 received; 771,665 records; 121 MB.
  Already baked and committed; no need to re-run unless the source changes.
- `reader/tools/check-piece-store-v1.mjs` (P1-P4; passes).
- `reader/tools/bake-span-store-v1.mjs`: rows with gap NONE (a source's
  closed-up spelling, the weld) are withheld, counted in
  `index.counts.rows_closed_up_withheld` (18). data/span-store re-baked from
  span-store-v1.3 (already committed).
- `reader/tools/check-pointing-grade-v1.mjs`: counts the piece rows at its
  place (passes).

## What was verified before the hand-off

Passing on the patched page: check-piece-store-v1, check-pointing-grade-v1,
check-nothing-hand-typed-v1. Of the full suite run started before the last
two page patches, 26 of 41 had finished: all green except the four named
above and below. check-line-reads-the-place-v1 passes after the poolFor patch.
check-card-opens-on-the-line-v1 C2 still failed after the sortPool patch
(אשר: first "which", line "that" under corpus, masoretic, cites): the
cause was poolFor's grouping, where a piece row's catalog rank 0 and year
lowered its group's `ledger` and `year`, the very fields oldestFirst breaks
ties on. Fixed in 7d0cd9fa8 and a4253dc6d (both grouping sites: a piece
row neither dates nor ranks its group). A rerun of card-opens-on-the-line,
piece-store and line-reads-the-place against that page was in flight when
tokens ran out; confirm it first (step 2).

## Steps

1. Check out the branch; from `reader/` start the servers the checks expect:
   `for p in 8911 8899 8913; do (setsid nohup npx --yes http-server . -p $p -s >/dev/null 2>&1 < /dev/null &); done`
   and from the repo root `for p in 8912 8921; do ... same ... done`.
2. Run the two open checks first:
   `node tools/check-line-reads-the-place-v1.mjs` and
   `node tools/check-card-opens-on-the-line-v1.mjs`. If either still fails,
   the cause is the piece store's rows reaching the card's lead or its
   grouping; fix in zone.html (sortPool / poolFor), never by loosening the
   check.
3. Run the full suite (the 41 checks; the list is every
   `tools/check-*-v1.mjs` the previous ship ran, plus `piece-store-v1`):
   `ls tools/check-*-v1.mjs` and run each; two at a time is safe. Every
   check must end green. Known pre-existing and not this change's:
   check-store-continuity-v1 C1/C2/C5 (430 rows; M14 cuts); it is not in
   the ship list.
4. Build, from `reader/`:
   `node tools/build-front-door-v1.mjs --history data/none.json && node tools/emit-lane-state-v1.mjs && node tools/emit-ledger-index-v1.mjs && node tools/pipeline-manifest-v1.mjs --stamp 2026-10-17 && cp -a deploy-root/. ..`
   If the front door refuses on the gate, run `node tools/check-c0-refusals-v1.mjs --write` first. Zones were not touched, so no re-pin is needed.
5. Commit on the branch. Before committing, scan the staged diff for secrets
   (`git diff --cached | grep -c "R2_SECRET\|AKIA"` must print 0) and never
   add zone-*-tmp.html or zone-geo-*.html. No model names in the message
   beyond the Co-Authored-By trailer.
6. Ship: `git push origin piece-store-2026-10-17:main`, then in a gh-pages
   worktree: `git fetch origin main && git merge --no-edit -m "gh-pages follows main" origin/main && git push origin HEAD:gh-pages`.
7. Append to wip/2026-10-15/STATUS-2026-10-16.md (session branch
   claude/awesome-hypatia-2pxz43): the commit hashes, the suite's run id,
   the counts above, and the Bethlehem proof (the card at Genesis 35:19:7
   offers "בית לחם" and "בית + לחם", no closed-up form).

## Decisions already taken (do not reopen)

- Span store v1.4 (Moses, 17 Oct) is NOT wired: its only novelty is 29 weld
  rows under maqaf keys with gap NONE, and the bake withholds every NONE row
  by the owner's ruling ("drop welding", "and weld fix"). Its other 21 rows
  ride with span store v2 (normalized), which follows the dictionary store.
- The served record is [m, headword, R, year]; the record's source line (D,
  a TSV row) stays in the lane's store under the same rid. Share the record,
  never the claim.
- Piece rows never lead the card: the line is baked from the store and the
  overlays, not yet from the piece store. The next step after this ship is
  the regloss bake reading the piece store's whole-word claims, so the line
  and the card agree with the piece sources on (then pieceLast can go).
- The piece sources have no chips on the sources row yet (chips come from
  the regloss-baked per-book source table and data/overlay-book-counts,
  which reads data/overlays only). Same next step.

## For Moses's delete ledger (unused once this ships)

- corpus-lane-builds/moses-piece-store-v1/ (1.2 GB; v2 supersedes it)
- corpus-lane-builds/moses-piece-store-v2/verify-* (123 MB of verification)
  — Moses's call; the build/ folder (744 MB) is the served bake's source, keep
- corpus-lane-builds/moses-span-store-v1/build/ and build-v1.1/ (51 MB;
  v1.3 is served); build-v1.4 by the decision above
- serving-lane-handoffs/elijah-welds-v1/ once Moses confirms it is consumed
- the earlier list at serving-lane-handoffs/elijah-r2-clear-v1/CLEAR-LIST-FOR-MOSES.txt
