#!/bin/bash
# Download the selected doc bodies (read-only GETs) into meta/readers/dl/ with the scratchpad's r2get.mjs.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; R=$S/meta/readers
set -a; . $S/r2.env; set +a
cd $R && xargs -d '\n' -n 40 -P 16 node $S/r2get.mjs $R/dl < ${1:-$R/docs-keys.txt} > $R/dl.log 2>&1
echo "exit $?" >> $R/dl.log
