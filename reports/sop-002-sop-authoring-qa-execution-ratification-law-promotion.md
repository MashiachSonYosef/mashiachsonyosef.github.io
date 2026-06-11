# SOP-002: SOP Authoring, QA Execution, Ratification, and Law Promotion

SOP ID: SOP-002
Title: SOP Authoring, QA Execution, Ratification, and Law Promotion
Draft created: 2026-06-01T14:05:00-04:00
Draft owner: Agent 5
Protocol planner: Agent 7
Execution owner: Agent 5 as control/queue coordinator under Agent 6 QA authority and Agent 7 mission strategy
Required signoff owner: Agent 6
Law publication owner: Agent 7
Status: warn_accepted_by_Agent_6_docket_workflow_control_only
Effective status: active only within Agent 6's signed warned boundary mechanically published by Agent 7
Protocol verdict: `reports/agent6-sop-002-authoring-protocol-verdict-2026-06-01.md`
SOP verdict: `reports/agent6-sop-002-sop-verdict-2026-06-01.md`
Publication boundary: publication remains `blocked_no_render`

## Purpose

SOP-002 defines how new SOPs are authored, checked, sent to Agent 6 for QA verdict, and then mechanically written into law/control state by Agent 7 only inside Agent 6's signed boundary.

This SOP prevents mission plans, Agent 5 drafts, worker reports, validator output, or control-board updates from becoming active QA policy without an Agent 6 docket and an Agent 7 law-publication step.

## Scope

This SOP covers:

- SOP planning by Agent 7.
- SOP drafting and evidence packaging by Agent 5.
- QA verdicts and effective-boundary signing by Agent 6.
- Law/control-state publication by Agent 7 after Agent 6 signoff.
- Required lifecycle states for protocol verdicts and SOP verdicts.
- Required fields for SOP evidence packets and law-publication records.

This SOP does not accept publication readiness, source/provenance acceptance, Reader Workbench rollout, Definition Workbench authority, accepted translation text, or any QA-relevant product gate.

## Authority Boundaries

- Agent 6 owns QA/compliance authority, pass/warn/block rulings, effective boundaries, warning limits, blocker preservation, and SOP verdicts.
- Agent 7 owns mission strategy and law publication. Agent 7 may write SOP law/control state only after Agent 6 sends a signed boundary, and only by publishing that exact boundary.
- Agent 5 executes drafting and evidence-packaging workflow as control/queue coordinator under Agent 6 QA authority and Agent 7 mission strategy. Agent 5 is not QA authority and may not issue QA conclusions or acceptance.
- Agents 1-4 may produce evidence packets, reports, validators, or implementation changes, but their outputs are never self-accepting.

## Required Lifecycle States

Protocol-level states:

- `planned_by_Agent_7`
- `awaiting_Agent_6_protocol_verdict`
- `protocol_clean_passed_for_Agent_5_execution`
- `protocol_warn_accepted_for_limited_Agent_5_execution`
- `protocol_blocked_by_Agent_6`

SOP drafting and verdict states:

- `drafted_by_Agent_5`
- `awaiting_Agent_6_sop_verdict`
- `SOP_clean_passed_by_Agent_6`
- `SOP_warn_accepted_by_Agent_6`
- `SOP_blocked_by_Agent_6`

Law-publication states:

- `Agent_6_signed_boundary`
- `Agent_6_sent_signed_boundary_to_Agent_7`
- `Agent_7_published_Agent_6_signed_boundary`

The state `Agent_7_published_Agent_6_signed_boundary` means Agent 7 wrote the exact Agent 6 signed boundary into law/control state. It does not mean Agent 7 independently accepted, widened, narrowed, or reinterpreted the boundary.

## Verdict Handling

Protocol clean pass:

- Agent 5 may execute the SOP-writing workflow inside the clean protocol boundary.
- Agent 5 still may not mark the SOP active, accepted, or law.

Protocol warn-accepted:

- Agent 5 may execute only the limited workflow Agent 6 names.
- All warning limits must be carried into the SOP draft and evidence packet.
- Agent 5 must not treat the warning as a clean pass.

Protocol blocked:

- Agent 5 must not execute the SOP-writing workflow.
- Agent 7 must revise the protocol plan or abandon the SOP path.

SOP clean pass:

- Agent 6 writes a dated SOP verdict with docket path, verdict, evidence reviewed, effective boundary, affected agents, affected gates, and risk classification.
- Agent 6 sends the signed boundary to Agent 7 for law publication.
- Agent 7 may publish the exact Agent 6 signed boundary into law/control state.

SOP warn-accepted:

- Agent 6 writes a dated SOP verdict with docket path, verdict, warning limits, allowed effective boundary, blocked uses, evidence reviewed, affected agents, affected gates, and risk classification.
- Agent 6 sends the signed warned boundary to Agent 7 for law publication.
- Agent 7 may publish only the exact warned boundary Agent 6 signed, including all warning limits and blocked uses.
- Agent 7 must not convert the warned boundary into a clean pass.

SOP blocked:

- Agent 6 writes a dated blocker verdict.
- Agent 6 may send the blocker to Agent 7 for control-state recording.
- Agent 7 may record the blocker, but must not publish the SOP as active law.

## Required SOP Document Fields

Every SOP draft must include:

- SOP id.
- Title.
- Draft owner.
- Execution owner.
- Required signoff owner.
- Law publication owner when applicable.
- Status.
- Effective status.
- Purpose.
- Scope.
- Affected agents.
- Affected gates.
- Authority boundaries.
- Required lifecycle states.
- Required artifacts.
- Known risks.
- Negative checks.
- What must not be accepted.
- Agent 6 docket path once signed.
- Agent 6 verdict once signed.
- Effective boundary once signed.
- Warning limits or blocked uses when applicable.
- Publication boundary when relevant.

## Agent 5 Workflow

Agent 5 may:

1. Read the Agent 7 protocol plan and Agent 6 protocol verdict.
2. Draft or revise the SOP inside Agent 6's protocol boundary.
3. Check required fields against SOP-000, SOP-001, and the Agent 6 protocol verdict.
4. Prepare an Agent 6 evidence packet with exact artifact paths, change summary, affected agents, affected gates, known risks, negative checks, what must not be accepted, and effective-boundary fields.
5. Queue the SOP for Agent 6 verdict when the evidence packet is recountable.
6. Mark the SOP no further than `drafted_by_Agent_5` or `awaiting_Agent_6_sop_verdict`.

Agent 5 must not:

- Mark SOP-002 active.
- Promote SOP-002 to law.
- Issue QA conclusions.
- Redefine acceptance criteria.
- Suppress an Agent 6 blocker.
- Treat Agent 5 checks as QA acceptance.
- Update control state to imply SOP-002 is active before Agent 6 signs SOP-002 itself.
- Claim publication readiness, source/provenance acceptance, Reader Workbench broad rollout, Definition Workbench authority, accepted translation text, or any other QA-relevant acceptance.

## Agent 6 Workflow

Agent 6 may:

1. Review the SOP draft and Agent 5 evidence packet.
2. Issue a dated SOP verdict: pass, warn-accept, or block.
3. Name the effective boundary, affected agents, affected gates, risk classification, evidence reviewed, warning limits, blocked uses, and what remains unaccepted.
4. Send the signed boundary or blocker to Agent 7 for law publication or control-state recording.

Agent 6 must not be treated as a routine status lane. Agent 6 verdicts must be evidence-backed and docketed.

## Agent 7 Workflow

Agent 7 may:

1. Plan SOPs and request Agent 6 protocol review.
2. Receive Agent 6's signed SOP boundary or blocker.
3. If Agent 7 accepts the signed boundary for mission use, write the exact Agent 6 boundary into law/control state.
4. Preserve the docket path, verdict, effective boundary, warning limits, blocked uses, and unaccepted scope.

Agent 7 must not:

- Promote any SOP from plan alone.
- Promote any SOP from Agent 5 drafting alone.
- Widen Agent 6's signed boundary.
- Treat a WARN as a clean PASS.
- Omit Agent 6 docket path, verdict, effective boundary, or warning limits from law/control state.
- Convert law publication into independent QA acceptance.

## Required Artifacts

- Agent 7 protocol plan.
- Agent 6 protocol verdict.
- SOP draft.
- Agent 5 evidence packet for Agent 6.
- Agent 6 SOP verdict docket.
- Agent 6 signed boundary packet or blocker notice to Agent 7.
- Agent 7 law/control-state publication record containing the exact Agent 6 signed boundary.

## Affected Agents

- Agent 7: protocol planning and law publication.
- Agent 6: QA/compliance verdict authority and signed boundary owner.
- Agent 5: control/queue coordination, drafting, evidence packaging, and queue hygiene.
- Agents 1-4: evidence producers only when a SOP affects their lane.

## Affected Gates

- `global_qa_authority_gate`
- `durable_goal_operating_gate`
- `sop_authoring_gate`
- `publication_render_gate`
- `source_provenance_gate`
- `reader_workbench_gate`
- `definition_workbench_gate`
- `usage_navigation_gate`
- `route_release_gate`

## Known Risks

- Agent 7 could treat mission strategy as QA acceptance.
- Agent 5 could treat drafting checks as QA conclusions.
- A WARN verdict could be widened into a clean pass.
- Agent 6 blockers could be omitted from the law publication record.
- Control state could mark active law without docket path, verdict, effective boundary, warning limits, or blocked uses.
- SOP workflow could imply publication, source/provenance, Reader Workbench, Definition Workbench, route, or usage acceptance without a separate Agent 6 gate verdict.

## Negative Checks

Before Agent 6 reviews a SOP draft, Agent 5 must verify:

- The SOP status is no further than `drafted_by_Agent_5` or `awaiting_Agent_6_sop_verdict`.
- The SOP does not say Agent 5 is QA authority.
- The SOP does not use independent Agent 7 promotion as acceptance.
- The SOP distinguishes protocol clean pass, protocol warn-accepted, SOP clean pass, SOP warn-accepted, and SOP blocked.
- The SOP preserves Agent 6 docket path, verdict, effective boundary, warning limits, and blocked uses.
- The SOP does not claim publication readiness.
- The SOP does not accept source/provenance, Reader Workbench, Definition Workbench, usage navigation, route data, or accepted translation text by implication.

## What Must Not Be Accepted

- SOP-002 as active law from this draft.
- Agent 5 drafting as QA acceptance.
- Agent 7 law publication as independent QA acceptance.
- WARN as clean PASS.
- Publication readiness.
- Source/provenance acceptance.
- Reader Workbench broad rollout.
- Definition Workbench authority.
- Usage navigation as definition authority.
- Route evidence as publication support.
- Accepted translation text.

## Agent 6 Docket Path Once Signed

reports/agent6-sop-002-sop-verdict-2026-06-01.md.

## Effective Boundary Once Signed

SOP-002 is accepted only as workflow-control SOP. Agent 5 may draft and packet SOPs as control/queue coordinator. Agent 6 alone issues QA/SOP verdicts by dated docket. Agent 7 may mechanically publish only the exact Agent 6 signed boundary without widening, narrowing, or converting WARN to clean PASS. "QA Execution" means Agent 6 docketed QA verdict/disposition work only; Agent 5 drafting checks, Agent 7 law publication, validator output, worker reports, and control-board updates are not QA execution and do not create acceptance.

## Current Non-Acceptance Boundary

SOP-002 is WARN-ACCEPTED only as workflow control by Agent 6 docket. It does not create publication readiness, source/provenance acceptance, Reader Workbench broad rollout, Definition Workbench authority, route publication support, usage-as-definition authority, accepted translation text, product/data gate acceptance, or any gate acceptance outside the specific Agent 6 docketed boundary.

Publication remains `blocked_no_render`.

## WARN Publication Limits

- This SOP is WARN-ACCEPTED only, not clean PASS.
- QA Execution means Agent 6 docketed QA verdict/disposition work only.
- Agent 5 drafting checks, Agent 7 law publication, validator output, worker reports, and control-board updates are not QA execution and do not create acceptance.
- Any future SOP publication must preserve docket path, verdict, effective boundary, warning limits, blocked uses, and unaccepted scope.

## 2026-06-03 Preservation Revision

Current-action preservation is now a required drafting check for SOP revisions. Before changing an agent role, the drafter must review current action evidence and classify the revision as `PRESERVE_CURRENT_ACTION`, `CLARIFY_CURRENT_ACTION`, `NARROW_ONLY_WITH_AGENT6`, `STRATEGY_CHANGE_REQUIRES_AGENT7`, or `OWNER_ROUTE_REQUIRED`.

Justification: the current agent system is producing useful bounded behavior through Agent 8 throughput pressure, rationed Agent 5 queue/control hygiene, Agent 12 advisory cost pressure, Agent 7 exact-boundary strategy publication, and Agent 6 docket authority. SOP drafting should preserve those actions unless a dated Agent 6 docket, Agent 7 strategy decision, or owner route requires a change.

Control packet: `reports/sop-current-action-preservation-review-2026-06-03.md`
New SOP draft: `reports/sop-021-current-action-preservation-and-drift-control.md`

This revision is drafting guidance only until Agent 6 reviews SOP-021. It creates no QA acceptance, publication readiness, public/runtime acceptance, source/provenance acceptance, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.
