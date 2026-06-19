A13_A12_H4687_CONTEXT_RULE_INTAKE | status | ready_for_future_A12_review_not_routed

Target:
- source_id: `H4687`
- label: `commandment/command/ordinance`
- work: `agra-dekala`
- display state now: `N/A`

Input artifacts:
- `reports/a13-h4687-display-context-map-return-2026-06-19.json`
- `reports/a13-h4687-display-context-map-validation-2026-06-19.json`
- `reports/a13-h4687-full-occurrence-context-map-2026-06-19.json`
- `reports/a13-h4687-full-occurrence-context-map-validation-2026-06-19.json`
- `reports/a12-a3-priority1-context-structure-packet-template-2026-06-19.md`

Map state:
- rows: `12`
- full occurrence context rows: `340`
- full occurrence count mismatches: `0`
- full occurrence source-token mismatches: `0`
- current visible rows: `0`
- exact lookup rows: `7`
- non-exact lookup rows: `5`
- prefix/affix lookup rows: `5`
- single-occurrence candidates: `1`
- sense-blocked rows: `12`

Single-occurrence candidate:
- token_id: `tok-28d61c6232d6`
- surface: `מצותך`
- source_ref: `Agra DeKala, Toldot:1`
- context: `על פי מ"ש בספר דרך` | `מצותך` | `דכאשר יוליד האדם דרך נס,`
- status: not visible text; needs A12 context-rule review if reopened

Why no visible slot opens:
The row is exact and single-occurrence, but the surrounding phrase may be title/formula context and the commandment/command/ordinance sense is not cleared. The repeated and prefix-stripped rows still need A3 structure review.

Requested A12 decisions if routed later:
- `ready_for_A13_visible_slot_review`
- `needs_A3_structure_review_first`
- `reject_keep_NA`

Boundary:
Intake only. Not routed. No visible approval, no A10/A11/render route, no source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance.
