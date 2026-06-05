# Definition Workbench Usage Occurrence Support Packet

Generated: 2026-06-01T19:31:43.464Z

## Boundary

- Lane: Agent 3 usage navigation.
- Target: Definition Workbench planning support only.
- Row label: observed usage only.
- Related Agent 2 linkage: route IDs only.
- Ambiguous rows: audit-only, not emitted here.
- Reader-facing rows: 0.
- Publication claims: 0.

## Counts

- Planning rows: 1
- Support rows: 49
- Supported / candidate / weak: 11/26/12
- Source refs / works / licenses / version sources: 38/20/2/4
- Route IDs: 1
- Local anchors verified: 49/49
- Token/focus surfaces found in page: 49/49
- Current sample usage links: 0/200
- Usage tokens absent from current sample: 1
- Audit-only ambiguous rows available/emitted: 2064/0
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Checks

| check | status | detail |
|---|---|---|
| planning_context_present | passed | planning rows 1; labeled 1 |
| current_sample_gap_visible | warning | current sample links 0/200; absent tokens 1 |
| occurrence_support_rows_present | passed | rows 49; supported/candidate/weak 11/26/12 |
| clickable_links_complete | passed | source/sourceURL/localAnchor 49/49/49 |
| token_context_complete | passed | token/focus/context/focusMarker/frame/statusScore 49/49/49/49/49/49 |
| provenance_license_complete | passed | work/version/license/forbidden 49/49/49/0 |
| local_anchor_audit_complete | passed | page/anchor/sourceRef/token/focus 49/49/49/49/49 |
| route_ids_only_linkage | passed | route IDs 1; rows 49; resolved rows 49; payload hits 0 |
| ambiguous_rows_audit_only | passed | available 2064; emitted 0 |
| consumer_manifest_boundary_preserved | passed | reviewed lexical authority true 0; publication readiness true 0 |
| usage_only_boundary | passed | observed 49; reader-facing 0; forbidden 0 |
| queue_not_mutated | passed | queue mutations 0; submitted 0 |

## Source Artifacts

- planning_packet: data/definitions/definition-workbench-usage-planning-packet.json
- occurrence_links: data/definitions/definition-workbench-usage-occurrence-links.json
- anchor_audit: data/definitions/definition-workbench-usage-anchor-audit.json
- route_resolution: data/definitions/definition-workbench-usage-route-resolution.json
- consumer_manifest: data/definitions/definition-workbench-usage-consumer-manifest.json

This packet makes occurrence links easier for Agent 5/Agent 6 to inspect. It does not change Definition Workbench ranking, does not assign UI authority, and does not convert usage evidence into definitions.
