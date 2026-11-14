# At rest (STEP lit, MACULA its second by the per-book choice): the places where STEP has no pick, what today's resting
# line draws there, and what MACULA would; the one ledger row the store holds twice; the zone's ketiv/qere words.
# Measures only. python3 -I rest_fill.py <reader dir> <default-picks dir>
import gzip, json, os, sys, hashlib, collections
R, L = sys.argv[1:3]; V1 = os.path.join(L, "default-picks-v1")
C = collections.Counter(); eg = []
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rest = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    for si, sec in enumerate(z["sections"]):
        k = 0; num = {}
        for i, w in enumerate(sec.get("words", [])):
            if w.get("mark"): continue
            k += 1; num[i] = k
            if w.get("kq"): C["zone words with kq"] += 1
        label, units = rest["sections"][si]
        assert label == sec["label"]
        under = {}
        for first, count, text, credit in units:
            for i in range(first, first + count): under[i] = (text, credit, count)
        for i, n in num.items():
            d = led[f"{label}:{n}"]
            if d.get("step"): continue
            C["no step pick"] += 1
            t = under.get(i)
            mac = (d.get("macula") or [None])[0]
            if not t: C["  today: under no line"] += 1; kind = "none"
            elif not t[0].replace("​", "").strip(): C["  today: a gap"] += 1; kind = "gap"
            else: C["  today: words, credit " + t[1]] += 1; kind = "words"
            if mac: C["  MACULA has words"] += 1
            if kind == "words" and mac: C["  today's words would give way to MACULA's"] += 1
            if kind != "words" and mac: C["  an empty place MACULA fills"] += 1
            if len(eg) < 12: eg.append(f"{book} {label}:{n} today {t[0] if t else None!r} {t[1] if t else ''} -> MACULA {mac!r}")
for k in sorted(C): print(f"{C[k]:7,d} {k}")
for x in eg: print(x.encode("ascii", "backslashreplace").decode())
# the row the store holds twice
rows = [json.loads(l) for l in open(os.path.join(V1, "rows-v1.jsonl"), encoding="utf-8")]
rows += [json.loads(l) for l in open(os.path.join(L, "default-picks-v1.1", "rows-added-v1.1.jsonl"), encoding="utf-8")]
sha16 = lambda s: hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]
by = collections.defaultdict(list)
for i, r in enumerate(rows): by[hashlib.sha256(r[0].encode()).hexdigest()[:2]].append(i)
for sh, ids in by.items():
    data = json.loads(gzip.open(os.path.join(R, "data", "route-store", "shards", f"{sh}.bin")).read())
    for i in ids:
        k, rank, m, h = rows[i]
        ms = [x for x in data.get(k, []) if x[0] == rank and x[3] == m and sha16(x[1]) == h]
        if len(ms) > 1:
            print("twice: row", i, json.dumps(rows[i], ensure_ascii=True), "store rows:", json.dumps([x[:6] for x in ms], ensure_ascii=True)[:400])
