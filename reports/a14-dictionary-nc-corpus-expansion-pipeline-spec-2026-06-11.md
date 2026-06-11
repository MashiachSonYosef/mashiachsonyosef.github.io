# A14 Dictionary / NC Corpus Expansion Pipeline Spec

Generated: 2026-06-11

## Status

Draft-ready evidence-first pipeline. This does not add active dictionary rows, NC rows, preHUD text, accepted definitions, or publication-ready output.

## Current Finding

The corpus matrix scanned 1,353 coverage works and 1,353 unresolved CSVs. The current old-dictionary source-family token-id evidence joins to only one current work: `orot`.

That means the preserved old-dictionary packets are not yet a corpus-wide active source layer. They are narrow evidence packets, and the next real step is corpus-wide non-active candidate generation after A1/A6 source/custody boundary clearance.

## Current Counts

| item | count |
| --- | ---: |
| coverage work rows | 1,353 |
| unresolved CSV files | 1,353 |
| works with old-dictionary candidate hits | 1 |
| works with NC evidence-only hits | 1 |
| commercial-clean candidate occurrences | 46 |
| NC evidence-only occurrences | 25 |
| blocked/review occurrences | 0 |

## Runnable Steps

| pipeline_step | command/script | output | validator | blocker |
| --- | --- | --- | --- | --- |
| dictionary_nc_corpus_matrix | `node scripts/build_a14_dictionary_nc_corpus_coverage_matrix.mjs` | matrix JSON/MD | `node scripts/validate_a14_dictionary_nc_corpus_coverage_matrix.mjs` | none for evidence matrix |
| corpus_wide_dictionary_candidate_generation | missing dedicated non-active builder | candidate matrix | missing dedicated validator | no A1/A6-cleared corpus-wide dictionary source contract |
| source_boundary_clearance | A6 boundary packet | boundary verdict | lane invariants and JSON parse | `allowed_transform_rows_now` is currently 0 |
| definition_transform_readiness | missing until clearance | transform readiness packet | display-gate validator | no cleared transform rows |
| example_work_lock | `node scripts/validate_route_hud_page.mjs --page <example pages>` | example proof | Route HUD + display gate + diff check | no corpus-wide candidate rowset yet |

## Review Order

1. Review the matrix and accept that current old-dictionary evidence is not yet 1400-work active output.
2. Ask A1/A6 for exact source/custody/row subset clearance for corpus-wide candidate generation.
3. Build a non-active dictionary candidate matrix across all works.
4. Select 3-5 example works from real candidate impact.
5. Run `page_output_pipeline_v1` and Route HUD validators on examples only after candidate display gates exist.
6. Then discuss expansion.

## Boundary

Planning and evidence only. No source/license/legal acceptance, no Definition authority, no accepted gloss or answer text, no active lexical source-layer mutation, no preHUD display promotion, no public runtime, no release acceptance.
