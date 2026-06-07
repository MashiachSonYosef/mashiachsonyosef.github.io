# Agent 10 Full-Corpus Batch42 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH42_11_READY_ARI_CLOSURE_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: Ari corpus-family closure under the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Corpus Selection

Ari is selected as the next explicit remaining top-level corpus family after the Halakhah closure. All 11 Ari pages are included here.

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 11 | 622095 | 0 | 622095 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Pri Etz Chaim | `ari/pri-etz-chaim/index.html` | 52464 | 0 | 52464 |
| 2 | Sefer Etz Chaim | `ari/sefer-etz-chaim/index.html` | 1925 | 0 | 1925 |
| 3 | Sha&#39;arei Kedusha | `ari/shaarei-kedusha/index.html` | 3389 | 0 | 3389 |
| 4 | Sha&#39;ar HaGilgulim | `ari/shaar-hagilgulim/index.html` | 91339 | 0 | 91339 |
| 5 | Sha&#39;ar HaHakdamot | `ari/shaar-hahakdamot/index.html` | 45700 | 0 | 45700 |
| 6 | Sha&#39;ar HaKavanot | `ari/shaar-hakavanot/index.html` | 61771 | 0 | 61771 |
| 7 | Sha&#39;ar HaMitzvot | `ari/shaar-hamitzvot/index.html` | 59268 | 0 | 59268 |
| 8 | Sha&#39;ar HaPesukim | `ari/shaar-hapesukim/index.html` | 119822 | 0 | 119822 |
| 9 | Sha&#39;ar Ma&#39;amarei Rashbi | `ari/shaar-maamarei-rashbi/index.html` | 163327 | 0 | 163327 |
| 10 | Sha&#39;ar Ma&#39;amarei Razal | `ari/shaar-maamarei-razal/index.html` | 18490 | 0 | 18490 |
| 11 | Sha&#39;ar Ruach HaKodesh | `ari/shaar-ruach-hakodesh/index.html` | 4600 | 0 | 4600 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <11 Batch42 pages>` | 120000ms | passed: Route HUD page validation passed for 11 page(s). |
| `git diff --check -- <11 Batch42 pages>` | 60000ms | passed: no whitespace errors |
| `node <Batch42 source/config/asset guard>` | 60000ms | passed: 11 pages; 622095 token rows; 0 configured hint rows; 622095 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch42-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 11 pages.
- Source/config/asset guard passed and counted 622095 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.

## A14 Next Action

- Review Batch42 Ari closure packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; next likely A10 family is chasidut.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch42 Ari closure or returns exact blocker; Agent 10 can continue to Chasidut after checkpoint or explicit continuation.
