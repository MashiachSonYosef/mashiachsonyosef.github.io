# Definition Workbench Status Contract

- Generated: 2026-06-03T00:13:49.306Z
- Status: pass_with_warnings
- Sample rows: 200
- Rows using forbidden verified labels: 0
- Complete source/license rows: 200
- Answer-role rows with answer cards: 151
- Multi-answer warning rows: 96
- UI/authority/publication claim artifacts: 0

## Contract

- Machine route-shape status may use `single_answer_source_complete`; it is not reviewed lexical authority.
- `review_status=verified` is reserved for future reviewed lexical authority and is forbidden in this machine sample lane.
- `status=verified` is forbidden for machine-derived Definition Workbench sample rows.
- Source/license completeness, answer-role counts, and multi-answer warnings remain visible.
- This validator makes no UI assignment and clears no publication boundary.

## Current Disposition

- Agent 6 verified-overclaim warning addressed in current machine artifacts: true
- Queue-ready status semantics preserved: true
- Queue-ready publication boundary preserved: true
- Machine complete label: single_answer_source_complete
- Machine review status: unreviewed_machine_sample
- Reserved review label: verified
- Status contract fixtures checked: 7
- Status contract fixtures passed: true
- Reviewed lexical authority: false
- Accepted translation output: false
- Publication readiness: false
- Historical warning report scope: Historical reports may describe the earlier verified overclaim; current data-contract artifacts and this validator supersede them for machine status semantics.

## Current Artifacts Checked

- data/definitions/definition-workbench-sample.json
- data/definitions/definition-workbench-usage-link-packet.json
- data/definitions/definition-workbench-usage-join-smoke.json
- data/definitions/definition-workbench-usage-agent6-packet.json
- data/definitions/definition-workbench-usage-queue-ready-packet.json
- data/definitions/definition-workbench-status-contract-fixtures.json

## Historical Warning Reports

- reports/agent6-definition-workbench-sample-verdict-2026-06-01.md
- reports/agent7-definition-workbench-ceo-plan-2026-06-01.md

## Publication Boundary

- Boundary status: blocked_no_render
- Sample only: true
- Reader-facing: false
- UI assignment: false
- Publication claim: false
- Clears publication readiness: false
- Reviewed lexical authority: false
- Accepted translation output: false
- Source publication: false
- Public lookup artifact: false
- Does not clear: ui_assignment, reviewed_lexical_authority, accepted_translation, source_publication, public_lookup_publication, publication_readiness

## Status Counts

- conflicting: 96
- proposed_only: 49
- single_answer_source_complete: 55

## Review Status Counts

- unreviewed_machine_sample: 200

## Downstream Packet Checks

- Link packet forbidden verified labels: 0
- Join smoke forbidden verified labels: 0
- Agent 6 packet forbidden verified labels: 0
- Queue-ready status semantics preserved: 1
- Queue-ready publication boundary preserved: 1
- Status contract fixture rows: 7
- Status contract fixture expected-pass rows: 2
- Status contract fixture expected-fail rows: 5
- Status contract fixtures passed: 1

## Warnings

- link packet carries 1 warning(s); keep visible to Agent 5/6

## Issues

- none
