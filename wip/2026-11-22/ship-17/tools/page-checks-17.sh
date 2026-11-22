#!/bin/bash
# Ship 17 (22 November 2026): the checks that open the page, on a throwaway copy of the laid sandbox, since the page
# refuses a rewritten zone until the round pins it again: the copy's zones pinned again by the tree's own emitter, the
# books whose lines move recorded again by the tree's own recorder, a server of mine on 8931 for the checks that take
# SERVE_PORT, stopped at the end. Usage: page-checks-17.sh <laid sandbox reader> <copy dir under S/s22w> <log dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
SRC=${1:?sandbox reader}; C=${2:?copy}; L=${3:?log dir}; mkdir -p $L
case "$C" in $S/s22w/*) ;; *) echo "refused: the copy must be under S/s22w"; exit 1 ;; esac
. $S/s21w/env.sh
rm -rf "$C" && mkdir -p "$(dirname $C)" && cp -a "$SRC" "$C" || exit 1
cd "$C" || exit 1
node tools/emit-zone-store-v1.mjs | tail -1 | sed "s|$S|S|g"
node tools/bake-resting-lines-v1.mjs --only ii-kings,isaiah,proverbs,job > $L/bake-lines.log 2>&1; echo "bake exit $? · $(tail -n 1 $L/bake-lines.log)"
python3 -m http.server 8931 --bind 127.0.0.1 --directory "$C" > $L/server.log 2>&1 & SRV=$!
sleep 1
export SERVE_PORT=8931
run() { local n=$1; shift; s=$(date +%s); node "$@" > $L/$n.log 2>&1; rc=$?; echo "$n exit $rc ($(( $(date +%s)-s )) s) · $(grep -cE '^  ok' $L/$n.log) ok, $(grep -cE '^FAIL' $L/$n.log) FAIL"; }
run check-spelling-bridge-v1 tools/check-spelling-bridge-v1.mjs
run check-line-reads-the-place-v1.amos tools/check-line-reads-the-place-v1.mjs
run check-line-reads-the-place-v1.song-of-songs tools/check-line-reads-the-place-v1.mjs http://127.0.0.1:8931/zone.html?b=song-of-songs
run check-piece-store-v1 tools/check-piece-store-v1.mjs
run check-read-words-v1 tools/check-read-words-v1.mjs
run check-entry-gate-v1 tools/check-entry-gate-v1.mjs
run check-compspan-coverage-v1 tools/check-compspan-coverage-v1.mjs
run check-rulings-under-sources-v1 tools/check-rulings-under-sources-v1.mjs
# the cause shown: the stands places of the two reds laid back by hand, both checks again, then put back byte for byte
mkdir -p $L/cause; for b in amos esther; do cp -p data/zones/$b.bin $L/cause/$b.bin; done
node $S/s22w/tools/exp-lay.mjs "$C" "$C/data/spelling-bridge/bridge-v1.1/bridge-places-v1.1.jsonl" amos 1:10:6 > $L/cause/lay.log 2>&1
node $S/s22w/tools/exp-lay.mjs "$C" "$C/data/spelling-bridge/bridge-v1.1/bridge-places-v1.1.jsonl" esther 9:17:2 9:18:5 >> $L/cause/lay.log 2>&1
node tools/emit-zone-store-v1.mjs > /dev/null
run cause.check-compspan-coverage-v1 tools/check-compspan-coverage-v1.mjs
run cause.check-rulings-under-sources-v1 tools/check-rulings-under-sources-v1.mjs
for b in amos esther; do cp -p $L/cause/$b.bin data/zones/$b.bin; cmp -s data/zones/$b.bin $SRC/data/zones/$b.bin && echo "  $b put back, the sandbox's bytes"; done
node tools/emit-zone-store-v1.mjs > /dev/null
kill $SRV; wait $SRV 2>/dev/null; echo "server on 8931 stopped"
$S/s22w/tools/tests-17.sh "$C" $L/tests B5 > /dev/null 2>&1; echo "tests done"
echo PAGE-CHECKS-DONE
