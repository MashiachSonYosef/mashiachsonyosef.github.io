# Agent 6 Old-Dictionary Morphology Planning Boundary Verdict - 2026-06-05

## Disposition

WARN-ACCEPTED for non-public morphology-planning evidence only.

Agent 10 may carry the exact selected old-dictionary commercial-clean morphology relation subset as non-public planning evidence only:

- Rows: `78`
- Occurrences: `1461`
- Selector: `preview_relation_class=exact_after_mark_strip`
- Selector: `agent2_morphology_relation_status=agent2_morphology_relation_approved_for_nonpublic_planning`
- Source/license lane: `commercial_clean_candidate` planning lane only
- NC rows in this reviewed subset: `0`

This verdict does not authorize candidate-use, transform execution, definition text, lemma text, reader-hint emission, answer eligibility, public output, route writes, runtime mutation, export, accepted text, release action, or source/license/legal acceptance.

## Evidence Reviewed

- `reports/agent10-agent6-ready-old-dictionary-morphology-planning-boundary-packet-2026-06-05.md`
- `reports/agent10-agent6-ready-old-dictionary-morphology-planning-boundary-packet-2026-06-05.json`
- `reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json`
- `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`
- `reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json`

## Validators Run

- `node scripts/validate_agent10_agent2_old_dictionary_morphology_relation_workset.mjs reports/agent10-agent2-ready-old-dictionary-commercial-clean-morphology-relation-workset-2026-06-05.json`
- Result: passed. Rows: `297`; occurrences: `5747`.
- `node scripts/validate_agent2_old_dictionary_commercial_clean_morphology_relation_matrix.mjs reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`
- Result: passed. Rows: `297`; planning-approved: `78`; transform rows: `0`.
- `node scripts/validate_agent2_morphology_planning_candidate_use_blocker.mjs reports/agent2-morphology-planning-candidate-use-blocker-2026-06-05.json`
- Result: passed. Planning rows: `78`; candidate-use rows: `0`.
- `node scripts/validate_agent10_old_dictionary_morphology_planning_boundary_packet.mjs reports/agent10-agent6-ready-old-dictionary-morphology-planning-boundary-packet-2026-06-05.json`
- Result: passed. Planning rows: `78`; occurrences: `1461`.

## Independent Recount

Independent selector recount over `reports/agent2-old-dictionary-commercial-clean-morphology-relation-matrix-2026-06-05.json`:

| metric | count |
|---|---:|
| matrix rows | 297 |
| selected planning rows | 78 |
| selected planning occurrences | 1461 |
| blocked rows preserved outside subset | 219 |
| forbidden flag rows observed | 0 |

Relation class counts:

| relation class | rows |
|---|---:|
| `exact_after_mark_strip` | 78 |
| `prefix_or_clitic_possible` | 129 |
| `needs_morphology_disambiguation` | 90 |

Relation status counts:

| relation status | rows |
|---|---:|
| `agent2_morphology_relation_approved_for_nonpublic_planning` | 78 |
| `agent2_morphology_relation_blocked_prefix_or_clitic_possible` | 129 |
| `agent2_morphology_relation_blocked_needs_disambiguation` | 90 |

Source-family presence in the 78 selected rows is non-exclusive because one row may carry more than one public-domain lexicon:

| source family | rows with family | occurrences with family |
|---|---:|---:|
| BDB Aramaic Dictionary | 21 | 616 |
| BDB Dictionary | 63 | 1271 |
| Jastrow Dictionary | 75 | 1417 |

## Warnings

1. The accepted boundary is planning-only. The packet itself preserves `allowed_candidate_use_rows_now=0` and `allowed_transform_rows_now=0`; therefore no downstream candidate text, transform, route, reader hint, or answer use is cleared.
2. The source/license lane is carried as packet metadata only. This is not source/provenance acceptance, license/legal acceptance, commercial export permission, or publication support.
3. The `129` `prefix_or_clitic_possible` rows and `90` `needs_morphology_disambiguation` rows remain blocked outside this reviewed planning subset.
4. Any later candidate-use or transform request must return as a new exact Agent 6 packet naming row IDs/subset, text fields, source/license fields, zero/nonzero output counters, and what must not be accepted.

## Blockers Preserved

- `missing_exact_agent6_row_subset_boundary_for_candidate_use`
- `missing_agent10_exact_agent6_candidate_use_packet_for_the_specific_planning_rows`
- `definition_lane_must_still_emit_no_public_or_answer_acceptance`
- `prefix_or_clitic_possible_requires_morphology_disambiguation`
- `needs_morphology_disambiguation`

## Affected Agents And Gates

| lane | effect |
|---|---|
| Agent 10 | may carry the exact 78-row / 1461-occurrence subset as non-public planning evidence only |
| Agent 2 | may reference the subset as morphology-planning evidence only; may not transform or emit candidate text from this verdict |
| Agent 1 | no new source/provenance/license acceptance created |
| Agent 4 | no runtime/public proof route opened |
| Agent 7 | required for any later control-state publication, release-path activation, or durable queue-state recording |

Affected gates:

- old-dictionary morphology planning gate: WARN-ACCEPTED for the exact reviewed subset only
- candidate-use gate: still blocked
- transform gate: still blocked
- Definition authority gate: still blocked
- public/runtime gate: not accepted
- publication/release gate: not accepted
- source/provenance/license/legal gate: not accepted

## What Must Not Be Accepted

No QA acceptance beyond this docket, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, candidate text export, commercial export permission, NC commercial authorization, or release action.

## Stop Condition

This dated Agent 6 verdict exists for the exact old-dictionary commercial-clean morphology-planning subset only. No implementation, staging, cleanup, queue-state update, source mutation, route mutation, runtime mutation, public output, candidate-use, transform, export, or release action was performed.

