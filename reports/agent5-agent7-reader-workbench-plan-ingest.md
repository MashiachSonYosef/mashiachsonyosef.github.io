# Agent 7 Reader Workbench Plan Ingest

Generated: 2026-05-31T22:58:43-04:00

## Status

Agent 7 CEO plan received. This is now the product direction Agent 5 should align control surfaces around.

## Product Direction

Build the product around Guided Gloss Assembly, not translation.

- Users read Hebrew.
- Users choose definition/gloss options.
- Selected glosses appear under Hebrew tokens.
- Users assemble a study rendering locally in the browser.
- Publication remains blocked until a later translation mode exists and passes publication gates.

## Key Decisions

- Product position: source-aware Jewish text Reader Workbench, not AI translation.
- Runtime: static browser JavaScript only.
- Storage: local-first IndexedDB with localStorage fallback.
- Export/import: JSON study sheets.
- Gloss behavior: no automatic under-word gloss; under-token gloss appears only after user selection or restored local choice.
- Authority language: use `definition option`, `suggested by route rank`, `usage evidence`, and `source/license`.
- Publication wall: all gloss selections carry `publication_status: "not_a_translation"` and never write to `data/translation-memory`.

## Current Execution Order

1. Stabilize current public HUD contract.
2. Create shared Reader Workbench runtime.
3. Define local gloss-selection contract.
4. Replace modal HUD UX with Reader View + Workbench View.
5. Pilot on `tanakh/genesis`, then expand to representative pages only after Agent 6 accepts the pilot.

## Agent 5 Implications

- Do not frame current HUD as the target product.
- Keep HUD work scoped to public-contract stabilization and pilot infrastructure.
- Preserve publication as `blocked_no_render`.
- Prevent wording drift: local gloss assembly is not accepted translation.
- Package Reader Workbench evidence for Agent 6 once Agent 4 has a pilot.
