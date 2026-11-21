#!/bin/bash
# Ship 10b: one pass of the pipeline, then (where it ends DONE) the gate and the whole suite. Usage: chain.sh <pass> <suite dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
PASSN=${1:?pass}; SUITEN=${2:?suite}
PASS=$PASSN bash $S/s17w/pipeline-14.sh
grep -q "^DONE" $S/s17w/$PASSN/pipeline.log || { echo "chain: the pass $PASSN did not end DONE" >> $S/s17w/chain-$PASSN.log; exit 1; }
SUITE=$SUITEN bash $S/s17w/gate-then-suite.sh $PASSN > $S/s17w/chain-$PASSN.log 2>&1
echo "CHAIN DONE $(date -u +%FT%TZ)" >> $S/s17w/chain-$PASSN.log
