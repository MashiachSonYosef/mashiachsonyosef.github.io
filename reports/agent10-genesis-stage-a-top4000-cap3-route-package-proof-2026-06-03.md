# Agent 10 Genesis Stage A Top-4000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Genesis from a sentinel-only public Route HUD package to a bounded top-4000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/genesis/`

Reason:

- Genesis is already in the current lightweight public surface set.
- It had reader hints across the page, but its route lookup package was still sentinel-style: one route key, one shard, `48` cards.
- Expanding route data for an already-public canonical surface gives immediate reader value while preserving the current no-old-HUD public boundary.

## Dry-Run Sizing

Bounded dry runs:

- Top 500 cap-3: `252` route keys, `795` cards, `1453258` shard bytes, old-marker hits `0`.
- Top 1500 cap-3: `768` route keys, `2307` cards, `4434902` shard bytes, old-marker hits `0`.
- Top 4000 cap-3 preserving existing sentinel: `1599` route keys, `4705` cards, `9433758` shard bytes, old-marker hits `0`.
- Top 4000 cap-3 replace-existing: `1599` route keys, `4660` cards, `9321764` shard bytes, max shard `71062`, old-marker hits `0`.

Selected run: top-4000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id genesis --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 4000 --max-cards-per-key 3 --replace-existing --report reports\agent10-genesis-stage-a-top4000-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-genesis-stage-a-top4000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `3544`
- Selected lookup candidate count: `1890`
- Public route key count: `1599`
- Shard count: `1092`
- Card count: `4660`
- Total shard bytes: `9321764`
- Max shard bytes: `71062`
- Truncated key count: `5465`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public HUD output scan for old-HUD markers, accepted-translation wording, and source metadata incomplete markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual route keys across shards: `1599`
  - Actual cards across shards: `4660`

## Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id genesis --page-path tanakh/genesis/ --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-genesis-stage-a-top4000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-genesis-stage-a-top4000-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-genesis-stage-a-top4000-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-genesis-stage-a-top4000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-genesis-stage-a-top4000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `8292`
- Inline hints after hard reload: `8292`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `367 ms`

## Tooling Change

`scripts/prove_orot_stage_b_browser_click.mjs` now accepts optional:

- `--work-id`
- `--page-path`

Defaults remain Orot-compatible. The change allows the same bounded browser-click proof path to validate non-Orot public reader surfaces without creating a separate proof script per page.

## Remaining Limits

- Live public proof is still required after deployment before making a live-runtime evidence claim for Genesis Stage A.
- This is route package evidence only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `genesis_stage_a_top4000_cap3_local_pipeline_proof_passed`

Artifact path: `reports/agent10-genesis-stage-a-top4000-cap3-route-package-proof-2026-06-03.md`

Current package: Genesis top-4000 cap-3 route package, local proof passed.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy Genesis Stage A, run live browser proof, then record live boundary.
