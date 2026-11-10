#!/bin/bash
# after a re-run of the Pages deployment: wait for the deployment run $1 (id) to end, then for a live check on main $2 (short sha)
# that ended after the deployment did. Ends on DEPLOY-FAILED, LIVE-SUCCESS, LIVE-FAILURE or a timeout.
S=/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad
RUN="$1"; MAIN="$2"
for i in $(seq 1 75); do
  curl -s "https://api.github.com/repos/MashiachSonYosef/mashiachsonyosef.github.io/actions/runs/$RUN" > $S/v26/run-dep.json
  curl -s "https://api.github.com/repos/MashiachSonYosef/mashiachsonyosef.github.io/actions/runs?per_page=12" > $S/v26/runs.json
  python3 -I - "$S/v26/run-dep.json" "$S/v26/runs.json" "$MAIN" > $S/v26/poll-state.txt <<'PY'
import json, sys
try:
    dep = json.load(open(sys.argv[1])); runs = json.load(open(sys.argv[2])).get("workflow_runs", [])
except Exception as e:
    print("could not read the runs:", e); print("WAIT"); sys.exit(0)
main = sys.argv[3]
if "status" not in dep: print("the deployment run could not be read:", str(dep)[:120]); print("WAIT"); sys.exit(0)
print(f'pages build and deployment · run {dep["run_number"]} attempt {dep.get("run_attempt")} · {dep["status"]} · {dep["conclusion"]} · updated {dep["updated_at"]}')
live = [r for r in runs if r["name"] == "live check" and r["head_sha"].startswith(main)]
for r in live: print(f'live check · run {r["run_number"]} (id {r["id"]}) · {r["status"]} · {r["conclusion"]} · created {r["created_at"]} · updated {r["updated_at"]}')
state = "WAIT"
if dep["status"] == "completed":
    if dep["conclusion"] != "success": state = "DEPLOY-FAILED"
    else:
        done = [r for r in live if r["status"] == "completed" and r["updated_at"] >= dep["updated_at"]]
        ok = [r for r in live if r["status"] == "completed" and r["conclusion"] == "success"]
        if ok: state = "LIVE-SUCCESS"
        elif done and not [r for r in live if r["status"] != "completed"]: state = "LIVE-" + str(done[0]["conclusion"]).upper()
print(state)
PY
  cat $S/v26/poll-state.txt; date -u +%H:%M:%S
  st=$(tail -1 $S/v26/poll-state.txt)
  case "$st" in LIVE-*|DEPLOY-FAILED) echo "POLL-END $st"; exit 0;; esac
  sleep 60
done
echo POLL-TIMEOUT
