# Agent 10 Batch35 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH35_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch35 is page-only and excludes shared CSS/runtime changes.

## Batch35 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Seder Mishnah on Mishneh Torah, Torah Study1 | `halakhah/seder-mishnah-on-mishneh-torah-torah-study/index.html` | 40858 | 0 | 40858 | prehud_rows |
| 2 | Seder Troyes1 | `halakhah/seder-troyes/index.html` | 11304 | 0 | 11304 | prehud_rows |
| 3 | Sefer Chasidim1 | `halakhah/sefer-chasidim/index.html` | 113687 | 0 | 113687 | prehud_rows |
| 4 | Sefer HaItim1 | `halakhah/sefer-haitim/index.html` | 97534 | 0 | 97534 | prehud_rows |
| 5 | Sefer HaMachkim1 | `halakhah/sefer-hamachkim/index.html` | 14105 | 0 | 14105 | prehud_rows |
| 6 | Sefer HaMakhria1 | `halakhah/sefer-hamakhria/index.html` | 87345 | 0 | 87345 | prehud_rows |
| 7 | Sefer HaMenucha on Mishneh Torah, Leavened and Unleavened Bread1 | `halakhah/sefer-hamenucha-on-mishneh-torah-leavened-and-unleavened-bread/index.html` | 30392 | 0 | 30392 | prehud_rows |
| 8 | Sefer HaMenucha on Mishneh Torah, Shofar, Sukkah and Lulav1 | `halakhah/sefer-hamenucha-on-mishneh-torah-shofar-sukkah-and-lulav/index.html` | 29413 | 0 | 29413 | prehud_rows |
| 9 | Sefer HaMitzvot1 | `halakhah/sefer-hamitzvot/index.html` | 66719 | 0 | 66719 | prehud_rows |
| 10 | Sefer Hamitzvot of Rasag1 | `halakhah/sefer-hamitzvot-of-rasag/index.html` | 2056 | 0 | 2056 | prehud_rows |
| 11 | Sefer HaOrah1 | `halakhah/sefer-haorah/index.html` | 61971 | 0 | 61971 | prehud_rows |
| 12 | Sefer HaParnas1 | `halakhah/sefer-haparnas/index.html` | 27033 | 0 | 27033 | prehud_rows |
| 13 | Sefer HaTerumah1 | `halakhah/sefer-haterumah/index.html` | 210168 | 0 | 210168 | prehud_rows |
| 14 | Sefer Mitzvot Gadol1 | `halakhah/sefer-mitzvot-gadol/index.html` | 33683 | 0 | 33683 | prehud_rows |
| 15 | Sefer Mitzvot Katan1 | `halakhah/sefer-mitzvot-katan/index.html` | 92217 | 0 | 92217 | prehud_rows |
| 16 | Sefer Yereim1 | `halakhah/sefer-yereim/index.html` | 184043 | 0 | 184043 | prehud_rows |
| 17 | Sela HaMachlakot on Ba'alei HaNefesh1 | `halakhah/sela-hamachlakot-on-baalei-hanefesh/index.html` | 10915 | 0 | 10915 | prehud_rows |
| 18 | Sha'arei Ephraim1 | `halakhah/shaarei-ephraim/index.html` | 32435 | 0 | 32435 | prehud_rows |
| 19 | Sha'arei Teshuvah on Shulchan Arukh, Orach Chayim1 | `halakhah/shaarei-teshuvah-on-shulchan-arukh-orach-chayim/index.html` | 140864 | 0 | 140864 | prehud_rows |
| 20 | Sha'ar HaMayim HaAroch1 | `halakhah/shaar-hamayim-haaroch/index.html` | 10271 | 0 | 10271 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 1297013
- Configured hint rows: 0
- Expected quiet TBD rows: 1297013
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch35 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch35 pages]`: passed_with_crlf_warnings_only; CRLF replacement warnings only on three pages; no whitespace errors.
- `Batch35 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch35 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch35 scoped commands.

## A14 Next Action

Review/stage Batch35 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch35 page-only packet, or returns an exact blocker.
