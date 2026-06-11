# A14 Pipeline Preservation Manifest v1 - 2026-06-11

Status: `draft_ready_with_spec_incomplete_blockers_marked`.

Boundary: planning/spec preservation only. No release/publication/runtime/product acceptance, no source/license/legal/Definition/answer/accepted-text acceptance, no destructive repo action, and no lower-agent work order by itself.

## Purpose

Preserve the working paths as executable contracts before the company overhaul changes the agent/control shape. The old agent tree remains a guardrail; the new trunk is product-output and evidence pipeline contracts.

## Golden Fixtures

| role | fixture |
|---|---|
| Orot flagship | `orot/index.html` |
| Ruth same-contract proof | `tanakh/ruth/index.html` |
| hard TBD / lemma / crossmatch trap | `tanakh/daniel/index.html` |
| reader-hint smoke fixture | `tanakh/malachi/index.html` |
| large generated reader surface | `rav-kook/orot-ha-kodesh/index.html` |

## Included Contracts

| pipeline_id | target_output | owner_slot | status |
|---|---|---|---|
| `book_page_contract_v1` | canonical reader/book page shell | A10 standard; A14 topology; A4 validation | draft_ready |
| `route_hud_contract_v1` | Route HUD popout and evidence behavior | A10 protocol; A14 prototype expectations; A4 validation | draft_ready |
| `page_output_pipeline_v1` | visible book/HUD render pipeline | A14 target shape; A10 package truth; A5 runner | draft_ready |
| `render_intake_packet_v1` | runner-facing render packet | A10 first complete packet; A5 repeat runner | draft_ready |
| `crossmatch_packet_v1` | evidence/navigation crossmatch matrix | A3 linkage; A10 intake; A14 shape | spec_incomplete |
| `a3_phrase_abbrev_matrix_contract_v1` | bounded phrase/abbrev matrix | A3 matrix owner; A14 preserves method | spec_incomplete |
| `source_lane_contract_v1` | source-family/custody lanes | A1 lane; A6 docket; A10 package truth | draft_ready |
| `definition_transform_readiness_packet_v1` | A2-ready transform packet | A2 after A1/A6; A3 links; A10 packages | draft_ready |
| `repo_clean_packet_v1` | classified dirty repo package | A10 pathspec truth; A5 staging; A6 docket | draft_ready |

## Required Row Shape

`pipeline_id | target_output | canonical_artifacts | input_manifest | commands | timeouts | expected_outputs | dirty_buckets | validators | proof_artifacts | blocker_shape | owner_slot | model_floor | next_owner | gate | forbidden_authority_claims | stop_condition`

The machine-readable rows are in `reports/a14-pipeline-preservation-manifest-v1-2026-06-11.json`.

## Dirty Buckets

`page_html`, `shared_runtime_css_js`, `lexical_source_layer`, `lexical_payload_chunks`, `token_index`, `search_ranker_stats`, `definition_gap_manifest`, `reader_hints_route_lookup`, `proof_report`, `source_license_evidence`, `crossmatch_matrix`, `repo_clean_manifest`, `unrelated_dirt`, `blocked_review`.

## Spec-Incomplete Items

- `crossmatch_packet_v1`: needs a durable manifest, exact builder for the phrase/abbrev matrix shape, and validator for no-payload-copy / evidence-only fields.
- `a3_phrase_abbrev_matrix_contract_v1`: needs durable input manifest plus dedicated builder and validator before A5 or a weaker model can run it without interpretation.

## Next Design Output

1. `page_output_pipeline_v1` full schema with `render_intake_packet_v1` embedded.
2. `a3_phrase_abbrev_matrix_contract_v1` builder/validator workset.

Stop condition satisfied: this manifest preserves the umbrella map, names golden fixtures, records dirty buckets and validators, embeds exact blocker shapes, and marks non-executable paths as `spec_incomplete`.
