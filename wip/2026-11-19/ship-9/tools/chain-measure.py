# Readings at rest per card, live against the new tree, from the chain books' own counts and cells (read-only).
import gzip, json, os, sys, statistics
OLD, NEW = sys.argv[1], sys.argv[2]
tot = {"old": [0, 0, 0], "new": [0, 0, 0]}
per_old, per_new = [], []
for book in sorted(os.listdir(os.path.join(NEW, "chain"))):
    po, pn = os.path.join(OLD, "chain", book, "chain-v1.json.gz"), os.path.join(NEW, "chain", book, "chain-v1.json.gz")
    if not (os.path.exists(po) and os.path.exists(pn)): continue
    a, b = json.load(gzip.open(po)), json.load(gzip.open(pn))
    ca, cb = a["counts"]["at_rest"], b["counts"]["at_rest"]
    print(f"{book:10} words {a['counts']['words']:6} · links at rest {ca['links']:7} → {cb['links']:7} · cards printing none {ca['words_whose_card_prints_none']} → {cb['words_whose_card_prints_none']}")
    for k, c in (("old", ca), ("new", cb)):
        tot[k][0] += c["links"]; tot[k][1] += c["words_whose_card_prints_none"]
    for rec, out in ((a, per_old), (b, per_new)):
        for sec in rec["sections"]:
            for cell in sec.get("cells", []):
                r = cell.get("rest") if isinstance(cell, dict) else None
                if isinstance(r, dict) and isinstance(r.get("pool"), int):
                    out.append(len(rec["pools"][r["pool"]]))
print("totals", tot)
for name, xs in (("live", per_old), ("new", per_new)):
    if xs:
        xs.sort()
        print(name, "cards", len(xs), "median", statistics.median(xs), "p90", xs[int(len(xs) * 0.9)], "zero", sum(1 for x in xs if x == 0))
