# Public HUD Normalized Key Audit

Generated: 2026-06-01T17:12:13.679Z
Status: pass
Manifest: `data/definitions/hud-route-lookup/manifest.json`
Publication status: blocked_no_render

## Policy

Public HUD lookup keys must not contain English grammar annotations, digits, plus signs, slashes, or annotation punctuation. Hebrew punctuation, spaces, maqaf, geresh/gershayim, commas, periods, and parentheses are audit-visible but not failures by themselves.

## Counts

- Shards checked: 7990
- Tokens checked: 175216
- Cards checked: 539661
- Issue tokens: 0
- Issue cards: 0
- ASCII-letter tokens: 0
- Digit tokens: 0
- Plus-sign tokens: 0
- Slash/backslash tokens: 0
- Annotation-punctuation tokens: 0
- Non-Hebrew tokens: 0

## Key Shapes

| key | count |
|---|---:|
| hebrew_word | 167092 |
| hyphen_or_maqaf | 6416 |
| plain_punctuation | 3 |
| space | 1683 |
| space+hyphen_or_maqaf | 18 |
| space+plain_punctuation | 4 |

## Issue Route Types

- None

## Issue Answer Roles

- None

## Issue Samples

- None

## Boundary

- Validates: public_hud_route_lookup_manifest, public_hud_route_lookup_shards
- Does not clear: translation_output, source_publication, public_lexical_export_reuse, accepted_definition_authority
- Answer eligibility scope: hud_answer_slot_only_not_translation_or_publication_readiness
- Route lookup scope: definition_route_lookup_data_not_publication_readiness
- Current route inputs reconciled: not_checked_by_public_lookup_manifest_validate_release_stamp_and_drift
- This audit checks lookup-key hygiene only. It does not import definitions, rewrite source texts, infer meanings, create accepted translation output, or establish publication readiness.
