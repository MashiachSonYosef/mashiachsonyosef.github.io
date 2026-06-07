# Agent 10 Batch36 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH36_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch36 is page-only and excludes shared CSS/runtime changes.

## Batch36 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Sha'ar HaMayim HaKatzar1 | `halakhah/shaar-hamayim-hakatzar/index.html` | 2297 | 0 | 2297 | prehud_rows |
| 2 | Sha'ar HaMelekh on Mishneh Torah, Circumcision1 | `halakhah/shaar-hamelekh-on-mishneh-torah-circumcision/index.html` | 1083 | 0 | 1083 | prehud_rows |
| 3 | Sha'ar HaMelekh on Mishneh Torah, Diverse Species1 | `halakhah/shaar-hamelekh-on-mishneh-torah-diverse-species/index.html` | 10288 | 0 | 10288 | prehud_rows |
| 4 | Sha'ar HaMelekh on Mishneh Torah, Divorce1 | `halakhah/shaar-hamelekh-on-mishneh-torah-divorce/index.html` | 95503 | 0 | 95503 | prehud_rows |
| 5 | Sha'ar HaMelekh on Mishneh Torah, Festival Offering1 | `halakhah/shaar-hamelekh-on-mishneh-torah-festival-offering/index.html` | 3824 | 0 | 3824 | prehud_rows |
| 6 | Sha'ar HaMelekh on Mishneh Torah, Plaintiff and Defendant1 | `halakhah/shaar-hamelekh-on-mishneh-torah-plaintiff-and-defendant/index.html` | 2072 | 0 | 2072 | prehud_rows |
| 7 | Sha'ar HaMelekh on Mishneh Torah, Sabbatical Year and the Jubilee1 | `halakhah/shaar-hamelekh-on-mishneh-torah-sabbatical-year-and-the-jubilee/index.html` | 5886 | 0 | 5886 | prehud_rows |
| 8 | Sha'ar HaMelekh on Mishneh Torah, Scroll of Esther and Hanukkah1 | `halakhah/shaar-hamelekh-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 2359 | 0 | 2359 | prehud_rows |
| 9 | Sha'ar HaMelekh on Mishneh Torah, Sheqel Dues1 | `halakhah/shaar-hamelekh-on-mishneh-torah-sheqel-dues/index.html` | 5171 | 0 | 5171 | prehud_rows |
| 10 | Sheiltot d'Rav Achai Gaon1 | `halakhah/sheiltot-drav-achai-gaon/index.html` | 106809 | 0 | 106809 | prehud_rows |
| 11 | Shev Shmateta1 | `halakhah/shev-shmateta/index.html` | 16459 | 0 | 16459 | prehud_rows |
| 12 | Shibbolei HaLeket1 | `halakhah/shibbolei-haleket/index.html` | 273526 | 0 | 273526 | prehud_rows |
| 13 | Shomer Yisrael1 | `halakhah/shomer-yisrael/index.html` | 4154 | 0 | 4154 | prehud_rows |
| 14 | Shorshei HaYam on Mishneh Torah, Creditor and Debtor1 | `halakhah/shorshei-hayam-on-mishneh-torah-creditor-and-debtor/index.html` | 104535 | 0 | 104535 | prehud_rows |
| 15 | Shorshei HaYam on Mishneh Torah, Plaintiff and Defendant1 | `halakhah/shorshei-hayam-on-mishneh-torah-plaintiff-and-defendant/index.html` | 37263 | 0 | 37263 | prehud_rows |
| 16 | Shorshei HaYam on Mishneh Torah, Red Heifer1 | `halakhah/shorshei-hayam-on-mishneh-torah-red-heifer/index.html` | 1242 | 0 | 1242 | prehud_rows |
| 17 | Shorshei HaYam on Mishneh Torah, Repentance1 | `halakhah/shorshei-hayam-on-mishneh-torah-repentance/index.html` | 7483 | 0 | 7483 | prehud_rows |
| 18 | Shorshei HaYam on Mishneh Torah, Sabbath1 | `halakhah/shorshei-hayam-on-mishneh-torah-sabbath/index.html` | 9574 | 0 | 9574 | prehud_rows |
| 19 | Shorshei HaYam on Mishneh Torah, Scroll of Esther and Hanukkah1 | `halakhah/shorshei-hayam-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 11724 | 0 | 11724 | prehud_rows |
| 20 | Shorshei HaYam on Mishneh Torah, Service on the Day of Atonement1 | `halakhah/shorshei-hayam-on-mishneh-torah-service-on-the-day-of-atonement/index.html` | 21352 | 0 | 21352 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 722604
- Configured hint rows: 0
- Expected quiet TBD rows: 722604
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch36 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch36 pages]`: passed_with_crlf_warnings_only; CRLF replacement warnings only on 17 pages; no whitespace errors.
- `Batch36 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch36 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch36 scoped commands.

## A14 Next Action

Review/stage Batch36 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch36 page-only packet, or returns an exact blocker.
