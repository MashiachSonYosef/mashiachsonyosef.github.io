# R2 disposition conveyor · policy v1 · 2026-08-26 · the corpus lane

The construction lane proposed the shape; this settles the mechanics. Goal:
storage relief as a validator-backed conveyor, never ad-hoc deletion.

## Roles — unchanged separation of duties

- **Construction/retention lanes** seal allowlists and (after receipt) perform
  local disposition. They never hold bucket credentials.
- **The corpus lane (uploader)** verifies, uploads, re-verifies, and issues
  receipts. It never deletes anything local — the auditor does not hold the
  knife, per the standing rule.
- **The owner** rules on anything an allowlist claims beyond reproducible
  artifacts (the two-roads rule: irreplaceable content needs a second
  independent home before local disposition).

## Bucket layout (`r2:mishkan/`)

- `corpus-staging/…` — mirror of the GitHub staging tree (live, verified).
- `cas/sha256/<aa>/<full-sha256>` — content-addressed blobs, immutable,
  deduplicated; `<aa>` = first two hex chars.
- `disposition/<allowlist-id>/manifest-v1.json` — the allowlist's entries
  (`path`, `bytes`, `sha256`) exactly as sealed, plus upload metadata.
- `disposition/<allowlist-id>/receipt-v1.json` — the uploader's receipt:
  per-entry verification result, verification depth, timestamps, bucket
  object counts.

## The conveyor, step by step

1. **Seal.** A lane produces a sealed allowlist package — closed-world seal
   over a manifest of exact `{path, bytes, sha256}` entries — named
   `*disposition-allowlist*`, under `corpus-refinement-v1/work/` or
   `storage-maintenance-v1/control/`. Live paths (e.g. the Wave004 intake)
   are the sealing lane's responsibility to exclude.
2. **Detect + verify.** The corpus lane's 3-hour sweep picks it up, re-hashes
   every listed file against the manifest. Any mismatch: the allowlist is
   refused whole, on the record.
3. **Upload by content hash** to `cas/`, skipping blobs already present
   (dedup is free under content addressing).
4. **Re-verify from the bucket.** Tranches ≤ 2GB: full download + re-hash of
   every object. Larger: full object-size listing plus a random sample
   re-hash (max(10%, 50 files)), depth recorded in the receipt.
5. **Receipt.** Written to `disposition/<id>/receipt-v1.json` in the bucket,
   mirrored to `The Tabernacle/disposition-receipts/<id>.json` on disk for
   the local lanes, and announced on chain-status.
6. **Disposition.** Only after the receipt exists, and only by the
   local lanes/owner, and only for files the receipt covers. The receipt id
   belongs in the deletion's own record — no more unadjudicated 10:52s.

## First targets (per the construction lane, endorsed)

Completed Codex session logs and retained replay authorities — reproducible
or terminal artifacts, cleanly outside the live paths. Irreplaceable-class
content (source streams, ledgers, chain control) stays out of scope until a
second provider exists.

— the corpus lane
