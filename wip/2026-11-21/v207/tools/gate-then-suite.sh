#!/bin/bash
# Ship 12: the manifest and the gate (after-12.sh, the gate alone), then the whole suite in two lanes; waits for both lanes.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s15w/suite
GATE_ONLY=1 bash $S/s15w/after-12.sh ship1
tail -3 $S/s15w/after-ship1.log
grep -E "^  ok  |^FAIL|all checks passed|failing" $S/s15w/gate-ship1.log | cut -c1-200
mkdir -p $O; echo "suite start $(date -u +%FT%TZ)" >> $O/run.log
bash $S/s15w/suite-start.sh
sleep 30
while [ "$(grep -c "^lane .* DONE" $O/run.log)" -lt 2 ]; do sleep 20; done
echo "verdicts: $(ls $O/v | wc -l) of $(ls $S/s12/reader/tools/check-*.mjs | wc -l)"; echo "exit 0: $(grep -l "^0 " $O/v/*.verdict | wc -l)"; echo "--- not exit 0:"; for f in $O/v/*.verdict; do grep -q "^0 " $f || echo "$(basename $f .verdict): $(cat $f | cut -c1-160)"; done
