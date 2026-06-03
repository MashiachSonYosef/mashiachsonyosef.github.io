# Agent 10 Ruth Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Ruth from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/ruth/`

Reason:

- Ruth is already in the current lightweight public surface set.
- After Amos, Ruth is the largest remaining non-expanded root-card surface by `reader-hints.json` count: Ruth `676`, Zephaniah `416`, Jonah `360`.
- Deuteronomy has `2800` reader-hint entries, but it is the existing validated boundary surface and is intentionally left untouched in this pass.
- Ruth reuses the same fullscreen current Route HUD runtime pattern as the other expanded public surfaces.

## Dry-Run Sizing

Machine dry-run report: `reports/agent10-ruth-stage-a-top6000-cap3-route-package-dry-run-2026-06-03.json`

Bounded dry run:

- Ruth top-6000 cap-3 replace-existing: `567` route keys, `1599` cards, `2856980` shard bytes, old-marker hits `0`.

Selected run: Ruth top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Machine report: `reports/agent10-ruth-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `652`
- Selected lookup candidate count: `797`
- Public route key count: `567`
- Shard count: `405`
- Card count: `1599`
- Total shard bytes: `2856980`
- Max shard bytes: `23873`
- Truncated key count: `923`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public route lookup and page scan for old-HUD markers and incomplete source metadata markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\ruth\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual shard files: `405`
  - Actual route keys across shards: `567`
  - Actual cards across shards: `1599`
  - Denylist output scan total: `0`
  - Old-HUD marker output scan total: `0`

## Browser Proof

Machine report: `reports/agent10-ruth-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-ruth-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `796`
- Inline hints after hard reload: `796`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `134 ms`

## Remaining Limits

- Live public proof is still required after deployment before making a live-runtime evidence claim for Ruth Stage A.
- This is route package/local browser-click evidence only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `ruth_stage_a_top6000_cap3_local_pipeline_proof_passed`

Artifact path: `reports/agent10-ruth-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Ruth top-6000 cap-3 route package, local proof passed.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy Ruth Stage A, run live browser proof, then record live boundary.
