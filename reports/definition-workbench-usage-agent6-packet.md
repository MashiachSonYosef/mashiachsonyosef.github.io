# Definition Workbench Usage Agent 6 Packet

Generated: 2026-06-01T18:39:12.098Z

## Summary

- Current sample rows / current rows with usage links: 200/0
- Rows using forbidden verified labels: 0
- Usage tokens absent from current sample: 1
- Join rows / projected rows after seed append: 1/201
- Projected usage-link rows: 2390
- Proof occurrence rows: 12
- Proof rows with source/work/context/license/version/route IDs: 12/12/12/12/12/12
- Proof Hebrew/focus/mojibake rows: token 12, context 12, focus markers 12, mojibake 0
- Supported/candidate/weak proof rows: 11/1/0
- Route IDs: 1
- Usage frames: 2
- Audit-only ambiguous rows carried: 2064
- Route resolution rows / route IDs / unresolved: 49/1/0
- Route resolution forbidden license rows / translation blocked rows: 0/49
- Sample gap rows / selected occurrence links / overlap visible: 1/12/1
- Consumer manifest entries: 10
- Reader-facing rows: 0
- Forbidden authority field hits: 0

## Checks

| check | status | detail |
|---|---|---|
| artifact_chain_present | passed | evidence artifacts 12/12; validators 7/7 |
| proof_occurrences_present | passed | proof occurrence rows 12 |
| proof_occurrence_metadata_complete | passed | source/work/context/license/version 12/12/12/12/12 |
| proof_hebrew_context_intact | passed | Hebrew token/context 12/12; focus markers 12; mojibake 0 |
| route_ids_only | passed | route IDs 1; route-id rows 12; payload hits 0 |
| usage_seed_absence_visible | passed | sample rows 200; current usage links 0; absent seeds 1 |
| sample_review_status_not_verified | passed | forbidden verified labels 0 |
| join_smoke_bounded | passed | join rows 1; projected rows 201 |
| route_resolution_boundary_preserved | passed | rows 49; route IDs 1; unresolved 0; forbidden license rows 0; translation blocked 49 |
| sample_gap_boundary_visible | warning | gap rows 1; selected links 12; overlap visible 1; reader-facing/forbidden 0/0 |
| consumer_manifest_boundary_preserved | passed | entries 10; reader-facing/payload/forbidden 0/0/0 |
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
- data/definitions/definition-workbench-usage-route-resolution.json
- reports/definition-workbench-usage-route-resolution.md
- data/definitions/definition-workbench-usage-sample-gap-audit.json
- reports/definition-workbench-usage-sample-gap-audit.md
- data/definitions/definition-workbench-usage-consumer-manifest.json
- reports/definition-workbench-usage-consumer-manifest.md

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

Agent 3 QA packet for Definition Workbench usage-navigation linkage. It packages usage-link, seed-queue, join-smoke, route-resolution, sample-gap, and consumer-manifest artifacts for Agent 6 review without claiming answer authority, UI readiness, semantic verdicts, route ranking, accepted translation, publication readiness, or source/provenance acceptance beyond the cited rows.

This packet is for Agent 6 review of usage-navigation linkage only. It should not be used as a reader-facing definition, route winner, semantic verdict, or publication artifact.

Definition sample boundary status: blocked_no_render
Definition sample clears publication readiness: false
Definition sample reviewed lexical authority: false
Definition sample publication claim: false
