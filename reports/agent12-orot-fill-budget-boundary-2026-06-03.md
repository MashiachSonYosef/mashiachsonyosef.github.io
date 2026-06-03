# Agent 12 Orot Fill Budget Boundary - 2026-06-03

## Scope

Budget guardrails for Orot flagship fill and fallback public-surface expansion.

This artifact does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, Definition authority, usage-as-definition authority, accepted text, or translation output.

## Current Budget Posture

Orot Stage F is already public and useful:

- Existing public reader hints: `8729`
- Existing hinted occurrences: `40073`
- Remaining gap tokens: `8578`
- Remaining gap occurrences: `19733`

The remaining gap is not primarily a render/deploy problem. It is a route-data/answer-contract problem:

- `4337` tokens have route cards but no answer-eligible card.
- `2836` tokens have ambiguous answer candidates.
- `1405` tokens have no route cards.
- Agent 2's full queue emits `0` answer-eligible rows.

Therefore, budget must not be spent on broad public packages until a fill-producing route-claim transform exists and passes audit.

## Hard Budget Rules

1. No broad Orot route package while answer data is non-promoting.
2. No public Orot fill package unless dry-run reader hints exceed `40073` hinted occurrences.
3. No route package increase without old-HUD marker output scan `0`.
4. No package increase without Agent 4 browser proof after local build.
5. No package increase that depends on known source-blocked curated rows unless those rows are excluded or Agent 1 records a non-acceptance source evidence update.
6. No semantic arbitration by Agent 10 to improve coverage numbers.

## Top-N Policy

For any future Orot fill-producing route package:

- Pilot 1: top `50` queue rows only.
- Pilot 2: top `100` only after Pilot 1 local browser proof passes.
- Pilot 3: top `250` only after live proof and Agent 4 runtime thresholds show no payload/click regression.
- Anything above top `250` requires Agent 12 or Agent 7/13 budget review.

Fallback public-surface expansions may use the established top-6000 cap-3 pattern only when:

- the surface is already current-HUD public;
- route package size remains in the same range as prior successful packages;
- local browser proof passes before deploy;
- live proof passes after deploy.

## Payload Warning Thresholds

Warn if any Orot pilot exceeds:

- max shard bytes: `75000`
- total route shard bytes for pilot top-50: `10000000`
- total route shard bytes for pilot top-100: `20000000`
- local max click time: `1000 ms`
- live max click time: `1500 ms`
- browser console/runtime exception count: greater than `0`

Block unless Agent 7/13 overrides if any pilot exceeds:

- max shard bytes: `150000`
- total route shard bytes for pilot top-50: `25000000`
- total route shard bytes for pilot top-100: `50000000`
- local or live max click time: `5000 ms`
- old-HUD marker hits: greater than `0`

## Required Proof Before Increasing Orot Size

Agent 10 must produce:

1. Agent 2 route-claim input path and SHA.
2. Route-claim audit JSON and report.
3. Route-claim audit validator pass.
4. Source-blocker exclusion proof.
5. Reader-hint dry run with before/after occurrence counts.
6. Public route package dry run with route/shard/card counts.
7. Old-HUD marker scan over generated public files.
8. Local browser proof.
9. Live manifest proof after deploy.
10. Live browser proof after deploy.

## Budget Decision

Current decision: Orot fill is approved only for report/spec work and bounded dry-run pilots until Agent 2 produces fill-producing route claims and Agent 1/4 gates are ready.

Agent 10 may continue fallback public-surface expansion while the Orot route-data blocker is unresolved, provided old HUD exposure remains `0` and each package follows the existing bounded proof pattern.
