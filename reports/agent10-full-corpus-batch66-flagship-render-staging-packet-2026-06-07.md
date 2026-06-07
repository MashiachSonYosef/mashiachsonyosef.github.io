# Agent 10 Full-Corpus Batch66 Flagship Render Staging Packet - 2026-06-07

status: BATCH66_20_READY_TARGUM_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED

## Scope
- latest pushed baseline: 2382922fc / Batch59 Midrash
- corpus family: Targum
- page rule: first 20 sorted Targum directories missing `reader_layout_mode=prehud_rows`
- shared files changed: none
- Featured additions: none; Orot remains only Featured

## Counts
- pages: 20
- token rows: 222078
- configured hint rows: 0
- expected quiet TBD rows: 222078

## Pages
1. Aramaic Targum to Ecclesiastes1 - targum/aramaic-targum-to-ecclesiastes/index.html - token rows 7010 - hints 0 - expected TBD 7010
2. Aramaic Targum to Esther1 - targum/aramaic-targum-to-esther/index.html - token rows 7044 - hints 0 - expected TBD 7044
3. Aramaic Targum to Job1 - targum/aramaic-targum-to-job/index.html - token rows 10377 - hints 0 - expected TBD 10377
4. Aramaic Targum to Lamentations1 - targum/aramaic-targum-to-lamentations/index.html - token rows 2895 - hints 0 - expected TBD 2895
5. Aramaic Targum to Proverbs1 - targum/aramaic-targum-to-proverbs/index.html - token rows 7703 - hints 0 - expected TBD 7703
6. Aramaic Targum to Psalms1 - targum/aramaic-targum-to-psalms/index.html - token rows 24786 - hints 0 - expected TBD 24786
7. Aramaic Targum to Ruth1 - targum/aramaic-targum-to-ruth/index.html - token rows 2139 - hints 0 - expected TBD 2139
8. Aramaic Targum to Song of Songs1 - targum/aramaic-targum-to-song-of-songs/index.html - token rows 5621 - hints 0 - expected TBD 5621
9. Targum Jerusalem1 - targum/targum-jerusalem/index.html - token rows 16311 - hints 0 - expected TBD 16311
10. Targum Jonathan on Amos1 - targum/targum-jonathan-on-amos/index.html - token rows 2346 - hints 0 - expected TBD 2346
11. Targum Jonathan on Deuteronomy1 - targum/targum-jonathan-on-deuteronomy/index.html - token rows 19294 - hints 0 - expected TBD 19294
12. Targum Jonathan on Exodus1 - targum/targum-jonathan-on-exodus/index.html - token rows 22329 - hints 0 - expected TBD 22329
13. Targum Jonathan on Ezekiel1 - targum/targum-jonathan-on-ezekiel/index.html - token rows 20726 - hints 0 - expected TBD 20726
14. Targum Jonathan on Genesis1 - targum/targum-jonathan-on-genesis/index.html - token rows 27751 - hints 0 - expected TBD 27751
15. Targum Jonathan on Habakkuk1 - targum/targum-jonathan-on-habakkuk/index.html - token rows 973 - hints 0 - expected TBD 973
16. Targum Jonathan on Haggai1 - targum/targum-jonathan-on-haggai/index.html - token rows 633 - hints 0 - expected TBD 633
17. Targum Jonathan on Hosea1 - targum/targum-jonathan-on-hosea/index.html - token rows 3463 - hints 0 - expected TBD 3463
18. Targum Jonathan on I Kings1 - targum/targum-jonathan-on-i-kings/index.html - token rows 13651 - hints 0 - expected TBD 13651
19. Targum Jonathan on I Samuel1 - targum/targum-jonathan-on-i-samuel/index.html - token rows 14224 - hints 0 - expected TBD 14224
20. Targum Jonathan on II Kings1 - targum/targum-jonathan-on-ii-kings/index.html - token rows 12802 - hints 0 - expected TBD 12802

## Validators
- node scripts/validate_route_hud_page.mjs --page <20 Batch66 pages> | timeout 120000ms | passed: Route HUD page validation passed for 20 page(s).
- git diff --check -- <20 Batch66 pages> | timeout 60000ms | passed: no whitespace errors
- node <Batch66 source/config/asset guard> | timeout 60000ms | passed: 20 pages; 222078 token rows; 0 configured hint rows; 222078 expected quiet TBD rows
- node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch66-flagship-render-staging-packet-2026-06-07.json','utf8')) | timeout 30000ms | passed: packet JSON parsed after write

## A14 Next Action
- Review Batch66 Targum page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can close remaining Targum page targets next.

## Boundary
render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition
A14 reviews/stages/pushes Batch66 Targum or returns exact blocker; Agent 10 can continue to Targum closure after checkpoint or explicit continuation.
