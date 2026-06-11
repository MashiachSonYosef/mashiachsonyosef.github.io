# Agent 4 Live Deuteronomy Browser Runtime Evidence

Generated: 2026-06-02T13:53:46.191Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- Scope is live Deuteronomy only: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`.
- Forbidden scope: Genesis, `/hud-preview/`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.
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
- Screenshot: `reports/agent6-live-deuteronomy-current-hash-browser-proof-2026-06-02.png`

## Static HTTP / Cache-Busted Page

- URL: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/?agent4_static=1780408426193`
- HTTP: 200
- Bytes: 1313952
- SHA-256: `652ff9db31fa497844e64693cbb33fd5b3791e1bef8f2d7717f8e33fc1275cba`
- Last-Modified: Tue, 02 Jun 2026 13:42:54 GMT
- Cache-Control: max-age=600
- Current markers: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/deuteronomy
- Old-HUD markers: none

## Click-To-HUD Behavior

- Clicked token: אֵ֣לֶּה
- Token dataset lexical index: tok-21613e763fe6
- Tried tokens before source/license HUD: 1
- HUD open: true
- HUD title: Route HUD: אֵ֣לֶּה
- HUD role / aria-modal: dialog / true
- Source footnote rows visible: 6
- Sources and licenses visible: true
- Route cards visible: 56
- Old-HUD markers after click: none

## Route Shard Load Behavior

- Route manifest responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/manifest.json cache=max-age=600 lastModified=Tue, 02 Jun 2026 13:42:54 GMT diskCache=false
- Route shard responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json cache=max-age=600 lastModified=Tue, 02 Jun 2026 13:42:54 GMT diskCache=false
- Failed interesting statuses: 0

## Hard Refresh / Cache-Busting

- Page old-HUD markers after ignore-cache reload: none
- Page current markers after ignore-cache reload: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/deuteronomy
- Runtime responses observed: 2
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Tue, 02 Jun 2026 13:42:54 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Tue, 02 Jun 2026 13:42:54 GMT diskCache=false

## Negative Controls

- Query-string old-HUD marker hits after click: none
- Query-string HUD open: true
- Poisoned localStorage keys: routeHudInlineGlossMode, hud, oldHud, reader-workbench-state
- IndexedDB control write: {"supported":true,"wrote_control_row":true}
- Storage old-HUD marker hits after reload/click: none
- Storage HUD open: true

## Source / License / Citation Sample

- 1. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-c6d413a29dc15011 | CC BY-SA 4.0 / GFDL
- 2. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-4304736084fe98bf | CC BY-SA 4.0 / GFDL
- 3. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-ee422adcd4864ce1 | CC BY-SA 4.0 / GFDL
- 4. Abudarham. Lisbon, 1489. | source-version-03b64afe2cc6056e | Public Domain
- 5. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-9a8f74330bd7ee1e | CC BY-SA 4.0 / GFDL
- 6. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-b2d6e8a23425b59d | CC BY-SA 4.0 / GFDL

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

