# Agent 10 Old-Dictionary Lane Verdict Consumption - 2026-06-04

Status: `agent10_consumed_agent6_old_dictionary_license_lane_planning_verdict`

Consumed verdict: `reports/agent6-old-dictionary-license-lane-planning-verdict-2026-06-04.md`

Disposition preserved: `WARN-ACCEPTED` for non-public old-dictionary source-family/license-lane planning evidence and supplemental lane-partition planning evidence only.

## Counts

| Scope | Rows | Occurrences |
| --- | ---: | ---: |
| Audited old-dictionary rows | `500` | `8427` |
| Public-domain-observed rows | `297` | `5747` |
| Blocked/non-public-domain/unresolved rows | `17` | `259` |
| No-Sefaria-hit rows | `186` | `2421` |
| Next missed rows | `50` | `1193` |

## Lane Evidence

| Source family | Lane | Rows | Occurrences | Release-owner read |
| --- | --- | ---: | ---: | --- |
| Jastrow Dictionary | `commercial_clean_candidate` | `210` | `4474` | Planning evidence only. |
| BDB Dictionary | `commercial_clean_candidate` | `221` | `4418` | Planning evidence only. |
| BDB Aramaic Dictionary | `commercial_clean_candidate` | `69` | `2048` | Planning evidence only. |
| Klein Dictionary | `noncommercial_educational_candidate` | `214` | `4444` | Separate NC educational lane only; preserve NC flags. |
| BDB Augmented Strong | `blocked_or_needs_review` | `222` | `4435` | Blocked/review-only. |

Supplemental partition counts are source-family partition rows, not unique cleared candidate rows: commercial-clean `3` families / `500` rows / `10940` occurrences; NC educational `1` / `214` / `4444`; metadata/link-only `0`; blocked/review `1` / `222` / `4435`.

## Release State

Resolved only for non-public planning intake: `missing_agent1_old_dictionary_excluded_row_license_lane_assignment`.

Still blocked: candidate text consumption/export, source/provenance acceptance, license/legal acceptance, Definition authority, answer eligibility, public/runtime mutation, route-shard writes, publication readiness, accepted text, commercial export, NC commercial use, and definition-content storage.

Next action: carry this evidence as planning context only. Prepare a new exact Agent 6 packet only for a changed package requesting stronger use.

Zero counters preserved: answer rows `0`; public HUD rows `0`; route JSONL rows `0`; route shard writes `0`; runtime/source/token-index/lexical mutations `0`; definition-content rows `0`; NC definition-content rows `0`; accepted-text rows `0`; public reader output rows `0`.

## Boundary

No QA/source/provenance/license/legal/Definition/runtime/publication/product/answer acceptance, no accepted gloss/text, no public reader output, no route-shard edit, no public/runtime mutation, no definition-content storage, no candidate-text export, no commercial export permission, and no NC commercial authorization.
