# Agent 4 SPEC-003 Dynamic/Fallback Old-HUD Exposure Report

Generated: 2026-06-02T12:36:23.605Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- This is Node VM simulated runtime evidence plus static navigation resolution, not live browser-click proof.
- Old HUD remains `quarantined_legacy_license_risk`; publication remains `blocked_no_render`.

## Summary

- Status: warn_dynamic_fallback_evidence
- Generated pages expected/present: 1360 / 1360
- Generated pages with old-HUD markers: 0
- Generated pages importing Reader Workbench runtime: 1287
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

## Current / Old Marker Counts

- current generated `selectRouteAnswer`: 1360
- current generated `lookupCandidateTreatments`: 1360
- current generated `Sources and licenses`: 1360
- current generated `Usage evidence`: 1360
- current generated `article.dataset.rankBasis`: 1360
- current generated `answer_eligible`: 1360
- current generated `answer_role`: 1360
- current generated `source-footnotes`: 1360
- current generated `hud_route_lookup_manifest_url`: 1360
- old generated `Clicked Hebrew form`: 0
- old generated `Best actual hit`: 0
- old generated `Full source and license rows`: 0
- old generated `Rank details`: 0
- old generated `allowLowConfidenceFallback`: 0
- old generated `data-hud-breakdown`: 0
- old generated `data-hud-renderings`: 0
- old generated `data-hud-potential`: 0
- old generated `data-hud-related`: 0
- old generated `data-hud-sources`: 0
- old generated `sourceSummary =`: 0
- old navigation target `Clicked Hebrew form`: 0
- old navigation target `Best actual hit`: 0
- old navigation target `Full source and license rows`: 0
- old navigation target `Rank details`: 0
- old navigation target `allowLowConfidenceFallback`: 0
- old navigation target `data-hud-breakdown`: 0
- old navigation target `data-hud-renderings`: 0
- old navigation target `data-hud-potential`: 0
- old navigation target `data-hud-related`: 0
- old navigation target `data-hud-sources`: 0
- old navigation target `sourceSummary =`: 0

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
- Runtime sha256: `f247ca084a77c66d3fcd3603e172e1a4a75c912209aa184a3168e1d1060a8fa4`
- Generated pages importing runtime: 1287
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

- route HUD rollout watch: pass (exit 0)
- public route lookup: pass (exit 0)
- route answer safety: pass (exit 0)
- representative route HUD pages: pass (exit 0)
- Genesis click contract: pass (exit 0)
- External direct-shell validator evidence: `reports/agent4-old-hud-dynamic-validator-evidence-2026-06-02.md`

## Source / License / Citation Visibility

- Generated pages with Sources and licenses: 1360
- Generated pages with source footnotes: 1360
- Public route lookup validator: pass
- Scope: source/license/citation visibility is static plus representative validator evidence, not source/provenance custody acceptance.

## Stale Bundle Risk

- Runtime mtime: 2026-06-02T12:02:11.466Z
- Generated runtime imports without cache-busting query: 1287
- Observable risk: file evidence does not expose HTTP cache headers or CDN state; lack of cache-busting query means stale deployed bundles remain an operational risk outside this packet

## Drift From Current HUD Docket

- Docket: `reports/agent6-public-hud-signoff-2026-06-01.md`
- Docket generated/current-HUD page count mentioned: 1281
- Current generated pages expected/present: 1360 / 1360
- Current generated pages with old-HUD markers: 0
- Current pages missing current markers in this audit: 0
- Drift note: Current source inventory has expanded since the public HUD signoff docket; this packet checks the current generated inventory but does not widen the Agent 6 accepted boundary.

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
- 1287 generated page(s) import reader-workbench.js without an observable cache-busting query string

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

