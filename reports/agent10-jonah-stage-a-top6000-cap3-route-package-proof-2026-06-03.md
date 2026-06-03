# Agent 10 Jonah Stage A Top-6000 Cap-3 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Jonah from a sentinel-only public Route HUD package to a bounded top-6000 cap-3 package using pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Candidate Selection

Selected surface: `tanakh/jonah/`

Reason:

- Jonah is already in the current lightweight public surface set.
- After Zephaniah, Jonah is the remaining non-expanded non-Deuteronomy root-card surface by `reader-hints.json` count: Jonah `360`.
- Deuteronomy has `2800` reader-hint entries, but it is the existing validated boundary surface and is intentionally left untouched in this pass.
- Jonah reuses the same fullscreen current Route HUD runtime pattern as the other expanded public surfaces.

## Dry-Run Sizing

Machine dry-run report: `reports/agent10-jonah-stage-a-top6000-cap3-route-package-dry-run-2026-06-03.json`

Bounded dry run:

- Jonah top-6000 cap-3 replace-existing: `379` route keys, `1089` cards, `1982506` shard bytes, old-marker hits `0`.

Selected run: Jonah top-6000 cap-3 with `--replace-existing`, so the previous sentinel route key is regenerated under the same cap-3 policy.

## Route Package

Machine report: `reports/agent10-jonah-stage-a-top6000-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `346`
- Selected lookup candidate count: `506`
- Public route key count: `379`
- Shard count: `285`
- Card count: `1089`
- Total shard bytes: `1982506`
- Max shard bytes: `28477`
- Truncated key count: `570`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Static Validators

- Public route lookup and page scan for old-HUD markers and incomplete source metadata markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page tanakh\jonah\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Manifest/report/shard count check: pass.
  - Missing shards: `0`
  - Actual shard files: `285`
  - Actual route keys across shards: `379`
  - Actual cards across shards: `1089`
  - Denylist output scan total: `0`
  - Old-HUD marker output scan total: `0`

## Browser Proof

Machine report: `reports/agent10-jonah-stage-a-top6000-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-jonah-stage-a-top6000-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `407`
- Inline hints after hard reload: `407`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `142 ms`

## Live Manifest Proof

Live URL checked: `https://mashiachsonyosef.github.io/data/public-hud/jonah/route-lookup/manifest.json`

- HTTP status: `200`
- Last-Modified: `Wed, 03 Jun 2026 06:03:33 GMT`
- ETag: `"6a1fc3b5-26383"`
- Published at: `2026-06-03T05:57:53.262Z`
- Selected token count: `346`
- Selected lookup candidate count: `506`
- Public route key count: `379`
- Shard count: `285`
- Card count: `1089`
- Total shard bytes: `1982506`
- Max shard bytes: `28477`
- Truncated key count: `570`

## Live Browser Proof

Machine report: `reports/agent10-jonah-stage-a-top6000-cap3-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-jonah-stage-a-top6000-cap3-live-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `407`
- Inline hints after hard reload: `407`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `318 ms`

## Remaining Limits

- This is Agent 10 live browser-click proof only, not QA acceptance or validated public/runtime acceptance.
- Route cards remain reader evidence/convenience layers, not accepted definitions or translations.
- Source/provenance custody and semantic correctness are not accepted here.

## Agent 8 Callback

Status: `jonah_stage_a_top6000_cap3_live_pipeline_proof_passed`

Artifact path: `reports/agent10-jonah-stage-a-top6000-cap3-route-package-proof-2026-06-03.md`

Current package: Jonah top-6000 cap-3 route package, live proof passed under non-acceptance boundary.

Agent 1 needed: no source/provenance blocker identified; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: no for this Agent 10 proof; yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: root-card non-Deuteronomy sentinel expansion pass is complete; next route is either deliberate Deuteronomy expansion/re-proof or Orot/top-level manifest wording cleanup, without acceptance claims.
