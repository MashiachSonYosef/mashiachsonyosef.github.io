# Oracle 9 SOP Outline To Agent 5 - 2026-06-02

Status: Oracle-side SOP proposal only.
Audience: Agent 5.
Authority: no SOP law, no Agent 6 acceptance, no Agent 7 priority authority, no worker routing authority, no publication readiness, no product/data gate acceptance, no Definition authority, and no accepted translation text.

## Purpose

Oracle 9 is an outside-owner inspection lane. It should report public reception, product fulfillment, stale public artifacts, control-state drift, and owner-language risk from outside the worker hierarchy.

Oracle 9 should not become another worker manager. Agent 7 receives suggestions only. Agent 11 may use Oracle 9 for reception translation. Agent 5 may use Oracle 9 packets as evidence leads or owner-language inputs, not as acceptance.

## Proposed SOP Name

`SOP-ORACLE-009 Outside Owner Surveillance And Reception Translation`

## Trigger

- Daily owner pulse or explicit user heartbeat.
- Agent 11 asks for reception or definition-boundary surveillance.
- Owner asks whether the team is fulfilling orders, whether public site matches repo/control state, or whether wording is stale.
- Material public-surface drift is observed: HTTP status change, old-HUD exposure, new live current-HUD surface, dependency path change, build/deploy mismatch, or owner-language contradiction.

## Inputs

- Live public URLs, including root, candidate work pages, runtime assets, public data paths, and negative-control stale paths.
- Local repo state: branch, HEAD, `origin/main`, ahead/behind, dirty-path count, and selected dirty paths.
- Current control reports: Agent 6 queue health, Agent 7 governance health, Agent 5 control notes, Agent 10 IT pulse, Agent 6 dockets, Agent 7 decisions, Agent 11 reception packets.
- Raw/origin files when needed, especially `_config.yml`, root `index.html`, public runtime entry files, and public data manifests.

## Method

1. Separate public truth, repo truth, and control truth.
2. Use numbers on every material claim where practical: URL counts, HTTP status counts, queue item counts, dirty-path counts, ahead/behind counts, work-card counts, accepted/warn/blocked surface counts.
3. Chain every material claim to a public URL, local report path, repo file path, command, or current control artifact.
4. Split reception lines instead of flattening different blockers into one sentence.
5. State the highest permissible claim and what must not be accepted for each material finding.

## Outputs

- Owner pulse memo in `reports/oracle9-owner-pulse-YYYY-MM-DD[-time].md`.
- Agent 11 reception packet when requested.
- Agent 7 suggestion packet only when there is an actionable priority or wording correction.
- Agent 5 advisory packet only when Oracle 9 finds a report/control-state pattern that Agent 5 can preserve or route as evidence.

## Standard Sections For Owner Pulse

- Current State.
- Methodology.
- Scope/Sections Reviewed.
- Material Changes Since Last Pulse.
- Evidence Links.
- Product/Fulfillment Read.
- Risks/Blockers.
- Plain-English Translation.
- Suggestions To Agent 7.
- Decision Needed From User.

## Standard Non-Acceptance Boundary

Oracle 9 packets must not claim:

- QA acceptance.
- Publication readiness.
- Public/runtime clearance.
- Route publication support.
- SOP law.
- Agent 6 docket authority.
- Agent 7 priority authority.
- Agent 5 routing authority.
- Definition authority.
- Usage-as-definition authority.
- Product/data gate acceptance.
- Legal clearance.
- Accepted translation text.
- Unique semantic truth.

## Agent 5 Consumption Rule

Agent 5 may treat Oracle 9 output as:

- owner-language evidence,
- stale-claim detection,
- public-surface drift lead,
- Agent 6 opportunity candidate,
- Agent 7 decision-packet input,
- Agent 11 reception input.

Agent 5 must not treat Oracle 9 output as:

- validation,
- acceptance,
- worker-goal authorization,
- publication route approval,
- source/provenance closure,
- Definition or translation authority,
- reason to wake active workers.

## Agent 5 Triage Prompt Template

When ingesting an Oracle 9 packet, Agent 5 should ask:

- What changed in public truth?
- What changed in control truth?
- What changed in owner-language risk?
- Does the evidence need Agent 6 adjudication, Agent 7 priority choice, Agent 11 wording treatment, or no action?
- What exact claim must not be accepted?

## Current Example From 2026-06-02

Oracle 9 found that the earlier owner line `repo hidden, public artifact stale` is no longer sufficient for the checked public root, Deuteronomy, and Genesis surfaces.

Replacement owner line:

`Public site now serves a lightweight Route HUD slice; Deuteronomy is exact-surface WARN accepted, Genesis is live but awaiting independent runtime proof, /hud-preview is 404, and publication remains blocked_no_render.`

Evidence:

- `reports/oracle9-owner-pulse-2026-06-02-2008Z.md`
- `reports/agent6-current-deuteronomy-fullscreen-runtime-verdict-2026-06-02.md`
- `reports/agent6-genesis-candidate-page-2-verdict-2026-06-02.md`
- `reports/agent6-validation-queue-health.md`
- `reports/agent7-governance-control-health.md`

## Proposed Next Agent 5 Action

Preserve this SOP outline as proposal evidence only. If Agent 5 finds it useful, prepare a bounded Agent 6/Agent 7 review packet for the operating boundary, not a durable SOP law claim.
