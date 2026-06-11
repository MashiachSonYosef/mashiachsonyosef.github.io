# Agent 6 Live Deuteronomy Public Runtime Recheck

Generated: 2026-06-02T00:20:45Z

Authority: Agent 6 independent QA/compliance

Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate`

Verdict: BLOCKER PRESERVED for live Deuteronomy public runtime.

Risk classification: P0 public/runtime license-provenance blocker.

## Scope

This is a live-state recheck after:

- `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`
- `reports/agent6-live-deuteronomy-deploy-swap-packet-verdict-2026-06-01.md`
- `reports/agent4-live-deuteronomy-pre-swap-evidence-2026-06-01.md`

This recheck does not accept public/runtime clearance, old-HUD public use, source/provenance custody, publication readiness, Definition authority, route publication support, product/data gates, or accepted translation text.

Publication remains `blocked_no_render`.

## Independent Live Probe

Command method: Node `fetch` probe from Agent 6 thread with no-cache request headers.

Checked at: `2026-06-02T00:20:45.646Z`

### Live pages

`https://mashiachsonyosef.github.io/tanakh/deuteronomy/`

- HTTP status: 200
- ETag: `W/"6a1b1287-13bc24"`
- Last-Modified: `Sat, 30 May 2026 16:38:31 GMT`
- Cache-Control: `max-age=600`
- Content-Type: `text/html; charset=utf-8`
- Length: 1,174,641
- `Route HUD`: absent
- `Clicked Hebrew form`: present
- `reader-workbench.js`: absent
- `lexical-hud`: present
- `No lexical entry yet.`: present
- `sourceSummary`: present
- `allowLowConfidenceFallback`: present

`https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`

- HTTP status: 200
- ETag: `W/"6a1b1288-13bc24"`
- Last-Modified: `Sat, 30 May 2026 16:38:32 GMT`
- Cache-Control: `max-age=600`
- Content-Type: `text/html; charset=utf-8`
- Length: 1,174,641
- `Route HUD`: absent
- `Clicked Hebrew form`: present
- `reader-workbench.js`: absent
- `lexical-hud`: present
- `No lexical entry yet.`: present
- `sourceSummary`: present
- `allowLowConfidenceFallback`: present

### Live direct dependencies

- `https://mashiachsonyosef.github.io/assets/css/reader-workbench.css`: HTTP 404
- `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`: HTTP 404
- `https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json`: HTTP 404
- `https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json`: HTTP 404
- `https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json`: HTTP 404

## Local Counter-Evidence

Independent local hash check confirms the bounded pre-swap artifacts are still present and current:

- `tanakh/deuteronomy/index.html`: 1,330,207 bytes, SHA-256 `206cb710e612fbd6bf75c5b96280bfaecd625c2fec4ee5636021bfce3615e7af`; `Route HUD` present; `Clicked Hebrew form` absent; `reader-workbench.js` present.
- `assets/css/reader-workbench.css`: 2,745 bytes, SHA-256 `5db7287ff1cc5d8f595f077ed9d9ce571c8b5163c2245a14fb33f119bcb3eb63`.
- `assets/js/reader-workbench.js`: 62,210 bytes, SHA-256 `475c39298c72df954d5ef00f677b31629d0600ec756ef1a437f4cfddb`.
- `data/lexical/deuteronomy.manifest.json`: 301,338 bytes, SHA-256 `1e46356cb33537236f190c520020f82bfb1bfc4cedeb37356ba809f1af704562`.
- `data/lexical/occurrences/deuteronomy.json`: 403,486 bytes, SHA-256 `75f17120b905a359c00a9fba9182fcd332438ace0c0d6f24a0796a95a524872c`.
- `data/definitions/hud-route-lookup/manifest.json`: 1,600,063 bytes, SHA-256 `3d0c5cb147e3b87e63a032a69802174f86b4eb3aff41ed6037ae758a14dded7a`.
- `data/lexical/deuteronomy-chunks/deuteronomy-001.json`: 1,123,728 bytes, SHA-256 `18c98419a8fb5a76a751c2fe47fab5229d4f43b404a1d183e776d5d46ea80a4d`.
- `data/definitions/hud-route-lookup/shards/05d0-05dc-05d4.json`: 1,100,637 bytes, SHA-256 `4e308eddcd399e6115e315eb0f7c37b0ee867cf6424734f59ef775dae52a2852`.

Interpretation: this is still deployment/runtime drift, not proof that the local bounded Deuteronomy artifact set is stale.

## Finding

### BLOCKER: Live Deuteronomy still serves old HUD and lacks required current dependencies

Owner: Agent 5 / Agent 7 deployment coordination. Agent 4 may provide bounded post-swap proof if routed.

Evidence:

- Both live Deuteronomy URLs return HTTP 200 but still expose old-HUD markers.
- Both live Deuteronomy URLs lack the current `Route HUD` marker and `reader-workbench.js` reference.
- The direct current runtime/data dependency URLs all return HTTP 404.
- Local Deuteronomy has current HUD markers and the previously validated artifact hashes.

Acceptance condition:

- A post-swap live evidence packet must prove both live Deuteronomy URLs no longer expose old-HUD markers, current direct runtime/data dependencies are reachable, cache-busting or hard-refresh checks do not reveal stale old-HUD HTML, and local-vs-live hashes/markers align with the bounded Tier 1 or Tier 2 scope.
- Agent 6 must issue a separate post-swap docket before live Deuteronomy public runtime is cleared.

## Required Next Action

Agent 5:

- Keep `agent6-live-deuteronomy-old-hud-public-runtime-blocker` active.
- Do not present `reports/agent6-live-deuteronomy-deploy-swap-packet-verdict-2026-06-01.md` as public/runtime clearance; it is pre-swap planning only.
- Prepare the next packet only after the bounded Deuteronomy swap actually happens.
- Include exact live URLs, timestamps, HTTP status, ETag, Last-Modified, Cache-Control, marker checks, dependency URL checks, cache-bust/hard-refresh evidence, deployed file list, hashes, and the Deuteronomy 1:1 sentinel codepoint identity if requesting click/runtime clearance.

Agent 7:

- Preserve Deuteronomy P0 as the active live blocker.
- Keep broader Genesis and `/hud-preview/` drift separate.
- Do not widen the pre-swap WARN into public/runtime acceptance.

Agent 4:

- Do not run another pre-swap proof cycle unless new deployment evidence appears.
- After a real swap, produce bounded post-swap runtime/click evidence if Agent 5/7 route that request.

## Not Accepted

- live Deuteronomy public/runtime clearance
- old-HUD public use
- deployment/CDN/cache closure
- broad public/runtime acceptance
- source/provenance custody
- source publication
- publication readiness
- publication-path support
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text
