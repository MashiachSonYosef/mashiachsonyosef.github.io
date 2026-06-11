# Agent 1 Old Dictionary License-Lane Export Partitions - 2026-06-04

Status: `agent1_old_dictionary_license_lane_export_partitions_prepared_for_agent6_boundary_only`.
Source artifact: `reports/agent1-old-dictionary-excluded-row-license-lane-reaudit-2026-06-04.json`.

## Partition Counts

Counts below are source-family hit totals, not mutually exclusive export row totals. The same token row may appear in multiple source-family partitions; no candidate text/export/public use is authorized here.

| lane | source families | row count | occurrence count | source families |
| --- | ---: | ---: | ---: | --- |
| commercial_clean_candidate | 3 | 500 | 10940 | Jastrow Dictionary; BDB Dictionary; BDB Aramaic Dictionary |
| noncommercial_educational_candidate | 1 | 214 | 4444 | Klein Dictionary |
| metadata_or_link_only | 0 | 0 | 0 | none |
| blocked_or_needs_review | 1 | 222 | 4435 | BDB Augmented Strong |

## Export Rules

- commercial-clean partition excludes NC rows
- NC educational partition is separate and has `commercial_export_allowed=false`
- metadata/link-only partition emits citation/link only and no definition text
- blocked/review partition emits no candidate text
- all partitions remain `answer_eligible=false` and `public_emit=false` until exact boundary changes

## Boundary

This is source/license/custody partition evidence only. It does not accept source/license/legal posture, QA, Definition authority, answer output, public/runtime behavior, publication readiness, product/data status, accepted gloss/text, or NC commercial authorization.
