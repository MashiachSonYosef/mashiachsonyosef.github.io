# Agent 3 Old-Dictionary Candidate-Use Source-RID Dedupe Coverage Crossmatch

Generated: 2026-06-06T10:45:45.753Z

## Boundary

- Evidence/navigation only; this crossmatches source-RID workset rows to queue/source dedupe keys.
- Source-level occurrence totals and queue/source membership occurrence totals are both reported but are not interchangeable.
- Agent 3 supplied no source citation, no proposed text, no route write, no public mutation, and no acceptance claim.

## Counts

- Workset source RIDs / dedupe source RIDs / coverage rows / matched / missing / extra: 314/314/314/314/0/0
- Workset queue-source pairs / dedupe pairs / missing pairs / extra pairs: 363/363/0/0
- Reference mismatches / queue-set mismatches: 0/0
- Source-level occurrences / queue-source membership occurrences: 7795/12111
- Multi-queue / single-queue source RIDs: 43/271
- Source diagnostic rows-pairs / batch diagnostic rows-pairs / source+batch diagnostic rows: 7-16/273-288/7
- Source citation required / citation present / transform blocked / Agent 6 after prereq / source-family blocker: 314/0/314/314/314
- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: 0/0/0/0/0/0/0

## Coverage Samples

| source_rid | queues | dedupe keys | source occ | membership occ | source diag | batch diag | status |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
BDB03814 | 4 | 4 | 90 | 360 | true | true | covered_by_queue_source_dedupe_keys
BDB04479 | 3 | 3 | 211 | 633 | false | false | covered_by_queue_source_dedupe_keys
BDB04514 | 3 | 3 | 211 | 633 | false | false | covered_by_queue_source_dedupe_keys
BDBA0384 | 3 | 3 | 211 | 633 | false | false | covered_by_queue_source_dedupe_keys
BDBA0386 | 3 | 3 | 211 | 633 | false | false | covered_by_queue_source_dedupe_keys
BDB01060 | 2 | 2 | 29 | 58 | false | false | covered_by_queue_source_dedupe_keys
BDB01292 | 2 | 2 | 24 | 48 | false | false | covered_by_queue_source_dedupe_keys
BDB01293 | 2 | 2 | 24 | 48 | false | false | covered_by_queue_source_dedupe_keys
BDB01301 | 2 | 2 | 24 | 48 | false | false | covered_by_queue_source_dedupe_keys
BDB02413 | 2 | 2 | 13 | 26 | false | false | covered_by_queue_source_dedupe_keys

## Handoff

- Handoff owner: Agent 10 package intake can use this crossmatch to prove each unpacketized source RID resolves to exact queue/source dedupe keys before any future boundary packet.
- Stop condition: Source-RID dedupe coverage crossmatch emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.
