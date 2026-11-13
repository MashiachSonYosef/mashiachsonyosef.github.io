# The per-source figures of the corpus lane's made-spaces receipt, and its checks, printed whole (long lists cut short).
# python3 -I made-spaces-receipt-sources.py <receipt-v1.json>
import json, sys
r = json.load(open(sys.argv[1], encoding="utf8"))
def cut(o, n=6):
    if isinstance(o, dict):
        return {k: cut(v, n) for k, v in o.items()}
    if isinstance(o, list):
        return [cut(x, n) for x in o[:n]] + ([f"... {len(o) - n} more"] if len(o) > n else [])
    return o
for s in r["sources"]:
    print(json.dumps(cut(s, 3), ensure_ascii=False, indent=1)[:6000])
    print("=" * 60)
for c in r["checks"]:
    print(c)
print(json.dumps(r["outputs"], ensure_ascii=False)[:800])
