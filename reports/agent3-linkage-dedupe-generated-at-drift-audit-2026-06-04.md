# Agent 3 Linkage/Dedupe Generated-At Drift Audit - 2026-06-04

## Status

- Artifact: `reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json`
- Status: `generated_at_drift_only_no_new_workset`
- Publication state: `blocked_no_render`
- Audited files: `2`
- Generated-at-only files: `2`
- Substantive changed files: `0`
- Source files committed by this package: `0`

## Result

No substantive linkage/dedupe/navigation change detected; modified source artifacts are generated_at churn only.

## Audited Artifacts

| Role | Rows | Occurrences | Blocker rows | Changed fields | Substantive fields |
| --- | ---: | ---: | ---: | --- | --- |
| orot_169_row_route_card_candidate_card_dedupe_review | 169 | 2148 | 168 | generated_at | none |
| deuteronomy_phase2_linkage_dedupe_source_route_matrix | 8113 | 12595 | 6779 | generated_at | none |

## Boundary

This is an observer audit only. It does not commit the regenerated source artifacts, create an executable workset, authorize route publication, create Definition authority, select answers, accept source/provenance/license claims, mutate runtime/public/source/token-index/lexical files, or produce accepted text.

## Remaining Blockers

- The regenerated Orot and Deuteronomy source artifacts are not committed by this package.
- No new executable Agent 3 workset exists from generated_at-only drift.
- All publication, Definition authority, answer, runtime, source, token-index, lexical payload, and accepted-text paths remain blocked.

## Validation

- `node scripts/validate_agent3_linkage_dedupe_generated_at_drift_audit.mjs`
- `git diff --check -- reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.json reports/agent3-linkage-dedupe-generated-at-drift-audit-2026-06-04.md scripts/build_agent3_linkage_dedupe_generated_at_drift_audit.mjs scripts/validate_agent3_linkage_dedupe_generated_at_drift_audit.mjs reports/agent3-state.md`
