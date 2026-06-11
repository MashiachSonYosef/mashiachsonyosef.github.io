# Spark-4 standing run (cycle)
- objective: Spark-4 exact non-mutating queued execution only
- mode_requested: OROT_FINISH_FIRST
- item_checked: spark4-broad-validator-runtime-prereq-mechanics
- item_status: active_validator_lane_warning_packet_returned_reseed_after_current
- next_matching_queue_item: no_queued_item
- exact_blocker: none
- readiness: wake condition remains until a new exact Spark-4 queue item appears in data/control/spark_standing_queue.json with explicit pipeline_commands and exact input/output schema
