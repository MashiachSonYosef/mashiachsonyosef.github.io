# Agent 3 Old-Dictionary Candidate-Use Queue/Source Dedupe Key Index

Generated: 2026-06-06T10:36:15.753Z

## Boundary

- Evidence/navigation only; `queue_source_pair_key` is the row-level dedupe key for this packet.
- Source-RID and batch-ID reuse are diagnostic flags only, not partition failures and not source-family selection.
- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.

## Counts

- Closure queues / closure pairs / dedupe rows / duplicate keys: 65/363/363/0
- Cross rows / single rows / unique queues / sources / tokens / batches: 163/200/65/314/65/16
- Source diagnostic rows / source IDs / batch diagnostic rows / batch IDs / both diagnostic rows: 16/7/288/9/16
- References / occurrences: 475/12111
- Source citation required / citation present / transform blocked / Agent 6 after prereq / source-family blocker: 363/0/363/363/363
- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: 0/0/0/0/0/0/0

## Partition Summaries

| partition | rows | queues | sources | batches | refs | occurrences | source diag rows | batch diag rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
cross_batch_queue_guard | 163 | 25 | 121 | 14 | 266 | 8811 | 9 | 90
single_batch_queue_workset | 200 | 40 | 200 | 11 | 209 | 3300 | 7 | 198

## Source Diagnostic Samples

| key | partition | source_rid | queue_id | batch_id | refs | occurrences |
| --- | --- | --- | --- | --- | ---: | ---: |
agent2-orot-gap-tok-0f4d8d348070|BDB03814 | cross_batch_queue_guard | BDB03814 | agent2-orot-gap-tok-0f4d8d348070 | agent3-source-family-selection-batch-1bdfa6995259 | 4 | 90
agent2-orot-gap-tok-0f4d8d348070|BDB03823 | cross_batch_queue_guard | BDB03823 | agent2-orot-gap-tok-0f4d8d348070 | agent3-source-family-selection-batch-1bdfa6995259 | 2 | 74
agent2-orot-gap-tok-0f4d8d348070|BDB03824 | cross_batch_queue_guard | BDB03824 | agent2-orot-gap-tok-0f4d8d348070 | agent3-source-family-selection-batch-1bdfa6995259 | 2 | 74
agent2-orot-gap-tok-0f93ec938211|BDB03814 | cross_batch_queue_guard | BDB03814 | agent2-orot-gap-tok-0f93ec938211 | agent3-source-family-selection-batch-1bdfa6995259 | 4 | 90
agent2-orot-gap-tok-0f93ec938211|BDBA0338 | cross_batch_queue_guard | BDBA0338 | agent2-orot-gap-tok-0f93ec938211 | agent3-source-family-selection-batch-1bdfa6995259 | 2 | 72
agent2-orot-gap-tok-25908effa80c|E00650 | cross_batch_queue_guard | E00650 | agent2-orot-gap-tok-25908effa80c | agent3-source-family-selection-batch-e7bcd727c7ce | 2 | 21
agent2-orot-gap-tok-291ea0c973ba|BDB03814 | cross_batch_queue_guard | BDB03814 | agent2-orot-gap-tok-291ea0c973ba | agent3-source-family-selection-batch-1bdfa6995259 | 4 | 90
agent2-orot-gap-tok-291ea0c973ba|J00100 | cross_batch_queue_guard | J00100 | agent2-orot-gap-tok-291ea0c973ba | agent3-source-family-selection-batch-1bdfa6995259 | 2 | 70

## Handoff

- Handoff owner: Agent 10 package intake can use queue_source_pair_key as the row-level dedupe key; Agent 6 remains acceptance owner only after exact boundary packets exist.
- Stop condition: Queue/source dedupe key index emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.
