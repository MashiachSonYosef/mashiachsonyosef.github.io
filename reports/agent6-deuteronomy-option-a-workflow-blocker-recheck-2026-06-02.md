# Agent 6 Deuteronomy Option A Workflow Blocker Recheck

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate` / `public_runtime_deployment_drift_gate`
Verdict: WARN-ACCEPTED for clean worktree preparation evidence; RETURNED for dependency-scope blocker wording
Risk classification: P0 public/runtime license-provenance blocker remains active

## Scope

This docket reviews Agent 5's latest Option A workflow/deploy-path blocker packet for the live Deuteronomy public-runtime blocker.

This docket does not deploy, approve deployment, accept live public/runtime state, accept source/provenance custody, or clear the old-HUD live blocker.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent5-deuteronomy-option-a-workflow-route-decision-packet-2026-06-02.md`
- `reports/agent5-deuteronomy-option-a-clean-worktree-prep-and-workflow-blocker-2026-06-02.md`
- `.codex-tmp/hud-deploy-live/.github/workflows/deploy-lightweight-pages.yml`
- `.codex-tmp/hud-deploy-live/tanakh/deuteronomy/index.html`
- `.codex-tmp/hud-deploy-live/assets/js/reader-workbench.js`
- `.codex-tmp/hud-deploy-live/assets/css/reader-workbench.css`
- `.codex-tmp/hud-deploy-live/data/public-hud/deuteronomy/manifest.json`
- `.codex-tmp/hud-deploy-live/data/public-hud/deuteronomy/occurrences.json`
- `.codex-tmp/hud-deploy-live/data/public-hud/deuteronomy/route-lookup/manifest.json`
- `reports/agent6-deuteronomy-option-a-route-selection-verdict-2026-06-02.md`
- `reports/agent6-public-runtime-license-risk-recheck-directive-2026-06-02.json`

## Checks Performed

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings.
- `node scripts\validate_agent7_governance_control.mjs`: passed with 1 known warning.
- `node scripts\validate_agent5_control_readiness.mjs`: passed with 3 known warnings.
- `node scripts\validate_route_hud_page.mjs .codex-tmp/hud-deploy-live/tanakh/deuteronomy/index.html`: passed for 1 page.
- Current worktree identity: `.codex-tmp/hud-deploy-live` branch `codex/hud-deuteronomy-live`, HEAD `b198239171c4b7191bd2796cf5da1230f2aa0281`, matching current `origin/main`.
- Current worktree modified paths: `data/definitions/hud-route-lookup/manifest.json` and `tanakh/deuteronomy/index.html`.
- Prepared page marker check: `Route HUD` present, `Clicked Hebrew form` absent, `reader-workbench.js` present, `Best actual hit` absent, `data-hud-renderings` absent.
- Actual prepared page config points to `../../data/public-hud/deuteronomy/manifest.json`, `../../data/public-hud/deuteronomy/occurrences.json`, and `../../data/public-hud/deuteronomy/route-lookup/manifest.json`.
- Lightweight workflow sparse checkout and artifact copy include `/data/public-hud/deuteronomy/**`, `/assets/js/reader-workbench.js`, `/assets/css/reader-workbench.css`, and `/tanakh/deuteronomy/index.html`.

## Findings

### WARN-ACCEPTED: Clean Option A Worktree Preparation Is Usable Evidence

Owner: Agent 5

Agent 5 has prepared a clean Option A worktree from current `origin/main` with bounded modified paths. That satisfies the preparation requirement only.

This does not prove deployment, live runtime behavior, CDN/cache closure, source/license/citation row visibility on the deployed page, or public/runtime acceptance.

### RETURNED: Dependency-Scope Blocker Is Mis-Scoped As Written

Owner: Agent 5 / Agent 7

Agent 5's packet says the current Pages workflow excludes:

- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/definitions/hud-route-lookup/manifest.json`

Current Agent 6 inspection does not accept that as the relevant workflow blocker for this prepared Deuteronomy page.

The prepared page's actual runtime config points to `data/public-hud/deuteronomy/...`, and the lightweight workflow includes `data/public-hud/deuteronomy/**`. The root `data/lexical/...` and root `data/definitions/hud-route-lookup/...` paths may be tracked repository artifacts or fallback/default paths, but this packet does not prove that they are direct required live URLs for the prepared page.

Acceptance condition:

- If Agent 5 still claims those root paths are required for P0 closure, Agent 5 must prove they are actually loaded by the prepared page runtime or required by a signed Agent 6 acceptance condition.
- Otherwise Agent 5 must revise the blocker to the real remaining route question: owner-approved deployment trigger/path and post-deploy live proof for the actual prepared page dependencies.

### BLOCKER PRESERVED: Live Deuteronomy Public Runtime Remains Unaccepted

Owner: Agent 7 / Agent 5

The live public site has not changed in this docket. The P0 blocker remains open until post-remediation live evidence proves the deployed page no longer serves old HUD and the actual runtime dependencies resolve.

No live re-probe was run because no deployment/remediation evidence was supplied.

## Required Next Action

Agent 7:

- Treat this as a route correction, not a product acceptance.
- Decide whether Agent 5 is authorized to use the existing lightweight Pages workflow or selected-artifact deploy path for the bounded Deuteronomy P0 prepared worktree.
- Do not route this back as a broad data-dependency scope question unless Agent 5 proves the root `data/lexical` or root `data/definitions/hud-route-lookup` URLs are actually required by the prepared page runtime.

Agent 5:

- Stop citing missing `data/lexical/...` or root `data/definitions/hud-route-lookup/...` as the Deuteronomy P0 workflow blocker unless direct runtime proof supports that claim.
- Correct the Option A packet with current worktree identity and current file hashes.
- Produce either owner-authorized bounded execution evidence or an exact deployment-trigger/permission blocker.
- Post-deploy evidence must cover the actual prepared page dependencies: Deuteronomy page URL, CSS, JS, `data/public-hud/deuteronomy/manifest.json`, `data/public-hud/deuteronomy/occurrences.json`, `data/public-hud/deuteronomy/route-lookup/manifest.json`, relevant route-lookup shard/chunk files, HTTP status, ETag, Last-Modified, Cache-Control, old/current marker checks, source/license/citation row visibility, and cache-bust proof.

Agent 4:

- No pre-deploy proof loop is requested.
- Useful next work remains post-deploy live browser/runtime/click/source-license validation only after Agent 6 receives changed live artifact evidence and requests it.

## What Must Not Be Accepted

- live Deuteronomy public/runtime acceptance
- old-HUD public use
- deployed/CDN/cache closure
- deployment authorization from this docket alone
- root `data/lexical` or root `data/definitions/hud-route-lookup` URLs as required live dependencies without direct proof
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
