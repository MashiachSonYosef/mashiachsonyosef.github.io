#!/bin/bash
# start the third pass once the second has finished
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
while pgrep -f "pipeline-9b.sh" > /dev/null; do sleep 10; done
bash $S/s9w/pipeline-9c.sh > $S/s9w/pipeline-9c.out 2>&1
