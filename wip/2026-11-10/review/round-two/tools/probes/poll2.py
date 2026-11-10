"""One reading of the Pages deployment and the live check, for a re-run deployment.
usage: python3 -I poll2.py <runs.json> <gh-pages short sha> <main short sha>
prints one line per run it looks at and a last line that is the state:
  WAIT · DEPLOY-FAILED · LIVE-SUCCESS · LIVE-FAILURE-AFTER-DEPLOY · LIVE-NOT-RUN-SINCE-DEPLOY
"""
import json
import sys

runs = json.load(open(sys.argv[1])).get("workflow_runs", [])
ghp, main = sys.argv[2], sys.argv[3]
dep = [r for r in runs if r["name"] == "pages build and deployment" and r["head_sha"].startswith(ghp)]
live = [r for r in runs if r["name"] == "live check" and r["head_sha"].startswith(main)]
for r in dep + live:
    print(f'{r["name"]} · run {r["run_number"]} (id {r["id"]}) attempt {r.get("run_attempt")} · {r["status"]} · {r["conclusion"]} · {r["head_sha"][:8]} · started {r["run_started_at"]} · updated {r["updated_at"]}')
state = "WAIT"
if dep and dep[0]["status"] == "completed":
    if dep[0]["conclusion"] != "success":
        state = "DEPLOY-FAILED"
    else:
        done_at = dep[0]["updated_at"]
        # a live check that ended in success at any time since this deployment began is a reading of this build
        ok = [r for r in live if r["status"] == "completed" and r["conclusion"] == "success" and r["updated_at"] >= dep[0]["run_started_at"]]
        running = [r for r in live if r["status"] != "completed"]
        failed_after = [r for r in live if r["status"] == "completed" and r["conclusion"] != "success" and r["run_started_at"] >= done_at]
        if ok:
            state = "LIVE-SUCCESS"
        elif running:
            state = "WAIT"
        elif failed_after:
            state = "LIVE-FAILURE-AFTER-DEPLOY"
        else:
            state = "LIVE-NOT-RUN-SINCE-DEPLOY"
print(state)
