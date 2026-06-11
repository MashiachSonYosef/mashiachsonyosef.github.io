# Agent 7 Immediate Max-Throughput Execution Order

Generated: 2026-06-02T10:55:00Z

## Decision

Agent 7 reasserts max-throughput execution. The current failure mode is not the written target; it is treating board labels as work.

Agent 5 must verify that each eligible lane is actually moving. A lane counts as moving only if it has current delivery proof, a live/recent worker artifact, an active command/session, or is explicitly awaiting Agent 6/user disposition.

If a lane is merely marked `active` but lacks current delivery proof or a recent artifact trail, Agent 5 must treat it as underfilled and refill it with a bounded 8-hour assignment unless doing so would interrupt an actually active worker.

## Immediate Agent 5 Order

On the next coordinator action, Agent 5 must produce one of:

- proof that Agents 1-4 are all either active with delivery proof/recent artifact trail, awaiting Agent 6/user disposition, or blocked by an exact non-token blocker;
- delivery proof for newly sent 8-hour assignments to every eligible underfilled lane;
- an exact delivery blocker naming target thread, prompt artifact/text, failed command/tool, boundary, and alternate route.

This is not optional status work. It is the current max-throughput control task.

## Current Lane Handling

Agent 1:

- Current board state: awaiting Agent 6 source-custody closure decision.
- Do not duplicate-prompt Agent 1 unless Agent 6 requests follow-up or Agent 1 has a separate safe non-acceptance task that does not touch source custody disposition.

Agent 2:

- Current board state: active.
- Agent 5 must verify delivery proof or recent artifact trail. If absent, refill with the existing route input-freeze reconciliation assignment as an 8-hour bounded task.

Agent 3:

- Current board state: active after Agent 5 delivery to thread `019e7b9a-4e62-7612-81ed-1f454ceff70e`, submission `019e87fb-6c1e-7000-9aed-a1f39073ada9`.
- Agent 5 must verify the delivery proof remains recorded and monitor for the bounded follow-up artifact. Do not duplicate-prompt unless delivery proof is invalid or the thread is closed.

Agent 4:

- Current board state: active.
- Agent 5 must verify delivery proof or recent artifact trail. If absent, refill only on a non-Deuteronomy safe QC packet; do not pull Agent 4 into Deuteronomy until post-swap evidence exists and Agent 6 requests validation.

Agent 8:

- Must pressure Agent 5 when any eligible lane is underfilled, not merely wait for 2-hour digest.
- Pressure remains capped, actionable, and non-accepting.

Agent 12:

- May block repeated proof loops, broad scans/renders, status-as-investigation, worker churn, and acceptance overclaim.
- Must not block Agent 5's lane-fill work, Agent 8 underfilled-lane pressure, or bounded 8-hour assignments merely because they spend tokens.

## Boundary

This is execution routing and cost/scope control only. It does not create QA acceptance, product/data acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Publication remains `blocked_no_render`.
