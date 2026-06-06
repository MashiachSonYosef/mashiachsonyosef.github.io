# Agent 3 Old-Dictionary Bridge-Gap A07/A06 Route Overlay

Generated: 2026-06-06T12:10:24.718Z

## Status

- Status: evidence-ready
- Lane: Agent 3 linkage/dedupe/navigation only
- Approval route: A07 owns approval, SOP, final validation, and release gate
- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request
- Authority: no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim

## Inputs

- Closure matrix: reports/agent3-old-dictionary-candidate-use-bridge-gap-candidate-prereq-closure-matrix-2026-06-06.json
- Direct prereq matrix: reports/agent3-old-dictionary-candidate-use-direct-source-citation-prereq-matrix-2026-06-06.json
- A06 prereq matrix: reports/agent3-old-dictionary-candidate-use-agent6-source-family-boundary-prereq-matrix-2026-06-06.json

## Counts

| Metric | Count |
| --- | ---: |
| Overlay rows | 14 |
| Overlay occurrences | 173 |
| Source-RID route links | 30 |
| Unique source RIDs | 30 |
| Direct source-citation workset rows | 5 |
| Direct source-citation workset occurrences | 58 |
| A06 evidence-boundary workset rows | 9 |
| A06 evidence-boundary workset occurrences | 115 |
| Missing prereq detail links | 0 |
| A07 approval-route rows | 14 |
| A06 evidence-only rows | 14 |
| A06 approval-requested rows | 0 |
| Source-citation required links | 30 |
| Source-citation present links | 0 |
| Transform-blocked links | 30 |
| Current blocker total | 140 |

## Downstream Worksets

| Workset | Rows | Occurrences | Source-RID links | Direct links | A06 links | Missing links |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| a06_evidence_boundary_prereq_workset | 9 | 115 | 25 | 0 | 25 | 0 |
| direct_source_citation_prereq_workset | 5 | 58 | 5 | 5 | 0 | 0 |

## Sample Rows

| order | queue_id | token_id | route | owner | source RIDs | occurrences |
| ---: | --- | --- | --- | --- | --- | ---: |
| 1 | agent2-orot-gap-tok-008fc1c6a929 | tok-008fc1c6a929 | a06_evidence_boundary_prereq_workset | A07/A06 | R00039 | 8 |
| 2 | agent2-orot-gap-tok-126d54d64a8c | tok-126d54d64a8c | direct_source_citation_prereq_workset | A07/A06 | P00280 | 13 |
| 3 | agent2-orot-gap-tok-158f1752a1df | tok-158f1752a1df | a06_evidence_boundary_prereq_workset | A07/A06 | D00326, D00327, D00328 | 39 |
| 4 | agent2-orot-gap-tok-17ba65351831 | tok-17ba65351831 | a06_evidence_boundary_prereq_workset | A07/A06 | M00340, M00341, M01646, M01647 | 18 |
| 5 | agent2-orot-gap-tok-37b56cc45be0 | tok-37b56cc45be0 | a06_evidence_boundary_prereq_workset | A07/A06 | S00039 | 5 |
| 6 | agent2-orot-gap-tok-4cea88e6da5e | tok-4cea88e6da5e | a06_evidence_boundary_prereq_workset | A07/A06 | U01941, U01942 | 6 |
| 7 | agent2-orot-gap-tok-b443f02c38b9 | tok-b443f02c38b9 | a06_evidence_boundary_prereq_workset | A07/A06 | N00557 | 14 |
| 8 | agent2-orot-gap-tok-c5505fd218da | tok-c5505fd218da | a06_evidence_boundary_prereq_workset | A07/A06 | A00840, A00841, A00842, A00843, A00844, U00016 | 8 |
| 9 | agent2-orot-gap-tok-d29b2c27700e | tok-d29b2c27700e | direct_source_citation_prereq_workset | A07/A06 | M00032 | 18 |
| 10 | agent2-orot-gap-tok-d6cbb8ff849c | tok-d6cbb8ff849c | direct_source_citation_prereq_workset | A07/A06 | U00063 | 9 |
| 11 | agent2-orot-gap-tok-e50370ece8ba | tok-e50370ece8ba | direct_source_citation_prereq_workset | A07/A06 | E00687 | 11 |
| 12 | agent2-orot-gap-tok-f14e3500010d | tok-f14e3500010d | direct_source_citation_prereq_workset | A07/A06 | I00126 | 7 |
| 13 | agent2-orot-gap-tok-f4684f98dd3c | tok-f4684f98dd3c | a06_evidence_boundary_prereq_workset | A07/A06 | C00514, C01159, C01160, C01161, E00078 | 7 |
| 14 | agent2-orot-gap-tok-f5ba8846921d | tok-f5ba8846921d | a06_evidence_boundary_prereq_workset | A07/A06 | V00488, V00872 | 10 |

## Handoff

- Handoff owner: Agent 10 for release/package intake; A07 for approval; A06 for evidence/validator production only.
- Next safe action: Use overlay rows as navigation: 5 rows route to direct source-citation prereq work and 9 rows route to A06 evidence-boundary prereq work; route approval/SOP/final-validation/release-gate questions only to A07.
- Stop condition: Stop at route overlay evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.

