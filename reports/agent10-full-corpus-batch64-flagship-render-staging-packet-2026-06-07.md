# Agent 10 Full-Corpus Batch64 Flagship Render Staging Packet - 2026-06-07

status: BATCH64_13_READY_SECOND_TEMPLE_CLOSURE_DIRECT_RENDER_CONTRACT_STATIC_VALIDATED

## Scope
- latest pushed baseline: 2382922fc / Batch59 Midrash
- corpus family: Second Temple closure
- page rule: all Second Temple page targets missing `reader_layout_mode=prehud_rows`
- shared files changed: none
- Featured additions: none; Orot remains only Featured

## Counts
- pages: 13
- token rows: 249147
- configured hint rows: 0
- expected quiet TBD rows: 249147

## Pages
1. Against Apion1 - second-temple/against-apion/index.html - token rows 440 - hints 0 - expected TBD 440
2. Ben Sira1 - second-temple/ben-sira/index.html - token rows 9571 - hints 0 - expected TBD 9571
3. Book of Jubilees1 - second-temple/book-of-jubilees/index.html - token rows 27464 - hints 0 - expected TBD 27464
4. Book of Judith1 - second-temple/book-of-judith/index.html - token rows 5514 - hints 0 - expected TBD 5514
5. Book of Tobit1 - second-temple/book-of-tobit/index.html - token rows 4306 - hints 0 - expected TBD 4306
6. Letter of Aristeas1 - second-temple/letter-of-aristeas/index.html - token rows 11085 - hints 0 - expected TBD 11085
7. Megillat Ta'anit1 - second-temple/megillat-taanit/index.html - token rows 5508 - hints 0 - expected TBD 5508
8. The Book of Maccabees I1 - second-temple/the-book-of-maccabees-i/index.html - token rows 13749 - hints 0 - expected TBD 13749
9. The Book of Maccabees II1 - second-temple/the-book-of-maccabees-ii/index.html - token rows 10196 - hints 0 - expected TBD 10196
10. The Book of Susanna1 - second-temple/the-book-of-susanna/index.html - token rows 909 - hints 0 - expected TBD 909
11. The Testaments of the Twelve Patriarchs1 - second-temple/the-testaments-of-the-twelve-patriarchs/index.html - token rows 13412 - hints 0 - expected TBD 13412
12. The War of the Jews1 - second-temple/the-war-of-the-jews/index.html - token rows 141011 - hints 0 - expected TBD 141011
13. The Wisdom of Solomon1 - second-temple/the-wisdom-of-solomon/index.html - token rows 5982 - hints 0 - expected TBD 5982

## Validators
- node scripts/validate_route_hud_page.mjs --page <13 Batch64 pages> | timeout 120000ms | passed: Route HUD page validation passed for 13 page(s).
- git diff --check -- <13 Batch64 pages> | timeout 60000ms | passed: no whitespace errors
- node <Batch64 source/config/asset guard> | timeout 60000ms | passed: 13 pages; 249147 token rows; 0 configured hint rows; 249147 expected quiet TBD rows
- node -e JSON.parse(fs.readFileSync('reports/agent10-full-corpus-batch64-flagship-render-staging-packet-2026-06-07.json','utf8')) | timeout 30000ms | passed: packet JSON parsed after write

## A14 Next Action
- Review Batch64 Second Temple closure page packet and changed page files.
- Stage/commit/push only if A14 validation agrees.
- Add/verify normal corpus links and deploy carry rules in A14 lane; do not add Featured entries.
- Return checkpoint or exact blocker; A10 can select the next corpus family after Second Temple closure.

## Boundary
render/preHUD staging evidence only; no QA/source/license/legal/Definition/product/answer/accepted-text acceptance; no publication/release/public-runtime acceptance.

## Stop Condition
A14 reviews/stages/pushes Batch64 Second Temple closure or returns exact blocker; Agent 10 can continue to the next explicit corpus family after checkpoint or explicit continuation.
