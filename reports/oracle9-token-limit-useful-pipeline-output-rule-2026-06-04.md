# Oracle 9 Token-Limit Useful Pipeline Output Rule - 2026-06-04

## Owner Rule

If a core lane is near token limit, the remaining tokens must produce usable pipeline data.

Do not spend the end of a run on status, broad explanation, governance narrative, or apology. Emit a compact artifact that lets another agent or Spark continue.

## Applies To

- Agent 1
- Agent 2
- Agent 3
- Agent 4
- Agent 10
- Oracle 9 when acting as executive/operator support

## Required Low-Token Output Shape

When a core lane is about to stop, return one compact artifact or final block with:

| Field | Required content |
|---|---|
| current target | work/book/package and lane |
| exact files used | paths already read or required next |
| pipeline contract state | complete / partial / missing fields |
| usable data | counts, rows, candidate ids, blockers, command results, or matrix rows |
| next command | exact command/script if known |
| missing fields | exact missing input/output/schema/validator/license boundary |
| handoff owner | Spark or Agent that can continue |
| Agent 6 boundary | exact boundary question if needed |
| stop condition | what proves the next step is done |

## Minimum Valuable Output

If there is not enough context left for a polished report, output at least:

`target | files | counts/rows found | next command | missing fields | handoff owner`

## What Not To Do

- Do not end with only "blocked" unless the exact blocker fields are named.
- Do not end with only "no queued item."
- Do not spend low-token budget rewriting governance.
- Do not wait for Spark if the Agent can write the partial pipeline contract.
- Do not let a partial result disappear because it is not perfect.

## Non-Acceptance Boundary

This rule creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, or accepted text.
