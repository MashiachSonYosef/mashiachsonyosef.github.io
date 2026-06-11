# Agent 6 Live Deuteronomy Old-HUD Public Runtime Blocker

Date: 2026-06-01
Authority: Agent 6 independent QA/compliance
Gate: `hud_runtime_license_risk_gate` / `public_runtime_surface_gate`
Verdict: BLOCKER for live deployed Deuteronomy public runtime
Risk classification: public/runtime license-provenance blocker

## Scope Reviewed

- Live URL: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
- Live URL: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`
- Live runtime URL: `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`
- Local file: `tanakh/deuteronomy/index.html`
- Escalation packet: `reports/agent7-live-old-hud-deuteronomy-escalation-2026-06-01.md`
- Hook constraint packet: `reports/agent7-hook-governance-before-live-hud-swap-2026-06-01.md`
- Prior Agent 6 old-HUD docket: `reports/agent6-old-hud-dynamic-fallback-killswitch-verdict-2026-06-01.md`

## Live Evidence

Live probe results:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
  - HTTP status: 200
  - length: 1,174,641
  - ETag: `"6a1b1287-13bc24"`
  - Cache-Control: `max-age=600`
  - Last-Modified: `Sat, 30 May 2026 16:38:31 GMT`
  - `Clicked Hebrew form`: present
  - `Route HUD`: absent
  - `reader-workbench.js`: absent
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`
  - HTTP status: 200
  - length: 1,174,641
  - ETag: `"6a1b1289-13bc24"`
  - Cache-Control: `max-age=600`
  - Last-Modified: `Sat, 30 May 2026 16:38:33 GMT`
  - `Clicked Hebrew form`: present
  - `Route HUD`: absent
  - `reader-workbench.js`: absent
- `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`
  - HTTP result: 404 Not Found

Local comparison:

- `tanakh/deuteronomy/index.html`
  - length: 1,330,207
  - `Route HUD`: present
  - `Clicked Hebrew form`: absent
  - `reader-workbench.js`: present
  - script sources include:
    - `../../data/lexical/occurrences/deuteronomy.json`
    - `../../assets/js/reader-workbench.js`

## Finding

### BLOCKER: Live Deuteronomy Is Serving Old HUD

Owning lane: Agent 5 / Agent 7 deployment coordination; Agent 4 may provide runtime proof if requested

Evidence:
- The live Deuteronomy page contains the old-HUD marker `Clicked Hebrew form`.
- The live Deuteronomy page does not contain the current `Route HUD` marker.
- The live Deuteronomy page does not import `reader-workbench.js`.
- The expected live runtime asset `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js` returns 404.
- The local Deuteronomy page has current Route HUD markup and imports the current Reader Workbench runtime.

Interpretation:
- The previous Agent 6 old-HUD docket remains valid only for repository-file static plus simulated dynamic evidence.
- That docket explicitly did not accept live browser/deployment/CDN/cache proof.
- Live deployed Deuteronomy currently contradicts any claim that the public runtime is clean for this page.

Acceptance condition:
- Live Deuteronomy must be updated through the smallest deploy/swap path so the deployed page and required runtime assets match the current validated HUD boundary.

## Required Remediation Evidence

Before Agent 6 can clear this live public-runtime blocker, provide a narrow post-swap packet with:

- exact live URL tested
- timestamp
- live page HTTP status, ETag, Last-Modified, and Cache-Control
- live marker proof:
  - `Route HUD`: present
  - `Clicked Hebrew form`: absent
  - `Best actual hit`: absent
  - `data-hud-renderings`: absent
- live script proof that the current runtime path is imported
- live runtime asset HTTP 200 proof for `assets/js/reader-workbench.js` or a deliberately versioned replacement URL
- proof that hard refresh or cache-busting URL no longer exposes old-HUD Deuteronomy
- comparison against local `tanakh/deuteronomy/index.html`
- no unrelated hook/framework/broad cleanup included in the pre-swap path

Live browser-click proof is still preferred for final public-runtime closure, but the immediate blocker can be reduced first by proving the deployed HTML and runtime asset are no longer old/stale.

## What Must Not Be Accepted

This docket does not accept:

- old-HUD public use
- live Deuteronomy public runtime
- deployed/CDN/cache closure
- broad public/runtime acceptance
- source/provenance custody
- publication readiness
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text

Publication remains `blocked_no_render`.

## Required Next Action

Agent 5:
- Record this as a live public-runtime blocker.
- Do not treat the old-HUD repository/static WARN docket as live deployment clearance.
- Prepare the smallest deploy/swap remediation packet; do not bundle hooks, broad cleanup, source custody, or unrelated worker tasks.

Agent 7:
- Keep strategy constrained to the smallest live-HUD swap path.
- Do not make hook infrastructure a prerequisite for this blocker.

Agent 4:
- Only if routed by Agent 5/7, provide bounded post-swap live/browser proof or runtime proof for this exact Deuteronomy URL.
