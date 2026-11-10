"""The Pages deployments of the repository, newest first: each run's attempts, when it ran and how it ended.
usage: python3 -I pages-runs.py <runs.json from the Actions API>
Reads one saved answer of GET /repos/<owner>/<repo>/actions/runs. Nothing is fetched or written.
"""
import json
import sys
from datetime import datetime

runs = json.load(open(sys.argv[1])).get("workflow_runs", [])
when = lambda s: datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ")
for r in runs:
    if r["name"] != "pages build and deployment":
        continue
    took = (when(r["updated_at"]) - when(r["run_started_at"])).total_seconds()
    print(f'run {r["run_number"]} · {r["head_sha"][:8]} · attempt {r.get("run_attempt")} · {r["status"]} · {r["conclusion"]} · '
          f'created {r["created_at"]} · this attempt {r["run_started_at"]} to {r["updated_at"]} ({int(took)} s)')
