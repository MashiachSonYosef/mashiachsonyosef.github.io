# The store move (23 November 2026)

The corpus lane's store cut (relay v216's act) reached its step 3 on 22 November: the kept text files went up compressed, some packed into parts, the store-only data copied to the lane's disk first on the owner's yes (13:23 UTC, to my recommendation). Its step 5 deletes the old names, and waits on my letter naming my move.

**Shipped:** `main` b1acf1e22069ed953ccd7a5eac4253ffc52b26c7, `gh-pages` 19ce201be1d26b85134870ac89de25c0617650a0, pushed 2026-11-23T01:49:27Z. Letter: `wip/2026-11-23/FOR-MOSES-2026-11-23-the-move-is-done.md`.

## What moved, and what did not

- `reader/data/store-path-map/`: the lane's two lists, byte for byte (renames 2,780, sha256 d88e9eb3…; also held 220, sha256 ba70a5f5…).
- `reader/data/store-path-map-v1.json`, section `after_the_cut` (written by `tools/emit-path-map-after-cut-v1.py`): the rule (a renamed address stands as `.gz`; a packed one as a part's member, named; 16 leave, named with their home; the rest under their own names), what was checked, the 204 packed and the 16 leaving one by one.
- `reader/PIPELINE.md`: one dated paragraph (`tools/patch-pipeline-doc-after-cut.py`).
- **Not moved, by the map's own rule:** no pin or record is rewritten. Nothing on the site reads the store, and the round reads only local copies held to their pins.

## Checked (`tools/verify-move-v1.py`, `measures/verify-move-summary.json`)

- 2,804 objects read from the store (2,780 `.gz` and 24 parts) into a new folder.
- 2,984 files unpacked and held to their list's bytes and md5: all equal, 0 faults. 376 also named by sha256 in this repository's records: all equal.
- 85 store addresses named outside `wip/`: 38 renamed, 5 packed, 33 folders the lists cover, 3 folders and 6 files standing under their own names; none not found (`measures/addresses-this-repository-names.json`).
- Of the 16 leaving: 9 are in this repository; 7 (two superseded strands' builders and receipts) are on the lane's disk only. Moses's note said all 16 were here too; corrected in the letter.
- On the tree with the change: the 16 checks that read the document or walk `data/` (`measures/checks.txt`): all pass.

## Left

- Moses tells me when step 5 is done; I list the store once against the map.
- v221 (the held rows' resting rule, `places-v3.1.jsonl`): its own ship, after step 5.

## Live

Live check 85 on b1acf1e220: success (its Pages build triggered it). `check-nothing-unlanded-v1` after the push: ok, 3 assertions (`measures/check-nothing-unlanded-v1-after-push.txt`). `S/old` stands on b1acf1e220.

## After step 5 (the corpus lane: done 06:15:35 UTC, 23 November)

The store listed whole: **93,213 objects, 6,866,113,768 bytes**, the lane's own figures, under the 8,000,000,000 ceiling. Against the map (`tools/check-store-against-map.py`, `measures/store-against-map-after-step-5.json`): all 2,780 `.gz` names and the 24 parts stand, each at the size its object had when its bytes were checked; all 3,000 old names are gone; the 6 files and 3 folders the map says stand under their own names stand; the shelf holds 3,595 objects. **0 faults.**

A correction of my own: my first count of the store and of the shelf dropped the keys whose names hold «warn» or «trace» (a filter meant for the tool's own warnings); 22 objects. Counted again with only the tool's warning lines dropped, the figures are the lane's.

The lane's correction of mine: the 7 superseded builder files are not on its disk alone; all are in git on corpus-staging (`corpus-lane-builds/moses-coverage-trial-v1/`, `corpus-lane-builds/moses-read-words-v1/`).

Left for the owner, from the lane: three settings on the bucket in the store's dashboard (a lifecycle rule deleting `v2/scratch/` after 14 days; the default abort of unfinished uploads after 7 days left on; a budget alert). Neither lane's key can set them.

