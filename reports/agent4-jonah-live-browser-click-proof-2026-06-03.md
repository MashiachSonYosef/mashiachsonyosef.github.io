# Agent 4 Live Jonah Browser Runtime Evidence

Generated: 2026-06-03T11:13:00.418Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- Scope is live Jonah only: `https://mashiachsonyosef.github.io/tanakh/jonah/`.
- Forbidden scope: non-Jonah routes, `/hud-preview/`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.
- Highest permissible claim: evidence-ready for Agent 6.

## Summary

- Status: warn_live_jonah_runtime_evidence
- pass: static_http_current_no_old
- pass: click_to_hud_opened
- pass: source_license_visible_after_click
- pass: route_shard_loaded_after_click
- pass: hard_refresh_current_no_old
- pass: query_negative_no_old
- pass: storage_negative_no_old
- Issues: 0
- Warnings: 1
- Screenshot: `reports/agent4-jonah-live-browser-click-proof-2026-06-03.png`

## Static HTTP / Cache-Busted Page

- URL: `https://mashiachsonyosef.github.io/tanakh/jonah/?agent4_static=1780485180452`
- HTTP: 200
- Bytes: 82350
- SHA-256: `9fcc784fe423f26f2a6a59880f7de40a9447bf4f8509ef6832d6bbd9d0079ae8`
- Last-Modified: Wed, 03 Jun 2026 11:13:11 GMT
- Cache-Control: max-age=600
- Current markers: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/jonah
- Old-HUD markers: none

## Click-To-HUD Behavior

- Clicked token: וַֽיְהִי֙
- Token dataset lexical index: tok-418aef103fcc
- Tried tokens before source/license HUD: 1
- HUD open: true
- HUD title: Route HUD: וַֽיְהִי֙
- HUD role / aria-modal: dialog / not set
- Source footnote rows visible: 3
- Sources and licenses visible: true
- Route cards visible: 8
- Old-HUD markers after click: none

## Route Shard Load Behavior

- Route manifest responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/jonah/route-lookup/manifest.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 11:13:12 GMT diskCache=false
- Route shard responses: 2
- 200 https://mashiachsonyosef.github.io/data/public-hud/jonah/route-lookup/shards/05d5-05d9-05d4.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 11:13:12 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/data/public-hud/jonah/route-lookup/shards/05d9-05d4-05d9.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 11:13:12 GMT diskCache=false
- Failed interesting statuses: 0

## Hard Refresh / Cache-Busting

- Page old-HUD markers after ignore-cache reload: none
- Page current markers after ignore-cache reload: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/jonah
- Runtime responses observed: 2
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 11:13:12 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 11:13:12 GMT diskCache=false

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

