# Agent 10 Full Corpus Batch 01 Flagship Render Staging Packet

Status: `BATCH01_19_READY_1_BLOCKED_DIRECT_RENDER_CONTRACT`

Purpose:
- Advance the full-corpus A10 flagship book/HUD render sendoff in 20-work batches.
- Preserve page visibility as Hebrew source + clickable token rows + canonical Route HUD + fail-closed `TBD`.
- Definition coverage is not a page-visibility blocker.

Corpus-wide correction applied:
- Shared runtime gate added in `assets/js/reader-workbench.js`.
- Pre-HUD suppresses unsafe display text at hydration time, even if an existing hint file still contains it.
- Suppressed pre-HUD classes:
  - usage-only display text
  - `form of ...`
  - `...: form of ...`
  - singular/plural/dual form-reference phrases
  - construct/absolute state, infinitive, bare infinitive, participle reference phrases
  - first/second/third-person reference phrases
  - vav-consecutive reference phrases
- HUD evidence remains inspectable; only pre-HUD fails closed to `TBD`.

Batch 01 works:

| # | work | page | token rows | configured hint rows | expected TBD rows | state |
| ---: | --- | --- | ---: | ---: | ---: | --- |
| 1 | Genesis | `tanakh/genesis/index.html` | 17808 | 3858 | 13950 | stage_candidate |
| 2 | Exodus | `tanakh/exodus/index.html` | 14481 | 5831 | 8650 | stage_candidate |
| 3 | Leviticus | `tanakh/leviticus/index.html` | 10205 | 3869 | 6336 | stage_candidate |
| 4 | Numbers | `tanakh/numbers/index.html` | 14323 | 5204 | 9119 | stage_candidate |
| 5 | Deuteronomy | `tanakh/deuteronomy/index.html` | 12595 | 2800 | 9795 | stage_candidate |
| 6 | Ruth | `tanakh/ruth/index.html` | 1132 | 676 | runtime suppresses unsafe hints | stage_candidate |
| 7 | Esther | `tanakh/esther/index.html` | 2654 | 975 | 1679 | stage_candidate |
| 8 | Ezra | `tanakh/ezra/index.html` | 3538 | 1107 | 2431 | stage_candidate |
| 9 | Nehemiah | `tanakh/nehemiah/index.html` | 4822 | 1848 | 2974 | stage_candidate |
| 10 | Daniel | `tanakh/daniel/index.html` | 5456 | 0 | 5456 | blocked_validator |
| 11 | Joshua | `tanakh/joshua/index.html` | 8581 | 0 | 8581 | stage_candidate |
| 12 | Judges | `tanakh/judges/index.html` | 8546 | 0 | 8546 | stage_candidate |
| 13 | I Samuel | `tanakh/i-samuel/index.html` | 11619 | 0 | 11619 | stage_candidate |
| 14 | II Samuel | `tanakh/ii-samuel/index.html` | 9603 | 0 | 9603 | stage_candidate |
| 15 | I Kings | `tanakh/i-kings/index.html` | 11402 | 0 | 11402 | stage_candidate |
| 16 | II Kings | `tanakh/ii-kings/index.html` | 10530 | 0 | 10530 | stage_candidate |
| 17 | Isaiah | `tanakh/isaiah/index.html` | 15450 | 0 | 15450 | stage_candidate |
| 18 | Jeremiah | `tanakh/jeremiah/index.html` | 18904 | 0 | 18904 | stage_candidate |
| 19 | Hosea | `tanakh/hosea/index.html` | 2132 | 0 | 2132 | stage_candidate |
| 20 | Joel | `tanakh/joel/index.html` | 866 | 0 | 866 | stage_candidate |

Files changed in this batch turn:
- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `scripts/build_reader_hints_from_route_lookup.mjs`
- `scripts/validate_reader_hints_from_route_lookup.mjs`
- `data/lexical/reader-hints/esther.json`
- `data/lexical/reader-hints/ezra.json`
- `data/lexical/reader-hints/nehemiah.json`
- `data/lexical/reader-hints/obadiah.json`
- `data/lexical/reader-hints/malachi.json`
- `reports/reader-hints-from-route-lookup-batch2-2026-06-07.md`
- `tanakh/joshua/index.html`
- `tanakh/judges/index.html`
- `tanakh/i-samuel/index.html`
- `tanakh/ii-samuel/index.html`
- `tanakh/i-kings/index.html`
- `tanakh/ii-kings/index.html`
- `tanakh/isaiah/index.html`
- `tanakh/jeremiah/index.html`
- `tanakh/hosea/index.html`
- `tanakh/joel/index.html`

Validators:
- `node --check assets/js/reader-workbench.js; node --check scripts/build_reader_hints_from_route_lookup.mjs; node --check scripts/validate_reader_hints_from_route_lookup.mjs` passed.
- `node scripts/build_reader_hints_from_route_lookup.mjs --works=esther,ezra,nehemiah,obadiah,malachi --report=reports/reader-hints-from-route-lookup-batch2-2026-06-07.md` passed.
- `node scripts/validate_reader_hints_from_route_lookup.mjs --works=esther,ezra,nehemiah,obadiah,malachi` passed.
- `node scripts/validate_route_hud_page.mjs` passed for the 19 stage-candidate Batch 01 pages.
- `node scripts/validate_route_hud_page.mjs tanakh/daniel/index.html` failed with exact Daniel blocker below.

Daniel exact blocker:
- `tanakh/daniel/index.html`: missing required marker `hero-summary`.
- `tanakh/daniel/index.html`: missing required marker `hero-notes`.
- `tanakh/daniel/index.html`: contains stale old-HUD marker `<big`.
- Daniel should remain ordinary source-page candidate only until the page shell is repaired and validator passes.

Corpus-wide existing-hint audit:
- Pages with configured hint files found: `16`.
- Hint files containing old unsafe display strings: `11`.
- Runtime gate now suppresses these at hydration; existing hint files do not have to be rewritten for pre-HUD safety.
- Example protected existing page: Ruth.

Browser/render proof:
- Ruth existing-hint gate:
  - URL: `http://127.0.0.1:8801/tanakh/ruth/?runtime-gate=1`
  - DOM artifact: `%TEMP%/codex-ruth-corpuswide-gate-dom-proof.html`
  - rows `1132`, compact meta cells `1132`, section links `1132`
  - populated pre-HUD rows after runtime suppression `379`
  - TBD rows `753`
  - bad pre-HUD gloss rows `0`
- Joel zero-hint source-page proof:
  - URL: `http://127.0.0.1:8801/tanakh/joel/?zero-hint=1`
  - DOM artifact: `%TEMP%/codex-joel-zero-hint-dom-proof.html`
  - rows `866`, compact meta cells `866`, section links `866`
  - populated pre-HUD rows `0`
  - TBD rows `866`
  - bad pre-HUD gloss rows `0`

A14 staging instruction:
- Stage Batch 01 as 19 render-ready pages plus 1 exact Daniel validator blocker.
- Do not treat definition/TBD counts as source/license/legal/Definition/answer acceptance.
- Preserve Orot/Ruth flagship behavior; the runtime gate is corpus-wide and should not be forked.
- For splash/library, list the full corpus as source-visible pages even when hint count is `0`.

Boundary:
- Render/pre-HUD gating only.
- No QA/source/license/legal/Definition/product/answer/accepted-text acceptance.
- No publication/release claim.
- No public runtime acceptance.
