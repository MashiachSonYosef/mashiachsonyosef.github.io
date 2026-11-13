# Whether a row is told apart from every other row under its key by its source and its rank alone, in the route
# store and in each dictionary beside it. A sidecar names the rows whose stems it holds by source, rank and the whole
# route text; if source and rank are enough, the text is weight a reader's phone carries for nothing.
# python3 -I rows-named-by-source-and-rank.py <reader dir>
import collections, glob, gzip, json, os, sys

R = sys.argv[1]
stores = [("the route store", os.path.join(R, "data/route-store"))] + [(f"beside the store: {os.path.basename(d)}", d) for d in sorted(glob.glob(os.path.join(R, "data/overlays/*"))) if os.path.exists(os.path.join(d, "index.json"))]
for name, d in stores:
    keys = rows = clash_keys = clash_rows = same_rank_other_source = 0
    first = []
    for p in sorted(glob.glob(os.path.join(d, "shards", "*.bin"))):
        body = json.loads(gzip.open(p).read().decode("utf-8"))
        for k, lst in body.items():
            keys += 1; rows += len(lst)
            seen = collections.Counter((str(r[3]), r[0]) for r in lst)
            ranks = collections.Counter(r[0] for r in lst)
            bad = sum(c for c in seen.values() if c > 1)
            if bad:
                clash_keys += 1; clash_rows += bad
                if len(first) < 4: first.append(f"{k}: {[x for x, c in seen.items() if c > 1][:3]}")
            same_rank_other_source += sum(c for c in ranks.values() if c > 1)
    print(f"{name}: {keys:,} keys · {rows:,} rows · {clash_rows:,} rows share their source and rank with another row of their key, under {clash_keys:,} keys · {same_rank_other_source:,} rows share a rank with a row of any source")
    for f in first: print(f"      {f}")
