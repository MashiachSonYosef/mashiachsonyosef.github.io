# Agent 10 HUD Reader Hint Evidence - 2026-06-02

## Scope

- Change: added bounded pre-click reader hints beside Hebrew tokens in the lightweight Deuteronomy HUD page.
- Public hint file: `data/public-hud/deuteronomy/reader-hints.json`.
- Page config: `tanakh/deuteronomy/index.html` now points to `reader_hint_url`.
- Runtime: `assets/js/reader-workbench.js` loads reader hints after token wrapping, before saved selections are restored.
- Styling: `assets/css/reader-workbench.css` places the hint inline beside the Hebrew token.

## Boundary

- Publication status remains `not_a_translation`.
- The hint is not written as `data-selected-gloss`.
- The workbench assembly stays hidden until a user actually selects a HUD card.
- The route HUD click path remains the authority surface for route cards and source/license display.
- This does not clear Agent 6 acceptance, definition authority, or full lexical publication readiness.

## Source Choice

- Coverage: `1,356` unique token hint rows from `8,113` Deuteronomy unique surface forms.
- Rendered effect: `3,122` visible pre-click hints across the Deuteronomy page in browser proof.
- Basis counts: `169` resolved surface renderings, `1,186` strict renderings, `1` sentinel override.
- Skipped: `1,092` unresolved entries and `5,666` unmatched/empty rows.
- Sentinel token: `tok-21613e763fe6`; display hint `these`; OpenScriptures HebrewLexicon `H428`, CC BY 4.0.
- Rationale: the route lookup's highest answer candidates for this sentinel surface include unsafe alternatives for a pre-click hint, so the sentinel hint uses a bounded source row rather than mirroring the top route card.

## Local Validation

- `node --check assets/js/reader-workbench.js`: passed.
- JSON/config parse: `reader-hints.json` has `1,356` hints; sentinel display is `these`; page config `reader_hint_url` points to `../../data/public-hud/deuteronomy/reader-hints.json`.
- `node scripts/validate_route_hud_page.mjs --page .codex-tmp\hud-deploy-live\tanakh\deuteronomy\index.html`: passed.
- Old-HUD marker scan against sparse deploy files: no matches.

## Commit And Deploy

- Runtime commit: `878f5a28457ff023af420dfc973e412bc2a7980a`.
- Expanded hint commit: `f7ee327de7e15a9c20136ebf9e9c05421811756d`.
- Both pushed to `main`.
- Runtime workflow: `Deploy Lightweight Pages` run `26825214766`, success; build `79090621923`, deploy `79090659447`, both success.
- Expanded hint workflow: `Deploy Lightweight Pages` run `26826090664`, success.
- Runtime artifact: `github-pages` artifact `7360068604`, `257245` bytes.
- Runtime deployment: `4905433828`, status `13977364208`, success.
- Live expanded `reader-hints.json`: HTTP `200`, `488,935` bytes, `1,356` hints, sentinel display `these`.
- Live root `/`: HTTP `200`, links only to `tanakh/deuteronomy/` plus favicon.
- Live old Genesis path: HTTP `404`, custom `Not Published`, no old-HUD markers.

## Browser Proof

- Browser proof was run against the sparse local deploy tree and again against the live GitHub Pages URL after deployment.
- Desktop viewport `1366x900`:
  - Pre-click token hint text: `these`.
  - Visible hints: `3,122`.
  - Hint mode: `hint`.
  - `data-selected-gloss`: absent.
  - Workbench panel: hidden.
  - HUD title after click: loaded for the sentinel Hebrew surface.
  - Route cards: `53`; answer cards: `1`.
  - HUD rect: `0,0,1366,900`.
  - Console issues: `0`.
- Mobile viewport `390x844`:
  - Pre-click token hint text: `these`.
  - Visible hints: `3,122`.
  - Hint mode: `hint`.
  - `data-selected-gloss`: absent.
  - Workbench panel: hidden.
  - Route cards: `53`; answer cards: `1`.
  - HUD rect: `0,0,390,844`.
  - Console issues: `0`.

## Pending

- Full Deuteronomy coverage is intentionally incomplete: unresolved and unmatched rows are skipped rather than guessed.
- This evidence does not clear Agent 6 acceptance, definition authority, or full lexical publication readiness.
