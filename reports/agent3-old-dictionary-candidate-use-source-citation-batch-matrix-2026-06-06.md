# Agent 3 Old-Dictionary Candidate-Use Source-Citation Batch Matrix

Generated: 2026-06-06T08:41:41.939Z

## Boundary

- Evidence/navigation only; batches group source-RID identifiers and blockers, not source text or citation acceptance.
- Mechanical batch order is for enrichment planning only; it is not route ranking, answer selection, or Definition authority.
- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.

## Counts

- Batch rows / source-RID memberships / unique source RIDs: 30/836/344
- Source-RID references / occurrence memberships: 1043/24354
- Source families / partitions / triage groups / impact buckets: 3/2/4/3
- Source citation required / transform blocked / Agent 6 after prereq memberships: 836/836/836
- Max source RIDs / queue IDs / references / occurrences per batch: 191/40/191/2585
- Candidate text / answer eligible / route writes / source text / public mutation / release actions: 0/0/0/0/0/0

## Source Family Batch Counts

- BDB Aramaic Dictionary: 9
- BDB Dictionary: 9
- Jastrow Dictionary: 12

## Sample Batches

| order | source_family | partition | triage_group | bucket | source_rids | refs | occurrences |
| ---: | --- | --- | --- | --- | ---: | ---: | ---: |
1 | BDB Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | single_queue_standard | 191 | 191 | 1815
2 | Jastrow Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | single_queue_standard | 188 | 188 | 1793
3 | BDB Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | shared_source_rid_multi_queue | 36 | 78 | 2585
4 | Jastrow Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | shared_source_rid_multi_queue | 36 | 78 | 2585
5 | BDB Aramaic Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | shared_source_rid_multi_queue | 28 | 62 | 2201
6 | BDB Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | single_queue_high_occurrence | 55 | 55 | 2168
7 | Jastrow Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | single_queue_high_occurrence | 54 | 54 | 2141
8 | BDB Dictionary | overlap_workset | commercial_clean_blocked_overlap | shared_source_rid_multi_queue | 23 | 50 | 1872
9 | Jastrow Dictionary | overlap_workset | commercial_clean_blocked_overlap | shared_source_rid_multi_queue | 23 | 50 | 1872
10 | BDB Aramaic Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | single_queue_standard | 49 | 49 | 517
11 | BDB Aramaic Dictionary | overlap_workset | commercial_clean_blocked_overlap | shared_source_rid_multi_queue | 22 | 48 | 1859
12 | BDB Aramaic Dictionary | overlap_workset | commercial_clean_nc_blocked_overlap | single_queue_high_occurrence | 23 | 23 | 880

## Handoff

- Handoff owner: Agent 1/Agent 2 source-citation enrichment; Agent 10 release/package intake; Agent 6 only after exact boundary packet
- Stop condition: Source-citation batch matrix emitted; no source text read, source citation supplied, transform text generated, route write, public mutation, or acceptance action taken.
