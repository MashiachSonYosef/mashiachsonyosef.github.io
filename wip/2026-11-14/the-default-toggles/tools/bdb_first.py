# BDB's pick at a place: the record's highlighted words (slot 5) whole, against their first highlight only (to the
# first " / "), and against the point's own words (slot 3); lengths and how often each is empty. Measures only.
# python3 -I bdb_first.py <default-picks dir>
import json, os, sys, collections, statistics
V1 = os.path.join(sys.argv[1], "default-picks-v1")
C = collections.Counter(); L = collections.defaultdict(list); eg = []
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l)
        for x in (d.get("bdb") or [])[:1]:
            C["places with a BDB pick"] += 1
            whole = x[5] or ""; first = whole.split(" / ")[0] if whole else ""; own = x[3] or ""
            for k, t in (("slot 5 whole", whole), ("slot 5 first highlight", first), ("slot 3 point words", own)):
                if t: L[k].append(len(t))
                else: C[f"{k}: empty"] += 1
            if whole and " / " in whole: C["slot 5 has several highlights"] += 1
            if whole and own and own in whole.split(" / ")[1:]: C["slot 3 is one of slot 5's later highlights"] += 1
            if whole and own and own == first: C["slot 3 equals slot 5's first highlight"] += 1
            if whole and " / " in whole and len(eg) < 6: eg.append(f"{f[:-6]} {d['p']} {x[1]} {x[2]} | 5: «{whole[:110]}» | 3: «{own[:60]}»")
for k in sorted(C): print(f"{C[k]:9,d}  {k}")
for k, v in L.items():
    v.sort(); print(k, "median", statistics.median(v), "p90", v[int(.9*len(v))], "p99", v[int(.99*len(v))], "max", v[-1], "over 40", sum(1 for x in v if x > 40))
for x in eg: print(x)
