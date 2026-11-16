#!/bin/bash
# Ship 7, the final pass after the suite's fixes (a ruled reading stands under the pointing; check-rulings-under-
# sources' U7 asks forms in turn; the form-of record over the store as it now stands): the round's page steps again
# (the page changed, so the lines are recorded anew and the engine and book pages cut again), the switches page,
# every resting line against live, the checks the suite failed, the whole suite, the gate.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s7w/pipe2; P=$O/pipeline.log
T=$S/s7
mkdir -p $O
. $S/v54/integrate/env.sh
cd $T/reader
touch $S/v63/PIPELINE-RUNNING
step() { local name=$1; shift; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; return $code; }
stop() { echo "STOPPED at $1" >> $P; rm -f $S/v63/PIPELINE-RUNNING; exit 1; }
: > $P
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes" >> $P
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || stop "serve (live on 8914)"
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS --steps defaults,records,lines,chain,door)
step round "${ROUND[@]}" || stop round
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step lines node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop lines
step c-form-of timeout 1800 node tools/check-form-of-v1.mjs
step c-rulings timeout 1800 node tools/check-rulings-under-sources-v1.mjs
step c-pointing-gate timeout 1800 node tools/check-pointing-gate-v1.mjs
step c-masorah timeout 1800 node tools/check-masorah-toggle-v1.mjs
step c-span-grade timeout 1800 node tools/check-span-grade-v1.mjs
step c-hedges timeout 1800 node tools/check-strongs-hedges-v1.mjs
step suite node tools/run-checks-v1.mjs --jobs 3 --timeout 1500
step gate timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $O/gate-diff.txt --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json
echo "DONE $(date -u +%FT%TZ)" >> $P
rm -f $S/v63/PIPELINE-RUNNING
