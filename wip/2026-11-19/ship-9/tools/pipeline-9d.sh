#!/bin/bash
# Ship 9, the fourth pass in S/s9: the page's fix for the BSB's file landing after a press (the card built again
# keeps the press's focus; check-dictionary-kinds-v1 K4), copied from S/s9d where it was proven, then the page steps
# again, since the records and the chain books name zone.html by its sha256 (the lines, the chain books two at a time,
# the door), the switches page, every resting line against live, and the checks that read them. Resumable: marks in $O/done.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s9w/pipe4; P=$O/pipeline.log
T=$S/s9
mkdir -p $O/done
. $S/v54/integrate/env.sh
cd $T/reader
step() { local name=$1; shift; [ -e $O/done/$name ] && { echo "$name kept (done before)" >> $P; return 0; }; local t0=$(date +%s); "$@" > $O/$name.log 2>&1; local code=$?; echo "$name exit $code ($(( $(date +%s) - t0 )) s)" >> $P; [ $code = 0 ] && touch $O/done/$name; return $code; }
stop() { echo "STOPPED at $1" >> $P; exit 1; }
grep -q "^DONE" $S/s9w/pipe3/pipeline.log || { echo "the third pass has not ended; stop" >> $P; exit 1; }
echo "start $(date -u +%FT%TZ) tree $(git -C $T rev-parse --short=10 HEAD) + working changes" >> $P
fix() { cp $S/s9d/reader/zone.html $T/reader/zone.html; diff -u $O/zone-before.html $T/reader/zone.html > $O/fix.diff; local n=$(grep -c '^[-+][^-+]' $O/fix.diff); echo "$n lines changed" >> $O/fix.diff; [ $n -ge 1 ] && [ $n -le 20 ]; }
[ -e $O/zone-before.html ] || cp $T/reader/zone.html $O/zone-before.html
step fix fix || stop fix
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
step c-chain timeout 3600 node tools/check-chain-book-v2.mjs
echo "DONE $(date -u +%FT%TZ)" >> $P
