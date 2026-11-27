# Pass B: the footing. Every source pinned by sha256

Helper B, 27 November 2026, on the frozen tree (main at ea6e1ad08e). Nothing was changed; nothing was uploaded. Everything below was measured by machine over the whole population named in each line, unless it says «sample».

## The answer in five lines

- **No recorded hash is wrong.** 1,551 files that carry a recorded sha256 were hashed again today and every one is the recorded bytes. One recorded value names bytes nobody holds (the store index's `declarations_sha256`).
- **The 39 books are the restore's text, byte for byte.** The served zone of every book, its words rejoined at the maqaf, hashes to the `restore_surface_sha256` the rights record names (39 of 39); the 39 restore files on the store are the bytes the zones name; and the restore's words are the collected Sefaria edition's words, but for 31 footnotes the restore lifts, as its receipts count them.
- **Six of the twelve dictionaries were followed back to their provider today**: 10 files fetched from the provider at the commit our own source record names, each the sha256 the corpus lane's receipts record (Strong's Open Scriptures edition, BDB Open Scriptures, the Lexical Index, the unabridged BDB, TAHOT's four files, TBESH). The line under 305,293 of the 305,417 words is TAHOT's.
- **The gaps are in what holds the chain, not in the bytes.** No check re-hashes a book's text against the restore; no dictionary's file as received stands on the store; five served stores carry no pin at all; the record of «pins not kept» is out of date and nothing reads it.
- **Nothing here is a rule of ours acting on a reading.** Every finding of this pass is a footing gap (a link asserted where it could be hashed, or a hash nobody reads). The principle's three classes do not apply; the class column says «footing».

## Summary table

| # | Finding | Places it touches | Standing | Class | Mend, by rule |
|---|---|---|---|---|---|
| 1 | No check recomputes a book's text against the restore's surface hash; the checks read the zone's own flag | 39 books, all 305,417 words | verified (and the bytes are right today) | footing | `check-restore-serve-v1` L1 rejoins and hashes |
| 2 | No dictionary source as received stands on the store; one pin still names a folder that is gone | all 12 Bible dictionaries (373,777 served rows), all 29 families; 2 pinned files unreachable | verified | footing | a pin's store address is held to a listing; the lane stands the received files under `v2/sources/` |
| 3 | Five served stores carry no sha256 pin and no check re-hashes them | 412 served files, 208.5 MB (the dictionary store's 256 shards among them) | verified (the 256 shards are the lane's bytes today) | footing | a manifest per served store, as the route store has |
| 4 | The received file of each dictionary is hashed only inside relay receipts; for 9 families no hash is recorded at all | 20 families have a hash in a receipt, 9 have none (Davidson of the twelve) | verified | footing | a `received` block per family in `dictionary-kinds-v1.json`, held to the receipts |
| 5 | `pins-not-kept-v1.json` is out of date and no check reads it | 52 files named; 40 of them can be had today | verified | footing | derive the record; a check that makes each bridge again |
| 6 | Sefaria's dump is not hashed in the restore's own receipts | 39 books | verified that the hash is absent; the text agreement is measured | footing | the restore receipt and the rights record name the dump by sha256 |
| 7 | `declarations_sha256` in the store index names bytes nobody holds; no tool reads or writes the field | 1 value | verified; what it was a hash of is suspected | footing | drop it, or its owner writes what it reads |
| 8 | The store cannot be built again from its four pinned inputs by the tool its index names | the whole store (653,353 rows) | verified | footing | the index says who writes it now |
| 9 | 150 pins could not be re-hashed (not on the store, too large, or not fetched) | 150 files | named, not a fault | footing | see «could not check» |

The data behind every line: `pins.tsv` (2,143 rows, one per file) and the files under `data/` named below.

`pins.tsv` by standing: 1,551 rows recorded and equal today; 1 recorded and different (finding 7); 141 recorded and not re-hashed; 412 served with no hash recorded (hashed today for the record); 9 sources with no hash recorded and not re-hashed; 29 rows are counts of served rows by family.

---

## The two chains, link by link

### A book (the same for all 39)

| Link | What it is | Where it stands | Hashed, or asserted | Today |
|---|---|---|---|---|
| 1 | Sefaria's dump as published, `dump_small.tar.gz` (2,430,059,192 bytes) | the provider's address; the corpus lane's disk | hashed once, in a relay receipt of 13 November (`data/paseq-place/paseq-v1/receipt-v1.json`, `inputs.edition.archive`): c3b2821e… | not re-hashed (2.4 GB; not on the store) |
| 2 | `texts.bson`, the member of the dump (3,580,067,596 bytes) | the corpus lane's disk | hashed in the same receipt: 433c5aca…; the receipt's check 5 says it is the archive's member | not re-hashed (not on the store) |
| 3 | the restore, `mam-<book>-restored-v5.csv.gz` | store, `v2/ledgers/mam/mam-restore/` | **link 2 → 3 is asserted**: the restore tool (`restore-mam-apparatus-v5.mjs`, in the store's part) opens a path and hashes nothing; its receipts say «local sefaria BSON dump». The file itself is hashed in the zone (`walk.restore_oracle.restore_gz_sha256`) | 39 of 39 fetched and equal |
| 4 | the restore's surface hash (sha256 of every row's surface, each followed by a line end) | the restore's receipt; `data/mam-restore-v5-rights-v1.json` (`restore_surface_sha256`); the zone | hashed three times over, and the serve tool refused the book unless all agreed (6 September) | recomputed from the store's rows: 39 of 39 |
| 5 | the zone we serve, `data/zones/<book>.bin` | the tree | **link 4 → 5 is asserted after the first serve**: the zone says `surface_sha256_reproduced: true` and the checks read that. The zone's bytes are hashed in `serve-gate-receipt-v1.json` and `zone-store-v1.json` | bytes: 40 of 40 and 147 of 147 equal. Text: the served words, rejoined, give the surface hash in 39 of 39 |
| 6 | the line under every word, `data/resting-lines/<book>.json.gz` | the tree | hashed in `chapter-pages-receipt-v1.json`; the record names the sha256 of every file it was read off | 40 of 40 equal; 1,294 of 1,294 files read off are today's bytes |

What fails if the bytes change. Link 5's file: `check-zone-store-v1` (every pin matches its bin), the door (`build-front-door-v1.mjs` refuses a zone that is not the bytes the gate judged), and the resting lines (the door refuses a recording read off other files). Link 3 or 4: **nothing** in the tree. A restore on the store that moved would be noticed only by a tool handed it again; and a zone whose words moved, sealed again by the round, passes every check (finding 1).

### A dictionary (the twelve)

| Family | Rows served | File as received (bytes) | sha256 the lane records | Provider's address and pin | Today |
|---|---|---|---|---|---|
| Strong's, Open Scriptures edition (M9) | 23,726 | `HebrewStrong.xml` (2,749,042) | a628f4f8… | openscriptures/HebrewLexicon at commit 21c9add1… | **fetched from the provider: equal** |
| Strong's, Hebrew Wikisource edition (M14) | 148,404 | 9 wikitext files (9,170,680 in all) | 9 values | 9 page addresses, no revision named | not re-hashed (the host is not reachable from this session) |
| BDB, Open Scriptures | 15,455 | `BrownDriverBriggs.xml` (2,911,253) | 2b52658a… | the same commit | **equal** |
| BDB, unabridged | 8,935 | `unabridged-BDB-Hebrew-lexicon.csv.zip` (6,735,645) and its member (33,717,788) | 056276bd… and 5e865974… | eliranwong/unabridged-BDB-Hebrew-lexicon at commit 6e8326c6… | **equal, both** |
| TAHOT | 91,301 | four files (18,190,455; 24,500,317; 9,540,133; 17,977,518) | e9b8546e… 195fee1d… 84e118a9… f3ded203… | STEPBible/STEPBible-Data at commit b86d26cd… | **equal, all four** |
| TBESH | 2,808 | one file (3,288,045) | 464dccad… | the same commit | **equal** |
| MACULA | 45,095 | `macula-hebrew.tsv` (84,382,719) | 965cb059… | none recorded in the tree (the source record points at a manifest on the lane's disk) | not re-hashed |
| UBS dictionary | 21,732 | `UBSHebrewDic-v0.9.2-en.JSON` (23,110,129) | 1686a25d… (the one received file with a pin of its own: `data/ubs-collocations/PIN.json`) | the pin names a store folder that holds nothing today | not re-hashed |
| SDBH, as HiperBiblia gives it | 14,996 | `hiperbiblia-sdbh.json` (9,095,556) | a865c3e5… | read from a web page | not re-hashed |
| Davidson | 85 | page images read by hand | **none recorded** | a manifest on the lane's disk | not re-hashed |
| The Lexical Index | 139 | `LexicalIndex.xml` (1,782,592) | 8f7a605c… | openscriptures/HebrewLexicon, the same commit | **equal** |
| UHAL | 296 | 80 files | 12767f51… for the set (recipe not in the tree) | a license file on the lane's disk | not re-hashed |
| BiblicalTools | 805 | one file (4,018,670) | aa3fc5c7… | read from a web site | not re-hashed |

Rows of the twelve whose received file was matched to its provider today: 142,364 of 373,777 (38%), and all of STEP's.

After the received file, every family rides on the same links:

| Link | Hashed, or asserted | Today | What would fail |
|---|---|---|---|
| received file → the four inputs of the first store (`…k-r-routes`, `r-identities`, `d-identities`, `m-identities`) | **asserted**: the four files name no source hash (0 sha256 values in `m-identities`); the lane's own audits compare rows with the source (for Strong's: 23,646 routes, 0 unmatched) | the four inputs: fetched from the store, 4 of 4 equal to `route-store/index.json` `inputs` | nothing in the tree |
| the four inputs → the served shards | **recorded, not rebuilt**: 62 store versions in `store_version_history`, each a named step; the rows are accounted end to end by `check-store-continuity-v1` | 261 of 261 store files equal to `store-manifest-v1.json` | `check-store-pinned-v1` for the shards as they stand; nothing ties them back to the inputs but the row arithmetic (finding 8) |
| the lane's lists laid on the store (the relays) | **hashed**: each file kept beside a `PIN.json`, read only through `tools/pinned-v1.mjs` | 205 of 205 files in the tree equal; 62 of 62 that stay on the store fetched and equal | every pin has at least one check that hashes through the pin helper |
| each source's ledger (how its punctuation divides) | **hashed**: `ledgers-v1/manifest.json` and the store index | 86 of 86 equal | `check-ledger-divisions-v1` D2 |

---

## The findings, ranked by how many places they touch

### 1. No check recomputes a book's text against the restore (39 books, every word)

**What I saw.** `tools/check-restore-serve-v1.mjs` L1 (lines 69 to 72) asks that `walk.restore_oracle.surface_sha256` is 64 hex and that `surface_sha256_reproduced === true`: the zone's own word for it. L4 asks that `walk.rights.record_sha256` is 64 hex, and does not hash the record. `check-zone-single-pass-receipts-v1` (lines 250 to 252) asks the same of the same fields. No check file names `restore_surface_sha256` at all (searched all 206). The comparison was made once, by `tools/serve-from-restore-v5.mjs` (lines 87, 88, 101), when each book was served on 6 September; the zones have been projected over many times since by the round.

**What the bytes say today** (`data/books-chain.tsv`, script `scripts/04-books-chain.py`). For each of the 39 books I rejoined the served zone's words wherever a word carries `presentation_join.join_next_without_separator`, hashed the rows as the serve tool does, and compared:

- served zone → surface hash: 39 of 39 equal to `restore_surface_sha256`;
- the store's restore file → the hash the zone names: 39 of 39;
- the store's rows → surface hash → the receipt, the zone, the rights record: 39 of 39, all four the same value;
- every zone's `rights.record_sha256` → the rights record on disk: 39 of 39 (0e66427e…);
- the serve tool on disk → the hash every zone names for it: 39 of 39 (81db5d14…), so the tool has not moved since the books were served.

So the text is right, and it is right by the care of each step, not by a check: a projection that changed one served letter and sealed the zone again would pass the whole suite.

**Cause.** `check-restore-serve-v1.mjs` L1 holds the route «to its own claims», and the claim it reads for the text is a flag.

**Class.** Footing.

**Mend (by rule).** L1 does what the serve did: rejoin, hash, and require the value to equal both the zone's `surface_sha256` and the rights record's `restore_surface_sha256`; L4 requires `record_sha256` to be the sha256 of the record on disk. It reads only the tree and took seconds for all 39 here.

### 2. No dictionary's file as received stands on the store; one pin names a folder that is gone (all 12; 2 pinned files)

**What I saw.** I listed the store afresh today (`data/store-listing-v2-2026-11-27.tsv`: 89,708 objects under `v2/`, 6,295,194,924 bytes, the same as the listing of 24 November line for line; the newest object is of 23 November). The store's top level holds `serving-lane/` and `v2/` and nothing else. Not one of these names is anywhere in it: `HebrewStrong`, `BrownDriverBriggs`, `LexicalIndex`, `UBSHebrewDic`, `macula-hebrew.tsv`, `hiperbiblia-sdbh.json`, `unabridged-BDB`, `en_uhal`, `biblicaltools-2026`, `strongs.wikitext`, `texts.bson`, `dump_small`, `kaikki.org-dictionary`, `hewiktionary-latest`, `jastrow-dictionary-entries`. `v2/sources/` (64,359 objects) holds editions, scans and texts of other works; none of the 29 families' received files.

The received files were under `old-local-999-footsteps/ledgers/work/ldmprs/source-cache/`. The lane's own inventory of 21 November (`v2/ledgers/all/store-free/inventory-v1/outside-v2-by-class-and-folder-v1.tsv`) classes that folder LOCAL_COPY (437,257 objects, 24.11 GB: it stands on the lane's disk), and the store cut of 22 and 23 November removed it. A listing of the prefix `old-local` today returns 0 objects.

`data/ubs-collocations/PIN.json` still says, three times, that UBS's own file and the catalog's route file are «kept» at `r2:mishkan/old-local-999-footsteps/…/ubs-sdbh-hebrew-2026-07-15/`. `tools/derive-ubs-collocations-v1.mjs` needs both on its command line, and PIPELINE.md says the category is derived again after every new list of name rows.

`data/store-path-map-v1.json` (`after_the_cut.checked`) says «addresses this repository names: 85, addresses not found: 0». Its own words give the reason it missed these: it classified «every `r2:mishkan/v2/` address». The tree's records name 11 addresses outside `v2/`; the 8 of the old layout are covered by the map's `folders`; these 3 are covered by nothing.

**Count.** The received file of all 12 Bible dictionaries (373,777 served rows) and of every other family cannot be hashed by anyone who has the store and not the lane's disk. Two pinned files (23,110,129 and 2,513,081 bytes) are named at an address that does not exist.

**Cause.** The cut kept what `v2/` held; the dictionaries' source cache was never moved under `v2/sources/`. The path map's check asks only about `v2/` addresses.

**Class.** Footing. (This pass's briefing says «sources as received are under `v2/sources/`»; for the dictionaries that is not so.)

**Mend (by rule).** (a) The path map's check classifies every `r2:mishkan/` address a pin or record names, not only those under `v2/`, against a listing given on its command line. (b) The corpus lane stands the twelve's received files under `v2/sources/` (about 220 MB before compression, by the sizes above), or each pin says «on the corpus lane's disk only». The owner and the corpus lane decide which; the store's ceiling is theirs.

### 3. Five served stores carry no pin (412 files, 208.5 MB)

**What I saw** (`data/unpinned-data-files.tsv`, script `scripts/15-unpinned-files.py`: every file under `reader/data` against every sha256 recorded in the tree's JSON, in the zones' headers, in the resting lines, in the two receipts at the site's root and in the tools).

| Store | Files with no recorded sha256 | Bytes | A check that re-hashes it |
|---|---|---|---|
| `data/dictionary-store/shards/` (whole entries of the dictionaries) | 256 of 256 | 65,775,576 | none |
| `data/piece-store/` (TAHOT's and MACULA's pieces at each place) | 40 of 41 | 126,938,740 | none (`check-piece-store-v1` hashes its index only) |
| `data/source-suggested/` | 39 of 40 | 11,506,467 | none |
| `data/hud-toggles/` | 39 of 40 | 3,840,171 | none |
| `data/run-cards/` | 38 of 39 | 430,189 | none |

The route store beside them has `store-manifest-v1.json` and `check-store-pinned-v1` («a moved shard is a moved reading, and this is what notices»). These five have nothing of the kind.

The dictionary store is the one I could settle: `tools/bake-dictionary-store-v1.mjs` copies the lane's shards «byte for byte» and held each to the lane's list when it copied them (23 October). I fetched the lane's 256 shards (`v2/corpus/dictionary-store/v1.3/build/dictionary-store-v1.3/serve/shards/`) and compared: **256 of 256 are the same bytes** as the tree's (`data/dictionary-store-shards-vs-store.tsv`). So nothing has drifted; nothing would say so if it did.

**Cause.** `emit-store-manifest-v1.mjs` and `check-store-pinned-v1.mjs` are written for `data/route-store` alone.

**Class.** Footing.

**Mend (by rule).** The route store's rule (`store-manifest-rule-v1-what-ships-is-pinned`) for every served store: a manifest beside each, and the one check walking all of them. For the dictionary store the pin is the lane's own list, which the bake already reads.

### 4. Where each dictionary's received file is hashed: only in relay receipts, and for 9 families nowhere (29 families)

**What I saw.** `data/dictionary-kinds-v1.json` gives each family `files`, and they are this tree's own records (the store index, the declarations sidecar, a ledger). No record lists, for a family, the file that was received and its sha256. The values exist, scattered in the corpus lane's receipts kept in the tree: `data/names/names-v2/receipt-v2.json` (`inputs.sources`) names 17 sources' files; `made-spaces-v1` and `-v2` name the Open Scriptures three, the unabridged BDB and the nine Wikisource files with their addresses; `spelling-bridge` names STEP's five. Those receipts are pinned as files, so the values cannot move unnoticed; but no check reads them, and nobody could find them without searching.

No sha256 of a received file was found for: **Davidson** (of the twelve; 85 rows), Kethoneth Yoseph, PanLex, ConceptNet, MUSE, Hebrew Wikipedia's titles, Lexibank, English Wikipedia's openings, and the five Samaritan works (searched: every 64-hex value under `reader/data` with the fields beside it, `data/recorded-hashes-classified.tsv`).

**Class.** Footing.

**Mend (by rule).** Each family in `dictionary-kinds-v1.json` gains `received`: file, bytes, sha256, where it came from (an address and commit, or «read from a web page on <date>»), and the receipt that says so; a line of `check-dictionary-kinds-v1` holds each value to that receipt. The nine with none are asked of the corpus lane, whose manifests hold them.

### 5. `pins-not-kept-v1.json` is out of date, and no check reads it (52 files; 40 can be had today)

The brief said to start here. The record (10 November) names 52 files «that neither lane holds any more»: 47 identity bridges and 5 C0 ledger maps, and says «nothing is restored from a guess: a file is the bytes its sha256 names or it is not that file». (The 53rd hash in it is a relay's.)

**39 of the 47 bridges can be made again, the same bytes** (`data/bridges-made-again.tsv`, script `scripts/17-bridges-again.mjs`). The bridge of a book on the restore route is not a file the corpus lane wrote: `serve-from-restore-v5.mjs` writes it itself (its lines 265 to 272: one line per verse with the positions it holds, gzipped). I wrote those lines again from each served zone's sections and gzipped them: **39 of 39 give the sha256 the zone and the record name.** That is not a guess; it is the test the record itself sets.

**1 of the 5 C0 maps stands on the store**: `v2/corpus/pinned/c0-map-rebuild-c0-w/cleanroom-c0-ledger-map-rebuilt-active-…69828900-…69846706.csv.gz`, 850,726 bytes, there since 21 November. I fetched it: sha256 65106e07…, the value the record lists as not kept (the petuchah fixture's).

The other 12 (8 bridges and 4 maps) belong to fixtures; I did not try them.

No check names `pins-not-kept` (searched all 206), so the record can only go stale.

**Class.** Footing.

**Mend (by rule).** The record is derived, not typed: for each file, «made again from the zone, the same bytes», «stands on the store at …», or «not kept». A bridge line in finding 1's check keeps it true.

### 6. Sefaria's dump is not hashed in the restore's own receipts (39 books)

**What I saw.** The restore's 39 receipts and its run receipt (in the store's part `v2/ledgers/mam/mam-restore/TEXT-PART-v1.tar.gz`) hold one hash each: the surface hash of the output. The tool reads `rebuild-c0-w/source-cache/sefaria/dump/sefaria/texts.bson` by path (its line 13). The dump's sha256 enters the record two months later, in the paseq relay's receipt (13 November), for the file then at that path. The rights record (`mam-restore-v5-rights-v1.json`, `source.how_held`) says «a local Sefaria BSON dump» and names no hash.

**What ties them today** (`data/restore-vs-collected.tsv`, `data/six-books-one-side-only.tsv`, scripts 12 and 13). The store holds a second extraction of the same edition, made by another script of the lane's on 2 September (`v2/sources/tanakh-editions-collect/collected/tanakh-<book>/edition-miqra-according-to-the-masorah.tokens.csv.gz`). I first held each of the 39 to its own receipt (token stream sha256: 39 of 39 equal), then compared it with the restore on letters, points and accents, the scribes' marks left out of both:

- 33 books: equal, character for character;
- 6 books (Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Esther): the only stretches that differ are 31 footnotes of the edition's own, which stand in the collected text and are lifted out of the restore (7, 6, 4, 5, 6 and 3: the figure each book's restore receipt gives as `footnotes_lifted`). For example Exodus 1:19, «בכתר ארם צובה היה כתוב אֲלֵיהֶ֛ן». Nothing stands in the restore that the collected text lacks.

And the paseq receipt names 12 restore files by sha256; all 12 are the store's bytes today.

So the restore is faithful to the edition as the lane read it twice. What is asserted is that the file read on 2 and 5 September is the file hashed on 13 November.

**Class.** Footing.

**Mend (by rule).** The corpus lane's restore receipt names `texts.bson` and the dump by size and sha256 (the lane has both figures), and the rights record carries them, so the first link of the 39 books is hashed where the others are.

### 7. `declarations_sha256` names bytes nobody holds (1 value)

`data/route-store/index.json` line 1279: `declarations_sha256: d235ed2a…`. No tool in `reader/tools` reads or writes the field (searched). No file of the tree, raw or unzipped, has that sha256. The one other place it appears is a corpus lane receipt that copied it (`fold-strike-landing/landing-v1/counts-v1.json`).

Suspected, not verified: it is the hash of `tools/declarations-v1.json` as it stood when the store was built under `reading_declared_on: 2026-08-17`. That file hashes to b6e20e1d… today, and the checkout's history holds one version of it (31 October), so the earlier bytes could not be read.

This is the only recorded value in `pins.tsv` that does not match what stands today.

**Mend (by rule).** A hash in the index names bytes somebody holds, or it is not written: the step that owns the field writes the hash of what it reads now (the ledgers and the declarations sidecar are pinned elsewhere), or drops the field.

### 8. The store cannot be built again from its four inputs by the tool its index names (the whole store)

`route-store/index.json` says `generated_by: tools/build-route-store.mjs`, `schema_version: ROUTE_STORE_V2`, `rule_id: route-store-rule-v3-declared-reading`. The tool of that name in the tree (lines 140 to 155) writes `ROUTE_STORE_V1`, `rule_id: route-store-rule-v1-catalog-compact-top5`, rows of five slots, and no `store_version`. Today's rows carry up to eleven slots, laid by later steps.

So the four inputs are sound (4 of 4 re-hashed) and the shards are sound (261 of 261), and between them stand 62 recorded steps, not a build anyone can run. `check-store-continuity-v1` accounts for the rows that left; nothing recomputes the rows that stayed. This is PIPELINE.md's own warning («that file was an heirloom, not an output») come true of the store; it is said here so the footing table is honest, not as a new fault.

**Mend (by rule).** The index says who writes it now («first built by … from the four inputs; since then by the steps `store_version_history` names»).

---

## What I checked and found clean

All by machine, over the whole population named. Files: `data/` beside this file.

| What | Against | Result | Data |
|---|---|---|---|
| The 40 served zones | `serve-gate-receipt-v1.json` `served_sha256` | 40 of 40 | `zones-rehash.tsv` |
| Every bin in `data/zones` (zones, sidecars, fixtures) | `zone-store-v1.json` | 147 of 147; none unpinned | `manifests-rehash.tsv` |
| The 39 restore files on the store | the hash each zone names | 39 of 39 | `books-chain.tsv` |
| The restore's surface hash, from the store's rows | the receipt, the zone, the rights record | 39 of 39 | `books-chain.tsv` |
| The restore's surface hash, **from the served zone's words** | the rights record | 39 of 39 | `books-chain.tsv` |
| The 39 restore receipts | the store part's own index | 39 of 39 | `books-chain.tsv` |
| The collected Sefaria edition of each book | its own receipt (token stream) | 39 of 39 | `manifests-rehash.tsv` |
| The restore's words against the collected edition | letters, points, accents | 33 equal; 6 differ by 31 footnotes lifted, as the receipts count | `restore-vs-collected.tsv`, `six-books-one-side-only.tsv` |
| The resting lines | `chapter-pages-receipt-v1.json` | 40 of 40 | `root-receipts-hashes.tsv` |
| Every file each resting-lines record says it was read off | the tree | 1,294 of 1,294 | `resting-lines-read-off.tsv` |
| The lattice v12 files (positions, routes, receipt), 7 books, Genesis among them: a sample | the hash each zone names | 21 of 21 | `lattice-rehash.tsv` |
| The default picks' 39 book files, on the store | the lane's receipt, as the pin holds them | 39 of 39 | `pinned-inputs-rehash.tsv` |
| The 23 other pinned lists that stay on the store (default picks' tables and mends, spans, the lattice delta, the row entries ledger and its lists, the stems extension) | their pins | 23 of 23 | `pinned-inputs-rehash.tsv` |
| Every file kept in the tree beside a `PIN.json` (23 pins) | its pin | 205 of 205 | `pin-entries-rehash.tsv` |
| The four inputs of the first store, on the store | `route-store/index.json` `inputs` | 4 of 4 | `pins.tsv` |
| Every file of the served route store | `store-manifest-v1.json` | 261 of 261 | `manifests-rehash.tsv` |
| The store's row count | its index | 653,353 rows in the shards, 653,353 in the index; every row's source filed in one family | `rows-by-family.tsv` |
| Each ledger's declaration and classifier | `ledgers-v1/manifest.json` | 86 of 86 | `manifests-rehash.tsv` |
| The two overlays (Jastrow, the Samaritan works) | the delivered manifest, or the record of what the ledgers rewrote | 257 of 257 and 258 of 258 | `manifests-rehash.tsv` |
| The dictionary store's shards | the corpus lane's own on the store | 256 of 256 | `dictionary-store-shards-vs-store.tsv` |
| 10 files of 6 of the twelve dictionaries, **fetched from the provider** | the sha256 the lane's receipts record | 10 of 10 | `provider-rehash.tsv` |
| The headword ledger (`word-lemma-v1.csv.gz`), on the store | the hash 39 zones name | equal | `pins.tsv` |
| Every hash in the 39 zones' headers, by where its bytes stand today | | 38 kinds of hash; see the file | `zone-header-hashes-standing.tsv` |
| Every `PIN.json` has a check that hashes through the pin helper, itself or by a reader it imports | the 206 checks | 23 of 23 | `record-to-checks.tsv`, `check-matrix.tsv` |

Two things that look like mismatches and are not. (1) `named-file-rehash.tsv` lists 526 «other bytes»: 469 are the overlays' delivered pins, which `LEDGERED-overlay-v1.json` supersedes file by file (all equal, above); the other 57 are receipts of a past day naming a file as it stood then (for example the 39 resting lines read on 14 November, or `row-strikes-v1.json` at 16 rounds), or a field beside a file that is the hash of something else (a relay's letter). They are history, correctly kept. (2) The zones' `gloss_table_sha256`, `span_ledger` and `witnessed_order` column hashes name tables and files off the tree; they were not fetched and nothing suggests a fault.

## What I could not check, and why

- **Sefaria's dump** (2.4 GB) and `texts.bson` (3.6 GB): not on the store, and beyond this pass's download limit. The provider's address is a backup it renews, so today's file there would not be the bytes of July.
- **The received files of 7 of the twelve** (Strong's Wikisource edition, MACULA, the UBS dictionary, HiperBiblia's SDBH, Davidson, UHAL, BiblicalTools): not on the store (finding 2). For MACULA and UBS the tree records no public address or commit; I tried the providers' repositories at likely paths and found none. HiperBiblia and BiblicalTools were read from web pages; UHAL is hashed as a set by a recipe not in the tree; Davidson has no hash. Hebrew Wikisource is not reachable from this session, and the nine pages are named without a revision.
- **Received file → served rows**, for every family: this is each source read against its own bytes through its declared print steps (pass 5). I hashed the ends of the link, not the link.
- **The other 32 books' lattice files** (329 MB in all): 7 books were sampled.
- **The zones' other off-tree inputs**: `book-cards-v2.json`, each book's `spans-ledger-v5` and `pg-from-piece-gloss-v4`, and the witnessed-order columns are not on the store under their own names (they may stand inside parts); not fetched.
- **The piece store, source-suggested, HUD toggles and run cards against the corpus lane's own bytes**: the lane's copies are inside parts of 261 MB, 85 MB and 69 MB.
- **The 12 fixture files** of `pins-not-kept` (outside the 39 books).
- **The live site.** fireandhail.com is not reachable from this session, so «the tree is what is served» rests on the briefing's word (main at ea6e1ad08e) and on the page lane's live check. For the same reason no finding here was confirmed in a browser; none of them is about what a page draws.
- **The tree's own history before 31 October** for `tools/declarations-v1.json` (finding 7): the checkout holds one version.

## Seen on the way (for pass 5, not measured here)

- The store's source record for Strong's Wikisource edition (M14) gives `licensePointer: https://en.wikisource.org/wiki/Wikisource:Licensing`; the nine files were fetched from **he**.wikisource.org.
- For five of the twelve (M3 MACULA, M18 UBS, M97 Davidson, M7 UHAL, M45 BiblicalTools) the `licensePointer` in `m_sources` is a path on the corpus lane's disk (`ledgers/work/ldmprs/source-cache/…`), which no reader of the site can follow.

## Files

- `findings.md` (this file), `pins.tsv` (2,143 rows: family or book, role in the chain, file, where it stands, bytes, sha256 recorded, sha256 today or «not re-hashed», pinned in, checked by).
- `data/`: the files named above, and `tree-hashes.tsv` (every file of `reader/`, raw and unzipped), `all-recorded-hashes.tsv` and `recorded-hashes-classified.tsv` (9,017 recorded hashes with the fields beside them), `zone-header-hashes.tsv`, `store-listing-v2-2026-11-27.tsv`.
- `scripts/`: 18 scripts, numbered in the order run. Scripts 04, 12 and 13 read the downloads kept under `dl/` (the 39 restore files and their receipts, the 39 collected editions, one C0 map: 8 MB). The other downloads (about 280 MB in all, from the store and from three providers' repositories) were deleted after hashing; `logs/` holds each fetch's log.
