A13_H4687_FULL_OCCURRENCE_CONTEXT_MAP_VALIDATION | status | passed_hold_for_context_rule_review

Validated:
- map generation passed
- JSON parse passed
- token-index occurrence counts matched observed occurrence rows
- source-token alignment passed for all rows

Counts:
- target token rows: `12`
- occurrence rows: `340`
- exact lookup rows: `7`
- non-exact lookup rows: `5`
- prefix/affix lookup rows: `5`
- token count mismatches: `0`
- source-token mismatches: `0`
- single-occurrence candidates: `1`

Single-occurrence candidate:
- token_id: `tok-28d61c6232d6`
- surface: `מצותך`
- source_ref: `Agra DeKala, Toldot:1`
- context: `על פי מ"ש בספר דרך` | `מצותך` | `דכאשר יוליד האדם דרך נס,`
- status: candidate for later context-rule review, not visible text

Classification:
The `full_occurrence_context_map_missing` blocker is cleared for H4687, but no visible slot opens. The single exact row may be title/formula context and the commandment/command/ordinance sense is not cleared for display.

Boundary:
Validation only. No display flip, render/runtime mutation, routing, source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance, or project-authored definition.
