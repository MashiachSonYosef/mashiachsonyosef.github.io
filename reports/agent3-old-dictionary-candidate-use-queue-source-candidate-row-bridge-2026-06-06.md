# Agent 3 Old-Dictionary Candidate-Use Queue/Source Candidate-Row Bridge

Generated: 2026-06-06T11:11:23.281Z

## Status

- Status: evidence-ready
- Lane: Agent 3 linkage/dedupe/navigation only
- Authority: no source, license, Definition, runtime, publication, answer, gloss, or accepted-text claim
- Handoff owner: Agent 10 for release/package intake; Agent 6 only by exact boundary packet through the release owner

## Inputs

- Row blocker matrix: reports/agent3-old-dictionary-candidate-use-row-blocker-matrix-2026-06-06.json
- Queue/source boundary blocker matrix: reports/agent3-old-dictionary-candidate-use-queue-source-boundary-blocker-matrix-2026-06-06.json

## Counts

| Metric | Count |
| --- | ---: |
| Candidate rows checked | 78 |
| Candidate occurrences checked | 1461 |
| Queue/source blocker rows inspected | 363 |
| Candidate rows linked to queue/source subchain | 65 |
| Linked candidate occurrences | 1299 |
| Candidate rows outside queue/source subchain | 13 |
| Outside candidate occurrences | 162 |
| Linked queue/source blocker rows | 363 |
| Linked queue/source pair keys, unique | 363 |
| Linked queue/source unique source RIDs | 314 |
| Source-RID exact candidate/subchain matches | 64 |
| Covered rows with candidate source RID missing from subchain | 1 |
| Rows outside subchain source-RID comparison | 13 |
| Candidate queue IDs missing queue/source subchain | 13 |
| Queue/source queue IDs missing candidate row | 0 |

## Bridge Status Rows

| Status | Candidate rows | Candidate occurrences | Queue/source blocker rows | Source RIDs |
| --- | ---: | ---: | ---: | ---: |
| outside_queue_source_subchain | 13 | 162 | 0 | 0 |
| queue_source_subchain_linked | 65 | 1299 | 363 | 314 |

## Source-RID Match Rows

| Source-RID status | Candidate rows | Candidate occurrences | Queue/source blocker rows |
| --- | ---: | ---: | ---: |
| candidate_source_rids_missing_from_queue_source_subchain | 1 | 11 | 1 |
| exact_source_rid_set_match | 64 | 1288 | 362 |
| outside_queue_source_subchain | 13 | 162 | 0 |

## Exact Blockers

| Exact blocker | Candidate rows | Candidate occurrences |
| --- | ---: | ---: |
| covered_by_queue_source_boundary_blocker_subchain_missing_source_citation_transform_and_agent6_boundary | 65 | 1299 |
| outside_queue_source_subchain_current_row_blockers_only | 13 | 162 |

## Handoff

- Next safe action: Use this as non-authoritative navigation from candidate rows to queue/source blockers; keep linked and unlinked rows blocked until source citation, transform, and boundary prerequisites are supplied by their owners.
- Stop condition: Stop at row-to-queue/source linkage evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.

