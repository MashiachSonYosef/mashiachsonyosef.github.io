# Definition Workbench Usage Route Resolution

Generated: 2026-06-01T18:26:28.170Z

## Summary

- Occurrence route rows: 49
- Route IDs resolved/unresolved: 1/0
- Occurrence route rows resolved/unresolved: 49/0
- Answer-eligible rows with source/license profile: 49/49
- Complete source/license profile rows: 49
- Forbidden license profile rows: 0
- Future accepted-translation output blocked rows: 49
- Source refs / clusters / frames: 38/2/2
- Supported/candidate/weak rows: 11/26/12
- Reader-facing / route-payload / forbidden-authority hits: 0/0/0

## Checks

| check | status | detail |
|---|---|---|
| route_rows_present | passed | occurrence route rows 49; route IDs 1 |
| all_routes_resolved | passed | unresolved route IDs 0; unresolved rows 0 |
| occurrence_rows_covered | passed | route rows 49; occurrence links 49 |
| status_counts_cover_rows | passed | status rows 49; rows 49 |
| route_metadata_safe | passed | route payload hits 0; forbidden hits 0 |
| answer_eligible_source_license_profile | passed | answer eligible rows 49; with complete source/license profile 49 |
| forbidden_license_profile_absent | passed | forbidden license profile rows 0 |
| future_translation_output_blocked | passed | blocked rows 49; occurrence route rows 49 |
| usage_only_boundary | passed | reader-facing rows 0 |

## Routes

| route id | source | resolution | occurrence rows | source refs | works | family | type | section |
|---|---|---|---:|---:|---:|---|---|---|
| def-kaikki-lemma-e4f94cd5131316a8 | data/definitions/hud-route-store-sample.json | resolved | 49 | 38 | 20 | wiktionary_definition | lemma | lemma |

## Boundary

Agent 3 route-ID resolution audit for Definition Workbench usage occurrence links. It proves selected occurrence links resolve to Agent 2 route IDs through local route-source files while copying only safe route metadata; it does not copy definitions, rank routes, choose visible answers, translate, or publish.

This packet resolves route IDs only. It intentionally excludes route definitions, glosses, translations, answer text, ranking decisions, and publication claims.

Answer-eligible route metadata carries compact source/license rows for audit only. Those rows do not clear accepted-translation output, public rendering, or publication readiness.
