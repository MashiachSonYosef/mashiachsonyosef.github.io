# Agent 10 -> Agent 6 Old-Dictionary Klein 214-Row NC Lane Planning Boundary Packet

Generated: 2026-06-06T02:48:00Z

Active mode: `WEEKLY_LEXICON_EXPANSION_GOAL_MODE`

## Target Package

`old-dictionary-klein-214-row-noncommercial-educational-lane-planning`

## Files Used

| file | role |
|---|---|
| `reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json` | Agent 1 row/subset NC lane preservation evidence |
| `reports/agent1-old-dictionary-klein-nc-lane-preservation-validation-result-2026-06-05.json` | Agent 1 validation result |
| `reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json` | Agent 2 NC lane preservation receipt |
| `reports/agent1-old-dictionary-agent2-transform-lane-handoff-2026-06-04.json` | old-dictionary source-family lane handoff |
| `reports/agent6-orot-nc-klein-source-family-map-boundary-verdict-2026-06-04.md` | prior narrower 17-row NC/Klein verdict; scope is not interchangeable |

## Agent 1-4 Inputs Consumed

| lane | input | release/package impact |
|---|---|---|
| Agent 1 | `reports/agent1-old-dictionary-klein-nc-lane-preservation-2026-06-05.json` | preserves 214-row Klein subset as NC educational lane |
| Agent 2 | `reports/agent2-klein-nc-lane-preservation-receipt-2026-06-05.json` | confirms no transform/output and preserves scope distinction |
| Agent 3 | none new | not required for this source/license lane boundary |
| Agent 4 | none new for NC lane | no changed public/runtime package |

## Scope Boundary

The old-dictionary Klein subset is not the earlier Orot NC/Klein package.

| scope | rows | occurrences |
|---|---:|---:|
| old-dictionary Klein subset | 214 | 4444 |
| prior Orot NC/Klein package map | 17 | 259 |

These scopes are not interchangeable.

## Requested Boundary

Pass/warn/block whether the exact old-dictionary Klein `214` row / `4444` occurrence subset may be carried as a separate non-public `noncommercial_educational_candidate` lane planning artifact only.

Required NC flags:

- `license_lane=noncommercial_educational_candidate`
- `derived_from_nc=true`
- `commercial_export_allowed=false`
- `attribution_required=true`
- `corpus_contamination=false`

Required zero counters:

- allowed transform rows: `0`
- candidate text rows: `0`
- definition content rows: `0`
- lemma content rows: `0`
- reader-hint content rows: `0`
- answer eligible rows: `0`
- public emit rows: `0`
- route writes: `0`
- accepted text rows: `0`
- public/runtime mutation: `0`
- commercial export authorization rows: `0`
- NC commercial authorization rows: `0`
- release actions: `0`

## Agent 6 Boundary Question

Pass/warn/block whether the exact old-dictionary Klein `214` row / `4444` occurrence subset may be preserved as a separate non-public `noncommercial_educational_candidate` lane planning artifact only, with NC flags preserved and no transform, candidate text, definition/lemma/reader-hint storage, answer eligibility, public emit, route write, accepted text, export, public/runtime mutation, publication readiness, or release action.

## Exact Blockers Preserved

- This packet does not request commercial export authorization.
- This packet does not request NC commercial authorization.
- This packet does not request noncommercial display authorization.
- This packet does not request NC definition-content storage.
- This packet does not request transform output.
- This packet does not request answer eligibility.
- This packet does not request public/runtime mutation.
- Any later NC display/storage/export/public/answer use requires a separate owner/license-policy boundary and exact Agent 6 docket.

## Next Owner

Agent 6 should return pass/warn/block for this exact 214-row NC lane planning boundary only. Agent 10 should consume that verdict before any further NC package movement.

## Stop Condition

Stop after Agent 6 disposition or exact route blocker. Do not mutate public/runtime files, route shards, source files, token indexes, lexical payloads, candidate text, definition content, accepted text, export files, publication state, or release state.

