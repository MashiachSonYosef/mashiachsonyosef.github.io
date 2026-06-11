# Agent 10 Consult: Orot Manifest Generator Path

Generated: 2026-06-06T12:35:26Z

## Scope

`data/lexical/orot.manifest.json` generator/provenance path only.

## Generator Path

`scripts/write_lexical_payloads.mjs`

Generator write site:

`writeJson(path.join(lexicalRoot, \`${workId}.manifest.json\`), { schema_version: 1, work_id: workId, generated_at: tokenIndex.generated_at || null, chunks, token_chunks })`

Resolved Orot output:

`data/lexical/orot.manifest.json`

## Observed Diff Summary

| field | value |
|---|---|
| changed field | `generated_at` |
| chunk counts changed | false |
| token chunks changed | false |
| release/package content evidence | false |

## Cleanup Disposition

Default: `defer`.

Do not stage this as meaningful package work.

Revert only if A07 repo-cleaning or final-validation route explicitly authorizes cleanup action.

Reason: generated-at-only churn is not release/package content evidence.

## Required Validator

- JSON parse `data/lexical/orot.manifest.json`.
- Structural compare against HEAD ignoring `generated_at`.
- Confirm `chunks`, `token_chunks`, chunk counts, token counts, and entry counts are unchanged.

Broader validator reference: `node scripts/validate_sources.mjs`.

## Route Law

- A06: evidence/validator/repo-cleaning production only.
- A07: approval/final validation/release gate.
- A10: release/package consult only.

## Boundary

Consult only. No render, regeneration, staging, revert, cleanup action, publication/release, source/license/legal/Definition/product/answer acceptance, or accepted text.
