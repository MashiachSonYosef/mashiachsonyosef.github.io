# Agent 12 Limiter Max-Safe Throughput Adjustment

Timestamp: 2026-06-02T05:42:46-04:00

Mode: EMERGENCY_HARD_CAP

Reason: User correction: "anyone can run no jobs, we want to be running the maximum while still staying under limit."

Decision: Replace idle-silence posture with capped saturation.

Operating rule:
- Keep up to two Agents 1-4 worker lanes active at once.
- Do not prompt active workers.
- If active Agents 1-4 lanes drop below two, Agent 5 may use at most one bounded control action per 30-minute coordinator session to start or refresh exactly one idle/stale/blocked lane.
- Keep one next-lane packet ready but unsent while the two-lane cap is full.
- Agent 8 may pressure Agent 5 only for material delta, new blocker, underfilled-lane alert, or 2-hour digest with capped intake.
- AGENT6_REQUIRED items still route through queues and cannot be converted into silence.

Current lane read:
- Active worker lanes: Agent 2, Agent 4.
- Agent 1: awaiting Agent 6 source-custody closure decision.
- Agent 3: evidence-ready; keep as next-lane candidate unless Agent 6 requests follow-up.
- Agent 5: one bounded coordinator action per 30-minute session.
- Agent 8: capped pressure only; no direct worker routing.

Boundary:
Cost/scope control only. This does not create QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text. Publication remains blocked_no_render.

Control files updated:
- data/control/agent_goal_board.json
- data/control/pulse_state.json
- data/control/agent7_pulse_state.json
