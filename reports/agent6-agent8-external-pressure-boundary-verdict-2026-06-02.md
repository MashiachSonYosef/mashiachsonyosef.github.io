# Agent 6 Agent 8 External Pressure Boundary Verdict

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `qa_compliance_boundary_gate` / `agent5_goal_management_gate` / `cost_scope_control_gate`
Verdict: WARN-ACCEPTED for external pressure/orchestration boundary only
Risk classification: workflow governance warning; no product/data acceptance

## Scope

This docket adjudicates the corrected Agent 8 role boundary after user clarification and Agent 7/Agent 5 control updates.

Agent 8 is outside the project-control hierarchy. Agent 8 may provide external pressure/orchestration guidance, identify pressure targets, phrase bounded prompts, surface risks, and ask Agent 7 or Agent 5 to act.

Agent 8 may not directly control workers, own worker routing, mutate SOP law, edit control state as authority, open or close project blockers, or create acceptance language.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent7-agent8-boundary-correction-2026-06-02.md`
- `reports/agent7-agent12-boundary-correction-2026-06-02.md`
- `reports/agent5-durable-goal-redo-under-agent12-and-goal-sop-2026-06-02.md`
- `reports/agent5-control-notes.md`
- `reports/agent5-pipeline-priority-handoff.md`
- `data/control/agent_goal_board.json`
- `data/control/agent6_validation_queue.json`
- `reports/agent6-agent8-agent12-reconciliation-guardrail-2026-06-02.md`
- `reports/agent6-sop-role-shape-agent8-primary-agent5-relayer-agent12-advisory-verdict-2026-06-02.md`
- `reports/agent6-deuteronomy-option-a-route-selection-verdict-2026-06-02.md`

## Validation

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 1 warning.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 warnings.

The remaining governance warning is the known workbench handoff-authority warning and does not alter this Agent 8 boundary.

## Verdict

WARN-ACCEPTED for external pressure/orchestration boundary only.

The corrected current boundary supersedes stale "primary driver" or "primary drive" language wherever that language could imply Agent 8 owns worker routing, goals, SOPs, control-state authority, blocker disposition, QA acceptance, publication acceptance, source/provenance acceptance, public/runtime acceptance, or product/data acceptance.

Permitted Agent 8 claim ceiling:

- external pressure/orchestration guidance;
- bounded pressure packet proposed to Agent 7 or Agent 5;
- highest permissible claim and what-must-not-be-accepted language supplied for another lane's action;
- request for Agent 5 to execute or record an exact blocker.

Agent 8 output is never self-accepting and never worker-delivery proof.

## Required Boundaries

Agent 8:

- pressures Agent 5 only through bounded non-acceptance packets;
- does not directly route Agents 1-4;
- does not own worker goals;
- does not mutate SOP law;
- does not edit control state as authority;
- does not open or close blockers as project authority;
- does not claim QA, source/provenance, public/runtime, product/data, route, Definition, usage-as-definition, publication, or accepted-text acceptance.

Agent 5:

- remains responsible for worker routing, delivery proof, queue mechanics, handoff artifacts, and exact blockers;
- may use Agent 8 pressure as advisory input;
- must preserve highest permissible claim and what must not be accepted;
- must not treat Agent 8 pressure as delivery proof or acceptance.

Agent 7:

- remains strategy/priority owner;
- may adopt Agent 8 pressure as strategy input;
- must not promote stale "primary driver" wording into SOP law without exact revised text and a separate Agent 6 verdict.

Agent 12:

- remains outside-project advisory limiter/checker only;
- may provide advisory labels such as `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, or `ESCALATE`;
- does not directly block execution, mutate queues, suppress `AGENT6_REQUIRED`, or narrow Agent 6 evidence scope.

## P0 Runtime Interaction

The P0 public-runtime lane remains unchanged:

- Deuteronomy stays first.
- Option A remains WARN-ACCEPTED for preparation only under `reports/agent6-deuteronomy-option-a-route-selection-verdict-2026-06-02.md`.
- Agent 5 must produce Option A execution evidence or exact blocker.
- Agent 4 must not be pulled into pre-swap proof loops.
- Agents 1-3 must not be interrupted for the Deuteronomy deployment/runtime blocker.
- `/hud-preview/` and Genesis remain separate blockers.

## What Must Not Be Accepted

- Agent 8 as QA authority
- Agent 8 as worker-routing authority
- Agent 8 as goal owner for Agents 1-4
- Agent 8 as SOP-law authority
- Agent 8 as control-state authority
- Agent 8 as blocker-disposition authority
- Agent 8 pressure as delivery proof
- Agent 8 pressure as acceptance
- Agent 12 advisory labels as acceptance or execution control
- live public/runtime acceptance
- old-HUD public use
- deployed/CDN/cache closure
- source/provenance custody
- publication readiness
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- translation output
- accepted translation text

Publication remains `blocked_no_render`.
