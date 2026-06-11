# Agent 6 Usage-Navigation Boundary Verdict

Date: 2026-06-01
Authority: Agent 6, independent QA/compliance authority
Pulse mode: 4-hour validation pulse
Scope: Agent 3 selected usage-navigation/concordance handoff

## Verdict

Status: accepted-with-boundary, with warnings.

Agent 3's selected usage-navigation/concordance handoff is acceptable as usage navigation evidence. It preserves source/provenance, uses route IDs only, keeps ambiguous rows audit-only, and does not become Definition authority.

This is not public Definition acceptance, not broad/exhaustive usage coverage, not Agent 2 route acceptance, not source/provenance acceptance, and not publication readiness.

Publication remains `blocked_no_render`.

## Evidence Reviewed

- `reports/agent5-agent3-to-agent6-brief.md`
- `reports/workbench-usage-navigation-handoff.md`
- `reports/workbench-usage-selected-qa-package.md`
- `reports/workbench-usage-agent6-boundary-packet.md`
- `reports/workbench-smoke-pipeline-validation.md`
- `data/workbench-evidence/usage-concordance.json`
- `.local-cache/workbench-evidence/usage-navigation-handoff-index.json`
- `.local-cache/workbench-evidence/usage-agent6-boundary-packet.json`
- `.local-cache/workbench-evidence/usage-selected-qa-package.json`
- `.local-cache/workbench-evidence/usage-audit-only-review.json`
- `.local-cache/workbench-evidence/usage-route-link-check.json`
- `scripts/validate_usage_navigation_summary.mjs`
- `reports/usage-navigation-boundary-summary-validation.md`
- `reports/usage-navigation-boundary-summary-validation.json`

## Checks Run By Agent 6

```text
node scripts\validate_workbench_usage_handoff_index.mjs .local-cache\workbench-evidence\usage-navigation-handoff-index.json
node scripts\validate_workbench_usage_agent6_boundary_packet.mjs .local-cache\workbench-evidence\usage-agent6-boundary-packet.json
node scripts\validate_workbench_usage_selected_qa_package.mjs .local-cache\workbench-evidence\usage-selected-qa-package.json
node scripts\validate_usage_navigation_summary.mjs
```

Observed results:

```text
Workbench usage handoff index validation passed. Rows: 2390. Clusters: 2.
Validated Agent 6 usage boundary packet .local-cache/workbench-evidence/usage-agent6-boundary-packet.json: checks 11; selected rows 49
Validated usage selected QA package .local-cache/workbench-evidence/usage-selected-qa-package.json: items 21; selected rows 49
Usage navigation boundary summary validation pass_with_warnings: reports/usage-navigation-boundary-summary-validation.md
```

## Machine Counts

- Concordance rows: 2,390.
- Reader-facing eligible statuses in concordance: supported 339, candidate 1,351, weak 700.
- Audit-only rows: ambiguous 2,064, blocked 0.
- Selected QA rows: 49.
- Selected rows with source links: 49.
- Selected rows with work anchors: 49.
- Selected rows with marked context: 49.
- Selected rows with license metadata: 49.
- Selected rows missing/unrecognized license metadata: 0.
- Route-linked rows: 2,390.
- Route links resolved/unresolved: 2,390/0.
- Unique route IDs: 1.
- Route payload-like field hits: 0.
- Copied route payload rows in selected route/provenance audit: 0.
- Forbidden field hits in Agent 6 boundary packet: 0.
- Top-level definition/answer/translation/publication/gloss-like fields in concordance rows: 0.
- Concordance rows with non-usage role: 0.
- Concordance rows with missing source link or source ref: 0.
- Concordance rows with missing license or license URL: 0.
- Selected QA package quality: pass_with_warnings, warnings 1, failed 0.
- Smoke pipeline: 102 steps, failed 0.
- Agent 5 summary prevalidation: pass_with_warnings.
- Selected collision buckets: 16.
- Cross-frame collision rows: 14.

## Findings

### Accepted With Boundary: usage rows remain usage navigation

Owner: Agent 3.

Severity: accepted-with-boundary.

Evidence:

- All 2,390 concordance rows have `row_role=usage_navigation`.
- All sampled supported/candidate/weak rows carry `observed_usage_only=true`.
- Sampled supported, candidate, and weak rows carry source ref, source URL, license, license URL, and version source.
- Route references expose route ID/source/family metadata only; sampled rows do not copy definition payloads.
- Agent 6 boundary packet reports route payload field hits 0 and forbidden field hits 0.

Acceptance condition:

- Agent 3 may continue selected usage-navigation/concordance work only if rows stay labeled as observed usage/navigation and continue carrying source, license, context, and route-ID-only references.
- Agent 3 must not copy Agent 2 route definition payloads into usage rows.

### Warning: route concentration limits semantic strength

Owner: Agent 3 and Agent 5.

Severity: warning.

Evidence:

- All 2,390 route-linked rows resolve to one route ID: `def-kaikki-lemma-e4f94cd5131316a8`.
- Selected QA package reports route concentration warning visible 1.
- Selected route links resolve and have no copied payloads, but this does not establish independent semantic diversity.

Acceptance condition:

- Agent 5 must describe this as route-linked observed usage, not independent semantic arbitration.
- Any later claim of semantic coverage or multiple-definition discrimination requires broader route diversity evidence and Agent 6 re-review.

### Warning: source freshness blocks broad/exhaustive coverage claims

Owner: Agent 3 and Agent 5.

Severity: warning.

Evidence:

- Current smoke pipeline reports source freshness stale.
- Current stale counts: count delta 95, modified after artifact 100.
- Smoke still passes the selected handoff checks: 102 steps, 0 failed.

Acceptance condition:

- Agent 3 may use this packet for selected nonzero-target usage navigation only.
- Agent 5 must not claim site-wide exhaustive coverage, broad usage acceptance, or fully current corpus coverage until stale source freshness is resolved and the pipeline is rerun.

### Warning: selected package is not public UI acceptance

Owner: Agent 4 and Agent 5.

Severity: warning.

Evidence:

- Selected QA package authority policy marks `reader_facing=false`.
- Selected QA package reports reader-facing rows 0.
- Audit-only review marks ambiguous rows reader-facing false.

Acceptance condition:

- Before public Reader Workbench/HUD display expands usage-navigation rows, Agent 4 or Agent 7 must provide UI/runtime evidence that labels are visible and rows cannot appear as Definition authority.
- Ambiguous rows remain audit-only unless a later Agent 6 docket accepts a narrower display boundary.

## Blockers

Count: 0 for selected usage-navigation evidence use.

Blocker if any lane claims:

- Agent 3 usage rows are definitions,
- selected usage navigation is broad/exhaustive coverage,
- route-linked observed usage is independent semantic arbitration,
- ambiguous rows are reader-facing authority,
- selected usage evidence is publication-ready or accepted translation text.

## Not Accepted

- Definition authority.
- Agent 2 route release acceptance.
- Public HUD/Reader Workbench rendering correctness.
- Broad/exhaustive usage coverage.
- Source/provenance acceptance.
- Publication readiness.
- Accepted translation text.

## Required Relay

```text
Agent 5, Agent 6 accepts Agent 3's selected usage-navigation handoff with boundary warnings. It is acceptable as selected usage navigation only: 2,390 concordance rows, 49 selected QA rows, 49/49 source/license/context rows complete, 2,390/0 route links resolved/unresolved, 2,064 ambiguous rows audit-only, 0 route payload hits, 0 forbidden definition/answer/translation/publication fields, and validators passed. Do not call it Definition authority, semantic arbitration, broad coverage, public UI acceptance, or publication support. Carry the warnings: all route-linked rows concentrate on one route ID, source freshness is stale by 95 count delta and 100 modified-after-artifact files, and selected QA package has reader-facing rows 0.
```
