#!/bin/bash
# Ship 8, the second pass resumed after the machine rebooted during the chain step (01:05Z): the lines were recorded
# whole (40 records written). The chain books, two at a time (the round runs three), then the door, then every
# resting line against live, the new law alone, the checks the page change touches, the whole suite, the gate. Each
# step that finished leaves a mark in $O/done, and a rerun skips it.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s8w/pipe3; P=$O/pipeline.log
T=$S/s8
mkdir -p $O/done
. $S/v54/integrate/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes" >> $P
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || stop "serve (live on 8914)"
PICKS=$S/v54/picks-v1-2/ledger
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step lines node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop lines
step f15-dry node $S/s8w/f15-dry.mjs
step c-form-of timeout 1800 node tools/check-form-of-v1.mjs
step c-rulings timeout 1800 node tools/check-rulings-under-sources-v1.mjs
step c-entry timeout 1800 node tools/check-entry-gate-v1.mjs --ledger $ROW_ENTRIES_LEDGER --ledger-was $ROW_ENTRIES_LEDGER_WAS --lattice $LATTICE_DIR
step suite node tools/run-checks-v1.mjs --jobs 2 --timeout 1500
step gate timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $O/gate-diff.txt --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.js
echo "DONE $(date -u +%FT%TZ)" >> $P
