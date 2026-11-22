#!/bin/bash
# Ship 13: the manifest and the gate (after-12.sh, the gate alone), then the whole suite in two lanes; waits for both lanes.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; PASSN=${1:-p1}; export SUITE=${SUITE:-suite}; O=$S/s19w/$SUITE
GATE_ONLY=1 bash $S/s19w/after-16.sh $PASSN
tail -3 $S/s19w/after-$PASSN.log
grep -E "^  ok  |^FAIL|all checks passed|failing" $S/s19w/gate-$PASSN.log | cut -c1-200
mkdir -p $O; echo "suite start $(date -u +%FT%TZ)" >> $O/run.log
bash $S/s19w/suite-start.sh
sleep 30
while [ "$(grep -c "^lane .* DONE" $O/run.log)" -lt 2 ]; do sleep 20; done
echo "verdicts: $(ls $O/v | wc -l) of $(ls $S/s13/reader/tools/check-*.mjs | wc -l)"; echo "exit 0: $(grep -l "^0 " $O/v/*.verdict | wc -l)"; echo "--- not exit 0:"; for f in $O/v/*.verdict; do grep -q "^0 " $f || echo "$(basename $f .verdict): $(cat $f | cut -c1-160)"; done
