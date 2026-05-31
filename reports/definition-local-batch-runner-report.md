# Definition Local Batch Runner Report

## Scope

- Runner: `scripts/run_definition_local_batch.mjs`
- Run ID: `clean-200k-2026-05-31`
- Run directory: `.local-cache/definition-routes/runs/clean-200k-2026-05-31`
- Purpose: exercise the definition importer pipeline end-to-end without touching public HUD/source artifacts.

## Batch Counts

- Citable rows: 200000
- Phrase/subphrase rows: 200000
- Morphology-review citable rows: 200000
- Proposed morphology rows: 25826
- Morphology quality risk rows: 0
- Cache size for this run: 1.46 GB
- Cache warning threshold: 80.00 GB

## Coverage

- Distinct phrase/subphrase focus tokens: 82104
- Distinct citable focus tokens, all statuses: 23905
- Distinct accepted citable focus tokens: 18217
- Distinct proposed citable focus tokens: 5688
- Coverage with accepted rows only: 22.19%
- Coverage with accepted plus proposed morphology review rows: 29.12%

## Validation

- Citable paraphrase audit passed.
- Phrase evidence audit passed.
- Morphology citable review audit passed.
- Morphology review quality audit passed with zero risk rows.
- Definition coverage audit passed.
- Cache size audit passed below threshold.
