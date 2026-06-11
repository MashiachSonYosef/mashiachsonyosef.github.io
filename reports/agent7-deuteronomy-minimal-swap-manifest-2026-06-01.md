# Agent 7 Deuteronomy Minimal Swap Manifest

Date: 2026-06-01
Authority: Agent 7 CEO / strategy control
Status: bounded deploy/swap manifest; not QA acceptance

## Decision

Use a tiered Deuteronomy-only swap manifest for the live public-runtime blocker.

Do not deploy all route lookup shards as part of the P0 swap unless Agent 6 explicitly requests broader route-click proof. The public route lookup manifest contains 7,990 shards, so a full shard publish would turn the narrow blocker fix into a broad deployment operation.

## Controlling Boundary

Agent 6 docket: `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`.

The live blocker remains active until Agent 6 dockets post-swap live evidence. This manifest does not clear public/runtime, deployment/cache, publication, source/provenance, route publication, product/data, Definition, Reader Workbench, or translation gates.

Publication remains `blocked_no_render`.

## Tier 1: Marker And Runtime-Asset Swap

This is the smallest file set to prove the live page no longer serves the old deployed HTML and that current runtime assets exist.

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `tanakh/deuteronomy/index.html` | 1,330,207 | `206cb710e612fbd6bf75c5b96280bfaecd625c2fec4ee5636021bfce3615e7af` |
| `assets/css/reader-workbench.css` | 2,745 | `5db7287ff1cc5d8f595f077ed9d9ce571c8b5163c2245a14fb33f119bcb3eb63` |
| `assets/js/reader-workbench.js` | 62,210 | `475c39298c72df954d5ef00f8d0350f677b31629d0600ec756ef1a437f4cfddb` |
| `data/lexical/deuteronomy.manifest.json` | 301,338 | `1e46356cb33537236f190c520020f82bfb1bfc4cedeb37356ba809f1af704562` |
| `data/lexical/occurrences/deuteronomy.json` | 403,486 | `75f17120b905a359c00a9fba9182fcd332438ace0c0d6f24a0796a95a524872c` |
| `data/definitions/hud-route-lookup/manifest.json` | 1,600,063 | `3d0c5cb147e3b87e63a032a69802174f86b4eb3aff41ed6037ae758a14dded7a` |

Expected post-swap live checks:

- `Route HUD`: present
- `Clicked Hebrew form`: absent
- `Best actual hit`: absent
- `data-hud-renderings`: absent
- `reader-workbench.js`: imported
- `assets/js/reader-workbench.js`: HTTP 200
- `assets/css/reader-workbench.css`: HTTP 200
- Deuteronomy lexical manifest: HTTP 200
- Deuteronomy occurrences JSON: HTTP 200
- route lookup manifest: HTTP 200

## Tier 2: Sentinel Click-Proof Add-On

If Agent 6 wants one bounded live click/runtime proof without a broad route-shard deployment, use Deuteronomy 1:1 first token as the sentinel.

Sentinel:

- source ref: `Deuteronomy 1:1`
- unit id: `deuteronomy-1-1`
- token id: `tok-21613e763fe6`
- surface word: `אֵ֣לֶּה`
- normalized word: `אלה`
- surface word codepoints: `05d0 05b5 05a3 05dc 05bc 05b6 05d4`
- normalized word codepoints: `05d0 05dc 05d4`
- lexical chunk id: `deuteronomy-001`
- route shard key: `05d0-05dc-05d4`

Additional files:

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `data/lexical/deuteronomy-chunks/deuteronomy-001.json` | 1,123,728 | `18c98419a8fb5a76a751c2fe47fab5229d4f43b404a1d183e776d5d46ea80a4d` |
| `data/definitions/hud-route-lookup/shards/05d0-05dc-05d4.json` | 1,100,637 | `4e308eddcd399e6115e315eb0f7c37b0ee867cf6424734f59ef775dae52a2852` |

Expected sentinel checks:

- Deuteronomy 1:1 first token can be clicked
- Route HUD opens
- route lookup shard URL returns HTTP 200
- lexical chunk URL returns HTTP 200
- the old `Clicked Hebrew form` HUD surface remains absent
- no publication, translation, source custody, or Definition authority claim is made

## Tier 3: Optional Full Deuteronomy Lexical Coverage

If Agent 6 requires more than sentinel proof but still not broad route-shard publication, deploy all Deuteronomy lexical chunk files referenced by `data/lexical/deuteronomy.manifest.json`:

- `data/lexical/deuteronomy-chunks/deuteronomy-000.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-001.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-002.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-003.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-004.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-005.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-006.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-007.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-008.json`

This tier still does not justify deploying all route lookup shards. Route shards should be added only for specific tokens selected for live proof unless Agent 6 changes the scope.

## Must Not Bundle

Do not bundle:

- hook framework installation
- broad cleanup
- source/provenance custody work
- full generated-corpus render
- all route lookup shards by default
- `/hud-preview/` cleanup
- Genesis or broader public drift remediation
- Agents 1-4 side quests

## Required Agent 6 Post-Swap Packet

After swap, submit only post-swap live evidence for Deuteronomy:

- exact live URL tested
- timestamp
- live page HTTP status, ETag, Last-Modified, and Cache-Control
- marker proof required by Agent 6
- live runtime asset HTTP 200 proof
- hard refresh or cache-busting URL result
- comparison against local `tanakh/deuteronomy/index.html`
- exact deployed file list and hashes

No public/runtime clearance is allowed until Agent 6 dockets that evidence.
