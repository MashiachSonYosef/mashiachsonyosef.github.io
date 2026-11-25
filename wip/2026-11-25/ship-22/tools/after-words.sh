#!/bin/bash
# The plain-words ship: after a zone.html change, the steps that read the page again (the resting lines, the chain books), the door, the switches page, then the resting lines against live.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/s13/reader && . $S/s31w/env.sh
ROUND=(bash tools/round-v1.sh --stamp 2026-11-16 --lattice $LATTICE_DIR --lattice-delta $LATTICE_DELTA_DIR --stems $S/dl-v2/v2/corpus/binyan-ledger/build-r2 --stems-extension $STEMS_EXTENSION --default-picks $S/v54/picks-v1-2/ledger)
L=$S/s34w/after.log; : > $L
step() { local n=$1; shift; local t0=$(date +%s); "$@" > $S/s34w/$n.log 2>&1; local rc=$?; echo "$n exit $rc ($(( $(date +%s) - t0 )) s)" >> $L; return $rc; }
step lines "${ROUND[@]}" --steps lines || { echo STOP lines >> $L; exit 1; }
step chain node tools/build-chain-book-v2.mjs --jobs 2 || { echo STOP chain >> $L; exit 1; }
step door "${ROUND[@]}" --steps door || { echo STOP door >> $L; exit 1; }
step switches timeout 1800 node tools/build-toggle-design-v1.mjs || { echo STOP switches >> $L; exit 1; }
step linesdiff node $S/s7w/lines-diff.mjs $S/old/reader $S/s13/reader $S/s34w/lines-diff.json || { echo STOP linesdiff >> $L; exit 1; }
echo "DONE $(date -u +%FT%TZ)" >> $L
