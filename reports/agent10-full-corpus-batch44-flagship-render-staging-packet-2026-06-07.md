# Agent 10 Full-Corpus Batch44 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH44_20_READY_CHASIDUT_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: second Chasidut page batch under the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Corpus Selection

Batch44 continues Chasidut after Batch43's last page target, `chasidut/maggid-devarav-leyaakov/index.html`.

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 20 | 4538872 | 0 | 4538872 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Maor VaShemesh | `chasidut/maor-vashemesh/index.html` | 370818 | 0 | 370818 |
| 2 | Mekor Mayim Chayim on Baal Shem Tov | `chasidut/mekor-mayim-chayim-on-baal-shem-tov/index.html` | 144507 | 0 | 144507 |
| 3 | Me&#39;or Einayim | `chasidut/meor-einayim/index.html` | 179568 | 0 | 179568 |
| 4 | Noam Elimelekh | `chasidut/noam-elimelekh/index.html` | 170132 | 0 | 170132 |
| 5 | Ohev Yisrael | `chasidut/ohev-yisrael/index.html` | 175249 | 0 | 175249 |
| 6 | Ohr HaMeir | `chasidut/ohr-hameir/index.html` | 335801 | 0 | 335801 |
| 7 | Peri HaAretz | `chasidut/peri-haaretz/index.html` | 51073 | 0 | 51073 |
| 8 | Peri Tzadik | `chasidut/peri-tzadik/index.html` | 974990 | 0 | 974990 |
| 9 | Poked Akarim | `chasidut/poked-akarim/index.html` | 29453 | 0 | 29453 |
| 10 | Resisei Layla | `chasidut/resisei-layla/index.html` | 99051 | 0 | 99051 |
| 11 | Sefat Emet | `chasidut/sefat-emet/index.html` | 782019 | 0 | 782019 |
| 12 | Sefer HaMiddot | `chasidut/sefer-hamiddot/index.html` | 32086 | 0 | 32086 |
| 13 | Shivchei HaBesht | `chasidut/shivchei-habesht/index.html` | 49879 | 0 | 49879 |
| 14 | Sichat Malakhei HaSharet | `chasidut/sichat-malakhei-hasharet/index.html` | 35220 | 0 | 35220 |
| 15 | Sichat Shedim | `chasidut/sichat-shedim/index.html` | 4391 | 0 | 4391 |
| 16 | Sippurei Maasiyot | `chasidut/sippurei-maasiyot/index.html` | 70569 | 0 | 70569 |
| 17 | Sod Yesharim | `chasidut/sod-yesharim/index.html` | 511017 | 0 | 511017 |
| 18 | Takanat HaShavin | `chasidut/takanat-hashavin/index.html` | 102881 | 0 | 102881 |
| 19 | Tiferet Shlomo | `chasidut/tiferet-shlomo/index.html` | 419909 | 0 | 419909 |
| 20 | Toldot Yaakov Yosef | `chasidut/toldot-yaakov-yosef/index.html` | 259 | 0 | 259 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <20 Batch44 pages>` | 120000ms | passed: Route HUD page validation passed for 20 page(s). |
| `git diff --check -- <20 Batch44 pages>` | 60000ms | passed: no whitespace errors; CRLF replacement warnings only |
| `node <Batch44 source/config/asset guard>` | 60000ms | passed: 20 pages; 4538872 token rows; 0 configured hint rows; 4538872 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch44-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 20 pages.
- Source/config/asset guard passed and counted 4538872 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.
- Scoped diff check produced CRLF replacement warnings only, no whitespace errors.

## A14 Next Action

- Review Batch44 Chasidut page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can close remaining Chasidut page targets next.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch44 Chasidut or returns exact blocker; Agent 10 can continue to Chasidut closure after checkpoint or explicit continuation.
