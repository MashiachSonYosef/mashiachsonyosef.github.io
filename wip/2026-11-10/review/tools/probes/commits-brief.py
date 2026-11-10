# Print one line per commit (sha, date, first line of the message) from a saved list_commits result.
# python3 -I commits-brief.py <file>
import json, sys
raw = open(sys.argv[1], encoding="utf-8").read()
data = json.loads(raw)
if isinstance(data, dict):
    for key in ("result", "content", "commits"):
        if key in data:
            data = data[key]
            break
if isinstance(data, list) and data and isinstance(data[0], dict) and "text" in data[0]:
    data = json.loads(data[0]["text"])
if isinstance(data, str):
    data = json.loads(data)
print(len(data), "commits")
for c in data:
    commit = c.get("commit", {})
    date = (commit.get("committer") or commit.get("author") or {}).get("date", "")
    msg = (commit.get("message") or "").split("\n")[0][:110]
    print(c.get("sha", "")[:10], date[:16], msg)
