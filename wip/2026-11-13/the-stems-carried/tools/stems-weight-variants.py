# The stems map's weight in every lattice sidecar under five namings of a row: as served (m, rank, the route's
# whole text), m, rank and an 8- or 4-hex fingerprint of the route, m and rank alone, and no stems map at all.
import gzip, json, os, sys, hashlib
zdir = sys.argv[1]
names = ["served", "fp8", "fp4", "m+rank", "none"]
tot = dict.fromkeys(names, 0)
ranks_unique = True
for f in sorted(os.listdir(zdir)):
    if not f.endswith(".lattice.bin"):
        continue
    side = json.loads(gzip.decompress(open(os.path.join(zdir, f), "rb").read()))
    stems = side.get("stems") or {}
    def variant(how):
        global ranks_unique
        if how == "none":
            s = dict(side); s.pop("stems", None); return s
        new = {}
        for key, v in stems.items():
            nv = {}
            for k, st in v.items():
                m, rank, route = k.split("\u0001", 2)
                if how == "served": nk = k
                elif how == "fp8": nk = f"{m}\u0001{rank}\u0001{hashlib.sha256(route.encode()).hexdigest()[:8]}"
                elif how == "fp4": nk = f"{m}\u0001{rank}\u0001{hashlib.sha256(route.encode()).hexdigest()[:4]}"
                else:
                    nk = f"{m}\u0001{rank}"
                    if nk in nv: ranks_unique = False
                nv[nk] = st
            new[key] = nv
        s = dict(side); s["stems"] = new; return s
    for how in names:
        tot[how] += len(gzip.compress(json.dumps(variant(how), ensure_ascii=False, separators=(",", ":")).encode(), 9))
for how in names:
    print(f"{how:8} {tot[how]:>12,} bytes gzipped, all lattice sidecars")
print("m and rank name one row under a key everywhere:", ranks_unique)
