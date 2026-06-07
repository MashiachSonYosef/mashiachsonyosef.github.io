# Agent 10 Full-Corpus Batch46 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH46_20_READY_JEWISH_THOUGHT_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: first Jewish Thought page batch under the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Corpus Selection

Jewish Thought is selected after the Chasidut closure as the next explicit remaining top-level corpus family. Batch46 uses the first 20 sorted Jewish Thought directories that contain `index.html`.

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 20 | 2659247 | 0 | 2659247 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Abarbanel on Guide for the Perplexed | `jewish-thought/abarbanel-on-guide-for-the-perplexed/index.html` | 148297 | 0 | 148297 |
| 2 | Akeidat Yitzchak | `jewish-thought/akeidat-yitzchak/index.html` | 1205876 | 0 | 1205876 |
| 3 | Beit Elohim | `jewish-thought/beit-elohim/index.html` | 243952 | 0 | 243952 |
| 4 | Crescas on Guide for the Perplexed | `jewish-thought/crescas-on-guide-for-the-perplexed/index.html` | 8656 | 0 | 8656 |
| 5 | Derekh Hashem | `jewish-thought/derekh-hashem/index.html` | 28127 | 0 | 28127 |
| 6 | Duties of the Heart | `jewish-thought/duties-of-the-heart/index.html` | 17099 | 0 | 17099 |
| 7 | Efodi on Guide for the Perplexed | `jewish-thought/efodi-on-guide-for-the-perplexed/index.html` | 5766 | 0 | 5766 |
| 8 | Eight Chapters | `jewish-thought/eight-chapters/index.html` | 9535 | 0 | 9535 |
| 9 | Essay on Fundamentals | `jewish-thought/essay-on-fundamentals/index.html` | 4244 | 0 | 4244 |
| 10 | HaEmunot veHaDeot | `jewish-thought/haemunot-vehadeot/index.html` | 35838 | 0 | 35838 |
| 11 | Imrei Binah | `jewish-thought/imrei-binah/index.html` | 84476 | 0 | 84476 |
| 12 | Kuzari | `jewish-thought/kuzari/index.html` | 47471 | 0 | 47471 |
| 13 | Letter to the Ten Lost Tribes of Israel | `jewish-thought/letter-to-the-ten-lost-tribes-of-israel/index.html` | 3459 | 0 | 3459 |
| 14 | Marpeh la&#39;Nefesh | `jewish-thought/marpeh-lanefesh/index.html` | 13779 | 0 | 13779 |
| 15 | Minchat Kenaot | `jewish-thought/minchat-kenaot/index.html` | 85927 | 0 | 85927 |
| 16 | Moreh Nevukhei HaZeman | `jewish-thought/moreh-nevukhei-hazeman/index.html` | 189332 | 0 | 189332 |
| 17 | Narboni on Guide for the Perplexed | `jewish-thought/narboni-on-guide-for-the-perplexed/index.html` | 93023 | 0 | 93023 |
| 18 | Nineteen Letters | `jewish-thought/nineteen-letters/index.html` | 26010 | 0 | 26010 |
| 19 | Nishmat Chayyim | `jewish-thought/nishmat-chayyim/index.html` | 133291 | 0 | 133291 |
| 20 | Ohr Hashem | `jewish-thought/ohr-hashem/index.html` | 275089 | 0 | 275089 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <20 Batch46 pages>` | 120000ms | passed: Route HUD page validation passed for 20 page(s). |
| `git diff --check -- <20 Batch46 pages>` | 60000ms | passed: no whitespace errors |
| `node <Batch46 source/config/asset guard>` | 60000ms | passed: 20 pages; 2659247 token rows; 0 configured hint rows; 2659247 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch46-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 20 pages.
- Source/config/asset guard passed and counted 2659247 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.

## A14 Next Action

- Review Batch46 Jewish Thought page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can close remaining Jewish Thought page targets next.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch46 Jewish Thought or returns exact blocker; Agent 10 can continue to Jewish Thought closure after checkpoint or explicit continuation.
