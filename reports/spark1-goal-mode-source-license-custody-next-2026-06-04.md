# Spark-1 goal mode source/license/custody next

Date: 2026-06-04

Role: Spark-1 usable replacement; mechanical source/license/custody support for Agent 1 package ownership only.

Active mode: `BROAD_CORPUS_EXPANSION`

## Next concrete workset

- Target work/book: `tanakh/deuteronomy`
- Queue/control lane item: `deuteronomy-source-license-custody-map`
- Package owner: Agent 1
- Expected Agent 1 artifact named in control: `reports/agent1-deuteronomy-source-license-custody-map-2026-06-04.md` plus optional JSON

## Exact files read

- `data/control/spark_standing_queue.json`
- `data/control/agent_goal_board.json`
- `data/control/agent6_validation_queue.json`
- `reports/agent7-broad-agent-spark-goals-2026-06-04.md`
- `reports/agent7-deuteronomy-orot-level-pipeline-staffing-2026-06-04.md`
- `reports/agent10-deuteronomy-pipeline-intake-state-2026-06-04.md`
- `data/sources/deuteronomy.json`
- `data/overlays/deuteronomy.json`
- `data/reports/coverage/deuteronomy.json`
- `data/lexical/deuteronomy.manifest.json`
- `data/lexical/occurrences/deuteronomy.json`
- `data/lexical/token-indexes/tanakh/deuteronomy.json`

## Counts computed from current files

Source file `data/sources/deuteronomy.json`:

- Work id: `deuteronomy`
- Work slug: `tanakh/deuteronomy`
- Source system: `Sefaria API`
- Source base URL: `https://www.sefaria.org/api/`
- Import date: `2026-05-08`
- Source units: 956
- Unit-level source/license fields visible: `source_ref`, `license`, `version_source`, `source_url`
- Unit license distribution: `CC-BY-SA`: 956
- Distinct `version_source` values: 1

Overlay file `data/overlays/deuteronomy.json`:

- Overlay unit key count: 0

Coverage file `data/reports/coverage/deuteronomy.json`:

- Source units: 956
- Total tokens / occurrences: 12,595
- Matched tokens: 5,919
- Strict tokens: 3,824
- Potential tokens: 2,095
- Unresolved tokens: 6,676
- Lexical coverage percent: 46.99

Lexical manifest `data/lexical/deuteronomy.manifest.json`:

- Chunk count: 9
- Chunk entry sum: 2,392
- Chunk token sum: 8,113
- Token chunk key count: 8,113

Token index `data/lexical/token-indexes/tanakh/deuteronomy.json`:

- Unique surface forms: 8,113
- Total occurrences: 12,595
- Matched surface forms: 2,940
- Unmatched surface forms: 5,173
- Status counts: `matched`: 2,940; `unmatched`: 5,173
- Occurrence counts by status: `matched`: 5,919; `unmatched`: 6,676
- Forms with lexicon entry: 2,940
- Forms without lexicon entry: 5,173

Occurrence file `data/lexical/occurrences/deuteronomy.json`:

- Total occurrences: 12,595
- Unit count: 956

## Commercial-clean / NC separation visible now

In the exact Deuteronomy source, overlay, coverage, manifest, occurrence, and token-index files read above:

- `commercial_clean` flags visible: 0
- `noncommercial_educational_candidate` flags visible: 0
- `derived_from_nc` flags visible: 0
- `commercial_export_allowed=false` flags visible: 0

Visible current source/license fact only: all 956 Deuteronomy source units carry `license: CC-BY-SA`. This report does not classify that license as accepted, commercial-clean, NC educational, blocked, or product-eligible.

## Missing source/license/custody inputs

`missing_pipeline_blocker`: no exact Deuteronomy-specific Spark-1 source/license/custody package command, output schema, count-family classifier, or validator/gate is supplied for `deuteronomy-source-license-custody-map`.

Current control states the workset should stop with family counts, candidate source families, excluded/blocked rows, next Agent 6 boundary need, or exact missing command/input/schema blocker. The current files allow raw source/license and lexical counts, but not the required Orot-shaped family split by `commercial_clean` / `noncommercial_educational_candidate` / metadata-link-only / blocked / unmatched under an exact Agent 1 package schema.

## Next Agent 1 package action

Agent 1 should package this as the Deuteronomy source/license/custody blocker-and-inventory seed:

- Target `tanakh/deuteronomy`.
- Use the current-file counts above as mechanical inventory evidence.
- Preserve the blocker that the exact Deuteronomy Spark-1 package command/schema/validator is missing.
- If Agent 1 supplies an exact command/schema, Spark-1 can run it as the next source/license/custody mechanical workset.
- If Agent 6 boundary review is needed, queue only the exact row/family boundary once Agent 1 has produced the family classifier package.

## Boundary

No QA acceptance, source/provenance acceptance, license acceptance, publication acceptance, runtime acceptance, product acceptance, Definition authority, answer acceptance, accepted gloss, or accepted text. No public/runtime mutation. No route-shard edit. No source, token-index, lexical-payload, or overlay mutation.
