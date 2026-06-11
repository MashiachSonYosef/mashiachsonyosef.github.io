# Agent 6 Repo Dirt Classification Support - 2026-06-05

## Disposition

WARN-BLOCKING SUPPORT DOCKET.

This is non-destructive repo-dirt classification only. It does not stage, delete, revert, clean, accept, publish, or clear any QA/product/source/runtime gate.

## Repo Scope

- Workdir: `C:/Users/owner/Documents/translations`
- Branch: `main`
- HEAD observed: `ee36052cf`
- Snapshot command basis: `git status --porcelain=v1 -z --untracked-files=all`
- Files classified: `17456` dirty status records

## Category Counts

| category | count | classification |
|---|---:|---|
| tracked deletions | 12231 | P0 needs-owner/release-owner review before any staging |
| modified tracked files | 1490 | needs lane packet or owner/release classification |
| added tracked files | 22 | can be batched only with matching validation/provenance |
| untracked files | 3713 | classify before staging; do not `git add -A` |

## Path-Family Counts

| path family | dirty records | classification |
|---|---:|---|
| `data/public-hud` | 11937 | P0 public-runtime/generated-output churn candidate; blocks package truth until reconciled |
| `reports` | 2934 | support evidence plus report-deletion risk; batchable only by docket family |
| site pages | 1541 | public/runtime surface dirt; release-owner packet required |
| `scripts` | 502 | validator/builder provenance dirt; batch with corresponding evidence only |
| other `data` | 435 | source/lexical/generated data; source-lane review required |
| `tanakh` | 49 | public page/runtime dirt; release-owner packet required |
| `data/definitions` | 19 | definition/workbench planning data; Agent 2/6 boundary required |
| `data/control` | 16 | control-state dirt; Agent 7/5 publication or queue hygiene proof required |
| temp/noise | 9 | deletion candidate only with explicit owner approval |
| `data/translation-memory` | 4 | source/provenance risk; Agent 1/6 boundary required |
| `assets`, `hud-preview`, `orot`, root artifacts | 9 | runtime/support dirt; exact packet required |

## Exact Blockers

- public_hud_package_truth_blocked: 11937 tracked deletions under data/public-hud. Handoff owner: Agent 10.
- provenance_and_validator_recountability_blocked: 236 deleted reports and 55 deleted scripts. Handoff owner: Agent 5/7 plus source worker lanes.
- control_truth_blocked_if_untracked_files_are_relied_on: 16 untracked data/control files. Handoff owner: Agent 5/7.
- runtime_public_claims_blocked: 1541 dirty site-page records and 49 dirty tanakh records. Handoff owner: Agent 10 with Agent 4 proof after changed package.
- source_provenance_claims_blocked: untracked or modified source/lexical/translation-memory data. Handoff owner: Agent 1 then Agent 6 if QA-relevant.
- destructive_cleanup_not_authorized: classification pipeline is read-only except explicit output artifacts. Handoff owner: owner.

## Proposed Non-Destructive Batches

- Batch A: qa_support_docket; condition: owner_wants_checkpoint_only.
- Batch B: evidence_reports; condition: exclude_deleted_reports_and_raw_logs_unless_explicitly_wanted.
- Batch C: validators_and_builders; condition: only_with_matching_report_packet_and_no_orphan_deletion.
- Batch D: control_state; condition: only_with_agent5_agent7_publication_or_queue_health_proof.
- Batch E: runtime_public_hud_site_surface; condition: requires_agent10_changed_input_release_packet.
- Batch F: temporary_noise; condition: delete_only_after_explicit_owner_approval.

## Sample Paths

### .github|deleted

- `.github/workflows/deploy-lightweight-pages.yml`

### assets|deleted

- `assets/css/reader-workbench.css`

### assets|modified

- `assets/js/reader-workbench.js`

### assets|untracked

- `assets/css/reader-workbench.css`

### data/build|modified

- `data/build/orot/reader-hint-placeholder-candidates.json`

### data/control|untracked

- `data/control/agent13_organization_state.json`
- `data/control/agent6_validation_queue.json`
- `data/control/agent7_pulse_state.json`
- `data/control/agent_goal_board.json`
- `data/control/agent_registry.json`
- `data/control/definition_workbench_plan.json`
- `data/control/gate_registry.json`
- `data/control/overnight_autonomy_state.json`

### data/definitions|added

- `data/definitions/definition-workbench-status-contract-fixtures.json`
- `data/definitions/gloss-selection-contract.json`
- `data/definitions/hud-route-card-sample.csv`

### data/definitions|modified

- `data/definitions/definition-workbench-sample.json`
- `data/definitions/hud-route-contract.json`
- `data/definitions/hud-route-fixtures.json`
- `data/definitions/hud-route-lookup-sample.json`
- `data/definitions/hud-route-lookup/manifest.json`
- `data/definitions/hud-route-release-stamp.json`
- `data/definitions/hud-route-store-sample.json`
- `data/definitions/manifest.json`

### data/definitions|untracked

- `data/definitions/agent2-definition-workbench-usage-joined-sample-planning.json`
- `data/definitions/agent2-future-workset-intake-fixture.json`
- `data/definitions/agent2-source-lane-assignment-preflight-fixture.json`
- `data/definitions/definition-workbench-500.json`
- `data/definitions/definition-workbench-sample-1000.json`
- `data/definitions/definition-workbench-sample-500.json`
- `data/definitions/definition-workbench-sample-5000.json`

### data/public-hud|deleted

- `data/public-hud/amos/chunks/amos-001.json`
- `data/public-hud/amos/manifest.json`
- `data/public-hud/amos/occurrences.json`
- `data/public-hud/amos/reader-hints.json`
- `data/public-hud/amos/route-lookup/manifest.json`
- `data/public-hud/amos/route-lookup/shards/05d0-05d1-05d3.json`
- `data/public-hud/amos/route-lookup/shards/05d0-05d1-05d5.json`
- `data/public-hud/amos/route-lookup/shards/05d0-05d1-05d9.json`

### data/translation-memory|untracked

- `data/translation-memory/attribution-manifest.json`
- `data/translation-memory/occurrence-decisions/orot-sample.jsonl`
- `data/translation-memory/translation-decision-contract.json`
- `data/translation-memory/translation-memory-index.json`

### hud-preview|modified

- `hud-preview/index.html`
- `hud-preview/routes/app.js`
- `hud-preview/routes/index.html`

### orot|modified

- `orot/index.html`

### other_data|modified

- `data/catalog/sefaria-safe-candidate-midrash-probe.json`
- `data/lexical/orot-chunks/chunk-000.json`
- `data/lexical/orot-chunks/chunk-001.json`
- `data/lexical/orot-chunks/chunk-002.json`
- `data/lexical/orot-chunks/chunk-003.json`
- `data/lexical/orot-chunks/chunk-004.json`
- `data/lexical/orot-chunks/chunk-005.json`
- `data/lexical/orot-chunks/chunk-006.json`

### other_data|untracked

- `data/lexical/beer-hagolah-chunks/chunk-000.json`
- `data/lexical/beer-hagolah-chunks/chunk-001.json`
- `data/lexical/beer-hagolah-chunks/chunk-002.json`
- `data/lexical/beer-hagolah-chunks/chunk-003.json`
- `data/lexical/beer-hagolah-chunks/chunk-004.json`
- `data/lexical/beer-hagolah-chunks/chunk-005.json`
- `data/lexical/beer-hagolah-chunks/chunk-006.json`
- `data/lexical/beer-hagolah-chunks/chunk-007.json`

### overlay-export.json|modified

- `overlay-export.json`

### reports|added

- `reports/gloss-selection-contract-validation.json`
- `reports/gloss-selection-contract-validation.md`
- `reports/hud-route-card-csv-report.md`
- `reports/hud-route-freeze-volume-gate.json`
- `reports/hud-route-freeze-volume-gate.md`
- `reports/hud-route-release-volume-gate.json`
- `reports/hud-route-release-volume-gate.md`
- `reports/route-publication-boundary-coherence.json`

### reports|deleted

- `reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json`
- `reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.md`
- `reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.json`
- `reports/agent1-orot-sefaria-nc-aware-family-custody-boundary-2026-06-03.md`
- `reports/agent10-about-license-header-fix-2026-06-03.md`
- `reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.json`
- `reports/agent10-agent1-agent6-orot-nc-aware-boundary-request-2026-06-03.md`
- `reports/agent10-agent1-ready-orot-dry-run-source-license-display-review-request-2026-06-03.json`

### reports|modified

- `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.json`
- `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-03.md`
- `reports/agent1-state.md`
- `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.json`
- `reports/agent10-agent1-ready-orot-missing-linkage-review-docket-2026-06-03.md`
- `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.json`
- `reports/agent10-agent6-ready-orot-prefix-stem-contract-packet-2026-06-03.md`
- `reports/agent10-agent6-ready-orot-project-preferred-contract-packet-2026-06-03.json`

### reports|untracked

- `reports/.spark3_cmd1_err.log`
- `reports/.spark3_cmd1_out.log`
- `reports/.spark3_cmd2_err.log`
- `reports/.spark3_cmd2_out.log`
- `reports/.spark3_cmd3_err.log`
- `reports/.spark3_cmd3_out.log`
- `reports/.spark3_cmd4_err.log`
- `reports/.spark3_cmd4_out.log`

### scripts|added

- `scripts/export_hud_route_cards_csv.mjs`
- `scripts/validate_definition_workbench_status_contract_fixtures.mjs`
- `scripts/validate_definition_workbench_status_semantics.mjs`
- `scripts/validate_gloss_selection_contract.mjs`
- `scripts/validate_hud_route_card_csv.mjs`
- `scripts/validate_hud_route_freeze_volume.mjs`
- `scripts/validate_hud_route_publication_script_guards.mjs`
- `scripts/validate_hud_route_release_runner_guard.mjs`

### scripts|deleted

- `scripts/audit_agent10_sefaria_lexicon_license_metadata.mjs`
- `scripts/audit_agent2_orot_sefaria_lexicon_hits.mjs`
- `scripts/audit_live_deuteronomy_runtime.mjs`
- `scripts/build_agent10_agent1_agent6_orot_nc_aware_boundary_request.mjs`
- `scripts/build_agent10_agent1_orot_dry_run_source_license_display_review_request.mjs`
- `scripts/build_agent10_agent1_orot_sefaria_family_custody_matrix_request.mjs`
- `scripts/build_agent10_leviticus_runtime_review_docket.mjs`
- `scripts/build_agent10_orot_20_row_reader_hint_candidate_package_handoff.mjs`

### scripts|modified

- `scripts/build_agent10_multi_lane_reader_surface_release_train.mjs`
- `scripts/build_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs`
- `scripts/build_definition_routes.mjs`
- `scripts/build_definition_workbench_sample.mjs`
- `scripts/build_hud_route_fixtures.mjs`
- `scripts/build_hud_route_lookup.mjs`
- `scripts/build_hud_route_store.mjs`
- `scripts/freeze_hud_route_inputs.mjs`

### scripts|untracked

- `scripts/append_agent10_orot_205_commercial_clean_placeholders.mjs`
- `scripts/audit_agent10_sefaria_lexicon_license_metadata.mjs`
- `scripts/audit_agent2_orot_sefaria_lexicon_hits.mjs`
- `scripts/audit_live_deuteronomy_runtime.mjs`
- `scripts/audit_old_hud_dynamic_fallback.mjs`
- `scripts/audit_old_hud_exposure.mjs`
- `scripts/audit_route_hud_accessibility.mjs`
- `scripts/audit_route_hud_click_contract.mjs`

### site-pages|deleted

- `404.html`

### site-pages|modified

- `about/index.html`
- `ari/pri-etz-chaim/index.html`
- `ari/sefer-etz-chaim/index.html`
- `ari/shaar-hagilgulim/index.html`
- `ari/shaar-hahakdamot/index.html`
- `ari/shaar-hakavanot/index.html`
- `ari/shaar-hamitzvot/index.html`
- `ari/shaar-hapesukim/index.html`

### site-pages|untracked

- `chasidut/agra-dekala/overlay-export.csv`
- `chasidut/agra-dekala/overlay-export.json`
- `chasidut/agra-dekala/overlay-export.md`
- `chasidut/arvei-nachal/overlay-export.csv`
- `chasidut/arvei-nachal/overlay-export.json`
- `chasidut/arvei-nachal/overlay-export.md`
- `chasidut/baal-shem-tov/overlay-export.csv`
- `chasidut/baal-shem-tov/overlay-export.json`

### tanakh|modified

- `tanakh/amos/index.html`
- `tanakh/daniel/index.html`
- `tanakh/deuteronomy/index.html`
- `tanakh/ecclesiastes/index.html`
- `tanakh/esther/index.html`
- `tanakh/exodus/index.html`
- `tanakh/ezekiel/index.html`
- `tanakh/ezra/index.html`

### temp_noise|untracked

- `--no-write`
- `.tmp-head-token-index.json`
- `.tmp-mishnah-pd-workids.txt`
- `.tmp-tosefta-brief-01-workids.txt`
- `.tmp-tosefta-brief-02-workids.txt`
- `.tmp-tosefta-brief-03-workids.txt`
- `.tmp_spark10_goal_cycle_snapshot.json`
- `tmp_validator_stderr.txt`

## Stop Condition

Classification artifact exists. No staging, deletion, reverting, cleanup, product acceptance, source/provenance acceptance, license/legal acceptance, runtime/public acceptance, Definition authority, answer eligibility, publication readiness, accepted text, commercial export authorization, NC commercial authorization, or release action is created by this docket.

