# The witnessed columns' refusals on two trees, book by book and in all: for each of the three columns, how many
# shipped readings were baked and how many refused, by the reason the bake typed. It reads each zone's receipt
# (emitted_from.witnessed_order); it changes nothing.
# python3 -I witnessed-refusals.py <reader dir before> <reader dir after>
import collections, glob, gzip, json, os, sys

def read(R):
    out = collections.defaultdict(collections.Counter)
    for p in sorted(glob.glob(os.path.join(R, "data/zones/*.bin"))):
        if p.endswith(".lattice.bin"): continue
        z = json.loads(gzip.decompress(open(p, "rb").read()))
        rec = (z.get("emitted_from") or {}).get("witnessed_order") or {}
        for o, c in (rec.get("columns") or {}).items():
            out[o]["baked"] += c.get("baked", 0)
            for why, n in (c.get("refused_why") or {}).items(): out[o][f"refused: {why}"] += n
    return out

A, B = read(sys.argv[1]), read(sys.argv[2])
for o in sorted(set(A) | set(B)):
    print(o)
    for k in sorted(set(A[o]) | set(B[o])):
        a, b = A[o][k], B[o][k]
        print(f"   {k:60s} {a:9,} {b:9,}{'' if a == b else f'   ({b - a:+,})'}")
