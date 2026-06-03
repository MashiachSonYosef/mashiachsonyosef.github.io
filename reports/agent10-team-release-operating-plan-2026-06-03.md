# Agent 10 Team Release Operating Plan - 2026-06-03

## Mission

Keep old HUD exposure at `0`, protect every current public reader surface, and increase useful reader coverage through pipeline-generated data only.

Primary release-owner focus:

1. Preserve the current public baseline: root, Orot, Deuteronomy, Genesis, and other current-HUD surfaces must not regress to old HUD.
2. Push Orot as the flagship surface as far as existing or newly bounded pipeline transforms can safely support.
3. If Orot fill is blocked by definition/source/runtime authority boundaries, keep shipping bounded public-reader improvements that do not need semantic authority.

This plan does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.

## Current State

- Deuteronomy Stage B package is live under Agent 10 proof:
  - package commit: `b70f9204e`
  - live-proof commit: `218048ed0`
  - live manifest: `2621` selected tokens, `1426` route keys, `973` shards, `4133` cards
  - live browser proof: pass, old-HUD marker hits `0`
- Orot Stage F is the current flagship public surface:
  - existing hints: `8729`
  - hinted occurrences: `40073`
  - remaining gap tokens: `8578`
  - remaining gap occurrences: `19733`
  - gap categories:
    - route cards without answer eligibility: `4337` tokens / `10340` occurrences
    - ambiguous answer candidates: `2836` tokens / `7559` occurrences
    - no route cards: `1405` tokens / `1834` occurrences
- Agent 2 produced the full Orot queue:
  - `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.json`
  - `reports/agent2-orot-full-answer-candidate-disambiguation-queue-2026-06-03.md`
  - emitted answer-eligible rows: `0`
  - blocker: no existing fill-producing transform safely converts the queue into route-store-consumable answer rows without new authority.

## Command Model

Agent 10 is release owner. Agent 10 owns public artifact changes, deploy proof, old-HUD protection, and route-package promotion.

Agent 13 is mission owner. Agent 13 changes mission priority only. Agent 13 decides when a new semantic/pipeline authority boundary is allowed.

Agent 7 is execution manager. Agent 7 owns staffing/cadence decisions and resolves conflicts between agents.

Agent 6 is QA gate. Agent 6 can pass/warn/block evidence packets but is not bypassed by Agent 10.

Agent 12 is budget guard. Agent 12 blocks broad renders, payload blowups, and work that does not protect old HUD exposure or grow reader surfaces.

Agent 2 owns definition-route data. Agent 2 may generate route-claim data only through source-backed pipeline transforms, not manual definition invention.

Agent 1 owns source/provenance/license evidence. Agent 1 can clear, warn, or block source rows but cannot approve publication.

Agent 4 owns browser/runtime proof. Agent 4 verifies current HUD behavior, old-path probes, poisoned storage, and payload/performance risk.

Agent 3 owns usage/provenance navigation. Agent 3 may cluster, locate, and route evidence, but cannot turn usage into definition authority.

Agent 5 stays asleep unless queue coordination blocks execution.

Agent 8 keeps delegation packets precise and non-interrupting.

Agent 9 is oracle/user surveillance.

Agent 11 may review reception/collision risk but cannot approve definitions or publication.

## Active Work Orders

### Agent 10 - Release Owner

Immediate local lane:

- Keep public old HUD exposure at `0`.
- Maintain live proof for every deployed public package.
- Do not publish Orot fill rows until route-claim audit, source filter, runtime proof, and old-HUD scan pass.
- If Orot remains blocked, keep advancing the next bounded public surface package with the existing current-HUD runtime.

Expected artifacts:

- `reports/agent10-*-route-package-proof-2026-06-03.md`
- `reports/agent10-*-live-browser-proof-2026-06-03.json`
- bounded blocker reports when promotion cannot proceed.

### Agent 2 - Definition Route Data

Immediate work:

- Read the full Orot queue.
- Determine whether an existing pipeline transform can emit a small, source-backed route-claim JSONL for a bounded pilot.
- If yes, produce a dry-run only route-claim artifact for at most the top `50` queue rows, with no public deploy changes.
- If no, produce an exact transform spec naming required inputs, output schema, validators, and authority boundary.

Allowed outputs:

- `reports/agent2-orot-fill-producing-transform-spec-2026-06-03.md`
- `.local-cache/definition-routes/orot-agent2-pilot-answer-claims.jsonl` only if all source/license/citation and answer-role fields are pipeline-proven.

Forbidden:

- no manual English definitions
- no accepted text
- no usage-as-definition authority
- no public deploy writes
- no flipping existing evidence/form-reference cards into answers

### Agent 1 - Source/License Evidence

Immediate work:

- From the full Orot queue, inspect source-row needs for the highest-frequency candidate tokens.
- Identify which potential answer rows are blocked by the known incomplete curated rows:
  - `curated|lex-aph-h639|source metadata incomplete`
  - `curated|lex-mashiach-h4899|source metadata incomplete`
  - `curated|lex-ruach-h7307|source metadata incomplete`
  - `curated|lex-yhwh-h3068|source metadata incomplete`
- Return a source blocker/exclusion map for top `100` Orot gap tokens.

Expected artifact:

- `reports/agent1-orot-top100-source-blocker-map-2026-06-03.md`

Forbidden:

- no source custody acceptance
- no source publication
- no definition approval
- no public deploy writes

### Agent 3 - Data/Usage Scout

Immediate work:

- Cluster Orot full queue rows into safe mechanical buckets:
  - single-candidate answer rows already present but ambiguous by article/prefix
  - form/evidence-only rows requiring no answer promotion
  - no-route rows likely needing source-route generation
- Return a top-impact subset that Agent 2 can target without semantic arbitration.

Expected artifact:

- `reports/agent3-orot-gap-mechanical-buckets-2026-06-03.md`

Forbidden:

- no semantic selection
- no accepted definitions
- no public deploy writes

### Agent 4 - Runtime Gate

Immediate work:

- Define and run the next Orot runtime gate only after Agent 10 has a new local Orot package.
- Before that package exists, prepare thresholds:
  - max local click latency
  - max shard bytes
  - max route-card payload for top-50/top-100 pilots
  - required old-path and poisoned-storage probes

Expected artifact:

- `reports/agent4-orot-fill-runtime-thresholds-2026-06-03.md`

Forbidden:

- no QA acceptance
- no publication readiness
- no source/provenance acceptance

### Agent 6 - QA Gate

Immediate work:

- Review Deuteronomy Stage B evidence for pass/warn/block boundaries if asked by Agent 7/10.
- For Orot, define the minimum evidence packet required before Agent 10 routes any fill package for review.

Expected artifact:

- `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`

Forbidden:

- no acceptance without evidence packet
- no source custody acceptance
- no definition authority

### Agent 7 - Execution Manager

Immediate work:

- Keep Orot fill as flagship priority.
- Do not stall Agent 10 while Agent 2/source lanes are blocked.
- Approve fallback public-surface expansion only when it preserves old HUD exposure `0` and does not consume Agent 2/1 critical path.

Expected artifact:

- `reports/agent7-reader-surface-team-cadence-2026-06-03.md`

### Agent 12 - Budget Guard

Immediate work:

- Enforce top-N pilots over broad Orot packages.
- Treat full Orot route packages over payload thresholds as blocked until Agent 4 proof exists.
- Prefer report-only or dry-run artifacts when semantic/source blockers remain.

Expected artifact:

- `reports/agent12-orot-fill-budget-boundary-2026-06-03.md`

## Promotion Gate For Orot Fill

No Orot fill package may be promoted unless all of these are true:

1. Agent 2 produces route-claim rows through a pipeline transform, not manual text.
2. Route claims include source/license/citation rows and non-authority boundary fields.
3. `scripts/audit_definition_route_claims.mjs` passes.
4. `scripts/validate_definition_route_claim_audit.mjs` passes.
5. Known Agent 1 source-blocked rows are excluded or separately documented as blockers.
6. Reader-hint dry run increases above `40073` hinted occurrences.
7. Public package dry run has old-HUD marker output scan `0`.
8. Local browser proof passes for Orot.
9. Live deployment proof passes after publish.

If any gate fails: do not publish; record exact blocker.

## Dispatch Ledger

Current returned packets:

- Agent 4 runtime gate returned `reports/agent4-orot-fill-runtime-thresholds-2026-06-03.md`.
  - Status: thresholds prepared; browser proof is blocked until Agent 10 has a new local Orot package generated from Agent 2 pipeline output.
  - Orot package wake condition: `final_hint_occurrences > 40073`, old-HUD scan `0`, and exact package evidence routed by Agent 10.
- Agent 6 QA gate returned `reports/agent6-orot-fill-evidence-requirements-2026-06-03.md`.
  - Status: Orot fill review intake is blocked until a complete minimum packet exists.
  - Required core: Agent 2 transform proof, route-claim schema proof, Agent 1 source exclusions, ambiguity handling, static audits, reader-impact counts, payload/runtime evidence, and old-HUD proof.
- Agent 7 execution manager returned `reports/agent7-reader-surface-team-cadence-2026-06-03.md`.
  - Status: cadence adopted; Orot remains flagship, and Agent 10 may continue bounded current-HUD public-surface expansion while Agent 1/2 blockers remain unresolved.
- Agent 12 budget boundary exists at `reports/agent12-orot-fill-budget-boundary-2026-06-03.md`.
  - Status: top-50 Orot pilot only until transform/source/runtime gates clear; broader Orot fill remains budget-blocked.
- Agent 5 queue scribe returned `reports/agent5-reader-surface-queue-board-2026-06-03.md`.
  - Status: team queue board recorded; Orot fill critical path remains Agent 2 transform, Agent 1 source exclusions, Agent 10 local package, Agent 4 runtime proof, Agent 6 evidence review.
- Agent 11 public/header risk scan returned `reports/agent11-public-header-risk-scan-2026-06-03.md`.
  - Status: header/readiness wording, direct-path stale-client risk, and mobile compression risk are now on Agent 10's punch list. No fixes or public deploy writes were made.
- Agent 1 source lane returned `reports/agent1-orot-top100-source-blocker-map-2026-06-03.md`.
  - Status: Agent 3 top-100 pilot mapped at `100` rows / `1960` occurrences.
  - Source-clean for Agent 2 transform consideration: `87` rows.
  - Source-linkage blocked: `13` rows, all missing `lexicon_entry_id`.
  - Known incomplete curated rows attached: `0`.
- Agent 2 definition-route lane returned `reports/agent2-orot-fill-producing-transform-spec-2026-06-03.md`.
  - Status: no pilot answer-claim JSONL emitted.
  - Agent 3 target is confirmed as the correct first dry-run target, but existing pipeline cannot safely turn it into answer rows.
  - Top-100 target makeup: `1897` route cards, `0` answer cards, `470` phrase-evidence cards, `1341` citable-evidence cards, `67` form cards, `19` lemma cards.
  - Exact blocker: a new dry-run transform is needed to rejoin upstream definition claims, prove morphology/prefix safety, prove homograph safety, emit separate answer rows only, and pass route-claim audit/validation.

Pending packets:

- No worker packet is currently pending for the Orot top-100 pilot.
- The next unblocked action is implementation of a dry-run, zero-or-safe-output pipeline transform for Agent 3's target subset.

Current release-owner interpretation:

- Orot is not abandoned. It is flagship but blocked for fill promotion until Agent 2 and Agent 1 return pipeline/source proof.
- Agent 10 should keep public results tangible by advancing one bounded current-HUD surface at a time when Orot fill is waiting.
- Agent 10 should not route Orot to Agent 4 or Agent 6 until the minimum packet is real, not aspirational.
- No returned packet creates QA acceptance, source/provenance acceptance, Definition authority, publication readiness, or accepted text.

## Fallback Release Lane

If Orot fill is blocked waiting on Agent 2/1/13, Agent 10 should continue bounded current-HUD public work:

- pick one already-public current-HUD surface with low route coverage or missing route summary;
- build a bounded top-N cap-3 route package;
- run static validators, old-HUD marker scan, local browser proof, deploy, and live browser proof;
- do not claim QA/public/runtime acceptance.

## Stop Conditions

Stop and route to Agent 7/13 only when:

- a semantic authority decision is required;
- a source/license row cannot be excluded and blocks a high-impact fill;
- payload/runtime proof blocks every bounded route package;
- old HUD exposure becomes nonzero.
