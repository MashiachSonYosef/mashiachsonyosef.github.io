# Print the full sha of each commit whose sha starts with one of the given prefixes, from a saved list_commits result.
# python3 -I full-shas.py <file> <prefix...>
import json, sys
data = json.loads(open(sys.argv[1], encoding="utf-8").read())
if isinstance(data, dict):
    for key in ("result", "content", "commits"):
        if key in data:
            data = data[key]
            break
if isinstance(data, list) and data and isinstance(data[0], dict) and "text" in data[0]:
    data = json.loads(data[0]["text"])
for want in sys.argv[2:]:
    for c in data:
        if c.get("sha", "").startswith(want):
            print(c["sha"])
