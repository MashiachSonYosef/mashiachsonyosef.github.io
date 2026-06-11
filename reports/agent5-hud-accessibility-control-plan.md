# Agent 5 HUD Accessibility Control Plan

Generated: 2026-05-31T12:32:39-04:00

## Control Position

The route HUD should be treated as a workbench inspector, not a tooltip.

It contains structured evidence, route candidates, citations, licenses, morphology, and future translation-memory hooks. That makes it too rich for tooltip semantics. The product choice is between:

- True modal dialog: trap focus, make background inert/obscured, keep `aria-modal="true"`.
- Non-modal inspector: remove `aria-modal="true"`, expose trigger relationships, keep keyboard close/focus restore, and let users continue reading or comparing words.

Agent 5 recommends the non-modal inspector path for workbench mode. It better matches the user flow: click word, compare nearby words, keep reading, and use evidence without trapping the entire page.

## Research Basis

- WAI-ARIA APG modal dialog guidance says modal content makes background content inert and keeps Tab/Shift+Tab inside the dialog.
- WAI-ARIA APG advises omitting `aria-describedby` when dialog content is structurally complex and would be hard to understand as one announced string.
- WCAG 2.2 makes visible focus, unobscured focus, keyboard behavior, status messaging, and pointer target usability part of the polish bar.

Sources checked:

- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://www.w3.org/TR/WCAG22/

## Local Evidence

Lightweight audit:

- `node scripts\audit_route_hud_accessibility.mjs`
- Report: `reports/agent5-route-hud-accessibility-audit.md`

Current findings:

- 4 errors, 8 warnings, and 1 info finding in the static audit.
- Shared render source declares `role="dialog"` with `aria-modal="true"`.
- No focus-trap or inert/background-obscuring marker was found.
- The dialog points `aria-describedby` at the whole structured HUD panel.
- Token triggers use button semantics and `aria-pressed`, but lack `aria-haspopup`, `aria-controls`, and `aria-expanded`.
- Close button has hover styling but no dedicated focus-visible style.
- Async HUD loading/error changes do not appear to have a live-status announcement.
- Dialog title is static as `Route HUD`, so assistive-tech users may not hear which word is being inspected.

## Recommended Contract

For workbench mode, route HUD should satisfy this contract:

- The HUD is a non-modal inspector panel with `role="dialog"` or equivalent inspector semantics, but not `aria-modal="true"`.
- Every clickable lexical word has `role="button"`, `tabindex="0"`, `aria-haspopup="dialog"`, `aria-controls="<hud-id>"`, and `aria-expanded`.
- The active word state uses `aria-expanded="true"` and optional visual selected styling, not only `aria-pressed`.
- Escape closes the HUD and restores focus to the invoking word.
- Closing by button restores focus unless the user has moved intentionally elsewhere.
- Loading, no-match, and error states are announced via `role="status"` or `aria-live="polite"`.
- The visible title or accessible label includes the selected surface word and source ref.
- Focus-visible styles are strong enough on both lexical words and close/action buttons.
- A large-target/touch mode exists as an optional reader/workbench setting. Dense inline word targets can remain default for scholarship mode.

## If Choosing True Modal Instead

If Agent 4 keeps `aria-modal="true"`, then the HUD must add:

- Focus containment for Tab and Shift+Tab.
- Inert or equivalent background-interaction prevention.
- Visual background obscuring.
- A carefully selected initial focus target, preferably the title or first static content node for structured evidence.

This is heavier and less aligned with the workbench use case.

## Lane Guidance

- Agent 4 owns this after the split-token / whole-surface integrity guard lands. Do the semantic fix in shared render/runtime source before touching generated pages.
- Agent 2 does not need to stop. Route cards should continue preserving answer eligibility, morphology, source, license, and citation fields.
- Agent 3 does not need to stop. Workbench evidence can remain broad, but undefined/ambiguous rows must be labeled and should not become accepted translations without decision rows.
- Agent 5 should keep this as a control warning until `scripts\audit_route_hud_accessibility.mjs` reports no modal-semantics errors.
