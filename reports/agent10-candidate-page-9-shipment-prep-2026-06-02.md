# Agent 10 Candidate Page #9 Shipment Prep - 2026-06-02

## Status

Candidate page #9 selected/prepared as a bounded Agent 10 assistant shipment-prep packet for future Agent 6 review when QA cadence permits.

This packet does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source-file tracking approval, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Candidate

- Page: `tanakh/zechariah/`
- Work ID: `zechariah`
- Work title: `Zechariah`
- Selection basis: next root-card surface after `tanakh/amos/` in the current `origin/main` lightweight public reader surface set.
- Live public URL status checked: `https://mashiachsonyosef.github.io/tanakh/zechariah/?cb=agent10-page9-probe` returned `200`.
- Live bounded HUD manifest checked: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/manifest.json?cb=agent10-page9-probe` returned `200`.
- Remote source-of-truth commit checked with `git ls-remote origin refs/heads/main`: `f97c9b9884f9d951ec4ac6f50497d157b7f6ed29`.
- Local `origin/main` commit checked with `git rev-parse origin/main`: `f97c9b9884f9d951ec4ac6f50497d157b7f6ed29`.

## Why This Page

Zechariah is the highest-ROI next candidate after Deuteronomy, Genesis, Exodus, Leviticus, Numbers, Ruth, Jonah, and Amos because `origin/main` and live Pages already carry a bounded current-HUD package for `tanakh/zechariah/`. It keeps the Agent 10 preparation lane focused on one public reader surface at a time.

## Current-HUD Pattern Reuse

Zechariah reuses the current fullscreen Reader Workbench / Route HUD runtime pattern in `origin/main` and live Pages.

Observed in live `https://mashiachsonyosef.github.io/tanakh/zechariah/?cb=agent10-page9-marker-scan`:

- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- `reader_hint_url`: present
- page config points to `../../data/public-hud/zechariah/**`
- page config does not point to `../../data/lexical/zechariah.manifest.json`
- page config does not point to `../../data/definitions/hud-route-lookup/manifest.json`
- old-HUD markers checked in live page source: none found for `Clicked Hebrew form`, `Best actual hit`, `Potential options`, `No lexical entry yet.`, `data-hud-renderings`, `data-hud-breakdown`, `assets/js/lexical-hud.js`, `assets/js/hud-preview.js`, or `hud-preview`

Observed in `origin/main:tanakh/zechariah/index.html`:

- page bytes: `301,170`
- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- page config points only at bounded `../../data/public-hud/zechariah/**` HUD dependencies
- same old-HUD marker scan found no matches

Local route-HUD page validator on the current working-tree `tanakh/zechariah/index.html`:

```text
Route HUD page validation passed for 1 page(s).
```

Important local-source warning: the current working tree is not aligned with `origin/main` for this page/package. `git diff --name-status origin/main -- tanakh/zechariah/index.html data/public-hud/zechariah` reports `M tanakh/zechariah/index.html` and deleted local `data/public-hud/zechariah/**` files relative to `origin/main`. Do not use the current local working-tree Zechariah package as source-of-truth for Agent 6 review unless that split is resolved or explicitly scoped to `origin/main`/live Pages evidence.

## Required Artifact Set

Current bounded public artifact set for Zechariah exists on `origin/main` and live Pages:

- `tanakh/zechariah/index.html`
- `data/public-hud/zechariah/manifest.json`
- `data/public-hud/zechariah/occurrences.json`
- `data/public-hud/zechariah/reader-hints.json`
- `data/public-hud/zechariah/chunks/zechariah-001.json`
- `data/public-hud/zechariah/route-lookup/manifest.json`
- `data/public-hud/zechariah/route-lookup/shards/05d4-05d9-05d4.json`
- shared runtime: `assets/js/reader-workbench.js`
- shared stylesheet: `assets/css/reader-workbench.css`

Do not treat the current local full `data/lexical/zechariah.manifest.json` path or current local full `data/definitions/hud-route-lookup/manifest.json` path as page #9 public dependencies.

## Live HTTP Checks

- root URL: `https://mashiachsonyosef.github.io/` returned `200`.
- Zechariah page: `https://mashiachsonyosef.github.io/tanakh/zechariah/?cb=agent10-page9-html` returned `200`, byte length `301,170`.
- bounded manifest: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/manifest.json?cb=agent10-page9-probe` returned `200`.
- bounded occurrences: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/occurrences.json?cb=agent10-page9-probe` returned `200`.
- bounded reader hints: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/reader-hints.json?cb=agent10-page9-probe` returned `200`.
- bounded lexical chunk: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/chunks/zechariah-001.json?cb=agent10-page9-probe` returned `200`.
- bounded route manifest: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/route-lookup/manifest.json?cb=agent10-page9-probe` returned `200`.
- bounded route shard: `https://mashiachsonyosef.github.io/data/public-hud/zechariah/route-lookup/shards/05d4-05d9-05d4.json?cb=agent10-page9-probe` returned `200`.
- old HUD JS path: `https://mashiachsonyosef.github.io/assets/js/lexical-hud.js?cb=agent10-page9-probe` returned `404`.
- old HUD preview path: `https://mashiachsonyosef.github.io/hud-preview.html?cb=agent10-page9-probe` returned `404`.

## Public-HUD Data Needs

Satisfied on `origin/main` and live Pages for bounded prep:

- bounded manifest: present on `origin/main`, live `200`
- occurrence bridge: present on `origin/main`, live `200`
- reader hints: present on `origin/main`, live `200`
- sentinel lexical chunk: present as `zechariah-001` on `origin/main`, live `200`
- route lookup manifest: present on `origin/main`, live `200`
- filtered route shard: present as `05d4-05d9-05d4` on `origin/main`, live `200`

Sentinel route proof from `origin/main`:

- sentinel token: `tok-901fa969cf28`
- source ref: `Zechariah 1:1`
- surface word: `הָיָ֣ה`
- normalized word: `היה`
- normalized codepoints: `05d4-05d9-05d4`
- required route shard: `05d4-05d9-05d4`
- route cards for sentinel normalized token: `46`
- answer-eligible route cards: `1`
- route shard token count: `1`
- route shard card count: `46`
- occurrence total: `2,809`

Reader-hint coverage from `origin/main`:

- total unique surface forms: `2,181`
- inline candidate hints: `1,475`
- fallback hints: `0`
- skipped no-route-card rows: `706`
- skipped no-answer-eligible-candidate rows: `0`

## Inline Reader Hint Candidate

Top current route candidate for the sentinel token:

```text
94% to be; to exist; to happen, take place, occur
```

Reader-surface status:

- `basis`: `current_route_candidate`
- `candidate_status`: `candidate_not_authority`
- `status`: `reader_hint_not_translation`
- `publication_status`: `not_a_translation`
- `not_semantic_authority`: true
- `not_translation`: true
- `not_accepted_gloss`: true
- `not_definition_truth`: true

This hint is a reader convenience candidate only. It is not a translation, accepted gloss, semantic authority, definition truth, or usage-as-definition authority.

## Source / License / Citation Evidence

The sentinel top route candidate carries source/license metadata in the reader-hint row:

- source: `Hebrew Wiktionary data via Kaikki/Wiktextract`
- source family: `kaikki`
- source id: `kaikki-8ecf25636dbc8d21`
- source URL: `https://kaikki.org/dictionary/Hebrew/index.html`
- license: `CC BY-SA 4.0 / GFDL`
- license URL: `https://en.wiktionary.org/wiki/Wiktionary:Copyrights`
- route card id: `def-kaikki-lemma-5cc6c2719024561b`
- route family: `wiktionary_definition`
- route type: `lemma`
- match type: `lemma`

The bounded Zechariah sentinel route shard has these unique source labels:

- `Abudarham. Lisbon, 1489.`
- `Hebrew Wiktionary data via Kaikki/Wiktextract`

The bounded Zechariah sentinel route shard has these unique licenses:

- `CC BY-SA 4.0 / GFDL`
- `Public Domain`

Agent 1 is not needed for selecting Zechariah as a bounded Agent 10 prep candidate, but any Agent 6 source/provenance-sensitive review must preserve Agent 1/Agent 6 custody boundaries. This is not source/provenance custody acceptance.

## Route / HUD Runtime Requirements

Before Agent 6 can upgrade Zechariah from prep evidence to accepted bounded runtime evidence, page #9 should receive independent browser-click proof:

- cache-busted live Zechariah URL returns `200`
- current fullscreen Route HUD opens from sentinel token `tok-901fa969cf28` or another declared bounded token
- visible route cards are present
- visible source/license/citation rows are present after click
- old-HUD markers are absent from page, HUD text, and runtime HTML
- route manifest and route shard load from `/data/public-hud/zechariah/**`
- hard refresh remains current-HUD/no-old-HUD
- old-HUD-looking query parameters remain current-HUD/no-old-HUD
- poisoned localStorage/IndexedDB does not resurrect old HUD or accepted-translation wording
- proof artifact states exact commit/hash, URL, screenshot path if available, issues, warnings, and non-acceptance boundary

## Deployment / Source-Of-Truth Requirements

Current public source of truth:

```text
f97c9b9884f9d951ec4ac6f50497d157b7f6ed29 Flagship Orot public HUD surface
```

Zechariah is present in the current lightweight public artifact on `origin/main` and live Pages. The local working tree is not aligned with that package, so any future Agent 10 edit/recheck must either read from `origin/main`/live Pages explicitly or first resolve the local Zechariah page/package split without destructive git action.

This packet still does not claim QA acceptance, validated public/runtime acceptance, publication readiness, source/provenance acceptance, route publication support, or CDN/cache closure.

## Future Agent 6 Review Needs

When QA cadence permits, Agent 6 can review:

- candidate selection rationale for `tanakh/zechariah/`
- current-HUD runtime reuse feasibility from `origin/main` and live Pages
- absence of old-HUD markers in the live page
- bounded public artifact set and dependency URLs
- sentinel route-card availability and source/license metadata
- inline reader hint boundary language
- independent browser-click proof if Zechariah is to be accepted as a bounded runtime surface
- no claim of translation, accepted gloss, source custody acceptance, route publication support, or publication readiness

Agent 6 should not treat this packet as acceptance. It is future review input only.

## Agent 8 Callback

- status: response artifact produced; candidate page #9 selected/prepared with local/source-of-truth split warning
- artifact path: `reports/agent10-candidate-page-9-shipment-prep-2026-06-02.md`
- selected page or blocker: `tanakh/zechariah/`
- Agent 1 needed: not for selection; required only if Agent 6 opens source/provenance custody review
- Agent 2 needed: no
- Agent 4 needed: yes, only if independent live browser-click proof is requested before Agent 6 runtime review
- Agent 7/13 decision needed: yes if moving beyond the first five-surface chain is not yet authorized
- next recommended executable route: either request Agent 4 live click proof for Zechariah, or prepare candidate page #10 after checking `origin/main`/live Pages and the local source-of-truth split

## Not Accepted

- QA acceptance
- validated public/runtime acceptance
- source/provenance custody
- source publication
- source-file tracking approval
- publication readiness
- route publication support
- Definition authority
- product/data acceptance
- usage-as-definition authority
- translation output
- accepted translation text
