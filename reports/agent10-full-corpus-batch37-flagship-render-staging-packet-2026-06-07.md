# Agent 10 Batch37 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH37_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch37 is page-only and excludes shared CSS/runtime changes.

## Batch37 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Shorshei HaYam on Mishneh Torah, Sheqel Dues1 | `halakhah/shorshei-hayam-on-mishneh-torah-sheqel-dues/index.html` | 765 | 0 | 765 | prehud_rows |
| 2 | Shulchan Arukh, Choshen Mishpat1 | `halakhah/shulchan-arukh-choshen-mishpat/index.html` | 236602 | 0 | 236602 | prehud_rows |
| 3 | Shulchan Arukh, Even HaEzer1 | `halakhah/shulchan-arukh-even-haezer/index.html` | 106474 | 0 | 106474 | prehud_rows |
| 4 | Shulchan Arukh, Orach Chayim1 | `halakhah/shulchan-arukh-orach-chayim/index.html` | 182411 | 0 | 182411 | prehud_rows |
| 5 | Shulchan Arukh, Yoreh De'ah1 | `halakhah/shulchan-arukh-yoreh-deah/index.html` | 198608 | 0 | 198608 | prehud_rows |
| 6 | Shulchan Shel Arba1 | `halakhah/shulchan-shel-arba/index.html` | 19678 | 0 | 19678 | prehud_rows |
| 7 | Siddur Rashi1 | `halakhah/siddur-rashi/index.html` | 82767 | 0 | 82767 | prehud_rows |
| 8 | Siftei Kohen on Shulchan Arukh, Yoreh De'ah1 | `halakhah/siftei-kohen-on-shulchan-arukh-yoreh-deah/index.html` | 425153 | 0 | 425153 | prehud_rows |
| 9 | Simlah Chadashah1 | `halakhah/simlah-chadashah/index.html` | 80458 | 0 | 80458 | prehud_rows |
| 10 | Tashbetz Katan1 | `halakhah/tashbetz-katan/index.html` | 40875 | 0 | 40875 | prehud_rows |
| 11 | The Sabbath Epistle1 | `halakhah/the-sabbath-epistle/index.html` | 19199 | 0 | 19199 | prehud_rows |
| 12 | Toafot Re'em1 | `halakhah/toafot-reem/index.html` | 371524 | 0 | 371524 | prehud_rows |
| 13 | Torat HaBayit HaAroch1 | `halakhah/torat-habayit-haaroch/index.html` | 248072 | 0 | 248072 | prehud_rows |
| 14 | Torat HaBayit HaKatzar1 | `halakhah/torat-habayit-hakatzar/index.html` | 62917 | 0 | 62917 | prehud_rows |
| 15 | Turei Zahav on Shulchan Arukh, Choshen Mishpat1 | `halakhah/turei-zahav-on-shulchan-arukh-choshen-mishpat/index.html` | 204552 | 0 | 204552 | prehud_rows |
| 16 | Turei Zahav on Shulchan Arukh, Even HaEzer1 | `halakhah/turei-zahav-on-shulchan-arukh-even-haezer/index.html` | 243223 | 0 | 243223 | prehud_rows |
| 17 | Turei Zahav on Shulchan Arukh, Orach Chayim1 | `halakhah/turei-zahav-on-shulchan-arukh-orach-chayim/index.html` | 396174 | 0 | 396174 | prehud_rows |
| 18 | Turei Zahav on Shulchan Arukh, Yoreh De'ah1 | `halakhah/turei-zahav-on-shulchan-arukh-yoreh-deah/index.html` | 399728 | 0 | 399728 | prehud_rows |
| 19 | Tzafnat Pa'neach on Mishneh Torah, Appraisals and Devoted Property1 | `halakhah/tzafnat-paneach-on-mishneh-torah-appraisals-and-devoted-property/index.html` | 65655 | 0 | 65655 | prehud_rows |
| 20 | Tzafnat Pa'neach on Mishneh Torah, Circumcision1 | `halakhah/tzafnat-paneach-on-mishneh-torah-circumcision/index.html` | 4548 | 0 | 4548 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 3389383
- Configured hint rows: 0
- Expected quiet TBD rows: 3389383
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch37 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch37 pages]`: passed_with_crlf_warnings_only; CRLF replacement warning only on Shorshei HaYam on Mishneh Torah, Sheqel Dues; no whitespace errors.
- `Batch37 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch37 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch37 scoped commands.

## A14 Next Action

Review/stage Batch37 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch37 page-only packet, or returns an exact blocker.
