# Reader Workbench Deferred Recovery Report

Updated: 2026-06-01

## Scope

- Purpose: recover deferred Reader Workbench candidate pages without broad rollout.
- Render authority used: `scripts/render_site.ps1`.
- Render command:
  `.\scripts\render_site.ps1 -WorkIds @('rashi-on-genesis','abudarham','ketem-paz-on-zohar','orot-ha-kodesh') -SkipOverlayExports -SkipLexicalPayloadFiles`
- Not rendered: `beer-hagolah`, because its source file remains outside tracked audit scope.
- Not claimed: publication readiness, accepted translation text, broad rollout, or Agent 6 acceptance.

## Results

- Ready after rerender: 4.
- Blocked: 1.

Ready after rerender:

- `tanakh/rashi-on-genesis/index.html`
- `halakhah/abudarham/index.html`
- `kabbalah/ketem-paz-on-zohar/index.html`
- `rav-kook/orot-ha-kodesh/index.html`

Still blocked:

- `other/beer-hagolah/index.html`
- Blockers: `source_not_tracked`, `missing_reader_workbench_markers`.

## Checks

- `node --check scripts\validate_reader_workbench_deferred_targets.mjs` passed.
- `node scripts\validate_reader_workbench_deferred_targets.mjs` passed with 5 deferred targets, 4 ready after rerender, 1 blocked.
- `node scripts\validate_route_hud_page.mjs --page tanakh\rashi-on-genesis\index.html --page halakhah\abudarham\index.html --page kabbalah\ketem-paz-on-zohar\index.html --page rav-kook\orot-ha-kodesh\index.html` passed for 4 pages.
- `node scripts\validate_reader_workbench_runtime.mjs` passed.
- `node scripts\validate_reader_workbench_boundary.mjs` passed with 21 checks.

## Boundary

- These pages are recovery candidates only.
- They should not be counted in the accepted expansion set until Agent 6 rules on the current representative packet and a follow-up target-set update is prepared.
- Publication remains `blocked_no_render`.
