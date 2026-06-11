# Agent 6 Public HUD Signoff

Generated: 2026-06-01T01:30:00-04:00
Agent: Agent 6, independent QA/compliance authority

## Verdict

Agent 6 signs off on the new public reader HUD as `accepted-with-boundary`.

The old HUD should not be restored as a safer fallback. On the available evidence, the new HUD is materially safer because it preserves route answer eligibility, source/license footnotes, non-modal dialog truth, maqaf/hyphen compound handling, and removes stale old-HUD markers.

This is not publication clearance. Publication remains `blocked_no_render`.

## Evidence

Current evidence reviewed:

- `reports/route-hud-page-upgrade-report.md` 2026-06-01 rank-basis migration acceptance.
- `reports/agent6-validation-cycle-2026-06-01.md`.
- Fresh local validator: `node scripts\validate_public_hud_route_lookup.mjs --skip-release-stamp` passed.
- Fresh local validator: `node scripts\validate_route_answer_safety.mjs` passed.
- Fresh local validator: `node scripts\validate_route_hud_page.mjs --page tanakh\genesis\index.html` passed.

Report-backed HUD facts:

- Public HUD static spread checked: 1281 HUD pages.
- Pages missing `article.dataset.rankBasis`: 0.
- Pages containing `Rank details`: 0.
- Pages containing `Clicked Hebrew form`: 0.
- Pages containing stale old-HUD markers `Best actual hit` or `Full source and license rows`: 0.
- Usage-evidence null safety: 0 HUD pages contain literal `undefined`.
- Representative validator passed for 19 pages across the major source categories.
- Route lookup validator passed.
- Route answer-safety validator passed.

## Boundary

Accepted:

- New public reader HUD runtime/source contract.
- Rank-basis migration for current HUD pages.
- Source/license display contract as static/runtime-source evidence.
- Definition authority boundary at the HUD layer: answer eligibility and answer role are used; usage evidence does not become definition authority by HUD display alone.

Not accepted:

- Publication readiness.
- Legal clearance for publishable translation text.
- Live browser-click proof for every page.
- Source/provenance acceptance for currently untracked source files.
- Any future render that reintroduces stale old-HUD markers, missing rank basis, hidden source/license rows, or route lookup failures.

## Required Next Action

Agent 5 must record this as new HUD `accepted-with-boundary`, not as publication-ready and not as a reason to reopen the old rank-basis blocker.

Agent 4 should not be routed to restore or preserve the old HUD. Agent 4 only needs monitoring and targeted fixes if new evidence shows a HUD regression.

Agent 1 remains the next active risk owner for source/provenance scope: 10 untracked source files and CC-BY Machzor material outside tracked audit control.

## Relay Prompt

```text
Agent 5, Agent 6 signs off on the new public reader HUD as accepted-with-boundary. Record that the old HUD should not be restored as the safer fallback. Evidence: the 2026-06-01 route-HUD report and Agent 6 validation cycle show 1281 current HUD pages, 0 pages missing article.dataset.rankBasis, 0 Rank details pages, 0 Clicked Hebrew form pages, 0 stale old-HUD markers, route lookup passing, route answer-safety passing, and representative route-HUD validation passing. Boundary: this is HUD/runtime-source acceptance only, not publication clearance, not live browser-click proof, and not source/provenance acceptance for untracked source files. Publication remains blocked_no_render. Next active risk remains Agent 1 source/provenance scope, not Agent 4 HUD restoration.
```

## Agent 4 Relay Prompt

```text
Agent 4, Agent 6 signs off on the new public reader HUD as accepted-with-boundary. Do not restore the old HUD. Continue monitoring only: no Rank details regression, no missing article.dataset.rankBasis, no Clicked Hebrew form/stale old-HUD markers, source/license footnotes remain visible and non-misleading, route lookup and answer-safety validators stay passing. Treat any public page that reintroduces old-HUD markers or hides source/license rows as a targeted regression, not a reason to revert the new HUD.
```

