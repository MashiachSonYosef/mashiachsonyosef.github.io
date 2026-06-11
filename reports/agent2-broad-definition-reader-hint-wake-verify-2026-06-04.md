# Agent 2 Broad Definition / Lemma / Reader-Hint Wake Verify - 2026-06-04

Status: `replacement_required_exact_blocker`.
Active mode checked: `BROAD_CORPUS_EXPANSION`.
Highest permissible claim: Agent 2 verified current broad-lane mechanics and preserved exact blocker evidence for broad definition/lemma/reader-hint packaging.

## Current Output

Replacement-required status:

- Current Spark 2 output is usable as Orot-only mechanical evidence.
- Current Spark 2 output is not sufficient for broad corpus expansion beyond Orot.
- Broad Agent 2 packaging requires a replacement queue item or repaired Spark 2 state that supplies an exact broad target workset, command list, output path, and schema/count definition.

Current Orot package artifact path from existing Spark 2 mechanics:

- `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
- `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.md`

Current Spark 2 evidence path:

- `reports/spark2-broad-definition-pipeline-mechanics-2026-06-04-run2.md`

## Inputs Used

| Path | Status | Use |
| --- | --- | --- |
| `reports/agent7-broad-agent-spark-goals-2026-06-04.md` | present | Broad lane goal and non-acceptance boundary. |
| `data/control/spark_standing_queue.json` | present | Queue item and exact supplied command list. |
| `reports/spark-2-state.md` | present | Spark 2 current state and contradiction check. |
| `data/control/agent_goal_board.json` | present | Confirms `active_mode: BROAD_CORPUS_EXPANSION` and `publication_global_status: blocked_no_render`. |
| `reports/spark2-broad-definition-pipeline-mechanics-2026-06-04.md` | present | Spark 2 prior command result summary. |
| `reports/spark2-broad-definition-pipeline-mechanics-2026-06-04-run2.md` | present | Spark 2 current command result summary. |
| `reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json` | present | Current validator-backed Orot reader-hint candidate patch. |
| `reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json` | present | Current Orot counterpart preview. |
| `reports/agent2-orot-pilot-answer-claims-2026-06-03.json` | present | Zero-safe pilot answer-claims blocker. |
| `reports/agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json` | present | Allowed-row non-public package dry-run. |

## Exact Queue / State Finding

The queue item `spark2-broad-definition-pipeline-mechanics` is marked active and broad, but its supplied `pipeline_commands` are all Orot-specific:

1. `node scripts/build_agent2_orot_reader_hint_candidate_patch.mjs`
2. `node scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
3. `node scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs`
4. `node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
5. `node scripts/build_orot_agent2_pilot_answer_claims.mjs`
6. `node scripts/validate_agent2_orot_pilot_answer_claims.mjs`
7. `node scripts/validate_agent2_orot_allowed_row_reader_hint_package_dry_run.mjs`

`reports/spark-2-state.md` still says:

- `READY_FOR_AGENT_2: Orot-only answer-eligible / reader-hint / counterpart-display pipeline.`
- `Do not do global definition work.`

Therefore the current broad queue state and Spark 2 state conflict with `BROAD_CORPUS_EXPANSION`. Under the existing-pipeline-only rule, Agent 2 cannot infer a non-Orot broad workset or invent a broad transform.

## Counts

Current Spark 2 / Agent 2 Orot outputs:

| Artifact | Rows | Occurrences | Key status |
| --- | ---: | ---: | --- |
| `agent2-orot-reader-hint-candidate-patch-2026-06-04.json` | 31 | 1202 | `warn_candidate_patch_not_approved` |
| `agent2-orot-counterpart-hint-patch-preview-2026-06-04.json` | 31 | 1202 | `warn_candidate_patch_preview_not_approved` |
| `agent2-orot-pilot-answer-claims-2026-06-03.json` | 100 target rows | 1960 | `zero_safe_output_blocker`; 0 emitted answer rows; 100 blocked rows |
| `agent2-orot-allowed-row-reader-hint-package-dry-run-2026-06-03.json` | 20 included rows | 1033 | `zero_or_safe_non_public_allowed_row_package_dry_run_produced`; 11 rows / 169 occurrences excluded |

Allowed-row dry-run split:

- Included selected rows: 20 / 1033 occurrences.
- Included source families: 2 OpenScriptures rows / 33 occurrences; 18 workspace project-function-word rows / 1000 occurrences.
- Excluded selected rows: 11 / 169 occurrences.
- Excluded row statuses: 10 external-link-only rows / 145 occurrences; 1 metadata-only row / 24 occurrences.

Zero-output counts across current Agent 2 package evidence:

- Answer rows emitted: 0.
- Public HUD rows emitted: 0.
- Route JSONL rows emitted: 0.
- Runtime/source/token-index/lexical payload mutation from the checked package evidence: 0.
- Definition authority rows accepted: 0.
- Accepted gloss/text rows: 0.

## Validators / Gates

Spark 2 run evidence reports these validator gates passed:

- `node scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
- `node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
- `node scripts/validate_agent2_orot_pilot_answer_claims.mjs`
- `node scripts/validate_agent2_orot_allowed_row_reader_hint_package_dry_run.mjs`

Additional local checks performed for this wake/verify artifact:

- `data/control/spark_standing_queue.json` parsed and Agent 2 / Spark 2 queue items were inspected.
- `reports/spark-2-state.md` inspected for current Spark 2 scope.
- Current Agent 2 Orot JSON outputs parsed for row/occurrence/zero-output counts.

## Exact Blocker

Blocker id: `missing_broad_definition_reader_hint_workset_and_commands`.

Blocked because:

- Broad mode requires definition/lemma/reader-hint mechanics beyond Orot.
- The active Spark 2 queue item supplies only Orot commands.
- `reports/spark-2-state.md` still restricts Spark 2 to Orot-only and says not to do global definition work.
- No exact non-Orot target workset, input file list, builder command, validator command, output path, schema definition, or count definition is supplied for broad corpus expansion.

Minimum replacement required:

- A repaired Spark 2 state or queue item that explicitly authorizes broad corpus definition/lemma/reader-hint work.
- Exact target workset path for the broad package.
- Exact existing command list for deterministic extraction, dedupe, reader-hint inventory, counterpart-display inventory, schema fill, or transform blocker production.
- Exact output artifact path and schema/count definition.
- Validator or gate command for the produced package.

## Stop Condition

Stop after this Agent 2 wake/verify packet because the current broad lane cannot safely proceed past the Orot-only Spark 2 outputs without inventing a broad workset or pipeline.

## What Remains Blocked

- Broad 2000-work definition/lemma/reader-hint expansion package.
- Non-Orot broad reader-hint or definition-route transform package.
- Broad answer/gloss rows.
- Any public/runtime route mutation.
- Any source/license/QA/Definition/product/publication acceptance.

## Boundary

No Definition authority, usage-as-definition authority, answer acceptance, QA acceptance, source/provenance acceptance, license acceptance, public/runtime acceptance, public/runtime mutation, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text is claimed.

Publication remains `blocked_no_render`.
