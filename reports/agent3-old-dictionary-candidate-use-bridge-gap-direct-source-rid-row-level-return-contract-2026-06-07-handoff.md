# Agent 3 Row-Level Return Contract Handoff (2026-06-07)

- target: agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return
- source_file: reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-row-level-return-contract-2026-06-06.json
- target_rows: 3
- target_occurrences: 42
- state_evidence: 205/205
- state_validators: 104/104
- smoke_failed: 0
- a07_route_law: A07
- a06_output_ready: A06

## packet rows
- token_id=tok-126d54d64a8c occurrences=13 action=queue_scope_dedupe_required queue_id=agent2-orot-gap-tok-126d54d64a8c source_rid=P00280 next_safe_action=Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners.
- token_id=tok-d29b2c27700e occurrences=18 action=source_citation_ref_gap_resolution_required queue_id=agent2-orot-gap-tok-d29b2c27700e source_rid=M00032 next_safe_action=Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners.
- token_id=tok-e50370ece8ba occurrences=11 action=exact_rid_scope_required queue_id=agent2-orot-gap-tok-e50370ece8ba source_rid=E00687 next_safe_action=Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners.

## ownership / handoff
- handoff_owner: Agent 10 and Agent 6
- evidence_status: validated, but not staged/committed
- evidence_owner: A06
- boundary_gate: A07

## process blocker
- git add write path blocked by ACL on .git\\index (index.lock cannot be created)
- .git\\index denied write/modify; no index refresh or stage is possible until write permission is restored.
- exact blocker: environment write ACL, not content-quality

## next action
- restore writable .git\\index ACL for active session
- rerun exact 7-file stage/commit sequence
