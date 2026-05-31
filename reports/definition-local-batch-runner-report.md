# Definition Local Batch Runner Report

## Scope

- Runner: `scripts/run_definition_local_batch.mjs`
- Run ID: `wide-1m-sharded-2026-05-31`
- Run directory: `.local-cache/definition-routes/runs/wide-1m-sharded-2026-05-31`
- Max rows per lane: 1000000
- JSONL shard max bytes: 1800000000
- Include risky morphology: no
- Purpose: exercise the definition importer pipeline end-to-end without touching public HUD/source artifacts.

## Batch Counts

- Citable rows: 1000000
- Phrase/subphrase rows: 1000000
- Morphology-review citable rows: 1000000
- Proposed morphology rows: 224638
- Morphology quality risk rows: 0
- Cache size for this run: 7.43 GB
- Cache warning threshold: 80.00 GB

## Coverage

- Distinct phrase/subphrase focus tokens: 363572
- Distinct citable focus tokens, all statuses: 60274
- Distinct accepted citable focus tokens: 39637
- Distinct proposed citable focus tokens: 20637
- Coverage with accepted rows only: 10.13%
- Coverage with accepted plus proposed morphology review rows: 15.17%

## License Summary

- Citable usage licenses:
  - Public Domain: 891346
  - CC-BY-SA: 102422
  - CC0: 3928
  - CC-BY: 2304
- Citable source licenses:
  - Public Domain: 891346
  - CC BY-SA 4.0 / GFDL: 875860
  - CC BY 4.0: 212350
  - CC0: 127902
  - CC-BY-SA: 102422
  - project-authored / CC0: 3511
  - CC-BY: 2304
- Phrase usage licenses:
  - Public Domain: 862986
  - CC-BY-SA: 133971
  - CC0: 3043
- Morphology-review source licenses:
  - Public Domain: 886897
  - CC BY 4.0: 674767
  - CC BY-SA 4.0 / GFDL: 672542
  - CC0: 357589
  - project-authored / CC0: 292463
  - CC-BY-SA: 110037
  - CC-BY: 184

## Validation

- Citable paraphrase audit passed.
- Phrase evidence audit passed.
- Morphology citable review audit passed.
- Morphology review quality audit passed with zero risk rows.
- Definition coverage audit passed.
- Cache size audit passed below threshold.
