# HUD Route Input Freeze Drift

Generated: 2026-06-01T13:48:05.712Z
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

This report compares the stamped release freeze to the current route input cache. It does not regenerate HUD route data, import sources, or change public lookup artifacts.
