# Agent 10 Batch32 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH32_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch32 is page-only and excludes shared CSS/runtime changes.

## Batch32 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Mishneh Torah, Virgin Maiden1 | `halakhah/mishneh-torah-virgin-maiden/index.html` | 2062 | 0 | 2062 | prehud_rows |
| 2 | Mishneh Torah, Vows1 | `halakhah/mishneh-torah-vows/index.html` | 10988 | 0 | 10988 | prehud_rows |
| 3 | Mishneh Torah, Woman Suspected of Infidelity1 | `halakhah/mishneh-torah-woman-suspected-of-infidelity/index.html` | 3582 | 0 | 3582 | prehud_rows |
| 4 | Moreh BeEtzba1 | `halakhah/moreh-beetzba/index.html` | 13178 | 0 | 13178 | prehud_rows |
| 5 | Nachal Eitan on Mishneh Torah, Circumcision1 | `halakhah/nachal-eitan-on-mishneh-torah-circumcision/index.html` | 3432 | 0 | 3432 | prehud_rows |
| 6 | Nachal Eitan on Mishneh Torah, Fasts1 | `halakhah/nachal-eitan-on-mishneh-torah-fasts/index.html` | 483 | 0 | 483 | prehud_rows |
| 7 | Nachal Eitan on Mishneh Torah, Forbidden Foods1 | `halakhah/nachal-eitan-on-mishneh-torah-forbidden-foods/index.html` | 5553 | 0 | 5553 | prehud_rows |
| 8 | Nachal Eitan on Mishneh Torah, Forbidden Intercourse1 | `halakhah/nachal-eitan-on-mishneh-torah-forbidden-intercourse/index.html` | 8331 | 0 | 8331 | prehud_rows |
| 9 | Nachal Eitan on Mishneh Torah, Fringes1 | `halakhah/nachal-eitan-on-mishneh-torah-fringes/index.html` | 1798 | 0 | 1798 | prehud_rows |
| 10 | Nachal Eitan on Mishneh Torah, Leavened and Unleavened Bread1 | `halakhah/nachal-eitan-on-mishneh-torah-leavened-and-unleavened-bread/index.html` | 8151 | 0 | 8151 | prehud_rows |
| 11 | Nachal Eitan on Mishneh Torah, Prayer and the Priestly Blessing1 | `halakhah/nachal-eitan-on-mishneh-torah-prayer-and-the-priestly-blessing/index.html` | 2323 | 0 | 2323 | prehud_rows |
| 12 | Nachal Eitan on Mishneh Torah, Reading the Shema1 | `halakhah/nachal-eitan-on-mishneh-torah-reading-the-shema/index.html` | 3105 | 0 | 3105 | prehud_rows |
| 13 | Nachal Eitan on Mishneh Torah, Repentance1 | `halakhah/nachal-eitan-on-mishneh-torah-repentance/index.html` | 1639 | 0 | 1639 | prehud_rows |
| 14 | Nachal Eitan on Mishneh Torah, Scroll of Esther and Hanukkah1 | `halakhah/nachal-eitan-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 905 | 0 | 905 | prehud_rows |
| 15 | Nachal Eitan on Mishneh Torah, Virgin Maiden1 | `halakhah/nachal-eitan-on-mishneh-torah-virgin-maiden/index.html` | 3732 | 0 | 3732 | prehud_rows |
| 16 | Nekudot HaKesef on Shulchan Arukh, Yoreh De'ah1 | `halakhah/nekudot-hakesef-on-shulchan-arukh-yoreh-deah/index.html` | 64814 | 0 | 64814 | prehud_rows |
| 17 | Netiv Chayim on Shulchan Arukh, Orach Chayim1 | `halakhah/netiv-chayim-on-shulchan-arukh-orach-chayim/index.html` | 224 | 0 | 224 | prehud_rows |
| 18 | Netiv Chesed on Ahavat Chesed1 | `halakhah/netiv-chesed-on-ahavat-chesed/index.html` | 14210 | 0 | 14210 | prehud_rows |
| 19 | Netivot HaMishpat, Beurim on Shulchan Arukh, Choshen Mishpat1 | `halakhah/netivot-hamishpat-beurim-on-shulchan-arukh-choshen-mishpat/index.html` | 509660 | 0 | 509660 | prehud_rows |
| 20 | Netivot HaMishpat, Hidushim on Shulchan Arukh, Choshen Mishpat1 | `halakhah/netivot-hamishpat-hidushim-on-shulchan-arukh-choshen-mishpat/index.html` | 141390 | 0 | 141390 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 799560
- Configured hint rows: 0
- Expected quiet TBD rows: 799560
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch32 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch32 pages]`: passed; No whitespace errors.
- `Batch32 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch32 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch32 scoped commands.

## A14 Next Action

Review/stage Batch32 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch32 page-only packet, or returns an exact blocker.
