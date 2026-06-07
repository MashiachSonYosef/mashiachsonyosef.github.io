# Agent 10 Batch34 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH34_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch34 is page-only and excludes shared CSS/runtime changes.

## Batch34 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Perush Kadmon on Sefer Chasidim1 | `halakhah/perush-kadmon-on-sefer-chasidim/index.html` | 117762 | 0 | 117762 | prehud_rows |
| 2 | Piskei Challah1 | `halakhah/piskei-challah/index.html` | 13157 | 0 | 13157 | prehud_rows |
| 3 | Pitchei Teshuva on Shulchan Arukh, Choshen Mishpat1 | `halakhah/pitchei-teshuva-on-shulchan-arukh-choshen-mishpat/index.html` | 342177 | 0 | 342177 | prehud_rows |
| 4 | Pitchei Teshuva on Shulchan Arukh, Even HaEzer1 | `halakhah/pitchei-teshuva-on-shulchan-arukh-even-haezer/index.html` | 405726 | 0 | 405726 | prehud_rows |
| 5 | Pitchei Teshuva on Shulchan Arukh, Yoreh De'ah1 | `halakhah/pitchei-teshuva-on-shulchan-arukh-yoreh-deah/index.html` | 242441 | 0 | 242441 | prehud_rows |
| 6 | Prisha1 | `halakhah/prisha/index.html` | 601508 | 0 | 601508 | prehud_rows |
| 7 | Publisher's Haggahot on Sefer HaParnas1 | `halakhah/publishers-haggahot-on-sefer-haparnas/index.html` | 648 | 0 | 648 | prehud_rows |
| 8 | Rabbi Akiva Eiger on Shulchan Arukh, Choshen Mishpat1 | `halakhah/rabbi-akiva-eiger-on-shulchan-arukh-choshen-mishpat/index.html` | 63291 | 0 | 63291 | prehud_rows |
| 9 | Rabbi Akiva Eiger on Shulchan Arukh, Even HaEzer1 | `halakhah/rabbi-akiva-eiger-on-shulchan-arukh-even-haezer/index.html` | 16205 | 0 | 16205 | prehud_rows |
| 10 | Rabbi Akiva Eiger on Shulchan Arukh, Orach Chayim1 | `halakhah/rabbi-akiva-eiger-on-shulchan-arukh-orach-chayim/index.html` | 68727 | 0 | 68727 | prehud_rows |
| 11 | Rabbi Akiva Eiger on Shulchan Arukh, Yoreh De'ah1 | `halakhah/rabbi-akiva-eiger-on-shulchan-arukh-yoreh-deah/index.html` | 86923 | 0 | 86923 | prehud_rows |
| 12 | Sansan LeYair1 | `halakhah/sansan-leyair/index.html` | 3277 | 0 | 3277 | prehud_rows |
| 13 | Seder HaYom1 | `halakhah/seder-hayom/index.html` | 94554 | 0 | 94554 | prehud_rows |
| 14 | Seder Mishnah on Mishneh Torah, Foreign Worship and Customs of the Nations1 | `halakhah/seder-mishnah-on-mishneh-torah-foreign-worship-and-customs-of-the-nations/index.html` | 62082 | 0 | 62082 | prehud_rows |
| 15 | Seder Mishnah on Mishneh Torah, Foundations of the Torah1 | `halakhah/seder-mishnah-on-mishneh-torah-foundations-of-the-torah/index.html` | 71477 | 0 | 71477 | prehud_rows |
| 16 | Seder Mishnah on Mishneh Torah, Human Dispositions1 | `halakhah/seder-mishnah-on-mishneh-torah-human-dispositions/index.html` | 54296 | 0 | 54296 | prehud_rows |
| 17 | Seder Mishnah on Mishneh Torah, Leavened and Unleavened Bread1 | `halakhah/seder-mishnah-on-mishneh-torah-leavened-and-unleavened-bread/index.html` | 66757 | 0 | 66757 | prehud_rows |
| 18 | Seder Mishnah on Mishneh Torah, Repentance1 | `halakhah/seder-mishnah-on-mishneh-torah-repentance/index.html` | 24459 | 0 | 24459 | prehud_rows |
| 19 | Seder Mishnah on Mishneh Torah, Rest on the Tenth of Tishrei1 | `halakhah/seder-mishnah-on-mishneh-torah-rest-on-the-tenth-of-tishrei/index.html` | 84151 | 0 | 84151 | prehud_rows |
| 20 | Seder Mishnah on Mishneh Torah, Sabbath1 | `halakhah/seder-mishnah-on-mishneh-torah-sabbath/index.html` | 146186 | 0 | 146186 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 2565804
- Configured hint rows: 0
- Expected quiet TBD rows: 2565804
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch34 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch34 pages]`: passed_with_crlf_warnings_only; CRLF replacement warnings only on six Seder Mishnah pages; no whitespace errors.
- `Batch34 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch34 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch34 scoped commands.

## A14 Next Action

Review/stage Batch34 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch34 page-only packet, or returns an exact blocker.
