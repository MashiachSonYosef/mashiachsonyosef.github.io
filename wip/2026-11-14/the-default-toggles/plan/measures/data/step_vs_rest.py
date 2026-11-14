# STEP's pick 1 (spanJoin'd) against today's resting line where the line is one word credited PIECE:TAHOT: which
# differences are there, by kind. Measures only. python3 -I step_vs_rest.py <reader dir> <default-picks dir> <books...>
import gzip, json, os, re, sys, collections
R, L = sys.argv[1:3]; books = sys.argv[3:]
V1 = os.path.join(L, "default-picks-v1")
def spanJoin(t):
    s = " + ".join(x.strip() for x in str(t).split("/") if x.strip()); return s[:-1] if s.endswith(".") else s
C = collections.Counter(); eg = collections.defaultdict(list)
for book in books:
    byp = {json.loads(l)["p"]: json.loads(l) for l in open(os.path.join(V1, f"{book}.jsonl"), encoding="utf-8")}
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rest = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    for si, (label, units) in enumerate(rest["sections"]):
        words = z["sections"][si].get("words", []); num = {}; k = 0
        for i, w in enumerate(words):
            if not w.get("mark"): k += 1; num[i] = k
        for first, count, text, credit in units:
            ws = [num[i] for i in range(first, first + count) if i in num]
            if credit != "PIECE:TAHOT" or len(ws) != 1: continue
            d = byp[f"{label}:{ws[0]}"]; st = d.get("step") or []
            if not st: continue
            w = words[first]
            pgj = "/".join(p.get("g", "") for p in w.get("pg", []))
            s = spanJoin(st[0][4])
            C["units"] += 1
            C["ledger words == '/'.join(pg g)"] += int(st[0][4] == pgj)
            if s == text: C["same"] += 1; continue
            t2 = text.replace("​", "")
            if s.replace(" ", "") == t2.replace(" ", "").replace("+", "").replace(" ", "") or s.replace(" + ", "").replace(" ", "") == t2.replace(" + ", "").replace(" ", ""):
                k2 = "differ only by joiners/spaces"
            elif "​" in text: k2 = "resting holds a zero-width gap"
            else: k2 = "other"
            C[k2] += 1
            if len(eg[k2]) < 8: eg[k2].append(f"{book} {label}:{ws[0]} step«{st[0][4]}» join«{s}» rest«{text!r}»")
for k in sorted(C): print(f"{C[k]:8,d} {k}")
for k, v in eg.items():
    for x in v: print(k, "|", x)
