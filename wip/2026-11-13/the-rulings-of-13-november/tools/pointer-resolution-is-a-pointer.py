# A pointer's resolution should be English. Is any resolution in the baked map itself a reading the corpus lane's own
# file classes as a pointer (FORM_OF, MIXED, JUDGMENT or USAGE_NOTE) under the target's key? Then the pill would
# print a pointer in place of a pointer. Listed with the places the reading stands at. It reads; it changes nothing.
# python3 -I pointer-resolution-is-a-pointer.py <baked form-of-pills json> <zone-pills-v1.3.jsonl>
import json, sys

baked = json.load(open(sys.argv[1], encoding="utf-8"))
lines = [json.loads(s) for s in open(sys.argv[2], encoding="utf-8").read().split("\n") if s.strip()]
klass = {}
places = {}
for l in lines:
    klass.setdefault((l["key"], l["text"].rstrip(".")), set()).add(l["class"])
    places[(l["key"], l["m_id"], l["text"])] = l.get("places") or 0
hits = []
for k, entries in baked["keys"].items():
    for e in entries:
        r = e.get("resolved")
        if not r:
            continue
        c = klass.get((r["key"], r["text"].rstrip(".")))
        if c and c != {"NOT"}:
            hits.append((places.get((k, e["m"], e["t"]), 0), k, e["m"], e["t"], r["key"], r["text"], sorted(c)))
hits.sort(key=lambda x: -x[0])
print(len(hits), "resolutions are themselves readings the lane classes as a pointer;", sum(h[0] for h in hits), "places")
for pl, k, m, t, rk, rt, c in hits:
    print("%5d places · %s %s «%s»\n        resolves to %s «%s» · classed %s" % (pl, k, m, t[:70], rk, rt[:90], ", ".join(c)))
