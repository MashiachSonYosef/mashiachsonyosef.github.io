# Dirty Repo Root/Library Carry - 2026-06-10

Status: `validated_stage_candidate`

## Scope

- `about/index.html`
- `library/index.html`
- `overlay-export.json`

## Classification

| path | bucket | proposed action | validator | blocker |
| --- | --- | --- | --- | --- |
| `about/index.html` | root/library/deploy carry | stage exact path | static root/library guard; scoped diff check | none |
| `library/index.html` | root/library/deploy carry | stage exact path | static root/library guard; scoped diff check | none |
| `overlay-export.json` | overlay export manifest | stage exact path | JSON parse and manifest guard; scoped diff check | none |

## Evidence

- Root Featured shelf remains a single `orot/` card.
- Root and library totals are `1360 works | 802869 source units`.
- Library has 1,360 unique normal corpus cards and no `data-featured-shelf` marker.
- Representative normal corpus links are present for `rav-kook/orot-ha-kodesh/`, `tosefta/tosefta-zevachim/`, and `mishnah/mishnah-zevachim/`.
- `overlay-export.json` parses as `overlay_export_manifest`, has `row_count: 802869`, and has `per_work_json` length `1360`.

## Boundary

This is root/library/overlay carry evidence only. It is not QA/source/license/legal/Definition/product/answer/accepted-text acceptance and not publication/release/public-runtime acceptance.
