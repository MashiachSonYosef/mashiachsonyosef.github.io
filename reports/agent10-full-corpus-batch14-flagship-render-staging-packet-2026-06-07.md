# Agent 10 Batch14 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH14_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch14 is page-only and excludes shared CSS/runtime changes.

## Batch14 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Kiryat Sefer on Mishneh Torah, Blessings | `halakhah/kiryat-sefer-on-mishneh-torah-blessings/index.html` | 975 | 0 | 975 | prehud_rows |
| 2 | Kiryat Sefer on Mishneh Torah, Borrowing and Deposit | `halakhah/kiryat-sefer-on-mishneh-torah-borrowing-and-deposit/index.html` | 1337 | 0 | 1337 | prehud_rows |
| 3 | Kiryat Sefer on Mishneh Torah, Circumcision | `halakhah/kiryat-sefer-on-mishneh-torah-circumcision/index.html` | 1801 | 0 | 1801 | prehud_rows |
| 4 | Kiryat Sefer on Mishneh Torah, Creditor and Debtor | `halakhah/kiryat-sefer-on-mishneh-torah-creditor-and-debtor/index.html` | 4296 | 0 | 4296 | prehud_rows |
| 5 | Kiryat Sefer on Mishneh Torah, Daily Offerings and Additional Offerings | `halakhah/kiryat-sefer-on-mishneh-torah-daily-offerings-and-additional-offerings/index.html` | 9876 | 0 | 9876 | prehud_rows |
| 6 | Kiryat Sefer on Mishneh Torah, Damages to Property | `halakhah/kiryat-sefer-on-mishneh-torah-damages-to-property/index.html` | 8035 | 0 | 8035 | prehud_rows |
| 7 | Kiryat Sefer on Mishneh Torah, Defilement by a Corpse | `halakhah/kiryat-sefer-on-mishneh-torah-defilement-by-a-corpse/index.html` | 22640 | 0 | 22640 | prehud_rows |
| 8 | Kiryat Sefer on Mishneh Torah, Defilement by Leprosy | `halakhah/kiryat-sefer-on-mishneh-torah-defilement-by-leprosy/index.html` | 27141 | 0 | 27141 | prehud_rows |
| 9 | Kiryat Sefer on Mishneh Torah, Defilement of Foods | `halakhah/kiryat-sefer-on-mishneh-torah-defilement-of-foods/index.html` | 8455 | 0 | 8455 | prehud_rows |
| 10 | Kiryat Sefer on Mishneh Torah, Diverse Species | `halakhah/kiryat-sefer-on-mishneh-torah-diverse-species/index.html` | 5333 | 0 | 5333 | prehud_rows |
| 11 | Kiryat Sefer on Mishneh Torah, Divorce | `halakhah/kiryat-sefer-on-mishneh-torah-divorce/index.html` | 11023 | 0 | 11023 | prehud_rows |
| 12 | Kiryat Sefer on Mishneh Torah, Fasts | `halakhah/kiryat-sefer-on-mishneh-torah-fasts/index.html` | 184 | 0 | 184 | prehud_rows |
| 13 | Kiryat Sefer on Mishneh Torah, Festival Offering | `halakhah/kiryat-sefer-on-mishneh-torah-festival-offering/index.html` | 4934 | 0 | 4934 | prehud_rows |
| 14 | Kiryat Sefer on Mishneh Torah, First Fruits and other Gifts to Priests Outside the Sanctuary | `halakhah/kiryat-sefer-on-mishneh-torah-first-fruits-and-other-gifts-to-priests-outside-the-sanctuary/index.html` | 8819 | 0 | 8819 | prehud_rows |
| 15 | Kiryat Sefer on Mishneh Torah, Firstlings | `halakhah/kiryat-sefer-on-mishneh-torah-firstlings/index.html` | 10528 | 0 | 10528 | prehud_rows |
| 16 | Kiryat Sefer on Mishneh Torah, Forbidden Foods | `halakhah/kiryat-sefer-on-mishneh-torah-forbidden-foods/index.html` | 12043 | 0 | 12043 | prehud_rows |
| 17 | Kiryat Sefer on Mishneh Torah, Forbidden Intercourse | `halakhah/kiryat-sefer-on-mishneh-torah-forbidden-intercourse/index.html` | 18585 | 0 | 18585 | prehud_rows |
| 18 | Kiryat Sefer on Mishneh Torah, Foundations of the Torah | `halakhah/kiryat-sefer-on-mishneh-torah-foundations-of-the-torah/index.html` | 1633 | 0 | 1633 | prehud_rows |
| 19 | Kiryat Sefer on Mishneh Torah, Fringes | `halakhah/kiryat-sefer-on-mishneh-torah-fringes/index.html` | 1697 | 0 | 1697 | prehud_rows |
| 20 | Kiryat Sefer on Mishneh Torah, Gifts to the Poor | `halakhah/kiryat-sefer-on-mishneh-torah-gifts-to-the-poor/index.html` | 6476 | 0 | 6476 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 165811
- Configured hint rows: 0
- Expected quiet TBD rows: 165811
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch14 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch14 pages]`: passed with CRLF replacement warnings only on four Kiryat Sefer pages.
- Batch14 Hebrew source/mojibake/preHUD config guard: passed for 20 pages.
- Batch14 packet JSON parse: passed.

## Process Timeout

| process_timeout | command | timeout | partial_output_or_artifact | next_safe_action |
|---|---|---|---|---|
| true | `git diff --name-only` | 20000ms | timed out after broad dirty-worktree output began; not used as evidence | use scoped Batch14 git status/diff/validator commands only |

## A14 Next Action

Review/stage Batch14 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch14 page-only packet, or returns an exact blocker.
