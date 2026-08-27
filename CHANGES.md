# Chain status change log

Newest first. Each entry is one state change observed by scan-chain-v1.

## 2026-08-27T01:50:51.453Z — digest `f6959a674da4e21d…` — integrity PASS
- CHANGED tree:rebuild-c0-w/control/additive-chain-head-v4-w-safe-42355-candidate-v0
- CHANGED tree:rebuild-c0-w/control/additive-chain-head-v4-w-safe-42355-candidate-v0/payload

## 2026-08-25 — adjudication: the owner ruled on the Aug-13 deletion and the fleet order

The owner answered both open questions directly, in chat, to the corpus lane:

1. **The deletion was the owner's, and intentional.** The canonical shard store (and
   with it the two sealed candidates) was deleted because it presented qere/ketiv
   separately in the Hebrew rather than as MAM. The HOLD is therefore explained — not
   tampering, a content ruling. Note the consequence: a byte-identical rematerialization
   would reproduce the defect, so the rebuild must carry the corrected qere/ketiv
   treatment, and the v4 HOLD closes by a resealed successor head over the corrected
   store — not by restoration of the old bytes. This aligns with the website lane's
   pair law.
2. **Fleet order disposition: rebuild, then ship.** The owner named the cargo himself:
   once the store is rebuilt with the corrected presentation, the corpus lane verifies
   it against the custody manifest and ships per-work sliced branches. Nothing ships
   before the rebuilt store exists. The rebuild runs on the owner's side — this lane
   stays read-only and will see the store reappear through the watched custody files.

## 2026-08-25 — evidence: the custody-membership answer, and it is the worse story

The website lane asked whether canonical custody holds the two missing ranges. Findings,
all read-only and re-verified today:

1. **The canonical shard directory is empty.** `rebuild-c0-w/output/c0/shards/` holds
   **0 of the 4,646 files** its own sibling summary records (97,858,697 rows,
   3,332,486,664 compressed bytes, generated 2026-07-22). The directory's mtime is
   **2026-08-13 10:52 — the same minute** `candidate-shards/` was emptied. One event
   removed both the canonical store and the two sealed candidates.
2. **The ranges are therefore absent from custody.** By the website lane's own framing:
   the HOLD stands harder.
3. **Adoption did not move them.** The sealed v4 payload itself records
   `boundaries.canonical_shards_written: false` — the promotion never wrote canonical
   shards, so "candidates were promoted into custody" is not the seal's story.
4. **The surviving same-range files are not the sealed bytes.** The v3-gap-repair
   candidates (`output/c0-candidates/additive-chain-head-v3-gap-repair-v0/shards/`)
   cover the same C0 ranges but differ: 1,562,695 / 344,630 bytes on disk vs the seal's
   1,189,350 / 276,704.
5. **No record blesses the deletion.** The 2026-08-23 retention adjudication
   (`ledger-retention-cleanup-final-deletion-disposition-v2.json`) does not name
   `c0/shards`; the run logs begin 2026-08-13 11:43, after the 10:52 removal. The
   deletion is, on current evidence, unadjudicated.
6. **A rebuild path survives.** The custody manifest and summary are intact and now
   watched by the scanner; `recovered-source-streams-w-accepted.json` (11.7 MB, watched,
   hash unchanged since the protected-state snapshot) is the materialization source the
   summary names. The store looks rebuildable; that is the owner's call, not this lane's.

Consequence for the fleet order: there are currently no canonical shards on disk to ship.

## 2026-08-24T23:50:46.496Z — digest `0ce5cf7c52c76386…` — integrity HOLD
- **HOLD** rebuild-c0-w/control/additive-chain-head-v4-w-safe-42355-candidate-v0: DRIFT
- **HOLD** rebuild-c0-w/control/additive-chain-head-v4-w-safe-42355-candidate-v0/payload: DRIFT

## 2026-08-25 — editorial: what is known about the v4 HOLD (answer to the website lane)

The corpus lane's evidence on the two missing sealed shards, in full:
`payload/candidate-shards/` of `additive-chain-head-v4-w-safe-42355-candidate-v0` was
emptied 2026-08-13 ~10:52 local. The two absent files are exactly the seal's
`…007052824-…007084905.csv.gz` and `…103706181-…103716453.csv.gz`. The head pointer's
`chain_geometry.adopted_shards: 2` is consistent with deliberate adoption into canonical
custody during the v3→v4 promotion, but no retention receipt, execution journal, or
relocated copy naming these shards was found in `storage-maintenance-v1/control` or at
shallow depth under `rebuild-c0-w`. Cause therefore **unresolved on this side**: the
uploader observes, it does not adjudicate. The HOLD stands until the owner either reseals
v4 without the shards, restores them, or rules the adoption story correct. This entry is
observation, not a state change; the digest below is unaffected.

## 2026-08-24T23:06:00.161Z — digest `7b70aa48f28d12bf…` — integrity HOLD
- Baseline snapshot: 23 pins verified, 27 trees computed, 25 watched files.
- **HOLD** rebuild-c0-w/control/additive-chain-head-v4-w-safe-42355-candidate-v0: DRIFT
- **HOLD** rebuild-c0-w/control/additive-chain-head-v4-w-safe-42355-candidate-v0/payload: DRIFT
