# STEP's picks by kind in the v1 book files, and after the v1.1 mend; to place the two receipts' counts (v1: variant
# 850, alternative 5,422; v1.1's mend: in_v1 748 and 5,391). Measures only.
# python3 -I step_kinds.py <default-picks dir>
import json, os, sys, collections
L = sys.argv[1]; V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
C = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    b = f[:-6]
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); st = d.get("step") or []
        for x in st: C[f"v1 kind {x[1]}"] += 1
        C["v1 places with v"] += int(any(x[1] == "v" for x in st)); C["v1 places with a"] += int(any(x[1] == "a" for x in st))
        C["v1 distinct (entry,kind) v"] += len({(x[2]) for x in st if x[1] == "v"}); C["v1 distinct entry a"] += len({x[2] for x in st if x[1] == "a"})
        for x in mend.get((b, d["p"]), st): C[f"v1.1 kind {x[1]}"] += 1
for k in sorted(C): print(f"{C[k]:9,d}  {k}")
