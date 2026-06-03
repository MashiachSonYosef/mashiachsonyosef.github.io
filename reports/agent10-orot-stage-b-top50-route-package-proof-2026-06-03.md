# Agent 10 Orot Stage B Top-50 Route Package Proof - 2026-06-03

## Scope

Agent 10 release-owner proof for a bounded Orot Stage B top-50 click-time Route HUD package generated only from existing pipeline data.

This report does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, route publication support, usage-as-definition authority, accepted text, or translation output.

## Status

Status: `pipeline_proof_ready_for_agent6_review`

Orot Stage B top-50 has a generated public route package and local browser-click proof under the Agent 4 runtime gate. It is not a broad route rollout and does not clear top-100, top-250, or full Orot route coverage.

## Pipeline Commands

- Syntax: `node --check scripts\build_public_hud_route_package.mjs`
- Dry-run: `node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 50 --report reports\agent10-orot-stage-b-top50-route-package-dry-run-2026-06-03.json --dry-run`
- Actual package: `node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 50 --report reports\agent10-orot-stage-b-top50-route-package-proof-2026-06-03.json`
- Browser proof: `node scripts\prove_orot_stage_b_browser_click.mjs --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --route-report reports\agent10-orot-stage-b-top50-route-package-proof-2026-06-03.json --report reports\agent10-orot-stage-b-top50-browser-proof-2026-06-03.json --screenshot reports\agent10-orot-stage-b-top50-browser-proof-2026-06-03.png`

## Package Evidence

Machine report: `reports/agent10-orot-stage-b-top50-route-package-proof-2026-06-03.json`

- Selected token count: `50`
- Selected lookup candidate count: `66`
- Preserved existing public route keys: `1`
- Preserved existing card count: `47`
- Public route key count: `62`
- Shard count: `53`
- Card count: `2527`
- Total shard bytes: `6907604`
- Max shard bytes: `349870`
- Truncated key count: `1`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`

Agent 4 top-50 payload thresholds:

- Warn if total route payload exceeds `10485760` bytes or any shard exceeds `1048576` bytes.
- Block if total route payload exceeds `26214400` bytes or any shard exceeds `3145728` bytes.

Result: package is below warning thresholds.

## Browser-Click Evidence

Machine report: `reports/agent10-orot-stage-b-top50-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-b-top50-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested from `/data/public-hud/orot/route-lookup/manifest.json`: `true`
- Route shard requested from `/data/public-hud/orot/route-lookup/shards/**`: `true`
- Old-HUD marker hits total: `0`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `624 ms`

Sample clicks:

- `על`: `45` route cards, `1` answer card, `4` source/license detail blocks.
- `של`: `43` route cards, `1` answer card, `3` source/license detail blocks.
- `כל`: `42` route cards, `1` answer card, `3` source/license detail blocks.

## Live Browser-Click Evidence

Live URL: `https://mashiachsonyosef.github.io/orot/`

Machine report: `reports/agent10-orot-stage-b-top50-live-browser-proof-2026-06-03.json`

Screenshot: `reports/agent10-orot-stage-b-top50-live-browser-proof-2026-06-03.png`

- Status: `pass`
- Packaged clicks tested: `4`
- All packaged clicks opened route cards: `true`
- All packaged clicks had source/license details: `true`
- At least one answer card rendered: `true`
- Route manifest requested from `/data/public-hud/orot/route-lookup/manifest.json`: `true`
- Route shard requested from `/data/public-hud/orot/route-lookup/shards/**`: `true`
- Old-HUD marker hits total: `0`
- Inline hints before click: `39980`
- Inline hints after hard reload: `39980`
- Old-path probes: `3`, all clean `Not Published` surfaces with old-HUD marker hits `0`
- Poisoned-storage selected glosses: `0`
- Browser console error count: `0`
- Runtime exception count: `0`
- Max click time: `1085 ms`

## Additional Validators

- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`: pass
- `node scripts\validate_route_answer_safety.mjs`: pass
- Direct scan over `data/public-hud/orot/route-lookup`: no old-HUD marker hits and no Agent 1 blocked curated-row hits.

## Pipeline Direction

Agent 1 source/provenance lane:

- Clear or quarantine the four known curated source-row blockers using existing source/provenance pipeline tools only.
- Do not make source custody, publication, or license acceptance claims from this report.
- Return exact commands and artifacts needed for `lex-aph-h639`, `lex-mashiach-h4899`, `lex-ruach-h7307`, and `lex-yhwh-h3068`.

Agent 2 definition/route-data lane:

- Dry-run top-100 and top-250 route packages with the same route-package builder.
- Do not publish top-100 or top-250 until top-50 live proof and Agent 4/6 review path is complete.
- Return payload bytes, max shard bytes, denylist scan total, old-HUD scan total, and threshold status.

Agent 4 runtime lane:

- Review this proof packet against the existing Orot runtime gate.
- Required focus: current HUD only, packaged-token route cards, source/license rows, old-query behavior, poisoned-storage behavior, payload thresholds, and no accepted-translation wording.
- Do not claim QA acceptance or validated public/runtime acceptance.

## Remaining Limits

- Top-100 and top-250 remain blocked until top-50 receives review-path clearance.
- Full Orot click-time route coverage remains blocked on payload design.
- The inline reader hint layer remains a reader convenience layer, not accepted definition or translation authority.
