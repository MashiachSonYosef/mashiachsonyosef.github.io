# Agent 10 HUD Lightweight Deploy Plan

Timestamp: 2026-06-02T07:46:04-04:00

Owner: Agent 10 IT

## Scope

Bounded Deuteronomy public-runtime deployment only.

This packet follows Agent 6 directive `reports/agent6-live-runtime-proof-loop-stop-directive-2026-06-02.md` and Agent 7 ingest `reports/agent7-live-runtime-proof-loop-stop-ingest-2026-06-02.md`: no further equivalent pre-swap proof loop; produce deploy/swap execution evidence or an exact delivery blocker.

## Change Intent

Make the Deuteronomy HUD replacement deployable without publishing the full local data corpus.

The full lexical, source, route, build, report, and script trees remain local in `C:\Users\owner\Documents\translations`. The public artifact carries only the bounded Deuteronomy HUD runtime slice needed for live proof.

## Public Runtime Files Added Or Changed

- `tanakh/deuteronomy/index.html`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `data/public-hud/deuteronomy/occurrences.json`
- `data/public-hud/deuteronomy/manifest.json`
- `data/public-hud/deuteronomy/chunks/deuteronomy-001.json`
- `data/public-hud/deuteronomy/route-lookup/manifest.json`
- `data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`
- `.github/workflows/deploy-lightweight-pages.yml`

## Bounded Sentinel

- token id: `tok-21613e763fe6`
- surface: `אֵ֣לֶּה`
- normalized: `אלה`
- normalized codepoints: `05d0 05dc 05d4`
- route shard: `05d0-05dc-05d4`

## Guardrails

- No Genesis remediation bundled.
- No `/hud-preview/` remediation bundled.
- No all-shard route lookup deployment.
- No full `data/lexical` public deployment.
- No source/provenance, publication readiness, product/data acceptance, or old-HUD public-use acceptance claim.

## Deployment Mechanism

Use a clean sparse branch from current `origin/main`, not dirty local `main`.

The new workflow builds `.site` with `rsync` and excludes heavy/local-only trees:

- `data/build/`
- `data/catalog/`
- `data/import-cache/`
- `data/lexical/`
- `data/public-lexical/`
- `data/reports/`
- `data/search/`
- `data/sources/`
- `data/definitions/hud-route-lookup/`
- `reports/`
- `scripts/`

## Required Post-Swap Evidence

Agent 10 must provide Agent 6 with live headers, dependency HTTP statuses, `Route HUD` marker presence, old HUD marker absence, public runtime asset availability, hard-refresh/cache-busting result, local-vs-live comparison, workflow/deployment status, and exact deployed file list.

## Local Pre-Push Runtime Probe

Timestamp: 2026-06-02T07:46-04:00 session window

Local server: `http://127.0.0.1:8765/` serving sparse deploy worktree `.codex-tmp/hud-deploy-live`.

Commands/checks:

- `node scripts/validate_route_hud_page.mjs --page .codex-tmp/hud-deploy-live/tanakh/deuteronomy/index.html`: PASS.
- Static marker scan:
  - `Route HUD`: 3
  - `Clicked Hebrew form`: 0
  - `reader-workbench.js`: 1
  - old Deuteronomy lexical/route dependency paths: 0
  - `data/public-hud/deuteronomy`: 6
- Headless Chromium sentinel click:
  - clicked selector: `[data-lexical-index="tok-21613e763fe6"]`
  - HUD title: `Route HUD: אֵ֣לֶּה`
  - HUD hidden: false
  - route cards rendered: 53
  - answer-eligible cards: 3
  - first-card rank basis: `raw 100 / handicap 20 / adjusted 80`
  - old `Clicked Hebrew form`: false
  - old `Best actual hit`: false
  - `data-hud-renderings`: 0
  - browser console/page errors: 0

Local dependency responses during click:

- `/assets/css/reader-workbench.css`: 200
- `/assets/js/reader-workbench.js`: 200
- `/data/public-hud/deuteronomy/occurrences.json`: 200
- `/data/public-hud/deuteronomy/manifest.json`: 200
- `/data/public-hud/deuteronomy/chunks/deuteronomy-001.json`: 200
- `/data/public-hud/deuteronomy/route-lookup/manifest.json`: 200
- `/data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`: 200

Runtime repair included:

- `assets/js/reader-workbench.js` now binds site click/keyboard/close/position handlers immediately after `siteApi` is ready and guards duplicate binding with `document.documentElement.dataset.readerWorkbenchEventsBound`.
- This fixes the observed local condition where automatic initialization wrapped tokens but the click handler was not reliably attached before the page became interactive.
