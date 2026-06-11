# Agent 2 Weekly Lexicon Pipeline Inventory Validation

Date: 2026-06-04
Mode: WEEKLY_LEXICON_EXPANSION_GOAL_MODE

## Target

Current validation receipt for the Agent 2 weekly lexicon pipeline inventory.

## Files

- Validator: `scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs`
- Inventory: `reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json`
- Validation report: `reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.md`
- Validation JSON: `reports/agent2-weekly-lexicon-pipeline-inventory-validation-2026-06-04.json`

## Command

```powershell
node scripts/validate_agent2_weekly_lexicon_pipeline_inventory.mjs reports/agent2-weekly-lexicon-pipeline-inventory-2026-06-04.json
```

## Counts

- Pipeline entries: 10.
- Deuteronomy readiness: 1334 rows / 2964 occurrences.
- Deuteronomy partition plan: 1334 rows / 2964 occurrences.
- Orot missed-dictionary: 0 candidate rows; 168 unmatched.
- Old-dictionary planning intake: 500 rows / 8427 occurrences; 0 candidate rows emitted.
- Orot TBD inventory: 13 rows / 129 occurrences.
- Workbench sample: 1000 rows.
- Spark-1 output-state gate: 7 runnable outputs / 23 validator-only states.
- Exact blockers: 4.

## Checks

- referenced artifact paths exist.
- Deuteronomy Phase-2 matrix remains 1334 rows / 2964 occurrences.
- Deuteronomy partition plan remains 1334 rows / 2964 occurrences with 0 candidate text export rows.
- Orot missed-dictionary packet remains zero-candidate with 168 unmatched rows.
- Old-dictionary lane planning intake remains planning-only with 500 audited rows / 8427 occurrences and 0 candidate rows emitted.
- Orot TBD inventory remains display-integrity planning only with 13 rows / 129 occurrences.
- Definition Workbench 1000 sample remains 1000 rows with 4 no-hint repair targets.
- Joined-sample planning remains 1 projected row / 12 occurrence links.
- Source-lane fixture covers all four required lanes.
- Spark-1 output-state gate checks 7 runnable outputs / 23 validator-only states.
- Exact blockers are current and lane-preserved.
- Zero boundary values remain false.

## Non-Acceptance Boundary

This validation checks inventory integrity only. It does not claim QA acceptance, source/provenance acceptance, license acceptance, legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, definition-content storage, or NC commercial authorization.
