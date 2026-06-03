# Agent 10 Orot Stage C Top-100 Cap-30 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for an Orot top-100 click-time Route HUD package generated only from existing pipeline data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Status

Status: `local_pipeline_proof_passed`

The package is a bounded top-100 expansion candidate. It is not a top-250 package and not full Orot click-time coverage.

## Package Command

```powershell
node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 100 --max-cards-per-key 30 --replace-existing --report reports\agent10-orot-stage-c-top100-cap30-route-package-proof-2026-06-03.json
```

## Package Evidence

Machine report: `reports/agent10-orot-stage-c-top100-cap30-route-package-proof-2026-06-03.json`

- Selected token count: `100`
- Selected lookup candidate count: `140`
- Public route key count: `126`
- Shard count: `101`
- Card count: `3532`
- Total shard bytes: `9559646`
- Max shard bytes: `243127`
- Truncated key count: `129`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

The generated package is below the strict top-50 warning line of `10485760` total bytes and below the max-shard warning line of `1048576` bytes.

Top-50 continuity check:

- The live top-50 package had `62` route keys.
- The top-100 candidate key set contains all `62` live route keys.
- `--replace-existing` was used to apply the `30` card cap uniformly; it does not drop the live top-50 key set.

## Static Validators

- `rg` scan over `data/public-hud/orot/route-lookup` for the four Agent 1 denied IDs, `source metadata incomplete`, and old-HUD markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report count check: pass.

## Local Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-orot-stage-c-top100-cap30-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-c-top100-cap30-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-c-top100-cap30-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-c-top100-cap30-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-c-top100-cap30-browser-proof-2026-06-03.png`

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
- Max click time: `794 ms`

## Remaining Limits

- Live public proof is still required after deployment before making any live-runtime evidence claim.
- Top-250 remains blocked on payload model/design.
- The four Agent 1 source blockers remain quarantined by denylist and are not cleared by this package.
- Inline hints and Route HUD cards remain reader evidence/convenience layers, not accepted definitions or translations.

## Agent 8 Callback

Status: `top100_cap30_local_pipeline_proof_passed`

Artifact path: `reports/agent10-orot-stage-c-top100-cap30-route-package-proof-2026-06-03.md`

Selected package: Orot top-100 route package with `--max-cards-per-key 30 --replace-existing`.

Agent 1 needed: no new wake; existing direction remains quarantine now, clearance later.

Agent 2 needed: no new wake; feasibility/cap sweep already produced.

Agent 4 needed: not before deploy if Agent 10 keeps the same proof gate; Agent 4/6 review is still required for acceptance claims.

Agent 7/13 decision needed: no hard blocker for a bounded deploy; do not claim acceptance.

Next recommended executable route: deploy the bounded top-100 package, then run live browser proof.
