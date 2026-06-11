# Agent 2 Deuteronomy Phase-2 Partition Export Plan - 2026-06-04

## Status

Non-public partition/export planning artifact prepared from the Agent 2 Deuteronomy Phase-2 transform readiness matrix. This is planning evidence only and opens no Agent 6 route by itself.

## Counts

- Rows: 1334.
- Occurrences: 2964.
- Commercial-clean candidate rows: 1334; occurrences: 2964.
- NC educational candidate rows: 0; occurrences: 0.
- Metadata/link-only rows: 0.
- Blocked/review rows: 0.
- Candidate text export rows now: 0.
- Answer-eligible rows now: 0.
- Public emit rows now: 0.

## Partition Rule

- Commercial-clean rows stay in the commercial-clean partition plan only and still require an exact Agent 6 boundary before export/display use.
- NC rows, if present in a future workset, must stay in a separate NC educational partition and preserve NC flags.
- Metadata/link-only rows may carry citation/link planning only and no definition text.
- Blocked/review rows do not produce candidate text exports.

## Zero Boundary

- No Definition authority.
- No answer eligibility or answer acceptance.
- No accepted gloss/text.
- No candidate text export.
- No public reader output.
- No route JSONL or route-shard write.
- No public/runtime/source/token-index/lexical payload mutation.
- No QA/source/license/legal/product/publication acceptance.

## Handoff

- Consumer: Agent 10 first.
- Spark-1 may run this builder/validator as a mechanical planning pipeline only.
- Agent 6 boundary remains future row/subset-specific and is required before export/display/source/license/Definition/public/runtime/answer use.
