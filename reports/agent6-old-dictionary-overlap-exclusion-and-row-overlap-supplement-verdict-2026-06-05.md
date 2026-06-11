# Agent 6 Verdict: Old-Dictionary Overlap/Exclusion Planning Evidence

Date: 2026-06-05

Disposition: WARN-ACCEPTED for non-public planning evidence only.

Reviewed artifacts:
- `reports/agent10-agent6-ready-old-dictionary-commercial-nc-overlap-exclusion-boundary-packet-2026-06-05.json`
- `reports/agent1-old-dictionary-commercial-nc-overlap-exclusion-manifest-2026-06-05.json`
- `reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-2026-06-05.json`
- `reports/agent1-old-dictionary-row-overlap-agent6-boundary-supplement-validation-result-2026-06-05.json`

## Verdict A: Commercial+NC Overlap Exclusion Packet

WARN-ACCEPTED as non-public overlap/exclusion planning evidence only for 197 commercial+NC overlap rows / 4185 occurrences.

Recounted scope:
- Audited scope: 500 rows / 8427 occurrences.
- Commercial+NC overlap: 197 rows / 4185 occurrences.
- Commercial+NC without BDB Augmented Strong: 57 rows / 818 occurrences.
- Commercial+NC with BDB Augmented Strong: 140 rows / 3367 occurrences.
- Klein-only excluded: 17 rows / 259 occurrences.
- Pairwise Klein intersections: 4.
- Exact Klein combinations: 7.

Warnings:
- Lane counts are overlap/presence counts, not additive export rows.
- The 197 overlap rows remain NC-bearing rows; Klein evidence is not commercially authorized.
- The 140 triple-overlap rows retain the BDB Augmented Strong blocked/review posture.
- This docket does not select commercial-clean evidence over NC evidence, does not approve NC educational use, and does not approve BDB Augmented Strong exclusion.

## Verdict B: Row-Overlap Boundary Supplement

WARN-ACCEPTED as non-public row-overlap planning evidence only.

Recounted scope:
- Boundary records: 8 total, 6 nonzero, 2 zero-row records.
- Represented scope: 500 rows / 8427 occurrences.
- `commercial_clean_only`: 18 rows / 494 occurrences.
- `commercial_clean_plus_noncommercial_educational`: 57 rows / 818 occurrences.
- `commercial_clean_plus_blocked_review`: 82 rows / 1068 occurrences.
- `commercial_clean_plus_noncommercial_educational_plus_blocked_review`: 140 rows / 3367 occurrences.
- `noncommercial_educational_only`: 17 rows / 259 occurrences.
- `no_sefaria_source_hit`: 186 rows / 2421 occurrences.
- `metadata_or_link_only` and `blocked_review_only`: zero-row records.

Validation reviewed:
- Supplement validation result reports `ok=true`.
- All zero-output counters reviewed in the packet and supplement remained zero.

## Effective Boundary

These artifacts may be carried only as non-public planning evidence for later exact Agent 6 boundary questions.

Still blocked / not accepted:
- QA acceptance beyond this docket.
- Source/provenance, source/license, or legal acceptance.
- Source-family selection acceptance.
- Commercial-clean selection.
- NC educational selection.
- BDB Augmented Strong exclusion acceptance.
- Candidate use, transform, source-row emission, candidate text export, definition-content storage, answer eligibility, public/runtime mutation, route-shard write, commercial export, NC commercial authorization, or release action.
- Definition authority, usage-as-definition authority, accepted gloss/text, public reader output, route publication support, publication readiness, or product/data acceptance.

Next required boundary before any use:
- Agent 10 or Agent 2 must return an exact row/subset package with queue IDs, intended use, source-family selection/exclusion rule, morphology status where relevant, and zero-output counters.
- NC-bearing rows require an explicit NC separation/no-commercial-authorization boundary.
- BDB Augmented Strong overlap rows require explicit custody resolution or exclusion proof before any candidate-use request.
