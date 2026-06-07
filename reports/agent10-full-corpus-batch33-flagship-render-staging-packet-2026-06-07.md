# Agent 10 Batch33 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH33_20_READY_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Purpose: Advance full-corpus A10 flagship book/HUD render sendoff in 20-work batches under owner-waived routine browser proof gate, from the committed canonical shared CSS/runtime baseline. Batch33 is page-only and excludes shared CSS/runtime changes.

## Batch33 Pages

| # | work | page | token rows | hint rows | expected quiet TBD rows | layout |
|---:|---|---|---:|---:|---:|---|
| 1 | Ohr Sameach on Mishneh Torah, Agents and Partners1 | `halakhah/ohr-sameach-on-mishneh-torah-agents-and-partners/index.html` | 4679 | 0 | 4679 | prehud_rows |
| 2 | Ohr Sameach on Mishneh Torah, Borrowing and Deposit1 | `halakhah/ohr-sameach-on-mishneh-torah-borrowing-and-deposit/index.html` | 4974 | 0 | 4974 | prehud_rows |
| 3 | Ohr Sameach on Mishneh Torah, Damages to Property1 | `halakhah/ohr-sameach-on-mishneh-torah-damages-to-property/index.html` | 19993 | 0 | 19993 | prehud_rows |
| 4 | Ohr Sameach on Mishneh Torah, Divorce1 | `halakhah/ohr-sameach-on-mishneh-torah-divorce/index.html` | 53686 | 0 | 53686 | prehud_rows |
| 5 | Ohr Sameach on Mishneh Torah, Eruvin1 | `halakhah/ohr-sameach-on-mishneh-torah-eruvin/index.html` | 6805 | 0 | 6805 | prehud_rows |
| 6 | Ohr Sameach on Mishneh Torah, Festival Offering1 | `halakhah/ohr-sameach-on-mishneh-torah-festival-offering/index.html` | 2984 | 0 | 2984 | prehud_rows |
| 7 | Ohr Sameach on Mishneh Torah, Firstlings1 | `halakhah/ohr-sameach-on-mishneh-torah-firstlings/index.html` | 6228 | 0 | 6228 | prehud_rows |
| 8 | Ohr Sameach on Mishneh Torah, Levirate Marriage and Release1 | `halakhah/ohr-sameach-on-mishneh-torah-levirate-marriage-and-release/index.html` | 23278 | 0 | 23278 | prehud_rows |
| 9 | Ohr Sameach on Mishneh Torah, Mourning1 | `halakhah/ohr-sameach-on-mishneh-torah-mourning/index.html` | 5154 | 0 | 5154 | prehud_rows |
| 10 | Ohr Sameach on Mishneh Torah, Neighbors1 | `halakhah/ohr-sameach-on-mishneh-torah-neighbors/index.html` | 4993 | 0 | 4993 | prehud_rows |
| 11 | Ohr Sameach on Mishneh Torah, Repentance1 | `halakhah/ohr-sameach-on-mishneh-torah-repentance/index.html` | 5666 | 0 | 5666 | prehud_rows |
| 12 | Ohr Sameach on Mishneh Torah, Ritual Slaughter1 | `halakhah/ohr-sameach-on-mishneh-torah-ritual-slaughter/index.html` | 24856 | 0 | 24856 | prehud_rows |
| 13 | Ohr Sameach on Mishneh Torah, Scroll of Esther and Hanukkah1 | `halakhah/ohr-sameach-on-mishneh-torah-scroll-of-esther-and-hanukkah/index.html` | 1017 | 0 | 1017 | prehud_rows |
| 14 | Ohr Sameach on Mishneh Torah, Substitution1 | `halakhah/ohr-sameach-on-mishneh-torah-substitution/index.html` | 4488 | 0 | 4488 | prehud_rows |
| 15 | Ohr Sameach on Mishneh Torah, The Sanhedrin and the Penalties within their Jurisdiction1 | `halakhah/ohr-sameach-on-mishneh-torah-the-sanhedrin-and-the-penalties-within-their-jurisdiction/index.html` | 15 | 0 | 15 | prehud_rows |
| 16 | Ohr Sameach on Mishneh Torah, Trespass1 | `halakhah/ohr-sameach-on-mishneh-torah-trespass/index.html` | 9725 | 0 | 9725 | prehud_rows |
| 17 | Ohr Sameach on Mishneh Torah, Woman Suspected of Infidelity1 | `halakhah/ohr-sameach-on-mishneh-torah-woman-suspected-of-infidelity/index.html` | 7339 | 0 | 7339 | prehud_rows |
| 18 | Peleti on Shulchan Arukh, Yoreh De'ah1 | `halakhah/peleti-on-shulchan-arukh-yoreh-deah/index.html` | 257748 | 0 | 257748 | prehud_rows |
| 19 | Peri Chadash on Mishneh Torah, Human Dispositions1 | `halakhah/peri-chadash-on-mishneh-torah-human-dispositions/index.html` | 2113 | 0 | 2113 | prehud_rows |
| 20 | Peri Megadim on Orach Chayim1 | `halakhah/peri-megadim-on-orach-chayim/index.html` | 1018658 | 0 | 1018658 | prehud_rows |

## Totals

- Pages: 20
- Token rows: 1464399
- Configured hint rows: 0
- Expected quiet TBD rows: 1464399
- Shared files changed in this packet: none
- Featured additions: none; Orot remains only Featured work

## Validators

- `node scripts/validate_route_hud_page.mjs --page [20 Batch33 pages]`: passed; Route HUD page validation passed for 20 page(s).
- `git diff --check -- [20 Batch33 pages]`: passed_with_crlf_warnings_only; CRLF replacement warnings only on five pages; no whitespace errors.
- `Batch33 lexical config/source marker/preHUD guard`: passed; data-lexical-config, reader_layout_mode=prehud_rows, occurrence/manifest URLs, Route HUD panel markers, U+FFFD guard, and old <big marker guard passed for 20 pages.
- `Batch33 packet JSON parse`: passed; JSON parsed successfully after packet write.

## Process Timeout

None for the Batch33 scoped commands.

## A14 Next Action

Review/stage Batch33 as 20 static-validated render-ready stage candidates under normal corpus links only; do not add Featured entries; do not include any shared CSS/runtime change in this page batch.

## Boundary

Render/preHUD staging evidence only. No QA/source/license/legal/Definition/product/answer/accepted-text acceptance. No publication/release/public-runtime acceptance. No source/license/legal permission, Definition authority, accepted gloss, answer eligibility, route-publication support, or public-runtime acceptance is created by this packet.

## Stop Condition

A14 reviews/stages/pushes Batch33 page-only packet, or returns an exact blocker.
