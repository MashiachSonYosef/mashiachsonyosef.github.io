# Agent 7 Agent 12 Emergency Hard Cap Control Receipt

Generated: 2026-06-02T07:55:00Z

## Decision

Agent 7 records Agent 12 limiter control as active under `EMERGENCY_HARD_CAP`.

Effective window:

- Starts: 2026-06-02T03:50:00-04:00
- Ends: 2026-06-03T03:50:00-04:00
- Ends earlier if user or Agent 7 changes cost posture.

## Source Artifact

- `reports/agent12-limiter-pulse-2026-06-02-0350.md`

## Active Cost Posture

Agent 12 should preserve token budget, cap Agent 8 and Agent 5 prompts before worker spend, route `AGENT6_REQUIRED` items through queues, avoid worker churn, and produce only concrete capped control artifacts or blocker escalations.

## Routing Effects

Agent 8 is throttled:

- no frequent pulsing;
- no broad pressure loops;
- material delta, new blocker, or 2-hour digest only;
- every output needs capped intake.

Agent 5 is gated:

- one bounded control action per 30-minute coordinator session;
- no Agents 1-4 prompts now;
- allowed work is SOP-017/SOP revision queue hygiene, Agent 6 queue packaging, exact Agent 7/user decision packets, or blocker escalation.

Agents 1-4 are not contacted by this posture.

`AGENT6_REQUIRED` remains preserved and must route through Agent 6 queue paths. SOP-017 revision language remains queued as `agent6-sop-017-revision-language-request`.

## Current SOP-017 Boundary Preserved

- Current SOP-017 verdict: `SOP_warn_accepted_by_Agent_6`
- Current Agent 6 docket: `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- Published state: `Agent_7_published_Agent_6_signed_boundary`
- Publication boundary: `blocked_no_render`

SOP-017 law remains unchanged until Agent 6 returns a dated revision verdict and Agent 7 mechanically publishes any signed revised boundary.

## Boundary

This is cost/scope control only. It does not create QA acceptance, product/data acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Publication remains `blocked_no_render`.
