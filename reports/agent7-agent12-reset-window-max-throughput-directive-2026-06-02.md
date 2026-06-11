# Agent 7 Reset-Window Max Throughput Directive

Generated: 2026-06-02T10:05:00Z

## Decision

Agent 7 raises the operating posture to `RESET_WINDOW_MAX_THROUGHPUT`.

User reports limits are likely reset and current pace is too slow. Agent 7 sets throughput. Agent 12 limits waste inside that target; Agent 12 does not set the target.

This supersedes:

- `reports/agent7-agent12-emergency-hard-cap-control-receipt-2026-06-02.md`
- `reports/agent7-agent8-agent12-balanced-work-posture-2026-06-02.md`
- `reports/agent7-agent12-max-safe-throughput-record-2026-06-02.md`

## Authority Correction

Agent 12 is a limiter under Agent 7 strategy/cost authority.

Agent 12 may cap:

- repeated proof loops without new external or local state;
- broad scans without a concrete artifact;
- broad renders;
- direct worker churn;
- status-as-investigation;
- acceptance overclaim;
- active-worker interruption.

Agent 12 must not cap:

- bounded productive worker assignments just because they spend tokens;
- Agent 5 refill work needed to keep eligible worker lanes active;
- Agent 8 pressure that identifies an underfilled lane, new blocker, material delta, or concrete next step;
- `AGENT6_REQUIRED` queue routing;
- user-directed or Agent 7-directed max-throughput work unless it violates a hard blocker.

## Throughput Target

Target all eligible work lanes moving.

Agents 1-4:

- target up to four active or actively-awaiting-disposition worker lanes;
- do not prompt active workers;
- do not duplicate-prompt lanes awaiting Agent 6 unless Agent 6 requests follow-up;
- when a lane is idle, stale, blocked with a resolvable next artifact, or evidence-ready with a concrete next safe packet, Agent 5 may refill it with an 8-hour assignment and delivery proof;
- Agent 5 may refill more than one eligible lane in a 30-minute coordinator session if needed to reach max safe throughput, provided prompts are bounded and non-duplicative.

Agent 5:

- operate as active coordinator, not status-only throttle;
- keep the goal board, SOP revision queue, and Agent 6 validation queue current;
- route `AGENT6_REQUIRED` items through queues;
- maintain ready prompt packets for any eligible idle/stale lane;
- do not prompt active workers;
- do not run broad cleanup or proof loops.

Agent 6:

- remains QA/compliance signoff authority;
- queued items should keep moving by evidence packet and exact verdict request, not status polling;
- closed thread delivery blockers should use validation queue artifacts.

Agent 8:

- may pressure Agent 5 on underfilled lane, material delta, new blocker, concrete productive next step, or 2-hour digest;
- no direct Agents 1-4 routing;
- no acceptance claims;
- pressure packets must be capped and actionable.

Agent 12:

- limit only the waste classes named above;
- preserve max-throughput target;
- convert overbroad work to a smaller productive action instead of silence whenever possible;
- `AGENT6_REQUIRED` cannot become `REJECTED_WASTE`, `STATUS_ONLY`, delay, or silence.

Agent 9 / outside oracle:

- remains outside-owner context only;
- no routing authority and no acceptance authority.

## Current Lane Interpretation

Current board state shows:

- Agent 2 active.
- Agent 4 active.
- Agent 1 awaiting Agent 6 source-custody closure decision; do not duplicate-prompt unless Agent 6 requests follow-up.
- Agent 3 evidence-ready; under max throughput Agent 5 may prepare or send one bounded next-safe packet if it does not conflict with the Agent 6 WARN boundary.

This means the system should not sit at two active lanes by policy. It should push toward every eligible lane either active, queued for Agent 6 verdict, or carrying a ready next packet.

## Hard Boundaries

Do not widen into:

- QA acceptance;
- product/data acceptance;
- publication readiness;
- source/provenance acceptance;
- public/runtime acceptance;
- route publication support;
- Definition authority;
- usage-as-definition authority;
- accepted translation text.

Publication remains `blocked_no_render`.

SOP-017 revision language remains queued as `agent6-sop-017-revision-language-request`; current SOP-017 WARN boundary remains unchanged until Agent 6 returns a dated revision verdict and Agent 7 mechanically publishes the exact signed boundary.
