# Agent 3 Old-Dictionary Bridge-Gap Source-RID Prereq Route Crossmatch

Generated: 2026-06-06T11:42:02.214Z

## Status

- Status: evidence-ready
- Lane: Agent 3 linkage/dedupe/navigation only
- Authority: no source, license, Definition, runtime, publication, answer, gloss, or accepted-text claim
- Handoff owner: Agent 10 for release/package intake; A07 for approval/SOP/final validation/release gate; A06 evidence/validator production only

## Inputs

- Source-RID blocker crossmatch: reports/agent3-old-dictionary-candidate-use-bridge-gap-source-rid-blocker-crossmatch-2026-06-06.json
- A06 evidence prereq matrix: reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json
- Direct source-citation prereq matrix: reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json

## Counts

| Metric | Count |
| --- | ---: |
| Prereq route rows | 30 |
| Source-RID references | 30 |
| Source-RID occurrence memberships | 389 |
| A06 evidence boundary prereq rows | 25 |
| A06 evidence boundary prereq occurrences | 331 |
| Direct source-citation prereq rows | 5 |
| Direct source-citation prereq occurrences | 58 |
| Rows in both prereq paths | 0 |
| Rows missing prereq path | 0 |
| Source-RID blocker rows present | 30 |
| Queue/source coverage rows present | 0 |
| Rows missing source citation | 30 |
| Rows missing transform rule | 30 |
| Rows after A06 evidence boundary prereq | 30 |

## Prereq Routes

| Route | Source RIDs | References | Occurrences | Queues | Tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| agent6_source_family_boundary_prereq | 25 | 25 | 331 | 9 | 9 |
| direct_source_citation_prereq | 5 | 5 | 58 | 5 | 5 |

## Exact Blockers

| Exact blocker | Source RIDs | References | Occurrences |
| --- | ---: | ---: | ---: |
| bridge_gap_source_rid_routes_to_agent6_source_family_boundary_prereq | 25 | 25 | 331 |
| bridge_gap_source_rid_routes_to_direct_source_citation_prereq | 5 | 5 | 58 |

## Handoff

- Next safe action: Use this route crossmatch to keep 25 gap source RIDs on the A06 evidence source-family boundary prereq path and 5 on the direct source-citation prereq path; route any approval/SOP/final-validation/release-gate question to A07, and do not convert either path into source acceptance, transform readiness, or queue/source coverage.
- Stop condition: Stop at prereq-route crossmatch evidence; no source text read, no source-family selection made, no transform output emitted, no Definition answer selected, and no acceptance action taken.

