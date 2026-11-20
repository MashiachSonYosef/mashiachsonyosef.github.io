#!/bin/bash
# Ship 9, the second pass in S/s9: the drawing (item 3, built in S/s9d) joins the tree, then the page steps again (the
# lines, the chain books two at a time, the door), the switches page, every resting line against live, and the checks
# the two items touch. Resumable: each step that finishes leaves a mark in $O/done, and a rerun skips it. The suite and
# the gate follow apart (suite-start.sh, gate-9.sh).
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s9w/pipe2; P=$O/pipeline.log
T=$S/s9
mkdir -p $O/done
. $S/v54/integrate/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
pgrep -f "pipeline-9a.sh" > /dev/null && { echo "the first pass still runs; stop" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes" >> $P
if [ ! -e $O/done/apply ]; then git -C $T apply $S/s9w/drawing.patch && touch $O/done/apply && echo "the drawing applied" >> $P || stop apply; fi
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
step lines "${ROUND[@]}" --steps lines || stop lines
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door "${ROUND[@]}" --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop linesdiff
step c-kinds timeout 3600 node tools/check-dictionary-kinds-v1.mjs
step c-sign-gap timeout 1800 node tools/check-sign-gap-joiner-v1.mjs
step c-color timeout 1800 node tools/check-color-channels-v1.mjs
step c-page-record timeout 1800 node tools/check-page-agrees-with-its-record-v1.mjs
step c-entry timeout 1800 node tools/check-entry-gate-v1.mjs --ledger $ROW_ENTRIES_LEDGER --ledger-was $ROW_ENTRIES_LEDGER_WAS --lattice $LATTICE_DIR
step c-lattice timeout 1800 node tools/check-lattice-projection-v1.mjs
step c-names timeout 1800 node tools/check-names-gate-v1.mjs
step c-sign timeout 1800 node tools/check-sign-does-not-lead-v1.mjs --lattice $LATTICE_DIR
step c-source-switch timeout 1800 node tools/check-source-switch-v1.mjs
step c-overlays timeout 1800 node tools/check-overlays-v1.mjs
step c-search timeout 1800 node tools/check-search-v1.mjs
step c-form-of timeout 1800 node tools/check-form-of-v1.mjs
step c-rulings timeout 1800 node tools/check-rulings-under-sources-v1.mjs
step c-chain timeout 3600 node tools/check-chain-book-v2.mjs
echo "DONE $(date -u +%FT%TZ)" >> $P
