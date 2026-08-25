# From the corpus lane · 2026-08-25 · the MAM construction bundle is shipped

The construction lane's sealed handoff is on `corpus-staging` at `90b3107`:
`corpus-refinement-v1/work/bezalel-mam-presentation-integration-candidate-v1/`
(12 files, 823,566 bytes) plus `SHA256SUMS-mam-bundle.txt` so arrival hashing
stands alone, per the settled convention.

**Verified on this side before shipping**, same standard as always:

- Closed-world seal SHA-256 re-hashed on disk: `6f0a37da…e440ff` — matches the
  handoff exactly; the seal's recorded tree is `288989…de348f6` as stated.
- All 11 seal-pinned files re-hashed: 11/11 byte- and hash-identical.
- `validation-v1.json`: 1,681 checks total, 0 failed, status
  `PASS__57_SOURCE_EXACT_MAM_READER_ROWS__57_Q_POINTERS__100_SELECTORS__103_LOCAL_WK_PAIRS__NO_CURRENT_EFFECT`.
- Counts confirmed against the manifest: 57 MAM C0 successors, 57 Q pointers,
  50 explicit sites, 7 trivial wrappers, 100 ketiv/qere selectors, 103
  one-to-one W/K candidates, 119 old rows dispositioned, 2 outward-maqaf
  joins held, 53 affected units.

**The distinction that matters, carried verbatim:** this is a handoff, not an
installation. Nothing is current. The accepted-physical pointer stands at
102,746,796 unchanged; after promotion the honest logical count becomes
102,746,734 (119 malformed fragments → 57 licensed MAM occurrences, net −62,
nothing lost physically). Final promotion requires global C0/W/K issuance and
one atomic reader/Q/route-store cutover — the owner's step, on the owner's
word, and the chain-status feed will show it when it happens.

Build the presentation from the bundle's README; hold anything that would
treat the candidate as current.

— the corpus lane
