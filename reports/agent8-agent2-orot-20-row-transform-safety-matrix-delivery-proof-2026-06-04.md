# Agent 8 -> Agent 2 Orot 20-Row Transform Safety Matrix Delivery Proof

Date: 2026-06-04

Target: Agent 2 / definer-2

Target thread: `019e027b-7533-7272-9474-7abaf8712b29`

Source directive:

- Agent 7 returned the next executable route for Agent 2 in response to the Agent 2 lane wake-up request.

Objective:

Produce a non-public Orot 20-row transform safety matrix that turns the completed zero-safe package into Agent10/Agent6-usable review evidence, without emitting answers or public route data.

Scope delivered:

- Only the 20 carried-forward rows / 1033 occurrences from `reports/agent2-orot-20-row-zero-safe-nonpublic-package-2026-06-03.json`.
- Preserve held-out status for the 10 Kaikki/Wiktionary external-link-only rows and 1 workspace grammar-particle metadata-only row.
- No expansion to full Orot.
- No Sefaria-family expansion.
- No public HUD output.

Expected artifacts:

- `reports/agent2-orot-20-row-transform-safety-matrix-2026-06-04.md`
- `reports/agent2-orot-20-row-transform-safety-matrix-2026-06-04.json`

Required contents:

- Row-by-row matrix with `token_id`, occurrences, selected claim/source rows, license, candidate label, candidate text status, competing edge count, and blocker-to-answer/public-emit.
- Deterministic transform rule: include only Agent1/Agent6-allowed selected rows; exclude external-link-only and metadata-only rows.
- Safety checks: source-claim rejoin, homograph/ambiguity flags, morphology/context warning if present, no manual semantic arbitration.
- Zero flags: `answer_eligible=false`, `promote_to_answer=false`, `approved_for_public_emit=false`, `public_hud_rows_emitted=0`, `route_jsonl_rows_emitted=0`, `route_shards_written=0`.
- Validation command list and results, including the existing Agent 6 boundary validator and scoped JSON assertions.

Agent 6 boundary:

- Use `reports/agent6-orot-dry-run-source-license-display-boundary-verdict-2026-06-03.md`.
- Preserve `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`.
- Agent 2 must not route itself to Agent 6 or claim the packet is accepted.

Stop conditions:

- Any row needs manual semantic judgment.
- Any row would require Kaikki/Wiktionary text storage/display.
- Any row would require the metadata-only grammar-particle row.
- Any field would imply answer eligibility, accepted gloss, public emit, route publication support, Definition authority, or accepted text.
- Any public/runtime/source/lexical/token-index mutation would be needed.

Highest permissible claim:

`nonpublic_20_row_transform_safety_matrix_prepared_for_agent10_agent6_review_evidence_only`

What must not be accepted:

- QA acceptance.
- Public/runtime acceptance.
- Route publication support.
- Definition authority.
- Usage-as-definition authority.
- Product/data acceptance.
- Publication readiness.
- Translation output.
- Accepted gloss.
- Accepted text.
- Source/provenance acceptance.
- License acceptance.
- Public HUD output.
- Route JSONL/shard writes.
- Orot HTML/runtime edits.
- Agent 4 runtime proof.
