# Agent 10 Book/HUD Batch 1 Handoff

Status: `preview_ready_for_owner_and_a14_review`

Boundary: preview/package handoff only. No publication/release claim, no QA/source/license/legal/Definition/product/answer/accepted-text acceptance, no route-shard mutation, no public-runtime acceptance.

## What Changed

Shared book/HUD behavior:
- `assets/css/reader-workbench.css`
  - Pre-HUD rows now visibly read as clickable before hover: Hebrew token, gloss/TBD cell, and match/TBD cell have bordered resting affordances, pointer cursor, and dotted underline on the clickable text surfaces.
- `assets/js/reader-workbench.js`
  - Existing Orot/Ruth row-mode behavior preserved: `reader_layout_mode: "prehud_rows"` renders one source token per row and opens the canonical Route HUD from the row/cells.
  - Visible row text uses Hebrew source surface fallback instead of token ids when token-row lookup is unavailable.

Owner-approved flagship/example pages already in the same style:
- `orot/index.html`
- `tanakh/ruth/index.html`

Batch 1 converted to the same Orot/Ruth row-mode style:
- `tanakh/deuteronomy/index.html`
- `tanakh/genesis/index.html`
- `tanakh/exodus/index.html`
- `tanakh/leviticus/index.html`
- `tanakh/numbers/index.html`
- `tanakh/jonah/index.html`
- `tanakh/amos/index.html`
- `tanakh/zechariah/index.html`
- `tanakh/zephaniah/index.html`

Per-page changes in Batch 1:
- Compact header and collapsed source/license disclosure.
- `reader_layout_mode: "prehud_rows"` added to each page's existing lexical config.
- Known safe generated Hebrew markers decoded in these page bodies only:
  - `&amp;thinsp;` to `&thinsp;`
  - `&amp;nbsp;` to `&nbsp;`
  - escaped `{פ}` span marker back to its intended generated span

## Validation

Commands:
- `node --check assets/js/reader-workbench.js`
  - Result: passed.
- `node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/ruth/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html --page tanakh/exodus/index.html --page tanakh/leviticus/index.html --page tanakh/numbers/index.html --page tanakh/jonah/index.html --page tanakh/amos/index.html --page tanakh/zechariah/index.html --page tanakh/zephaniah/index.html`
  - Result: `Route HUD page validation passed for 11 page(s).`
- `git diff --check -- assets/css/reader-workbench.css assets/js/reader-workbench.js orot/index.html tanakh/ruth/index.html tanakh/deuteronomy/index.html tanakh/genesis/index.html tanakh/exodus/index.html tanakh/leviticus/index.html tanakh/numbers/index.html tanakh/jonah/index.html tanakh/amos/index.html tanakh/zechariah/index.html tanakh/zephaniah/index.html index.html`
  - Result: no whitespace errors; CRLF replacement warnings only.
- Safe marker scan over Orot/Ruth/Batch 1:
  - Result: zero remaining `&amp;thinsp;`, visible `;thinsp`, or escaped `{פ}` span marker hits in the checked files.

Browser proof:
- `http://127.0.0.1:8802/tanakh/deuteronomy/`
  - `reader_layout_mode`: `prehud_rows`
  - Observed pre-HUD rows: `10507`
  - First row sample: Hebrew token / full wrapped gloss / `94%`
  - No sampled `tok-*` leakage.
  - Hebrew token and gloss show resting clickable affordance.
  - Canonical Route HUD opens from row click; source/license area remains inspectable; scroll lock engages.
- `http://127.0.0.1:8802/tanakh/zephaniah/`
  - `reader_layout_mode`: `prehud_rows`
  - Observed pre-HUD rows: `674`
  - First row sample: Hebrew token / `TBD` / `TBD`
  - No sampled `tok-*` leakage.
  - Hebrew marker artifact fixed: no visible `thinsp` text in the passage sample.

## Process Timeouts

process_timeout | command | timeout | partial_output_or_artifact | next_safe_action
- `process_timeout` | targeted `Select-String` loop over 9 page files for config/header inspection | `12000ms` | partial page/header evidence printed through Exodus | replaced with narrower raw-file config check over exact target list
- `process_timeout` | paired `Get-Content` CSS excerpt + `git status` check | `10000ms` | CSS excerpt was partial; git status output completed separately | reran smaller targeted reads and proceeded only after validators passed

## A14 Callback

A10_BOOK_HUD_BATCH1_HANDOFF | status=`preview_ready_for_owner_and_a14_review` | files=`assets/css/reader-workbench.css`, `assets/js/reader-workbench.js`, `orot/index.html`, `tanakh/ruth/index.html`, `tanakh/deuteronomy/index.html`, `tanakh/genesis/index.html`, `tanakh/exodus/index.html`, `tanakh/leviticus/index.html`, `tanakh/numbers/index.html`, `tanakh/jonah/index.html`, `tanakh/amos/index.html`, `tanakh/zechariah/index.html`, `tanakh/zephaniah/index.html`, `index.html` | validated=`node --check assets/js/reader-workbench.js`; `validate_route_hud_page` passed for 11 pages; `git diff --check` no whitespace errors except CRLF warnings | preview=`http://127.0.0.1:8802/orot/`, `http://127.0.0.1:8802/tanakh/ruth/`, `http://127.0.0.1:8802/tanakh/deuteronomy/`, `http://127.0.0.1:8802/tanakh/zephaniah/` | owner boundary=`Orot/Ruth are flagship/examples; Batch 1 is owner-review batch before the next 5-page approval batch` | A14 action=`review and prepare push/publish packet only after owner approval; do not rewrite the canonical book/HUD behavior` | boundary=`no source/license/legal/Definition/product/answer/release acceptance; no accepted gloss/text; no publication readiness claim`

## Exact Routing Blocker

`a14_thread_delivery_blocker`: current session exposes no callable thread-send tool after discovery. Packet is preserved here for A14/local handoff.

Stop condition: owner/A14 review of Orot, Ruth, and Batch 1 preview pages; no next batch until owner approves this batch.
