# SOP-021: Current Action Preservation And Drift Control

SOP ID: SOP-021
Title: Current Action Preservation, Role-Behavior Baseline, And Drift Control
Draft owner: Agent 5 drafting support
Strategy owner: Agent 7
QA/compliance owner: Agent 6
Required signoff owner: Agent 6
Law publication owner: Agent 7
Status: pipeline_pending_control_posture_proposal; durable_law_pending_Agent_6_verdict_and_Agent_7_publication
Generated: 2026-06-03T12:00:00-04:00
owner-requested pipeline-review correction: reports/owner-requested-pipeline-review-correction-2026-06-04.md
Publication boundary: publication remains `blocked_no_render`

## Current Title-Map Control Delta

Owner correction on 2026-06-05: SOP-021 should preserve current productive work and the simple agent title map without turning role naming into hierarchy, persona, or communication-architecture churn. Controlled churn is acceptable when it sets up a recallable pipeline: source-lane separation, Agent 6 boundaries, restore proof, non-destructive repo-dirt handling, and handoff continuity should be easy to restore from SOP/control memory. The problem is not overhead itself; the problem is overhead that cannot be recalled as executable pipeline state.

Agent 14 invariant correction preserved on 2026-06-05: preserve agents by preserving their operating invariants, not by preserving personality labels. The invariant is `artifact -> evidence -> blocker -> exact next owner -> stop condition`. Evidence may move forward; authority must not leak sideways. Refresh only stale-prone fields such as counts, route id, verdict path, queue status, or blocker; do not rewrite settled behavior.

Current registry title map:

| Agent | Registry title | Current lane |
| --- | --- | --- |
| Agent 1 | Agent 1 - importer | source/license/custody and Hebrew import/source-lane classification |
| Agent 2 | Agent 2 - definer | definition/lemma/reader-hint transform |
| Agent 3 | Agent 3 - crossmatch | linkage/dedupe/navigation |
| Agent 4 | Agent 4 - validation | validator/prereq/runtime |
| Agent 5 | Agent 5 - orchestrator | queue hygiene, delivery proof, packet flow |
| Agent 6 | Agent 6 - assurance | independent QA/compliance boundary |
| Agent 7 | Agent 7 - management | staffing, blockers, wake/sleep, goal coverage |
| Agent 8 | Agent 8 - conduit | throughput pressure and delivery proof |
| Agent 9 | Agent 9 - oracle | outside observation and evidence linkage |
| Agent 10 | Agent 10 - IT | release/package intake and boundary packets |
| Agent 11 | Agent 11 - reception | reader/reception language |
| Agent 12 | Agent 12 - limiter | waste cap and unblock advisory |
| Agent 13 | Agent 13 - CEO | mission/resource/priority lane |
| Agent 14 | Agent 14 - abover | override-watch / drift-shield lane |

This registry map is not by itself live-thread restore proof. Restore still requires DB-backed proof under the Restore Procedure. Oracle 9 reported on 2026-06-05 that `state_5.sqlite` and `goals_1.sqlite` integrity checks passed, Agents 1/2/3/4/10 titles were correct in `state_5.sqlite`, and Agents 1/2/3/4/10 goals were active; `send_message_to_thread` remains blocking and must not be used for fanout. New Agent 1 is restored as `019e975d-dc9f-7020-a7c8-885d083a837e` / `Agent 1 - importer`; old Agent 1 `019dc487-5973-7693-aebf-fb0a75936f50` is archived and forbidden.

## Agent 1 Replacement Rule

The old Agent 1 thread is archived and must not be used as current production capacity.

The owner-designated new Agent 1 is the active source/license/custody and Hebrew import/source-lane classification lane. Current restored live thread id: `019e975d-dc9f-7020-a7c8-885d083a837e`. If the new live thread id is not exposed in a future restore, the registry locator may establish the role but must record `missing_live_thread_id` as the exact routing blocker. Agent 7 and Agent 5 must not fall back to the archived Agent 1 thread merely because it is the last known callable id.

Oracle 9 must brief new Agent 1 through Agent 7 and Agent 5 when direct delivery is not available. The briefing must be pipeline-shaped, not philosophical:

`target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition`

Primary initial target:

`old-dictionary-excluded-row-license-lane-reaudit`

Pipeline reason: Agent 2 definition transforms depend on row/subset source-family classification. Without this gate, the system risks mixing commercial-clean rows, NC educational candidates, metadata/link-only evidence, and blocked rows. The SOP/control work should make this gate callable and recallable, so future restore does not require re-arguing the pipeline.

## Agent 6 Repo-Dirt Classification Allocation

Owner allocation on 2026-06-05: Agent 6 may work perpetually on repo-dirt cleaning/classification because Agent 6 is the lowest available worker for that support burden. Agent 6 also continues to accept queued Agent 6 items. When Agent 6 reaches validation of its own repo-dirt work, Agent 6 may validate it through the normal Agent 6 pipeline and may validate queued items in the same safe pass.

This is a workload allocation and pipeline-use clarification. It does not remove Agent 7 approval/publication/control-state responsibility.

Current intelligence-setting sequence: while Agent 6 is still set to higher intelligence, Agent 6 should design the reusable repo-cleaning pipeline, repo-validation pipeline, and queued-item validation pipeline. After those pipelines have exact contracts, commands, output shapes, validators, blockers, and Agent 7 handoff rules, Agent 6 can be moved to Spark intelligence for repetitive bounded churn over those pipelines.

Allowed Agent 6 repo-dirt work:

- classify tracked deletions as intentional replacement, accidental missing data, generated-output churn, or needs-owner review;
- classify untracked reports, scripts, data, and control files as production artifact, support evidence, generated noise, or blocked/needs review;
- identify coherent non-destructive staging batches;
- record exact blockers where repo dirt prevents validation, package truth, or release-owner decisions.
- accept queued Agent 6 items through normal dated docket flow;
- validate Agent 6's own repo-dirt classification work through a normal dated Agent 6 docket when QA/compliance relevant;
- combine repo-dirt validation and queued-item validation in one safe pass when the docket keeps boundaries separate.
- author reusable pipeline contracts before Spark-intelligence churn: repo-cleaning classification, repo-validation, and queued-item validation.

Forbidden Agent 6 repo-dirt work:

- `git add -A`;
- `git reset --hard`;
- blind deletion;
- broad cleanup without classification;
- claiming QA/source/license/legal/runtime/publication/product/answer acceptance from cleanup work;
- treating repo-dirt validation as Agent 7 approval, control publication, product acceptance, source/license acceptance, publication readiness, or destructive cleanup authorization.

Agent 7 boundary:

- Agent 7 still approves/publishes/activates any control-state, strategy, staffing, publication-path, or durable-law result that depends on Agent 6's docket.
- Agent 6 validation is necessary for QA/compliance boundaries, but it is not by itself Agent 7 publication or operational approval where Agent 7 approval is required.
- If an older control rule implies Agent 7 approval is no longer needed for Agent 6 repo-dirt outputs, treat that as drift until Agent 7 or the owner explicitly changes it.

Required output shape:

`repo scope | files classified | category counts | queued items also validated | proposed non-destructive batch | exact blocker | Agent 7 approval/publication need | handoff owner | stop condition`

Required pipeline-contract output shape before Spark-intelligence churn:

`pipeline | target scope | inputs | command/script | output artifact/schema | validator/docket rule | queued-item handling | Agent 7 handoff | blocker | stop condition`

Production reason: repo dirt is a material operational blocker when it obscures changed-input truth for Agent 4, release/package truth for Agent 10, source-lane evidence for Agent 1, or boundary packets for Agent 6. Cleaning starts with classification, not destructive action.

## Purpose

SOP-021 preserves the agents' current productive behavior as the baseline operating model. The purpose is not to rewire roles, demote useful behavior, or replace current control files. The purpose is to prevent SOP drift from undoing actions the owner wants preserved.

Pipeline SOPs are acceptable and useful when they make the execution frame callable: source-lane separation, Agent 6 boundary integrity, restore proof, exact blockers, non-destructive repo-dirt handling, and handoff continuity should be recorded so they can be recalled without re-building context. SOP work becomes drift only when it cannot be used to run, restore, or protect the pipeline, or when it claims authority the pipeline has not granted.

## Process Timeout Rule

Owner correction on 2026-06-05: the largest current failure mode is starting local processes without explicit timeout/stop behavior. No agent should allow a local command, validator, server, watcher, browser automation, repo scan, or long-running helper to wait indefinitely.

Required command rule:

- Every local process must have an explicit timeout, bounded stop condition, or documented reason it is intentionally interactive.
- Long-running watchers, dev servers, and background helpers must write a PID/session record plus stop instruction.
- If a command exceeds its timeout, the agent records `process_timeout | command | timeout | partial_output_or_artifact | next_safe_action`.
- If an exact timeout cannot be set through the tool, the prompt or artifact must name the expected maximum wait and the manual stop condition before the process starts.
- Agents must prefer bounded commands over open-ended watches for repo scans, validators, browser proofs, and queue checks.

Forbidden process pattern:

- starting an unbounded process and waiting indefinitely;
- using a missing timeout as a reason to block the company for hours;
- retrying the same hung command without changing timeout, scope, or stop condition;
- treating a still-running process as evidence, validation, or acceptance.

Suggested defaults:

- quick file/status checks: 20-60 seconds;
- large repo scans or validators: 2-10 minutes with progress output;
- browser/runtime proof: 2-5 minutes unless an exact longer docket says why;
- dev servers/watchers: background session plus explicit stop/kill instruction, never a blocking wait.

## Restore Procedure

When the owner says `restore`, restoration must be proven before any route is called restored.

Required restore proof:

- `C:\Users\owner\.codex\state_5.sqlite` has `integrity_check=ok`.
- `C:\Users\owner\.codex\goals_1.sqlite` has `integrity_check=ok`.
- Agent thread titles in `state_5.sqlite` match the canonical `Agent N - role` title map.
- Agents 1, 2, 3, 4, and 10 have `thread_goals.status=active`.
- Agents 1, 2, 3, 4, and 10 have current weekly lexicon expansion objectives, not stale wartime, Orot-only, or usage-limited goals.
- `data/control/agent_registry.json` preserves the same title map and restore behavior.

Restore is not proven by:

- clean prose;
- registry wording alone;
- `session_index.jsonl` alone;
- `list_threads` output;
- a thread title change request that has not been verified in `state_5.sqlite`;
- a thread send that blocks while the target agent is working.

If any required restore proof fails, report the exact failed surface and stop. Do not continue into broad path searching or repeated thread-tool calls.

## Thread Tool Discipline

Thread tools are not the source of truth for restore. They are live-operation tools only after restore proof is already clean.

- Do not use `list_threads` for restore unless the owner explicitly requests it.
- Do not use parallel thread sends, title changes, reads, pins, or archive operations.
- Use one thread operation at a time.
- If a thread operation stalls, report `thread_tool_timeout | tool | thread_id | intended_agent | elapsed_seconds | next_safe_action`.
- Do not retry the same stalled thread operation in a loop.
- Treat `send_message_to_thread` as potentially blocking until the target thread completes; do not use it for fanout.

## Anti-Override Rule

No agent may convert owner intent, Agent 14 review, control posture, SOP proposal text, source-lane policy, NC policy, public/runtime visibility, publication readiness, Definition authority, answer eligibility, or accepted text into active law or accepted project state without the required pipeline step.

Forbidden restore language includes any wording that says or implies:

- owner intent became active law without the pipeline;
- a correction was imposed outside Agent 6 / Agent 7 boundaries;
- Agent 14 superseded the project pipeline;
- any route skipped the required authority boundary.

Allowed restore language:

- `owner requested pipeline review`
- `pipeline_pending_control_posture_proposal`
- `Agent 6 boundary required`
- `Agent 7 publication required`
- `local restore proof`

## Owner Requested Pipeline Review Posture

The owner requested urgent pipeline review of this correction as of 2026-06-04. Current productive agent actions may be used as proposed operating evidence, but owner intent does not by itself create active SOP law, active corpus state, source-lane state, public/runtime state, publication readiness, Definition authority, answer eligibility, accepted text, NC public display, or NC commercial authorization. Any active QA/compliance boundary requires an exact Agent 6 docket, and any durable law/control publication requires Agent 7 publication of the exact Agent 6-signed boundary where applicable.

This owner-requested pipeline-review proposal is not durable SOP law publication and is not QA acceptance. Durable SOP law still requires Agent 6 verdict and Agent 7 publication of the exact signed boundary.

## Scope

This SOP covers preservation of current role actions, action-review requirements before SOP rewrites, current-behavior justifications, and drift-control rules for future SOP changes.

This SOP does not create QA acceptance, product/data acceptance, public/runtime acceptance, source/provenance acceptance, publication readiness, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

## Preservation Rule

When current agent actions and older SOP wording conflict, the revision workflow must first document the current actions and explain why the behavior should be preserved or changed. The default is preservation when:

- the current action is bounded to the agent's lane;
- the current action produces recountable evidence, delivery proof, exact blockers, or queue hygiene;
- the current action preserves Agent 6 authority;
- the current action does not claim acceptance;
- the current action improves throughput without interrupting active workers outside signed or user-authorized conditions.

Any proposed SOP rewrite that changes current agent behavior must name the affected current action, the evidence file showing that action, the reason preservation is insufficient, the risk of changing it, and the Agent 6 or Agent 7 authority needed for the change.

## Current Behavior Baseline

- Agent 6 remains independent QA/compliance authority. Only dated Agent 6 pass/warn/block dockets can create QA acceptance, change Agent 6 blocker disposition, or define accepted effective boundaries.
- Agent 7 remains strategy, execution-management, priority, cost, and mechanical law-publication owner. Agent 7 preserves exact Agent 6 signed boundaries and keeps visible public state distinct from accepted public/runtime state.
- Agent 8 remains the active throughput driver and may use signed `direct_bounded_worker_prompt_delivery` only inside its required conditions, delivery proof, no-interrupt rules, and non-acceptance boundaries.
- Agent 5 remains rationed queue/control support for Agent 6 queue hygiene, delivery-proof ingestion where applicable, exact blocker and packet preservation, handoff indexing, and major SOP drafting. Agent 5 is not restored to broad default worker-coordinator by this SOP.
- Agent 12 remains advisory budget and waste-control pressure. Agent 12 may name waste classes and propose shrinkage, but advisory labels do not veto Agent 8, close blockers, suppress Agent 6-required work, or mutate queue/control state by themselves.
- Agents 1-4 remain bounded worker lanes. Their outputs can be evidence-ready, awaiting-Agent-6, or blocked; they do not self-accept QA-relevant work.
- Agent 10 runtime/release-support dockets prepare review and evidence, but do not replace Agent 6 acceptance.
- Visible public surfaces are tracked as visibility/control facts. Visibility is not accepted runtime status unless the exact surface is covered by a dated Agent 6 docket.

## Required Action Review Before SOP Revision

Before drafting or revising any SOP that affects live agent behavior, the drafter must provide:

- target SOP and affected agents;
- current action summary;
- exact evidence files showing current action;
- preservation decision: preserve, clarify, narrow, or replace;
- justification;
- risk if the action is changed;
- non-acceptance boundary;
- Agent 6-required questions;
- Agent 7-required strategy or publication questions.

## Revision Labels

Use these labels for future SOP revisions:

- `PRESERVE_CURRENT_ACTION`: keep current behavior and clarify SOP wording around it.
- `CLARIFY_CURRENT_ACTION`: keep current behavior but remove ambiguous wording.
- `NARROW_ONLY_WITH_AGENT6`: do not narrow current behavior unless Agent 6 signs the QA/compliance boundary.
- `STRATEGY_CHANGE_REQUIRES_AGENT7`: do not change current strategy, staffing, cadence, or priority behavior without Agent 7 direction.
- `OWNER_ROUTE_REQUIRED`: owner choice is needed before changing publication, public-surface exposure, or visible product behavior.

## Justification Standard

Justifications must be concrete. Acceptable justifications include:

- current behavior produces recountable evidence or validators;
- current behavior prevents blocker loss;
- current behavior preserves delivery proof;
- current behavior reduces token waste without suppressing required QA work;
- current behavior prevents active-worker interruption;
- current behavior protects visible-vs-accepted public-surface truth;
- current behavior keeps Agent 6 authority intact.

Unacceptable justifications include:

- "clean up roles" without evidence of harm;
- "simplify governance" by removing blockers;
- "speed up" by skipping Agent 6-required review;
- "status is green" without a docket;
- "visible public page exists" as acceptance;
- "cost pressure" as blocker closure.

## Evidence Of This SOP Draft

Control/review packet: `reports/sop-current-action-preservation-review-2026-06-03.md`

Primary current-action evidence:

- `data/control/agent_registry.json`
- `data/control/agent_goal_board.json`
- `data/control/sop_revision_queue.json`
- `reports/agent6-sop-role-shape-agent8-primary-agent5-relayer-agent12-advisory-verdict-2026-06-02.md`
- `reports/agent7-agent8-primary-driver-agent12-advisory-posture-2026-06-02.md`
- `reports/agent7-visible-vs-accepted-public-surface-control-refresh-2026-06-03.md`

## What Must Not Be Accepted

- SOP-021 as active law before Agent 6 verdict and Agent 7 publication.
- Current action preservation as QA acceptance.
- Agent 8 throughput pressure as QA acceptance.
- Agent 5 queue hygiene as QA acceptance.
- Agent 12 advisory caps as blocker closure.
- Agent 7 strategy or public-surface control refresh as independent QA acceptance.
- Visible public cards as accepted runtime surface.
- Publication readiness.
- Source/provenance acceptance.
- Product/data gate acceptance.
- Accepted translation text.
