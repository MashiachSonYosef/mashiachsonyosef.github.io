# Spark-4 standing run

- mode: BROAD_CORPUS_EXPANSION
- item_checked: spark4-broad-validator-runtime-prereq-mechanics
- status: active_validator_lane_warning_packet_returned_reseed_after_current
- exact_next_matching_item: no_queued_item
- exact_blocker: none
- readiness: wait for a new exact Spark-4 queue item with explicit pipeline_commands and input/output schema in data/control/spark_standing_queue.json

## queue commands
- node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs
- node scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json
- node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html
- node scripts/validate_agent4_live_browser_runtime_evidence.mjs
- node scripts/audit_live_public_old_hud_guard.mjs
