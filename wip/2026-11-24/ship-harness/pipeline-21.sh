#!/bin/bash
# Ship 20 (the name marks of relays v213 and v219, and the spelling bridge v1.2 of relay v220), on the ship tree S/s13 at main as
# ship 19 shipped it (its commit in S/s31w/base.txt): ship 20 applied (S/s29w/apply-20.sh: the name lists and the place
# list's addition, the names and bridge pins, the store steps, the bridge laid from v1.2), then the round whole, the form-of record, the lines, the chain books, the door, the switches page,
# and every resting line against live (S/old, ship 19, on 8914). Resumable.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s31w/${PASS:-pipe1}; P=$O/pipeline.log
T=$S/s13
mkdir -p $O/done
. $S/s31w/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes, zone.html $(sha256sum $T/reader/zone.html | cut -c1-16)" >> $P
BASE=$(cat $S/s31w/base.txt); [ -n "$BASE" ] || stop "no base (S/s31w/base.txt)"
[ "$(git -C $S/old rev-parse HEAD)" = "$BASE" ] || stop "S/old is not main as shipped"
[ "$(git -C $T rev-parse HEAD)" = "$BASE" ] || stop "the tree does not stand on main as shipped"
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; pkill -f "http.server 8914 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html && curl -sf -o /dev/null http://127.0.0.1:8912/ || stop serve
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || stop "serve (live on 8914)"
PICKS=$S/v54/picks-v1-2/ledger
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --lattice-delta $LATTICE_DELTA_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $PICKS)
# ship 20 first: the name lists and the place list's addition, the pins, the store steps, the bridge laid from v1.2
step apply20 bash $S/s29w/apply-20.sh $T/reader $O/apply20 || stop apply20
echo "ship 20 applied: zone.html $(sha256sum $T/reader/zone.html | cut -c1-16)" >> $P
if [ ! -e $O/done/round ]; then
  step round "${ROUND[@]}" --steps zones,stamps,search,defaults,records || {
    if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/round.log; then
      echo "round: the defaults bake again, then records" >> $P
      step round-again "${ROUND[@]}" --steps defaults,records && touch $O/done/round || stop round-again
    else stop round; fi
  }
fi
step formof timeout 1800 node tools/bake-form-of-pills-v1.mjs || stop formof
if [ ! -e $O/done/lines ]; then
  step lines "${ROUND[@]}" --steps lines || {
    if grep -q "the default picks' receipt was not written\|the default picks do not hold over the records just read" $O/lines.log; then
      echo "lines: the records read anew move the default picks; the defaults bake again, then the records and the lines" >> $P
      step defaults-again "${ROUND[@]}" --steps defaults,records || stop defaults-again
      step lines-again "${ROUND[@]}" --steps lines && touch $O/done/lines || stop lines-again
    else stop lines; fi
  }
fi
step chain node tools/build-chain-book-v2.mjs --jobs 2 || stop chain
step door "${ROUND[@]}" --steps door || stop door
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || stop switches
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || stop linesdiff
echo "DONE $(date -u +%FT%TZ)" >> $P
