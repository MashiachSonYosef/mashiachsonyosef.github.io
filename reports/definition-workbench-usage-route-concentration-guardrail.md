# Definition Workbench Usage Route Concentration Guardrail

Generated: 2026-06-02T02:22:04.376Z

## Summary

- Status: pass_with_warnings
- Guardrail surfaces: 7
- Single-route surfaces: 7/7
- Max-share 10000 surfaces: 7/7
- Concentration-warning surfaces: 7/7
- Semantic/answer/ranking/visible-answer allowed rows: 0/0/0/0
- Reader-facing / route-payload / forbidden-authority / unresolved hits: 0/0/0/0

## Interpretation

- Status: single_route_concentration_guardrail_required
- Downstream rule: Display or ranking consumers must preserve observed usage only labels and must resolve Agent 2 route payloads outside Agent 3 artifacts.

## Guardrail Rows

| surface | status | occurrences | evidence rows | route ids | max share | concentration | semantic allowed | consumer action |
|---|---|---:|---:|---:|---:|---|---|---|
| facet_index | pass_with_warnings | 49 | 75 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |
| context_token_index | pass_with_warnings | 49 | 370 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |
| context_token_links | pass_with_warnings | 49 | 645 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |
| context_token_occurrence_index | pass_with_warnings | 49 | 370 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |
| occurrence_context_profile | pass_with_warnings | 49 | 645 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |
| route_diversity_probe | pass_with_warnings | 49 | 1 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |
| planning_packet | pass_with_warnings | 49 | 1 | 1 | 10000/10000 | true | false | preserve_route_concentration_warning |

## Checks

| check | status | detail |
|---|---|---|
| guardrail_surfaces_present | passed | surfaces 7 |
| all_surfaces_single_route | warning | single route 7/7 |
| all_surfaces_max_share_visible | warning | max share 7/7 |
| all_surfaces_warn_on_concentration | warning | warning 7/7 |
| semantic_independence_blocked | passed | semantic/answer/rank/visible 0/0/0/0 |
| usage_boundary_only | passed | reader/payload/forbidden/unresolved 0/0/0/0 |
| source_artifacts_ok | passed | 7/7 |

## Boundary

This guardrail is usage-navigation QA data only. It carries route IDs and concentration warnings, but it does not rank routes, choose answers, copy Agent 2 payloads, authorize UI display, support publication, or provide accepted text.
