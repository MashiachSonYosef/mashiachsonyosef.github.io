# Agent 5 Deuteronomy Deployment Source-Of-Truth Packet

Generated: 2026-06-02T12:55:00Z

## Result

`deployment_source_of_truth_packet_ready`

Agent 6 docket `reports/agent6-live-deuteronomy-post-swap-runtime-recheck-2026-06-02.md` WARN-ACCEPTED live Deuteronomy static HTTP post-swap evidence only. The prior Deuteronomy-specific live old-HUD marker blocker is downgraded for the exact Deuteronomy page and exact static dependency set.

Control wording now required:

`warn_accepted_live_deuteronomy_static_http_current_hud_old_markers_absent_browser_click_and_source_of_truth_open`

This packet identifies the deploy source for the live Deuteronomy swap and records the remaining open boundaries.

## Source Of Truth

- Worktree: `.codex-tmp/hud-deploy-live`
- Branch: `codex/hud-deuteronomy-live`
- Deployed Pages build version: `b198239171c4b7191bd2796cf5da1230f2aa0281`
- Commit message: `Publish HUD Pages artifact sparsely`
- Prior bounded artifact commit: `22f57508a03bdebab65db0db767e10131986ac74` (`Deploy lightweight Deuteronomy HUD`)
- Workflow: `.github/workflows/deploy-lightweight-pages.yml`
- Workflow name: `Deploy Lightweight Pages`
- Run ID: `26819165730`
- Build job: `79068769394`
- Deploy job: `79068798762`
- Deployment ID: `4903992349`
- Environment URL: `https://mashiachsonyosef.github.io/`

Current worktree caveat: `.codex-tmp/hud-deploy-live` is dirty after the deployed commit with modified `data/definitions/hud-route-lookup/manifest.json` and `tanakh/deuteronomy/index.html`. Hashes below are from the committed deployed build version `b198239171c4b7191bd2796cf5da1230f2aa0281`, not from dirty worktree files.

## Lightweight Workflow Artifact Scope

The workflow sparse-checkout and `.site` build publish only:

- `.nojekyll`
- `index.html`
- `tanakh/deuteronomy/index.html`
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`
- `data/public-hud/deuteronomy/**`

The workflow does not publish the full corpus, broad generated site, full lexical/source datasets, Genesis drift remediation, or `/hud-preview/` remediation.

## Committed Artifact Hashes

Hashes are SHA-256 over `git show b198239171c4b7191bd2796cf5da1230f2aa0281:<path>` bytes.

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `.nojekyll` | 1 | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` |
| `index.html` | 658257 | `43bfb1d38e6d514b37bb2c947062ecb4d04a2591ca12f6789abb91afd4ea7e31` |
| `tanakh/deuteronomy/index.html` | 1313900 | `3880722a9fc1e70bff9e1ec060ebf37a18fcba9d982c489cc33f2cfdc00b6c5c` |
| `assets/css/reader-workbench.css` | 2745 | `5db7287ff1cc5d8f595f077ed9d9ce571c8b5163c2245a14fb33f119bcb3eb63` |
| `assets/js/reader-workbench.js` | 62435 | `f247ca084a77c66d3fcd3603e172e1a4a75c912209aa184a3168e1d1060a8fa4` |
| `data/public-hud/deuteronomy/manifest.json` | 824 | `3a2b39e72e1f6b1ec389e6266fa92f51c6cf4cd3e8c802051510c0d9d4816295` |
| `data/public-hud/deuteronomy/occurrences.json` | 665725 | `aefea5117a1ecf4049d6276ea14dd7790df135dee494a9d280c634477d32b4d5` |
| `data/public-hud/deuteronomy/chunks/deuteronomy-001.json` | 13291 | `33e5e9c2649ea60ac5954996e9666eda490caec35a6102c8f1acf480e86e1dc2` |
| `data/public-hud/deuteronomy/route-lookup/manifest.json` | 496 | `6cfbae11553f52b028ce289abbd2f972b40f8c2664cf99d58033ee121a68db16` |
| `data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json` | 179423 | `46fec0bed4662adcbae74e00b9b4d2eb57865cf7eaf6bce318130e3e6501562a` |

The committed Deuteronomy page hash `3880722a9fc1e70bff9e1ec060ebf37a18fcba9d982c489cc33f2cfdc00b6c5c` matches Agent 6's live cache-busted Deuteronomy page hash in `reports/agent6-live-deuteronomy-post-swap-runtime-recheck-2026-06-02.md`.

## Current Deuteronomy Control State

- Deuteronomy exact live old-HUD marker blocker is downgraded to warning for the exact page and exact static HTTP dependency set.
- Do not keep describing live Deuteronomy as still serving old HUD unless a newer probe contradicts Agent 6's docket.
- Remaining open: live browser-click proof, fallback/query/storage/stale-bundle proof, deployed source-of-truth review for `data/public-hud/deuteronomy/**`, source/provenance custody, publication, route publication support, Definition authority, product/data gates, and accepted text.
- Genesis and `/hud-preview/` remain separate public-runtime drift/quarantine intake and are not included in Deuteronomy acceptance.

## Agent 4 Checkpoint Condition

Prepare an Agent 4 packet only if Agent 6, Agent 7, or the user requests the next Deuteronomy runtime step, or if Agent 4 is idle at a safe natural checkpoint and the packet is limited to live Deuteronomy browser-click proof.

Allowed Agent 4 scope if routed: exact Deuteronomy live URL, browser/device/timestamp, click-to-HUD behavior for token `tok-21613e763fe6`, source/license/citation row visibility after interaction, route shard load behavior, hard-refresh/cache-busting behavior, and negative proof that old-HUD fallback/query/storage activation does not reappear.

Forbidden Agent 4 scope: Genesis, `/hud-preview/`, source custody, publication, broad rollout, broad render, or general runtime acceptance.

## What Must Not Be Accepted

- public/runtime acceptance
- live browser-click acceptance
- deployment/CDN/cache closure
- stale-bundle/fallback closure
- source/provenance custody
- source publication
- publication readiness
- publication-path support
- route publication support
- Definition authority
- usage-as-definition authority
- Reader Workbench broad rollout
- product/data gate acceptance
- translation output
- accepted translation text
- Genesis or `/hud-preview/` status as Deuteronomy acceptance

Publication remains `blocked_no_render`.
