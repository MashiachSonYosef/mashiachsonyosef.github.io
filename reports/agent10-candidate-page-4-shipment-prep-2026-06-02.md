# Agent 10 Candidate Page #4 Shipment Prep - 2026-06-02

## Status

Candidate page #4 selected/prepared as a bounded shipment-prep packet for future Agent 6 review input when the current QA cadence permits.

This packet does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Candidate

- Page: `tanakh/leviticus/`
- Work ID: `leviticus`
- Work title: `Leviticus`
- Current public URL status checked: `https://mashiachsonyosef.github.io/tanakh/leviticus/?cb=agent10-page4-prep` returned `404`
- Current public bounded HUD data status checked: `https://mashiachsonyosef.github.io/data/public-hud/leviticus/manifest.json?cb=agent10-page4-prep` returned `404`
- Current deployment/source-of-truth commit on `origin/main`: `cd79284caa8d41dd6f972e14a3e20f028ecea7a5`

## Why This Page

Leviticus is the highest-ROI candidate after Deuteronomy, Genesis, and Exodus because it continues the canonical Torah sequence, already has the current Reader Workbench / Route HUD page shell, and has all local data inputs needed for a bounded public HUD package. It keeps the reader-surface factory moving one page at a time without opening a broad rollout.

## Current-HUD Pattern Reuse

Leviticus can reuse the Deuteronomy/Genesis fullscreen current-HUD runtime pattern.

Observed in `tanakh/leviticus/index.html`:

- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- old-HUD markers checked in page source: none found for `Clicked Hebrew form`, `Best actual hit`, `Potential options`, `No lexical entry yet.`, `data-hud-renderings`, `data-hud-breakdown`, `assets/js/lexical-hud.js`, `assets/js/hud-preview.js`, or `hud-preview`

Current source config still points to full data paths:

```json
{
  "manifest_url": "../../data/lexical/leviticus.manifest.json",
  "occurrence_url": "../../data/lexical/occurrences/leviticus.json",
  "hud_route_lookup_manifest_url": "../../data/definitions/hud-route-lookup/manifest.json",
  "root_href": "../../"
}
```

Required publication rewrite is bounded public data paths, matching Deuteronomy/Genesis:

```json
{
  "work_id": "leviticus",
  "work_slug": "tanakh/leviticus",
  "work_title": "Leviticus",
  "manifest_url": "../../data/public-hud/leviticus/manifest.json",
  "occurrence_url": "../../data/public-hud/leviticus/occurrences.json",
  "reader_hint_url": "../../data/public-hud/leviticus/reader-hints.json",
  "hud_route_lookup_manifest_url": "../../data/public-hud/leviticus/route-lookup/manifest.json",
  "root_href": "../../"
}
```

## Required Artifact Set

Required for a bounded #4 public candidate:

- `tanakh/leviticus/index.html`
- `data/public-hud/leviticus/manifest.json`
- `data/public-hud/leviticus/occurrences.json`
- `data/public-hud/leviticus/reader-hints.json`
- `data/public-hud/leviticus/chunks/leviticus-001.json`
- `data/public-hud/leviticus/route-lookup/manifest.json`
- `data/public-hud/leviticus/route-lookup/shards/05d0.json`
- shared runtime: `assets/js/reader-workbench.js`
- shared stylesheet: `assets/css/reader-workbench.css`

Do not publish the full `data/lexical/leviticus.manifest.json` path or full `data/definitions/hud-route-lookup/manifest.json` path as page dependencies for this candidate.

## Public-HUD Data Needs

Local inputs exist:

- `data/lexical/leviticus.manifest.json`: present
- `data/lexical/occurrences/leviticus.json`: present
- `data/lexical/token-indexes/tanakh/leviticus.json`: present
- `data/definitions/hud-route-lookup/manifest.json`: present

Sentinel route proof:

- sentinel token: `tok-3b2756fbc26a`
- source ref: `Leviticus 1:1`
- lexical chunk: `leviticus-001`, source URL `leviticus-chunks/leviticus-001.json`
- surface word: `א`
- normalized codepoints: `05d0`
- required route shard: `05d0`
- route cards for sentinel normalized token: `46`
- local route shard size context: `1` normalized token, `46` route cards

Local work size context:

- Leviticus page bytes: `1,144,725`
- lexical manifest chunks: `7`
- occurrence units: `859`
- total occurrences: `10,205`

## Inline Reader Hint Candidate

Top current route candidate for the sentinel token:

```text
94% Aleph or alef: the first letter of the Hebrew alphabet, coming before ב.; The numeral 1 in Hebrew numbering.
```

Reader-surface status required for this and other inline rows:

- `basis`: `current_route_candidate`
- `candidate_status`: `candidate_not_authority`
- `status`: `reader_hint_not_translation`

This hint is a reader convenience candidate only. It is not a translation, accepted gloss, semantic authority, definition truth, or usage-as-definition authority.

## Source / License / Citation Evidence

The sentinel top route candidate carries source/license metadata in the route card:

- source: `Hebrew Wiktionary data via Kaikki/Wiktextract`
- source family: `kaikki`
- source id: `kaikki-cac9403a1c547fed`
- source URL: `https://kaikki.org/dictionary/Hebrew/index.html`
- license: `CC BY-SA 4.0 / GFDL`
- license URL: `https://en.wiktionary.org/wiki/Wiktionary:Copyrights`
- route card id: `def-kaikki-lemma-1b9a10f074e6dc75`
- route family: `wiktionary_definition`
- route type: `lemma`
- match type: `lemma`

Agent 1 was not needed for this prep packet because no source/provenance/licensing uncertainty was found that blocks selecting Leviticus as a bounded public candidate. This is not source/provenance custody acceptance.

## Route / HUD Runtime Requirements

Before publication, the Leviticus public candidate should pass the same bounded gates used for Genesis:

- page config points only at `data/public-hud/leviticus/**`
- `reader_hint_url` exists and declares reader convenience boundaries
- sentinel token opens fullscreen current HUD
- sentinel HUD shows route cards from the filtered Leviticus route shard
- inline hint appears pre-click with title boundary text
- old HUD markers are absent from page, public data, and public navigation
- old HUD JS/sample routes remain unavailable

Blank HUD behavior for non-public or non-bounded tokens is acceptable only if no old HUD or broken old-HUD behavior appears.

## QA Cadence Boundary

Do not wake Agent 6 for Leviticus #4 while Genesis #2 remains pending unless Agent 6 requests batching or Agent 13/user changes QA cadence. This packet is ready as future review input, not a review submission or acceptance claim.

## Deployment / Source-of-Truth Requirements

Current public source of truth remains:

```text
cd79284caa8d41dd6f972e14a3e20f028ecea7a5 Add Genesis public reader surface
```

Leviticus is not currently public in the bounded live artifact. Publication of page #4 should be a single-page artifact update only, not a broad rollout.

## Future Agent 6 Review Needs

When QA cadence permits, Agent 6 can review this packet for:

- candidate selection rationale for `tanakh/leviticus/`
- current-HUD runtime reuse feasibility
- absence of old-HUD markers in the source page
- bounded public artifact set required for publication
- sentinel route-card availability and source/license metadata
- inline reader hint boundary language
- no claim of translation, accepted gloss, source custody acceptance, public/runtime acceptance, or publication readiness

Agent 6 should not treat this packet as acceptance. It is future review input only.

## Agent 8 Callback

- status: response artifact produced; candidate page #4 selected/prepared for future Agent 6 review input when QA cadence permits
- artifact path: `reports/agent10-candidate-page-4-shipment-prep-2026-06-02.md`
- selected page or blocker: `tanakh/leviticus/`
- Agent 1 needed: no
- Agent 2 needed: no
- Agent 4 needed: no
- Agent 7/13 decision needed: no
- next recommended executable route: prepare candidate page #5 as a single-page bounded shipment-prep packet; highest-ROI next page is `tanakh/numbers/` unless a current-state probe finds a blocker
