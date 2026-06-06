# Agent 3 Old-Dictionary Candidate-Use Queue/Source Boundary Blocker Matrix

Generated: 2026-06-06T10:59:57.917Z

## Boundary

- Evidence/navigation only; this matrix records current blocker flags for queue/source dedupe rows.
- It does not select source families, supply citations, accept provenance/license/legal state, write routes, or prepare publication.
- Every row remains blocked before source citation, transform prerequisites, and exact boundary packets.

## Counts

- Input dedupe rows / coverage rows / handoff entries / blocker rows: 363/314/8/363
- Unique queue-source keys / duplicate keys / source RIDs / queues / partitions: 363/0/314/65/2
- Blocker signatures / exact blockers / cross rows / single rows: 1/1/163/200
- Source citation missing / citation present / transform blocked / Agent 6 after prereq / source-family blocker / boundary packet exists: 363/0/363/363/363/0
- Source diagnostic / batch diagnostic / both diagnostic rows: 16/288/16
- Queue-source refs / queue-source occurrences / source-level occurrences: 475/12111/7795
- Candidate text / answer eligible / route writes / source text / source-family selection / public mutation / release actions: 0/0/0/0/0/0/0

## Blocker Signatures

| blocker_signature | rows | queues | sources | refs | occurrences |
| --- | ---: | ---: | ---: | ---: | ---: |
agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked | 363 | 65 | 314 | 475 | 12111

## Matrix Samples

| key | partition | source_rid | queue_id | blocker_signature |
| --- | --- | --- | --- | --- |
agent2-orot-gap-tok-017227aa7bde|BDB02455 | cross_batch_queue_guard | BDB02455 | agent2-orot-gap-tok-017227aa7bde | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-017227aa7bde|BDB02456 | cross_batch_queue_guard | BDB02456 | agent2-orot-gap-tok-017227aa7bde | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-017227aa7bde|BDB02457 | cross_batch_queue_guard | BDB02457 | agent2-orot-gap-tok-017227aa7bde | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-017227aa7bde|BDB02461 | cross_batch_queue_guard | BDB02461 | agent2-orot-gap-tok-017227aa7bde | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-017227aa7bde|BDBA0242 | cross_batch_queue_guard | BDBA0242 | agent2-orot-gap-tok-017227aa7bde | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-017227aa7bde|E00686 | cross_batch_queue_guard | E00686 | agent2-orot-gap-tok-017227aa7bde | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-0a04ca1d499c|BDB07083 | cross_batch_queue_guard | BDB07083 | agent2-orot-gap-tok-0a04ca1d499c | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-0a04ca1d499c|BDB07287 | cross_batch_queue_guard | BDB07287 | agent2-orot-gap-tok-0a04ca1d499c | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-0a04ca1d499c|BDB07310 | cross_batch_queue_guard | BDB07310 | agent2-orot-gap-tok-0a04ca1d499c | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked
agent2-orot-gap-tok-0a04ca1d499c|BDB07311 | cross_batch_queue_guard | BDB07311 | agent2-orot-gap-tok-0a04ca1d499c | agent6_boundary_after_prereq|source_citation_missing|source_family_selection_boundary_blocker|transform_rule_still_blocked

## Handoff

- Handoff owner: Agent 10 package intake can use this matrix to keep all queue/source dedupe rows blocked until source citation, transform, and boundary prerequisites are supplied.
- Stop condition: Queue/source boundary blocker matrix emitted; no source text read, no source-family selection made, no source citation supplied, no transform text generated, no route write, no public mutation, and no acceptance action taken.
