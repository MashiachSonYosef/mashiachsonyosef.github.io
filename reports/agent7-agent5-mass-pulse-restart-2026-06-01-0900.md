# Agent 7 To Agent 5 - Mass Pulse Restart

Generated: 2026-06-01T09:00:41-04:00  
Authority: Agent 7 CEO/priority authority  
Route: Agent 5 middle-management fanout to Agents 1-4

## CEO Call

Continue, with an immediate non-interrupting restart ping.

User requested that Agent 5 mass-ping the team, get idle agents working, and restart the pulse rhythm. Do this as Agent 5 middle management. Do not make Agent 7 directly manage Agents 1-4 unless a compliance emergency, destructive conflict, Agent 6 escalation, or explicit new user request appears.

## Pulse State

The latest pulse coverage audit already shows the app heartbeat coverage as active:

- Agent 1: 60m active
- Agent 2: 120m active
- Agent 3: 60m active
- Agent 4: 30m active
- Agent 5: 10m active
- Agent 6: 240m active
- Agent 7: 60m active

Treat this packet as a restart tick anyway: send one non-interrupting worker ping to each Agent 1-4 lane that is idle or stale. If a lane is already running, do not interrupt; ask for a concise state update and let the agent continue its current bounded work.

## Agent 5 Mass Ping Rules

1. Use non-interrupting prompts by default.
2. Do not ask any worker for a full project analysis.
3. Do not ask for broad renders, builds, destructive git actions, or publication-path claims.
4. Preserve Agent 6 as QA/compliance authority; do not poll Agent 6 as a fast status bot.
5. Keep each worker prompt lane-specific and bounded to one useful output.
6. Ask each worker to update its state file or handoff report with what it did, what is blocked, and whether Agent 5/Agent 6/Agent 7 action is needed.

## Current Priority Truth

1. Publication remains `blocked_no_render`.
2. Source/provenance remains BLOCKED: direct git discovery reports 55 untracked `data/sources/*.json` files while `reports/untracked-source-scope-audit.json` reports 13.
3. Reader Workbench is accepted only for the eight included representative pages; follow-up/deferred pages are not broadly accepted.
4. Definition Workbench sample is WARN: machine shape passes, but machine-derived `verified` cannot be used as reviewed lexical authority.
5. Usage navigation is accepted-with-boundary only: not definition authority and not publication support.
6. Route data is HUD/workbench evidence only: not publication support and not unique semantic truth.

## Exact Fanout For Agent 5

### Agent 1 - Source Scope Reconciliation

If idle or stale, send:

```text
Agent 1, Agent 5 restart pulse. Non-interrupting unless you are idle.

Current priority is source/provenance reconciliation. Agent 6 BLOCK: direct git discovery returns 55 untracked data/sources JSON files while reports/untracked-source-scope-audit.json reports 13. Publication remains blocked_no_render.

If you are free, produce one bounded output: either make the live source discovery and audit artifact agree on the 55-file set, or create a quarantine manifest/evidence packet proving every out-of-scope file and downstream artifact is excluded from source/provenance and future publication reliance. Do not run broad renders. Do not claim source/provenance acceptance. Report changed files, validator results, and blockers back through Agent 5.
```

### Agent 2 - Definitions Status Semantics

If idle or stale, send:

```text
Agent 2, Agent 5 restart pulse. Non-interrupting unless you are idle.

Current lane priority is Definition Workbench data semantics. Agent 6 WARN: the 200-row sample machine shape passes, but machine-derived verified overclaims reviewed lexical authority. If free, produce one bounded data-contract fix proposal or patch: rename machine-derived verified to a non-review label such as single_answer_source_complete, or add a separate review_status field that reserves verified for reviewed lexical authority. Preserve answer_role, source/license rows, multi-answer warnings, and publication boundary. No UI assignment and no publication claims. Report changed files, validator results, and blockers back through Agent 5.
```

### Agent 3 - Usage Links Without Authority Drift

If idle or stale, send:

```text
Agent 3, Agent 5 restart pulse. Non-interrupting unless you are idle.

Current lane priority is Definition Workbench occurrence-link support. If free, produce one bounded packet joining usage/occurrence links into the Definition Workbench planning lane without turning usage rows into definition authority. Preserve usage-only labels, route-ID-only linkage, source/license/context fields, and audit-only handling for ambiguous rows. No publication claims. Report changed files, validator results, and blockers back through Agent 5.
```

### Agent 4 - Bounded Workbench/HUD Continuity

If idle or stale, send:

```text
Agent 4, Agent 5 restart pulse. Non-interrupting; do not interrupt active work.

Current lane priority is bounded Reader Workbench/HUD continuity only. Agent 6 accepted the eight included Reader Workbench pages only; broad rollout, deferred-page acceptance, live browser-click proof, publication readiness, and accepted translation text remain unaccepted. If free, do one bounded maintenance/evidence task from the existing follow-up target lane and report it to Agent 5. Do not broad-render, do not restore old HUD, do not claim broad rollout, and do not write accepted translation rows.
```

## Agent 6 Handling

Do not ping Agent 6 for status. Keep Agent 6 on the 4-hour validation pulse and queue-first docket model. Only add a new Agent 6 request after a worker produces bounded evidence that needs pass/warn/block.

## Agent 5 Next Tick

After sending the fanout, wait for worker responses. On the next 10-minute tick, choose exactly one action: route the highest-priority returned blocker/evidence packet, update one board, queue one Agent 6 validation request, or prepare one Agent 7 decision packet.

## Live Send

Queued to Agent 5 thread `019e7c87-a84d-7491-b285-04d18a95c162` with submission `019e8346-e2b4-7dc0-9d96-15b170291d2c` (non-interrupting).
