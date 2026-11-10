#!/bin/bash
# v146: install the re-projected zones and sidecars, rebuild the chain books, re-pin, build.
set -euo pipefail
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/pt/reader
for f in $S/v26/proj/zones/*.bin $S/v26/proj/sidecars/*.bin; do cp $f data/zones/$(basename $f); done
for b in amos habakkuk haggai hosea joel jonah malachi micah nahum obadiah zechariah zephaniah; do node tools/build-chain-book-v1.mjs --zone data/zones/$b.bin --out ../chain/$b > /dev/null; done
node tools/bake-search-index-v1.mjs > /dev/null && node tools/build-chain-book-v1.mjs --index --dir ../chain > /dev/null
node tools/emit-pointing-grade-recount-v1.mjs > /dev/null
node tools/repin-zone-store-v1.mjs .
node tools/check-c0-refusals-v1.mjs --write | grep -E "PASS|REFUSED" | head -2
# the count receipt, written again from the zones' own stamps every round (it went stale once: a work served and not in it)
node tools/check-bookword-count-v1.mjs --write | grep -E "FAIL|receipt written|stamps:" | head -4
cp data/serve-gate-receipt-v1.json $S/v26/receipt-new.json
git show HEAD:reader/data/serve-gate-receipt-v1.json > $S/v26/receipt-head.json
python3 -I - "$S/v26/receipt-head.json" "$S/v26/receipt-new.json" data/serve-gate-receipt-v1.json <<'PY'
import json, sys
head = json.load(open(sys.argv[1])); new = json.load(open(sys.argv[2]))
assert head["served"] == new["served"]
assert all(s in new["passed"] for s in new["served"])
assert set(head["served_sha256"]) == set(new["served_sha256"])
moved = [s for s in new["served_sha256"] if head["served_sha256"][s] != new["served_sha256"][s]]
head["served_sha256"] = new["served_sha256"]
open(sys.argv[3], "w").write(json.dumps(head, indent=2, ensure_ascii=False) + "\n")
print("served", len(head["served"]), "hashes moved", len(moved), "shelf", head["zones_on_the_shelf"])
PY
node tools/emit-store-manifest-v1.mjs > /dev/null
node tools/build-front-door-v1.mjs --history data/none.json > $S/v26/build2.log 2>&1
node tools/emit-lane-state-v1.mjs >> $S/v26/build2.log 2>&1
node tools/emit-ledger-index-v1.mjs >> $S/v26/build2.log 2>&1
node tools/pipeline-manifest-v1.mjs --stamp 2026-11-10 >> $S/v26/build2.log 2>&1
cp -a deploy-root/. ..
echo FINISH-OK
