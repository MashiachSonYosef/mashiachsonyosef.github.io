#!/bin/bash
# Ship 8's suite, resumable: each check through the suite's own runner (--only, one at a time), its verdict kept in
# suite/v/<check>.verdict (the runner's exit code, then its verdict line); a rerun skips every check with a verdict.
# The machine rebooted three times under the browser checks' load on 16-17 November, more often than the suite takes.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; O=$S/s8w/suite
T=$S/s8
mkdir -p $O/v $O/logs
. $S/v54/integrate/env.sh
cd $T/reader
pkill -f "http.server 8899 --bind 127.0.0.1" ; pkill -f "http.server 8912 --bind 127.0.0.1" ; sleep 1
(cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
(cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
echo "start $(date -u +%FT%TZ)" >> $O/run.log
for f in $(ls tools/check-*.mjs | sort); do
  n=$(basename $f .mjs)
  [ -e $O/v/$n.verdict ] && continue
  node tools/run-checks-v1.mjs --only "^${n}\$" --jobs 1 --timeout 1500 > $O/logs/$n.log 2>&1
  code=$?
  line=$(grep -E "^${n}( |\[)" $O/logs/$n.log | head -1 | cut -c1-300)
  [ -z "$line" ] && line=$(grep -E "not run here|NOT RUN" $O/logs/$n.log | head -1 | cut -c1-300)
  echo "$code $line" > $O/v/$n.verdict
  echo "$(date -u +%T) $n exit $code" >> $O/run.log
done
echo "DONE $(date -u +%FT%TZ)" >> $O/run.log
