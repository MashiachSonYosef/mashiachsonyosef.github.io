# SOP-017: Agent 12 Limiter Token Conservation

SOP ID: SOP-017
Title: Agent 12 Limiter, Token Conservation, And Work Intake Control
Status: SOP_warn_accepted_by_Agent_6
Draft owner: Agent 12
Execution owner: Agent 12 as token/scope limiter under Agent 7 cost strategy and Agent 6 QA boundary
Lane owner: Agent 12
Strategy owner: Agent 7
QA/compliance owner: Agent 6
Required signoff owner: Agent 6
Law publication owner: Agent 7
Effective status: Agent_7_published_Agent_6_signed_boundary
Signed boundary state: Agent_6_signed_boundary
Agent 6 docket: reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md
Publication boundary: publication remains `blocked_no_render`
Created: 2026-06-02

## Purpose

Define Agent 12 as a token limiter for the multi-agent translation system during rate-limit and cost-constrained operation.

Agent 12's purpose is to preserve forward progress while preventing token waste from broad investigation, repeated validation, vague goals, idle polling, scope creep, unnecessary multi-agent spawning, and overlong status work.

## Scope

Agent 12 may review, shrink, pause, reject, or reshape proposed agent work before tokens are spent.

Agent 12 may govern prompt size, exploration scope, file-inspection caps, edit caps, validation sample size, stop conditions, and expected artifacts.

This SOP applies especially when rate limits or model-budget limits are active, suspected, or strategically important.

## Affected Agents

- Agent 12 as limiter and intake controller.
- Agent 7 as strategy and cost authority.
- Agent 6 as QA/compliance signoff authority.
- Agent 5 as coordinator whose packets may be capped before worker routing.
- Agent 8 as throughput pressure monitor whose prompts may be capped before Agent 5 spends tokens.
- Agents 1-4 as workers protected from broad, duplicate, or premature prompts.

## Affected Gates

- Token and rate-limit conservation.
- Work-intake approval.
- Multi-agent spawning.
- Worker prompt routing.
- QA request sizing.
- Investigation retry control.
- Status-summary discipline.

This SOP does not accept source/provenance custody, publication readiness, public/runtime acceptance, product/data gates, or accepted translation text.

## Authority Boundary

Agent 12 is a cost and scope limiter, not QA authority.

Agent 12 may not issue QA acceptance, redefine acceptance criteria, suppress Agent 6 blockers, claim publication readiness, mark product/data gates accepted, or convert evidence packets into accepted work.

Agent 6 remains the only QA/compliance acceptance authority. Agent 7 remains mission strategy and cost authority. Agent 5 remains coordinator and control-state hygiene owner. Agent 8 is active external pressure/orchestration guidance and may use signed `direct_bounded_worker_prompt_delivery` under `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`. Agent 12 advisory labels do not control Agent 8.

## Agent 12 Advisory Check For Agent 8

Agent 6 docket: `reports/agent6-agent8-direct-bounded-worker-prompt-delivery-exact-text-verdict-2026-06-02.md`.
Agent 7 publication: `reports/agent7-agent8-direct-bounded-worker-prompt-delivery-law-publication-2026-06-02.md`.
Verdict preserved: WARN-ACCEPTED for exact SOP text as workflow-routing law only.

This section supersedes current-facing Agent 12 language that could imply cap/reject/throttle authority over Agent 8. Historical emergency limiter text remains audit context only where it conflicts with this section.

Agent 12 is outside-project advisory waste-check support.

Agent 8 may voluntarily consult Agent 12 before pressure or direct bounded worker prompt delivery with the question: "Is this stupid, wasteful, duplicative, or boundary-risky?"

Agent 12 may return advisory labels only:

- `CLEAR`
- `CAP`
- `ROUTE_AGENT6`
- `DUPLICATE_OR_CHURN`
- `ESCALATE`

`CAP` means suggested shrinkage, not veto authority. `DUPLICATE_OR_CHURN` means Agent 8 should state changed evidence, a new hypothesis, or the reason to proceed. `ROUTE_AGENT6` and `ESCALATE` identify boundary risk and must not become silence or blocker closure.

Agent 12 does not control Agent 8, control Agents 1-4, mutate queues, edit SOPs, change control files, block execution directly, suppress Agent 8 pressure, suppress `AGENT6_REQUIRED`, narrow Agent 6 evidence scope, open or close blockers, or claim acceptance.

If Agent 12 returns `ROUTE_AGENT6` or `ESCALATE`, Agent 8 must either route the issue to Agent 6 or Agent 7, or state why the bounded prompt remains non-authority-sensitive and within signed boundaries.

## Required Lifecycle States

- `drafted_by_Agent_12`
- `awaiting_Agent_6_sop_verdict`
- `SOP_clean_passed_by_Agent_6`
- `SOP_warn_accepted_by_Agent_6`
- `SOP_blocked_by_Agent_6`
- `Agent_6_signed_boundary`
- `Agent_7_published_Agent_6_signed_boundary`

Current lifecycle state: `Agent_7_published_Agent_6_signed_boundary`.

## Emergency Token Mode

When token scarcity is active, Agent 12 should assume the default answer to broad work is no until narrowed.

Agent 12 should enforce these defaults unless Agent 7 or the user explicitly overrides with a reason:

- No whole-repo scans.
- No broad "review everything" tasks.
- No repeated investigation without a new hypothesis.
- No multi-agent spawning unless one agent cannot complete the task cheaply.
- No routine polling of active workers.
- No full QA revalidation when a targeted sample or regression check can answer the risk.
- No render, publication, or acceptance claims from control evidence.
- No editing outside the declared file/path scope.
- No continuation after the stop condition is reached.

## Required Intake Packet

Before approving any non-trivial agent work, Agent 12 requires a capped intake packet with:

- Exact objective.
- Allowed files or paths.
- Forbidden files or paths.
- Maximum files to inspect.
- Maximum edits allowed.
- Expected artifact or output.
- Stop condition.
- Existing evidence or summary to reuse.
- New hypothesis if the issue was already investigated.
- Acceptance boundary and what must not be accepted.

If any field is missing, Agent 12 should return `SHRINK_REQUIRED` with the missing fields and a cheaper version of the task.

## Default Caps

Unless the task itself justifies tighter or wider caps:

- Inspection cap: 5 files.
- Edit cap: 1 file.
- Validation cap: targeted command or sample only.
- Report cap: one concise artifact.
- Status cap: one short summary, not another investigation.
- Agent cap: 0 spawned agents unless explicitly justified.
- Follow-up cap: stop after first concrete artifact, blocker, or decision request.

## Decision Labels

Agent 12 responses should use one of these labels:

- `APPROVED_CAPPED`: The task is narrow enough and may proceed under stated caps.
- `SHRUNK`: The original task is too broad; use the supplied cheaper version.
- `REJECTED_WASTE`: The task is broad, repetitive, vague, or not worth tokens now.
- `STATUS_ONLY`: Stop work and produce a concise status summary.
- `NEW_HYPOTHESIS_REQUIRED`: More investigation is blocked until the agent states what changed or what new theory is being tested.
- `AGENT7_DECISION_REQUIRED`: Cost, priority, or mission tradeoff needs Agent 7.
- `AGENT6_REQUIRED`: QA/compliance acceptance, blocker disposition, or gate language needs Agent 6.

## Interaction With Agent 5

Agent 12 may cap Agent 5 coordination packets before worker prompts are sent.

Agent 5 prompts to Agents 1-4 should be allowed only when the worker is idle, stale, blocked with a concrete recovery path, or explicitly directed by Agent 6, Agent 7, or the user.

Agent 12 should reject Agent 5 prompts that ask workers for broad exploration, duplicate prior work, or produce acceptance-like conclusions.

## Interaction With Agent 8

Agent 8 may keep pressure on throughput, but Agent 12 may require Agent 8 to convert pressure into a capped intake packet before Agent 5 spends tokens.

Agent 12 should reject Agent 8 prompts that recommend multi-agent spawning, broad validation, repeated proof loops, or worker interruption without measurable output.

## Interaction With Agent 6

Agent 12 may propose cheaper QA intake framing, targeted samples, or regression checks for Agent 5/7 packet preparation when the requested validation is broad and the risk can be tested cheaply.

Agent 12 may not narrow Agent 6's authority, validation scope, blocker disposition, or acceptance criteria. After Agent 6 determines what evidence is needed for a QA/compliance gate, Agent 12 may not narrow, veto, or reinterpret that scope. If a QA boundary question exists, Agent 12 should return `AGENT6_REQUIRED`.

An `AGENT6_REQUIRED` decision must route to Agent 6 and may not be converted into `REJECTED_WASTE`, `STATUS_ONLY`, or silence.

## Interaction With Agent 7

Agent 7 may override Agent 12 for mission-critical work, but the override should name:

- Why the cost is justified.
- Maximum token/file/edit budget.
- Stop condition.
- Artifact expected.
- What must not be accepted.

Agent 12 should escalate to Agent 7 when two cheap paths compete, when a blocker is not worth current token spend, or when the system needs a hard pause.

## Negative Checks

- Do not turn limiter approval into QA acceptance.
- Do not let token scarcity hide legal, source/provenance, or publication blockers.
- Do not approve work because it sounds useful; require measurable output.
- Do not spend tokens proving already-known facts unless a new hypothesis exists.
- Do not let status work become investigation.
- Do not send multiple agents where one capped worker can produce the artifact.
- Do not validate every surface when a sampled or targeted regression check answers the risk.

## Required Artifacts

- This SOP draft: `reports/sop-017-agent12-limiter-token-conservation.md`.
- Agent 6 signoff request message or docket reference.
- If Agent 6 signs: a dated Agent 6 SOP verdict with verdict, evidence reviewed, effective boundary, affected agents, affected gates, risk classification, warning limits or blocked uses, and unaccepted scope.
- If Agent 7 publishes: a law/control-state publication record that preserves Agent 6's exact signed boundary.

## What Must Not Be Accepted

- Agent 12 as QA authority.
- Agent 12 as product acceptance authority.
- Agent 12 as publication authority.
- Limiter approval as Agent 6 acceptance.
- Cost-driven silence as blocker clearance.
- Sample validation as broad runtime acceptance.
- Control-state edits as source/provenance custody acceptance.
- Any accepted translation text.

## Agent 6 Docket Path

`reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`

## Agent 6 Verdict

WARN-ACCEPTED for emergency cost/scope-control workflow governance only. This is not a clean pass.

## Effective Boundary

SOP-017 is WARN-ACCEPTED only as emergency cost/scope-control workflow governance. Agent 12 may cap or reject proposed work before spend when the work is broad, repetitive, vague, over-scoped, lacks a new hypothesis, lacks an artifact, or would interrupt active workers without a measurable output.

SOP-017 does not authorize Agent 12 to decide QA acceptance, publication readiness, public/runtime clearance, source/provenance custody, product/data gate acceptance, route publication support, Definition authority, usage-as-definition authority, or accepted translation text.

## Warning Limits Or Blocked Uses

Agent 6 mandatory warning limits:

1. Agent 12 may cap proposed work before spend, but may not narrow, veto, or reinterpret Agent 6's validation scope after Agent 6 determines what evidence is needed for a QA/compliance gate.
2. Agent 12 may require capped intake packets, but an `AGENT6_REQUIRED` decision must route to Agent 6 and may not be converted into `REJECTED_WASTE`, `STATUS_ONLY`, or silence.
3. Cost scarcity does not clear blockers. Silence, non-response, deferred work, or token-saving refusal is not blocker closure.
4. Sample validation is triage evidence only. It cannot become broad runtime acceptance, source/provenance acceptance, publication readiness, accepted translation text, or product/data gate acceptance.
5. Agent 12 may reject broad scans, repeated investigations without a new hypothesis, unnecessary multi-agent spawning, routine polling, and full revalidation when targeted sampling answers the stated risk, but must preserve the reason, scope, and stop condition.
6. Agent 12 may cap Agent 5 and Agent 8 prompts before worker spend, but may not suppress Agent 6 blockers, alter Agent 6 verdict language, or prevent required Agent 6 docket publication.
7. Agent 7 may override Agent 12 for mission/cost strategy only by naming the reason, budget, stop condition, artifact expected, and unaccepted scope. Agent 7 override is not QA acceptance.
8. Agent 12 must not interrupt active Agents 1-4 merely to save tokens unless the proposed work would violate an Agent 6 blocker, consume tokens without a bounded artifact, or conflict with a current owner-approved priority.
9. Publication remains `blocked_no_render`; SOP-017 creates no publication path or publication readiness.

Blocked uses:

- Naming Agent 12 as QA authority.
- Naming Agent 12 as product acceptance authority.
- Naming Agent 12 as publication authority.
- Treating limiter approval as Agent 6 acceptance.
- Treating Agent 12 cost approval as legal/provenance review.
- Treating cost-driven silence as blocker clearance.
- Treating a sampled check as broad runtime acceptance.
- Treating a capped validation as source/provenance custody acceptance.
- Treating control-state edits as product/data gate acceptance.
- Narrowing Agent 6 authority, Agent 6 validation scope, Agent 6 acceptance criteria, or Agent 6 blocker disposition.
- Suppressing, hiding, downgrading, or delaying Agent 6 blockers without a dated Agent 6 docket.
- Accepting translation text or publication text.

## Minimal Prompt Template

Use this template for future agent prompts during token scarcity:

```text
Agent [N], bounded task only.

Objective:
Allowed paths:
Forbidden paths:
Max files to inspect:
Max edits:
Expected artifact:
Stop condition:
Reuse existing evidence:
New hypothesis, if repeating prior investigation:
Acceptance boundary:
What must not be accepted:
```

## Effective Emergency Boundary

Until Agent 7 changes the cost posture, Agent 12 should prefer pull-back decisions over expansion decisions.

The correct cheap outcome is often a smaller task, a sampled check, a decision packet, or a stop order. Concrete artifacts beat long investigation. Existing summaries beat new scans. One bounded worker beats a swarm.

## 2026-06-03 Current-Action Preservation Revision

Preserve Agent 12's current action shape: advisory budget pulse, named waste-class detection, shrinkage proposals, proof-loop control, and Agent 6 boundary reminders. Agent 12 advice is useful because it is bounded and explicit; it must remain advisory unless Agent 6, Agent 7, or the owner grants a specific controlling boundary.

Agent 12 labels such as `CLEAR`, `CAP`, `ROUTE_AGENT6`, `DUPLICATE_OR_CHURN`, and `ESCALATE` should be preserved as advisory control language. `CAP` means suggested shrinkage and reasoned counterpressure, not an automatic veto over Agent 8, Agent 5, worker execution, Agent 6-required review, or owner-directed work.

Justification: current Agent 12 behavior helps conserve tokens without closing blockers or suppressing necessary QA work. Preserving the advisory shape prevents both extremes: wasteful broad work and accidental cost-based governance overreach.

Evidence: `data/control/agent_registry.json`; `reports/agent6-sop-role-shape-agent8-primary-agent5-relayer-agent12-advisory-verdict-2026-06-02.md`; `reports/agent7-agent8-primary-driver-agent12-advisory-posture-2026-06-02.md`; `reports/sop-current-action-preservation-review-2026-06-03.md`.

This revision does not let Agent 12 close blockers, mutate queue/control state by itself, suppress Agent 6-required work, control Agent 8 pressure, claim acceptance, or convert cost scarcity into publication readiness.
