# Agent 10 Amos Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Amos from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/amos/`

Reason:

- Amos is already in the current lightweight public surface set.
- After Zechariah, Amos is the largest remaining non-Deuteronomy sentinel surface by reader-hint count: `954` route-candidate hints and `0` fallback hints.
- It reuses the same fullscreen current Route HUD runtime pattern as the other expanded public surfaces.

## Dry-Run Sizing

Machine dry-run report: `reports/agent10-amos-stage-a-top6000-cap3-route-package-dry-run-2026-06-03.json`

Bounded dry run:

- Amos top-6000 cap-3 replace-existing: `927` route keys, `2576` cards, `4784034` shard bytes, old-marker hits `0`.

Selected run: Amos top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Machine report: `reports/agent10-amos-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `912`
- Selected lookup candidate count: `1296`
- Public route key count: `927`
- Shard count: `645`
- Card count: `2576`
- Total shard bytes: `4784034`
- Max shard bytes: `45127`
- Truncated key count: `1255`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public route lookup and page scan for old-HUD markers and incomplete source metadata markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\amos\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual shard files: `645`
  - Actual route keys across shards: `927`
  - Actual cards across shards: `2576`
  - Denylist output scan total: `0`
  - Old-HUD marker output scan total: `0`

## Browser Proof

Machine report: `reports/agent10-amos-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-amos-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `1251`
- Inline hints after hard reload: `1251`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `146 ms`

## Live Manifest Proof

Live URL: `https://mashiachsonyosef.github.io/data/public-hud/amos/route-lookup/manifest.json`

- HTTP status: `200`
- Commit deployed from Agent 10 package commit: `bfbc5794e`
- Last-Modified: `Wed, 03 Jun 2026 05:32:39 GMT`
- ETag: `"6a1fbc77-5c4aa"`
- Published at: `2026-06-03T05:27:35.668Z`
- Selected token count: `912`
- Selected lookup candidate count: `1296`
- Public route key count: `927`
- Shard count: `645`
- Card count: `2576`
- Total shard bytes: `4784034`
- Max shard bytes: `45127`
- Truncated key count: `1255`

## Live Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --work-id amos --page-path tanakh/amos/ --base-url https://mashiachsonyosef.github.io/tanakh/amos/ --route-report reports\agent10-amos-stage-a-top6000-cap3-route-package-proof-2026-06-03.json --report reports\agent10-amos-stage-a-top6000-cap3-live-browser-proof-2026-06-03.json --screenshot reports\agent10-amos-stage-a-top6000-cap3-live-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-amos-stage-a-top6000-cap3-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-amos-stage-a-top6000-cap3-live-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `1251`
- Inline hints after hard reload: `1251`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `437 ms`

## Remaining Limits

- This is Agent 10 live browser-click proof only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `amos_stage_a_top6000_cap3_live_pipeline_proof_passed`

Artifact path: `reports/agent10-amos-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Amos top-6000 cap-3 route package, live Agent 10 browser proof passed under non-acceptance boundary.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: continue the next bounded public surface expansion, or route Amos to Agent 6 if QA cadence requests review.
