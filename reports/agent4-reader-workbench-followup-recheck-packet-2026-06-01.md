# Agent 4 Reader Workbench Follow-Up Recheck Packet

Generated: 2026-06-01T05:12:28-04:00

## Scope

- Gate: Reader Workbench follow-up targets after Agent 6's blocked verdict.
- Candidate pages: `tanakh/rashi-on-genesis/index.html`, `halakhah/abudarham/index.html`, `kabbalah/ketem-paz-on-zohar/index.html`, `rav-kook/orot-ha-kodesh/index.html`.
- Boundary: static click-contract and Reader Workbench runtime evidence only.
- Not claimed: Agent 6 acceptance, broad rollout, live browser click proof, publication readiness, or accepted translation text.

## What Changed

- `assets/js/reader-workbench.js` now aligns visible compound tokens against split occurrence rows before wrapping click targets.
- `scripts/render_site.ps1` carries the same alignment logic for future renders.
- `scripts/audit_route_hud_click_contract.mjs` now decodes HTML entities and separates handled split-token/hyphen alignments from fatal token-shift failures.
- The previous Agent 6 blocker, paragraph token-count mismatch on Abudarham, Ketem Paz, and Orot HaKodesh, now resolves as split-token alignment with `0` paragraph alignment failures.

## Recheck Results

| page | verdict | count mismatches | split-token alignments | alignment failures | answer source/license sample rows | no-shard lookup metrics |
|---|---|---:|---:|---:|---:|---:|
| `tanakh/rashi-on-genesis/index.html` | pass_static_prevalidation_browser_click_unproven | 0 | 0 | 0 | 16 | 0 |
| `halakhah/abudarham/index.html` | pass_static_prevalidation_browser_click_unproven | 3 | 3 | 0 | 16 | 2 |
| `kabbalah/ketem-paz-on-zohar/index.html` | pass_static_prevalidation_browser_click_unproven | 3 | 3 | 0 | 9 | 4 |
| `rav-kook/orot-ha-kodesh/index.html` | pass_static_prevalidation_browser_click_unproven | 3 | 3 | 0 | 11 | 1 |

## Commands Run

```text
node --check assets\js\reader-workbench.js
node --check scripts\audit_route_hud_click_contract.mjs
PowerShell PSParser check on scripts\render_site.ps1
node scripts\audit_route_hud_click_contract.mjs --page tanakh\rashi-on-genesis\index.html --report reports\agent4-rashi-reader-workbench-click-prevalidation-2026-06-01.md --json reports\agent4-rashi-reader-workbench-click-prevalidation-2026-06-01.json --sample-limit 36
node scripts\audit_route_hud_click_contract.mjs --page halakhah\abudarham\index.html --report reports\agent4-abudarham-reader-workbench-click-prevalidation-2026-06-01.md --json reports\agent4-abudarham-reader-workbench-click-prevalidation-2026-06-01.json --sample-limit 36
node scripts\audit_route_hud_click_contract.mjs --page kabbalah\ketem-paz-on-zohar\index.html --report reports\agent4-ketem-paz-reader-workbench-click-prevalidation-2026-06-01.md --json reports\agent4-ketem-paz-reader-workbench-click-prevalidation-2026-06-01.json --sample-limit 36
node scripts\audit_route_hud_click_contract.mjs --page rav-kook\orot-ha-kodesh\index.html --report reports\agent4-orot-ha-kodesh-reader-workbench-click-prevalidation-2026-06-01.md --json reports\agent4-orot-ha-kodesh-reader-workbench-click-prevalidation-2026-06-01.json --sample-limit 36
node scripts\validate_reader_workbench_followup_targets.mjs
node scripts\validate_reader_workbench_expansion_sample.mjs --targets data\control\reader_workbench_followup_targets.json --work-id abudarham
node scripts\validate_reader_workbench_runtime.mjs
node scripts\validate_reader_workbench_boundary.mjs
node scripts\validate_route_hud_page.mjs --page tanakh\rashi-on-genesis\index.html --page halakhah\abudarham\index.html --page kabbalah\ketem-paz-on-zohar\index.html --page rav-kook\orot-ha-kodesh\index.html
```

## Known Risks

- Browser proof is still unavailable; the Browser plugin reported no available in-app browser session.
- No-shard lookup counts remain visible as coverage metrics for no-route/generated candidates; they are not warnings by themselves.
- Beer Hagolah remains excluded because it is blocked by `source_not_tracked` and missing Reader Workbench markers.
- Publication remains `blocked_no_render`.

## Requested Agent 6 Action

Recheck only the follow-up target blocker from `reports/agent6-reader-workbench-followup-verdict-2026-06-01.md`. The requested ruling is whether the four candidate pages can move from blocked static-click mismatch to static-pass follow-up evidence with warnings, while still excluding broad rollout, live browser proof, Beer Hagolah, publication readiness, and accepted translation text.
