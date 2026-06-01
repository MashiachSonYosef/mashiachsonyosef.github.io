# Route Boundary Report Summary Validation

Generated: 2026-06-01T14:08:31.149Z

Verdict: pass_with_warnings

Input: reports/route-publication-boundary-audit.json

## Summary

- Shards: 7990
- Tokens: 175216
- Cards: 539661
- Answer-eligible cards: 18683
- Route cards missing source rows: 0
- Answer-eligible cards missing answer score: 0
- Cards with publication-readiness fields: 0
- Issues: 0
- Warnings preserved: 335103
- Translation-output unsafe cards flagged: 335103
- Answer-eligible translation-output unsafe cards flagged: 17737

## Issues

- none

## Warnings

- current route input cache differs from frozen release inputs; do not claim current route inputs are public-release reconciled

## Route Input Freeze Drift

- Report: reports/hud-route-input-freeze-drift.md
- Status: drift
- Drift items: 2
- source-phrase-evidence.jsonl: current source differs from frozen release input
- source-citable-paraphrase-evidence.jsonl: current source differs from frozen release input

## Boundary

- This validates the already-produced route publication-boundary audit summary only; it does not rescan route shards.
- A pass means the report preserves the intended split: route cards are HUD/workbench evidence, not publication support.
- This pass does not prove current `.local-cache/definition-routes` inputs are reconciled while the input freeze drift status is not `pass`.
- The warning count is expected and must remain visible downstream.
- Publication remains blocked_no_render.
