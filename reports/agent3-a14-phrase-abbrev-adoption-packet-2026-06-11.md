# A3 Phrase/Abbreviation Adoption Packet

Generated: 2026-06-11T09:43:00-04:00

## Return Shape

`A3_PHRASE_ABBREV_ADOPTION | input artifacts | reusable scripts/data | proposed first bounded workset | output artifact path | fields | blockers | next owner | stop_condition`

## A3_PHRASE_ABBREV_ADOPTION

Agent 3 should treat the A14 phrase/abbreviation pipeline as a reusable occurrence-linkage pattern:

`surface form / abbreviation / phrase window -> normalized form(s) -> possible base expansion -> source occurrence ids -> work/page/token-index evidence -> existing lexical/source layer hit -> unresolved/blocker class -> handoff owner`

This is evidence/navigation only. A3 does not accept definitions, glosses, answer eligibility, source/license status, public/runtime state, or release state.

## Input Artifacts

- `reports/a14-definition-expansion-phrase-abbreviation-build-2026-06-11.md`
- `.local-cache/a14-reference-abbrev-targets-2026-06-11.txt`
- `.local-cache/a14-rabbinic-reference-abbrev-targets-2026-06-11.txt`
- `.local-cache/a14-phrase-abbrev-targets-2026-06-11.txt`
- `data/lexical/source-layers/project-abbreviations.json`
- `reports/workbench-usage-phrase-recurrence-index.md`
- `.local-cache/workbench-evidence/usage-phrase-recurrence-index.json`
- `reports/phrase-subphrase-bulk-workflow.md`
- `reports/phrase-evidence-audit.md`
- `reports/sitewide-abbreviation-layer-report.md`

## Bounded Input Counts

- A14 target manifests: `3`
- Work ids per A14 target manifest: `5`
- Unique target work ids after dedupe: `9`
- Target work lexical manifests present: `9/9`
- Current `project-abbreviations` entries: `84`
- Maximum bounded work-entry pairs for first matrix: `9 * 84 = 756`
- Prior phrase evidence audit rows available for pattern reuse: `200000`
- Prior phrase recurrence index rows: `2390`
- Prior phrase recurrence groups: `2244`

Unique A14 target work ids:

- `arukh-hashulchan`
- `beit-yosef`
- `divrei-yirmiyahu-on-mishneh-torah-sabbath`
- `drisha`
- `haamek-sheilah-on-sheiltot-drav-achai-gaon`
- `machatzit-hashekel-on-orach-chayim`
- `peri-megadim-on-orach-chayim`
- `tzafnat-paneach-on-mishneh-torah-heave-offerings`
- `urim-vetumim-tumim`

## Reusable Scripts/Data

- `scripts/build_workbench_usage_phrase_recurrence_index.mjs`
- `scripts/validate_workbench_usage_phrase_recurrence_index.mjs`
- `scripts/build_phrase_evidence.mjs`
- `scripts/audit_phrase_evidence.mjs`
- `scripts/build_workbench_usage_lookup_index.mjs`
- `scripts/build_workbench_usage_graph.mjs`
- `scripts/build_workbench_usage_concordance.mjs`
- `scripts/check_workbench_usage_route_links.mjs`
- `scripts/build_agent3_crossmatch_inventory_packet.mjs`
- `scripts/validate_agent3_crossmatch_inventory_packet.mjs`
- `scripts/build_lexical_cache.mjs`
- `scripts/report_sitewide_lexical.mjs`

Reusable data surfaces:

- `data/lexical/<work-id>.manifest.json`
- `data/lexical/<work-id>-chunks/*.json`
- `data/lexical/source-layers/project-abbreviations.json`
- `data/public-lexical/sitewide/normalized-lookup.json`
- `data/public-lexical/sitewide/claim-index.jsonl`

## Proposed First Bounded Workset

Workset id: `agent3-a14-phrase-abbrev-pattern-crossmatch-2026-06-11`

Target:

- Crossmatch A14's 9 unique target works against the 84 current project abbreviation entries.
- Emit rows only where a surface or normalized form appears in target lexical chunks or where an exact blocker explains why it cannot be linked.
- Preserve route/lexical ids as pointers only. Do not copy accepted definition payloads or treat project abbreviation renderings as A3 authority.

Expected output artifact path:

- `reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.json`
- `reports/agent3-a14-phrase-abbrev-pattern-crossmatch-matrix-2026-06-11.md`

## Output Fields

- `pattern_id`
- `surface`
- `normalized`
- `pattern_type`
- `possible_expansion_or_base`
- `work_ids`
- `occurrence_count`
- `sample_occurrence_ids`
- `sample_source_refs`
- `sample_page_anchors`
- `sample_token_indices`
- `existing_source_layer_hit`
- `source_layer_id`
- `source_row_keys`
- `route_or_lexical_ids_if_any`
- `evidence_only_reason`
- `blocker_class`
- `next_owner`
- `stop_condition`

## Pattern Type Rules

- `abbreviation_reference`: direct abbreviation entry points to a named reference, work, person, or citation convention.
- `phrase_abbreviation`: abbreviation expands to a multi-token phrase.
- `prefix_suffix_parsed_form`: surface is only supportable after conservative prefix/suffix parse, with the base present in an existing lexical/source layer.
- `recurring_phrase_window`: repeated phrase window around a focus token, drawn from workbench usage phrase recurrence.
- `maqaf_subphrase_evidence`: maqaf-linked token part appears in source-preserved form.
- `lemma_only_crossmatch`: surface does not directly match a source row but normalized/base family does.
- `unsafe_prehud_blocked`: pattern may exist, but rows cannot be reader-facing because ambiguity, missing route/source pointer, or gate blocker remains.

## Blockers / Failure Modes

- `missing_durable_manifest`: A14 target work lists currently live under `.local-cache`; a durable `reports/` or `data/control/` manifest is needed before a weaker model can rerun the work without guessing.
- `missing_a3_builder`: there is no dedicated A3 builder yet for the exact phrase/abbreviation matrix output shape above.
- `missing_a3_validator`: there is no dedicated validator yet for the exact matrix fields and no-payload-copy rule.
- `ambiguous_expansion`: a surface maps to multiple plausible expansions or work-scoped meanings.
- `lexical_manifest_missing`: target work lacks `data/lexical/<work-id>.manifest.json`.
- `occurrence_link_missing`: lexical chunk hit lacks source ref, token index, occurrence id, or page anchor.
- `source_layer_pointer_missing`: lexical hit cannot be traced back to a source-layer entry id/source row key.
- `definition_payload_leak`: output copies strict renderings or definition payload text instead of carrying IDs and evidence-only reasons.
- `route_selection_drift`: consumer treats A3 evidence rows as answer candidates or final route selection.

## Next Owner

- Agent 3 owns the first crossmatch matrix contract and evidence packet.
- A14 may continue product-facing prototype/build work.
- Agent 2 consumes only route/lexical IDs and source-row pointers when transform-ready.
- Agent 10 consumes the packet for release/package planning only.
- A07 owns approval routes where approval is required.
- A06 remains evidence/validator authority where validation evidence is requested.

## Stop Condition

Stop after producing either:

- the bounded 9-work / 84-entry phrase-abbreviation crossmatch matrix with exact counts and validator output; or
- an exact `missing_pipeline_blocker` naming the missing command, input, output schema, validator, or durable manifest.

Do not run a broad corpus job from this packet. Do not mutate routes, HUD, preHUD, lexical source layers, public runtime, source imports, or release files.

