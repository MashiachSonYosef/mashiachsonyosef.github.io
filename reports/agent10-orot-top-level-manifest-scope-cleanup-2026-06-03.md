# Agent 10 Orot Top-Level Manifest Scope Cleanup - 2026-06-03

## Scope

Agent 10 release-owner cleanup for Orot public metadata consistency.

This patch updates only `data/public-hud/orot/manifest.json` so the top-level public HUD manifest no longer describes Orot as `single_sentinel_route_shard_plus_reader_hints` after the Stage F route package was expanded and live-proofed.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Change

Updated top-level Orot manifest metadata:

- Preserved existing `chunks` and `token_chunks` sentinel chunk metadata.
- Added `reader_hints_summary` from `data/public-hud/orot/reader-hints.json`.
- Added `route_lookup_summary` from `data/public-hud/orot/route-lookup/manifest.json`.
- Replaced stale route scope with `sentinel_chunk_plus_reader_hints_plus_bounded_top10000_cap3_route_lookup`.

No Route HUD shard data, reader hint payload data, source rows, or semantic text were changed.

## Evidence Source

Existing Stage F proof artifact:

- `reports/agent10-orot-stage-f-cleared-source-package-proof-2026-06-03.md`

Existing live route package state:

- Route manifest URL: `https://mashiachsonyosef.github.io/data/public-hud/orot/route-lookup/manifest.json`
- Published at: `2026-06-03T04:16:16.059Z`
- Selected token count: `8729`
- Public route key count: `9494`
- Shard count: `3184`
- Card count: `23506`

Existing reader hints state:

- Reader hints URL: `data/public-hud/orot/reader-hints.json`
- Generated at: `2026-06-03T04:14:39.182Z`
- Final hint count: `8729`
- Final hint occurrences: `40073`

## Local Validation

Structured manifest comparison:

- Reader final hint count matched: `true`
- Reader final hint occurrences matched: `true`
- Route selected token count matched: `true`
- Route public route key count matched: `true`
- Route shard count matched: `true`
- Route card count matched: `true`
- Stale route scope removed: `true`

Old-HUD/stale-scope marker scan over `data/public-hud/orot/manifest.json`:

- `old-hud`: `0`
- `reader-workbench-old`: `0`
- `lexicalOverlay`: `0`
- `legacy-hud`: `0`
- `single_sentinel_route_shard_plus_reader_hints`: `0`

## Remaining Limits

- This is metadata consistency cleanup only, not a route package rebuild.
- Live proof is required after deploy to confirm the public top-level manifest serves the corrected route scope.
- Stage F live browser proof remains Agent 10 evidence only, not QA acceptance or validated public/runtime acceptance.
- Route cards and inline hints remain reader evidence/convenience layers, not accepted definitions or translations.

## Agent 8 Callback

Status: `orot_top_level_manifest_scope_cleanup_local_passed`

Artifact path: `reports/agent10-orot-top-level-manifest-scope-cleanup-2026-06-03.md`

Current package: Orot top-level manifest metadata corrected locally to match the existing Stage F route package boundary.

Agent 1 needed: no source/provenance change; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: no for this Agent 10 metadata proof; yes only if independent live browser proof is requested.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: deploy Orot top-level manifest cleanup, verify live top-level manifest route scope and route-lookup counts, then continue to header/navigation cleanup or deliberate Deuteronomy expansion.
