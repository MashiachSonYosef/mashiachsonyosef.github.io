# Agent 10 Batch38 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH38_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch38 is page-only and excludes shared CSS/runtime changes.

## Batch38 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Tzafnat Pa'neach on Mishneh Torah, Diverse Species1 | `halakhah/tzafnat-paneach-on-mishneh-torah-diverse-species/index.html` | 74150 | 0 | 74150 | prehud_rows |
| 2 | Tzafnat Pa'neach on Mishneh Torah, Forbidden Foods1 | `halakhah/tzafnat-paneach-on-mishneh-torah-forbidden-foods/index.html` | 82497 | 0 | 82497 | prehud_rows |
| 3 | Tzafnat Pa'neach on Mishneh Torah, Forbidden Intercourse1 | `halakhah/tzafnat-paneach-on-mishneh-torah-forbidden-intercourse/index.html` | 42169 | 0 | 42169 | prehud_rows |
| 4 | Tzafnat Pa'neach on Mishneh Torah, Foreign Worship and Customs of the Nations1 | `halakhah/tzafnat-paneach-on-mishneh-torah-foreign-worship-and-customs-of-the-nations/index.html` | 94420 | 0 | 94420 | prehud_rows |
| 5 | Tzafnat Pa'neach on Mishneh Torah, Fringes1 | `halakhah/tzafnat-paneach-on-mishneh-torah-fringes/index.html` | 2260 | 0 | 2260 | prehud_rows |
| 6 | Tzafnat Pa'neach on Mishneh Torah, Gifts to the Poor1 | `halakhah/tzafnat-paneach-on-mishneh-torah-gifts-to-the-poor/index.html` | 138500 | 0 | 138500 | prehud_rows |
| 7 | Tzafnat Pa'neach on Mishneh Torah, Heave Offerings1 | `halakhah/tzafnat-paneach-on-mishneh-torah-heave-offerings/index.html` | 205986 | 0 | 205986 | prehud_rows |
| 8 | Tzafnat Pa'neach on Mishneh Torah, Leavened and Unleavened Bread1 | `halakhah/tzafnat-paneach-on-mishneh-torah-leavened-and-unleavened-bread/index.html` | 12181 | 0 | 12181 | prehud_rows |
| 9 | Tzafnat Pa'neach on Mishneh Torah, Levirate Marriage and Release1 | `halakhah/tzafnat-paneach-on-mishneh-torah-levirate-marriage-and-release/index.html` | 9047 | 0 | 9047 | prehud_rows |
| 10 | Tzafnat Pa'neach on Mishneh Torah, Marriage1 | `halakhah/tzafnat-paneach-on-mishneh-torah-marriage/index.html` | 31408 | 0 | 31408 | prehud_rows |
| 11 | Tzafnat Pa'neach on Mishneh Torah, Nazariteship1 | `halakhah/tzafnat-paneach-on-mishneh-torah-nazariteship/index.html` | 37115 | 0 | 37115 | prehud_rows |
| 12 | Tzafnat Pa'neach on Mishneh Torah, Prayer and the Priestly Blessing1 | `halakhah/tzafnat-paneach-on-mishneh-torah-prayer-and-the-priestly-blessing/index.html` | 3654 | 0 | 3654 | prehud_rows |
| 13 | Tzafnat Pa'neach on Mishneh Torah, Repentance1 | `halakhah/tzafnat-paneach-on-mishneh-torah-repentance/index.html` | 3638 | 0 | 3638 | prehud_rows |
| 14 | Tzafnat Pa'neach on Mishneh Torah, Rest on the Tenth of Tishrei1 | `halakhah/tzafnat-paneach-on-mishneh-torah-rest-on-the-tenth-of-tishrei/index.html` | 2246 | 0 | 2246 | prehud_rows |
| 15 | Tzafnat Pa'neach on Mishneh Torah, Ritual Slaughter1 | `halakhah/tzafnat-paneach-on-mishneh-torah-ritual-slaughter/index.html` | 24212 | 0 | 24212 | prehud_rows |
| 16 | Tzafnat Pa'neach on Mishneh Torah, Sabbath1 | `halakhah/tzafnat-paneach-on-mishneh-torah-sabbath/index.html` | 19300 | 0 | 19300 | prehud_rows |
| 17 | Tzafnat Pa'neach on Mishneh Torah, Sanctification of the New Month1 | `halakhah/tzafnat-paneach-on-mishneh-torah-sanctification-of-the-new-month/index.html` | 4131 | 0 | 4131 | prehud_rows |
| 18 | Tzafnat Pa'neach on Mishneh Torah, Scroll of Esther and Hanukkah1 | `halakhah/tzafnat-paneach-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 4014 | 0 | 4014 | prehud_rows |
| 19 | Tzafnat Pa'neach on Mishneh Torah, Sheqel Dues1 | `halakhah/tzafnat-paneach-on-mishneh-torah-sheqel-dues/index.html` | 4142 | 0 | 4142 | prehud_rows |
| 20 | Tzafnat Pa'neach on Mishneh Torah, Virgin Maiden1 | `halakhah/tzafnat-paneach-on-mishneh-torah-virgin-maiden/index.html` | 3308 | 0 | 3308 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 798378
- Configured hint rows: 0
- Expected quiet TBD rows: 798378
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch38 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch38 pages]`: passed; No whitespace errors.
- `Batch38 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch38 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch38 scoped commands.

## A14 Next Action

Review/stage Batch38 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch38 page-only packet, or returns an exact blocker.
