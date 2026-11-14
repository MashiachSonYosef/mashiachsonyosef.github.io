# Critic's own measure: places where STEP has no pick, ketiv/qere among them, runs among them, what fills;
# STEP pick 1 kinds; BDB fill of STEP's gaps; UBS "NO DATA YET"; ties for STEP's second. Measures only.
# python3 -I verify_rest.py <reader dir> <default-picks dir>
import gzip, json, os, sys, collections
R, L = sys.argv[1:3]; V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = set("-—~X×+¿")
def ubs_line(u):
    parts = []
    for piece in (u or []):
        picks = piece[2]
        if not picks: continue
        w = picks[0][2]
        if not w or w.strip() in SIGN: continue
        parts.append(w)
    return " + ".join(parts) if parts else None
def bdb_line(b):
    return (b[0][5] or None) if b else None
C = collections.Counter(); ex = collections.defaultdict(list); ties = []
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    kq = set(); today = {}
    for si, sec in enumerate(z["sections"]):
        k = 0; num = {}
        for i, w in enumerate(sec.get("words", [])):
            if w.get("mark"): continue
            k += 1; num[i] = k
            if w.get("kq"): kq.add(f"{sec['label']}:{k}")
        label, units = rec["sections"][si]
        for first, count, text, credit in units:
            for i in range(first, first + count):
                if i in num: today[f"{label}:{num[i]}"] = (text, credit, count)
    fm = fu = 0
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); p = d["p"]
        st = mend.get((book, p), d.get("step") or [])
        if st: C["step pick1 kind " + st[0][1]] += 1
        if st and not st[0][4]: C["step pick1 no words"] += 1
        has = bool(st and st[0][4])
        if has: continue
        C["no step line pick"] += 1
        mac = (d.get("macula") or [None])[0] if d.get("macula") else None
        ub = ubs_line(d.get("ubs")); bd = bdb_line(d.get("bdb"))
        if mac: fm += 1
        if ub: fu += 1
        if bd: C["  BDB has a line where STEP has none"] += 1
        if p in kq: C["  kq"] += 1; continue
        t = today.get(p)
        if t and t[2] > 1: C["  under a unit over >1 word"] += 1
        if mac:
            C["  MACULA fills (not kq)"] += 1
            if not t or not t[0].replace("​", "").strip(): C["    today bare"] += 1
            elif t[0].replace(" + ", " ").lower() == mac.lower(): C["    same words folded"] += 1
            else: C["    words change"] += 1; ex[book].append((p, t[0], t[1], mac))
        else: C["  neither STEP nor MACULA (not kq)"] += 1
    if fm or fu:
        if fm == fu: ties.append(book)
    C["books with MACULA fill>0"] += int(fm > 0)
for k in sorted(C): print(f"{C[k]:8,d} {k}")
print("STEP second ties MACULA=UBS (fill>0):", len(ties), ties)
for b in ["ruth", "psalms", "isaiah", "jeremiah", "daniel"]:
    for e in ex.get(b, [])[:2]: print(b, json.dumps(e, ensure_ascii=True))
