R = /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/pt
T = R/reader/tools
S = /home/user/mashiachsonyosef.github.io/wip/2026-11-10/round-scripts
Every "verify" command runs from R/reader unless it says otherwise.

A. FINDINGS

1. bug. T/project-lattice-v12-v1.mjs:329, 348-354 (also 447-450).
What: a pooled reading's carriers are matched by as-written lowercase text, while the pool groups by printed form, so the leaders `o.m`, `o.x` and `o.c` are baked from an incomplete carrier set.
Evidence: `readingsOfRow ... map((t) => t.toLowerCase())` and `const key = grp.text.toLowerCase()`; `rowLeader` in the same file (405) already uses `readingKey`. Recomputing from the store and the 39 sidecars reproduces all 180,273 baked `o.m` and `o.x` exactly. With carriers taken by `readingKey`, 9,188 `o.m` differ (1,050 in the reading, 8,138 in the credit) and 7,628 `o.x` differ (1,063 and 6,565). Example, Amos עֶ֑דֶן: the group «Eden» is carried by Strong's «Eden.» (1890, VOWEL_MATCH); the match drops it, so `o.m` is «Eden , a place in Mesopotamia».
Matters: zone.html grades a group by the best tier of all its records (`tierOf`) and reads `o.x` for the line under the Masorah "letters" position and `o.m`/`o.c` under the lattice orders. Line and first pill disagree, or the chip credits the wrong source and year.
Verify: `grep -n "toLowerCase\|readingKey" tools/project-lattice-v12-v1.mjs`; then `node -e 'const s=JSON.parse(require("zlib").gunzipSync(require("fs").readFileSync("data/zones/amos.lattice.bin")));console.log(s.grades["עֶ֑דֶן"].o.m)'`.
Confidence: high.

2. bug. T/regloss-zone.mjs:107, 271-282.
What: regloss never re-derives `gloss_orders.characters` and `gloss_orders.corpus`; they stay as build-zone laid them on an older store.
Evidence: `const { table: gloss, counts, sha256: baseSha256 } = store.tableFor([...cells])` discards `deltas`, which tableFor computes on every run. Non-shipped columns only lose keys with no route. 39 book zones were built on store f28629cb1f1a; the store is now 90d9eb8e7082. Over the 40 book zones, measured against today's projection:
- characters: 47,038 entries held, 68,444 wanted, 27,703 keys missing, 29 with another reading.
- corpus: 4,583 held, 699 wanted, 135 missing, 68 with another reading, 171 that override the line with a reading the order no longer leads with.
Matters: zone.html `applyGlossOrder` lays these columns over the line while the card sorts live. That is the disagreement the tool's header says it exists to remove. On the 39 books it is masked while "only this pointing" reads the sidecar. On Tikkunei Zohar (no sidecar) 1,265 of 97,283 glossed words read a line under "characters" that is not that order's leader. check-card-opens-on-the-line-v1 opens five words.
Verify: `node --input-type=module -e 'import{readFileSync as r}from"node:fs";import{gunzipSync as g}from"node:zlib";import{openRouteStore as o}from"./tools/gloss-store-v1.mjs";const z=JSON.parse(g(r("data/zones/amos.bin")));const d=o("data/route-store").tableFor(Object.keys(z.gloss)).deltas.characters;const c=z.gloss_orders.characters;console.log(Object.keys(c).length,Object.keys(d).length,Object.keys(d).filter(k=>!(k in c)).length)'` prints `527 910 472`.
Confidence: high on the records, medium on how often a reader meets it.

3. bug and silent-failure. T/build-front-door-v1.mjs:3491-3513; S/finish.sh:28.
What: the old-address pages are wrong, and the round switches them off by passing a file that does not exist.
Evidence: the target is resolved on the shelf, but `const b = books.find((x) => x.slug === target); if (!b) { ...heldPage... }` looks only in the plan tier (`plan.works` holds genesis alone). So /1kings, which points at i-kings, gets "the work behind it is not being served". The second row's target has no zone in this checkout, so line 3501 throws "refusing a redirect to nowhere" at the very end of the run. finish.sh passes `--history data/none.json`; `existsSync(HISTORY)` is false and the block is skipped without a word. R/1kings/index.html is tracked, was last written on 2026-11-06, wears the old palette (`#e9e0cb`) and says I Kings is not served. deploy-root has no 1kings.
Matters: a published address tells readers a served book is withheld. The invocation the tool's own header gives cannot finish in this checkout. T/check-clean-address-v1.mjs:630-643 has the same plan-tier blind spot and is in no chain.
Verify: `sed -n '20,26p' ../1kings/index.html`; `grep -n history S/finish.sh`.
Confidence: high; the throw is by reading, not by running.

4. bug. T/build-chain-book-v1.mjs:214-223.
What: scribal marks are counted as words with no reading, and a ketiv/qere word gets no links.
Evidence: `words += 1` for every entry including `w.mark`; `const key = String(w.k ?? "")`, and a pair carries `w.w` with no `w.k`; `if (pool.length) linked += 1; else bare += 1`. R/chain/amos/index.html prints "2,221 words · 2,037 carry a reading · 184 carry none". Of the 184, 179 are marks and 2 are the pairs at 8:4 and 8:8, whose halves are both glossed in the zone. The zone's own counts give 3 (c0_on 2,042, glossed_words 2,039).
Matters: the custody page's headline is off by its own standard ("a word missing, a link moved, a count off"). check-chain-book-v1 copies the same walk.
Verify: `grep -o '<p class="nums">[^<]*' ../chain/amos/index.html | head -1`.
Confidence: high.

5. bug. T/build-chain-book-v1.mjs:231-233.
What: "the oldest carrier" is chosen by the source's edition year, which 135 of 146 sources do not have.
Evidence: `y: Number.parseInt(ms[m].sourceYear, 10)`. Only 11 sources carry a numeric `sourceYear` (2007 to 2026); the rest hold `S_NO_SOURCE_YEAR`. The card (zone.html `EARLIEST_FIRST`), gloss-m-v1.mjs:52-67 and project-lattice all use the row's wording year `row[4]`. In Amos 246 of 1,062 leading links and 3,345 of 34,136 links name another source: for «speak» the chain prints MACULA (2022) where the oldest wording is Strong's 1890. The same record takes its `y` from row years.
Matters: the page says "the label of the oldest source carrying that reading". T/check-chain-book-v1.mjs:126-128 repeats the same sort, so the check agrees with the bug.
Verify: `grep -n sourceYear tools/build-chain-book-v1.mjs tools/check-chain-book-v1.mjs`.
Confidence: high.

6. duplicated-rule, drifted. T/build-front-door-v1.mjs:544-567 and 572-591, against T/gloss-m-v1.mjs:52-67 and T/gloss-store-v1.mjs:68-69.
What: the door has its own `titleReading` and `glossSource`, and both still match a reading as written.
Evidence: `String(x).trim().toLowerCase() === want` and `x.toLowerCase() === want`; the store has pooled by `readingKey` since 7 November and gloss-m follows it. On the built door, Amos's chip reads "attested: Kaikki machine-readable Hebrew dictionary from English Wiktionary" because Strong's «Amos.» is not counted; 15 of 40 chips name another source than the printed-form rule gives. The hover on Ecclesiastes's «Preacher» credits BDB (`data-m="M5"`) where the zone's own gloss_m credits Strong's 1890; Exodus likewise.
Guard: no check names either function.
Verify: `grep -o 'href="/amos" title="open this book">.\{0,400\}' ../index.html`.
Confidence: high.

7. bug. T/regloss-zone.mjs:343-347.
What: line weights are counted under `zone.sections` only, so every commentary zone's switch prices in lines are zero.
Evidence: the same file walks `zone.units` at 74-76, 99-100 and 140-142; the weights loop does not. Across 21 commentary zones and 915 priced sets: changes 94,035, darkens 58,914, `lines_change` 0, `lines_bare` 0. The record's own text says these "count the positions on this book".
Matters: the rail can price a switch at 0 lines when it moves thousands of forms.
Verify: `node -e 'const z=JSON.parse(require("zlib").gunzipSync(require("fs").readFileSync("data/zones/amos.commentary.bin")));const s=Object.values(z.emitted_from.toggles.sources.joint.sets);console.log(s.reduce((n,x)=>n+x.changes,0),s.reduce((n,x)=>n+x.lines_change+x.lines_bare,0))'` prints `3078 0`.
Confidence: high.

8. bug. T/project-lattice-v12-v1.mjs:303-306, 352, 432, 452.
What: one record per pointed surface is kept from its first verse, but the citation list belongs to the verse.
Evidence: `if (!rg || !list || grades[m.surface]) continue;` then `n: names` and `o.c`. In the lattice input the grade never varies per surface (0 cases in Amos, Jonah, Ruth), and `names_this_verse` does: עָמ֔וֹס is [0] at 1:1, [1] at 7:8, [] at 7:11. In Amos 42 of 739 occurrences of repeated surfaces carry a list that is not theirs (32 are told a card cites here, 8 lose one); Jonah 8, Ruth 18.
Matters: under "cites here" the card and line at 7:11 lead with a reading that cites 1:1. Header rule 4 justifies keying by surface with "the grade ... repeats", which holds for the grade only.
Verify: the sidecar's `grades["עָמ֔וֹס"].n` is `[0]`; compare two lines of positions-amos-v12.jsonl.gz with that surface.
Confidence: high.

9. silent-failure. S/finish.sh:8; S/pipeline.sh (no `set -e`); S/regloss-bake.sh:10; S/reproj.sh:9.
What: a failed stage does not stop the round.
Evidence: `node tools/bake-search-index-v1.mjs > /dev/null && node tools/build-chain-book-v1.mjs --index ...` runs under `set -euo pipefail`, and bash does not exit on a failure left of `&&`. pipeline.sh only greps non-zero lines out of all.log. A refused regloss or projection leaves the old zone or sidecar in data/zones, and finish.sh re-hashes and ships it. reproj.sh skips a book with no lattice file without a line.
Matters: FINISH-OK can print with the previous search index, no chain index, or one book on the old store.
Verify: `bash -c 'set -euo pipefail; false && true; echo still'` prints `still`.
Confidence: high.

10. bug, non-determinism. T/emit-lane-state-v1.mjs:132 and 81-82; T/emit-ledger-index-v1.mjs:99.
What: wall-clock values go into shipped records, and the shelf count describes the build machine.
Evidence: `built_at: new Date().toISOString()`; in the last 20 commits touching data/lane-state-v1.json the only changed line is `built_at`. `emitted_on: new Date().toISOString().slice(0, 10)` is the UTC date, not the round's `--stamp` (emit-pointing-grade-recount does the same). `zonesOnDisk()` and `zonesServed()` use the cwd-relative default while the sidecars are read module-relative (57, 85, 102). lane-state says `zones_on_disk: 40, withheld: 0`; the gate receipt in the same commit says `zones_on_the_shelf: 3481`.
Matters: a diff every round with nothing changed; a peer lane reads "nothing withheld"; run from another directory it writes zeros and exits 0. check-lane-state-v1 recomputes from the same disk.
Verify: `git -C .. log -p -5 -- reader/data/lane-state-v1.json | grep '^[-+] '`.
Confidence: high.

11. bug. T/regloss-zone.mjs:299-322 (312-316).
What: the re-projection receipt is a diff against the previous run, so a second run on the same store erases the record of the move and changes every zone's bytes once more.
Evidence: `from_gloss_table_sha256: previous.gloss_table_sha256`, `forms_before`, `had_m_before`. All 61 re-projected zones now carry `from_gloss_table_sha256` equal to their own `gloss_table_sha256` and `forms_whose_first_reading_moved: 0`, on the day the store moved. Separately, `distinct_forms_bare` counts every unpublished run form: 120,107 over 61 zones, 59,054 of them whole run forms no dictionary wrote.
Matters: header rule 4 ("the move is legible in the file") does not survive a re-run. Rule 1's "same bytes" holds per input zone, not per round, so pins and gate hashes move twice.
Verify: `node -e 'const g=JSON.parse(require("zlib").gunzipSync(require("fs").readFileSync("data/zones/amos.bin"))).emitted_from.gloss_layer;console.log(g.reprojected.from_gloss_table_sha256===g.gloss_table_sha256,g.reprojected.forms_whose_first_reading_moved)'` prints `true 0`.
Confidence: high.

12. stale-comment and structure. T/pipeline-manifest-v1.mjs:36-39, 118-147 (regex at 124).
What: the manifest written by the round's last step describes build.sh, which the round does not run.
Evidence: R/reader/PIPELINE-MANIFEST.md ("Read on 2026-11-10") says "6 published artifacts · 6 with a build step" and "`build.sh` calls 19 of the 120 tools". Under "Not called by any build stage" it lists regloss-zone, project-lattice-v12-v1, bake-witnessed-order-v1, bake-search-index-v1, build-chain-book-v1, repin-zone-store-v1 and emit-ledger-index-v1. It credits `data/zones/genesis.bin` to build-zone.mjs, whose inputs are not on this machine. Line 124 still expects `(-commentary)?\.bin`; the suffix has been `.commentary.bin` since 2 September, so a commentary row would read "no build step".
Matters: the header claims "this reads the pipeline instead of describing it", and the README the door writes sends a newcomer to this file and to `./build.sh`.
Verify: `sed -n '/^## Stages/,$p' PIPELINE-MANIFEST.md | grep -E "regloss|project-lattice|repin"`.
Confidence: high.

13. bug. T/emit-ledger-index-v1.mjs:74-81, 92-93.
What: `writes` is every `data/*.json` name a tool's source mentions.
Evidence: `by_tool["regloss-zone.mjs"]` holds `why: "...writes no record into data/ itself"` beside `writes: ["source-corpus-v1.json"]`. build-front-door "writes" 20 records it only reads. zone-store-v1.json counts as claimed by 9 tools, while its real writer, repin-zone-store-v1.mjs, sits in the undeclared list.
Matters: `records_no_tool_in_this_tree_claims_to_write` cannot name a record that any declared tool merely reads, and "what updates this record" is answered wrongly per tool.
Verify: `node -e 'console.log(JSON.parse(require("fs").readFileSync("data/ledger-index-v1.json","utf8")).by_tool["regloss-zone.mjs"])'`.
Confidence: high.

14. silent-failure. T/build-chain-book-v1.mjs:188; T/emit-lane-state-v1.mjs:214; T/emit-ledger-index-v1.mjs:59 (10 tools in the tree, 4 of them run by finish.sh).
What: the main guard is a string compare.
Evidence: ``if (import.meta.url === `file://${process.argv[1]}`)``. Node percent-encodes and realpaths the URL but not argv[1]: `/a b/x.mjs` becomes `file:///a%20b/x.mjs`. finish.sh sends these tools' output to /dev/null or a log.
Matters: from a checkout path with a space or a symlink (the README says to re-point S; macOS /tmp is one) the tool exits 0 having written nothing, and the old chain, lane state and ledger index ship.
Verify: `node --input-type=module -e 'import{pathToFileURL}from"node:url";console.log(pathToFileURL("/a b/x.mjs").href)'`.
Confidence: high on the mechanism; it does not bite on this path.

15. bug, non-determinism. T/build-chain-book-v1.mjs:140, 148, 160, 282, 297-298; T/pipeline-manifest-v1.mjs:150.
What: output follows the process locale.
Evidence: `.toLocaleString()` with no locale, in pages whose sha256 the chain index prints as custody; `localeCompare` orders the rule table. On this Node `LC_ALL=de_DE.UTF-8` prints "1.234.567", and under a Czech collation 50 of 194 rule ids change position. build-front-door uses `toLocaleString("en-US")` (114).
Matters: same inputs, different bytes on another machine. check-chain-book-v1.mjs:167 formats with the checker's own locale.
Verify: `LC_ALL=de_DE.UTF-8 node -e 'console.log((1234567).toLocaleString())'`.
Confidence: high; LANG is empty here, so en-US today.

16. silent-failure. T/gloss-store-v1.mjs:112.
What: a missing shard is read as an empty shard.
Evidence: `existsSync(p) ? JSON.parse(...) : {}`. index.json holds `counts.shards: 256` and `keys: 124901`, and nothing in these files compares. T/emit-store-manifest-v1.mjs:36-46 pins whatever is present.
Matters: after a partial copy every key of that shard is NO_EXACT_ROUTE, so regloss, bake, chain and door write normal-looking records with about 1 word in 256 bare, counted as catalog silence.
Verify: read line 112; `grep -n "counts" tools/check-store-pinned-v1.mjs` finds nothing.
Confidence: medium; I did not read every check.

17. silent-failure. T/build-front-door-v1.mjs:364, 382, 393, 405, 482, 1053, 2880, 3439; T/bake-search-index-v1.mjs:219.
What: absent or unreadable records become quiet defaults.
Evidence: `OVERLAY_COUNTS = (() => { try {...} catch { return null; } })()` drops the overlay-counts meta from every page. `CORPUS_CLASS` returns `{}` when data/source-corpus-v1.json is missing, where regloss-zone.mjs:340 refuses for the same record. Grouping, order, work status and witnesses default to none. In the search index `try { oix = JSON.parse(...) } catch { continue; }` drops a whole overlay (112,078 rows today), and the route shards have no count check where the dictionary store has one (112). The catches at 1562 and 1577 cannot fire: the same files are read earlier without one.
Matters: a door with no filing, order or status line, or a search index without Jastrow, with exit 0.
Verify: `grep -n "catch {" tools/build-front-door-v1.mjs tools/bake-search-index-v1.mjs`.
Confidence: medium.

18. dead. Mostly T/build-front-door-v1.mjs.
- 165-184 `gateNotice`, 882 `stampRows`, 1052-1080 `sectionStamp` (its `#sectstamp` rules still ship in every door page).
- 1698 `pocLink` (constant false), 1715 `censusDemoHtml`, 1752 `censusPointer`, 1757 `refPointer`, 2700 `titleCase`, 3147-3184 `posSection` and `benchHtml`, 53 `K_RULE_ID`.
- 1700 `demoHtml`: both pages pass `demo: false`, yet `demo` still costs a zone read and widens the allow-list in `scrubTitles` (2965).
- T/project-lattice-v12-v1.mjs:267 and 504 `wordsTouched` ("for the recount", never read).
- T/gloss-store-v1.mjs:212 `routeText`; T/zones-on-disk-v1.mjs:84-85 filter shard and w-top names that live in data/route-store.
Evidence: each name occurs once in its file; the built door has no `id="sectstamp"`, `gate-notice` or `census-demo`.
Verify: `grep -c "\bsectionStamp\b" tools/build-front-door-v1.mjs` prints 1.
Confidence: high.

19. duplicated-rule. Row division and printed form, typed three and four times.
- Division: T/gloss-store-v1.mjs:136-149 `readingsOf`; T/bake-search-index-v1.mjs:91-105 `pills`; zone.html:2760 `readingsOfRow`.
- Printed form: gloss-store:68 `printedForm`; bake-search-index:71 `joinSpan`; build-front-door:3284 `spanJoin`; zone.html:4416.
Evidence: gloss-store's comment at 350-353 says a consumer should ask the store "instead of re-implementing it". bake-search-index reads `isNoDerivs` out of zone.html but retypes the division. The page's pool and `pills` keep a no-derivatives text whole (zone.html:6887); `readingPool` and `readingsOf` have no such rule.
Guard: check-search-v1 (fold and pills), check-page-agrees-with-store-v1 (pool), check-pointing-grade-v1 P1 (compares the vowelForm, isPointed and gradeRow copies with zone.html's source). No no-derivatives source is in the store today, so the missing rule is latent.
Confidence: medium.

20. duplicated-rule, drifted. T/build-front-door-v1.mjs:2990-2993 against 195, 3237, 3467, 3539; T/build-chain-book-v1.mjs:63, 185.
What: the palette and the site name are typed again.
Evidence: the 404 page has `<title>Not here · fireandhail.com</title>` and `color:#2b2420;background:#efe6d3 ... a{color:#5a3e8f}`. Everywhere else the palette is `#ebdec3`, `#642460`, `#753c6d`, `#a06c10`, and SITE_NAME is read from CNAME (the comment at 239-250 explains why). CNAME is parsed two ways: `.split(/\s+/)[0]` in the door, `.trim()` in the chain.
Guard: none found for the 404, held, moved or reference pages.
Confidence: high.

21. stale-comment. Six places.
- T/regloss-zone.mjs:258-263 says the drop "is appended ... and never replaced"; T/bake-witnessed-order-v1.mjs:126 replaces the witnessed receipt whole every round.
- T/pointing-grade-v1.mjs:6 says "computed at display time and never stored"; project-lattice bakes leaders from it.
- T/build-front-door-v1.mjs:2813-2816 gives "71,734 bytes of CSS ... 244,582 bytes of script"; the files are 184,725 and 889,254 bytes. The header (38-41) documents four flags of about twenty, and not `--history`.
- T/build-chain-book-v1.mjs:219-220 and 308 say "the same call the page makes" and "at the same moment, by the same code"; the page's default is the pointing filter with names leading, and the chain is a separate step.
- T/bake-witnessed-order-v1.mjs:46 says "every input's sha256"; the store is named by version only.
- The README the door writes (2766-2775) says `./build.sh <mirror> ...` and "the same inputs give the same bytes".
Confidence: high.

22. bug, latent. T/project-lattice-v12-v1.mjs:290-298, 492.
What: a verse that is held keeps the previous projection's `hg`, `hm`, `ld` and `pc`.
Evidence: the deletes sit inside `on.forEach`, after `if (!proved) { ...; continue; }`, and the input zone always carries the last run's fields. `verses_held` and `verses_absent_from_lattice` are 0 on all 39 books today.
Matters: when a verse stops proving, its words keep credits from an older store while the receipt counts it as held whole.
Confidence: medium.

23. structure. Copy-pasted across the round, beyond `arg`/`die` and the post_build block.
- Zone read and write (gunzip and parse; stringify and gzip level 9) is typed in 9 of the 14 files, with no atomic write. build-front-door parses each served zone up to four times (732, 1012, 1567, 3288).
- "Every word of a zone": four copies in regloss alone (68-76, 98-100, 139-142, 344-347; the last is finding 7), project-lattice 140, build-chain-book 214-217 (finding 4), build-front-door 1604 and 3319.
- "Rows carrying a reading, oldest first": gloss-m-v1 three times (52-67, 97-106, 109-117), build-front-door twice, project-lattice twice (355-365, 396-415), build-chain-book, check-chain-book. Findings 1, 5 and 6 are this rule.
- The shelf listing: zones-on-disk `zonesServed`, build-front-door 106-109 and 801, repin 8, check-c0-refusals 153, check-bookword-count 84, the globs in reproj.sh and regloss-comm.sh, and twelve book names typed in finish.sh:7.
Confidence: high.

24. structure. S/finish.sh:6, 14-26, 32; T/build-front-door-v1.mjs:2862-2870.
What: the round keeps state outside the tree and never cleans.
- finish.sh always installs `$S/v26/proj/zones/*.bin` over data/zones, also in a "page-only round"; any tool that rewrote data/zones in between is undone. The README warns about this for restamp only.
- The gate receipt is rebuilt by a Python heredoc that keeps HEAD's `zones_on_the_shelf`, `refused` and `not_yet_stamped` and swaps the hashes, because check-c0-refusals --write cannot reproduce them from 40 zones.
- `cp -a deploy-root/. ..` never removes; `1kings/` and `targum-1kings/` are the leftovers.
- The engine swap is not atomic: old `engine-*` files are unlinked and new ones written before any page, ten `throw`s follow (2893-3546), and three more tools run before the copy. A refusal leaves the site root's pages asking for an engine that was just deleted.
Confidence: high.

25. bug, latent and low. T/build-front-door-v1.mjs:2925, 2931, 2934; T/bake-witnessed-order-v1.mjs:100.
- Replacement strings carry page data: `.replace(slot, ...)` inserts every reading of a chapter where `$&` and `$'` are patterns; line 2926 already uses a function. No `$` occurs in any gloss or in 652,954 store rows today.
- The bake judges "not a key of this zone" against the table regloss is about to replace. No effect today: the 106,465 baked readings equal what a bake against the current zones gives.
Confidence: low.

B. DETERMINISM

- regloss-zone.mjs: pure in (input zone, store, source-corpus record, --stamp). Not a fixed point over the round: the receipt at 306-321 and `had_m_before` at 294 are diffs against the input zone, so the first and second run after a store change differ.
- project-lattice-v12-v1.mjs: pure in (zone, lattice files, stem files, store, --stamp); map and object order follow input file order; stable after one pass.
- gloss-store-v1.mjs: pure; keys and `by` sorted; ties fall to row order under a stable sort. A missing shard reads as empty (112).
- pointing-grade-v1.mjs: pure.
- bake-witnessed-order-v1.mjs: pure in (zone, shipped file, store, --stamp).
- build-chain-book-v1.mjs: no. The pages format numbers in the process locale (140, 148, 160, 282, 297-298), the canonical link depends on CNAME being present (185), and the sidecar records the `--store` path as typed (262). chain-v1.json.gz itself is locale-free.
- bake-search-index-v1.mjs: pure in (both stores, overlays, span store, book order, zone.html); listings sorted.
- repin-zone-store-v1.mjs: a function of the bins on this disk and of the previous record (pins for absent bins carry forward).
- emit-store-manifest-v1.mjs: pure in the store directory.
- emit-lane-state-v1.mjs: no. `built_at` (132); the shelf block follows the cwd and the local zones (81-82).
- emit-ledger-index-v1.mjs: no. `emitted_on` (99); the rest is a function of tool sources and record names.
- pipeline-manifest-v1.mjs: row order by `localeCompare` in the process locale (150); tool order as `readdirSync` returns it (36; sorted on this machine); cwd-relative.
- zones-on-disk-v1.mjs: lists sorted; depends on cwd and on ZONES_DIR, SERVE_PORT, SERVE_BASE (21-23).
- build-front-door-v1.mjs: no clock, numbers in en-US (114), listings sorted, one `localeCompare` tie-break (1389). Depends on CNAME and the mark file (252-281), on four child tools it runs (340-354), and on which zones are on disk. It never deletes old output.
- All of them: gzip bytes carry no timestamp, and re-gzipping a stored zone on this Node reproduces it. The bytes, and so every pin, are tied to the Node zlib build and its OS byte.

C. HEALTH, AND THE FIRST THREE CHANGES

- The reading rule lives in one module and is well guarded. The tools that only read, cut or hash (gloss-store, pointing-grade, bake-witnessed-order, bake-search-index, the store manifest, repin) are sound and reproducible.
- The damage is where a rule was typed again: reading identity, oldest carrier, the walk over a zone's words, the shelf listing. The changes of 6 to 10 November reached some copies and not others, and two checks copy the builder's own mistake.
- The projections record a diff against the last run, so a zone's bytes depend on how many times the round ran since the store moved.
- The round is outside the tree's own accounting: scratch scripts, a hand-merged receipt, swallowed failures and a bypassed refusal, while the manifest and README describe build.sh.
- build-front-door does eight jobs in 3,554 lines, about 300 of them dead, and fails open through optional records.

First three changes:
1. One `carriersOf(key, text)` in gloss-store (rows matched by `readingKey`, oldest wording year first), used by project-lattice, build-front-door and build-chain-book; then re-project. This closes findings 1, 5 and 6.
2. Make regloss a whole projection: keep the `deltas` from the tableFor call it already makes (with `corpusOf`), walk words through one sections-and-units helper, and write the receipt against the store version, not the previous run. This closes 2, 7 and 11.
3. Put the round in the tree as one runner that stops on any failure, takes `--stamp` once, cleans deploy-root, drops the fake `--history` and the wall-clock fields, and is what pipeline-manifest reads. This closes 3, 9, 10, 12 and 24.

Method: nothing under R was edited and `git status` there is clean. No tool, browser or server was run. Measurements were read-only `node` snippets that imported two side-effect-free modules (gloss-store-v1.mjs, pointing-grade-v1.mjs). One helper script was written to the session scratchpad, outside the checkout, for the first measurement and then deleted.