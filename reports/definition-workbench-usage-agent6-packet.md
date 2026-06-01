# Definition Workbench Usage Agent 6 Packet

Generated: 2026-06-01T13:54:41.115Z

## Summary

- Current sample rows / current rows with usage links: 200/0
- Machine verified sample/review rows: 0
- Usage tokens absent from current sample: 1
- Join rows / projected rows after seed append: 1/201
- Projected usage-link rows: 2390
- Proof occurrence rows: 12
- Proof rows with source/work/context/license/version/route IDs: 12/12/12/12/12/12
- Supported/candidate/weak proof rows: 11/1/0
- Route IDs: 1
- Usage frames: 2
- Audit-only ambiguous rows carried: 2064
- Reader-facing rows: 0
- Forbidden authority field hits: 0

## Checks

| check | status | detail |
|---|---|---|
| artifact_chain_present | passed | evidence artifacts 6; validators 4 |
| proof_occurrences_present | passed | proof occurrence rows 12 |
| proof_occurrence_metadata_complete | passed | source/work/context/license/version 12/12/12/12/12 |
| route_ids_only | passed | route IDs 1; route-id rows 12; payload hits 0 |
| usage_seed_absence_visible | passed | sample rows 200; current usage links 0; absent seeds 1 |
| sample_review_status_not_verified | passed | machine verified sample rows 0 |
| join_smoke_bounded | passed | join rows 1; projected rows 201 |
| ambiguous_rows_audit_only | passed | audit-only ambiguous rows 2064; reader-facing rows 0 |
| route_concentration_warning_preserved | passed | route concentration warning visible 1 |
| forbidden_authority_fields_absent | passed | forbidden authority field hits 0 |

## Evidence Artifacts

- data/definitions/definition-workbench-usage-link-packet.json
- reports/definition-workbench-usage-link-packet.md
- data/definitions/definition-workbench-usage-seed-queue.json
- reports/definition-workbench-usage-seed-queue.md
- data/definitions/definition-workbench-usage-join-smoke.json
- reports/definition-workbench-usage-join-smoke.md

## Blocked Acceptance Claims

- reviewed lexical authority
- visible answer selection
- HUD or Workbench UI implementation acceptance
- route ranking or semantic arbitration
- publication readiness
- accepted translation text
- broad corpus coverage beyond the selected seed scope
- source/provenance acceptance outside the cited occurrence rows

## Boundary

Agent 3 QA packet for Definition Workbench usage-navigation linkage. It packages existing usage-link, seed-queue, and join-smoke artifacts for Agent 6 review without claiming answer authority, UI readiness, semantic verdicts, route ranking, accepted translation, publication readiness, or source/provenance acceptance beyond the cited rows.

This packet is for Agent 6 review of usage-navigation linkage only. It should not be used as a reader-facing definition, route winner, semantic verdict, or publication artifact.
