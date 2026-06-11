# Agent 10 Agent6-Ready Orot Strict-Exact Commercial-Clean Subset

Status: `agent6_review_required_nonpublic_strict_exact_subset_only`

## Anchor

- Package: `data/build/orot/reader-hint-placeholder-candidates.json`
- Rows: `127`
- Occurrences: `4389`

## Subset

- Rows: `52`
- Occurrences: `449`
- Lane: `commercial_clean_candidate`
- Relation: `exact_after_mark_strip`
- Families: `BDB Aramaic Dictionary`, `BDB Dictionary`, `Jastrow Dictionary`

## Boundary

No public HUD rows, route JSONL rows, route shard writes, runtime/source/token-index/lexical-payload edits, definition-content rows, NC definition-content rows, answer rows, accepted text rows, or public reader output are produced.

## Stop Condition

Stop after Agent6 row/subset disposition. Append only rows explicitly cleared by Agent6 and still absent at append time.

## Agent 8 Callback

Status: Agent 10 produced an Agent6-ready 52-row / 449-occurrence strict-exact commercial-clean Orot subset.

Artifact: `reports/agent10-agent6-ready-orot-strict-exact-commercial-clean-subset-2026-06-04.md`
Artifact JSON: `reports/agent10-agent6-ready-orot-strict-exact-commercial-clean-subset-2026-06-04.json`

Next executable route: route this exact packet to Agent 6 for row/subset review.
