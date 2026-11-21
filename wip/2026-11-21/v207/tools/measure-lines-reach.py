# v207's lists against the zones as shipped (ship 11d): which lines stand under a key some word of a served work is
# asked under, how many places, and whether the zone's own table has a line for that key today. Reads; writes nothing.
import json, gzip, glob, sys, os, collections
R, D = sys.argv[1], sys.argv[2]
lists = {}
for f in ["landing-own-language-v1.jsonl", "landing-bible-dictionaries-v1.jsonl", "landing-harkavy-v1.jsonl"]:
    for l in open(os.path.join(D, f), encoding="utf-8"):
        e = json.loads(l)
        cls = e.get("source_class") or e.get("work_family") or e["m"]
        lists.setdefault(e["key"], []).append((cls, e["m"], e["route"], e.get("rank")))
places = collections.Counter(); bare = collections.Counter(); glossed = collections.Counter()
zones = 0
barekeys = collections.defaultdict(set)
for p in sorted(glob.glob(os.path.join(R, "data/zones/*.bin"))):
    if p.endswith(".lattice.bin"): continue
    try: z = json.loads(gzip.open(p).read())
    except Exception: continue
    if not isinstance(z, dict) or "sections" not in z: continue
    zones += 1
    g = z.get("gloss") or {}
    work = os.path.basename(p)[:-4]
    for sec in z["sections"]:
        for w in sec.get("words") or []:
            k = w.get("k")
            if k in lists:
                classes = {c for c, *_ in lists[k]}
                for c in classes:
                    places[c] += 1
                    if k in g and g[k]: glossed[c] += 1
                    else:
                        bare[c] += 1; barekeys[c].add((work, k))
print(zones, "zones read")
for c in sorted(places): print(f"{c:42s} places {places[c]:7d} · the key has a line in the zone's table {glossed[c]:7d} · none {bare[c]:6d} ({len(barekeys[c])} work-and-key pairs)")
import random
random.seed(3)
for c in sorted(barekeys):
    ks = sorted(barekeys[c]); print("\n", c, "· keys with no line today, a sample:")
    for work, k in random.sample(ks, min(14, len(ks))):
        print("   ", work, k, "|", " ; ".join(f"{m} «{r[:50]}»" for cc, m, r, rk in lists[k] if cc == c)[:230])
