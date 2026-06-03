# Agent 10 Orot Flagship Public HUD Proof - 2026-06-02

## Scope

Release-owner bounded proof for adding top-level `orot/` as a lightweight public current-HUD reader surface, modeled on the Ruth pattern.

This packet does not claim QA acceptance, source/provenance custody acceptance, publication readiness, Definition authority, usage-as-definition authority, translation output, or accepted translation text.

## Public Artifact Changes Prepared

- Root card added: `index.html` -> `orot/`
- Public page added: `orot/index.html`
- Public HUD package added: `data/public-hud/orot/**`
- Deploy workflow updated to include `orot/index.html` and `data/public-hud/orot/**`

## Orot Public HUD Package

- Occurrence token count: 59,806
- Unique token id count: 17,307
- Reader hint candidates: 5,720 token IDs, rendering as 33,138 visible inline hint rows in browser proof
- Route shard scope: one bounded sentinel shard
- Sentinel token: `tok-7bdd5b9326c9`
- Sentinel surface: `אֶרֶץ`
- Sentinel normalized key: `ארצ`
- Sentinel route shard: `05d0-05e8-05e6`
- Sentinel route cards: 47
- Sentinel inline hint: `80% country, land; territory, district, region; Earth (the third planet of the Solar System; the world upon which humans live); ground, soil; Israel`

Reader hints are marked `reader_hint_not_translation` and `candidate_not_authority`.

## Static Validation

- `node --check assets/js/reader-workbench.js`: pass
- `node C:\Users\owner\Documents\translations\scripts\validate_route_hud_page.mjs --page orot\index.html`: pass
- Old-HUD marker scan over `orot`, `data/public-hud/orot`, `assets/js/reader-workbench.js`, and `index.html`: no matches
- Local Pages artifact build: 82 files, 37.78 MiB
- Local Pages artifact old-HUD marker guard: pass

## Browser Proof

Local artifact URL checked: `http://127.0.0.1:58650/`

Root:
- Status: loaded
- Title: `Mashiach Son Yosef Library`
- Orot card: present
- Old HUD marker: no

Orot pre-click:
- URL: `http://127.0.0.1:58650/orot/?v=local-proof`
- Title: `Orot`
- Clickable token buttons: 59,774
- Visible inline hints: 33,138
- Shared runtime: `assets/js/reader-workbench.js`
- Public HUD config only: yes
- Sentinel count: 1
- Sentinel hint visible: yes
- Old HUD marker: no

Sentinel click:
- HUD open: yes
- HUD title: `Route HUD: אֶרֶץ`
- Route cards: 47
- Source/license rows: 6
- Definition section: present
- Sources and licenses section: present
- Old HUD marker: no

Hard refresh:
- Clickable token buttons: 59,774
- Visible inline hints: 33,138
- HUD hidden after refresh: yes
- Old HUD marker: no

Poisoned query/local storage:
- URL: `http://127.0.0.1:58650/orot/?hud=old&lexical-hud=legacy&reader-workbench=accepted_translation`
- Visible inline hints: 33,138
- Old HUD marker: no
- Accepted-translation poison visible: no
- Shared runtime remains active: yes

Old path probes:
- `assets/js/hud-preview.js`: 404
- `assets/js/lexical-hud.js`: 404
- `reader-workbench/`: 404
- `data/definitions/hud-route-lookup/manifest.json`: 404

Public HUD dependency responses:
- `/orot/?v=local-proof`: 200
- `/assets/css/reader-workbench.css`: 200
- `/assets/js/reader-workbench.js`: 200
- `/data/public-hud/orot/occurrences.json`: 200
- `/data/public-hud/orot/manifest.json`: 200
- `/data/public-hud/orot/reader-hints.json`: 200
- `/data/public-hud/orot/chunks/orot-001.json`: 200
- `/data/public-hud/orot/route-lookup/manifest.json`: 200
- `/data/public-hud/orot/route-lookup/shards/05d0-05e8-05e6.json`: 200

Screenshot:
- `reports/evidence/orot-flagship-local-proof-2026-06-02.png`

## Source Boundary

Public Orot page header states:

- Hebrew version: Wikisource
- Version source: `he.wikisource.org`
- Digitization: Sefaria API
- License: CC-BY-SA

Agent 10 treats this as visible source/license evidence only. It does not clear Agent 1 source/provenance custody acceptance.

## Agent 1 / Agent 4 Assist Status

- Agent 1 assist spawned for source/provenance/license review: `019e8af9-3799-7021-bfbf-7d1457946d4c`
  - Status: warn
  - Orot source text metadata: complete for 416/416 units as CC-BY-SA, Wikisource version, Sefaria API digitization
  - No Orot source-text licensing blocker found for bounded public-HUD exposure if notices remain visible
  - Warning: 4 unique incomplete current-HUD lexical citation rows in source chunks: `lex-aph-h639`, `lex-mashiach-h4899`, `lex-ruach-h7307`, `lex-yhwh-h3068`
  - Halt decision: no halt on Orot source/licensing grounds; treat warning as not source custody approval or publication acceptance
- Agent 4 assist spawned for independent runtime/browser review: `019e8af9-4c04-77b2-a776-4aad2494f6b9`

Agent 10 did not wait on Agent 4 because the critical path remained locally testable. Any later hard blocker from Agent 4 should be treated as a release-owner interruption.

## Current Claim

Orot is locally prepared as a bounded lightweight current-HUD public artifact with inline reader hints and one proven sentinel route-HUD click path.

Old HUD exposure in local artifact proof: no.

## Not Accepted

- QA acceptance
- Validated live public runtime acceptance
- Publication readiness
- Source/provenance custody acceptance
- Source publication
- Source-file tracking approval
- CDN/cache closure
- Broad rollout
- Product/data acceptance
- Route publication support
- Definition authority
- Usage-as-definition authority
- Translation output
- Accepted translation text
