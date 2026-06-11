# Agent 7 / Agent 5 Pulse Protocol

Generated: 2026-06-01T09:45:00-04:00

## Purpose

Reduce user relay work by making Agent 5 the normal middle-management route for Agents 1-4, Agent 5's 30-minute coordinator work session a bounded operational triage loop with evidence-prep capacity, Agent 7's pulse a slower CEO priority loop, and Agent 6's cadence a slow validation/signoff checkpoint.

## Cadence

- Agent 5 coordinator work session: every 30 minutes during active work.
- Agent 7 CEO mission oversight: every 4 hours by default.
- Agent 7 useful work session: minimum 20 minutes when active; prefer about 60 minutes; 2-4 hour deep work is the ideal for coherent bounded control tasks. The session should produce one concrete artifact, validator result, queue update, or routed packet before stopping.
- Agent 7 fast pulse: disabled by default for cap conservation; use only for explicit user request, safety/compliance emergency, or Agent 6/Agent 5 escalation that cannot wait.
- Agent 6 accessibility/validation pulse: every 4 hours. Agent 5/7 submit validation requests through `data/control/agent6_validation_queue.json`; Agent 6 works the queue and high-risk sweeps at slow QA cadence. This keeps Agent 6 reachable without turning him into a fast status bot.

## Agent 5's 30-Minute Coordinator Work Session

Agent 5 should not do a full analysis every 30 minutes. Each session should produce one bounded action or a coherent restart batch, with a minimum useful target of 20 minutes when work is available. If a worker is already active, Agent 5 sends no prompt at all; observe and wait unless safety, compliance, destructive risk, or explicit Agent 7/user escalation applies.

Checklist:

1. Check for new Agent 6 docket or queue status change.
2. Check whether Agents 1-4 are stale beyond their lane cooldown.
3. Check whether any worker reports a blocker, active command, destructive risk, or handoff.
4. Check whether control files contradict the newest docket.
5. Choose exactly one action: nudge one worker, queue one Agent 6 request, update one board state, prepare one Agent 7 decision packet, or run/create one bounded prevalidation artifact that helps Agent 6 digest Agent 1-4 output.

When no routing action is needed, Agent 5 should not default to passive no-op if a safe, small, evidence-producing prevalidation exists. The workhorse version of the tick is still bounded: one page, one contract, one queue packet, or one narrow report, not a broad recompute.

Do not:

- Recompute the whole project every tick.
- Send generic keepalives when no lane is stale.
- Interrupt Agents 1-4 without verified blocker/compliance/destructive-risk evidence.
- Prompt Agent 6 like a fast status bot between his 4-hour accessibility pulses.
- Ask the user to relay routine agent messages.
- Treat static prevalidation as browser click proof or Agent 6 acceptance.

## Agent 5 Output to Agent 7

Agent 5 should pulse Agent 7 only when a CEO decision is useful, or on the 60-minute summary cadence.

```text
Agent 5 pulse:
Elapsed since last CEO pulse:
New docket or gate delta:
Worker state changes:
Current bottleneck:
One recommended CEO call:
Exact relay needed, if any:
User involvement needed: yes/no
```

## Agent 7 Output to Agent 5

Agent 7 replies with a decision packet, not a broad essay.

```text
CEO call: continue | redirect | stop | queue Agent 6 | ask user
Priority order:
Agent 1:
Agent 2:
Agent 3:
Agent 4:
Agent 6 queue:
Do not do:
Next Agent 5 tick:
```

Agent 7 should not stop at status-only work when there is a low-risk CEO control task available. Stop conditions are: a concrete artifact or routing packet is complete and validated, the next step waits on another agent's bounded evidence, the next step would require broad render/destructive/legal/product-direction approval, or Agent 6 and Agent 7 authority conflict needs user awareness.

Agent 7 normally deals with Agent 5, not directly with Agents 1-4. Direct Agent 1-4 queueing is reserved for major CEO correction, cross-lane conflict, safety/compliance emergency, explicit user request, or Agent 6 escalation. Routine stale work, implementation nudges, and evidence collection go through Agent 5.

Agent 4 direct queueing is frozen after the 2026-06-01 saturation signal. Do not send Agent 4 direct Agent 7 queue items unless the user or Agent 6 explicitly escalates.

## Current Priority Defaults

1. Agent 6: bounded Reader Workbench representative expansion recheck is queued in `data/control/agent6_validation_queue.json`; wait for pass/warn/block before any broader rollout claim.
2. Agent 1: do not repeat source-count truth work. Agent 6 WARN-ACCEPTED source-scope/report truth at direct-23/audit-23 in `reports/agent6-source-scope-23-reconciliation-verdict-2026-06-01.md`; all 23 untracked source JSON files remain quarantined and source/provenance custody remains blocked. Future Agent 1 work should target source custody/exclusion, the six modified tracked source files outside that docket, or Agent 6-requested evidence.
3. Agent 2: preserve route authority fields and multi-answer warnings; no publication leakage.
4. Agent 3: keep usage evidence useful but non-authoritative.
5. Agent 5: board hygiene, pulse discipline, and evidence-packet quality.
6. Agent 6: 4-hour accessibility/validation pulse over queued signoff requests and high-risk QA sweeps.

Current Agent 4 routing: Agent 7 queued a non-interrupting packet to Agent 4 at `2026-06-01T03:23:11-04:00`, submission `019e8210-88c0-7310-8fae-1af08efad58a`, for bounded Reader Workbench included-page evidence and one non-Genesis export/import source-license survivability sample. The evidence is now in the Agent 6 queue, so Agent 5 should not duplicate, escalate, or add to that prompt. Route only through Agent 5 unless user/Agent 6 escalates.

## Escalation Rules

Ask the user only for:

- product direction choices,
- legal/source policy choices,
- destructive or irreversible operations,
- Agent 7/Agent 6 authority conflict,
- spending significant time or compute on broad rendering.

Everything else should move through Agent 7/Agent 5 pulses and Agent 6 docket queues.

## Restart Fanout Addendum

2026-06-01T09:00:41-04:00: User requested a team restart. Agent 7 directed Agent 5 to send one non-interrupting mass ping to idle/stale Agents 1-4 using reports/agent7-agent5-mass-pulse-restart-2026-06-01-0900.md. This was superseded by the cap-conservation cadence below: Agent 5 uses a 30-minute coordinator work session and must not resume 10-minute triage ticks. Agent 6 remains on the 4-hour validation pulse and must not be treated as a fast status bot.

## Cap-Conservation Cadence Addendum

2026-06-01T09:00:41-04:00: User and Agent 7 changed the operating model to reduce prompt churn. Agents 1-4 scheduled heartbeats are paused. Agent 5 now runs a 30-minute coordinator work session and activates Agents 1-4 only when idle/stale or needed. Agent 6 remains a 4-hour validation work session and must validate evidence before acceptance. Agent 7 now runs a 4-hour CEO mission oversight session. All agents should avoid short status-only prompts; target at least 20 minutes of useful work, prefer about 60 minutes, and use 2-4 hour deep work for hard bounded tasks when safe.

## Session Shape Rule Addendum

2026-06-01T09:45:00-04:00: User set the session-shape rule. Agent 7 targets 20-minute CEO mission sessions. Agent 6 chooses his own validation duration. Agent 5 chooses his own coordinator duration. Agents 1-4 have no scheduled pulses; when Agent 5 activates them, each prompt should be an 8-hour work assignment. Agent 5 still sends no prompt at all to active workers.

## SOP-000 / Goal Board Addendum

2026-06-01T10:05:00-04:00: SOP-000 is now the control law for QA authority, SOP ownership, and change control. Agent 6 owns QA/compliance SOPs, acceptance criteria, gate definitions, and pass/warn/block rulings. Agent 6 may revise SOP-000 only through a dated Agent 6 change-control docket that states rationale, affected agents, affected gates, risk classification, evidence reviewed, and effective boundary.

Agent 5 may manage durable goals, stale-worker suppression, queues, and relays, but may not suppress Agent 6 blockers, redefine acceptance criteria, or treat evidence as accepted. Agent 7 may set mission strategy and cost policy, but may not narrow Agent 6 validation scope or define QA acceptance independently.

The goal board is `data/control/agent_goal_board.json`. Its required statuses are `active`, `blocked`, `evidence-ready`, `awaiting-Agent-6`, and `Agent-6-accepted`. QA-relevant worker reports can move work to `evidence-ready` or `awaiting-Agent-6`, never directly to `Agent-6-accepted`. Only an Agent 6 docket can move QA-relevant work to `Agent-6-accepted`.

Agent 4 is now explicitly the QC/runtime validation worker beyond Reader Workbench: HUD/workbench/runtime inspection, click truth, source/license visibility, accessibility, split-token/maqaf/prefix/suffix behavior, negative tests, and Definition Validation UI pilots. Agent 4 evidence goes to Agent 6 and must not be framed as acceptance.

## SOP-001 Draft Signoff Addendum

2026-06-01T10:30:00-04:00: SOP-000 and SOP-001 now have explicit titles and are marked draft/awaiting Agent 6 signoff. SOP-000 title: `Global QA Authority, SOP Ownership, and Change Control`. SOP-001 title: `Durable Goal Operating Model`.

Agent 5 must not seed new durable worker goals under SOP-001 until Agent 6 signs SOP-000/SOP-001 or explicitly allows provisional use. Existing board entries are proposed control state and routing guidance only, not accepted QA law.

Requested Agent 6 action: pass/warn/block SOP-000 and SOP-001, naming the effective boundary and any clauses that require revision. Publication remains `blocked_no_render`.
