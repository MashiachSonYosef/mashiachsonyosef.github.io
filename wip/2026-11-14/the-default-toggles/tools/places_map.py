# Every zone word (not a mark) against the ledger's places, all 39 books, by verse label and number among the verse's
# words; and the entry count a places array keyed like data/source-suggested (marks included) would have. Measures only.
# python3 -I places_map.py <reader dir> <default-picks dir>
import gzip, json, os, sys
R, L = sys.argv[1], sys.argv[2]
V1 = os.path.join(L, "default-picks-v1")
tz = tl = tm = 0; bad = []
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    b = f[:-6]
    led = set(json.loads(l)["p"] for l in open(os.path.join(V1, f), encoding="utf-8"))
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{b}.bin")).read())
    zp = set(); entries = 0
    for sec in z["sections"]:
        n = 0
        for w in sec.get("words", []):
            entries += 1
            if w.get("mark"): continue
            n += 1; zp.add(f"{sec['label']}:{n}")
    ss = os.path.join(R, "data", "source-suggested", f"{b}.json")
    sl = len(json.load(open(ss))["places"]) if os.path.exists(ss) else None
    tz += len(zp); tl += len(led)
    if zp != led or (sl is not None and sl != entries): bad.append((b, len(zp - led), len(led - zp), entries, sl))
print("zone words", tz, "ledger places", tl, "books differing", bad)
