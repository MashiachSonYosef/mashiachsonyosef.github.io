#!/usr/bin/env bash
# The commands this survey ran, in order (2026-10-18, serving lane). Every R2 call is a GET or HEAD.
# Credentials are loaded from r2.env inside each shell and never printed; nothing here writes to R2.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
H=$S/meta/hazards
cd $H/scripts
set -a; . $S/r2.env; set +a

# 1. whole-bucket listing with ETag and storage class (513 ListObjectsV2 pages, 16:46-16:50 UTC)
node r2list-etag.mjs $H/bucket-etag.tsv $H/bucket-etag.jsonl "" 2> $H/bucket-etag.log
# 1b. page-size probe: ask 5,000 and 1,001 keys in one page (both came back 1,000)
MAXKEYS=5000 MAXPAGES=1 node r2list-etag.mjs $H/dl/pagetest.tsv $H/dl/pagetest.jsonl editions-built-v1/
MAXKEYS=1001 MAXPAGES=1 node r2list-etag.mjs $H/dl/pagetest.tsv $H/dl/pagetest.jsonl editions-built-v1/

# 2. hazards over the listing (local)
python3 -I hazards.py                      # -> hazard-numbers.json, hazard-*.tsv
python3 -I distinct.py                     # -> distinct-numbers.json (after step 5)

# 3. receipts the cas/ prefix belongs to (small GETs)
node $S/r2get.mjs $H/dl disposition/r2-conveyor-closed-codex-child-batch01-a83b83d71608.json \
  disposition/retire-letters-xz-20260829.json disposition/transfer-shipped-packages-20260830.json \
  retired/letters-xz-20260829/RETIRED-SHA256SUMS-20260829.txt serving-lane/shelf/MANIFEST-shelf.json

# 4. object metadata: stratified HEAD sample (630) and every serving-lane object (3,595)
python3 -I pick-head-sample.py             # -> head-sample-keys.txt, head-sample-why.tsv
node r2head.mjs $H/head-sample-keys.txt $H/head-sample.jsonl 8
python3 -I head-summary.py                 # -> head-summary.json, head-sample-table.tsv
node r2head.mjs $H/serving-lane-keys.txt $H/head-serving-lane.jsonl 16

# 5. the 32 multipart objects: streamed GET, hashed in memory, nothing written but the hashes
node r2stream-hash.mjs $H/stream-hash-multipart.jsonl @$H/multipart-keys.txt 2> $H/stream-hash-multipart.log
python3 -I multipart-verify.py             # -> multipart-verify.json

# 6. container headers: 512-byte ranged reads of 432 compressed-looking objects
python3 -I pick-gz-sample.py
RANGE=bytes=0-511 node $S/r2range.mjs $H/dl/gzhead <keys from gz-sample-keys.txt>
python3 -I gz-headers.py                   # -> gz-header-summary.json, gz-headers.tsv (dl/gzhead deleted after)

# 7. recompression test on 23 small gzip objects (downloaded whole, deleted after)
node $S/r2get.mjs $H/dl/recomp <keys from recomp-keys.txt>
node recomp-test.mjs $H/dl/recomp $H/recomp-keys.txt $H/recomp-node.jsonl
python3 -I recomp-test.py $H/dl/recomp $H/recomp-keys.txt $H/recomp-python.jsonl
python3 -I recomp-raw.py $H/dl/recomp $H/recomp-keys.txt $H/recomp-raw-py.jsonl
node recomp-raw.mjs $H/dl/recomp $H/recomp-keys.txt $H/recomp-raw-py.jsonl $H/recomp-raw.jsonl
node r2stream-hash.mjs $H/stream-hash-recomp.jsonl @$H/recomp-keys.txt
node r2head.mjs $H/recomp-keys.txt $H/head-recomp.jsonl 8

# 8. text objects: 4 KiB ranged reads of 519 for line endings and BOMs (dl/texthead deleted after)
python3 -I pick-text-sample.py
RANGE=bytes=0-4095 node $S/r2range.mjs $H/dl/texthead <keys from text-sample-keys.txt>
python3 -I text-heads.py                   # -> text-head-summary.json

# 9. Moses's recorded links against the listing (local)
python3 -I links-vs-r2.py > $H/links-vs-r2.json

# 10. bucket-level read probes: ?versioning ?versions ?lifecycle ?cors (GET only)
node r2-versioning-probe.mjs > $H/r2-versioning-probe.txt
