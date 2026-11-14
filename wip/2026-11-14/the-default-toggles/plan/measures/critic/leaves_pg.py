# Critic: at the places STEP has no pick (ketiv/qere left out), does the zone's place reading answer (every piece
# glossed), whose pieces are they, and what today's resting line credits there. Measures only.
# python3 -I leaves_pg.py <reader dir> <default-picks dir>
import gzip, json, os, sys, collections
R, L = sys.argv[1:3]; V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
C = collections.Counter(); per = collections.Counter(); per_all = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    W = {}; today = {}
    for si, sec in enumerate(z["sections"]):
        k = 0; num = {}
        for i, w in enumerate(sec.get("words", [])):
            if w.get("mark"): continue
            k += 1; num[i] = k; W[f"{sec['label']}:{k}"] = w
        label, units = rec["sections"][si]
        for first, count, text, credit in units:
            for i in range(first, first + count):
                if i in num: today[f"{label}:{num[i]}"] = (text, credit, count)
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); p = d["p"]; st = mend.get((book, p), d.get("step") or [])
        if st and st[0][4]: continue
        w = W[p]
        if w.get("kq"): continue
        pg = w.get("pg") or []
        full = bool(pg) and all(str((x or {}).get("g") or "").strip() for x in pg)
        srcs = "+".join(sorted({str((x or {}).get("s")) for x in pg})) if pg else "-"
        t = today.get(p); cr = t[1] if t else "bare"
        mac = (d.get("macula") or [None])[0] if d.get("macula") else None
        C[f"pg full={full} srcs={srcs} today={cr if cr.startswith('PIECE') else 'other/bare'} macula={'y' if mac else 'n'}"] += 1
        if mac and not full:
            per[book] += 1
            if not t or not t[0].replace("\u200b", "").strip(): C["  212: today bare"] += 1
            elif t[0].replace(" + ", " ").lower() == mac.lower(): C["  212: same words folded, credit moves"] += 1
            else: C["  212: words change"] += 1; C["  212: words change, today " + cr] += 1
        if mac: per_all[book] += 1
for k in sorted(C): print(f"{C[k]:6,d} {k}")
print("fills where the place reading does not answer:", sum(per.values()), "in", len(per), "books")
print("all non-kq MACULA fills:", sum(per_all.values()), "in", len(per_all), "books")
print("by book:", " ".join(f"{b} {per[b]}" for b in sorted(per)))
