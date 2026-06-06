# Agent 3 Old-Dictionary Candidate-Use Partition Overlap Diagnostic Index

Generated: 2026-06-06T10:28:54.806Z

## Boundary

- Evidence/navigation only; this is a diagnostic index for source-RID and batch-ID reuse across already-disjoint queue/source-pair partitions.
- The queue/source-pair partition remains the dedupe basis; source-RID and batch-ID reuse is not a partition failure.
- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.

## Counts

- Closure queues / pairs / queue overlap / pair overlap: 65/363/0/0
- Source-RID overlaps / cross queues / single queues / cross pairs / single pairs: 7/4/2/9/7
- Source-RID overlap refs cross-single / occurrences cross-single: 24-16/651-471
- Batch-ID overlaps / cross queue memberships / single queue memberships: 9/30/38
- Batch-ID overlap refs cross-single / occurrences cross-single: 117-207/3109-3256
- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: 0/0/0/0/0/0/0

## Source-RID Diagnostics

| source_rid | cross queues | single queues | cross pairs | single pairs | cross occ | single occ | blocker |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
BDB03814 | 3 | 1 | 3 | 1 | 270 | 90 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
BDB03823 | 1 | 1 | 1 | 1 | 74 | 74 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
BDB03824 | 1 | 1 | 1 | 1 | 74 | 74 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
BDBA0338 | 1 | 1 | 1 | 1 | 72 | 72 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
E00650 | 1 | 1 | 1 | 1 | 21 | 21 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
J00100 | 1 | 1 | 1 | 1 | 70 | 70 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
J00101 | 1 | 1 | 1 | 1 | 70 | 70 | source_rid_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key

## Batch-ID Diagnostics

| batch_id | cross queues | single queues | cross occ | single occ | blocker |
| --- | ---: | ---: | ---: | ---: | --- |
agent3-source-family-selection-batch-0fcc91298c5a | 3 | 2 | 349 | 531 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-1bdfa6995259 | 7 | 1 | 1786 | 450 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-342e6e69c3c0 | 1 | 1 | 33 | 6 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-36349c997713 | 3 | 5 | 339 | 922 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-5af39601c157 | 4 | 5 | 239 | 278 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-aafff2afc5b9 | 2 | 1 | 80 | 30 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-ce5f2b394a3d | 1 | 1 | 7 | 14 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-d2102776dac2 | 8 | 21 | 255 | 1004 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key
agent3-source-family-selection-batch-e7bcd727c7ce | 1 | 1 | 21 | 21 | batch_id_reused_across_queue_partitions_diagnostic_only_use_queue_source_pair_key

## Handoff

- Handoff owner: Agent 10 package intake can use this diagnostic index to avoid source-RID or batch-ID level duplicate claims while preserving the queue/source-pair partition as the dedupe basis.
- Stop condition: Partition overlap diagnostic index emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.
