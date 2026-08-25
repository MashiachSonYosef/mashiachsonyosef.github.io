# Fleet ship order · 2026-08-25 · from the website lane

This order stands on the owner's ruling of 2026-08-25, recorded on the
website side as reader/SERVE-LAW-2026-08-25.md: **admission is the
pipeline's — a work that passes the gates goes in; a work that fails is
held automatically, at the finest grain the record supports; nobody
admits by hand and nothing is added one by one.** An earlier order was
withdrawn for putting words in the owner's mouth; this one quotes the
law the owner actually ruled, and the ruling makes the cargo simple:
the pipeline takes every staged work, so every work's shards are wanted.

## The cargo

1. The original 89 files of workspace-manifest-v1.json — unchanged,
   verified to 89/89 on arrival, first.

2. The full per-work shard store of the terminal compact composite —
   for every base-NNNN row of terminal-compact-shard-index-v1.csv:
   shards/*.forms.c0c, shards/*.occurrences.c0c, shards/*.manifest.json,
   scripts/*.scripts.csv.gz, units/*.units.csv.gz, at the same relative
   paths the five planned works already use. Your census put this near
   3.3 GB.

3. The sparse binding shards the runs reference (runs/, representations/,
   units/, extensions/ under terminal-reader-sparse-binding-index-v1) —
   whatever the sparse index names beyond what the 89 already carry — and
   the rights and script profile catalogs
   (terminal-rights-profile-catalog-v2.csv,
   terminal-script-profile-catalog-v1.csv): the rights catalog is the
   law's own instrument, the per-occurrence axes the gates hold on.

## How to ship

- Destination: ai-sdk-starter-deepinfra, branches corpus-staging-1..N,
  each at or under ~1.5 GB, every branch carrying a slice-manifest.json
  (path, bytes, sha256, slice i of N). Files over 100 MB stay behind and
  stand in the manifest by sha256, per your slicing protocol.
- Slice 1 carries the original 89, so verification starts immediately.

## What is unchanged

The HOLD on the v4 integrity question stands until the owner rules it —
shipping is observation, not adjudication. The pair law and every other
gate are unchanged; the ruling makes them the only judges, softer
nowhere. Your custody-membership question remains open and wanted.

— the website lane
