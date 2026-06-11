# Agent 6 Deuteronomy Option A Route-Selection Verdict

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate` / `public_runtime_deployment_drift_gate`
Verdict: WARN-ACCEPTED for Option A route-selection preparation only
Risk classification: P0 public/runtime license-provenance blocker remains active

## Scope

This docket validates only the control boundary for Agent 7's selected Deuteronomy P0 route:

- Option A: clean deploy branch/worktree based on current `origin/main`.
- Stage/copy only the bounded Deuteronomy P0 artifact set.
- Return execution evidence or exact blocker.

This docket does not execute deployment, accept public/runtime state, accept source/provenance custody, accept publication readiness, or clear the old-HUD live blocker.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent7-deuteronomy-p0-owner-route-selection-2026-06-02.md`
- `reports/agent5-p0-deuteronomy-owner-route-decision-surfaced-2026-06-02.md`
- `reports/agent6-owner-route-decision-request-2026-06-02.md`
- `reports/agent6-public-runtime-license-risk-recheck-directive-2026-06-02.md`
- `data/control/agent6_validation_queue.json`
- `reports/agent5-pipeline-priority-handoff.md`
- `reports/agent5-control-notes.md`

## Checks Performed

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 1 known warning.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 known warnings.
- `node scripts\validate_route_hud_page.mjs tanakh/deuteronomy/index.html`: passed for 1 page.
- Current branch check: `main`, local HEAD `14365d3e11db01046a7ed1b251bd5d97b20b431b`, `origin/main` `2a7b6c054c038b27d39b5b244cfb7ec7114bfcd6`, divergence `1 behind / 73 ahead`.
- Bounded artifact status check: `tanakh/deuteronomy/index.html` is modified; `assets/js/reader-workbench.js` and `assets/css/reader-workbench.css` are untracked; `data/definitions/hud-route-lookup/manifest.json` differs from `origin/main`.

Attempted but not counted as proof:

- `node scripts\audit_route_hud_source_row_sample.mjs tanakh/deuteronomy/index.html` failed because that script is not present in this checkout. Source/license/citation row proof therefore remains a required post-remediation evidence item, not an accepted current-state claim.

## Verdict

WARN-ACCEPTED for route-selection preparation only.

Agent 7's Option A selection is the correct QA-compatible route because it avoids deploying from a dirty, divergent local `main` and confines the next execution packet to the bounded Deuteronomy P0 artifact set.

This does not downgrade the live Deuteronomy blocker. The live public site remains unaccepted until Agent 6 reviews post-remediation live evidence.

## Required Acceptance Condition

Agent 5 may prepare an Option A execution packet only if it includes:

- clean branch/worktree identity based on current `origin/main`;
- exact staged/copied bounded artifact list;
- file hashes for each deployed artifact;
- deployment command or workflow path;
- target branch/remote/site;
- commit or build identifier;
- post-deploy live URLs and timestamp;
- HTTP status, ETag, Last-Modified, and Cache-Control for each checked URL;
- marker checks proving old-HUD markers are absent and current Route HUD/runtime contract is present;
- runtime/data dependency proof for the bounded root dependencies;
- source/license/citation row visibility proof on the deployed Deuteronomy page;
- cache-busting or hard-refresh proof;
- explicit statement that `/hud-preview/`, Genesis, source/provenance custody, publication readiness, and accepted translation text remain separate/unaccepted.

If any item cannot be produced, Agent 5 must record the exact blocker rather than substituting another no-drift proof loop.

## Required Next Action

Agent 7:

- Preserve Option A as the selected preparation route unless the user explicitly changes route.
- Do not convert this docket into deployment authorization or public/runtime acceptance.

Agent 5:

- Prepare the bounded Option A execution packet or exact blocker only.
- Do not deploy from dirty divergent local `main`.
- Do not run another equivalent pre-swap/no-drift proof loop.
- Do not route Agent 4 until post-remediation live artifacts change and Agent 6 requests runtime/click/source-license validation.
- Do not interrupt Agents 1-3 for this deployment/runtime blocker.

Agent 4:

- No pre-swap validation is requested.
- Useful next work is post-swap live runtime/click/source-license proof only after changed live artifacts exist and Agent 6 requests it.

## What Must Not Be Accepted

- live Deuteronomy public/runtime acceptance
- old-HUD public use
- deployed/CDN/cache closure
- Option A packet readiness as deployment completion
- local/static Route HUD validation as live clearance
- source/provenance custody
- publication readiness
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- translation output
- accepted translation text

Publication remains `blocked_no_render`.
