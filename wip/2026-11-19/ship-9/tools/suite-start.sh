#!/bin/bash
# serve the trees the checks ask, then both lanes
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad; T=$S/s9
curl -sf -o /dev/null http://127.0.0.1:8899/zone.html || (cd $T/reader && setsid nohup python3 -m http.server 8899 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8912/ || (cd $T && setsid nohup python3 -m http.server 8912 --bind 127.0.0.1 > /dev/null 2>&1 &)
curl -sf -o /dev/null http://127.0.0.1:8914/reader/zone.html || (cd $S/old && setsid nohup python3 -m http.server 8914 --bind 127.0.0.1 > /dev/null 2>&1 &)
sleep 2
(setsid nohup $S/s9w/suite-lanes.sh fwd > /dev/null 2>&1 &)
sleep 3
(setsid nohup $S/s9w/suite-lanes.sh rev > /dev/null 2>&1 &)
