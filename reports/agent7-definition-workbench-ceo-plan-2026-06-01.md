# Agent 7 Definition Workbench CEO Plan

Generated: 2026-06-01T04:56:24-04:00

## Decision

Create a Definitions Workbench as the next product planning lane after the bounded Reader Workbench pass.

The product should let a reviewer validate lexical decisions by leverage, starting from the highest-frequency forms and highest-risk definition conflicts, instead of discovering problems page by page.

This is not a translation lane, not a publication lane, and not acceptance of route cards as unique semantic truth.

## Why This Moves The Product

Reader Workbench makes pages usable. Definitions Workbench makes the corpus governable.

A reviewer needs a ranked queue:

- missing definitions with highest occurrence counts
- proposed-only definitions with highest occurrence counts
- multi-answer tokens where `answer_eligible` rows disagree
- low-confidence or machine-derived rows not yet reviewed
- recently changed route or definition rows

This turns validation into a sequence of high-impact lexical decisions.

## Existing Inputs

- `reports/workbench-token-inventory.md`: tracked-source token inventory; 57,709,552 tokens, 623,000 distinct normalized tokens, untracked sources excluded.
- `data/definitions/hud-route-lookup/manifest.json`: public route lookup; 175,216 distinct normalized tokens, 539,661 cards, 7,990 shards.
- `reports/definition-gap-queue-report.md`: importer/coverage queue; 5,000 rows written from frequent source tokens lacking accepted citable definitions.
- `reports/agent6-definition-integrity-gate-2026-06-01.md`: Agent 6 WARN for definition integrity; no hard route-data blockers, but 1,901 multi-answer normalized tokens and one source/license display-contract issue remain.
- `reports/workbench-usage-concordance.md`: usage navigation is available but usage rows remain usage-only and non-authoritative.
- `data/definitions/definition-workbench-sample.json`: 200-row sample over high-frequency inventory tokens; status counts are 96 conflicting, 55 verified, and 49 proposed-only; source/license rows complete for all sampled rows.

## Sample Contract Added

I added a bounded sample builder and validator:

- `scripts/build_definition_workbench_sample.mjs`
- `scripts/validate_definition_workbench_sample.mjs`
- `data/definitions/definition-workbench-sample.json`
- `reports/definition-workbench-sample-report.md`

This sample publishes token counts and route/card IDs only. It does not publish definition text, source excerpts, translation text, or publication readiness.

The sample intentionally leaves `usage_link_count` null until Agent 3 joins occurrence links.

## MVP Shape

Homepage entry:

- `Definitions`

Definitions index:

- coverage summary: total normalized tokens, route-covered tokens, missing tokens, proposed-only tokens, multi-answer tokens
- table sorted by leverage: occurrence count descending, then risk status
- filters: missing, proposed-only, conflicting, most frequent, recently changed, low confidence

Definition detail:

- normalized token and top observed surfaces
- lemma candidates, if available
- current answer-eligible definition cards
- evidence-only cards separated from authority rows
- source/license rows visible by default
- occurrence list linked through usage/navigation artifacts
- related forms and alternate glosses, clearly labeled as non-authoritative until accepted

## Required Data Contract

Create one machine-readable index before UI work:

- token key and normalized form
- top surfaces with counts
- occurrence count and work count
- route-card counts by authority level
- accepted answer-card count
- proposed/evidence-only count
- multi-answer flag and distinct answer-definition count
- source/license completeness flag
- usage/concordance link availability
- current status: `missing`, `proposed_only`, `verified`, `conflicting`, `low_confidence`, or `unreviewed`

Status semantics must stay narrow:

- `verified` means reviewed lexical display/definition authority only.
- `answer_eligible` means eligible for the HUD answer slot only.
- No status means publication readiness.
- No Definitions Workbench row may write to `data/translation-memory`.

## Agent Routing

Agent 5 should manage this as a planning lane, not an immediate worker blast.

- Agent 2 owns the route/definition side of the index contract.
- Agent 3 owns occurrence/concordance linking.
- Agent 4 should not be queued until the index contract and Agent 6 boundary are ready.
- Agent 6 should receive a narrow packet only after a small machine-readable sample exists.

## Agent 6 Boundary Packet Should Ask

Ask for pass/warn/block on the data contract only:

- missing/proposed/conflicting/verified status definitions are non-publication labels
- evidence-only cards cannot become definition authority
- usage rows cannot become definitions
- source/license rows survive in every row and detail payload
- multi-answer tokens are labeled as conflicts, not silently resolved
- no accepted translation-memory write path exists

## Next CEO Priority

Keep Reader Workbench at `agent6_pass_eight_included_pages_only`. Start Definitions Workbench as `sample_data_contract_added_pending_agent5_packet`.

No broad render, no publication claim, and no Agent 4 UI assignment yet.
