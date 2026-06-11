# Agent 3 Old-Dictionary Bridge-Gap Direct Source-RID Row-Level Return Contract

Generated: 2026-06-06T13:41:00.270Z

## Status

- Status: evidence-ready
- Lane: Agent 3 linkage/dedupe/navigation only
- Approval route: A07 owns approval, SOP, final validation, and release gate
- A06 route: evidence, validators, and repo-cleaning production only; no A06 approval request
- Authority: row-level return contract evidence only; no source, license, legal, Definition, runtime, publication, answer, gloss, or accepted-text claim

## Inputs

- downstream_gap_crossmatch: reports/agent3-old-dictionary-candidate-use-bridge-gap-direct-source-rid-downstream-gap-crossmatch-2026-06-06.json

## Counts

| Metric | Count |
| --- | ---: |
| Contract rows | 3 |
| Contract occurrences | 42 |
| Unique source RIDs | 3 |
| Agent 10 return contract rows | 3 |
| Agent 1/Agent 2 return contract rows | 3 |
| Agent 10 return field cells | 21 |
| Agent 1/Agent 2 return field cells | 27 |
| Action-specific return field cells | 3 |
| Row-level downstream gap rows | 3 |
| Source-citation present rows | 0 |
| Transform-blocked rows | 3 |
| A07 approval-route rows | 3 |
| A06 evidence-owner rows | 3 |
| Acceptance claims | 0 |

## Contract Rows

| source RID | queue_id | action kind | Agent 10 fields | Agent 1/2 fields | action-specific field | next safe action |
| --- | --- | --- | ---: | ---: | --- | --- |
| P00280 | agent2-orot-gap-tok-126d54d64a8c | queue_scope_dedupe_required | 7 | 9 | queue_scope_dedupe_resolution_or_exact_duplicate_blocker | Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners. |
| M00032 | agent2-orot-gap-tok-d29b2c27700e | source_citation_ref_gap_resolution_required | 7 | 9 | ref_gap_source_citation_resolution_or_exact_missing_citation_blocker | Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners. |
| E00687 | agent2-orot-gap-tok-e50370ece8ba | exact_rid_scope_required | 7 | 9 | exact_rid_scope_resolution_or_exact_scope_blocker | Return the required row-level fields or an exact blocker; keep transform and release blocked until row-level consumption and source-citation prerequisites are satisfied by their owners. |

## Handoff

- Handoff owner: Agent 10 for row-level package intake return; Agent 1/Agent 2 for source-citation, dedupe, ref-gap, and exact-RID-scope returns; A07 for approval; A06 evidence/validator production only.
- Next safe action: Use these contract rows as the exact required return shape for clearing the downstream gap; no row is transform-ready from this packet.
- Stop condition: Stop at row-level return contract evidence; no source text read, source/license/legal acceptance, Definition answer selection, route publication support, runtime mutation, or accepted text claim.
