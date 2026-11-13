# How much of each book's lattice sidecar is the stems map, and what naming a row by
# m, rank and a short fingerprint of its route (in place of the route's whole text) would weigh.
import gzip, json, os, sys, hashlib
zdir = sys.argv[1]
tot_gz = tot_new = tot_raw_ids = tot_rows = tot_route_chars = 0
for f in sorted(os.listdir(zdir)):
    if not f.endswith(".lattice.bin"):
        continue
    p = os.path.join(zdir, f)
    gz = os.path.getsize(p)
    side = json.loads(gzip.decompress(open(p, "rb").read()))
    stems = side.get("stems") or {}
    rows = sum(len(v) for v in stems.values())
    route_chars = sum(len(k.split("\u0001", 2)[2]) for v in stems.values() for k in v)
    new = {}
    for key, v in stems.items():
        nv = {}
        for k, st in v.items():
            m, rank, route = k.split("\u0001", 2)
            fp = hashlib.sha256(route.encode()).hexdigest()[:8]
            nv[f"{m}\u0001{rank}\u0001{fp}"] = st
        new[key] = nv
    side2 = dict(side); side2["stems"] = new
    gz2 = len(gzip.compress(json.dumps(side2, ensure_ascii=False, separators=(",", ":")).encode(), 9))
    gz1 = len(gzip.compress(json.dumps(side, ensure_ascii=False, separators=(",", ":")).encode(), 9))
    tot_gz += gz; tot_new += gz2 - gz1 + gz; tot_rows += rows; tot_route_chars += route_chars
    print(f"{f:32} {gz:>10,} gz · stems rows {rows:>7,} · route chars {route_chars:>10,} · with fingerprints {gz2 - gz1 + gz:>10,}")
print(f"{'all':32} {tot_gz:>10,} gz · stems rows {tot_rows:>7,} · route chars {tot_route_chars:>10,} · with fingerprints {tot_new:>10,}  ({tot_gz - tot_new:,} less)")
