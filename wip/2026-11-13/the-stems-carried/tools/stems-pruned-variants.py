# The stems map kept only for keys a card can ask it of (a surface of the book whose places have a known stem),
# under three namings of a row: as served, m+rank+8-hex fingerprint, m+rank alone. Gzipped totals.
import gzip, json, os, sys, hashlib
zdir = sys.argv[1]
tot = {"served": 0, "pruned": 0, "pruned+fp8": 0, "pruned+m+rank": 0}
for f in sorted(os.listdir(zdir)):
    if not f.endswith(".lattice.bin"):
        continue
    side = json.loads(gzip.decompress(open(os.path.join(zdir, f), "rb").read()))
    stems = side.get("stems") or {}
    live = {g.get("k") for s, g in (side.get("grades") or {}).items() if isinstance(g, dict) and g.get("st")}
    def with_stems(st):
        s = dict(side); s["stems"] = st
        return len(gzip.compress(json.dumps(s, ensure_ascii=False, separators=(",", ":")).encode(), 9))
    kept = {k: v for k, v in stems.items() if k in live}
    def rename(how):
        out = {}
        for key, v in kept.items():
            nv = {}
            for k, st in v.items():
                m, rank, route = k.split("\u0001", 2)
                nv[f"{m}\u0001{rank}" + ("" if how == "m+rank" else "\u0001" + hashlib.sha256(route.encode()).hexdigest()[:8])] = st
            out[key] = nv
        return out
    tot["served"] += with_stems(stems)
    tot["pruned"] += with_stems(kept)
    tot["pruned+fp8"] += with_stems(rename("fp8"))
    tot["pruned+m+rank"] += with_stems(rename("m+rank"))
for k, v in tot.items():
    print(f"{k:16} {v:>12,}")
