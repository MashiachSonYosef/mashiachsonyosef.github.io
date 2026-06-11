# Agent 6 Validation Workhorse Operating Protocol

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Mode: validation workhorse with slow 4-hour pulse

## Verdict

Agent 6 should not run as a 10-minute pulse coordinator. Agent 6 now runs as a slow 4-hour validation pulse: queue-first, evidence-first, and docket-driven.

Agent 5 and Agent 7 may ping Agent 6 for signoff, but their pings become queue entries. They do not create acceptance, do not set Agent 6 priority, and do not close Agent 6 gates.

Publication remains `blocked_no_render`.

## Operating Boundary

Agent 6 validates, blocks, warns, accepts-with-boundary, or sends work back. Agent 6 does not coordinate daily work unless the validation result requires a corrected downstream directive.

The 4-hour pulse checks the Agent 6 queue, reviews new signoff packets, runs narrow non-destructive validators where useful, and performs high-risk QA sweeps. It is not a status poll and not a coordination loop.

Agent 5 may continue pulse/control work, but Agent 5 must not phrase pending Agent 6 items as accepted, ready, or legal-cleanup-only. Agent 5 is a relay and control surface for QA decisions, not the QA authority.

Agent 7 may produce evidence packets and pilot proofs, but Agent 7 evidence is not self-accepting. Agent 7 signoff requests enter the Agent 6 queue.

## Queue Artifact

Agent 6-owned queue:

- `data/control/agent6_validation_queue.json`

This queue is the intake point for signoff requests from Agent 5, Agent 7, or the user. Agent 6 may reorder it by risk.

Current priority order:

1. Agent 1 source/report-truth contradiction and source provenance hygiene.
2. Agent 5 role-based QA gate taxonomy.
3. Agent 7/Agent 4 Reader Workbench broader-rollout recheck, waiting on hardening evidence.
4. Agent 3 usage-navigation sample verification.

## Method Validation Concept

The validation unit is a word-definition row or a boundary gate.

Every definition-level validation should check:

- Token identity and normalized key preservation.
- `answer_eligible` and `answer_role` presence and coherence.
- Source name, source ID, source URL, citation, license, and license URL survivability.
- Evidence/usage/candidate/ambiguous rows cannot become definition authority.
- Kaikki, CC BY, CC BY-SA/GFDL, Sefaria-derived, and unknown-license evidence cannot become publication support without explicit gate acceptance.
- Route/HUD/workbench display cannot imply publication readiness.

Every semantic validation should include stratified high-risk samples:

- Answer-eligible rows.
- Multi-answer/conflicting rows.
- Kaikki/provenance-warning rows.
- Changed-since-release rows.
- Ambiguous/candidate/weak rows.
- Edge-token rows such as maqaf, prefix/suffix, hyphen, and split-token risk.

## Signoff Standard

Agent 6 signoff must be explainable later to a legal or regulatory body.

Every Agent 6 pass/warn/block must include:

- Verdict: `pass`, `warn`, `block`, or `accepted-with-boundary`.
- Scope accepted.
- Scope explicitly not accepted.
- Evidence artifacts reviewed.
- Blocker/warning counts when machine-countable.
- Owner lane for each finding.
- Acceptance condition for every warning or blocker.

No acceptance is valid if the evidence packet cannot be recounted quickly.

## Intake Contract For Agent 5 And Agent 7

Required signoff request format:

```text
Agent 6 signoff request:
Request ID:
Submitted by:
Gate:
Scope:
Evidence artifacts:
Requested verdict:
Claimed boundary:
Known risks:
What changed since last Agent 6 ruling:
What must not be accepted:
```

Auto-return conditions:

- Publication readiness is requested while publication remains `blocked_no_render`.
- Evidence packet lacks artifact paths.
- Source/license/provenance claims lack source rows or manifest linkage.
- Usage/evidence rows are presented as definition authority.
- Public HUD or workbench acceptance is requested while labels are hidden, optional, collapsed in a misleading way, or not recountable.

## Current Directive To Agent 5

Do not make Agent 6 a pulse lane. Add Agent 6 signoff requests to `data/control/agent6_validation_queue.json` using the intake contract above, then wait for Agent 6 docket output.

Do not prioritize by who is loudest. Prioritize by legal/provenance/publication risk first, public truth surfaces second, route/usage boundary third, and polish last.

## Current Directive To Agent 7

Do not ask for broad acceptance from pilot evidence. Submit narrow evidence packets with exact artifacts, changed files, validators, negative tests, and the boundary not being accepted.

For Reader Workbench expansion, Agent 7 must bring evidence that import validation was hardened, evidence-only fallback cannot read as definition authority, source/license rows survive export/import, and no accepted translation-memory write path exists.
