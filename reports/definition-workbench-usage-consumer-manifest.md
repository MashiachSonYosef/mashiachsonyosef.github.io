# Definition Workbench Usage Consumer Manifest

Generated: 2026-06-02T02:43:44.672Z

## Summary

- Status: pass_with_warnings
- Manifest entries: 16
- Data artifacts present: 16/16
- Report artifacts present: 16/16
- Validator scripts present: 16/16
- Occurrence detail rows / occurrence link rows: 49/49
- Source-ref/work/provenance buckets: 38/20/5
- Facet index facets / occurrence rows / concentration warning: 75/49/1
- Context-token rows / appearances / cross-frame rows: 370/596/44
- Context-token link rows / focus-context-repeated / cross-frame rows: 645/49-596-8/223
- Context-token occurrence index rows / links / cross-frame rows: 370/645/44
- Occurrence context profile rows / links / reverse-linked rows: 49/645/49
- Route diversity probe rows / route IDs / max share / concentration warning: 49/1/10000/10000/1
- Route concentration guardrail surfaces / warnings / semantic allowed: 7/7/0
- Route pointer audit routes / support / navigation / payload hits: 1/49-49/2390-2390/0
- Sample gap audit rows / current sample usage links / usage tokens not in sample: 1/0/1
- Crossmatch neighbor links: 2352
- Route IDs / unresolved: 1/0
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Status Semantics

- Machine status axis: machine_route_shape_status_not_review_authority
- Machine complete label: single_answer_source_complete
- Machine review status: unreviewed_machine_sample
- Verified review status reserved: true
- Usage status scope: observed usage/navigation status only; not answer authority and not reviewed lexical authority
- Answer role preserved: true
- Source/license rows preserved: true
- Multi-answer warnings preserved: true

## Consumer Contract

- Required row label: observed usage only
- Ambiguous rows policy: audit-only unless a later Agent 6 docket accepts a narrower display boundary
- Route payload rule: consume related_route_ids only; resolve Agent 2 payloads outside Agent 3 artifacts

## Manifest Entries

| artifact | status | rows/count | safe role |
|---|---|---:|---|
| occurrence_links | passed | 49 | base selected occurrence links with source/work/context/provenance/route IDs |
| route_resolution | passed | 49 | route-ID resolution proof without Agent 2 payload copying |
| crossmatch_neighbors | passed | 2352 | occurrence-to-occurrence navigation neighbors |
| source_ref_buckets | passed | 38 | source-ref and source-ref-plus-cluster grouping |
| work_buckets | passed | 20 | work and work-plus-cluster grouping |
| provenance_buckets | passed | 5 | version/license/provenance grouping |
| occurrence_detail_index | passed | 49 | joined occurrence detail navigation index |
| facet_index | pass_with_warnings | 75 | selected occurrence search/filter facets with route concentration warning |
| context_token_index | pass_with_warnings | 370 | selected occurrence Hebrew context-token co-occurrence navigation |
| context_token_links | pass_with_warnings | 645 | per-appearance Hebrew context-token links back to selected occurrence rows |
| context_token_occurrence_index | pass_with_warnings | 370 | reverse lookup from normalized Hebrew context token to all selected occurrence-link IDs |
| occurrence_context_profile | pass_with_warnings | 49 | occurrence-centric context-token profile with reverse-index IDs |
| route_diversity_probe | pass_with_warnings | 49 | route concentration visibility over selected occurrence links without semantic independence claims |
| route_concentration_guardrail | pass_with_warnings | 7 | consolidated route-concentration guardrail blocking semantic independence and answer-authority overclaim |
| route_pointer_audit | pass_with_warnings | 1 | route-ID pointer audit for resolving Agent 2 route payloads outside Agent 3 artifacts |
| sample_gap_audit | pass_with_warnings | 1 | Definition Workbench sample-overlap gap visibility for selected usage tokens without answer authority |

## Checks

| check | status | detail |
|---|---|---|
| manifest_entries_present | passed | entries 16 |
| data_artifacts_exist | passed | 16/16 |
| report_artifacts_exist | passed | 16/16 |
| validator_scripts_exist | passed | 16/16 |
| entries_passed | passed | 16/16 |
| detail_alignment | passed | detail/occurrence 49/49 |
| metadata_complete | passed | rows/source/work/context/focus/license/version/buckets/observed 49/49/49/49/49/49/49/49/49 |
| route_ids_only | passed | route IDs 1; unresolved 0 |
| facet_index_present | warning | facets 75; rows 49; concentration warning 1 |
| context_token_index_present | warning | tokens 370; occurrences 596; cross-frame 44; repeated focus 8; concentration 1 |
| context_token_links_present | warning | links 645/645; context 596/596; tokens 370/370; occurrences 49/49; focus/context/repeated 49/596/8; cross-frame 223; concentration 1 |
| context_token_occurrence_index_present | warning | rows/links/occurrences 370/645/49; focus/context/repeated 49/596/8; cross-frame 44/223; concentration 1 |
| occurrence_context_profile_present | warning | profiles/links/tokens/reverse 49/645/370/370; reverse-linked 49/49; focus/context/cross-frame 49/596/223; concentration 1 |
| route_diversity_probe_present | warning | rows 49; route IDs 1; max share 10000/10000; semantic independence allowed 0 |
| route_concentration_guardrail_present | warning | surfaces/single/max/warn 7/7/7/7; semantic/answer/rank/visible 0/0/0/0; reader/payload/forbidden/unresolved 0/0/0/0 |
| route_pointer_audit_present | warning | routes/resolved/unresolved 1/1/0; support 49/49; navigation 2390/2390; planning 1/1; reader/payload/forbidden/metadata 0/0/0/0 |
| sample_gap_audit_present | warning | gap rows 1; sample usage links 0/200; usage tokens not in sample 1; selected links 12 |
| usage_boundary_only | passed | reader-facing 0; route-payload 0; forbidden 0 |

## Boundary

This manifest is a consumption guide for Agent 3 selected usage-navigation artifacts only. It does not make usage rows definitions, does not rank or select visible answers, does not copy Agent 2 payloads, does not accept public UI rendering, and does not support publication or accepted translation text.
