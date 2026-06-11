# Agent 10 Candidate Page #6 Shipment Prep - 2026-06-02

## Status

Candidate page #6 selected/prepared as a bounded Agent 10 assistant shipment-prep packet for future Agent 6 review when QA cadence permits.

This packet does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, source-file tracking approval, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Candidate

- Page: `tanakh/ruth/`
- Work ID: `ruth`
- Work title: `Ruth`
- Current public URL status checked: `https://mashiachsonyosef.github.io/tanakh/ruth/?cb=agent10-page6-probe` returned `200`
- Current public bounded HUD manifest checked: `https://mashiachsonyosef.github.io/data/public-hud/ruth/manifest.json?cb=agent10-page6-probe` returned `200`
- Current deployment/source-of-truth commit on `origin/main`: `62c64fb303e13ef84e22d6cbf56e2a2c85c04499`

## Why This Page

Ruth is the highest-ROI next candidate after Deuteronomy, Genesis, Exodus, Leviticus, and Numbers because `origin/main` and live Pages already carry a bounded current-HUD package for `tanakh/ruth/`. It is outside the Torah five-page slice, so it is a useful next expansion target only after Agent 6 decides whether QA cadence permits moving beyond the first five surfaces.

## Current-HUD Pattern Reuse

Ruth reuses the Deuteronomy/Genesis fullscreen current-HUD runtime pattern in `origin/main` and live Pages.

Observed in live `https://mashiachsonyosef.github.io/tanakh/ruth/?cb=agent10-page6-probe-html`:

- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- `reader_hint_url`: present
- page config points to `../../data/public-hud/ruth/**`
- page config does not point to `../../data/lexical/ruth.manifest.json`
- page config does not point to `../../data/definitions/hud-route-lookup/manifest.json`
- old-HUD markers checked in live page source: none found

Local route-HUD page validator on the current working-tree `tanakh/ruth/index.html`:

```text
Route HUD page validation passed for 1 page(s).
```

Important local-source warning: the current working tree is not aligned with `origin/main` for this page. `git diff --name-status origin/main -- tanakh/ruth/index.html data/public-hud/ruth` reports `M tanakh/ruth/index.html` and deleted local `data/public-hud/ruth/**` files relative to `origin/main`. Do not use the current local working-tree Ruth page/package as source-of-truth for Agent 6 review unless that split is resolved or explicitly scoped to `origin/main`/live Pages evidence.

## Required Artifact Set

Current bounded public artifact set for Ruth exists on `origin/main` and live Pages:

- `tanakh/ruth/index.html`
- `data/public-hud/ruth/manifest.json`
- `data/public-hud/ruth/occurrences.json`
- `data/public-hud/ruth/reader-hints.json`
- `data/public-hud/ruth/chunks/ruth-001.json`
- `data/public-hud/ruth/route-lookup/manifest.json`
- `data/public-hud/ruth/route-lookup/shards/05d5-05d9-05d4.json`
- shared runtime: `assets/js/reader-workbench.js`
- shared stylesheet: `assets/css/reader-workbench.css`

Do not treat the current local full `data/lexical/ruth.manifest.json` path or current local full `data/definitions/hud-route-lookup/manifest.json` path as page #6 public dependencies.

## Public-HUD Data Needs

Satisfied on `origin/main` and live Pages for bounded prep:

- bounded manifest: present on `origin/main`, live `200`
- occurrence bridge: present on `origin/main`, live `200`
- reader hints: present on `origin/main`, live `200`
- sentinel lexical chunk: present as `ruth-001` on `origin/main`
- route lookup manifest: present on `origin/main`, live `200`
- filtered route shard: present as `05d5-05d9-05d4` on `origin/main`

Sentinel route proof from `origin/main`:

- sentinel token: `tok-e1e6213a83a3`
- source ref: `Ruth 1:1`
- normalized word codepoints: `05d5-05d9-05d4-05d9`
- required route shard: `05d5-05d9-05d4`
- route cards for sentinel normalized token: `47`
- answer-eligible route cards: `2`
- source/license rows in sentinel shard: `88`

Reader-hint coverage from `origin/main`:

- total unique surface forms: `999`
- inline candidate hints: `676`
- fallback hints: `0`
- skipped no-route-card rows: `323`
- skipped no-answer-eligible-candidate rows: `0`

## Inline Reader Hint Candidate

Top current route candidate for the sentinel token:

```text
94% Third-person masculine singular vav-consecutive imperfect (hence past tense) of hayah.
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

The sentinel top route candidate carries source/license metadata in the route card:

- source: `Hebrew Wiktionary data via Kaikki/Wiktextract`
- source family: `kaikki`
- source id: `kaikki-ea34505c6d723435`
- source URL: `https://kaikki.org/dictionary/Hebrew/index.html`
- license: `CC BY-SA 4.0 / GFDL`
- license URL: `https://en.wiktionary.org/wiki/Wiktionary:Copyrights`
- route card id: `def-kaikki-lemma-8ab4b0f2fc1faea6`
- route family: `wiktionary_definition`
- route type: `lemma`
- match type: `lemma`

The bounded Ruth sentinel route shard has these unique source labels:

- `Abudarham. Lisbon, 1489.`
- `Hebrew Wiktionary data via Kaikki/Wiktextract`
- `OpenScriptures morphHB`
- `Wikidata Lexeme`

The bounded Ruth sentinel route shard has these unique licenses:

- `CC BY 4.0`
- `CC BY-SA 4.0 / GFDL`
- `CC0`
- `Public Domain`

Agent 1 is not needed for selecting Ruth as a bounded Agent 10 prep candidate, but any Agent 6 source/provenance-sensitive review must preserve Agent 1/Agent 6 custody boundaries. This is not source/provenance custody acceptance.

## Route / HUD Runtime Requirements

Before Agent 6 can upgrade Ruth from prep evidence to accepted bounded runtime evidence, page #6 should receive independent browser-click proof:

- cache-busted live Ruth URL returns `200`
- current fullscreen Route HUD opens from sentinel token `tok-e1e6213a83a3` or another declared bounded token
- visible route cards are present
- visible source/license/citation rows are present after click
- old-HUD markers are absent from page, HUD text, and runtime HTML
- route manifest and route shard load from `/data/public-hud/ruth/**`
- hard refresh remains current-HUD/no-old-HUD
- old-HUD-looking query parameters remain current-HUD/no-old-HUD
- poisoned localStorage/IndexedDB does not resurrect old HUD or accepted-translation wording
- proof artifact states exact commit/hash, URL, screenshot path if available, issues, warnings, and non-acceptance boundary

## Deployment / Source-Of-Truth Requirements

Current public source of truth:

```text
62c64fb303e13ef84e22d6cbf56e2a2c85c04499 Expand public reader surfaces to ten
```

Ruth is present in the current lightweight public artifact on `origin/main` and live Pages. The local working tree is not aligned with that package, so any future Agent 10 edit/recheck must either read from `origin/main`/live Pages explicitly or first resolve the local Ruth page/package split without destructive git action.

This packet still does not claim QA acceptance, validated public/runtime acceptance, publication readiness, source/provenance acceptance, route publication support, or CDN/cache closure.

## Future Agent 6 Review Needs

When QA cadence permits, Agent 6 can review:

- candidate selection rationale for `tanakh/ruth/`
- current-HUD runtime reuse feasibility from `origin/main` and live Pages
- absence of old-HUD markers in the live page
- bounded public artifact set and dependency URLs
- sentinel route-card availability and source/license metadata
- inline reader hint boundary language
- independent browser-click proof if Ruth is to be accepted as a bounded runtime surface
- no claim of translation, accepted gloss, source custody acceptance, route publication support, or publication readiness

Agent 6 should not treat this packet as acceptance. It is future review input only.

## Agent 8 Callback

- status: response artifact produced; candidate page #6 selected/prepared with local/source-of-truth split warning
- artifact path: `reports/agent10-candidate-page-6-shipment-prep-2026-06-02.md`
- selected page or blocker: `tanakh/ruth/`
- Agent 1 needed: not for selection; required only if Agent 6 opens source/provenance custody review
- Agent 2 needed: no
- Agent 4 needed: yes, only if independent live browser-click proof is requested before Agent 6 runtime review
- Agent 7/13 decision needed: yes if moving beyond the first five-surface chain is not yet authorized
- next recommended executable route: either request Agent 4 live click proof for Ruth, or prepare candidate page #7 after checking `origin/main`/live Pages and the local source-of-truth split
