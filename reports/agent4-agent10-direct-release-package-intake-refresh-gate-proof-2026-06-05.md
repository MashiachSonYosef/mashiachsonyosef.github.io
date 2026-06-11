# Agent 4 Gate Proof: Agent 10 Direct Release Package Intake Refresh

Generated: 2026-06-05T23:59:59.500Z

## result

`target | agent10-direct-release-package-intake-refresh | files below | commands passed: Agent10 direct release/package intake refresh validator and release/package intake matrix validator | counts: 405 inputs checked, 0 missing required inputs, 73 release-relevant rows, 0 new Agent6 handoff candidates, 3 current release boundary rows, old-dictionary 78 rows / 1461 occurrences, workbench source-family 4 release-intake rows / 351 partitions / 105747 source rows, usage 2390 concordance rows / 49 occurrence links / 5581 CC-BY-SA rows / 625 CC-BY rows, zero public/runtime/route/candidate-text/definition/answer/accepted-text/public-reader/release rows | result: release-intake refresh validates and opens no new Agent6 route by itself | blocker if any: existing boundary rows remain awaiting Agent2 package or Agent6 verdicts as listed in the refresh artifact | next handoff: Agent10 owns release/package intake; Agent4 only preserves validator evidence | stop condition: do not rerun unless refresh artifact, intake matrix, or validators change`

## files

| Path | Role | SHA-256 |
| --- | --- | --- |
| `reports/agent10-direct-release-package-intake-refresh-2026-06-05.json` | Changed package/input | `113bd5fe5f88f24dd75dd260417c1ce7beaacb0eec3a8d307552038119a96b6a` |
| `reports/spark10-release-package-intake-matrix-current-2026-06-04.json` | Release/package intake matrix | `d43510238e05b05a90177bc425a7296bbadb46ee6e17ad1a6f21a01de3eab81d` |
| `scripts/validate_agent10_direct_release_package_intake_refresh.mjs` | Refresh validator | `96022f6a412796169da49e24166c47b4f0df3881ee6cc39f65538b5e2ce962bd` |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent10_direct_release_package_intake_refresh.mjs reports\agent10-direct-release-package-intake-refresh-2026-06-05.json` | Passed. Inputs 405; release rows 73; Agent6 candidates 0. |
| `node scripts\validate_spark10_release_package_intake.mjs reports\spark10-release-package-intake-matrix-current-2026-06-04.json` | Passed. |

## counts

| Metric | Count |
| --- | ---: |
| Inputs checked | 405 |
| Missing required inputs | 0 |
| Release-relevant rows | 73 |
| New Agent 6 handoff candidates | 0 |
| Current release boundary rows | 3 |
| Old-dictionary candidate-use rows / occurrences | 78 / 1,461 |
| Workbench source-family release-intake rows | 4 |
| Workbench source-name partitions / source rows | 351 / 105,747 |
| Usage concordance rows / occurrence links | 2,390 / 49 |
| CC-BY-SA / CC-BY source rows | 5,581 / 625 |
| Public/runtime/route/candidate-text/definition/answer/accepted-text/public-reader/release rows | 0 |

## blocker

`existing_boundary_rows_remain_awaiting_agent2_package_or_agent6_verdicts_no_new_agent6_handoff_candidate`

The refresh validates, but it does not open a new Agent 6 route by itself.

## next handoff

Agent 10 owns release/package intake. Agent 4 only preserves validator evidence.

## stop condition

Do not rerun unless one of these changes:

- `reports/agent10-direct-release-package-intake-refresh-2026-06-05.json`
- `reports/spark10-release-package-intake-matrix-current-2026-06-04.json`
- `scripts/validate_agent10_direct_release_package_intake_refresh.mjs`
- `scripts/validate_spark10_release_package_intake.mjs`
