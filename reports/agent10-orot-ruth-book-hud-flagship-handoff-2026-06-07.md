# Agent 10 Book/HUD Flagship Handoff To A14

Date: 2026-06-07
Mode: book/HUD page process handoff only

## Target

Promote the current Agent 10 book/HUD page contract as the live flagship pattern:

- Primary flagship render target: `orot/index.html`
- Same-contract proof target: `tanakh/ruth/index.html`
- Shared runtime/CSS contract: `assets/js/reader-workbench.js`, `assets/css/reader-workbench.css`

## Files In Scope

- `orot/index.html`
- `tanakh/ruth/index.html`
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`
- `reports/agent10-orot-ruth-book-hud-flagship-handoff-2026-06-07.md`

## Product Contract

- Compact book header.
- Header source/license moved into collapsed `Source / license` disclosure.
- Full Hebrew passage remains visible above the pre-HUD row layer.
- Every Hebrew token renders as one row in `reader_layout_mode: prehud_rows`.
- Row layout: Hebrew token, full wrapped selected gloss or quiet `TBD`, match/status affordance.
- Gloss and match cells are visibly inspectable and open the same canonical Route HUD as the Hebrew token.
- Route HUD behavior remains canonical Agent 10/Orot behavior: card selector, source/license details, local study-note selection language, no fake/manual definition promotion.
- Book page scroll locks while Route HUD is open.
- Hebrew row token uses RTL direction and bidi isolation.

## Orot Proof

URL:
- `http://127.0.0.1:8802/orot/`

Static validation:
- `node --check assets/js/reader-workbench.js` passed.
- `node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/ruth/index.html` passed.
- `git diff --check -- orot/index.html tanakh/ruth/index.html assets/css/reader-workbench.css assets/js/reader-workbench.js` passed with CRLF replacement warnings only.

Runtime proof observed:
- `reader_layout_mode`: `prehud_rows`
- Orot row layer hydrated.
- Row click opens Route HUD.
- Route HUD title loads for clicked token.
- Route HUD settles to definition option and source/license evidence.
- Page scroll lock active while HUD is open.

Screenshot proof:
- `C:/Users/owner/AppData/Local/Temp/orot-preview-header-2026-06-07.png`

## Ruth Proof

URL:
- `http://127.0.0.1:8802/tanakh/ruth/`

Static validation:
- Same validator set above passed for Ruth.

Runtime proof observed:
- `reader_layout_mode`: `prehud_rows`
- Units: `85`
- Rows: `1132`
- First row rendered Hebrew token, full wrapped gloss, and match percent.
- Row click opened canonical Route HUD.
- Route HUD included definition option and source/license evidence.
- Page scroll lock active while HUD is open.
- Browser console error/warning log: none observed during proof.

Screenshot proof:
- `C:/Users/owner/AppData/Local/Temp/ruth-preview-header-2026-06-07.png`
- `C:/Users/owner/AppData/Local/Temp/ruth-preview-hud-row-2026-06-07.png`

## A14 Handoff

A14 should treat this as the Agent 10 canonical book/HUD page packet for website organization and live flagship staging.

Expected A14 action:
- Use `orot/index.html` as the flagship book/HUD page target.
- Link/promote `orot/index.html` from the splash/library as the live flagship book/HUD example.
- Preserve `tanakh/ruth/index.html` as the same-contract Tanakh proof page.
- Do not redesign the HUD.
- Do not replace the shared `reader-workbench` contract with a separate mock path.
- Do not remove source/license disclosures or Route HUD source/license evidence.
- Do not flatten `TBD` into definition text.

## Boundary

This packet does not claim QA acceptance, source/license/legal acceptance, Definition authority, answer acceptance, accepted gloss/text, publication readiness, or release completion.

No public deploy, staging, commit, or release action was performed by Agent 10.

Stop condition for A14:
- Stage or prepare only the scoped files above for the owner-requested live flagship route, or return an exact blocker naming the missing file, command, approval gate, or publish path.
