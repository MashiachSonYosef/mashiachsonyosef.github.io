#!/bin/bash
# the same-product gate: the live tree (8914, the build the site serves) against the build (8912)
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
cd $S/pt/reader || exit 1
node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $S/v26/gate-diff.txt > $S/v26/gate.log 2>&1
echo "gate exit $?"
tail -6 $S/v26/gate.log | cut -c1-240
echo "no list this round: nothing to account"
echo GATE-DONE
