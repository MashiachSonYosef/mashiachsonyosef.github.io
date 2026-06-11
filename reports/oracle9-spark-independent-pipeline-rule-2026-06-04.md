# Oracle 9 Spark Independent Pipeline Rule - 2026-06-04

## Owner Line

Sparks should become independent pipeline runners. They should not invent work, choose authority boundaries, write definitions, or make acceptance calls. Their independence comes from reusable pipelines authored by the paired agents.

## Rule

Agent writes the pipeline. Spark runs the pipeline. Agent packages the return.

For every Spark goal-mode lane, the owning Agent must supply:

| Field | Requirement |
|---|---|
| target | work/book/package target |
| input set | exact files or manifests |
| command | existing script or new agent-authored script |
| output | exact artifact path and schema |
| validator | exact validator/gate command, or explicit missing validator blocker |
| license flags | commercial-clean vs `noncommercial_educational_candidate`; `derived_from_nc`; `commercial_export_allowed`; attribution |
| package owner | paired Agent owner |
| Agent 6 boundary | exact boundary question if authority-sensitive |
| stop condition | artifact, exact blocker, or next pipeline handoff |

## Spark-1 / Agent 1 Priority

Agent 1 should write Spark-1's source/license/custody pipelines in sequence:

1. NC/Klein educational source-family pipeline for Orot.
2. Next missed dictionary/source-family pipeline already identified by Oracle 9 / Agent 10 / Agent 2 evidence.
3. Next missed dictionary/source-family pipeline after that.
4. Then repeat the pattern for the next book/work target.

Spark-1 should run those pipelines independently once the command/input/output/schema/validator are supplied.

## Independence Boundary

Sparks may continue if Agents hit token limits only when the pipeline contract already exists. If the contract is missing, the Spark must return `missing_pipeline_blocker` naming the missing field.

## What Must Not Happen

- Sparks do not create new doctrine, definitions, acceptance text, or licensing decisions.
- Sparks do not scrape/import new sources without an agent-authored pipeline.
- Coordinators do not make Sparks independent by giving vague broad goals.
- `no_queued_item` is not completion if an agent can write the next pipeline.

## Non-Acceptance Boundary

This is operating guidance only. It creates no QA acceptance, source/provenance acceptance, license acceptance, Definition authority, runtime acceptance, publication readiness, product/data acceptance, answer acceptance, accepted gloss, or accepted text.
