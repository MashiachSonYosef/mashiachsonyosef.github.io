# Agent 10 Batch20 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH20_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch20 is page-only and excludes shared CSS/runtime changes.

## Batch20 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Ma'asai LaMelekh on Mishneh Torah, Vessels of the Sanctuary and Those who Serve Therein | `halakhah/maasai-lamelekh-on-mishneh-torah-vessels-of-the-sanctuary-and-those-who-serve-therein/index.html` | 2071 | 0 | 2071 | prehud_rows |
| 2 | Maaseh Rokeach on Admission into the Sanctuary | `halakhah/maaseh-rokeach-on-admission-into-the-sanctuary/index.html` | 7077 | 0 | 7077 | prehud_rows |
| 3 | Maaseh Rokeach on Appraisals and Devoted Property | `halakhah/maaseh-rokeach-on-appraisals-and-devoted-property/index.html` | 3480 | 0 | 3480 | prehud_rows |
| 4 | Maaseh Rokeach on Blessings | `halakhah/maaseh-rokeach-on-blessings/index.html` | 36952 | 0 | 36952 | prehud_rows |
| 5 | Maaseh Rokeach on Circumcision | `halakhah/maaseh-rokeach-on-circumcision/index.html` | 9277 | 0 | 9277 | prehud_rows |
| 6 | Maaseh Rokeach on Daily Offerings and Additional Offerings | `halakhah/maaseh-rokeach-on-daily-offerings-and-additional-offerings/index.html` | 8226 | 0 | 8226 | prehud_rows |
| 7 | Maaseh Rokeach on Damages to Property | `halakhah/maaseh-rokeach-on-damages-to-property/index.html` | 12058 | 0 | 12058 | prehud_rows |
| 8 | Maaseh Rokeach on Defilement of Foods | `halakhah/maaseh-rokeach-on-defilement-of-foods/index.html` | 6909 | 0 | 6909 | prehud_rows |
| 9 | Maaseh Rokeach on Divorce | `halakhah/maaseh-rokeach-on-divorce/index.html` | 58282 | 0 | 58282 | prehud_rows |
| 10 | Maaseh Rokeach on Eruvin | `halakhah/maaseh-rokeach-on-eruvin/index.html` | 11063 | 0 | 11063 | prehud_rows |
| 11 | Maaseh Rokeach on Fasts | `halakhah/maaseh-rokeach-on-fasts/index.html` | 11379 | 0 | 11379 | prehud_rows |
| 12 | Maaseh Rokeach on Festival Offering | `halakhah/maaseh-rokeach-on-festival-offering/index.html` | 2390 | 0 | 2390 | prehud_rows |
| 13 | Maaseh Rokeach on First Fruits and other Gifts to Priests Outside the Sanctuary | `halakhah/maaseh-rokeach-on-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary/index.html` | 11370 | 0 | 11370 | prehud_rows |
| 14 | Maaseh Rokeach on Firstlings | `halakhah/maaseh-rokeach-on-firstlings/index.html` | 4694 | 0 | 4694 | prehud_rows |
| 15 | Maaseh Rokeach on Forbidden Foods | `halakhah/maaseh-rokeach-on-forbidden-foods/index.html` | 40055 | 0 | 40055 | prehud_rows |
| 16 | Maaseh Rokeach on Forbidden Intercourse | `halakhah/maaseh-rokeach-on-forbidden-intercourse/index.html` | 25916 | 0 | 25916 | prehud_rows |
| 17 | Maaseh Rokeach on Foreign Worship and Customs of the Nations | `halakhah/maaseh-rokeach-on-foreign-worship-and-customs-of-the-nations/index.html` | 23652 | 0 | 23652 | prehud_rows |
| 18 | Maaseh Rokeach on Foundations of the Torah | `halakhah/maaseh-rokeach-on-foundations-of-the-torah/index.html` | 11939 | 0 | 11939 | prehud_rows |
| 19 | Maaseh Rokeach on Fringes | `halakhah/maaseh-rokeach-on-fringes/index.html` | 8341 | 0 | 8341 | prehud_rows |
| 20 | Maaseh Rokeach on Gifts to the Poor | `halakhah/maaseh-rokeach-on-gifts-to-the-poor/index.html` | 7250 | 0 | 7250 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 302381
- Configured hint rows: 0
- Expected quiet TBD rows: 302381
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch20 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch20 pages]`: passed with CRLF replacement warning only on the Maasai Lamelekh page.
- Batch20 lexical config/source marker/preHUD guard: passed for 20 pages using character-code U+FFFD guard.
- Batch20 packet JSON parse: passed.

## Process Timeout

None for the Batch20 scoped commands.

## A14 Next Action

Review/stage Batch20 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch20 page-only packet, or returns an exact blocker.
