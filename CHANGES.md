# Chain status change log

Newest first. Each entry is one state change observed by scan-chain-v1.

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
