# Agent 4 / Spark-4 Pipeline Contract: Changed-Package Validator/Prereq - 2026-06-04

## Lane

`Agent 4 runtime/QC/validator/prereq`

## Status

Status: `contract_authored_changed_input_only_wake`

This contract prevents Spark-4 from spending tokens on unchanged validator reruns. Spark-4 wakes only when the request supplies a changed package/input, exact command list, expected output path/schema, and stop condition. Public/runtime proof additionally requires an Agent 6 route.

## Contract Artifact

- JSON contract: `reports/agent4-spark4-pipeline-contract-changed-package-validator-prereq-2026-06-04.json`
- Markdown contract: `reports/agent4-spark4-pipeline-contract-changed-package-validator-prereq-2026-06-04.md`

## Changed Package/Input Definition

A changed package/input is a package, page set, runtime artifact, public-HUD bundle, reader-hint package, route package, or per-book baseline target whose path/hash/commit/target differs from the last Agent 4 packaged validator result.

Required fields:

- `package_owner`
- `package_path_or_url`
- `package_hash_or_commit_or_mtime`
- `target_pages_or_work_ids`
- `change_summary`
- `expected_output_path`
- `stop_condition`
- `non_acceptance_boundary`

If these fields are absent or unchanged, Spark-4 returns `changed_input_only_blocker` and does not rerun validators.

## Exact Command List

Commands must be complete executable command lines from repository root. Commands must refer to existing scripts or existing shell checks. No validator command may be inferred from package type.

Currently authorized examples from Agent 7:

- `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs`
- `node scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json`
- `node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html`
- `node scripts/validate_agent4_live_browser_runtime_evidence.mjs`
- `node scripts/audit_live_public_old_hud_guard.mjs`
- `node scripts/audit_live_deuteronomy_runtime.mjs`

If command/input/output is missing, Spark-4 returns `missing_pipeline_blocker`.

## Expected Output Schema

Required report fields:

- `lane`
- `changed_package_input`
- `commands_run`
- `validator_results`
- `marker_checks`
- `file_hash_or_package_diff_evidence`
- `runtime_prerequisites_checked`
- `issues`
- `warnings`
- `exact_blockers`
- `wake_condition`
- `stop_condition`
- `not_accepted`

Suggested path patterns:

- `reports/agent4-<scope>-validator-prereq-runtime-<YYYY-MM-DD>.md`
- `reports/agent4-<scope>-validator-prereq-runtime-<YYYY-MM-DD>.json`

## Validator Gate

- Hard old-HUD marker target: `0`
- Watch-marker policy: warn and route to Agent 10 / Agent 6 unless the command explicitly makes watch markers fatal.
- Runtime/public proof policy: blocked unless changed package plus Agent 6 route exists.
- Rerun policy: unchanged validator item is capped.

## Per-Book Baseline Harness

Purpose: baseline validator/prereq evidence for one named book target without candidate-data publication.

Required target fields:

- `work_id`
- `canonical_page`
- `expected_artifact`
- `exact_command`
- `stop_condition`

Deuteronomy exact command:

```powershell
node scripts/audit_live_deuteronomy_runtime.mjs
```

Do not rerun Deuteronomy baseline unless a changed target/request names it again.

## Ownership

- Release/package owner: Agent 10
- Queue/route owner: Agent 7 / Agent 5
- Validator lane owner: Agent 4
- Mechanical runner: Spark-4
- QA boundary owner: Agent 6

## Agent 6 Boundary Trigger

Agent 6 route is required for:

- public runtime proof
- public HUD mutation validation
- route publication support
- reader-facing answer/gloss/public output
- acceptance-sensitive source/license/Definition/product state

Agent 6 route is not required for:

- non-public package validator prerequisites
- static missing-input blocker packaging
- changed-input-only wake condition packaging

## Stop Condition

- Success: return one Agent 4 validator/prereq/runtime packet for the exact changed input.
- Missing input: return `missing_pipeline_blocker` naming missing command/input/output/package owner.
- Unchanged input: return `changed_input_only_blocker` and do not rerun validators.
- Baseline: return one per-book baseline artifact or exact command/input blocker.

## Token-Limit Minimum Handoff Contract

Target: reusable changed-package validator/prereq/runtime pipeline contract and per-book baseline harness. Deuteronomy baseline command remains exact, but capped unless a changed target/request names it.

Files:

- `reports/agent4-spark4-pipeline-contract-changed-package-validator-prereq-2026-06-04.md`
- `reports/agent4-spark4-pipeline-contract-changed-package-validator-prereq-2026-06-04.json`
- `reports/agent4-weekly-validator-prereq-pipeline-authoring-status-2026-06-04.md`

Counts/rows found:

- Validators run in this authoring step: `0`
- New contract artifacts authored: `3`
- Prior Orot non-public package: `332 rows / 6156 occurrences`
- Prior Deuteronomy baseline: `0 issues / 1 warning`
- Prior hard old-HUD marker exposure: `0`

Next command, only when the changed target/request explicitly names Deuteronomy baseline again:

```powershell
node scripts/audit_live_deuteronomy_runtime.mjs
```

Changed-input-only wake result when no exact changed package is supplied:

`changed_input_only_blocker`

Missing fields that must produce blocker instead of churn:

- changed package/input
- expected output path/schema
- validator/gate command
- Agent 6 trigger when public/runtime proof is requested
- stop condition

Handoff owner: Agent 4 owns validator/prereq pipeline authoring and packets. Spark-4 runs only mechanical validators on changed input.

## Boundary

No public/runtime acceptance, QA acceptance, source/provenance acceptance, license acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, translation output, or accepted text is claimed.

Publication remains `blocked_no_render`.
