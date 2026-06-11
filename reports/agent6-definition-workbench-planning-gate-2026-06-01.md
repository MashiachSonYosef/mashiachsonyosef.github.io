# Agent 6 Definition Workbench Planning Gate

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Pulse mode: 4-hour validation pulse
Scope: planned Definitions Workbench data-contract boundary

## Verdict

Status: warn, planning may continue but UI assignment is blocked until a machine-readable sample contract exists.

The Definitions Workbench plan is directionally safe because it explicitly separates lexical validation from translation, publication readiness, translation-memory writes, and usage-navigation authority. It is not yet acceptable for UI implementation, broad rollout, Definition authority acceptance, or publication-related claims.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `data/control/definition_workbench_plan.json`
- `reports/agent7-definition-workbench-ceo-plan-2026-06-01.md`
- `reports/agent6-definition-integrity-gate-2026-06-01.md`
- `reports/workbench-token-inventory.md`
- `reports/definition-gap-queue-report.md`
- `data/control/pipeline_state.json`
- `data/control/gate_registry.json`

## Machine Counts Carried Forward

- Token inventory total tokens: 57,709,552.
- Token inventory distinct normalized tokens: 623,000.
- Token inventory scanned source files: 1,192.
- Token inventory includes untracked sources: false.
- Public route lookup distinct normalized tokens: 175,216.
- Public route lookup cards: 539,661.
- Public route lookup shards: 7,990.
- Definition gap queue rows: 5,000.
- Definition Integrity Gate status: warn.
- Multi-answer normalized tokens: 1,901.
- Distinct answer-definition conflict tokens: 1,864.
- Usage-navigation rows: 2,390, usage-only.

## Findings

### Warning: plan is safe only as a planning lane

Owner: Agent 5 and Agent 7.

Severity: warning.

Evidence:

- The plan states Definitions Workbench is not translation, not publication readiness, not unique semantic truth without review, and must not write translation-memory rows.
- The plan also says Agent 4 should not be queued until the index contract and Agent 6 boundary are ready.
- No machine-readable Definitions Workbench sample index is present in the evidence set.

Acceptance condition:

- Agent 5 must keep this at `planned_data_contract_needed`.
- Agent 4 must not receive a UI implementation task until Agent 2/3 provide a small machine-readable sample index and Agent 6 returns a data-contract verdict.

### Warning: `verified` needs a narrow legal/QA definition

Owner: Agent 5 and Agent 2.

Severity: warning, blocker if used as publication or accepted-translation language.

Evidence:

- The plan's allowed statuses include `verified`.
- The plan says `verified` means reviewed lexical display/definition authority only.
- Agent 6 Definition Integrity Gate warns that `answer_eligible` is HUD answer-slot eligibility only and that 1,901 normalized tokens have multiple answer-eligible cards.

Acceptance condition:

- `verified` must mean reviewed lexical-display/definition authority for the workbench role only.
- `verified` must not imply accepted translation text, legal clearance, source/provenance acceptance, unique semantic truth, or publication readiness.
- Multi-answer rows must remain `conflicting` or similarly explicit until a reviewed lexical decision resolves them.

### Warning: source scope is not complete

Owner: Agent 1, Agent 5, and Agent 7.

Severity: warning for planning; blocker for any source-complete or publication-support claim.

Evidence:

- `reports/workbench-token-inventory.md` says untracked sources are excluded.
- Current Agent 6 source-scope docket blocks source/provenance acceptance and future publication path because 13 untracked source JSON files remain outside tracked audit scope.
- The Definition Workbench plan carries `include_untracked_sources=false` for token inventory.

Acceptance condition:

- Definitions Workbench coverage language must say tracked-source inventory only until the source-scope blocker is resolved.
- No row may be described as corpus-complete or publication-supporting while untracked source files are excluded.

### Warning: human-readable token reports are mojibake and not audit-grade

Owner: Agent 2 and Agent 5.

Severity: warning for planning; blocker for using these reports as regulatory/human QA evidence.

Evidence:

- `reports/workbench-token-inventory.md` renders top Hebrew tokens as mojibake rather than readable Hebrew.
- `reports/definition-gap-queue-report.md` renders top queue rows as mojibake rather than readable Hebrew.
- These reports may still be machine-useful, but they are not human-audit-grade in their current rendered form.

Acceptance condition:

- Before Agent 6 accepts any Definitions Workbench data-contract report, Agent 2/5 must provide readable UTF-8/Hebrew display in the human report or a companion report that maps token keys to readable surfaces.
- The machine artifact must preserve token identity and the human report must be recountable without decoding guesswork.

### Warning: source/license and publication walls remain mandatory fields

Owner: Agent 2, Agent 3, Agent 5, and Agent 6.

Severity: warning; blocker if absent from the sample contract.

Evidence:

- The plan requires `source_license_complete`, source/license rows, and usage/concordance link availability.
- Agent 6 Definition Integrity Gate found source/license survivability blockers 0 in route data, but also found one display/handoff contract issue outside route data: source/license rows must be expanded by default or a revised contract must be accepted.
- Agent 6 usage-navigation verdict accepts Agent 3 usage only as selected usage navigation with warnings, not Definition authority.

Acceptance condition:

- The sample index must carry source/license completeness for index rows and full source/license rows for detail rows.
- Usage links must point to usage/navigation artifacts and must not become definition authority.
- The sample packet must include negative proof that Definitions Workbench cannot write accepted translation-memory rows.

## Blockers

Count: 1 planning-to-implementation blocker.

- No machine-readable Definitions Workbench sample index exists yet for Agent 6 to validate.

Standing blockers remain:

- Publication is `blocked_no_render`.
- Source/provenance acceptance and future publication path remain blocked by 13 untracked source JSON files outside tracked audit scope.

## Not Accepted

- UI implementation.
- Broad rollout.
- Definition authority acceptance.
- Unique semantic truth.
- Source/provenance acceptance.
- Publication readiness.
- Accepted translation text.
- Translation-memory writes.

## Required Relay

```text
Agent 5, Agent 6 returns WARN for the Definitions Workbench planning gate. Planning may continue, but Agent 4 UI assignment is blocked until Agent 2/3 produce a small machine-readable sample index and Agent 6 reviews the data contract. Keep `verified` narrow: reviewed lexical-display/definition authority only, not accepted translation, legal clearance, unique semantic truth, source/provenance acceptance, or publication readiness. Coverage is tracked-source only because token inventory excludes untracked sources and source/provenance remains blocked on 13 untracked source JSON files. Also fix human-readable mojibake in `reports/workbench-token-inventory.md` and `reports/definition-gap-queue-report.md` before using them as audit evidence.
```
