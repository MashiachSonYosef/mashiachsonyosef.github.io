# The overlapped build: a meta file that is the build

Design from one angle: the owner's "one overlapped build", taken fully. Successive versions share rows. The meta file is the build. Written 18 October 2026 by Elijah's side (the serving lane), for the owner and Moses (the corpus lane). The owner decides.

Nothing on R2 was written or deleted for this design. R2 was only read (GET and HEAD). Every number says whether it was **MEASURED** (and how) or **ESTIMATED** (and from what). GB means 10^9 bytes. Build names such as `moses-licence-ledger-v1` are identifiers and are kept exactly as they are spelled on R2.

Scripts, outputs and the run order: `meta/design-overlapped/scripts/` (`COMMANDS.sh`) and `meta/design-overlapped/out/`.

---

## 1. The idea in one paragraph

Every file that any build ever held is opened (a `.gz` file is inflated first) and cut into short pieces. Each piece ends at the end of a row (a line), and the row's own content decides where the cut falls. Each distinct piece is stored once, in a few hundred packed objects. The meta file lists every build, every path in it, and a recipe for each path's exact bytes: which pieces, in what order, and for a `.gz` file which recorded compressor setting wraps them again. A new version stores only the pieces it changed. So two recipes side by side say "v2.4 differs from v2 by this one row", and the tool reads only the pieces that differ to show that row. A rebuild tool turns any build back into its exact files and proves each one by sha256 and md5 against what R2 recorded. Every build, not a sample, must pass that proof, from two copies of the store, before the owner names anything to delete. After that, the hundreds of build folders can go. What stays is the meta file plus the packs: one overlapped build. Its stored size is the corpus's true size.

**How much "overlapped" matters (the question the owner raised).**

- **For the versions themselves, a great deal.** On the old-witness tables (MEASURED, section 7), 59 keys and 2.43 GB on R2 hold 5 distinct files. Those come down to 19.2 MB as overlapped pieces, against 84.2 MB when each file is compressed alone: 4.4× better from sharing rows alone. The overlap survey MEASURED 2.16× for compspan, 1.7× to 2.0× for witnessed-order and 1.69× for run-ledger-backwards.
- **For the whole bucket, modestly.** Sharing rows saves about 3 GB beyond compressing each file alone (ESTIMATED by the overlap survey, about 10 %). Most of what is left after compression is source captures that have no versions:
  - Internet Archive OCR token files, about 5.6 GB;
  - the cold tarball, about 2.5 GB;
  - binaries and media, about 4.9 GB.

  All three are ESTIMATED from the overlap survey's class figures.
- **What taking it fully really buys** is the row-level answer, plus each build's true added cost in bytes, more than the bytes themselves.

---

## 2. The meta file's exact shape

### 2.1 Format

The meta file is **one file of JSON Lines, compressed with brotli**:

`overlap-store-v1/meta/overlap-meta-v1.0.jsonl.br`

- One JSON object per line, UTF-8, with non-ASCII characters written as they are (no `\u` escapes).
- Every record has a type field `t`. The first line is the `root`.
- The record types follow in a fixed order: `root`, `build`, `key`, `content`, `pack`, `lineage`, `pin`, `alias`. Within a type, records are sorted by their first field, so two meta versions can be compared line by line.

The reasons for each choice:

- **JSONL** because every tool on both lanes already reads it, and it streams.
- **Brotli** because Moses's tools are "node and rclone only" (his delete ledger's RULE), and Node has brotli built in but no xz. On the prototype pack, brotli matched xz within 0.4 % (MEASURED, section 7).
- **One file** because the owner asked for one meta file. It is about 60 to 110 MB compressed (ESTIMATED, section 7). A tool streams it once and keeps the parts it needs.
- **The chunk index is not in the meta file.** It lives at the end of each pack (section 3), so the meta file stays small.

### 2.2 Top-level record (`root`)

| field | meaning |
|---|---|
| `schema` | `"overlap-meta-v1"` |
| `version`, `parent` | `"1.0"`; sha256 of the previous meta file, or null. A new meta version never replaces an old one. |
| `made_at`, `made_by` | time, lane, tool sha256s |
| `covers` | the frozen listing this meta file covers: its R2 key, sha256, key count, bytes, listing start and end times |
| `counts` | builds, keys, contents, packs, whole objects, chunks |
| `sizes` | listed bytes, distinct bytes, stored bytes (packs plus whole objects), meta bytes |
| `hash` | content id = sha256 of the exact object bytes; md5 and crc64nvme also kept; chunk id = sha256 (first 8 bytes kept in the pack index) |
| `chunking` | the exact cut rule (section 3.3), so a later ingest cuts the same way |
| `codec` | brotli settings for packs and for the meta file |
| `deflaters` | each pinned gzip maker by id, with the sha256 of its runtime, which is stored in the store |
| `units_rule` | the census unit rule, verbatim, so build names match the census and the delete ledger exactly |

### 2.3 Per-build record (`build`)

One record per unit under the census rule: 290 units in the 16:46 UTC listing. That is the census's 289 plus `serving-lane-handoffs/elijah-delete-plan-v1/`, which is newer (MEASURED, `out/keys/keys-numbers.json`).

Fields:

- `u` (the unit prefix, exactly as the census writes it), `family`, `version`, `status`, `status_why` (copied from census `builds.tsv`), `prev` (the previous version's unit);
- `keys`, `bytes`, `distinct_contents`, `distinct_bytes`;
- `contents_shared_with_prev`, `new_contents`, `new_content_bytes`, `new_chunk_bytes` (raw bytes of pieces this build stored first, taking versions in order);
- `files_sha256`: sha256 over the sorted lines `path<TAB>sha256<TAB>bytes<LF>`, with the path relative to the unit. This is the same idea as Moses's `SHA256SUMS`, as one hash;
- `first_modified`, `last_modified` (R2 upload times, not build dates);
- `receipts` (the RULE and RECEIPT files inside the build);
- `holds_copies_of` (the nested builds the census found).

### 2.4 Per-file record (`key`)

One record per R2 key: 512,809 at 16:46 UTC.

Fields:

- `k`: the key exactly as listed, never normalized;
- `u`: the build unit;
- `c`: the content sha256;
- `s`: bytes;
- `md5`, and `etag` (written only when it differs from md5, which happens for multipart uploads);
- `lm`: last modified at capture;
- `ct`: Content-Type as stored;
- `meta`: every `x-amz-meta-*` value;
- `crc64nvme` or `crc32`, whichever R2 returns;
- `parts` (multipart only): `{size, count}`;
- `copy_of`: the original key, when the census found this key to be a nested copy.

### 2.5 Per-content record (`content`)

One record per distinct object content: 288,197 (MEASURED by the hazards survey).

Fields:

- `sha256` (the id), `md5`, `bytes`, `crc64nvme`;
- `form`, one of:
  - `empty`;
  - `chunks`: the bytes are pieces;
  - `gzip`: a wrap recipe around an `inner` pieces recipe;
  - `whole`: kept as one object;
- `recipe` or `inner`: a list of extents `[pack, first_chunk, count]`;
- `rows`: true when the content is line-oriented text;
- `lineage`: the content at the same place in the previous version;
- `keys`: how many keys hold this content.

### 2.6 Other records

- **`pack`**: id (sha256 of the pack object), bytes, raw bytes, chunk count, block count, codec, families held.
- **`lineage`**: one record per older-to-newer pair of contents at the same place, matched by the path with its version token removed (or, failing that, by the largest share of pieces in common). It gives rows in each version, rows removed and added, bytes removed and added, and pieces changed.
- **`pin`**: each sha256 pin the readers survey found (182,681 rows), with its status at capture: `verifies`, `differs-at-capture` or `target-absent`.
- **`alias`**: the alias table, the push map and the name index (section 5).

### 2.7 Example records built from real keys

Keys, sizes, md5s, Content-Types, times and R2 checksums below are real. They are MEASURED from the md5 table, the 16:46 listing and HEAD requests (`out/example-heads.jsonl`). sha256 values are MEASURED by downloading and hashing, and each one matched the sha256 the build's own RECEIPT pins, except the `r2-push-v1.1.txt` hash, which no receipt pins.

Extents for the old-witness tables are real, from the prototype store. A field marked `"(at ingest)"` cannot be known until the real ingest runs.

**1. A current build (served).** Numbers are from census `builds.tsv` and the md5 table. "Shared with prev" is MEASURED by comparing the content sets of the two versions.

```json
{"t":"build","u":"corpus-lane-builds/moses-compspan-v13.8/","family":"moses-compspan","version":"13.8","status":"current","status_why":"served: zones (39 books) emitted_from.span_ledger relay \"corpus lane v59.3\"","prev":"corpus-lane-builds/moses-compspan-v13.7/","keys":2399,"bytes":2552832128,"distinct_contents":850,"distinct_bytes":1123224024,"contents_shared_with_prev":606,"bytes_shared_with_prev":964476953,"new_contents":244,"new_content_bytes":158747071,"new_chunk_bytes":"(at ingest)","files_sha256":"(at ingest)","first_modified":"2026-10-09T06:17:20Z","last_modified":"2026-10-09T06:27:29Z"}
```

**2. A file of that current build, whose bytes are shared with the superseded v13.7.**

The same 183,854 bytes sit at 13 keys under five different file names (`amos.spans-ledger-v5.json`, `-v4`, `-v3`, `amos.declared-spans-v1.json`, `-v2`). That is MEASURED by md5, and it shows that a version number in a file name is not a content version.

```json
{"t":"key","k":"corpus-lane-builds/moses-compspan-v13.8/build/spans-ledger/amos.spans-ledger-v5.json","u":"corpus-lane-builds/moses-compspan-v13.8/","c":"ae98682c92547163a6fb2f21616dd83d543b8cda14ce22c795330169109142b1","s":183854,"md5":"4c5887063a11ef3aeed9eed430590844","lm":"2026-10-09T06:17:21.569Z","ct":"application/json","meta":{"mtime":"1791515554.4871528"},"crc64nvme":"4rgeIWWMg+s="}
{"t":"key","k":"corpus-lane-builds/moses-compspan-v13.7/build/spans-ledger/amos.spans-ledger-v5.json","u":"corpus-lane-builds/moses-compspan-v13.7/","c":"ae98682c92547163a6fb2f21616dd83d543b8cda14ce22c795330169109142b1","s":183854,"md5":"4c5887063a11ef3aeed9eed430590844","lm":"2026-10-09T04:28:13.255Z","ct":"application/json","meta":{"mtime":"1791515554.4871528"},"crc64nvme":"4rgeIWWMg+s="}
{"t":"content","sha256":"ae98682c92547163a6fb2f21616dd83d543b8cda14ce22c795330169109142b1","md5":"4c5887063a11ef3aeed9eed430590844","bytes":183854,"crc64nvme":"4rgeIWWMg+s=","form":"chunks","rows":true,"recipe":"(at ingest)","keys":13}
```

**3. A superseded version's `.gz` file, as one content: the wrap recipe, the row pieces and the row difference.**

`moses-witnessed-order-v2.4` is superseded (census: "newer version on R2: moses-witnessed-order-v2.5; newest own relay FOR-ELIJAH-v31.md SUPERSEDED").

- Its 41,170,279-byte table inflates to 942,420,132 bytes.
- It differs from v2.3's table by **one removed row and nothing added**. v2.3's table has the same bytes as v2's (MEASURED, section 7).
- The gzip header `1f8b080000000000000a` means no name, mtime 0, and OS 10 (Node on Windows).
- The deflater shown rebuilt the file byte for byte on its first try (MEASURED).

```json
{"t":"content","sha256":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","md5":"3699c6a254d13ae94040610c3b6e5691","bytes":41170279,"crc64nvme":"JIYuu8nTfPw=","form":"gzip","keys":8,
 "wrap":{"header_hex":"1f8b080000000000000a","deflater":"node-22.22.0-zlib-1.3.1-470d3a2","call":"deflateRawSync","level":6,"memLevel":8,"strategy":"default","feed":"whole input at once","trailer":"derived: crc32 and size of inner"},
 "inner":{"sha256":"4eb612c87a9f5d199f42a099cc4ecc0408175020d25c40f9264a0e4db7edbb3f","bytes":942420132,"rows":2455757,"chunks":58626,"extents_count":26739,"extents_first":[[0,0,2],[0,3,4],[0,8,5],[0,14,1]]},
 "lineage":{"prev":"49a605e92f25bd12a06dacdfe1d53e7f2948fb59fd153d7c929f3f83b5c8a2a2","prev_key":"corpus-lane-builds/moses-witnessed-order-v2.3/old-witness-table-v2.3.jsonl.gz","match":"path-stem old-witness-table-v{N}.jsonl.gz","rows_removed":1,"rows_added":0,"bytes_removed":446,"chunks_changed":1}}
```

**4. A nested copy:** a search-ledger gate mirror holding the same bytes as example 3.

```json
{"t":"key","k":"corpus-lane-builds/moses-search-ledger-v1.8/strand-1-fix/gate/m16/moses-witnessed-order-v2.4/old-witness-table-v2.4.jsonl.gz","u":"corpus-lane-builds/moses-search-ledger-v1.8/","c":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","s":41170279,"md5":"3699c6a254d13ae94040610c3b6e5691","lm":"2026-10-09T05:22:17.121Z","ct":"application/x-gzip","meta":{"mtime":"1790199856.0165124"},"crc64nvme":"JIYuu8nTfPw=","copy_of":"corpus-lane-builds/moses-witnessed-order-v2.4/old-witness-table-v2.4.jsonl.gz"}
```

**5. A zero-byte file.** Its content is shared by 11,182 keys (MEASURED by the hazards survey) and is stored nowhere, because it has no bytes.

```json
{"t":"key","k":"corpus-lane-builds/moses-witnessed-order-v1/verify-guard-b-agrees-with-aligned-1/10-reproduce.err.txt","u":"corpus-lane-builds/moses-witnessed-order-v1/","c":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","s":0,"md5":"d41d8cd98f00b204e9800998ecf8427e","lm":"2026-09-23T06:41:08.742Z","ct":"text/plain; charset=utf-8","meta":{"mtime":"1790140358.9822654"},"crc64nvme":"AAAAAAAAAAA="}
{"t":"content","sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","md5":"d41d8cd98f00b204e9800998ecf8427e","bytes":0,"form":"empty","keys":11182}
```

**6. A key with a space.** It is also a stage-mirror copy that names `Documents/The Tabernacle`.

```json
{"t":"key","k":"corpus-lane-builds/moses-run-store-v1/verify-v1.1/stage/Documents/The Tabernacle/corpus-lane-builds/moses-run-ledger-v1.1/r2-push-v1.1.txt","u":"corpus-lane-builds/moses-run-store-v1/","c":"5fbe9b8836b5c344aea0fe7f630c4d64028f000deae3bcfc935ed94b6fe32eba","s":2110,"md5":"aec7727e56fb3bef02c9fd35c5df9073","lm":"2026-10-03T18:19:57.057Z","ct":"text/plain; charset=utf-8","meta":{"mtime":"1790999800.3879194"},"crc64nvme":"ojNd6X3Y1pM=","copy_of":"corpus-lane-builds/moses-run-ledger-v1.1/r2-push-v1.1.txt"}
```

**7. A multipart key with a space.**

- Its ETag is not its md5.
- The md5 is recorded separately, and it equals `x-amz-meta-md5chksum` decoded from base64 (MEASURED).
- The part size is 5,242,880 bytes, as the hazards survey MEASURED for all 32 multipart objects.

```json
{"t":"key","k":"corpus-lane-builds/moses-run-store-v1/verify-v1.1/stage/Documents/The Tabernacle/corpus-lane-builds/moses-run-ledger-backwards-v1/cards-v1.jsonl","u":"corpus-lane-builds/moses-run-store-v1/","c":"(at ingest)","s":482743499,"md5":"6d5a446650ca2cdf31e6127f3b98cf4c","etag":"de5bb93c8e42fc2827b4985322d621d5-93","parts":{"size":5242880,"count":93},"lm":"2026-10-03T18:22:04.513Z","ct":"application/octet-stream","meta":{"mtime":"1790980680.7352576","md5chksum":"bVpEZlDKLN8x5hJ/O5jPTA=="},"crc64nvme":"642U18f3HvU=","copy_of":"corpus-lane-builds/moses-run-ledger-backwards-v1/cards-v1.jsonl"}
```

**8. A lineage, a pin and an alias.**

- The lineage numbers are MEASURED (section 7). The removed row's text is quoted exactly as the source has it.
- The pin is MEASURED: the downloaded bytes hash to the pinned value.

```json
{"t":"lineage","family":"moses-witnessed-order","stem":"old-witness-table-v{N}.jsonl.gz","from":{"u":"corpus-lane-builds/moses-witnessed-order-v2/","c":"49a605e92f25bd12a06dacdfe1d53e7f2948fb59fd153d7c929f3f83b5c8a2a2"},"to":{"u":"corpus-lane-builds/moses-witnessed-order-v2.4/","c":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad"},"rows_from":2455758,"rows_to":2455757,"rows_removed":1,"rows_added":0,"bytes_removed":446,"bytes_added":0,"chunks_changed":1,"removed":[{"line":790209,"book":"i-chronicles","ref":"26:2","key":"יתניאל","m_id":"M5","text":"Ēl hireth","wording_year":"1906"}]}
{"t":"pin","holder":"corpus-lane-builds/moses-witnessed-order-v2.4/RECEIPT-witnessed-v2.4.json","k":"corpus-lane-builds/moses-witnessed-order-v2.4/strand-1-fix/out/old-witness-table-fix-v2.4.jsonl.gz","sha256":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","status":"verifies"}
{"t":"alias","from":"moses-toggle-ledgers-v1/","to":"moses-ledgers/toggle-ledgers-v1/","source":"push map (meta/readers/pushmap.json)"}
```

---

## 3. The stores it points at

### 3.1 Layout on R2

The store sits under a new top-level prefix. Every key under it is written once and never overwritten.

```
overlap-store-v1/
  meta/overlap-meta-v1.0.jsonl.br            the meta file (section 2); v1.1, v1.2 ... beside it, each naming its parent
  meta/overlap-meta-v1.0.jsonl.br.sha256     its sha256, also pinned in both lanes (3.5)
  packs/<sha256>.pack                        the pieces, packed (3.3)
  whole/sha256/<xx>/<sha256>                 contents kept whole: media, zip, pdf, tar.gz, gz no deflater rebuilds
                                             (or a "home" key that stays, named in the content record)
  capture/listing-2026-10-18T1646Z.tsv.br    the frozen listing the meta covers (key, size, ETag, last-modified)
  capture/heads-2026-10-18.jsonl.br          HEAD of every key: Content-Type, x-amz-meta-*, checksums
  runtimes/<sha256>                          pinned deflater runtimes (Node 22.22.0 win-x64 and linux-x64, gzip 1.12)
  proofs/RECEIPT-overlap-proof-v1.0-<lane>.json
```

- **Why its own prefix and not `cas/`:** the 15 objects in `cas/` are archived Codex sessions written by the corpus lane's disposition conveyor, not corpus data (hazards survey). Mixing them in would blur what the store is.
- **The `whole/sha256/<xx>/<sha256>` shape is the same one `cas/` already uses**, so the idea is not new to either lane.

### 3.2 Naming by which hash

- **Content ids are sha256 of the exact bytes.** Receipts pin by sha256: 182,681 pin rows, and 0 md5 pins survived exact pairing (MEASURED by the readers survey). A sha256 id means every receipt pin points straight into the store.
- **md5 is kept beside it.** R2's single-PUT ETag is the md5, and rclone compares md5. md5 is how a key is tied to R2's own record without downloading it. rclone's md5 matched the ETag on 507,112 of 507,112 keys (MEASURED by the hazards survey).
- **crc64nvme is kept** because R2 returns it on HEAD, so a check needs no download.
- **Packs are named by the sha256 of the pack object.**
- **Pieces are named inside their pack** by an ordinal. The pack's index keeps each piece's length and the first 8 bytes of its sha256, for the next ingest's matching. The full content sha256 is the proof, so a piece needs no full hash of its own in the meta file.

### 3.3 Pieces and packs

**The piece rule (row-anchored chunks).** A text content, or the inflated inner of a `.gz` file, is read line by line.

- A piece ends after a line when the first byte of that line's sha256, ANDed with 31, is 0. That happens for about 1 line in 32.
- A piece never ends before 4,096 bytes.
- A piece always ends at the first line end past 65,536 bytes, or at 65,536 bytes inside a longer line.

Because the cut depends only on the line itself:

- inserting or removing a row changes only the piece that holds it;
- every piece is whole rows, so a piece difference is a row difference.

On the prototype the average piece was 17.4 KiB (MEASURED). Binary content uses ordinary byte-level content-defined chunks with the same 4 to 64 KiB bounds.

**Packs.** Pieces go into packs of at most 64 MiB compressed. The order inside a pack:

- by family;
- then by lineage group (the same path across versions);
- then by row position;
- then by version.

So a changed piece sits right next to the piece it replaced. On the prototype this cut the pack by 34 % against "first seen" order: 18.96 MB against 28.91 MB (MEASURED).

**Pack format.** Each pack is laid out in this order:

1. independent brotli blocks of about 8 MiB raw (quality 11, window 2^24);
2. an index: each piece's length and 8-byte hash prefix, plus each block's raw and compressed offsets;
3. a 64-byte footer that gives the index's offset, length and sha256.

To read one piece, a reader makes ranged GETs of the footer, the index and one block. Ranged reads worked on 951 of 951 tries (MEASURED by the hazards survey).

**Small files** need no special case. A small file is a content of one piece, packed beside its family's other pieces. That is how 512,809 keys become a few hundred pack objects: about 20 GB divided by 64 MiB is about 300 (ESTIMATED).

**What is kept whole** (`form: "whole"`):

- media, zip and pdf;
- the 19 tar.gz files, for now (the cold tarball could be rebuilt from its members later; that saves about 0.9 GB, ESTIMATED by the overlap survey);
- the 190 `.head.gz` and 176 `.r2head.gz` truncated heads;
- any `.gz` that no pinned deflater rebuilds byte for byte;
- any content that pieces and compression do not make smaller.

### 3.4 How a `.gz` is stored

The ingest inflates the file and records its header bytes exactly (`header_hex`). It then tries the pinned deflaters in a fixed order and stops at the first byte that differs:

1. Node 22.22.0 zlib 1.3.1-470d3a2;
2. Python zlib;
3. GNU gzip 1.12.

It records the first that rebuilds the whole object, and the trailer is checked against the inner bytes. If none rebuilds it, the file is kept whole. The store therefore never depends on a guess.

The surveys' evidence:

- The overlap survey rebuilt 50 of 51 objects byte for byte (MEASURED).
- The hazards survey found 13 objects that only Node rebuilt, 7 that only Python rebuilt and 3 that neither did, out of 23 (MEASURED).
- This design's prototype rebuilt 5 of 5 whole 41 MB tables with Node, level 6 (MEASURED). Before this, only 8 MiB prefixes of objects that large had been tested.

### 3.5 Versioning and pinning the meta file

- Each meta version is a new key (`-v1.0`, `-v1.1`, ...). Its `root.parent` names the previous version's sha256, so the versions form a chain.
- A newer meta version adds keys uploaded after the last capture (29 such keys appeared between 02:00 and 16:46 UTC on 18 Oct, MEASURED by the hazards survey). It adds packs and never rewrites an old one.
- The current meta sha256 is pinned in two places that must match exactly:
  - one line in `MOSES-LEDGER-INDEX.md` (Moses);
  - a pin file in the site's `reader/data/` (Elijah). Its name would be `overlap-store-pin-v1.json`; that file does not exist yet.
- Each proof receipt names the meta sha256 it proved.

---

## 4. How an old build comes back, and the proof that every build does

### 4.1 Rebuilding one build

`rebuild-overlap-v1.mjs <unit> <dir>`:

1. Read the meta file. Select the `key` records whose `u` is the unit.
2. For each distinct content:
   - `empty`: write nothing.
   - `whole`: GET `whole/sha256/xx/<sha256>`.
   - `chunks`: for each extent, read the pack footer and index (both cached), fetch the blocks that hold the pieces with ranged GETs, decompress them, and join the pieces.
   - `gzip`: rebuild the inner the same way, then write the header bytes, the raw deflate with the recorded deflater and settings, and the trailer from the inner's crc32 and size.
3. Check each content: sha256 equals the id, bytes equal `bytes`, md5 equals `md5`.
4. Write each key's bytes to `<dir>/<path relative to the unit>`.
5. Recompute `files_sha256` and compare it with the build record.

Prototype rate (MEASURED): 5 tables, 4.71 GB inflated, rebuilt and proved in 41.5 s on one core, about 5 s per 942 MB table.

### 4.2 The proof before any deletion: all of it, not a sample

The proof runs over every content, every key, every build and every pin, and it runs twice. Each run reads only the store, never the original objects.

| check | count | passes when |
|---|---|---|
| every content rebuilds | 288,197 | sha256 = id, bytes and md5 = recorded |
| every key maps to a proved content | 512,809 | key's size and md5 equal the frozen listing's. For 512,777 single-PUT keys the ETag is the md5. For the 32 multipart keys, the multipart ETag is rebuilt from the rebuilt bytes with the recorded part size and equals the listing's ETag |
| every build rebuilds whole | 290 | `files_sha256` recomputed equals the record. Zero-byte files are counted explicitly (11,182 keys) |
| every pin is classed | 182,681 rows | each pin `verifies`, or is recorded as `differs-at-capture` or `target-absent` with its reason. Nothing is unclassed |
| every store object is intact | all packs and whole objects | read back from R2 with GET; sha256 equals its name |
| second copy | the same | the whole proof is run again from the copy of the store off R2 |

The counts are MEASURED: by the hazards survey (288,197 contents; 512,809 keys; 32 multipart; 11,182 zero-byte), by the readers survey (182,681 pin rows) and by this design (290 units).

- **Two independent tools.** Proof 1 uses `rebuild-overlap-v1.mjs` (Elijah) against the store on R2, from the cloud. Proof 2 uses `verify-overlap-v1.mjs` (Moses), written from this document without reading Elijah's code, against Moses's own disk copy. The prototype already works this way: the ingest is in Python, the rebuild in Node, and they agreed on 5 of 5.
- **Pass rule.** Both receipts list zero failures for every key in the builds the owner will name. A content that fails is moved to `whole` (its original is still on R2), and the proof runs again.
- **Cost of one full proof: about 1 to 3 hours on a 4-core machine (ESTIMATED).**
  - About 140 GB of inflated bytes (the overlap survey's L3 estimate, 121 to 227 GB) pass through sha256.
  - The gz part passes through deflate, at the prototype's 190 MB/s per core for level 6. Level 9 files are slower: 179 of 432 sampled headers say level 9 (MEASURED by the hazards survey).
  - The store, about 20 GB, comes down from R2 at the single-stream 22.5 MB/s the hazards survey MEASURED, or faster in parallel.

### 4.3 The delete guard (for later, once the owner has named builds)

A key is deleted only if all of these hold:

- its build is named;
- its content passed both proofs;
- a fresh listing shows the same size, ETag and last-modified as the frozen listing;
- the joint copies check finds that no content loses its last copy.

R2 keeps no versions (ListObjectVersions answers 501, MEASURED by the hazards survey), so a delete is final.

The joint copies check covers both lanes, including Moses's local tiers. It is the check that caught the 3.49 GB case, where two lists that were each safe alone would together have left 6,247 files with no copy (MEASURED by the copies survey).

---

## 5. Readers: how each kind keeps working

The reader kinds and counts come from the readers survey (MEASURED).

| reader | what it does today | under this design |
|---|---|---|
| The live site | 0 runtime fetches from R2. The one dormant road (zone-store `base`) is null | No change. If the dormant road is turned on, it reads `serving-lane/`, which stays plain |
| `restore-shelf-from-history-v1.mjs` | reads `serving-lane/shelf/zones/<name>` for 3,594 pins and checks each sha256 | `serving-lane/` stays plain (the plain set below). Separate problem: the shelf backup matches only 89 of 3,594 current pins and should be refreshed first |
| `push-toggles-v1.mjs` | reads `MOSES-LEDGER-INDEX.md`, about 9 `moses-ledgers/` prefixes and 4 `corpus-lane-builds/` prefixes | Those prefixes stay plain while they are current. When one stops being current, the tool takes `--from-overlap` and reads through `resolve-overlap-v1.mjs` (a listing from the meta file, bytes by sha256) |
| The plain set as a whole | everything readers fetch by key | **12,236 keys, 3,085,339,043 bytes (MEASURED: the listing matched against the served payload, the toggle queue's prefixes, `MOSES-LEDGER-INDEX.md` and `serving-lane/`)**. These stay as ordinary R2 objects, also present in the store |
| 62,127 path citations with no hash | name a path in a build | `resolve-overlap-v1.mjs` answers path to content using: the alias table (`moses-<b>/`, `CLB/`, `{TAB}/`, `{BUILDS}/` and `builds:` map to `corpus-lane-builds/`; `r2:mishkan/` and `{R2}/` map to the root); the push map (10 local names to `moses-ledgers/<x>`); a name index for the 19 bare names the site cites. 7 of those names have several bodies, so the resolver returns every candidate with its build and sha256 and never picks one |
| 182,681 sha256 pin rows | name a path and its sha256 | Rebuilding is whole-file and byte-exact, so every pin that verifies today still verifies, even though rows are shared underneath. No reader addresses part of a file by a key of its own. The 706 keys pinned with two or more sha256 values keep only today's bytes, because R2 has no older versions. Each such pin is recorded as `differs-at-capture` |
| About 20 site bake and projection tools | read a local copy (`--from`, `--in`, `--record`, `--ledger`) | `materialize-build-v1.mjs <unit or prefix> <dir>` writes the exact files. The tools run unchanged. Gate G7 re-runs them and compares their output with today's `reader/data` byte for byte |
| Moses's builds | read his local tree | No change |
| Moses's checks on R2 (lsf, lsjson, check, md5sum) | compare his tree with R2 | `list-overlap-v1.mjs <unit> --format lsjson\|md5sum` prints what rclone printed (path, size, md5, and mtime from `x-amz-meta-mtime`), so his one-way checks still run against old builds |
| Two key-level reads of Moses's | the source census reads the first 64 KiB of R2-only sources; a compspan verify seat reads v13.5's copy | `read-overlap-v1.mjs --range` for the first, materialize for the second |
| Uploads of new builds | rclone `copy --ignore-existing` | No change. New keys are ingested by the next meta version |

---

## 6. Hazards and how each is handled

The hazards and their counts come from the hazards survey (MEASURED), unless the row says otherwise.

| hazard | handling |
|---|---|
| R2 keeps no versions (501 on ListObjectVersions). Delete and overwrite are final | Store keys are write-once and never overwritten. A second copy of the store exists off R2 before any delete. The delete guard (4.3) applies |
| 32 multipart objects (14.05 GB): ETag ≠ md5 | Record md5, part size 5,242,880 and part count. The proof rebuilds the multipart ETag. If an object is ever uploaded again from the store, the same part size keeps its ETag |
| About 40 % of bytes sit inside gzip or zip (39.30 GB by name, plus about 8.19 GB of gzip `.bin`, ESTIMATED) | `.gz` and gzip `.bin`: a wrap recipe with a pinned deflater, proved byte for byte, otherwise kept whole. zip: kept whole |
| A recompressed file can match one deflater and not another (in a test of 23: 13 Node only, 7 Python only, 3 neither) | A registry of three pinned deflaters, tried in order. Each recipe names the one that matched. The runtimes themselves are stored in `runtimes/` |
| A later Node may ship a different zlib | Rebuilds always run on the pinned runtime, never on whatever Node is installed. Moses should confirm the Node version he runs (an open question from the overlap survey) |
| 190 `.head.gz` + 176 `.r2head.gz` truncated heads | Kept whole |
| 19 tar.gz files (4.16 GB), including the 4.04 GB cold tarball | Kept whole in v1.0. A member recipe can come in a later version, after its own full rebuild proof |
| 11,182 zero-byte keys | `form: "empty"`; each is listed in its build and counted in the proof |
| Keys with spaces (280), non-ASCII keys (43,937; all NFC; 1 changes under NFD), `%` or brackets | Keys are stored exactly as listed, in UTF-8 JSON, and never normalized. Store objects are named by hash, so no key text appears in a store name |
| 38 keys whose path segments are over 255 bytes, which ext4 and APFS cannot write; about 1,506 local Windows paths over 259 characters (ESTIMATED) | Only materialize writes real paths. It uses `\\?\` on Windows, and on ext4 or APFS it writes an escaped name plus a map file. The meta key never changes |
| Content-Type varies by uploader (`.ts` labeled video; the serving lane's `r2put.mjs` labels `.py` and `.mjs` as text/markdown); Content-Encoding must stay none | Stored per key as it is. Any upload from the store sets the recorded values |
| `x-amz-meta-*` (mtime, md5chksum, sha256) and checksum type (crc64nvme or crc32) vary | Stored per key, as returned by HEAD at capture |
| Upload dates are not build dates (220,692 keys carry 2026-10-02, the backfill day) | `lm` is used only as a delete guard, never to order versions. Version order comes from the census family and version |
| "Folder X mirrors folder Y" is not safe (10 of 276 stage mirrors differ from what they mirror, MEASURED by the copies survey) | Every key has its own content hash. `copy_of` is a note, never a proof |
| Case collisions, file/folder collisions, keys ending in "/", control characters: 0 found | The ingest checks again and stops on the first one |
| Moses's 14,941 local links, 56 empty folders and hard-link groups | Outside the R2 view. The meta file covers R2. Rebuilding a local tree is optional, a separate part fed by Moses's `inventory-local` |
| Content with no second copy anywhere (18.28 GB, MEASURED by the copies survey: cold, IA waves, corpus-staging, moses-ledgers and others) | The store holds it. The store's off-R2 copy makes it two copies for the first time |
| Lifecycle rules unknown (403 on `?lifecycle`); public access unknown; R2 limits and prices not confirmed (docs unreachable) | The owner checks the dashboard before G4. Packs are at most 64 MiB, so they need no multipart upload. A content kept whole keeps its size; the largest is the 4.04 GB cold tarball. Such a content can keep its present key as its home (the meta file names that key, and the key is then never deleted) instead of being uploaded again |

---

## 7. Size at this design

### 7.1 The prototype slice (all MEASURED)

**What was measured.** The old-witness tables, across seven builds:

- `moses-old-witnesses-v1`;
- `moses-witnessed-order-v2`, `-v2.1`, `-v2.2`, `-v2.3`, `-v2.4`, `-v2.5`.

They have 59 keys including the search-ledger mirrors, and 5 distinct contents. Every download matched its md5, and its sha256 matched the build's own receipt pin.

**The run.** Python built the store (`10-` and `11-ingest*.py`), and Node rebuilt it (`20-rebuild-proto.mjs`).

| level | bytes | vs. R2 |
|---|---:|---:|
| L0: 59 keys on R2 | 2,428,050,453 | 1× |
| L1: 5 distinct files (each kept once) | 205,739,625 | 11.8× smaller |
| B: each file inflated and compressed alone (xz -6) | 84,237,268 | 28.8× |
| C: row pieces, first-seen order, xz -6 | 28,905,420 | 84× |
| **C: row pieces, row-position order, xz -6, plus recipes 81,716 and piece index 191,196** | **19,235,600** | **126×** |
| C as this design ships it: position order, Node brotli quality 9, 8 MiB independent blocks | 21,126,264 pack | (xz in 8 MiB blocks: 21,207,272) |
| brotli quality 11 instead of 9, first 8 blocks only | 8.9 % smaller than quality 9 | |
| smaller pieces (about 4 KiB, mask 7) | pack 18,522,616, but the index grows from 191,196 to 544,308 | not worth it here |

**What each version adds**, as raw piece bytes stored first, versions in order:

| version | bytes added |
|---|---:|
| v1 | 941,646,034 |
| v2 | 538,953,061 |
| v2.1 | 116,047 |
| v2.2 | 21,898,122 |
| v2.4 | 26,664 (1 piece) |

v2.3 and v2.5 add 0, because their tables have the same bytes as v2's.

**Row differences**, MEASURED both on the whole files and from the recipes:

| step | rows removed | rows added | detail |
|---|---:|---:|---|
| v1 to v2 | 63,889 | 63,916 | 2.6 % of 2.46 million rows; the changes are spread through the file, so 57 % of the raw pieces are new, but position-ordered compression absorbs them |
| v2 to v2.1 | 10 (4,726 bytes) | 26 (11,222 bytes) | |
| v2.1 to v2.2 | 4,320 | 1,160 | 1,156 rows changed in place: `citation_ids` on 1,156, `sense` on 219 |
| v2 to v2.4 | 1 (446 bytes) | 0 | the BDB 1906 row for i-chronicles 26:2 יתניאל, "Ēl hireth", line 790,209 |

**Reading a difference off the recipes** touches only the differing pieces:

- v2 to v2.4: 1 changed piece; 2 pieces read (53,774 bytes) out of a 942 MB table.
- v2.1 to v2.2: 1,851 pieces read (45.3 MB).

Both give exactly the row counts the full-file diff gives.

### 7.2 The whole bucket

| level | size | basis |
|---|---:|---|
| Today (L0) | 117.35 GB, 512,809 keys | MEASURED: hazards listing, 16:46 UTC |
| A: each distinct file once | 68.24 GB, 288,197 contents | MEASURED: hazards survey (md5 and size, streamed md5 for multipart) |
| B: each distinct file compressed alone | 30.5 GB (30.0 to 34.2) | ESTIMATED: overlap survey (zlib, gz kept as stored) |
| **C: this design (row pieces, shared, compressed)** | **20.3 GB (17.8 to 25.2) with an xz-class codec; 27.3 GB (23.6 to 31.9) with zlib** | ESTIMATED: overlap survey, from a sample of 48.4 % of distinct bytes. Brotli in blocks is about equal to xz in blocks (MEASURED on the slice) |
| Meta file | about 60 to 110 MB compressed | ESTIMATED: keys part MEASURED (next table), plus the contents, recipe, lineage and pin parts scaled from the slice and the overlap survey |
| Piece indexes inside packs | about 17 to 94 MB | ESTIMATED: the slice's index costs 191 KB (lengths only) to 1.03 MB (with 8-byte hash prefixes) per 1.5 GB of raw pieces (MEASURED), scaled to about 138 GB of raw pieces |
| **End state: store + meta + the plain set kept as ordinary objects** | **about 23.5 GB** | ESTIMATED: 20.3 + about 0.1 + 3.09 (the plain set, MEASURED) |
| End state if every current build folder also stays plain | about 61.7 GB | ESTIMATED: 20.3 + 41.32 (current units as they stand, MEASURED by the census; 30.45 GB distinct) |

**The keys part of the meta file, measured on a draft** (`30-keys-draft.py`, all 512,809 real keys):

| draft | raw | compressed (xz -6) |
|---|---:|---:|
| without a content hash | 143.6 MB | 13.5 MB |
| with a sha256 in every row (an overstatement, since 512,809 keys share 288,197 contents) | 175.4 MB | 31.1 MB |

**Where C's roughly 20 GB sits**, by class. ESTIMATED: the overlap survey's per-class extrapolation, which sums to 20.34 GB.

| class | size | note |
|---|---:|---|
| gz text | 11.43 GB | about 5.6 GB of this is the IA-wave OCR token files, which have no versions |
| binaries | 3.33 GB | |
| tar.gz | 2.60 GB | almost all of it the cold tarball |
| media | 1.54 GB | |
| uncompressed text | 1.33 GB | this is all of Moses's JSON, JSONL, TSV and Markdown builds: 39.4 GB of distinct text |
| other gz | 0.10 GB | |

**Is 20.3 GB the true minimum?** Probably not quite. Three things not counted in the survey's figure could lower it:

- position-ordered packing cut the slice by 34 % (MEASURED on the slice only);
- quality 11 cut 8.9 % on 8 blocks (MEASURED);
- rebuilding the cold tarball from its members would save about 0.9 GB (ESTIMATED by the overlap survey).

These touch mostly the families that have versions. Most of the floor is source captures that compress poorly and share nothing. So a fair answer is **about 18 to 20 GB, ESTIMATED, with the survey's 17.8 to 25.2 GB as the honest range.** It is not measured for the whole bucket.

**Why the meta file gives the true size.** It reports the corpus's size three ways:

- distinct bytes, 68.24 GB;
- stored bytes, about 20 GB;
- for each build, the bytes it added (`new_chunk_bytes`). This is the "what did this version really cost" number. Example: v2.4's whole old-witness table cost 26,664 raw bytes.

---

## 8. Tools, effort, who does what, and the gates

### 8.1 Tools

Tools are named `tools/<verb>-<noun>-v1.mjs`, Node only (brotli, zlib and crypto are built in). Effort is ESTIMATED from writing this prototype, which took about two hours for one file type.

| tool | does | writes | effort |
|---|---|---|---|
| `capture-bucket-v1.mjs` | list, then HEAD every key (Content-Type, x-amz-meta-*, checksums) into the frozen capture. At most 1,000 keys per list page (MEASURED by the hazards survey); about 513,000 HEADs | Elijah | 0.5 day |
| `pack-overlap-v1.mjs` | GET each distinct content once; check md5 against the ETag (or the streamed md5 for multipart); sha256; row pieces; gz recipe discovery; brotli packs; the meta file. Resumable | Elijah | 4 to 6 days |
| `rebuild-overlap-v1.mjs` | rebuild one content, one build or all; `--prove` writes Proof 1 | Elijah | 2 days |
| `verify-overlap-v1.mjs` | the independent rebuild and proof, written from this document only; writes Proof 2 | Moses | 3 days |
| `diff-builds-v1.mjs` | two builds or two versions: paths added, removed and renamed (by content), contents changed, and for row files the exact rows removed and added (reads only the differing pieces). `--history <stem>` lists which versions hold a given row | Elijah | 2 days |
| `resolve-overlap-v1.mjs` / `read-overlap-v1.mjs` | path, alias or bare name to candidates with sha256; fetch bytes, with `--range` | Elijah | 1 day |
| `materialize-build-v1.mjs` | write a unit or prefix to a local folder, handling long or odd paths | Elijah | 0.5 day |
| `list-overlap-v1.mjs` | rclone-shaped listings (`lsjson`, `md5sum`) of any old build | Moses | 0.5 day |
| `plan-deletion-v1.mjs` | dry run for named builds: key list, bytes, the per-key guard, the joint copies check | Elijah | 1 day |
| `delete-named-v1.mjs` | the only tool that deletes. It reads an owner-named plan, checks each key's guard again just before deleting, and writes a receipt | Moses (the lane that owns the bytes) | 1 day |

**Total:** about 15 to 18 working days of tools across the two lanes (ESTIMATED).

**Run time:** about 2 to 4 hours for capture plus packing, and about 1 to 3 hours for each of the two proofs (ESTIMATED from the prototype rates in section 4).

### 8.2 Who runs what

- **Moses runs `pack-overlap-v1.mjs` on his own computer.**
  - He is the lane that makes builds and uploads to R2.
  - His disk then holds the off-R2 copy of the store.
  - He already holds 48.47 GB of R2's 48.56 GB of distinct build content locally (MEASURED by the copies survey). So he can also add local-only content if the owner wants it in scope.
- **Elijah runs Proof 1 in the cloud**, reading only R2.
- **Moses runs Proof 2 from his disk copy**, with his own tool.
- **Both lanes pin the same meta sha256.**

### 8.3 The gates, in order

1. **G0. The owner picks the design and the scope.** Is it R2 only, or also Moses's local-only content? That content includes `moses-accent-types-v1` (3.12 GB, never uploaded), `moses-piece-store-v2` run-r1 and run-r2 (1.06 GB), and the 999 footsteps (about 70 GB never hashed, ESTIMATED by the copies survey). The owner also says whether current build folders stay plain, beyond the 3.09 GB plain set.
2. **G1. Moses settles statuses.**
   - The 60 unknown units (1.59 GB).
   - The 6 statuses inferred from names.
   - Raw caches and cold: are they evidence or current?
   - He also confirms his Node version, which pins the deflater.
3. **G2. Pilot on one family in the real format.** `moses-witnessed-order` plus its nested mirrors, end to end: pack, both proofs, and the diff report. The owner reads "v2.4 differs from v2 by 1 row" from the tool, not from this document.
4. **G3. Freeze.** Capture the listing and every HEAD. From then until the deletion, nothing on R2 may be overwritten (Moses's `copy --ignore-existing` already holds to this).
5. **G4. Full pack.** The store is uploaded write-once under `overlap-store-v1/`, and the meta sha256 is pinned in both lanes. Before this, the owner checks the dashboard for lifecycle rules.
6. **G5. Proof 1** (Elijah, from R2): all 288,197 contents, 512,809 keys, 290 builds and 182,681 pins, with zero failures in the builds to be named.
7. **G6. Proof 2** (Moses, from his disk copy, with his own tool): the same, and the receipts agree.
8. **G7. Readers ready.**
   - The site bake tools, re-run on materialized inputs, give `reader/data` byte for byte.
   - `push-toggles --from-overlap` is checked.
   - The resolver answers the 62,127 citations, and those it cannot answer are listed.
   - The shelf backup is refreshed.
9. **G8. Deletion plan.** `plan-deletion-v1.mjs` dry run for the candidate builds: every key, the bytes, the guards, and the joint copies check across both lanes. No content may lose its last copy, which is the 3.49 GB lesson.
10. **G9. The owner names the deletion.**

---

## 9. Risks, and what this design gives up

1. **Concentration.** One pack holds pieces that dozens of builds share. A lost or damaged pack breaks many builds at once, where today it would break one file.
   - *Mitigation:* write-once keys, two copies (R2 and Moses's disk), both proofs, and pack sha256 read back from R2.
   - R2 has no versions, so this risk never goes to zero.
2. **Every read of an old build needs our tools.** An old build is no longer one rclone copy away. It needs `rebuild-overlap-v1.mjs`, the meta file and the pinned deflater runtime. Moses's `rclone check` against an old build works only through `list-overlap-v1.mjs`. The R2 dashboard shows packs, not files.
3. **The gz recipes add moving parts.** Three deflaters are pinned, recipe discovery is a search, and level-9 files are slow to rebuild. A failure is safe (the file is kept whole), but each one makes the store bigger. The design depends on keeping old runtimes, which is why they are stored in the store.
4. **The bytes saved beyond simpler designs are modest.**
   - Against the whole-file store (A): about 48 GB less (68.24 GB down to about 20 GB, ESTIMATED).
   - Against compressing each file alone (B): only about 3 GB less (ESTIMATED, about 10 %).
   - At about $1.75 a month for the whole bucket, the case for taking "overlapped" fully is the row-level answers and the true sizing, not the bill.
5. **Row answers only where rows are lines.**
   - JSONL, TSV and CSV: exact rows.
   - Pretty-printed JSON: lines, which are less meaningful.
   - Binaries: pieces only.
   - One huge line, such as minified JSON, is cut at 64 KiB, so its difference is a piece, not a row.
6. **What is already gone stays gone.** The 706 keys pinned with more than one sha256 keep only today's bytes. R2 never kept the older ones, so those pins are recorded as `differs-at-capture`.
7. **Scope gaps unless the owner widens them.**
   - The 999 footsteps (about 70 GB, never hashed);
   - local-only content (about 4.2 GB named above);
   - the git road.

   The store covers what is on R2.
8. **Unknowns outside our reach.** Lifecycle rules (403 on `?lifecycle`), whether any object is public, and R2's documented limits and prices, which were not confirmed from here.
9. **Time.** About three weeks of tool and gate work across both lanes (ESTIMATED), which fits the owner's "future weeks". Nothing is deleted before G9.

**What this design gives up, plainly:**

- R2 as a plain, browsable mirror of Moses's tree;
- old builds readable by any S3 tool;
- per-object Content-Type and metadata as live properties (they become recorded values to restore);
- simplicity.

**What it gets in return:**

- the smallest store of the designs considered;
- one file that is the whole corpus's history;
- each version's real cost in bytes;
- the ability to say "this version differs from that one by these rows", and to show the rows.
