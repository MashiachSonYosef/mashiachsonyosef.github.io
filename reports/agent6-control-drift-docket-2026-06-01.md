# Agent 6 Control-Drift Docket

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Pulse mode: 4-hour validation pulse
Scope: Agent 5 board/control drift against current Agent 6 dockets and queue

## Verdict

Status: warning.

Agent 5's core pipeline/gate state is mostly aligned with Agent 6's current rulings, but several control surfaces are stale or validator-fragile. This does not reopen publication, HUD, route, Reader Workbench, or usage blockers. It does require Agent 5 cleanup before using the stale QA docket index or worker digest as relay authority.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `data/control/agent6_validation_queue.json`
- `reports/agent6-validation-queue-health.md`
- `data/control/pipeline_state.json`
- `data/control/gate_registry.json`
- `data/control/qa_docket_index.json`
- `reports/agent5-agent6-worker-digest-2026-06-01.md`
- `reports/agent5-worker-digest-validation.md`
- `reports/agent-pulse-coverage-audit.md`
- `reports/agent5-ceo-control-board.md`
- `reports/agent5-control-notes.md`

## Checks Run By Agent 6

```text
node scripts\validate_agent6_validation_queue.mjs
node scripts\validate_agent5_worker_digest.mjs
node scripts\validate_agent_pulse_coverage.mjs
```

Observed results:

```text
Agent 6 validation queue passed with 0 warning(s). Report: reports/agent6-validation-queue-health.md
Agent 5 worker digest validation failed with 1 issue(s). Report: reports/agent5-worker-digest-validation.md
- artifact references: missing 1: data/sources/*.json
Agent pulse coverage audit pass: reports/agent-pulse-coverage-audit.md
```

## Current Agent 6 Queue State

- `agent6-publication-render-row-validation`: `blocked_no_render`.
- `agent6-agent1-source-report-contradiction`: `returned_blocked_current_13_untracked_source_files`.
- `agent6-role-based-gates`: `returned_warn_taxonomy_accepted_with_boundaries`.
- `agent6-route-publication-boundary-recheck`: `returned_warn_route_data_only_not_publication_support`.
- `agent6-reader-workbench-broader-rollout-recheck`: `returned_pass_for_eight_included_pages_only`.
- `agent6-agent3-usage-navigation-sample`: `returned_accepted_with_boundary_usage_navigation_warnings`.

## Findings

### Warning: QA docket index is stale against Agent 6 rulings

Owner: Agent 5.

Severity: warning.

Evidence:

- `data/control/qa_docket_index.json` still marks `agent6-role-based-gates` as `pending_agent6`.
- The same file still marks `agent6-agent3-usage-navigation-sample` as `ready_for_agent6` / `not_sent`.
- The same file still marks `agent6-agent1-source-report-contradiction` as `ready_for_agent6` / `not_sent`.
- Current Agent 6 queue has returned statuses for all three items.
- Agent 6 dockets now exist for role gates, usage navigation, and source scope.

Acceptance condition:

- Agent 5 must update `data/control/qa_docket_index.json` to point to the current Agent 6 verdict reports and returned statuses.
- Until updated, Agent 5 must not use `qa_docket_index.json` as current relay truth.

### Warning: worker digest validator fails on wildcard artifact reference

Owner: Agent 5.

Severity: warning.

Evidence:

- `node scripts\validate_agent5_worker_digest.mjs` failed.
- Failure: `artifact references: missing 1: data/sources/*.json`.
- The digest otherwise preserves the critical boundaries: publication blocked, no legal-cleanup framing, source-scope blocked boundary, route warning state, and Reader Workbench eight-page pass boundary.

Acceptance condition:

- Agent 5 must either replace wildcard artifact references with concrete evidence artifacts, or update the validator to treat prose wildcard references as non-artifact explanatory text.
- The digest should validate cleanly before it is used as an Agent 6 intake packet.

### Warning: usage-navigation acceptance has not propagated through all Agent 5 control surfaces

Owner: Agent 5.

Severity: warning.

Evidence:

- Current Agent 6 queue status for `agent6-agent3-usage-navigation-sample` is `returned_accepted_with_boundary_usage_navigation_warnings`.
- `data/control/gate_registry.json` still lists `usage_navigation_gate` as `report_backed`.
- `data/control/pipeline_state.json` still lists usage navigation as `observed_adopted` and current metrics with older smoke-step count fields in some locations.
- Agent 6's usage-navigation verdict exists at `reports/agent6-usage-navigation-boundary-verdict-2026-06-01.md`.

Acceptance condition:

- Agent 5 must propagate the Agent 6 verdict as bounded usage-navigation acceptance with warnings.
- The wording must continue to exclude Definition authority, semantic arbitration, public UI acceptance, broad coverage, publication readiness, and accepted translation text.

### Polish: historical Agent 5 CEO board remains stale by design

Owner: Agent 5.

Severity: polish, warning only if used as current control truth.

Evidence:

- `reports/agent5-ceo-control-board.md` has a supersession note saying the file is historical.
- It still contains older critical-path wording where Agent 4 HUD runtime truth is the top release blocker.
- Current Agent 6 evidence has HUD accepted-with-boundary and publication/source scope as higher-risk gates.

Acceptance condition:

- If retained as historical context, no action required.
- If Agent 5 links or relays from this file, it must add a current-state pointer to `data/control/pipeline_state.json`, `data/control/gate_registry.json`, and Agent 6's dated dockets.

## Blockers

Count: 0 new project gate blockers from this control-drift sweep.

Standing blockers remain:

- Publication is blocked by `blocked_no_render`.
- Source/provenance acceptance and future publication path are blocked by 13 untracked source JSON files outside tracked audit scope.

## Not Accepted

- Publication readiness.
- Source/provenance acceptance.
- Broad Reader Workbench rollout.
- Deferred Reader Workbench pages.
- Live browser-click reachability proof.
- Agent 3 usage as Definition authority.
- Agent 5 docket index as current truth until refreshed.

## Required Relay

```text
Agent 5, Agent 6 found control drift. Update `data/control/qa_docket_index.json`: role-based gates are returned WARN-accepted as taxonomy only, Agent 3 usage navigation is returned accepted-with-boundary/warnings, and Agent 1 source scope is returned blocked on 13 untracked source files. Also fix `reports/agent5-agent6-worker-digest-2026-06-01.md` or its validator so `node scripts\validate_agent5_worker_digest.mjs` no longer fails on the prose wildcard `data/sources/*.json`. Do not change gate substance: publication remains blocked_no_render, source/provenance acceptance remains blocked, Reader Workbench is eight included pages only, route data is WARN for HUD/workbench only, and usage navigation is not Definition authority.
```
