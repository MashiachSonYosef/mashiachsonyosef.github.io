# Agent 6 Public Runtime License-Risk Recheck Directive

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate` / `public_runtime_deployment_drift_gate`
Verdict: BLOCKER PRESERVED
Risk classification: P0 public/runtime license-provenance blocker

## Scope

This is a narrow live recheck of the three tangible public-surface controls:

1. Pull/quarantine unvalidated public/license-risk surfaces through a kill-switch or SOP path.
2. Keep current Agent 6-validated HUD implementation ahead of old-HUD exposure.
3. Add back only Agent 6-validated public/runtime artifacts under docketed boundaries.

This docket does not implement a fix and does not accept any public/runtime surface.

## Evidence Reviewed

- `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`
- `reports/agent6-hud-preview-pages-stale-after-quarantine-recheck-2026-06-02.md`
- `reports/agent6-old-hud-dynamic-fallback-killswitch-verdict-2026-06-01.md`
- `reports/agent7-agent5-public-surface-license-risk-priority-correction-2026-06-01.md`
- `reports/agent7-validated-only-public-runtime-validator-hardening-2026-06-01.md`
- `reports/agent7-live-deuteronomy-delivery-blocker-verdict-ingest-2026-06-02.md`
- `data/control/agent6_validation_queue.json`
- Live probe artifact: `reports/agent6-public-runtime-license-risk-recheck-directive-2026-06-02.json`

## Live Recheck

Checked at `2026-06-02T11:21:31Z` through `2026-06-02T11:21:33Z`.

### Live Deuteronomy

`https://mashiachsonyosef.github.io/tanakh/deuteronomy/`

- HTTP 200
- ETag `W/"6a1b1289-13bc24"`
- Last-Modified `Sat, 30 May 2026 16:38:33 GMT`
- Cache-Control `max-age=600`
- `Route HUD`: absent
- `Clicked Hebrew form`: present
- `reader-workbench.js`: absent
- `CC-BY`: present

`https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`

- HTTP 200
- ETag `W/"6a1b1289-13bc24"`
- Last-Modified `Sat, 30 May 2026 16:38:33 GMT`
- Cache-Control `max-age=600`
- `Route HUD`: absent
- `Clicked Hebrew form`: present
- `reader-workbench.js`: absent
- `CC-BY`: present

`https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`

- HTTP 404

### Live HUD Preview

`https://mashiachsonyosef.github.io/hud-preview/`

- HTTP 200
- ETag `W/"6a1b1288-2db6"`
- Last-Modified `Sat, 30 May 2026 16:38:32 GMT`
- Cache-Control `max-age=600`
- Title `HUD Sampler | Hebrew Source Workbench`
- `data-public-runtime-quarantine`: absent
- `HUD Sampler`: present

`https://mashiachsonyosef.github.io/hud-preview/index.html`

- HTTP 200
- ETag `W/"6a1b128a-2db6"`
- Last-Modified `Sat, 30 May 2026 16:38:34 GMT`
- Cache-Control `max-age=600`
- Title `HUD Sampler | Hebrew Source Workbench`
- `data-public-runtime-quarantine`: absent
- `HUD Sampler`: present

`https://mashiachsonyosef.github.io/hud-preview/routes/`

- HTTP 404

## Local Comparison

Local files show the intended current/quarantine state exists in the repository:

- `tanakh/deuteronomy/index.html`: `Route HUD` present, `Clicked Hebrew form` absent, `reader-workbench.js` present.
- `hud-preview/index.html`: `data-public-runtime-quarantine` present, `HUD Sampler` absent.
- `hud-preview/routes/index.html`: `data-public-runtime-quarantine` present, `HUD Sampler` absent.
- `assets/js/reader-workbench.js`: present locally.

Interpretation: the remaining failure is deployment/runtime exposure, not a need for more local/static proof.

## Findings

### BLOCKER: Live Deuteronomy Still Serves Old HUD

Owner: Agent 5 / Agent 7 deployment coordination.

Evidence:

- Live Deuteronomy still contains `Clicked Hebrew form`.
- Live Deuteronomy still lacks `Route HUD`.
- Live Deuteronomy still lacks `reader-workbench.js`.
- The expected live runtime asset returns HTTP 404.
- Local Deuteronomy has the current HUD and runtime import.

Acceptance condition:

- Provide post-remediation live evidence proving Deuteronomy serves the current HUD and required runtime asset: exact URL, timestamp, HTTP status, ETag, Last-Modified, Cache-Control, marker proof, runtime asset HTTP 200 or versioned replacement proof, hard-refresh/cache-busting proof, and comparison against local artifact.

### BLOCKER: Live `/hud-preview/` Still Serves Stale Sampler

Owner: Agent 5 / Agent 7 deployment coordination.

Evidence:

- Live `/hud-preview/` and `/hud-preview/index.html` still return HTTP 200 with `HUD Sampler`.
- Both live pages lack `data-public-runtime-quarantine`.
- Local `hud-preview` files contain quarantine markers.

Acceptance condition:

- Provide post-remediation live evidence showing `/hud-preview/` and `/hud-preview/index.html` contain `data-public-runtime-quarantine` or intentionally return a non-public status.
- If `/hud-preview/routes/` remains reachable, provide live quarantine proof; if not, document the intended non-public route status.

### WARN: Old-HUD Repository Static Kill-Switch Evidence Remains Useful But Not Live Clearance

Owner: Agent 4 evidence; Agent 5/7 control preservation.

Evidence:

- `agent6-old-hud-quarantine-killswitch-coverage` is returned WARN-ACCEPTED for repository-file/static-plus-simulated dynamic evidence only.
- The queue separately preserves the live Deuteronomy blocker and broader `/hud-preview/` drift blocker.

Acceptance condition:

- Do not convert repository/static or simulated evidence into live runtime acceptance.
- Use it only to frame the expected post-remediation checks.

## Required Next Action

Agent 7:

- Preserve this as active P0 public/runtime deployment blocker state.
- Prioritize owner-approved deploy/swap or non-public quarantine delivery over any further local proof loop.
- Do not widen Agent 6 static WARN dockets into live runtime acceptance.
- Keep Deuteronomy first; keep `/hud-preview/` separate unless the chosen owner route intentionally performs a broader public-surface quarantine/deploy.

Agent 5:

- Queue and drive only bounded remediation evidence.
- First target: Deuteronomy current-HUD plus runtime asset live proof.
- Second target: `/hud-preview/` quarantine or non-public live proof.
- Do not ask Agent 4 for more pre-swap proof. Agent 4 becomes useful only after live deployed artifacts change and Agent 6 requests browser/runtime/click/source-license validation.
- Do not interrupt Agents 1-3 for this deployment/runtime blocker.

Agent 4:

- No new pre-swap repetition is requested.
- Useful next work is post-swap live browser/runtime/click proof only after deploy evidence exists and Agent 6 requests it.

## What Must Not Be Accepted

- live Deuteronomy public-runtime acceptance
- live `/hud-preview/` public-runtime acceptance
- old-HUD public use
- deployed/CDN/cache closure
- source/provenance custody
- publication readiness
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text

Publication remains `blocked_no_render`.
