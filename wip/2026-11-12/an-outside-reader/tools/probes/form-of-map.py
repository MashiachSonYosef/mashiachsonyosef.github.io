# The form-of map the page prints pointer pills from (data/form-of-pills-v1.json), measured: how many readings it
# resolves, how many of those carry English of their own before the pointer (the text does not open with the
# relation's words), and how many print, under one key, the very text another reading of that key prints.
# python3 -I form-of-map.py <reader dir> [key to print in full]
import json, os, sys, collections
reader = sys.argv[1]
show = sys.argv[2] if len(sys.argv) > 2 else None
d = json.load(open(os.path.join(reader, "data/form-of-pills-v1.json"), encoding="utf8"))
print({k: (v if not isinstance(v, (dict, list)) else type(v).__name__) for k, v in d.items() if k != "keys"})
print("counts", json.dumps(d.get("counts"))[:600])
def target(e):
    if not e.get("at"): return e.get("target")
    b = e["t"].encode("utf8")
    return b[e["at"][0]:e["at"][1]].decode("utf8", "replace") or e.get("target")
def says(e): return f'{e["resolved"]["text"]} ({e["relation"]} {target(e)})'
def nodot(t): return t[:-1] if t.endswith(".") else t
T = collections.Counter(); eg = collections.defaultdict(list)
first = True
for k, l in d["keys"].items():
    if first: print("an entry:", json.dumps(l[0], ensure_ascii=False)[:500]); first = False
    printed = collections.defaultdict(list)
    for e in l:
        T["entries"] += 1
        T["class " + str(e.get("class") or e.get("kind") or "?")] += 1
        if not e.get("resolved"): continue
        T["resolved"] += 1
        opens = nodot(e["t"]).lower().startswith(str(e["relation"]).lower())
        if not opens:
            T["resolved, and the text does not open with the relation's words"] += 1
            if len(eg["own"]) < 14: eg["own"].append(f'{k}: {e["t"][:90]!r} prints {says(e)[:70]!r}')
        else:
            rest = nodot(e["t"])[len(str(e["relation"])):].strip()
            if rest != str(target(e)).strip():
                T["resolved, opens with the relation, and says more after the target"] += 1
                if len(eg["more"]) < 8: eg["more"].append(f'{k}: {e["t"][:110]!r} prints {says(e)[:60]!r}')
            else: T["resolved, and the text is the relation and the target alone"] += 1
        printed[(e.get("m"), says(e))].append(e["t"])
    for (m, s), ts in printed.items():
        if len(set(nodot(t) for t in ts)) > 1:
            T["keys+sources where two readings print one text"] += 1
            T["  readings in them"] += len(set(nodot(t) for t in ts))
            if len(eg["twice"]) < 8: eg["twice"].append(f'{k}: {s[:60]!r} for {len(ts)} readings')
    if show and k == show:
        for e in l: print("   ", json.dumps(e, ensure_ascii=False)[:700])
for k in sorted(T): print(f"{T[k]:7d}  {k}")
for k, v in eg.items():
    print(k, "::")
    for x in v: print("    ", x)
