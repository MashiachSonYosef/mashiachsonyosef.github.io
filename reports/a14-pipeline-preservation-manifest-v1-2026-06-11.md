# A14 Pipeline Preservation Manifest v1 - 2026-06-11

Status: `approved_with_required_hardening`.

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
| `book_page_contract_v1` | canonical reader/book page shell | A10 standard; A14 topology; A4 validation | draft_ready (machine-checkable invariants added) |
| `route_hud_contract_v1` | Route HUD popout and evidence behavior | A10 protocol; A14 prototype expectations; A4 validation | draft_ready (machine-checkable invariants added) |
| `page_output_pipeline_v1` | visible book/HUD render pipeline | A14 target shape; A10 package truth; A5 runner | draft_ready (executable spec artifact created) |
| `render_intake_packet_v1` | runner-facing render packet | A10 first complete packet; A5 repeat runner | draft_ready (embedded in page output spec) |
| `crossmatch_packet_v1` | evidence/navigation crossmatch matrix | A3 linkage; A10 intake; A14 shape | spec_incomplete |
| `a3_phrase_abbrev_matrix_contract_v1` | bounded phrase/abbrev matrix | A3 matrix owner; A14 preserves method | draft_ready (builder/validator added) |
| `source_lane_contract_v1` | source-family/custody lanes | A1 lane; A6 docket; A10 package truth | draft_ready |
| `dictionary_nc_corpus_expansion_pipeline_v1` | evidence-first dictionary/NC corpus matrix and Orot example lock | A14 shape; A1/A6 clearance; A10 package truth | draft_ready_evidence_first |
| `definition_transform_readiness_packet_v1` | A2-ready transform packet | A2 after A1/A6; A3 links; A10 packages | draft_ready |
| `repo_clean_packet_v1` | classified dirty repo package | A10 pathspec truth; A5 staging; A6 docket | draft_ready |

## Required Row Shape

`pipeline_id | target_output | canonical_artifacts | input_manifest | commands | timeouts | expected_outputs | dirty_buckets | validators | proof_artifacts | blocker_shape | owner_slot | model_floor | next_owner | gate | forbidden_authority_claims | stop_condition`

The machine-readable rows are in `reports/a14-pipeline-preservation-manifest-v1-2026-06-11.json`.

## Self-Check Command

```powershell
node scripts/validate_a14_pipeline_specs.mjs
```

This validator checks the umbrella manifest, page-output executable spec, crossmatch spec, A3 phrase/abbrev matrix, required invariants, dirty buckets, boundaries, runnable subtype scripts, and evidence-only/preHUD-fail-closed flags.

## Contract Invariant Addendum (for executable hardening)

- No `tok-*` leaks or leaked legacy HUD escape markers in changed page/html or runtime paths.
- No Hebrew LTR rendering regressions in reader-facing fixtures.
- PreHUD must stay quiet `TBD` unless a safe route-backed candidate is selected and `prehud_allowed` is true.
- HUD and preHUD `% match` basis must remain consistent.
- Source passage and preHUD interaction is route-traceable and must jump to matching rows.
- No morphology/form-reference/lemma-only/usage-only auto-promotion into preHUD unless page-specific display gate explicitly allows it.
- All evidence rows, crossmatches, and route suggestions remain evidence/navigation only unless contract gates permit route-backed display.

## Dirty Buckets

`page_html`, `shared_runtime_css_js`, `lexical_source_layer`, `lexical_payload_chunks`, `token_index`, `search_ranker_stats`, `definition_gap_manifest`, `reader_hints_route_lookup`, `proof_report`, `source_license_evidence`, `crossmatch_matrix`, `repo_clean_manifest`, `unrelated_dirt`, `blocked_review`.

## Spec-Incomplete Items

- `crossmatch_packet_v1`: general packet still needs a broad builder and no-payload-copy / evidence-only validator. The spec artifact exists, and the bounded phrase/abbrev matrix path is the current runnable subtype.
- `dictionary_nc_corpus_expansion_pipeline_v1`: the evidence matrix is runnable and Orot is locked as a planning example, but corpus-wide dictionary candidate generation remains blocked until A1/A6 supply exact source/custody row clearance.

## Next Design Output

1. A10 review of `reports/a14-page-output-pipeline-v1-executable-spec-2026-06-11.md` / `.json`.
2. A1/A6 exact Orot transform/output boundary packet, using `reports/a14-orot-dictionary-transform-readiness-blocker-2026-06-11.md` as the current stop condition.
3. Implement the general `crossmatch_packet_v1` builder/validator from `reports/a14-crossmatch-packet-v1-executable-spec-2026-06-11.md` / `.json`.

Stop condition satisfied: this manifest preserves the umbrella map, names golden fixtures, records dirty buckets and validators, embeds exact blocker shapes, and marks non-executable paths as `spec_incomplete`.
