# Per book: each source's share of the book's words where its pick 1 PRINTS on the line (the spec's definition),
# the auto-chosen second for each first (most words filled of what the first leaves; ties by row order
# STEP, MACULA, UBS, BDB), and what is left to today's line. Joined-run words (a resting unit over 2+ words) are
# counted apart: in v1 the run line stands under every source. Also, under STEP + its second at rest, how many
# single words would change from today's resting line, with examples. Measures only; writes one TSV and one JSON.
# python3 -I pairs_by_book.py <reader dir> <default-picks dir (holds v1, v1.1)> <out dir>
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SRC = ["step", "macula", "ubs", "bdb"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—|\.\s*\.\s*\.|vvv)$")
def step_text(words):
    if not words: return ""
    xs = [x.strip() for x in str(words).split("/") if x.strip()]
    if not all(SIGN.match(x) for x in xs): xs = [x for x in xs if not SIGN.match(x)]
    s = " + ".join(xs); return s[:-1] if s.endswith(".") else s
def fold(t):
    s = " ".join(str(t).replace("​", "").split()); s = s.replace(" + ", " ").replace("+", " ")
    s = " ".join(s.split()); return (s[:-1] if s.endswith(".") else s).lower()
def lines(d, book):
    st = mend.get((book, d["p"]), d.get("step") or [])
    o = {"step": step_text(st[0][4]) if st else "", "step_kind": st[0][1] if st else ""}
    mac = d.get("macula"); o["macula"] = (mac[0] or "") if mac else ""
    pcs = [p for p in (d.get("ubs") or []) if p[2]]
    ws = [str(p[2][0][2] or "").strip() for p in pcs]
    ws = [w for w in ws if w and not SIGN.match(w)]
    o["ubs"] = " + ".join(ws)
    b = d.get("bdb") or []; o["bdb"] = (b[0][5] or "") if b else ""
    return o
TOT = collections.Counter(); rows = []; eg = collections.defaultdict(list)
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    C = collections.Counter()
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for first, count, text, credit in units:
            wsn = [num[i] for i in range(first, first + count) if i in num]
            run = len(wsn) > 1
            for wn in wsn:
                d = led.get(f"{label}:{wn}")
                if not d: C["no ledger place"] += 1; continue
                C["words"] += 1
                o = lines(d, book); has = {s: bool(o[s]) for s in SRC}
                if run: C["run words"] += 1
                for s in SRC:
                    C[f"{s} any"] += has[s]
                    if not run: C[f"{s} prints"] += has[s]
                if run: continue
                for a in SRC:
                    for b in SRC:
                        if a != b and not has[a] and has[b]: C[f"fill {a} {b}"] += 1
                    C[f"left {a}"] += int(not has[a])
                    for b in SRC:
                        if a != b and not has[a] and not has[b]: C[f"left2 {a} {b}"] += 1
                # at rest: STEP's pick against today's line at single words
                t = text.replace("​", "").strip()
                if has["step"]:
                    if fold(o["step"]) != fold(t):
                        C["rest: step differs from today"] += 1
                        k = "credit " + (credit if credit in ("PIECE:TAHOT", "PIECE:MACULA") else "other")
                        C[f"rest: step differs, today {k}"] += 1
                        if len(eg[book]) < 3: eg[book].append(f"{label}:{wn} today «{t}» ({credit}) STEP «{o['step']}» kind {o['step_kind']}")
                else:
                    C["rest: step has none"] += 1
                    C["rest: step has none, today " + ("blank" if not t else "words")] += 1
                    if len(eg[book + " none"]) < 3: eg[book + " none"].append(f"{label}:{wn} today «{t}» ({credit}) MACULA «{o['macula']}» UBS «{o['ubs']}» BDB «{o['bdb']}»")
    rows.append((book, C)); TOT.update(C)
def best(C, a):
    cands = [(C[f"fill {a} {b}"], -SRC.index(b), b) for b in SRC if b != a]
    cands.sort(reverse=True)
    top = cands[0]
    ties = [c[2] for c in cands if c[0] == top[0]]
    return top[2], top[0], ties
os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "pairs-by-book.tsv"), "w") as o:
    hdr = ["book", "words", "run_words"] + [f"{s}%" for s in SRC]
    for a in SRC: hdr += [f"{a}:second", f"{a}:second%", f"{a}:left%", f"{a}:ties"]
    hdr += ["rest:step_differs", "rest:step_none", "rest:step_none_today_blank"]
    o.write("\t".join(hdr) + "\n")
    for book, C in rows + [("all-39", TOT)]:
        W = C["words"]; p = lambda x: f"{100*x/W:.2f}"
        r = [book, str(W), str(C["run words"])] + [p(C[f"{s} prints"]) for s in SRC]
        for a in SRC:
            b, n, ties = best(C, a)
            left = C[f"left {a}"] - n + C["run words"]
            r += [b if n else "-", p(n), p(left), ",".join(ties) if len(ties) > 1 else ""]
        r += [str(C["rest: step differs from today"]), str(C["rest: step has none"]), str(C["rest: step has none, today blank"])]
        o.write("\t".join(r) + "\n")
json.dump({"total": dict(sorted(TOT.items())), "examples": eg}, open(os.path.join(OUT, "pairs-by-book.json"), "w"), indent=1, ensure_ascii=True)
print("done", TOT["words"])
