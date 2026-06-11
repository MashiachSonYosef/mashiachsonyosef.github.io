# Agent 6 Live Deuteronomy Runtime And Source-Of-Truth Verdict

Date: 2026-06-02
Authority: Agent 6 independent QA/compliance
Gate: `public_runtime_surface_gate` / `hud_runtime_license_risk_gate` / `validated_only_public_runtime_gate`
Verdict: WARN-ACCEPTED for exact live Deuteronomy current-HUD runtime surface only
Risk classification: public/runtime warning; no publication or product/data gate acceptance

## Scope

This docket adjudicates the two Deuteronomy packets submitted after Agent 6's static HTTP post-swap warning:

- `reports/agent5-deuteronomy-deployment-source-of-truth-packet-2026-06-02.md`
- `reports/agent4-live-deuteronomy-browser-runtime-evidence-2026-06-02.md`
- `reports/agent4-live-deuteronomy-browser-runtime-evidence-2026-06-02.json`
- `reports/agent4-live-deuteronomy-hud-click-2026-06-02.png`

Scope is limited to:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`
- the exact deployed sparse Pages artifact set for Deuteronomy current-HUD runtime

This docket does not accept Genesis, `/hud-preview/`, broad public/runtime rollout, source/provenance custody, publication readiness, route publication support, Definition authority, usage-as-definition authority, product/data gates, or accepted translation text.

Publication remains `blocked_no_render`.

## Evidence Reviewed

Agent 5 source-of-truth packet:

- Worktree: `.codex-tmp/hud-deploy-live`
- Branch: `codex/hud-deuteronomy-live`
- Deployed Pages build version: `b198239171c4b7191bd2796cf5da1230f2aa0281`
- Commit subject: `Publish HUD Pages artifact sparsely`
- Workflow: `.github/workflows/deploy-lightweight-pages.yml`
- Workflow run: `26819165730`
- Build job: `79068769394`
- Deploy job: `79068798762`
- Deployment ID: `4903992349`

Agent 4 live browser/runtime packet:

- Live scope: `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`
- Generated: `2026-06-02T13:00:42.428Z`
- Screenshot: `reports/agent4-live-deuteronomy-hud-click-2026-06-02.png`

Additional Agent 6 verification:

- Local git commit object exists at `.codex-tmp/hud-deploy-live`.
- GitHub commit API confirms `b198239171c4b7191bd2796cf5da1230f2aa0281` and shows sparse Pages workflow publishing only:
  - `.nojekyll`
  - `index.html`
  - `tanakh/deuteronomy/index.html`
  - `assets/css/reader-workbench.css`
  - `assets/js/reader-workbench.js`
  - `data/public-hud/deuteronomy/**`
- GitHub workflow jobs for run `26819165730` completed successfully:
  - `build` job `79068769394`: success
  - `deploy` job `79068798762`: success
- Direct live HTTP hash verification matched committed artifact hashes for the reviewed Deuteronomy runtime set.

## Source-Of-Truth Verification

Committed artifact hashes from `b198239171c4b7191bd2796cf5da1230f2aa0281`:

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

Live cache-busted URL hashes matched the same values for:

- `tanakh/deuteronomy/index.html`
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`
- `data/public-hud/deuteronomy/manifest.json`
- `data/public-hud/deuteronomy/occurrences.json`
- `data/public-hud/deuteronomy/chunks/deuteronomy-001.json`
- `data/public-hud/deuteronomy/route-lookup/manifest.json`
- `data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`

Worktree caveat:

- `.codex-tmp/hud-deploy-live` is dirty after the deployed commit with modified `data/definitions/hud-route-lookup/manifest.json` and `tanakh/deuteronomy/index.html`.
- This docket accepts the committed deployed artifact hash chain, not dirty worktree state after the deployed commit.

## Live Browser Runtime Evidence

Agent 4 evidence reports:

- Static HTTP current/no-old check: pass
- Click-to-HUD opened: pass
- Source/license visible after click: pass
- Route shard loaded after click: pass
- Hard refresh current/no-old: pass
- Query-string negative old-HUD activation: pass
- localStorage/IndexedDB poisoned-state negative old-HUD activation: pass
- Issues: 0
- Warnings: 1

Click evidence:

- Clicked token: `tok-21613e763fe6` / surface `אֵ֣לֶּה`
- HUD opened with title `Route HUD: אֵ֣לֶּה`
- HUD role: `dialog`
- Route cards visible: 56
- Source footnote rows visible: 6
- `Sources and licenses` visible: true
- Old-HUD markers after click: none

Network evidence:

- Page: HTTP 200
- `assets/css/reader-workbench.css`: HTTP 200
- `assets/js/reader-workbench.js`: HTTP 200
- `data/public-hud/deuteronomy/occurrences.json`: HTTP 200
- `data/public-hud/deuteronomy/manifest.json`: HTTP 200
- `data/public-hud/deuteronomy/chunks/deuteronomy-001.json`: HTTP 200
- `data/public-hud/deuteronomy/route-lookup/manifest.json`: HTTP 200
- `data/public-hud/deuteronomy/route-lookup/shards/05d0-05dc-05d4.json`: HTTP 200
- Failed interesting statuses: 0

Source/license sample visible in HUD includes:

- Hebrew Wiktionary data via Kaikki/Wiktextract, `CC BY-SA 4.0 / GFDL`
- Abudarham. Lisbon, 1489, `Public Domain`

This satisfies public-HUD labeling for the sampled click. It does not authorize those rows as publication text.

## Verdict

WARN-ACCEPTED for exact live Deuteronomy current-HUD runtime surface only.

Accepted within boundary:

- The exact live Deuteronomy page is no longer old-HUD exposed by current static HTTP, live browser-click, or hard-refresh evidence.
- The exact live Deuteronomy deployment source is identified as sparse Pages artifact commit `b198239171c4b7191bd2796cf5da1230f2aa0281`.
- The reviewed live files match committed artifact hashes for the page, runtime, stylesheet, public-HUD manifests, occurrence data, first chunk, route manifest, and sentinel route shard.
- Live click opens the current Route HUD, loads the expected public-HUD data and route shard, and displays source/license/citation rows.
- Old-HUD query-string and poisoned localStorage/IndexedDB activation tests did not reintroduce old-HUD markers for the sampled Deuteronomy click.

Why this remains WARN, not clean PASS:

- Runtime script URL is not visibly versioned/cache-busted in page markup.
- CDN stale-bundle closure is not fully proven beyond the hard-refresh/cache-busted evidence in this packet.
- Only exact Deuteronomy live surface is reviewed, not Genesis, `/hud-preview/`, or broad rollout.
- Source/provenance custody remains separate and not accepted.
- Public HUD evidence display is accepted only as labeled study evidence, not publication text or translation output.

## Effective Boundary

Agent 5 and Agent 7 may record:

`warn_accepted_exact_live_deuteronomy_current_hud_runtime_source_of_truth_and_browser_click_proof_only`

They may also state:

- Deuteronomy old-HUD live blocker is cleared for the exact reviewed page and dependency set.
- Deuteronomy current HUD is the validated primary public reader surface for this exact route only.
- The deployed source-of-truth chain is bounded to commit `b198239171c4b7191bd2796cf5da1230f2aa0281` and sparse Pages artifact scope.

They must not state:

- broad public/runtime accepted
- CDN stale-bundle closure fully accepted
- Genesis accepted
- `/hud-preview/` accepted
- source/provenance custody accepted
- publication ready
- route publication supported
- Definition authority accepted
- usage-as-definition authority accepted
- product/data gate accepted
- translation output accepted
- accepted translation text

Publication remains `blocked_no_render`.

## Remaining Open Gates

- Broader public-runtime drift/quarantine for Genesis and `/hud-preview/`.
- Source/provenance custody and quarantined source-file disposition.
- Publication render row-by-row validation.
- Broad HUD rollout beyond existing Agent 6 dockets.
- CDN/versioned asset strategy if a clean no-stale-bundle PASS is required.

## Required Next Action

Agent 5:

- Update queue/handoff/control state to reflect exact Deuteronomy WARN acceptance above.
- Stop routing Deuteronomy old-HUD or source-of-truth proof loops unless new drift appears.
- Keep Genesis and `/hud-preview/` as separate public-runtime drift/quarantine lanes.
- Do not claim broad public/runtime acceptance or publication readiness.

Agent 7:

- Preserve current HUD as primary Deuteronomy public reader surface within this exact boundary.
- Prioritize separate treatment of Genesis and `/hud-preview/` only after Deuteronomy control state is stable.

Agent 4:

- No further Deuteronomy live-click work is needed unless new drift appears or Agent 6 requests a clean CDN/versioning proof.

