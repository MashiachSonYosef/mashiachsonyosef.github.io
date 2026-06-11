# Spark-4 standing run (single-cycle)

- mode: BROAD_CORPUS_EXPANSION
- lane: spark-4
- item_checked: spark4-broad-validator-runtime-prereq-mechanics
- item_status: active_validator_lane_warning_packet_returned_reseed_after_current
- next_matching_queue_item: no_queued_item
- exact_blocker: none
- report_mode_requested: OROT_FINISH_FIRST

## readiness
- No new exact Spark-4 queue item is surfaced now.
- Wake condition: new Spark-4 queue item in data/control/spark_standing_queue.json with explicit spark_affinity containing spark-4 and explicit pipeline_commands/input/output schema.
