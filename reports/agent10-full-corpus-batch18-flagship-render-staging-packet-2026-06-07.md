# Agent 10 Batch18 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH18_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch18 is page-only and excludes shared CSS/runtime changes.

## Batch18 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Kovetz Al Yad HaChazakah on Mishneh Torah, Blessings | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-blessings/index.html` | 7394 | 0 | 7394 | prehud_rows |
| 2 | Kovetz Al Yad HaChazakah on Mishneh Torah, Circumcision | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-circumcision/index.html` | 2101 | 0 | 2101 | prehud_rows |
| 3 | Kovetz Al Yad HaChazakah on Mishneh Torah, Foundations of the Torah | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-foundations-of-the-torah/index.html` | 4799 | 0 | 4799 | prehud_rows |
| 4 | Kovetz Al Yad HaChazakah on Mishneh Torah, Fringes | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-fringes/index.html` | 3159 | 0 | 3159 | prehud_rows |
| 5 | Kovetz Al Yad HaChazakah on Mishneh Torah, Leavened and Unleavened Bread | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-leavened-and-unleavened-bread/index.html` | 7230 | 0 | 7230 | prehud_rows |
| 6 | Kovetz Al Yad HaChazakah on Mishneh Torah, Levirate Marriage and Release | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-levirate-marriage-and-release/index.html` | 7201 | 0 | 7201 | prehud_rows |
| 7 | Kovetz Al Yad HaChazakah on Mishneh Torah, Marriage | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-marriage/index.html` | 22786 | 0 | 22786 | prehud_rows |
| 8 | Kovetz Al Yad HaChazakah on Mishneh Torah, Reading the Shema | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-reading-the-shema/index.html` | 5211 | 0 | 5211 | prehud_rows |
| 9 | Kovetz Al Yad HaChazakah on Mishneh Torah, Repentance | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-repentance/index.html` | 432 | 0 | 432 | prehud_rows |
| 10 | Kovetz Al Yad HaChazakah on Mishneh Torah, Rest on a Holiday | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-rest-on-a-holiday/index.html` | 4546 | 0 | 4546 | prehud_rows |
| 11 | Kovetz Al Yad HaChazakah on Mishneh Torah, Sabbath | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-sabbath/index.html` | 26442 | 0 | 26442 | prehud_rows |
| 12 | Kovetz Al Yad HaChazakah on Mishneh Torah, Scroll of Esther and Hanukkah | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 1978 | 0 | 1978 | prehud_rows |
| 13 | Kovetz Al Yad HaChazakah on Mishneh Torah, Sheqel Dues | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-sheqel-dues/index.html` | 1453 | 0 | 1453 | prehud_rows |
| 14 | Kovetz Al Yad HaChazakah on Mishneh Torah, Shofar, Sukkah and Lulav | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-shofar-sukkah-and-lulav/index.html` | 3978 | 0 | 3978 | prehud_rows |
| 15 | Kovetz Al Yad HaChazakah on Mishneh Torah, Woman Suspected of Infidelity | `halakhah/kovetz-al-yad-hachazakah-on-mishneh-torah-woman-suspected-of-infidelity/index.html` | 2380 | 0 | 2380 | prehud_rows |
| 16 | Kuntres Zikah | `halakhah/kuntres-zikah/index.html` | 19116 | 0 | 19116 | prehud_rows |
| 17 | Lechem Mishneh on Mishneh Torah, Eruvin | `halakhah/lechem-mishneh-on-mishneh-torah-eruvin/index.html` | 2116 | 0 | 2116 | prehud_rows |
| 18 | Lechem Mishneh on Mishneh Torah, Fasts | `halakhah/lechem-mishneh-on-mishneh-torah-fasts/index.html` | 12698 | 0 | 12698 | prehud_rows |
| 19 | Lechem Mishneh on Mishneh Torah, Forbidden Foods | `halakhah/lechem-mishneh-on-mishneh-torah-forbidden-foods/index.html` | 54774 | 0 | 54774 | prehud_rows |
| 20 | Lechem Mishneh on Mishneh Torah, Human Dispositions | `halakhah/lechem-mishneh-on-mishneh-torah-human-dispositions/index.html` | 4434 | 0 | 4434 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 194228
- Configured hint rows: 0
- Expected quiet TBD rows: 194228
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch18 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch18 pages]`: passed with CRLF replacement warning only on one Kovetz Al Yad Hachazakah page.
- Batch18 lexical config/source marker/preHUD guard: passed for 20 pages using character-code U+FFFD guard.
- Batch18 packet JSON parse: passed.

## Process Timeout

None for the Batch18 scoped commands.

## A14 Next Action

Review/stage Batch18 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch18 page-only packet, or returns an exact blocker.
