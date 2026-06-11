# Agent 4 Agent2 Direct Source-Citation Prereq Intake Contract Gate Proof

Generated: 2026-06-06T09:36:30.099Z

## Target

- Changed input: `reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json`
- Existing validator result: `reports/agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-validation-result-2026-06-06.json`
- Output artifact: `reports/agent4-agent2-direct-source-citation-prereq-intake-contract-gate-proof-2026-06-06.json`

## Commands

| command | timeout | result |
| --- | ---: | --- |
| `node --check scripts\validate_agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract.mjs` | 30000 | passed |
| `node scripts\validate_agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract.mjs --input=reports\agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json` | 30000 | failed; validator expects positional input |
| `node scripts\validate_agent2_old_dictionary_78_row_direct_source_citation_prereq_intake_contract.mjs reports\agent2-old-dictionary-78-row-direct-source-citation-prereq-intake-contract-2026-06-06.json` | 30000 | passed: direct rows=5, occurrences=58, citation missing rows=5 |

## Counts

- Parent rows / occurrences: 78 / 1461.
- Direct rows / occurrences: 5 / 58.
- Source citation required / missing: 5 / 5.
- Transform blocked: 5.
- Candidate text / source text / route writes / public runtime mutation / export / release actions: 0 / 0 / 0 / 0 / 0 / 0.

## Exact Blockers

- `missing_source_field::source_citation_or_url`
- `missing_transform_output_proposal_matrix_or_exact_transform_rule`
- `missing_transform_rule::proposed_candidate_text_proposed_definition_text_proposed_lemma_text_proposed_reader_hint_text`
- `next_transform_output_or_candidate_text_boundary_not_supplied`
- `stale_agent1_registry_target_current_agent1_thread_required`

## Stop Condition

Stop at validated direct source-citation prerequisite intake. No source text, candidate text, route write, public/runtime mutation, export, publication readiness, or release action.

## Non-Acceptance Boundary

This packet is validator/prereq evidence only. It is not QA acceptance, source/provenance/license/legal acceptance, Definition or answer authority, publication readiness, public/runtime acceptance, route publication support, product/data acceptance, accepted gloss, accepted text, or release action.
