> The facts builder's report (the continuation on Opus), as returned to the lead.

Ship 4's facts side is finished and proven. I wrote no code: nothing authored was missing, and the tree has no new commit. The twin mend was already in place, in commit 0378a53493 (the follower's twinKeyOf plus apply-row-entries). Tree /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/b4, branch ledgers-build, HEAD 27feeb2ea2, holds the 3 store commits and the 8 facts commits. Its reader/data is the after-3 state plus facts steps 6 to 8: store ccec4fa3071b, 651,752 routes, 122,496 keys, 310 modified and 2 untracked generated paths, all uncommitted, nothing staged.

1. REVIEW
- Before I ran anything the tree was at after-3: store 5bee25fd9681, 651,752 routes, 122,496 keys, and all 269 generated paths match state/after3/SHA256.txt. The builder had re-made it at 09:28 to 09:30 by running the store steps through 3 at HEAD, and that table equals the proven one.
- state.sh can no longer load anything. The saved files of state/after3 and state/after5 were deleted at about 09:26; only MANIFEST.txt and SHA256.txt are left. `state.sh load` would first reset every generated path to the commit and then fail on the copy. Do not use it. In its place I saved the after-3 bytes of the 46 paths the facts steps write in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v64/ship4-facts/mine/after3-facts-paths.
- Calls 6 and 2 are held as the lead decided. data/audit-calls/PIN.json gives each landing a `held` entry with its reason. A6 and A7 are green. The strike record has no call-6 or call-2 round, and no tool reads call6-picks-words-withheld-too.
- Twin mend, checked by an independent recount from call 5's own list and the ledger (scripts/recount-twins.py). There are 4,109 SAME_SOURCE_TWIN lines; 4,061 are of the ledger's 15 sources, and every one has its twin in the ledger. Call 5's repoint_picks_to agrees with the twin found by source and words in every case. Exactly 2 pairs have a twin that lacks an entry: M5 rank 1 «from» gives n H4480 and b m.cl.aa to rank 12, and M5 rank 20 «out of» gives the same to rank 41. Both pairs are recorded in data/row-entries-receipt-v1.json and index.row_entries.followed.entries_given_to_a_twin, with the two rows named.
- The builder also gives BDB's own entry (b), not only the number. That is right: with n alone, the twin would carry the numbers of two entries but BDB's entry of only one. It changes no other verdict, because no BDB (M5) row under the key lacks a number.
- Lint: the 11 changed tools are clean at the base and at HEAD, and a probe file shows the linter reads the folder. No Hebrew characters in the tools, and no British spellings in the added lines.

2. PROOF OF THE MEND
- The 600 call-5 lines of entry-gate-after-call5-v1.2.jsonl, measured with the page's own gate functions at each place's core tags:
  - after-3: 0 let through, 600 withheld;
  - final state: 468 let through (all «from»), 132 still withheld.
- All 132 still withheld are OTHER_SOURCE_TWIN on call 5's list. In each case a STEP (M4) row was struck because another source holds its words under the plain key, and v1.2 re-pointed the pick to that row, which is another entry's at the place. Examples: «of» at H1768 goes to M5 H1767/H4078; «on» and «concerning» at H5922 go to M5 H5920/H5921. The mend covers same-source twins only, so these stay withheld. Their return under the plain keys, each with its own credit, is the 1,294-row list already asked of the corpus lane.
- «from» (rank 12) and «out of» (rank 41) stand at all 736 places in 35 books where the page asks their key with H4480 among the core tags. That was 0 before. The builder's 619 counted only words whose own key is that one.
- check-entry-gate E3 to E5 and check-default-picks D2 are green on the final state; their figures are below.

3. RUNS
- Two runs of ship4-facts-steps.sh from after-3. Between them I restored only the 46 paths the facts steps write, and the full 2,089-file snapshot was then equal to after-3. Both tables are the same bytes (sha256 543611353f7d…), which equals the builder's ship4-facts-sha256.txt, and reader/data after run A equals reader/data after run B.
- A third run on main 46bbbf7d50's zones, sidecars and resting lines (the shipped tree differs from the build tree in those 140 files) gave the same table byte for byte.

4. CHECKS on the final state
- Green:
  - check-route-store-exact-k L1 to L10;
  - check-store-continuity C0a to C5;
  - check-audit-calls A1 to A9;
  - check-fold-strike-landing F1 to F7;
  - check-made-spaces M1 to M10;
  - check-entry-gate E1 to E6 and E8 to E14;
  - check-names-gate N1 to N9, N7 included;
  - check-sense-openings O1 to O9;
  - check-default-picks --node D0, D1, D2, D3, D5, D19;
  - check-form-of F0 to F11;
  - check-ledger-declared;
  - check-manifest-prints-unguarded L0 to L6, run against a fresh scratch emission.
- Red on a wrong state and green on the right one:
  - F9, F10 and N7 are my proofs. F9 and F10 went red on a strike record with one v188 landing removed and one re-key's rank changed; N7 went red on a store where one addendum row carries the name mark. Each time the right bytes were put back.
  - The builder's earlier proofs: E3, E5, N4, O4 and D2 red before the facts steps; A6 and A7 red on the after-5 state.
- Two reds remain, and both are the round's, so the lead's:
  - E7: the build tree's lattice sidecars name relay v172's ledger. Main's sidecars already name v190's, so E7 may be green on the shipped tree.
  - Manifest L5 against the committed manifest: it is stale since ships 1 and 3 and is regenerated by the round.
- Also the lead's after the round, because they read projected zones and records: D3 again, the page laws D4 to D19, check-line-reads-the-place-v1 and check-disk-gloss-is-the-line-v1. The builder ran the last two at 09:24 on data identical to mine, and both were green.

5. FINDINGS left for the lead's call (no code changed)
- (a) Two tools compute the twin's union: apply-row-entries, and check-entry-gate E5 as its own recount. E3's twin clause is an independent check of the same property.
- (b) apply-row-entries looks for a twin only among rows the ledger lists. A same-source twin landed since (with no line) would be skipped without a word; E3 would turn red. This case does not occur today.
- (c) made-spaces-second-road-v1.mjs (the store side) walks the strike record by "versions reached since", which the follower's header says is never asked. That breaks "one rule in one place".
- (d) Ship 2's branch ledgers-build-ship2 (b9da2703b7) conflicts with ledgers-build only in reader/PIPELINE.md: both add a paragraph after the same line, so keep both. check-entry-gate-v1.mjs and round-v1.sh merge without conflict.
- (e) No path authored on ledgers-build has changed on main since ec1c8a6764, so the 11 commits cherry-pick cleanly onto main 46bbbf7d50.

Notes: /home/user/mashiachsonyosef.github.io/wip/2026-11-15/the-ledgers-go-live/build/ship-4-facts/NOTES.txt. Evidence: /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/v64/ship4-facts/mine/ (facts-run-A, -B, -M, final/, red/, recount-twins.out, gate-after-call5.*.out).
