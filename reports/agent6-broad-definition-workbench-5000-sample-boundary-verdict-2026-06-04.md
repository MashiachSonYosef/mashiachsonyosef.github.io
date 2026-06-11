# Agent 6 Broad Definition Workbench 5000 Sample Boundary Verdict - 2026-06-04

## Disposition

WARN-ACCEPTED for exact non-public route-shape / reader-planning evidence only.

The exact 5000-row Definition Workbench sample may be carried as non-authoritative route-shape and reader-planning evidence only. This verdict does not authorize candidate text consumption, candidate text export, Definition authority, usage-as-definition authority, answer acceptance, answer eligibility, source/provenance acceptance, license/legal acceptance, route publication support, public/runtime acceptance, public/runtime mutation, publication readiness, accepted text, public reader output, commercial export permission, NC commercial authorization, release action, or definition-content storage.

## Evidence Reviewed

- `reports/agent10-agent6-ready-broad-definition-workbench-5000-sample-boundary-packet-2026-06-04.md`
- `reports/agent10-agent6-ready-broad-definition-workbench-5000-sample-boundary-packet-2026-06-04.json`
- `reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.md`
- `reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json`
- `.local-cache/workbench-evidence/token-inventory-5000.json`
- `reports/workbench-token-inventory-5000.md`
- `data/definitions/definition-workbench-sample-5000.json`
- `reports/definition-workbench-sample-5000-report.md`
- Prior 1000-row handoff refresh verdict: `reports/agent6-agent2-weekly-lexicon-handoff-refresh-verdict-2026-06-04.md`
- Agent 10 1000-row handoff refresh consumption: `reports/agent10-agent6-agent2-weekly-lexicon-handoff-refresh-verdict-consumption-2026-06-04.json`

## Validation Observed

Agent 6 ran the cited validators and scoped diff check:

- `node scripts/validate_agent2_future_workset_intake_packet.mjs reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json`
- `node scripts/validate_workbench_token_inventory.mjs .local-cache/workbench-evidence/token-inventory-5000.json`
- `node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-5000.json`
- `node scripts/validate_spark10_release_package_intake.mjs reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- `git diff --check -- reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.md reports/agent10-agent2-ready-broad-workbench-token-inventory-5000-workset-2026-06-04.json data/definitions/definition-workbench-sample-5000.json reports/definition-workbench-sample-5000-report.md reports/workbench-token-inventory-5000.md reports/agent10-agent6-ready-broad-definition-workbench-5000-sample-boundary-packet-2026-06-04.md reports/agent10-agent6-ready-broad-definition-workbench-5000-sample-boundary-packet-2026-06-04.json`

Observed result: all validators passed; scoped diff check passed.

Agent 6 also inspected sample schema and confirmed the sample rows use machine evidence fields such as `route_card_count`, `answer_card_count`, `answer_card_ids`, `status`, and `review_status`. These are evidence identifiers/counts only and are not answer acceptance or Definition authority.

## Accepted Planning Boundary

The following may be carried as non-public planning evidence only:

- Inventory basis: `.local-cache/workbench-evidence/token-inventory-5000.json`.
- Inventory top token rows: `5000`.
- Inventory total token occurrences: `75290880`.
- Inventory distinct normalized tokens: `698873`.
- Inventory source files read: `1360`.
- Inventory allowed units: `802869`.
- Inventory blocked units: `0`.
- Definition Workbench sample rows: `5000`.
- Rows with route cards: `4856`.
- Rows without route cards / missing repair targets: `144`.
- Multi-answer warning rows: `725`.
- Rows with complete source/license fields: `4856`.
- Status `conflicting`: `725`.
- Status `missing`: `144`.
- Status `proposed_only`: `2706`.
- Status `single_answer_source_complete`: `1425`.
- Review status `unreviewed_machine_sample`: `5000`.

## Warning Controls

All `5000` rows are unreviewed machine sample rows. No row is accepted as a definition, answer, gloss, translation, source/license ruling, publication support, public reader output, or route-shard write.

`single_answer_source_complete` is a machine route-shape status only. It is not answer eligibility, answer acceptance, accepted text, or Definition authority.

`answer_card_ids`, `answer_card_count`, and `distinct_answer_definition_count` are evidence/card identifiers and counts only. They are not accepted answers and must not be displayed or exported as accepted definition text without a later exact Agent 6 boundary.

`source_license_complete=true` is a completeness indicator only. It is not source/provenance acceptance, license/legal acceptance, public source display clearance, commercial export permission, or publication readiness.

The `725` conflicting rows remain warnings and cannot be collapsed into hidden winners.

The `2706` proposed-only rows remain proposed-only and cannot become accepted definitions, answers, glosses, translations, or public reader output.

The `144` missing rows are repair targets only and do not support output claims.

## Zero-Emission Counters Preserved

The following remain `0`:

- Public HUD rows.
- Route JSONL rows.
- Route shard writes.
- Runtime files changed.
- Source files changed.
- Token-index files changed.
- Lexical payload files changed.
- Definition-content rows.
- NC definition-content rows.
- Answer rows.
- Accepted-text rows.
- Public reader output rows.

## What Must Not Be Accepted

- QA acceptance beyond this exact docket.
- Source/provenance acceptance.
- License or legal acceptance.
- Definition authority.
- Usage-as-definition authority.
- Answer acceptance.
- Answer eligibility.
- Public/runtime acceptance.
- Publication readiness.
- Route publication support.
- Product/data acceptance.
- Translation output.
- Accepted gloss or accepted text.
- Public reader output.
- Route-shard edit.
- Public/runtime mutation.
- Definition-content storage.
- Candidate text consumption.
- Candidate text export.
- Commercial export permission.
- NC commercial authorization.
- Release action.

## Next Allowed Action

Agent 10 / Agent 2 may carry the exact 5000-row Definition Workbench sample as non-public planning evidence and QA targeting context only.

Any changed package that requests candidate text consumption, candidate text export, answer eligibility, definition-content storage, source/license acceptance, route-shard writes, public/runtime behavior, accepted text, public reader output, commercial export, NC public display, NC commercial use, publication support, or release action requires a new exact Agent 6 boundary packet.
