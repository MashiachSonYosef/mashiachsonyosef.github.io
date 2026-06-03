# Agent 10 Exodus Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Exodus from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/exodus/`

Reason:

- Exodus is already in the current lightweight public surface set.
- It had `5831` reader hints, but its route lookup package was still sentinel-style: one route key, one shard, `52` cards.
- Among remaining sentinel-only Torah surfaces, Exodus had the largest current reader-hint gap and canonical priority after Genesis.
- A comparison dry run for Numbers was clean, but Exodus had more public hints and the larger immediate route-data gap.

## Dry-Run Sizing

Bounded dry runs:

- Exodus top 4000 cap-3 replace-existing: `2425` route keys, `6711` cards, `12505197` shard bytes, old-marker hits `0`.
- Exodus top 6000 cap-3 replace-existing: `2993` route keys, `8197` cards, `15400610` shard bytes, old-marker hits `0`.
- Numbers comparison top 6000 cap-3 replace-existing: `2577` route keys, `7054` cards, `13430651` shard bytes, old-marker hits `0`.

Selected run: Exodus top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id exodus --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 6000 --max-cards-per-key 3 --replace-existing --report reports\agent10-exodus-stage-a-top6000-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-exodus-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `5473`
- Selected lookup candidate count: `4878`
- Public route key count: `2993`
- Shard count: `1619`
- Card count: `8197`
- Total shard bytes: `15400610`
- Max shard bytes: `61750`
- Truncated key count: `8046`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public HUD output scan for old-HUD markers, accepted-translation wording, and source metadata incomplete markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\exodus\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual route keys across shards: `2993`
  - Actual cards across shards: `8197`

## Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id exodus --page-path tanakh/exodus/ --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-exodus-stage-a-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-exodus-stage-a-top6000-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-exodus-stage-a-top6000-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-exodus-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-exodus-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `10325`
- Inline hints after hard reload: `10325`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `401 ms`

## Remaining Limits

- Live public proof is still required after deployment before making a live-runtime evidence claim for Exodus Stage A.
- This is route package evidence only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `exodus_stage_a_top6000_cap3_local_pipeline_proof_passed`

Artifact path: `reports/agent10-exodus-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Exodus top-6000 cap-3 route package, local proof passed.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy Exodus Stage A, run live browser proof, then record live boundary.
