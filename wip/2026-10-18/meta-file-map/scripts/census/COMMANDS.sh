#!/bin/sh
# The census of builds, in the order it was run (serving lane, 2026-10-18). Read-only on R2: ListObjectsV2 and GET only.
# Credentials are loaded inside the one shell that needs them and never printed.
SP=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
C=$SP/meta/census
R2ENV() { set -a; . $SP/r2.env; set +a; }

# 1. ETags (= MD5 for single-part objects) for the 5,636 keys the md5 table lacks; piece-store-v2 lists 744 keys to validate ETag == md5.
for P in corpus-lane-builds/moses-piece-store-v2/ corpus-lane-builds/moses-dictionary-store-v1/ corpus-lane-builds/moses-delete-ledger-v1/; do
  n=$(echo $P | tr '/' '_'); (R2ENV; NODE_USE_ENV_PROXY=1 node $C/scripts/r2list-etag.mjs "$P" > $C/etag/$n.tsv 2> $C/etag/$n.err)
done

# 2. Small reads: the ledger index, two relay notes, the disposition receipts, the front page of every build (first 2,000 bytes, ranged).
(R2ENV; NODE_USE_ENV_PROXY=1 node $SP/r2get.mjs $C/dl MOSES-LEDGER-INDEX.md corpus-lane-builds/MOSES-LEDGER-INDEX.md)
(R2ENV; RANGE=bytes=0-1999 NODE_USE_ENV_PROXY=1 node $SP/r2range.mjs $C/dl/fronts $(cat $C/_front-keys.txt))
# (the front-page key list _front-keys.txt was chosen from the listing: THE-*.md first, then README*, banners, notes)

# 3. Two sha256 checks of site pins against R2 bytes (downloaded to scratch, hashed, run-cards copy deleted after):
(R2ENV; NODE_USE_ENV_PROXY=1 node $SP/r2get.mjs $C/dl/verify corpus-lane-builds/moses-maqaf-weld-run-check-v1/strand-run-card/outputs/cards-v1.jsonl.gz moses-ledgers/mam-restore-v5/mam-amos-restored-v5.csv.gz)
sha256sum $C/dl/verify/corpus-lane-builds/moses-maqaf-weld-run-check-v1/strand-run-card/outputs/cards-v1.jsonl.gz   # = reader/data/run-cards from.sha256
sha256sum $C/dl/verify/moses-ledgers/mam-restore-v5/mam-amos-restored-v5.csv.gz                                     # = zones/amos.bin restore_gz_sha256

# 4. Local analysis (python3 -I; nothing touches R2):
python3 -I $C/scripts/site_pins.py        # what the site data and the 39 served zones pin -> _site-pins.json
python3 -I $C/scripts/match_pins.py       # pins matched to bucket keys by name + size -> site-pins-matched.tsv
python3 -I $C/scripts/census.py           # units, content identity, nested copies, inner roles -> builds-extra.tsv, nested-copies.tsv
python3 -I $C/scripts/status_table.py     # status + role + evidence per unit -> status-table.tsv
python3 -I $C/scripts/census.py           # again, now with the status table -> builds.tsv
python3 -I $C/scripts/report_numbers.py   # families.tsv, report-numbers.json
python3 -I $C/scripts/served_payload.py   # served-payload.tsv: the exact R2 bytes the live site reads
# probe_nested.py was the first look at nested build names (superseded by census.py's nested-copy pass).
