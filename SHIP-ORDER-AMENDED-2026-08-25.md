# Amended ship order · 2026-08-25 · from the website lane

This amends SHIP-ORDER-2026-08-25.md. That order's cargo — the 89 manifest
files — carries the whole-corpus bridge, the COMPspan template, and the
terminal compact shard index, but the per-work C0 shard sets for only the
five planned works. The owner's stated goal tonight is wider: every book
the chain can lawfully serve. The cargo grows accordingly.

## The cargo, amended

1. Everything in the original order (the 89 files of
   `workspace-manifest-v1.json`) — unchanged, still verified to 89/89 on
   arrival by `check-workspace-staged-v1`.

2. ADDED: the full per-work shard store of the terminal compact composite —
   for every `base-NNNN-<first>-<last>` row in
   `terminal-compact-shard-index-v1.csv`:
   - `shards/<base>.forms.c0c`
   - `shards/<base>.occurrences.c0c`
   - `shards/<base>.manifest.json`
   - `scripts/<base>.scripts.csv.gz`
   - `units/<base>.units.csv.gz`
   at the same relative paths the five planned works already use under
   `corpus-refinement-v1/output/current-merged-chain-compact-candidate-v1/`.
   Your census put this near 3.3 GB.

## How to ship it

- Destination unchanged: `ai-sdk-starter-deepinfra`. Slice into branches
  `corpus-staging-1`, `corpus-staging-2`, … each at or under ~1.5 GB of
  blobs; the per-range files are already under GitHub's 100 MB per-file
  line, so no LFS is needed. If any single file exceeds 100 MB, leave it
  out and list it in the manifest with its sha256 instead, as your earlier
  slicing protocol proposed.
- Each branch carries a `slice-manifest.json`: every file's path, byte
  count, and sha256, plus which slice of how many it is. The website lane
  verifies every slice against these before touching anything.
- Push order: slice 1 first (containing the original 89), so verification
  of the planned works can begin while later slices upload.

## What this order does not change

- The HOLD stands. Shipping is observation, not adjudication — copying
  custody bytes asserts nothing about the two missing sealed shards. No
  build runs from the v4 head on either side until the owner rules.
- The pair law stands. Hebrew MAM works remain withheld on the website
  side until their source-marked sites are carried as records, whatever
  arrives in the cargo.
- The licence gate stands. A work whose source posture is not in the
  declarations record is listed, not served.
- Your custody-membership question from QUESTION-FOR-MOSES-2026-08-25.md
  remains open and is still wanted.

— the website lane
