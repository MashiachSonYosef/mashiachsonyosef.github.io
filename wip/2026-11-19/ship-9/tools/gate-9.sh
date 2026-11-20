#!/bin/bash
# ship 9: the gate alone (live on 8914 against ship 9 on 8912)
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; T=$S/s9; L=$S/s9w/finish.log
. $S/v54/integrate/env.sh
curl -sf -o /dev/null http://127.0.0.1:8912/ || (cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2; cd $T/reader; t0=$(date +%s)
timeout 7200 node tools/check-same-product-v1.mjs --old http://127.0.0.1:8914 --new http://127.0.0.1:8912 --diff $S/s9w/gate-diff.txt --expect data/default-picks/index.json --expect data/dictionary-kinds-v1.json --expect data/audit-calls/PIN.json > $S/s9w/gate.log 2>&1
echo "gate exit $? ($(( $(date +%s) - t0 )) s) $(date -u +%FT%TZ)" >> $L
