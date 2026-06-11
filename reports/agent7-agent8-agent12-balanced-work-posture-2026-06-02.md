# Agent 7 Agent 8 / Agent 12 Balanced Work Posture

Generated: 2026-06-02T09:45:00Z

## Decision

Agent 7 changes the temporary cost posture from `EMERGENCY_HARD_CAP` to `SCARCITY_ACTIVE_BALANCED_THROUGHPUT`.

Reason: user reports lag and wants work to continue. Agent 12 should prevent waste, proof loops, and worker churn, but should not freeze bounded productive movement.

Effective window:

- Starts: 2026-06-02T05:45:00-04:00
- Ends: 2026-06-03T03:50:00-04:00 unless user or Agent 7 changes posture again.

This supersedes the hard-cap throttle recorded in `reports/agent7-agent12-emergency-hard-cap-control-receipt-2026-06-02.md` for future work. It does not change the existing SOP-017 signed boundary.

## Operating Balance

Agent 12 remains active as cost/scope limiter:

- cap broad scans, proof loops, vague status work, and unnecessary multi-agent spawning;
- require capped intake for non-trivial work;
- preserve `AGENT6_REQUIRED` routing through queues;
- reject work that lacks a new hypothesis or bounded artifact;
- do not suppress Agent 6 blockers or alter Agent 6 verdict language.

Agent 8 is rebalanced from digest-only to capped pressure:

- may send capped pressure when there is a material delta, new blocker, or concrete productive next step;
- maximum one Agent 5 pressure packet per two hours unless user, Agent 6, or Agent 7 escalates;
- each packet must include objective, target lane, capped intake, reused evidence, new hypothesis if repeated, stop condition, expected artifact, and what must not be accepted;
- no frequent pulsing, no direct Agents 1-4 routing, no acceptance claims.

Agent 5 may do bounded productive work:

- up to one control/queue/SOP action and one productive lane-routing decision per 30-minute coordinator session;
- may activate at most one idle, stale, blocked, or delivery-blocked worker lane when the prompt is an 8-hour assignment with delivery proof;
- must not prompt active workers;
- must not do broad fanout;
- must not run no-drift proof loops;
- must route `AGENT6_REQUIRED` items through queues.

Agents 1-4 are not contacted directly by Agent 7. Agent 5 may route to an idle/stale/blocked lane only under SOP-001/SOP-014 delivery-proof rules.

## Priority Guardrails

Allowed productive work should favor:

- Agent 6 queue packaging and exact-signoff requests;
- SOP-017 revision and SOP revision queue follow-through;
- source/provenance custody closure packets already awaiting Agent 6;
- bounded public-runtime owner-route/blocker packets, not repeated no-drift proof;
- natural-checkpoint worker packets that do not interrupt active workers.

Do not spend on:

- repeated live/static proof of unchanged blockers;
- broad renders;
- broad git cleanup;
- direct Agents 1-4 wakeups for status;
- publication claims;
- public/runtime clearance claims before Agent 6 dockets evidence;
- source/provenance acceptance claims before Agent 6 dockets evidence.

## Current SOP-017 Dependency

SOP-017 revision language remains queued for Agent 6 as `agent6-sop-017-revision-language-request`.

Existing SOP-017 state remains:

- Current verdict: `SOP_warn_accepted_by_Agent_6`
- Current Agent 6 docket: `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- Published state: `Agent_7_published_Agent_6_signed_boundary`
- Publication boundary: `blocked_no_render`

No SOP law mutation is authorized until Agent 6 returns a dated revision verdict and Agent 7 mechanically publishes the exact signed boundary.

## Boundary

This is cost/scope and throughput balancing only. It does not create QA acceptance, product/data acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Publication remains `blocked_no_render`.
