# Agent 5 Regulatory Audit Operating Packet

Generated: 2026-05-31T14:02:04-04:00

## Purpose

This packet defines how Agent 5 coordinates without overrelying on the user to relay every worker update.

Operating assumption:

- Pretend an external regulatory/compliance auditor can ask for provenance, authority, validation, and acceptance evidence at any time.
- Agent 5 must infer lane state from artifacts/reports when possible.
- User relay confirmation is useful, but not required to mark `observed adopted`, `drift`, or `needs QA`.

## Evidence-Driven Coordination

Agent 5 should classify each lane using local evidence:

- `accepted`: Agent 6 accepted the gate.
- `observed adopted`: reports/artifacts clearly implement the relay or pipeline rule.
- `report-backed`: generated reports claim success, but Agent 6 has not accepted it.
- `pending`: relay exists but no evidence of adoption.
- `drift`: artifacts conflict with current board/gate.
- `noncompliant`: lane output violates a gate or forbidden work rule.
- `needs QA`: report-backed or suspicious state requires Agent 6 sampling.

## Audit Questions

Every pipeline claim must answer:

- Where did this text/data come from?
- What license/provenance applies?
- Which artifact is authoritative?
- Which validator/report supports it?
- What changed since the last stamp?
- Which gate does it satisfy?
- Who accepted the gate?
- What is explicitly not claimed?

If a lane cannot answer these, Agent 5 should mark it `needs QA` or `noncompliant`, not ask the user to reconstruct context.

## Lane Mandates

### Agent 1: Source/Render Custody

Allowed work:

- source metadata hygiene.
- render batch reports.
- source/license visibility.
- generated-page drift explanation.

Forbidden work:

- changing HUD semantics without Agent 4 ownership.
- site-wide render claims without a batch/stamp/report boundary.
- treating presentational license text as sufficient if machine-readable metadata is missing.

Required artifacts:

- source/import report.
- render batch report when generated pages change.
- inventory drift explanation when page counts differ.

Acceptance condition:

- Agent 6 can sample a source/render artifact and trace source, license, generated page, and report boundary.

### Agent 2: Definition Authority

Allowed work:

- maintain frozen route release.
- fix route/source/license blockers found by Agent 6.
- produce a new release only with a new stamp.

Forbidden work:

- adding route families during freeze.
- letting evidence-only or ambiguous rows become Definition authority.
- publishing public lookup without reconciliation.

Required artifacts:

- route input freeze.
- route release stamp.
- public lookup manifest.
- release gate report.

Acceptance condition:

- Agent 6 can trace a Definition slot candidate back to answer-eligible route data and source/license rows.

### Agent 3: Usage Navigation

Allowed work:

- concordance links.
- usage frames/status.
- context snippets.
- related route IDs.
- audit-only ambiguity queues.

Forbidden work:

- emitting definition authority.
- copying Agent 2 definitions into usage payloads as authoritative text.
- promoting ambiguous rows reader-facing by default.

Required artifacts:

- usage concordance.
- link check report.
- route-link check report.
- audit-only review report.
- handoff report.

Acceptance condition:

- Agent 6 can click a usage row, land in the correct context, and see that definition authority resolves elsewhere through Agent 2/HUD.

### Agent 4: HUD Truth

Allowed work:

- token identity preservation.
- lane rendering.
- HUD accessibility semantics.
- source/license/citation visibility.
- narrow generated-page validation.

Forbidden work:

- rendering Agent 3 usage rows as definitions.
- using stale route lookup without answer gates.
- claiming HUD polish while token integrity/accessibility gates are unresolved.

Required artifacts:

- HUD/runtime source change.
- narrow validator report.
- sample page proof.
- explanation of modal vs non-modal semantics.

Acceptance condition:

- Agent 6 accepts token integrity, lane separation, source/license display, and HUD semantics on representative samples.

### Agent 5: Process Control

Allowed work:

- board updates.
- gate registry.
- relay state.
- QA docket.
- pipeline state.
- small validators/reports.

Forbidden work:

- final QA acceptance.
- legal clearance claims.
- assuming relay adoption without evidence.
- asking the user to serve as the only state transport.

Required artifacts:

- CEO board.
- control notes.
- Agent 6 briefs.
- gate/pipeline/relay sidecars.

Acceptance condition:

- Agent 6 can use Agent 5 artifacts to decide what to sample and which lane owns a blocker.

### Agent 6: QA/Compliance Authority

Allowed work:

- acceptance/blocker findings.
- direct QA samples.
- compliance/provenance review.
- overruling Agent 5 board assumptions.

Forbidden work:

- becoming a production implementation lane unless explicitly asked.
- accepting broad release claims without samples or report-backed gates.

Required artifacts:

- blocker/warning/polish docket.
- owning lane for each finding.
- acceptance condition for each blocker.

Acceptance condition:

- Agent 6 findings are specific enough for Agent 5 to relay exact correction orders.

## Agent 5 Pulse Rule

Each pulse should do three things:

1. Check a few recent artifacts/reports directly.
2. Update at least one state classification, gate, docket, risk, or relay if evidence changed.
3. Notify only if user action or meaningful strategic awareness is needed.

Do not wait for user-relayed worker summaries if local artifacts are sufficient.

## Noncompliance Handling

If a worker strays:

1. Mark the lane `drift` or `noncompliant`.
2. Identify the violated gate.
3. Create one correction order with:
   - owning lane.
   - forbidden behavior.
   - required artifact.
   - acceptance condition.
4. Escalate to Agent 6 if final QA acceptance is needed.

## Current Immediate Control Stance

- Agent 2: `observed adopted` release-candidate discipline.
- Agent 3: `observed adopted` usage-navigation discipline.
- Agent 4: `needs QA` and likely current bottleneck.
- Agent 1: `needs observation`; inspect recent render/source reports in pulses instead of relying on pasted updates.
- Agent 5: build machine-readable sidecars next.
- Agent 6: active QA/compliance authority; user has sent two prompts and Agent 6 is working.
