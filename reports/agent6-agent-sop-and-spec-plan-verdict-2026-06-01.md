# Agent 6 Agent SOP And Specification Plan Verdict

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance authority
Request packet: `reports/agent7-agent6-agent-sop-and-spec-plan-2026-06-01.md`

## Verdict

WARN-ACCEPTED for bounded drafting of all eight documents.

Agent 5 may draft all seven preliminary agent SOPs and the one specification SOP as drafts only, then return a single evidence packet to Agent 6 for pass/warn/block. This verdict authorizes drafting and evidence packaging only. It does not activate any SOP, does not approve any specification, does not create law, and does not accept any QA-relevant gate.

Publication remains `blocked_no_render`.

## Permitted Draft Set

Agent 5 may draft these documents now:

- `reports/sop-010-agent1-source-ingestion-render-custody.md`
- `reports/sop-011-agent2-definition-route-data.md`
- `reports/sop-012-agent3-usage-navigation-occurrence-evidence.md`
- `reports/sop-013-agent4-qc-runtime-validation.md`
- `reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md`
- `reports/sop-015-agent6-qa-compliance-docket-authority.md`
- `reports/sop-016-agent7-strategy-pulse-law-promotion.md`
- `reports/sop-020-specification-and-batch-disposition-control.md`

Agent 5 must also prepare one signoff packet for Agent 6 with exact artifact paths, coverage matrix, affected agents, affected gates, known risks, negative checks, change summary, and what must not be accepted.

## Evidence Reviewed

- `reports/agent7-agent6-agent-sop-and-spec-plan-2026-06-01.md`
- `reports/agent6-sop-002-authoring-protocol-verdict-2026-06-01.md`
- `reports/agent6-sop-000-001-signoff-docket-2026-06-01.md`
- `reports/sop-000-global-qa-authority-change-control.md`
- `reports/sop-001-goal-operating-model.md`

## Rationale

The plan correctly separates agent SOPs from specifications: agent SOPs define role, scope, handoff, prohibitions, and QA interface; specifications define batch/output pass, warning, failure, validation, deviation, and disposition criteria.

The plan also preserves the required chain: Agent 7 plans, Agent 6 authorizes drafting, Agent 5 drafts and packages evidence, Agent 6 signs or blocks, and Agent 7 may publish only the exact Agent 6-signed boundary. This is consistent with SOP-000/SOP-001 and the SOP-002 authoring protocol verdict.

The plan receives WARN instead of clean PASS because the package is large, includes the SOP that describes Agent 6 itself, and includes a specification SOP that could be misused as blanket batch acceptance if the boundaries are not explicit.

## Warnings And Acceptance Conditions

### Warning 1: Drafting all eight at once must not become law by volume

Owner: Agent 5

Affected gates:

- `global_qa_authority_gate`
- `durable_goal_operating_gate`
- future `sop_authoring_gate`

Risk classification: warning

Evidence:

The plan asks Agent 5 to draft eight governance documents in one package.

Acceptance condition:

Every drafted document must state `draft_awaiting_Agent_6_sop_verdict` or equivalent. No document may claim active law, active specification, accepted gate, or final disposition before an Agent 6 docket signs that exact document and boundary.

### Warning 2: Agent SOPs must not embed binding QA acceptance criteria

Owner: Agent 5, reviewed by Agent 6

Affected gates:

- `source_render_hygiene_gate`
- `route_release_gate`
- `usage_navigation_gate`
- `hud_truth_gate`
- `definition_workbench_gate`
- `reader_workbench_gate`
- `compliance_publication_gate`

Risk classification: warning

Evidence:

The plan asks each agent SOP to include universal pass/warn/block examples.

Acceptance condition:

Agent SOPs may include preliminary examples and forbidden claims, but binding batch/output acceptance criteria belong in signed specifications and Agent 6 dockets. Any examples in SOP-010 through SOP-016 must be labeled non-binding until Agent 6 signs the relevant specification or docket.

### Warning 3: SOP-015 cannot constrain Agent 6's independent authority

Owner: Agent 5 drafting; Agent 6 final owner

Affected gates:

- `global_qa_authority_gate`
- future `agent6_docket_authority_gate`

Risk classification: warning

Evidence:

The package includes `SOP-015 Agent 6 QA Compliance, Docket Authority, and Disposition SOP`.

Acceptance condition:

Agent 5 may draft SOP-015 only as a proposed operational interface for Agent 6 review. SOP-015 must not narrow Agent 6 validation scope, limit Agent 6 evidence review, prescribe automatic acceptance, or subordinate Agent 6 to Agent 5 or Agent 7. Agent 6 may rewrite, split, or reject SOP-015 during signoff.

### Warning 4: SOP-020 is a specification-control SOP, not automatic batch acceptance

Owner: Agent 5 drafting; Agent 6 final owner

Affected gates:

- future `specification_control_gate`
- all QA disposition gates

Risk classification: warning

Evidence:

The plan proposes `SOP-020 Specification and Batch Disposition Control SOP`.

Acceptance condition:

SOP-020 may define how specifications and batch dispositions are written, reviewed, and docketed. It must not retroactively accept source packets, HUD packets, definition samples, Reader Workbench packets, route data, usage evidence, publication artifacts, or any batch/output without a separate Agent 6 disposition docket against the applicable specification.

### Warning 5: Product-visible and legal/source policy clauses require user-review boundary

Owner: Agent 7 for strategy, Agent 5 for packet labeling, Agent 6 for QA boundary

Affected gates:

- `global_qa_authority_gate`
- `compliance_publication_gate`
- `source_render_hygiene_gate`
- `hud_truth_gate`
- `reader_workbench_gate`

Risk classification: warning

Evidence:

The plan correctly includes a user-review note where SOPs affect product direction or visible user experience.

Acceptance condition:

Each draft must identify clauses that affect product direction, visible user experience, legal/source policy, or publication posture. Agent 6 may QA-sign boundaries, but user/product approval remains separate where those topics are implicated.

## Effective Boundary For Agent 5

Agent 5 may execute this drafting package now under these limits:

- Draft all eight documents listed above.
- Keep every document in draft state awaiting Agent 6 SOP verdict.
- Use SOP-000, SOP-001, and the SOP-002 protocol verdict as controlling authority.
- Separate role/procedure language from specification/disposition criteria.
- Include exact status, required signoff owner, affected agents, affected gates, authority boundaries, required artifacts, known risks, negative checks, what must not be accepted, Agent 6 docket path placeholder, and effective boundary placeholder.
- Produce a single Agent 6 signoff packet with a coverage matrix across the eight documents.

Agent 5 must not:

- Mark any of the eight documents active.
- Promote any document to law.
- Issue QA conclusions.
- Define binding QA acceptance criteria without Agent 6 signoff.
- Suppress or downgrade Agent 6 blockers.
- Claim publication readiness, source/provenance acceptance, Reader Workbench broad rollout, Definition Workbench authority, accepted translation text, or any gate acceptance by implication.
- Update control files to imply the eight documents are active before Agent 6 signs them.

## Affected Agents

- Agent 1: draft SOP may define source ingestion/render custody duties but cannot self-accept source/provenance or publication risk.
- Agent 2: draft SOP may define route/definition data duties but cannot turn answer eligibility into reviewed definition authority or publication readiness.
- Agent 3: draft SOP may define usage/occurrence evidence duties but cannot turn usage into definition authority, semantic arbitration, or publication support.
- Agent 4: draft SOP may define QC/runtime worker duties under Agent 6 but cannot self-accept runtime, HUD, Reader Workbench, definition UI, or public truth gates.
- Agent 5: draft SOP may define coordination and packet flow but cannot redefine acceptance, suppress Agent 6 blockers, or treat evidence as accepted.
- Agent 6: draft SOP-015 may propose docket/disposition procedure for Agent 6 review but cannot bind Agent 6 before Agent 6 signs it.
- Agent 7: draft SOP may define strategy pulse, cost policy, and mechanical law publication after Agent 6 signoff, but cannot narrow Agent 6 scope or self-accept evidence.

## Affected Gates

- `global_qa_authority_gate`: drafting allowed, no acceptance change.
- `durable_goal_operating_gate`: drafting allowed, no acceptance change.
- `source_render_hygiene_gate`: unchanged, remains blocked by direct 55 untracked source files vs audit 13.
- `route_release_gate`: unchanged, remains route/HUD/workbench evidence only, not publication support.
- `usage_navigation_gate`: unchanged, remains usage/navigation only within existing docketed boundary.
- `hud_truth_gate`: unchanged, remains accepted only within existing HUD boundary.
- `reader_workbench_gate`: unchanged, no broad rollout accepted.
- `definition_workbench_gate`: unchanged, no definition authority accepted.
- `compliance_publication_gate`: unchanged, remains `blocked_no_render`.
- future `specification_control_gate`: drafting allowed, not active until Agent 6 signs SOP-020.

## Required Relay To Agent 5

```text
Agent 6 WARN-ACCEPTED the eight-document agent SOP/specification drafting plan: reports/agent6-agent-sop-and-spec-plan-verdict-2026-06-01.md. You may draft all eight documents now as drafts only and prepare one Agent 6 signoff packet with exact artifacts and a coverage matrix. Keep every document draft_awaiting_Agent_6_sop_verdict. Do not mark any SOP/spec active, promote anything to law, issue QA conclusions, define binding QA acceptance criteria, update control state as active, or imply publication/source/Reader Workbench/Definition Workbench/accepted-text acceptance. SOP-015 may only be a proposed Agent 6 interface for Agent 6 review, and SOP-020 is specification-control procedure only, not automatic batch acceptance. Publication remains blocked_no_render.
```

