# Agent 10 Orot Stage D Top-250 Cap-25 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for an Orot top-250 click-time Route HUD package generated only from existing pipeline data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Status

Status: `live_pipeline_proof_passed`

The package is a bounded top-250 live expansion. It is still not full Orot click-time route coverage.

## Package Command

```powershell
node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 250 --max-cards-per-key 25 --replace-existing --report reports\agent10-orot-stage-d-top250-cap25-route-package-proof-2026-06-03.json
```

## Package Evidence

Machine report: `reports/agent10-orot-stage-d-top250-cap25-route-package-proof-2026-06-03.json`

- Selected token count: `250`
- Selected lookup candidate count: `398`
- Public route key count: `342`
- Shard count: `252`
- Card count: `7565`
- Total shard bytes: `20264355`
- Max shard bytes: `375596`
- Truncated key count: `335`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

The generated package is below the original Agent 4 top-250 warning line of `52428800` total bytes and below the max-shard warning line of `2097152` bytes.

Top-100 continuity check:

- The live top-100 package had `126` route keys.
- The top-250 candidate key set contains all `126` live route keys.
- `--replace-existing` was used to apply the `25` card cap uniformly; it does not drop the live top-100 key set.

## Static Validators

- `rg` scan over `data/public-hud/orot/route-lookup` for the four Agent 1 denied IDs, `source metadata incomplete`, and old-HUD markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report count check: pass.

## Local Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-orot-stage-d-top250-cap25-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-d-top250-cap25-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-d-top250-cap25-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-d-top250-cap25-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-d-top250-cap25-browser-proof-2026-06-03.png`

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
- Max click time: `774 ms`

## Live Manifest Proof

Live URL checked: `https://mashiachsonyosef.github.io/orot/`

Live manifest checked: `https://mashiachsonyosef.github.io/data/public-hud/orot/route-lookup/manifest.json`

- Status: `200`
- Selected token count: `250`
- Public route key count: `342`
- Shard count: `252`
- Card count: `7565`
- Total shard bytes: `20264355`
- Max shard bytes: `375596`
- Published at: `2026-06-03T03:19:15.705Z`

## Live Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --base-url https://mashiachsonyosef.github.io/orot/ --route-report reports\agent10-orot-stage-d-top250-cap25-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-d-top250-cap25-live-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-d-top250-cap25-live-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-d-top250-cap25-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-d-top250-cap25-live-browser-proof-2026-06-03.png`

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
- Max click time: `1001 ms`

## Remaining Limits

- Full Orot click-time coverage remains unproven.
- The four Agent 1 source blockers remain quarantined by denylist and are not cleared by this package.
- Inline hints and Route HUD cards remain reader evidence/convenience layers, not accepted definitions or translations.

## Agent 8 Callback

Status: `top250_cap25_live_pipeline_proof_passed`

Artifact path: `reports/agent10-orot-stage-d-top250-cap25-route-package-proof-2026-06-03.md`

Selected package: Orot top-250 route package with `--max-cards-per-key 25 --replace-existing`.

Agent 1 needed: no new wake; existing direction remains quarantine now, clearance later.

Agent 2 needed: no new wake; feasibility/cap sweep already produced.

Agent 4 needed: not before deploy if Agent 10 keeps the same proof gate; Agent 4/6 review is still required for acceptance claims.

Agent 7/13 decision needed: no hard blocker for a bounded deploy; do not claim acceptance.

Next recommended executable route: route this evidence to Agent 6/4 review if acceptance is needed; otherwise continue pipeline-only coverage expansion under the same denylist and browser-proof gates.
