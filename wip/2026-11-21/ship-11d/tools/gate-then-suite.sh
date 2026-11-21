#!/bin/bash
# Ship 11d: the manifest and the gate (after-11d.sh, the gate alone), then the whole suite in two lanes; waits for both lanes.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s14w/suite
GATE_ONLY=1 bash $S/s14w/after-11d.sh pipe2
tail -3 $S/s14w/after-pipe2.log
grep -E "^  ok  |^FAIL|all checks passed|failing" $S/s14w/gate-pipe2.log | cut -c1-200
mkdir -p $O; echo "suite start $(date -u +%FT%TZ)" >> $O/run.log
bash $S/s14w/suite-start.sh
sleep 30
while [ "$(grep -c "^lane .* DONE" $O/run.log)" -lt 2 ]; do sleep 20; done
echo "verdicts: $(ls $O/v | wc -l) of $(ls $S/s11/reader/tools/check-*.mjs | wc -l)"; echo "exit 0: $(grep -l "^0 " $O/v/*.verdict | wc -l)"; echo "--- not exit 0:"; for f in $O/v/*.verdict; do grep -q "^0 " $f || echo "$(basename $f .verdict): $(cat $f | cut -c1-160)"; done
