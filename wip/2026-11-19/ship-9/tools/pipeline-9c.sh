#!/bin/bash
# Ship 9, the third pass in S/s9: the form-of record baked again over the store at rest (check-form-of-v1 F13: its
# one_pill counts were the store's before the twelve rested; the map the page reads is the same), then the page steps
# again, since the records and the chain books name it by its sha256 (the lines, the chain books two at a time, the
# door), every resting line against live, and the checks that read them. Resumable: marks in $O/done.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s9w/pipe3; P=$O/pipeline.log
T=$S/s9
mkdir -p $O/done
. $S/v54/integrate/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
pgrep -f "pipeline-9[ab].sh" > /dev/null && { echo "an earlier pass still runs; stop" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes" >> $P
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
step formof timeout 1800 node tools/bake-form-of-pills-v1.mjs || stop formof
step lines "${ROUND[@]}" --steps lines || stop lines
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door "${ROUND[@]}" --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop linesdiff
step c-form-of timeout 1800 node tools/check-form-of-v1.mjs
step c-kinds timeout 3600 node tools/check-dictionary-kinds-v1.mjs
step c-chain timeout 3600 node tools/check-chain-book-v2.mjs
step c-rulings timeout 1800 node tools/check-rulings-under-sources-v1.mjs
step c-overlays timeout 1800 node tools/check-overlays-v1.mjs
step c-source-switch timeout 1800 node tools/check-source-switch-v1.mjs
echo "DONE $(date -u +%FT%TZ)" >> $P
