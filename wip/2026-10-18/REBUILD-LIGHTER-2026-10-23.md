# A full rebuild, same product, lighter weight (23 October)

The owner: "next thing we need is a full rebuild, same product, lighter weight. how do we do it".

## What weighs what today

Measured on the shipped build (main ef68212c5), bytes as served uncompressed
unless gz is said.

**One chapter page (Genesis 1): 4.2 MB over 36 requests.**

| what | bytes | note |
|---|---|---|
| the zone bin (genesis.bin) | 1,015 KB (13.3 MB unpacked) | every page of the book loads the whole book |
| the engine (JS) | 775 KB (247 KB gz) | one script of 787 KB inside zone.html |
| the BSB suggested layer (source-suggested/genesis.json) | 744 KB | fetched on load; shown only with its switch on |
| the shelf's pin record (zone-store-v1.json) | 517 KB | 3,594 pins fetched to verify one bin |
| the HUD toggles (hud-toggles/genesis.json) | 244 KB | fetched on load; shown only with its switch on |
| the engine (CSS) | 172 KB (49 KB gz) | |
| overlay book counts | 110 KB | per-book counts for every book |
| the span store (genesis.json) | 90 KB | |
| the route store index | 69 KB | |
| fonts, the page, the rest | ~110 KB | |

Amos 1 is 2.4 MB: the same fixed costs (engine, pins, counts) over a 203 KB bin.

**Inside the Genesis bin (13.3 MB unpacked):**

- sections 6.8 MB: 22,329 word rows, each carrying copies of facts that are
  per key, not per place (its pieces, its headword and the headword's
  credit, the maqaf joiner's rule text): 4.6 MB of such fields, of which
  1.2 MB would be written once per key where the fact is constant (pieces
  vary within a key at 1,091 of 4,997 keys, the headword's reading at 523).
- credits 5.5 MB: 19,770 M records, 10,524 distinct, the same record
  repeated across gloss_m and nine order columns (3.4 MB distinct).
- the nine order columns 364 KB; 618 of 13,358 column readings equal the
  base reading they would replace.

**The site on disk: 954 MB.**

| folder | MB |
|---|---|
| zones: 3,456 other works | 563 |
| zones: the 39 Tanakh books | 18 (+24 sidecars) |
| piece store (40 files) | 120 |
| dictionary store (256 shards) | 55 |
| book pages (47 folders) | 40 |
| chain (12 books) | 25 |
| route store | 14 |
| BSB suggested, HUD toggles, search index, overlays | 32 |

**The repository: 4.29 GiB packed**, of which the current tree is under
1 GB. History holds 20 GB of blobs under a root `data` folder from old
builds, 2.2 GB of zone revisions, 1.4 GB under `halakhah`, 0.2 GB of
`index.html` revisions. gh-pages is the same pack.

**The pipeline:** 257 tools (153 checks; check-scope-derived counts 151
live, none dormant); build.sh calls 19 of 104 non-check tools; zone.html is
984 KB; a re-projection of one zone takes 8.5 s.

## The method: the checks are the product

"Same product" is decidable: the 151 checks pass on today's build, and
every ruling in these notes is one of them or a line in one. The rebuild is
gated by the same suite at every step, plus one new check written first:

- check-same-product-v1: for every served book, the old build (served from
  the shipped commit) and the new build give the same (word, line, chip) on
  every page and the same pills, in the same order, on a sample of cards
  under every switch position. Byte for byte, as the page prints them.

Nothing below changes what a reader sees. Each step is a day to a week,
each ships alone, each ends with the suite and the same-product check.

## The steps, by weight gained per effort

1. **The repository: a fresh history.** main and gh-pages restart from the
   current tree on an orphan commit; the old history stays as an archive
   branch (`archive-2026-10`), never deleted. 4.29 GiB to about 0.9 GB.
   One hour; no product change. The owner's ruling: the archive branch's
   name and that it stays in this repository.

2. **The page fetches what it shows.** One pin per book, in the built page
   (a meta) or data/zones/<book>.pin.json, instead of 3,594 (−517 KB). The
   BSB layer and the HUD toggles fetched when their switch is turned on,
   not on load (−988 KB). The overlay counts for this book in the page's
   meta (−110 KB). 1.6 MB of 4.2 MB, no format change; the pins' checks
   (store-pinned, zone-store, zone-store-reachable) read the new record.
   One day.

3. **Zone bin v2.** A form table (per-key facts written once: pieces,
   headword, credit, joiner rule by id), word rows that point at it, one
   credit table (every M record written once, gloss_m and the order
   columns pointing by index), order columns as deltas only where the
   reading differs from the base. Estimate for Genesis: 13.3 MB to about
   4 MB unpacked, 1,015 KB to about 350 KB gz. One decoder module read by
   the page, the chain builder and the checks (today each reads the JSON
   itself). The single-pass receipts rule names the builder's fields, so
   v2 is a new schema version with its own receipt rule; Moses co-reads it
   (the corpus lane reads zone.gloss). Re-bake all 3,594 bins, re-pin,
   re-judge at the gate. One to two weeks.

4. **The engine in modules.** zone.html's one 787 KB script split by surface
   (the reader; the card; the concordance and search; the switches and the
   rail; the door) as ES modules, the card, concordance and search loaded
   on first use. Same code, moved; the checks read behavior, not file
   layout (check-nothing-hand-typed scans the modules as it scans
   zone.html). On load: about 300 KB, 100 KB gz, from 775 KB. One week,
   mostly moving and re-running.

5. **The shelf's other works.** The 3,456 non-Tanakh bins (563 MB of the
   954) served from the zone store's `base` host instead of beside the
   door; the page already verifies every arrival against its pin, and the
   record says "moving the shelf is the owner's ruling". R2 holds them
   today under the pins. The site drops to about 390 MB, under the 1 GB
   Pages limit with room for the chain pages of all 39 books. The owner's
   ruling: the host, or that the shelf stays beside the door.

6. **The pipeline.** Keep build.sh's 19 steps; fold the post-build
   projections (regloss, the lattice, the witnessed orders, the licence
   columns, the names, the no-names column) into one `project-zone` pass
   with one receipt instead of the single-pass exemption typed on every
   zone (the receipts check already names each). Classify the 85 non-check
   tools build.sh does not call: a relay's bake tool, a one-off that moved
   data once (retire to `tools/archive/`), a probe. Maintenance weight,
   not page weight.

## Order

Week 1: steps 1 and 2 and the same-product check; the rulings for 1 and 5.
Weeks 2 and 3: step 3, then 4. Step 5 whenever ruled; step 6 alongside.

## Three rulings asked of the owner

1. Restart the history on an orphan commit, with the old history kept as an
   archive branch in this repository.
2. Where the 3,456 other works' bins serve from: the `base` host (R2, under
   the pins) or beside the door as now.
3. Zone bin v2 as a new schema version with its own receipt rule, read by
   Moses too.

## 30 October · the owner's three principles for the rebuild

The owner: "the main thing we want to think about with this potential rebuild are: 1. lighter in gb, and in any aspect possible maybe its load time or maybe its your own ai tokens less are needed to go through stuff., 2. refute the rule that we need to save everything that was for POCs id argue and we need to move into a lean working system even if its backwards engineered, and then 3. once everything is proven we implement, i guess you said by byte match which makes sense as long as its all the layers and we have the fall back before deleting".

1. **Lighter on every axis, measured.** Three figures per page, before and after: bytes over the wire (the table above: 4.2 MB for Genesis 1 today), time to first line on a phone, and the bytes an agent must read to answer a question about the page (the engine is one 787 KB script; the zone is one bin per book). The first cuts, in order of bytes per effort: the zone bin per chapter instead of per book; the engine split into what every page needs and what a card needs; the BSB layer and the HUD toggles fetched on their switch, not on load; the pin record fetched per book, not 3,594 pins for one.
2. **Nothing kept for having been built.** The R2 bucket and the repository hold proof-of-concept builds, retired routes and their receipts. The lean system is the served files, the tools that make them, the records that prove them, and the checks that hold them; everything else is history, and history belongs in a tarball with a manifest, not on the serving path. "Backwards engineered" is allowed: a served file whose maker is lost is re-made by a new tool that reproduces it byte for byte, and the new tool becomes its maker.
3. **Byte match across every layer, with the fall-back in hand, before anything is deleted.** The proof is the same-product gate widened: the old build and the new print the same word, line, chip, pill and count on every page under every switch (check-same-product-v1, today's gate), and every served data file is byte-equal or every difference is named and ruled. The fall-back is the archived branches (archive-2026-10-main, archive-2026-10-gh-pages) and one tarball of the bucket's keep-list; the deletion comes after the proof, never with it. R2 stays read-only until the owner names the writes.
