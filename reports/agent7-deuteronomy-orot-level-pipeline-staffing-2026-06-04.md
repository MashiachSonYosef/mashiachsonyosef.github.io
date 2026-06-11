# Agent 7 Deuteronomy Orot-Level Pipeline Staffing - 2026-06-04

Active mode: `BROAD_CORPUS_EXPANSION`

Target: `tanakh/deuteronomy`

Status: `first_per_book_pipeline_target_staffing_routes_prepared`

## Manager Decision

Deuteronomy is the first non-Orot target for Orot-level pipeline replication.

Seed Agents 1-3 as package-definition/blocker tasks because exact Deuteronomy-specific package commands are not yet present. Seed Agent 4/Spark-4 only for the one exact baseline runtime command. Where the lane package is known but the command/input/output/schema is not exact, preserve `missing_pipeline_blocker` instead of inventing a pipeline.

## Lane Staffing

| Lane | Queue item | Target | Exact command/input/output state | Expected artifact or blocker |
| --- | --- | --- | --- | --- |
| Agent 1 / Spark-1 | `deuteronomy-source-license-custody-map` | Per-book source/license/custody family map with `commercial_clean`, `noncommercial_educational_candidate`, `metadata/link-only`, `blocked`. Preserve NC fields: `derived_from_nc=true`, `commercial_export_allowed=false`, attribution-gated, non-contaminating. | Package-definition/blocker task. Known candidate inputs exist under `data/sources/deuteronomy.json`, `data/sources/*-on-deuteronomy.json`, `data/lexical/*deuteronomy*`, and Deuteronomy public-HUD data, but the exact output schema and validator/gate were not supplied. Spark-1 may only run a named existing command supplied by Agent 1/7; otherwise return blocker. | Expected Agent 1 artifact: `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md` plus optional JSON if mechanically produced. Stop with family counts, candidate source families, excluded/blocked rows, next Agent 6 boundary need, or exact missing command/input/schema blocker. |
| Agent 2 / Spark-2 | `deuteronomy-definition-reader-hint-candidates` | Per-book definition/lemma/reader-hint candidate transform package; commercial-clean first; NC educational only with explicit flags; include already identified missed dictionaries before new discovery. | Package-definition/blocker task. Current exact Spark-2 workset is broad `spark2-broad-definition-workbench-500-sample-refresh`, not a Deuteronomy-filtered candidate transform. Existing Orot reader-hint builders are not authority to mutate Deuteronomy. | Expected Agent 2 artifact: `reports/agent2-deuteronomy-reader-hint-candidate-plan-2026-06-04.md` plus optional JSON if mechanically produced. Stop with candidate counts by commercial-clean / NC educational / metadata-link-only / blocked / unmatched, or exact missing command/input/schema blocker. |
| Agent 3 / Spark-3 | `deuteronomy-linkage-dedupe-source-route-matrix` | Per-book linkage/dedupe/navigation/source-route matrix comparing dictionary/reader-hint candidates against route cards, workbench route lookup, token/provenance evidence, and the local Deuteronomy reader surface. | Package-definition/blocker task. Existing 169-row dedupe command is Orot-specific (`scripts/build_agent10_orot_169_route_card_matrix.mjs`) and must not be reused as Deuteronomy authority. No Deuteronomy-specific command/output schema/validator was supplied. | Expected Agent 3 artifact: `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md` plus optional JSON if mechanically produced. Stop with route/card linkage counts, duplicate keys, unmatched rows, exact blockers, and next Agent 2/Agent 6 need, or exact missing command/input/schema blocker. |
| Agent 4 / Spark-4 | `deuteronomy-package-validator-prereq` | Validator/prereq/runtime evidence for exact Deuteronomy candidate package inputs only. | Seedable exact baseline runtime command: `node scripts/audit_live_deuteronomy_runtime.mjs`. No repeated validator churn without changed candidate package. | Expected Agent 4/Spark-4 report: `reports/agent4-deuteronomy-baseline-runtime-prereq-evidence-2026-06-04.md` or Spark-4 equivalent compact report, or exact command/input blocker. |
| Agent 10 / Spark-10 | `deuteronomy-release-relevance-shadow` | Mechanical release-relevance shadow only after Agents 1-4 package outputs. | Hold until a release-relevant package return exists from Agent 1/2/3/4. | `no_new_release_relevant_output` or exact release-relevance matrix. |

## Stop Condition

Stop when Deuteronomy has an Orot-shaped non-public candidate package with counts by commercial-clean / NC educational / metadata-link-only / blocked, unmatched rows, validators, exact blockers, zero public/runtime/output/answer/accepted-text emissions, and Agent 6 boundary docket(s) queued where needed.

Current stop-state: Agents 1-3 are package-definition/blocker routes, not Spark-invention routes. Agent 4/Spark-4 has one command-backed baseline runtime route. Agent 10/Spark-10 waits for returned Deuteronomy packages.

## Agent 8 Callback

Decision: Staff Deuteronomy as the first per-book Orot-level pipeline replication target.

Routes:
- Route Agent 1 package-definition/blocker task for `deuteronomy-source-license-custody-map`; expected artifact `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md`.
- Route Agent 2 package-definition/blocker task for `deuteronomy-definition-reader-hint-candidates`; expected artifact `reports/agent2-deuteronomy-reader-hint-candidate-plan-2026-06-04.md`.
- Route Agent 3 package-definition/blocker task for `deuteronomy-linkage-dedupe-source-route-matrix`; expected artifact `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md`.
- Route Agent 4/Spark-4 to `deuteronomy-package-validator-prereq` with command `node scripts/audit_live_deuteronomy_runtime.mjs`; expected report `reports/agent4-deuteronomy-baseline-runtime-prereq-evidence-2026-06-04.md` or Spark-4 equivalent; stop after report or exact blocker.
- Preserve Agent 2’s active broad 500-row sample refresh separately; it is not Deuteronomy-specific.
- Keep Spark-10 as Agent 10 shadow and consume only release-relevant package returns after Agents 1-4 return.

Blockers:
- `deuteronomy-source-license-custody-map`: `missing_pipeline_blocker`
- `deuteronomy-definition-reader-hint-candidates`: `missing_pipeline_blocker`
- `deuteronomy-linkage-dedupe-source-route-matrix`: `missing_pipeline_blocker`

## Boundary

Staffing/proof only. No Orot-first fallback; Orot is prototype shape, not the current target. NC educational candidates are planning-lane rows only when explicitly flagged and kept out of commercial export. No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss, accepted text, public reader output, route-shard edit, or public/runtime mutation. Publication remains `blocked_no_render`.
