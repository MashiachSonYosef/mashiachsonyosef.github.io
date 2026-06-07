# Agent 10 Batch24 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH24_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch24 is page-only and excludes shared CSS/runtime changes.

## Batch24 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Me'irat Einayim on Shulchan Arukh, Choshen Mishpat | `halakhah/meirat-einayim-on-shulchan-arukh-choshen-mishpat/index.html` | 525400 | 0 | 525400 | prehud_rows |
| 2 | Mekorei HaRambam LeRashash on Mishneh Torah, Admission into the Sanctuary | `halakhah/mekorei-harambam-lerashash-on-mishneh-torah-admission-into-the-sanctuary/index.html` | 67 | 0 | 67 | prehud_rows |
| 3 | Mekorei HaRambam LeRashash on Mishneh Torah, Marriage | `halakhah/mekorei-harambam-lerashash-on-mishneh-torah-marriage/index.html` | 939 | 0 | 939 | prehud_rows |
| 4 | Mekorei HaRambam LeRashash on Mishneh Torah, Ritual Slaughter | `halakhah/mekorei-harambam-lerashash-on-mishneh-torah-ritual-slaughter/index.html` | 248 | 0 | 248 | prehud_rows |
| 5 | Mekorei HaRambam LeRashash on Mishneh Torah, Torah Study | `halakhah/mekorei-harambam-lerashash-on-mishneh-torah-torah-study/index.html` | 146 | 0 | 146 | prehud_rows |
| 6 | Mekorei HaRambam LeRashash on Mishneh Torah, Transmission of the Oral Law | `halakhah/mekorei-harambam-lerashash-on-mishneh-torah-transmission-of-the-oral-law/index.html` | 51 | 0 | 51 | prehud_rows |
| 7 | Melekhet Shelomoh on Mishneh Torah, Agents and Partners | `halakhah/melekhet-shelomoh-on-mishneh-torah-agents-and-partners/index.html` | 9942 | 0 | 9942 | prehud_rows |
| 8 | Melekhet Shelomoh on Mishneh Torah, Ownerless Property and Gifts | `halakhah/melekhet-shelomoh-on-mishneh-torah-ownerless-property-and-gifts/index.html` | 37224 | 0 | 37224 | prehud_rows |
| 9 | Melekhet Shelomoh on Mishneh Torah, Prayer and the Priestly Blessing | `halakhah/melekhet-shelomoh-on-mishneh-torah-prayer-and-the-priestly-blessing/index.html` | 256 | 0 | 256 | prehud_rows |
| 10 | Migdal Oz on Mishneh Torah, Agents and Partners | `halakhah/migdal-oz-on-mishneh-torah-agents-and-partners/index.html` | 3236 | 0 | 3236 | prehud_rows |
| 11 | Migdal Oz on Mishneh Torah, Appraisals and Devoted Property | `halakhah/migdal-oz-on-mishneh-torah-appraisals-and-devoted-property/index.html` | 6591 | 0 | 6591 | prehud_rows |
| 12 | Migdal Oz on Mishneh Torah, Blessings | `halakhah/migdal-oz-on-mishneh-torah-blessings/index.html` | 7291 | 0 | 7291 | prehud_rows |
| 13 | Migdal Oz on Mishneh Torah, Borrowing and Deposit | `halakhah/migdal-oz-on-mishneh-torah-borrowing-and-deposit/index.html` | 1328 | 0 | 1328 | prehud_rows |
| 14 | Migdal Oz on Mishneh Torah, Circumcision | `halakhah/migdal-oz-on-mishneh-torah-circumcision/index.html` | 1392 | 0 | 1392 | prehud_rows |
| 15 | Migdal Oz on Mishneh Torah, Creditor and Debtor | `halakhah/migdal-oz-on-mishneh-torah-creditor-and-debtor/index.html` | 8789 | 0 | 8789 | prehud_rows |
| 16 | Migdal Oz on Mishneh Torah, Damages to Property | `halakhah/migdal-oz-on-mishneh-torah-damages-to-property/index.html` | 13001 | 0 | 13001 | prehud_rows |
| 17 | Migdal Oz on Mishneh Torah, Divorce | `halakhah/migdal-oz-on-mishneh-torah-divorce/index.html` | 13387 | 0 | 13387 | prehud_rows |
| 18 | Migdal Oz on Mishneh Torah, Eruvin | `halakhah/migdal-oz-on-mishneh-torah-eruvin/index.html` | 5615 | 0 | 5615 | prehud_rows |
| 19 | Migdal Oz on Mishneh Torah, Fasts | `halakhah/migdal-oz-on-mishneh-torah-fasts/index.html` | 144 | 0 | 144 | prehud_rows |
| 20 | Migdal Oz on Mishneh Torah, Forbidden Foods | `halakhah/migdal-oz-on-mishneh-torah-forbidden-foods/index.html` | 16086 | 0 | 16086 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 651133
- Configured hint rows: 0
- Expected quiet TBD rows: 651133
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch24 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch24 pages]`: passed with CRLF replacement warnings only on two Migdal Oz pages.
- Batch24 lexical config/source marker/preHUD guard: passed for 20 pages using character-code U+FFFD guard.
- Batch24 packet JSON parse: passed.

## Process Timeout

None for the Batch24 scoped commands.

## A14 Next Action

Review/stage Batch24 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch24 page-only packet, or returns an exact blocker.
