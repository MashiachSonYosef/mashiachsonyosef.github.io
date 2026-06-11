# Agent 4 Live Deuteronomy Browser Runtime Evidence

Generated: 2026-06-04T23:30:12.429Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- Scope is live Deuteronomy only: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`.
- Forbidden scope: non-Deuteronomy routes, `/hud-preview/`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.
- Highest permissible claim: evidence-ready for Agent 6.

## Summary

- Status: warn_live_deuteronomy_runtime_evidence
- pass: static_http_current_no_old
- pass: click_to_hud_opened
- pass: source_license_visible_after_click
- pass: route_shard_loaded_after_click
- pass: hard_refresh_current_no_old
- pass: query_negative_no_old
- pass: storage_negative_no_old
- Issues: 0
- Warnings: 1
- Screenshot: `reports/agent4-live-deuteronomy-hud-click-2026-06-04.png`

## Static HTTP / Cache-Busted Page

- URL: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/?agent4_static=1780615812431`
- HTTP: 200
- Bytes: 1314688
- SHA-256: `28d13b2076621df395e9d863b8231212aa2a1f0142ad17f6ce73e2ce26c71cde`
- Last-Modified: Wed, 03 Jun 2026 15:45:22 GMT
- Cache-Control: max-age=600
- Current markers: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/deuteronomy
- Old-HUD markers: none

## Click-To-HUD Behavior

- Clicked token: אֵ֣לֶּה
- Token dataset lexical index: tok-21613e763fe6
- Target token id: not requested
- Target token found: false
- Tried tokens before source/license HUD: 1
- HUD open: true
- HUD title: Route HUD: אֵ֣לֶּה
- HUD role / aria-modal: dialog / true
- Source footnote rows visible: 3
- Sources and licenses visible: true
- Route cards visible: 6
- Old-HUD markers after click: none

## Route Shard Load Behavior

- Route manifest responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/manifest.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 15:45:22 GMT diskCache=false
- Route shard responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 15:45:22 GMT diskCache=false
- Failed interesting statuses: 0

## Hard Refresh / Cache-Busting

- Page old-HUD markers after ignore-cache reload: none
- Page current markers after ignore-cache reload: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/deuteronomy
- Runtime responses observed: 2
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 15:45:22 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 15:45:22 GMT diskCache=false

## Negative Controls

- Query-string old-HUD marker hits after click: none
- Query-string HUD open: true
- Poisoned localStorage keys: routeHudInlineGlossMode, hud, oldHud, reader-workbench-state
- IndexedDB control write: {"supported":true,"wrote_control_row":true}
- Storage old-HUD marker hits after reload/click: none
- Storage HUD open: true

## Source / License / Citation Sample

- 1. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-9a8f74330bd7ee1e | CC BY-SA 4.0 / GFDL
- 2. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-b2d6e8a23425b59d | CC BY-SA 4.0 / GFDL
- 3. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-eb80d299fef29a31 | CC BY-SA 4.0 / GFDL

## Issues

- none

## Warnings

- Runtime script URL is not visibly versioned/cache-busted in page markup; hard refresh/cache-busted navigation was tested, but CDN stale-bundle closure is not accepted.

## What Must Not Be Accepted

- Public/runtime acceptance.
- Old-HUD fallback closure.
- Source/provenance custody.
- Publication readiness.
- Route publication support.
- Definition authority.
- Usage-as-definition authority.
- Product/data gates.
- Accepted translation text.
- This Agent 4 packet as Agent 6 acceptance.

## Agent 8 Callback

- status: proof packet produced for Agent 6 review
- completed proof packet: `reports/agent4-live-deuteronomy-browser-runtime-evidence-2026-06-04.md`
- json: `reports/agent4-live-deuteronomy-browser-runtime-evidence-2026-06-04.json`
- screenshot: `reports/agent4-live-deuteronomy-hud-click-2026-06-04.png`
- blockers: none
- next action needed: Agent 6 review; Agent 4 does not self-accept.
- continue condition: continue only for explicitly routed bounded candidate-surface runtime proof.

