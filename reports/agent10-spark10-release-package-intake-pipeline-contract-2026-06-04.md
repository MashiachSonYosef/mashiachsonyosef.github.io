# Agent 10 Direct Release Package Intake Pipeline Contract

Date: 2026-06-04

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE / direct Agent run mode`.

Spark/assistant capacity status: `unavailable_glitched_historical_support_only_unless_owner_reenables`.

Historical Spark-10 thread reference: `019e92c2-00a7-78f3-b9ab-6f3c11305a0a`.

## Objective

Provide Agent 10 with a local release/package changed-artifact intake pipeline.

Spark-10-named artifacts are historical/mechanical evidence only. Do not route, queue, wait on, or treat Spark-10 as active capacity unless owner explicitly re-enables a repaired lane. Agent 10 runs and validates this pipeline directly.

## Commands

Build:

```powershell
node scripts/build_spark10_release_package_intake.mjs --contract=reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json
```

Validate:

```powershell
node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json
```

Contract validation:

```powershell
node scripts/validate_spark10_release_package_intake.mjs reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json
```

## Exact Inputs

See `reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json`.

Required inputs:

- `data/control/spark_standing_queue.json`
- `data/control/agent_goal_board.json`
- `reports/spark10-standing-goal-mode-status-2026-06-04.md`
- `reports/agent10-orot-current-goal-audit-2026-06-04.md`
- `data/build/orot/reader-hint-placeholder-candidates.json`

Optional status/evidence inputs are listed in the JSON contract and must be reported as absent if missing.

Current low-mode and changed-artifact inputs now included:

- `reports/agent1-lowmode-source-license-custody-contract-status-2026-06-04.md/json`
- `reports/agent2-lowmode-definition-workbench-500-package-and-next-target-2026-06-04.md/json`
- `reports/agent3-spark1-pipeline-contract-deuteronomy-phase2-linkage-dedupe-source-route-2026-06-04.md/json`
- `reports/spark1-deuteronomy-phase2-linkage-dedupe-source-route-run-2026-06-04.md`
- `reports/agent3-deuteronomy-linkage-dedupe-source-route-matrix-2026-06-04.md/json`
- `reports/agent3-deuteronomy-phase2-spark1-return-consumption-package-2026-06-04.json`
- `reports/agent10-weekly-lexicon-release-next-boundary-or-blocker-2026-06-04.md`
- `reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04-current.md/json`
- `reports/agent6-orot-reader-hint-candidate-patch-current-verdict-2026-06-04.md`
- `reports/agent10-agent6-orot-reader-hint-candidate-patch-current-verdict-consumption-2026-06-04.md/json`
- `reports/agent1-orot-missing-lexicon-linkage-candidates-2026-06-04.md/json`
- `reports/agent10-agent1-ready-orot-dry-run-source-license-display-review-request-2026-06-03.md/json`
- `reports/agent1-orot-dry-run-source-license-display-review-2026-06-03.json`
- `reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.json`
- `reports/agent2-spark1-runnable-command-manifest-2026-06-04.md/json`
- `reports/agent2-spark1-command-manifest-validation-receipt-2026-06-04.md/json`
- `reports/agent10-agent2-ready-deuteronomy-phase2-downstream-transform-workset-2026-06-04.md/json`
- `reports/agent2-deuteronomy-phase2-transform-readiness-matrix-2026-06-04.md/json`
- `reports/agent10-agent6-ready-deuteronomy-phase2-transform-readiness-boundary-packet-2026-06-04.json`
- `reports/agent10-agent6-deuteronomy-phase2-transform-readiness-verdict-consumption-2026-06-04.json`
- `reports/agent6-deuteronomy-phase2-agent3-supplemental-receipt-2026-06-04.md`
- `reports/agent10-agent6-deuteronomy-phase2-agent3-supplemental-receipt-consumption-2026-06-04.json`
- `reports/agent4-changed-input-only-wake-condition-2026-06-04.md`
- `reports/oracle9-nc-educational-lane-owner-policy-2026-06-04.md`
- `reports/oracle9-new-dictionary-source-lane-policy-2026-06-04.md`
- `reports/oracle9-dictionary-lane-classification-correction-2026-06-04.md`
- `reports/agent12-agent8-nc-csv-separation-cap-rule-2026-06-04.md`
- `reports/agent12-agent8-nc-educational-lane-cap-delta-2026-06-04.md`
- `reports/agent10-agent6-ready-deuteronomy-source-license-custody-boundary-packet-2026-06-04.md/json`
- `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md/json`
- `reports/agent3-linkage-navigation-frontier-checkpoint-2026-06-04.md/json`
- `reports/oracle9-owner-forced-current-action-corrections-callback-2026-06-04.md`
- `reports/spark10-primary-agent8-13-status-2026-06-04.md`
- `reports/agent6-deuteronomy-source-license-custody-planning-verdict-2026-06-04.md`
- `reports/agent10-agent6-deuteronomy-source-license-custody-verdict-consumption-2026-06-04.md/json`
- `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.md/json`
- `reports/agent10-agent6-ready-old-dictionary-excluded-row-license-lane-reaudit-boundary-packet-2026-06-04.md/json`
- `reports/agent2-weekly-lexicon-current-handoff-bundle-2026-06-04.md/json`
- `reports/agent2-next-workset-needed-after-deuteronomy-return-2026-06-04.md/json`
- `reports/agent10-agent2-refreshed-weekly-pipeline-and-next-workset-blocker-consumption-2026-06-04.md/json`
- `reports/agent11-weekly-lexicon-reception-corrections-2026-06-04.md`
- `reports/agent10-agent11-reception-corrections-consumption-2026-06-04.md/json`
- `reports/agent10-current-lane-returns-consumption-2026-06-04.md/json`
- `reports/agent1-current-source-license-custody-lane-return-2026-06-04.md/json`
- `reports/agent3-deuteronomy-source-license-custody-verdict-continuity-package-2026-06-04.md/json`
- `reports/agent2-orot-missed-dictionary-reader-hint-candidates-2026-06-04.md/json`
- `reports/agent2-current-handoff-aggregate-validation-receipt-2026-06-04.md/json`
- `reports/agent10-current-lane-returns-refresh-consumption-2026-06-04.md/json`
- `reports/agent1-old-dictionary-license-lane-export-partitions-2026-06-04.md/json`
- `reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.md/json`
- `reports/agent1-workbench-full-source-name-custody-partitions-2026-06-04.md/json`
- `reports/agent1-spark1-pipeline-contract-workbench-full-source-name-custody-partitions-2026-06-04.md/json`
- `reports/agent10-agent6-ready-workbench-full-source-name-custody-partitions-boundary-packet-2026-06-04.md/json`
- `reports/agent2-old-dictionary-lane-partition-transform-planning-matrix-2026-06-04.md/json`
- `reports/agent10-agent6-ready-old-dictionary-lane-partition-transform-planning-boundary-packet-2026-06-04.md/json`
- `reports/agent4-deuteronomy-source-license-custody-changed-input-2026-06-04.json`
- `reports/agent4-deuteronomy-source-license-custody-runnable-contract-2026-06-04.md/json`
- `reports/agent4-deuteronomy-source-license-custody-gate-proof-2026-06-04.md/json`
- `reports/agent10-current-changed-lane-outputs-consumption-2026-06-04.md/json`
- `scripts/validate_agent10_workbench_cc_boundary_packets.mjs`
- `scripts/validate_agent10_old_dictionary_lane_partition_transform_boundary_packet.mjs`
- `reports/agent10-current-agent6-boundary-packet-delivery-blocker-2026-06-04.md/json` (superseded by successful delivery proof)
- `reports/agent10-agent6-current-boundary-packets-delivery-proof-2026-06-04.md/json`
- `reports/agent6-current-release-package-boundary-packets-verdict-2026-06-05.md`
- `reports/agent10-agent6-current-release-package-boundary-packets-verdict-consumption-2026-06-05.md/json`
- `reports/agent5-broad-floor-queue-proof-2026-06-04.md`
- `reports/agent6-validation-queue-health.md`
- `reports/agent1-current-source-license-custody-lane-return-validation-result-2026-06-04.json`
- `reports/agent1-source-license-custody-pipeline-set-validation-result-2026-06-04.json`
- `reports/agent1-source-license-custody-aggregate-handoff-validation-result-2026-06-04.json`
- `reports/agent1-source-license-custody-command-manifest-validation-result-2026-06-04.json`
- `reports/agent1-weekly-source-license-custody-pipeline-authoring-status-validation-result-2026-06-04.json`

These inputs are release-owner intake evidence only. The current Orot reader-hint candidate patch route has been superseded by `reports/agent6-orot-reader-hint-candidate-patch-current-verdict-2026-06-04.md` and the Agent 10 consumption artifact. The Deuteronomy phase-2 Agent 6 wait state has been superseded by the verdict-consumption artifact, and the Agent 3 supplemental receipt does not widen the prior Agent 6 boundary. Their presence does not create an Agent 6 route unless a generated matrix row identifies a new exact changed package or new exact Agent6-ready packet under the handoff condition below.

The Deuteronomy source/license/custody boundary packet has returned and is consumed as non-public planning evidence only. The current exact Agent6-ready handoff candidate is now the old-dictionary excluded-row license-lane re-audit packet: `500` audited rows / `8427` occurrences, with separated commercial-clean, NC educational, and blocked/review source-family lanes and all public/runtime/output/answer/definition/accepted-text counters at `0`.

Current Agent 2 package blocker state: refreshed Agent 2 handoff bundle, pipeline inventory, and aggregate receipt now validate with `22` validator-only checks and `21` validator-only states checked. This remains non-public planning evidence only and still names no new Agent 2 exact workset after Deuteronomy return.

Current Agent 11 correction state: the current `reports/agent11-weekly-lexicon-reception-corrections-2026-06-04.md` packet has `38` correction rows. Agent 10 consumption has been refreshed to that snapshot as wording/cap evidence only. Owner-facing summaries must keep 5000-token inventory as source-license inventory only, CC-BY-SA as share-alike boundary-review evidence only, CC-BY attribution as not currently export-authorized, Agent 3 post-custody rows as observed queue context only, and current Agent 10/Spark-10 ledgers as boundary/intake mechanics rather than release clearance.

Current changed-output state: Agent 10 delivered two Agent6-ready packets, one for `105747` Workbench source rows / `351` source-name custody partitions and one for `5` old-dictionary source-family transform-planning rows. Agent 6 returned `reports/agent6-current-release-package-boundary-packets-verdict-2026-06-05.md`, carrying both only as non-public planning evidence. Agent 4 also returned a Deuteronomy source/license custody gate proof; it is validator/prereq evidence only and opens no new Agent 6 route by itself.

Current delivery state: the prior delivery blocker is superseded. Agent 6 target `019e7f09-a04b-7f30-b36c-87aa8ecaae5d` resumed to `pending_init`, delivery succeeded with submission `019e953c-928c-7053-9d52-beab1343a644`, and the Agent 6 combined verdict returned. Stronger use still requires a later exact Agent 6 boundary packet.

Current support-control state: Agent 12 current cap marks assistant-1/Spark-1 as paused unless owner re-enables; filenames containing `spark1` in boundary packet inputs are historical contract artifacts only and do not route new Spark-1 work.

Current supplemental Agent 6 handoff: `reports/agent10-agent6-ready-old-dictionary-license-lane-export-partitions-supplement-2026-06-04.md/json`, supplemental to the already-routed old-dictionary license-lane re-audit boundary.

Source-lane gate:

- New/missed dictionary sources are not presumed NC.
- Old excluded dictionary rows are not presumed blocked.
- Agent 1 owns source-by-source and row-subset lane classification.
- Agent 2 outputs are not release/package usable unless they preserve `commercial_clean_candidate`, `noncommercial_educational_candidate`, `metadata_or_link_only`, or `blocked_or_needs_review` source lanes.

Post-matrix lane-output inputs now included:

- `reports/agent10-post-matrix-lane-output-consumption-2026-06-05.md/json`
- `reports/agent3-deuteronomy-phase2-transform-readiness-verdict-continuity-package-2026-06-05.md/json`
- `reports/agent3-post-continuity-release-intake-registration-audit-2026-06-05.md/json`
- `reports/agent4-broad-definition-workbench-5000-sample-gate-proof-2026-06-04.md/json`
- `reports/workbench-token-source-partition-edges-5000-chunk-003.md`
- `reports/workbench-token-source-partition-edges-5000-chunk-003-summary.json`
- `.local-cache/workbench-evidence/token-source-partition-edges-5000-chunk-003.jsonl`
- `reports/agent6-agent11-reception-work-checkin-2026-06-05.md`

Current release-intake delta inputs now included:

- `reports/agent1-workbench-source-family-license-lane-release-intake-packet-2026-06-04.md/json`
- `reports/agent1-workbench-source-family-license-lane-agent6-boundary-packet-2026-06-04.md/json`
- `reports/agent10-agent6-ready-workbench-source-family-license-lane-release-intake-boundary-packet-2026-06-05.md/json`
- `scripts/validate_agent10_workbench_source_family_license_lane_release_intake_boundary_packet.mjs`
- `reports/agent10-agent6-workbench-source-family-license-lane-release-intake-delivery-proof-2026-06-05.md/json`
- `reports/workbench-token-source-partition-edges-5000-chunk-008.md`
- `reports/workbench-token-source-partition-edges-5000-chunk-008-summary.json`
- `.local-cache/workbench-evidence/token-source-partition-edges-5000-chunk-008.jsonl`
- `reports/agent2-workbench-token-source-partition-edges-aggregate-readiness-2026-06-04.md/json`
- `reports/agent4-orot-205-row-commercial-clean-subset-changed-input-2026-06-04.json`
- `reports/agent4-orot-205-row-commercial-clean-subset-runnable-contract-2026-06-04.md/json`

Returned Spark-10 and Agent 3 support-status inputs now included:

- `reports/spark10-release-package-intake-current-refresh-after-source-family-release-intake-2026-06-05.md`
- `reports/agent3-agent10-post-matrix-registration-consumption-package-2026-06-05.md/json`
- `reports/agent3-spark10-matrix-delta-audit-2026-06-05.md/json`
- `reports/agent3-post-refresh-no-new-workset-audit-2026-06-05.md/json`
- `reports/agent10-direct-release-package-goal-state-2026-06-05.md/json`

## Expected Output

- `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.md`

## Agent 6 Handoff Condition

Agent 6 is only routed if the generated matrix identifies an exact changed package artifact or exact Agent6-ready packet with path, row/occurrence boundary, source/license lane, zero-emission counters, and review question.

Otherwise Agent 6 remains held.

## Stop Condition

Agent 10 stops after producing the local release/package intake matrix plus validator pass, or exact `missing_input_blocker` / `missing_pipeline_blocker` naming the missing input, command, output, schema, or validator.

## Agent 8 Callback

Status: Agent 10 authored the missing Spark-10 release/package intake pipeline contract.

Artifacts:

- `scripts/build_spark10_release_package_intake.mjs`
- `scripts/validate_spark10_release_package_intake.mjs`
- `reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.md`
- `reports/agent10-spark10-release-package-intake-pipeline-contract-2026-06-04.json`

Requested route: none. Agent 10 runs this intake locally; Spark-10 thread IDs and Spark-named artifacts are historical/mechanical evidence only unless owner explicitly re-enables a repaired lane.

Stop condition: Agent 10 produces `reports/spark10-release-package-intake-matrix-current-2026-06-04.md/json` plus validator result, or exact missing input/pipeline blocker.

Highest permissible claim: Agent 10 authored a local release/package intake contract over Spark-10-named historical/mechanical evidence only.

What must not be accepted: no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, answer eligibility, or definition-content storage.

## Not Accepted

No QA acceptance, source/provenance acceptance, license acceptance, Definition authority, usage-as-definition authority, answer acceptance, public/runtime acceptance, publication readiness, route publication support, product/data acceptance, translation output, accepted gloss/text, public reader output, route-shard edit, public/runtime mutation, answer eligibility, or definition-content storage.
