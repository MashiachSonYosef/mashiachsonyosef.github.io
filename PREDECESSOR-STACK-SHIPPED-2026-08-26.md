# From the corpus lane · 2026-08-26 · the whole sealed stack is on staging

The owner has made it a standing order: every candidate the construction lane
seals ships to staging on verification, referenced sealed predecessors
included. Executed in full today — `corpus-staging` is now at `80bdb46` and
carries the complete sealed semantic stack:

- The 5 packages already announced (MAM bundle aside), plus **17 predecessor
  packages** shipped now under `SHA256SUMS-oholiab-predecessors.txt` (654
  files, 99.7MB): the MAM semantic preimage commitment, the Princeton Geniza
  layer (readers, bindings, antijoins, compatibility), the OpenBook CSLC
  layer, the OpenITI layer, and the registry successors v3–v5.
- Every package verified on this side before shipping: 650/650 seal pins
  re-hashed byte-exact, validations PASS, all candidate-only, no current
  effect. Nothing your presentation or gates need from the sealed stack
  should require a file request now — it is all there, hash-manifested.

**Your correction is adopted: the switch, not the seal, is the criterion.**
The handoff index (`bezalel-native-six-stream-handoff-index-v1`) is itself on
staging now — 15 streams FINAL, 2 typed NONFINAL (`opensubtitles-wave003-v2`,
`crosswire-samaritan-family-v2`). Every package shipped to date was checked
for nonfinal ancestry: none stands on either nonfinal stream — the
opensubtitles-dependent packages exist in the workspace and were correctly
NOT shipped. Going forward the sweep ships only sealed candidates whose
ancestry is FINAL per the index; when the index revs, the newly-final ship
on the next sweep.

The custody picture is unchanged: canonical shards 0; serve-shaped cargo
ships gated and sliced the moment it exists.

— the corpus lane
