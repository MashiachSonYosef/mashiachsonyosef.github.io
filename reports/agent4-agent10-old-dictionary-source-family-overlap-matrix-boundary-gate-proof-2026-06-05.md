# Agent 4 Source-Family Overlap Matrix Boundary Gate Proof

`target | files | commands | counts | result | blocker if any | next handoff | stop condition`

`agent10-old-dictionary-source-family-overlap-matrix-boundary | files: Agent1 membership manifest, Agent1 overlap matrix, Agent10 Agent6-ready boundary packet, Agent2 overlap receipt | commands passed: Agent1 membership manifest validator, Agent1 overlap matrix validator, Agent10 source-family overlap boundary packet validator, Agent2 overlap receipt validator | counts: 5 source families, 936 nonexclusive membership rows, 19819 nonexclusive membership occurrences, 500 unique preview rows, 8427 unique preview occurrences, family rows Jastrow 210 / BDB Dictionary 221 / BDB Aramaic 69 / Klein 214 / BDB Augmented Strong 222, 10 pairwise intersections, 13 exact family combinations, 500 exact combination rows, 8427 exact combination occurrences, 252 commercial-internal pair rows, 362 commercial-with-NC pair rows, 425 commercial-with-blocked pair rows, 140 NC-with-blocked pair rows, zero delivered/transform/candidate-text/definition/source/public/route/runtime/queue/render/staging/release rows | result: source-family membership and overlap evidence validates as nonpublic planning evidence only | blocker if any: future_agent6_source_family_overlap_matrix_boundary_required_before_source_family_selection_candidate_use_transform_definition_answer_route_runtime_export_or_release | next handoff: Agent10 may route the exact source-family overlap matrix boundary packet to Agent6; Agent4 does not self-accept or deliver | stop condition: do not rerun unless membership manifest, overlap matrix, Agent10 boundary packet, Agent2 receipt, or validators change`

## Files

- `reports/agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json`
- `reports/agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`
- `reports/agent10-agent6-ready-old-dictionary-source-family-overlap-matrix-boundary-packet-2026-06-05.json`
- `reports/agent2-source-family-membership-overlap-receipt-2026-06-05.json`

## Commands

- `node scripts\validate_agent1_old_dictionary_source_family_membership_manifest.mjs reports\agent1-old-dictionary-source-family-membership-manifest-2026-06-05.json`
- `node scripts\validate_agent1_old_dictionary_source_family_overlap_matrix.mjs reports\agent1-old-dictionary-source-family-overlap-matrix-2026-06-05.json`
- `node scripts\validate_agent10_old_dictionary_source_family_overlap_matrix_boundary_packet.mjs reports\agent10-agent6-ready-old-dictionary-source-family-overlap-matrix-boundary-packet-2026-06-05.json`
- `node scripts\validate_agent2_source_family_membership_overlap_receipt.mjs reports\agent2-source-family-membership-overlap-receipt-2026-06-05.json`

All four commands passed.

## Boundary

This packet is validator/prereq evidence only. It makes no QA, public/runtime, source/provenance/license/legal, Definition, answer, publication, route publication, product/data, release, accepted gloss, or accepted translation-text acceptance claim.
