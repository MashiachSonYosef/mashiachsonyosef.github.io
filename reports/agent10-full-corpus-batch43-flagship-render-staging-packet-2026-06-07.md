# Agent 10 Full-Corpus Batch43 Flagship Render Staging Packet - 2026-06-07

Status: `BATCH43_20_READY_CHASIDUT_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED`

Scope: first Chasidut page batch under the A10 flagship Route HUD/book-page render contract. No shared CSS/runtime files and no Featured additions.

## Corpus Selection

Chasidut is selected after the Ari closure as the next explicit remaining corpus family with page targets. Batch43 uses the first 20 sorted Chasidut directories that contain `index.html`.

## Selector Notes

Skipped non-page directories:

- `chasidut/bepardes-hachasidut-vehakabbalah/` has no `index.html` page target
- `chasidut/chovat-hatalmidim/` has no `index.html` page target
- `chasidut/hakhsharat-haavrekhim/` has no `index.html` page target
- `chasidut/mevo-hashearim/` has no `index.html` page target

## Counts

| pages | token rows | configured hint rows | expected quiet TBD rows |
| ---: | ---: | ---: | ---: |
| 20 | 3037677 | 0 | 3037677 |

## Batch Pages

| # | work | page | token rows | configured hints | expected TBD |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | Agra DeKala | `chasidut/agra-dekala/index.html` | 483933 | 0 | 483933 |
| 2 | Arvei Nachal | `chasidut/arvei-nachal/index.html` | 458595 | 0 | 458595 |
| 3 | Avodat Yisrael | `chasidut/avodat-yisrael/index.html` | 153415 | 0 | 153415 |
| 4 | Ba'al Shem Tov | `chasidut/baal-shem-tov/index.html` | 143432 | 0 | 143432 |
| 5 | Beit Aharon | `chasidut/beit-aharon/index.html` | 220985 | 0 | 220985 |
| 6 | Bnei Yissaschar | `chasidut/bnei-yissaschar/index.html` | 371644 | 0 | 371644 |
| 7 | Darkhei Yesharim | `chasidut/darkhei-yesharim/index.html` | 8053 | 0 | 8053 |
| 8 | Degel Machaneh Ephraim | `chasidut/degel-machaneh-ephraim/index.html` | 147182 | 0 | 147182 |
| 9 | Divrei Chalomot | `chasidut/divrei-chalomot/index.html` | 10093 | 0 | 10093 |
| 10 | Divrei Emet | `chasidut/divrei-emet/index.html` | 80049 | 0 | 80049 |
| 11 | Divrei Soferim | `chasidut/divrei-soferim/index.html` | 27344 | 0 | 27344 |
| 12 | Dover Tzedek | `chasidut/dover-tzedek/index.html` | 124019 | 0 | 124019 |
| 13 | Et HaOchel | `chasidut/et-haochel/index.html` | 5021 | 0 | 5021 |
| 14 | Kedushat Levi | `chasidut/kedushat-levi/index.html` | 263132 | 0 | 263132 |
| 15 | Keter Shem Tov | `chasidut/keter-shem-tov/index.html` | 312 | 0 | 312 |
| 16 | Kometz HaMinchah | `chasidut/kometz-haminchah/index.html` | 170 | 0 | 170 |
| 17 | Likkutei Maamarim | `chasidut/likkutei-maamarim/index.html` | 100967 | 0 | 100967 |
| 18 | Likutei Moharan | `chasidut/likutei-moharan/index.html` | 281722 | 0 | 281722 |
| 19 | Machshavot Charutz | `chasidut/machshavot-charutz/index.html` | 100406 | 0 | 100406 |
| 20 | Maggid Devarav leYaakov | `chasidut/maggid-devarav-leyaakov/index.html` | 57203 | 0 | 57203 |

## Validators

| command | timeout | result |
| --- | ---: | --- |
| `node scripts/validate_route_hud_page.mjs --page <20 Batch43 pages>` | 120000ms | passed: Route HUD page validation passed for 20 page(s). |
| `git diff --check -- <20 Batch43 pages>` | 60000ms | passed: no whitespace errors; CRLF replacement warnings only |
| `node <Batch43 source/config/asset guard>` | 60000ms | passed: 20 pages; 3037677 token rows; 0 configured hint rows; 3037677 expected quiet TBD rows |
| `node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch43-flagship-render-staging-packet-2026-06-07.json','utf8'))` | 30000ms | passed: packet JSON parsed after write |

## Proof

- Static Route HUD validator gate passed for all 20 pages.
- Source/config/asset guard passed and counted 3037677 token rows.
- Browser proof skipped by owner preference for routine batches.
- Shared CSS/runtime files changed: none.
- Featured additions: none; Orot remains the only Featured work.
- Scoped diff check produced CRLF replacement warnings only, no whitespace errors.

## A14 Next Action

- Review Batch43 Chasidut page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can continue with the next Chasidut page targets.

## Boundary

render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition

A14 reviews/stages/pushes Batch43 Chasidut or returns exact blocker; Agent 10 can continue to next Chasidut batch after checkpoint or explicit continuation.
