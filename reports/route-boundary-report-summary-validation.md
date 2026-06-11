# Route Boundary Report Summary Validation

Generated: 2026-06-01T19:17:04.348Z

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
- Input-freeze publication status: blocked_no_render
- Input-freeze current route inputs reconciled: false
- Input-freeze public lookup artifacts changed: false

## Publication Boundary

- Publication status: blocked_no_render
- Validates: route_publication_boundary_audit_summary, route_card_publication_boundary
- Does not clear: translation_output, source_publication, public_lexical_export_reuse, accepted_definition_authority
- Answer eligibility scope: hud_answer_slot_only_not_translation_or_publication_readiness
- Warning status blocks publication claim: true
- Current route inputs reconciled: false

## Boundary

- This validates the already-produced route publication-boundary audit summary only; it does not rescan route shards.
- A pass means the report preserves the intended split: route cards are HUD/workbench evidence, not publication support.
- This pass does not prove current `.local-cache/definition-routes` inputs are reconciled while the input freeze drift status is not `pass`.
- The warning count is expected and must remain visible downstream.
- Publication remains blocked_no_render.
