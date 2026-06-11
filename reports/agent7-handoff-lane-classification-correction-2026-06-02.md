# Agent 7 Handoff Lane Classification Correction

Generated: 2026-06-02T11:52:00Z

## Finding

The generated Agent 5 / Agent 6 handoff index could classify Agent 12-related request IDs as Agent 1 work because the lane classifier used substring checks such as `agent1`.

Example risk:

- `agent6-agent8-agent12-reconciliation-guardrail`
- `agent6-sop-role-shape-agent8-primary-agent5-relayer-agent12-advisory`

Those are not Agent 1 source/provenance lanes. Misclassification can confuse Agent 5 routing and make Agent 8/12 governance look like Agent 1 source work.

## Correction

Updated:

- `scripts/build_agent5_agent6_handoff_index.mjs`
- `scripts/build_qa_docket_index.mjs`

The builders now use exact agent-token matching for Agent 1/2/3/5 references, so `agent12` no longer matches `agent1`.

The QA docket index also keeps public-runtime/deployment blockers owned by Agent 5 / Agent 7 coordination rather than treating them as Agent 4 work merely because the gate contains `runtime`.

## Boundary

Control-index hygiene only. This does not change Agent 6 verdicts, does not route Agents 1-4, does not create QA acceptance, source/provenance acceptance, public/runtime acceptance, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

Publication remains `blocked_no_render`.
