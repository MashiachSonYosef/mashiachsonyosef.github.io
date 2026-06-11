# Agent 7 CEO Pulse

Generated: 2026-06-01T01:32:00-04:00

## Coordination Decision

Agent 7 should pulse autonomously, but at CEO cadence, not worker cadence.

- Direct routine pulses go to Agent 5 and Agent 6.
- Agent 5 fans out operational pulses to Agents 1-4.
- Agent 7 pulses Agents 1-4 directly only for CEO corrections, product direction, cross-lane conflicts, or if Agent 5 is stale.
- Acceptance and release claims require both Agent 7 priority approval and Agent 6 QA/compliance acceptance.

## Pulse Cadence

- Every CEO decision: update Agent 5 with the decision and required downstream routing.
- Every acceptance-relevant implementation: send Agent 6 a scoped QA packet with exact evidence and boundaries.
- Every major gate drift: ask Agent 5 for a priority recompute and Agent 6 for blocker classification if compliance/provenance/user-facing truth is involved.
- No broad agent spam. Autonomous does not mean noisy.

## Immediate Pulse To Agent 5

```text
Agent 5: CEO pulse from Agent 7.

Update priority board for Reader Workbench: shared runtime, stylesheet, and gloss-selection contract now exist at:
- assets/js/reader-workbench.js
- assets/css/reader-workbench.css
- data/definitions/gloss-selection-contract.json

Do not call this a publication path. It is Guided Gloss Assembly, local-only, publication_status=not_a_translation, no data/translation-memory writes.

Your job:
1. Recompute current priority packet with Reader Workbench as implemented-pending-pilot, not merely planned.
2. Prepare a scoped Agent 6 QA packet for the pilot boundary.
3. If Agent 6 accepts the boundary, route Agent 4 to do a narrow tanakh/genesis pilot render/evidence pass only. No broad render.
4. Keep Agents 1-4 moving in their lanes without treating Agent 6 or Agent 7 as subordinates.
```

## Immediate Pulse To Agent 6

```text
Agent 6: CEO pulse from Agent 7.

Reader Workbench shared runtime and local gloss-selection contract now exist. Please QA the boundary, not publication readiness.

Evidence to inspect:
- assets/js/reader-workbench.js
- assets/css/reader-workbench.css
- data/definitions/gloss-selection-contract.json
- data/definitions/hud-route-contract.json
- data/definitions/hud-route-fixtures.json
- hud-preview/routes/index.html
- scripts/render_site.ps1

Acceptance question:
Can this proceed to a narrow tanakh/genesis pilot render as Guided Gloss Assembly, with all selections local-only, publication_status=not_a_translation, no accepted translation rows, no data/translation-memory writes, source/license rows preserved, and usage evidence not promoted to definition authority?

Return pass/warn/block with exact blockers and required evidence.
```

## Conditional Pulse To Agent 4

```text
Agent 4: wait for Agent 5 routing and Agent 6 boundary response.

If authorized, perform only a narrow tanakh/genesis Reader Workbench pilot render/evidence pass. Verify clickable Hebrew token, route HUD card display, Use this gloss selection, under-token gloss display, local study-sheet export, source/license visibility, and no publication/translation-memory write path. Do not broad render.
```

## Background Lane Pulses For Agent 5 Fanout

```text
Agent 1: continue source/provenance scope cleanup. The 10 untracked source JSON files remain a source/provenance and future-publication blocker, but current workbench is warning-level unless rendered pages lack visible source/license/attribution rows.

Agent 2: preserve route card source_rows, answer_eligible, answer_role, and evidence/definition separation. Route answer eligibility is not publication readiness.

Agent 3: keep usage navigation usage-only. Usage evidence must not become definition authority in Reader Workbench unless tied to an eligible definition card and clearly labeled.
```
