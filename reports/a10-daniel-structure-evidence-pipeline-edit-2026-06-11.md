# A10 Daniel Structure Evidence Pipeline Edit - 2026-06-11

## Status

pipeline_edit_ready_with_contract_validator

## Baseline Preserved

- Orot remains the good-enough canonical HUD/book reference.
- Existing book page shell and Route HUD popout behavior are preserved.
- One clicked surface token still opens one HUD instance.
- preHUD remains fail-closed to `TBD` unless a safe route-backed answer clears the existing gate.
- No source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance is claimed.

## Pipeline Edit

- Regenerated `tanakh/daniel/index.html` through the existing site renderer so Daniel uses the same generated book-page shell markers as the Orot/corpus render path:
  - `.shell`;
  - nested `.reader-shell`;
  - generated table of contents;
  - generated source/license header;
  - `work_id`, `work_slug`, and `work_title` in `data-lexical-config`;
  - `reader_layout_mode=prehud_rows`.
- Daniel is the second work target.
- Added one Daniel 1:1 structure-only route card for `לְמַלְכ֖וּת`.
- The card explains `ל־` plus base route key `מלכות` as structure/navigation evidence.
- The card is not answer eligible, not display eligible for preHUD, and not a definition source.
- Shared HUD validated-only filtering now allows explicitly safe `token_structure_rule` evidence while continuing to block it from selected definition/preHUD promotion.
- Shared crossmatch HUD wording is neutral and no longer hardcodes Daniel.
- Removed Daniel's missing `reader_hints_url` pointer. Daniel remains intentionally `TBD` until a real reader-hints file is generated, but `TBD` tokens still use the shared Route HUD click path.
- Fixed the preHUD passage-token click path: clicking a Hebrew word in the top source passage now both targets the matching preHUD row and opens the same Route HUD instead of bubbling into the outside-click close handler.
- The blank/TBD HUD frame now includes the dedicated `Word-part breakdown` section, with an empty placeholder when no structure evidence exists.
- Structure-only evidence is rendered inside `Word-part breakdown`; it is no longer offered as a `Choose a study gloss` option.
- Added `scripts/validate_reader_page_contract.mjs` as the narrow Orot-style book/HUD contract guard:
  - generated page shell;
  - shared reader CSS/JS;
  - `data-lexical-config`;
  - `reader_layout_mode=prehud_rows`;
  - lexical occurrence and HUD roots;
  - optional reader-hints URL must resolve if declared;
  - blank Route HUD frame for `TBD` tokens;
  - top-passage preHUD links open the Route HUD and do not immediately close it;
  - dedicated `Word-part breakdown` section and evidence-only structure rendering;
  - neutral crossmatch wording;
  - evidence-only structure-card boundary.
- Hardened `scripts/render_site.ps1` so future lexical pages emit `reader_layout_mode=prehud_rows` in both external and embedded lexical-config branches.
- Used the patched renderer to repair the first active-site contract drift found by the validator:
  - 11 Ari pages;
  - `chasidut/bepardes-hachasidut-vehakabbalah/index.html`.

## Changed Files

- `assets/js/reader-workbench.js`
- `scripts/render_site.ps1`
- `scripts/validate_reader_page_contract.mjs`
- `tanakh/daniel/index.html`
- `ari/pri-etz-chaim/index.html`
- `ari/sefer-etz-chaim/index.html`
- `ari/shaar-hagilgulim/index.html`
- `ari/shaar-hahakdamot/index.html`
- `ari/shaar-hakavanot/index.html`
- `ari/shaar-hamitzvot/index.html`
- `ari/shaar-hapesukim/index.html`
- `ari/shaar-maamarei-rashbi/index.html`
- `ari/shaar-maamarei-razal/index.html`
- `ari/shaar-ruach-hakodesh/index.html`
- `ari/shaarei-kedusha/index.html`
- `chasidut/bepardes-hachasidut-vehakabbalah/index.html`
- `data/definitions/hud-route-lookup-daniel/manifest.json`
- `data/definitions/hud-route-lookup-daniel/shards/05dc-05de-05dc.json`

## Existing Prior POC Dirt Still Present

- `data/public-hud/orot/route-lookup/manifest.json`
- `data/public-hud/orot/route-lookup/shards/05d9-05e9-05e8.json`
- `reports/orot-1-1-single-token-structure-evidence-poc.html`
- `reports/a10-orot-real-hud-structure-evidence-popout-poc-2026-06-11.md`

## Validation

- `powershell -ExecutionPolicy Bypass -File scripts/render_site.ps1 -WorkIds daniel -SkipOverlayExports -SkipLexicalPayloadFiles` completed.
- `powershell -NoProfile -ExecutionPolicy Bypass -Command "& { ./scripts/render_site.ps1 -WorkIds 'pri-etz-chaim','sefer-etz-chaim','shaar-hagilgulim','shaar-hahakdamot','shaar-hakavanot','shaar-hamitzvot','shaar-hapesukim','shaar-maamarei-rashbi','shaar-maamarei-razal','shaar-ruach-hakodesh','shaarei-kedusha' -SkipOverlayExports -SkipLexicalPayloadFiles }"` completed.
- `powershell -NoProfile -ExecutionPolicy Bypass -Command "& { ./scripts/render_site.ps1 -WorkIds 'bepardes-hachasidut-vehakabbalah' -SkipOverlayExports -SkipLexicalPayloadFiles }"` completed.
- `node scripts/validate_route_hud_page.mjs --page tanakh/daniel/index.html orot/index.html` passed.
- `node scripts/validate_route_hud_page.mjs --page ari/pri-etz-chaim/index.html ari/sefer-etz-chaim/index.html ari/shaar-hagilgulim/index.html ari/shaar-hahakdamot/index.html ari/shaar-hakavanot/index.html ari/shaar-hamitzvot/index.html ari/shaar-hapesukim/index.html ari/shaar-maamarei-rashbi/index.html ari/shaar-maamarei-razal/index.html ari/shaar-ruach-hakodesh/index.html ari/shaarei-kedusha/index.html` passed.
- `node scripts/validate_route_hud_page.mjs --page chasidut/bepardes-hachasidut-vehakabbalah/index.html` passed.
- `node scripts/validate_reader_page_contract.mjs --page orot/index.html --page tanakh/daniel/index.html --structure-shard data/public-hud/orot/route-lookup/shards/05d9-05e9-05e8.json --structure-shard data/definitions/hud-route-lookup-daniel/shards/05dc-05de-05dc.json` passed.
- `node scripts/validate_reader_page_contract.mjs --all-reader-pages --max-pages 25` passed after Ari and BePardes rerenders.
- `node scripts/validate_reader_hints_from_route_lookup.mjs` passed.
- `node --check assets/js/reader-workbench.js` passed.
- `node --check scripts/validate_reader_page_contract.mjs` passed.
- `node scripts/validate_reader_page_contract.mjs --page orot/index.html --page tanakh/daniel/index.html --structure-shard data/definitions/hud-route-lookup-daniel/shards/05dc-05de-05dc.json` passed after the click-open fix.
- `node scripts/validate_route_hud_page.mjs --page tanakh/daniel/index.html orot/index.html` passed after the click-open fix.
- PowerShell parser check for `scripts/render_site.ps1` passed.
- `node scripts/validate_definition_outputs.mjs` passed.
- Local HTTP route probe passed against `http://127.0.0.1:8812/tanakh/daniel/`:
  - status `200`;
  - page contains `data-lexical-config`;
  - page contains `data-route-hud-panel`;
  - page contains `reader_layout_mode`;
  - no visible `<big` marker.
- Headless Chrome DevTools click proof passed:
  - target page `http://127.0.0.1:8812/tanakh/daniel/`;
  - clicked token `לְמַלְכ֖וּת` via `data-lexical-token=tok-503d8e7c74c6-3`;
  - normal Route HUD panel exists and is visible;
  - HUD shows `Word-part breakdown`;
  - HUD shows evidence-only structure text for `ל־` plus base key `מלכות`;
  - HUD shows neutral `Same Hebrew form` copy;
  - HUD does not show `Same Hebrew form in Daniel`;
  - HUD does not show private/project-authored source markers.
- Headless Chrome DevTools top-passage click proof passed after the click-open fix:
  - target page `http://127.0.0.1:8820/tanakh/daniel/`;
  - clicked first Daniel 1:1 top-passage Hebrew word;
  - `hudHidden=false`;
  - HUD title `Route HUD: בִּשְׁנַ֣ת`;
  - HUD includes `Definition`, `Strict Hebrew`, `Strict Aramaic`, and `Word-part breakdown`;
  - HUD does not show `Same Hebrew form in Daniel` or `No other Daniel passage`.
- Headless Chrome DevTools structure-token click proof passed after the gloss-picker guard:
  - target page `http://127.0.0.1:8822/tanakh/daniel/`;
  - clicked generated token id `tok-503d8e7c74c6`;
  - `hudHidden=false`;
  - HUD title `Route HUD: לְמַלְכ֖וּת`;
  - HUD includes `Word-part breakdown` with structure evidence for prefix/base routing;
  - HUD does not show `Choose a study gloss` for the structure-only evidence;
  - HUD does not show Daniel-specific crossmatch wording.
- Headless Chrome DevTools comprehensive Daniel click proof passed:
  - target page `http://127.0.0.1:8823/tanakh/daniel/`;
  - generated `5456` preHUD rows;
  - generated `5456` top-passage links;
  - Daniel 1:1 has `12` generated preHUD rows;
  - top-passage `TBD` click opens HUD and leaves `hudHidden=false`;
  - preHUD row `TBD` click opens HUD and leaves `hudHidden=false`;
  - preHUD gloss-cell `TBD` click opens HUD and leaves `hudHidden=false`;
  - preHUD match-cell `TBD` click opens HUD and leaves `hudHidden=false`;
  - each `TBD` click shows `Definition`, `No validated definition`, `Strict Hebrew`, `Strict Aramaic`, and `Word-part breakdown`;
  - each `TBD` click avoids `Choose a study gloss`;
  - each `TBD` click avoids Daniel-specific HUD wording;
  - structure-token click on `tok-503d8e7c74c6` opens HUD and leaves `hudHidden=false`;
  - structure-token click shows `Word-part breakdown` with structure evidence;
  - structure-token evidence is not offered as a study gloss.
- Daniel config check passed after cleanup:
  - no `reader_hints_url` or `reader_hint_url` is declared while `data/public-hud/daniel/reader-hints.json` does not exist;
  - `TBD` state is data-honest rather than caused by a missing reader-hints URL.
- Custom Daniel generated page contract check passed:
  - `.shell`;
  - `.reader-shell`;
  - `work_id=daniel`;
  - `work_title=Daniel`;
  - `reader_layout_mode=prehud_rows`;
  - scoped Daniel route manifest;
  - Daniel crossmatch URL;
  - clean Hebrew source text.
- Custom Daniel structure card check passed:
  - card present under normalized key `למלכות`;
  - `answer_eligible=false`;
  - `answer_role=evidence`;
  - `morphology.prehud_allowed=false`;
  - `morphology.display_eligible=false`;
  - source row `source_family=token_structure_rule`;
  - source row `license=not_a_definition_source`;
  - no project/private abbreviation source markers.
- Scoped `git diff --check` passed with CRLF warnings only.
- Local HTTP probe timed out and is not used as proof:
  - `process_timeout | Invoke-WebRequest http://127.0.0.1:8801/tanakh/daniel/ | 30s | no completed HTTP response | verify through browser/local server after refresh`.
- First local server startup attempt timed out and is not used as proof:
  - `process_timeout | start local HTTP server on 127.0.0.1:8812 with Python http.server | 10s | no completed server receipt and Python was unavailable | next safe action: use bounded Node static server instead`.
- Full all-reader-pages contract scan timed out and is not used as proof:
  - `process_timeout | node scripts/validate_reader_page_contract.mjs --all-reader-pages | 180s | no completed JSON output | next safe action: run chunked page-list or bounded --max-pages validation`.
- First attempt at bounded all-reader-pages also timed out before discovery was bounded:
  - `process_timeout | node scripts/validate_reader_page_contract.mjs --all-reader-pages --max-pages 25 | 60s | no completed JSON output | next safe action: bound discovery before reading all generated pages`.

## Stop Condition

Daniel has a single-work structure-evidence HUD pipeline edit ready for owner review, and the Orot-style page/HUD contract now has a repeatable static validator. Do not move Daniel or the repaired pages to Featured from this packet; feature placement still needs a separate owner/A14 feature-link decision.
