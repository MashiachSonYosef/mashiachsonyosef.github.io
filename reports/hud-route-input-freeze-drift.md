# HUD Route Input Freeze Drift

Generated: 2026-05-31T16:29:11.336Z
Status: pass
Release ID: hud-route-rc-2026-05-31T15-22-27-823Z
Fail on drift: yes

## Scope

- Release stamp: `data/definitions/hud-route-release-stamp.json`
- Current source dir: `.local-cache/definition-routes`
- Frozen files: 5
- Optional files absent from freeze: 2

## Issues

- None

## Drift

- None

## Files

| file | required | rows | bytes | frozen status | current status |
|---|---:|---:|---:|---|---|
| kaikki-definition-claims.jsonl | yes | 138459 | 163144393 | matches stamp | matches release freeze |
| source-layer-definition-claims.jsonl | yes | 4477 | 7418794 | matches stamp | matches release freeze |
| source-phrase-evidence.jsonl | yes | 200000 | 355922433 | matches stamp | matches release freeze |
| source-citable-paraphrase-evidence.jsonl | no | 200000 | 493745179 | matches stamp | matches release freeze |
| definition-route-manifest.json | yes |  | 11918 | matches stamp | matches release freeze |
| source-biblical-paraphrase-evidence.jsonl | no |  |  | not frozen optional | absent at release freeze and absent now |
| source-paraphrase-evidence.jsonl | no |  |  | not frozen optional | absent at release freeze and absent now |

## Boundary

This report compares the stamped release freeze to the current route input cache. It does not regenerate HUD route data, import sources, or change public lookup artifacts.
