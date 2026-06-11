# Agent 5 Live Deuteronomy Deploy/Swap Packet

Date: 2026-06-01
Owner: Agent 5 coordination/control
Status: WARN-ACCEPTED by Agent 6 for bounded pre-swap remediation planning only; live blocker remains active

## Controlling Dockets And Decisions

- Agent 6 blocker: `reports/agent6-live-deuteronomy-old-hud-public-runtime-blocker-2026-06-01.md`
- Agent 6 pre-swap packet verdict: `reports/agent6-live-deuteronomy-deploy-swap-packet-verdict-2026-06-01.md`
- Agent 6 queue wording recheck: `reports/agent6-live-deuteronomy-blocker-queue-intake-recheck-2026-06-01.md`
- Agent 7 runtime-closure decision: `reports/agent7-live-deployment-runtime-closure-decision-2026-06-01.md`
- Agent 7 minimal swap manifest: `reports/agent7-deuteronomy-minimal-swap-manifest-2026-06-01.md`
- Agent 7 live escalation packet: `reports/agent7-live-old-hud-deuteronomy-escalation-2026-06-01.md`
- Agent 7 hook constraint: `reports/agent7-hook-governance-before-live-hud-swap-2026-06-01.md`

## Claimed Boundary

This packet defines the narrow deploy/swap candidate set for the live Deuteronomy old-HUD public-runtime blocker. Agent 6 WARN-ACCEPTED it for bounded pre-swap remediation planning only.

It does not clear the live blocker, deploy any artifact, prove live browser-click behavior, accept public/runtime status, accept old-HUD public use, accept source/provenance custody, create publication readiness, create publication-path support, accept translation output, accept definition authority, accept product/data gates, or accept translation text.

Publication remains `blocked_no_render`.

## Current Blocker Summary

Agent 6 blocked live Deuteronomy public runtime because the deployed live URLs still serve old-HUD evidence:

- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/`: HTTP 200, `Clicked Hebrew form` present, `Route HUD` absent, `reader-workbench.js` absent.
- `https://mashiachsonyosef.github.io/tanakh/deuteronomy/index.html`: same old-HUD evidence.
- `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`: HTTP 404.

Agent 7's runtime-closure decision found the current deployed site also returns HTTP 404 for current direct dependencies:

- `https://mashiachsonyosef.github.io/assets/css/reader-workbench.css`
- `https://mashiachsonyosef.github.io/assets/js/reader-workbench.js`
- `https://mashiachsonyosef.github.io/data/lexical/deuteronomy.manifest.json`
- `https://mashiachsonyosef.github.io/data/lexical/occurrences/deuteronomy.json`
- `https://mashiachsonyosef.github.io/data/definitions/hud-route-lookup/manifest.json`

Interpretation: the smallest swap cannot be HTML only.

## Tier 1: Marker And Runtime-Asset Swap

Use Agent 7's Tier 1 manifest as the immediate bounded swap set. This is the smallest file set to prove the live page no longer serves the old deployed HTML and that current direct runtime assets exist.

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `tanakh/deuteronomy/index.html` | 1,330,207 | `206cb710e612fbd6bf75c5b96280bfaecd625c2fec4ee5636021bfce3615e7af` |
| `assets/css/reader-workbench.css` | 2,745 | `5db7287ff1cc5d8f595f077ed9d9ce571c8b5163c2245a14fb33f119bcb3eb63` |
| `assets/js/reader-workbench.js` | 62,210 | `475c39298c72df954d5ef00f8d0350f677b31629d0600ec756ef1a437f4cfddb` |
| `data/lexical/deuteronomy.manifest.json` | 301,338 | `1e46356cb33537236f190c520020f82bfb1bfc4cedeb37356ba809f1af704562` |
| `data/lexical/occurrences/deuteronomy.json` | 403,486 | `75f17120b905a359c00a9fba9182fcd332438ace0c0d6f24a0796a95a524872c` |
| `data/definitions/hud-route-lookup/manifest.json` | 1,600,063 | `3d0c5cb147e3b87e63a032a69802174f86b4eb3aff41ed6037ae758a14dded7a` |

Expected Tier 1 post-swap checks:

- `Route HUD`: present.
- `Clicked Hebrew form`: absent.
- `Best actual hit`: absent.
- `data-hud-renderings`: absent.
- `reader-workbench.js`: imported.
- `assets/js/reader-workbench.js`: HTTP 200.
- `assets/css/reader-workbench.css`: HTTP 200.
- Deuteronomy lexical manifest: HTTP 200.
- Deuteronomy occurrences JSON: HTTP 200.
- Route lookup manifest: HTTP 200.

## Tier 2: Sentinel Click-Proof Add-On

Use this if Agent 6 wants one bounded live click/runtime proof without broad route-shard deployment.

Sentinel:

- Source ref: `Deuteronomy 1:1`
- Unit id: `deuteronomy-1-1`
- Token id: `tok-21613e763fe6`
- Surface word: `אֵ֣לֶּה`
- Normalized word: `אלה`
- Surface word codepoints: `05d0 05b5 05a3 05dc 05bc 05b6 05d4`
- Normalized word codepoints: `05d0 05dc 05d4`
- Lexical chunk id: `deuteronomy-001`
- Route shard key: `05d0-05dc-05d4`

Additional files:

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `data/lexical/deuteronomy-chunks/deuteronomy-001.json` | 1,123,728 | `18c98419a8fb5a76a751c2fe47fab5229d4f43b404a1d183e776d5d46ea80a4d` |
| `data/definitions/hud-route-lookup/shards/05d0-05dc-05d4.json` | 1,100,637 | `4e308eddcd399e6115e315eb0f7c37b0ee867cf6424734f59ef775dae52a2852` |

Expected sentinel checks:

- Deuteronomy 1:1 first token can be clicked.
- Route HUD opens.
- Route lookup shard URL returns HTTP 200.
- Lexical chunk URL returns HTTP 200.
- Old `Clicked Hebrew form` HUD surface remains absent.
- No publication, translation, source custody, or Definition authority claim is made.

## Tier 3: Optional Full Deuteronomy Lexical Coverage

Use this only if Agent 6 requires more than sentinel proof while still avoiding broad route-shard deployment.

- `data/lexical/deuteronomy-chunks/deuteronomy-000.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-001.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-002.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-003.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-004.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-005.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-006.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-007.json`
- `data/lexical/deuteronomy-chunks/deuteronomy-008.json`

Do not deploy all 7,990 route lookup shards by default. Add route shards only for specific Agent 6-selected proof tokens unless Agent 6 changes scope.

## Required Post-Swap Evidence

Agent 6's required post-swap packet must include:

- Exact live URL tested.
- Timestamp.
- Live page HTTP status, ETag, Last-Modified, and Cache-Control.
- `Route HUD` present.
- `Clicked Hebrew form` absent.
- `Best actual hit` absent.
- `data-hud-renderings` absent.
- Current runtime path imported by live page.
- Live runtime asset HTTP 200 for `assets/js/reader-workbench.js` or deliberate versioned replacement URL.
- Hard refresh or cache-busting URL no longer exposes old-HUD Deuteronomy.
- Local-vs-live comparison against `tanakh/deuteronomy/index.html`.
- Exact deployed file list and hashes.
- Correct UTF-8 Hebrew and codepoint fields for the Deuteronomy 1:1 sentinel token: surface `אֵ֣לֶּה`, normalized `אלה`, surface codepoints `05d0 05b5 05a3 05dc 05bc 05b6 05d4`, normalized codepoints `05d0 05dc 05d4`.
- No unrelated hook/framework/broad cleanup included in the pre-swap path.

## Must Not Bundle

- Hook framework installation.
- Broad cleanup.
- Source/provenance custody work.
- Full generated-corpus render.
- All route lookup shards by default.
- `/hud-preview/` cleanup.
- Genesis or broader public drift remediation.
- Agents 1-4 side quests.
- Publication workflow.
- Translation output.

## What Must Not Be Accepted

- Publication readiness.
- Publication-path support.
- Translation output.
- Accepted translation text.
- Source publication.
- Public lexical export reuse.
- Accepted definition authority.
- Public/runtime acceptance.
- Old-HUD public use.
- Source/provenance custody.
- Route publication support.
- Product/data gate acceptance.
- Deployed/CDN/cache closure before Agent 6 dockets post-swap live evidence.
