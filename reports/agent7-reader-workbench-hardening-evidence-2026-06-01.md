# Agent 7 Reader Workbench Hardening Evidence Packet

Generated: 2026-06-01T02:28:57-04:00

## Ask for Agent 6

This is a narrow hardening evidence packet for the `tanakh/genesis` local-only Guided Gloss Assembly pilot. Please verify the hardening evidence only: import validation, evidence-only fallback disablement/labeling, source/license export-import survivability, and negative proof that no accepted translation-memory write path exists.

Return pass/warn/block with exact remaining blockers before any expansion beyond `tanakh/genesis`.

## Boundary

- This is not a publication claim.
- This is not a broad rollout claim.
- This is not accepted translation text.
- Publication remains `blocked_no_render`.
- Reader Workbench selections remain local-only with `publication_status=not_a_translation`.

## Evidence Artifacts

- `assets/js/reader-workbench.js`
- `scripts/validate_reader_workbench_runtime.mjs`
- `data/definitions/gloss-selection-contract.json`
- `tanakh/genesis/index.html`

## Hardening Evidence

- Import validation now rejects:
  - missing or wrong top-level `publication_status`
  - row-level `publication_status` other than `not_a_translation`
  - rows missing required `gloss-selection-contract.json` fields
  - rows missing source/license identity
  - evidence-only rows where `answer_eligible=false` or `answer_role=evidence`
- Evidence-only cards now render as `Evidence only`, carry disabled choice buttons, and do not bind the save-selection click handler.
- Export filtering excludes rows that fail the local gloss-selection contract.
- The dedicated validator exercises a valid import/export round trip and verifies source/license fields survive export.
- The dedicated validator scans the Reader Workbench runtime for forbidden translation-memory/publication markers.

## Checks Run

```text
node --check assets\js\reader-workbench.js
node --check scripts\validate_reader_workbench_runtime.mjs
node scripts\validate_reader_workbench_runtime.mjs
node scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html
```

Observed validator output:

```json
{
  "import_validation": "passed",
  "evidence_only_selection": "disabled",
  "source_license_round_trip": "passed",
  "translation_memory_write_path": "not_found",
  "pilot_page": "tanakh/genesis/index.html"
}
```

Lightweight public lookup compatibility sample:

```json
{
  "sample_tokens": 6,
  "cards": 193,
  "answer_sample": 6,
  "answer_missing_required_source_fields": 0
}
```

## Non-Goals

- No broad render was run for this packet.
- No publication render was produced.
- No translation-memory acceptance path was added.
- No source/provenance acceptance claim is made.

## Relay Text

```text
Agent 6, this is a narrow Reader Workbench hardening evidence packet for the tanakh/genesis local-only Guided Gloss Assembly pilot. Please verify import validation, evidence-only selection disablement/labeling, source/license export-import survivability, and negative proof that no accepted translation-memory write path exists. Review reports/agent7-reader-workbench-hardening-evidence-2026-06-01.md, scripts/validate_reader_workbench_runtime.mjs, assets/js/reader-workbench.js, data/definitions/gloss-selection-contract.json, and tanakh/genesis/index.html. This is not a publication claim, not a broad rollout claim, and not accepted translation text. Return pass/warn/block with exact remaining blockers before any expansion beyond tanakh/genesis.
```
