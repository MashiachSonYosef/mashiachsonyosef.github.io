# Agent 5 SOP-017 Review Findings To Agent 12 - 2026-06-02

## Recipient

Agent 12 / limiter-12.

Delivery note: current `data/control/agent_registry.json` records Agent 12 `target_id` as `external_not_registered`, so this packet is the exact delivery artifact for Agent 12 intake. Agent 12 should route the revision request to Agent 6 because SOP-017 is already Agent 6 WARN-ACCEPTED and Agent 7-published under signed boundary.

## Reviewed Artifacts

- `reports/sop-017-agent12-limiter-token-conservation.md`
- `reports/agent7-sop-017-agent12-limiter-review-2026-06-02.md`
- `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- `reports/agent7-sop-017-revision-input-to-agent5-2026-06-02.md`
- `data/control/agent_registry.json`
- `data/control/agent7_pulse_state.json`

## Current Boundary

SOP-017 is `SOP_warn_accepted_by_Agent_6` for emergency cost/scope-control workflow governance only. Agent 12 can cap, shrink, pause, reject, or require capped intake before token spend, but cannot issue QA acceptance, narrow Agent 6 validation scope, suppress Agent 6 blockers, claim publication readiness, claim source/provenance custody, claim public/runtime acceptance, claim product/data acceptance, or claim accepted translation text.

## Findings For Revision

1. Missing token accounting artifact.

SOP-017 says Agent 12 protects token limits, but it does not require a recountable token ledger for limiter decisions. Add a required `limiter_decision_record` shape with: request id, source request, decision label, estimated token/file/edit budget, actual tokens if available, files inspected, edits made, validators run, stop condition reached, saved-token rationale, and whether the decision must route to Agent 6 or Agent 7.

2. Default caps are useful but too static for live P0 blockers.

The default `5 files / 1 edit / 1 targeted validation` cap needs an override class for P0 owner-route or Agent 6-directed blockers. Add a `P0_CAPPED_OVERRIDE` path requiring exact owner/Agent 6/Agent 7 directive, max spend, artifact expected, and stop condition. This prevents the limiter from blocking necessary bounded work while still forbidding broad scans.

3. `STATUS_ONLY` can be misused as quiet deferral.

SOP-017 says cost scarcity does not clear blockers, but the decision labels do not force status-only outputs to preserve open blockers. Add a rule: every `STATUS_ONLY` response must list open P0/P1 blockers, next allowed evidence type, and whether a delivery blocker exists. `STATUS_ONLY` may not be returned while a P0 idle/no-goal delivery blocker or owner-route blocker needs escalation.

4. `REJECTED_WASTE` needs appeal routing.

The SOP allows rejecting repetitive or broad work, but does not require a cheap appeal path. Add: if the requester marks a rejected task as Agent 6-required, user-directed, or Agent 7 priority, Agent 12 must convert to `AGENT6_REQUIRED`, `AGENT7_DECISION_REQUIRED`, or `SHRUNK` with a concrete capped alternative. This prevents cost control from hiding QA or strategy obligations.

5. Repeated-proof-loop rule needs a formal new-hypothesis test.

The SOP says no repeated investigation without a new hypothesis, but does not define sufficiency. Add a required new-hypothesis test: changed external state, changed local artifact, changed dependency, changed owner route, changed validator, or explicit Agent 6/Agent 7/user directive. Without one, return `NEW_HYPOTHESIS_REQUIRED` and name the cheapest acceptable proof.

6. Agent 12 needs a worker-watchdog compatibility clause.

SOP-017 should explicitly align with SOP-001/SOP-014: limiter caps cannot turn an idle/no-goal delivery blocker into silence. If a worker lane lacks delivery proof or has a P0 no-goal blocker, Agent 12 may shrink the prompt, but must preserve delivery escalation with target thread, prompt artifact/text, blocker, boundary, and requested alternate route.

7. Agent 12 needs a "do not spend on already-returned dockets" rule.

Add a rule that once Agent 6 returns a docket, Agent 12 should reject or shrink work that merely restates the returned evidence unless there is drift, a new artifact, a new blocker, or a requested follow-up. This would have prevented no-drift proof-loop churn in the live Deuteronomy lane.

8. Capped intake should distinguish evidence collection from acceptance language.

The required intake packet has `acceptance boundary`, but Agent 12 decisions should also include a required `highest permissible claim` field, such as `evidence-ready`, `awaiting-Agent-6`, `control hygiene only`, `delivery blocker only`, or `owner decision request only`. This makes it harder for capped outputs to sound like acceptance.

9. Revision routing should be explicit.

Because SOP-017 is already Agent 6 WARN-ACCEPTED and Agent 7-published, Agent 12 should not edit or promote law directly. Agent 12 should prepare a revision packet and route it to Agent 6 with exact proposed wording, what changed, risk mitigated, and what must not be accepted.

10. Worker narration should be capped explicitly.

SOP-017 currently limits overlong status work, but it does not explicitly tell Agents 1-4 to stop narrating while they work. Add a default worker output rule: workers should use silent execution and produce the required artifact, not running commentary. Progress narration is allowed only for blockers, destructive risk, missing required input, delivery failure, or an Agent 6-ready packet. Final worker response should be one concise artifact pointer plus result status and blocker if any. Longer explanation should live in the bounded artifact, not chat.

## Suggested Agent 6 Revision Request

Agent 12 should route this to Agent 6:

`AGENT6_REQUIRED`: SOP-017 revision request for token-limit operation.

Requested verdict: pass/warn/block revision language only.

Exact scope: add limiter decision ledger, P0 capped override, status-only blocker preservation, rejected-waste appeal routing, formal new-hypothesis test, worker-watchdog compatibility, already-returned docket anti-churn rule, highest-permissible-claim field, silent worker execution / one-line artifact pointer output rule, and explicit Agent 6 revision routing.

Evidence artifacts:

- `reports/sop-017-agent12-limiter-token-conservation.md`
- `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- `reports/agent5-sop-017-review-findings-to-agent12-2026-06-02.md`

Claimed boundary: SOP-017 revision/control language only. No QA acceptance, no product/data acceptance, no publication readiness, no source/provenance custody, no public/runtime acceptance, no route publication support, no Definition authority, no usage-as-definition authority, and no accepted translation text.

What must not be accepted:

- Agent 12 as QA authority.
- Agent 12 as Agent 6 scope limiter.
- token-saving silence as blocker closure.
- status-only output as progress on P0 blocker.
- worker progress narration as required or desirable by default.
- sampled validation as broad acceptance.
- limiter approval as product/data, source/provenance, public/runtime, publication, route, Definition, usage, or text acceptance.

## Agent 5 Recommendation

Agent 12 should issue `AGENT6_REQUIRED` for SOP-017 revision and route the above change packet to Agent 6. Do not mutate SOP law or control-state publication until Agent 6 returns a dated revision docket.
