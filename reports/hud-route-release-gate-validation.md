# HUD Route Release Gate Validation

Generated: 2026-06-01T14:50:40.411Z
Verdict: pass_with_warnings
Gate status: pass_with_warnings
Release scope: public_lookup_integrity_passed_current_route_source_reconciliation_unproven
Release ID: hud-route-rc-2026-05-31T16-55-29-957Z

## Counts

- Public route cards: 539661
- Public normalized tokens: 175216
- Public shards: 7990
- Boundary issues: 0
- Boundary warnings: 335103
- Route cards with source rows: 539661
- Route cards missing source rows: 0
- Answer-role answer cards: 18683
- Unsafe translation-output cards flagged: 335103
- Answer-eligible unsafe cards flagged: 17737
- Answer-eligible unsafe source rows flagged: 21087
- Gate warnings: 2
- Gate issues: 0
- Drift items: 2

## Boundary Assertions

- `answer_eligible` is a route-card answer slot flag only; it is not publication readiness.
- Source/license rows must remain present on route cards, including answer-role cards.
- Unsafe translation-output flags must remain visible for future accepted translation decisions.
- Warning status blocks any claim that current route inputs are reconciled to the frozen public lookup.
- Publication remains `blocked_no_render`.

## Issues

- none

## Validator Warnings

- gate status is pass_with_warnings; 2 gate warning(s) are preserved
- route input freeze drift status is drift; current route inputs are not release-reconciled
