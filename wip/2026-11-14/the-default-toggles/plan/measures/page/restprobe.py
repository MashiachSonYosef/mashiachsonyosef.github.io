# At rest (STEP first): the places where STEP's pick 1 has no words, by today's resting-line credit, and whether the
# zone word carries TAHOT's pieces (pg) there. Measures only. python3 -I restprobe.py <reader dir> <default-picks dir>
import gzip, json, os, sys, collections
R, L = sys.argv[1:3]; V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
C = collections.Counter(); eg = []
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    words = {}; today = {}
    labels = {lab: units for lab, units in rec["sections"]}
    for sec in z["sections"]:
        n = 0; num = {}
        for i, w in enumerate(sec.get("words", [])):
            if w.get("mark"): continue
            n += 1; num[i] = n; words[f"{sec['label']}:{n}"] = w
        for first, count, text, credit in labels.get(sec["label"], []):
            for i in range(first, first + count):
                if i in num: today[f"{sec['label']}:{num[i]}"] = (text, credit, count)
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); st = mend.get((book, d["p"]), d.get("step") or [])
        if st and st[0][4]: continue
        w = words.get(d["p"]) or {}; t = today.get(d["p"])
        pg = isinstance(w.get("pg"), list) and w["pg"] and all((x or {}).get("g") for x in w["pg"])
        C["step pick 1 has no words"] += 1
        C[f"  today credit {t[1] if t else 'no unit'}"] += 1
        C[f"  zone word {'has' if pg else 'lacks'} TAHOT's glossed pieces"] += 1
        C[f"  step picks: {'none' if not st else 'pick 1 empty, later ' + ('with' if any(x[4] for x in st) else 'without') + ' words'}"] += 1
        if w.get("kq"): C["  a ketiv/qere word"] += 1
        if pg and len(eg) < 6: eg.append(f"{book} {d['p']} today «{t[0] if t else '?'}» {t[1] if t else ''} step {json.dumps(st, ensure_ascii=True)[:140]}")
for k in sorted(C): print(f"{C[k]:6d}  {k}")
for x in eg: print("eg", x)
