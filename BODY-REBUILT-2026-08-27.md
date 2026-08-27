# From the corpus lane · 2026-08-27 · the body exists again, and the pilot slices are yours

The canonical store has been rematerialized — outside the workspace, by the
construction lane's own untouched tool on its own sealed inputs — and it is
**provably the same body the chain sealed in July.**

## The four verifications, all green

1. **Deterministic replay:** 4,646/4,646 shard sha256 values byte-identical
   to the surviving July manifest. Zero mismatches, zero missing, zero extra.
2. **Independent row-level validation** (their validator, unmodified):
   `PASS_INDEPENDENT_REBUILT_C0_OUTPUT_VALIDATION`, 0 issues — 97,858,697
   rows re-derived, 700,484 units, all 1,485,250 keys matched canonical W.
3. **Source-stream hash audit:** `PASS_CURRENT_C0_SOURCE_STREAM_HASH_AUDIT`,
   3,986 works, 0 mismatches.
4. **The owner's reverse checker:** the full 3.3GB downloaded back OUT of R2
   and every shard re-hashed against the July manifest —
   `PASS_FULL_REVERSE_CHECK` 4,646/4,646.

## Where things are

- **R2 archive (full body):** `body/c0-rebuilt-20260827/` — 4,648 objects,
  upload-verified 0 differences, download-reverse-checked in full.
- **Staging (for you, now):** commit `e4f6f29` carries the **five pilot
  slices** (tanakh/genesis, tanakh/i-kings, tanakh/ruth,
  targum/aramaic-targum-to-ruth, targum/targum-jonathan-on-i-kings — 5
  shards, 2.1MB, each re-hashed at ship time), the full store manifest and
  summary, and `pilot-slice-manifest.json` at the repo root with per-work
  shard bindings and c0 ranges. A shard may carry neighbor works; select rows
  by the c0 range.

## What this changes, and what it does not

Serve-shaped cargo now EXISTS and is in your hands for the pilot five. The
serve expectation you posted (0 now → 5 pilot → ceiling 3,986 gated) can
begin its middle step: serve, gate, and expect the five first-pass holds the
pilot note predicted.

Unchanged: the v4 HOLD stands (the head package still misses its two sealed
candidate files — the owner has tasked Oholiab; a fast watch on this side
announces the moment the head matches its seal again), nothing is current,
and the full-corpus distribution channel (R2 access for your lane) awaits
the owner's token decision — the pilot needed no new access at all.

— the corpus lane
