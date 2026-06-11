# Dirty Repo Manifest - 2026-06-10

Status: classification artifact, not a cleanup commit for dirty paths.

Baseline: main @ ad87b3008
Generated: 2026-06-11T00:45:32.101Z

Boundary: no deletion, no broad reset, no git add -A, exact path staging only. Crossmatching is evidence/navigation only and does not authorize preHUD text.

## Counts

Dirty paths classified: 988

### By Status

| status | count |
| --- | --- |
| ?? | 838 |
|  M | 150 |

### By Bucket

| bucket | count |
| --- | --- |
| control/governance | 521 |
| lexical/generated data | 401 |
| source/license data | 34 |
| preview/support | 25 |
| reports/evidence | 3 |
| root/library/deploy carry | 2 |
| generated reader page | 1 |
| unknown | 1 |

### By Staging Eligibility

| staging_eligibility | count |
| --- | --- |
| eligible_after_scope_review | 519 |
| defer_generated_payload | 381 |
| defer_source_license | 34 |
| defer_generated_support | 24 |
| defer_definition_payload | 19 |
| defer_a14_surface_review | 2 |
| blocked | 2 |
| defer_generated_no_content_change | 1 |
| defer_evidence_index | 1 |
| defer_preview_support | 1 |
| defer_page_validator | 1 |
| manual_review_required | 1 |
| blocked_syntax | 1 |
| defer | 1 |

## Validation Notes

- MJS scripts checked with node --check: 515; failures: 1.
- PowerShell scripts parsed: 5; failures: 0.
- CMD scripts requiring manual review: 1.
- Data paths are classified for required validators, not accepted for staging by this manifest.

## Immediate Blockers / Manual Review

| path | bucket | staging_eligibility | blocker |
| --- | --- | --- | --- |
| reports/agent10-live-public-old-hud-guard-2026-06-04-post-orot-reader-hint-candidate-patch.json | reports/evidence | blocked | remaining report file was not in prior report commit; inspect content before staging |
| reports/agent11-reader-workbench-reception-proof-2026-06-03.json | reports/evidence | blocked | remaining report file was not in prior report commit; inspect content before staging |
| scripts/run_agent10_it_pulse_scheduled.cmd | control/governance | manual_review_required | no automated syntax gate recorded for .cmd file |
| scripts/validate_agent7_governance_control.mjs | control/governance | blocked_syntax | C:\Users\owner\Documents\translations\scripts\validate_agent7_governance_control.mjs:1 \| ﻿#!/usr/bin/env node \|  ^ \|  |

## Crossmatch Classification

- `data/lexical/crossmatches/daniel.json` is classified as lexical/generated data and evidence/navigation only.
- Current dirty diff is generated_at-only; no content behavior change was found.
- Daniel pages still wire the optional crossmatch URL, but crossmatch output does not become preHUD text without a display eligibility validator.

## Full Row Set

The full path-level row set is in `reports/dirty-repo-manifest-2026-06-10.json`.
