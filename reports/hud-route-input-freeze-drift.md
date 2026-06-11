# HUD Route Input Freeze Drift

Generated: 2026-06-01T17:40:21.190Z
Status: drift
Release ID: hud-route-rc-2026-05-31T16-55-29-957Z
Fail on drift: no

## Scope

- Release stamp: `data/definitions/hud-route-release-stamp.json`
- Current source dir: `.local-cache/definition-routes`
- Frozen files: 5
- Optional files absent from freeze: 2

## Issues

- None

## Drift

- source-phrase-evidence.jsonl: current source differs from frozen release input
- source-citable-paraphrase-evidence.jsonl: current source differs from frozen release input

## Files

| file | required | rows | bytes | frozen status | current status |
|---|---:|---:|---:|---|---|
| kaikki-definition-claims.jsonl | yes | 135184 | 159157420 | matches stamp | matches release freeze |
| source-layer-definition-claims.jsonl | yes | 4477 | 7418794 | matches stamp | matches release freeze |
| source-phrase-evidence.jsonl | yes | 200000 | 355922433 | matches stamp | differs from release freeze |
| source-citable-paraphrase-evidence.jsonl | no | 200000 | 493745179 | matches stamp | differs from release freeze |
| definition-route-manifest.json | yes |  | 12074 | matches stamp | matches release freeze |
| source-biblical-paraphrase-evidence.jsonl | no |  |  | not frozen optional | absent at release freeze and absent now |
| source-paraphrase-evidence.jsonl | no |  |  | not frozen optional | absent at release freeze and absent now |

## Boundary

- Publication status: blocked_no_render
- Validates: hud_route_input_freeze_drift, frozen_route_input_cache_comparison
- Does not clear: translation_output, source_publication, public_lexical_export_reuse, accepted_definition_authority, public_lookup_publication, route_publication_readiness
- Route input scope: freeze_drift_check_only_not_publication_readiness
- Warning status blocks publication claim: true
- Current route inputs reconciled: false
- Route data regenerated: false
- Source imports changed: false
- Public lookup artifacts changed: false

This report compares the stamped release freeze to the current route input cache. It does not regenerate HUD route data, import sources, or change public lookup artifacts.
