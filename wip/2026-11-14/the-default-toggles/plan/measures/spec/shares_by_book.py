# The shares the row of sources would show, per book, under the spec's definitions (measures only):
#  - a word is in the toggles' reach unless it stands in a joined run (a resting unit over 2+ words) or a
#    ketiv/qere pair: those keep today's line under every source in v1;
#  - STEP's layer: today's place line where it answers (the resting unit is credited PIECE:TAHOT or PIECE:MACULA),
#    else STEP's ledger pick 1 (v1.1 mend) where it has words;
#  - MACULA: its words; UBS: each piece's pick 1, a piece that is only a sign left out, none left -> no pick;
#    BDB: pick 1's record highlight (slot 5) where it has words;
#  - the second for a first X: the source filling most of X's gaps in the book; ties by row order STEP, MACULA,
#    UBS, BDB; none when it would fill nothing.
# Also, at rest (STEP + its second): words whose line changes from today's resting line.
# python3 -I shares_by_book.py <reader dir> <default-picks dir> <out dir>
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
V1, V11 = os.path.join(L, "default-picks-v1"), os.path.join(L, "default-picks-v1.1")
mend = {}
for line in open(os.path.join(V11, "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SRC = ["step", "macula", "ubs", "bdb"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—|\.\s*\.\s*\.|vvv)$")
SIGNTOK = re.compile(r"<[^>]*>|¿|~|×|\.\s*\.\s*\.|vvv")
def fold(t):
    s = str(t).replace("​", "")
    s = SIGNTOK.sub(" ", s).replace("[", "").replace("]", "").replace("/", " ").replace("+", " ")
    s = " ".join(s.split()).lower()
    return s[:-1].strip() if s.endswith(".") else s
rows = []; TOT = collections.Counter(); eg = collections.defaultdict(list)
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    led = {}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); led[d["p"]] = d
    C = collections.Counter(); has_at = []
    for si, (label, units) in enumerate(rec["sections"]):
        words = z["sections"][si].get("words", []); num = {}; n = 0
        for i, w in enumerate(words):
            if not w.get("mark"): n += 1; num[i] = n
        for first, count, text, credit in units:
            idx = [i for i in range(first, first + count) if i in num]
            for i in idx:
                d = led.get(f"{label}:{num[i]}")
                C["words"] += 1
                if not d: C["no ledger place"] += 1; continue
                if len(idx) > 1: C["run words"] += 1; continue
                if words[i].get("kq"): C["pair words"] += 1; continue
                C["reach"] += 1
                st = mend.get((book, d["p"]), d.get("step") or [])
                place = credit in ("PIECE:TAHOT", "PIECE:MACULA")
                h = {}
                h["step"] = place or bool(st and st[0][4])
                mac = d.get("macula"); h["macula"] = bool(mac and mac[0])
                pcs = [p for p in (d.get("ubs") or []) if p[2]]
                h["ubs"] = any(str(p[2][0][2] or "").strip() and not SIGN.match(str(p[2][0][2]).strip()) for p in pcs)
                b = d.get("bdb") or []; h["bdb"] = bool(b and b[0][5])
                for s in SRC: C[f"has {s}"] += h[s]
                for a in SRC:
                    for c in SRC:
                        if a != c and not h[a] and h[c]: C[f"fill {a} {c}"] += 1
                if place: C["rest: place line"] += 1
                elif st and st[0][4]:
                    if fold(st[0][4]) != fold(text):
                        C["rest: STEP's own pick replaces a dictionary's line"] += 1
                        if len(eg[book]) < 4: eg[book].append(f"{label}:{num[i]} «{text}» ({credit}) -> STEP «{st[0][4]}»")
                    else: C["rest: same words, credit moves to STEP"] += 1
                has_at.append(h)
    # the second at rest
    def best(a):
        cand = sorted(((C[f"fill {a} {c}"], -SRC.index(c), c) for c in SRC if c != a), reverse=True)
        return (cand[0][2], cand[0][0], [x[2] for x in cand if x[0] == cand[0][0]]) if cand[0][0] else (None, 0, [])
    sec, fill, ties = best("step")
    C["rest: the second fills"] = fill
    rows.append((book, C)); TOT.update(C)
os.makedirs(OUT, exist_ok=True)
def pct(x, w): return f"{100*x/w:.2f}"
with open(os.path.join(OUT, "shares-by-book.tsv"), "w") as o:
    hdr = ["book", "words", "outside reach (runs, pairs)"]
    for a in SRC: hdr += [f"{a} %", f"{a}: second", f"second %", "left to today's line %"]
    hdr += ["rest: STEP replaces a dictionary line", "rest: credit only", "rest: second fills", "rest: words that change"]
    o.write("\t".join(hdr) + "\n")
    for book, C in rows + [("all-39", TOT)]:
        W = C["words"]; out = C["run words"] + C["pair words"] + C["no ledger place"]
        r = [book, str(W), str(out)]
        for a in SRC:
            cand = sorted(((C[f"fill {a} {c}"], -SRC.index(c), c) for c in SRC if c != a), reverse=True)
            sec = cand[0][2] if cand[0][0] else "-"
            f = cand[0][0]
            r += [pct(C[f"has {a}"], W), sec + ("=" + "/".join(x[2] for x in cand if x[0] == f and x[2] != sec) if sum(1 for x in cand if x[0] == f) > 1 and f else ""), pct(f, W), pct(W - C[f"has {a}"] - f, W)]
        ch = C["rest: STEP's own pick replaces a dictionary's line"] + C["rest: the second fills"]
        r += [str(C["rest: STEP's own pick replaces a dictionary's line"]), str(C["rest: same words, credit moves to STEP"]), str(C["rest: the second fills"]), str(ch)]
        o.write("\t".join(r) + "\n")
json.dump({"total": dict(sorted(TOT.items())), "per_book": {b: dict(sorted(c.items())) for b, c in rows}, "examples": eg}, open(os.path.join(OUT, "shares-by-book.json"), "w"), indent=1, ensure_ascii=False)
print({k: v for k, v in TOT.items() if not k.startswith("fill")})
