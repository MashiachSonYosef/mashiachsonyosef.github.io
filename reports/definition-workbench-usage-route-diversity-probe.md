# Definition Workbench Usage Route Diversity Probe

Generated: 2026-06-01T21:07:21.249Z

## Summary

- Status: pass_with_warnings
- Occurrence rows: 49
- Route IDs / route probes: 1/1
- Route diversity status: concentrated
- Max route share: 10000/10000
- Route concentration warning: true
- Semantic independence claim allowed: false
- Source refs / works / licenses / provenance keys: 38/20/2/5
- Concentration support source refs / works / licenses / version sources: 38/20/2/4
- Concentration support duplicate-source / recurring-signature / cross-cluster-signature rows: 19/21/9
- Concentration support final-authority / semantic-independence allowed: 0/0
- Metadata complete rows: source 49, work 49, context 49, focus 49, license 49, version 49
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Route Probes

| route ID | rows | share | sources | frames | statuses |
|---|---:|---:|---:|---:|---|
| def-kaikki-lemma-e4f94cd5131316a8 | 49 | 10000/10000 | 1 | 2 | {"candidate":26,"weak":12,"supported":11} |

## Coverage Buckets

| bucket group | buckets |
|---|---:|
| by_status | 3 |
| by_cluster | 2 |
| by_usage_frame | 2 |
| by_work | 20 |
| by_source_ref | 38 |
| by_license | 2 |
| by_provenance | 5 |

## Concentration Support

| support area | count |
|---|---:|
| selected occurrence refs | 49 |
| unique source refs | 38 |
| unique works | 20 |
| unique licenses | 2 |
| unique version sources | 4 |
| duplicate source-ref rows | 19 |
| recurring-signature rows | 21 |
| cross-cluster-signature rows | 9 |
| missing signature rows | 0 |
| missing lookup rows | 0 |

## Checks

| check | status | detail |
|---|---|---|
| occurrence_rows_present | passed | rows 49 |
| route_ids_present | passed | routes/probes 1/1 |
| metadata_complete | passed | rows/source/work/context/focus/license/version/routes/observed 49/49/49/49/49/49/49/49/49 |
| coverage_buckets_present | passed | groups/buckets 7/72 |
| route_concentration_marked | warning | route IDs 1; max share 10000/10000; semantic independence allowed 0 |
| concentration_support_complete | warning | selected/source/work/license/version 49/38/20/2/4; duplicate/recurring/cross-cluster 19/21/9; authority/semantic 0/0 |
| usage_boundary_only | passed | reader-facing 0; route-payload 0; forbidden 0; unresolved 0 |

## Boundary

This probe is a QA/navigation artifact. It exposes whether selected occurrence links depend on one route ID, preserves source/license/context fields, and does not rank routes, select visible answers, copy Agent 2 payloads, make publication claims, or provide accepted translation text.
