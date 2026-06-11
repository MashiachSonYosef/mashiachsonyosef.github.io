# Agent 7 Agent 8 Primary Driver / Agent 12 Advisory Posture

Generated: 2026-06-02T11:36:00Z

## Decision

Agent 8 is the Agent 7-aligned primary prompter and external throughput driver. Agent 8 should actively drive Agent 5 and worker-lane routing decisions through capped strategy/execution packets.

Agent 5 is coordinator and executor for Agent 7/Agent 8 strategy packets. Agent 5 should not become an independent silo that leaves Agent 8 outside the drive loop.

Agent 12 is advisory counterpressure for waste. Agent 12 flags named waste classes, proposes shrinkage, and reminds Agent 8/Agent 5 of Agent 6 boundaries. Agent 12 does not suppress productive Agent 8 pressure unless it names a hard waste condition or Agent 6 boundary risk.

This supersedes softer peer-balancing language in `reports/agent7-agent8-agent12-peer-throughput-posture-2026-06-02.md` while preserving the Agent 6 guardrail in `reports/agent6-agent8-agent12-reconciliation-guardrail-2026-06-02.md`.

## Operating Roles

Agent 8 may produce:

- capped Agent 5 execution prompts;
- worker-lane refill recommendations;
- ready next-lane packet recommendations;
- Agent 6 queue-readiness pressure;
- underfilled/stale/no-proof lane alerts;
- P0 blocker drive packets;
- bounded throughput digests.

Agent 8 still does not route Agents 1-4 directly unless Agent 7 or the user explicitly changes that policy. Routine worker delivery remains through Agent 5 with delivery proof.

Agent 5 must respond to Agent 8 pressure by either executing the bounded coordinator action, preserving delivery proof, or recording an exact blocker. Status-only deferral is not enough when Agent 8 provides a bounded productive packet.

Agent 12 may cap only:

- repeated proof loops without changed state;
- broad scans or broad renders;
- active-worker interruption;
- status-as-investigation;
- acceptance overclaim;
- vague multi-agent churn without a bounded artifact;
- Agent 6 boundary risk.

When Agent 12 caps, it must name the waste class and propose the smallest productive alternative when one exists.

## Cadence

Agent 8 should pulse slightly slower than the prior overactive posture, but remain proactive:

- immediate capped pressure for P0/material state changes, new blockers, delivery blockers, owner-route decisions, or underfilled/stale/no-proof lanes;
- at most one pressure packet per target every 90 minutes while the same underfill/blocker persists;
- 3-hour digest only if it contains changed state, executable next-lane packets, or blocker evidence;
- no idle status pings.

Slower cadence is not blocker closure and cannot be cited as evidence that work is healthy.

## Tie-Break

Agent 8 drives by default when the proposed action is bounded, productive, non-acceptance, and does not interrupt an actually active worker.

Agent 12 blocks or shrinks only for a named waste class or Agent 6 boundary risk.

Agent 7 decides unresolved cost/strategy conflicts. `AGENT6_REQUIRED` always routes to Agent 6 and cannot become `STATUS_ONLY`, `REJECTED_WASTE`, delay, or silence.

## Required Agent 5 Intake Shape

When Agent 8 sends pressure, Agent 5 should receive:

- trigger and lane;
- evidence of underfill, blocker, material delta, or concrete next step;
- target worker or Agent 6 queue item;
- proposed 8-hour assignment, coordinator action, or validation request;
- delivery target/thread and delivery-proof requirement;
- Agent 12 cap or shrink, if any;
- stop condition;
- highest permissible claim;
- what must not be accepted.

## Current P0 Overlay

Agent 6 docket `reports/agent6-public-runtime-license-risk-recheck-directive-2026-06-02.md` preserves the P0 public/runtime license-provenance blocker. Agent 8 should drive Agent 5 toward owner-approved Deuteronomy deploy/swap or non-public quarantine delivery, not another local proof loop.

Deuteronomy stays first. `/hud-preview/` stays separate unless the owner route intentionally includes broader public-surface quarantine/deploy.

Agent 6 docket `reports/agent6-route-hud-rollout-watch-static-boundary-docket-2026-06-02.md` WARN-ACCEPTS the 1360-page Route HUD rollout watch only as local cached static inventory. It scanned 0 page files, reused 1360 cached page audits, and has render-authority drift because `scripts/render_site.ps1` is newer than 1249 pages. Agent 8 and Agent 5 must not use that inventory to clear live Deuteronomy, `/hud-preview/`, public/runtime, deployed/cache, or publication blockers.

## Boundary

Strategy/throughput/cost posture only. No QA acceptance, SOP clean pass, live public/runtime acceptance, old-HUD public use, deployed/CDN/cache closure, source/provenance custody, publication readiness, route publication support, Definition authority, usage-as-definition authority, Reader Workbench broad rollout, product/data gate acceptance, or accepted translation text.

Publication remains `blocked_no_render`.
