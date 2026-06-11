timestamp: 2026-06-04T07:33:47-04:00
report: reports/spark-orot-exact-validator-health-2026-06-04-agent10-consumption.md

validator_inputs:
- data/control/spark_standing_queue.json
- data/build/orot/reader-hint-placeholder-candidates.json

package_metrics:
- row_count: 127
- occurrence_sum: 4389

validators:
- command: node scripts/validate_agent10_orot_non_public_reader_hint_placeholder_package.mjs
  name: node_6100
  exit_code: 0
  status: PASS
  stdout: non-public reader-hint placeholder package validation passed for data/build/orot/reader-hint-placeholder-candidates.json.
- command: node scripts/validate_agent10_orot_reader_hint_candidate_patch_agent6_docket.mjs reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json
  name: node_328f
  exit_code: 0
  status: PASS
  stdout: Agent 10 Orot reader-hint candidate patch Agent 6 docket validation passed for reports/agent10-agent6-ready-orot-reader-hint-candidate-patch-docket-2026-06-04.json.
- command: node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html
  name: node_d849
  exit_code: 0
  status: PASS
  stdout: Route HUD page validation passed for 3 page(s).
