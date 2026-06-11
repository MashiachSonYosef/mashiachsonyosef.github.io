# Agent 1 BDB Augmented Strong Live Source/Custody Re-probe - 2026-06-05

Status: `external_candidate_observed_exact_custody_linkage_still_blocked`

## Lane Decision

| row subset | rows | occurrences | lane | exact linkage proven | transform now | stop condition |
| --- | ---: | ---: | --- | --- | --- | --- |
| `old-dictionary-excluded-row-license-lane-reaudit::bdb-augmented-strong` | 222 | 4435 | `blocked_or_needs_review` | false | false | Stop after recording live candidate evidence and exact remaining custody blockers; do not reclassify, transform, publish, deliver to Agent 6, or claim acceptance. |

## Live Probe

| probe | status | sha256 | error key | observed license | observed version source |
| --- | ---: | --- | --- | --- | --- |
| sefaria_versions_endpoint | 200 | `8932c7a2f127ae398070610dad327349b74d45850947e4d60af1fc91274fd1d8` | yes | null | null |
| sefaria_raw_index_endpoint | 200 | `1dc99d590c0a15a9b04eb19f3eebded08b88dab8acde77eb25b6ebe41bd548dc` | yes | null | null |
| sefaria_index_endpoint | 200 | `1dc99d590c0a15a9b04eb19f3eebded08b88dab8acde77eb25b6ebe41bd548dc` | yes | null | null |
| openscriptures_hebrewlexicon_readme | 200 | `9a129c25674387c494571c3828aa3a8eb78459c165e275c313ae26994ce8ff22` | no | null | null |
| openscriptures_hebrewlexicon_augindex | 200 | `e7217ca8ff8ff3f21f9cf1bbe87411adf55f6aa88bcf5ed9ddc886cc6b160c5d` | no | null | null |

## External Candidate Evidence

- Candidate project: OpenScriptures HebrewLexicon.
- Candidate source/license basis observed: true.
- Observed signals: AugIndex statement true; CC BY 4.0 statement true; public-domain dictionary statement true; attribution statement true.
- Exact linkage blocker: Current repo/API evidence does not prove that the old-dictionary BDB Augmented Strong row subset is sourced from OpenScriptures HebrewLexicon AugIndex.xml under the observed license/custody chain.

## Exact Blockers

- `bdb_augmented_strong_exact_custody_linkage_to_external_candidate_not_proven`
- `bdb_augmented_strong_sefaria_exact_title_source_license_fields_missing`
- `bdb_augmented_strong_import_row_subset_source_mapping_missing`
- `bdb_augmented_strong_agent6_boundary_required_if_evidence_becomes_linked`

## Handoff

- Agent 1: Continue source/license/custody evidence gathering and prove or reject the OpenScriptures linkage before lane change.
- Agent 2: No transform. May consume only blocked/review lane evidence and exact blockers.
- Agent 6: Receives boundary question only after exact source/custody linkage is assembled.
- Agent 10: No release assembly for this subset until Agent 1 linkage evidence and Agent 6 boundary exist.

## Boundary

No QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, candidate-text export authorization, release action, public/runtime mutation, NC commercial authorization, queue mutation, staging, or destructive repo action is claimed.
