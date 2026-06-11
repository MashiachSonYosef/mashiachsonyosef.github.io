# Agent 5 Edge-Case Watch

## 2026-05-31 20:xx - Yoreh De'ah HUD Boundary Recheck

Scope:

- Local-only edge-case audit.
- No agent prompts.
- No broad render.
- No site-wide validator.
- Targeted pages only:
  - `halakhah/kereti-on-shulchan-arukh-yoreh-deah/index.html`
  - `halakhah/siftei-kohen-on-shulchan-arukh-yoreh-deah/index.html`
  - `halakhah/urim-vetumim-urim/index.html`

Findings:

- `kereti-on-shulchan-arukh-yoreh-deah` is no longer outside the route-HUD contract.
  - Current page contains `selectRouteAnswer`, `lookupCandidateTreatments`, `Usage evidence`, and `Sources and licenses`.
  - Stale old-HUD markers checked were absent: `Clicked Hebrew form`, `allowLowConfidenceFallback`, `data-hud-breakdown`, and `sourceSummary =`.
  - `node scripts\validate_route_hud_page.mjs --page halakhah/kereti-on-shulchan-arukh-yoreh-deah/index.html` passed.

- `siftei-kohen-on-shulchan-arukh-yoreh-deah` is no longer outside the route-HUD contract.
  - Current page contains `selectRouteAnswer`, `lookupCandidateTreatments`, `Usage evidence`, and `Sources and licenses`.
  - Stale old-HUD markers checked were absent: `Clicked Hebrew form`, `allowLowConfidenceFallback`, `data-hud-breakdown`, and `sourceSummary =`.
  - `node scripts\validate_route_hud_page.mjs --page halakhah/siftei-kohen-on-shulchan-arukh-yoreh-deah/index.html` passed.

- `urim-vetumim-urim` is the active HUD edge case.
  - Source exists: `data/sources/urim-vetumim-urim.json`.
  - Overlay exists: `data/overlays/urim-vetumim-urim.json`.
  - Lexical occurrence payload exists: `data/lexical/occurrences/urim-vetumim-urim.json`.
  - Lexical token index exists: `data/lexical/token-indexes/halakhah/urim-vetumim-urim.json`.
  - Public page exists: `halakhah/urim-vetumim-urim/index.html`.
  - Page is stale old-HUD, not missing.
  - It lacks current markers: `selectRouteAnswer`, `lookupCandidateTreatments`, `Usage evidence`, and `Sources and licenses`.
  - It still contains old-HUD markers: `Clicked Hebrew form` and `allowLowConfidenceFallback`.
  - `node scripts\validate_route_hud_page.mjs --page halakhah/urim-vetumim-urim/index.html` failed with 103 issues.

Provenance note:

- `kereti` and `siftei-kohen` source JSON files store license/version fields per unit, not at the top level.
- Both checked files had 0 missing unit-level `license` values.
- Both checked files had missing unit-level `license_url` values, while rendered pages show `License: Public Domain`.
- This is a warning shape issue, not a current source-license blocker by itself.

Control conclusion:

- Do not keep citing `kereti` or `siftei-kohen` as current HUD blockers unless new evidence re-breaks them.
- The current edge-case handoff should target `urim-vetumim-urim`: page exists, payloads exist, but emitted HTML is stale old-HUD.
- Best next action for the HUD lane is narrow generator-path diagnosis for why `urim-vetumim-urim` emits old-HUD while neighboring recent recovery pages emit current route-HUD.

## 2026-05-31 20:xx - Book Dig: Urim VeTumim / Choshen Mishpat HUD State

Scope:

- Dug into `Urim VeTumim, Urim` as a concrete book, not a broad site pass.
- No agent prompts.
- No render.
- No broad validator.
- One accidental broad `rg` over generated pages was stopped by timeout; after that, checks were limited to named books/pages.

Book inspected:

- `data/sources/urim-vetumim-urim.json`
- Work title: `Urim VeTumim, Urim`
- Work slug: `halakhah/urim-vetumim-urim`
- Unit count: 4,080
- First source ref: `Urim VeTumim, Urim 1:1`
- Last source ref: `Urim VeTumim, Urim 152:7`
- Unit-level license: `Public Domain`
- Version title: `Urim veTumim, Warsaw 1881`
- Version source: `https://www.nli.org.il/he/books/NNL_ALEPH001167224`

Data availability:

- Source exists: `data/sources/urim-vetumim-urim.json`
- Overlay exists: `data/overlays/urim-vetumim-urim.json`
- Lexical occurrences exist: `data/lexical/occurrences/urim-vetumim-urim.json`
- Token index exists: `data/lexical/token-indexes/halakhah/urim-vetumim-urim.json`
- Public page exists: `halakhah/urim-vetumim-urim/index.html`

Urim finding:

- `halakhah/urim-vetumim-urim/index.html` is stale old-HUD.
- It lacks current route-HUD markers: `selectRouteAnswer`, `lookupCandidateTreatments`, `Usage evidence`, and `Sources and licenses`.
- It contains stale markers: `Clicked Hebrew form`, `allowLowConfidenceFallback`, and old `data-hud-*` sections.
- `node scripts\validate_route_hud_page.mjs --page halakhah/urim-vetumim-urim/index.html` failed with 103 issues.
- This is not a missing-source or missing-payload case.

Sibling comparison:

- `halakhah/urim-vetumim-tumim/index.html` is closer to current route-HUD than `urim`.
- It contains `selectRouteAnswer` and `Usage evidence`.
- However, it still fails `scripts\validate_route_hud_page.mjs` with 6 issues:
  - missing `aria-live="polite"`
  - missing trigger relationship markers for `aria-haspopup`, `aria-controls`, and `aria-expanded`
  - missing `article.dataset.rankBasis`
  - contains validator-forbidden `Rank details`

Choshen Mishpat sample:

- The following recently mentioned Choshen Mishpat pages were checked by marker scan and all appeared stale old-HUD:
  - `haggahot-imrei-barukh-on-shulchan-arukh-choshen-mishpat`
  - `ketzot-hachoshen-on-shulchan-arukh-choshen-mishpat`
  - `meirat-einayim-on-shulchan-arukh-choshen-mishpat`
  - `netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat`
  - `netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat`
  - `pitchei-teshuva-on-shulchan-arukh-choshen-mishpat`
- Targeted validator on `netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat` failed with 103 issues, the same old-HUD shape as `urim-vetumim-urim`.

Control conclusion:

- The latest route-HUD report language overstates the Choshen Mishpat recovery.
- `kereti` and `siftei-kohen` are repaired, but the active render-contract edge is now a book family/path issue around `urim-vetumim-urim` and multiple Choshen Mishpat pages.
- Best next technical target is not another broad render. It is diagnosing why these named pages are written with the old lexical HUD shell while other halakhah pages are written with the current route-HUD shell.

## 2026-05-31 21:28 - Owned Repair: Urim and Choshen Stale HUD Pages

Ownership boundary:

- Agent 5 owns this as a stale-render contract edge, not as HUD product redesign.
- No agent prompts were sent.
- No broad site render, broad validator, or recursive generated-page scan was run.
- The repair touched only named work pages via the targeted renderer path.

Finding:

- `scripts/render_site.ps1` was newer than the stale pages and now emits the current route-HUD shell directly.
- `urim-vetumim-urim` was stale because its page predated the current renderer contract, not because source, overlay, occurrence, or token-index data was missing.
- The Choshen Mishpat stale pages had the same old-HUD signature.

Repair commands:

- `powershell -ExecutionPolicy Bypass -File scripts\render_site.ps1 -WorkIds urim-vetumim-urim -SkipSitePages -SkipOverlayExports -SkipLexicalPayloadFiles`
- `powershell -ExecutionPolicy Bypass -File scripts\render_site.ps1 -OnlyWorkIdsPath .local-cache\hud-render-chunks\agent5-choshen-mishpat-stale-hud-repair.txt -SkipSitePages -SkipOverlayExports -SkipLexicalPayloadFiles`

Pages repaired:

- `halakhah/urim-vetumim-urim/index.html`
- `halakhah/haggahot-imrei-barukh-on-shulchan-arukh-choshen-mishpat/index.html`
- `halakhah/ketzot-hachoshen-on-shulchan-arukh-choshen-mishpat/index.html`
- `halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html`
- `halakhah/netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat/index.html`
- `halakhah/netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat/index.html`
- `halakhah/pitchei-teshuva-on-shulchan-arukh-choshen-mishpat/index.html`

Verification:

- `node scripts\validate_route_hud_page.mjs --page ...` passed for all 7 repaired pages.
- Marker check found current `data-route-hud-panel`, `aria-live="polite"`, and `hud_route_lookup_manifest_url` on all 7 pages.
- Marker check did not return `Clicked Hebrew form`, `allowLowConfidenceFallback`, or `Rank details` for the repaired set.

Control conclusion:

- This specific Urim/Choshen stale-HUD edge is repaired.
- Remaining risk is drift: if another agent renders with an older script copy or stale template, the same signature can reappear.
- The reusable control is simple: for any named stale book with payloads present, run a targeted current-render pass and validate that page only.
