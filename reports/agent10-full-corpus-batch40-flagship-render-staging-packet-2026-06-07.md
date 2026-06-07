# Agent 10 Full-Corpus Batch40 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH40_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: page-only continuation of the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 20 | 273083 | 0 | 273083 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Yad Eitan on Mishneh Torah, Slaves | `halakhah/yad-eitan-on-mishneh-torah-slaves/index.html` | 440 | 0 | 440 |
| 2 | Yad Eitan on Mishneh Torah, Substitution | `halakhah/yad-eitan-on-mishneh-torah-substitution/index.html` | 588 | 0 | 588 |
| 3 | Yad Eitan on Mishneh Torah, The Chosen Temple | `halakhah/yad-eitan-on-mishneh-torah-the-chosen-temple/index.html` | 970 | 0 | 970 |
| 4 | Yad Ephraim on Shulchan Arukh, Orach Chayim | `halakhah/yad-ephraim-on-shulchan-arukh-orach-chayim/index.html` | 123034 | 0 | 123034 |
| 5 | Yad Ephraim on Shulchan Arukh, Yoreh De'ah | `halakhah/yad-ephraim-on-shulchan-arukh-yoreh-deah/index.html` | 68288 | 0 | 68288 |
| 6 | Yekar Tiferet on Mishneh Torah, Slaves | `halakhah/yekar-tiferet-on-mishneh-torah-slaves/index.html` | 12396 | 0 | 12396 |
| 7 | Yekhahen Pe'er on Mishneh Torah, Daily Offerings and Additional Offerings | `halakhah/yekhahen-peer-on-mishneh-torah-daily-offerings-and-additional-offerings/index.html` | 1257 | 0 | 1257 |
| 8 | Yekhahen Pe'er on Mishneh Torah, Sacrificial Procedure | `halakhah/yekhahen-peer-on-mishneh-torah-sacrificial-procedure/index.html` | 3502 | 0 | 3502 |
| 9 | Yekhahen Pe'er on Mishneh Torah, Service on the Day of Atonement | `halakhah/yekhahen-peer-on-mishneh-torah-service-on-the-day-of-atonement/index.html` | 612 | 0 | 612 |
| 10 | Yekhahen Pe'er on Mishneh Torah, Things Forbidden on the Altar | `halakhah/yekhahen-peer-on-mishneh-torah-things-forbidden-on-the-altar/index.html` | 3087 | 0 | 3087 |
| 11 | Yitzchak Yeranen on Mishneh Torah, Circumcision | `halakhah/yitzchak-yeranen-on-mishneh-torah-circumcision/index.html` | 9468 | 0 | 9468 |
| 12 | Yitzchak Yeranen on Mishneh Torah, Creditor and Debtor | `halakhah/yitzchak-yeranen-on-mishneh-torah-creditor-and-debtor/index.html` | 1744 | 0 | 1744 |
| 13 | Yitzchak Yeranen on Mishneh Torah, Fasts | `halakhah/yitzchak-yeranen-on-mishneh-torah-fasts/index.html` | 1424 | 0 | 1424 |
| 14 | Yitzchak Yeranen on Mishneh Torah, Festival Offering | `halakhah/yitzchak-yeranen-on-mishneh-torah-festival-offering/index.html` | 3790 | 0 | 3790 |
| 15 | Yitzchak Yeranen on Mishneh Torah, First Fruits and other Gifts to Priests Outside the Sanctuary | `halakhah/yitzchak-yeranen-on-mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary/index.html` | 7789 | 0 | 7789 |
| 16 | Yitzchak Yeranen on Mishneh Torah, Forbidden Foods | `halakhah/yitzchak-yeranen-on-mishneh-torah-forbidden-foods/index.html` | 9007 | 0 | 9007 |
| 17 | Yitzchak Yeranen on Mishneh Torah, Foundations of the Torah | `halakhah/yitzchak-yeranen-on-mishneh-torah-foundations-of-the-torah/index.html` | 3761 | 0 | 3761 |
| 18 | Yitzchak Yeranen on Mishneh Torah, Fringes | `halakhah/yitzchak-yeranen-on-mishneh-torah-fringes/index.html` | 7239 | 0 | 7239 |
| 19 | Yitzchak Yeranen on Mishneh Torah, Heave Offerings | `halakhah/yitzchak-yeranen-on-mishneh-torah-heave-offerings/index.html` | 9206 | 0 | 9206 |
| 20 | Yitzchak Yeranen on Mishneh Torah, Paschal Offering | `halakhah/yitzchak-yeranen-on-mishneh-torah-paschal-offering/index.html` | 5481 | 0 | 5481 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <20 Batch40 pages>` | 120000ms | passed: Route HUD page validation passed for 20 page(s). |
| `git diff --check -- <20 Batch40 pages>` | 60000ms | passed: no whitespace errors; CRLF replacement warnings only |
| `node <Batch40 source/config/asset guard>` | 60000ms | passed: 20 pages; 273083 token rows; 0 configured hint rows; 273083 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch40-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 20 pages.
- Source/config/asset guard passed and counted 273083 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.
- Scoped diff check produced CRLF replacement warnings only, no whitespace errors.

## A14 Next Action

- Review Batch40 packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Keep root normal corpus links/deploy carry rules in A14 lane; do not add Featured entries.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch40 or returns exact blocker; Agent 10 continues with next batch only after checkpoint or explicit continuation.
