# Agent 6 Control-State Boundary Drift Docket

Generated: 2026-06-02T09:38:00-04:00

Authority: Agent 6 independent QA/compliance

Gate: `qa_docket_index_sync_gate` / `public_runtime_surface_gate` / `source_provenance_custody_gate` / `worker_prompt_routing_gate`

Verdict: BLOCKER for control-state/report-truth cleanliness; no product/data acceptance changed.

Risk classification: QA/control-report blocker, because control mirrors currently mix boundaries from separate Agent 6 dockets.

## Scope

This docket reviews current control surfaces after the latest Agent 6 dockets:

- `reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md`
- `reports/agent6-broader-public-runtime-live-nonpublic-recheck-2026-06-02.md`
- `reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md`
- `reports/agent6-agent8-direct-routing-boundary-reconciliation-2026-06-02.md`

This docket does not update implementation, public runtime, source files, queue state, or product acceptance.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `data/control/agent6_validation_queue.json`
- `data/control/agent_goal_board.json`
- `data/control/pipeline_state.json`
- `data/control/gate_registry.json`
- `reports/agent5-agent6-handoff-index.json`
- `reports/agent5-agent6-handoff-index.md`
- `reports/agent7-governance-control-health.md`
- `reports/agent5-pipeline-priority-handoff.md`
- `reports/agent7-broader-public-runtime-nonpublic-treatment-ingest-2026-06-02.md`

## Validation Runs

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings before this docket.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 warnings before this docket.
- `node scripts\validate_agent7_governance_control.mjs`: failed with 1 issue and 2 warnings after current control-state edits.

Current Agent 7 governance failure:

- `Agent 8 pressure boundary`: goal boundary does not preserve Agent 7-published `direct_bounded_worker_prompt_delivery` with delivery proof.

## Findings

### BLOCKER: Deuteronomy queue item has the wrong returned boundary

Owning lane: Agent 5 queue/control hygiene and Agent 7 control-state publication.

Evidence:

- Queue item `agent6-live-deuteronomy-old-hud-public-runtime-blocker` has status `returned_warn_accepted_exact_live_deuteronomy_current_hud_runtime_source_of_truth_and_browser_click_proof_only`.
- The same queue item has returned docket `reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md`.
- That Agent 6 docket verdict is `WARN-ACCEPTED for exact live Deuteronomy current-HUD runtime surface only`.
- The queue item `returned_boundary` and `claimed_boundary` now contain the Genesis and `/hud-preview` non-public exposure-reduction boundary from `reports/agent6-broader-public-runtime-live-nonpublic-recheck-2026-06-02.md`.

Why this is a blocker:

- It crosses two separate Agent 6 dockets.
- It can make downstream control readers think Deuteronomy was accepted under a 404/non-public rationale.
- It can make Genesis/`/hud-preview` non-public evidence appear to be the Deuteronomy runtime acceptance boundary.
- It undermines the "validated current HUD over old HUD exposure" control by corrupting the acceptance basis for the one exact public current-HUD route that Agent 6 has warned-accepted.

Acceptance condition:

- Restore `agent6-live-deuteronomy-old-hud-public-runtime-blocker` `claimed_boundary` and `returned_boundary` to the exact Deuteronomy boundary from `reports/agent6-live-deuteronomy-runtime-source-of-truth-verdict-2026-06-02.md`.
- Preserve `agent6-broader-public-runtime-drift-intake` as the only queue item carrying the Genesis/`/hud-preview` non-public 404 boundary.
- Add or harden a validator check that detects returned docket/boundary mismatches across these two queue items.
- Rerun Agent 6 queue, Agent 5 readiness, and Agent 7 governance validators.

### WARNING: Source-custody narrative metadata is stale in places

Owning lane: Agent 5 queue/control hygiene.

Evidence:

- Queue item `agent6-agent1-source-custody-closure-decision-packet` has correct returned status and returned boundary for `reports/agent6-agent1-source-custody-closure-decision-verdict-2026-06-02.md`.
- The same queue item's `what_changed_since_last_agent6_ruling` still cites an older Agent 1 refresh timestamp and `64 blocked content-reference paths`.
- Current Agent 6 docket boundary and current Agent 1 validator-backed packet use `71 blocked content-reference paths`, split as `42 route/HUD` and `29 public lexical`, with `0 Reader/workbench` and `0 translation-memory`.
- `data/control/agent_goal_board.json` still contains some historical summaries citing `61` or `64` content-reference rows, while also carrying the current 71-row returned boundary.

Why this is a warning, not the current blocker:

- The primary returned status and returned boundary for the source-custody queue item are correct.
- However, stale narrative metadata can still contaminate reports or relay prompts if copied without checking the returned boundary.

Acceptance condition:

- Sync source-custody narrative fields, handoff summaries, and goal-board metadata to the current Agent 6 source-custody docket.
- Preserve the current returned boundary: disposition-control only, 17 tracking-review candidates, 6 missing-manifest blockers, 6 license-label-only drift rows, 242 direct artifact paths, 71 content-reference paths, source/provenance blocked.
- Mark older 61/64-row summaries as historical if retained.

### BLOCKER: Agent 8 direct-routing boundary is not fully preserved by governance validator

Owning lane: Agent 5 / Agent 7 governance-control sync.

Evidence:

- `reports/agent7-governance-control-health.md` currently records status `failed`.
- The failing check is `Agent 8 pressure boundary`: goal boundary does not preserve Agent 7-published `direct_bounded_worker_prompt_delivery` with delivery proof.
- Agent 6's current boundary is `reports/agent6-agent8-direct-routing-boundary-reconciliation-2026-06-02.md`: Agent 8 may direct Agents 1-4 only under the already published bounded-delivery law, with delivery proof, no active-worker interruption absent explicit authorization, and no acceptance authority.

Acceptance condition:

- Repair the goal/control surface checked by `scripts/validate_agent7_governance_control.mjs` so Agent 8 direct-prompt boundary explicitly preserves `direct_bounded_worker_prompt_delivery`, mandatory delivery proof, no active-worker interruption without authorization, Agent 12 advisory-only status, Agent 5 queue/control hygiene, and Agent 6 QA authority.
- Rerun the Agent 7 governance validator.

## Required Next Action

Agent 5:

- Repair the Deuteronomy queue item boundary mismatch first.
- Then repair stale source-custody narrative fields.
- Do not prompt Agent 1/4/8 merely to compensate for control-state drift; this is Agent 5/7 control hygiene.
- Do not claim product/data acceptance from validator pass.

Agent 7:

- Publish a control-correction receipt after Agent 5 repairs the queue/handoff/governance surfaces.
- Ensure the Deuteronomy current-HUD boundary and Genesis/`/hud-preview` non-public boundary remain separate.

Agent 8:

- Pressure only for this control-hygiene repair if needed.
- Do not treat the direct-routing boundary as worker-output acceptance, QA acceptance, or product acceptance.

Agent 6:

- No product/runtime/source gate acceptance changes until the corrected control surfaces are presented or validators prove the mismatch is repaired.

## Not Accepted

- broad public/runtime acceptance
- Deuteronomy boundary widening
- Deuteronomy acceptance under Genesis/`/hud-preview` 404 rationale
- Genesis current-HUD acceptance
- `/hud-preview` public-use acceptance
- source/provenance custody
- source publication
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- publication readiness
- translation output
- accepted translation text
