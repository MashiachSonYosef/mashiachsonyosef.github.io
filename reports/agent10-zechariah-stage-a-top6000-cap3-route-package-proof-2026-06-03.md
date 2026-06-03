# Agent 10 Zechariah Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Zechariah from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/zechariah/`

Reason:

- Zechariah is already in the current lightweight public surface set.
- Deuteronomy has more reader hints, but it is the validated boundary surface and was left untouched in this pass.
- Zechariah is the largest remaining non-Deuteronomy sentinel surface by reader-hint count: `1475` route-candidate hints and `0` fallback hints.
- It reuses the same fullscreen current Route HUD runtime pattern as the other expanded public surfaces.

## Dry-Run Sizing

Machine dry-run report: `reports/agent10-zechariah-stage-a-top6000-cap3-route-package-dry-run-2026-06-03.json`

Bounded dry run:

- Zechariah top-6000 cap-3 replace-existing: `1269` route keys, `3566` cards, `6727651` shard bytes, old-marker hits `0`.

Selected run: Zechariah top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id zechariah --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 6000 --max-cards-per-key 3 --replace-existing --report reports\agent10-zechariah-stage-a-top6000-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-zechariah-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `1405`
- Selected lookup candidate count: `1828`
- Public route key count: `1269`
- Shard count: `801`
- Card count: `3566`
- Total shard bytes: `6727651`
- Max shard bytes: `59804`
- Truncated key count: `2163`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public route lookup and page scan for old-HUD markers and incomplete source metadata markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\zechariah\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual shard files: `801`
  - Actual route keys across shards: `1269`
  - Actual cards across shards: `3566`
  - Denylist output scan total: `0`
  - Old-HUD marker output scan total: `0`

## Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id zechariah --page-path tanakh/zechariah/ --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-zechariah-stage-a-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-zechariah-stage-a-top6000-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-zechariah-stage-a-top6000-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-zechariah-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-zechariah-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `2024`
- Inline hints after hard reload: `2024`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `146 ms`

## Remaining Limits

- Live public proof is still required after deployment before making a live-runtime evidence claim for Zechariah Stage A.
- This is route package/local browser-click evidence only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `zechariah_stage_a_top6000_cap3_local_pipeline_proof_passed`

Artifact path: `reports/agent10-zechariah-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Zechariah top-6000 cap-3 route package, local proof passed.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy Zechariah Stage A, run live browser proof, then record live boundary.
