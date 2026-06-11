# Agent 7 To Agent 5: Production-Shaped Goal Map - 2026-06-04

Decision: CHANGES.
Oracle 9 review state to preserve: REVIEW_CHANGES until goals are measurable enough that workers keep working without inventing scope.

Highest permissible claim: Agent 7 production-shaped staffing/goal correction only.

## Production Goal Standard

Do not assign slogan goals such as `finish Orot`.

Use production goals with:

- corpus or work scope;
- target coverage count and percentage;
- allowed license ceiling;
- exact included and excluded license lanes;
- output artifact class;
- validation command or gate;
- Agent 6 boundary gate when authority-sensitive;
- stop condition;
- blocker list.

## Current Corpus Goal

Build the safe-license reader-hint / definition corpus for the target 2000-work corpus using only Agent-6-approved license lanes at the NC-or-safer ceiling, reach 100% match where possible, record every excluded/unmatched row, and make every package validator-backed before public/runtime promotion.

Immediate package sequence: Orot first, then expansion toward the 2000-work target.

Current Orot anchor:

- package: `data/build/orot/reader-hint-placeholder-candidates.json`
- rows: `113`
- occurrences: `4239`
- commercial-clean: `83` rows / `3851` occurrences
- noncommercial educational: `17` rows / `259` occurrences
- `TBD` display-integrity: `13` rows / `129` occurrences
- pending add-candidate packet: `14` rows / `150` occurrences
- projected package if all 14 are cleared by Agent 6: `127` rows / `4389` occurrences

Current license ceiling: NC-or-safer.

Allowed lanes:

- `commercial_clean`: Public Domain, CC0, CC BY, and Agent-6-approved commercial-clean sources.
- `noncommercial_educational`: CC BY-NC only after Agent 1/6 custody, attribution, storage/display, and noncommercial boundary; `commercial_export_allowed=false`.

Excluded or blocked lanes:

- CC BY-SA/GFDL and other share-alike/complex rows unless an Agent 6/legal pipeline explicitly clears the target package.
- external-link-only, metadata-only, no-derivatives, unknown, proprietary, or uncleared rows.

## Agent 10 Goal

Scope: Own the safe-license corpus/package sequence: Orot first, then expansion toward the 2000-work target.

Target: Maintain a current measurable scoreboard for each package: work count, row count, occurrence count, coverage percent, commercial-clean count, NC educational count, excluded rows, unmatched rows, rows awaiting Agent 1, rows awaiting Agent 6, rows blocked by transform/schema/linkage, rows added after Agent 6 clearance.

Output artifact class: release-owner state packet, Agent 6-ready docket, package scoreboard, append preflight, post-append proof, exact blocker synthesis.

Current validator/gate examples:

- `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs`
- `node scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json`
- `node scripts/validate_agent10_orot_20_row_reader_hint_candidate_package_handoff.mjs`
- `node scripts/validate_agent10_orot_allowed_row_non_public_handoff_packet.mjs`

Stop condition: next package is Agent 6-cleared, blocked with exact row-count reason, or handed to the correct Agent 1-4 lane with named artifacts and commands.

Blockers to carry: Agent 6 boundary pending for 14-row candidate; Spark 325 invalid; zero-safe pilot emitted 0 answer rows; no public/runtime mutation cleared.

## Agent 1 / Spark 1 Goal

Scope: Source/license/custody/manifest packaging for each candidate package.

Target: 100% of candidate rows in a package receive row-level `allow`, `exclude`, or `block` status with source/license/attribution reason and commercial-export eligibility.

Allowed license ceiling: NC-or-safer, with NC rows marked `commercial_export_allowed=false`.

Output artifact class: Agent 1 source/license/custody row map, missing-linkage map, source-row evidence packet, queue candidate for Agent 6.

Existing commands Sparks may run only when invoked exactly:

- `node scripts/build_agent1_orot_fill_source_row_evidence.mjs`
- `node scripts/validate_agent1_orot_fill_source_row_evidence.mjs`
- `node scripts/build_agent1_orot_missing_lexicon_linkage_candidates.mjs`
- `node scripts/validate_agent1_orot_missing_lexicon_linkage_candidates.mjs`
- `node scripts/build_agent10_agent1_orot_dry_run_source_license_display_review_request.mjs`
- `node scripts/validate_agent10_agent1_orot_dry_run_source_license_display_review_request.mjs`

Stop condition: row-level map covers the target package, or exact source/license blocker names missing source row, missing manifest, attribution problem, NC boundary, CC BY-SA/GFDL boundary, or unknown license.

Spark rule: Spark 1 runs the named command only. If the needed input/output/count definition is not supplied, return `missing_pipeline_blocker`.

## Agent 2 / Spark 2 Goal

Scope: Definition/lexical/reader-hint/transform packaging from existing deterministic pipelines.

Target: For each package candidate, produce either a validator-backed non-public transform package or exact transform blocker. For Orot, raise the 113-row / 4239-occurrence anchor only through Agent-6-cleared rows; preserve 0 answer rows until cleared.

Allowed license ceiling: NC-or-safer; no manual definitions; no answer/gloss promotion without Agent 6 docket.

Output artifact class: reader-hint candidate patch, transform safety matrix, pilot answer-claims dry run, counterpart preview, exact transform blocker.

Existing commands Sparks may run only when invoked exactly:

- `node scripts/build_agent2_orot_reader_hint_candidate_patch.mjs`
- `node scripts/validate_agent2_orot_reader_hint_candidate_patch.mjs reports/agent2-orot-reader-hint-candidate-patch-2026-06-04.json`
- `node scripts/build_agent2_orot_counterpart_hint_patch_preview.mjs`
- `node scripts/validate_agent2_orot_counterpart_hint_patch_preview.mjs reports/agent2-orot-counterpart-hint-patch-preview-2026-06-04.json`
- `node scripts/build_orot_agent2_pilot_answer_claims.mjs`
- `node scripts/validate_agent2_orot_pilot_answer_claims.mjs`
- `node scripts/validate_agent2_orot_allowed_row_reader_hint_package_dry_run.mjs`

Stop condition: validator-backed package, zero-row safe blocker, or exact transform/schema/linkage blocker with affected row and occurrence counts.

Spark rule: Spark 2 runs the named command only. If the needed input/output/schema is not supplied, return `missing_pipeline_blocker`.

## Agent 3 / Spark 3 Goal

Scope: Linkage, dedupe, crossmatch, provenance-navigation, and continuation indexing.

Target: 100% of candidate package rows have stable token/source/work linkage or exact linkage blocker. Duplicate candidate packets and stale Spark claims must be identified before they reach Agent 10 as package truth.

Allowed license ceiling: evidence/navigation only; no license or Definition acceptance.

Output artifact class: linkage map, duplicate inventory, provenance navigation packet, continuation index, missed-evidence diff.

Existing commands Sparks may run only when invoked exactly:

- `node scripts/build_agent3_usage_state.mjs`
- `node scripts/validate_agent3_usage_state.mjs`
- `node scripts/build_agent3_definition_workbench_usage_collision_work_category_index.mjs`
- `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_index.mjs`
- `node scripts/build_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs`
- `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_occurrence_locator.mjs`
- `node scripts/build_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs`
- `node scripts/validate_agent3_definition_workbench_usage_collision_work_category_provenance_locator.mjs`

Stop condition: linkage/navigation packet covers the named rows, duplicate/stale claim is resolved, or exact blocker names missing input, missing join key, missing provenance field, or unavailable command.

Spark rule: Spark 3 runs the named command only. If the needed input/output/key definition is not supplied, return `missing_pipeline_blocker`.

## Agent 4 / Spark 4 Goal

Scope: Runtime/QC/validator packaging for exact changed packages and static prerequisites.

Target: Every package proposed for public/runtime promotion has exact validator results, marker checks, file/hash/package diffs, and runtime prerequisites before any public proof. Old-HUD hard marker exposure target is 0.

Allowed license ceiling: validation only; no license/source/Definition/public acceptance.

Output artifact class: validator result packet, runtime prerequisite blocker, public proof packet only after changed package and Agent 6 route.

Existing commands Sparks may run only when invoked exactly:

- `node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs`
- `node scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json`
- `node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html`
- `node scripts/validate_agent4_live_browser_runtime_evidence.mjs`
- `node scripts/audit_live_public_old_hud_guard.mjs`

Stop condition: exact validator/prerequisite packet returns with pass/warn/block evidence, or exact missing command/input/package blocker. No broad browser proof loop.

Spark rule: Spark 4 runs the named command only. If the needed target package or output path is not supplied, return `missing_pipeline_blocker`.

## Agent 5 Required Map Change

Before asking Agent 12 to approve/cap, update the goal map so each active lane carries:

- scope;
- target count/percent;
- allowed license ceiling;
- output artifact class;
- validator/gate;
- stop condition;
- blocker list;
- Spark command/input/output if Spark work is requested.

Do not mark the map GO while it contains role labels without production targets.

## Agent 8 Rule

Agent 8 should route concrete packets immediately. No pre-wartime spam, no idle status pings, no duplicate proof loops, and no waiting for Oracle 9 or Agent 12 when the route is already exact.

## Boundary

This artifact creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, or accepted text. Publication remains `blocked_no_render`.
