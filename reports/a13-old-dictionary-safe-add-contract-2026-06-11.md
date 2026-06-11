# A13 Old Dictionary Safe-Add Contract - 2026-06-11

Status: `safe_add_contract_created_non_active_no_reader_output`.

## Decision

Safe active add now: **no**. Safe non-active add now: **yes**.

Active source-layer destination exists at `data/lexical/source-layers`, but `scripts/build_lexical_cache.mjs` writes hard-coded active layers. Adding old dictionary rows there in this pass would promote planning evidence into active lexical output before A6 candidate-use/source-family boundaries are cleared.

## Lane Separation

| lane | source families | rows / occurrences | current state |
|---|---|---:|---|
| commercial_clean_candidate | Jastrow Dictionary; BDB Dictionary; BDB Aramaic Dictionary | exact clean subset 18 / 494 | non-active metadata custody and boundary planning only |
| noncommercial_educational_candidate | Klein Dictionary | 214 / 4444 | separate NC evidence only; not commercial-clean |
| blocked_or_needs_review | BDB Augmented Strong | 222 / 4435 | blocked/review only |

## Exact Safe Contract

- non-active contract JSON: `reports/a13-old-dictionary-safe-add-contract-2026-06-11.json`
- exact current rows carried: `18` Jastrow-only commercial-clean metadata rows / `494` occurrences
- active reader rows added: `0`
- preHUD rows added: `0`
- definition rows added: `0`
- render mutations: `0`
- active source-layer mutations: `0`

## Next Owners

| owner | next action |
|---|---|
| A1 | source-family/source-layer integration packet; no transform/render |
| A6 | exact row/subset candidate-use boundary if A1/A10 submit it |
| A2 | transform only after A1/A6-cleared rows |
| A3 | crossmatch/slice gap rows before source-needed handoff |
| A4 | validate changed packet only after A10/A5 pathspec exists |
| A10 | package truth and Agent6-ready boundary assembly |

Boundary: no QA/source/license/legal/Definition/product/answer/public-runtime/release acceptance, no accepted gloss/text, no staging, no active lexical/render mutation.
