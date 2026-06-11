# Dirty Repo Orot HaKodesh Route HUD Page - 2026-06-10

Status: `validated_stage_candidate`

## Scope

- `rav-kook/orot-ha-kodesh/index.html`

## Classification

| path | bucket | proposed action | validator | blocker |
| --- | --- | --- | --- | --- |
| `rav-kook/orot-ha-kodesh/index.html` | generated reader page | stage exact path | Route HUD page validator with flagship `orot/index.html`; scoped diff check | none |

## Evidence

- `node scripts/validate_route_hud_page.mjs --page rav-kook/orot-ha-kodesh/index.html --page orot/index.html` passed.
- `git diff --check -- rav-kook/orot-ha-kodesh/index.html` passed with CRLF warning only.
- Page carries `reader_layout_mode=prehud_rows`.
- Page carries the shared Route HUD panel marker.
- No stale old `<big>` marker was found by scoped search.

## Boundary

Generated reader page staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance and no publication/release/public-runtime acceptance.
