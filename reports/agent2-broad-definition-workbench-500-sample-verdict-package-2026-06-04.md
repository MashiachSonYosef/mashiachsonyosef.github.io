# Agent 2 Broad Definition Workbench 500-Row Verdict Package - 2026-06-04

Status: `packaged_warn_accepted_non_authoritative_reader_planning_evidence`.
Active mode: `BROAD_CORPUS_EXPANSION`.

## Package Shape

| Field | Value |
| --- | --- |
| lane | Agent 2 broad lexical / definition / lemma / reader-hint |
| Spark-2 report | `reports/spark2-broad-definition-workbench-500-sample-refresh-2026-06-04.md` |
| sample artifact | `data/definitions/definition-workbench-sample-500.json` |
| sample report | `reports/definition-workbench-sample-500-report.md` |
| Agent 6 verdict | `reports/agent6-broad-definition-workbench-500-sample-boundary-verdict-2026-06-04.md` |
| package artifact | `reports/agent2-broad-definition-workbench-500-sample-verdict-package-2026-06-04.md` |

## Agent 6 Disposition

`WARN-ACCEPTED` for the exact 500-row Definition Workbench sample as non-authoritative route-shape / reader-planning evidence only.

Not accepted by this verdict or package:

- Definition authority.
- Answer acceptance or answer eligibility.
- Accepted gloss/text.
- Public reader output.
- Route publication support.
- Route-shard edit.
- Public/runtime mutation.
- Source/provenance/license acceptance.
- Product/data acceptance.
- Publication readiness.

## Counts Preserved

- Rows: 500.
- Rows with route cards: 498.
- Rows without route cards: 2.
- Rows with complete source/license rows: 498.
- Multi-answer rows: 183.
- `usage_link_count` null / not joined rows: 500.

Status counts:

- `conflicting`: 183.
- `proposed_only`: 148.
- `missing`: 2.
- `single_answer_source_complete`: 167.

Review status counts:

- `unreviewed_machine_sample`: 500.
- `verified`: 0.

Zero authority / output counts:

- `answer_eligible=true` rows: 0.
- Accepted rows: 0.
- Public reader rows: 0.
- Route-shard edits: 0.
- Public/runtime mutations: 0.

## Warning Controls Preserved

- `single_answer_source_complete` is machine route-shape status only; the 167 rows are not accepted definitions or answers.
- `answer_card_ids`, `answer_card_count`, and `distinct_answer_definition_count` are evidence/card identifiers and counts only.
- `source_license_complete=true` is a completeness indicator only; it is not source/provenance or license acceptance.
- The 183 `conflicting` / `multi_answer=true` rows remain warnings and cannot be collapsed into hidden winners.
- The 148 `proposed_only` rows remain proposed-only.
- The 2 `missing` rows are repair targets only and cannot be counted as route-supported definitions.

## Missing Repair Targets

The two missing rows preserved by Agent 6 are:

| token_key | normalized_form | disposition |
| --- | --- | --- |
| `he:×”×ª×•×¡` | `×”×ª×•×¡` | missing planning row only |
| `he:×‘×¡×™` | `×‘×¡×™` | missing planning row only |

## Validators / Gates

Local validator:

`node scripts/validate_definition_workbench_sample.mjs data/definitions/definition-workbench-sample-500.json`

Result:

`Definition Workbench sample validation passed. Rows: 500.`

Local diff check:

`git diff --check -- data/definitions/definition-workbench-sample-500.json reports/definition-workbench-sample-500-report.md reports/agent6-broad-definition-workbench-500-sample-boundary-verdict-2026-06-04.md`

Result: pass, no whitespace errors reported.

## Stop Condition

Stop after this compact Agent 2 package because the 500-row sample and Agent 6 verdict have been consumed and packaged. Any future UI, public lookup, answer, route-publication, definition-content use, route-shard edit, or public/runtime mutation requires a separate Agent 6 boundary packet.

## Boundary

This is non-authoritative route-shape / reader-planning evidence only. It creates no Definition authority, answer acceptance, answer eligibility, accepted gloss/text, public reader output, route publication support, route-shard edit, public/runtime mutation, source/provenance/license acceptance, product/data acceptance, or publication readiness.
