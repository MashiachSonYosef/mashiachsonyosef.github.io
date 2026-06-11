# Agent 7 Live Old-HUD Deuteronomy Escalation

Date: 2026-06-01
Authority: Agent 7 CEO / priority authority
Trigger: user reported that Deuteronomy's live site still shows the old HUD
Status: Agent 6 BLOCKER ingested; CEO escalation packet; not QA acceptance

## Decision

Treat the reported live Deuteronomy old-HUD exposure as an active public-runtime BLOCKER until Agent 6 dockets post-swap live evidence.

This supersedes any interpretation that the issue is only a theoretical stale-bundle warning. The prior Agent 6 old-HUD docket remains valid only for repository-file static plus simulated dynamic/fallback kill-switch evidence. Live deployed Deuteronomy public runtime is blocked by `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`.

## Evidence Basis

- User report, 2026-06-01: Deuteronomy's live site still shows the old HUD.
- Local file checked: `tanakh/deuteronomy/index.html`.
- Local Deuteronomy page uses current `Route HUD` markup and imports `../../assets/js/reader-workbench.js`.
- The local import has no observable cache-busting query string.
- Agent 6 docket `reports/agent6-old-hud-dynamic-fallback-killswitch-verdict-2026-06-01.md` WARN-accepted repository/static plus simulated dynamic evidence only.
- The same Agent 6 docket explicitly did not accept live browser-click proof, deployed/CDN/stale-bundle proof, old-HUD public use, old-HUD fallback/rollback as a public feature, publication readiness, or route publication support.

## Live Probe Addendum

Agent 7 performed a bounded live probe after the user report.

Live URL tested:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`

Live result:

- HTTP status: 200
- title: `Deuteronomy`
- cache-control: `max-age=600`
- last-modified: `Sat, 30 May 2026 16:38:33 GMT` for directory URL
- last-modified: `Sat, 30 May 2026 16:38:32 GMT` for `index.html`
- live page length: 1,174,641 bytes
- live page contains `Route HUD`: no
- live page contains `reader-workbench.js`: no
- live page contains `upgrade_route_hud_pages`: no
- live page contains `hud-preview`: no
- live script list only included `https://raw.githubusercontent.com/MashiachSonYosef/mashiachsonyosef.github.io/main/data/lexical/occurrences/deuteronomy.json`

Local comparison:

- local file: `tanakh/deuteronomy/index.html`
- local page length: 1,330,207 bytes
- local page contains `Route HUD`: yes
- local page contains `reader-workbench.js`: yes
- local occurrence data reference: `../../data/lexical/occurrences/deuteronomy.json`

CEO interpretation:

The user report is confirmed as a deployed-state mismatch. Current local Deuteronomy has the current Route HUD path, while the live GitHub Pages Deuteronomy page is older May 30 HTML without the current HUD/runtime import. The immediate remediation lane should treat this as stale deployed HTML or stale deployment branch content before investigating broader JS/cache behavior.

## Agent 6 Blocker Ingest

Agent 6 docket: `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`.

Verdict: BLOCKER for live deployed Deuteronomy public runtime.

Additional Agent 6 evidence:

- live Deuteronomy contains old-HUD marker `Clicked Hebrew form`
- live Deuteronomy does not contain `Route HUD`
- live Deuteronomy does not import `reader-workbench.js`
- live `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js` returns 404

Required strategic correction:

- no hook framework before the swap
- no broad cleanup bundled into the swap
- no Agents 1-4 broad side quests
- smallest deploy/swap path that Agent 6 can validate
- no public/runtime clearance until Agent 6 dockets post-swap live evidence

Required post-swap evidence:

- exact live URL tested
- timestamp
- live page HTTP status, ETag, Last-Modified, and Cache-Control
- `Route HUD`: present
- `Clicked Hebrew form`: absent
- `Best actual hit`: absent
- `data-hud-renderings`: absent
- current runtime path imported
- live runtime asset HTTP 200 for `assets/js/reader-workbench.js` or a deliberately versioned replacement URL
- hard refresh or cache-busting URL no longer exposes old-HUD Deuteronomy
- comparison against local `tanakh/deuteronomy/index.html`
- no unrelated hook/framework/broad cleanup included in the pre-swap path

## Operating Boundary

Publication remains `blocked_no_render`.

The validated-only public/runtime rule controls this incident: if the live site exposes old HUD behavior that is not covered by Agent 6's accepted boundary, the live behavior is not accepted public runtime.

This packet does not request or imply:

- old-HUD public use acceptance
- public/runtime expansion
- route publication support
- Reader Workbench broad rollout
- Definition authority
- usage-as-definition authority
- source/provenance custody acceptance
- accepted translation text
- publication readiness

## Agent 5 Direction

Agent 5 should treat this as a priority live-deployment evidence capture and Agent 6 packet task, routed through normal coordination.

Required bounded evidence:

- exact live Deuteronomy URL tested
- device/browser and timestamp
- screenshot or live browser proof showing old HUD state
- network/runtime evidence for the served page and `reader-workbench.js` asset URL
- cache headers or equivalent deployed-bundle freshness evidence where obtainable
- whether hard refresh, cache clear, or versioned asset URL changes the observed HUD
- comparison against local `tanakh/deuteronomy/index.html` current-HUD markup

If Agent 5 cannot identify the live URL from repo/deploy context, request it from the user instead of expanding the investigation.

## Agent 6 Request Shape

After Agent 5 collects the bounded live evidence, submit a new Agent 6 docket request under `hud_runtime_license_risk_gate` / `public_runtime_surface_gate` for:

- live Deuteronomy old-HUD exposure disposition
- deployed/CDN/stale-bundle closure requirements
- whether a cache-busting/versioned-asset control is required before any deployed public-runtime closure claim

Requested verdict must be limited to incident disposition and deployment/runtime boundary. Do not request publication readiness or broader product/data acceptance.

## User Involvement

Needed if the live URL, browser/device context, or screenshot cannot be recovered by Agent 5 from available project/deploy context.
