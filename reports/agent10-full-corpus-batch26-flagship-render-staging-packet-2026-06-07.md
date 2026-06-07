# Agent 10 Batch26 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH26_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch26 is page-only and excludes shared CSS/runtime changes.

## Batch26 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Migdal Oz on Mishneh Torah, Reading the Shema1 | `halakhah/migdal-oz-on-mishneh-torah-reading-the-shema/index.html` | 2619 | 0 | 2619 | prehud_rows |
| 2 | Migdal Oz on Mishneh Torah, Rebels1 | `halakhah/migdal-oz-on-mishneh-torah-rebels/index.html` | 1863 | 0 | 1863 | prehud_rows |
| 3 | Migdal Oz on Mishneh Torah, Repentance1 | `halakhah/migdal-oz-on-mishneh-torah-repentance/index.html` | 3929 | 0 | 3929 | prehud_rows |
| 4 | Migdal Oz on Mishneh Torah, Rest on a Holiday1 | `halakhah/migdal-oz-on-mishneh-torah-rest-on-a-holiday/index.html` | 7479 | 0 | 7479 | prehud_rows |
| 5 | Migdal Oz on Mishneh Torah, Rest on the Tenth of Tishrei1 | `halakhah/migdal-oz-on-mishneh-torah-rest-on-the-tenth-of-tishrei/index.html` | 384 | 0 | 384 | prehud_rows |
| 6 | Migdal Oz on Mishneh Torah, Ritual Slaughter1 | `halakhah/migdal-oz-on-mishneh-torah-ritual-slaughter/index.html` | 4699 | 0 | 4699 | prehud_rows |
| 7 | Migdal Oz on Mishneh Torah, Robbery and Lost Property1 | `halakhah/migdal-oz-on-mishneh-torah-robbery-and-lost-property/index.html` | 7639 | 0 | 7639 | prehud_rows |
| 8 | Migdal Oz on Mishneh Torah, Sabbath1 | `halakhah/migdal-oz-on-mishneh-torah-sabbath/index.html` | 23400 | 0 | 23400 | prehud_rows |
| 9 | Migdal Oz on Mishneh Torah, Sales1 | `halakhah/migdal-oz-on-mishneh-torah-sales/index.html` | 11843 | 0 | 11843 | prehud_rows |
| 10 | Migdal Oz on Mishneh Torah, Sanctification of the New Month1 | `halakhah/migdal-oz-on-mishneh-torah-sanctification-of-the-new-month/index.html` | 943 | 0 | 943 | prehud_rows |
| 11 | Migdal Oz on Mishneh Torah, Shofar, Sukkah and Lulav1 | `halakhah/migdal-oz-on-mishneh-torah-shofar-sukkah-and-lulav/index.html` | 6231 | 0 | 6231 | prehud_rows |
| 12 | Migdal Oz on Mishneh Torah, Slaves1 | `halakhah/migdal-oz-on-mishneh-torah-slaves/index.html` | 3392 | 0 | 3392 | prehud_rows |
| 13 | Migdal Oz on Mishneh Torah, Tefillin, Mezuzah and the Torah Scroll1 | `halakhah/migdal-oz-on-mishneh-torah-tefillin-mezuzah-and-the-torah-scroll/index.html` | 5103 | 0 | 5103 | prehud_rows |
| 14 | Migdal Oz on Mishneh Torah, Testimony1 | `halakhah/migdal-oz-on-mishneh-torah-testimony/index.html` | 4224 | 0 | 4224 | prehud_rows |
| 15 | Migdal Oz on Mishneh Torah, The Sanhedrin and the Penalties within their Jurisdiction1 | `halakhah/migdal-oz-on-mishneh-torah-the-sanhedrin-and-the-penalties-within-their-jurisdiction/index.html` | 5855 | 0 | 5855 | prehud_rows |
| 16 | Migdal Oz on Mishneh Torah, Theft1 | `halakhah/migdal-oz-on-mishneh-torah-theft/index.html` | 6238 | 0 | 6238 | prehud_rows |
| 17 | Migdal Oz on Mishneh Torah, Torah Study1 | `halakhah/migdal-oz-on-mishneh-torah-torah-study/index.html` | 3213 | 0 | 3213 | prehud_rows |
| 18 | Migdal Oz on Mishneh Torah, Virgin Maiden1 | `halakhah/migdal-oz-on-mishneh-torah-virgin-maiden/index.html` | 2410 | 0 | 2410 | prehud_rows |
| 19 | Migdal Oz on Mishneh Torah, Vows1 | `halakhah/migdal-oz-on-mishneh-torah-vows/index.html` | 6464 | 0 | 6464 | prehud_rows |
| 20 | Migdal Oz on Mishneh Torah, Woman Suspected of Infidelity1 | `halakhah/migdal-oz-on-mishneh-torah-woman-suspected-of-infidelity/index.html` | 1102 | 0 | 1102 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 109030
- Configured hint rows: 0
- Expected quiet TBD rows: 109030
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch26 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch26 pages]`: passed_with_crlf_warnings_only; CRLF replacement warnings only on six Migdal Oz pages; no whitespace errors.
- `Batch26 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch26 packet JSON parse`: pending_until_written; Checked after packet write.

## Process Timeout

None for the Batch26 scoped commands.

## A14 Next Action

Review/stage Batch26 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch26 page-only packet, or returns an exact blocker.
