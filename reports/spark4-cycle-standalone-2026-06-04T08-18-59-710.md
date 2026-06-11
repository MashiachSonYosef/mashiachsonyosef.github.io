
# Spark-4 standing run

- lane: spark-4
- mode: OROT_FINISH_FIRST
- item_checked: spark4-broad-validator-runtime-prereq-mechanics
- item_status: active_validator_lane_warning_packet_returned_reseed_after_current
- next_matching_queue_item: no_queued_item
- exact_blocker: none
- wake_condition: new exact Spark-4 queue item in data/control/spark_standing_queue.json with explicit pipeline_commands and input/output schema is required for next command cycle
- command_status: no_new_item_runnable
