# Agent 4 Live Deuteronomy Pre-Swap Evidence

Generated: 2026-06-02T00:07:33Z

## Scope

- Live URL checked: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`
- Live runtime checked: `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`
- Local page checked: `tanakh/deuteronomy/index.html`
- Boundary: pre-swap evidence only. This does not deploy, clear live runtime, prove browser-click behavior, accept publication readiness, accept source/provenance custody, or accept translation text.

## Live Result

- Live Deuteronomy HTTP status: 200.
- Live Deuteronomy `Last-Modified`: `Sat, 30 May 2026 16:38:31 GMT`.
- Live Deuteronomy `ETag`: `"6a1b1287-13bc24"`.
- Live Deuteronomy `Cache-Control`: `max-age=600`.
- Live `assets/js/reader-workbench.js` HTTP status: 404.
- Live old-HUD markers found:
  - `Clicked Hebrew form`
  - `sourceSummary =`
  - `No lexical entry yet.`
  - `allowLowConfidenceFallback`
- Live current-HUD markers not found by the marker grep:
  - `Route HUD`
  - `reader-workbench.js`
  - `selectRouteAnswer`
  - `lookupCandidateTreatments`

## Local Result

- `node scripts\validate_route_hud_page.mjs --page tanakh\deuteronomy\index.html` passed.
- Local Deuteronomy contains current HUD markers:
  - `Route HUD`
  - `selectRouteAnswer`
  - `lookupCandidateTreatments`
  - `Usage evidence`
  - `Sources and licenses`
  - `reader-workbench.js`
- Local Deuteronomy old marker grep did not return:
  - `Clicked Hebrew form`
  - `Best actual hit`
  - `data-hud-renderings`

## Interpretation

This confirms Agent 6's blocker remains a live deployment/runtime drift issue, not a local render drift issue. The local route-HUD page is current and valid, while the deployed live page is stale old-HUD HTML and the deployed Reader Workbench runtime asset is missing.

## Smallest Next Action

Use the already docketed Deuteronomy Tier 1 swap set from `reports/agent5-live-deuteronomy-deploy-swap-packet-2026-06-01.md` / `reports/agent7-deuteronomy-minimal-swap-manifest-2026-06-01.md`, then produce post-swap live evidence for Agent 6. Do not bundle Genesis, `/hud-preview/`, source custody, broad route shards, publication, or unrelated cleanup into this Deuteronomy P0 packet.
