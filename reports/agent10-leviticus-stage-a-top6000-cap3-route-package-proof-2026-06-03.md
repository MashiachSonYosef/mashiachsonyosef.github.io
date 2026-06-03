# Agent 10 Leviticus Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Leviticus from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/leviticus/`

Reason:

- Leviticus is already in the current lightweight public surface set.
- After Exodus and Numbers, Leviticus is the remaining Torah surface with a sentinel-style route package.
- The current package can reuse the same fullscreen current Route HUD runtime pattern as Deuteronomy, Genesis, Orot, Exodus, and Numbers.
- The dry-run was clean and stayed below the prior bounded payload envelope.

## Dry-Run Sizing

Machine dry-run report: `reports/agent10-leviticus-stage-a-top6000-cap3-route-package-dry-run-2026-06-03.json`

Bounded dry run:

- Leviticus top-6000 cap-3 replace-existing: `1909` route keys, `5237` cards, `9929827` shard bytes, old-marker hits `0`.

Selected run: Leviticus top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id leviticus --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 6000 --max-cards-per-key 3 --replace-existing --report reports\agent10-leviticus-stage-a-top6000-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-leviticus-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `3620`
- Selected lookup candidate count: `2968`
- Public route key count: `1909`
- Shard count: `1137`
- Card count: `5237`
- Total shard bytes: `9929827`
- Max shard bytes: `49788`
- Truncated key count: `5056`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public route lookup and page scan for old-HUD markers and incomplete source metadata markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\leviticus\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual shard files: `1137`
  - Actual route keys across shards: `1909`
  - Actual cards across shards: `5237`
  - Denylist output scan total: `0`
  - Old-HUD marker output scan total: `0`

## Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id leviticus --page-path tanakh/leviticus/ --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-leviticus-stage-a-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-leviticus-stage-a-top6000-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-leviticus-stage-a-top6000-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-leviticus-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-leviticus-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `7055`
- Inline hints after hard reload: `7055`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `276 ms`

## Remaining Limits

- Live public proof is still required after deployment before making a live-runtime evidence claim for Leviticus Stage A.
- This is route package/local browser-click evidence only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `leviticus_stage_a_top6000_cap3_local_pipeline_proof_passed`

Artifact path: `reports/agent10-leviticus-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Leviticus top-6000 cap-3 route package, local proof passed.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy Leviticus Stage A, run live browser proof, then record live boundary.
