# One verse's line under each first source with its auto second (STEP for MACULA, UBS, BDB; for STEP, the book's
# second), by the spec's tiers: 1 the first prints, 2 the second fills, 0 today's line, out (run or pair).
# Measures only. python3 -I verse_under_each.py <reader dir> <default-picks dir> <shares-by-book.json> <book> <ch:v> [...]
import gzip, json, os, re, sys
R, L, S, book = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line)
    if d["book"] == book: mend[d["p"]] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—|\.\s*\.\s*\.|vvv)$")
SRC = ["step", "macula", "ubs", "bdb"]; NAME = {"step": "STEP", "macula": "MACULA", "ubs": "UBS", "bdb": "BDB"}
C = json.load(open(S))["per_book"][book]
def second(a):
    f = {b: C.get(f"fill {a} {b}", 0) for b in SRC if b != a}; m = max(f.values())
    return next((b for b in SRC if b != a and f[b] == m), None) if m else None
rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
led = {}
for l in open(os.path.join(V1, f"{book}.jsonl"), encoding="utf-8"):
    d = json.loads(l); led[d["p"]] = d
def lines(d, credit, text):
    st = mend.get(d["p"], d.get("step") or [])
    o = {}
    if credit in ("PIECE:TAHOT", "PIECE:MACULA"): o["step"] = text
    elif st and st[0][4]: o["step"] = " + ".join(x.strip() for x in st[0][4].split("/") if x.strip())
    mac = d.get("macula"); o["macula"] = (mac[0] or "") if mac else ""
    pcs = [p for p in (d.get("ubs") or []) if p[2]]
    ws = [str(p[2][0][2] or "").strip() for p in pcs]; o["ubs"] = " + ".join(w for w in ws if w and not SIGN.match(w))
    b = d.get("bdb") or []
    o["bdb"] = (str(b[0][5]).split(" / ")[0] + f" · sense {b[0][2]}") if b and b[0][5] else ""
    return o
for cv in sys.argv[5:]:
    for si, (label, units) in enumerate(rec["sections"]):
        if label != cv: continue
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        print(f"== {book} {cv}")
        print("word | today | " + " | ".join(f"{NAME[a]}+{NAME.get(second(a), '-') if second(a) else '-'}" for a in SRC))
        for first, count, text, credit in units:
            idx = [i for i in range(first, first + count) if i in num]
            for i in idx:
                d = led[f"{label}:{num[i]}"]; o = lines(d, credit, text)
                out = len(idx) > 1 or bool(words[i].get("kq"))
                cells = []
                for a in SRC:
                    b = second(a)
                    if out: cells.append(f"_{text}_ (out)")
                    elif o[a]: cells.append(o[a])
                    elif b and o[b]: cells.append(f"{o[b]} [{NAME[b]}]")
                    else: cells.append(f"_{text}_")
                print(f"{num[i]} | {text} ({credit}) | " + " | ".join(cells))
