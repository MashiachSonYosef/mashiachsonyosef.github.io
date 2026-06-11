# Agent 5 Agent 8 Direct Worker Routing Amendment Field Completion

Generated: 2026-06-02T13:14:00Z

## Result

`exact_sop_amendment_field_completion_packet_ready`

Agent 5 reviewed `reports/agent7-sop-agent8-direct-worker-routing-amendment-request-2026-06-02.md` against Agent 6 docket `reports/agent6-agent8-direct-worker-routing-sop-boundary-verdict-2026-06-02.md`.

This packet supplies field-complete amendment text for Agent 6 review. It does not mutate SOP law, activate Agent 8 direct routing, route workers, or create acceptance.

## Gap Closed

Agent 6 requires every authorized Agent 8 direct worker prompt to include:

- target agent/thread
- objective
- owning lane
- why direct routing is allowed now
- active-worker interruption assessment
- allowed/forbidden scope
- cap
- evidence artifacts
- expected artifact
- stop condition
- delivery proof requirement
- Agent 6 queue condition if QA-relevant
- highest permissible claim
- what must not be accepted

The Agent 7 request already covers most of these, but the exact prompt shape should explicitly add:

- `why_direct_routing_is_allowed_now`
- `allowed_scope`
- `forbidden_scope`
- `maximum_scope_or_cap`
- `agent6_queue_condition_if_qa_relevant`

## Proposed Exact Amendment Completion

Add this section to the Agent 7 proposed amendment text before "Hard Stop Conditions":

```text
## Required Agent 8 Direct Worker Prompt Contract

Every Agent 8 direct worker prompt authorized by this amendment must be a complete `direct_bounded_worker_prompt_delivery` packet. The packet must include all fields below.

Required fields:

- `target_agent`: the receiving worker agent number/name.
- `target_thread_or_delivery_channel`: exact thread id, tool, or delivery channel.
- `objective`: one bounded objective for the worker.
- `owning_lane`: the worker lane or gate the work belongs to.
- `why_direct_routing_is_allowed_now`: the concrete authorization basis, such as idle/no-goal lane, stale lane, blocked lane with recovery path, explicit user instruction, Agent 7 priority instruction, Agent 6 directive, P0 safety/compliance exposure, or signed SOP condition.
- `active_worker_interruption_assessment`: either `not_active`, `non_interrupting_continuation`, or `interrupt_authorized`, with evidence and reason. Active workers must not be interrupted unless the prompt records explicit user, Agent 7, or Agent 6 authorization or a P0 escalation condition.
- `allowed_scope`: exact files, paths, surfaces, reports, commands, or evidence classes the worker may touch.
- `forbidden_scope`: exact files, paths, surfaces, reports, commands, or claims the worker must not touch or make.
- `maximum_scope_or_cap`: time cap, file cap, command cap, artifact cap, or other bounded limit.
- `evidence_artifacts`: paths or live evidence the worker must inspect or produce.
- `expected_output_artifact`: exact report/control artifact path or output shape expected.
- `stop_condition`: when the worker must stop and report.
- `delivery_proof_requirement`: target, timestamp or queue submission id, exact prompt text or artifact path, delivery channel/tool, boundary statement, and active-worker assessment.
- `agent6_queue_condition_if_qa_relevant`: if QA-relevant, source/provenance-relevant, public/runtime-relevant, product/data-relevant, Definition-authority-relevant, publication-relevant, or accepted-text-relevant, the output must be packeted for Agent 6 and cannot be accepted by the worker, Agent 8, Agent 5, Agent 7, or Agent 12.
- `highest_permissible_claim`: the strongest claim the worker or Agent 8 may make from the prompt.
- `what_must_not_be_accepted`: explicit non-acceptance list, including QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, and accepted translation text unless a dated Agent 6 docket says otherwise.

Missing any required field blocks direct delivery. A prepared prompt without delivery proof is not a seeded goal. Agent 8 direct prompt delivery and worker output are not acceptance.
```

## Agent 5 Control-Hygiene Clause

Add this sentence to the Agent 5 role section:

```text
Agent 5 ingests Agent 8 delivery proof or exact blockers for control-state hygiene only when needed; Agent 5 is not Agent 8's general worker, default relay path, or routine prompt writer after direct routing is authorized.
```

## Agent 12 Advisory Clause

Add this sentence to the Agent 12 section:

```text
Agent 12 advisory labels are not execution control. `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, and `ESCALATE` may inform Agent 8 or Agent 7, but do not by themselves route workers, block execution, close blockers, narrow Agent 6 evidence scope, mutate queues, mutate SOP law, or create acceptance.
```

## Queue Handling

Use this packet as supplemental exact-text evidence for `agent6-sop-agent8-direct-worker-routing-amendment`.

Requested Agent 6 verdict remains exact text only:

- pass
- warn-accept with exact wording changes
- block with exact blocker

## Boundary

SOP amendment drafting support only. No worker routing, SOP law mutation, QA acceptance, publication readiness, source/provenance acceptance, public/runtime acceptance, route publication support, Definition authority, usage-as-definition authority, product/data acceptance, translation output, or accepted translation text.

Publication remains `blocked_no_render`.
