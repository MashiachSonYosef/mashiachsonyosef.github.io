# Agent 10 Consumption - Agent 6 Old-Dictionary Exact Row-Subset Manifest Verdict

Generated: 2026-06-05T17:45:00.000Z

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`.

## Verdict Consumed

- Agent 6 verdict: `reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.md`
- Agent 6 verdict JSON: `reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json`
- Agent 10 packet: `reports/agent10-agent6-ready-old-dictionary-exact-row-subset-manifest-boundary-packet-2026-06-05.md`
- Agent 1 manifest: `reports/agent1-old-dictionary-exact-row-subset-manifest-2026-06-05.json`

Disposition: `WARN-ACCEPTED` for non-public source-lane / row-subset planning evidence only.

## Release/Package State

| package/workset | inputs consumed | row/occurrence counts | lane split | Agent 6 boundary question | exact blocker | next handoff | stop condition |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| Old-dictionary exact row-subset manifest | Agent 6 verdict; Agent 10 packet; Agent 1 manifest | `500` rows / `8427` occurrences / `8` subsets | non-exclusive lane presence: commercial-clean `297`; NC educational `214`; blocked/review `408`; metadata/link-only `0` | returned `WARN-ACCEPTED` for manifest planning evidence only | overlap buckets still require later exact source-family selection boundary; candidate-use/transform/export/answer/public/release remain blocked | Agent 10 may carry manifest for future non-public package assembly planning only | Stop before transform, candidate-use, candidate text, definition-content storage, answer eligibility, source row emission, route write, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action |

## Subset Dispositions

| bucket | rows | occurrences | disposition | blocker preserved |
| --- | ---: | ---: | --- | --- |
| `commercial_clean_only` | 18 | 494 | `warn_accepted_manifest_planning_evidence_only` | `commercial_clean_only_missing_future_agent6_candidate_use_boundary_and_morphology_relation` |
| `commercial_clean_plus_noncommercial_educational` | 57 | 818 | `warn_accepted_manifest_planning_evidence_only` | `commercial_clean_plus_nc_overlap_missing_agent6_source_family_selection_boundary` |
| `commercial_clean_plus_blocked_review` | 82 | 1068 | `warn_accepted_manifest_planning_evidence_only` | `commercial_clean_plus_blocked_overlap_missing_agent6_source_family_selection_boundary` |
| `commercial_clean_plus_noncommercial_educational_plus_blocked_review` | 140 | 3367 | `warn_accepted_manifest_planning_evidence_only` | `triple_overlap_missing_agent6_source_family_selection_boundary` |
| `noncommercial_educational_only` | 17 | 259 | `warn_accepted_manifest_planning_evidence_only` | `nc_educational_only_missing_agent6_nc_boundary_no_commercial_authorization` |
| `blocked_review_only` | 0 | 0 | `warn_accepted_empty_manifest_bucket_only` | `blocked_review_only_zero_rows_no_current_boundary_delivery` |
| `metadata_or_link_only` | 0 | 0 | `warn_accepted_empty_manifest_bucket_only` | `metadata_or_link_only_zero_rows_no_current_boundary_delivery` |
| `no_sefaria_source_hit` | 186 | 2421 | `warn_accepted_blocked_manifest_planning_bucket_only` | `no_sefaria_source_hit_missing_source_license_custody_evidence` |

## Boundary

Agent 10 may carry the exact manifest for future non-public package assembly planning only. This does not authorize source/provenance acceptance, license/legal acceptance, source-family selection, candidate-use clearance, transform, candidate text, definition-content storage, answer eligibility, source row emission, route write, public/runtime mutation, commercial export, NC commercial use, publication readiness, or release action.

