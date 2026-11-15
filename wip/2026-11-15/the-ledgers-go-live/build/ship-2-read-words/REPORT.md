> The read-words builder's report (the continuation on Opus), as returned to the lead.

Ship 2 (v192, the read words) is finished and committed as b9da2703b7 on ledgers-build-ship2, in scratch tree b4c. It cherry-picks onto the shipped main 46bbbf7d50 without a conflict (checked with git merge-tree).

**Review of the stopped builder's work.**
- The pins hold. The 5 files equal the relay byte for byte, and their sha256 match the letter, the receipt and plan 4.2. The receipt's 39 lattice inputs match the positions files the round projects from, for all 15 books.
- The apply, the module, the check, the page change and the round step hold as the builder left them.
- I made 7 fixes or additions:
  1. E7 had stopped refusing a tag on the word itself next to tagged read words. It refuses that again.
  2. E7 crashed (`rowsOf(undefined)`) on a tagged form with no key. It now reports the fault instead.
  3. `strokesAgainst` now also checks each stroke line's `among_the_listed_places` against the list.
  4. The apply now declares GUARDS (it said RULE).
  5. `read-words-v1` now declares GUARDS.
  6. PIPELINE.md's note now says that the pin can hold a place's pieces back.
  7. A step script for the lead, `fin/ship2-steps.sh`.

**The proof, starting from the commit.**
- The round's zone tools re-projected the 15 books. All 30 zone and sidecar files came out byte for byte the shipped main's.
- The old page over those zones draws the shipped resting lines, line for line, in all 15 books. So the shipped records are the before state.
- Apply dry run: 56 tags at 28 places; 13 places laid (41 pieces); 14 places whose own pieces equal the list's (36 pieces); Psalms 10:10 held; stroke facts equal v179's at 16 of 16.
- Real run: writes the 15 zones. A second run writes nothing, same bytes, even with another stamp.
- Resting lines, word by word, over 230,597 entries: 13 lines move, all at NEW places, 0 elsewhere.
  - Of the 29 read words at the NEW places, the list's pieces change 21. 19 change on the page; Psalms 10:10 is held.
  - The 14 TIES places do not move.
  - The plan's examples all hold.
- The step script, run on the shipped main's own zones, wrote 15 of 15 zones with the same bytes as this rehearsal.

**Figures that differ from the plan.**
- Cards: 1,073 rows withheld and 1,563 kept, where the plan says 1,074 and 1,562. The plan counted on the store before v190. The one row is TAHOT's «Lo-» (לא, rank 24), under I Samuel 20:2 read word 1; v190 gave it H3808.
- check-entry-gate E7 is green only with the served list narrowed to the 15 re-projected books. On this base, the other 24 zones' sidecars still name the v172 ledger.

**Two reds that also stand without this change.** Both are shown on the before state.
- check-kq-lead-follows-switch-v1 on Deuteronomy, K1: it expects 2 halves per pair and finds 3 at 33:2, a read form of two words.
- check-line-reads-the-place-v1, P3, on the opening screens of 12 of the 15 books. The failing cards are runs and sets in the first verses, none at a listed place. The suite runs both checks only on Amos, where they pass.

**One thing to decide: Psalms 10:10.** The plan lands its tags and holds its pieces, so its line still reads «common + broken». Every row that prints «common» is of H2455, another entry than the read word's tag H2428A, so the read word's block on the card withholds them. The line prints a reading its own card withholds.

**PIPELINE-MANIFEST.md is not committed.** The round's door step writes it. Its emission on this tree registers the rule, the guard check-read-words-v1, and the step run by round-v1.sh.

**Notes and scratch.**
- Notes: /home/user/mashiachsonyosef.github.io/wip/2026-11-15/the-ledgers-go-live/build/ship-2-read-words/NOTES.md
- Scratch and logs: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v64/ship2/fin/
