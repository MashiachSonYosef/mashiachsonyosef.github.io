# Agent 10 Batch15 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH15_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch15 is page-only and excludes shared CSS/runtime changes.

## Batch15 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Kiryat Sefer on Mishneh Torah, Heave Offerings | `halakhah/kiryat-sefer-on-mishneh-torah-heave-offerings/index.html` | 8924 | 0 | 8924 | prehud_rows |
| 2 | Kiryat Sefer on Mishneh Torah, Hiring | `halakhah/kiryat-sefer-on-mishneh-torah-hiring/index.html` | 3615 | 0 | 3615 | prehud_rows |
| 3 | Kiryat Sefer on Mishneh Torah, Immersion Pools | `halakhah/kiryat-sefer-on-mishneh-torah-immersion-pools/index.html` | 1817 | 0 | 1817 | prehud_rows |
| 4 | Kiryat Sefer on Mishneh Torah, Inheritances | `halakhah/kiryat-sefer-on-mishneh-torah-inheritances/index.html` | 3183 | 0 | 3183 | prehud_rows |
| 5 | Kiryat Sefer on Mishneh Torah, Kings and Wars | `halakhah/kiryat-sefer-on-mishneh-torah-kings-and-wars/index.html` | 5570 | 0 | 5570 | prehud_rows |
| 6 | Kiryat Sefer on Mishneh Torah, Leavened and Unleavened Bread | `halakhah/kiryat-sefer-on-mishneh-torah-leavened-and-unleavened-bread/index.html` | 2498 | 0 | 2498 | prehud_rows |
| 7 | Kiryat Sefer on Mishneh Torah, Levirate Marriage and Release | `halakhah/kiryat-sefer-on-mishneh-torah-levirate-marriage-and-release/index.html` | 6400 | 0 | 6400 | prehud_rows |
| 8 | Kiryat Sefer on Mishneh Torah, Marriage | `halakhah/kiryat-sefer-on-mishneh-torah-marriage/index.html` | 13160 | 0 | 13160 | prehud_rows |
| 9 | Kiryat Sefer on Mishneh Torah, Mourning | `halakhah/kiryat-sefer-on-mishneh-torah-mourning/index.html` | 1454 | 0 | 1454 | prehud_rows |
| 10 | Kiryat Sefer on Mishneh Torah, Murderer and the Preservation of Life | `halakhah/kiryat-sefer-on-mishneh-torah-murderer-and-the-preservation-of-life/index.html` | 8061 | 0 | 8061 | prehud_rows |
| 11 | Kiryat Sefer on Mishneh Torah, Nazariteship | `halakhah/kiryat-sefer-on-mishneh-torah-nazariteship/index.html` | 8991 | 0 | 8991 | prehud_rows |
| 12 | Kiryat Sefer on Mishneh Torah, Neighbors | `halakhah/kiryat-sefer-on-mishneh-torah-neighbors/index.html` | 421 | 0 | 421 | prehud_rows |
| 13 | Kiryat Sefer on Mishneh Torah, Oaths | `halakhah/kiryat-sefer-on-mishneh-torah-oaths/index.html` | 6109 | 0 | 6109 | prehud_rows |
| 14 | Kiryat Sefer on Mishneh Torah, Offerings for Those with Incomplete Atonement | `halakhah/kiryat-sefer-on-mishneh-torah-offerings-for-those-with-incomplete-atonement/index.html` | 7162 | 0 | 7162 | prehud_rows |
| 15 | Kiryat Sefer on Mishneh Torah, Offerings for Unintentional Transgressions | `halakhah/kiryat-sefer-on-mishneh-torah-offerings-for-unintentional-transgressions/index.html` | 22656 | 0 | 22656 | prehud_rows |
| 16 | Kiryat Sefer on Mishneh Torah, One Who Injures a Person or Property | `halakhah/kiryat-sefer-on-mishneh-torah-one-who-injures-a-person-or-property/index.html` | 2626 | 0 | 2626 | prehud_rows |
| 17 | Kiryat Sefer on Mishneh Torah, Other Sources of Defilement | `halakhah/kiryat-sefer-on-mishneh-torah-other-sources-of-defilement/index.html` | 10839 | 0 | 10839 | prehud_rows |
| 18 | Kiryat Sefer on Mishneh Torah, Ownerless Property and Gifts | `halakhah/kiryat-sefer-on-mishneh-torah-ownerless-property-and-gifts/index.html` | 1241 | 0 | 1241 | prehud_rows |
| 19 | Kiryat Sefer on Mishneh Torah, Paschal Offering | `halakhah/kiryat-sefer-on-mishneh-torah-paschal-offering/index.html` | 16201 | 0 | 16201 | prehud_rows |
| 20 | Kiryat Sefer on Mishneh Torah, Plaintiff and Defendant | `halakhah/kiryat-sefer-on-mishneh-torah-plaintiff-and-defendant/index.html` | 2037 | 0 | 2037 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 132965
- Configured hint rows: 0
- Expected quiet TBD rows: 132965
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch15 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch15 pages]`: passed with CRLF replacement warnings only on eight Kiryat Sefer pages.
- Batch15 lexical config/source marker/preHUD guard: passed for 20 pages.
- Batch15 packet JSON parse: passed.

## Process Timeout

| process_timeout | command | timeout | partial_output_or_artifact | next_safe_action |
|---|---|---|---|---|
| true | `git diff --name-only` | 20000ms | timed out after broad dirty-worktree output began; not used as evidence | use scoped Batch15 git status/diff/validator commands only |

## A14 Next Action

Review/stage Batch15 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch15 page-only packet, or returns an exact blocker.
