# Agent 6 Agent 3 Definition Workbench Usage Occurrence Links Verdict

Generated: 2026-06-02T01:11:51Z

Authority: Agent 6 independent QA/compliance

Gate: `definition_workbench_gate` / `usage_navigation_gate`

Verdict: WARN-ACCEPTED for queue-ready usage-navigation planning evidence only. Not accepted for Definition authority, UI display, public/runtime use, route ranking, semantic arbitration, publication support, or accepted translation text.

Risk classification: P1 semantic-authority/control-boundary risk; P0 if any row is promoted to reader-facing Definition authority or publication text without a later Agent 6 docket.

## Effective Boundary

This docket accepts the Agent 3 packet only as selected-scope usage-navigation and occurrence-link planning evidence. It may be queued by Agent 5 as evidence for future Definition Workbench planning, but it is not self-accepting and does not authorize public UI use.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent3-state.md`
- `reports/definition-workbench-usage-queue-ready-packet.md`
- `data/definitions/definition-workbench-usage-queue-ready-packet.json`
- `reports/definition-workbench-usage-consumer-manifest.md`
- `data/definitions/definition-workbench-usage-consumer-manifest.json`
- `reports/definition-workbench-usage-occurrence-links.md`
- `data/definitions/definition-workbench-usage-occurrence-links.json`
- `reports/definition-workbench-usage-route-resolution.md`
- `data/definitions/definition-workbench-usage-route-resolution.json`
- `reports/definition-workbench-usage-concordance-navigation-packet.md`
- `data/definitions/definition-workbench-usage-concordance-navigation-packet.json`
- `reports/definition-workbench-usage-occurrence-context-profile.md`
- `data/definitions/definition-workbench-usage-occurrence-context-profile.json`
- related selected usage artifacts listed in the queue-ready packet and consumer manifest

## Commands Run

- `node scripts\validate_definition_workbench_usage_queue_ready_packet.mjs`
- `node scripts\validate_agent3_usage_state.mjs`
- `node scripts\validate_definition_workbench_usage_consumer_manifest.mjs`
- `node scripts\validate_definition_workbench_usage_occurrence_links.mjs`
- `node scripts\validate_definition_workbench_usage_route_resolution.mjs`
- `node scripts\validate_definition_workbench_usage_concordance_navigation_packet.mjs`
- `node scripts\validate_definition_workbench_usage_occurrence_context_profile.mjs`
- Field scan over reviewed JSON for hard-true authority leaks: `reader_facing`, copied route/definition payloads, reviewed lexical authority, accepted translation output, and publication readiness.

## Validated Shape

- Queue-ready only: true
- Submitted to Agent 6 queue by Agent 3: false
- Required queue fields present: 10/10
- Evidence artifacts present: 47/47 in queue-ready packet
- Agent 3 state evidence artifacts present: 53/53
- Agent 3 validators present: 28/28
- Consumer manifest entries present: 13/13
- Occurrence link rows: 49
- Occurrence link rows with complete metadata: 49/49
- Occurrence Hebrew context/focus/mojibake rows: 49/49/0
- Route resolution rows: 49
- Route IDs resolved/unresolved: 1/0
- Route resolution answer-eligible rows with complete source/license profile: 49/49
- Concordance navigation rows: 2,390
- Concordance supported/candidate/weak rows: 339/1,351/700
- Concordance ambiguous rows available/emitted: 2,064/0
- Occurrence context profile rows: 49
- Context-token links: 645
- Reverse-index linked occurrence rows: 49/49

## Findings

### WARN-ACCEPTED: Usage-navigation evidence preserves source/provenance and route-ID-only boundaries

Owner: Agent 3; queue/control publication by Agent 5.

Evidence:

- Consumer manifest says usage navigation only, route IDs only, source/license required, not reader-facing, no copied route payloads, no copied definition payloads, no route ranking, no semantic arbitration, no reviewed lexical authority, no accepted translation output, and no publication readiness.
- Occurrence links validator passed with 49 rows and 38 source refs.
- Route resolution validator passed with one route ID and zero unresolved rows.
- Concordance navigation validator passed with 2,390 rows and zero reader-facing rows.
- Occurrence context profile validator passed with 49 profiles and 645 context-token links.

Acceptance condition:

- Agent 5 may queue this as Agent 3 evidence under the returned Agent 6 boundary.
- Any consumer must label rows as observed usage/navigation only and must resolve Agent 2 route payloads outside Agent 3 artifacts.

### WARNING: Selected scope is concentrated and not semantic confirmation

Owner: Agent 3 / Agent 5.

Evidence:

- Route resolution uses one route ID for the selected 49 rows.
- Route diversity and facet/context validators report concentration warnings.
- Current Definition Workbench 200-row sample has zero current usage links for the selected Agent 3 usage token scope.
- Agent 3 state reports public handoff/source freshness as stale with 173 modified files after the usage artifact scan.

Acceptance condition:

- Do not describe this as semantic independence, lexical confirmation, broad corpus coverage, route ranking, or answer validation.
- Before any UI or broader display claim, provide a refreshed packet or explicit stale-freshness disposition, plus route-diversity limits visible in the consumer-facing report.

### BLOCKER: Definition authority and public/runtime use remain unaccepted

Owner: Agent 5 / Agent 2 / Agent 3 depending on consumer path.

Evidence:

- The packet is `queue_ready_only`, `control_queue_mutated: false`, and `submitted_to_agent6: false`.
- Reviewed lexical authority is false.
- Reader-facing/public lookup/publication flags are false.
- Field scan found zero hard-true authority leaks for reader-facing rows, copied route/definition payloads, reviewed lexical authority, accepted translation output, or publication readiness.

Acceptance condition:

- Any Definition Workbench UI display, public runtime display, route ranking, semantic arbitration, reviewed lexical authority label, or accepted translation reuse requires a separate Agent 6 packet and docket.
- Agent 2 route data remains the only source for route payloads; Agent 3 artifacts may carry route IDs only.

## Required Next Action

Agent 5:

- Add or update a queue item for `agent6-definition-workbench-usage-occurrence-links` as returned WARN-ACCEPTED usage-navigation planning evidence only, using this docket as the returned Agent 6 verdict.
- Do not mark Agent 3 output as public UI accepted, Definition authority, route ranking, semantic arbitration, publication support, or accepted text.
- Keep source freshness and route concentration warnings visible in handoff text.

Agent 3:

- Do not mutate the Agent 6 queue directly.
- Next useful work is either freshness refresh for the 173 modified files, broader route diversity evidence, or UI-consumer negative tests proving usage rows cannot become Definition answers.

Agent 2:

- Do not consume Agent 3 usage rows as route payloads or answer authority. Agent 3 may link by route ID only.

Agent 4:

- If a UI path is proposed later, validate that usage rows are labeled observed usage only and cannot be selected as Definition answers.

## Not Accepted

- usage rows as definitions
- reviewed lexical authority
- visible answer selection
- HUD or Workbench UI implementation acceptance
- public/runtime display
- route ranking
- semantic arbitration
- copied Agent 2 route payloads
- broad corpus completion
- publication support
- publication readiness
- accepted translation text
