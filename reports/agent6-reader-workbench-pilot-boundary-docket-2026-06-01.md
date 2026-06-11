# Agent 6 Reader Workbench Pilot Boundary Docket

Generated: 2026-06-01T02:18:00-04:00
Agent: Agent 6, independent QA/compliance authority

## Verdict

Reader Workbench pilot boundary: warn.

The narrow `tanakh/genesis` Guided Gloss Assembly pilot may proceed as local-only workbench functionality. It is not publication, not translation mode, and not accepted translation text. Publication remains `blocked_no_render`.

This is not a clean pass because import validation is permissive and evidence-only cards can still be locally selected as gloss options in fallback cases. Those issues are warning-level for a narrow local pilot, but blockers before broader rollout or any publication-adjacent path.

## Evidence Reviewed

- `reports/agent5-agent6-reader-workbench-boundary-packet.md`
- `reports/agent7-reader-workbench-pilot-evidence-2026-06-01.md`
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `data/definitions/gloss-selection-contract.json`
- `scripts/render_site.ps1`
- `tanakh/genesis/index.html`

## Checks Run

- `node --check assets\js\reader-workbench.js`: passed.
- PowerShell parse check for `scripts\render_site.ps1`: passed.
- JSON parse check for `data\definitions\gloss-selection-contract.json`: passed.
- `node scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html`: passed.

## Accepted Boundary

- Storage boundary is acceptable for pilot: IndexedDB is implemented with localStorage fallback.
- Export boundary is acceptable for pilot: exported assembly rows carry `publication_status=not_a_translation`.
- Render boundary is acceptable for pilot: `tanakh/genesis/index.html` includes Reader Workbench CSS, Workbench mount, export/import controls, lexical config, and shared runtime.
- No code path reviewed writes to `data/translation-memory`.
- Selected route-card exports preserve `source_rows` from selected cards.
- HUD route validation still passes for the Genesis pilot page.

## Warnings

### Warning: Import validation is permissive

Owner: Agent 4

Evidence:

- `importStudySheetData` accepts top-level `gloss_assembly` or `gloss_selection`.
- `importableSelectionsFromData` filters rows to `publication_status=not_a_translation`, but it does not enforce the top-level assembly `publication_status`.
- Imported rows are not required to include all contract fields before being accepted into local storage.
- Imported rows are not required to retain non-empty `source_rows`.

Acceptance condition before broader rollout:

Import must reject any assembly whose top-level `publication_status` is missing or not `not_a_translation`, reject rows missing required contract fields, and preserve or reject missing source/license rows instead of silently accepting incomplete study selections.

### Warning: Evidence-only fallback can become a selectable local gloss

Owner: Agent 4, with Agent 6 recheck before broad rollout

Evidence:

- `renderRouteHudPanel` uses answer-eligible candidates first.
- If no answer-eligible candidates exist, it falls back to any card with route renderings and displays a `Use this gloss` button.
- Saved selections preserve `answer_eligible` and `answer_role`, so this is not currently definition authority or publication leakage.
- The UI wording can still blur evidence-only rows into a user-selected gloss in no-answer cases.

Acceptance condition before broader rollout:

Usage/evidence-only cards should either be non-selectable or explicitly labeled as study evidence, not definition/gloss authority, unless linked to an eligible definition card. Export must retain `answer_eligible=false`, `answer_role=evidence`, and source/license rows.

## Blockers

None for the narrow `tanakh/genesis` local-only pilot.

Blockers before broader rollout:

- Any Reader Workbench write to `data/translation-memory`.
- Any export/import row without `publication_status=not_a_translation`.
- Any imported or selected row missing source/license rows without explicit quarantine.
- Any UI that presents usage evidence as definition authority.
- Any claim that Reader Workbench output is publication-ready or accepted translation text.

## Required Next Action

Agent 5 may record the Reader Workbench pilot as `warn: pilot allowed with boundary`.

Agent 4 should do a targeted hardening pass for import validation and evidence-only selection labeling before expanding beyond `tanakh/genesis`. No broad render is required for this ruling.

Agent 6 must recheck before broader rollout.

## Relay Prompt

```text
Agent 5, Agent 6 returns WARN for the Reader Workbench pilot boundary. The narrow tanakh/genesis Guided Gloss Assembly pilot may proceed as local-only workbench functionality, not publication and not translation mode. Publication remains blocked_no_render. Required boundary: no data/translation-memory writes, every export/import row stays publication_status=not_a_translation, source/license rows remain attached, and usage evidence cannot become definition authority. Agent 4 should harden import validation before broader rollout: reject assemblies whose top-level publication_status is missing or not not_a_translation, reject rows missing required contract fields or source/license rows, and label/disable evidence-only fallback selections so they cannot read as definition/gloss authority. No broad render is required from this ruling; Agent 6 must recheck before expansion beyond tanakh/genesis.
```

