# Agent 4 Gate Proof - Agent6 78-Row Candidate-Use Preboundary Verdict Chain

## Target

Agent6 78-row candidate-use preboundary verdict and Agent10 consumption chain.

## Changed input/artifacts

- `reports/agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.json`
- `reports/agent10-old-dictionary-78-row-agent6-verdict-consumption-2026-06-06.json`

## Validator/proof commands with timeouts

`node --check scripts\validate_agent6_old_dictionary_candidate_use_package_boundary_verdict.mjs; node --check scripts\validate_agent10_old_dictionary_78_row_agent6_verdict_consumption.mjs`

Timeout: `30000 ms`

Result: passed.

`node scripts\validate_agent6_old_dictionary_candidate_use_package_boundary_verdict.mjs reports\agent6-old-dictionary-78-row-candidate-use-preboundary-verdict-2026-06-06.json`

Timeout: `30000 ms`

Result: passed.

`node scripts\validate_agent10_old_dictionary_78_row_agent6_verdict_consumption.mjs reports\agent10-old-dictionary-78-row-agent6-verdict-consumption-2026-06-06.json`

Timeout: `30000 ms`

Result: passed.

## Counts

- Rows: `78`
- Occurrences: `1461`
- Unique queue IDs: `78`
- Source/license lane: `commercial_clean_candidate`
- Relation: `exact_after_mark_strip`
- Morphology relation: `agent2_morphology_relation_approved_for_nonpublic_planning`
- Candidate/definition/lemma/reader-hint/answer/public/runtime/route/accepted-text rows: `0`

## Result

The preboundary verdict and Agent10 consumption chain validates. No transform or output is authorized.

## Disposition

`warn_accepted_nonpublic_candidate_use_preboundary_review_matrix_only`

## Exact blocker

`next_candidate_use_or_transform_output_boundary_not_supplied`

## Next handoff

Agent 10 owns the next exact candidate-use or transform-output boundary packet. Agent6 only reviews a new exact packet before text/output/answer/route/runtime/export/accepted-text/release behavior.

## Stop condition

Stop at preboundary verdict chain proof. Do not rerun without a changed verdict, consumption packet, matrix, boundary packet, or validator. Do not emit transform output, candidate text, definition/lemma/reader-hint content, answer rows, public/runtime mutation, route writes, accepted text, source-license/legal acceptance, export, publication readiness, or release action.

## Non-acceptance boundary

This is validator/prereq evidence only. It does not accept QA beyond this exact docket, source/provenance, source/license/legal status, Definition authority, usage-as-definition authority, answer eligibility, accepted gloss/text, public reader output, route publication support, publication readiness, product/data status, candidate text export, definition/lemma/reader-hint storage, commercial export, NC commercial authorization, or release action.
