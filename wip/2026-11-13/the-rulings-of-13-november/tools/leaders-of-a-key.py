# The leaders under "only this pointing" that two builds' sidecars hold for the surfaces of given keys in one book:
# the surface's own on each build, and on the build with the gates the leaders at each kind of place.
# python3 -I leaders-of-a-key.py <zones dir before> <zones dir with the gates> <book> <key> [<key> ...]
import gzip, json, sys
A, B, book, keys = sys.argv[1], sys.argv[2], sys.argv[3], set(sys.argv[4:])
load = lambda d: json.loads(gzip.open(f"{d}/{book}.lattice.bin").read().decode("utf-8"))
a, b = load(A), load(B)
say = lambda l: "none" if not l else f"«{l[0]}» · {l[1][:46]} · {l[3]}" + (f" · carried by {' '.join(l[4])}" if len(l) > 4 and l[4] else "")
for s, g in sorted(b["grades"].items()):
    if g.get("k") not in keys: continue
    ga = a["grades"].get(s) or {}
    print(f"{s} (key {g['k']})")
    print("   before, the surface's own:", say((ga.get("o") or {}).get("l")))
    print("   now, the surface's own:   ", say((g.get("o") or {}).get("l")))
    for kind, e in sorted((g.get("e") or {}).items()):
        print(f"   now, at {kind or '(no tag, not a name)'}:", say(e.get("l")), "| alternate:", say(e.get("la")))
