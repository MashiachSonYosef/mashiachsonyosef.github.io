# The search index's own record in two trees: its counts, set side by side, and what it says it was baked from.
# python3 -I search-index-before-and-after.py <reader dir before> <reader dir after>
import json, os, sys
def load(r):
    return json.load(open(os.path.join(r, "data/search-index/index.json"), encoding="utf8"))
a, b = load(sys.argv[1]), load(sys.argv[2])
print("from, before:", json.dumps(a.get("from"), ensure_ascii=False))
print("from, after: ", json.dumps(b.get("from"), ensure_ascii=False))
def flat(o, pre=""):
    out = {}
    for k, v in (o or {}).items():
        if isinstance(v, dict): out.update(flat(v, pre + k + "."))
        elif isinstance(v, (int, float)): out[pre + k] = v
    return out
fa, fb = flat(a.get("counts")), flat(b.get("counts"))
for k in sorted(set(fa) | set(fb)):
    va, vb = fa.get(k), fb.get(k)
    print(f"{k:60s} {va!s:>12} {vb!s:>12} {'' if va == vb else '  <- moved by ' + str((vb or 0) - (va or 0))}")
