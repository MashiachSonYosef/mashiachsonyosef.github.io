# Agent 12 Limiter Pulse - 2026-06-02 03:50 EDT

## Goal

Operate as Agent 12 Limiter for 24 hours under `EMERGENCY_HARD_CAP`: preserve token budget, cap Agent 8/Agent 5 prompts before worker spend, route `AGENT6_REQUIRED` items through queues, avoid worker churn, and produce only concrete capped control artifacts or blocker escalations.

## Mode

`EMERGENCY_HARD_CAP`

Default action: shrink, reject, require new hypothesis, or status-only unless the work is a P0 blocker, owner-route decision, Agent 6-required queue item, exact user request, or bounded safety/compliance/source/public-surface emergency.

## Current Queue State

- `agent6-sop-017-agent12-limiter-token-conservation`: returned WARN-ACCEPTED for emergency cost/scope-control workflow governance only.
- `agent6-sop-017-revision-language-request`: queued for Agent 6 pass/warn/block revision-language verdict.
- `agent6-sop-revision-queue-governance-proposal`: queued for Agent 6 pass/warn/block queue-governance verdict.

SOP-017 law remains unchanged until Agent 6 returns the revision-language verdict.

## Worker State

- Agent 1: awaiting Agent 6 source-custody closure decision; duplicate prompts suppressed.
- Agent 2: active; do not prompt.
- Agent 3: evidence-ready; do not prompt unless Agent 6 requests follow-up or a real blocker appears.
- Agent 4: active; do not prompt unless post-swap live evidence exists and Agent 6 requests validation.
- Agent 5: active coordinator; may work only bounded control/queue/SOP revision tasks.
- Agent 8: active pressure monitor; throttled by Agent 12 during emergency scarcity.

## Agent 12 Decisions

- `STATUS_ONLY` for Agents 1-4: no worker prompt is approved now.
- `APPROVED_CAPPED` for Agent 5: one bounded control action per 30-minute session, limited to SOP-017/SOP-revision queue hygiene, Agent 6 queue packaging, or exact Agent 7/user decision packets.
- `SHRUNK` for Agent 8: no frequent pulsing; pressure only on material delta, new blocker, or 2-hour digest with capped intake.
- `AGENT6_REQUIRED` preserved for SOP-017 revision language; queue delivery is the valid path while direct Agent 6 thread is unavailable.

## Pulse Rule

Every 30 minutes while active, Agent 12 should perform a bounded pulse:

- Inspect only filtered goal statuses, SOP revision queue status, and Agent 6 queue entries for SOP-017/P0 blockers.
- Produce at most one control outcome.
- Do not run broad scans, renders, full git status, or worker wakeups.
- Do not treat silence, sampling, queueing, or limiter approval as acceptance.

## What Must Not Be Accepted

- Agent 12 as QA authority.
- Limiter approval as Agent 6 acceptance.
- Token-saving silence as blocker closure.
- Sampled validation as broad runtime acceptance.
- Source/provenance custody acceptance.
- Publication readiness.
- Public/runtime acceptance.
- Product/data gate acceptance.
- Route publication support.
- Definition authority.
- Usage-as-definition authority.
- Accepted translation text.

Publication remains `blocked_no_render`.
