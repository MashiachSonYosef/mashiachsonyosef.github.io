# One chain file, looked at: its counts, what it says it was read off, and the first cells.
# python3 -I chain-file-look.py <chain-v1.json.gz> [cells to show]
import gzip, json, sys
d = json.loads(gzip.open(sys.argv[1]).read())
n = int(sys.argv[2]) if len(sys.argv) > 2 else 4
print(d["schema_version"], d["rule_id"][:60], d["work"])
print("counts", json.dumps(d["counts"]))
ro = d["read_off"]
print("read off", ro["address"], "·", len(ro["files"]), "files ·", json.dumps(ro["states"])[:700])
kinds = {}
for f in ro["files"]: kinds[f.rsplit("/", 2)[0] if "/" in f else f] = kinds.get(f.rsplit("/", 2)[0] if "/" in f else f, 0) + 1
print("files by folder", kinds)
print("raw json bytes", len(json.dumps(d)), "pools", len(d["pools"]), "links in pools", sum(len(p) for p in d["pools"]), "fingerprints", len(d["full_by_short"]))
shown = 0
for s in d["sections"]:
    for c in s["cells"]:
        if shown >= n: break
        shown += 1
        print(s["label"], json.dumps(c)[:900])
print("pool 0:", json.dumps(d["pools"][0])[:500])
