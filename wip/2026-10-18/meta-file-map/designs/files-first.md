# The meta replacement file: files-first design

Draft for the owner, from the serving lane (Elijah), 18 October 2026.
This is one of several designs. It takes one angle: the simplest thing that makes deletion safe.

Everything here was read-only. Nothing on R2 was written, copied or deleted. For this design I downloaded 17 small objects (432,302 bytes), hashed them and deleted them again.

- Scripts: `/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/design-files-first/scripts/`
- Outputs: `.../meta/design-files-first/out/`

**Units.** GB means 10^9 bytes. Every number says whether it is MEASURED (and how) or ESTIMATED (and from what). "The surveys" means the census, overlap, readers, hazards and copies surveys of 18 October.

---

## 1. The idea

Copy each distinct file once, byte for byte, into one store on R2 named by its sha256 (`cas/sha256/<first two hex>/<sha256>`), and write one meta file that lists every key the bucket holds: the build it belongs to, its exact path, its size, the sha256 of its bytes and its stored headers. An old build comes back by copying each of its files out of the store to its old path, checking every sha256 on the way. Before anything is deleted, the whole bucket is proved, not a sample: every key is read and hashed once to write the meta file, every store object is read and hashed once, and every build is rebuilt in a hash-only mode and compared with its recorded digest. A short list of doors, the keys that tools read by path today, stays as plain keys. After that, any other build folder can go on the owner's word, because nothing in it exists only there. The meta file's sum over distinct contents is the bucket's real size: **68.22 GB, against 117.33 GB listed** (MEASURED: distinct (md5, size) over the 18 Oct listing).

What this design does not do:

- It does not recompress anything.
- It does not split files into rows or chunks.
- It does not touch gzip internals.

That keeps the tooling small and the proof easy. The cost is size: a store of about 68 GB, where a compressing store would be about 20 to 31 GB (ESTIMATED by the overlap survey). See section 7.

On the owner's word "overlapped": the overlap survey found that row and chunk sharing between versions adds only about 3.2 GB beyond plain compression (ESTIMATED). So whole-file sharing, which removes 49.11 GB of copies (MEASURED), captures most of the overlap between builds; the rest, about 3.2 GB, would need row or chunk sharing. What it leaves on the table is mostly compression, and a later version can add that without changing a single key record (section 3.4).

---

## 2. The meta file's exact shape

### 2.1 Format

The meta file is one file per capture: `bucket-meta/capture-0001.jsonl.gz`.

- It is gzip (level 9, header mtime 0) around UTF-8 JSON Lines: one JSON object per line.
- Every object has a `"record"` field: `head`, `content`, `build` or `key`.
- The lines come in this order:
  1. one `head` line;
  2. the `content` lines, sorted by sha256;
  3. the `build` lines, sorted by build id;
  4. the `key` lines, sorted by key.
- All sorting is by UTF-8 bytes, which is the order R2 lists keys in.
- JSON field names are lowercase kebab-case, as the site's conventions require.

Why JSON Lines:

- Moses already writes it (`inventory-local.jsonl`, `links.jsonl`, `hardlink-groups.jsonl`, the ledger's `keep.jsonl`).
- Any line stands alone, so a grep for a sha256 finds every key that holds it.
- Keys with spaces, quotes or Hebrew letters are safe inside JSON strings.
- Node and Python read it with no library.

Why gzip and not xz: Node has gzip built in and has no xz, and Moses's tools are Node on Windows. The cost is that the file is about 27% bigger (below).

**Size.**

| Form | Bytes | Basis |
|---|---|---|
| Raw JSON Lines | 299,177,655 | MEASURED on a model |
| gzip -9 | 72,337,855 (72.3 MB) | MEASURED on a model |
| xz -6 | 56,975,784 (57.0 MB) | MEASURED on a model |

The model (`scripts/03-model-meta.py`) is a full-size meta file built from the real listing: 288,169 content records, 289 build records and 512,780 key records. It used stand-ins of the same length and randomness for the values that need a full read (sha256, mtime, checksum). It used `"t"` where the final file uses `"record"`; that adds about 4 MB raw and almost nothing compressed. The model was deleted after measuring.

This is bigger than the overlap survey's 26.1 MB model because each key record here also carries the ETag, the Content-Type, the stored metadata and the stored checksum.

### 2.2 The head record (one per file)

| Field | Meaning |
|---|---|
| `format` | `"bucket-meta-v1"`. The shape of this file. |
| `bucket` | `"mishkan"` |
| `capture` | The capture number, 1, 2, 3, … |
| `listed-from`, `listed-to` | Start and end of the ListObjectsV2 walk (UTC). |
| `hashed-to` | When the last key was read and hashed. |
| `previous-capture-sha256` | sha256 of the previous capture's inflated JSON Lines, or null. |
| `keys`, `key-bytes` | Key count and summed size, present keys only. |
| `contents`, `content-bytes` | Distinct contents and their summed size. **`content-bytes` is the bucket's real size.** |
| `builds` | Number of build records. |
| `build-rule` | The rule that assigns a key to a build. This is the census's unit rule, written out in full, and it gives 289 units today. |
| `store-layout` | `"cas/sha256/{sha256[0:2]}/{sha256}"` |
| `aliases` | The short forms the readers survey found in citations, and what they expand to. |
| `push-map` | The 10 local-to-R2 folder pairs (readers survey `pushmap.json`). |
| `tools` | Name and sha256 of the capture tool, plus the Node version. |

### 2.3 The content record (one per distinct content)

| Field | Meaning |
|---|---|
| `sha256` | Of the bytes. This is the store name. |
| `size` | Bytes. |
| `md5` | Of the bytes. It equals the R2 ETag of any single-part copy, so `rclone md5sum` or a listing can check a store object without downloading it. |
| `crc64nvme` | Computed by the capture tool. It is compared with R2's stored value when R2 has one, so a HEAD alone can recheck a store object. |
| `keys` | How many keys held this content at capture. |
| `form` | `"plain"`: the store object is the file itself. This is the room left for later forms (section 3.4). |

### 2.4 The build record (one per build)

| Field | Meaning |
|---|---|
| `build` | The build id, exactly as the census unit prefix spells it. |
| `family`, `version` | From the name, by the census rule. |
| `keys`, `bytes` | Present keys and their summed size. |
| `distinct-bytes` | Size of the distinct contents inside this build. |
| `unique-bytes` | Size of the contents that no other build holds. |
| `first-modified`, `last-modified` | From the listing. These are upload times, not build times: 220,692 keys carry the 2 Oct backfill date (census). |
| `digest` | sha256 of the build's lines, one per present key, sorted by relative path in UTF-8 byte order. Each line is `<relative path>\t<size>\t<sha256>\n`, where the relative path is the key minus the build prefix. Do not use JavaScript's default sort, which orders by UTF-16. |
| `holds-copies-of` | Builds this one carries nested copies of (from the census nested-copy rule). |

Statuses such as current, superseded, evidence and unknown are **not** in the meta file. They are judgments that change. If a status lived in the file, changing it would change the pinned file. Statuses go in the owner's deletion orders (section 8).

### 2.5 The key record (one per key per version)

| Field | Meaning |
|---|---|
| `key` | Exactly as listed: never normalized, never URL-encoded. |
| `build` | The build id. |
| `present` | true if the key holds these bytes at this capture. false once it is deleted or rewritten. A later capture adds `gone-by-capture`. |
| `size`, `sha256` | Of the bytes read at capture. |
| `etag` | As listed, without quotes. A 32-hex value is the md5. `<hex>-N` means multipart. This is the guard compared before any delete. |
| `parts`, `part-size` | Multipart keys only. |
| `last-modified` | As listed. |
| `content-type` | As stored. It varies by uploader. |
| `meta` | Every `x-amz-meta-*` header, by its own name. |
| `checksum` | The `x-amz-checksum-*` value R2 returned, by algorithm. |

Content-Encoding is not a field. The capture refuses to finish if any key has one: the hazards survey found 0 of 4,221, and the site's zone page hashes the raw body.

### 2.6 Example records from real keys

Where these values come from:

- Keys, sizes and `last-modified` come from the listings.
- `etag` and md5 come from the md5 table or the listing.
- sha256, Content-Type, `meta` and `checksum` are MEASURED. I downloaded each of the 17 objects and hashed it; md5 and size matched on 17 of 17. Headers came from a HEAD with checksum mode on (`out/02-examples-hashed.json`).
- The `keys` counts are MEASURED from the md5 table.
- The cold tarball's sha256 is MEASURED by the hazards survey's full stream.

Lines are wrapped here for reading. In the file each record is one line.

**(a) A current, served build.** This is the span store v1.4 that the site's underlines come from. One other key holds the same bytes: `.../build-v1.4/outputs/run-r4-1/span-store-v1.4/places/amos.jsonl`.

```json
{"record":"key","key":"corpus-lane-builds/moses-span-store-v1/build-v1.4/span-store-v1.4/places/amos.jsonl",
 "build":"corpus-lane-builds/moses-span-store-v1/","present":true,"size":5036,
 "sha256":"1ec039363d7f0859d32e3cda0a9c87212b85b10f5e25210bcb35c0a7e0b63e55",
 "etag":"91586e1fa65d4a95a99490a6bb138104","last-modified":"2026-10-17T15:24:49.341Z",
 "content-type":"application/octet-stream","meta":{"mtime":"1792232922.2888705"},
 "checksum":{"crc64nvme":"nK9KLJFzWgo="}}
{"record":"content","sha256":"1ec039363d7f0859d32e3cda0a9c87212b85b10f5e25210bcb35c0a7e0b63e55","size":5036,
 "md5":"91586e1fa65d4a95a99490a6bb138104","crc64nvme":"nK9KLJFzWgo=","keys":2,"form":"plain"}
```

**(b) A superseded version whose bytes live on.** compspan v13.3 has five newer versions on R2. This one file of it is held by 11 keys:

- v13.3's own key;
- shadow copies in v13.4, v13.5 and v13.6;
- copies of those inside v13.7;
- copies of copies inside v13.8, which is current.

The store keeps it once, and all 11 key records point at it.

```json
{"record":"key","key":"corpus-lane-builds/moses-compspan-v13.3/spans/places/amos.places-not-carried-v1.jsonl",
 "build":"corpus-lane-builds/moses-compspan-v13.3/","present":true,"size":6154,
 "sha256":"b413032edd322c6346e86beaba8248f32460c6ab21602dbccba898474ac0108d",
 "etag":"f07c0a9dd40470329bfb8afadb16c947","last-modified":"2026-10-02T23:53:18.448Z",
 "content-type":"application/octet-stream","meta":{"mtime":"1790984859.0739766"},
 "checksum":{"crc64nvme":"xjfUm6oG4wE="}}
{"record":"content","sha256":"b413032edd322c6346e86beaba8248f32460c6ab21602dbccba898474ac0108d","size":6154,
 "md5":"f07c0a9dd40470329bfb8afadb16c947","crc64nvme":"xjfUm6oG4wE=","keys":11,"form":"plain"}
```

**(c) A nested copy, with its original.** v13.7 carries a copy of v13.6 under `verify/gate-v136/root/tab/lane/`. The census verdict is "equals the original key".

The two records share one sha256 but differ in `meta.mtime`. That is why stored headers belong to the key, not to the content.

```json
{"record":"key","key":"corpus-lane-builds/moses-compspan-v13.7/verify/gate-v136/root/tab/lane/moses-compspan-v13.6/verify/gate-lattice/outputs/v5-kq-nine.json",
 "build":"corpus-lane-builds/moses-compspan-v13.7/","present":true,"size":2529,
 "sha256":"b0bc7f79d0edb84ea1738999a0952ab6d6f7f3584cb1c24e71b028c33b9ed7ef",
 "etag":"d6deecab3ef4b0cd55d7126491b3055d","last-modified":"2026-10-09T04:29:30.044Z",
 "content-type":"application/json","meta":{"mtime":"1791517733.2411214"},"checksum":{"crc64nvme":"iQUnAM9s3wg="}}
{"record":"key","key":"corpus-lane-builds/moses-compspan-v13.6/verify/gate-lattice/outputs/v5-kq-nine.json",
 "build":"corpus-lane-builds/moses-compspan-v13.6/","present":true,"size":2529,
 "sha256":"b0bc7f79d0edb84ea1738999a0952ab6d6f7f3584cb1c24e71b028c33b9ed7ef",
 "etag":"d6deecab3ef4b0cd55d7126491b3055d","last-modified":"2026-10-03T06:37:12.982Z",
 "content-type":"application/json","meta":{"mtime":"1791007009.8834275"},"checksum":{"crc64nvme":"iQUnAM9s3wg="}}
```

**(d) A .gz file.** It is stored as its own bytes and never inflated. Two names in the same current build hold one content, and a third key in v1.6 holds it too.

```json
{"record":"key","key":"corpus-lane-builds/moses-hebrew-defined-layer-v1.7/final-gate/out/v1.4-census-instances-on-v1.6-root.jsonl.gz",
 "build":"corpus-lane-builds/moses-hebrew-defined-layer-v1.7/","present":true,"size":43746,
 "sha256":"3f60a570c2f7c45d18ca97a36de6bb9e9b2f100cff55f56b0feaa2cdde90f254",
 "etag":"de7b80612554589ab562ad5b96036a9f","last-modified":"2026-09-25T07:03:00.033Z",
 "content-type":"application/x-gzip","meta":{"mtime":"1790319424.8859312"},"checksum":{"crc64nvme":"uOoKqVhzhXs="}}
{"record":"content","sha256":"3f60a570c2f7c45d18ca97a36de6bb9e9b2f100cff55f56b0feaa2cdde90f254","size":43746,
 "md5":"de7b80612554589ab562ad5b96036a9f","crc64nvme":"uOoKqVhzhXs=","keys":3,"form":"plain"}
```

**(e) A zero-byte file.** There are 11,182 such keys and one content (MEASURED). Each key is still listed by name, so a rebuilt build has its empty files.

```json
{"record":"key","key":"corpus-lane-builds/moses-ben-yehuda-page-toggle-v1/ship-gate/logs/ship-gate.stderr.log",
 "build":"corpus-lane-builds/moses-ben-yehuda-page-toggle-v1/","present":true,"size":0,
 "sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
 "etag":"d41d8cd98f00b204e9800998ecf8427e","last-modified":"2026-10-02T14:49:05.531Z",
 "content-type":"application/octet-stream","meta":{"mtime":"1790211862.9682363"},"checksum":{"crc64nvme":"AAAAAAAAAAA="}}
{"record":"content","sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","size":0,
 "md5":"d41d8cd98f00b204e9800998ecf8427e","crc64nvme":"AAAAAAAAAAA=","keys":11182,"form":"plain"}
```

**(f) A key with spaces.** The run store's stage mirror carries Moses's Windows path `Documents/The Tabernacle/`. The key is kept exactly, spaces included.

Its content is the run ledger's own front page, which 5 keys hold (MEASURED):

- the original;
- this stage mirror;
- three search-ledger gate copies.

```json
{"record":"key","key":"corpus-lane-builds/moses-run-store-v1/verify-v1.1/stage/Documents/The Tabernacle/corpus-lane-builds/moses-run-ledger-backwards-v1/THE-RUN-LEDGER-BACKWARDS-v1.md",
 "build":"corpus-lane-builds/moses-run-store-v1/","present":true,"size":33049,
 "sha256":"720ea8d23992a035a1bdd0f063b194cfc001452db899bb303e9839bad059df0d",
 "etag":"5eaa0ce9363e34a65a93aa8913bf1c09","last-modified":"2026-10-03T18:19:57.048Z",
 "content-type":"text/markdown; charset=utf-8","meta":{"mtime":"1790999654.3612002"},"checksum":{"crc64nvme":"xvZK86wmZiU="}}
```

**(g) A multipart object.** This is the cold strike-evidence tarball: 4,036,386,504 bytes in 770 parts. Its ETag is not an md5.

- The md5 comes from the streamed bytes and from rclone's `x-amz-meta-md5chksum`.
- The hazards survey matched all three of md5, the 5 MiB-part ETag and CRC-64/NVME on all 32 multipart objects.

```json
{"record":"key","key":"cold/editorial-999-strike-20260830-evidence.tar.gz",
 "build":"cold/editorial-999-strike-20260830-evidence.tar.gz","present":true,"size":4036386504,
 "sha256":"6638889f9b075ab4bc169685f1f6a3fe138b63b58626411a5ccee99a9a4accc9",
 "etag":"a593d46e972ba49b4135de5cc92b6902-770","parts":770,"part-size":5242880,
 "last-modified":"2026-08-30T09:53:27.921Z","content-type":"application/x-gzip",
 "meta":{"md5chksum":"uoOoTiRDfz3+EQtHbZgOMw==","mtime":"1788082387.5541076"},"checksum":{"crc64nvme":"bx3lCuZ7hZY="}}
{"record":"content","sha256":"6638889f9b075ab4bc169685f1f6a3fe138b63b58626411a5ccee99a9a4accc9","size":4036386504,
 "md5":"ba83a84e24437f3dfe110b476d980e33","crc64nvme":"bx3lCuZ7hZY=","keys":1,"form":"plain"}
```

**(h) A whole build record.** This is `moses-bundled-by-century-v1`, a superseded build: 7 keys, 248,901 bytes, all held by other builds too (census unique bytes 0).

The digest is MEASURED: I downloaded all 7 objects, hashed them and hashed the 7 lines below. In the input every line ends in a newline, and the fields are separated by tabs.

```
FOR-ELIJAH-v12.md	3184	ec41acd7768c4cbd604db0f2c402a0e8b248e77cf77ce0704b83d8dc6287da68
RECEIPT-bundled-by-century-v1.json	3836	f91a5d786b71715d31ee9664bc353142cf89cdfbf879e8eca459df4039327fbe
SOURCE-CENTURIES-v1.json	158263	16b3c3fb6d9e3c538ecbffddc1435a46941308f91266d99b31c9c311af1656b2
THE-CENTURY-BUNDLES-v1.md	51276	b6579763ecb551d4b20a0e33092c3782d533c175e31b9e75e86b1576f6511a43
century-check-v1.mjs	5082	f232cf6ba164add124712d03f16405e45d2fc221a45cbf14a2f23dea64162c51
century-check-v1.out.json	20940	7e0591dcab71c8c662c47ff92b36cdeaf83fb01ac73f96258c5cc6df35182e89
relabel-v1.mjs	6320	77ec1ed43a35b0ff394147b43184c19ad2ff9ed726f3125e0166da7d1889eb76
```

```json
{"record":"build","build":"corpus-lane-builds/moses-bundled-by-century-v1/","family":"moses-bundled-by-century","version":"1",
 "keys":7,"bytes":248901,"distinct-bytes":248901,"unique-bytes":0,
 "first-modified":"2026-09-23T00:28:04Z","last-modified":"2026-09-23T00:28:04Z",
 "digest":"eb5e6955db7764ce2d89fe8048491d142a195ed5162e7a49dc930f67b7ee8a4d","holds-copies-of":[]}
```

**(i) The head record.** The figures below are the 18 Oct 02:00 listing's. A real capture will differ by whatever Moses uploads in between: 29 keys arrived between 02:00 and 16:46 on 18 Oct (hazards survey). The `aliases` value is abbreviated.

```json
{"record":"head","format":"bucket-meta-v1","bucket":"mishkan","capture":1,
 "listed-from":"…","listed-to":"…","hashed-to":"…","previous-capture-sha256":null,
 "keys":512780,"key-bytes":117329041116,"contents":288169,"content-bytes":68219270727,"builds":289,
 "build-rule":"census unit rule v1: corpus-lane-builds/<name>/, moses-ledgers/<name>/, corpus-staging/<name>/; editions-built-v1/{pby-wave,h1-canon,tanakh-editions}/ else the work folders as one; cold/<name>; serving-lane/<name>/; …",
 "store-layout":"cas/sha256/{sha256[0:2]}/{sha256}",
 "aliases":{"CLB/":"corpus-lane-builds/","builds:":"corpus-lane-builds/","{BUILDS}/":"corpus-lane-builds/","{TAB}/":"corpus-lane-builds/","moses-<b>/":"corpus-lane-builds/moses-<b>/","r2:mishkan/":"","{R2}/":""},
 "push-map":{"moses-toggle-ledgers-v1":"moses-ledgers/toggle-ledgers-v1", "…":"(10 pairs)"},
 "tools":{"capture-bucket-meta-v1.mjs":"<sha256>","node":"<version>"}}
```

---

## 3. The stores it points at

### 3.1 R2 layout

| Prefix | What | Today |
|---|---|---|
| `cas/sha256/<aa>/<sha256>` | The content store: one object per distinct content, bytes exactly as the original object. | 15 objects already follow this layout (MEASURED: all 15 match the pattern; the hazards survey hashed one and it equaled its name). The fill adds about 288,154 objects. |
| `bucket-meta/` | `capture-NNNN.jsonl.gz`, `capture-NNNN.receipt.json`, `latest.json`, `doors-v1.json` | Empty: 0 keys today (MEASURED). |
| The doors | Keys read by path today, kept as plain keys (section 5). | 10,448 keys, 1.54 GB, not counting `cas/` and `bucket-meta/` (MEASURED: `out/04-keep-sets.json`). |
| Everything else | The build folders as they are now. Deletable once the gates pass and the owner names them. | |

The doors are:

- `serving-lane/` (3,595 keys, 0.64 GB);
- `MOSES-LEDGER-INDEX.md`;
- the 10 prefixes `push-toggles-v1.mjs` fetches (6,852 keys, 0.90 GB);
- whatever keys Moses names for his own two R2 reads.

Store objects are written with:

- Content-Type `application/octet-stream`;
- no Content-Encoding;
- no `x-amz-meta-*`.

Their real headers live in the key records, because one content can have different headers at different keys (example c).

### 3.2 Which hash names the store

The store is named by **sha256**, with **md5 kept as a field**.

Why sha256 names it:

- Every pin the readers survey found is sha256: 182,681 pin rows, 0 md5 pins.
- The existing `cas/` objects and Moses's receipts use sha256.
- sha256 has no known collisions.

Why md5 is kept:

- R2's ETag for a single-part object is its md5 (507,112 of 507,112 equal, hazards survey).
- So `rclone md5sum`, `rclone check` and a plain listing can recheck the store and the original keys without a download.

Nothing in this design trusts md5 to say two files are the same. Every key is hashed with sha256 from its own bytes (section 4).

### 3.3 Packing small files: none

Distinct contents by size (MEASURED, `out/01-numbers.json`):

| Size | Contents | Bytes | Share of contents |
|---|---:|---:|---:|
| Up to 4 KiB | 177,006 | 0.17 GB | 61% |
| Up to 64 KiB | 245,008 | 1.67 GB | 85% |
| Over 1 MiB | 7,335 | 57.02 GB (84% of the bytes) | |
| Largest | 1 object | 4,036,386,504 bytes | |

Packing the small files into pack objects would cut the object count. It would not cut bytes:

- R2 bills stored bytes, with no per-object minimum (unconfirmed: the docs could not be reached from here).
- Writing 288,154 objects once costs about $1.30 at $4.50 per million writes (ESTIMATED from unconfirmed prices).
- Packing would need offset and length reads. These work (951 of 951 ranged reads, hazards survey), but every reader would need them.

One object per content keeps "the store object is the file" true for any tool. Packing can come later as a new `form`.

### 3.4 Versioning, pinning, and room to grow

- **Captures never change once written.** Capture N+1 is a full file again: it carries every record of capture N forward.
  - A deleted key keeps its record with `present: false`.
  - A rewritten key gets a second record for its new bytes.
  - So the newest capture alone describes every key ever captured, and older versions stay rebuildable.
  - At about 72 MB each, keeping every capture costs little.
- **Each capture is pinned in three places.** The sha256 of its inflated JSON Lines (so a recompression doesn't break the pin) and of its gzip bytes go:
  1. in `bucket-meta/latest.json` and in the capture's receipt (Moses's RULE-first, RECEIPT-last form);
  2. in the site repo as `reader/data/bucket-meta-pin-v1.json`, shipped the usual way: main, then gh-pages follows main;
  3. in `MOSES-LEDGER-INDEX.md`.
  - The file itself is also stored in `cas/` under its own sha256, and Moses keeps a copy on his disk.
- **Room to grow.** Key records point at the sha256 of the original bytes, never at how the store keeps them. A later version could store some contents compressed (`form: "xz"`, with the inflated sha256 checked on the way out) or packed. Only content records would change; every key record, pin and build digest would stay valid.

---

## 4. How an old build comes back, and the proof that every one does

### 4.1 Rebuilding a build

The tool is `restore-build-v1.mjs`. It takes `--build <id>` (or `--all`) and one of `--verify`, `--to <dir>` or `--to-r2 <prefix>`. It runs these steps:

1. Read `bucket-meta/latest.json`, fetch the capture, and check its sha256 against the pin in the site repo.
2. Take the build's key records, `present` ones by default, or those of an earlier capture by number.
3. For each record, GET `cas/sha256/<aa>/<sha256>` with `accept-encoding: identity`. The hazards survey saw Cloudflare's edge gzip a reply on the fly without it. Stream it through sha256 and check size and sha256 against the record. If either differs, stop.
4. Write the bytes, depending on the mode:
   - **To R2:** a server-side copy from the store object to the original key (or under a drill prefix). It sets Content-Type and `x-amz-meta-*` from the record. For keys over 200 MiB, a multipart upload in 5,242,880-byte parts gives back the exact recorded ETag (rclone's cutoff and part size, hazards survey).
   - **To a folder:** write `<dir>/<relative path>` and set the file time from `meta.mtime`, so Moses's rclone checks see the same times. If a name cannot be written (a path segment over 255 bytes on ext4 or APFS; a Windows path without `\\?\`), refuse and say which. Never truncate.
   - **With `--verify`:** write nothing.
5. Recompute the build digest from what was written or hashed, check it against the build record, and write a receipt: build, capture sha256, keys, bytes, digest, time.

### 4.2 The proofs: every key, every build, before any delete

Each proof covers the whole bucket, not a sample.

| Proof | What it does | What it shows | Size of the job |
|---|---|---|---|
| **P1 capture** | List the bucket. GET every key (identity encoding), compute sha256, md5 and CRC-64/NVME, and keep the headers. | The bytes read are the bytes listed. Single-part: md5 = ETag. Multipart: the 5 MiB-part ETag rebuilt from the bytes = ETag, and md5 = `md5chksum`. Size = listed size every time. | 512,780 keys, 117.33 GB |
| **P2 fill** | For each content not yet in the store, copy it there. | (Proved by P3.) | about 288,154 copies |
| **P3 store proof** | List `cas/`. Stream every object and recompute its sha256. | Every content of the capture is present, its sha256 equals its name, its md5 and size equal the content record, and `cas/` holds nothing unaccounted. | 288,169 objects, 68.22 GB |
| **P4 every build** | `restore-build-v1.mjs --all --verify`: rebuild all 289 builds in hash-only mode, through the same code that writes a real rebuild. | Every key record resolves. The streamed bytes hash to the recorded sha256. Every build digest equals its record. Keys and bytes summed over builds equal the listing. Every listed key sits in exactly one build. | 512,780 keys, 117.33 GB of reads, 0 disk |
| **P5 Moses's re-proof** | His own seat with his own tools (below). | The same results, found independently. | |
| **P6 drill** | Physically rebuild six hazard builds to a scratch prefix `restore-drill/` and to Moses's Windows disk. List and hash the results, then delete the drill copies. | The write paths work, not only the hash paths. | 6.31 GB (MEASURED: census sizes of the six) |

**P2 details.** The fill uses a server-side CopyObject from one source key that holds the content: the first such key in byte order. It sends `x-amz-copy-source-if-match: <captured ETag>`, so a source rewritten since capture is not copied. The fill writes only under `cas/` and `bucket-meta/`; a name already present is skipped after a HEAD shows the right size. The bytes never leave R2. All objects are at most 4,036,386,504 bytes, under the 5 GiB single-copy limit (limit unconfirmed for R2).

**P5 details.** Moses's seat runs:

- `rclone hashsum sha256 --download r2:mishkan/cas/` (each name must equal its hash and appear in the capture's content records);
- `rclone md5sum` over the original keys (each must equal the capture's `etag`);
- a short script comparing the two.

He follows his own rules: RULE first, planted controls, RECEIPT last, and "a seat never builds what it checks". So each piece is proved by the lane that did not make it: Moses's seat re-proves Elijah's capture (P1) and P4, and Elijah's P3 proves the fill, whoever runs it.

**P6 builds.** The drill set covers the hazards:

- `moses-run-store-v1` (spaces in keys);
- `moses-dictionary-denominator-v1` (Hebrew keys);
- `moses-ben-yehuda-page-toggle-v1` (zero-byte files);
- `moses-compspan-v13.8` (copies of copies);
- `moses-compspan-backwards-v1` (multipart objects of about 256 MB);
- `moses-bundled-by-century-v1` (example h).

**Why P1 plus P3 is a complete proof.** P1 ties each key's real bytes to a sha256. P3 ties each store object's bytes to the same sha256. A rebuild reads the store object and checks the sha256 again. So every key comes back byte for byte; the only way out would be a sha256 collision, and none is known.

P4 adds the check that the tool itself makes no mistake in paths, membership or counts, for all 289 builds.

**Controls.** Each proof must be seen to fail on a planted fault, in Moses's practice:

- one flipped byte in a drill copy;
- a fake ETag;
- a store object renamed to a wrong hash;
- a key record removed from a build.

**Time.** About 3 hours each for P1 and P4, and 1 to 2 hours for P3, on this cloud machine (ESTIMATED). The basis is two measured rates:

- 22.5 MB/s streaming (the hazards survey streamed 14.05 GB in 625 s);
- about 57 small objects per second (the overlap survey read 21,667 files in 380 s).

The rate for P2's copies is not measured, because no writes were made. At a guessed 20 copies per second, P2 takes about 4 hours (ESTIMATED). Egress from R2 is free, and no proof needs local disk.

### 4.3 The guard at delete time

The delete tool removes a key only when all of these hold:

1. it is named by an owner's deletion order that cites the capture's sha256;
2. it has a `present` record in that capture;
3. its content passed P3;
4. it is not under a door;
5. a fresh listing taken at delete time shows the same size and ETag as the record, so the bytes being deleted are the bytes captured.

Anything that fails is skipped and reported, never forced.

Afterward, the tool lists again and writes a receipt. The next capture marks those keys `present: false`.

---

## 5. Readers: how each kind keeps working

These are the reader kinds from the readers survey: 244,845 reference rows in 4,183 files. The counts in this table are that survey's MEASURED counts.

| Reader | What it reads | In this design |
|---|---|---|
| The live site pages (`reader/zone.html` and the rest) | Nothing from R2. All 3 runtime fetches are `${ROOT}data/…`. The zone-store road is dormant (`base` is null). | Unchanged. If the dormant road is ever turned on, the zone-store pins already carry the full sha256, so it could read `cas/` directly. |
| `restore-shelf-from-history-v1.mjs` | `serving-lane/shelf/zones/<name>` for 3,594 sha256 pins | `serving-lane/` is a door and is never deleted. Its contents are also in `cas/` by sha256, giving a second road. The backup is stale: 89 of 3,594 pins match. That is a separate serving-lane task; this design cannot add zone bins R2 never had. |
| `push-toggles-v1.mjs` | Reads `MOSES-LEDGER-INDEX.md`, lists all of `moses-ledgers/`, and fetches 10 prefixes (7 under `moses-ledgers/`, 3 under `corpus-lane-builds/`) | All of these are doors and stay plain keys. Its inventory listing will show only what remains after deletions. A later `--meta` option could show deleted-but-restorable folders too. |
| About 20 bake and projection tools that read a local copy (`--from`, `--in`, `--record`, `--ledger`) | A local folder | Run `restore-build-v1.mjs --to <folder>` first, then the tool unchanged. The R2 path and sha256 they stamp stay true, because the bytes are identical. |
| Hash pins: 182,681 sha256 rows on 108,909 keys (receipts, Moses's ledgers, relays, nested builds, the site) | (path, sha256) | Every pin still verifies after a rebuild. A pin can also be checked with no rebuild at all, as `cas/sha256/<aa>/<pin>`. |
| Path citations with no hash: 62,127 rows. Across all rows, 64,008 use short forms that need expanding. | A path | `resolve-path-v1.mjs` expands the head's alias table and push map. It finds key records (present or deleted) and returns the build, the sha256 and the store key, or "in no capture". |
| Bare-name citations on the site: 19 names, 7 ambiguous (2 to 289 keys each) | A file name | The resolver lists every candidate with its sha256 and never picks one. Fixing them means the site stamping full paths, which the readers survey suggests. |
| Moses's builds | His local tree | Unchanged. |
| Moses's R2 checks (`lsf`, `lsjson`, `check --one-way`, `md5sum`) | Build folders on R2 | Unchanged until a folder is deleted. After that, `export-build-sums-v1.mjs` writes the build's sum file from the capture, and `rclone checksum md5 <sumfile> <local folder>` checks his copy with no R2 folder needed. |
| Moses's two key-level R2 reads (the source census's first 64 KiB of R2-only sources; a compspan verify seat that reads v13.5's copy) | Specific keys | He names the keys and they go on the door list until his tools can resolve. |
| Moses's uploads (`copy --ignore-existing`) | New keys | Unchanged. The next capture hashes them and adds their contents to the store. |
| 706 keys pinned with two or more different sha256 values | Older versions | Already gone, because R2 keeps no versions. From capture 1 on, every captured version stays in `cas/`, so this cannot happen again to captured bytes. |

---

## 6. Hazards and how each is handled

These come from the hazards survey; the numbers are its MEASURED values unless marked.

| Hazard | Handling |
|---|---|
| **R2 keeps no versions.** ListObjectVersions answers 501, so a delete or overwrite is final. | The store is only ever added to. Deletes come only after P1 to P6 and the owner's order, through the guard in 4.3. Captures carry forward deleted and rewritten records. |
| **32 multipart objects** (14.05 GB): ETag is not an md5 | P1 rebuilds the 5 MiB-part ETag from the bytes and compares md5 with `x-amz-meta-md5chksum`. Key records keep `parts` and `part-size`, so a rebuild can reproduce the exact ETag. |
| **5,665 keys missing from the rclone md5 table** | Irrelevant here: P1 reads and hashes every key. |
| **11,182 zero-byte keys** | One store object, `e3b0c442…b855`, 0 bytes (example e). Every key is listed by name. |
| **Key spelling**: 280 keys with spaces; 43,937 non-ASCII (all NFC; 1 changes under NFD); 378 with `%`; 1,540 with `()[]{}!$,=` | Keys are stored exactly as listed, as UTF-8 JSON strings. They are never normalized. Each path segment is URL-encoded only at request time, the way `r2get.mjs` already does. The P6 drill includes spaced and Hebrew keys. |
| **38 path segments over 255 bytes**; about 1,506 keys whose Windows path would pass 259 characters (ESTIMATED) | Rebuilding to R2 always works. To a local disk, the tool refuses rather than truncates. Moses already reads with `\\?\` long paths (his RULE 1.4). |
| **Collisions**: 0 case collisions, 0 Unicode-form collisions, 0 file/folder collisions, 0 keys ending in `/` | Each capture re-checks these and stops on any. They would break local rebuilds. |
| **Content-Type varies by uploader**: `.jsonl` as octet-stream, `.ts` as video, the serving lane's `r2put.mjs` labeling `.mjs` as `text/markdown` | Recorded per key and set back on rebuild. |
| **Content-Encoding must stay none** (0 of 4,221 have one; zone.html hashes the raw body) | The capture stops on any Content-Encoding. Store objects carry none. Every GET sends `accept-encoding: identity`. |
| **`x-amz-meta-*`** (rclone's `mtime` on 607 of 630 sampled; `md5chksum` on multipart; `sha256` on 3,594 serving-lane keys) | Recorded per key, because they differ between keys of one content (example c). Set back on rebuild. |
| **Server checksums vary** (crc64nvme on 626 of 630 sampled; crc32 on 3,341 of 3,595 serving-lane keys) | Recorded per key. The content record carries the crc64nvme the capture computed, so a HEAD can recheck a store object when R2 returns one. |
| **gzip recompression is fragile** (only Node 22's zlib or Python's rebuilt each file; 3 of 23 rebuilt with neither) | Not touched. This design never inflates or recompresses anything. gzip and zip files are stored as their own bytes. |
| **Moses's local-only structure**: 14,941 links (0 of 873 recorded ones exist on R2), hard links, 56 empty items | Out of scope. The meta file is the R2 view. His `links.jsonl` and `hardlink-groups.jsonl` stay his records. |
| **Existing `cas/`**: 15 archived agent-session logs from the corpus lane's conveyor | Same layout and same naming rule, so they join the store as they are. P3 checks they hash to their names. |
| **A lifecycle rule could expire objects** (`?lifecycle` answers 403 from here) | The owner checks the R2 dashboard before the fill (gate G1). |
| **Public access is unknown** | The owner checks too. Any key served publicly becomes a door. |
| **R2 limits and prices are unconfirmed** (docs unreachable): CopyObject size limit, conditional-copy headers, metadata on copy | Confirm before writing the fill tool. The fallback is GET then PUT through the tool, which is free in both directions on R2 (unconfirmed) and still needs no disk. |
| **The bucket moves during a capture** (29 keys arrived in about 15 hours on 18 Oct) | The head records the listing window. A key rewritten mid-capture fails the ETag match and is re-read. Keys newer than the capture are not covered until the next one, and the delete guard refuses any key not in the newest capture. |
| **Last-copy across lanes** (the 3.49 GB case: two lane plans each safe alone, unsafe together) | The R2 side never removes a content, so R2 stays complete on its own. Before Moses deletes a local file, he checks its md5 or sha256 against the capture's content records: one joint index. |

---

## 7. Size

| State | Size | Basis |
|---|---|---|
| Today | 117.33 GB, 512,780 keys | MEASURED: 18 Oct 02:00 listing |
| The store alone | **68.22 GB**, 288,169 objects | MEASURED: distinct (md5, size), 66.755 GB from the md5 table plus 1.464 GB from ETags. The hazards survey's 16:46 listing gave 68.24 GB in 288,197 contents. |
| The meta file | 72.3 MB gzip (57.0 MB as xz) per capture | MEASURED on a full-size model with stand-in values |
| Peak while filling, before any delete | about 185.5 GB | MEASURED parts: 117.33 + 68.22 − 0.056 for `cas/` already there |
| After deletion, keeping only the doors | **about 69.83 GB** (59.5% of today) | MEASURED parts: 68.22 + 1.54 for the 10,448 door keys + 0.07 for the meta file |
| After deletion, keeping the doors and the census's served payload as plain keys | about 71.38 GB | MEASURED parts: 68.22 + 3.09 + 0.07 |
| After deletion, keeping every current build as a plain folder | about 109.62 GB | MEASURED parts: 68.22 + 41.32 + 0.07. Kept folders duplicate the store, so this saves only 7.7 GB. |
| Overlap survey step B: also compress text | about 30.5 GB (30.0–34.2) | ESTIMATED by the overlap survey |
| Overlap survey step C: also gzip recipes and chunk sharing | about 27.3 GB with zlib (23.6–31.9); about 20.3 GB with xz (17.8–25.2) | ESTIMATED by the overlap survey |

**What this design leaves on the table.** Against the store alone, it leaves about 37.7 GB against step B and about 40.9 to 47.9 GB against step C (ESTIMATED).

Almost all of that is compression:

- Text compresses to about 0.06 to 0.09 of its size.
- Inflating gzip and recompressing with xz halves it.

Row and chunk sharing between versions is only about 3.2 GB of the gap (ESTIMATED). The biggest gains are compspan (2.16×), witnessed-order (1.7 to 2.0×) and run-ledger-backwards (1.69×); they are not used here.

Pairs of gzip files that hold the same rows in different bytes also stay twice: 37% of witnessed-order's gzip bytes, 40% of run-ledger-backwards's and 8% of compspan's (MEASURED by the overlap survey).

In money, at the unconfirmed $0.015 per GB-month, the gap is about $0.6 to $0.7 a month: about $1.05 against $0.30 to $0.46 (ESTIMATED).

---

## 8. Tools, effort, who does what, and the gates

### 8.1 Tools

All tools go in the site repo's `reader/tools/` under the usual `<verb>-<noun>-v1.mjs` names. They reuse the SigV4 signing that `restore-shelf-from-history-v1.mjs` and `r2get.mjs` already use. Line counts are ESTIMATED by comparison: `restore-shelf-from-history-v1.mjs` is 233 lines, `serve-from-restore-v5.mjs` 341 and `push-toggles-v1.mjs` 612.

| Tool | What it does | Writes to R2? | About | Writes it | Runs it |
|---|---|---|---:|---|---|
| `capture-bucket-meta-v1.mjs` | The full listing, a GET and hash of every key, the headers, the unit rule, build digests and the capture file (P1). | No | 350 lines | Elijah | Elijah |
| `fill-content-store-v1.mjs` | The server-side copy of each missing content into `cas/` with the if-match guard, plus the upload of the capture to `bucket-meta/` (P2). | Yes: `cas/` and `bucket-meta/` only | 150 | Elijah | Moses, or whoever the owner grants `cas/` writes |
| `prove-content-store-v1.mjs` | Lists `cas/` and streams every object: name = sha256, md5, size, nothing stray (P3). | No | 120 | Elijah | Elijah |
| `restore-build-v1.mjs` | `--verify --all` for P4, `--to <dir>`, `--to-r2 <prefix>` for P6 and real restores. | Only with `--to-r2` | 220 | Elijah | Anyone |
| `resolve-path-v1.mjs` | Path, pin or bare name to key records to store key, with the alias table and push map. | No | 150 | Elijah | Anyone |
| `export-build-sums-v1.mjs` | Per-build `sha256sum` and md5 sum files for Moses's rclone and sha256sum checks. | No | 60 | Elijah | Moses |
| `check-delete-order-v1.mjs` | A dry run of an owner's order: doors, proofs, fresh-listing guard, keys and bytes freed. | No | 150 | Elijah | Both lanes |
| `delete-named-builds-v1.mjs` | Carries out a checked order, lists again and writes a receipt. **Written only after gate G10.** | Yes: deletes | 120 | Elijah | The lane the owner names |

Moses's independent re-proof (P5) uses rclone plus a short compare script in his own seat. He needs no new tool.

**Effort** (all ESTIMATED):

- Elijah: about 1,300 lines, 4 to 6 working days with self-tests.
- Moses: 1 to 2 days to review the RULE and tools and run his seat.
- Machine time: about a day in all: P1 about 3 h, P2 about 4 h (guessed rate), P3 1 to 2 h, P4 about 3 h, P5 a few hours on Moses's line.

**Moses also:**

- names his two key-level R2 reads for the door list;
- settles the 60 unknown-status units and the six statuses the census inferred from names, which deletion orders need and the meta file does not;
- optionally hashes his local trees against the capture's content records, which shows what exists only on his disk: accent-types 3.12 GB, piece-store run-r1 and run-r2 1.06 GB, and roughly 70 GB in the 999 footsteps (ESTIMATED by the copies survey).

### 8.2 Gates, in order

1. **G0.** The owner chooses this design (or a compressing one), and allows the first writes: `cas/` and `bucket-meta/` only, nothing deleted.
2. **G1.** The owner checks two dashboard settings that these keys cannot see: no lifecycle rule on `mishkan`, and whether any key is served publicly.
3. **G2.** Capture 1 passes:
   - every key read and hashed;
   - 0 size or ETag mismatches;
   - 0 Content-Encoding;
   - 0 collisions;
   - the planted controls caught.
4. **G3.** The fill and the store proof (P3) pass: every content in the capture is in `cas/` and hashes to its name, with 0 failures.
5. **G4.** Every build passes in verify mode (P4): 289 builds, 512,780 keys, every digest equal, with 0 failures.
6. **G5.** Moses's independent re-proof (P5) agrees, with RULE and RECEIPT.
7. **G6.** The physical drill (P6) passes on R2 and on Moses's Windows disk. The drill copies are deleted.
8. **G7.** The readers are covered:
   - `doors-v1.json` is agreed: `serving-lane/`, `cas/`, `bucket-meta/`, `MOSES-LEDGER-INDEX.md`, the 10 push-toggles prefixes, and Moses's named reads;
   - `resolve-path-v1.mjs` runs over all reference rows, and every row that resolves today still resolves.
9. **G8.** The capture's sha256 is pinned in three places (3.4). The site pin ships the usual way: commit to main, then gh-pages follows main.
10. **G9.** `check-delete-order-v1.mjs` dry-runs the owner's candidate order and reports:
    - keys and bytes;
    - "every content stays in `cas/`";
    - "no door touched";
    - "no key changed since capture".
11. **G10. The owner names the deletion.**

---

## 9. Risks, and what this design gives up

Numbers here are MEASURED by the surveys or by this design's scripts unless marked ESTIMATED.

- **Size.** The floor is about 69.8 GB. Compressing designs reach about 20 to 31 GB (ESTIMATED). The way to those stays open (3.4), but this design does not take it.
- **Version overlap is not used.** Row and chunk sharing between versions is not used (compspan 2.16×, witnessed-order 1.7 to 2.0×). gzip pairs with the same rows in different bytes stay twice.
- **The bucket grows first.** It gains 68.22 GB until the first deletion: a peak of about 185.5 GB, about $2.8 a month at the unconfirmed price (ESTIMATED).
- **Kept folders erase the win.** Keeping every current build as a plain folder costs 41.32 GB on top (MEASURED), so the design only pays off when current folders may go too. Any of them comes back in minutes with `restore-build-v1.mjs`.
- **Still one bucket.** The store adds no independent copy. The 18.28 GB that has no second copy anywhere (copies survey: cold, the IA waves, corpus-staging and others) is still single-copy, now in `cas/`. Whether a second place is wanted is the owner's call.
- **The meta file holds the names.** Without it, the store is anonymous bytes. It is pinned in three places and stored in `cas/` (3.4). At 72 MB it is too big to keep in the site repo itself, so only its sha256 goes there.
- **Local trees are not covered.** Moses's links, hard links, empty folders, the 999 footsteps (about 70 GB, ESTIMATED) and accent-types (3.12 GB) are outside this design. Bringing them into the store would be a separate intake the owner decides on.
- **Past overwrites stay lost.** The 706 keys pinned with more than one sha256 lost their older versions before this design. It cannot get them back.
- **Unconfirmed R2 behavior.** CopyObject support and size limit, conditional-copy headers and metadata handling must be confirmed before the fill tool is written. The fallback (GET then PUT) is slower but just as safe.
- **Listings change meaning.** Tools that list folders (push-toggles' inventory, Moses's `lsf`) will see fewer folders. To know what can be restored, they must read the meta file.
- **A capture is a snapshot.** Anything uploaded after it is unprotected until the next capture. The delete guard refuses keys the newest capture does not hold.
- **Statuses are outside.** The meta file states facts only. Which builds to delete still depends on the census's statuses (60 units unknown, six inferred) and on the owner's word.

**What it gives in return:**

- one store that is literally the files;
- one meta file that a reviewer can grep;
- a proof that covers every key and every build;
- no compressor builds to pin;
- about 1,300 lines of new tooling.
