# A10 Daniel HUD Click Fix Deploy Packet - 2026-06-12

## Status

deploy_packet_ready_local_only

## Purpose

Move the local Daniel HUD click fix to the live site with a narrow pathspec. This packet exists because live Daniel is stale relative to local:

- live shared runtime does not contain `openPrehudRowHud`;
- live shared runtime does not contain `appendStructureEvidenceDetails`;
- live shared runtime still contains Daniel-specific HUD wording;
- local runtime has the click-open fix, neutral HUD wording, and dedicated `Word-part breakdown`.

## Stage Only These Paths

- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- `tanakh/daniel/index.html`
- `data/definitions/hud-route-lookup-daniel/manifest.json`
- `data/definitions/hud-route-lookup-daniel/shards/05dc-05de-05dc.json`
- `scripts/validate_reader_page_contract.mjs`
- `reports/a10-daniel-structure-evidence-pipeline-edit-2026-06-11.md`
- `reports/a10-daniel-hud-click-fix-deploy-packet-2026-06-12.md`
- `reports/a10-daniel-hud-click-fix-deploy-packet-2026-06-12.json`

## Exclude

- all A1/A3/A13/A14 unrelated report dirt;
- all unrelated token-index, lexical, definition, stats, search, and source-layer churn;
- deleted `data/lexical/source-layers/project-abbreviations.json` unless owner separately approves the no-private-table package;
- any broad `git add -A`;
- any deploy workflow mutation not listed above.

## What Changed

- Passage Hebrew links in preHUD row mode now jump to the matching preHUD row and open the same Route HUD.
- The passage-click handler stops propagation so the document outside-click handler does not immediately close the HUD.
- Blank/TBD HUDs now include:
  - `Definition`;
  - `Strict Hebrew`;
  - `Strict Aramaic`;
  - `Word-part breakdown`;
  - lemma/crossmatch/source-license sections where available.
- Structure-only evidence renders in `Word-part breakdown`.
- Structure-only evidence is not offered as a `Choose a study gloss` option.
- Daniel-specific crossmatch wording remains removed.

## Validators / Proof

- `node --check assets/js/reader-workbench.js` passed.
- `node --check scripts/validate_reader_page_contract.mjs` passed.
- `node scripts/validate_reader_page_contract.mjs --page orot/index.html --page tanakh/daniel/index.html --structure-shard data/definitions/hud-route-lookup-daniel/shards/05dc-05de-05dc.json` passed with `issue_count=0`.
- `node scripts/validate_route_hud_page.mjs --page tanakh/daniel/index.html orot/index.html` passed.
- Scoped `git diff --check` passed with CRLF warnings only.
- Local headless Chrome proof passed:
  - clicking the first Daniel 1:1 top-passage word opens HUD and leaves `hudHidden=false`;
  - HUD includes `Definition`, `Strict Hebrew`, `Strict Aramaic`, and `Word-part breakdown`;
  - HUD has no `Same Hebrew form in Daniel` or `No other Daniel passage`.
- Local headless Chrome structure-token proof passed:
  - clicked generated token id `tok-503d8e7c74c6`;
  - HUD title `Route HUD: לְמַלְכ֖וּת`;
  - `Word-part breakdown` includes prefix/base structure evidence;
  - structure evidence is not shown as a study-gloss choice.
- Comprehensive local headless Chrome proof passed:
  - generated `5456` Daniel preHUD rows and `5456` top-passage links;
  - top-passage `TBD`, preHUD-row `TBD`, preHUD gloss-cell `TBD`, and preHUD match-cell `TBD` all open HUD and keep `hudHidden=false`;
  - pure `TBD` clicks show `Definition`, `No validated definition`, `Strict Hebrew`, `Strict Aramaic`, and `Word-part breakdown`;
  - pure `TBD` clicks do not show `Choose a study gloss`;
  - structure token `tok-503d8e7c74c6` opens HUD with `Word-part breakdown` evidence and no study-gloss promotion.

## Live Delta

Live check before this packet:

- `https://mashiachsonyosef.github.io/tanakh/daniel/` returns 200.
- Live page has `reader_layout_mode=prehud_rows`.
- Live page does not look like a reports/mock page.
- Live shared JS lacks the local click-open and structure-detail fixes.

## Boundary

No source/license/legal/Definition/product/answer/accepted-text/publication/release acceptance is claimed. This is a local deploy handoff packet only. Final staging, commit, push, and live publication remain separate owner/A14 action.
