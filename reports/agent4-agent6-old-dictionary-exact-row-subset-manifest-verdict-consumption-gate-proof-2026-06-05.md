# Agent 4 Gate Proof: Agent 6 Old-Dictionary Exact Row-Subset Manifest Verdict Consumption

Generated: 2026-06-05T23:59:59.900Z

## result

`target | agent6-old-dictionary-exact-row-subset-manifest-verdict-consumption | files below | commands passed: Agent6 exact row-subset manifest verdict validator, Agent2 exact row-subset manifest wait receipt validator | counts: 8 subsets, 500 rows, 8427 occurrences, 500 unique token IDs, 500 unique queue IDs, 0 duplicate IDs, 0 hash mismatches, 0 nonzero zero-counters, lane presence rows commercial-clean 297 / NC 214 / blocked-review 408 / metadata 0, zero transform/candidate-text/export/definition/lemma/reader-hint/answer/public/route/runtime/accepted-text/source-license-legal/commercial-export/release rows | result: Agent6 verdict consumed as WARN-ACCEPTED nonpublic row-subset planning evidence only | blocker if any: source-family selection, candidate-use, transform, Definition, answer, public-runtime, publication, commercial export, and NC commercial authorization remain blocked pending later exact Agent6 packet | next handoff: Agent10 may carry manifest for future nonpublic package assembly planning only; Agent2 remains no-output | stop condition: do not rerun unless verdict, wait receipt, or validators change`

## files

| Path | Role | SHA-256 |
| --- | --- | --- |
| `reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json` | Changed verdict/input | `ca3dbff01275c386944849d2a53c89e3f848520d3f95fd0c07a1dd2834bd4b2c` |
| `reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json` | Agent2 wait receipt | `7e712759bd8adbff542cdb4cc1aaf53ebc00ce7721d82f21b8e74be79d173e07` |
| `scripts/validate_agent6_old_dictionary_exact_row_subset_manifest_boundary_verdict.mjs` | Verdict validator | `d9319837ae8fbfc88af71d8ea27512b3f1a219add59f31b3e4d79703a1189474` |
| `scripts/validate_agent2_exact_row_subset_manifest_agent6_wait_receipt.mjs` | Wait receipt validator | `8ff64d29d1e94f9dc41859f563db98606fe505ffbf60c539754b1ab4778fe1c8` |

## commands

| Command | Result |
| --- | --- |
| `node scripts\validate_agent6_old_dictionary_exact_row_subset_manifest_boundary_verdict.mjs reports\agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json` | Passed. Subsets 8; rows 500; occurrences 8,427. |
| `node scripts\validate_agent2_exact_row_subset_manifest_agent6_wait_receipt.mjs reports\agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json` | Passed. Rows 500; subsets 8; transform/text/output rows 0. |

## counts

| Metric | Count |
| --- | ---: |
| Subsets | 8 |
| Rows / occurrences | 500 / 8,427 |
| Token IDs / unique token IDs | 500 / 500 |
| Queue IDs / unique queue IDs | 500 / 500 |
| Duplicate IDs / hash mismatches | 0 / 0 |
| Commercial-clean lane presence rows | 297 |
| NC lane presence rows | 214 |
| Blocked/review lane presence rows | 408 |
| Metadata/link-only lane presence rows | 0 |
| Transform / candidate text / export rows | 0 / 0 / 0 |
| Definition / lemma / reader-hint rows | 0 / 0 / 0 |
| Answer / answer-eligible rows | 0 / 0 |
| Public / route / runtime rows | 0 / 0 / 0 |
| Accepted text / commercial export / release rows | 0 / 0 / 0 |

## blocker

`later_exact_agent6_packet_required_before_source_family_selection_candidate_use_transform_definition_answer_route_runtime_export_or_release`

The verdict permits carrying the exact manifest only as nonpublic package-assembly planning evidence. It does not authorize source-family selection for overlap buckets, candidate use, transform, Definition content, answer eligibility, route writes, public/runtime mutation, commercial export, NC commercial authorization, publication, or release.

## next handoff

Agent 10 may carry the exact manifest for future nonpublic package assembly planning only. Agent 2 remains no-output.

## stop condition

Do not rerun unless one of these changes:

- `reports/agent6-old-dictionary-exact-row-subset-manifest-boundary-verdict-2026-06-05.json`
- `reports/agent2-exact-row-subset-manifest-agent6-wait-receipt-2026-06-05.json`
- `scripts/validate_agent6_old_dictionary_exact_row_subset_manifest_boundary_verdict.mjs`
- `scripts/validate_agent2_exact_row_subset_manifest_agent6_wait_receipt.mjs`
