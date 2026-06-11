# Agent 7 Input For Agent 5 SOP-017 Revision

Generated: 2026-06-02T05:45:00Z

## Purpose

Agent 5 is preparing a SOP-017 revision. This packet is Agent 7 strategy/cost input for that revision. It is not a replacement SOP, not Agent 6 acceptance, and not a law-promotion docket.

The revision should make SOP-017 operationally useful at large scope without weakening Agent 6's signed WARN boundary.

## Non-Negotiable Boundary

Preserve the Agent 6 verdict exactly:

- Docket: `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- Lifecycle state: `SOP_warn_accepted_by_Agent_6`
- Signed boundary state: `Agent_6_signed_boundary`
- Published state: `Agent_7_published_Agent_6_signed_boundary`
- Publication remains `blocked_no_render`

SOP-017 remains emergency cost/scope-control workflow governance only. Agent 12 must not become QA authority, product acceptance authority, source/provenance custody authority, public/runtime acceptance authority, publication authority, route publication authority, Definition authority, or accepted-text authority.

## Agent 7 Strategic Direction

The current SOP is correct but too flat for big-scope work. Agent 5 should revise it into an operating system with modes, intake classes, label semantics, escalation routing, and examples. The revision should make it obvious how Agent 12 limits work without blocking mission-critical progress.

Core principle:

> Agent 12 should save tokens by forcing precise work, not by hiding risk.

## Recommended Structure For Revised SOP-017

### 1. Operating Modes

Add explicit modes so Agent 12 behavior changes with scarcity level:

- `NORMAL_DISCIPLINE`: no emergency scarcity, but broad scans and vague tasks still require scoped intake.
- `SCARCITY_WATCH`: rate-limit or cost pressure suspected; non-trivial work needs capped intake.
- `SCARCITY_ACTIVE`: rate-limit or budget pressure active; default answer to broad work is shrink or reject.
- `EMERGENCY_HARD_CAP`: severe scarcity; only P0 blockers, owner-route decisions, Agent 6-required work, and exact user requests proceed.

Each mode should define:

- allowed work,
- default caps,
- allowed overrides,
- required artifact,
- stop condition,
- who can raise or lower the mode.

Agent 7 should be able to raise/lower strategy mode. Agent 6 can override mode limits for QA/compliance evidence needs.

### 2. Work Classes

Add work classes so Agent 12 is not making ad hoc calls:

- `P0_BLOCKER`: live public/runtime exposure, source/provenance custody blocker, owner-route blocker, destructive-risk prevention, Agent 6 blocker.
- `QA_REQUIRED`: Agent 6 requested or AGENT6_REQUIRED.
- `OWNER_DECISION`: needs user route/product/legal/destructive decision.
- `CONTROL_DRIFT`: validator/control-state mismatch.
- `EVIDENCE_PACKET`: bounded artifact creation for Agent 6 or Agent 5.
- `WORKER_ROUTING`: Agent 5 prompt to Agents 1-4.
- `PRESSURE_PROMPT`: Agent 8 pressure note.
- `PROOF_LOOP`: repeated live/static verification of already-known state.
- `STATUS_ONLY`: concise state report without investigation.

Each class should list default label choices and caps.

### 3. Capped Intake Schema

Keep the current intake packet, but add enough fields to prevent ambiguity:

- Objective.
- Work class.
- Scarcity mode.
- Triggering evidence.
- Allowed paths.
- Forbidden paths.
- Maximum files to inspect.
- Maximum edits.
- Maximum commands.
- Maximum runtime or timeout.
- Maximum agents or worker prompts.
- Reused evidence.
- New hypothesis if repeated.
- Expected artifact.
- Stop condition.
- Escalation target if blocked.
- Acceptance boundary.
- What must not be accepted.

Agent 12 should reject or shrink any non-trivial work missing these fields.

### 4. Label Semantics

Define each label as an action, not just a status:

- `APPROVED_CAPPED`: proceed only under stated caps; output must cite the cap.
- `SHRUNK`: original request is too broad; supplied cheaper task replaces it unless Agent 7 overrides.
- `REJECTED_WASTE`: task is repetitive, vague, or low-value; must state the evidence reused and why no new hypothesis exists.
- `STATUS_ONLY`: produce concise status only; no new file scan or investigation.
- `NEW_HYPOTHESIS_REQUIRED`: prior evidence already answered the question; continue only if changed state or new theory is named.
- `AGENT7_DECISION_REQUIRED`: cost, priority, owner-route, product direction, or mission tradeoff needs Agent 7 or user.
- `AGENT6_REQUIRED`: QA/compliance acceptance, blocker disposition, gate language, or Agent 6 evidence-scope question must route to Agent 6.

Critical rule:

`AGENT6_REQUIRED` is not optional. It cannot be converted into `REJECTED_WASTE`, `STATUS_ONLY`, delay, or silence.

### 5. Proof-Loop Control

Add a dedicated proof-loop rule. Agent 12 should reject repeated proof unless at least one is true:

- live URL changed,
- deployment state changed,
- dependency status changed,
- owner route changed,
- Agent 6 requested recheck,
- new hypothesis names a plausible different failure mode,
- the proof is needed for a post-remediation packet.

Apply this directly to current public-runtime lanes:

- Deuteronomy P0: no more no-drift proof loops; owner route is required.
- `/hud-preview`: repo/raw quarantine is not live clearance; only post-remediation live proof or exact Pages/deployment blocker matters.
- Genesis broader drift: keep separate from Deuteronomy P0; do not use it to widen the swap.

### 6. Agent 5 / Agent 8 Routing Rules

Agent 12 should cap Agent 5 and Agent 8 before worker spend:

- Agent 5 worker prompts must include capped intake fields.
- Agent 8 pressure prompts must include a concrete measurable output and cannot recommend broad exploration by default.
- Active workers stay uninterrupted unless Agent 6/user/Agent 7 escalation, safety/compliance risk, destructive risk, public-surface exposure, or source/provenance emergency applies.
- Prepared prompt without delivery proof is not a seeded goal.

Agent 12 should not be allowed to boss Agents 1-4 directly. It limits proposed work before routing, through Agent 5/Agent 7.

### 7. Agent 6 Protection Clause

Make the Agent 6 override rule prominent:

Agent 12 may propose cheaper QA intake framing, targeted samples, or regression checks for packet preparation, but Agent 6 may expand, reject, or redefine validation scope before any QA/compliance verdict. Agent 12 limiter approval is never Agent 6 acceptance and never limits Agent 6 authority.

Add explicit forbidden conversions:

- `AGENT6_REQUIRED` to `REJECTED_WASTE`
- `AGENT6_REQUIRED` to `STATUS_ONLY`
- `AGENT6_REQUIRED` to silence
- Agent 6 blocker to cost deferral
- sample evidence to broad acceptance

### 8. Owner-Route And Deployment Scarcity

The revision should explicitly account for the current deployment shape:

- Dirty divergent `main` makes broad deploy/reconcile work high-cost and high-risk.
- GitHub Pages full-site deployment is suspect while the public-ish artifact is above documented Pages size limits and Pages build state is stale/stuck.
- Selected-artifact deployment for bounded Deuteronomy P0 is the recommended immediate low-cost route unless owner chooses otherwise.

Agent 12 should classify full-site deployment exploration as `AGENT7_DECISION_REQUIRED` or `OWNER_DECISION` unless the intake is selected-artifact and bounded.

### 9. Stop Conditions

Add universal stop conditions:

- first concrete artifact produced,
- first exact blocker identified,
- first owner/Agent 7/Agent 6 decision required,
- cap reached,
- proposed work would widen acceptance,
- proposed work would interrupt active workers without escalation condition,
- proposed work would repeat known proof without new hypothesis.

### 10. Output Requirements

Every Agent 12 decision should be short and machine-readable enough for Agent 5:

```text
Decision:
Mode:
Work class:
Approved cap:
Reason:
Reuse evidence:
Allowed next action:
Forbidden next action:
Escalation target:
Boundary:
```

Agent 12 should avoid long essays. If a longer explanation is needed, it should be one bounded artifact, not a chat spiral.

## Recommended Revision Additions

Agent 5 should add these sections to SOP-017:

- Scarcity modes.
- Work classes.
- Expanded capped-intake schema.
- Decision-label semantics table.
- Proof-loop control.
- Agent 5/Agent 8 routing examples.
- Agent 6 protection clause.
- Owner-route/deployment-scarcity clause.
- Stop-condition table.
- Example decisions.

## Example Decisions For SOP-017

### Deuteronomy Proof Loop

```text
Decision: NEW_HYPOTHESIS_REQUIRED
Mode: SCARCITY_ACTIVE
Work class: PROOF_LOOP
Reason: Agent 6 already preserved live Deuteronomy blocker and owner route is required.
Allowed next action: owner route selection or selected-artifact deploy/swap packet.
Forbidden next action: another no-drift live probe without changed deployment state.
Boundary: no public/runtime clearance.
```

### Agent 8 Broad Pressure

```text
Decision: SHRUNK
Mode: SCARCITY_WATCH
Work class: PRESSURE_PROMPT
Reason: pressure prompt lacks capped intake and measurable output.
Allowed next action: one Agent 5 note naming one stale lane, one artifact, and stop condition.
Forbidden next action: multi-agent fanout or generic status pings.
Boundary: no QA acceptance or worker interruption.
```

### Agent 6 Boundary Question

```text
Decision: AGENT6_REQUIRED
Mode: SCARCITY_ACTIVE
Work class: QA_REQUIRED
Reason: request asks whether sample evidence can satisfy a gate.
Allowed next action: queue Agent 6 packet with evidence and non-acceptance boundary.
Forbidden next action: label sample as broad acceptance or reject as waste.
Boundary: Agent 6 owns gate disposition.
```

### Source/Provenance Work

```text
Decision: APPROVED_CAPPED
Mode: SCARCITY_ACTIVE
Work class: EVIDENCE_PACKET
Reason: Agent 6 has a source custody closure packet pending; work is limited to one disposition table repair.
Approved cap: 5 files inspected, 1 report artifact, no staging/tracking/deleting.
Boundary: source/provenance custody remains blocked until Agent 6 dockets disposition.
```

## Agent 7 Recommended Edits To Existing SOP Text

Agent 5 should revise these current lines:

1. Replace "Agent 12 may reduce QA requests" with the Agent 6-signed protection language.
2. Replace "Default Caps" with mode-aware caps so emergency mode is stricter than normal discipline.
3. Expand "Decision Labels" into a table with required output fields and forbidden conversions.
4. Add "Proof-Loop Control" because this is the current highest-value limiter behavior.
5. Add examples so Agent 5 and Agent 8 can apply the SOP without asking Agent 7 every time.

## Boundary

This packet is Agent 7 strategy/cost input for Agent 5's revision. It does not revise SOP-017 by itself, does not create a new Agent 6 verdict, does not widen SOP-017 beyond WARN-accepted cost/scope-control workflow governance, and does not create QA acceptance, product/data acceptance, source/provenance acceptance, public/runtime acceptance, publication readiness, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.
