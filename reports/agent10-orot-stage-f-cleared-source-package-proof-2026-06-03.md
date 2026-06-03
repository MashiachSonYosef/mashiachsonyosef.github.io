# Agent 10 Orot Stage F Cleared-Source Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for expanding Orot from full non-denied cap-3 to cleared-source cap-3 using only pipeline-generated data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Source Clearance Gate

Agent 1 evidence refreshed in `C:\Users\owner\Documents\translations`:

- `reports/agent1-orot-fill-source-row-evidence-2026-06-03.json`
- `reports/agent1-orot-fill-source-row-evidence-validator-result-2026-06-03.json`

Validated source-row evidence state:

- Status: `pipeline_source_rows_clear`
- Target entries: `4`
- Orot chunk entries inspected: `17`
- Orot token occurrences affected: `19`
- Incomplete curated rows attached: `0`
- Targets with exact clean source-layer rows available: `4`
- Targets missing clean chunk attachment: `0`
- Public route lookup shard hits before rebuild: `0`

Cleared entries:

- `lex-aph-h639`
- `lex-mashiach-h4899`
- `lex-ruach-h7307`
- `lex-yhwh-h3068`

This is pipeline source-row clearance evidence only. It does not accept source/provenance custody or semantic correctness.

## Builder Guard

The public builders keep their default denylist unless `--source-clearance-report` is supplied and validates `pipeline_source_rows_clear`.

Updated guarded scripts:

- `scripts/build_public_hud_reader_hints.mjs`
- `scripts/build_public_hud_route_package.mjs`

The Stage F runs supplied:

```powershell
--source-clearance-report C:\Users\owner\Documents\translations\reports\agent1-orot-fill-source-row-evidence-2026-06-03.json
```

Both build reports recorded `source_clearance_proof` with all four entries cleared and no remaining denied entries.

## Reader Hints Package

Command:

```powershell
node scripts\build_public_hud_reader_hints.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --source-clearance-report C:\Users\owner\Documents\translations\reports\agent1-orot-fill-source-row-evidence-2026-06-03.json --report reports\agent10-orot-stage-f-cleared-source-reader-hints-2026-06-03.json
```

Machine report: `reports/agent10-orot-stage-f-cleared-source-reader-hints-2026-06-03.json`

- Existing hint count: `8722`
- Added hint count: `7`
- Final hint count: `8729`
- Existing hint occurrences: `39998`
- Added hint occurrences: `75`
- Final hint occurrences: `40073`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

## Route Package

Command:

```powershell
node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 10000 --max-cards-per-key 3 --replace-existing --source-clearance-report C:\Users\owner\Documents\translations\reports\agent1-orot-fill-source-row-evidence-2026-06-03.json --report reports\agent10-orot-stage-f-cleared-source-full-cap3-route-package-proof-2026-06-03.json
```

Machine report: `reports/agent10-orot-stage-f-cleared-source-full-cap3-route-package-proof-2026-06-03.json`

- Selected token count: `8729`
- Selected lookup candidate count: `16355`
- Public route key count: `9494`
- Shard count: `3184`
- Card count: `23506`
- Total shard bytes: `49259581`
- Max shard bytes: `150072`
- Truncated key count: `12976`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

The package remains below the current `52428800` total-byte preference and below the `2097152` max-shard preference.

## Static Validators

- Public HUD output scan for `source metadata incomplete` and old-HUD markers: no hits.
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`: pass.
- `node scripts\validate_route_answer_safety.mjs` from `C:\Users\owner\Documents\translations`: pass.
- Reader-hints manifest/report count check: pass.
- Route manifest/report count check: pass.

## Local Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-orot-stage-f-cleared-source-full-cap3-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-f-cleared-source-full-cap3-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-f-cleared-source-full-cap3-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-f-cleared-source-full-cap3-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-f-cleared-source-full-cap3-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `40055`
- Inline hints after hard reload: `40055`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `818 ms`

## Live Manifest Proof

Live URL checked:

- `https://mashiachsonyosef.github.io/data/public-hud/orot/route-lookup/manifest.json`

Cache-busted fetch result:

- HTTP status: `200`
- Published at: `2026-06-03T04:16:16.059Z`
- Selected token count: `8729`
- Selected lookup candidate count: `16355`
- Public route key count: `9494`
- Shard count: `3184`
- Card count: `23506`
- Total shard bytes: `49259581`
- Max shard bytes: `150072`

## Live Browser Proof

Command:

```powershell
node scripts\prove_orot_stage_b_browser_click.mjs --base-url https://mashiachsonyosef.github.io/orot/ --route-report reports\agent10-orot-stage-f-cleared-source-full-cap3-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-f-cleared-source-full-cap3-live-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-f-cleared-source-full-cap3-live-browser-proof-2026-06-03.png
```

Machine report: `reports/agent10-orot-stage-f-cleared-source-full-cap3-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-f-cleared-source-full-cap3-live-browser-proof-2026-06-03.png`

- Status: `pass`
- Target URL: `https://mashiachsonyosef.github.io/orot/`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested: `true`
- Route shard requested: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `40055`
- Inline hints after hard reload: `40055`
- Old-path probes: `3`
- Expected old-path 404 count: `3`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `940 ms`
- Issues: `0`
- Warnings: `0`

## Remaining Limits

- This is Agent 10 live browser-click proof only, not QA acceptance or validated public/runtime acceptance.
- `pipeline_source_rows_clear` is not source/provenance custody or source/provenance acceptance.
- `lex-ruach-h7307` remains semantically unresolved in source evidence; public rows are evidence/convenience only.
- Inline hints and Route HUD cards remain reader evidence/convenience layers, not accepted definitions or translations.

## Agent 8 Callback

Status: `stage_f_cleared_source_live_pipeline_proof_passed`

Artifact path: `reports/agent10-orot-stage-f-cleared-source-package-proof-2026-06-03.md`

Current package: Orot cleared-source cap-3, live proof passed under Agent 10 evidence boundary.

Agent 1 needed: source-row clearance evidence produced and validator-passed; no source/provenance acceptance claimed.

Agent 2 needed: no.

Agent 4 needed: yes only if independent browser proof is required beyond Agent 10 proof.

Agent 6 needed: yes for any acceptance claim.

Agent 7/13 decision needed: no hard blocker for bounded deploy evidence; do not claim acceptance.

Next recommended executable route: address the small header/navigation issue or route this live proof to Agent 6 if QA cadence requests a review.
