#!/bin/bash
# after a re-run of the Pages deployment: wait for it and for a live check of this build
# usage: poll2.sh <gh-pages short sha> <main short sha> [minutes, default 40]
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
GHP="$1"; MAIN="$2"; MINUTES="${3:-40}"
for i in $(seq 1 "$MINUTES"); do
  curl -s "https://api.github.com/repos/MashiachSonYosef/mashiachsonyosef.github.io/actions/runs?per_page=12" > "$S/v29/runs.json"
  python3 -I "$S/v29/poll2.py" "$S/v29/runs.json" "$GHP" "$MAIN" > "$S/v29/poll-state.txt" 2>&1
  date -u +%FT%TZ
  cat "$S/v29/poll-state.txt"
  st=$(tail -1 "$S/v29/poll-state.txt")
  case "$st" in LIVE-*|DEPLOY-FAILED) echo "POLL-END $st"; exit 0;; esac
  sleep 60
done
echo POLL-TIMEOUT
