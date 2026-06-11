# Agent 4 Live Ruth Browser Runtime Evidence

Generated: 2026-06-03T12:36:24.948Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- Scope is Ruth candidate public reader surface #6 only: `https://mashiachsonyosef.github.io/tanakh/ruth/`.
- Forbidden scope: non-Ruth routes, `/hud-preview/`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.
- Highest permissible claim: evidence-ready for Agent 6.

## Summary

- Status: warn_live_ruth_runtime_evidence
- pass: static_http_current_no_old
- pass: click_to_hud_opened
- pass: source_license_visible_after_click
- pass: route_shard_loaded_after_click
- pass: hard_refresh_current_no_old
- pass: query_negative_no_old
- pass: storage_negative_no_old
- Issues: 0
- Warnings: 1
- Screenshot: `reports/agent4-ruth-live-browser-click-proof-2026-06-03.png`

## Static HTTP / Cache-Busted Page

- URL: `https://mashiachsonyosef.github.io/tanakh/ruth/?agent4_static=1780490184950`
- HTTP: 200
- Bytes: 130196
- SHA-256: `fea7011a5419a1ea63471f2b4f3c52f161d578e90e4c180e93b7974ec293f943`
- Last-Modified: Wed, 03 Jun 2026 12:31:39 GMT
- Cache-Control: max-age=600
- Current markers: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/ruth
- Old-HUD markers: none

## Click-To-HUD Behavior

- Clicked token: וַיְהִ֗י
- Token dataset lexical index: tok-e1e6213a83a3
- Target token id: tok-e1e6213a83a3
- Target token found: true
- Tried tokens before source/license HUD: 1
- HUD open: true
- HUD title: Route HUD: וַיְהִ֗י
- HUD role / aria-modal: dialog / not set
- Source footnote rows visible: 3
- Sources and licenses visible: true
- Route cards visible: 8
- Old-HUD markers after click: none

## Route Shard Load Behavior

- Route manifest responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/ruth/route-lookup/manifest.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:40 GMT diskCache=false
- Route shard responses: 2
- 200 https://mashiachsonyosef.github.io/data/public-hud/ruth/route-lookup/shards/05d5-05d9-05d4.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:40 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/data/public-hud/ruth/route-lookup/shards/05d9-05d4-05d9.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:40 GMT diskCache=false
- Failed interesting statuses: 0

## Hard Refresh / Cache-Busting

- Page old-HUD markers after ignore-cache reload: none
- Page current markers after ignore-cache reload: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/ruth
- Runtime responses observed: 2
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:40 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:40 GMT diskCache=false

## Negative Controls

- Query-string old-HUD marker hits after click: none
- Query-string HUD open: true
- Poisoned localStorage keys: routeHudInlineGlossMode, hud, oldHud, reader-workbench-state
- IndexedDB control write: {"supported":true,"wrote_control_row":true}
- Storage old-HUD marker hits after reload/click: none
- Storage HUD open: true

## Source / License / Citation Sample

- 1. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-ea34505c6d723435 | CC BY-SA 4.0 / GFDL
- 2. Abudarham. Lisbon, 1489. | source-version-03b64afe2cc6056e | Public Domain
- 3. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-f439128a332b5eae | CC BY-SA 4.0 / GFDL

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
- completed proof packet: `reports/agent4-ruth-live-browser-click-proof-2026-06-03.md`
- json: `reports/agent4-ruth-live-browser-click-proof-2026-06-03.json`
- screenshot: `reports/agent4-ruth-live-browser-click-proof-2026-06-03.png`
- blockers: none
- next action needed: Agent 6 review; Agent 4 does not self-accept.
- continue condition: continue only for explicitly routed bounded candidate-surface runtime proof.

