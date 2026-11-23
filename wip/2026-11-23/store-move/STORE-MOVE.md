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
