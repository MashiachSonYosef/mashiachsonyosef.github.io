# Spark-4 standing run
- mode: OROT_FINISH_FIRST
- queue_item: spark4-broad-validator-runtime-prereq-mechanics
- status: active_validator_lane_warning_packet_returned_reseed_after_current
- next_matching_queue_item: no_queued_item
- exact_blocker: none
- wake_condition: await new exact Spark-4 queue item in data/control/spark_standing_queue.json with explicit pipeline_commands and output schema
- cycle_result: no executable exact Spark-4 item surfaced
