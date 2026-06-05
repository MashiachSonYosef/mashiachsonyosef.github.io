# Agent 3 Definition Workbench Usage Collision Handoff Manifest

Generated: 2026-06-02T12:48:21.110Z

## Status

- Status: evidence-ready
- Focus token: ראשית
- Boundary: usage-navigation handoff only; observed usage evidence, not Definition authority, route ranking, semantic arbitration, UI/runtime acceptance, or publication support.

## Counts

- Manifest entries: 3
- Data/report/validator present: 3/3
- Collision audit source rows / collision rows: 2390/410
- Review queue rows: 70
- Reverse index occurrence/source/work/license rows: 106/55/24/2
- Route IDs visible: 1
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Manifest Entries

| key | status | data | report | validator | key counts | boundary hits |
|---|---|---|---|---|---|---|
| focus_collision_audit | evidence-ready | data/definitions/agent3-definition-workbench-usage-focus-collision-audit-reshit.json | reports/agent3-definition-workbench-usage-focus-collision-audit-reshit.md | scripts/validate_agent3_definition_workbench_usage_focus_collision_audit.mjs | source 2390; collision 410 | 0/0/0 |
| collision_review_queue | evidence-ready | data/definitions/agent3-definition-workbench-usage-collision-review-queue-reshit.json | reports/agent3-definition-workbench-usage-collision-review-queue-reshit.md | scripts/validate_agent3_definition_workbench_usage_collision_review_queue.mjs | queue 70; occurrences 106 | 0/0/0 |
| collision_review_reverse_index | evidence-ready | data/definitions/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.json | reports/agent3-definition-workbench-usage-collision-review-reverse-index-reshit.md | scripts/validate_agent3_definition_workbench_usage_collision_review_reverse_index.mjs | occurrence 106; source/work/license 55/24/2 | 0/0/0 |

## Consumer Contract

- Allowed use: Agent 6/Agent 5 QA intake and downstream usage-navigation planning only
- Required label: observed usage only
- Route payload rule: related Agent 2 route IDs may be carried; Agent 2 route payloads must be resolved outside Agent 3 artifacts
- Ambiguity rule: collision and ambiguous rows remain audit/review-only unless a later Agent 6 docket accepts a narrower display boundary
- Blocked uses: definition authority; reviewed lexical authority; visible answer selection; route ranking; semantic arbitration; HUD or Workbench UI acceptance; public/runtime display; publication readiness; accepted translation text

## Checks

| check | status | detail |
|---|---|---|
| manifest_entries_present | passed | entries 3 |
| data_report_validator_present | passed | present 3/3 |
| artifact_types_match | passed | type matches 3/3 |
| entries_evidence_ready | passed | evidence-ready 3/3 |
| single_focus_and_route_visible | passed | focus/route 1/1 |
| collision_layer_counts_visible | passed | source/collision/queue/reverse 2390/410/70/106 |
| reverse_indexes_visible | passed | source/work/license 55/24/2 |
| no_reader_payload_authority_hits | passed | reader/payload/forbidden 0/0/0 |
| no_source_broad_queue_side_effects | passed | source/broad/queue/submitted 0/0/0/0 |

This manifest is an Agent 3 QA/handoff index only. It does not mutate Agent 6 queues, does not create UI/runtime acceptance, and does not convert usage rows into definitions.
