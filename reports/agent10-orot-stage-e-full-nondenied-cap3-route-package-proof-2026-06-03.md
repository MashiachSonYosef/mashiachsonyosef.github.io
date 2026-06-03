# Agent 10 Orot Stage E Full Non-Denied Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for an Orot Route HUD package generated only from existing pipeline route data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Status

Status: `live_pipeline_proof_passed`

The package is a full non-denied Orot route-data live expansion at cap-3. It is not source/provenance clearance for the denied entries and not QA acceptance.

## Package Command

```powershell
node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 10000 --max-cards-per-key 3 --replace-existing --report reports\agent10-orot-stage-e-full-nondenied-cap3-route-package-proof-2026-06-03.json
```

## Package Evidence

Machine report: `reports/agent10-orot-stage-e-full-nondenied-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `8716`
- Selected lookup candidate count: `16348`
- Public route key count: `9490`
- Shard count: `3182`
- Card count: `23496`
- Total shard bytes: `49245496`
- Max shard bytes: `150072`
- Truncated key count: `12960`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`
- Skipped denied token count: `6`
- Skipped denied token occurrences: `559`
- Selected plus denied token count: `8722`

The package stays below the current byte preference line of `52428800` total shard bytes and below the max-shard preference line of `2097152` bytes.

Top-250 continuity check:

- The previous live top-250 package had `252` manifest route keys.
- The full non-denied cap-3 package has `3182` manifest shard keys.
- Missing previous top-250 keys in current package: `0`.

## Static Validators

- `rg` scan over `data/public-hud/orot/route-lookup` for the four Agent 1 denied IDs, `source metadata incomplete`, and old-HUD markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report count and top-250 continuity check: pass.

Note: running `validate_route_answer_safety.mjs` from the deployment checkout fails because that public checkout does not contain `data/definitions/citable-boundary-regression-fixtures.json`. The validator passes from the source root where its fixture exists; package-specific output scans passed in the deployment checkout.

## Local Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-orot-stage-e-full-nondenied-cap3-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-e-full-nondenied-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-e-full-nondenied-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-e-full-nondenied-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-e-full-nondenied-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested from `/data/public-hud/orot/route-lookup/manifest.json`: `true`
- Route shard requested from `/data/public-hud/orot/route-lookup/shards/**`: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `39980`
- Inline hints after hard reload: `39980`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `925 ms`

## Live Manifest Proof

Live URL checked: `https://mashiachsonyosef.github.io/orot/`

Live manifest checked: `https://mashiachsonyosef.github.io/data/public-hud/orot/route-lookup/manifest.json`

- Status: `200`
- Selected token count: `8716`
- Selected lookup candidate count: `16348`
- Public route key count: `9490`
- Shard count: `3182`
- Card count: `23496`
- Total shard bytes: `49245496`
- Max shard bytes: `150072`
- Published at: `2026-06-03T03:36:03.978Z`

## Live Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --base-url https://mashiachsonyosef.github.io/orot/ --route-report reports\agent10-orot-stage-e-full-nondenied-cap3-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-e-full-nondenied-cap3-live-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-e-full-nondenied-cap3-live-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-e-full-nondenied-cap3-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-e-full-nondenied-cap3-live-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested from `/data/public-hud/orot/route-lookup/manifest.json`: `true`
- Route shard requested from `/data/public-hud/orot/route-lookup/shards/**`: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `39980`
- Inline hints after hard reload: `39980`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `1297 ms`

## Remaining Limits

- The four Agent 1 source blockers remain quarantined by denylist and are not cleared by this package.
- Cap-3 intentionally limits alternatives to keep the full non-denied package safely bounded.
- Inline hints and Route HUD cards remain reader evidence/convenience layers, not accepted definitions or translations.

## Agent 8 Callback

Status: `full_nondenied_cap3_live_pipeline_proof_passed`

Artifact path: `reports/agent10-orot-stage-e-full-nondenied-cap3-route-package-proof-2026-06-03.md`

Selected package: Orot top-10000 cap-3, selecting all non-denied Orot hint tokens currently available through the pipeline.

Agent 1 needed: no new wake; denied source entries remain quarantined.

Agent 2 needed: completed by `reports/agent2-orot-stage-e-cap-sweep-2026-06-03.md`.

Agent 4 needed: yes if independent review is required; Agent 10 live proof is complete, but acceptance claims remain out of scope.

Agent 7/13 decision needed: no hard blocker for a bounded deploy; do not claim acceptance.

Next recommended executable route: route this evidence to Agent 4/6 review if acceptance is needed; otherwise keep Orot at full non-denied cap-3 until Agent 1 clears denied source entries through the pipeline.
