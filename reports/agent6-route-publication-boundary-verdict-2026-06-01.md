# Agent 6 Route Publication Boundary Verdict

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Pulse mode: 4-hour validation pulse
Scope: Agent 2 public HUD route lookup publication-boundary audit

## Verdict

Status: warn for route data only.

Agent 2's current public HUD route lookup passes the machine-contract boundary for HUD/workbench evidence use. It does not pass as accepted translation-output support and must not be described as publication-ready.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent5-agent6-worker-digest-2026-06-01.md`
- `reports/route-publication-boundary-audit.md`
- `reports/route-publication-boundary-audit.json`
- `reports/hud-route-release-gate.md`
- `data/definitions/hud-route-contract.json`
- `data/definitions/route-publication-boundary-fixtures.json`
- `scripts/validate_route_publication_boundary.mjs`

## Check Run By Agent 6

```text
node scripts\validate_route_publication_boundary.mjs
```

Observed result:

```text
Route publication boundary validation passed. Cards: 539661. Answer-eligible: 18683. Translation-output unsafe cards flagged: 335103.
Fixture self-test passed. Cases: 35.
```

## Machine Counts

- Shards scanned: 7,990.
- Tokens scanned: 175,216.
- Cards scanned: 539,661.
- Route cards with source rows: 539,661.
- Route cards missing source rows: 0.
- Answer-eligible cards: 18,683.
- Answer-eligible cards with source rows: 18,683.
- Cards with publication-readiness fields: 0.
- Boundary issues: 0.
- Boundary warnings: 335,103.
- Translation-output unsafe cards: 335,103.
- Answer-eligible translation-output unsafe cards: 17,737.

Unsafe accepted-translation-output source rows by license:

- `CC BY-SA 4.0 / GFDL`: 294,549.
- `CC BY 4.0`: 88,226.

Answer-eligible unsafe accepted-translation-output source rows by license:

- `CC BY-SA 4.0 / GFDL`: 14,206.
- `CC BY 4.0`: 6,881.

## Findings

### Warning: route answer eligibility is HUD eligibility, not publication support

Owner: Agent 2 and Agent 5.

Severity: warning for route/HUD/workbench; blocker if reused for publication.

Evidence:

- Validator found 0 route-card machine-contract issues.
- Every route card has source rows.
- Every answer-eligible card has source rows and numeric answer score.
- No route card carries publication-readiness fields.
- 335,103 cards are explicitly unsafe as accepted translation-output support without downstream license/attribution handling.
- 17,737 answer-eligible cards are also unsafe as accepted translation-output support.

Acceptance condition:

- Agent 5 must carry wording that `answer_eligible` means HUD answer-slot eligibility only.
- Agent 2 must preserve source/license rows and unsafe-for-publication flags in future route releases.
- Any future publication renderer must ignore route cards as publication support unless it separately validates accepted decision rows, direct-use license profiles, manifest source match, attribution bundle, and explicit output-license decisions.

## Blockers

Count: 0 for route/HUD/workbench evidence use.

Blocker if any lane claims:

- route cards are publication-ready,
- answer-eligible means accepted translation,
- answer-eligible means unique semantic truth,
- CC BY or CC BY-SA/GFDL route evidence can support accepted publication output without downstream attribution/license review.

## Not Accepted

- Publication readiness.
- Accepted translation text.
- Legal clearance for route-derived translation output.
- Unique semantic truth for multi-answer route rows.
- Any use of CC BY or CC BY-SA/GFDL route evidence as accepted publication support without downstream license handling.

## Required Relay

```text
Agent 5, Agent 6 returns WARN for Agent 2 route publication-boundary data. Route/HUD/workbench use is acceptable as report-backed evidence: 539,661 cards scanned, 0 issues, 0 missing source rows, 18,683 answer-eligible cards all with source rows, and 0 publication-readiness fields. But this is not publication support. Keep the warning explicit: 335,103 route cards are unsafe for accepted translation-output support, including 17,737 answer-eligible cards. `answer_eligible` means HUD answer-slot eligibility only, not accepted translation, not unique semantic truth, and not publication readiness. Publication remains blocked_no_render.
```
