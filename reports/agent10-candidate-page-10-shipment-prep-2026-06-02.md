# Agent 10 Candidate Page #10 Shipment Prep - 2026-06-02

## Status

Candidate page #10 selected/prepared as a bounded Agent 10 assistant shipment-prep packet for future Agent 6 review when QA cadence permits.

This packet does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source-file tracking approval, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Candidate

- Page: `tanakh/zephaniah/`
- Work ID: `zephaniah`
- Work title: `Zephaniah`
- Selection basis: next root-card surface after `tanakh/zechariah/` in the current `origin/main` lightweight public reader surface set.
- Live public URL status checked: `https://mashiachsonyosef.github.io/tanakh/zephaniah/?cb=agent10-page10-probe` returned `200`.
- Live bounded HUD manifest checked: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/manifest.json?cb=agent10-page10-probe` returned `200`.
- Remote source-of-truth commit checked with `git ls-remote origin refs/heads/main`: `f97c9b9884f9d951ec4ac6f50497d157b7f6ed29`.
- Local `origin/main` commit checked with `git rev-parse origin/main`: `f97c9b9884f9d951ec4ac6f50497d157b7f6ed29`.

## Why This Page

Zephaniah is the highest-ROI next candidate after Deuteronomy, Genesis, Exodus, Leviticus, Numbers, Ruth, Jonah, Amos, and Zechariah because `origin/main` and live Pages already carry a bounded current-HUD package for `tanakh/zephaniah/`. This completes the ten-surface Agent 10 shipment-prep chain while staying report-only.

## Current-HUD Pattern Reuse

Zephaniah reuses the current fullscreen Reader Workbench / Route HUD runtime pattern in `origin/main` and live Pages.

Observed in live `https://mashiachsonyosef.github.io/tanakh/zephaniah/?cb=agent10-page10-marker-scan`:

- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- `reader_hint_url`: present
- page config points to `../../data/public-hud/zephaniah/**`
- page config does not point to `../../data/lexical/zephaniah.manifest.json`
- page config does not point to `../../data/definitions/hud-route-lookup/manifest.json`
- old-HUD markers checked in live page source: none found for `Clicked Hebrew form`, `Best actual hit`, `Potential options`, `No lexical entry yet.`, `data-hud-renderings`, `data-hud-breakdown`, `assets/js/lexical-hud.js`, `assets/js/hud-preview.js`, or `hud-preview`

Observed in `origin/main:tanakh/zephaniah/index.html`:

- page bytes: `90,468`
- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- page config points only at bounded `../../data/public-hud/zephaniah/**` HUD dependencies
- same old-HUD marker scan found no matches

Local route-HUD page validator on the current working-tree `tanakh/zephaniah/index.html`:

```text
Route HUD page validation passed for 1 page(s).
```

Important local-source warning: the current working tree is not aligned with `origin/main` for this page/package. `git diff --name-status origin/main -- tanakh/zephaniah/index.html data/public-hud/zephaniah` reports `M tanakh/zephaniah/index.html` and deleted local `data/public-hud/zephaniah/**` files relative to `origin/main`. Do not use the current local working-tree Zephaniah package as source-of-truth for Agent 6 review unless that split is resolved or explicitly scoped to `origin/main`/live Pages evidence.

## Required Artifact Set

Current bounded public artifact set for Zephaniah exists on `origin/main` and live Pages:

- `tanakh/zephaniah/index.html`
- `data/public-hud/zephaniah/manifest.json`
- `data/public-hud/zephaniah/occurrences.json`
- `data/public-hud/zephaniah/reader-hints.json`
- `data/public-hud/zephaniah/chunks/zephaniah-001.json`
- `data/public-hud/zephaniah/route-lookup/manifest.json`
- `data/public-hud/zephaniah/route-lookup/shards/05d0-05e9-05e8.json`
- shared runtime: `assets/js/reader-workbench.js`
- shared stylesheet: `assets/css/reader-workbench.css`

Do not treat the current local full `data/lexical/zephaniah.manifest.json` path or current local full `data/definitions/hud-route-lookup/manifest.json` path as page #10 public dependencies.

## Live HTTP Checks

- root URL: `https://mashiachsonyosef.github.io/` returned `200`.
- Zephaniah page: `https://mashiachsonyosef.github.io/tanakh/zephaniah/?cb=agent10-page10-html` returned `200`, byte length `90,468`.
- bounded manifest: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/manifest.json?cb=agent10-page10-probe` returned `200`.
- bounded occurrences: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/occurrences.json?cb=agent10-page10-probe` returned `200`.
- bounded reader hints: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/reader-hints.json?cb=agent10-page10-probe` returned `200`.
- bounded lexical chunk: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/chunks/zephaniah-001.json?cb=agent10-page10-probe` returned `200`.
- bounded route manifest: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/route-lookup/manifest.json?cb=agent10-page10-probe` returned `200`.
- bounded route shard: `https://mashiachsonyosef.github.io/data/public-hud/zephaniah/route-lookup/shards/05d0-05e9-05e8.json?cb=agent10-page10-probe` returned `200`.
- old HUD JS path: `https://mashiachsonyosef.github.io/assets/js/lexical-hud.js?cb=agent10-page10-probe` returned `404`.
- old HUD preview path: `https://mashiachsonyosef.github.io/hud-preview.html?cb=agent10-page10-probe` returned `404`.

## Public-HUD Data Needs

Satisfied on `origin/main` and live Pages for bounded prep:

- bounded manifest: present on `origin/main`, live `200`
- occurrence bridge: present on `origin/main`, live `200`
- reader hints: present on `origin/main`, live `200`
- sentinel lexical chunk: present as `zephaniah-001` on `origin/main`, live `200`
- route lookup manifest: present on `origin/main`, live `200`
- filtered route shard: present as `05d0-05e9-05e8` on `origin/main`, live `200`

Sentinel route proof from `origin/main`:

- sentinel token: `tok-97813d949fba`
- source ref: `Zephaniah 1:1`
- surface word: `אֲשֶׁ֣ר`
- normalized word: `אשר`
- normalized codepoints: `05d0-05e9-05e8`
- required route shard: `05d0-05e9-05e8`
- route cards for sentinel normalized token: `55`
- answer-eligible route cards: `3`
- route shard token count: `1`
- route shard card count: `55`
- occurrence total: `674`

Reader-hint coverage from `origin/main`:

- total unique surface forms: `618`
- inline candidate hints: `416`
- fallback hints: `0`
- skipped no-route-card rows: `202`
- skipped no-answer-eligible-candidate rows: `0`

## Inline Reader Hint Candidate

Top current route candidate for the sentinel token:

```text
95% that; which; who
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

- source: `Project-authored function word table`
- source family: `workspace`
- source id: `project-function-word:asher`
- source URL: `local:project-function-word-table`
- license: `project-authored / CC0`
- license URL: `https://creativecommons.org/publicdomain/zero/1.0/`
- route card id: `def-layer-3d56ae9424b0cda8`
- route family: `project_lexical`
- route type: `lemma`
- match type: `lemma`

The bounded Zephaniah sentinel route shard has these unique source labels:

- `Abudarham. Lisbon, 1489.`
- `Hebrew Wiktionary data via Kaikki/Wiktextract`
- `Project-authored function word table`

The bounded Zephaniah sentinel route shard has these unique licenses:

- `CC BY-SA 4.0 / GFDL`
- `Public Domain`
- `project-authored / CC0`

Source/provenance-sensitive note: the sentinel top row uses local/project-authored source metadata. Agent 10 is surfacing the exact row for Agent 1 or Agent 6 review if they require source/provenance custody treatment before any acceptance. Agent 10 does not accept the local source row, source/provenance custody, source publication, source-file tracking, or route publication support.

## Route / HUD Runtime Requirements

Before Agent 6 can upgrade Zephaniah from prep evidence to accepted bounded runtime evidence, page #10 should receive independent browser-click proof:

- cache-busted live Zephaniah URL returns `200`
- current fullscreen Route HUD opens from sentinel token `tok-97813d949fba` or another declared bounded token
- visible route cards are present
- visible source/license/citation rows are present after click
- old-HUD markers are absent from page, HUD text, and runtime HTML
- route manifest and route shard load from `/data/public-hud/zephaniah/**`
- hard refresh remains current-HUD/no-old-HUD
- old-HUD-looking query parameters remain current-HUD/no-old-HUD
- poisoned localStorage/IndexedDB does not resurrect old HUD or accepted-translation wording
- proof artifact states exact commit/hash, URL, screenshot path if available, issues, warnings, and non-acceptance boundary

## Deployment / Source-Of-Truth Requirements

Current public source of truth:

```text
f97c9b9884f9d951ec4ac6f50497d157b7f6ed29 Flagship Orot public HUD surface
```

Zephaniah is present in the current lightweight public artifact on `origin/main` and live Pages. The local working tree is not aligned with that package, so any future Agent 10 edit/recheck must either read from `origin/main`/live Pages explicitly or first resolve the local Zephaniah page/package split without destructive git action.

This packet still does not claim QA acceptance, validated public/runtime acceptance, publication readiness, source/provenance acceptance, route publication support, or CDN/cache closure.

## Future Agent 6 Review Needs

When QA cadence permits, Agent 6 can review:

- candidate selection rationale for `tanakh/zephaniah/`
- current-HUD runtime reuse feasibility from `origin/main` and live Pages
- absence of old-HUD markers in the live page
- bounded public artifact set and dependency URLs
- sentinel route-card availability and source/license metadata
- the source/provenance-sensitive `Project-authored function word table` row if it affects QA/source custody routing
- inline reader hint boundary language
- independent browser-click proof if Zephaniah is to be accepted as a bounded runtime surface
- no claim of translation, accepted gloss, source custody acceptance, route publication support, or publication readiness

Agent 6 should not treat this packet as acceptance. It is future review input only.

## Agent 8 Callback

- status: response artifact produced; candidate page #10 selected/prepared with local/source-of-truth split warning and source/provenance-sensitive local project-authored row surfaced
- artifact path: `reports/agent10-candidate-page-10-shipment-prep-2026-06-02.md`
- selected page or blocker: `tanakh/zephaniah/`; source/provenance-sensitive row is `Project-authored function word table` / `project-authored / CC0`
- Agent 1 needed: yes if Agent 6 requires source/provenance custody review of the local project-authored row before acceptance
- Agent 2 needed: no
- Agent 4 needed: yes, only if independent live browser-click proof is requested before Agent 6 runtime review
- Agent 7/13 decision needed: yes if moving beyond prep evidence into Agent 6 review cadence is not authorized
- next recommended executable route: request Agent 4 live click proof for the page #6-#10 surfaces, or ask Agent 6/Agent 7 which prepared packet should be reviewed next

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
