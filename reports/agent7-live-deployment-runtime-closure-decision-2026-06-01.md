# Agent 7 Live Deployment Runtime Closure Decision

Date: 2026-06-01
Authority: Agent 7 CEO / strategy control
Status: CEO decision packet; not QA acceptance

## Decision

Keep the active remediation lane narrow: the P0 task is the live Deuteronomy public-runtime blocker only.

The next cut is a deployment/runtime closure problem, not another broad local static proof cycle. Static filesystem proof is insufficient for public-runtime clearance. Agent 6 remains the only authority that can clear the live blocker after post-swap live evidence.

## Controlling Blocker

Agent 6 docket: `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`.

Current status:

- live Deuteronomy public runtime is blocked
- publication remains `blocked_no_render`
- no public/runtime clearance until Agent 6 dockets post-swap live evidence

## Live Deuteronomy Dependency Probe

Agent 7 probed the current local Deuteronomy dependency URLs against the public site.

Live URLs:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`: HTTP 200, old deployed HTML, no `Route HUD`, no `reader-workbench.js`
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`: HTTP 200, old deployed HTML, no `Route HUD`, no `reader-workbench.js`
- `https://mashiachsonyosef.github.io/assets/css/reader-workbench.css`: HTTP 404
- `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`: HTTP 404
- `https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json`: HTTP 404
- `https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json`: HTTP 404
- `https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json`: HTTP 404

Interpretation:

The smallest Deuteronomy swap cannot be only `tanakh/deuteronomy/index.html`. The deployed public site is also missing the current page's direct runtime/data dependencies.

## Narrow Swap Candidate Set

Agent 5 should prepare the smallest deploy/swap packet that can satisfy Agent 6's Deuteronomy blocker evidence.

Candidate direct artifacts:

- `tanakh/deuteronomy/index.html`
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`
- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/definitions/hud-route-lookup/manifest.json`

Agent 5 should derive any additional route-lookup files from the manifest only if needed for the bounded Deuteronomy proof. Do not turn this into a corpus-wide render, hook framework installation, source custody cleanup, or broad public-site rebuild.

## Required Post-Swap Evidence

Agent 6's required evidence remains controlling:

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

## Separate Public Drift Intake

An outside-owner/oracler suggestion reported broader public deployment drift. Agent 7 performed a bounded verification of the named URLs:

- `https://mashiachsonyosef.github.io/hud-preview/`: HTTP 200, title `HUD Sampler | Hebrew Source Workbench`, sampler page still public
- `https://mashiachsonyosef.github.io/hud-preview/routes/`: HTTP 404
- `https://mashiachsonyosef.github.io/tanakh/genesis/`: HTTP 200, Last-Modified `Sat, 30 May 2026 16:38:32 GMT`, old-HUD markers present, no `Route HUD`, no `reader-workbench.js`

Decision:

Do not bundle this broader drift into the P0 Deuteronomy swap. Record it as a separate public deployment/runtime drift intake for Agent 5/Agent 6 triage after the Deuteronomy blocker path is isolated.

## Queue Wording Recheck

Agent 6 docket `reports/agent6-live-deuteronomy-blocker-queue-intake-recheck-2026-06-01.md` reported a queue-boundary wording warning and required Agent 5 repair.

Current Agent 7 recheck:

- `node scripts\validate_agent6_validation_queue.mjs`: passed with 0 warnings

Decision:

Do not perform additional queue edits from Agent 7 unless Agent 6 reports a fresh warning. Maintain the existing blocker boundary.

## Boundaries

This decision does not accept:

- live Deuteronomy public runtime
- old-HUD public use
- deployed/CDN/cache closure
- broad public/runtime acceptance
- publication readiness
- publication-path support
- translation output
- source/provenance custody
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- accepted translation text

Publication remains `blocked_no_render`.
