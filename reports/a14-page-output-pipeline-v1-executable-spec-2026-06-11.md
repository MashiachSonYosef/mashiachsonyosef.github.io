# A14 Page Output Pipeline v1 Executable Spec - 2026-06-11

Status: `draft_ready_for_a10_review`.

Boundary: planning/spec preservation only. No release/publication/runtime/product acceptance, no source/license/legal/Definition/answer/accepted-text acceptance, no repo cleanup action, and no lower-agent work order by itself.

## Purpose

Make the visible book/HUD render loop executable by A5 or a weaker model without relying on agent memory. This spec embeds `render_intake_packet_v1` inside the broader `page_output_pipeline_v1` so the runner knows both what to run and what the page must preserve.

## Golden Fixtures

| fixture_role | path | purpose |
|---|---|---|
| `orot_flagship` | `orot/index.html` | canonical A10/Orot page behavior |
| `ruth_same_contract` | `tanakh/ruth/index.html` | same-contract proof outside Orot |
| `hard_display_gate_trap` | `tanakh/daniel/index.html` | TBD / lemma-only / morphology / crossmatch guard |
| `reader_hint_smoke` | `tanakh/malachi/index.html` | committed reader-hint gate smoke |
| `large_generated_surface` | `rav-kook/orot-ha-kodesh/index.html` | large generated page surface |

## Render Intake Packet v1

Required packet fields:

`packet_id | target_pages | target_work_ids | changed_inputs | render_command | timeout_ms | expected_outputs | dirty_buckets | validators | proof_artifacts | blocker_shape | next_owner | stop_condition | authority_boundary`

Minimum runner command:

```powershell
powershell -File scripts/render_site.ps1 -OnlyWorkIdsPath <work_ids.txt> -SkipOverlayExports -SkipLexicalPayloadFiles
```

Minimum validators:

```powershell
node scripts/validate_route_hud_page.mjs --page <target page(s)>
node scripts/validate_reader_hints_from_route_lookup.mjs
git diff --check -- <scoped paths>
```

Optional validator when definition route artifacts are touched:

```powershell
node scripts/validate_definition_outputs.mjs
node scripts/validate_definition_expansion_gap_manifest.mjs
```

## Page/HUD Invariants

| invariant_id | requirement | fail shape |
|---|---|---|
| `book_header` | Normal book header and compact corpus/work metadata remain present. | `page_output_pipeline_blocker | page | book_header_missing | validator | next_owner | stop_condition` |
| `source_passage` | Source passage is visible, RTL-safe, clickable, and copyable. | `page_output_pipeline_blocker | page | source_passage_missing_or_ltr_regressed | validator | next_owner | stop_condition` |
| `prehud_rows` | One Hebrew token maps to one preHUD row for rendered token rows. | `page_output_pipeline_blocker | page | token_row_mismatch | count | next_owner | stop_condition` |
| `source_to_prehud_jump` | Source token affordance jumps to matching preHUD row. | `page_output_pipeline_blocker | page | source_to_prehud_jump_missing | validator | next_owner | stop_condition` |
| `hud_open` | HUD opens from token/source affordance and does not require hidden lore. | `route_hud_contract_blocker | page | hud_open_affordance_missing | validator | next_owner | stop_condition` |
| `scroll_lock` | Body scroll is locked while HUD is open. | `route_hud_contract_blocker | page | scroll_lock_missing | validator | next_owner | stop_condition` |
| `selected_vs_alternatives` | Selected/default route is visually and structurally separate from alternatives. | `route_hud_contract_blocker | page | selected_route_not_separated | validator | next_owner | stop_condition` |
| `source_license` | Source/license details remain inspectable in HUD for displayed route-backed candidates. | `route_hud_contract_blocker | page | source_license_hidden | validator | next_owner | stop_condition` |
| `match_basis` | PreHUD `% match` and HUD match basis must not drift. | `route_hud_contract_blocker | page | match_basis_drift | token_id | next_owner | stop_condition` |
| `quiet_tbd` | Unresolved or unsafe rows display quiet `TBD`, not replacement definition text. | `display_gate_blocker | page | unsafe_preHUD_text | token_id | next_owner | stop_condition` |
| `evidence_only` | Crossmatch, lemma-only, morphology/form-reference, and usage-only rows remain evidence/navigation only unless the display gate explicitly clears them. | `display_gate_blocker | page | evidence_only_promoted | token_id | next_owner | stop_condition` |
| `stale_markers` | No old escaped HUD markers, non-whitelisted `data-hud-*`, or visible stale `tok-*` leaks. | `page_output_pipeline_blocker | page | stale_marker_or_token_leak | marker | next_owner | stop_condition` |

## Dirty Buckets

| bucket | examples | staging rule |
|---|---|---|
| `page_html` | `tanakh/<work>/index.html`, `orot/index.html` | stage only target pages validated by Route HUD validator |
| `shared_runtime_css_js` | `assets/js/reader-workbench.js`, shared CSS | stage separately; run syntax and page/HUD smoke validators |
| `lexical_source_layer` | `data/lexical/source-layers/*.json`, source-layer builder changes | stage only with source/lane proof and definition validators |
| `lexical_payload_chunks` | `data/lexical/<work>-chunks/**`, manifests | stage with manifest/chunk parity checks |
| `token_index` | `data/lexical/token-index*.json`, per-work token indexes | keep with matching generated page/lexical payload |
| `search_ranker_stats` | `data/search/**`, `data/reports/coverage/**`, unresolved CSVs, stats | stage with ranker/shape checks |
| `definition_gap_manifest` | `data/definitions/definition-expansion-gap-manifest.json`, report | stage after gap validator passes |
| `reader_hints_route_lookup` | `data/lexical/reader-hints/**`, reader-hint report | stage only after reader-hint validator passes |
| `proof_report` | `reports/a14-*.md/json`, A10 packets | evidence only; no acceptance claims |
| `unrelated_dirt` | files outside packet scope | do not stage in packet |
| `blocked_review` | paths with failed validator or missing source/license boundary | return exact blocker |

## Runner Order

1. Read the packet and confirm all required fields are present.
2. Run `git status --short` and record the starting dirty set.
3. Run render command only if `target_work_ids` and `target_pages` are explicit.
4. Classify all resulting dirty paths into the dirty buckets above.
5. Run scoped page/HUD validator on target pages only.
6. Run reader-hint and definition validators only when their inputs are touched.
7. Run `git diff --check -- <scoped paths>`.
8. Produce proof artifact or exact blocker.

## Handoff Map

| owner | receives | must return |
|---|---|---|
| A14 | target shape, fixture choice, desired output topology | complete packet fields or `spec_incomplete` |
| A10 | package truth, stage manifest, boundary packet assembly | pathspec/stage guidance or exact package blocker |
| A5 | completed render intake packet | runner proof, dirty buckets, or exact process timeout |
| A4 | changed page/runtime/data outputs | validator proof or exact failed invariant |
| A3 | crossmatch/linkage evidence needs | evidence matrix or missing pipeline blocker |
| A1/A6 | source/license-sensitive source rows | lane docket or exact boundary blocker |
| A2 | A1/A6-cleared transform inputs | candidate readiness packet with `prehud_allowed=false` unless gate clears |
| A7/owner | activation/public-runtime/release questions | final approval or rejection outside this spec |

## Stop Condition

This pipeline is runnable when a packet contains explicit target pages, work ids, changed inputs, command, timeout, expected outputs, dirty buckets, validators, proof artifact path, blocker shape, next owner, and authority boundary. If any field is missing, return:

`render_intake_packet_blocker | missing_field | command | timeout | target_pages | dirty_paths | next_owner | stop_condition`
