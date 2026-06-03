# Agent 10 Numbers Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Numbers from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/numbers/`

Reason:

- Numbers is already in the current lightweight public surface set.
- It had `5204` reader hints, but its route lookup package was still sentinel-style: one route key, one shard, `20` cards.
- After Exodus, Numbers is the largest remaining Torah reader-hint gap with a clean dry-run.
- It reuses the same fullscreen current Route HUD runtime pattern as Deuteronomy, Genesis, Orot, and Exodus.

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id numbers --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 6000 --max-cards-per-key 3 --replace-existing --report reports\agent10-numbers-stage-a-top6000-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-numbers-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `4878`
- Selected lookup candidate count: `4042`
- Public route key count: `2577`
- Shard count: `1429`
- Card count: `7054`
- Total shard bytes: `13430651`
- Max shard bytes: `61167`
- Truncated key count: `7165`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public route lookup and page scan for old-HUD markers and incomplete source metadata markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\numbers\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual shard files: `1429`
  - Actual route keys across shards: `2577`
  - Actual cards across shards: `7054`
  - Denylist output scan total: `0`
  - Old-HUD marker output scan total: `0`

## Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id numbers --page-path tanakh/numbers/ --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-numbers-stage-a-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-numbers-stage-a-top6000-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-numbers-stage-a-top6000-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-numbers-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-numbers-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `10002`
- Inline hints after hard reload: `10002`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `440 ms`

## Live Manifest Proof

Live URL: `https://mashiachsonyosef.github.io/data/public-hud/numbers/route-lookup/manifest.json`

- HTTP status: `200`
- Commit deployed from Agent 10 package commit: `f51517835`
- Last-Modified: `Wed, 03 Jun 2026 05:13:02 GMT`
- ETag: `"6a1fb7de-194cbd"`
- Published at: `2026-06-03T05:07:39.099Z`
- Selected token count: `4878`
- Selected lookup candidate count: `4042`
- Public route key count: `2577`
- Shard count: `1429`
- Card count: `7054`
- Total shard bytes: `13430651`
- Max shard bytes: `61167`
- Truncated key count: `7165`

## Live Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id numbers --page-path tanakh/numbers/ --base-url https://mashiachsonyosef.github.io/tanakh/numbers/ --route-report reports\agent10-numbers-stage-a-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-numbers-stage-a-top6000-cap3-live-browser-proof-2026-06-03.json --screenshot reports\agent10-numbers-stage-a-top6000-cap3-live-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-numbers-stage-a-top6000-cap3-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-numbers-stage-a-top6000-cap3-live-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `10002`
- Inline hints after hard reload: `10002`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `522 ms`

## Remaining Limits

- This is Agent 10 live browser-click proof only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `numbers_stage_a_top6000_cap3_live_pipeline_proof_passed`

Artifact path: `reports/agent10-numbers-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Numbers top-6000 cap-3 route package, live Agent 10 browser proof passed under non-acceptance boundary.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: continue the next bounded public surface expansion, or route Numbers to Agent 6 if QA cadence requests review.
