# Agent 6 Verdict: Old-Dictionary 78-Row Candidate-Use Preboundary Matrix

Date: 2026-06-06

Disposition: WARN-ACCEPTED for non-public candidate-use preboundary review matrix only.

Reviewed artifacts:
- `reports/agent10-agent6-ready-old-dictionary-78-row-candidate-use-preboundary-packet-2026-06-06.json`
- `reports/agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json`

Validator run:
- `node scripts\validate_agent10_old_dictionary_78_row_candidate_use_preboundary_matrix.mjs reports\agent10-old-dictionary-78-row-candidate-use-preboundary-matrix-2026-06-06.json`

Validator result:
- Passed.
- Rows: 78.
- Occurrences: 1461.

## Recounted Scope

- Rows: 78.
- Occurrences: 1461.
- Unique queue IDs: 78.
- Source/license lane: `commercial_clean_candidate`.
- Relation class: `exact_after_mark_strip` for all 78 rows.
- Morphology relation status: `agent2_morphology_relation_approved_for_nonpublic_planning` for all 78 rows.
- Candidate text rows: 0.
- Definition / lemma / reader-hint candidate rows: 0.
- Answer eligible rows: 0.
- Public emit rows: 0.
- Route writes: 0.
- Accepted text rows: 0.
- Public/runtime mutation: 0.
- Release actions: 0.

## Warning

The matrix includes review metadata fields such as `surface`, `normalized`, `public_domain_headwords`, and `public_domain_rids` on the 78 rows. These fields are accepted only as non-public review pointers inside this preboundary matrix. They are not candidate text, source text emission, definition text, lemma text, reader-hint text, answer text, accepted gloss/text, public reader output, source/license/legal acceptance, or export clearance.

## Effective Boundary

The exact 78-row / 1461-occurrence commercial-clean subset may be carried from non-public morphology planning evidence into a non-public candidate-use preboundary review matrix only.

This docket does not authorize candidate text emission, definition/lemma/reader-hint content storage, answer eligibility, public emit, route writes, accepted text, export behavior, public/runtime mutation, publication readiness, or release action.

## Not Accepted

- QA acceptance beyond this exact docket.
- Source/provenance acceptance.
- Source/license/legal acceptance.
- Definition authority or usage-as-definition authority.
- Answer acceptance or answer eligibility.
- Accepted gloss/text.
- Public reader output.
- Route-shard edit.
- Public/runtime mutation.
- Route publication support.
- Publication readiness.
- Product/data acceptance.
- Candidate text export.
- Definition/lemma/reader-hint content storage.
- Commercial export authorization.
- NC commercial authorization.
- Release action.

Next required boundary:
- Any move from preboundary matrix into candidate-use package, candidate text, transform output, content storage, answer eligibility, route write, public/runtime mutation, export, accepted text, or release requires a new exact Agent 6 packet.
