"""Find the earlier re-runs of a workflow in this session's transcript, and what came back.
usage: python3 -I find-reruns.py <transcript.jsonl>
"""
import json
import sys

ids = {}
with open(sys.argv[1], encoding="utf-8") as fh:
    for n, line in enumerate(fh):
        if "rerun_" not in line and not any(i in line for i in ids):
            continue
        try:
            ev = json.loads(line)
        except Exception:
            continue
        msg = ev.get("message") or {}
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        for part in content:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "tool_use" and part.get("name", "").endswith("actions_run_trigger"):
                inp = part.get("input") or {}
                ids[part["id"]] = (inp.get("method"), inp.get("run_id"), inp.get("workflow_id"), ev.get("timestamp"))
            if part.get("type") == "tool_result" and part.get("tool_use_id") in ids:
                c = part.get("content")
                text = c if isinstance(c, str) else " ".join(x.get("text", "") for x in c if isinstance(x, dict))
                print(ids[part["tool_use_id"]], "->", text[:400].replace("\n", " "))
