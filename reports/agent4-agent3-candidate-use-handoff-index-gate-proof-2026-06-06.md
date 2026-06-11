# Agent 4 Gate Proof - Agent3 Candidate-Use Handoff Index

## Target

Agent3 old-dictionary candidate-use handoff index.

## Changed input/artifact

`reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json`

## Validator/proof commands with timeouts

`node --check scripts\validate_agent3_old_dictionary_candidate_use_handoff_index.mjs`

Timeout: `30000 ms`

Result: passed.

`node scripts\validate_agent3_old_dictionary_candidate_use_handoff_index.mjs reports\agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json`

Timeout: `30000 ms`

Result: passed.

Output:

`Agent 3 handoff index passed: entries=9 rows=78 authority_issues=0`

## Files

- Validator: `scripts/validate_agent3_old_dictionary_candidate_use_handoff_index.mjs`
- Generator: `scripts/build_agent3_old_dictionary_candidate_use_handoff_index.mjs`
- Handoff index: `reports/agent3-old-dictionary-candidate-use-handoff-index-2026-06-06.json`

## Counts

- Handoff entries: `9`
- Existing JSON artifacts: `9`
- Existing report artifacts: `9`
- Existing validator scripts: `9`
- Evidence-ready entries: `9`
- Candidate-use rows: `78`
- Candidate-use occurrences: `1461`
- Pure workset: `5` rows / `58` occurrences
- Overlap workset: `73` rows / `1403` occurrences
- Split closure rows: `78`
- Split closure missing rows: `0`
- Split closure duplicate queue IDs: `0`
- Entries with nonzero authority counters: `0`
- Transform/candidate/definition/answer/route/runtime/release rows: `0`

## Result

The candidate-use handoff index validates. All indexed entries are evidence-ready and authority counters remain zero.

## Next handoff

Agent 10 owns package intake and Agent6 routing. Agent2 only receives this after exact boundary/transform authorization.

## Stop condition

Stop at Agent3 candidate-use handoff index proof. Do not rerun without a changed handoff index, underlying workset successor, Agent10 consumption packet, Agent6 boundary packet/verdict, or validator. Do not emit transform output, candidate text, definition/lemma/reader-hint content, answer rows, public/runtime mutation, route writes, accepted text, source-license/legal acceptance, export, publication readiness, or release action.

## Non-acceptance boundary

This is validator/prereq evidence only. It does not accept QA, source/provenance, source/license/legal status, Definition authority, usage-as-definition authority, answer eligibility, accepted gloss/text, public reader output, route publication support, publication readiness, product/data status, commercial export, NC commercial authorization, or release action.
