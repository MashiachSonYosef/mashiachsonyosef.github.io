# Agent 1 Spark-1 Pipeline Contract - Orot Missing Lexicon Linkage Candidates - 2026-06-04

Status: `pipeline_contract_runnable_validated`.

## Target

- workset: `orot-missing-lexicon-linkage-candidates`
- input lineage rows: `100`
- missing lexicon linkage rows: `13`
- missing lexicon linkage occurrences: `129`
- mutation rows emitted: `0`
- source rows emitted: `0`
- lexicon entry ids assigned: `0`

## Commands

- build: `node scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs --json-report reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json --report reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.md`
- validate output: `node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.json`
- validate contract: `node scripts/validate_agent1_spark1_orot_missing_lexicon_linkage_candidates_contract.mjs`

## Bucket Counts

| bucket | rows | occurrences | posture |
| --- | ---: | ---: | --- |
| no_current_stem_source_candidate_found | `3` | `71` | blocked |
| project_preferred_function_word_stem_candidate_exists | `3` | `23` | Agent 10/Agent 6 review only |
| single_stem_candidate_found_current_pipeline | `6` | `32` | external-link-only / excluded from assignment |
| multi_stem_no_project_preferred_candidate | `1` | `3` | blocked ambiguity |

## Spark-1 Stop Condition

Spark-1 may run only the listed build/validator commands and must stop after output plus validator pass, or return exact missing input/output/schema/validator/count blocker.

## Boundary

This is a runnable source/linkage/custody mechanics contract only. It does not accept source/provenance, license/legal posture, QA, Definition authority, usage-as-definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, or any `lexicon_entry_id` assignment.
