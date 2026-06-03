# Agent 10 Deuteronomy Stage B Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Deuteronomy from a sentinel-only public Route HUD lookup to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/deuteronomy/`

Reason:

- Deuteronomy is the original public baseline surface and already has the fullscreen current-HUD runtime.
- Current reader hints already cover `2800` unique hinted tokens and `5973` token occurrences, but the route lookup manifest was still sentinel-only before this pass.
- Expanding Deuteronomy closes a visible gap on the baseline surface without changing source custody, accepted text, or definition authority.
- The same current fullscreen Route HUD runtime pattern is reused; no old HUD route or old HUD asset is introduced.

## Dry-Run Sizing

Machine dry-run report: `reports/agent10-deuteronomy-stage-b-top6000-cap3-route-package-dry-run-2026-06-03.json`

Bounded dry run:

- Deuteronomy top-6000 cap-3 replace-existing: `1426` route keys, `4133` cards, `8387801` shard bytes, max shard `68645`, old-marker hits `0`.

Selected run: Deuteronomy top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id deuteronomy --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 6000 --max-cards-per-key 3 --replace-existing --report reports\agent10-deuteronomy-stage-b-top6000-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-deuteronomy-stage-b-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `2621`
- Selected lookup candidate count: `1848`
- Public route key count: `1426`
- Shard count: `973`
- Card count: `4133`
- Total shard bytes: `8387801`
- Max shard bytes: `68645`
- Truncated key count: `4180`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

Top-level Deuteronomy package manifest now records:

- Reader hint count: `2800`
- Reader hint occurrences: `5973`
- Route scope: `sentinel_chunk_plus_reader_hints_plus_bounded_top6000_cap3_route_lookup`
- Route manifest: `route-lookup/manifest.json`

## Static Validators

- Public Deuteronomy page/package scan for old-HUD markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\deuteronomy\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing public shards: `0`
  - Actual shard files: `973`
  - Actual route keys across shards: `1426`
  - Actual cards across shards: `4133`
  - Report route keys: `1426`
  - Report cards: `4133`

## Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --work-id deuteronomy --page-path tanakh/deuteronomy/ --route-report reports\agent10-deuteronomy-stage-b-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-deuteronomy-stage-b-top6000-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-deuteronomy-stage-b-top6000-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-deuteronomy-stage-b-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-deuteronomy-stage-b-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `5973`
- Inline hints after hard reload: `5973`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `286 ms`

## Remaining Warnings

- Builder upstream route lookup probe reported `1112` shards read and `46` missing source lookup shard probes. The generated public Deuteronomy package itself has `0` missing public shards and passed browser route-manifest/shard loading.
- This is a bounded Agent 10 package/browser proof only, not Agent 6 QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `deuteronomy_stage_b_top6000_cap3_local_pipeline_proof_passed`

Artifact path: `reports/agent10-deuteronomy-stage-b-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Deuteronomy top-6000 cap-3 route package, local Agent 10 browser proof passed under non-acceptance boundary.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy the bounded Deuteronomy package, run live manifest and live browser proof, then continue pipeline-only Orot data filling when Agent 2 returns answer-candidate/disambiguation data.
