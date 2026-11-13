# Of the keys each lattice sidecar carries stems for, how many have no pointed surface in the book whose places
# have a known stem (grades[surface].st), so the card never asks their stems; and their weight.
import gzip, json, os, sys
zdir = sys.argv[1]
tk = dk = tr = dr = 0; served = pruned = 0
for f in sorted(os.listdir(zdir)):
    if not f.endswith(".lattice.bin"):
        continue
    side = json.loads(gzip.decompress(open(os.path.join(zdir, f), "rb").read()))
    stems = side.get("stems") or {}
    live = {g.get("k") for s, g in (side.get("grades") or {}).items() if isinstance(g, dict) and g.get("st")}
    dead = [k for k in stems if k not in live]
    tk += len(stems); dk += len(dead); tr += sum(len(v) for v in stems.values()); dr += sum(len(stems[k]) for k in dead)
    s2 = dict(side); s2["stems"] = {k: v for k, v in stems.items() if k in live}
    served += len(gzip.compress(json.dumps(side, ensure_ascii=False, separators=(",", ":")).encode(), 9))
    pruned += len(gzip.compress(json.dumps(s2, ensure_ascii=False, separators=(",", ":")).encode(), 9))
print(f"keys with stems {tk:,}; with no surface of known stem in the book {dk:,}; rows {tr:,} of which on those keys {dr:,}")
print(f"gzipped: {served:,} -> {pruned:,} ({served - pruned:,} less)")
