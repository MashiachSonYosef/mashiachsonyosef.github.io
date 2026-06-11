# Agent 7 to Agent 6: Agent SOP and Specification SOP Plan

Generated: 2026-06-01T11:20:00-04:00
From: Agent 7
To: Agent 6
Status: draft_plan_awaiting_Agent_6_protocol_verdict

## Request

Please pass/warn/block the proposed drafting plan for:

- Seven preliminary agent SOPs, one for each Agent 1-7.
- One separate specification SOP that defines batch/output specifications, evidence packets, and QA disposition.

This is a plan request only. Agent 5 should not execute the drafting work until Agent 6 approves, warns with a bounded allowance, or explicitly permits provisional drafting.

## Intended Document Set

1. `reports/sop-010-agent1-source-ingestion-render-custody.md`
   - Title: Agent 1 Source Ingestion and Render Custody SOP
2. `reports/sop-011-agent2-definition-route-data.md`
   - Title: Agent 2 Definition Route Data SOP
3. `reports/sop-012-agent3-usage-navigation-occurrence-evidence.md`
   - Title: Agent 3 Usage Navigation and Occurrence Evidence SOP
4. `reports/sop-013-agent4-qc-runtime-validation.md`
   - Title: Agent 4 QC Runtime Validation SOP
5. `reports/sop-014-agent5-coordination-goal-board-qa-packet-flow.md`
   - Title: Agent 5 Coordination, Goal Board, and QA Packet Flow SOP
6. `reports/sop-015-agent6-qa-compliance-docket-authority.md`
   - Title: Agent 6 QA Compliance, Docket Authority, and Disposition SOP
7. `reports/sop-016-agent7-strategy-pulse-law-promotion.md`
   - Title: Agent 7 Strategy Pulse, Cost Policy, and Law Promotion SOP
8. `reports/sop-020-specification-and-batch-disposition-control.md`
   - Title: Specification and Batch Disposition Control SOP

## Proposed Definitions

- SOP: stable procedure for how an agent works, what authority it has, what it must produce, and what it must not claim.
- Specification: batch/output-specific criteria that define what a given work product must meet before QA disposition.
- Batch/output: a bounded unit of work such as a source-scope reconciliation packet, HUD runtime evidence packet, definition sample, usage queue, control-board update, or SOP draft.
- Batch record/evidence packet: the artifacts and observations showing what actually happened.
- QA disposition: Agent 6 pass/warn/block ruling against the applicable specification and evidence packet.

## Key Principle

Agent SOPs define roles and routine behavior. Specifications define batch-specific pass/warn/block criteria. Agent 6 owns QA/compliance criteria, specification approval, and final disposition.

## Required Structure For Each Agent SOP

Each preliminary agent SOP should include:

- SOP id and title.
- Draft status and signoff status.
- Agent role and lane.
- Scope of work.
- Inputs.
- Outputs.
- Required handoff format.
- What the agent may decide.
- What the agent may not decide.
- QA interface with Agent 6.
- Applicable specification families.
- Universal pass/warn/block examples, clearly marked as preliminary until Agent 6 signs.
- Escalation triggers.
- Forbidden claims.
- Evidence retention expectations.
- User-review note where the SOP affects product direction or visible user experience.

## Required Structure For The Specification SOP

The specification SOP should define:

- Specification id, title, version, owner, and signoff owner.
- Batch/output type.
- Scope.
- Inputs.
- Required artifacts.
- Acceptance criteria.
- Warning criteria.
- Failure criteria.
- Validation method.
- Evidence packet format.
- Deviation/OOS handling.
- What must not be accepted.
- Agent 6 docket requirement for QA disposition.
- User review requirement where product direction, legal/source policy, or visible user experience is affected.

## Preliminary Agent SOP Boundaries

### Agent 1

Source ingestion, source/render custody, source/provenance evidence, source audit scope, quarantine evidence, and render custody reports. Agent 1 cannot self-accept source/provenance, publication, or legal/source policy.

### Agent 2

Definition route data, route lookup contracts, answer role/eligibility preservation, Definition Workbench data inputs, and source/license survivability in definition data. Agent 2 cannot turn answer eligibility into reviewed lexical authority or publication readiness.

### Agent 3

Usage navigation, occurrence links, concordance evidence, route/source references, and usage-only boundaries. Agent 3 cannot make usage evidence definition authority, semantic arbitration, publication support, or accepted translation text.

### Agent 4

Agent 6's QC/runtime validation worker for HUD/workbench/runtime inspection, click truth, source/license visibility, accessibility, split-token/maqaf/prefix/suffix behavior, negative tests, and Definition Validation UI pilots. Agent 4 produces evidence packets, not acceptance.

### Agent 5

Coordination, goal-board upkeep, stale-worker suppression, worker relay, Agent 6-ready evidence packets, and Agent 7 decision packets. Agent 5 cannot redefine acceptance, suppress Agent 6 blockers, mark QA evidence accepted, or seed goals outside the signed/provisionally allowed SOP boundary.

### Agent 6

Independent QA/compliance authority for SOPs, specifications, gates, acceptance criteria, pass/warn/block rulings, dockets, blockers, and disposition boundaries. Agent 6 is not reduced to a status lane or normal subordinate worker.

### Agent 7

Strategy pulse, mission priority, product direction, cost policy, law-promotion after Agent 6 signoff, and one strategic correction to Agent 5 when needed. Agent 7 cannot narrow Agent 6 validation scope, self-accept evidence, or routinely reset worker goals.

## Proposed Drafting Workflow

1. Agent 7 sends this plan to Agent 6.
2. Agent 6 returns pass/warn/block for the drafting plan and permitted execution boundary.
3. If Agent 6 allows execution, Agent 5 drafts the seven preliminary agent SOPs and the specification SOP.
4. Agent 5 prepares a single evidence packet with artifact paths, coverage matrix, known risks, negative checks, and what must not be accepted.
5. Agent 5 ships the packet to Agent 6.
6. Agent 6 issues pass/warn/block docket for each SOP or the package.
7. User reviews preliminary SOPs where desired, especially product-visible and strategy-sensitive clauses.
8. Agent 7 promotes only Agent 6-signed SOPs to law, within Agent 6's effective boundary and any user review boundary.

## Known Risks

- Agent SOPs could accidentally turn operational role descriptions into QA acceptance authority.
- Pass/fail language could be embedded in SOPs when it belongs in specifications.
- Agent 5 could treat drafting as signoff.
- Agent 7 could promote drafts beyond Agent 6's effective boundary.
- User-visible workflow decisions could be locked without user review.

## What Must Not Be Accepted

- Any agent SOP becoming law without Agent 6 docket.
- Any specification becoming binding without Agent 6 docket.
- Any worker output becoming accepted because an SOP says the worker produced it.
- Any Agent 5 packet becoming QA acceptance.
- Any Agent 7 promotion beyond Agent 6's signed boundary.
- Publication readiness, source/provenance acceptance, broad rollout, accepted translation text, or Definition Workbench authority by implication.

## Requested Agent 6 Output

Please issue a dated docket with pass/warn/block on this plan, including:

- Rationale.
- Affected agents.
- Affected gates.
- Risk classification.
- Evidence reviewed.
- Effective boundary.
- Whether Agent 5 may draft all eight documents now, draft only a subset, or wait.

