# Moses's v185.1 word-sense rows against the served Jastrow overlay: each row found by its key, rank and m id in
# the overlay's own shard, and its route and def compared. It reads; it changes nothing.
# python3 -I word-senses-against-the-overlay.py <word-senses-v1.jsonl> <overlay dir>
import collections, gzip, hashlib, json, os, sys
L, O = sys.argv[1], sys.argv[2]
shards = {}
def rows_of(k):
    sh = hashlib.sha256(k.encode("utf-8")).hexdigest()[:2]
    if sh not in shards:
        p = os.path.join(O, "shards", f"{sh}.bin")
        shards[sh] = json.loads(gzip.open(p).read().decode("utf-8")) if os.path.exists(p) else {}
    d = shards[sh]
    got = d.get(k) if isinstance(d, dict) else None
    if got is None and isinstance(d, dict) and "keys" in d: got = d["keys"].get(k)
    return got
T = collections.Counter(); ex = []
first = True
for line in open(L, encoding="utf-8"):
    r = json.loads(line)
    T[f"rows {r['branch']}"] += 1
    got = rows_of(r["k"])
    if first:
        first = False
        print("shard entry shape:", type(got).__name__, json.dumps(got, ensure_ascii=False)[:300] if got is not None else None)
    if got is None: T[f"  {r['branch']}: key not in the overlay"] += 1; continue
    rows = got.get("routes", got) if isinstance(got, dict) else got
    hit = [x for x in rows if isinstance(x, list) and len(x) > 3 and x[0] == r["rank"] and x[3] == r["m"]]
    if not hit: T[f"  {r['branch']}: no row of that rank and m"] += 1; ex.append(("missing", r["k"], r["rank"], r["m"])); continue
    x = hit[0]
    if x[1] == r["route"] and x[2] == r["def"]: T[f"  {r['branch']}: found, route and def the same"] += 1
    else: T[f"  {r['branch']}: found, route or def differs"] += 1; ex.append(("differs", r["k"], r["rank"], x[1][:40], r["route"][:40]))
for k, v in sorted(T.items()): print(f"{v:>7,}  {k}")
for e in ex[:8]: print("  e.g.", e)
