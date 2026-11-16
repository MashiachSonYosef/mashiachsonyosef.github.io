#!/bin/bash
# Ship 8, item 1 (the entry where STEP gives no tag, from MACULA's lemma), first pass in S/s8 (branch ship8, working
# changes): the whole round with the zones, the switches page, every resting line against live, the checks that model
# the gate. A step of the round that fails stops the run; a check that fails is logged and the run goes on. The suite
# and the gate wait on the line diff's review.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s8w/pipe; P=$O/pipeline.log
T=$S/s8
mkdir -p $O
. $S/v54/integrate/env.sh
cd $T/reader
step() { local name=$1; shift; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
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
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
if ! step round "${ROUND[@]}"; then
  if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/round.log; then
    echo "round: the defaults bake again, then records, lines, chain, door" >> $P
    step round-again "${ROUND[@]}" --steps defaults,records,lines,chain,door || stop round-again
  else stop round; fi
fi
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step lines node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop lines
step c-entry timeout 1800 node tools/check-entry-gate-v1.mjs --ledger $ROW_ENTRIES_LEDGER --ledger-was $ROW_ENTRIES_LEDGER_WAS --lattice $LATTICE_DIR
step c-lattice timeout 1800 node tools/check-lattice-projection-v1.mjs
step c-names timeout 1800 node tools/check-names-gate-v1.mjs
step c-pointing-gate timeout 1800 node tools/check-pointing-gate-v1.mjs
step c-sign timeout 1800 node tools/check-sign-does-not-lead-v1.mjs --lattice $LATTICE_DIR
step c-sense-openings timeout 1800 node tools/check-sense-openings-v1.mjs
step c-stems-extension timeout 1800 node tools/check-stems-extension-v1.mjs
step c-masorah timeout 1800 node tools/check-masorah-toggle-v1.mjs
step c-source-switch timeout 1800 node tools/check-source-switch-v1.mjs
step c-names-pill timeout 1800 node tools/check-names-pill-v1.mjs
step c-pointing-grade timeout 1800 node tools/check-pointing-grade-v1.mjs
step c-read-words timeout 1800 node tools/check-read-words-v1.mjs
step c-form-of timeout 1800 node tools/check-form-of-v1.mjs
step c-rulings timeout 1800 node tools/check-rulings-under-sources-v1.mjs
echo "DONE $(date -u +%FT%TZ)" >> $P
