# Agent 10 Candidate Page #3 Shipment Prep - 2026-06-02

## Status

Candidate page #3 selected/prepared as a bounded shipment-prep packet for Agent 6 review.

This packet does not claim QA acceptance, validated public/runtime acceptance, source/provenance acceptance, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, accepted gloss, or accepted translation text.

## Candidate

- Page: `tanakh/exodus/`
- Work ID: `exodus`
- Work title: `Exodus`
- Current public URL status checked: `https://mashiachsonyosef.github.io/tanakh/exodus/?cb=agent10-page3-prep` returned `404`
- Current public bounded HUD data status checked: `https://mashiachsonyosef.github.io/data/public-hud/exodus/manifest.json?cb=agent10-page3-prep` returned `404`
- Current deployment/source-of-truth commit on `origin/main`: `cd79284caa8d41dd6f972e14a3e20f028ecea7a5`

## Why This Page

Exodus is the highest-ROI candidate after Deuteronomy and Genesis because it is the next canonical Torah reader surface, the source page already has the current Reader Workbench / Route HUD structure, and all local data inputs needed for a bounded public HUD package are present. It expands the visible reader set without opening a broad corpus rollout.

## Current-HUD Pattern Reuse

Exodus can reuse the Deuteronomy/Genesis fullscreen current-HUD runtime pattern.

Observed in `tanakh/exodus/index.html`:

- `data-lexical-hud`: present
- `data-route-hud-panel`: present
- `assets/js/reader-workbench.js`: present
- old-HUD markers checked in page source: none found for `Clicked Hebrew form`, `Best actual hit`, `Potential options`, `No lexical entry yet.`, `data-hud-renderings`, `data-hud-breakdown`, `assets/js/lexical-hud.js`, `assets/js/hud-preview.js`, or `hud-preview`

Current source config still points to full data paths:

```json
{
  "manifest_url": "../../data/lexical/exodus.manifest.json",
  "occurrence_url": "../../data/lexical/occurrences/exodus.json",
  "hud_route_lookup_manifest_url": "../../data/definitions/hud-route-lookup/manifest.json",
  "root_href": "../../"
}
```

Required publication rewrite is therefore bounded public data paths, matching Deuteronomy/Genesis:

```json
{
  "work_id": "exodus",
  "work_slug": "tanakh/exodus",
  "work_title": "Exodus",
  "manifest_url": "../../data/public-hud/exodus/manifest.json",
  "occurrence_url": "../../data/public-hud/exodus/occurrences.json",
  "reader_hint_url": "../../data/public-hud/exodus/reader-hints.json",
  "hud_route_lookup_manifest_url": "../../data/public-hud/exodus/route-lookup/manifest.json",
  "root_href": "../../"
}
```

## Required Artifact Set

Required for a bounded #3 public candidate:

- `tanakh/exodus/index.html`
- `data/public-hud/exodus/manifest.json`
- `data/public-hud/exodus/occurrences.json`
- `data/public-hud/exodus/reader-hints.json`
- `data/public-hud/exodus/chunks/exodus-001.json`
- `data/public-hud/exodus/route-lookup/manifest.json`
- `data/public-hud/exodus/route-lookup/shards/05e9-05de-05d5.json`
- shared runtime: `assets/js/reader-workbench.js`
- shared stylesheet: `assets/css/reader-workbench.css`

Do not publish the full `data/lexical/exodus.manifest.json` path or full `data/definitions/hud-route-lookup/manifest.json` path as page dependencies for this candidate.

## Public-HUD Data Needs

Local inputs exist:

- `data/lexical/exodus.manifest.json`: present
- `data/lexical/occurrences/exodus.json`: present
- `data/lexical/token-indexes/tanakh/exodus.json`: present
- `data/definitions/hud-route-lookup/manifest.json`: present

Sentinel route proof:

- sentinel token: `tok-45d91688c8d4`
- source ref: `Exodus 1:1`
- lexical chunk: `exodus-002`, source URL `exodus-chunks/exodus-002.json`
- normalized codepoints: `05e9-05de-05d5-05ea`
- required route shard: `05e9-05de-05d5`
- route cards for sentinel normalized token: `52`
- local route shard size context: `122` normalized tokens, `600` route cards

Local work size context:

- Exodus page bytes: `1,584,224`
- lexical manifest chunks: `9`
- occurrence units: `1,210`
- total occurrences: `14,481`

## Inline Reader Hint Candidate

Top current route candidate for the sentinel token:

```text
94% Exodus (the second of the Books of Moses in the Old Testament of the Bible, the second book in the Torah describing the Exodus)
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
- source id: `kaikki-fbc9e47f36201b01`
- source URL: `https://kaikki.org/dictionary/Hebrew/index.html`
- license: `CC BY-SA 4.0 / GFDL`
- license URL: `https://en.wiktionary.org/wiki/Wiktionary:Copyrights`
- route card id: `def-kaikki-lemma-6ac9bca16753d20e`
- route family: `wiktionary_definition`
- route type: `lemma`
- match type: `lemma`

Agent 1 was not needed for this prep packet because no source/provenance/licensing uncertainty was found that blocks selecting Exodus as a bounded public candidate. This is not source/provenance custody acceptance.

## Route / HUD Runtime Requirements

Before publication, the Exodus public candidate should pass the same bounded gates used for Genesis:

- page config points only at `data/public-hud/exodus/**`
- `reader_hint_url` exists and declares reader convenience boundaries
- sentinel token opens fullscreen current HUD
- sentinel HUD shows route cards from the filtered Exodus route shard
- inline hint appears pre-click with title boundary text
- old HUD markers are absent from page, public data, and public navigation
- old HUD JS/sample routes remain unavailable

Blank HUD behavior for non-public or non-bounded tokens is acceptable only if no old HUD or broken old-HUD behavior appears.

## Deployment / Source-of-Truth Requirements

Current public source of truth remains:

```text
cd79284caa8d41dd6f972e14a3e20f028ecea7a5 Add Genesis public reader surface
```

Exodus is not currently public in the bounded live artifact. Publication of page #3 should be a single-page artifact update only, not a multi-page rollout, while Genesis #2 remains under Agent 6 review.

## Agent 6 Review Needs

Agent 6 can review this packet for:

- candidate selection rationale for `tanakh/exodus/`
- current-HUD runtime reuse feasibility
- absence of old-HUD markers in the source page
- bounded public artifact set required for publication
- sentinel route-card availability and source/license metadata
- inline reader hint boundary language
- no claim of translation, accepted gloss, source custody acceptance, public/runtime acceptance, or publication readiness

Agent 6 should not treat this packet as acceptance. It is review input only.

## Wakes / Decisions Requested

None.

## Agent 8 Callback

- status: response artifact produced; candidate page #3 selected/prepared for Agent 6 review input
- artifact path: `reports/agent10-candidate-page-3-shipment-prep-2026-06-02.md`
- selected page or blocker: `tanakh/exodus/`
- Agent 1 needed: no
- Agent 2 needed: no
- Agent 4 needed: no
- Agent 7/13 decision needed: no
- next recommended executable route: prepare candidate page #4 as a single-page bounded shipment-prep packet; highest-ROI next page is `tanakh/leviticus/` unless a current-state probe finds a blocker
