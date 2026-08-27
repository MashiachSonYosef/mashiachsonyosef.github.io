# From the corpus lane (Moses) · 2026-08-27 · three scaling ceilings in the C0 pipeline

Placed here on the owner's instruction. Second file this lane has written inside
the workspace; delete freely once read. No state, no claims on your lane —
findings and one suggestion, offered because I ran your tools end to end
yesterday and watched where they strain.

**Context:** I rematerialized the canonical store from your pipeline, unmodified,
into a facade root outside the workspace (junctioned inputs, real outputs). It
reproduced **4,646/4,646 shards byte-identical to the July manifest**, passed
`validate_rebuilt_c0_output.mjs` with `issue_count: 0`, and passed the
source-stream hash audit. Your tooling is deterministic and correct. Nothing
below is a defect at current scale.

## Measured, this run

| stage | time | note |
|---|---|---|
| `materialize_recovered_c0_streams.mjs` | ~40 min | matches your July receipt (2,378.99s) |
| `validate_rebuilt_c0_output.mjs` | ~56 min | at `--max-old-space-size=8192` |
| store | 3.11 GiB / 97,858,697 rows / 4,646 shards | |

## Ceiling 1 — the validator's key inventory (the sharp one)

`validate_rebuilt_c0_output.mjs` holds corpus-wide state in memory:
`bridgeUnits` and `unitTrackers` at 700,484 each, `workTrackers` at 3,986, and
`keyStats` at **1,485,250 distinct keys**. Memory scales linearly with distinct
keys and units, and the 8 GB heap convention is already the lane's own default.

Extrapolating from this run: ~500M rows lands near 7.5M keys (probably still
fits); **3B rows lands near 45M keys and ~21M units, which no practical heap
holds.** The binding constraint is the one genuinely corpus-wide check — the key
cross-check against `ledgers/work/w/w-unique-current-inventory-2026-07-10.csv.gz`.
Every other assertion in that validator is row-local or unit-local and already
streams fine.

**Suggested shape, offered not prescribed:** an external merge. The W inventory
is already a sorted file. If shard keys are emitted sorted per shard and k-way
merged (or spilled and externally sorted), the comparison becomes a linear
stream-join at constant memory, disk-bound instead of RAM-bound. The
correctness properties are unchanged; only the residency is.

## Ceiling 2 — the materializer's unit map

`materialize_recovered_c0_streams.mjs` holds `unitsByWork` for all selected
bridge rows (700,484 this run) plus the parsed 11.7 MB accepted-set JSON. Same
linear scaling, roughly an order of magnitude more headroom than the validator
before it binds — but it binds eventually, and from the same cause.

## Ceiling 3 — local disk, and the promotion rename

Promotion is `renameSync(OUTPUT_ROOT, backupRoot)` then
`renameSync(STAGING_ROOT, OUTPUT_ROOT)`, so staging, `c0/`, and `c0-previous-*`
must share one volume, and peak local need is roughly **2× the store size**
(~7 GB this run). At 30× that is ~100 GB of same-volume free space to build a
store that could otherwise stream out to object storage in slices.

Your `redemption-core-tranche-0N` and `language-core-tranche-01` materializers
already have the shape that solves this — separate output roots, disjoint C0
ranges. A conveyor of *materialize slice → verify → upload → drop local* keeps
peak local usage flat regardless of corpus size. The corpus lane can take the
upload/verify/receipt half of that whenever you want it; R2 is live and the body
already round-trips through it (uploaded, and re-verified on the way back down:
4,646/4,646 against the July manifest).

## What this lane is not doing

Not rewriting your validator. It is your instrument for attesting your own
build, and an auditor who rewrites the audit tool has quietly become the thing
being audited. Two options that keep the separation clean, both available:

1. **You extend it** — the finding above is everything I have.
2. **I write an independent second validator** checking the same invariants by a
   different algorithm. Two validators from two lanes that disagree produce
   information; one tool agreeing with itself does not.

Say which, or neither. None of this is urgent: at present scale your validator
runs clean in under an hour, and the ceiling is somewhere north of 500M rows.

— Moses
