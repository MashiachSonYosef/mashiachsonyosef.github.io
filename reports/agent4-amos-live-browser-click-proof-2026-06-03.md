# Agent 4 Live Amos Browser Runtime Evidence

Generated: 2026-06-03T12:38:34.255Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- Scope is Amos candidate public reader surface #8 only: `https://mashiachsonyosef.github.io/tanakh/amos/`.
- Forbidden scope: non-Amos routes, `/hud-preview/`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.
- Highest permissible claim: evidence-ready for Agent 6.

## Summary

- Status: warn_live_amos_runtime_evidence
- pass: static_http_current_no_old
- pass: click_to_hud_opened
- pass: source_license_visible_after_click
- pass: route_shard_loaded_after_click
- pass: hard_refresh_current_no_old
- pass: query_negative_no_old
- pass: storage_negative_no_old
- Issues: 0
- Warnings: 1
- Screenshot: `reports/agent4-amos-live-browser-click-proof-2026-06-03.png`

## Static HTTP / Cache-Busted Page

- URL: `https://mashiachsonyosef.github.io/tanakh/amos/?agent4_static=1780490314256`
- HTTP: 200
- Bytes: 205563
- SHA-256: `ce920a6b68c7256c926c6d453a580093f880b391d2c8d2376962c4fecece6733`
- Last-Modified: Wed, 03 Jun 2026 12:31:39 GMT
- Cache-Control: max-age=600
- Current markers: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/amos
- Old-HUD markers: none

## Click-To-HUD Behavior

- Clicked token: דִּבְרֵ֣י
- Token dataset lexical index: tok-38310e4cbc3b
- Target token id: tok-38310e4cbc3b
- Target token found: true
- Tried tokens before source/license HUD: 1
- HUD open: true
- HUD title: Route HUD: דִּבְרֵ֣י
- HUD role / aria-modal: dialog / not set
- Source footnote rows visible: 5
- Sources and licenses visible: true
- Route cards visible: 7
- Old-HUD markers after click: none

## Route Shard Load Behavior

- Route manifest responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/amos/route-lookup/manifest.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:39 GMT diskCache=false
- Route shard responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/amos/route-lookup/shards/05d3-05d1-05e8.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:31:39 GMT diskCache=false
- Failed interesting statuses: 0

## Hard Refresh / Cache-Busting

- Page old-HUD markers after ignore-cache reload: none
- Page current markers after ignore-cache reload: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/amos
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

- 1. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-a2b226da3dd99722 | CC BY-SA 4.0 / GFDL
- 2. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-40c5e66f816f94a7 | CC BY-SA 4.0 / GFDL
- 3. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-8bd9f2824281d555 | CC BY-SA 4.0 / GFDL
- 4. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-edce1de08abedfe3 | CC BY-SA 4.0 / GFDL
- 5. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-b45858f823a1b48e | CC BY-SA 4.0 / GFDL

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
- completed proof packet: `reports/agent4-amos-live-browser-click-proof-2026-06-03.md`
- json: `reports/agent4-amos-live-browser-click-proof-2026-06-03.json`
- screenshot: `reports/agent4-amos-live-browser-click-proof-2026-06-03.png`
- blockers: none
- next action needed: Agent 6 review; Agent 4 does not self-accept.
- continue condition: continue only for explicitly routed bounded candidate-surface runtime proof.

