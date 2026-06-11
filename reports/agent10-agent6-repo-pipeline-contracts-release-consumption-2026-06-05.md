# Agent 10 Agent 6 Repo Pipeline Contracts Release Consumption - 2026-06-05

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

Posture: direct release/package decision mode. This consumes Agent 6 repo-dirt and repo-pipeline artifacts as blocker evidence only.

Inputs consumed:

- `reports/agent10-agent6-repo-pipeline-release-integration-needs-2026-06-05.md`
- `reports/agent6-repo-dirt-classification-support-2026-06-05.md/json`
- `reports/agent6-repo-cleaning-validation-queue-pipeline-contracts-2026-06-05.md/json`
- `reports/agent4-agent6-repo-dirt-classification-support-gate-proof-2026-06-05.md/json`
- `reports/agent4-agent6-repo-cleaning-validation-queue-pipeline-contracts-gate-proof-2026-06-05.md/json`

| release question | current package/boundary state | Agent 6 route needed? | Agent 5 preservation handoff | exact blocker | stop condition |
| --- | --- | --- | --- | --- | --- |
| Can Agent 6 repo-dirt classification be used as release/package truth? | Agent 6 produced a WARN-BLOCKING non-destructive repo-dirt classification docket with `17239` dirty records, including `12231` tracked deletions, `3496` untracked records, `11937` `data/public-hud` records, `2777` report records, `442` script records, and `16` `data/control` records. Agent 4 validator/prereq proof passed for the classification artifact. | No new Agent 6 route; Agent 6 already authored the classification support docket. | Preserve Agent 6 classification md/json and Agent 4 gate proof md/json. Use as blocker evidence only for public HUD package truth, provenance/recountability, control truth, runtime claims, source provenance claims, and destructive cleanup authorization. | `public_hud_package_truth_blocked`; `provenance_and_validator_recountability_blocked`; `control_truth_blocked_if_untracked_files_are_relied_on`; `runtime_public_claims_blocked`; `source_provenance_claims_blocked`; `destructive_cleanup_not_authorized` | Stop at classification-only release-owner consumption. Do not stage, delete, reset, clean, publish, or claim acceptance from repo-dirt evidence. |
| Can the Agent 6 repo-cleaning / repo-validation / queued-item contracts be churned as durable pipeline work? | Agent 6 authored three contracts but marked them contract-authored-not-implemented. Agent 4 validator/prereq proof passed for the contract artifact. The contracts are repo-cleaning classification, repo-validation, and queued-item validation. | No boundary route from contract consumption alone. | Preserve the Agent 6 contract md/json and Agent 4 gate proof md/json. Control-state publication or durable queue-state recording remains Agent 5/7 territory where required. | `durable_churn_blocked_until_proposed_scripts_or_equivalent_exact_commands_exist_and_are_validated`; `repo_cleanup_blocked_from_destructive_execution_until_file_families_are_classified_and_owner_release_lane_approval_exists`; `public_runtime_cleanup_blocked_by_11937_data_public_hud_dirty_deleted_records_until_agent10_changed_input_proof_exists`; `control_state_cleanup_blocked_by_16_untracked_data_control_files_until_agent5_agent7_publish_reject_or_mark_local_only`; `queue_item_acceptance_blocked_per_item_until_dated_agent6_verdict_exists` | Stop at contract-only release-owner consumption. Implement only through separate exact scripts/commands and validators; no cleanup or queue item acceptance is authorized. |

Implementation backlog:

- `scripts/classify_agent6_repo_dirt.mjs`
- `scripts/validate_agent6_repo_dirt_classification.mjs`
- `scripts/validate_agent6_repo_dirt_batch.mjs`
- `scripts/select_agent6_queue_item.mjs`
- `scripts/validate_agent6_queue_item_evidence.mjs`

Agent 7 approval/publication remains required for control-state activation, strategy or staffing changes, durable law/SOP publication, publication-path or release activation, and durable queue-state recording beyond Agent 6 docket artifacts.

Zero counters: public/runtime mutation `0`; route-shard writes `0`; route JSONL rows `0`; candidate-text export rows `0`; definition-content rows `0`; answer rows `0`; answer-eligible rows `0`; accepted-text rows `0`; public reader output rows `0`; repo cleanup actions `0`; staging actions `0`; deletion actions `0`; queue-state updates `0`.

Highest permissible claim: Agent 10 consumed Agent 6 repo-pipeline contracts and repo-dirt classification as release/package blocker evidence only.

What must not be accepted: QA acceptance, source/provenance acceptance, license/legal acceptance, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, candidate text export, definition-content storage, commercial export authorization, NC commercial authorization, repo cleanup authorization, staging authorization, deletion authorization, queue item acceptance, or release action.
