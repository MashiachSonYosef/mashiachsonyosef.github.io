# The two-source line, measured over the 39 books with the line's own predicate (a pick prints on the line where
# STEP's pick 1 has words; MACULA's joined words are not empty; UBS's first pick of a piece is not a sign alone;
# BDB's pick 1 carries its record's highlighted words, slot 5). Per book: each source's share, the second source
# that fills the most of what each first source leaves (ties broken by the pill order step, macula, ubs, bdb), what
# both leave; ketiv/qere places counted apart; and at rest (STEP first) the places a second source would change,
# with today's resting line there. Measures only. v1 with the v1.1 mend.
# python3 -I fills.py <reader dir> <default-picks dir> <out tsv>
import gzip, json, os, re, sys, collections
R, L, OUT = sys.argv[1:4]
V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
SRC = ["step", "macula", "ubs", "bdb"]
def has(d, s, book):
    if s == "step":
        st = mend.get((book, d["p"]), d.get("step") or []); return bool(st and st[0][4])
    if s == "macula":
        m = d.get("macula"); return bool(m and m[0])
    if s == "ubs":
        pcs = [p for p in (d.get("ubs") or []) if p[2]]
        return bool(pcs) and not all(SIGN.match(str(p[2][0][2]).strip()) for p in pcs)
    b = d.get("bdb") or []; return bool(b and b[0][5])
T = collections.Counter(); rows = []; rest_eg = []; secondT = collections.Counter()
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]
    z = json.loads(gzip.open(os.path.join(R, "data", "zones", f"{book}.bin")).read())
    rec = json.loads(gzip.open(os.path.join(R, "data", "resting-lines", f"{book}.json.gz")).read())
    kq = set(); today = {}
    for si, sec in enumerate(z["sections"]):
        n = 0; num = {}
        for i, w in enumerate(sec.get("words", [])):
            if w.get("mark"): continue
            n += 1; num[i] = n
            if w.get("kq"): kq.add(f"{sec['label']}:{n}")
        label, units = rec["sections"][si]
        for first, count, text, credit in units:
            for i in range(first, first + count):
                if i in num: today[f"{label}:{num[i]}"] = (text, credit, count)
    N = 0; c = collections.Counter(); pair = collections.Counter(); kqn = 0; restwho = collections.Counter()
    H = []
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); N += 1
        if d["p"] in kq: kqn += 1
        h = {s: has(d, s, book) for s in SRC}; H.append((d["p"], h))
        for s in SRC: c[s] += h[s]
        for a in SRC:
            for b in SRC:
                if a != b and not h[a] and h[b]: pair[(a, b)] += 1
    second = {}
    for a in SRC:
        best = max((b for b in SRC if b != a), key=lambda b: (pair[(a, b)], -SRC.index(b)))
        second[a] = best if pair[(a, best)] else None
        secondT[(a, second[a])] += 1
    # at rest: STEP first, its second where STEP leaves
    for p, h in H:
        if not h["step"] and second["step"] and h[second["step"]]:
            restwho[second["step"]] += 1
            t = today.get(p)
            T[f"at rest: changed where today's line is {'bare' if t and not t[0].replace(chr(8203),'').strip() else 'a run line' if t and t[2] > 1 else 'a word line' if t else 'unknown'}"] += 1
            if len(rest_eg) < 8: rest_eg.append(f"{book} {p} today «{(t or ('?',))[0]}» ({(t or ('','?'))[1]}) -> {second['step']}")
    T["places"] += N; T["kq places"] += kqn
    for s in SRC: T[s] += c[s]
    for k, v in pair.items(): T[k] += v
    rows.append((book, N, c, pair, second, sum(restwho.values()), kqn))
with open(OUT, "w") as o:
    o.write("book\tplaces\tkq\t" + "\t".join(f"{s}%" for s in SRC) + "\t" + "\t".join(f"{s}->second(fills%,left%)" for s in SRC) + "\tat_rest_changed\n")
    for book, N, c, pair, second, rc, kqn in rows:
        cells = []
        for a in SRC:
            b = second[a]
            cells.append(f"{b}({100*pair[(a,b)]/N:.2f},{100*(N-c[a]-pair[(a,b)])/N:.2f})" if b else f"-(0,{100*(N-c[a])/N:.2f})")
        o.write(f"{book}\t{N}\t{kqn}\t" + "\t".join(f"{100*c[s]/N:.2f}" for s in SRC) + "\t" + "\t".join(cells) + f"\t{rc}\n")
N = T["places"]
print(f"places {N}  kq {T['kq places']}")
for s in SRC: print(f"  {s} first {100*T[s]/N:.2f}%: " + " · ".join(f"{b} fills {100*T[(s,b)]/N:.2f}% (left {100*(N-T[s]-T[(s,b)])/N:.2f}%)" for b in SRC if b != s))
print("second chosen per book:", dict(secondT))
for k in sorted(k for k in T if isinstance(k, str) and k.startswith("at rest")): print(f"  {T[k]:6d}  {k}")
for x in rest_eg: print("  eg", x)
