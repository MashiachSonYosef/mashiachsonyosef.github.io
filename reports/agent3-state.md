# Agent 3 State

Generated: 2026-06-01T14:42:41.627Z

## State

- Lane: workbench_usage_navigation
- Worker state: evidence-ready
- QA acceptance state: not_agent6_accepted
- Goal: agent3-definition-occurrence-links (active)
- Manager / acceptance owner: Agent 5 / Agent 6
- Queue-ready packet: data/definitions/definition-workbench-usage-queue-ready-packet.json
- Queue mutated / submitted: false/false

## Metrics

- Usage concordance rows: 2390
- Supported/candidate/weak rows: 339/1351/700
- Audit-only ambiguous rows: 2064
- Selected usage rows/source refs/works: 49/38/20
- Proof rows / complete metadata: 12/12
- Hebrew context / mojibake rows: 12/0
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0
- Queue required fields: 10/10
- Smoke steps / failed: 116/0
- Source freshness: stale, pending 161

## Checks

| check | status | detail |
|---|---|---|
| registry_state_file_present | passed | registry reports/agent3-state.md; report reports/agent3-state.md |
| goal_boundary_loaded | passed | goal agent3-definition-occurrence-links; acceptance Agent 6 |
| evidence_artifacts_exist | passed | 12/12 |
| validator_scripts_exist | passed | 7/7 |
| queue_ready_not_submitted | passed | fields 10/10; mutations 0; submitted 0 |
| usage_counts_nonzero | passed | supported/candidate/weak 339/1351/700 |
| ambiguous_audit_only_visible | passed | ambiguous 2064; reader-facing 0 |
| proof_metadata_complete | passed | 12/12 |
| hebrew_context_clean | passed | Hebrew context 12; mojibake 0 |
| no_authority_fields | passed | reader-facing 0; route payload 0; forbidden 0 |
| smoke_validation_passed | passed | steps 116; failed 0 |

## Known Risks

- Definition Workbench current 200-row sample still has 0 current usage links for the selected Agent 3 usage token scope.
- Selected usage evidence is concentrated on one route ID; it is usage navigation, not independent semantic confirmation.
- Usage coverage is selected seeded scope, not broad corpus completion.
- Ambiguous rows remain audit-only and are not reader-facing.
- Smoke source freshness is stale with 161 pending refresh files.
- Agent 3 did not mutate Agent 6 queue state; Agent 5 remains the intended submitter.

## Boundary

Agent 3 output remains usage navigation and occurrence-link evidence only. This state file is not Definition authority, not semantic arbitration, not route ranking, not HUD or Workbench UI acceptance, not publication support, not accepted translation text, and not Agent 6 acceptance.
