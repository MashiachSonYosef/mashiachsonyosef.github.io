# The stems the lattice sidecars give the pointed surfaces of the served books: every distinct name, how many
# surfaces carry it, and how many surfaces carry two or more names (where the place's sources disagree).
# python3 -I stems-in-the-sidecars.py <reader dir>
import gzip, json, os, sys, collections
d0 = os.path.join(sys.argv[1], "data/zones")
names = collections.Counter(); many = collections.Counter(); surfaces = 0; books = 0; combos = collections.Counter()
for f in sorted(os.listdir(d0)):
    if not f.endswith(".lattice.bin"): continue
    side = json.loads(gzip.open(os.path.join(d0, f)).read())
    books += 1
    for s, g in (side.get("grades") or {}).items():
        st = g.get("st")
        if not st: continue
        surfaces += 1
        for x in st: names[x] += 1
        if len(st) > 1: many[len(st)] += 1; combos[" | ".join(st)] += 1
print(f"{books} sidecars · {surfaces:,} pointed surfaces carry a stem")
print("names:", ", ".join(f"{k} {v:,}" for k, v in names.most_common()))
print("surfaces with more than one name:", dict(many))
print("the commonest pairs:", ", ".join(f"{k} ({v})" for k, v in combos.most_common(8)))
