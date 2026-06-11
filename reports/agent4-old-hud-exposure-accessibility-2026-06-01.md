# Agent 5 Route HUD Accessibility Audit

Generated: 2026-06-02T12:43:37.037Z

## Scope

- Pages: tanakh/genesis/index.html, halakhah/urim-vetumim-urim/index.html, other/beer-hagolah/index.html, targum/targum-jonathan-on-genesis/index.html
- Shared render script: scripts/render_site.ps1
- Validator script: scripts/validate_route_hud_page.mjs
- This is a static control audit, not a browser assistive-technology test.
- Shared runtime asset: assets/js/reader-workbench.js

## Summary

- info: 5

## Issue Counts

- runtime_wrapped_lexical_words: 4
- dense_inline_targets: 1

## Findings

- info / dense_inline_targets / shared-runtime: Word targets are intentionally inline and dense; WCAG has inline-target exceptions, but a touch/large-target mode should be a product requirement.
- info / runtime_wrapped_lexical_words / tanakh/genesis/index.html: No static lexical-word spans found; page intentionally relies on runtime wrapping.
- info / runtime_wrapped_lexical_words / halakhah/urim-vetumim-urim/index.html: No static lexical-word spans found; page intentionally relies on runtime wrapping.
- info / runtime_wrapped_lexical_words / other/beer-hagolah/index.html: No static lexical-word spans found; page intentionally relies on runtime wrapping.
- info / runtime_wrapped_lexical_words / targum/targum-jonathan-on-genesis/index.html: No static lexical-word spans found; page intentionally relies on runtime wrapping.

## Control Interpretation

- The current HUD is not a tooltip: it contains structured, focusable, source-rich workbench content.
- The current runtime behaves as a non-modal inspector with explicit trigger relationships through `aria-haspopup`, `aria-controls`, and `aria-expanded`.
- Dense inline targets are product-correct for workbench mode, but a large-target/touch mode should exist before marketing this as polished.

