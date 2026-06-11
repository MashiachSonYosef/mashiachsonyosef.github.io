# Reader Workbench Boundary Report

## 2026-06-01 Local-Only Pilot Hardening

- Scope: Reader Workbench / Guided Gloss Assembly pilot.
- Status: local-only workbench functionality; not publication mode and not translation output.
- Publication wall: remains `blocked_no_render`; no broad render was run for this hardening.
- Public HUD boundary: accepted-with-boundary; do not restore the old HUD.

## Runtime Guards

- Top-level imports now reject `gloss_assembly` / `gloss_selection` JSON when `publication_status` is missing or not `not_a_translation`.
- Imported selection rows now reject when required contract fields are missing.
- Imported selection rows now reject when `source_rows` are missing or any row lacks `source_name`, `source_id`, `source_url`, `license`, or `license_url`.
- Stored/exported selections are filtered through the same selection contract.
- Evidence-only fallback route cards now display as `Evidence only`, are marked `data-evidence-only="true"`, and have disabled selection buttons.
- `saveSelection` now refuses non-answer-eligible or evidence-only cards even if called programmatically.
- `selectRouteAnswer` now excludes usage-evidence cards before they can enter the reader-facing Definition slot, even if upstream data mislabels the card as answer-eligible.
- Reader Workbench exports stay browser-local as `reader-workbench-study-sheet.json`; the runtime has no `data/translation-memory` write path.

## Evidence

- `node --check assets\js\reader-workbench.js` passed.
- `node --check scripts\validate_reader_workbench_boundary.mjs` passed.
- `node scripts\validate_reader_workbench_boundary.mjs` passed with 21 checks, including executable import fixtures for valid rows, missing/wrong top-level `publication_status`, missing contract fields, missing source/license fields, evidence-only imported selections, and usage-evidence answer blocking.
- `Select-String -LiteralPath assets\js\reader-workbench.js,scripts\render_site.ps1 -Pattern 'translation-memory|translation_memory|data/translation-memory'` returned no matches.
- `node scripts\validate_route_hud_page.mjs` passed for Genesis, Sefer Etz Chaim, Beer HaGolah, and Netivot HaMishpat Beurim.
- `node scripts\audit_route_hud_accessibility.mjs` passed with 0 errors and 0 warnings for the same 4-page sample.

## Pass / Fail Counts

- Boundary contract: 21 passed / 0 failed.
- Executable boundary fixtures: 9 passed / 0 failed.
- Syntax checks: 2 passed / 0 failed.
- Representative route HUD pages: 4 passed / 0 failed.
- Accessibility sample: 4 pages checked, 0 errors, 0 warnings, 5 informational notes.
- Translation-memory path check: 2 runtime/generator files checked, 0 matches.

## Caveat

- Browser click proof was not available in this session because the in-app browser backend returned unavailable. This report is static/runtime-source evidence only.
