# Definition Workbench Usage Source Ref Buckets

Generated: 2026-06-01T16:02:45.841Z

## Summary

- Source-ref buckets: 38
- Source-ref + cluster buckets: 40
- Occurrence rows: 49
- Duplicate source-ref buckets / rows: 8/19
- Cross-cluster source-ref buckets / rows: 2/7
- Supported/candidate/weak rows: 11/26/12
- Route IDs / unresolved route IDs: 1/0
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Checks

| check | status | detail |
|---|---|---|
| source_buckets_present | passed | source refs/source-clusters/rows 38/40/49 |
| source_ref_dedupe_visible | passed | duplicate source-ref buckets/rows 8/19 |
| cross_cluster_visibility | passed | cross-cluster source-ref buckets/rows 2/7 |
| metadata_complete | passed | source links/provenance/context/focus 38/49/49/49 |
| route_ids_resolved | passed | route IDs 1; unresolved 0 |
| usage_only_boundary | passed | observed source/source-cluster 38/40; reader-facing/payload/forbidden 0/0/0 |

## Duplicate Source Refs

| source ref | rows | clusters | statuses | work |
|---|---:|---|---|---|
| Rashi on Genesis 1:1:2 | 5 | reshit-first-yield-priority, reshit-opening-time-order | supported 3, candidate 2, weak 0 | tanakh/rashi-on-genesis |
| Ibn Ezra on Deuteronomy 33:27:3 | 2 | reshit-opening-time-order | supported 0, candidate 2, weak 0 | tanakh/ibn-ezra-on-deuteronomy |
| Ibn Ezra on Exodus 22:28:1 | 2 | reshit-first-yield-priority | supported 0, candidate 1, weak 1 | tanakh/ibn-ezra-on-exodus |
| Ibn Ezra on Genesis 1:1:1 | 2 | reshit-opening-time-order | supported 0, candidate 1, weak 1 | tanakh/ibn-ezra-on-genesis |
| Ibn Ezra on Genesis 49:3:1 | 2 | reshit-first-yield-priority | supported 2, candidate 0, weak 0 | tanakh/ibn-ezra-on-genesis |
| Ibn Ezra on Genesis, Introduction:22 | 2 | reshit-opening-time-order | supported 2, candidate 0, weak 0 | tanakh/ibn-ezra-on-genesis |
| Ibn Ezra on Numbers 24:20:1 | 2 | reshit-opening-time-order | supported 0, candidate 2, weak 0 | tanakh/ibn-ezra-on-numbers |
| Rashi on Numbers 15:20:1 | 2 | reshit-first-yield-priority, reshit-opening-time-order | supported 0, candidate 1, weak 1 | tanakh/rashi-on-numbers |

## Boundary

Stable Agent 3 Definition Workbench source-ref bucket packet. It dedupes selected usage occurrence links by source ref plus cluster for review/navigation while preserving each underlying occurrence row, source/work links, Hebrew context, provenance/license metadata, and route IDs only. It does not define terms, translate, copy route payloads, rank routes, choose visible answers, arbitrate semantics, or publish.

This packet is review/navigation structure only. It groups occurrence evidence by source ref and cluster while keeping all underlying rows and explicitly excludes definition payloads, answer selection, ranking decisions, accepted translations, and publication claims.
