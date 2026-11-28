#!/bin/bash
# Ship 23, after the copy: the round's page steps, the resting lines against live, the gate twice (today's card
# forced, then at rest), the whole suite at rest, then the 70 card checks with today's card forced. Each step's log
# is in $O; the summary is $O/run.log. Today's card is forced by one line in zone.html's head, put in and taken out
# here, with the page's sha256 matched after. Usage: run-ship-23.sh [from-step]
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
T=$S/s13; O=$S/s31w/ship23; L=$O/run.log; mkdir -p $O
cd $T/reader && . $S/s31w/env.sh
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --lattice-delta $LATTICE_DELTA_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $S/v54/picks-v1-2/ledger)
EXPECT=(--expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json --expect data/form-of-pills-v1.json --expect data/spelling-bridge/PIN.json)
step() { local n=$1; shift; local t0=$(date +%s); "$@" > $O/$n.log 2>&1; local rc=$?; echo "$(date -u +%T) $n exit $rc ($(( $(date +%s) - t0 )) s)" >> $L; return $rc; }
force() { python3 -I - zone.html <<'PY'
import sys
p = sys.argv[1]; s = open(p, encoding="utf-8").read()
a = '<meta charset="utf-8">\n'
assert s.count(a) == 1 and '<meta name="reader-card"' not in s
open(p, "w", encoding="utf-8").write(s.replace(a, a + '<meta name="reader-card" content="spelling">\n', 1))
PY
}
unforce() { cp -p $O/zone.html.at-rest zone.html; sha256sum -c --quiet $O/zone.html.sha256 && ! grep -q '<meta name="reader-card"' zone.html; }
serve() {
  curl -sf -o /dev/null http://127.0.0.1:8899/zone.html || (cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
  curl -sf -o /dev/null http://127.0.0.1:8912/ || (cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
  curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
  sleep 2
}
lanes() { # $1 = suite name, $2 = list file or "all"; waits for both lanes
  export SUITE=$1; rm -rf /dev/shm/s21$1
  if [ "$2" = all ]; then (setsid nohup $S/s31w/suite-lanes.sh fwd > /dev/null 2>&1 &); sleep 3; (setsid nohup $S/s31w/suite-lanes.sh rev > /dev/null 2>&1 &)
  else (LIST=$2 setsid nohup $S/s31w/suite-lanes-list.sh fwd > /dev/null 2>&1 &); sleep 3; (LIST=$2 setsid nohup $S/s31w/suite-lanes-list.sh rev > /dev/null 2>&1 &); fi
  sleep 30; while [ "$(grep -c "^lane .* DONE" $S/s31w/$1/run.log 2>/dev/null)" -lt 2 ]; do sleep 30; done
  echo "$(date -u +%T) suite $1: $(ls $S/s31w/$1/v | wc -l) verdicts, $(grep -l '^0 ' $S/s31w/$1/v/*.verdict | wc -l) exit 0" >> $L
}
FROM=${1:-lines}; go=0
for s in lines chain door switches linesdiff gateforced gaterest suiterest suiteforced; do
  [ $s = $FROM ] && go=1; [ $go = 1 ] || continue
  case $s in
    lines) cp -p zone.html $O/zone.html.at-rest; sha256sum zone.html > $O/zone.html.sha256
           step lines "${ROUND[@]}" --steps lines || { echo STOP >> $L; exit 1; } ;;
    chain) step chain node tools/build-chain-book-v2.mjs --jobs 2 || { echo STOP >> $L; exit 1; } ;;
    door) step door "${ROUND[@]}" --steps door || { echo STOP >> $L; exit 1; } ;;
    switches) step switches timeout 1800 node tools/build-toggle-design-v1.mjs || { echo STOP >> $L; exit 1; } ;;
    linesdiff) step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $T/reader $O/lines-diff.json || { echo STOP >> $L; exit 1; } ;;
    gateforced) serve; force; step gate-forced timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $O/gate-forced-diff.txt "${EXPECT[@]}"; unforce || { echo "STOP: the page did not come back" >> $L; exit 1; } ;;
    gaterest) serve; step gate-rest timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $O/gate-rest-diff.txt "${EXPECT[@]}" ;;
    suiterest) serve; lanes suite23rest all ;;
    suiteforced) serve; force; lanes suite23forced $O/card-checks.txt; unforce || { echo "STOP: the page did not come back" >> $L; exit 1; } ;;
  esac
done
echo "DONE $(date -u +%FT%TZ)" >> $L
