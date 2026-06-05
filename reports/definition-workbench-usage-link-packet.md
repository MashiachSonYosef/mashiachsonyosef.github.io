# Definition Workbench Usage Link Packet

Generated: 2026-06-01T17:25:44.103Z

## Summary

- Definition Workbench sample rows: 200
- Sample rows with current usage links: 0
- Sample rows without current usage links: 200
- Sample rows with complete source/license flags: 200
- Multi-answer sample rows: 96
- Rows using forbidden verified labels: 0
- Usage token rows: 1
- Usage tokens in sample / not in sample: 0/1
- Usage occurrence rows / selected occurrence rows: 2390/49
- Selected occurrence samples with source/work/context/license/route IDs: 12/12/12/12/12
- Route IDs / unresolved route links: 1/0
- Audit-only ambiguous rows: 2064
- Route concentration warning visible: 1
- Reader-facing rows: 0
- Route payload-like field hits: 0
- Forbidden authority field hits: 0

## Sample Status Counts

- conflicting: 96
- single_answer_source_complete: 55
- proposed_only: 49

## Sample Review Status Counts

- unreviewed_machine_sample: 200

## Checks

| check | status | detail |
|---|---|---|
| sample_rows_present | passed | sample rows 200 |
| usage_tokens_present | passed | usage token rows 1 |
| sample_overlap_visible | warning | sample rows with usage links 0; usage tokens not in sample 1 |
| sample_source_license_complete | passed | complete source/license sample rows 200/200 |
| sample_review_status_not_verified | passed | forbidden verified labels 0 |
| multi_answer_warning_preserved | passed | multi-answer rows 96; conflicting rows 96 |
| selected_usage_occurrences_present | passed | selected usage occurrence rows 49 |
| selected_occurrence_links_complete | passed | source/work links 12/12; samples 12 |
| selected_occurrence_context_license_complete | passed | context/license 12/12; samples 12 |
| route_ids_resolve_without_payloads | passed | route IDs 1; unresolved 0; payload hits 0 |
| ambiguous_rows_audit_only | passed | audit-only ambiguous rows 2064; reader-facing rows 0 |
| route_concentration_warning_preserved | passed | route concentration warning visible 1 |
| forbidden_authority_fields_absent | passed | forbidden authority field hits 0 |

## Usage Tokens

| token | in sample | usage rows | selected rows | source refs | works | route IDs | route concentration |
|---|---|---:|---:|---:|---:|---:|---|
| ראשית | no | 2390 | 49 | 38 | 20 | 1 | warning visible |

## Sample Link Status

| status | rows |
|---|---:|
| linked_current_usage_scope | 0 |
| no_current_usage_scope_overlap | 200 |

## Boundary

Bounded Agent 3 packet joining Definition Workbench planning rows to usage-navigation occurrence rows by token key or normalized form. It carries usage links, source/license/context metadata, and route IDs only; it does not publish source excerpts as definitions, copy route payloads, rank definitions, select visible answers, translate, or make publication claims.

This machine builder never emits review_status=verified. Verified is reserved for future reviewed lexical authority outside this sample contract.

Definition sample boundary status: blocked_no_render
Definition sample clears publication readiness: false
Definition sample reviewed lexical authority: false
Definition sample publication claim: false

Current gap: if sample rows with current usage links is 0, the selected Agent 3 usage token is not part of the current 200-row Definition Workbench sample. This packet should guide the next sample/join step; it is not evidence of broad usage coverage.
