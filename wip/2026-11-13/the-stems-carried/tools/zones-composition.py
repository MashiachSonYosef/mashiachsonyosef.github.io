# What the zones folder weighs, by kind of file, and inside the lattice sidecars by top-level field (each field's
# share measured as the gzipped size of the sidecar without it). It measures; it changes nothing.
import gzip, json, os, sys, collections
zdir = sys.argv[1]
kinds = collections.Counter()
for f in os.listdir(zdir):
    parts = f.split(".")
    kinds[".".join(parts[1:]) if len(parts) > 2 else "bin (the zone)"] += os.path.getsize(os.path.join(zdir, f))
for k, v in kinds.most_common():
    print(f"{v:>12,}  {k}")
print()
field = collections.Counter(); total = 0
for f in sorted(os.listdir(zdir)):
    if not f.endswith(".lattice.bin"):
        continue
    side = json.loads(gzip.decompress(open(os.path.join(zdir, f), "rb").read()))
    whole = len(gzip.compress(json.dumps(side, ensure_ascii=False, separators=(",", ":")).encode(), 9))
    total += whole
    for k in ("routes", "grades", "stems"):
        if k in side:
            s2 = {x: y for x, y in side.items() if x != k}
            field[k] += whole - len(gzip.compress(json.dumps(s2, ensure_ascii=False, separators=(",", ":")).encode(), 9))
print(f"{total:>12,}  the lattice sidecars, re-serialized")
for k, v in field.most_common():
    print(f"{v:>12,}  of it the field {k}")
