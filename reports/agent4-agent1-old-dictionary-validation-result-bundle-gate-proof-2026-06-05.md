# Agent 4 Agent1 Old-Dictionary Validation Result Bundle Gate Proof - 2026-06-05

## Return Shape
target | agent1-old-dictionary-validation-result-bundle

changed input/artifact | reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-validation-result-2026-06-05.json; reports/agent1-old-dictionary-downstream-consumption-alignment-audit-validation-result-2026-06-05.json; reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-validation-result-2026-06-05.json

validator/proof command with timeout | `node scripts\validate_agent1_old_dictionary_validation_result_bundle.mjs`, timeout 30000 ms, passed

output artifact path | reports/agent4-agent1-old-dictionary-validation-result-bundle-gate-proof-2026-06-05.md/json

exact blockers | source-lane validation evidence remains zero-output with commercial/NC/blocker separation and no transform/public/release authorization

handoff owner | Agent1 source lane; Agent2 transform lane after Agent6 boundary; Agent10 package lane after concrete output; Agent6 boundary authority

stop condition | do not use these validation results for transform rows, candidate text, source-row emission, answer eligibility, route writes, public/runtime behavior, export, accepted text, or release until exact Agent6 boundaries and required morphology/source custody evidence exist

## Counts
- commercial-clean-only rows: 18
- commercial-clean-only occurrences: 494
- rows with refs: 17
- rows without refs: 1
- source-family rows: 5
- commercial-clean source families: 3
- noncommercial educational source families: 1
- blocked/review source families: 1
- audited rows: 500
- audited occurrences: 8427
- commercial/NC overlap rows: 197
- commercial/NC overlap occurrences: 4185
- Klein-only excluded rows: 17
- allowed transform rows now: 0
- candidate text rows now: 0
- answer/public/release rows now: 0

## Timeout Records
- process_timeout | `Get-ChildItem scripts -File -Filter 'validate_agent1_old_dictionary_commercial_clean_only_metadata_custody*.mjs' | Select-Object -ExpandProperty Name` | timeout 10000 ms | next safe action: used exact bundle validator
- process_timeout | `Get-ChildItem scripts -File -Filter 'validate_agent1_old_dictionary_downstream_consumption_alignment*.mjs' | Select-Object -ExpandProperty Name` | timeout 10000 ms | next safe action: used exact bundle validator
- process_timeout | `Get-ChildItem scripts -File -Filter 'validate_agent1_old_dictionary_commercial_nc_overlap_exclusion_manifest*.mjs' | Select-Object -ExpandProperty Name` | timeout 10000 ms | next safe action: used exact bundle validator

## Non-Acceptance Boundary
No QA acceptance, source/provenance acceptance, source/license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, route publication support, publication readiness, product/data acceptance, candidate text export, definition/lemma/reader-hint content storage, commercial export authorization, NC commercial authorization, or release action.
