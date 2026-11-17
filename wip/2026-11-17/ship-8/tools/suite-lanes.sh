#!/bin/bash
# Ship 8's suite, resumable, in two lanes (the list forward and backward), each check through the suite's own runner
# (--only), its verdict kept in suite/v/<check>.verdict; a check with a verdict is skipped, and a check another lane
# holds is skipped (a lock in /dev/shm, which a reboot clears). Usage: suite-lanes.sh [fwd|rev]
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s8w/suite
T=$S/s8; LOCK=/dev/shm/s8suite
mkdir -p $O/v $O/logs $LOCK
. $S/v54/integrate/env.sh
cd $T/reader
list=$(ls tools/check-*.mjs | sort); [ "$1" = rev ] && list=$(echo "$list" | sort -r)
echo "lane $1 start $(date -u +%FT%TZ)" >> $O/run.log
for f in $list; do
  n=$(basename $f .mjs)
  [ -e $O/v/$n.verdict ] && continue
  mkdir $LOCK/$n 2>/dev/null || continue
  node tools/run-checks-v1.mjs --only "^${n}\$" --jobs 1 --timeout 1500 > $O/logs/$n.log 2>&1
  code=$?
  line=$(grep -E "^${n}( |\[)" $O/logs/$n.log | head -1 | cut -c1-300)
  [ -z "$line" ] && line=$(grep -E "not run here|NOT RUN" $O/logs/$n.log | head -1 | cut -c1-300)
  echo "$code $line" > $O/v/$n.verdict
  echo "$(date -u +%T) [$1] $n exit $code" >> $O/run.log
done
echo "lane $1 DONE $(date -u +%FT%TZ)" >> $O/run.log
