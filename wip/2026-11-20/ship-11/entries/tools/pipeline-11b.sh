#!/bin/bash
# Ship 11, the entries, in S/s11 on top of the names pass (its tree committed on branch ship11): row entries v1.2
# (relay v197) takes the place of v1.1 and the two entry ledgers' lists (v203, v204) land their numbers. The store
# step, then the whole round, the form-of record, the lines, the chain books, the door, the switches page, and every
# resting line twice over: against live (S/old on 8914) and against the names pass (S/s11w/lines-names).
# Resumable: each step that finishes leaves a mark in $O/done.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s12w/${PASS:-pipe3}; P=$O/pipeline.log
T=$S/s11
mkdir -p $O/done
. $S/s12w/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes, zone.html $(sha256sum $T/reader/zone.html | cut -c1-16)" >> $P
[ -d $S/s11w/lines-names/data/resting-lines ] || stop "no snapshot of the names pass's lines"
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || stop "serve (live on 8914)"
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
LISTS=(--list $ROW_ENTRIES_LISTS --list data/row-entries/entry-ledger-classical-and-hebrew-wiktionary-v1/facts-slot-v1.tsv)
step store-entries node tools/apply-row-entries-v1.mjs --ledger $ROW_ENTRIES_LEDGER "${LISTS[@]}" --on 2026-11-20T21:00:00.000Z || stop store-entries
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
step linesdiff-names node $S/s7w/lines-diff.mjs $S/s11w/lines-names $T/reader $O/lines-diff-against-names.json || stop linesdiff-names
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door "${ROUND[@]}" --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop linesdiff
echo "DONE $(date -u +%FT%TZ)" >> $P
