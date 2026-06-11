# SPEC-002: Source/Provenance Custody

Specification ID: SPEC-002
Title: Source/Provenance Custody, Quarantine, Audit Agreement, And Label Survivability
Status: warn_accepted_by_Agent_6_docket_specification_control_only
Draft owner: Agent 7
Control coordinator: Agent 5
Primary lane: Agent 1
Runtime/QC support: Agent 4 when rendered/public surfaces are involved
QA authority: Agent 6
Related SOP: `reports/sop-020-specification-and-batch-disposition-control.md`
Related public-surface spec draft: `reports/spec-001-public-runtime-surface-control.md`
Publication status: `blocked_no_render`

## Purpose

Define the proposed specification for source/provenance custody so source files, overlays, generated pages, labels, quarantine state, and audit reports remain recountable.

This draft does not accept source/provenance, publication, page/render state, public/runtime state, or any batch/output.

## Scope

In scope:

- `data/sources/*.json`
- source manifests and source metadata
- overlays derived from sources
- generated public/workbench pages that display source-derived or third-party evidence
- source/license/citation labels
- direct source discovery reports
- audit JSON and markdown reports
- quarantine/exclusion lists
- license-unit counts
- source-label survivability through route/HUD/workbench/public surfaces

Out of scope:

- Publication readiness
- Accepted translation text
- Legal clearance
- Definition authority
- Usage-as-definition authority
- Route publication support
- Public/runtime surface acceptance beyond SPEC-001 or Agent 6 docket

## Current Evidence State

Current worker evidence reports:

- Direct untracked `data/sources/*.json`: 23
- Audited untracked `data/sources/*.json`: 23
- Missing in audit: 0
- Extra in audit: 0
- License-unit counts: CC-BY 74,683; Public Domain 10,727
- Quarantine: every row is `quarantined_until_source_file_is_tracked_and_source_audit_passes`

Evidence artifacts:

- `reports/agent1-source-scope-recount-recheck.md`
- `reports/untracked-source-files-direct.txt`
- `reports/untracked-source-scope-audit.md`
- `reports/untracked-source-scope-audit.json`

This evidence is `awaiting-Agent-6` only. It does not supersede any Agent 6 blocker until Agent 6 issues a dated docket.

## Proposed Core Rule

Source/provenance custody is not accepted unless direct discovery, provided list, audit JSON, audit markdown, quarantine/exclusion state, license counts, and rendered/public label survivability are mutually consistent or explicitly reconciled by Agent 6.

Any source file outside accepted custody is quarantined for source/provenance and future publication reliance.

## Required Inputs

Each SPEC-002 packet must include:

- Direct discovery command or direct list artifact.
- Audit JSON.
- Audit markdown.
- Source files in scope.
- Overlay paths in scope.
- Generated/public/workbench page paths in scope, where any exist.
- License-unit count summary.
- Missing/extra file reconciliation.
- Quarantine/exclusion list and rationale.
- Source/license/citation label survivability evidence.
- Prior Agent 6 docket path.
- Claimed boundary.
- What must not be accepted.

## Proposed Acceptance Criteria

Agent 6 may accept a bounded source/provenance custody packet only when:

- Direct discovery and audit scope agree, or every discrepancy is explicitly quarantined/excluded.
- Audit JSON and markdown report the same file set and counts.
- Every source file has source name/id, license, license URL when known, source URL when known, and import/generation path when available.
- License-unit counts reconcile with audit rows.
- Public/rendered/workbench pages that exist show visible, non-misleading source/license/citation rows.
- Missing pages are identified as missing and not used as acceptance evidence.
- Quarantined files cannot support publication, accepted translation text, reviewed Definition authority, route publication support, or usage-as-definition authority.
- The packet includes negative tests or recount evidence proving omitted files are detected.
- The packet states what remains unaccepted.

## Proposed Warn Conditions

Agent 6 may warn rather than block when:

- Direct discovery works only through a provided list because a tool environment cannot run git discovery, but an independent recount supports the same file set.
- Public/workbench pages are missing but not public-facing.
- Labels are visible but wording needs clarification without misleading current users.
- Quarantine is explicit and downstream reliance is blocked.

Warn does not create publication readiness or broad source/provenance clearance.

## Proposed Block Conditions

Block if any of the following are true:

- Direct discovery count differs from audit count without explicit quarantine/exclusion.
- Audit JSON and markdown disagree.
- Source files are untracked and neither tracked nor explicitly quarantined.
- Public-facing source-derived evidence lacks visible source/license/citation labels.
- License counts are missing or inconsistent.
- Missing pages are treated as source/provenance acceptance.
- Quarantined files are used for future publication path support.
- Worker evidence is treated as Agent 6 acceptance.
- Source/provenance clearance is claimed from presentational labels alone.

## Method Protocol Requirements

Every SPEC-002 validation packet must include a method protocol:

- Method ID and version.
- Discovery method and command/artifact.
- Audit generation command/artifact.
- Recount method for file counts and license-unit counts.
- Positive controls: known tracked/accepted source file with visible labels.
- Negative controls: synthetic or known missing/untracked source file, missing label row, mismatched audit row, and missing page.
- Robustness check: sorted order, path normalization, and repeated run stability.
- Source-label survivability path from source file to overlay/page/HUD/workbench row when applicable.
- Drift check against prior Agent 6 docket.
- Required report output.
- What must not be accepted.

## Calibration Requirements

Before using a SPEC-002 audit for high-risk Agent 6 review, prove the audit method can detect:

- A file present in direct discovery but absent from audit JSON.
- A file present in audit JSON but absent from direct discovery.
- A source row missing license.
- A source row missing source/citation identity.
- A generated page with hidden/missing source/license/citation rows.
- A quarantined source being used as publication support.
- License-count drift.

Calibration validates the method, not source/provenance acceptance.

## Validation Report Requirements

Each SPEC-002 report must include:

- Batch/source-scope ID.
- Source file count.
- Audit file count.
- Missing-in-audit count and list.
- Extra-in-audit count and list.
- License-unit counts.
- Quarantined files and rationale.
- Tracked files and accepted custody boundary, if any.
- Overlay/page visibility table.
- Positive/negative control results.
- Deviations.
- Drift from prior Agent 6 docket.
- Requested Agent 6 verdict.
- What must not be accepted.

## Drift Triggers

Any trigger moves the affected source scope to `blocked` or `quarantined` until Agent 6 rules:

- Direct source discovery count changes.
- Audit file count changes.
- License-unit count changes.
- A new `data/sources/*.json` appears outside audit scope.
- A tracked source file becomes untracked or loses custody metadata.
- Public/rendered/workbench label visibility changes.
- A source-derived public/runtime surface appears without SPEC-001-compatible docket coverage.
- Quarantined source files are referenced by publication, accepted translation text, route publication support, or Definition authority.

## Current 23-File Quarantine Boundary

The current 23-file packet may be used as evidence only. Until Agent 6 rules:

- all 23 files remain quarantined,
- source/provenance remains blocked,
- future publication reliance remains blocked,
- page/render state remains unaccepted,
- visible source/license rows are warning-level evidence only,
- direct-23/audit-23 does not create acceptance.

## What Must Not Be Accepted

- This draft as active specification before Agent 6 signs it.
- Source/provenance acceptance from direct/audit agreement alone.
- Publication readiness.
- Future publication path support.
- Page/render acceptance.
- Public/runtime acceptance.
- Old-HUD public use.
- Definition Workbench authority.
- Route publication support.
- Usage-as-definition authority.
- Accepted translation text.

## Requested Agent 6 Disposition

Pass, warn-accept, or block SPEC-002 as a proposed source/provenance custody specification.

If warn-accepted, Agent 6 should state:

- exact effective boundary,
- whether Agent 5 may use SPEC-002 to structure Agent 1 source packets,
- warning limits for provided-list discovery,
- required calibration fixtures,
- required public/rendered label survivability proof,
- what remains blocked.


## Agent 6 Docket

reports/agent6-spec-001-002-governance-verdict-2026-06-01.md


## WARN-Accepted Effective Boundary

WARN-ACCEPTED for specification-control use only. SPEC-001 may structure public/runtime surface, validated-only exposure, quarantine, old-HUD kill-switch, route/index/runtime reachability, and negative-test packets. SPEC-002 may structure source/provenance custody, direct-vs-audit, quarantine, license-count, and label-survivability packets. Neither spec creates public/runtime surface acceptance, source/provenance acceptance, publication readiness, old-HUD public use, broad HUD/Workbench rollout, Definition authority, route publication support, usage-as-definition authority, page/render acceptance, future publication path support, or accepted translation text.

## WARN Limits

- Do not convert WARN to clean PASS.
- Specification-control acceptance only; no product/data gate acceptance.
- SPEC-001 is not public/runtime acceptance, current-HUD broad rollout, or old-HUD public-use acceptance.
- SPEC-002 is not source/provenance acceptance; direct-23/audit-23 remains evidence-ready/awaiting-Agent-6 only.
- All 23 source files remain quarantined until a separate Agent 6 source-scope docket.
- Publication remains blocked_no_render.
- Old HUD remains quarantined_legacy_license_risk.
- Static evidence can support warning-level quarantine conclusions only unless runtime/live reachability evidence is supplied.
- Calibration validates the method, not the product; validation reports request disposition and do not create disposition.
