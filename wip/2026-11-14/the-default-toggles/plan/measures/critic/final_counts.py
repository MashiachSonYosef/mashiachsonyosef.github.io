# Critic: the merged plan's counting rule, per book, over all 39 books. Measures only; writes one TSV.
#   STEP has a line  = STEP's pick 1 has words, or the zone's place pieces all carry words (the place reading)
#   MACULA / UBS / BDB have a line = the word is not ketiv/qere, and:
#     MACULA: macula[0] non-empty; UBS: some piece's pick 1 has a letter or digit; BDB: pick 1's record highlight (slot 5) non-empty
#   fills[x][y] = places where x has none and y has one; auto second = arg max, ties by STEP, MACULA, UBS, BDB; none if 0
# python3 -I final_counts.py <reader dir> <default-picks dir> <out tsv>
import gzip, json, os, sys, collections, unicodedata
R, L, OUT = sys.argv[1:4]; V1 = os.path.join(L, "default-picks-v1")
ORDER = ["step", "macula", "ubs", "bdb"]
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
wordy = lambda s: any(unicodedata.category(c)[0] in "LN" for c in str(s or ""))
signs = collections.Counter(); nodata = 0
rows = []; tot = collections.Counter(); totf = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    W = {}
    for sec in z["sections"]:
        k = 0
        for w in sec.get("words", []):
            if w.get("mark"): continue
            k += 1; W[f"{sec['label']}:{k}"] = w
    has = collections.Counter(); fills = collections.Counter(); P = 0; kq = 0; left = collections.Counter()
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); p = d["p"]; w = W[p]; P += 1
        isk = bool(w.get("kq")); kq += isk
        st = mend.get((book, p), d.get("step") or [])
        pg = w.get("pg") or []
        h = {"step": bool(st and st[0][4]) or (bool(pg) and all(str((x or {}).get("g") or "").strip() for x in pg))}
        mac = (d.get("macula") or [None])[0] if d.get("macula") else None
        h["macula"] = (not isk) and bool(mac)
        ub = False
        for piece in d.get("ubs") or []:
            if piece[2]:
                t = piece[2][0][2]
                if wordy(t): ub = True
                else: signs[t] += 1
                if t == "NO DATA YET": nodata += 1
        h["ubs"] = (not isk) and ub
        b = d.get("bdb") or []
        h["bdb"] = (not isk) and bool(b and b[0][5])
        for s in ORDER: has[s] += h[s]
        for x in ORDER:
            if h[x]: continue
            for y in ORDER:
                if y != x and h[y]: fills[(x, y)] += 1
    for s in ORDER: tot[s] += has[s]
    for k, v in fills.items(): totf[k] += v
    row = [book, P, kq]
    for x in ORDER:
        best = None
        for y in ORDER:
            if y == x: continue
            if fills[(x, y)] > 0 and (best is None or fills[(x, y)] > fills[(x, best)]): best = y
        tie = best and any(fills[(x, y)] == fills[(x, best)] for y in ORDER if y not in (x, best))
        b_ = fills[(x, best)] if best else 0
        row += [has[x], best or "-", b_, "tie" if tie else "", P - has[x] - b_, " ".join(f"{y}:{fills[(x, y)]}" for y in ORDER if y != x)]
    rows.append(row)
hdr = ["book", "places", "kq"] + [f"{x}_{c}" for x in ORDER for c in ("has", "second", "fills", "tie", "left", "all_fills")]
with open(OUT, "w") as o:
    o.write("\t".join(hdr) + "\n")
    for r in rows: o.write("\t".join(map(str, r)) + "\n")
P = sum(r[1] for r in rows)
print("places", P, "kq", sum(r[2] for r in rows))
for x in ORDER:
    i = 3 + ORDER.index(x) * 6
    sec = collections.Counter(r[i + 1] for r in rows); ties = sum(1 for r in rows if r[i + 3])
    print(f"{x}: has {tot[x]} ({100*tot[x]/P:.2f}%) second by book {dict(sec)} ties {ties} fills " + " ".join(f"{y}:{totf[(x, y)]}" for y in ORDER if y != x) + f" left-after-auto {sum(r[i+4] for r in rows)}")
print("UBS pick-1 texts with no letter or digit:", signs.most_common(12), "NO DATA YET pick-1:", nodata)
