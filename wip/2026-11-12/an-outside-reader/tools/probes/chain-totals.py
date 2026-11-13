# The chain's counts summed over every chained book, and what kinds of card the files hold.
# python3 -I chain-totals.py <chain dir>
import gzip, json, os, sys, collections
d0 = sys.argv[1]
T = collections.Counter(); rows = collections.Counter(); raw = 0; gz = 0; pages = 0
for b in sorted(os.listdir(d0)):
    p = os.path.join(d0, b, "chain-v1.json.gz")
    if not os.path.exists(p): continue
    gz += os.path.getsize(p); pages += os.path.getsize(os.path.join(d0, b, "index.html"))
    d = json.loads(gzip.open(p).read()); raw += len(json.dumps(d))
    c = d["counts"]
    for k in ("sections", "words", "marks", "words_written_one_way_and_read_another", "pools", "distinct_fingerprints"): T[k] += c[k]
    for st in ("at_rest", "lifted"):
        for k, v in c[st].items(): T[st + " " + k] += v
    T["files asked for"] += len(d["read_off"]["files"])
    for s in d["sections"]:
        for cell in s["cells"]:
            if "mark" in cell: continue
            r, l = cell["rest"], cell["lifted"]
            for k in ("forms", "chain", "chain_words", "divisions", "blocks"):
                if k in r: rows["cards at rest with a row of " + k] += 1
            if r.get("blocks") and r["blocks"]["on"] is None: rows["cards at rest that open on a division read whole"] += 1
            if {k: v for k, v in r.items() if k not in ("pool", "on")} != {k: v for k, v in l.items() if k not in ("pool", "on")}: rows["cards whose rows or lines differ between the states"] += 1
            if r["pool"] == l["pool"]: rows["cards whose pills are the same list in both states"] += 1
            if r["pool"] is not None and r["on"] not in (0, None): rows["cards at rest whose pressed pill is not the first"] += 1
            if r["pool"] is not None and r["on"] is None: rows["cards at rest with pills and none pressed"] += 1
            if "halves" in cell: rows["pairs with a row of forms at rest"] += 1 if "forms" in r else 0
for k, v in T.items(): print(f"{v:9,d}  {k}")
for k, v in sorted(rows.items()): print(f"{v:9,d}  {k}")
print(f"{raw:,} bytes of JSON · {gz:,} gzipped · {pages:,} of pages")
