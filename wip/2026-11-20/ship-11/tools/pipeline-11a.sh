#!/bin/bash
# Ship 11, first pass in S/s11 (branch ship11 from 501a8b3bbb): names v2 (the corpus lane's relay v198) takes the
# place of names v1's list of name rows. The store step, then the whole round, the form-of record baked again over
# the store as it now stands, the chain books, the door, the switches page, and every resting line against live
# (S/old, 501a8b3bbb, on 8914). Resumable: each step that finishes leaves a mark in $O/done.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s11w/${PASS:-pipe1}; P=$O/pipeline.log
T=$S/s11
mkdir -p $O/done
. $S/v54/integrate/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes, zone.html $(sha256sum $T/reader/zone.html | cut -c1-16)" >> $P
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || stop "serve (live on 8914)"
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
step store-names node tools/apply-name-rows-v1.mjs --on 2026-11-20T20:00:00.000Z || stop store-names
if [ ! -e $O/done/round ]; then
  step round "${ROUND[@]}" --steps zones,stamps,search,defaults,records || {
    if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/round.log; then
      echo "round: the defaults bake again, then records" >> $P
      step round-again "${ROUND[@]}" --steps defaults,records && touch $O/done/round || stop round-again
    else stop round; fi
  }
fi
step formof timeout 1800 node tools/bake-form-of-pills-v1.mjs || stop formof
step lines "${ROUND[@]}" --steps lines || stop lines
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door "${ROUND[@]}" --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop linesdiff
echo "DONE $(date -u +%FT%TZ)" >> $P
