# Builder H2, after the pills: take the ninth cut into S/s16 (nothing ships)

`S` = `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad`
`N` = `/home/user/mashiachsonyosef.github.io/wip/2026-11-27/fresh-build`

## What the ninth cut is

Builder V7 made it in S/s14. It reads unfoldingWord's lexicon (UHAL) and Hebrew Wikisource's Strong's whole, from the corpus lane's store, by their own files. It also adds one bridge code, **W**. A W tag is one where unfoldingWord files one entry under the number, and that entry's own reference to Brown-Driver-Briggs names another word of the number than the one STEP's letter names. The card shows no unfoldingWord row there and says why.

Read `N/V/hand-back-cut-9.md`, `N/V/hand-back-cut-9-W.md` and `N/V/cut9/FOR-THE-CARD.md`.

## What you do

1. **The tools.** Apply `S/s49w/cut9-tools.diff` to S/s16 (`patch -p1` from S/s16). It touches eight tools, none of the page's four:
   - build-place-answers-entries-v1.mjs, check-place-answers-entries-v1.mjs, place-answers-bridges-v1.mjs, place-answers-entries-lib-v1.mjs, place-answers-entries-strongs-v1.mjs, place-answers-entries-tables-v1.mjs, say-place-answers-fetch-plan-v1.mjs, fetch-place-answers-sources-v1.sh.
   - The lead dry-ran it on S/s16's copies as they stood at 19:00 on 27 November. It applies cleanly, and the result is byte for byte S/s14's eight files.
   - If you changed any of the eight since, say so and merge by hand.
2. **The card**, in `reader/tools/place-card-v1.mjs` only, then carry it into place.html and zone.html with `carry-place-card.py`:
   - the ABSENT line with W, as `N/V/cut9/FOR-THE-CARD.md` gives it;
   - the unfoldingWord credits paragraph, as given there. It replaces «Only part of this lexicon is on hand here…».
   - A W line has no entry ids, so it gives no pill. Prove that in the one-place check (a law that a W tag offers no unfoldingWord pill, shown failing on a spoiled copy).
3. **The data.** Run `reader/tools/make-place-answers-v1.sh S/s49w/received/fetched-cut9`. The store reader is `PLACE_ANSWERS_STORE_READER="node S/r2.mjs"`, read only. **Never use S/r2-put.mjs.**
   - It must end «everything holds».
   - The pins must equal S/s14's: joined 79eb1640a5db…, entries f555ad5702c9…, places 641953e29f93…. The page pin moves only by what your pills work changed in the projection; say how it moves.
   - The comparison tool must exit 0 with the 141 known differences.

## Prove it

1. check-place-card-one-place-v1, every law, each new law failing on a spoiled copy.
2. The walk (412 wide, the 29 chapters): no page errors. Count the cards that now draw an unfoldingWord row, and the cards that say W.
3. The 300 pill presses again, and the switch proofs (switch on equals S/base on 50 places; resting lines unmoved off, on and off again, five books).
4. The eight tree checks, each alone.
5. **Pictures**, the same set as `S/s46w/shots-pills/`, retaken into `S/s46w/shots-cut9/`, plus Genesis 1:7 word 1 («made»; its tag is W).

## House rules

As before: no Hebrew in tool string literals or zone.html's own code; American English; one browser at a time; small logs (about 3 GB free); if a write or a fetch is refused, say so and do not route around it. No commit, push or ship.

## Hand back

Your final message, whole:
- what changed;
- each proof with its counts;
- the pins;
- the pictures with what each shows;
- what still reads badly;
- the paths.
