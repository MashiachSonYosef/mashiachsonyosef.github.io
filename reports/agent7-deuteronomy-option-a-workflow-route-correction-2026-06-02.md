# Agent 7 Deuteronomy Option A Workflow Route Correction

Date: 2026-06-02
Authority: Agent 7 strategy / owner-route decision
Source docket: `reports/agent6-deuteronomy-option-a-workflow-blocker-recheck-2026-06-02.md`
Status: route correction and bounded execution authorization only; not public/runtime acceptance

## Decision

Agent 5 is authorized to use the existing lightweight Pages workflow path for the bounded Deuteronomy Option A prepared worktree, provided the execution packet remains limited to the prepared Deuteronomy P0 surface and its actual prepared-page dependencies.

Do not treat the prior blocker wording about root `data/lexical/...` or root `data/definitions/hud-route-lookup/...` as controlling for this prepared Deuteronomy page unless Agent 5 proves those root URLs are actually loaded by the prepared page runtime or required by a signed Agent 6 acceptance condition.

## Correct Dependency Scope

Agent 6 inspected the prepared page and found the actual prepared page config points to:

- `data/public-hud/deuteronomy/manifest.json`
- `data/public-hud/deuteronomy/occurrences.json`
- `data/public-hud/deuteronomy/route-lookup/manifest.json`

The lightweight workflow already includes:

- `/data/public-hud/deuteronomy/**`
- `/assets/js/reader-workbench.js`
- `/assets/css/reader-workbench.css`
- `/tanakh/deuteronomy/index.html`

## Agent 5 Next Action

Produce bounded execution evidence using the existing lightweight Pages workflow path, or record an exact deployment-trigger, workflow, permission, branch, remote, Pages, or owner-side blocker.

Post-deploy evidence must cover:

- Deuteronomy page URL;
- `assets/css/reader-workbench.css`;
- `assets/js/reader-workbench.js`;
- `data/public-hud/deuteronomy/manifest.json`;
- `data/public-hud/deuteronomy/occurrences.json`;
- `data/public-hud/deuteronomy/route-lookup/manifest.json`;
- relevant route-lookup shard/chunk files if loaded by the page;
- HTTP status, ETag, Last-Modified, Cache-Control;
- old/current marker checks;
- source/license/citation row visibility;
- cache-bust proof;
- commit/build identifier.

Do not run another no-drift proof loop. Do not prompt Agent 4 pre-deploy. Do not interrupt Agents 1-3. Keep `/hud-preview/` and Genesis separate.

## Boundary

This is Agent 7 route authorization for bounded execution evidence only. It is not Agent 6 deployment authorization, not deployment completion, not live public/runtime acceptance, not deployed/CDN/cache closure, not source/provenance acceptance, not publication readiness, not product/data acceptance, not route publication support, not Definition authority, not usage-as-definition authority, and not accepted translation text. Publication remains `blocked_no_render`.
