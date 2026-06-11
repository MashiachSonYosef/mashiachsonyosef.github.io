# SOP-029: Full-Stack Agent Role Pipeline Map

Status: draft executable pipeline map.
Generated: 2026-06-06.
Owner intent: make every active role explicit as a pipeline function so the project runs on the new pipeline contract, not the failed old live-site process or ad hoc chat handoffs.

Boundary: role-to-pipeline routing and execution map only. This SOP does not create source/license/legal acceptance, Definition authority, accepted gloss/text, public/runtime acceptance, publication readiness, release approval, or repo-cleanup approval.

## Core Rule

Agent names are not excuses to stop. They are pipeline functions.

When one runner is assigned full-stack execution, that runner performs the needed functions in this map directly or stops with the exact missing-capability blocker.

When later agents inherit the work, they run the same functions and gates. They do not rediscover the process, spawn replacement roles, or send rough drafts to the owner for visual checking.

## Active Pipeline Documents

| pipeline | file | purpose |
|---|---|---|
| A07 final gate | `reports/sop-025-a07-final-qa-approval-routing-pipeline-2026-06-06.md` | final QA, SOP approval, final validation, release-gate approval |
| A06 repo cleaning | `reports/sop-026-a06-repo-cleaning-production-pipeline-2026-06-06.md` | dirty-tree classification, validators, cleanup evidence packets |
| Hebrew Workbench site | `reports/sop-027-hebrew-workbench-site-pipelines-2026-06-06.md` | render, splash, corpus organization, book page, HUD popup, percent matcher, gloss layer, publisher |
| Dirty-word search and selection | `reports/sop-028-dirty-word-validation-search-and-a07-selection.md` | target-word inventory, Agent 3-style evidence search, A07 row gate, selection/render validation |

## Role Pipelines

| agent | pipeline function | trigger | action | output artifact | success condition | timeout | fallback | owner |
|---|---|---|---|---|---|---|---|---|
| A01 | source and corpus intake | new work, missing source units, corpus placement question, or page render blocked by missing source data | verify source file, lexical manifest, token index, occurrence roster, corpus bucket, and stable public path | A01 source/corpus intake section or packet | source paths and corpus placement are explicit; no render starts with missing roster | 20 minutes per work | `A01_BLOCKED_MISSING_SOURCE_OR_CORPUS_PATH` with exact missing file | A01 function |
| A03 | dirty-word evidence search | `TBD`, lemma-default mistake, wrong pre-HUD card, missing HUD route, changed/flagged row, or owner target word | run SOP-028 inventory, normalize keys, search existing Agent 3-style occurrence/crossmatch/concordance/route evidence, classify candidates | dirty-word search matrix | every target row has `preHUD_selectable`, `HUD_evidence_only`, `lemma_only`, `license_blocked`, `ambiguous`, or `no_hit` | 30 minutes per bounded batch | row remains `TBD_NO_VALID_MATCH` or exact blocker | A03 function |
| A04 | runtime and HUD validation | render candidate exists or final proof is requested | open page, click target Hebrew tokens, verify HUD behavior, source/license visibility, row count, wrapping, and no cutoff | A04 runtime proof section with URL/screenshot/checks | page proves exact changed behavior without owner inspection | 20 minutes per page | `A04_BLOCKED_RUNTIME_PROOF_FAILED` with failing selector/URL | A04 function |
| A05 | production churn runner | pipeline is proven and a bounded batch is ready | run approved commands exactly, one work/batch at a time, collect outputs, keep queue moving, do not approve | A05 run log and batch receipt | command path is reproducible and next batch/blocker is known | 30 minutes per batch | stop on first validator failure and route exact blocker to A06/A07 gate | A05 function |
| A06 | repo-cleaning and validator evidence | dirty repo blocks render/publish/selection, or changed files need classification | run SOP-026 path-scoped dirt intake, classify files, risk score, validators, rollback notes | A06 evidence-ready cleanup packet | every dirty path in scope has class, risk, proposed action, validator result, rollback | 30 minutes per cleanup batch | unknown paths become `unknown_do_not_touch`; no approval claimed | A06 function |
| A07 | final approval gate | selection packet, cleanup packet, SOP change, final validation, or publish/release gate is ready | run SOP-025/SOP-028 gate criteria inside the pipeline and issue row/file/action disposition | A07 gate verdict section | each exact row/file/action is `A07_APPROVED`, `A07_APPROVED_WITH_WARNINGS`, or `A07_BLOCKED` | 30 minutes per packet | block exact row/file/action; do not defer to a chat | A07 gate function |
| A08 | coordination and batch alignment | multiple agents/works need same pipeline, similar-work batching, or pressure route is needed | assign the next bounded workset, align agents to the same SOPs, record blockers, prevent architecture drift | A08 coordination packet | every active batch has owner, command path, timeout, blocker route, and stop condition | 15 minutes per coordination pulse | stop at exact route/blocker; no communication architecture project | A08 function |
| A09 | restore and continuity switchboard | agent stalls, endpoint breaks, identity/route confusion, or pipeline cannot reach a required function | verify identity, endpoint, goal state, queue state, and restore path; turn lanes on/off using existing identities only | A09 restore/continuity receipt | existing agent/function is reachable or exact unreachable blocker is recorded | 10 minutes per endpoint/function | `UNREACHABLE_DO_NOT_SPAWN`; route to owner/A07/A08 with exact bridge | A09 function |
| A10 | render/package pipeline architect | new work needs the proven render/HUD/publisher pipeline, or old live-site path failed | define and maintain the executable render/package commands, shared HUD baseline, validator chain, and publish artifact contract | A10 pipeline package | A05 can churn it and A04/A07 can validate it without redesign | 45 minutes per pipeline revision | `A10_BLOCKED_PIPELINE_GAP` with exact missing command/data | A10 function |
| A12 | limiter and waste check | broad scan, repeated proof loop, unclear scope, or pipeline starts drifting from owner intent | label waste/risk before execution, shrink scope to changed/flagged rows, preserve boundaries, forbid rough-draft churn | A12 limiter note or inline gate label | command scope is bounded and no shortcut/overreach is active | 10 minutes | advisory label only; cannot approve or block as final authority | A12 function |

## Full-Stack Work Order

Use this order for Daniel or any future workbench page:

| step | function | required output before next step |
|---|---|---|
| 1 | A12 scope check | bounded work id and changed/flagged target scope |
| 2 | A01 source/corpus intake | source, token index, occurrences, corpus path verified |
| 3 | A10 pipeline package | exact render/HUD/publisher command path defined |
| 4 | A03 dirty-word search | classified candidate matrix for target rows |
| 5 | A06 evidence check | dirty paths and validators classified when repo dirt affects target rows |
| 6 | A07 row gate | exact changed rows approved, warning-approved, or blocked |
| 7 | A05 production run | approved command path executed for the bounded work/batch |
| 8 | A04 runtime proof | page and HUD behavior verified without owner rough-draft inspection |
| 9 | A07 final gate | final row/render/publish decision recorded |
| 10 | A08 coordination pulse | next bounded workset or exact blocker assigned |
| 11 | A09 restore watch | stalled/broken functions restored using existing identities only |

## Non-Negotiable Invariants

| invariant | enforcement |
|---|---|
| no rough drafts for owner inspection | A04 proof and A07 gate must run before owner-facing success claims |
| no external A07 punt | A07 gate is executable inside the pipeline |
| no lemma pre-HUD selection | SOP-028 `lemma_only` rows stay `TBD` |
| no whole-corpus redo by default | only changed/flagged rows run unless owner/A07 orders whole-work audit |
| no old live-site dependency | current page validity is proven by the new pipeline outputs, not by old live deployment state |
| no new agents as workaround | A09 restores existing identities/functions or records `UNREACHABLE_DO_NOT_SPAWN` |
| no A06 approval | A06 produces evidence; A07 gate approves |
| A10 no churn | A10 owns the reusable package; A05 runs repeated batches after the package is proven |
| A08 no architecture project | A08 coordinates bounded worksets and blockers only |
| A12 no veto authority | A12 limits waste and flags risk; final disposition stays with the relevant gate |

## Required Packet Fields

Every pipeline packet produced under this map must include:

```text
agent_function
work_id
target_scope
input_artifacts
commands_run
validator_results
dirty_tree_scope
changed_files
row_scope
decision_or_blocker
rollback_path
timeout
fallback
stop_condition
```

## Failure Response

When a role/function fails:

```text
do not spawn a new agent
do not rewrite the pipeline from scratch
do not ask the owner to inspect a rough draft
record exact function, exact blocker, exact artifact, and next safe action
continue only from the failed function's fallback
```

## Adoption Rule

This map becomes the explicit role contract for the new workbench pipelines once owner/A07 gate accepts it. Until then it is a draft pipeline map and must not be treated as release, publication, source/license, Definition, or accepted-text approval.
