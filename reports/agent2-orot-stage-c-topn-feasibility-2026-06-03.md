# Agent 2 Orot Stage C Top-N Feasibility - 2026-06-03

## Scope

Definition/route-data sidecar for Agent 10 Orot pipeline.

This is dry-run feasibility only. It does not write route package output and does not claim QA acceptance, validated runtime acceptance, publication readiness, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted text, or translation output.

Machine report: `reports/agent2-orot-stage-c-topn-feasibility-2026-06-03.json`

## Pipeline Commands

- Syntax: `node --check scripts\build_public_hud_route_package.mjs`
- Top-100 dry-run: `node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 100 --report reports\agent2-orot-stage-c-topn-feasibility-2026-06-03.json --dry-run`
- Top-250 dry-run: `node scripts\build_public_hud_route_package.mjs --work-id orot --source-root C:\Users\owner\Documents\translations --public-root C:\Users\owner\Documents\translations\.codex-tmp\hud-deploy-live --top-n 250 --report reports\agent2-orot-stage-c-topn-feasibility-2026-06-03.json --dry-run`

The final JSON report combines both dry-run summaries after the two pipeline runs.

## Threshold Policy

Agent 4 payload thresholds carried forward from the Stage B top-50 proof:

- Warn if total route shard bytes exceed `10485760` or max shard bytes exceed `1048576`.
- Block if total route shard bytes exceed `26214400` or max shard bytes exceed `3145728`.

## Top-100 Result

Status: `warn_exceeded_below_block`

- Selected token count: `100`
- Selected lookup candidate count: `140`
- Preserved existing route key count: `62`
- Preserved existing card count: `2527`
- Public route key count: `126`
- Shard count: `101`
- Card count: `4973`
- Payload bytes: `13500343`
- Max shard bytes: `349870`
- Manifest bytes: `48567`
- Truncated key count: `1`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`
- Route lookup shards read: `3569`
- Route lookup missing shards: `84`

Assessment: top-100 is below Agent 4 block thresholds but above the total-byte warning threshold. It should not be promoted as a quiet expansion; it needs Agent 4/6 warning review or payload reduction before publication work.

## Top-250 Result

Status: `block_exceeded`

- Selected token count: `250`
- Selected lookup candidate count: `398`
- Preserved existing route key count: `62`
- Preserved existing card count: `2527`
- Public route key count: `342`
- Shard count: `252`
- Card count: `12231`
- Payload bytes: `33143641`
- Max shard bytes: `537264`
- Manifest bytes: `118016`
- Truncated key count: `1`
- Denylist output scan total: `0`
- Old-HUD marker output scan total: `0`
- Route lookup shards read: `3569`
- Route lookup missing shards: `84`

Assessment: top-250 is blocked by total payload size under the current packaging model. The blocker is aggregate payload bytes, not shard size, denylist exposure, or old-HUD exposure.

## Pipeline Direction

Recommended next pipeline-only path:

1. Keep Stage B top-50 as the current package size until review clears.
2. For top-100, either request Agent 4/6 warning review or re-run dry-runs with smaller `--max-cards-per-key` values to find an under-warning package.
3. For top-250, do not package under the current model. Use pipeline work to add a payload-reduction mode: lower per-key card caps, answer-first card slicing, or lazy per-token shard loading.
4. Keep the same denylist and old-HUD marker scans as hard gates.

## Boundary

Highest claim: top-100 and top-250 dry-run feasibility data generated from pipeline route data.

Not accepted: QA acceptance, validated runtime acceptance, publication readiness, source/provenance acceptance, Definition authority, usage-as-definition authority, accepted text, translation output, or route package publication.
