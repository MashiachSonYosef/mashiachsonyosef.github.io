# Agent 3 Old-Dictionary Candidate-Use Queue/Source Subchain Handoff Index

Generated: 2026-06-06T10:52:43.504Z

## Boundary

- Evidence/navigation only; this is a handoff index for existing queue/source dedupe subchain artifacts.
- It does not select source families, supply citations, accept provenance/license/legal state, write routes, or prepare publication.
- The row-level dedupe basis remains `queue_id/source_rid`.

## Counts

- Entries / JSON / reports / validators / type mismatches / evidence-ready: 8/8/8/8/0/8
- Source RIDs / source references / queues / queue-source pairs: 314/363/65/363
- Cross-single queues / closure queue overlap-missing-extra / closure pair overlap-missing-extra: 25-40/0-0-0/0-0-0
- Source-batch diagnostics / dedupe rows-duplicate keys / coverage missing-extra / coverage mismatches: 7-9/363-0/0-0-0-0/0-0
- Source-level occurrences / queue-source occurrence memberships: 7795/12111
- Entries with nonzero authority counters / source-family selection / candidate text / source text / public mutation / acceptance claims: 0/0/0/0/0/0

## Handoff Entries

| order | entry | role | status | json | report | validator | type mismatch |
| ---: | --- | --- | --- | --- | --- | --- | --- |
1 | unpacketized_source_family_selection_workset | base_source_rid_workset | evidence-ready | true | true | true | false
2 | source_family_selection_queue_batch_crossmatch | queue_batch_crossmatch | evidence-ready | true | true | true | false
3 | cross_batch_queue_guard | cross_batch_duplicate_claim_guard | evidence-ready | true | true | true | false
4 | single_batch_queue_workset | single_batch_queue_workset | evidence-ready | true | true | true | false
5 | queue_partition_closure | queue_source_pair_partition_closure | evidence-ready | true | true | true | false
6 | partition_overlap_diagnostic_index | diagnostic_source_batch_overlap_index | evidence-ready | true | true | true | false
7 | queue_source_dedupe_key_index | row_level_queue_source_dedupe_key_index | evidence-ready | true | true | true | false
8 | source_rid_dedupe_coverage_crossmatch | source_rid_to_queue_source_dedupe_coverage | evidence-ready | true | true | true | false

## Handoff

- Handoff owner: Agent 10 package intake can use this as the queue/source dedupe subchain index; Agent 6 remains acceptance owner only after exact boundary packets exist.
- Stop condition: Queue/source subchain handoff index emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.
