# Agent 4 Live Zephaniah Browser Runtime Evidence

Generated: 2026-06-03T12:39:44.106Z

## Boundary

- Evidence only. Agent 4 does not self-accept.
- Scope is Zephaniah candidate public reader surface #10 only: `https://mashiachsonyosef.github.io/tanakh/zephaniah/`.
- Forbidden scope: non-Zephaniah routes, `/hud-preview/`, source custody, publication, broad rollout, fixes, deployments, and acceptance claims.
- Highest permissible claim: evidence-ready for Agent 6.

## Summary

- Status: warn_live_zephaniah_runtime_evidence
- pass: static_http_current_no_old
- pass: click_to_hud_opened
- pass: source_license_visible_after_click
- pass: route_shard_loaded_after_click
- pass: hard_refresh_current_no_old
- pass: query_negative_no_old
- pass: storage_negative_no_old
- Issues: 0
- Warnings: 1
- Screenshot: `reports/agent4-zephaniah-live-browser-click-proof-2026-06-03.png`

## Static HTTP / Cache-Busted Page

- URL: `https://mashiachsonyosef.github.io/tanakh/zephaniah/?agent4_static=1780490384108`
- HTTP: 200
- Bytes: 91132
- SHA-256: `028ffa536a92664a1f8e1046c65789649b7fd720bd62631e7dc139b0958f4f4f`
- Last-Modified: Wed, 03 Jun 2026 12:41:02 GMT
- Cache-Control: max-age=600
- Current markers: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/zephaniah
- Old-HUD markers: none

## Click-To-HUD Behavior

- Clicked token: אֲשֶׁ֣ר
- Token dataset lexical index: tok-97813d949fba
- Target token id: tok-97813d949fba
- Target token found: true
- Tried tokens before source/license HUD: 1
- HUD open: true
- HUD title: Route HUD: אֲשֶׁ֣ר
- HUD role / aria-modal: dialog / not set
- Source footnote rows visible: 3
- Sources and licenses visible: true
- Route cards visible: 6
- Old-HUD markers after click: none

## Route Shard Load Behavior

- Route manifest responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/zephaniah/route-lookup/manifest.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:41:01 GMT diskCache=false
- Route shard responses: 1
- 200 https://mashiachsonyosef.github.io/data/public-hud/zephaniah/route-lookup/shards/05d0-05e9-05e8.json cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:41:01 GMT diskCache=false
- Failed interesting statuses: 0

## Hard Refresh / Cache-Busting

- Page old-HUD markers after ignore-cache reload: none
- Page current markers after ignore-cache reload: Route HUD, selectRouteAnswer, lookupCandidateTreatments, Sources and licenses, source-footnotes, answer_eligible, answer_role, hud_route_lookup_manifest_url, data/public-hud/zephaniah
- Runtime responses observed: 2
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:41:01 GMT diskCache=false
- 200 https://mashiachsonyosef.github.io/assets/js/reader-workbench.js cache=max-age=600 lastModified=Wed, 03 Jun 2026 12:41:01 GMT diskCache=false

## Negative Controls

- Query-string old-HUD marker hits after click: none
- Query-string HUD open: true
- Poisoned localStorage keys: routeHudInlineGlossMode, hud, oldHud, reader-workbench-state
- IndexedDB control write: {"supported":true,"wrote_control_row":true}
- Storage old-HUD marker hits after reload/click: none
- Storage HUD open: true

## Source / License / Citation Sample

- 1. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-277afa4653f54980 | CC BY-SA 4.0 / GFDL
- 2. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-0b6874219c5a420f | CC BY-SA 4.0 / GFDL
- 3. Hebrew Wiktionary data via Kaikki/Wiktextract | kaikki-4d612b5683ecd1ec | CC BY-SA 4.0 / GFDL

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
- completed proof packet: `reports/agent4-zephaniah-live-browser-click-proof-2026-06-03.md`
- json: `reports/agent4-zephaniah-live-browser-click-proof-2026-06-03.json`
- screenshot: `reports/agent4-zephaniah-live-browser-click-proof-2026-06-03.png`
- blockers: none
- next action needed: Agent 6 review; Agent 4 does not self-accept.
- continue condition: continue only for explicitly routed bounded candidate-surface runtime proof.

