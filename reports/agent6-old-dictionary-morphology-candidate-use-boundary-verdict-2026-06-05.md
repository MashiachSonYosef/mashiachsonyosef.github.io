# Agent 6 Old-Dictionary Morphology Candidate-Use Boundary Verdict - 2026-06-05

## Disposition

WARN-ACCEPTED for non-public candidate-use planning input only.

Agent 10 may carry the exact `78` old-dictionary commercial-clean morphology-planning rows / `1461` occurrences one step further as non-public candidate-use planning input for Agent 2 package authoring only.

The exact row boundary is the `78` queue IDs in:

- `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`
- JSON pointer: `exact_subset_for_future_question.queue_ids`

This verdict permits Agent 2 to author a later non-public candidate-use package over those row IDs. It does not permit Agent 2 to store candidate text, export candidate text, store definition/lemma/reader-hint content, mark answers, write routes, mutate runtime/public files, publish, export, or release.

## Evidence Reviewed

- `reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.md`
- `reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json`
- `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json`
- `reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json`
- `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`
- `reports/agent10-agent6-ready-old-dictionary-morphology-planning-boundary-packet-2026-06-05.json`
- `reports/agent6-old-dictionary-morphology-planning-boundary-verdict-2026-06-05.json`

## Validator Run

- `node scripts/validate_agent10_old_dictionary_morphology_candidate_use_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-morphology-candidate-use-boundary-packet-2026-06-05.json`
- Result: passed. Rows: `78`; occurrences: `1461`.

## Independent Recount

Independent set comparison between `reports/agent2-agent10-candidate-use-preflight-handoff-2026-06-05.json` and the Agent 2 morphology relation matrix:

| check | result |
|---|---:|
| handoff queue IDs | 78 |
| unique handoff queue IDs | 78 |
| selected rows by prior Agent 6 selector | 78 |
| selected occurrences by prior Agent 6 selector | 1461 |
| handoff rows found in matrix | 78 |
| handoff occurrences | 1461 |
| missing selected IDs from handoff | 0 |
| extra handoff IDs outside selected subset | 0 |
| forbidden row flags observed | 0 |
| nonzero packet zero-counters | 0 |
| blocked rows outside subset | 219 |

The reviewed row set matches the prior Agent 6 WARN-ACCEPTED morphology-planning subset exactly:

- `preview_relation_class=exact_after_mark_strip`
- `agent2_morphology_relation_status=agent2_morphology_relation_approved_for_nonpublic_planning`
- `license_lane=commercial_clean_candidate`
- NC rows in reviewed subset: `0`

## Required Fields For Any Later Agent 2 Package

Any later Agent 2 package over this subset must preserve at least:

- `queue_id`
- `token_id`
- `lexicon_entry_id`
- `occurrences`
- `source_family`
- `license_lane`
- `source_rids`
- `morphology_relation_basis`
- `agent2_morphology_relation_status`
- `candidate_use_scope`
- `derived_from_nc`
- `commercial_export_allowed`
- `attribution_required`
- `corpus_contamination`
- `answer_eligible`
- `public_emit`
- `agent6_boundary_required`

## Warnings

1. This verdict advances the rows from morphology-planning evidence to candidate-use planning input only. It does not authorize candidate text use, content storage, transform execution, answer eligibility, route writes, public output, export, or release.
2. The `commercial_clean_candidate` lane is carried only as packet metadata for planning. It is not source/provenance acceptance, license/legal acceptance, commercial export permission, or publication support.
3. The `219` morphology-blocked rows remain excluded, including `129` `prefix_or_clitic_possible` rows and `90` `needs_morphology_disambiguation` rows.
4. Any actual candidate-use package must return for a new Agent 6 verdict before text storage, transform, output, export, answer eligibility, or public/runtime mutation.

## Blockers Preserved

- candidate text export remains blocked
- definition/lemma/reader-hint content storage remains blocked
- answer eligibility remains blocked
- public/runtime mutation remains blocked
- route writes remain blocked
- accepted text remains blocked
- release action remains blocked
- `219` morphology-blocked rows remain outside this boundary

## Affected Agents And Gates

| lane | effect |
|---|---|
| Agent 10 | may hand the exact 78 queue IDs to Agent 2 as non-public candidate-use planning input only |
| Agent 2 | may author a later non-public candidate-use package over the exact 78 IDs, preserving required fields and zero-output controls |
| Agent 1 | no source/provenance/license/legal acceptance created |
| Agent 4 | no runtime/public proof route opened |
| Agent 7 | still required for control-state publication, release-path activation, or durable queue-state publication if applicable |

Affected gates:

- old-dictionary morphology candidate-use planning gate: WARN-ACCEPTED for exact 78-row planning input only
- candidate text export gate: blocked
- definition content storage gate: blocked
- answer eligibility gate: blocked
- public/runtime gate: not accepted
- route write gate: blocked
- publication/release gate: not accepted
- source/provenance/license/legal gate: not accepted

## What Must Not Be Accepted

No QA acceptance beyond this docket, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, candidate text export, definition-content storage, commercial export authorization, NC commercial authorization, or release action.

## Stop Condition

This dated Agent 6 verdict exists for the exact `78` row / `1461` occurrence non-public candidate-use planning input boundary only. No implementation, staging, cleanup, queue-state update, candidate text export, content storage, transform, route mutation, runtime mutation, public output, answer eligibility, accepted text, commercial export, NC commercial authorization, publication readiness, or release action was performed.

