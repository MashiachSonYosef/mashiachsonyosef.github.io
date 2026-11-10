#!/bin/bash
# after the ship: wait for the Pages deployment of gh-pages $1 (short sha) and the live check on main $2 (short sha)
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
GHP="$1"; MAIN="$2"
for i in $(seq 1 60); do
  curl -s "https://api.github.com/repos/MashiachSonYosef/mashiachsonyosef.github.io/actions/runs?per_page=10" > $S/v26/runs.json
  python3 -I - "$S/v26/runs.json" "$GHP" "$MAIN" > $S/v26/poll-state.txt <<'PY'
import json, sys
runs = json.load(open(sys.argv[1])).get("workflow_runs", [])
ghp, main = sys.argv[2], sys.argv[3]
dep = [r for r in runs if r["name"] == "pages build and deployment" and r["head_sha"].startswith(ghp)]
live = [r for r in runs if r["name"] == "live check" and r["head_sha"].startswith(main)]
for r in dep + live:
    print(f'{r["name"]} · run {r["run_number"]} (id {r["id"]}) attempt {r.get("run_attempt")} · {r["status"]} · {r["conclusion"]} · {r["head_sha"][:8]} · {r["created_at"]}')
state = "WAIT"
if dep and dep[0]["status"] == "completed" and dep[0]["conclusion"] != "success": state = "DEPLOY-FAILED"
if live and live[0]["status"] == "completed": state = "LIVE-" + str(live[0]["conclusion"]).upper()
print(state)
PY
  cat $S/v26/poll-state.txt
  st=$(tail -1 $S/v26/poll-state.txt)
  case "$st" in LIVE-*|DEPLOY-FAILED) echo "POLL-END $st"; exit 0;; esac
  sleep 60
done
echo POLL-TIMEOUT
