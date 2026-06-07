# Agent 10 Book/HUD Small Post-Batch Addendum For A14

Status: `SMALL_UPDATE_READY_FOR_A14`

Boundary: preview/staging handoff only. No publication/release claim, no QA/source/license/legal/Definition/product/answer/accepted-text acceptance, no route-shard mutation, no public-runtime acceptance.

## Changed Files

Shared runtime/style:
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`

Reader-hint score metadata:
- `data/public-hud/orot/reader-hints.json`
- `data/public-hud/ruth/reader-hints.json`
- `data/public-hud/deuteronomy/reader-hints.json`
- `data/public-hud/genesis/reader-hints.json`
- `data/public-hud/exodus/reader-hints.json`
- `data/public-hud/leviticus/reader-hints.json`
- `data/public-hud/numbers/reader-hints.json`
- `data/public-hud/jonah/reader-hints.json`
- `data/public-hud/amos/reader-hints.json`
- `data/public-hud/zechariah/reader-hints.json`
- `data/public-hud/zephaniah/reader-hints.json`

## Purpose

1. Pre-HUD/HUD score consistency:
   - For direct reader-hint rows that reference a route card id, `match_percent` now uses the same route-card score shown inside the HUD.
   - When the prior reader-hint score differed, it is preserved as `reader_hint_match_percent`.
   - `route_score_percent` and `score_source: route_card_score` record the displayed-score source.
   - Definition text is not changed and no answer/Definition acceptance is implied.

2. Passage-to-row navigation:
   - Each Hebrew source token in pre-HUD row pages becomes a same-page link to its matching pre-HUD row.
   - Clicking a word in the passage scrolls to/highlights that token's gloss row.
   - It does not open the HUD, promote a definition, or change source/license behavior.

3. Definitions left in place:
   - No hardcoded one-card suppression remains in `assets/js/reader-workbench.js`.
   - The observed Israel/Kaikki definition remains visible for now.
   - Any future removal/demotion must be source/source-family or mechanically tagged class policy, not one-off deletion.

## Validation

Commands:
- `node --check assets/js/reader-workbench.js`
  - Result: passed.
- `node scripts/validate_route_hud_page.mjs --page orot/index.html --page tanakh/ruth/index.html --page tanakh/deuteronomy/index.html --page tanakh/genesis/index.html --page tanakh/exodus/index.html --page tanakh/leviticus/index.html --page tanakh/numbers/index.html --page tanakh/jonah/index.html --page tanakh/amos/index.html --page tanakh/zechariah/index.html --page tanakh/zephaniah/index.html --page tanakh/esther/index.html --page tanakh/ezra/index.html --page tanakh/nehemiah/index.html --page tanakh/obadiah/index.html --page tanakh/malachi/index.html`
  - Result: `Route HUD page validation passed for 16 page(s).`
- JSON parse check over all 11 changed `data/public-hud/*/reader-hints.json` files
  - Result: passed.
- `git diff --check -- assets/css/reader-workbench.css assets/js/reader-workbench.js data/public-hud/orot/reader-hints.json data/public-hud/ruth/reader-hints.json data/public-hud/deuteronomy/reader-hints.json data/public-hud/genesis/reader-hints.json data/public-hud/exodus/reader-hints.json data/public-hud/leviticus/reader-hints.json data/public-hud/numbers/reader-hints.json data/public-hud/jonah/reader-hints.json data/public-hud/amos/reader-hints.json data/public-hud/zechariah/reader-hints.json data/public-hud/zephaniah/reader-hints.json`
  - Result: no whitespace errors; CRLF replacement warnings only.

Browser proof:
- `http://127.0.0.1:8802/tanakh/ruth/`
  - Israel row pre-HUD sample: definition remains visible; percent now `80%`.
  - HUD sample: same Israel definition remains visible; HUD score mentions are `80%`.
  - Passage token links present: `1132`.
  - First passage link points to matching pre-HUD row id.
  - HUD scroll lock still works.

## Process Timeout Note

process_timeout | command | timeout | partial_output_or_artifact | next_safe_action
- `process_timeout` | first score-sync script over public HUD reader hints and route shards | `120000ms` | partial edits to Orot/Ruth/Deuteronomy and partial progress | replaced with direct normalized-key route-card lookup; optimized pass completed successfully in `60000ms`

## Exact A14 Callback

A10_BOOK_HUD_SMALL_POST_BATCH_ADDENDUM | status=`SMALL_UPDATE_READY_FOR_A14` | artifact=`reports/agent10-book-hud-small-post-batch-addendum-a14-2026-06-07.md` | changed_files=`assets/js/reader-workbench.js`, `assets/css/reader-workbench.css`, `data/public-hud/orot/reader-hints.json`, `data/public-hud/ruth/reader-hints.json`, `data/public-hud/deuteronomy/reader-hints.json`, `data/public-hud/genesis/reader-hints.json`, `data/public-hud/exodus/reader-hints.json`, `data/public-hud/leviticus/reader-hints.json`, `data/public-hud/numbers/reader-hints.json`, `data/public-hud/jonah/reader-hints.json`, `data/public-hud/amos/reader-hints.json`, `data/public-hud/zechariah/reader-hints.json`, `data/public-hud/zephaniah/reader-hints.json` | purpose=`score consistency between pre-HUD and HUD; Hebrew passage token jump-to-gloss-row; definitions left visible with no one-off suppression` | validators=`node --check` passed; `validate_route_hud_page` passed for 16 pages; JSON parse check passed; scoped `git diff --check` passed with CRLF warnings only | proof=`Ruth Israel row now shows 80% in pre-HUD and HUD while definition remains visible; 1132 passage token links present; HUD scroll lock still works` | A14_next_action=`include this addendum with the 16-page preview staging packet; do not remove individual definitions; any future definition removal/demotion must be source/source-family/tag-policy based` | boundary=`no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release claim`

Stop condition: A14 includes this small addendum in the owner-checkable preview set and waits for the owner approval before 1400-work expansion.
