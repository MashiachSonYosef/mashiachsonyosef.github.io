# At rest under the owner's design (STEP first, its second chosen per book): the lines that would change, ketiv/qere
# words left out (they keep today's line), by today's resting-line credit. Measures only.
# python3 -I restchange.py <reader dir> <default-picks dir> <fills tsv from fills.py>
import gzip, json, os, sys, collections
R, L, F = sys.argv[1:4]; V1 = os.path.join(L, "default-picks-v1")
second = {}
for i, line in enumerate(open(F)):
    if i == 0: continue
    c = line.rstrip("\n").split("\t"); s = c[7].split("(")[0]; second[c[0]] = None if s == "-" else s
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
C = collections.Counter(); books = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]; s2 = second.get(book)
    if not s2: continue
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    labels = {lab: units for lab, units in rec["sections"]}; words = {}; today = {}
    for sec in z["sections"]:
        n = 0; num = {}
        for i, w in enumerate(sec.get("words", [])):
            if w.get("mark"): continue
            n += 1; num[i] = n; words[f"{sec['label']}:{n}"] = w
        for first, count, text, credit in labels.get(sec["label"], []):
            for i in range(first, first + count):
                if i in num: today[f"{sec['label']}:{num[i]}"] = (text, credit)
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); st = mend.get((book, d["p"]), d.get("step") or [])
        if st and st[0][4]: continue
        m = d.get("macula") if s2 == "macula" else None
        if not (m and m[0]): continue
        if words.get(d["p"], {}).get("kq"): C["ketiv/qere, keeps today's line"] += 1; continue
        t = today.get(d["p"]); C["changes"] += 1; books[book] += 1
        C[f"  today: {'bare (no line)' if not t else t[1]}"] += 1
        C["  same words as today (folded)"] += int(bool(t) and t[0].replace(' + ', ' ').lower() == m[0].lower())
for k in sorted(C): print(f"{C[k]:5d}  {k}")
print("books", len(books), dict(books.most_common(6)))
