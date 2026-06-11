# Agent 12 Limiter Balanced Throughput Reconciliation

Timestamp: 2026-06-02T05:45:00-04:00

User correction: maximum useful work should run while staying under the limit; zero work is not sufficient limiter behavior.

Current controlling posture: SCARCITY_ACTIVE_BALANCED_THROUGHPUT.

Agent 7 controlling artifact: reports/agent7-agent8-agent12-balanced-work-posture-2026-06-02.md

Relationship to prior Agent 12 artifact:
- reports/agent12-limiter-max-safe-throughput-2026-06-02-0542.md captured the initial Agent 12 correction from idle silence to capped saturation.
- Agent 7 then published the controlling balanced posture above, which supersedes EMERGENCY_HARD_CAP for future work while preserving SOP-017 and Agent 6 boundaries.

Active limiter rule:
- Cap broad scans, proof loops, vague status work, unnecessary agent spawning, and repeated no-drift proof.
- Do not freeze bounded productive movement.
- Agent 8 may send capped pressure for material delta, new blocker, or concrete productive next step, max one Agent 5 pressure packet per two hours unless escalated.
- Agent 5 may do up to one control/queue/SOP action and one productive lane-routing decision per 30-minute coordinator session.
- Agent 5 may activate at most one idle/stale/blocked/delivery-blocked worker lane with an 8-hour prompt and delivery proof.
- Agent 5 must not prompt active workers or do broad fanout.
- AGENT6_REQUIRED items still route through queues.

Current lane state from control board:
- Agent 2 active.
- Agent 4 active.
- Agent 1 awaiting Agent 6 source-custody closure decision.
- Agent 3 evidence-ready; do not prompt unless a natural checkpoint, capacity opening, or Agent 6 request creates a bounded need.

Boundary:
Cost/scope and throughput balancing only. No QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text. Publication remains blocked_no_render.
