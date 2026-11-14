# Each default's line coverage over every ledger place of the 39 books (mend applied): STEP's first pick with words,
# MACULA's joined words, UBS's first picks not a sign alone, BDB's record highlights (slot 5). Measures only.
# python3 -I coverage_all.py <default-picks dir>
import json, os, re, sys, collections
L = sys.argv[1]; V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
C = collections.Counter(); N = 0
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    b = f[:-6]
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); N += 1
        st = mend.get((b, d["p"]), d.get("step") or [])
        C["step"] += int(bool(st and st[0][4]))
        C["step first pick kind r"] += int(bool(st and st[0][1] == "r"))
        m = d.get("macula"); C["macula"] += int(bool(m and m[0]))
        pcs = [p for p in (d.get("ubs") or []) if p[2]]
        C["ubs any pick"] += int(bool(pcs))
        C["ubs"] += int(bool(pcs) and not all(SIGN.match(str(p[2][0][2]).strip()) for p in pcs))
        bd = d.get("bdb") or []
        C["bdb any pick"] += int(bool(bd)); C["bdb"] += int(bool(bd and bd[0][5]))
print("places", N)
for k in sorted(C): print(f"{C[k]:9,d}  {100*C[k]/N:6.2f}%  {k}")
