# Status · the review's round · 10 November 2026

## What is live

| | |
|---|---|
| `main` | 51a514d24d741697f2ed4e08ca201a4de43fb8f7 |
| `gh-pages` | 2ab92aee84076ff41aeb05957bd494f3628d7004 ("gh-pages follows main") |
| Before it | `main` efdb4aaa, `gh-pages` 2bb488bc |
| Pages deployment and live check | see the foot of this file |

## What shipped

The review is `REVIEW-2026-11-10.md` beside this file; its section 9 lists what was done and what was not. In one paragraph: eleven faults a reader could meet are fixed, each proven before and after; the check suite says how each check is run and tells the truth about what it could not judge; the shelf's record says which files the door publishes and keeps the other seals apart; the round is a file in the repository, proven byte for byte against the live zones from the store's v2 layout; the corpus lane's v167 is wired.

## The proofs, and where each is kept

| Claim | Proof | Kept in |
|---|---|---|
| The round script reproduces the live zones | Run on a clean copy of efdb4aaa from the v2 inputs: 40 zones, 21 commentary and 39 lattice sidecars, no file differs | `logs/round-proof-on-live-commit.log` |
| In the round that shipped only the count stamps moved | 108 files the same bytes, 39 differ, each only under `count_stamp` | `tools/probes/bins-diff.mjs`; `logs/round-that-shipped.log` |
| The suite | 162 runs: 144 of 145 pass (the one red is "uncommitted work exists", green on the commit); 17 could not reach their inputs; 10 laws in 6 checks not judged, each named | `logs/suite-2026-11-10-after.log` |
| Same product | Against efdb4aaa: 9,403 lines on 18 pages and 54 first cards the same, 0 differing | the commit message |
| The readings' three rows | The live build held three rows with 548.17px under the word and the new page two with 547.86, before the fix; after it, three rows at every word height on that phone | `logs/reading-rows-geometry-live.log`; `tools/probes/rows-scan.mjs`, `card-anatomy.mjs`, `bisect-variant.mjs` |
| Where the unserved works' files are | The store's listing and manifest against the seals; the store record at six archived commits; 21 files downloaded and hashed | `tools/probes/shelf-compare.mjs`, `pins-through-time.mjs`, `backup-verify.mjs` |
| The commentary's alignment against the backup's zones | With the 21 backup zones beside the tree: the sealed count is the count attached for all 21; 7,694 units' words compared and the same | `tools/probes/sidecar-sources.mjs`; section 3 of the review |
| v167 moved no figure | The witness record before and after: two rows added, 39 rows name their source anew, none moved | `tools/probes/witnesses-diff.mjs` |
| Every exact-text edit made to the tree | 30 scripts, each refusing unless its text stands exactly as many times as it says | `tools/edits/` |

## Owed

**The owner's** (section 10 of the review has each with its facts):

1. The unserved library's seals: read them again off the backup of 28 September, or leave them as the record of a build whose bytes are gone. Nothing a reader opens depends on it.
2. What a new reader opens with (blobs, card numbering): a first visit and the reset disagree.
3. A run's words closed up into one string as a reading («To dirty», «mango»): the code does it, the comment and the rail say it does not.
4. The commentary index: it waits with the commentary now; one line if it should be the way in.
5. Comments shipped in the engine (about 136 KB of a first visit's 330 KB compressed); "licence" in stamped names; the six superseded tools.
6. From before: where the shelf's other works serve from; the palette pick; the eight calls on the corpus lane's route; the two Tikkunei Zohar rules; Exodus 1:1.

**The corpus lane's:** the letter of this evening (`../FOR-MOSES-2026-11-10-read-split-wired-v2-inputs-shelf-backup.md`) asks only that `serving-lane/shelf/` stays. Open from before: road A's store, the 34 records, the four ranks, the part of speech for "her", the mend of the 16 paseq lines.

**Mine, next:** section 5 of the review (one rule in one place), now that the round can prove each move; then the readers' unproven list in section 1, each with its own browser proof.

## Deployment and live check

- `gh-pages` 2ab92aee was pushed at 18:34 UTC. The Pages deployment (run 1348) built in 46 seconds and then stood at "syncing_files" for ten minutes, at which GitHub's deploy step canceled itself ("Timeout reached, aborting!", 18:45:52). This is the failure of runs 1339 (7 November) and 1343 to 1345 (this morning): the step waits on GitHub's file sync and nothing in the build is at fault. The published tree is 3,554 files and 370 MB, of which this ship changed 1,523 files and 71 MB.
- The failed job was run again at 18:47 UTC (attempt 2). What it and the live check said is in the lines below, added when they ended.
