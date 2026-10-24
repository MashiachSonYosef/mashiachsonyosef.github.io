# The five surveys behind the map

Saved from the workflow's results on 18 October 2026. The subagents could not write report files, so their findings are kept here as returned. The data tables and scripts stayed in the session's scratchpad.

## Survey: census

**REPORT.md was not saved.** The harness refuses report files from subagents, so the full census is here and in the numbers list. To publish it, the parent needs to write REPORT.md from this text. The data is all in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/census/: builds.tsv (the columns asked for, 289 lines), builds-extra.tsv, families.tsv, nested-copies.tsv, served-payload.tsv, status-table.tsv, report-numbers.json, and scripts/ (run order in COMMANDS.sh). Nothing on R2 was written; I only listed and read.

**What a build is.** A unit is one folder that one run wrote, at the level where its own name sits. There are 289 units:
- 230 `corpus-lane-builds/<name>/` folders, plus that area's root file
- 27 `moses-ledgers/<name>/` folders, plus 3 root receipts
- 4 `editions-built-v1` units: `pby-wave`, `h1-canon`, `tanakh-editions`, and the 4,031 per-work folders as one run
- 6 `corpus-staging` units, 2 `cold` units, the serving-lane and handoff folders, and 13 top-level folders or files

This is the level that relays name, that Moses's delete ledger counts, and that the site's pins point into.

**How many there really are.** About 220 distinct things, not several hundred:
- 220 families (the name without its version). Only 31 families have more than one unit, holding 100 units between them.
- 118 distinct relay numbers (v1 to v79), so about 118 hand-overs.
- The "several hundred" grows inside the folders: 714 inner round folders (411 verify, 117 strand, 75 ship, 54 build, 49 candidate, 8 v<N>).
- Real content is 288,169 distinct objects, 68.22 GB, out of 117.33 GB on R2.
- The 5,636 keys the md5 table lacked were filled from their ETags. ETag matched md5 on 744 of 744 keys checked.

**Status** (counted; each line in builds.tsv says why):

| Status | Units | Bytes on R2 | Held nowhere else |
|---|---:|---:|---:|
| current | 51 | 41.32 GB | 26.99 GB |
| superseded | 60 | 43.91 GB | 10.39 GB |
| evidence | 118 | 30.51 GB | 25.17 GB |
| unknown | 60 | 1.59 GB | 0.98 GB |

The 51 current units split as 20 served, 2 build folders whose newest round equals a served ledger, 19 cited by the site, and 10 READY candidates not yet wired. So deleting all superseded builds safely needs the meta file to keep 10.39 GB that no other unit holds.

**What the site actually reads from R2** is much smaller: 5,800 keys, 2.91 GB, all distinct (served-payload.tsv). That is 2.5% of the bucket. A current unit is far bigger than what is served from it; `moses-hud-record-v1` is 3.25 GB and the site reads 76 MB of it.

I confirmed three pins against bytes, not just names:
- the run-cards file hashes to the site's sha256;
- the Amos MAM restore v5 file hashes to the served zone's `restore_gz_sha256`;
- `moses-lattice-ledger-v1` holds every byte of the served lattice-v12, and `moses-tanakh-mam-restore-v1/candidate-v5` holds every byte of the served restore v5.

**Largest families:**
- search-ledger: 12.21 GB, but only 0.19 GB exists nowhere else; it is almost all mirrors of other builds
- witnessed-order: 11.17 GB
- compspan: 9.83 GB, of which v13.8 is current
- ia-wave: 8.93 GB
- licence-ledger: 8.92 GB

Most unique bytes:
- licence-ledger 8.52 GB
- ia-wave 8.13 GB
- the cold tar.gz 4.04 GB
- compspan 3.16 GB
- source-census 3.13 GB
- corpus-refinement 2.61 GB

**Nested copies** (a build holding a copy of another build): 17,721 keys, 16.76 GB, held by 15 units.
- 15.16 GB are byte-identical to the original at the same path.
- 1.50 GB are kept elsewhere.
- 0.11 GB are the only copy left.
- 3.90 GB are copies of copies.
- Main holders: search-ledger v1.8 (5.92 GB) and v1.7 (5.52 GB), compspan v13.8 (2.21 GB) and v13.7 (1.73 GB).
- The most-copied build is `moses-unmerged-cards-v1`: 0.95 GB itself, 4.02 GB in copies.
- Gate, mirror, shadow and sandbox folders that name no build add 6.88 GB.

**On "overlapped" meaning more than whole files.** It probably does. `moses-piece-store` v1 and v2 share only 0.075 GB as whole files, yet v2 rebuilds every v1 row. The witnessed-order witness tables (about 41 MB each) change md5 every version. I did not measure row-level overlap. The bucket already has a working example of the hash-named layout: 15 `cas/sha256/<xx>/<sha256>` objects mapped by a disposition receipt.

**Could not classify:** 60 small units, 1.59 GB, are unknown. The biggest are `moses-inplace-v2.2`, `moses-c0-materialization-61-v1`, `moses-ledgers/variant-apparatus-v1`, `moses-not-a-gloss-v1`, `maqaf-reseal-v2` and `english-gaps-v1`. Six statuses are inferred from names rather than read, and each says so.

Three small findings:
- The site's toggle-queue names `moses-ledgers/ben-yehuda-v1/`, which does not exist on R2.
- The Jastrow overlay cites `moses-toggle-ledgers-v1`, which exists only as `moses-ledgers/toggle-ledgers-v1` and inside mirrors.
- R2 upload dates are not build dates: 220,692 keys carry 2026-10-02, the day of the backfill.

**Numbers**

- bucket keys / bytes: 512,780 keys / 117,329,041,116 bytes (117.33 GB) (MEASURED: clean/bucket-now2.tsv)
- keys with a content hash: 512,780 of 512,780 (507,144 md5 table + 5,636 from ETag) (MEASURED: read-only ListObjectsV2 ETags for moses-dictionary-store-v1 and moses-delete-ledger-v1; ETag equaled md5 on 744 of 744 piece-store-v2 keys; 0 multipart)
- distinct content in bucket: 288,169 objects, 68,219,270,727 bytes (68.22 GB) (MEASURED: sum of sizes over distinct md5)
- units (builds): 289 (MEASURED: unit rule over the listing (230 corpus-lane-builds folders, 27 moses-ledgers folders, 4 editions-built sub-units, and the rest))
- families: 220; 31 with more than 1 unit (100 units) (MEASURED: name without its -vN or date suffix; families.tsv)
- distinct relay numbers: 118 (76 main numbers), 643 relay keys (MEASURED: FOR-ELIJAH-v<N> file names in the listing)
- inner round folders: 714 (411 verify, 117 strand, 75 ship, 54 build, 49 candidate, 8 v<N>) (MEASURED: third-level folder names inside corpus-lane-builds and moses-ledgers units)
- current units / bytes / distinct: 51 units / 41.32 GB / 30.45 GB; 26.99 GB held by no other status (MEASURED sizes; status judged from site data, relays and front pages (evidence on each line))
- current: served: 20 units, 17.05 GB (10.46 GB distinct) (MEASURED sizes; units named by reader/data and the served zones' emitted_from)
- current: build folder of a served ledger: 2 units, 3.11 GB (MEASURED: md5 sets show moses-lattice-ledger-v1 holds all of lattice-v12, and moses-tanakh-mam-restore-v1/candidate-v5 holds all of mam-restore-v5)
- current: cited: 19 units, 15.24 GB (13.85 GB distinct) (MEASURED sizes; units cited by site data or site tools (licensePointer, workspace-manifest, serve-edition))
- current: candidates: 10 units, 5.92 GB (4.24 GB distinct) (MEASURED sizes; newest relay READY or no status line, not served)
- superseded: 60 units, 43.91 GB, 14.48 GB distinct, 10.39 GB held by no unit of another status (MEASURED sizes; status from newer versions, relays, banners)
- evidence: 118 units, 30.51 GB (25.17 GB held only by evidence units) (MEASURED sizes; role rule)
- unknown: 60 units, 1.59 GB (0.98 GB held only by them) (MEASURED sizes)
- live payload the site reads from R2: 5,800 keys, 2,909,622,783 bytes (2.91 GB), all distinct (MEASURED: exact prefixes and keys the site names, one copy each (served-payload.tsv))
- run-cards pin checked against bytes: sha256 e90116c9... matches (MEASURED: downloaded the 14,502,978-byte key, hashed it, deleted it)
- MAM restore v5 pin checked against bytes: sha256 99cee34c... matches (MEASURED: hashed mam-amos-restored-v5.csv.gz)
- site pins matched to R2 by name and size: 877 of 1,160 (MEASURED: site_pins.py and match_pins.py (the other 283 are site-made search index and front-door records))
- nested copies: 17,721 keys, 16,763,073,878 bytes in 15 holder units, 420 holder-to-copied-build pairs (MEASURED: a folder inside the build names another build, or the path runs through root/tab/lane, The Tabernacle or a nested corpus-lane-builds)
- nested copies identical to the original: 15.16 GB same md5 at the same path; 1.50 GB kept elsewhere; 0.108 GB only copy (MEASURED: md5 comparison with the original key)
- copies of copies: 3.90 GB (MEASURED: nested keys whose path names 3 or more builds)
- gate/mirror/shadow/sandbox folders naming no build: 6.88 GB (MEASURED: folder-name rule; adds to the 16.76 GB nested copies, 23.65 GB together)
- largest family: moses-search-ledger: 12.21 GB, 2.42 GB distinct, 0.19 GB unique (MEASURED)
- moses-witnessed-order: 11.17 GB, 3.34 GB distinct, 2.49 GB unique, all superseded (MEASURED)
- moses-compspan: 9.83 GB, 3.19 GB distinct, 3.16 GB unique (MEASURED)
- most unique: moses-licence-ledger-v1: 8.92 GB, 8.52 GB unique (MEASURED)
- moses-ia-wave (6 units): 8.93 GB, 8.13 GB unique (MEASURED)
- most-copied build: moses-unmerged-cards-v1: 4.02 GB in nested copies (0.95 GB itself) (MEASURED)
- piece-store v1 and v2 shared as whole files: about 0.075 GB of 2.17 GB (MEASURED: family bytes minus distinct bytes; row-level overlap not measured)
- keys dated 2026-10-02 (backfill day): 220,692 keys, 25.88 GB (MEASURED: last_modified histogram)
- census disk use: about 8 MB of the 1 GB budget (MEASURED: du)

**Open questions**

- The harness refused REPORT.md. If a REPORT.md is needed at that path, the parent has to write it from this summary.
- 60 units (1.59 GB) are unknown status, mostly small corpus-lane folders from 2 Oct with no relay and no site mention. Can Moses settle them in one pass? The biggest: moses-inplace-v2.2, moses-c0-materialization-61-v1, moses-ledgers/variant-apparatus-v1, moses-not-a-gloss-v1, moses-ledgers/maqaf-reseal-v2, moses-ledgers/english-gaps-v1.
- Should raw source caches (23 units, 11.89 GB) and cold evidence (5.41 GB) count as evidence or current? They are the only copies of downloaded sources and of the 30 August strike evidence, and nothing on R2 can rebuild them.
- Current units are much larger than what is served from them (41.32 GB against 2.91 GB served). Should the meta file treat current at the level of the whole build folder or only the served prefixes?
- Row-level overlap between versions was not measured. Whole files show strong signs (piece-store v1 and v2 share about 0.075 GB of 2.17 GB as files although v2 rebuilds every v1 row; witnessed-order tables change md5 every version). It needs a decompress-and-compare survey.
- Six statuses are inferred from names rather than read (run-store-v1, inplace-order-v1, piece-gloss-v2, serve-set-v1, top-level moses-tanakh-mam-restore-v1, and moses-ledgers/edition-door-v1 as 'the edition door'). Moses should confirm them.
- The site's toggle-queue names moses-ledgers/ben-yehuda-v1/, which does not exist on R2. The Jastrow overlay cites moses-toggle-ledgers-v1, which exists only as moses-ledgers/toggle-ledgers-v1 and inside search-ledger mirrors. Should these citations be fixed?

## Survey: overlap

**The answer in GB.** Today's bucket (L0) is 117.33 GB in 512,780 keys (MEASURED from the listing). Keeping each distinct file once (L1) gives 68.22 GB in 288,169 distinct contents. That is 66.755 GB from the md5 table plus 1.464 GB from the 5,636 newer keys (MEASURED from today's ETags; none was a multipart upload; 4,450 are new contents and 1,186 repeat others).

The whole-bucket figures below are ESTIMATED from a sample, with ranges:

| Level | What it stores | Size |
|---|---|---|
| L2 | distinct lines, after inflating .gz | 119.5 GB (99.9–214.5) |
| L3 | distinct chunks of about 100 KiB, after inflating | 137.9 GB (121.1–227.4) |
| L4 zlib | the chunk store compressed, any file kept as stored when smaller | **27.3 GB (23.6–31.9)** |
| L4 xz | the same with xz | **20.3 GB (17.8–25.2)** |
| baseline | each distinct file compressed on its own, no row or chunk sharing | 30.5 GB (30.0–34.2) |

L2 and L3 are bigger than L1 because they count inflated bytes: the 22.18 GB of distinct .gz content inflates 5 to 20 times.

So:
- Whole-file sharing (49.11 GB of copies) and compression do almost all of the work.
- Sharing rows and chunks across versions adds only about 3.2 GB (about 10 %) on top of compression alone.
- xz brings the store to about 20 GB.

**Sample.** Ten families: licence-ledger, ia-wave (1 item in 7), cold, witnessed-order, compspan, source-census, corpus-staging, run-ledger-backwards, hud-record, and editions-built (1 work folder in 4). That is 56,624 distinct files, 33.05 GB, 48.4 % of L1. Every one of the 74,469 downloads matched its md5. All downloads were deleted.

**Where row or chunk sharing matters** (MEASURED per family; the gain is the baseline divided by L4 zlib):
- **compspan: 2.16×,** saves 0.76 GB.
- **witnessed-order: 1.7× to 2.0×,** saves 0.25 to 0.29 GB.
- **run-ledger-backwards: 1.69×,** saves 0.14 GB.
- **cold: 1.23×,** saves 0.90 GB. The gain is inside its 4.04 GB tarball: 396,773 members, 10.63 GB inflated, of which 3.30 GB repeats other members. Only 0.234 GB of it exists elsewhere in the bucket.
- **No gain:** source-census 1.22×, editions 1.09×, hud 1.07×, staging 1.02×, licence 1.02×, ia-wave 1.00×.
- **Same rows, different gz bytes.** L1 cannot see these. Example: witnessed v2.4's old-witness table is 41 MB of gz, 942 MB inflated, and has 0 % new rows. Such pairs make up 37 % of witnessed's gz bytes, 40 % of runback's, and 8 % of compspan's.
- **licence rows change in every version.** Line and chunk sharing finds only about 2 %. But compressing ruth v1.1 right after v1 with a 64 MiB xz window cut the pair by 34 % (one pair).
- **Chunk size.** Chunks of about 20 KiB instead of about 114 KiB cut witnessed's L3 by 16 % and its L4 by 12 %.
- **Line recipes.** They are too costly for pretty-printed JSON: witnessed needs 106.5 million extents for 142 million lines.
- **Across families.** There is almost no sharing between sampled families (the union is 99.7 % of the sum).

**gz verdict.**
- **Who made them.** A header census of 3,518 distinct gz files: 99.3 % have Node's Windows header (OS=10, MTIME=0, no name).
- **Whole rebuilds.** 50 of 51 objects (39 families) were rebuilt byte for byte from inflated content plus a recipe of about 20 to 40 bytes:
  - 45 only with **Node 22.22.0's bundled zlib 1.3.1-470d3a2**;
  - 4 with GNU gzip 1.12 -6;
  - 1 with both Python zlib and GNU gzip.
- **Plain zlib is not enough.** Python zlib and GNU gzip never rebuilt a Node-made file.
- **The one failure** is a truncated 64 KiB `.head.gz`. The bucket has 190 `.head.gz` and 176 `.r2head.gz` keys of that kind (30 MB); keep them as stored bytes.
- **Large objects.** 21 of 25 agreed with one deflater over 99.4 % or more of an 8 MiB prefix, including the cold tarball (GNU gzip -6). 4 outside-made `census.tsv.gz` copies (about 15 MB) matched no tool.
- **Verdict:** about 98 % of gz can be stored as content plus recipe, if the deflater builds are pinned and every rebuild is md5-checked before delete.
- **Payoff.** Recompressing with zlib gains nothing (1.01 of stored). xz on the inflated content halves it (0.50), and version sharing in compspan brings gz to 0.44 of stored.

**Compressed and media files.** gz: 197,027 keys, 38.48 GB (L1 22.18 GB), including 19 tar.gz (4.16 GB). zip: 23 keys, 0.82 GB. Images: 1,113 keys, 0.44 GB. pdf: 23 keys, 0.39 GB. No xz, zst, br, bz2 or parquet files exist. The unsampled binaries (.bin, .wshard, .ink, .sfc) do not compress (0.99 of stored).

**What the meta file would hold:**
- A sha256 content store: 288,169 objects. The `cas/sha256` layout already exists in the bucket.
- One row per key: build, path, size, md5 (equal to today's ETag), sha256, last_modified, form. For all 512,780 keys that is 94.5 MB as TSV, 26.1 MB gzip -9, 18.7 MB xz -6 (MEASURED on a model).
- Recipes:
  - gz: about 4 MB;
  - chunk index: about 60 MB;
  - chunk extents: 4 to 8 MB;
  - the tarball's headers: 203 MB raw, if it is rebuilt rather than kept whole.
- Pinned deflaters.
- A rebuild-and-md5 proof before any deletion.

**Possible steps:**
- A, whole-file store: 68.22 GB plus about 20 MB of meta.
- B, also compress text: about 30.5 GB.
- C, also gz recipes and chunk sharing: about 27.3 GB (zlib) or 20.3 GB (xz).

**Numbers**

- L0 bucket bytes: 117.33 GB, 512,780 keys (MEASURED: clean/bucket-now2.tsv listing, 18 Oct about 02:00 UTC)
- L1 distinct content: 68.22 GB, 288,169 contents (MEASURED: 283,719 distinct (md5,size) = 66.755 GB from the 17 Oct md5 table, plus 4,450 new contents = 1.464 GB found by ETag in a fresh read-only listing)
- keys without md5: 5,636 keys, 1.472 GB: 4,450 new distinct (1.464 GB), 588 copy table contents (0.97 MB), 598 copy each other (6.6 MB), 0 multipart (MEASURED: ListObjectsV2 ETags, tables/12-nomd5.json)
- exact copies removed by L1: 49.11 GB (MEASURED: L0 minus L1)
- sample processed: 33.05 GB of L1 (48.4 %), 56,624 files, 10 families; 74,469 downloads, 0 md5 mismatches (MEASURED: driver.tsv per run)
- L2 lines (inflated): 119.5 GB (99.9 to 214.5) (ESTIMATED: sample measured (56.4 GB on 33.05 GB processed) plus class ratios applied to the unsampled 26.97 GB)
- L3 chunks (inflated): 137.9 GB (121.1 to 227.4) (ESTIMATED: same method; gear chunker with 8 KiB minimum, 16-bit mask, 256 KiB maximum; measured average chunk 32 to 172 KiB)
- L4 zlib-6: 27.3 GB (23.6 to 31.9) (ESTIMATED: zlib measured over each run's unique stream (9.38 GB on the processed sample), per file kept as stored when smaller, extrapolated by class)
- L4 xz-6: 20.3 GB (17.8 to 25.2) (ESTIMATED: per-run xz/zlib ratio measured on 8 to 256 MiB prefixes, clamped to 0.45 to 0.80)
- compression-only baseline (no row or chunk sharing): 30.5 GB (30.0 to 34.2) (ESTIMATED: gz, tar.gz and media as stored; text and binary at the measured compression ratios)
- saving from row/chunk sharing beyond compression: about 3.2 GB (about 10 %) (ESTIMATED: baseline minus L4 zlib)
- compspan sharing gain: 2.16x (1.42 to 0.66 GB) (MEASURED with per-file zlib (compspan2 run))
- witnessed-order sharing gain: 1.7x to 2.0x (0.58 to 0.29-0.34 GB) (MEASURED zlib; baseline ESTIMATED)
- run-ledger-backwards sharing gain: 1.69x (0.35 to 0.21 GB) (MEASURED zlib; baseline ESTIMATED)
- cold tarball members: 396,773 members, 10.63 GB inflated, 3.30 GB repeated inside, 0.234 GB already in the bucket elsewhere (MEASURED: streamed tar, md5 of every member)
- cold family L4 zlib vs baseline: 3.94 vs 4.83 GB (1.23x) (MEASURED with per-file zlib (cold2 run))
- licence-ledger sharing gain: 1.02x; ruth v1+v1.1 with a 64 MiB xz window 34 % smaller than each compressed alone (MEASURED: whole family run; delta test on one pair (242,236 to 160,292 bytes))
- chunk-size sensitivity (witnessed, about 20 KiB vs about 114 KiB chunks): L3 -16 % (3.88 to 3.26 GB), L4 -12 % (0.289 to 0.255 GB) (MEASURED: witnessed-c16 rerun)
- gz with the same content but different bytes: witnessed 0.114 GB (37 % of its gz), runback 0.054 GB (40 %), compspan 0.090 GB (8 %) (MEASURED: new-chunk share under 1 % of inflated bytes)
- cross-family sharing in the sample: union = 99.69 % of the sum of chunk bytes (MEASURED: tabmerge over chunk tables)
- gz header census: 3,494 of 3,518 (99.3 %; 89.5 % of bytes) have OS=10, MTIME=0, no name (Node on Windows) (MEASURED: ranged reads of the first 4 KiB of 3,518 distinct gz files from 70 families)
- gz whole-object rebuild: 50 of 51 byte for byte (98 %): 45 Node 22.22.0 zlib 1.3.1-470d3a2 only, 4 GNU gzip 1.12 -6 only, 1 Python zlib and GNU gzip; 1 truncated .head.gz failed (MEASURED: 51 objects of 3 MB or less, 39 families)
- gz large-object prefix test: 21 of 25 agree with one deflater over 99.4 % or more of an 8 MiB prefix (13 Node, 7 GNU gzip including the cold tarball, 1 Python); 4 outside-made census.tsv.gz copies matched none (MEASURED: ranged 8 MiB reads)
- truncated gz heads: 190 .head.gz (11.6 MB) + 176 .r2head.gz (18.4 MB) (MEASURED from listing)
- gz keys and bytes: 197,027 keys, 38.48 GB L0, 120,089 distinct, 22.18 GB L1 (19 tar.gz: 4.16 GB) (MEASURED: listing and md5 table)
- other compressed and media: zip 23 keys 0.82 GB; images 1,113 keys 0.44 GB; pdf 23 keys 0.39 GB; no xz, zst, br, bz2, 7z or parquet (MEASURED: listing)
- compressibility of the unsampled part: text gzip-6 0.093 / xz-6 0.060; binary 0.99; media 0.99; gz-text re-gzip 1.01, xz of inflated content 0.50 (MEASURED: 40 files per class, byte-weighted, first 2 MiB of each)
- meta file (one row per key): 94.5 MB TSV, 26.1 MB gzip -9, 18.7 MB xz -6 for 512,780 keys (MEASURED on a model with path, size, mtime and 64-hex id columns; average key 88.3 bytes)
- recipe overheads: gz recipes about 4 MB; chunk index about 60 MB; chunk extents 4 to 8 MB; tarball headers 203 MB raw (about 25 MB compressed) (ESTIMATED from sample counts (0.94 million distinct chunks and 0.48 million extents in the sample; 396,773 headers × 512 B))

**Open questions**

- REPORT.md was not written: the harness refuses report .md files from this subagent. Should the parent agent write the full report, using this result and the data in meta/overlap/tables/?
- Owner's choice of step: A (whole-file store, 68.22 GB plus about 20 MB of meta), B (also compress text, about 30.5 GB), or C (also gz recipes and chunk sharing, about 27.3 GB with zlib or about 20.3 GB with xz)? Step C needs pinned deflater builds: Node 22.22.0's zlib 1.3.1-470d3a2, GNU gzip 1.12 and Python zlib 1.3.
- Keep the 4.04 GB cold tarball whole, or rebuild it from its members plus 396,773 tar header blocks (saves about 0.9 GB, but needs a full byte-for-byte tar and gzip rebuild check first)?
- Which Node version does Moses run on Windows? A rebuild matched Node 22.22.0's bundled zlib on 45 of 45 Node-made files tested; a later Node may ship a different zlib commit.
- Objects the site cites (clean/site-cited2.txt) must stay plain, servable objects under any step. Who keeps that list current during the migration?
- Families not sampled that likely gain like compspan (search-ledger, hebrew-defined-layer, samaritan-toggle, deploy-check, ledger-of-ledgers, year-repair, piece-store; about 7 GB of distinct bytes) were not measured. Should they be measured before choosing a design?

## Survey: readers

**REPORT.md was not written.** The harness blocks subagents from writing report files, so the findings are here in full. Everything else is in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/readers/: refs.tsv, the numbers JSONs, scripts/00-run-all.sh and scripts 01–10.

**What was scanned.** All work was read-only on R2.
- The site: all tracked files at origin/main 799771461.
- The notes branch: 1,447 files that differ from main.
- 7,744 distinct R2 doc bodies, 217 MB, downloaded then deleted. These are the RULE/RECEIPT/README/FOR-ELIJAH/FOR-MOSES/LEDGER/INDEX/MANIFEST/handoff files.
- Moses's delete-ledger keep rules and the r2dupes mention pins.

**Result.** 244,845 reference rows, held in 4,183 files, naming 123,925 distinct keys or prefixes.

| kind \ holder | site | notes | moses-ledger | receipt | relay | nested-build |
|---|---|---|---|---|---|---|
| runtime-fetch | 3 | 0 | 0 | 0 | 0 | 0 |
| tool-read | 3,730 | 80 | 6,300 | 1,927 | 90 | 584 |
| hash-pin | 158 | 39 | 9,640 | 154,519 | 234 | 14,494 |
| provenance-cite | 128 | 24 | 22,280 | 22,761 | 4,936 | 2,918 |

Of those rows, 236,360 point into corpus-lane-builds/. The rest point to serving-lane/ (3,604), corpus-staging/ (2,945), moses-ledgers/ (1,045), moses-ia-wave-v1..v3, cold/, and a few small prefixes.

**The live site fetches nothing from R2.**
- Every fetch in zone.html is `${ROOT}data/...`, and no R2 host appears in any tracked page.
- The only R2 runtime road is switched off: zone-store `base` is null. If it is turned on, the page fetches `<name>.<sha12>.bin`, which is already content-addressed.

**Must stay real R2 keys (3,634 rows).**
- restore-shelf-from-history-v1.mjs reads serving-lane/shelf/zones/<name> for 3,594 pins and checks each against its sha256.
- push-toggles-v1.mjs reads MOSES-LEDGER-INDEX.md and lists or fetches about 9 moses-ledgers/ prefixes.
- push-toggles also reads 4 corpus-lane-builds/ prefixes. **These 4 are the only live reads of build folders by path.** They need a resolver (meta-file listing plus GET by sha256) or a materialize step.
- The delete ledger keeps 20 top-level channels "other lanes read" (K3-PREFIX).

**Can resolve through a meta-file lookup (62,127 rows).** These are path citations with no hash. They need three things:
- an alias table: moses-<b>/, CLB/, {TAB}/, {BUILDS}/ and builds: map to corpus-lane-builds/; r2:mishkan/ and {R2}/ map to the bucket root;
- the push map: 10 local folders map to moses-ledgers/<x>;
- a name index. The site cites 19 relay and rule files by bare name. 7 of those names exist at several keys with different bodies, so a name alone cannot pick the right one.

**Hash pins that must still verify.**
- 179,084 hash-pin rows; 182,681 rows carry sha256 when tool reads are counted, on 108,909 distinct keys.
- No md5 or ETag pins survived exact pairing.
- Scope: 167,977 same-build, 8,100 cross-build (4,198 keys), 6,486 outside the builds.
- **Rebuilding each file byte for byte keeps every pin valid, even if rows or chunks are shared underneath.** No reader addresses part of a file by a key of its own.
- Sample check: 193 of 200 small pinned objects match R2 today.
- Same path, different bytes: 706 keys carry two or more different sha256 pins. The site's pin on source-corpus-v1.json fails because the key was rewritten 5 minutes after the site pinned it. The meta file must keep every pinned version of a path.
- The serving-lane shelf backup holds only 89 of the 3,594 current pins, so it is not a working backup today.

**Site tools.**
- About 20 bake and projection tools read a local copy given by --from, --in, --record or --ledger, and stamp the R2 path plus its sha256 into the site's data. They need a materialize step (meta file plus content store rebuilt into a local folder) and can then run unchanged.
- Separately, the queue's declarations prefix doesn't resolve as typed: it is missing the corpus-lane-builds/ part.

**Moses's tools.**
- His builds read his local tree, which R2 mirrors. A third copy of the builds exists on the git road.
- His records show 17,119 recorded-input rows: 9,810 of them read other builds, and 8,218 carry a sha256.
- On R2 itself he lists (lsf, lsjson), checks (one-way), hashes (md5sum) and sizes; he uploads with copy --ignore-existing.
- Two key-level reads would need the resolver or must stay real: the source census reads the first 64 KiB of R2-only sources, and a compspan verify seat reads v13.5's copy from R2.

**Which builds are named.** Of the 230 builds on R2, the site, notes or a current relay name 34 (30.59 GB). The other 196 (65.40 GB) are named only by older records.

**What the meta file must hold:** path exactly as written, sha256, bytes, md5, version, build, copy-of, plus the alias table, push map and name index. The contract is (path, sha256) in, exact whole-file bytes out.

**Numbers**

- reference rows: 244,845 rows in 4,183 files, 123,925 distinct targets (MEASURED: 03-scan.py + 04-special.py + 05-summarize.py over site HEAD, notes diff and 7,744 R2 doc bodies)
- rows by kind: runtime-fetch 3, tool-read 12,711, hash-pin 179,084, provenance-cite 53,047 (MEASURED: refs.tsv counts)
- rows by holder: site 4,019; notes 143; moses-ledger 38,220; receipt 179,207; relay 5,260; nested-build 17,996 (MEASURED: refs.tsv counts)
- live site R2 runtime fetches: 0 (one dormant road: zone-store base = null) (MEASURED: read all fetch() calls in reader/zone.html at HEAD and grepped tracked HTML/JS/CSS for hosts)
- site tools that sign R2 requests: 2 (restore-shelf-from-history-v1.mjs, push-toggles-v1.mjs) (MEASURED: grep for SigV4 signing in reader/tools)
- must-stay-real-key rows: 3,634 (3,594 shelf pins + push-toggles prefixes + 20 K3-PREFIX channels + 3 dormant) (MEASURED: class A in summary-numbers.json)
- meta-lookup-ok rows: 62,127 (60,161 inside corpus-lane-builds) (MEASURED: class B in summary-numbers.json)
- sha256 pin rows: 182,681 rows on 108,909 distinct keys; md5/etag 0 after exact pairing (MEASURED: refs.tsv hash column)
- pin scope: same-build 167,977; cross-build 8,100 (4,198 keys); outside builds 6,486 (MEASURED: refs.tsv scope column)
- pin sample verifying today: 193 of 200 (96.5%); shelf 0 of 40 (MEASURED: downloaded and sha256-hashed 40 pinned objects of 3 MB or less per holder (06-verify-sample.py))
- keys pinned with 2+ different sha256: 706 of 108,909 (0.65%) (MEASURED: 09-pin-conflicts.py over refs.tsv)
- shelf backup pins matching current zone-store: 89 of 3,594 (2.5%), 0.64 GB shelf (MEASURED: compared sha256 in serving-lane/shelf/MANIFEST-shelf.json with reader/data/zone-store-v1.json; 2 objects spot-checked by download)
- short-form rows needing normalization: 64,008 (MEASURED: literal path absent on R2 but normalized form resolves)
- builds named by site, notes or current relay: 34 builds, 30.59 GB of 95.99 GB; the other 196 builds (65.40 GB) are named only by older records (MEASURED: builds-referenced.tsv with the delete ledger's 96 current relays)
- bare-name citations on the site: 19 names in 184 files; 7 ambiguous (2 to 289 keys, 2 to 283 distinct bodies) (MEASURED: 08-bare-names.py against listing and md5 table)
- Moses recorded-input rows: 17,119 in 1,065 files; 9,810 cross-build; 8,218 hashed (MEASURED: 10-extra.py (JSON input/from keys and read-verb lines); heuristic classification)
- chain-of-custody name pins on R2: 9,005 objects, 0.335 GB (3,180 in copy places) (MEASURED: lib.coc_name over bucket-now2.tsv)
- delete-ledger reference keeps (R2): K3-PREFIX 21 units 21.34 GB; K4 39 units 24.60 GB; K5 42 units 34.09 GB; R1 3 units 0.49 GB (MEASURED: ledger/keep.jsonl reasons)
- r2dupes mention pins also found by this scan: 1,279 of 1,285 (99.5%) (MEASURED: set overlap of refs.tsv targets)
- disk used by survey folder: 86 MB after deleting 297 MB of downloads (MEASURED: du -sh)

**Open questions**

- Should the four corpus-lane-builds/ prefixes that push-toggles-v1.mjs lists and fetches get a resolver (meta-file listing + GET by sha256), or a materialize step before --fetch?
- Will the shelf move into the content store (cas/sha256/xx/<sha256>)? restore-shelf already holds every sha256, and the backup on R2 matches only 89 of 3,594 current pins, so it needs refreshing either way.
- For the 706 keys pinned with more than one sha256: does Moses keep the older versions anywhere (his local tree, the git road) so the meta file can hold every pinned version, or are those versions gone?
- Should the site stamp full paths (and sha256) for relays and rules, instead of bare names like FOR-ELIJAH-v75.4.draft.md that exist at several keys with different bodies?
- Moses's git road (MashiachSonYosef/ai-sdk-starter-deepinfra, branch corpus-staging) also holds builds with SHA256SUMS. Is it in scope for the overlapped build or for deletion?
- The toggle queue's declarations-branch r2_prefix lacks 'corpus-lane-builds/' and resolves to nothing as typed. Should it be fixed now?
- Moses's recorded-input classification is heuristic (JSON input/from keys and read-verb lines). Is a stricter list of his tools' actual inputs available from him?

## Survey: hazards

**Note:** REPORT.md was not written. The harness blocks report files from subagents. The data and scripts are in /tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards/ (scripts/COMMANDS.sh lists every command). Every R2 call was a GET or HEAD.

**Bottom line**
- **Rebuilding builds from shared whole files is safe today.** Every object has a whole-object hash we can check.
  - 512,777 single-PUT objects: the ETag is the md5.
  - 32 multipart objects (14.05 GB): I streamed all 32. Each matched the md5 rclone stored with it, the ETag rebuilt from 5 MiB parts, and R2's own full-object CRC-64/NVME.
  - The 5,665 keys missing from Moses's md5 list (the earlier 5,636 plus 29 new) all have md5 ETags.
  - Zero of each: case collisions, file/folder collisions, keys ending "/", control characters, keys over 1,000 bytes.
- **Sharing rows inside files is the hard part.** About 40% of bytes sit inside gzip/zip (39.30 GB measured by name, plus about 8.19 GB of gzip .bin files, estimated).
  - Test on 23 gzip objects: 13 recompressed byte-exact only with Node 22's bundled zlib, 7 only with Python's zlib, 3 with neither, 0 with both.
  - So row sharing inside compressed files needs a recorded and proved recipe per file, with the whole bytes kept when a recipe fails. Uncompressed text is 65.76 GB (56%); byte-exact chunks are safe there.
- **R2 keeps no versions.** ListObjectVersions answers 501, so a delete or overwrite is final. Everything must be checked before any delete.
- **Real size:** 288,197 distinct contents, 68.24 GB, against 117.35 GB listed (49.11 GB of copies).

**What the meta file must record**
- *Per distinct content (stored once):*
  - sha256 as the name, `cas/sha256/xx/<hex>`. Receipts pin by sha256: 182,681 pins, 0 md5.
  - bytes and md5 (the md5 is the ETag for single PUTs).
  - crc64nvme, which R2 returns on HEAD, so a check needs no download.
  - For objects over 200 MiB: part size 5,242,880 and part count.
  - Where it lives: its own CAS key, or pack + offset + length. Ranged reads worked 951/951.
  - Only if stored as rows: the chunk sha256 list plus a wrap recipe (gzip header bytes incl. OS byte, mtime, XFL, FNAME; zlib build and version; level; memLevel) and a stored sha256 proof.
- *Per key:*
  - The key exactly as listed. Never normalize it: one key would change on a Mac disk.
  - Its content sha256.
  - Content-Type as stored. It varies by uploader: .ts is video/vnd.dlna.mpeg-tts; the serving lane's r2put.mjs labels .py/.mjs/.tsv/.txt text/markdown.
  - Content-Encoding, which must stay none: zone.html hashes the raw body, then gunzips it itself.
  - Every x-amz-meta-* (mtime, md5chksum, sha256).
  - The checksum algorithm used on upload.
  - Last-Modified, ETag and size at capture, as the guard before deleting.
- *Per build:*
  - The object list and a build hash over sorted path/sha256/bytes lines.
  - Zero-byte files listed explicitly (11,182).
  - For local rebuilds only: links (Moses has 14,941; 873 are recorded, and R2 has nothing at any of the 873), 56 empty folders, and hard-link groups.
  - Capture time, tool versions, and a RULE + sha256 + RECEIPT, as Moses already writes them.

**Reusable machinery**
- **cas/ prefix:** 15 objects written by the corpus lane's "R2 disposition conveyor" at 03:31 UTC, with receipt disposition/r2-conveyor-closed-codex-child-batch01-a83b83d71608.json. They are archived Codex sessions from C:/Users/Kyle/.codex, not corpus data. Moses's RULE keeps cas/ as a K3 prefix, and nothing in the site's tools refers to it.
- **Manifest shapes already in use:** sha256sum lists, MANIFEST-shelf.json, store-manifest-v1, and Moses's RULE.md.sha256 / RECEIPT / links.jsonl / hardlink-groups.jsonl.
- **Site tools that only write what matches its sha256:** restore-shelf, pull-zones-from-store, push-toggles --fetch. zone.html also has a dormant fetch path that names files by the first 12 hex of their sha256.
- **Not reusable:** scratchpad/bake-r2-backup.mjs is an earlier draft of bake-search-index, despite its name. It makes no R2 calls.

**Side finding:** the R2 shelf backup (2026-09-28) is stale. 3,505 of the site's 3,594 current zone pins differ from it, so restoring from R2 would recover only 89.

**R2 limits and prices:** the docs host could not be reached from here, so every documented figure is unconfirmed. Measured here: 1,000 keys per list page, the full-object CRC, ranged reads, and no versions.

**Numbers**

- bucket keys / bytes at listing: 512,809 keys / 117,348,031,413 bytes (MEASURED: ListObjectsV2 over the whole bucket, 513 pages, 2026-10-18 16:46-16:50 UTC (bucket-etag.tsv))
- new keys since bucket-now2.tsv (~02:00 UTC): 29 keys / 18,990,297 bytes, all serving-lane-handoffs/; 0 vanished, 0 rewritten (MEASURED: key-by-key comparison of the two listings)
- keys without rclone md5: 5,665 keys / 1,490,863,928 bytes; all 5,665 have single-PUT (md5) ETags (MEASURED: listing vs 02-r2-md5.tsv (507,144 lines))
- rclone md5 vs single-PUT ETag: 507,112 equal, 0 differ, 0 size changes (MEASURED: key-by-key comparison)
- multipart objects: 32 keys / 14,050,572,791 bytes (12.0%); 41-770 parts of 5,242,880 bytes; 30 in corpus-lane-builds, 2 in cold (MEASURED: ETag -N suffix in listing; part size from rebuilt ETags)
- multipart verification: 32/32: md5 = x-amz-meta-md5chksum = rclone md5; rebuilt 5 MiB ETag = listing ETag; computed CRC-64/NVME = R2 x-amz-checksum-crc64nvme; 24 distinct contents, 11,393,322,205 bytes (MEASURED: streamed GET of all 32 (625 s, 22.5 MB/s, nothing written to disk) plus HEAD)
- rclone multipart cutoff: all 32 objects over 209,715,200 bytes are multipart; largest single PUT 205,996,456 bytes (MEASURED: listing)
- distinct contents (real size): 288,197 contents / 68,237,871,686 bytes; copies 49,110,159,727 bytes (MEASURED: (md5,size) over listing, using streamed md5 for the 32 multipart objects)
- zero-byte keys: 11,182 (all md5 d41d8cd9...), 0 end in '/' (MEASURED: listing)
- keys ending in '/': 0 (MEASURED: listing)
- keys with spaces: 280 / 669,296,011 bytes (MEASURED: listing)
- keys with non-ASCII: 43,937 / 366,454,276 bytes; 0 not NFC; 1 changes under NFD (MEASURED: listing, Python unicodedata)
- keys with control chars / tab / ';' / backslash: 0 (MEASURED: listing (all XML entities decoded))
- keys over 1,000 bytes: 0; longest key 353 bytes (MEASURED: UTF-8 length over listing)
- path segments over 255 UTF-8 bytes: 38 keys (max 308 bytes, at most 190 UTF-16 units): cannot be written on ext4/APFS, OK on NTFS (MEASURED: listing)
- keys whose local Windows path would pass 259 characters: 1,506 (ESTIMATED: key length plus the assumed root C:/Users/Kyle/Documents/The Tabernacle/ (inferred from key fragments))
- keys with '%' / with '()[]{}!$,=': 378 / 1,540 (MEASURED: listing)
- case collisions; Unicode-normalization collisions; folder case splits: 0; 0; 0 (MEASURED: casefold and NFC grouping of all keys and prefixes)
- file/folder collisions: 0 (also 0 when case is ignored) (MEASURED: every key tested against all folder prefixes)
- Moses local links: 14,941 in CLB (1 in FS); 873 recorded with targets (866 into the Tabernacle, 7 to footsteps); 0 of 873 have anything on R2 (MEASURED: inventory-local totals.json; mend-r2/r3 links.jsonl against the listing)
- Moses local hard links / empty items: 23,685 files, 135.55 GB, 3,171 identities / 56 empty items (MEASURED: Moses's inventory-local totals.json and inventory-local.jsonl)
- HEAD metadata sample: 630 objects (22 top-level prefixes, 102 extensions) plus all 3,595 serving-lane objects = 4,221 distinct (MEASURED: HEAD with x-amz-checksum-mode ENABLED and accept-encoding identity)
- Content-Encoding / Cache-Control / Content-Disposition / Content-Language / Expires: 0 of 4,221 (MEASURED: HEAD)
- x-amz-meta-mtime: 607/630 sample (every rclone upload); 0/3,595 serving-lane; recorded file time minus upload time 103 s to 406,768,985 s, median 22,016 s (MEASURED: HEAD)
- server checksums: crc64nvme 626/630 sample and 254/3,595 serving-lane; crc32 4/630 and 3,341/3,595; none missing (MEASURED: HEAD)
- x-amz-meta-sha256 on serving-lane shelf: 3,594/3,595, all equal to MANIFEST-shelf.json pins (MEASURED: HEAD vs downloaded manifest)
- stale shelf backup: 3,505 of 3,594 current site zone pins differ from the R2 backup; 89 match (MEASURED: ghp reader/data/zone-store-v1.json (main afcd21c) vs MANIFEST-shelf.json)
- compressed containers: 197,050 keys / 39,298,792,792 bytes by .gz/.zip/... name; plus 47,109 .bin keys / 8,192,278,426 bytes (MEASURED: listing by extension)
- share of .bin that is gzip: about 39 of 40 (ESTIMATED: 512-byte ranged reads of 40 sampled .bin objects (1 was an HTML page))
- gzip header sample: 432 read: 421 gzip, 10 zip, 1 HTML; OS byte NTFS 380 / Unix 38 / unknown 3; mtime 0 on 415; FNAME on 3; XFL level-9 179 / default 241 / fastest 1 (MEASURED: 512-byte ranged GETs, stratified sample)
- recompression test: 23 gzip objects: Node 22 zlib only 13, Python zlib only 7, neither 3, both 0 (MEASURED: raw-deflate body comparison at levels 1-9, memLevel 8/9)
- text line endings: 519 sampled: LF 504, CRLF 7, no newline 8; BOM 4 (MEASURED: 4 KiB ranged GETs)
- receipt pins by algorithm: sha256 182,681; md5 0 (MEASURED: sibling survey meta/readers/refs.tsv column hash_algo_if_pinned)
- reliance on R2 Last-Modified: 0 files quote LastModified/last_modified in 424 MB of Moses's ledger download (MEASURED: grep)
- ListObjects page cap: 1,000 keys (asking for 5,000 or 1,001 returned 1,000) (MEASURED: read-only list probes)
- object versions: ListObjectVersions answers 501 NotImplemented; ?versioning, ?lifecycle and ?cors answer 403 (MEASURED: signed GET probes)
- cas/ prefix: 15 objects / 55,520,065 bytes, 2026-08-29 03:31:16-03:31:32 UTC; receipt 03:31:44; no other key shares their content (MEASURED: listing, receipt download, sha256 of one object equal to its key)
- R2 documented limits (single PUT about 5 GiB, object about 5 TiB, parts 5 MiB-5 GiB up to 10,000, key 1,024 bytes): unconfirmed (From memory; developers.cloudflare.com unreachable (DNS ENOTFOUND, proxy 403))
- R2 prices ($0.015/GB-month; Class A $4.50/M; Class B $0.36/M; delete and egress free): unconfirmed; implies about $1.76/month for 117.35 GB and about $1.30 to write 288,197 CAS objects once (ESTIMATED from unconfirmed prices)

**Open questions**

- Confirm R2's documented limits and prices from a machine that can reach developers.cloudflare.com: max single PUT, max object size, part limits, key length, metadata size, operation classes. The URLs: https://developers.cloudflare.com/r2/platform/limits/, /r2/pricing/, /r2/objects/multipart-objects/, /r2/api/s3/api/.
- Is any R2 object served to the public (a public bucket or custom domain)? If so, Content-Type and the absence of Content-Encoding become part of what serves.
- Do these keys simply lack bucket-level read rights (403 on ?lifecycle), or does a lifecycle rule exist that could expire objects on its own?
- Should the meta file rebuild Moses's local tree as well (14,941 links, 56 empty folders, hard links, file times), or only the R2 view?
- Row sharing inside compressed files: accept a recorded compressor recipe plus a stored sha256 proof, or keep every compressed file whole and share rows only across uncompressed files?
- Should the stale serving-lane shelf backup (3,505 of 3,594 pins behind the site) be refreshed first? It is the site's only off-disk copy of its zone bins.
- The full report text could not be saved as REPORT.md because the harness blocks subagent report files. Should the orchestrator write it from this result?

## Survey: copies

**Every other copy of the builds (read only; no R2 call was needed; 69 MB of scratch used).** GB means 10^9 bytes.

**Copies table**
- **R2 `mishkan`:** 117.33 GB in 512,780 keys. 66.75 GB of it is distinct content (distinct md5+size), plus 1.47 GB in 5,636 newer keys that have no md5. 18.28 GB of the distinct content has no second copy that any hash shows. Only 0.09 GB of that is under `corpus-lane-builds/`. The rest:
  - `cold/` 5.37 GB
  - IA waves 7.72 GB
  - `corpus-staging/` 3.03 GB
  - `moses-ledgers/` 1.42 GB
  - `editions-built-v1/` 0.69 GB
  - `serving-lane/` 0.59 GB
  - `cas/` 0.06 GB
- **Moses, CLB (`<tabernacle>/corpus-lane-builds`, 248 build folders):** 212.84 GB of names on 89.37 GB of physical bytes, because 125.38 GB are hard-link duplicate names.
  - 48.47 GB of R2's 48.56 GB of distinct build content is here, proved by hash.
  - Mapping: 229 build folders sit at `corpus-lane-builds/<name>/` on R2. 17 sit at `moses-ledgers/<name minus moses->/`. 7 also have a top-level R2 prefix of the same name (the IA waves and others). `moses-accent-types-v1` (3.12 GB) is not on R2 at all.
  - Content with no R2 copy:
    - 919 files (1.19 GB) have no R2 key of the same md5 and size anywhere. Most are piece-store-v2 run-r1 and run-r2 (1.06 GB) and accent-types scratch (0.13 GB).
    - About 2.99 GB more of accent-types was never hashed.
    - About 0.12 GB of rclone `+` files.
  - Moses's ledger says "4,766 files, 3.17 GB with no copy", but it counts only copies in places it keeps. 2.38 GB of those bytes sit on R2 at the same path, inside R2 copies of the scratch folders.
- **Moses, 999 footsteps:** 76.14 GB, never hashed against R2. Same-named R2 prefixes hold at most about 3.35 GB, so roughly 70 GB is on that disk only (estimated). That includes 24.92 GB of source caches and a 2.71 GB `.git`.
- **Moses, `<tabernacle>` outside corpus-lane-builds:** never inventoried. 314 hard-link groups (34.5 MB) have names there.
- **Site git:** one object store of 5.4 GB at /home/user/mashiachsonyosef.github.io/.git; `ghp` is a worktree of it. It holds 226,049 blobs (44.70 GB uncompressed, 5.37 GB on disk). The clone is shallow; GitHub is the durable copy.
  - Only 365 MB of distinct R2 content is also in git, and its R2 copies are mostly Moses's check caches of site files. Only 6.1 MB of R2 content has git as its sole second copy.
  - Live `reader/data`: 1,753 files. 604 of them (26.0 MB) are byte copies of R2 build outputs: 83 shelf bins, 258 Jastrow overlay files and 259 Samaritan overlay files, plus 4 small files. The other 1,149 files (252 MB) are site bakes that are not on R2.
  - Branches:
    - `workbench-archive`: 23.26 GB tree, 0 files byte-equal to R2.
    - `origin/gh-pages` contains `origin/main`; the trees differ only in README.md.
    - The local branch named `main` points at the workbench-archive commit `4196361a7`, not the live main.
    - The local `gh-pages` is 6 commits behind `origin/gh-pages`.
  - The site cites 171 paths. 107 resolve on R2. 64 do not; 57 of those look like 999 footsteps source-cache paths.
- **Notes repo:** the same repository and objects. Branch `claude/awesome-hypatia-2pxz43` holds a site snapshot plus `wip/` (90 files, 27.0 MB). It holds no build outputs of its own.

**Plan's last-copy finding (the 3.49 GB case).** Elijah's 17 Oct R2 list and Moses's T1+T3 local tiers were each safe alone. Run together they would leave 6,247 files (3,487,947,626 bytes, 64 builds) with no copy anywhere; compspan-backwards-v1 alone is 1.69 GB of that. The cause: 199 lines of the R2 list held the only kept R2 copy of files those tiers delete.

**For the meta file**
- **Must index:**
  - R2, every prefix.
  - CLB, by inode, so hard-link names count once.
  - 999 footsteps. It holds about 70 GB found nowhere else, is the probable second copy of `corpus-staging/`, and is where 57 cited paths point.
  - Git, once, by blob hash.
- **May ignore:** the notes repo as a separate place, this cloud machine's scratch copies (a reset already wiped 3,448 shelf bins on 2026-09-23), hard-link duplicate names, and the workbench archive.
- **Design rules:**
  - One joint index across both lanes. Every delete is checked against it: does every content keep its required copies?
  - A hash for every path. 10 of the 276 R2 stage-mirror objects differ from the key they mirror, so "folder X mirrors folder Y" is not safe.
  - Both md5 (what R2 and rclone compare) and sha256 (Moses's receipts and the existing `cas/`).
  - An alias table from cited paths to content hashes, so citations keep resolving after old build folders go.

**Numbers**

- R2 bucket total: 117,329,041,116 bytes in 512,780 keys (MEASURED: clean/bucket-now2.tsv listing, 18 Oct)
- R2 distinct content (md5+size): 66,754,959,339 bytes in 283,719 contents, plus 1,471,873,631 bytes in 5,636 keys without an md5 (MEASURED: 17 Oct md5 table, grouped by (md5,size); newer keys from the 18 Oct listing)
- R2 corpus-lane-builds distinct content also proved on Moses's CLB: 48,467,425,078 of 48,562,002,029 bytes (99.8%) (MEASURED: hashes from Moses's rclone check '=' lines plus his scratch md5 proofs, matched to R2's md5 table (script 08))
- R2 distinct content with no second copy by any hash: 18,281,451,042 bytes (corpus-lane-builds 94.6 MB; cold 5.37 GB; moses-ia-wave-v1 4.72 GB; corpus-staging 3.03 GB; moses-ia-wave-v2 2.99 GB; moses-ledgers 1.42 GB; editions-built-v1 0.69 GB; serving-lane 0.59 GB; cas 0.06 GB) (MEASURED: R2 contents not in the set of hashes known on Moses's disk or in git blobs (script 08))
- CLB size: 212,840,235,823 bytes of names, 89,369,278,405 physical, 345,915 files, 248 build folders (MEASURED by Moses's inventory-local walk, 17 Oct)
- CLB hard-link duplicate names: 125,383,304,380 bytes (MEASURED: hardlink-groups.jsonl, size x (paths seen - 1))
- CLB files hash-equal to R2 at the same path: 264,529 files, 71,820,535,707 bytes (MEASURED: Moses's rclone check --one-way '=' lines; sizes from the R2 md5 table)
- CLB scratch/sandbox/gate units: 218 units, 135,270,766,130 bytes: 120.25 GB hard links of files on R2, 10.72 GB hashed and on R2, 4.31 GB (5,393 files) not in a kept place (MEASURED: Moses's proofs/scratch files.jsonl and matches.jsonl)
- CLB files with no R2 copy anywhere: 919 files, 1,191,809,188 bytes (piece-store-v2 run-r1 and run-r2 1,057,777,342; accent-types-v1 scratch 128,784,024) (MEASURED: md5+size of Moses-hashed files against every R2 key (17 Oct) and no R2 path on 18 Oct (script 03))
- CLB rclone '+' and '*' remainder: 732,690,061 bytes (1,060 '+' and 4 '*' lines); about 0.12 GB of it not hard links (ESTIMATED by subtraction: unit bytes minus '=' bytes; hard links from hardlink-groups (script 04))
- CLB builds not swept by rclone check: 5,016,243,925 bytes in 22 builds (accent-types-v1 2.99 GB not on R2; 17 moses-ledgers builds 1.50 GB at the same path and size on R2; dictionary-store-v1 0.52 GB) (MEASURED bytes; the copy status is ESTIMATED from path+size (shipment-to-local.tsv) or from the name being absent on R2)
- 999 footsteps size: 76,141,594,474 bytes, 74,229,247,512 physical, 687,009 files (MEASURED by Moses's inventory-local walk)
- 999 footsteps with no same-named R2 copy: about 70 GB (of which source caches 24.92 GB, definition-poc 14.85 GB, rebuild-c0-w 25.64 GB, .git 2.71 GB) (ESTIMATED: FS folder sizes minus the bytes of same-named R2 prefixes (corpus-staging 3.07 GB, cold editorial-999, FS/corpus-lane-builds); FS was never hashed)
- The 3.49 GB case: 6,247 files, 3,487,947,626 bytes in 64 builds left with no copy if Elijah's 17 Oct R2 list and Moses's T1+T3 ran together (MEASURED earlier in review/safety/14_combined_unique_loss (read here, not rerun))
- Site git object store: 5.4 GB on disk (loose 1.08 GiB + packs 4.29 GiB); 226,049 blobs, 44,697,396,038 bytes uncompressed, 5,374,655,193 on disk; 1,318 commits; shallow (MEASURED: git count-objects -vH; rev-list --objects --all piped to cat-file --batch-check)
- Git blobs equal to R2 objects: 4,148 distinct contents, 365,321,230 bytes; R2 content whose only second copy is git: 6,083,219 bytes (MEASURED: md5 of 116,343 blobs whose size equals some R2 object's size (scripts 06, 07, 08))
- Live reader/data copies of R2 build outputs: 604 of 1,753 files, 26,016,265 bytes (shelf 22.7 MB, Jastrow 2.65 MB, Samaritan 0.59 MB) (MEASURED: origin/main tree blobs matched by md5+size to R2 keys outside cache/scratch/gate folders (script 09))
- workbench-archive tree: 51,969 files, 23,264,240,597 bytes, 0 files byte-equal to R2 (MEASURED: git ls-tree -r -l origin/workbench-archive matched against R2 md5)
- Site-cited paths: 171 cited; 107 resolve on R2; 64 do not (57 look like 999 footsteps paths) (MEASURED key/prefix match in the bucket listing, trying the path as written, with corpus-staging/ and with moses- in front; the footsteps reading is ESTIMATED from the path shape (script 11))
- Notes repo working notes: 90 files, 26,954,251 bytes under wip/; branch tree 2,523 files, 174.3 MB (MEASURED: git ls-tree on claude/awesome-hypatia-2pxz43)
- R2 stage-mirror objects: 276 objects; 266 (662,068,732 bytes) equal to the mirrored key; 10 (323,129 bytes) differ (MEASURED: md5 of mirror key against md5 of the key with the stage/Documents/The Tabernacle/ part removed (script 10))

**Open questions**

- Will Moses hash 999 footsteps (md5 + sha256, inode-aware)? Nothing under R2 corpus-staging/ or cold/ is safe to delete until FS/corpus-refinement-v1/work, FS/ledgers/work, FS/rebuild-c0-w/output, FS/corpus-lane and FS/editorial-999 have been compared with R2.
- moses-accent-types-v1 (3.12 GB) was never uploaded to R2: should it go into the meta store, or is it scratch?
- moses-piece-store-v2/build/outputs/run-r1 and run-r2 (1.06 GB of checker copies) have no R2 copy: keep them or let them go?
- <tabernacle> outside corpus-lane-builds was never inventoried (README.md, SHA256SUMS-*.txt, CORPUS-SWEEP-PLAN-2026-08-21.md and the rest). What is there?
- Which repositories are FS/.git (2.71 GB, written 17 Oct) and the two site/.git folders under FS/corpus-refinement-v1, and do they have remotes?
- The IA waves (7.72 GB) and cold/ (5.41 GB; editorial-999 work and the 4.04 GB evidence tar) have R2 as their only copy: does the owner accept one copy, or want a second?
- 64 of the 171 site-cited paths do not resolve on R2 (57 point into Moses's 999 footsteps source caches, 7 to nothing found): should the site re-point them, or should the meta store take those files in?
- The harness refused to write REPORT.md from this subagent: should the parent write it from this result?
- The local branch named main points at the workbench-archive commit 4196361a7, not the live main: tools that read the local main get the old tree.

