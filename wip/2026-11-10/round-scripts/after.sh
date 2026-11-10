#!/bin/bash
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
pkill -f "http.server 8914" ; pkill -f "http.server 8912" ; pkill -f "http.server 8899" ; sleep 2
cd $S/old && nohup timeout 43200 python3 -m http.server 8914 --bind 127.0.0.1 > $S/v26/srv8914.log 2>&1 &
cd $S/pt && nohup timeout 43200 python3 -m http.server 8912 --bind 127.0.0.1 > $S/v26/srv8912.log 2>&1 &
cd $S/pt/reader && nohup timeout 43200 python3 -m http.server 8899 --bind 127.0.0.1 > $S/v26/srv8899.log 2>&1 &
sleep 3
echo "== chain A"; $S/v26/chainA.sh 2>&1 | tail -44
echo "== chain B"; $S/v26/chainB.sh 2>&1 | tail -44
echo "== gate"; $S/v26/gate.sh 2>&1 | tail -12
echo AFTER-DONE
