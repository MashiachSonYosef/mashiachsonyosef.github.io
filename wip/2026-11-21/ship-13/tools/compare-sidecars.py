# Ship 13: what the lattice delta moves in a book's sidecar: python3 -I compare-sidecars.py <old .lattice.bin> <new .lattice.bin> [samples]
import sys, json, gzip, collections
a = json.loads(gzip.open(sys.argv[1]).read().decode("utf-8")); b = json.loads(gzip.open(sys.argv[2]).read().decode("utf-8"))
show = int(sys.argv[3]) if len(sys.argv) > 3 else 4
ga, gb = a["grades"], b["grades"]
c = collections.Counter(); ex = collections.defaultdict(list)
if set(ga) != set(gb): c["surfaces not in both"] = len(set(ga) ^ set(gb))
for s in ga:
    if s not in gb: continue
    x, y = ga[s], gb[s]
    if x["g"] != y["g"]:
        c["g"] += 1
        c["g cards"] += sum(1 for i in range(min(len(x["g"]), len(y["g"]))) if x["g"][i] != y["g"][i])
    if x["n"] != y["n"]: c["n"] += 1
    if (x.get("v") or {}) != (y.get("v") or {}): c["v"] += 1
    for k in ("m", "x", "c", "l", "la", "s"):
        if x["o"].get(k) != y["o"].get(k):
            c["o." + k] += 1
            if len(ex["o." + k]) < show: ex["o." + k].append((s, x["k"], (x["o"].get(k) or [None])[:2], (y["o"].get(k) or [None])[:2]))
    if x.get("nl") != y.get("nl"): c["nl"] += 1
    ea, eb = x.get("e") or {}, y.get("e") or {}
    if ea != eb:
        c["e"] += 1
        for kk in set(ea) | set(eb):
            if ea.get(kk) != eb.get(kk):
                c["e entries"] += 1
                la_, lb_ = (ea.get(kk) or {}).get("l"), (eb.get(kk) or {}).get("l")
                if la_ != lb_:
                    c["e.l"] += 1
                    if len(ex["e.l"]) < show: ex["e.l"].append((s, x["k"], kk, (la_ or [None])[:2], (lb_ or [None])[:2]))
    for k in x:
        if k not in ("g", "n", "v", "o", "nl", "e", "k", "st") and x[k] != y.get(k): c["other:" + k] += 1
    if x.get("st") != y.get("st"): c["st"] += 1
print(len(ga), "surfaces ·", dict(c))
for k, v in ex.items():
    for e in v: print("  ", k, json.dumps(e, ensure_ascii=False)[:300])
for k in a:
    if k not in ("grades", "emitted_from", "counts", "delta") and a[k] != b.get(k): print("top-level differs:", k)
print("names lists: old", sum(len(g["n"]) + sum(len(v["n"]) for v in (g.get("v") or {}).values()) for g in ga.values()), "new", sum(len(g["n"]) + sum(len(v["n"]) for v in (g.get("v") or {}).values()) for g in gb.values()),
      "· verses with their own list: old", sum(len(g.get("v") or {}) for g in ga.values()), "new", sum(len(g.get("v") or {}) for g in gb.values()))
