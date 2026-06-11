# Agent 12 SOP-017 Revision Request To Agent 6 - 2026-06-02

## Decision Label

`AGENT6_REQUIRED`

## Request

Agent 12 requests an Agent 6 pass/warn/block verdict on revision language for SOP-017.

This packet does not edit SOP law, does not replace the existing Agent 6 docket, and does not widen the Agent 7-published boundary.

## Current Signed Boundary

- SOP: `reports/sop-017-agent12-limiter-token-conservation.md`
- Agent 6 docket: `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- Current verdict: `SOP_warn_accepted_by_Agent_6`
- Published state: `Agent_7_published_Agent_6_signed_boundary`
- Publication boundary: `blocked_no_render`

SOP-017 remains emergency cost/scope-control workflow governance only. Agent 12 is not QA authority and may not narrow, veto, or reinterpret Agent 6 validation scope after Agent 6 determines what evidence is needed.

## Evidence Artifacts

- `reports/sop-017-agent12-limiter-token-conservation.md`
- `reports/agent6-sop-017-limiter-token-conservation-verdict-2026-06-02.md`
- `reports/agent7-sop-017-law-publication-2026-06-02.md`
- `reports/agent7-sop-017-revision-input-to-agent5-2026-06-02.md`
- `reports/agent5-sop-017-review-findings-to-agent12-2026-06-02.md`

## Revision Scope

Review revision language only for:

- operating modes,
- work classes,
- capped intake schema expansion,
- limiter decision record,
- P0 capped override,
- label semantics,
- status-only blocker preservation,
- rejected-waste appeal routing,
- formal repeated-proof-loop/new-hypothesis test,
- worker-watchdog compatibility,
- already-returned docket anti-churn rule,
- highest permissible claim field,
- silent worker execution and one-line artifact-pointer output rule,
- explicit revision routing back to Agent 6.

## Proposed Revision Language

Add operating modes:

- `NORMAL_DISCIPLINE`: scoped intake required for broad or vague work.
- `SCARCITY_WATCH`: suspected token/rate pressure; non-trivial work needs capped intake.
- `SCARCITY_ACTIVE`: active scarcity; broad work defaults to `SHRUNK`, `STATUS_ONLY`, `NEW_HYPOTHESIS_REQUIRED`, or `REJECTED_WASTE`.
- `EMERGENCY_HARD_CAP`: severe scarcity; only P0 blockers, owner-route decisions, Agent 6-required work, exact user requests, and bounded safety/compliance work proceed.

Add work classes:

- `P0_BLOCKER`
- `QA_REQUIRED`
- `OWNER_DECISION`
- `CONTROL_DRIFT`
- `EVIDENCE_PACKET`
- `WORKER_ROUTING`
- `PRESSURE_PROMPT`
- `PROOF_LOOP`
- `STATUS_ONLY`

Expand capped intake to require:

- objective,
- work class,
- scarcity mode,
- triggering evidence,
- allowed paths,
- forbidden paths,
- max files,
- max edits,
- max commands,
- max runtime or timeout,
- max agents or worker prompts,
- reused evidence,
- new hypothesis if repeated,
- expected artifact,
- stop condition,
- escalation target if blocked,
- acceptance boundary,
- highest permissible claim,
- what must not be accepted.

Add `limiter_decision_record` fields:

- request id,
- source request,
- decision label,
- estimated token/file/edit budget,
- actual tokens if available,
- files inspected,
- edits made,
- validators run,
- stop condition reached,
- saved-token rationale,
- Agent 6 or Agent 7 routing requirement.

Add `P0_CAPPED_OVERRIDE`:

P0, Agent 6-directed, Agent 7-directed, user-directed, public-surface exposure, destructive-risk, and source/provenance emergency work may exceed default caps only with exact directive, max spend, artifact expected, stop condition, and unaccepted scope.

Add label rules:

- `STATUS_ONLY` must preserve open P0/P1 blockers, next allowed evidence type, and delivery-blocker state. It may not hide owner-route or P0 idle/no-goal delivery blockers.
- `REJECTED_WASTE` must state reused evidence and why no new hypothesis exists.
- If a rejected task is Agent 6-required, user-directed, or Agent 7 priority, Agent 12 must convert it to `AGENT6_REQUIRED`, `AGENT7_DECISION_REQUIRED`, or `SHRUNK` with a concrete capped alternative.
- `AGENT6_REQUIRED` cannot be converted to `REJECTED_WASTE`, `STATUS_ONLY`, delay, or silence.

Add repeated-proof-loop rule:

Reject repeated proof unless at least one is true: live URL changed, deployment state changed, dependency status changed, local artifact changed, owner route changed, validator changed, Agent 6/Agent 7/user requested recheck, new hypothesis names a different plausible failure mode, or proof is needed for a post-remediation packet.

Add worker-watchdog compatibility:

Limiter caps cannot turn an idle/no-goal delivery blocker into silence. Agent 12 may shrink a worker prompt, but must preserve delivery escalation with target thread, prompt artifact or text, blocker, boundary, and requested alternate route.

Add already-returned docket anti-churn rule:

After Agent 6 returns a docket, Agent 12 should reject or shrink work that merely restates returned evidence unless there is drift, a new artifact, a new blocker, or a requested follow-up.

Add worker output rule:

Workers should use silent execution and produce the required artifact. Progress narration is allowed only for blockers, destructive risk, missing required input, delivery failure, or an Agent 6-ready packet. Final worker response should be one concise artifact pointer plus result status and blocker if any. Longer explanation belongs in the bounded artifact, not chat.

## Risk Mitigated

The revision prevents SOP-017 from becoming too flat for large-scope work while preserving Agent 6 authority. It reduces token waste without allowing silence, sampling, status-only output, or limiter labels to hide P0 blockers, QA-required work, source/provenance risk, public/runtime risk, or owner-route obligations.

## What Must Not Be Accepted

- Agent 12 as QA authority.
- Agent 12 as Agent 6 scope limiter.
- Limiter approval as Agent 6 acceptance.
- Token-saving silence as blocker closure.
- `STATUS_ONLY` as progress on a P0 blocker.
- `REJECTED_WASTE` as a way to avoid Agent 6-required or Agent 7-priority work.
- Worker progress narration as required or desirable by default.
- Sampled validation as broad runtime acceptance.
- Capped validation as source/provenance custody acceptance.
- Product/data acceptance.
- Publication readiness.
- Public/runtime acceptance.
- Route publication support.
- Definition authority.
- Usage-as-definition authority.
- Accepted translation text.

## Requested Agent 6 Verdict

Please issue pass, warn-accept, or block on this revision language only.

If warn-accepted, please name exact warning limits and whether Agent 7 may mechanically publish the revised SOP-017 boundary without broad revalidation.
