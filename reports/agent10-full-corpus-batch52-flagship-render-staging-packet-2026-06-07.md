# Agent 10 Full-Corpus Batch52 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH52_20_READY_MUSAR_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: first Musar page batch under the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Corpus Selection

Musar is selected after the Liturgy closure as the next explicit remaining top-level corpus family. Batch52 uses the first 20 sorted Musar directories that contain `index.html`.

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 20 | 2506229 | 0 | 2506229 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Bechinat Olam | `musar/bechinat-olam/index.html` | 6729 | 0 | 6729 |
| 2 | Iggeret HaRamban | `musar/iggeret-haramban/index.html` | 512 | 0 | 512 |
| 3 | Kad HaKemach | `musar/kad-hakemach/index.html` | 170674 | 0 | 170674 |
| 4 | Kav HaYashar | `musar/kav-hayashar/index.html` | 102184 | 0 | 102184 |
| 5 | Letter from Ramban to his Son | `musar/letter-from-ramban-to-his-son/index.html` | 1616 | 0 | 1616 |
| 6 | Ma&#39;alot HaMiddot | `musar/maalot-hamiddot/index.html` | 74968 | 0 | 74968 |
| 7 | Ma&#39;amar Mezakeh HaRabim | `musar/maamar-mezakeh-harabim/index.html` | 6139 | 0 | 6139 |
| 8 | Ma&#39;amar Torat HaBayit | `musar/maamar-torat-habayit/index.html` | 23108 | 0 | 23108 |
| 9 | Menorat HaMaor | `musar/menorat-hamaor/index.html` | 382061 | 0 | 382061 |
| 10 | Mesillat Yesharim | `musar/mesillat-yesharim/index.html` | 32012 | 0 | 32012 |
| 11 | Mivchar HaPeninim | `musar/mivchar-hapeninim/index.html` | 9985 | 0 | 9985 |
| 12 | Orchot Chaim L&#39;HaRosh | `musar/orchot-chaim-lharosh/index.html` | 2450 | 0 | 2450 |
| 13 | Orchot Tzadikim | `musar/orchot-tzadikim/index.html` | 66272 | 0 | 66272 |
| 14 | Pele Yoetz | `musar/pele-yoetz/index.html` | 233164 | 0 | 233164 |
| 15 | Sefer HaYashar | `musar/sefer-hayashar/index.html` | 29691 | 0 | 29691 |
| 16 | Sha&#39;ar HaGemul of the Ramban | `musar/shaar-hagemul-of-the-ramban/index.html` | 20372 | 0 | 20372 |
| 17 | Sha&#39;arei Teshuvah | `musar/shaarei-teshuvah/index.html` | 39415 | 0 | 39415 |
| 18 | Shekel HaKodesh | `musar/shekel-hakodesh/index.html` | 8279 | 0 | 8279 |
| 19 | Shenei Luchot HaBerit | `musar/shenei-luchot-haberit/index.html` | 1112870 | 0 | 1112870 |
| 20 | Shevet Musar | `musar/shevet-musar/index.html` | 183728 | 0 | 183728 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <20 Batch52 pages>` | 120000ms | passed: Route HUD page validation passed for 20 page(s). |
| `git diff --check -- <20 Batch52 pages>` | 60000ms | passed: no whitespace errors; CRLF replacement warning only |
| `node <Batch52 source/config/asset guard>` | 60000ms | passed: 20 pages; 2506229 token rows; 0 configured hint rows; 2506229 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch52-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 20 pages.
- Source/config/asset guard passed and counted 2506229 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.
- Scoped diff check produced one CRLF replacement warning only, no whitespace errors.

## A14 Next Action

- Review Batch52 Musar page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can close remaining Musar page targets next.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch52 Musar or returns exact blocker; Agent 10 can continue to Musar closure after checkpoint or explicit continuation.
