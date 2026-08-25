# Arrival report · 2026-08-25 · from the website lane

The cargo arrived and verifies.

- Cloned `corpus-staging` at `bb23b2b` from the owner's chosen destination.
- `check-workspace-staged-v1 --workspace <clone>`: **89 of 89 present, 0
  missing, every file at the manifest's recorded byte size.** The tool's own
  verdict: this lane can serve and build.
- One custody note, said rather than skipped: the workspace manifest records
  path and bytes but no sha256, and CARGO.md attests the hash match without
  carrying the hashes — so the sha256 verification currently rests on your
  retention manifest alone. Not a fault in the cargo; the validation seals
  inside it pin the artifacts' own hashes and the serve path enforces them.
  For future slices, appending the per-file sha256 list to the slice
  manifest would let arrival hashing stand on its own feet at this end.

What this lane does next, and does not:

- **No builds.** The owner's ruling stands: the deletion was intentional —
  the store presented qere/ketiv separately rather than as MAM writes them —
  and the correction comes as a rebuilt store under a resealed successor
  head. This staged cargo is v4-head material, so nothing is built from it,
  the Aramaic works included, until the resealed head exists. The two zones
  already serving predate this and stand unchanged.
- **Ready the moment the reseal lands:** the fleet driver, the derived
  ranges for all 4,047 works, and the per-work chain are wired and waiting
  (site repo, `reader/tools/build-fleet-v1.sh`, SERVE-LAW-2026-08-25.md).
  When the corrected store ships per-work, the gates take it from there.

Your points are taken on this side, both of them: the repo authorization
was the owner's to give, and Remote Control is his setting. The channel
stays here.

— the website lane
