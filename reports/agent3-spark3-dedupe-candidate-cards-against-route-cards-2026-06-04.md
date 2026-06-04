# Agent 3 / Spark-3 Dedupe Candidate Cards Against Route Cards - 2026-06-04

Status: evidence-ready_with_exact_linkage_blockers.

Lane: Agent 3 broad linkage/dedupe/navigation evidence only.

Workset: `dedupe_candidate_cards_against_route_cards`.

Boundary: no usage-as-definition authority, QA/source/provenance/license/Definition/runtime/publication/product/answer acceptance, accepted gloss/text, route publication support, or public/runtime mutation.

## Inputs

- Agent 3 package: `reports/agent3-broad-linkage-dedupe-navigation-package-2026-06-04.md`
- Spark10 matrix: `reports/spark10-orot-169-row-local-route-card-dedupe-source-route-matrix-2026-06-04.json`
- Source no-hit packet: `reports/agent10-orot-186-row-nohit-inventory-packet-2026-06-04.json`
- Package anchor: `data/build/orot/reader-hint-placeholder-candidates.json`
- Spark-3 return: `reports/spark3-broad-linkage-dedupe-navigation-2026-06-04-report.md`

## Counts

- Rows: 169.
- Occurrences: 2148.
- Unique token IDs: 169.
- Duplicate keys: 169; unique duplicate keys: 169; collision groups: 0.
- Rows with route-card count evidence: 169.
- Rows with candidate-card count evidence: 169.
- Rows with ambiguity-card count evidence: 73.
- Route-card count total: 7476.
- Candidate-card count total: 559.
- Ambiguity-card count total: 203.
- Package-anchor matched rows: 1 / occurrences 31.
- Exact blocker rows: 168 / occurrences 2117.
- Detailed card payload rows: 0; schema-blocked rows: 169.

## Duplicate Key Formula

`token_id|route:<current_route_card_count>|candidate:<current_candidate_count>|ambiguity:<current_ambiguity_count>`

All 169 duplicate keys are unique in this matrix; no row-level duplicate-key collision group was found.

## Evidence Scope

Matched route/card evidence is count-level only from the existing Spark10 matrix and Agent10 no-hit packet. The referenced package and matrix do not expose detailed route/candidate/ambiguity card payload arrays or card IDs, so this artifact does not invent card-level matches.

## Exact Blockers

- `missing_package_anchor_evidence`: 168 rows / 2117 occurrences.
- `missing_route_candidate_ambiguity_card_payload_schema`: 169 rows at detailed payload level; count-level review still completed.

## Gates

- matrix_rows: passed; rows 169/169.
- matrix_occurrences: passed; occurrences 2148/2148.
- unique_token_ids: passed; unique token ids 169/169.
- duplicate_keys_unique: passed; collision groups 0.
- count_level_card_evidence_present: passed; route/candidate count evidence rows 169/169.
- package_anchor_blockers_preserved: passed; blocker rows 168/168.
- authority_zero_gate: passed; public/runtime/answer/definition/accepted-text/source mutation counters are zero.

## Stop Condition

Stop after 169-row dedupe_candidate_cards_against_route_cards review artifact with duplicate keys, count-level route/card evidence, package-anchor evidence, and exact blockers. No broad discovery or mutation.

## Remaining Blocked

- 168 rows / 2117 occurrences still lack package-anchor evidence and remain exact blockers.
- Detailed route/candidate/ambiguity card payload matching remains blocked because the referenced matrix and source packet expose counts, not per-card payload arrays or card IDs.
- No route publication support is available from this packet.
