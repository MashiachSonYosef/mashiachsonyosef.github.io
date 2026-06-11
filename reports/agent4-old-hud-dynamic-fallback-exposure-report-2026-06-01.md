# Agent 4 SPEC-003 Dynamic/Fallback Old-HUD Exposure Report

Generated: 2026-06-02T00:53:44.463Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- This is Node VM simulated runtime evidence plus static navigation resolution, not live browser-click proof.
- Old HUD remains `quarantined_legacy_license_risk`; publication remains `blocked_no_render`.

## Summary

- Status: warn_dynamic_fallback_evidence
- Generated pages expected/present: 1360 / 1360
- Generated pages with old-HUD markers: 0
- Generated pages importing Reader Workbench runtime: 1243
- Generated pages importing stale upgrade tool: 0
- Public navigation links resolved: 2726
- Public navigation targets with old-HUD markers: 0
- Dynamic runtime control failures: 0
- Validator failures: 0
- Issues: 0
- Warnings: 3

## Dynamic Runtime Controls

- pass / answer_safety / positive: answer-eligible non-usage card can become selected Definition answer
- pass / localStorage / positive: valid not_a_translation answer selection with source/license rows is accepted into local storage
- pass / indexedDB / positive: valid selection still imports when localStorage throws and IndexedDB is available
- pass / usage_as_definition / negative: high-score usage evidence cannot become selected Definition answer
- pass / query_string / negative: old-HUD-looking query string does not expose old-HUD API or marker output
- pass / localStorage / negative: top-level publication_status other than not_a_translation is rejected
- pass / localStorage / negative: evidence-only imported selection is rejected
- pass / localStorage / negative: imported selection missing source/license rows is rejected

## Public Navigation Click Simulation

- Roots checked: `index.html`, `about/index.html`, `library/index.html`
- Resolved targets: 2726
- Targets with old-HUD markers: 0
- Targets to quarantined preview: 0

## Route / Index / Generated Inventory

- Source records: 1360
- Generated pages expected/present: 1360 / 1360
- Generated pages with old-HUD markers: 0
- Route lookup manifest: `data/definitions/hud-route-lookup/manifest.json` (present)
- Route lookup shards listed/present: 7990 / 7990
- Route lookup cards written: 539661
- Publication boundary: blocked_no_render

## Runtime / Fallback / Rollback

- Runtime: `assets/js/reader-workbench.js`
- Runtime sha256: `475c39298c72df954d5ef00f8d0350f677b31629d0600ec756ef1a437f4cfddb`
- Generated pages importing runtime: 1243
- Generated pages importing upgrade tool: 0
- Preview fallback exists in runtime: true
- Generated pages missing initSite prerequisites: 0
- Stale upgrade tool old markers: Clicked Hebrew form, Best actual hit, Full source and license rows, data-hud-renderings
- Rollback terms in runtime: false

## Query / Storage

- pass / query_string / negative: old-HUD-looking query string does not expose old-HUD API or marker output
- pass / localStorage / negative: top-level publication_status other than not_a_translation is rejected
- pass / localStorage / negative: evidence-only imported selection is rejected
- pass / localStorage / negative: imported selection missing source/license rows is rejected
- pass / localStorage / positive: valid not_a_translation answer selection with source/license rows is accepted into local storage
- pass / indexedDB / positive: valid selection still imports when localStorage throws and IndexedDB is available

## Route / Source / Answer / Maqaf Checks

- route HUD rollout watch: external shell evidence required (external_required)
- public route lookup: external shell evidence required (external_required)
- route answer safety: external shell evidence required (external_required)
- representative route HUD pages: external shell evidence required (external_required)
- Genesis click contract: external shell evidence required (external_required)
- External direct-shell validator evidence: `reports/agent4-old-hud-dynamic-validator-evidence-2026-06-01.md`

## Source / License / Citation Visibility

- Generated pages with Sources and licenses: 1360
- Generated pages with source footnotes: 1360
- Public route lookup validator: external_required in this report; direct-shell pass recorded in `reports/agent4-old-hud-dynamic-validator-evidence-2026-06-01.md`.
- Scope: source/license/citation visibility is static plus representative validator evidence, not source/provenance custody acceptance.

## Stale Bundle Risk

- Runtime mtime: 2026-06-01T09:04:31.843Z
- Generated runtime imports without cache-busting query: 1243
- Observable risk: file evidence does not expose HTTP cache headers or CDN state; lack of cache-busting query means stale deployed bundles remain an operational risk outside this packet

## Deviations

- No Playwright/jsdom dependency is installed in this repo, so this packet uses Node vm runtime controls and static click-path resolution.
- Public navigation clicks are simulated by resolving href targets from public navigation roots, not by a live browser.
- Query/localStorage/IndexedDB controls execute exported runtime functions in a fake browser context; this is not deployment/CDN proof.
- The route preview fallback exists for `hud-preview` reference pages and is not accepted as a public fallback.
- Cache/stale bundle risk is observable only from script src/hash/mtime; no CDN or HTTP cache headers are available from file evidence.

## Quarantined Surfaces

- `hud-preview/`: prototype/reference surface with route preview fallback; not current public HUD acceptance
- `scripts/upgrade_route_hud_pages.mjs`: stale migration reference; not render authority and not imported by generated pages

## Issues

- none

## Warnings

- reader-workbench.js contains initRoutePreview fallback for HUD preview/reference pages; generated source pages satisfy initSite prerequisites, but preview fallback remains quarantined
- scripts/upgrade_route_hud_pages.mjs remains in workspace as stale reference tooling and must not be used as render authority
- 1243 generated page(s) import reader-workbench.js without an observable cache-busting query string

## What Must Not Be Accepted

- Old-HUD public use, fallback, route exposure, runtime activation, or source-evidence capability.
- Public/runtime acceptance or broad rollout.
- Live browser-click proof.
- Source/provenance acceptance.
- Publication readiness or publication-path support.
- Reader Workbench broad rollout.
- Definition Workbench authority.
- Route publication support.
- Usage-as-definition authority.
- Accepted translation text.
- This Agent 4 packet as Agent 6 acceptance.
