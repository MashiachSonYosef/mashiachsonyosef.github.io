# Agent 4 Gate Proof: Agent 1 Old-Dictionary Row-Overlap Lane Boundary

Generated: 2026-06-05T23:59:58Z

## result

`target | agent1-old-dictionary-row-overlap-lane-boundary | files below | commands passed: Agent1 row-overlap lane boundary validator | counts: 500 audited rows, 8427 audited occurrences, 297 commercial-clean evidence rows, 214 NC educational evidence rows, 222 blocked/review evidence rows, 279 multi-lane overlap rows, 5253 multi-lane overlap occurrences, 18 public-domain-only unique rows, 17 Klein-only unique rows, 0 BDB Augmented Strong-only unique rows, 4 exact blockers, zero transform/candidate/answer/definition/source/public/route/delivery/queue/render/staging rows | result: overlap boundary validates and prevents reuse of source-family hit totals as exclusive row/export counts | blocker if any: downstream transform/export still requires exact Agent6 row/subset boundary and source-lane custody disposition | next handoff: Agent2/Agent10 consume row-overlap counts as source-lane prerequisite evidence only | stop condition: do not rerun unless boundary artifact, validation result, or validator changes`

## files

| Path | Role | SHA-256 |
| --- | --- | --- |
| `reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json` | Changed package/input | `bbb80f993b1a819ac426fdeabd15e32e6002368527fdf8ce958aa9da6680b76b` |
| `reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json` | Existing validation result | `5f4e16ae8761028ab37d6b746c0c4e402ec681175694b6bf895e6d1bce981e8f` |
| `scripts/validate_agent1_old_dictionary_row_overlap_lane_boundary.mjs` | Validator | `09c7f64a099a986bb9f160087f980f96c880bae9caa71ea85fa8b13550f83d32` |

## command

| Command | Result |
| --- | --- |
| `node scripts\validate_agent1_old_dictionary_row_overlap_lane_boundary.mjs reports\agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json` | Passed. Audited rows 500; multi-lane overlap rows 279; exact blockers 4. |

## counts

| Metric | Count |
| --- | ---: |
| Audited rows / occurrences | 500 / 8,427 |
| Commercial-clean evidence rows / occurrences | 297 / 5,747 |
| NC educational evidence rows / occurrences | 214 / 4,444 |
| Blocked/review evidence rows / occurrences | 222 / 4,435 |
| No Sefaria source-hit rows / occurrences | 186 / 2,421 |
| Public-domain-only unique rows | 18 |
| Klein-only unique rows | 17 |
| BDB Augmented Strong-only unique rows | 0 |
| Multi-lane overlap rows / occurrences | 279 / 5,253 |
| Exact blockers | 4 |
| Transform / candidate / answer / definition rows now | 0 / 0 / 0 / 0 |
| Source/public/route rows now | 0 / 0 / 0 |
| Agent 6 delivery / queue / render / staging mutations | 0 / 0 / 0 / 0 |

## blocker

`downstream_transform_export_requires_exact_agent6_row_subset_boundary_and_source_lane_custody_disposition`

This packet is prerequisite evidence only. It prevents downstream lanes from treating overlapping source-family hit totals as exclusive row or export counts.

## next handoff

Agent 2 and Agent 10 may consume row-overlap counts as source-lane prerequisite evidence only. No transform, export, public/runtime, route, accepted text, or release action is authorized.

## stop condition

Do not rerun unless one of these changes:

- `reports/agent1-old-dictionary-row-overlap-lane-boundary-2026-06-05.json`
- `reports/agent1-old-dictionary-row-overlap-lane-boundary-validation-result-2026-06-05.json`
- `scripts/validate_agent1_old_dictionary_row_overlap_lane_boundary.mjs`
