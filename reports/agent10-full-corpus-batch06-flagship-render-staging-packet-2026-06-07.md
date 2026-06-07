# Agent 10 Batch06 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH06_20_READY_DIRECT_RENDER_CONTRACT`.

Purpose: continue full-corpus A10 flagship Route HUD/book-page render churn in 20-work batches.

## Batch06 Pages

| # | work | page | token rows | hints | expected TBD |
|---:|---|---|---:|---:|---:|
| 1 | Binat Adam | `halakhah/binat-adam/index.html` | 118908 | 0 | 118908 |
| 2 | Biur Halacha | `halakhah/biur-halacha/index.html` | 415483 | 0 | 415483 |
| 3 | Brit Moshe | `halakhah/brit-moshe/index.html` | 461163 | 0 | 461163 |
| 4 | Brit Olam on Sefer Chasidim | `halakhah/brit-olam-on-sefer-chasidim/index.html` | 28603 | 0 | 28603 |
| 5 | Chafetz Chaim | `halakhah/chafetz-chaim/index.html` | 31810 | 0 | 31810 |
| 6 | Chatam Sofer on Shulchan Arukh, Orach Chayim | `halakhah/chatam-sofer-on-shulchan-arukh-orach-chayim/index.html` | 39391 | 0 | 39391 |
| 7 | Chayyei Adam | `halakhah/chayyei-adam/index.html` | 258785 | 0 | 258785 |
| 8 | Chelkat Mechokek | `halakhah/chelkat-mechokek/index.html` | 145340 | 0 | 145340 |
| 9 | Chidushim of Machaneh Ephraim on Mishneh Torah, Mourning | `halakhah/chidushim-of-machaneh-ephraim-on-mishneh-torah-mourning/index.html` | 29 | 0 | 29 |
| 10 | Chokhmat Adam | `halakhah/chokhmat-adam/index.html` | 281610 | 0 | 281610 |
| 11 | Chokhmat Shlomo on Shulchan Arukh, Even HaEzer | `halakhah/chokhmat-shlomo-on-shulchan-arukh-even-haezer/index.html` | 75576 | 0 | 75576 |
| 12 | Chokhmat Shlomo on Shulchan Arukh, Orach Chayim | `halakhah/chokhmat-shlomo-on-shulchan-arukh-orach-chayim/index.html` | 211295 | 0 | 211295 |
| 13 | Commentary of Mahari Kurkus and Radbaz on Mishneh Torah, Admission into the Sanctuary | `halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-admission-into-the-sanctuary/index.html` | 31795 | 0 | 31795 |
| 14 | Commentary of Mahari Kurkus and Radbaz on Mishneh Torah, The Chosen Temple | `halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-the-chosen-temple/index.html` | 20122 | 0 | 20122 |
| 15 | Commentary of Mahari Kurkus and Radbaz on Mishneh Torah, Vessels of the Sanctuary and Those who Serve Therein | `halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-vessels-of-the-sanctuary-and-those-who-serve-therein/index.html` | 40170 | 0 | 40170 |
| 16 | Dagul MeRevava on Shulchan Arukh, Orach Chayim | `halakhah/dagul-merevava-on-shulchan-arukh-orach-chayim/index.html` | 11653 | 0 | 11653 |
| 17 | Darkhei Moshe | `halakhah/darkhei-moshe/index.html` | 246121 | 0 | 246121 |
| 18 | Dina DeGarmei | `halakhah/dina-degarmei/index.html` | 8259 | 0 | 8259 |
| 19 | Divrei Shaul Edut BeYosef on Mishneh Torah, Testimony | `halakhah/divrei-shaul-edut-beyosef-on-mishneh-torah-testimony/index.html` | 59466 | 0 | 59466 |
| 20 | Divrei Yirmiyahu on Mishneh Torah, Blessings | `halakhah/divrei-yirmiyahu-on-mishneh-torah-blessings/index.html` | 39702 | 0 | 39702 |

## Changed Files

- `halakhah/binat-adam/index.html`
- `halakhah/biur-halacha/index.html`
- `halakhah/brit-moshe/index.html`
- `halakhah/brit-olam-on-sefer-chasidim/index.html`
- `halakhah/chafetz-chaim/index.html`
- `halakhah/chatam-sofer-on-shulchan-arukh-orach-chayim/index.html`
- `halakhah/chayyei-adam/index.html`
- `halakhah/chelkat-mechokek/index.html`
- `halakhah/chidushim-of-machaneh-ephraim-on-mishneh-torah-mourning/index.html`
- `halakhah/chokhmat-adam/index.html`
- `halakhah/chokhmat-shlomo-on-shulchan-arukh-even-haezer/index.html`
- `halakhah/chokhmat-shlomo-on-shulchan-arukh-orach-chayim/index.html`
- `halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-admission-into-the-sanctuary/index.html`
- `halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-the-chosen-temple/index.html`
- `halakhah/commentary-of-mahari-kurkus-and-radbaz-on-mishneh-torah-vessels-of-the-sanctuary-and-those-who-serve-therein/index.html`
- `halakhah/dagul-merevava-on-shulchan-arukh-orach-chayim/index.html`
- `halakhah/darkhei-moshe/index.html`
- `halakhah/dina-degarmei/index.html`
- `halakhah/divrei-shaul-edut-beyosef-on-mishneh-torah-testimony/index.html`
- `halakhah/divrei-yirmiyahu-on-mishneh-torah-blessings/index.html`

## Validators

- node scripts/validate_route_hud_page.mjs --page [20 Batch06 pages] => passed
- git diff --check -- [20 Batch06 pages] => passed with CRLF warnings only on six files

## Browser Proof

- Local proof URL: `http://127.0.0.1:8801/halakhah/chidushim-of-machaneh-ephraim-on-mishneh-torah-mourning/?batch06-proof=1`.
- Rows/glosses: `29` / `29`.
- Quiet TBD glosses: `29`; populated preHUD glosses: `0`; unsafe preHUD glosses: `0`.
- First token `???` opened the canonical Route HUD; preHUD stayed fail-closed TBD.

## Explicit Blockers

- None for Batch06 staging.

## A14 Next Action

Review/stage Batch06 as 20 render-ready stage candidates under normal corpus links only. Do not add Featured entries from this packet.

## Boundary

- render/preHUD staging evidence only
- no QA/source/license/legal/Definition/product/answer/accepted-text acceptance
- no publication/release/public-runtime acceptance
