# Agent 10 Full Corpus Batch 02 Flagship Render Staging Packet

Status: `BATCH02_20_READY_DIRECT_RENDER_CONTRACT`

Purpose:
- Advance the full-corpus A10 flagship book/HUD render sendoff in 20-work batches.
- Preserve source-visible Hebrew pages with clickable token rows, canonical Route HUD behavior, and fail-closed `TBD` when no safe hint exists.
- This is render-stage evidence only, not feature/publication approval.

Batch 02 works:

| # | work | page | token rows | configured hint rows | expected TBD rows | layout | state |
| ---: | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | Amos | `tanakh/amos/index.html` | 1801 | 954 | 847 | prehud_rows | stage_candidate |
| 2 | Obadiah | `tanakh/obadiah/index.html` | 249 | 118 | 131 | prehud_rows | stage_candidate |
| 3 | Jonah | `tanakh/jonah/index.html` | 587 | 360 | 227 | prehud_rows | stage_candidate |
| 4 | Micah | `tanakh/micah/index.html` | 1274 | 0 | 1274 | prehud_rows | stage_candidate |
| 5 | Nahum | `tanakh/nahum/index.html` | 527 | 0 | 527 | prehud_rows | stage_candidate |
| 6 | Habakkuk | `tanakh/habakkuk/index.html` | 615 | 0 | 615 | prehud_rows | stage_candidate |
| 7 | Zephaniah | `tanakh/zephaniah/index.html` | 674 | 416 | 258 | prehud_rows | stage_candidate |
| 8 | Haggai | `tanakh/haggai/index.html` | 499 | 0 | 499 | prehud_rows | stage_candidate |
| 9 | Zechariah | `tanakh/zechariah/index.html` | 2809 | 1475 | 1334 | prehud_rows | stage_candidate |
| 10 | Malachi | `tanakh/malachi/index.html` | 789 | 354 | 435 | prehud_rows | stage_candidate |
| 11 | Psalms | `tanakh/psalms/index.html` | 17452 | 0 | 17452 | prehud_rows | stage_candidate |
| 12 | Proverbs | `tanakh/proverbs/index.html` | 6137 | 0 | 6137 | prehud_rows | stage_candidate |
| 13 | Job | `tanakh/job/index.html` | 7198 | 0 | 7198 | prehud_rows | stage_candidate |
| 14 | Song of Songs | `tanakh/song-of-songs/index.html` | 1169 | 0 | 1169 | prehud_rows | stage_candidate |
| 15 | Ecclesiastes | `tanakh/ecclesiastes/index.html` | 2598 | 0 | 2598 | prehud_rows | stage_candidate |
| 16 | Lamentations | `tanakh/lamentations/index.html` | 1544 | 0 | 1544 | prehud_rows | stage_candidate |
| 17 | I Chronicles | `tanakh/i-chronicles/index.html` | 9685 | 0 | 9685 | prehud_rows | stage_candidate |
| 18 | II Chronicles | `tanakh/ii-chronicles/index.html` | 11717 | 0 | 11717 | prehud_rows | stage_candidate |
| 19 | Ibn Ezra on Deuteronomy | `tanakh/ibn-ezra-on-deuteronomy/index.html` | 19986 | 0 | 19986 | prehud_rows | stage_candidate |
| 20 | Ibn Ezra on Exodus | `tanakh/ibn-ezra-on-exodus/index.html` | 70096 | 0 | 70096 | prehud_rows | stage_candidate |

Files changed in this batch turn:
- `tanakh/micah/index.html`
- `tanakh/nahum/index.html`
- `tanakh/habakkuk/index.html`
- `tanakh/haggai/index.html`
- `tanakh/psalms/index.html`
- `tanakh/proverbs/index.html`
- `tanakh/job/index.html`
- `tanakh/song-of-songs/index.html`
- `tanakh/ecclesiastes/index.html`
- `tanakh/lamentations/index.html`
- `tanakh/i-chronicles/index.html`
- `tanakh/ii-chronicles/index.html`
- `tanakh/ibn-ezra-on-deuteronomy/index.html`
- `tanakh/ibn-ezra-on-exodus/index.html`

Validators:
- `node scripts/validate_route_hud_page.mjs --page [20 Batch02 pages]` passed.
- `git diff --check -- [20 Batch02 pages]` passed.

Browser/render proof:
- Malachi in-app exact gate check: rows `789`, exact unsafe pre-HUD glosses `0`. The in-app browser may include persisted reader selections, so configured hint counts above remain the package counts.
- Micah zero-hint check: rows `1274`, TBD rows `1274`, populated rows `0`, exact unsafe pre-HUD glosses `0`.

Explicit non-batch blocker:
- `tanakh/ezekiel/index.html`: old-HUD shell repair required before batch staging. Validator precheck showed missing shared Route HUD markers, missing `hero-summary` / `hero-notes`, and stale `data-hud-*` markers.
- Next safe action: repair Ezekiel through an A10 flagship shell generator or exact shell-migration contract; do not stage it as a Batch02 candidate until validator passes.

A14 staging instruction:
- Review/stage Batch02 as 20 render-ready stage candidates for splash/library/corpus organization.
- Keep Ezekiel queued as an old-HUD shell repair blocker.
- Do not treat definition/TBD counts as source/license/legal/Definition/answer acceptance.
- Preserve Orot/Ruth flagship behavior and the shared corpus-wide preHUD display gate.

Boundary:
- Render/preHUD staging evidence only.
- No QA/source/license/legal/Definition/product/answer/accepted-text acceptance.
- No publication/release/public-runtime acceptance.
