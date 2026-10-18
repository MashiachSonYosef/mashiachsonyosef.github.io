# Judging the three meta-file designs

18 October 2026. Elijah (serving lane). This judges the three designs under `scratchpad/meta/`:

- **files-first:** `design-files-first/DESIGN.md`
- **overlapped:** `design-overlapped/DESIGN.md`
- **readers-first:** `design-readers-first/DESIGN.md`

Nothing on R2 was written or deleted for this judging. Scores run from 1 (poor) to 5 (best). GB means 10^9 bytes. [M] means measured, [E] means estimated. Each number says where it comes from.

## Scores

| Criterion | files-first | overlapped | readers-first |
|---|:-:|:-:|:-:|
| (a) Zero byte loss | 5 | 4 | 5 |
| (b) Every reader keeps working | 4 | 3 | 5 |
| (c) Size win | 3 | 5 | 3 |
| (d) Simplicity and effort | 5 | 2 | 4 |
| (e) Can be proven before deleting | 5 | 4 | 4 |
| **Total (of 25)** | **22** | **18** | **21** |

**Verdict.** files-first wins narrowly and gives the map its spine. readers-first is a close second and has the best handling of readers, so most of its reader parts go into the map. overlapped is the right idea for a later step, not the first one. It does about three times the work to save about 45 GB [E], and most of that saving comes from compression, not from sharing rows. The bucket costs about $1.75 a month [E, unconfirmed price].

## Reasons

### (a) Zero byte loss

- **files-first, 5.** Every distinct file is stored as its exact bytes. Nothing is inflated, recompressed or split. Every key is hashed from its own bytes (P1). The store only grows. At delete time a guard compares each key's ETag and size with the capture.
  - The gap: the store has no copy off R2. But the 18.28 GB that exists only on R2 [M, copies survey] has one copy today as well, so nothing gets worse.
- **overlapped, 4.** Bytes come back through recipes: row pieces in packs, and gzip rewrapped by one of three pinned deflaters. A recipe that fails falls back to keeping the file whole.
  - It has the best second-copy story: Moses's disk holds a copy of the store. It is also the only design that puts a check across both lanes (no content may lose its last copy) into the delete guard itself.
  - The weaknesses: one lost pack breaks many builds at once, and R2 keeps no versions [M, 501 on ListObjectVersions]. Every rebuild also depends on keeping pinned runtimes working for years (Node 22.22.0's zlib 1.3.1-470d3a2).
- **readers-first, 5.** It stores whole files, like files-first, and adds three things:
  - archives stay plain keys until the owner names them;
  - a cas-first rule protects standing keys that get overwritten;
  - pins that were already broken get pin records, so no reader is ever handed different bytes.

### (b) Every reader keeps working

- **files-first, 4.** It has doors, a resolver with the alias table and push map, restore to a folder, and sum files for rclone. G7 runs the resolver over every reference row. Three gaps:
  - Its door set is narrow: 10,448 keys, 1.54 GB [M]. The served payload and the archives become deletable once proved.
  - It leaves the stale shelf to a separate task. Only 89 of 3,594 shelf pins match today [M, readers survey].
  - It has no forwarding notes, so someone browsing R2 finds nothing where a build used to be.
- **overlapped, 3.** Every old file needs our tools, the meta file and a pinned runtime. A sha256 pin is no longer a plain GET. rclone checks need a listing tool.
  - Its best part: G7 re-runs the site's bake tools on restored input and compares `reader/data` byte for byte.
- **readers-first, 5.** It gives three roads to any old file:
  - by hash: a pin is an address;
  - by path: a resolver that refuses to guess between ambiguous names;
  - with no tool: a forwarding note and a key list in each retired folder.

  Proof R requires all 244,845 reference rows [M, readers survey] to resolve the same way before and after, with 0 differences. It also refreshes the shelf before anything moves (G5), adds a push guard so a retired build is not uploaded again, and lists the exact site fixes.

### (c) Size win

All three report the same true size: 68.24 GB of distinct content [M, hazards survey].

- **files-first, 3.** About 69.8 GB after deletion if only the doors stay plain, or 71.4 GB if the served payload stays too [M arithmetic].
- **overlapped, 5.** About 23.5 GB [E]: a store of 20.3 GB (17.8 to 25.2) [E, overlap survey] plus a plain set of 3.09 GB [M].
- **readers-first, 3.** 75.39 GB in phase 1 and 73.29 GB at the end state [M arithmetic]. It keeps 5.05 GB twice on purpose.

About 38 GB of the roughly 48 GB gap between whole files and overlapped comes from compression. Sharing rows adds only about 3.2 GB [E, overlap survey].

### (d) Simplicity and effort

- **files-first, 5.** 8 tools, about 1,300 lines, 4 to 6 days for Elijah [E]. No compressor to pin.
- **overlapped, 2.** 10 tools, 15 to 18 working days across both lanes [E]. It needs a row chunker, brotli packs with index footers, a search for gz recipes across three deflaters, and runtimes kept in the store.
- **readers-first, 4.** 13 tools plus site edits: 9 to 10 sessions and 10 to 15 hours of unattended runs [E]. Nothing is compressed, but it has more moving parts: forwarding notes, the push guard and proof R.

### (e) Can be proven before deleting

- **files-first, 5.** Six proofs, plus planted faults that each proof must catch:
  - P1 hashes every key;
  - P3 streams every store object;
  - P4 runs the real restore code in verify mode over all 289 builds;
  - P5 is Moses's independent rclone re-proof;
  - P6 physically restores six hazard builds (6.31 GB [M]).
- **overlapped, 4.** Two independently written tools prove every content, key, build and pin, each from a different copy of the store.
  - The proof is heavy: about 140 GB of inflated bytes go through sha256 and deflate [E].
  - A failure changes the store, so the proof must run again.
  - Its one-family pilot (G2) is a good step.
- **readers-first, 4.** P1 to P3 are logically complete: every key carries its own hash, every `cas/` object equals its name, and every build hash is computed both ways. Proof R is unique to this design. What it lacks: a run of the real restore code over every build, a physical drill, and planted faults.

## Where the designs agree (not decisions)

All three designs agree on these points:

- sha256 names each content, and md5 is kept beside it.
- Keys are stored exactly as listed and never normalized.
- Headers belong to the key, not the content. Content-Encoding must stay none.
- The proof covers the whole bucket, not a sample.
- A guard runs at delete time, and the owner names the deletion last.
- The meta file is the R2 view. Moses's local trees are out of scope.

## Where they disagree, and what the map takes

| Question | files-first | overlapped | readers-first | Map takes |
|---|---|---|---|---|
| Store prefix | `cas/sha256/` | `overlap-store-v1/` | `cas/sha256/` | `cas/sha256/`. It already exists, and Moses's RULE already keeps `cas/` (a K3 prefix) [M, readers survey]. The 15 archived Codex objects stay as their own unit. |
| Meta file format | gzip JSONL | brotli JSONL | gzip JSONL | gzip -9 JSONL: `zcat \| grep` works with no tool of ours |
| Statuses in the meta file | no | yes | yes | yes, as notes on build records. Deletion orders are separate signed files that cite the meta sha256. |
| What stays a plain key | doors, 1.54 GB | plain set, 3.09 GB | channels and served payload 5.05 GB, plus archives until named 18.23 GB | readers-first's set [M, its fates.json] |
| Pin records | none | all 182,681 | only pins that do not match | only pins that do not match |
| Version cost per build | no | `new_chunk_bytes` | no | `new-bytes` (whole-file bytes not in the previous version) now; row bytes in a later phase |
| Second copy off R2 | no | yes (Moses's disk) | meta file only | the meta file in three places; a full second copy is an owner decision |
| Cross-lane last-copy check in the guard | for Moses's local deletes | yes | no | yes |
| Independent verifier | rclone seat | Moses writes his own from the document | Moses checks his local tree | both: Moses's own verifier plus his local tree check |
| Real restore code over all builds | P4 | the proof is the rebuild | no | yes (P4) |
| Forwarding notes, push guard, shelf first | no | shelf only | yes | yes |
| Row sharing | later, through `form` | now | later, through `gz` and `home` | later, through `form`; overlapped's prototype is the plan for it |

## Number conflicts found while judging

- **289 or 290 units; 288,169 or 288,197 contents; 117.33 or 117.35 GB.** These come from two listings: 02:00 UTC and 16:46 UTC on 18 Oct. 29 keys arrived between them (18.99 MB, all in `serving-lane-handoffs/`) [M, hazards survey]. The map uses the 16:46 listing, and the census statuses use the 02:00 one.
- **push-toggles' `corpus-lane-builds/` prefixes: 3 (files-first) or 4 (readers survey).** The tool fetches 3 build prefixes. The fourth row is the bare `corpus-lane-builds/` root, which the queue calls a "second road", and the tool does not list it whole. One of the 3 (the declarations store) is typed without `corpus-lane-builds/`, so it resolves to nothing today [M: read `ghp/reader/data/toggle-queue-v1.json` and `push-toggles-v1.mjs`].
- **Meta file size: 72.3 MB, 52.6 MB or 13.5 to 31.1 MB.** The three models carry different fields. The map's schema measured 61.5 MB with gzip -9: 285.3 MB raw and 48.4 MB with xz -6 [M on a full-size model, `meta/judge/scripts/01-map-model.py`].
