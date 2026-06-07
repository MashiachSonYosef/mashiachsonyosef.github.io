# Agent 10 Full-Corpus Batch48 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH48_20_READY_KABBALAH_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: first Kabbalah page batch under the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Corpus Selection

Kabbalah is selected after the Jewish Thought closure as the next explicit remaining top-level corpus family. Batch48 uses the first 20 sorted Kabbalah directories that contain `index.html`.

## Selector Notes

Skipped non-page directories:

- `kabbalah/ohr-penimi-on-talmud-eser-hasefirot/` has no `index.html` page target
- `kabbalah/shuvi-shuvi-hashulamit/` has no `index.html` page target

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 20 | 4036899 | 0 | 4036899 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Asarah Perakim LeRamchal | `kabbalah/asarah-perakim-leramchal/index.html` | 4357 | 0 | 4357 |
| 2 | Beur Eser Sefirot | `kabbalah/beur-eser-sefirot/index.html` | 3208 | 0 | 3208 |
| 3 | Chesed LeAvraham | `kabbalah/chesed-leavraham/index.html` | 125769 | 0 | 125769 |
| 4 | Derech Etz Chayim (Ramchal) | `kabbalah/derech-etz-chayim-ramchal/index.html` | 5680 | 0 | 5680 |
| 5 | Kalach Pitchei Chokhmah | `kabbalah/kalach-pitchei-chokhmah/index.html` | 83841 | 0 | 83841 |
| 6 | Ketem Paz on Zohar | `kabbalah/ketem-paz-on-zohar/index.html` | 518900 | 0 | 518900 |
| 7 | Maaseh Rokeach on Mishnah | `kabbalah/maaseh-rokeach-on-mishnah/index.html` | 106389 | 0 | 106389 |
| 8 | Maggid Meisharim | `kabbalah/maggid-meisharim/index.html` | 95107 | 0 | 95107 |
| 9 | Megalleh Amukkot on Parashat VaEtchanan | `kabbalah/megalleh-amukkot-on-parashat-vaetchanan/index.html` | 148136 | 0 | 148136 |
| 10 | Mikdash Melekh on Zohar | `kabbalah/mikdash-melekh-on-zohar/index.html` | 441751 | 0 | 441751 |
| 11 | Mitpachat Sefarim | `kabbalah/mitpachat-sefarim/index.html` | 5281 | 0 | 5281 |
| 12 | Ohr HaChammah on Zohar | `kabbalah/ohr-hachammah-on-zohar/index.html` | 1754048 | 0 | 1754048 |
| 13 | Ohr Ne&#39;erav | `kabbalah/ohr-neerav/index.html` | 7789 | 0 | 7789 |
| 14 | Pardes Rimmonim | `kabbalah/pardes-rimmonim/index.html` | 399996 | 0 | 399996 |
| 15 | Peri Etz Hadar | `kabbalah/peri-etz-hadar/index.html` | 3164 | 0 | 3164 |
| 16 | Pri Yitzhak on Sefer Yetzirah Gra Version | `kabbalah/pri-yitzhak-on-sefer-yetzirah-gra-version/index.html` | 12998 | 0 | 12998 |
| 17 | Ra&#39;avad on Sefer Yetzirah | `kabbalah/raavad-on-sefer-yetzirah/index.html` | 41705 | 0 | 41705 |
| 18 | Ramban on Sefer Yetzirah | `kabbalah/ramban-on-sefer-yetzirah/index.html` | 2862 | 0 | 2862 |
| 19 | Rasag on Sefer Yetzirah | `kabbalah/rasag-on-sefer-yetzirah/index.html` | 6518 | 0 | 6518 |
| 20 | Recanati on the Torah | `kabbalah/recanati-on-the-torah/index.html` | 269400 | 0 | 269400 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <20 Batch48 pages>` | 120000ms | passed: Route HUD page validation passed for 20 page(s). |
| `git diff --check -- <20 Batch48 pages>` | 60000ms | passed: no whitespace errors; CRLF replacement warnings only |
| `node <Batch48 source/config/asset guard>` | 60000ms | passed: 20 pages; 4036899 token rows; 0 configured hint rows; 4036899 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch48-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 20 pages.
- Source/config/asset guard passed and counted 4036899 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.
- Scoped diff check produced CRLF replacement warnings only, no whitespace errors.

## A14 Next Action

- Review Batch48 Kabbalah page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can close remaining Kabbalah page targets next.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch48 Kabbalah or returns exact blocker; Agent 10 can continue to Kabbalah closure after checkpoint or explicit continuation.
