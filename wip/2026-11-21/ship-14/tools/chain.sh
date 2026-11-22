#!/bin/bash
# Ship 14: one pass of the pipeline, then (where it ends DONE) the gate and the whole suite. Usage: chain.sh <pass> <suite dir>
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
PASSN=${1:?pass}; SUITEN=${2:?suite}
PASS=$PASSN bash $S/s18w/pipeline-15.sh
grep -q "^DONE" $S/s18w/$PASSN/pipeline.log || { echo "chain: the pass $PASSN did not end DONE" >> $S/s18w/chain-$PASSN.log; exit 1; }
SUITE=$SUITEN bash $S/s18w/gate-then-suite.sh $PASSN > $S/s18w/chain-$PASSN.log 2>&1
echo "CHAIN DONE $(date -u +%FT%TZ)" >> $S/s18w/chain-$PASSN.log
