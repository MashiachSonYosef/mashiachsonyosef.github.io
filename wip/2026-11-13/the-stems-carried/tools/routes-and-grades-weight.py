# Of the lattice sidecars: how much the per-card grade strings (grades[s].g) weigh, and how many of the lattice's
# card fingerprints (routes[k].f) no row of the store under that key prints (fnv1a-32 over the UTF-16 code units of
# "<route>|<source label>", as the page computes it), with what dropping those would save if nothing else read them.
# It measures; it changes nothing.
# python3 -I routes-and-grades-weight.py <reader dir>
import gzip, json, os, sys, hashlib, collections
R = sys.argv[1]
zdir = os.path.join(R, "data", "zones")
ix = json.load(open(os.path.join(R, "data", "route-store", "index.json"), encoding="utf-8"))
labels = {m: (v or {}).get("label", "") for m, v in ix["m_sources"].items()}
def fnv1a(s):
    h = 0x811c9dc5
    b = s.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xffffffff
    return f"{h:08x}"
shard_cache = {}
def rows_of(k):
    sh = hashlib.sha256(k.encode("utf-8")).hexdigest()[:2]
    if sh not in shard_cache:
        shard_cache[sh] = json.loads(gzip.decompress(open(os.path.join(R, "data", "route-store", "shards", f"{sh}.bin"), "rb").read()))
    return shard_cache[sh].get(k) or []
def gz(obj):
    return len(gzip.compress(json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode(), 9))
T = collections.Counter()
for f in sorted(os.listdir(zdir)):
    if not f.endswith(".lattice.bin"): continue
    side = json.loads(gzip.decompress(open(os.path.join(zdir, f), "rb").read()))
    whole = gz(side)
    no_g = dict(side); no_g["grades"] = {s: {k: v for k, v in g.items() if k != "g"} for s, g in side["grades"].items()}
    T["whole"] += whole; T["without g"] += gz(no_g)
    matched = {}
    for k, r in side["routes"].items():
        fps = {fnv1a(f"{row[1]}|{labels.get(row[3], '')}") for row in rows_of(k) if row[3] in labels}
        keep = [i for i, fp in enumerate(r["f"]) if fp in fps]
        T["cards"] += len(r["f"]); T["cards a store row prints"] += len(keep)
    T["books"] += 1
for k, v in T.items():
    print(f"{v:>14,}  {k}")
