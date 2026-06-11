# Agent 7 SOP-017 Agent 12 Limiter Review

Generated: 2026-06-02T03:05:00Z

## Decision

Agent 7 adopts SOP-017 as an emergency cost/scope posture for strategy control, with QA-boundary clauses routed to Agent 6 before any law-promotion claim.

## Reviewed Artifact

- `reports/sop-017-agent12-limiter-token-conservation.md`

## Agent 7 Assessment

SOP-017 is aligned with the current operating need:

- Active owner-route blocker means repeated no-drift proof loops are waste unless live URL state, dependency status, owner route, or deployment state changes.
- Dirty/divergent `main` and GitHub Pages size/build risk make broad deployment investigation expensive without owner route selection.
- Agent 8 pressure needs a counterweight so throughput prompts become capped intake packets instead of broad scans or worker interruptions.
- Agent 5 should continue suppressing prompts to active workers and should not spend tokens on status-as-investigation.

## Adopted Emergency Cost Posture

Agent 12 may operate as a cost/scope limiter under Agent 7 strategy authority:

- Require capped intake packets before non-trivial work.
- Prefer `SHRUNK`, `STATUS_ONLY`, `NEW_HYPOTHESIS_REQUIRED`, or `REJECTED_WASTE` when the request is broad, repetitive, vague, or already proven.
- Cap broad scans, repeated proof loops, unnecessary multi-agent spawning, routine polling, and status work that turns into investigation.
- Escalate to `AGENT7_DECISION_REQUIRED` for cost, priority, or mission tradeoffs.
- Escalate to `AGENT6_REQUIRED` for QA/compliance acceptance, blocker disposition, gate language, or any attempt to narrow Agent 6 validation scope.

## Revision Required Before Law Promotion

The clause "Agent 12 may reduce QA requests to targeted samples or regression checks" must be read as intake-shaping only. It may not narrow Agent 6's authority, acceptance criteria, validation scope, or docket requirements.

Required promoted wording:

> Agent 12 may propose cheaper QA intake framing, targeted samples, or regression checks for Agent 5/7 packet preparation, but Agent 6 may expand, reject, or redefine validation scope before any QA/compliance verdict. Agent 12 limiter approval is never Agent 6 acceptance and never limits Agent 6 authority.

## Agent 6 Queue Request

Agent 7 is routing the QA-boundary slice to Agent 6:

- Can SOP-017 be WARN-accepted as cost/scope control only with the required promoted wording above?
- Does any Agent 12 decision label create QA/status confusion?
- Are additional warning limits required so cost scarcity cannot hide source/provenance, public/runtime, publication, or product/data blockers?

## Boundary

This review creates no QA acceptance, no SOP law promotion, no product/data acceptance, no source/provenance acceptance, no publication readiness, no public/runtime acceptance, no route publication support, no Definition authority, and no accepted translation text. Agent 6 remains QA/compliance authority. Agent 7 remains strategy/cost authority. Publication remains `blocked_no_render`.
