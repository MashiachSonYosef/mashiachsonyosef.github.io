#!/bin/bash
# Keep meta/overlap/dl under the 6 GB budget: pause the run fetchers above 5000 MiB, resume below 3800 MiB.
D=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap/dl
while true; do
  s=$(du -sm $D 2>/dev/null | cut -f1)
  alive=0
  for p in $@; do if kill -0 $p 2>/dev/null; then alive=1; fi; done
  [ $alive = 0 ] && exit 0
  if [ "$s" -gt 5000 ]; then for p in $@; do kill -STOP $p 2>/dev/null; done; echo "$(date +%T) $s MiB: paused"
  elif [ "$s" -lt 3800 ]; then for p in $@; do kill -CONT $p 2>/dev/null; done; fi
  sleep 3
done
