# Agent 10 Book/HUD Batch 2 And Combined 16 Handoff

Status: `combined_16_preview_ready_for_owner_check_and_a14_staging_packet`

Boundary: preview/staging handoff only. No publication/release claim, no QA/source/license/legal/Definition/product/answer/accepted-text acceptance, no route-shard mutation, no public-runtime acceptance.

## Combined 16 Pages

Flagship / contract proof:
- `orot/index.html`
- `tanakh/ruth/index.html`

Batch 1:
- `tanakh/deuteronomy/index.html`
- `tanakh/genesis/index.html`
- `tanakh/exodus/index.html`
- `tanakh/leviticus/index.html`
- `tanakh/numbers/index.html`
- `tanakh/jonah/index.html`
- `tanakh/amos/index.html`
- `tanakh/zechariah/index.html`
- `tanakh/zephaniah/index.html`

Batch 2 / new five:
- `tanakh/esther/index.html`
- `tanakh/ezra/index.html`
- `tanakh/nehemiah/index.html`
- `tanakh/obadiah/index.html`
- `tanakh/malachi/index.html`

Shared canonical files:
- `assets/css/reader-workbench.css`
- `assets/js/reader-workbench.js`

Optional root/splash-adjacent file already in current packet:
- `index.html`

## Batch 2 Changes

Applied the Orot/Ruth book-HUD render style to the new five:
- Compact header.
- Collapsed source/license disclosure.
- `reader_layout_mode: "prehud_rows"`.
- Known safe generated Hebrew marker cleanup.
- No Orot mutation in this batch.
- No fake/TBD promotion.
- No definition/answer/source/license acceptance.

## Validation

Commands:
- `node --check assets/js/reader-workbench.js`
  - Result: passed.
- `node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/ruth/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html --page tanakh/exodus/index.html --page tanakh/leviticus/index.html --page tanakh/numbers/index.html --page tanakh/jonah/index.html --page tanakh/amos/index.html --page tanakh/zechariah/index.html --page tanakh/zephaniah/index.html --page tanakh/esther/index.html --page tanakh/ezra/index.html --page tanakh/nehemiah/index.html --page tanakh/obadiah/index.html --page tanakh/malachi/index.html`
  - Result: `Route HUD page validation passed for 16 page(s).`
- `git diff --check -- assets/css/reader-workbench.css assets/js/reader-workbench.js index.html orot/index.html tanakh/ruth/index.html tanakh/deuteronomy/index.html tanakh/genesis/index.html tanakh/exodus/index.html tanakh/leviticus/index.html tanakh/numbers/index.html tanakh/jonah/index.html tanakh/amos/index.html tanakh/zechariah/index.html tanakh/zephaniah/index.html tanakh/esther/index.html tanakh/ezra/index.html tanakh/nehemiah/index.html tanakh/obadiah/index.html tanakh/malachi/index.html`
  - Result: no whitespace errors; CRLF replacement warnings only.
- Safe marker scan over all 16 pages:
  - Result: zero remaining `&amp;thinsp;`, visible `;thinsp`, or escaped generated span marker hits in checked files.

Browser proof:
- `http://127.0.0.1:8802/tanakh/esther/`
  - `reader_layout_mode`: `prehud_rows`
  - Observed pre-HUD rows: `2654`
  - First row sample: Hebrew token / `TBD` / `TBD`
  - No sampled `tok-*` leakage.
  - No visible bad Hebrew marker.
  - Hebrew/gloss cells have resting clickable affordance.
  - Route HUD opens from row click; source/license evidence remains inspectable.
- `http://127.0.0.1:8802/tanakh/obadiah/`
  - `reader_layout_mode`: `prehud_rows`
  - Observed pre-HUD rows: `249`
  - First row sample: Hebrew token / `TBD` / `TBD`
  - No sampled `tok-*` leakage.
  - No visible bad Hebrew marker.
  - Hebrew/gloss cells have resting clickable affordance.
  - Route HUD opens from row click; source/license evidence remains inspectable.

## A14 Staging Request

A14 should prepare the 16 pages as the owner-checkable book/HUD render baseline set.

Featured placement:
- Feature/display all 16 as current review candidates if owner wants the preview surface to show the full batch.
- Keep Orot and Ruth as flagship/proof anchors.
- Keep all Tanakh pages under the Tanakh corpus group.
- Keep Orot under its correct Thought / modern Hebrew thought placement, not under Tanakh and not under generic Other.

Do not:
- Rewrite A10 book/HUD behavior.
- Change the Orot page beyond already approved shared CSS behavior.
- Promote `TBD` to definition/gloss/answer.
- Publish/release without owner approval.
- Collapse source/license/provenance boundaries.

## Exact A14 Callback

A10_BOOK_HUD_COMBINED16_HANDOFF | status=`combined_16_preview_ready_for_owner_check_and_a14_staging_packet` | artifact=`reports/agent10-book-hud-batch2-five-and-combined16-handoff-2026-06-07.md` | pages=`orot/index.html`, `tanakh/ruth/index.html`, `tanakh/deuteronomy/index.html`, `tanakh/genesis/index.html`, `tanakh/exodus/index.html`, `tanakh/leviticus/index.html`, `tanakh/numbers/index.html`, `tanakh/jonah/index.html`, `tanakh/amos/index.html`, `tanakh/zechariah/index.html`, `tanakh/zephaniah/index.html`, `tanakh/esther/index.html`, `tanakh/ezra/index.html`, `tanakh/nehemiah/index.html`, `tanakh/obadiah/index.html`, `tanakh/malachi/index.html` | shared=`assets/css/reader-workbench.css`, `assets/js/reader-workbench.js` | validators=`node --check assets/js/reader-workbench.js` passed; `validate_route_hud_page` passed for 16 pages; scoped `git diff --check` passed with CRLF warnings only | proof=`Esther: prehud_rows/2654 rows/no sampled tok leak/HUD opens`; `Obadiah: prehud_rows/249 rows/no sampled tok leak/HUD opens`; prior Deuteronomy and Zephaniah proofs preserved in Batch 1 packet | A14_next_action=`stage/feature all 16 as owner-checkable preview candidates with correct corpus placement; Orot/Ruth remain proof anchors; Tanakh pages stay under Tanakh; Orot stays under Thought/modern Hebrew thought; do not publish/release until the owner approves` | boundary=`no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release claim`

Stop condition: A14 stages/prepares the 16-page preview set for owner check; no additional batch until owner responds.
