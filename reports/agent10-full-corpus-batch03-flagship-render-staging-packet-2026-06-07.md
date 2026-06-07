# Agent 10 Full Corpus Batch 03 Flagship Render Staging Packet

Status: `BATCH03_20_READY_DIRECT_RENDER_CONTRACT`

Purpose:
- Advance the full-corpus A10 flagship book/HUD render sendoff in 20-work batches.
- Preserve source-visible Hebrew pages with clickable token rows, canonical Route HUD behavior, and fail-closed `TBD` when no safe hint exists.
- This is render-stage evidence only, not feature/publication approval.

Ezekiel repair included:
- Repaired `tanakh/ezekiel/index.html` with bounded render authority: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/render_site.ps1 -WorkIds ezekiel -SkipSitePages -SkipOverlayExports -SkipLexicalPayloadFiles`.
- Skipped root/library/site index and overlay exports; this was a one-work page repair.
- Removed stale old-HUD shell markers, preserved current Route HUD shell, and enabled `reader_layout_mode=prehud_rows`.

Batch 03 works:

| # | work | page | token rows | configured hint rows | expected TBD rows | layout | state |
| ---: | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | Ezekiel | `tanakh/ezekiel/index.html` | 16695 | 0 | 16695 | prehud_rows | stage_candidate |
| 2 | Ibn Ezra on Genesis | `tanakh/ibn-ezra-on-genesis/index.html` | 32570 | 0 | 32570 | prehud_rows | stage_candidate |
| 3 | Ibn Ezra on Leviticus | `tanakh/ibn-ezra-on-leviticus/index.html` | 19910 | 0 | 19910 | prehud_rows | stage_candidate |
| 4 | Ibn Ezra on Numbers | `tanakh/ibn-ezra-on-numbers/index.html` | 17461 | 0 | 17461 | prehud_rows | stage_candidate |
| 5 | Ibn Ezra on Zechariah | `tanakh/ibn-ezra-on-zechariah/index.html` | 6442 | 0 | 6442 | prehud_rows | stage_candidate |
| 6 | Rashi on Deuteronomy | `tanakh/rashi-on-deuteronomy/index.html` | 26771 | 0 | 26771 | prehud_rows | stage_candidate |
| 7 | Rashi on Genesis | `tanakh/rashi-on-genesis/index.html` | 41392 | 0 | 41392 | prehud_rows | stage_candidate |
| 8 | Rashi on Leviticus | `tanakh/rashi-on-leviticus/index.html` | 25861 | 0 | 25861 | prehud_rows | stage_candidate |
| 9 | Rashi on Numbers | `tanakh/rashi-on-numbers/index.html` | 27996 | 0 | 27996 | prehud_rows | stage_candidate |
| 10 | Abudarham | `halakhah/abudarham/index.html` | 179852 | 0 | 179852 | prehud_rows | stage_candidate |
| 11 | Ahavat Chesed | `halakhah/ahavat-chesed/index.html` | 67323 | 0 | 67323 | prehud_rows | stage_candidate |
| 12 | Annotations of Maharatz Chajes on Mishneh Torah, Foreign Worship and Customs of the Nations | `halakhah/annotations-of-maharatz-chajes-on-mishneh-torah-foreign-worship-and-customs-of-the-nations/index.html` | 77 | 0 | 77 | prehud_rows | stage_candidate |
| 13 | Annotations of Maharatz Chajes on Mishneh Torah, Mourning | `halakhah/annotations-of-maharatz-chajes-on-mishneh-torah-mourning/index.html` | 55 | 0 | 55 | prehud_rows | stage_candidate |
| 14 | Annotations of Maharatz Chajes on Mishneh Torah, Repentance | `halakhah/annotations-of-maharatz-chajes-on-mishneh-torah-repentance/index.html` | 229 | 0 | 229 | prehud_rows | stage_candidate |
| 15 | Annotations of Minchat Chinukh on Mishneh Torah, Daily Offerings and Additional Offerings | `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-daily-offerings-and-additional-offerings/index.html` | 278 | 0 | 278 | prehud_rows | stage_candidate |
| 16 | Annotations of Minchat Chinukh on Mishneh Torah, Diverse Species | `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-diverse-species/index.html` | 97 | 0 | 97 | prehud_rows | stage_candidate |
| 17 | Annotations of Minchat Chinukh on Mishneh Torah, Fasts | `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-fasts/index.html` | 255 | 0 | 255 | prehud_rows | stage_candidate |
| 18 | Annotations of Minchat Chinukh on Mishneh Torah, Paschal Offering | `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-paschal-offering/index.html` | 645 | 0 | 645 | prehud_rows | stage_candidate |
| 19 | Annotations of R&#39; Yeshaya Berlin on Mishneh Torah, Sabbath | `halakhah/annotations-of-r-yeshaya-berlin-on-mishneh-torah-sabbath/index.html` | 1398 | 0 | 1398 | prehud_rows | stage_candidate |
| 20 | Annotations of R&#39; Zalman of Vilna on Mishneh Torah, Repentance | `halakhah/annotations-of-r-zalman-of-vilna-on-mishneh-torah-repentance/index.html` | 244 | 0 | 244 | prehud_rows | stage_candidate |

Files changed in this batch turn:
- `tanakh/ezekiel/index.html`
- `tanakh/ibn-ezra-on-genesis/index.html`
- `tanakh/ibn-ezra-on-leviticus/index.html`
- `tanakh/ibn-ezra-on-numbers/index.html`
- `tanakh/ibn-ezra-on-zechariah/index.html`
- `tanakh/rashi-on-deuteronomy/index.html`
- `tanakh/rashi-on-genesis/index.html`
- `tanakh/rashi-on-leviticus/index.html`
- `tanakh/rashi-on-numbers/index.html`
- `halakhah/abudarham/index.html`
- `halakhah/ahavat-chesed/index.html`
- `halakhah/annotations-of-maharatz-chajes-on-mishneh-torah-foreign-worship-and-customs-of-the-nations/index.html`
- `halakhah/annotations-of-maharatz-chajes-on-mishneh-torah-mourning/index.html`
- `halakhah/annotations-of-maharatz-chajes-on-mishneh-torah-repentance/index.html`
- `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-daily-offerings-and-additional-offerings/index.html`
- `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-diverse-species/index.html`
- `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-fasts/index.html`
- `halakhah/annotations-of-minchat-chinukh-on-mishneh-torah-paschal-offering/index.html`
- `halakhah/annotations-of-r-yeshaya-berlin-on-mishneh-torah-sabbath/index.html`
- `halakhah/annotations-of-r-zalman-of-vilna-on-mishneh-torah-repentance/index.html`

Validators:
- `node scripts/validate_route_hud_page.mjs --page [20 Batch03 pages]` passed.
- `git diff --check -- [20 Batch03 pages]` passed with one CRLF warning only.

Browser/render proof:
- Ezekiel bounded hydration wait: rows progressed `7484 -> 12436 -> 16687 -> 16695`; final rows `16695`, initialized lexical slots `1273 / 1273`, first unsafe pre-HUD gloss `null`.
- Small Halakhah zero-hint proof: `Annotations of Maharatz Chajes on Mishneh Torah, Foreign Worship and Customs of the Nations` rendered `77` rows, `77` TBD rows, `0` populated rows, `0` exact unsafe pre-HUD glosses.

A14 staging instruction:
- Review/stage Batch03 as 20 render-ready stage candidates for splash/library/corpus organization.
- Ezekiel blocker is resolved in this packet.
- Do not treat definition/TBD counts as source/license/legal/Definition/answer acceptance.
- Preserve Orot/Ruth flagship behavior and the shared corpus-wide preHUD display gate.

Boundary:
- Render/preHUD staging evidence only.
- No QA/source/license/legal/Definition/product/answer/accepted-text acceptance.
- No publication/release/public-runtime acceptance.
