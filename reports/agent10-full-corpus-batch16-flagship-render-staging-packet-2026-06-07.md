# Agent 10 Batch16 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH16_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch16 is page-only and excludes shared CSS/runtime changes.

## Batch16 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Kiryat Sefer on Mishneh Torah, Prayer and the Priestly Blessing | `halakhah/kiryat-sefer-on-mishneh-torah-prayer-and-the-priestly-blessing/index.html` | 2471 | 0 | 2471 | prehud_rows |
| 2 | Kiryat Sefer on Mishneh Torah, Reading the Shema | `halakhah/kiryat-sefer-on-mishneh-torah-reading-the-shema/index.html` | 2306 | 0 | 2306 | prehud_rows |
| 3 | Kiryat Sefer on Mishneh Torah, Rebels | `halakhah/kiryat-sefer-on-mishneh-torah-rebels/index.html` | 3379 | 0 | 3379 | prehud_rows |
| 4 | Kiryat Sefer on Mishneh Torah, Red Heifer | `halakhah/kiryat-sefer-on-mishneh-torah-red-heifer/index.html` | 11439 | 0 | 11439 | prehud_rows |
| 5 | Kiryat Sefer on Mishneh Torah, Repentance | `halakhah/kiryat-sefer-on-mishneh-torah-repentance/index.html` | 2032 | 0 | 2032 | prehud_rows |
| 6 | Kiryat Sefer on Mishneh Torah, Rest on a Holiday | `halakhah/kiryat-sefer-on-mishneh-torah-rest-on-a-holiday/index.html` | 1586 | 0 | 1586 | prehud_rows |
| 7 | Kiryat Sefer on Mishneh Torah, Rest on the Tenth of Tishrei | `halakhah/kiryat-sefer-on-mishneh-torah-rest-on-the-tenth-of-tishrei/index.html` | 1875 | 0 | 1875 | prehud_rows |
| 8 | Kiryat Sefer on Mishneh Torah, Ritual Slaughter | `halakhah/kiryat-sefer-on-mishneh-torah-ritual-slaughter/index.html` | 4542 | 0 | 4542 | prehud_rows |
| 9 | Kiryat Sefer on Mishneh Torah, Robbery and Lost Property | `halakhah/kiryat-sefer-on-mishneh-torah-robbery-and-lost-property/index.html` | 4893 | 0 | 4893 | prehud_rows |
| 10 | Kiryat Sefer on Mishneh Torah, Sabbath | `halakhah/kiryat-sefer-on-mishneh-torah-sabbath/index.html` | 14974 | 0 | 14974 | prehud_rows |
| 11 | Kiryat Sefer on Mishneh Torah, Sabbatical Year and the Jubilee | `halakhah/kiryat-sefer-on-mishneh-torah-sabbatical-year-and-the-jubilee/index.html` | 6950 | 0 | 6950 | prehud_rows |
| 12 | Kiryat Sefer on Mishneh Torah, Sacrifices Rendered Unfit | `halakhah/kiryat-sefer-on-mishneh-torah-sacrifices-rendered-unfit/index.html` | 27947 | 0 | 27947 | prehud_rows |
| 13 | Kiryat Sefer on Mishneh Torah, Sacrificial Procedure | `halakhah/kiryat-sefer-on-mishneh-torah-sacrificial-procedure/index.html` | 26510 | 0 | 26510 | prehud_rows |
| 14 | Kiryat Sefer on Mishneh Torah, Sales | `halakhah/kiryat-sefer-on-mishneh-torah-sales/index.html` | 3543 | 0 | 3543 | prehud_rows |
| 15 | Kiryat Sefer on Mishneh Torah, Sanctification of the New Month | `halakhah/kiryat-sefer-on-mishneh-torah-sanctification-of-the-new-month/index.html` | 2457 | 0 | 2457 | prehud_rows |
| 16 | Kiryat Sefer on Mishneh Torah, Scroll of Esther and Hanukkah | `halakhah/kiryat-sefer-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 222 | 0 | 222 | prehud_rows |
| 17 | Kiryat Sefer on Mishneh Torah, Second Tithes and Fourth Year's Fruit | `halakhah/kiryat-sefer-on-mishneh-torah-second-tithes-and-fourth-years-fruit/index.html` | 4767 | 0 | 4767 | prehud_rows |
| 18 | Kiryat Sefer on Mishneh Torah, Service on the Day of Atonement | `halakhah/kiryat-sefer-on-mishneh-torah-service-on-the-day-of-atonement/index.html` | 8708 | 0 | 8708 | prehud_rows |
| 19 | Kiryat Sefer on Mishneh Torah, Sheqel Dues | `halakhah/kiryat-sefer-on-mishneh-torah-sheqel-dues/index.html` | 1693 | 0 | 1693 | prehud_rows |
| 20 | Kiryat Sefer on Mishneh Torah, Shofar, Sukkah and Lulav | `halakhah/kiryat-sefer-on-mishneh-torah-shofar-sukkah-and-lulav/index.html` | 6295 | 0 | 6295 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 138589
- Configured hint rows: 0
- Expected quiet TBD rows: 138589
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch16 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch16 pages]`: passed with CRLF replacement warnings only on three Kiryat Sefer pages.
- Batch16 lexical config/source marker/preHUD guard: passed for 20 pages.
- Batch16 packet JSON parse: passed.

## Process Timeout

None for the Batch16 scoped commands.

## A14 Next Action

Review/stage Batch16 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch16 page-only packet, or returns an exact blocker.
