# The overlapped build, readers first

Design v1, 2026-10-18. Elijah (serving lane). A proposal: nothing was written to R2, nothing was deleted.
GB means 10^9 bytes. Every number says MEASURED (and how) or ESTIMATED (and from what).
The surveys this rests on: census, overlap, readers, hazards, copies (all under `scratchpad/meta/`).
My own checks are in `design-readers-first/scripts/` and `design-readers-first/out/`.

---

## 1. The idea

Every file that has ever sat in the bucket is stored once, under its own sha256, at
`cas/sha256/<first two hex>/<sha256>`. One meta file lists every key the bucket has held,
exactly as R2 lists it, with the sha256 of its bytes and the build it belongs to. That gives
every reader three ways to its bytes after the old build folders are gone:

- **By hash.** A reader holding a sha256 pin (182,681 of the 244,845 reference rows) fetches the
  pin's address directly. No path lookup and no tool are needed.
- **By path.** A reader holding only an old path asks the meta file. The path gives a sha256,
  the sha256 gives the address, and the bytes come back whole and are checked against that sha256.
- **By folder.** Someone who lists an old build folder finds a forwarding note that says where
  the build went and lists its files and hashes.

A small set of keys stays real, because a program reads it by its key and we will not change
that program. Each kept key is listed with the reader that needs it. Nothing a reader could fetch
on 18 October may become unfetchable. That is checked row by row over all 244,845 references
before anything is deleted, and every build is proved to rebuild byte for byte from the meta file
plus `cas/`, all of them, not a sample. Only then does the owner name what is deleted.

---

## 2. The meta file's exact shape

### 2.1 Format

- **One file:** `overlapped-build/meta/meta-v<N>.jsonl.gz`.
- **Layout:** JSON Lines, one record per line, UTF-8, with `\n` line ends.
- **Compression:** gzip -9.
- **Why gzip and not xz:** every reader of either lane can open gzip without a new tool: Node's
  built-in zlib, Python's gzip, and `zcat`. Node has no built-in xz. On the model, xz -6 would
  save 10.9 MB (41.7 MB against 52.6 MB).
- **Why JSON Lines and not TSV:** every key line carries the full key and its sha256 together.
  A reader with no tool of ours can then resolve a path with `zcat | grep` and one GET.
- **Field names:** lowercase kebab-case, per the house rule for JSON keys.

**Record order:** `head`, then `standing`, `reader`, `alias`, `build`, `content` (sorted by
sha256), `key` (sorted by the key's UTF-8 bytes), and `pin`. Every record has a `kind` field.

| kind | one per | what it says |
|---|---|---|
| `head` | file | Schema, version, previous version's sha256, capture time, totals, the store rule, and the tool that wrote it |
| `standing` | kept prefix or key | A prefix that stays a real R2 key, its fate (2.3), and the reader that justifies it |
| `reader` | known reader | Who reads what, how it reads (GET, list, ranged GET, local copy), and what changes for it |
| `alias` | path form | How a written path form maps to a real key (Moses's placeholders, short forms, the push map) |
| `build` | build unit (289 at the 02:00 UTC listing) | Family, version, status with its evidence, counts, bytes, served prefixes, and `build-sha256` |
| `content` | distinct content (288,197) | sha256, md5, bytes, crc64nvme, multipart shape, and where it lives if not at its `cas/` address |
| `key` | key ever listed (512,809 today) | The key exactly as listed, its sha256, build, fate, Last-Modified, Content-Type, `x-amz-meta-mtime`, and copy-of |
| `pin` | (path, sha256) pin that does not match the captured bytes | Who pins it, and whether the store holds the pinned bytes |

**Rules the records keep:**

- A key record is never removed. When a key is deleted, a later meta version changes its
  `fate` to `retired` and adds the date. An old path keeps resolving in every later version.
- `build-sha256` is the sha256 of the build's lines `<path relative to the build>\t<sha256>\t<bytes>\n`,
  sorted by the UTF-8 bytes of the path. Zero-byte files are lines like any other.
- md5 is stored once, on the content record, not on each key.
- A key's Content-Type and `x-amz-meta-*` belong to the key, not the content. That is because
  one content can sit at keys uploaded by different tools.

### 2.2 Fields

**Content record:**

| field | required | notes |
|---|---|---|
| `sha256` | yes | the name |
| `md5` | yes | Equal to the ETag for single-PUT objects, so R2 can check a `cas/` object from a listing without a download |
| `bytes` | yes | |
| `crc64nvme` | when R2 returns it | Base64. R2 returns it on HEAD for most rclone uploads (626 of 630 sampled, MEASURED by the hazards survey) |
| `parts` | objects over 200 MiB | `[part bytes, part count]` of the original upload, so its multipart ETag can be rebuilt |
| `home` | only if not `cas/` | Phase 1 only: content held only by an archive channel the owner has not yet named |
| `gz` | optional, not in v1 | Reserved for a later row-sharing step: OS byte, MTIME, inflated bytes and sha256 |

**Key record:** `key`, `sha256`, `build`, `fate`, `modified` (R2 Last-Modified at capture, used
as the delete guard), `type` (Content-Type as stored), `mtime` (`x-amz-meta-mtime` when
present), `copy-of` (the build a nested copy's path names, from the census), `parts` (when
multipart), and `retired` (date, once deleted).

**Build record:** `build` (the unit prefix), `family`, `version`, `status`, `status-why`,
`role`, `keys`, `bytes`, `distinct-bytes`, `unique-bytes`, `served-prefixes`, `relays`,
`build-sha256`, `note` (the forwarding-note key once retired).

### 2.3 Fates

Every key has exactly one fate, decided by the readers rule in section 5. The keys and bytes
are MEASURED: each key of the 16:46 UTC listing is run through the rule in `scripts/02-fates.py`.

| fate | what | keys | bytes |
|---|---|---:|---:|
| `standing-forever` | channels: `serving-lane/`, `moses-ledgers/`, `MOSES-LEDGER-INDEX.md`, `serving-lane-handoffs/`, `frame/`, `disposition/`, `r2-push-suite/`, `retired/`, `cas/` | 49,501 | 3.13 GB |
| `standing-while-served` | the served payload under `corpus-lane-builds/` (14 prefixes and keys, plus the 42 pinned Masoretic files) | 1,900 | 1.92 GB |
| `standing-until-named` | archives: `cold/`, `corpus-staging/`, `editions-built-v1/`, `moses-ia-wave-v1..v3/`, `moses-raws-v1/`, `moses-markup-reissue-v2/`, `moses-ia-year-recovery-v1/`, `moses-rule8-probe-v1/`, `moses-tanakh-mam-restore-v1/` | 156,446 | 18.23 GB |
| `lookup` | everything else: the 230 `corpus-lane-builds/` folders (minus the served payload), that area's root file, and `mishkan/` | 304,962 | 94.07 GB |
| `retired` | a `lookup` key after the owner names its deletion | 0 today | |

The `lookup` keys by build status, from the census statuses (MEASURED):

| status | bytes | keys | units |
|---|---:|---:|---:|
| superseded | 43.64 GB | 62,511 | 58 |
| current, outside the served prefixes | 32.96 GB | 44,807 | 32 |
| evidence | 16.45 GB | 194,130 | 96 |
| unknown | 1.02 GB | 3,514 | 46 |

### 2.4 Example records from real keys

**Where the values come from:**

- **Keys, sizes, Last-Modified and md5:** the 16:46 UTC listing (`hazards/bucket-etag.tsv`).
- **sha256, MEASURED:** I downloaded each object read-only on 18 Oct and hashed it. The cold
  tarball's sha256 and crc64nvme were MEASURED by the hazards survey's stream.
- **Content-Type and mtime:** shown only where the hazards HEAD sample read them. In all other
  cases the capture pass fills them.
- **`build-sha256`:** computed at capture.

The records are pretty-printed here. In the file each is one line.

**(a) Current build, the file the site serves.**

The site's `reader/data/hud-runs/amos.json` and four receipts pin this sha256. It matches the bytes.

```json
{"kind":"build","build":"corpus-lane-builds/moses-hud-record-v1/","family":"moses-hud-record","version":"1",
 "status":"current","status-why":"served: reader/data/hud-runs/<book>.json from.record = corpus-lane-builds/moses-hud-record-v1/v1.2/build/hud-record-v1.2/<book>.jsonl with record_sha256; relay FOR-ELIJAH-v64.2",
 "role":"store/ledger (served)","keys":1564,"bytes":3246471514,"distinct-bytes":2165750003,"unique-bytes":2047195988,
 "served-prefixes":["corpus-lane-builds/moses-hud-record-v1/v1.2/build/hud-record-v1.2/"],
 "relays":["corpus-lane-builds/moses-hud-record-v1/v1.2/FOR-ELIJAH-v64.2.md"],"build-sha256":"<computed at capture>"}
{"kind":"content","sha256":"f1dfd8c7fc8c0e73843e5e38b70781ce83cb4b9362559ac46c2ea8dc1921f2c6","md5":"6840f5cfddaedc182b17497a7c4c5f18","bytes":465289}
{"kind":"key","key":"corpus-lane-builds/moses-hud-record-v1/v1.2/build/hud-record-v1.2/amos.jsonl",
 "sha256":"f1dfd8c7fc8c0e73843e5e38b70781ce83cb4b9362559ac46c2ea8dc1921f2c6","build":"corpus-lane-builds/moses-hud-record-v1/",
 "fate":"standing-while-served","modified":"2026-10-09T02:12:55.822Z"}
```

**(b) Superseded version, a .gz whose rows are almost all the next version's.**

- The two tables below are different gzip objects of about 41 MB each.
- Inflated, they are 942,420,132 and 942,420,578 bytes.
- v2.5 is v2.4 plus exactly one line: 2,455,758 lines against 2,455,757 (MEASURED by `diff` of the inflated streams).
- 8 keys hold v2.4's bytes and 25 hold v2.5's (MEASURED, md5 groups).
- In this design each is stored once, whole. Row sharing would store the second for a few hundred bytes. Section 9 explains why this design gives that up.

```json
{"kind":"build","build":"corpus-lane-builds/moses-witnessed-order-v2.4/","family":"moses-witnessed-order","version":"2.4",
 "status":"superseded","status-why":"newer version on R2: moses-witnessed-order-v2.5 ; newest own relay FOR-ELIJAH-v31.md SUPERSEDED",
 "role":"store/ledger","keys":1262,"bytes":1404813346,"distinct-bytes":877696887,"unique-bytes":1565042,"build-sha256":"<computed at capture>"}
{"kind":"content","sha256":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","md5":"3699c6a254d13ae94040610c3b6e5691","bytes":41170279,
 "gz":{"os":10,"mtime":0,"inflated-bytes":942420132,"inflated-sha256":"4eb612c87a9f5d199f42a099cc4ecc0408175020d25c40f9264a0e4db7edbb3f"}}
{"kind":"key","key":"corpus-lane-builds/moses-witnessed-order-v2.4/old-witness-table-v2.4.jsonl.gz",
 "sha256":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","build":"corpus-lane-builds/moses-witnessed-order-v2.4/",
 "fate":"lookup","modified":"2026-09-23T22:50:56.884Z"}
{"kind":"content","sha256":"49a605e92f25bd12a06dacdfe1d53e7f2948fb59fd153d7c929f3f83b5c8a2a2","md5":"dce354c2397554c542fc94896992fa15","bytes":41170313}
```

The `gz` object is shown only to say what a later step would need. It is not in v1.

**(c) Nested copy whose path names one build but whose bytes are another's.**

- The gate copy inside compspan v13.7 sits at a path ending `moses-compspan-v13.6/build/RULE-compspan-v13.6.md`.
- It holds the bytes of v13.7's own RULE: 22,508 bytes, sha256 `6fa9e711…`.
- v13.6's real RULE is 19,877 bytes, sha256 `924e8a37…`, and `RECEIPT-ship-compspan-v13.6.json` pins it.

All MEASURED by downloading the three keys. That is why every key carries its own sha256, and
why no record ever says "this folder mirrors that one".

```json
{"kind":"key","key":"corpus-lane-builds/moses-compspan-v13.7/verify/gate-v136/root/tab/lane/moses-compspan-v13.6/build/RULE-compspan-v13.6.md",
 "sha256":"6fa9e711de9bd600d7ea53e915ac6109693f8977fac2eb5c10c9328f109c5f28","build":"corpus-lane-builds/moses-compspan-v13.7/",
 "fate":"lookup","modified":"2026-10-09T04:29:06.298Z","copy-of":"moses-compspan-v13.6"}
{"kind":"key","key":"corpus-lane-builds/moses-compspan-v13.6/build/RULE-compspan-v13.6.md",
 "sha256":"924e8a370f7a0c039aadc3acf1a29061165fe79d4a3b411f75249dd6c6da029d","build":"corpus-lane-builds/moses-compspan-v13.6/",
 "fate":"lookup","modified":"2026-10-03T05:41:15.175Z"}
{"kind":"content","sha256":"6fa9e711de9bd600d7ea53e915ac6109693f8977fac2eb5c10c9328f109c5f28","md5":"6054b85cecfd1da5b6a54e51bf24e068","bytes":22508}
```

**(d) A small .gz in a standing channel, cited by the site's public demonstrations page.**

- The gzip header has OS byte 0x0a and MTIME 0, the Node-on-Windows signature.
- It inflates to 15,231 bytes (MEASURED).
- A second key, `.../out/streams/...`, holds the same bytes.

```json
{"kind":"key","key":"moses-ledgers/kq-reseal-v1/streams/tanakh-nahum-kq-resealed-v1.tokens.csv.gz",
 "sha256":"0fdc43845e2e32b5bc18fb02001b1746436dab0ba26d92ed3cf5d2ee39325937","build":"moses-ledgers/kq-reseal-v1/",
 "fate":"standing-forever","modified":"2026-09-02T12:44:19.373Z"}
{"kind":"content","sha256":"0fdc43845e2e32b5bc18fb02001b1746436dab0ba26d92ed3cf5d2ee39325937","md5":"7e4d3d11fbab6efb865bc49d16836543","bytes":5831}
```

**(e) A zero-byte file.**

This is one of 11,182 zero-byte keys, all of them a single content (MEASURED by the hazards survey).

```json
{"kind":"key","key":"corpus-lane-builds/moses-ben-yehuda-page-toggle-v2/ship-gate/logs/r2-overlay-v2.stderr.log",
 "sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","build":"corpus-lane-builds/moses-ben-yehuda-page-toggle-v2/",
 "fate":"lookup","modified":"2026-09-24T04:00:46.086Z"}
{"kind":"content","sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","md5":"d41d8cd98f00b204e9800998ecf8427e","bytes":0}
```

**(f) A key with a space: a stage copy whose bytes are nowhere else.**

- This copy is 13,592 bytes. The original at `corpus-lane-builds/moses-run-ledger-backwards-v1/verify-completeness/RECEIPT-verify-completeness-v1.json`
  is 13,590 bytes, sha256 `59df37b9…`, and `RECEIPT-run-ledger-backwards-v1.json` pins it (MEASURED).
- The stage copy had its paths rewritten. A `NOTE-paths-relativised-2026-10-02.txt` sits beside it.
- So the copy is its own content and must be kept. The key is stored exactly, space included.

```json
{"kind":"key","key":"corpus-lane-builds/moses-run-store-v1/verify-v1.1/stage/Documents/The Tabernacle/corpus-lane-builds/moses-run-ledger-backwards-v1/verify-completeness/RECEIPT-verify-completeness-v1.json",
 "sha256":"ab6a2273816cbbb9e55ecccfcb8b1e5f8400b9b3a456958c20c04b195f3ceec7","build":"corpus-lane-builds/moses-run-store-v1/",
 "fate":"lookup","modified":"2026-10-03T18:20:10.608Z","copy-of":"moses-run-ledger-backwards-v1"}
{"kind":"content","sha256":"ab6a2273816cbbb9e55ecccfcb8b1e5f8400b9b3a456958c20c04b195f3ceec7","md5":"2ec6b35d04df21593a16b17e3250708e","bytes":13592}
```

**(g) A multipart object: the cold evidence tarball.**

Its ETag is not an md5. The md5, sha256 and crc64nvme were streamed by the hazards survey.

```json
{"kind":"content","sha256":"6638889f9b075ab4bc169685f1f6a3fe138b63b58626411a5ccee99a9a4accc9","md5":"ba83a84e24437f3dfe110b476d980e33",
 "bytes":4036386504,"crc64nvme":"bx3lCuZ7hZY=","parts":[5242880,770],"home":"cold/editorial-999-strike-20260830-evidence.tar.gz"}
{"kind":"key","key":"cold/editorial-999-strike-20260830-evidence.tar.gz","sha256":"6638889f9b075ab4bc169685f1f6a3fe138b63b58626411a5ccee99a9a4accc9",
 "build":"cold/editorial-999-strike-20260830-evidence.tar.gz","fate":"standing-until-named","modified":"2026-08-30T09:53:27.921Z","parts":[5242880,770]}
```

**(h) The shelf, and a pin that no longer matches.**

- **The shelf bin.** `serving-lane/shelf/zones/amos.bin` on R2 is 246,088 bytes, sha256
  `16831612…`. HEAD returns `x-amz-meta-sha256` with the same value.
- **The site's pin.** The site pins `amos.bin` at 207,289 bytes, sha256 `1d5406cb…`. The local
  `ghp/reader/data/zones/amos.bin` equals that pin (MEASURED).
- **The same pattern.** The site pins `moses-ledgers/toggle-ledgers-v1/source-corpus-v1.json`
  at `8ac20dc9…`, while R2 holds `681b2524…` (the readers survey's sample check).
- **What the pin records do.** Both mismatches become pin records, so a reader asking for the
  pinned bytes is told plainly that they are not held, and is never handed other bytes.

```json
{"kind":"key","key":"serving-lane/shelf/zones/amos.bin","sha256":"168316126701b01595d96d51b8a34710d60b2d7042f2a660dbe60d4bc3e9ed73",
 "build":"serving-lane/shelf/","fate":"standing-forever","modified":"2026-09-28T15:47:01.021Z","type":"application/octet-stream"}
{"kind":"pin","key":"serving-lane/shelf/zones/amos.bin","sha256":"1d5406cb1b605d3dfd2d0fb49c84c7226f83a0ad80acfca406d227dfee9bff97","bytes":207289,
 "pinned-by":["reader/data/zone-store-v1.json"],"held":false,"why":"shelf backup of 2026-09-28 predates the pin; 3,505 of 3,594 shelf pins differ"}
{"kind":"pin","key":"moses-ledgers/toggle-ledgers-v1/source-corpus-v1.json","sha256":"8ac20dc94193cbfb6b612ebac0e7647690fff83e41494d0c638164323ace0cc3",
 "pinned-by":["reader/data/source-corpus-v1.json"],"held":false,"why":"key rewritten after the site pinned it; R2 keeps no versions"}
```

**Standing, reader and alias records.**

```json
{"kind":"standing","prefix":"serving-lane/shelf/","fate":"standing-forever","keys":3595,"bytes":639297530,
 "readers":["reader/tools/restore-shelf-from-history-v1.mjs"],"how":"SigV4 GET serving-lane/shelf/zones/<name>; written only if bytes and sha256 equal the pin"}
{"kind":"reader","reader":"reader/tools/push-toggles-v1.mjs","lane":"serving","how":"ListObjectsV2 + GET; --fetch holds a delivery to its SHA256SUMS",
 "reads":["MOSES-LEDGER-INDEX.md","moses-ledgers/","corpus-lane-builds/moses-source-suggested-v1/v1.1/build/out/source-suggested-bsb/",
          "corpus-lane-builds/moses-megacompspan-toggles-v1/build/toggles-v1/","corpus-lane-builds/moses-parse-source-and-declaration-v1/declaration-store-v7/"],
 "after":"corpus-lane-builds prefixes read through the meta file (--via-meta) once they stop being served"}
{"kind":"alias","from":"{BUILDS}/","to":"corpus-lane-builds/"}
{"kind":"alias","from":"moses-toggle-ledgers-v1/","to":"moses-ledgers/toggle-ledgers-v1/","why":"push map: the local folder name of a ledger delivered under moses-ledgers/"}
```

### 2.5 Size of the meta file

- **The model.** I built the whole meta file in this shape from the real listing: 512,809 key
  records, 288,197 content records and 290 build records (`scripts/03-model.py`). Keys, sizes,
  dates, md5s, builds and copies are real. sha256, crc64nvme, mtime and Content-Type are
  stand-ins of the same length and entropy, because the real values come from the capture pass.
- **Measured on the model:** 230.4 MB raw, **52.6 MB gzip -9**, 41.7 MB xz -6.
- **Where the size goes:** the key lines are 30.6 MB gzipped and the content lines 21.9 MB.
  The hashes are random bytes, so they set the floor.
- **Dropping the `build` and `fate` fields** from key lines saves only 0.18 MB gzipped
  (measured), so they stay.
- **Against the overlap survey's model:** that one was 26.1 MB gzip -9. It had one 64-hex id per
  key and no content table, md5, crc or type. The difference buys a key line that resolves on
  its own and a content table that can check `cas/` without downloads.
- **Fits GitHub:** 52.6 MB is under GitHub's 100 MB file limit.

---

## 3. The stores

### 3.1 R2 layout

```
cas/sha256/<xx>/<sha256>                       every distinct content once, plain bytes, no extension
overlapped-build/meta/meta-v<N>.jsonl.gz       the meta file, one per version, never rewritten
overlapped-build/meta/meta-v<N>.jsonl.gz.sha256
overlapped-build/LATEST.json                   {version, key, sha256, bytes, previous}: the only key that is ever rewritten
overlapped-build/RULE-overlapped-build-v1.md   + RULE-overlapped-build-v1.md.sha256 + RECEIPT, as Moses writes them
<retired build prefix>/MOVED-TO-OVERLAPPED-BUILD-v1.json            forwarding note (small)
<retired build prefix>/MOVED-TO-OVERLAPPED-BUILD-v1.keys.jsonl.gz   that build's key lines, copied from the meta file
...standing prefixes exactly as they are today
```

- **The layout already exists.** There are 15 objects under `cas/sha256/<xx>/<sha256>` from
  2026-08-29, and the hazards survey checked one against its name. They stay where they are and
  join the meta file as ordinary contents. They are archived Codex sessions, not corpus data, and
  a disposition receipt maps them.
- **How `cas/` objects are written.** Each is written once, with Content-Type
  `application/octet-stream`, no Content-Encoding, and `x-amz-meta-sha256` equal to its name,
  as the serving lane already labels the shelf. They are made by server-side copy from an
  existing key, so no bytes travel through any machine. The largest object is 4.04 GB, under the
  5 GiB single-copy limit. That limit is from memory: the hazards survey could not reach the R2
  docs.
- **The forwarding note** holds the build id, its `build-sha256`, its key count and bytes, the
  meta file's key and sha256, and the two commands that fetch one file without our tools (5.1).
  Its name avoids Moses's chain-of-custody prefixes (RULE, RECEIPT, FOR-, RELAY), so no rule of
  his reads it as a record.

### 3.2 Which hash names the content

The address is the sha256, and md5 is kept beside it.

**Why sha256:**

- **A pin becomes an address.** Receipts pin by sha256: 182,681 pin rows, 0 md5 pins after
  exact pairing (readers survey).
- **It is already the convention.** The existing `cas/` uses sha256, the site's zone-store
  addresses bins by the first 12 hex of their sha256, and Moses's RULE.md.sha256 and SHA256SUMS
  files are sha256.
- **It does not collide.** md5 can collide.

**Why md5 is kept:**

- **R2 checks it for free.** R2's ETag of a single-PUT object is its md5. A listing of `cas/` can
  therefore be checked against the content table with no download: 512,777 single-PUT keys today,
  ETag equal to rclone's md5 on all 507,112 compared (hazards survey).
- **rclone uses it.** rclone compares md5.
- **crc64nvme is a third, server-side check.** It is kept where R2 returns it.

### 3.3 Small files are not packed

- **What packing would gain.** 177,008 distinct contents (61%) are under 4 KiB, but they hold
  only 0.17 GB. Another 67,541 are 4 to 64 KiB and hold 1.47 GB. MEASURED over the distinct
  (md5, size) groups.
- **What packing would cost.** A packed file has no plain GET-by-hash address. The by-hash road
  is the one this design protects.
- **The price of not packing:** about 288,197 PUT-class copies once, about $1.30. ESTIMATED by
  the hazards survey from prices it could not confirm.
- **Kept open for later.** The content record keeps a `home` field, so a pack could be added
  later for content that no reader pins. Version 1 does not use it.

### 3.4 How the meta file is versioned and pinned

- **Versions are append-only.** `meta-v<N>` names `meta-v<N-1>`'s sha256 in `head.previous-sha256`,
  so the versions form a chain. No version is rewritten. A version is added when builds land,
  are retired, or a pin record changes.
- **Every version is also an ordinary content.** It sits in `cas/` under its own sha256, so any
  old receipt that pins a meta version can fetch it.
- **The pin lives in three places outside the file:**
  - `overlapped-build/LATEST.json` on R2;
  - the site's `reader/data/overlapped-build-v1.json`, `{version, key, sha256, bytes}`. It ships
    to GitHub with main, so GitHub holds the pin durably;
  - Moses's `MOSES-LEDGER-INDEX.md` entry.
- **Copies off the bucket.** Each version is also kept on Moses's disk and in a dedicated branch
  of the site's GitHub repository (`overlapped-build-meta`, one commit per version, about 53 MB
  each, ESTIMATED from the model).
- **Losing the file.** If every copy were lost, the forwarding notes would still carry each
  build's key list and `build-sha256`.

---

## 4. How an old build comes back, and the proof for all of them

### 4.1 Rebuilding one build

`tools/materialize-build-v1.mjs --build corpus-lane-builds/<name>/ --out <dir>` works like
`push-toggles --fetch`:

1. Read the meta version named by the pin, and check its sha256.
2. Take every key record whose `build` is the one asked for.
3. For each key record, GET `cas/sha256/<xx>/<sha256>` and stream it to
   `<dir>.incoming/<path relative to the build>`, hashing while it streams. Refuse on any
   mismatch. Zero-byte files are written explicitly.
4. Recompute `build-sha256` from what was written. If it equals the build record, rename
   `<dir>.incoming` to `<dir>`. Otherwise delete it, so nothing refused ever sits at the path
   the next step reads.
5. Refuse by name any path this filesystem cannot hold. 38 keys have a segment over 255 UTF-8
   bytes (MEASURED), and ext4 and APFS cannot hold them. The tool never shortens a path silently.

`tools/restore-build-to-r2-v1.mjs` would put a retired build back at its old keys. It
server-side copies each content from `cas/` and sets Content-Type and `x-amz-meta-*` from the
key records. Nobody needs it today. It exists so that a deletion can be shown to be reversible.

### 4.2 The proof, over every build

The proof is not a sample. It has five parts, each run by a lane named here.

**P1, capture (Elijah, read only).**

- Every one of the listed keys (512,809 at 16:46 UTC) is streamed once from its own key, and its
  sha256 and md5 are computed.
- Each md5 must equal the key's ETag, or for the 32 multipart objects, the md5 already streamed
  and checked by the hazards survey.
- No key's sha256 is inferred from another key with the same md5: every key is hashed from its
  own bytes.
- The response headers give Content-Type, `x-amz-meta-*` and crc64nvme in the same pass.
- **Cost.** Egress is free. The hazards survey streamed 14.05 GB in 625 s (22.5 MB/s, one stream).
  The readers survey fetched 7,744 small objects in about 137 s with 16 workers (about 57 per
  second, read from file times). From those, the capture takes about 3 to 6 hours and needs no
  disk (ESTIMATED).

**P2, store (Moses writes, Elijah proves).**

- After the ingest, every `cas/` object is streamed back by the lane that did not write it, and
  its sha256 must equal its name: 288,197 objects, 68.24 GB, or 246,443 objects, 52.11 GB, in
  phase 1.
- The listing of `cas/` must show every content record's md5 as the ETag, and the right size.
- The 24 distinct multipart contents (11.39 GB) are checked only by streaming. A copy's ETag form
  is not predictable.

**P3, every build (Elijah).**

- For each build unit, `build-sha256` is recomputed twice: once from the P1 hashes of its live
  keys, and once from the meta file's key records.
- The two must be equal for all 289 units, and for every key outside a unit.
- Together with P2, this proves that every key of every build is in `cas/` byte for byte. No
  117 GB needs to be written to disk.

**P4, the third copy (Moses).**

- `tools/check-local-against-meta-v1.mjs` hashes Moses's local `corpus-lane-builds` files,
  counting each inode once.
- It checks them against the key records of the same path.
- Moses's tree already proves 48.47 GB of the 48.56 GB of distinct `corpus-lane-builds` content
  (copies survey). Every difference is listed, not explained away.

**P5, the guard at delete time (whoever deletes).**

- Just before a key is deleted, a fresh listing must show the same ETag, size and Last-Modified
  as the capture.
- A key that changed since the capture is skipped and captured again.
- The reason: R2 answers ListObjectVersions with 501, so a delete or an overwrite is final
  (hazards survey).

**Reference proof R (Elijah, section 5.4)** runs alongside P1 to P5.

---

## 5. Readers

### 5.1 Three roads for a reader that knows only an old path

**Road 1, by hash.**

- The reader holds `(path, sha256)` and GETs `cas/sha256/<first two>/<sha256>`, then checks the
  bytes. The path is only a label.
- The road covers the 182,681 reference rows that carry a sha256 (75% of all rows), on 108,909 keys.
- It needs no tool and no meta file.
- If the pinned bytes are not held (2.4 h), the meta file says so in a pin record, and nothing
  else is returned.

**Road 2, by path.** `tools/resolve-r2-path-v1.mjs <path as written> [--sha256 <pin>] [--from <citing key>]`
works through these steps in order. It always returns `(key, sha256, bytes)` and streams bytes
that are checked against that sha256.

1. **Exact key.** Is the path a key record of any fate, including `retired`?
2. **Alias rewrite, then exact key.** The aliases are the readers survey's forms, as a table:
   - `r2:`, `r2://`, `r2:mishkan/`, `mishkan/`, `<bucket>/`, `s3://mishkan/` and
     `https://…r2.cloudflarestorage.com/` map to the bucket root;
   - `{BUILDS}/`, `BUILDS/`, `builds:`, `CLB/`, `{CLB}/` and `<tabernacle>/corpus-lane-builds/`
     map to `corpus-lane-builds/`;
   - `{TAB}/` and `{R2}/` map to the root;
   - a bare `moses-<x>/` that is not a top-level folder maps to `corpus-lane-builds/moses-<x>/`;
   - the 10 push-map pairs map `moses-<x>` to `moses-ledgers/<x>`;
   - a placeholder (`<`, `*`, `{`) cuts the path back to its folder.

   The readers survey measured 64,008 rows whose literal text is not a key but whose
   normalized form is.
3. **Relative path.** Try it against the citing file's folder, then the citing build's root, as
   Moses's rule R7 does. 160,058 rows are relative.
4. **Prefix.** List the key records under it. This replaces ListObjectsV2 for retired folders.
5. **Bare name.** Take the key records with that basename. If they hold more than one sha256,
   keep those in the citing build. If more than one is still left, refuse and print the
   candidates. The site cites 7 bare names that exist at 2 to 289 keys with 2 to 283 different
   bodies, so guessing would hand the wrong bytes.
6. **Absent.** Say whether the path was already absent at capture (1,799 rows today) or was
   never seen.

**Road 3, no tool at all.**

- The reader lists the old prefix and finds `MOVED-TO-OVERLAPPED-BUILD-v1.json`.
- It reads its own line in the `.keys.jsonl.gz` beside it with
  `zcat … | grep '"key":"<path>"'`, then runs `rclone cat r2:mishkan/cas/sha256/<xx>/<sha256>`.
- The same grep works on the meta file itself.

### 5.2 Which keys stay real, and why

**The rule.** A key stays a real R2 key only if a program reads it by its key and that program
will not be changed, or the owner names it. Everything else becomes a lookup.

| reader (readers survey) | how it reads today | rows | what changes | fate of what it reads |
|---|---|---:|---|---|
| live site, `reader/zone.html` | fetches `${ROOT}data/…` only; the zone-store `base` is null | 3 dormant | nothing | none on R2 |
| `restore-shelf-from-history-v1.mjs` | SigV4 GET `serving-lane/shelf/zones/<name>`, sha256-checked | 3,594 | adds a second road, GET `cas/sha256/<xx>/<pin>`, before falling back to git history; the 3,594 current bins go into `cas/` (gate G5) | `serving-lane/` standing-forever |
| `push-toggles-v1.mjs` | GET `MOSES-LEDGER-INDEX.md`; List+GET `moses-ledgers/` and 9 of its prefixes; List+GET 4 `corpus-lane-builds/` prefixes | 15 live | `--via-meta` for `corpus-lane-builds/` prefixes: listing from key records, GET by sha256, SHA256SUMS still held | ledgers standing-forever; the 3 served build prefixes standing-while-served; the builds root it lists still lists, now showing notes and standing keys |
| about 20 bake and projection tools (`--from`, `--in`, `--record`, `--ledger`) | a local folder | 23 | `materialize-build-v1.mjs` fills the folder; the tools do not change | lookup |
| the site's data stamps (R2 path + sha256 in `reader/data`) | text, never fetched | 158 pins, 128 cites | none; they resolve by Road 1 | served prefixes standing-while-served |
| other lanes' channels (Moses's K3-PREFIX rule) | by key, readers unknown | 20 channels | none | standing-forever (channels) or standing-until-named (archives) |
| Moses's build tools | his local tree | 17,119 recorded inputs (9,810 cross-build) | none; the paths in his records resolve by Road 2 | lookup |
| Moses's R2 operations: `rclone copy` (never sync) per build, `check --one-way`, `lsf`, `lsjson`, `md5sum` | per build prefix | n/a | new builds land as today; a guard refuses a re-push of a retired build (6, H15); `check-build-against-meta-v1` replaces the R2 check for retired builds | new builds are real keys until the owner retires them |
| Moses's source census | first 64 KiB of sources found only on R2, ranged GET | n/a | none while the archives stand; afterwards the same Range on the `cas/` object (ranged reads worked 951 of 951, hazards survey) | standing-until-named |
| compspan verify seat | GET of v13.5's copy | n/a | Road 2 or materialize | lookup |
| receipts | sha256 + relative path | 179,207 (154,519 pins) | none | Road 1 |
| relays, RULEs, ledger cites | path text | 53,047 provenance cites | none | Road 2 |
| references inside nested copies | path and pin | 17,996 | none; the copies' own keys are key records | Roads 1 and 2 |
| people browsing R2 | listing | n/a | forwarding notes | Road 3 |

**Kept forever: 49,501 keys, 3.13 GB.**

- `serving-lane/` (3,595 keys, 0.64 GB);
- `moses-ledgers/` (45,798 keys, 2.41 GB), Moses's delivery channel, which push-toggles lists whole;
- `MOSES-LEDGER-INDEX.md`;
- `serving-lane-handoffs/`, `frame/`, `disposition/`, `r2-push-suite/`, `retired/` and `cas/`;
- plus the new `overlapped-build/`.

**Kept while served: 1,900 keys, 1.92 GB.** These are the payload the site was baked from. When
the site serves a newer build, the old served prefix becomes a lookup. This rule keeps the bytes
behind the site's live provenance stamps at their stamped paths.

**Kept until named: 156,446 keys, 18.23 GB.** These are the archives. 18.28 GB of R2's distinct
content has no second copy anywhere, and most of it is here (copies survey). Moses's K3-PREFIX
rule keeps them today. They move only when the owner names each one.

**Lookup: 304,962 keys, 94.07 GB.** These are the build folders. They hold the copies: 95.99 GB
of keys on 48.56 GB of distinct content, MEASURED by the copies survey.

### 5.3 Moving the references: what is rewritten and what never is

**Never rewritten: any object already on R2.** That covers receipts, relays, RULEs, ledgers and
nested copies. Rewriting one changes its sha256 and breaks the pins that name it. 154,519 pins
sit in receipts alone. These objects resolve as they stand, through Roads 1 and 2.

**Rewritten on the site (Elijah, on main, shipped the usual way, ending with `gh-pages` following `main`):**

1. Add `reader/data/overlapped-build-v1.json`, the site's pin of the meta file.
2. Replace the 19 bare-name citations in 184 files with full key and sha256. 7 of them are ambiguous.
3. In `toggle-queue-v1.json`:
   - add the missing `corpus-lane-builds/` to the declarations entry's `r2_prefix`;
   - mark `moses-ledgers/ben-yehuda-v1/` (status proposed) as not on R2.
4. Point the Jastrow overlay's `moses-toggle-ledgers-v1` at `moses-ledgers/toggle-ledgers-v1/`.
   The push map already resolves it.
5. Add `push-toggles-v1.mjs --via-meta`.
6. Add the `cas/` road to `restore-shelf-from-history-v1.mjs`.

**Changed on Moses's side:** the push guard, and `check-build-against-meta-v1` for retired builds.
His recorded inputs keep their paths.

### 5.4 The reference proof R

`tools/check-references-resolve-v1.mjs` runs every one of the 244,845 rows of the readers
survey's `refs.tsv` through the resolver twice.

- **Before:** the 18 October listing plus the P1 hashes.
- **After:** the meta file plus a `cas/` listing, with every `lookup` key treated as already deleted.

**The gate:**

- 0 rows may differ.
- A key must resolve to the same sha256, a prefix to the same list, a pin to the same verdict,
  and an absent path must stay absent.
- The 64,008 normalized rows must reach the survey's own normalized target.

**Pins already broken before the migration** become pin records, and they are not counted as
failures of it:

- 706 keys carry two or more different sha256 pins (readers survey);
- the 3,505 stale shelf pins;
- pins on keys absent today: 91.

If Moses still holds any of those versions on his disk or on the git road, he ingests them into
`cas/` and the pin record turns `held: true`.

---

## 6. Hazards (from the hazards survey) and how each is handled

| # | hazard | handling |
|---|---|---|
| H1 | R2 keeps no versions; ListObjectVersions answers 501 | P1 to P5 and R come before any delete; the P5 guard compares each key with its capture; the meta file is kept in three places; nothing is ever deleted from `cas/` or `overlapped-build/` |
| H2 | 32 multipart objects, 14.05 GB, whose ETag is not an md5 | Content records keep md5, sha256, crc64nvme and `parts` (5,242,880-byte parts, 41 to 770 of them); their `cas/` copies are checked by streaming |
| H3 | 5,665 keys missing from rclone's md5 list | All of them are single-PUT objects whose ETag is the md5; P1 hashes every key anyway |
| H4 | key spelling: 43,937 non-ASCII keys, 1 that changes under NFD, 280 with spaces, 378 with `%`, 1,540 with brackets and the like | Keys are stored as JSON strings exactly as listed and never normalized; requests encode each segment the way `r2get.mjs` does; P1 and R include these keys, so the spelling is tested, not assumed |
| H5 | 38 keys with a segment over 255 bytes; about 1,506 keys would pass 259 characters on Windows (ESTIMATED) | The R2 view is unaffected; `materialize-build-v1` refuses them by name, and an `--flat` option writes them under their sha256 with a map |
| H6 | 11,182 zero-byte keys | One content and one `cas/` object; listed explicitly in key records and build hashes |
| H7 | gzip recompression is not deterministic across zlib builds (13 of 23 rebuilt only with Node 22's zlib, 7 only with Python's, 3 with neither) | This design never recompresses: every file is kept as its stored bytes |
| H8 | Content-Type varies by uploader; Content-Encoding must stay none, because `zone.html` hashes the raw body and gunzips it itself | Type is recorded per key; `cas/` objects are written without Content-Encoding; standing keys are untouched; `restore-build-to-r2` reapplies the recorded type |
| H9 | `x-amz-meta-mtime` on every rclone upload (607 of 630 sampled) | Kept per key, so Moses's file times can be put back |
| H10 | Moses's local links (14,941), hard links and 56 empty folders | Out of scope: the meta file is the R2 view; Moses's own inventory keeps the local shape (section 9) |
| H11 | case collisions and file/folder collisions: 0 today | P1 asserts they are still 0; a new one stops the capture |
| H12 | the shelf backup is stale (3,505 of 3,594 differ) | Gate G5 puts the 3,594 current bins into `cas/` by their pins (636,015,712 bytes) and refreshes the shelf; the local `ghp` copy holds all 3,594 at their pinned bytes and sha256 (MEASURED: I hashed all 3,594) |
| H13 | `?lifecycle` answers 403, so an expiry rule cannot be ruled out | Before G2, the owner confirms in the Cloudflare dashboard that no lifecycle rule exists on the bucket |
| H14 | the same path with different bytes (706 keys); standing keys are rewritten (`source-corpus-v1.json`) | `cas/` only grows; every write to a standing key goes to `cas/` first; pin records keep the history |
| H15 | Moses's `rclone copy` of a whole build would upload a retired build again | Moses's push guard (`check-push-not-retired-v1.mjs`) refuses to push into a retired prefix, except the forwarding notes |
| H16 | the bucket is live (29 new keys between 02:00 and 16:46 UTC) | Capture is a snapshot; ingest and capture are incremental by Last-Modified; P5 catches anything that changed |
| H17 | unknown whether any object is served publicly | If one is, its key is standing (its Content-Type and missing Content-Encoding are part of what it serves); the owner confirms |
| H18 | R2 upload dates are not build dates (220,692 keys carry the backfill day) | `modified` is a guard, not a date of record; build dates come from relays and RULEs |

---

## 7. Size at this design

| state | `cas/` | standing keys | physical bucket | how known |
|---|---:|---:|---:|---|
| today | 0.06 GB (15 objects) | n/a | **117.35 GB**, 512,809 keys | MEASURED, listing 16:46 UTC |
| true size (each distinct content once) | n/a | n/a | **68.24 GB**, 288,197 contents | MEASURED: (md5, size) groups, with the streamed md5 for multipart objects (hazards survey) |
| phase 1: build folders retired; channels, served payload and archives stand | 52.11 GB (246,443 contents: every content a lookup, channel or served key holds) | 23.28 GB | **75.39 GB** | MEASURED arithmetic over the listing and md5 groups (`out/fates.json`) |
| end state: archives also named and retired | 68.24 GB | 5.05 GB (channels 3.13 + served 1.92) | **73.29 GB** | MEASURED arithmetic, same way |
| the meta file | n/a | n/a | 52.6 MB per version | MEASURED on the model (2.5) |

**What the gap above the true size is.** The physical bucket stays above 68.24 GB on purpose.

- **Phase 1, 7.15 GB:** standing keys whose bytes are also in `cas/`, plus copies inside the archives.
- **End state, 5.05 GB:** only the bytes readers fetch by their key. The meta file reports the
  true size, 68.24 GB, whatever the layout.

**What a later step could add** (the overlap survey's figures, all ESTIMATED from its sample of
33.05 GB of distinct content):

- compressing text: about 30.5 GB (30.0 to 34.2);
- adding gz recipes and chunk sharing: about 27.3 GB with zlib (23.6 to 31.9) or 20.3 GB with
  xz (17.8 to 25.2).

Row and chunk sharing adds about 3.2 GB (about 10%) beyond compression alone. Any of these
steps would change how `cas/` holds bytes, and section 9 says why this design does not take them.

**Cost.** About $1.76/month today falls to about $1.13/month in phase 1 and $1.10 at the end
state, plus a one-time cost of about $1.30 for the copies. All ESTIMATED from prices the hazards
survey could not confirm ($0.015 per GB-month).

---

## 8. Tools, effort, who does what, and the gates

### 8.1 Tools

Site tools go under `reader/tools/` and Moses's under his builds' `scripts/`. All are named
`<verb>-<noun>-v1.mjs`. Effort is in agent sessions, ESTIMATED.

| tool | does | who writes and runs it | effort |
|---|---|---|---|
| `tools/capture-bucket-map-v1.mjs` | P1: streams every key, writes the key and content records and draft meta v1; read only | Elijah | 1 session, plus a 3 to 6 h run |
| `tools/check-meta-shape-v1.mjs` | every listed key exactly once; every key's sha256 has a content record; sorted; build hashes match; notes match the meta | Elijah (Moses runs it too) | 0.5 |
| `tools/ingest-content-store-v1.mjs` | server-side copy of each content missing from `cas/`; skips what exists; never touches a source key | Moses (he holds the write lane) | 1, plus a run of about 1 to 3 h (ESTIMATED, 288k copies) |
| `tools/verify-content-store-v1.mjs` | P2 and P3: streams every `cas/` object; recomputes every build hash | Elijah | 0.5, plus a run of 1 to 3 h |
| `tools/resolve-r2-path-v1.mjs` | Roads 1 and 2, as a library and a command | Elijah (Moses reviews the alias table) | 1 |
| `tools/check-references-resolve-v1.mjs` | proof R over all 244,845 rows | Elijah | 1 |
| `tools/materialize-build-v1.mjs` | 4.1: rebuilds a build into a local folder, checked | Elijah writes; both lanes use it | 0.5 |
| `tools/check-local-against-meta-v1.mjs` | P4 on Moses's disk, one inode counted once | Moses | 0.5, plus a run on his disk |
| `tools/check-push-not-retired-v1.mjs` | the push guard (H15) | Moses | 0.25 |
| `tools/write-forwarding-notes-v1.mjs` | writes the note and key list into each retired prefix, from the meta | Moses | 0.25 |
| `tools/push-shelf-to-store-v1.mjs` | G5: the 3,594 current zone bins into `cas/` by pin; refreshes the shelf | Elijah (the serving lane already writes `serving-lane/`) | 0.5 |
| `tools/plan-deletion-v1.mjs` | for the builds the owner names: the key list, the guard values and the totals; never deletes | Elijah writes; Moses checks | 0.5 |
| `tools/restore-build-to-r2-v1.mjs` | 4.1: shows that a deletion can be undone | Moses | 0.5 |
| site edits (5.3) | the pin record, citation fixes, `--via-meta`, the `cas/` road in restore-shelf | Elijah: suite, ship, `gh-pages` follows `main` | 1 |

The total is about 9 to 10 sessions plus 10 to 15 hours of unattended runs (ESTIMATED).

### 8.2 Gates, in order

1. **G1, shape:** the owner accepts this shape and the standing list (5.2), and confirms there is
   no lifecycle rule (H13) and whether anything is served publicly (H17).
2. **G2, capture:** Elijah, read only. P1 is done, meta v1 is drafted, and `check-meta-shape-v1`
   passes. Every md5 equals its ETag or the streamed multipart md5.
3. **G3, ingest:** Moses. `cas/` holds every content of phase 1. No existing key is written or
   deleted.
4. **G4, store proof:** Elijah. P2 and P3 pass for all contents and all units, and the build
   hashes are equal for all 289.
5. **G5, the site's own backup:** Elijah. The 3,594 current zone bins are in `cas/` and the shelf
   is refreshed, so the one copy the site needs off this machine is whole before anything else
   moves.
6. **G6, readers:** Elijah, with Moses for his tools.
   - Proof R shows 0 differing rows.
   - The site edits are shipped.
   - Moses's push guard is in place.
   - Meta v1 is published and pinned in three places (3.4).
7. **G7, third copy:** Moses. P4 is run and every difference listed. Moses ingests any pinned
   old versions he still holds.
8. **G8, dry run:** both lanes.
   - `plan-deletion-v1` lists, for each build proposed, its keys, bytes, the guard values and
     the proofs that cover it.
   - The forwarding notes are written and checked against the meta file.
   - Both lanes sign the list.
9. **G9, the owner names the deletion:** which builds, and later which archives.

After G9, the deleting lane applies the P5 guard to each key. Elijah then lists the bucket
again, publishes meta v2 with those keys marked `retired`, and runs proof R again on all rows.

---

## 9. Risks, and what this design gives up

### What it gives up

- **Row and chunk sharing.**
  - What it would gain: about 41 to 48 GB of `cas/` (68.24 GB down to the overlap survey's
    ESTIMATED 27.3 GB, or 20.3 GB with xz).
  - Why this design keeps whole files: every one of the 182,681 sha256 pins then resolves by one
    plain GET, with no tool, now and in ten years.
  - The cost of sharing:
    - every reader would have to go through a rebuild tool;
    - every gzip file would need a pinned deflater build;
    - about 2% of gzip files cannot be rebuilt at all (overlap survey).
  - Where the gain is: in a few families, mostly compspan (0.76 GB), cold (0.90 GB) and
    witnessed-order (0.25 to 0.29 GB). The overlap survey measured that row sharing adds only
    about 3.2 GB beyond compression.
  - Still possible later: the store could add such a step behind the resolver, for content
    nothing pins. The `home` and `gz` fields leave room for it.
- **Packing.** 177,008 tiny contents become their own objects.
- **A smaller physical bucket.** 5.05 GB is held twice on purpose at the end state, and 7.15 GB
  in phase 1.
- **Moses's local tree.** The meta file is the R2 view. Links, hard-link groups, empty folders
  and Windows paths over 259 characters are left to Moses's own inventory.
- **What is not on R2.** About 70 GB of 999 footsteps (ESTIMATED by the copies survey, never
  hashed), `moses-accent-types-v1` (3.12 GB, never uploaded), the git road, and 1.19 GB of
  piece-store run outputs with no R2 copy. The meta file cannot keep what it never saw.

### Risks

- **The meta file as the one record.** If every copy of it were lost, `cas/` would be nameless
  bytes. This is met by:
  - three pinned copies off the file;
  - each version also held in `cas/`;
  - the forwarding notes, which carry each build's key list.
- **One bucket, one copy.** `cas/` is one copy on R2. The archives have no second copy anywhere
  (18.28 GB, copies survey). Whether they need one is the owner's question, and it is untouched
  by this design.
- **The resolver is a new rule set.** If its alias table drifted from the readers survey's
  normalization, paths would resolve to the wrong place. Proof R checks it against the survey's
  64,008 normalized rows and refuses ambiguity rather than guess.
- **Pins that were already broken stay broken:** the stale shelf, `source-corpus-v1.json`, and
  706 keys pinned with more than one sha256. The design records them and does not mend them.
  G5 fixes the shelf separately.
- **Writes after capture.** A key rewritten between capture and delete is caught by P5. A
  standing key overwritten later loses its old bytes unless the cas-first rule (H14) is kept.
  That rule lives in two lanes' habits, not in R2.
- **Unconfirmed R2 limits and prices.** The 5 GiB copy limit, the prices, and the absence of a
  per-object minimum are all from memory, because the docs host was unreachable from here. They
  should be confirmed before G3.
- **Statuses.** 60 units (1.59 GB) are of unknown status, and 6 statuses are inferred from
  names. Under this design that only affects what the owner names for deletion. Every byte is
  in `cas/` whatever the status.

---

### Sources and scripts

- **My scripts:** `scratchpad/meta/design-readers-first/scripts/`.
  - `01-join.py`: listing, md5 and census units into `out/keys.tsv`.
  - `02-fates.py`: fates and sizes into `out/fates.json` and `out/fate-by-top.tsv`.
  - `03-model.py`: the meta model, measured in `out/model-numbers.json` (`out/model-meta.jsonl.gz`).
- **Example hashes:** `out/examples-hashed.tsv`. The downloads, about 82 MB, are deleted after hashing.
- **The surveys:** `scratchpad/meta/{census,overlap,readers,hazards,copies}/`.
