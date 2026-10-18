# The map: one meta file for the R2 bucket

For the owner, from Elijah (serving lane), 18 October 2026, revision 2; Moses (corpus lane) builds parts of it. Nothing here deletes anything but the drill copies the owner allows at G0. R2 keeps no versions, so an overwrite counts as a deletion. Only the owner names a deletion.

**Numbers.** [M] is measured, [E] estimated; the basis follows in brackets or in the table. GB means 10^9 bytes. Counts come from the 18 Oct 16:46 UTC listing; statuses from the census, which used the 02:00 listing (29 keys differ).

Spine: the files-first design, plus readers-first's reader parts and overlapped's sizing and checks (`meta/JUDGING.md`). Revision 2's changes: `meta/CHANGES.md`.

---

## 1. The problem in numbers

| What | Number | How known |
|---|---|---|
| Bucket today | 117.35 GB in 512,809 keys | [M] full listing |
| Real content (each distinct file once) | 68.24 GB in 288,197 contents | [M] grouped by md5 and size; md5 streamed for the 32 multipart objects |
| Copies | 49.11 GB, 42% of the bucket | [M] bucket minus real content |
| Builds | 290 units. 6 are not prefixes: 2 single files, 3 "(own files)" groups, and one group of 4,031 editions folders | [M] census unit rule (289 at 02:00, plus one new handoff folder) |
| Distinct things built | 220 families. 31 have more than one unit (100 units); 24 have more than one version (84 units) | [M] census |
| Versions inside one folder | 36 inner version folders inside 18 build folders, 17,978 keys, 18.52 GB | [M] by folder name; an upper bound, since a few hits are gate copies |
| Current | 51 units, 41.32 GB (30.45 GB distinct) | [M] sizes; the census judged the status of each |
| Superseded | 60 units, 43.91 GB. No current, evidence or unknown unit holds 10.39 GB of it; 7.04 GB is held by one superseded unit alone | [M] |
| Evidence | 118 units, 30.51 GB | [M] |
| Unknown status | 60 units, 1.59 GB | [M] |
| Keys the site's data points at on R2 | 5,800 keys, 2.91 GB | [M] census served payload |
| R2 fetches by the live site at runtime | 0 | [M] readers survey, from `zone.html` |

The "several hundred builds" are about 220 things, copied into each other: 16.76 GB of nested copies plus 6.88 GB of gate and mirror folders [M, census].

## 2. What the meta file is

Every distinct file is copied once, byte for byte, into a store on R2 named by its sha256. One meta file lists every key the bucket holds or has held, with its path, build, size, sha256 and stored headers. Any old build comes back from the store, each file checked by sha256, and its first line gives the bucket's real size. This is the "one overlapped build": builds overlap in the store, and the meta file keeps each build's own view. Row sharing can come later, inside the store, without changing a key record.

## 3. What it consists of

| The file | |
|---|---|
| Name | `overlapped-build/meta/meta-v0001.jsonl.gz` |
| Format | UTF-8 JSON Lines, one record per line, gzip -9 with the header mtime set to 0; field names in lowercase kebab-case; every line has a `record` field |
| Record order | `head`, `door`, `reader`, `alias`, `build`, `content`, `key`, `pin` |
| Sort | within each type, by the UTF-8 bytes of the first field: the file's own rule, not R2's listing order (section 8). A listing and the meta file are compared by joining on the exact key, never by walking both in order, and no capture resumes a listing by `start-after`. |
| Size | 61.5 MB with gzip -9 (285.3 MB raw, 48.4 MB with xz -6) [M on a full-size model: 512,809 real keys, 288,197 contents, 290 builds, stand-in hashes of the same length; `meta/judge/scripts/01-map-model.py`] |

| Record | Field (type) | Meaning |
|---|---|---|
| `head` (1) | `format` (str) | `"overlapped-build-meta-v1"` |
| | `bucket`, `version` (int), `previous-sha256` (hex or null) | the chain of versions; the hash is of the previous version's inflated lines |
| | `listed-from`, `listed-to`, `hashed-to` (UTC) | the capture window |
| | `keys`, `key-bytes`, `contents`, `content-bytes`, `builds` (int) | **`content-bytes` is the bucket's real size** |
| | `dashboard-bytes`, `dashboard-objects` (int), `pending-uploads` (list) | R2's own figures, read by the owner, next to `key-bytes`; unfinished multipart uploads from ListMultipartUploads |
| | `unit-rule` (str), `store-keys` (list) | the census unit rule word for word, with its two changes (the store class; inner versions split out); the 15 store keys that predate the map, by name |
| | `store-layout` (str) | `"cas/sha256/{sha256[0:2]}/{sha256}"` |
| | `tools` (obj) | each tool's sha256, plus the Node version |
| `door` | `prefix` (str), `class` (`door` or `archive`), `until` (`forever`, `while-served` or `named`), `readers` (list), `why`, `keys`, `bytes` | a prefix or key that stays a plain R2 key, and the reader who needs it |
| `reader` | `reader`, `lane`, `how` (GET, list+GET, ranged GET, local copy), `reads` (list), `after` | who reads R2 today, and what changes for them |
| `alias` | `from`, `to`, `why` | short path forms, such as `{BUILDS}/` → `corpus-lane-builds/`, and the 10 push-map pairs |
| `build` | `build` (name), `members` (list) | one record per unit or inner version. `members` lists its prefixes, or for a file unit the key itself. Membership comes from this field, never from `present`. |
| | `family`, `version`, `prev` (build or null) | `prev` is set by version only; a second place or a part of the same version has `prev: null` |
| | `status`, `status-why` | census notes; changing one means a new meta version |
| | `keys`, `bytes`, `distinct-bytes`, `unique-bytes` (int) | `unique-bytes` counts the bytes no other build holds |
| | `new-bytes` (int) | distinct bytes not held by `prev`: **what this version really added** |
| | `digest` (hex) | sha256 over lines `<path relative to its member>\t<size>\t<sha256>\n` for every member key, sorted by UTF-8 bytes, zero-byte files included. Frozen when the build is retired. |
| | `holds-copies-of` (list), `first-modified`, `last-modified`, `retired` (`{date, order, last-present-version}`) | the dates are upload times, not build times |
| `content` | `sha256`, `size`, `md5`, `crc64nvme` (base64) | `sha256` is the store name. `md5` equals the ETag of a single-part copy, so a listing can check the store without downloading it. |
| | `parts` (`[part-size, count]`) | only when the original was a multipart upload |
| | `keys` (int), `form` (`"plain"`), `home` (key), `held` (bool) | `form` leaves room for later forms. `home` is present only while the bytes live at a plain key and not yet in `cas/`. `held: false` marks bytes that were rewritten before the fill could copy them. |
| `key` | `key` (str) | exactly as listed: never normalized, never URL-encoded |
| | `build`, `class` (`door`, `archive`, `build`, `store` or `note`), `present` (bool), `retired` (`{date, order}`), `moving` (bool) | `build` is null for `store` and `note` |
| | `size`, `sha256`, `etag` | `etag` is written only when it differs from the md5 (multipart, `<hex>-N`) |
| | `last-modified` | as listed; this is the delete guard |
| | `content-type`, `meta` (every `x-amz-meta-*` by name), `checksum` (`{algorithm: value}`) | as stored, so a restore can set them back. R2 returns the checksum on a GET only with `x-amz-checksum-mode: ENABLED` [M]. |
| | `copy-of` (key) | where a nested copy's path points. It is a note, never a proof. |
| `pin` | `key`, `sha256`, `size`, `pinned-by` (list), `verdict` (`differs-at-capture` or `target-absent`), `held` (bool), `why` | only for pins that do not match the captured bytes |

**Rules.** A key record is never removed: a deleted key gets `present: false` and `retired`; a rewritten key gets a second record. Headers belong to the key, since one content can sit at keys with different mtimes. Keys under `cas/` and `overlapped-build/` are class `store`, forwarding notes class `note`; neither belongs to any build or its sums. Inner version folders (`build-vX`, `vX`, `ship-vX`, `verify-vX-*`) become builds of their own; Moses confirms the list. The capture stops on any Content-Encoding (0 of 4,221 sampled [M]).

**Real example records** (sha256 measured by downloading; headers from HEAD requests; each record is one line).

**(a) A file the site's data points at** (span store v1.4). It is a door while it is served.

```json
{"record":"key","key":"corpus-lane-builds/moses-span-store-v1/build-v1.4/span-store-v1.4/places/amos.jsonl",
 "build":"corpus-lane-builds/moses-span-store-v1/","class":"door","present":true,"size":5036,
 "sha256":"1ec039363d7f0859d32e3cda0a9c87212b85b10f5e25210bcb35c0a7e0b63e55","last-modified":"2026-10-17T15:24:49.341Z",
 "content-type":"application/octet-stream","meta":{"mtime":"1792232922.2888705"},"checksum":{"crc64nvme":"nK9KLJFzWgo="}}
{"record":"content","sha256":"1ec039363d7f0859d32e3cda0a9c87212b85b10f5e25210bcb35c0a7e0b63e55","size":5036,
 "md5":"91586e1fa65d4a95a99490a6bb138104","crc64nvme":"nK9KLJFzWgo=","keys":2,"form":"plain"}
```

With inner versions split out, its `build` becomes span store v1.4.

**(b) A nested copy that lies.** Its path names the v13.6 RULE, but it holds the v13.7 RULE's bytes, so every key carries its own hash.

```json
{"record":"key","key":"corpus-lane-builds/moses-compspan-v13.7/verify/gate-v136/root/tab/lane/moses-compspan-v13.6/build/RULE-compspan-v13.6.md",
 "build":"corpus-lane-builds/moses-compspan-v13.7/","class":"build","present":true,"size":22508,
 "sha256":"6fa9e711de9bd600d7ea53e915ac6109693f8977fac2eb5c10c9328f109c5f28","last-modified":"2026-10-09T04:29:06.298Z",
 "copy-of":"corpus-lane-builds/moses-compspan-v13.6/build/RULE-compspan-v13.6.md"}
{"record":"key","key":"corpus-lane-builds/moses-compspan-v13.6/build/RULE-compspan-v13.6.md",
 "build":"corpus-lane-builds/moses-compspan-v13.6/","class":"build","present":true,"size":19877,
 "sha256":"924e8a370f7a0c039aadc3acf1a29061165fe79d4a3b411f75249dd6c6da029d","last-modified":"2026-10-03T05:41:15.175Z"}
```

**(c) A superseded .gz file and its build,** stored as its own bytes. As whole files, v2.4 added 446.3 MB (377 contents) over v2.3 [M]. Of that, the 41.2 MB old-witness table needs only 26,664 bytes of new pieces, one row [M, overlapped prototype]; the other 405 MB were not measured at row level.

```json
{"record":"key","key":"corpus-lane-builds/moses-witnessed-order-v2.4/old-witness-table-v2.4.jsonl.gz",
 "build":"corpus-lane-builds/moses-witnessed-order-v2.4/","class":"build","present":true,"size":41170279,
 "sha256":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","last-modified":"2026-09-23T22:50:56.884Z",
 "content-type":"application/x-gzip","meta":{"mtime":"1790199856.0165124"},"checksum":{"crc64nvme":"JIYuu8nTfPw="}}
{"record":"content","sha256":"ef6e724dc6047032a2738b7717066b9d83da36ce917ccdbf0e438591b725f2ad","size":41170279,
 "md5":"3699c6a254d13ae94040610c3b6e5691","crc64nvme":"JIYuu8nTfPw=","keys":8,"form":"plain"}
{"record":"build","build":"corpus-lane-builds/moses-witnessed-order-v2.4/","members":["corpus-lane-builds/moses-witnessed-order-v2.4/"],
 "family":"moses-witnessed-order","version":"2.4","prev":"corpus-lane-builds/moses-witnessed-order-v2.3/","status":"superseded",
 "status-why":"newer version on R2: moses-witnessed-order-v2.5 ; newest own relay FOR-ELIJAH-v31.md SUPERSEDED",
 "keys":1262,"bytes":1404813346,"distinct-bytes":877696887,"unique-bytes":1565042,"new-bytes":446337790,
 "digest":"(at capture)","holds-copies-of":[],"first-modified":"2026-09-23T22:49:03Z","last-modified":"2026-09-24T00:29:56Z"}
```

**(d) A small build, with its digest measured over its 7 keys.**

```json
{"record":"build","build":"corpus-lane-builds/moses-bundled-by-century-v1/","members":["corpus-lane-builds/moses-bundled-by-century-v1/"],
 "family":"moses-bundled-by-century","version":"1","prev":null,"status":"superseded",
 "status-why":"newer version on R2: moses-bundled-by-century-v2,moses-bundled-by-century-v2.1",
 "keys":7,"bytes":248901,"distinct-bytes":248901,"unique-bytes":0,"new-bytes":248901,
 "digest":"eb5e6955db7764ce2d89fe8048491d142a195ed5162e7a49dc930f67b7ee8a4d","holds-copies-of":[],
 "first-modified":"2026-09-23T00:28:04Z","last-modified":"2026-09-23T00:28:04Z"}
```

**(e) The zero-byte content (11,182 keys) and a multipart archive,** a file unit whose ETag is not an md5.

```json
{"record":"content","sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","size":0,
 "md5":"d41d8cd98f00b204e9800998ecf8427e","crc64nvme":"AAAAAAAAAAA=","keys":11182,"form":"plain"}
{"record":"key","key":"cold/editorial-999-strike-20260830-evidence.tar.gz","build":"cold/editorial-999-strike-20260830-evidence.tar.gz",
 "class":"archive","present":true,"size":4036386504,"sha256":"6638889f9b075ab4bc169685f1f6a3fe138b63b58626411a5ccee99a9a4accc9",
 "etag":"a593d46e972ba49b4135de5cc92b6902-770","parts":[5242880,770],"last-modified":"2026-08-30T09:53:27.921Z",
 "content-type":"application/x-gzip","meta":{"md5chksum":"uoOoTiRDfz3+EQtHbZgOMw==","mtime":"1788082387.5541076"},
 "checksum":{"crc64nvme":"bx3lCuZ7hZY="}}
```

**(f) A door, a pin that no longer matches (the shelf holds an older 246,088-byte amos.bin), and an alias.** After step 0, `held` becomes true.

```json
{"record":"door","prefix":"serving-lane/shelf/","class":"door","until":"forever","keys":3595,"bytes":639297530,
 "readers":["reader/tools/restore-shelf-from-history-v1.mjs"],"why":"SigV4 GET by key; writes only bytes equal to the pin"}
{"record":"pin","key":"serving-lane/shelf/zones/amos.bin","sha256":"1d5406cb1b605d3dfd2d0fb49c84c7226f83a0ad80acfca406d227dfee9bff97",
 "size":207289,"pinned-by":["reader/data/zone-store-v1.json"],"verdict":"differs-at-capture","held":false,
 "why":"shelf backup of 2026-09-28 predates the pin"}
{"record":"alias","from":"moses-toggle-ledgers-v1/","to":"moses-ledgers/toggle-ledgers-v1/","why":"push map"}
```

## 4. The stores it points at

```
cas/sha256/<aa>/<sha256>                          each distinct content once, exact bytes, no extension
overlapped-build/meta/meta-v<NNNN>.jsonl.gz       the meta file; each version is new and never rewritten
overlapped-build/meta/meta-v<NNNN>.jsonl.gz.sha256
overlapped-build/LATEST.json                      {version, key, sha256, gzip-sha256, bytes}; rewritten only under the overwrite rule
overlapped-build/RULE-overlapped-build-v1.md      plus .sha256 and a RECEIPT, in Moses's RULE-first form
overlapped-build/proofs/  overlapped-build/orders/  proof receipts; the owner's deletion orders
<retired prefix>/MOVED-TO-OVERLAPPED-BUILD-v1.json and .keys.jsonl.gz   forwarding note and key lines, written after the keys are gone
<retired file key>.MOVED-TO-OVERLAPPED-BUILD-v1.json                   the same for a file unit, beside the file
```

**Every class, by prefix** [M, readers-first fate rule over the 16:46 listing, with `cas/` moved to the store class]:

| Class | Prefixes | Keys | Bytes |
|---|---|---|---|
| store: no order may ever name it | `cas/`, `overlapped-build/` | 15 | 0.06 GB |
| door until forever | `serving-lane/`, `moses-ledgers/`, `MOSES-LEDGER-INDEX.md`, `serving-lane-handoffs/`, `frame/`, `disposition/`, `r2-push-suite/`, `retired/` | 49,486 | 3.07 GB |
| door while served | 14 served prefixes and keys under `corpus-lane-builds/`, plus the 42 pinned Masoretic files | 1,900 | 1.92 GB |
| archive until named | `cold/`, `corpus-staging/`, `editions-built-v1/`, `moses-ia-wave-v1/` to `-v3/`, `moses-raws-v1/`, `moses-markup-reissue-v2/`, `moses-ia-year-recovery-v1/`, `moses-rule8-probe-v1/`, `moses-tanakh-mam-restore-v1/` | 156,446 | 18.23 GB |
| build | everything else: `corpus-lane-builds/` and `mishkan/` | 304,962 | 94.07 GB |

- **Naming.** sha256 names the store, because all 182,681 hash pins are sha256 [M]; a pin becomes an address. md5 stays beside it: the single-part ETag is the md5 (507,112 of 507,112 [M]), so a listing can check the store. The 15 objects already in `cas/` (55.5 MB of archived Codex sessions, the only copies) follow this layout and hash to their names [M]; they join the store class, named in the head.
- **Writing.** Each store object is a server-side copy sent with `x-amz-copy-source-if-match: <captured ETag>`, with Content-Type `application/octet-stream`, no Content-Encoding, and `x-amz-meta-sha256` equal to the name. A refused copy means the key changed after capture: it is hashed again, and the old content gets `held: false` unless another key holds it. The fill follows the capture at once; if the owner lets the capture lane write, it copies each content as soon as it is hashed. The largest object, 4,036,386,504 bytes, is under the 5 GiB single-copy limit (unconfirmed).
- **No packing in v1.** 61% of contents are under 4 KiB but hold only 0.17 GB [M]. About 288,000 writes cost about $1.30 [E, unconfirmed price].
- **Pinning and copies.** The inflated-lines sha256 and the gzip-bytes sha256 are both pinned, since gzip output differs between zlib builds [M]: in `LATEST.json`, in the site's `reader/data/overlapped-build-v1.json` (main, then `gh-pages` follows main), and in `MOSES-LEDGER-INDEX.md`, which only Moses writes, at the one key he names (two keys hold it today [M]). The file itself is kept twice in the bucket (`overlapped-build/meta/`, `cas/`), once on Moses's disk, and once off the bucket in the site repository's `overlapped-build-meta` branch.
- **Later.** A content may change `form` (`"xz"`, or `"rows-v1"`: row pieces in packs, gzip rewrapped by a pinned deflater) only after both lanes rebuild it from that form to its sha256. One that fails stays `"plain"` (3 of 23 sampled gzip files rebuild with neither Node nor Python [M]). Removing a plain `cas/` object needs a new map version the owner accepts.

## 5. How an old build comes back, and the proof before any deletion

**Restoring a build:** `restore-build-v1.mjs --build <name>` with `--verify`, `--to <dir>` or `--to-r2 <prefix>`.

1. Fetch the meta version `LATEST.json` names; check both hashes against the site's pin.
2. Take the build's member key records, by default from the last version in which it was present.
3. GET each `cas/sha256/<aa>/<sha256>` with `accept-encoding: identity`, hashing as it streams. Stop on any mismatch.
4. Write: to a folder via `<dir>.incoming`, with times from `meta.mtime`, renamed only when all pass (names the disk cannot hold are refused, never shortened); or to R2 by server-side copy with the recorded headers, in 5,242,880-byte parts over 200 MiB so the ETag comes back the same; or nothing, with `--verify`.
5. Recompute the digest, compare it with the frozen one, and write a receipt.

**The proof.** It covers every key and every build, not a sample.

| Proof | Who | What passes |
|---|---|---|
| P1 capture | Elijah, read only | Every key is listed; keys are unique, and their count equals the page totals. ListMultipartUploads is read too. Every key is fetched with `x-amz-checksum-mode: ENABLED` and hashed (sha256, md5, crc64nvme), and its headers are kept; a missing or unexpected checksum header fails. Each size equals the listing. Each md5 equals its ETag; for the 32 multipart keys, the rebuilt 5 MiB-part ETag equals the ETag and the md5 equals `md5chksum`. A key whose size or ETag changes during the capture is listed and hashed again, up to 3 times, then recorded as `moving`. That is 512,809 keys and 117.35 GB, taking about 3 to 6 hours [E, from 22.5 MB/s and about 57 small objects per second, both M]. |
| P2 fill | Moses, or whoever the owner allows to write `cas/` | Each missing content is copied with the if-match guard. Nothing outside the store is written or deleted. |
| P3 store | the lane that did not fill | Against meta v2 (step 4): every `cas/` object is streamed back, and its sha256 equals its name. Its md5 and size equal the content record. Nothing in `cas/` is unaccounted for. |
| P4 every build | Elijah | Against meta v2: `restore-build-v1.mjs --all --verify`, through the real restore code. All build digests are equal, every non-store key sits in exactly one build or is a note, and the sums equal the listing. Run again after every deletion order. |
| P5 independent | Moses | His own verifier, written from this map without reading Elijah's code, plus `rclone hashsum sha256 --download` over `cas/` and `rclone md5sum` over the originals. He also checks his local tree against the meta file, counting each inode once, after hashing the two folders his inventory left unmeasured. |
| P6 drill | both | Six hazard builds (6.31 GB [M]) are restored for real, to `restore-drill/` on R2 and to Moses's Windows disk, and hashed. The drill includes one ranged read of an archive through `cas/`. Then the drill copies are deleted, under the G0 exception. |
| R references | Elijah | All 244,845 reference rows resolve the same way before and after, with every build key treated as deleted. In each order's dry run, again with exactly that order's keys treated as deleted, archives included. Pass: 0 differences. |

Each proof must catch planted faults: a flipped byte, a fake ETag, a misnamed store object, a missing key record, a missing checksum header. P1 and P3 tie each key and each store object to one sha256, and a restore checks it again.

**The guard.** A key is deleted only when all of these hold:

| # | Condition |
|---|---|
| 1 | An owner's order names it and cites the meta version's sha256. |
| 2 | Its class is `build`, or `archive` named in the order. Never `store`, `note` or a door. Never a key marked `moving`. Never one of the 28,482 keys of Elijah's on-hold plan, until the owner withdraws that list in writing. |
| 3 | Its content passed P3 and P5 (for an archive, in its own step 11 cycle). |
| 4 | Proof R in the order's dry run shows 0 differences. |
| 5 | The freeze holds: both lanes have signed that no `copy`, `copyto`, `sync` or mirror job writes into the prefixes being deleted until the re-listing is done. |
| 6 | A fresh listing just before the delete shows the captured size, ETag and Last-Modified. The delete is conditional (If-Match) if R2 honors that on DeleteObject; this is unconfirmed and is settled before the delete tool is written. |
| 7 | A check across both lanes, by hash, finds no content losing its last copy. It refuses any content whose local status is unmeasured. |

Afterwards a re-listing must show exactly the ordered keys gone and nothing else changed. Condition 7 is the lesson of the 3.49 GB case: two plans, each safe alone, would together have left 6,247 files with no copy [M, copies survey].

**The overwrite rule.** The shelf is never overwritten. Before any other key the map rewrites (`LATEST.json`; `MOSES-LEDGER-INDEX.md`, by Moses), its old bytes are proved in `cas/`, and the write is conditional on the captured ETag (If-Match on PutObject, unconfirmed on R2; otherwise a re-list just before writing).

## 6. Who reads R2 today, and how each keeps working

| Reader | Reads today | After the map |
|---|---|---|
| The live site pages | Nothing from R2. The dormant zone-store road has `base` set to null. | No change |
| `restore-shelf-from-history-v1.mjs` | `serving-lane/shelf/zones/<name>` for 3,594 sha256 pins | `serving-lane/` is a door and is never overwritten. Only 89 pins match the shelf today. For 3,442 pinned bins (591.0 MB) the only copy of the exact bytes is the `ghp` checkout in this cloud session: not on R2, and not in git's current tree [M]. They can be remade: `restore-shelf-from-history-v1.mjs` rebuilds them from the commit before they were untracked, renaming postures and recompressing with gzip -9, and it writes only bytes equal to their pins (proved on 2026-10-03, RESTORE_OK). That road holds only while Node's zlib recompresses to the same bytes, which the gzip test above shows is not given across builds. A reset took 3,448 bins on 2026-09-23. So at step 0 all 3,594 bins go into `cas/` at their pins, which only adds keys, and the tool gains a `cas/` road. A ship rule follows: every ship that changes `zone-store-v1.json` pins puts the new bins in `cas/`, and a check fails when a pinned bin is absent. |
| `push-toggles-v1.mjs` | `MOSES-LEDGER-INDEX.md`; lists `moses-ledgers/` whole; fetches 3 `corpus-lane-builds/` prefixes | All are doors. A `--via-meta` option covers a build prefix once it stops being served. The declarations prefix is fixed by adding the missing `corpus-lane-builds/`. |
| About 20 bake and projection tools | A local folder (`--from`, `--in`, `--record`) | `restore-build --to <dir>`, then the tools run unchanged. A check confirms that a re-bake reproduces `reader/data` byte for byte. |
| 182,681 sha256 pins on 108,909 keys | path plus sha256 | Each pin is an address in `cas/`. Whole-file restores keep every pin valid. |
| 62,127 path citations without a hash (64,008 rows need normalizing) | a path | A resolver uses the alias table, the push map, relative paths, prefix listing and bare names. It refuses ambiguous names: 7 of the site's bare names have 2 to 283 different bodies [M]. |
| Moses's builds | his local tree | No change |
| Moses's R2 checks (`lsf`, `lsjson`, `check --one-way`, `md5sum`) | build folders | For a retired build, his checks use the sum file `export-build-sums-v1.mjs` writes from the meta file, even though the folder still holds its forwarding note. |
| Moses's ship and verify scripts | Each ship rewrites the previous version's banner pages: v13.8 rewrote four v13.7 pages and checked them [M]. 22 literal targets in 20 scripts of 13 builds read another build's prefix [M, scan of 10,413 script bodies]. | A build is retired only after its successor, if it has one, has shipped and its banner pages are in a captured meta version. The push guard lets a ship write the named banner keys of a retired build; they enter the next version as rewritten keys. These scripts' targets join proof R. |
| Moses's key-level reads | 64 KiB heads (`rclone cat --count 65536`) of 125 to 129 archive objects [M, two counts of his heads manifests]; v13.5's copy | Archives stay plain until named. Before one is named, Moses switches these reads to ranged GETs on `cas/` (951 of 951 ranged reads worked [M]). The v13.5 copy comes through the resolver or a restore. |
| Moses's uploads | `rclone copy` and `copyto`, with no `--ignore-existing` in any upload script found (0 of 190 [M]); changed files are overwritten | A push guard refuses uploads into a retired prefix except the banner keys above. The next meta version captures new and rewritten keys. |
| Moses's delete ledger v1 | 1,034 local DUPLICATE units (16.60 GB) each name an R2 build path as their kept copy, proved by `rclone check` at that path [M]. Its RULE 6.5 counts any top-level prefix as a valid target, so `cas/` and `restore-drill/` would count. | Moses re-proves each DUPLICATE against `cas/` by md5 and sha256 (a ledger v2) before its R2 path is retired. He amends RULE 6.5 so that `cas/`, `overlapped-build/` and `restore-drill/` are not targets until P3 and P5 pass, and runs the ledger only against a named meta version. |
| Elijah's on-hold delete plan | 28,482 must-remain keys, 18.46 GB, all under `corpus-lane-builds/` [M] | Those keys stay out of every order until the owner withdraws the list in writing (decision 8). Both lists join step 8's dry run. |
| People browsing R2 | listings | A forwarding note and key list in each retired prefix: `zcat \| grep`, then `rclone cat`. |
| 706 keys pinned with two or more sha256 values | old bytes | R2 never kept the older versions. A pin record says plainly that they are not held, and Moses adds any he still has. |

## 7. Sizing

| Level | What it keeps | Size | How known |
|---|---|---|---|
| L0 | today's bucket | 117.35 GB | [M] listing |
| L1 | each distinct file once (this map's store) | **68.24 GB** | [M] md5 and size groups |
| L2 | distinct lines, after inflating .gz | 119.5 GB (99.9 to 214.5) | [E] sample, extrapolated |
| L3 | distinct chunks of about 100 KiB, inflated | 137.9 GB (121.1 to 227.4) | [E] same method |
| B | each distinct file compressed alone, zlib | 30.5 GB (30.0 to 34.2) | [E] same method |
| L4 zlib | chunks shared, then compressed | 27.3 GB (23.6 to 31.9) | [E] same method |
| L4 xz | the same with xz | 20.3 GB (17.8 to 25.2) | [E] same method; no xz baseline was computed |

L2 and L3 are larger than L1 because they count inflated bytes.

- **Measured:** 10 families, 56,624 distinct files, 33.05 GB (48.4% of L1), 74,469 downloads with 0 md5 mismatches.
- **Estimated** (measured chunk tables over an estimated baseline of each file compressed alone; every gzip assumed rebuildable): row sharing gains 2.16× in compspan, 1.7× to 2.0× in witnessed-order, 1.69× in run-ledger-backwards, 1.23× in cold, 1.00× to 1.22× in the other six.
- **Extrapolated:** the other 51.6% of L1. 8.2 GB was scaled inside two sampled families, 23.0 GB of text, gz-text and tar.gz by the ten families' class ratios, and 3.9 GB of binary and media by 40-file prefix samples. 26 multi-unit families (9.24 GB distinct) were never sampled, led by search-ledger (2.42 GB), piece-store (2.09 GB) and deploy-check (1.33 GB) [M, census].

**"For sizing", answered directly.**

- The bucket's real size is **68.24 GB** [M], the head's `content-bytes`; 49.11 GB of today's 117.35 GB is copies.
- With zlib, each file alone: about 30.5 GB; with rows shared too: about 27.3 GB (23.6 to 31.9) [E]. Row sharing is worth about 3.2 GB (about 10%) for the whole bucket [E]. xz would bring it to about 20.3 GB, mostly from the compressor.
- Inside versioned families it matters a lot: the old-witness tables are 2.43 GB on R2, 205.7 MB as 5 distinct files, 84.2 MB compressed alone, and 19.2 MB with rows shared [M, overlapped prototype].
- `new-bytes` is what a build added as whole files: compspan v13.8 added 158.7 MB of its 1,123.2 MB [M]. Over the real version steps of the 24 versioned families, later versions added 14.27 GB; the later builds hold 22.85 GB distinct between them [M].

**The bucket after this map** [M arithmetic over the listing; the 15 existing `cas/` objects counted once]:

| When | Bucket size |
|---|---|
| While filling, phase 1 | peaks at about 169.41 GB |
| Phase 1: builds retired, archives still plain | 75.34 GB, of which `cas/` is 52.11 GB |
| End state: archives named too | 73.23 GB |

Step 0 adds 0.61 GB to each row: 3,505 current zone bins on no R2 key today [M, md5 and size]. The end state costs about $1.10 a month, against $1.76 today [E, unconfirmed $0.015 per GB-month]. The doors' 4.99 GB is kept twice on purpose.

## 8. Hazards and how each is handled

| Hazard | Count | Handling |
|---|---|---|
| R2 keeps no versions | ListObjectVersions answers 501 [M] | The store only grows, and no order may name it. Deletes come last, behind the guard. An overwrite is a deletion (section 5). The meta file has two copies in the bucket, one on Moses's disk and one off the bucket. |
| Multipart objects | 32 keys, 14.05 GB [M] | `parts` is recorded. P1 rebuilds the ETag, and a restore reproduces it. |
| Unfinished multipart uploads | not in any listing; never read | P1 reads ListMultipartUploads, and the owner reads R2's own size at G0; both go in the head. |
| Keys with no rclone md5 | 5,665 [M] | P1 hashes every key anyway. |
| Zero-byte keys | 11,182 keys, 1 content [M] | Each is listed by name and counted in its build's digest. |
| Spaces, non-ASCII, `%`, `=` in keys | 280; 43,937 (1 changes under NFD); 378; 1,540 with `=` (0 with brackets) [M] | Keys are stored exactly as listed and encoded per path segment only at request time. The drill includes such keys. |
| R2's listing order is not UTF-8 order | 589 adjacent pairs where a longer key is listed before its own prefix, 11 of them `X` and `X.sha256` [M]; `start-after` returns each key of such a pair after the other [M, live test] | Joins on the exact key; no resume by `start-after`; P1 checks the keys are unique and their count equals the page totals. |
| Long names | 38 segments over 255 bytes [M]. 301 keys are over 259 characters on their own, and 1,533 would be under a 40-character root [M key lengths; the root length is assumed] | R2 is unaffected. A local restore refuses by name, and Windows uses `\\?\`. |
| Case, Unicode-form or file/folder collisions | 0, 0, 0 [M] | Every capture checks again and stops on the first one. A file unit's note goes beside the file, never under it. |
| Units that are not prefixes | 6 of 290 [M] | `members` defines them. `editions-built-v1/[4,031 work folders]/` is split into its real folders before any order names it. |
| Copies that differ from what they copy | 10 of 276 stage mirrors [M]; example (b) | Every key is hashed from its own bytes. `copy-of` is only a note. |
| Headers vary by uploader | `x-amz-meta-mtime` on 607 of 630; crc32 rather than crc64nvme on 3,341 of 3,595 serving-lane keys [M] | Recorded per key and set back on restore. GETs send `x-amz-checksum-mode: ENABLED`, without which R2 returns no checksum [M]. |
| Content-Encoding | 0 of 4,221 [M] | The capture stops on any. Every GET sends `identity`, because without it Cloudflare's edge gzipped a reply [M]. |
| gzip rebuilds depend on the zlib build | 13 of 23 rebuilt only with Node, 7 only with Python, 3 with neither [M] | v1 never inflates or recompresses anything. |
| Stale shelf backup | 3,505 of 3,594 pins differ; for 3,442 of those keys (591.5 MB) the shelf's old bytes have no copy known off R2 [M, md5 and size against Moses's proofs and git]. The current bins exist as bytes only in this cloud session; git history can remake them only through a zlib that recompresses the same way | The shelf is never overwritten. The current bins go into `cas/` at step 0. |
| Pins already broken | 706 keys [M] | Pin records. A reader is never handed other bytes. |
| The bucket keeps moving | 29 keys in about 15 hours [M]; ships rewrite old pages, and 6,168 keys in 44 of 230 build folders were modified over 6 hours after their folder's median time [M, by Last-Modified] | The capture window is in the head. Changed keys are hashed again or marked `moving`. Meta v2 is captured after the fill. Deletes run under the freeze. |
| Last copy across lanes | the 3.49 GB case [M] | The check across both lanes in the guard. |
| Content with no copy known outside R2 | at least 18.28 GB, up to 19.76 GB [M: 18.28 GB from the 02:00 md5 set; 1.48 GB in 4,478 contents uploaded 17 and 18 Oct not yet compared] | Checked only against Moses's corpus-lane-builds proofs and the site's git, not his other tree (76.14 GB). Whether to add a second place is the owner's decision. |
| Lifecycle rule; public objects; locks | `?lifecycle` answers 403; public access unknown | The owner checks the dashboard at G0, and decides whether to lock `cas/` and `overlapped-build/meta/` if R2 offers lock rules (unconfirmed). |
| Credentials | an R2 token covers the whole bucket | Use credentials scoped to the allowed prefixes if R2 offers them (unconfirmed). If not, a listing diff follows every write step. |
| R2 limits and prices | unconfirmed (the docs could not be reached) | Confirm before the fill tool is written: CopyObject size, conditional copy, conditional PUT and DELETE, bulk-delete batch size. The fallback is GET then PUT. |
| Moses's local links, empty folders, hard links | 14,941 links; 56 empty items [M, his inventory] | Out of scope: the meta file is the R2 view. |

## 9. The order of work

| Step | Who | Gate to pass | Needs Moses? |
|---|---|---|---|
| G0 | the owner | Accepts this map. Names every write and delete by prefix: writes to `cas/` (Elijah's bins at step 0, then the fill) and `overlapped-build/`; `restore-drill/` written and then deleted; nothing else. Reads R2's own size, object count, lifecycle rule and public access from the dashboard. | no |
| 0. Current bins into `cas/` | Elijah | All 3,594 bins are at `cas/` under their pins, each streamed back equal to its pin. No other key changed. | no |
| 1. Capture (P1) and the draft meta v1 | Elijah, read only | 0 size or ETag mismatches after retries, 0 Content-Encoding, 0 collisions, 0 missing checksum headers, keys unique, and the planted faults caught | no |
| 2. Resolver, proof R (before half), site fixes | Elijah | The site fixes ship on main, then `gh-pages` follows main. They cover bare names, the declarations prefix, `ben-yehuda-v1` and the Jastrow cite. | no |
| 3. Fill (P2) | Moses, or Elijah if the owner allows | A listing of every key outside the store, before and after, matches in key, size, ETag and Last-Modified, except keys Moses's upload log shows he changed. The fill's log shows only copies into `cas/` and `overlapped-build/`. | only if the owner keeps the fill with Moses |
| 4. Meta v2, then P3 and P4 | Elijah; P3 by the lane that did not fill | v2 re-hashes only keys whose size, ETag or Last-Modified changed, plus new keys. P3 and P4 pass against v2 with 0 failures. | **yes**, if Elijah filled |
| 5. Independent proof (P5) | Moses | His receipts agree, including the two folders he hashes first. | **yes** |
| 6. Readers ready | both | Proof R shows 0 differences. `--via-meta` works. The push guard is in place. RULE 6.5 is amended. The meta file's two hashes are pinned in three places, and its off-bucket copy exists. | **yes** |
| 7. Drill (P6) | both | Six builds restored and hashed; the drill copies deleted | **yes** |
| 8. Dry run of a deletion order | both | Keys, bytes and guard values; proof R with exactly the order's keys deleted; the cross-lane check; the 28,482 must-remain keys and the ledger's kept paths. Both lanes sign. | **yes** |
| **9. The owner names the deletion** | the owner | | |
| 10. Delete | the deleting lane | Under the freeze. One small superseded build first, then a re-listing, proof R, and a restore of that build to `restore-drill/`. Then batches of at most 1,000 keys (R2's batch limit unconfirmed), with a re-listing after each. Any difference stops the run and restores that batch with `restore-build --to-r2`. | **yes** |
| 11. Each archive the owner names | both | Its contents filled, P3, P5, and a drill restore of it, then the guard | **yes** |

After step 10 the deleting lane writes the forwarding notes; Elijah captures the next version with those keys `retired` and reruns P4, proof R and one drill restore of a retired build. Every write is followed by a capture before the next proof.

**Without Moses**, Elijah can do steps 0 to 2, and step 3 if the owner allows; P3 must then come from Moses, so nothing after step 3 runs without him.

**Effort** [E, files-first and readers-first estimates]: Elijah about 1,600 to 1,900 lines of Node, 6 to 8 working days; Moses 2 to 3 days. Revision 2's added steps are not yet estimated.

| Machine time [E] | Basis |
|---|---|
| P1 and P4: 3 to 6 hours each | 117 GB at 22.5 MB/s plus about 57 small objects a second, both M |
| P3: about 2 hours | 288,000 objects, 52 GB, at the same rates |
| Fill: unknown | R2's server-side copy rate is unconfirmed |
| P5: unknown | Moses's download speed was never measured; 52 GB takes about 1.5 hours at 10 MB/s |

**Phase 2, only if the owner wants it:** pilot row sharing on witnessed-order end to end, then compspan and run-ledger-backwards.

## 10. Decisions for the owner, and questions for Moses

**The owner:**

1. Whole files now; rows later or never?
2. The plain set: doors 51,386 keys (4.99 GB); archives until named 156,446 keys (18.23 GB) [M].
3. Current builds too, once proved? Keeping all 51 plain adds about 33.0 GB in phase 1 and 37.1 GB at the end state; 4.22 GB of their 41.32 GB are doors and 4.14 GB archives [M arithmetic].
4. Who may write `cas/`, who may delete, and may the capture lane also fill?
5. A second copy for the content with no copy known outside R2 (18.28 to 19.76 GB)?
6. Scope: R2 only, or also Moses's local-only content: `moses-accent-types-v1` (3.12 GB), piece-store run outputs (1.06 GB), the 999 footsteps (about 70 GB, never hashed [E])?
7. From the dashboard: R2's own size and object count, any lifecycle rule, any public object. A lock rule on `cas/` and `overlapped-build/meta/`?
8. Do Moses's delete ledger v1 and Elijah's on-hold plan give way to this map, or become its first orders? Until you say, the 28,482 must-remain keys stay out of every order.

**Moses:**

1. Are the 125 to 129 archive objects your census reads by key all of them? Which key does the v13.5 read use?
2. Can you settle the 60 unknown statuses (1.59 GB) and the 6 inferred from names, and confirm the 36 inner versions?
3. Do you still hold older bytes of any of the 706 keys pinned more than once?
4. Will you write the independent verifier from this map alone?
5. Which ship and verify steps touch another build's prefix? Where should a retired build's banner go?
6. Will you hash `moses-delete-ledger-v1`, `moses-dictionary-store-v1/build` and the 999 footsteps, each inode once?
7. Will you amend RULE 6.5 and re-prove the 1,034 DUPLICATE units against `cas/`?
8. Your download speed from R2, and your Node version (phase 2 only)?

## 11. What this map does not settle yet

- Which builds to delete: the owner's orders. Statuses are only notes.
- Phase 2: measured on one slice and ten families; 26 multi-unit families unsampled.
- Moses's local trees: the 999 footsteps, links, hard links; and a second copy of what is only on R2.
- R2's limits and features: CopyObject size, conditional copy, PUT and DELETE, bulk-delete batch size, prefix-scoped credentials, lock rules, prices.
- Rebuilding the cold tarball from its members (saves about 0.9 GB [E]).
- The 64 site-cited paths that do not resolve on R2 (57 look like 999 footsteps cache paths).
- How often to capture while Moses keeps uploading.
