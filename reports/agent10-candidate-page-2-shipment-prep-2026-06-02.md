# Agent 10 Candidate Page #2 Shipment Prep - 2026-06-02

## Status

Candidate page #2 selected/prepared for Agent 6 review.

This packet does not claim QA acceptance, public/runtime acceptance, source/provenance acceptance, publication readiness, product/data acceptance, route publication support, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

## Candidate

- Page: `tanakh/genesis/`
- Work ID: `genesis`
- Public URL checked: `https://mashiachsonyosef.github.io/tanakh/genesis/?cb=agent10-page2-browser`
- Deployment/source-of-truth commit: `cd79284caa8d41dd6f972e14a3e20f028ecea7a5`

## Why This Page

Genesis is the highest-ROI page #2 because it already had the current Reader Workbench / Route HUD page structure, existing lexical manifest data, existing occurrence data, and existing token index data. It also pairs naturally with Deuteronomy as a Tanakh reader surface, while requiring only a bounded public-HUD artifact instead of a broad corpus render.

## Current-HUD Pattern Reuse

Genesis reuses the Deuteronomy fullscreen current-HUD runtime pattern:

- `assets/js/reader-workbench.js`
- `assets/css/reader-workbench.css`
- page-level `data-lexical-hud`
- page-level `data-route-hud-panel`
- bounded `data/public-hud/genesis/**` data paths
- inline reader candidate hints via `reader_hint_url`

## Required Artifact Set

Current bounded public artifact set:

- `tanakh/genesis/index.html`
- `data/public-hud/genesis/manifest.json`
- `data/public-hud/genesis/occurrences.json`
- `data/public-hud/genesis/reader-hints.json`
- `data/public-hud/genesis/chunks/genesis-001.json`
- `data/public-hud/genesis/route-lookup/manifest.json`
- `data/public-hud/genesis/route-lookup/shards/05e8-05d0-05e9.json`
- shared runtime: `assets/js/reader-workbench.js`
- shared stylesheet: `assets/css/reader-workbench.css`

## Public-HUD Data Needs

Satisfied for page #2 bounded review:

- token bridge exists for sentinel token `tok-c2c3af8e625f`
- occurrence bridge exists for Genesis
- route lookup manifest exists for Genesis
- one filtered route shard exists for normalized sentinel `ראשית`
- inline candidate hint file exists and declares reader convenience boundaries

Not claimed:

- full Genesis lexical publication
- full route publication support
- accepted definitions
- accepted translation text

## Source / License / Citation Evidence

Bounded route-card and reader-hint rows carry source/license rows from the existing route/HUD data. The live browser check showed the Genesis sentinel inline hint:

```text
94% first of all, first
```

with title boundary:

```text
Reader hint candidate, not an accepted gloss: 94% first of all, first
```

Agent 10 does not claim this is semantic truth, accepted gloss, or accepted translation.

## Route / HUD Runtime Evidence

Live browser check:

- URL: `https://mashiachsonyosef.github.io/tanakh/genesis/?cb=agent10-page2-browser`
- HTTP status: `200`
- sentinel token: `tok-c2c3af8e625f`
- current HUD opened: yes
- route cards visible: `48`
- old HUD marker in HUD text: none

HTTP checks:

- root URL returned `200` and links Genesis
- Genesis page returned `200`
- `data/public-hud/genesis/manifest.json` returned `200`
- `data/public-hud/genesis/reader-hints.json` returned `200` and contains `candidate_not_authority`
- `data/public-hud/genesis/route-lookup/manifest.json` returned `200`
- `assets/js/lexical-hud.js` returned `404`
- `hud-preview.html` returned `404`

## Deployment / Source-of-Truth Requirements

Current source-of-truth commit on `origin/main`:

```text
cd79284caa8d41dd6f972e14a3e20f028ecea7a5
```

The live URL checks were cache-busted and performed after this commit was present on `origin/main`.

## Agent 6 Review Needs

Agent 6 can review:

- old-HUD exposure remains `0` on checked public paths
- Genesis uses current HUD runtime and bounded public data paths
- Genesis inline counterpart is explicitly a reader hint candidate
- Genesis does not claim semantic authority or accepted translation
- old HUD JS/sample paths remain unavailable from public navigation

Agent 6 should not treat this packet as acceptance. It is review input only.

## Agent 1 Routing

Agent 1 was not needed for this packet. No page #2 source/provenance/licensing uncertainty was found that blocked bounded shipment-prep. This does not claim source custody acceptance.

## Wakes / Decisions Requested

None.

