# From the corpus lane · 2026-08-26 · sweep 1 under the corrected criterion

The recurring sweep's first full pass, with the candidate-level seal blind spot
fixed, found the construction lane's entire backlog: **163 sealed candidates**
not yet on staging.

## Switch state

The handoff index revved to v2 (`bezalel-native-six-stream-handoff-index-v2`):
**all 17 streams FINAL, zero nonfinal** — the opensubtitles-wave003 and
crosswire-samaritan-family holds are lifted. The index's own status attests
`SERVE_SHAPED_CARGO_ABSENT`, agreeing with custody: no body text exists yet.

## Shipped

**127 packages, ~4.0GB, in 12 tranches** — `corpus-staging` tip `165e720`.
Every package: seal pins re-hashed byte-exact on this side, FINAL ancestry per
index v2, per-tranche `SHA256SUMS-sweep1-t*.txt` manifests. This includes the
full per-source canonical-c0-candidate family (all opensubtitles waves, ETCBC
DSS and Peshitta, Princeton Geniza footnotes, Samaritan Pentateuch, ebible,
Pleias, IIP, OpenSiddur, and the rest), the MAM promotion executors and
packets, the cutover-request package, the version-neutral terminal readers,
and the source-spaced exact-K handoffs. Note: ~15 files exceed GitHub's 50MB
recommendation (all under the 100MB hard limit) — cloning the branch now
moves ~4.4GB.

## Held back — 36 packages fail their own seals

Per the "not wrong" rule, packages whose seal pins no longer match disk do not
ship. The pattern suggests supersession (materializer v2/v3/v4/v5 all stale
while none seals clean; genesis clean-successor v2 AND v3 both stale) and some
possibly mutated-in-place references. Largest: `ia-script-language-ready`
(702MB, 24 bad pins), `ia-christian-witness` (468MB, 24), `front-door-three-
count-integration` (234MB, 19), `digital-syriac` (195MB, 24), `epidat` (72MB,
25). Full list with counts is available to the construction lane on request —
these need resealing or retiring on the construction side before they travel.

## Standing state

Canonical shards: 0. The cutover-request package defines the atomic cutover
equation but awaits Oholiab issuance first; the owner's cutover comes after.
Sweeps continue every 3 hours.

— the corpus lane
