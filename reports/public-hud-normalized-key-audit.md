# Public HUD Normalized Key Audit

Generated: 2026-05-31T17:06:57.494Z
Status: pass
Manifest: `data/definitions/hud-route-lookup/manifest.json`

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

This audit checks lookup-key hygiene only. It does not import definitions, rewrite source texts, or infer meanings.
