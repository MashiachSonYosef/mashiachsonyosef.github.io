#!/bin/bash
# Ship 9, item 1 (the owner's twelve: every kind but the Bible dictionaries rests shut on the 39 books, the overlays
# beside the store included), first pass in S/s9 (branch ship9, working changes): the whole round, the switches page,
# every resting line against live, the checks the change touches. Resumable: each step that finishes leaves a mark in
# $O/done, and a rerun skips it. A step of the round that fails stops the run; a check that fails is logged and the
# run goes on.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s9w/pipe; P=$O/pipeline.log
T=$S/s9
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
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
if [ ! -e $O/done/round ]; then
  # the round's own steps up to the lines; the chain books and the door run apart below, two books at a time
  step round "${ROUND[@]}" --steps zones,stamps,search,defaults,records,lines || {
    if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/round.log; then
      echo "round: the defaults bake again, then records and lines" >> $P
      step round-again "${ROUND[@]}" --steps defaults,records,lines && touch $O/done/round || stop round-again
    else stop round; fi
  }
fi
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door "${ROUND[@]}" --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step lines node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop lines
step c-kinds timeout 3600 node tools/check-dictionary-kinds-v1.mjs
step c-entry timeout 1800 node tools/check-entry-gate-v1.mjs --ledger $ROW_ENTRIES_LEDGER --ledger-was $ROW_ENTRIES_LEDGER_WAS --lattice $LATTICE_DIR
step c-lattice timeout 1800 node tools/check-lattice-projection-v1.mjs
step c-names timeout 1800 node tools/check-names-gate-v1.mjs
step c-sign timeout 1800 node tools/check-sign-does-not-lead-v1.mjs --lattice $LATTICE_DIR
step c-source-switch timeout 1800 node tools/check-source-switch-v1.mjs
step c-overlays timeout 1800 node tools/check-overlays-v1.mjs
step c-search timeout 1800 node tools/check-search-v1.mjs
step c-form-of timeout 1800 node tools/check-form-of-v1.mjs
step c-rulings timeout 1800 node tools/check-rulings-under-sources-v1.mjs
echo "DONE $(date -u +%FT%TZ)" >> $P
