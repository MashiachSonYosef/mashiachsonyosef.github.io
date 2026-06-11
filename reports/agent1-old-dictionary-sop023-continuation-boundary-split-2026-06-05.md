# Agent 1 Old Dictionary SOP-023 Continuation Boundary Split - 2026-06-05

target | files used | lane counts/rows | classification lanes | exact blockers | handoff owner | stop condition
--- | --- | --- | --- | --- | --- | ---
`old-dictionary-excluded-row-license-lane-reaudit continuation` | `reports/agent1-old-dictionary-downstream-consumption-alignment-audit-2026-06-05.json`; `reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json`; `reports/agent1-old-dictionary-commercial-clean-only-metadata-custody-2026-06-05.json`; `reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json`; `reports/agent1-old-dictionary-bdb-augmented-strong-blocked-review-exclusion-manifest-2026-06-05.json`; `reports/agent10-agent2-old-dictionary-excluded-row-readiness-consumption-2026-06-05.json` | Scoped preview `500` / `8427`; source-family rows `5`; lanes by source family: commercial_clean_candidate `3`, noncommercial_educational_candidate `1`, metadata_or_link_only `0`, blocked_or_needs_review `1`; Jastrow `210/4474`; BDB `221/4418`; BDB Aramaic `69/2048`; Klein `214/4444`; BDB Augmented Strong `222/4435`; clean-only metadata custody `18/494`; commercial+NC nonblocked `57/818`; commercial+blocked without Klein `82/1068`; triple overlap `140/3367`; Klein-only excluded `17/259`; Agent 2 transform rows now `0` | `commercial_clean_candidate`; `noncommercial_educational_candidate`; `metadata_or_link_only`; `blocked_or_needs_review`. Klein remains separate as `noncommercial_educational_candidate` with no commercial export authorization. BDB Augmented Strong remains `blocked_or_needs_review`. | `missing_exact_agent6_boundary_and_approved_morphology_relation`; `commercial_nc_overlap_requires_agent6_source_family_selection_boundary`; `klein_nc_content_not_commercially_authorized`; `missing_exact_agent6_nc_boundary_no_commercial_export_authorization`; `bdb_augmented_strong_requires_independent_source_license_custody_basis`; `commercial_blocked_overlap_requires_agent6_source_family_selection_or_exclusion_boundary`; `triple_overlap_requires_agent6_source_family_selection_boundary`; `metadata_only_no_definition_or_candidate_text` | Agent 2 may consume split rows only as source-lane evidence with transform rows still `0`; Agent 6 owns future exact row/subset boundary questions; Agent 10 may assemble a future Agent 6 question packet only, with no release route opened here. | Stop after this bounded Agent 1 continuation boundary-split artifact and validation; no QA/source/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted text, no candidate text export, no public/runtime mutation, no release action, no NC commercial authorization.

## Boundary Split

| split | lanes | rows/occurrences | Agent 6 question |
| --- | --- | ---: | --- |
| commercial_clean_only_metadata_custody | `commercial_clean_candidate` | `18/494` | Can this clean-only metadata subset be carried as non-public candidate-use planning evidence, and is a ref-gap boundary required for the `1` row without refs? |
| commercial_nc_overlap_nonblocked | `commercial_clean_candidate`; `noncommercial_educational_candidate` | `57/818` | Select or exclude source-family evidence row/subset before Agent 2 transform; Klein remains NC and is not commercially authorized. |
| commercial_blocked_without_klein | `commercial_clean_candidate`; `blocked_or_needs_review` | `82/1068` | Exclude or resolve BDB Augmented Strong custody before Agent 2 transform from this subset. |
| triple_overlap_commercial_nc_blocked | `commercial_clean_candidate`; `noncommercial_educational_candidate`; `blocked_or_needs_review` | `140/3367` | Requires both NC preservation and BDB Augmented Strong exclusion/resolution before downstream transform. |
| klein_only_excluded | `noncommercial_educational_candidate` | `17/259` | Keep as NC educational candidate only unless Agent 6 gives an exact non-public NC boundary; no commercial export path is opened. |
| metadata_or_link_only | `metadata_or_link_only` | `0/0` | No current row action. |

## Timeout Log

| process_timeout | command | timeout | partial_output_or_artifact | next_safe_action |
| --- | --- | --- | --- | --- |
| false | `node_repl targeted read of six named current Agent 1/10 JSON inputs` | `20000ms` | all six named inputs parsed; summary returned | write bounded continuation artifact |
| false | `node_repl targeted extraction of Klein, BDB Augmented Strong, and downstream lane rows` | `15000ms` | source-family rows and blocked-review counts extracted | validate new JSON/MD artifacts |

Zero output counts: Agent 2 transform `0`; candidate text `0`; definition content `0`; answer rows `0`; answer eligible `0`; public emit `0`; source rows emitted `0`; Agent 6 delivery `0`; queue mutation `0`; render mutation `0`; staging `0`; release actions `0`.
