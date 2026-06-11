# Agent 4 Gate Proof - Agent3 Split Closure Crossmatch

## Target

Agent3 split closure crossmatch for old-dictionary candidate-use worksets.

## Changed input/artifact

`reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json`

## Validator/proof commands with timeouts

`node --check scripts\validate_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs`

Timeout: `30000 ms`

Result: passed.

`node scripts\validate_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs reports\agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json`

Timeout: `30000 ms`

Result: passed.

Output:

`Agent 3 split closure passed: rows=78 missing=0 duplicates=0`

## Files

- Validator: `scripts/validate_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs`
- Generator: `scripts/build_agent3_old_dictionary_candidate_use_split_closure_crossmatch.mjs`
- Crossmatch: `reports/agent3-old-dictionary-candidate-use-split-closure-crossmatch-2026-06-06.json`

## Counts

- Triage candidate packet: `78` rows / `1461` occurrences
- Closure: `78` rows / `1461` occurrences
- Pure workset: `5` rows / `58` occurrences
- Overlap workset: `73` rows / `1403` occurrences
- Partition rows: `2`
- Blocker rows: `4`
- Missing from closure: `0`
- Extra in closure: `0`
- Cross-partition duplicate queue IDs: `0`
- Cross-partition duplicate token IDs: `0`
- Rows missing Agent1 RID metadata: `0`
- Rows missing exact subset: `0`
- Transform-ready rows: `0`
- Candidate/definition/lemma/reader-hint/answer/output/public/runtime/release rows: `0`

## Result

The split closure validates: pure-commercial and overlap worksets partition the full 78-row old-dictionary candidate-use packet without gaps or duplicates.

## Next handoff

Agent 10 owns package intake. Agent6 owns exact source-family boundary review if routed. Agent2 only receives this after boundary/transform authorization.

## Stop condition

Stop at split-closure crossmatch proof. Do not rerun without a changed split-closure artifact, pure/overlap workset successor, Agent10 consumption packet, Agent6 boundary packet/verdict, or validator. Do not emit transform output, candidate text, definition/lemma/reader-hint content, answer rows, public/runtime mutation, route writes, accepted text, source-license/legal acceptance, export, publication readiness, or release action.

## Non-acceptance boundary

This is validator/prereq evidence only. It does not accept QA, source/provenance, source/license/legal status, Definition authority, usage-as-definition authority, answer eligibility, accepted gloss/text, public reader output, route publication support, publication readiness, product/data status, commercial export, NC commercial authorization, or release action.
