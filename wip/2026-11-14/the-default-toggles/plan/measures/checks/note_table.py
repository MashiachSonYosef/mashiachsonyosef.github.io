# The note under each first source, per book, as a check would recompute it from the ledger alone: the first
# source's share of the book's places where its pick gives a line, the second source chosen (most places filled of
# what the first leaves; a tie goes to the earlier pill in the row's order STEP, MACULA, UBS, BDB; a second that
# fills nothing is not chosen), its share, and what both leave. Two readings of "a pick": LINE (what the line can
# print: STEP pick 1 with words, MACULA words, UBS first picks not a sign alone, BDB slot 5 highlight) and ANY
# (coverage.py's reading, which the owner's numbers of 14 November used). Shares in tenths of a percent, floored,
# the rest the remainder so the three sum to 100.0. Measures only.
# python3 -I note_table.py <default-picks dir> <out tsv>
import json, os, re, sys
L, OUT = sys.argv[1], sys.argv[2]
V1 = os.path.join(L, "default-picks-v1")
mend = {}
for line in open(os.path.join(L, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
UBS_SIGN = re.compile(r"^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+|-|—)$")
SRC = ("step", "macula", "ubs", "bdb")
def line_has(d, book):
    st = mend.get((book, d["p"]), d.get("step") or [])
    m = d.get("macula"); pcs = [p for p in (d.get("ubs") or []) if p[2]]; b = d.get("bdb") or []
    return {"step": bool(st and st[0][4]), "macula": bool(m and m[0]),
            "ubs": bool(pcs) and not all(UBS_SIGN.match(str(p[2][0][2]).strip()) for p in pcs),
            "bdb": bool(b and b[0][5])}
def any_has(d, book):  # coverage.py's has()
    st = mend.get((book, d["p"]), d.get("step") or [])
    m = d.get("macula")
    return {"step": any(x[4] for x in st), "macula": bool(m and m[0]),
            "ubs": any(piece[2] for piece in (d.get("ubs") or [])),
            "bdb": any((x[5] or x[3]) for x in (d.get("bdb") or []))}
def tenths(a, n): return (1000 * a) // n
rows = []; tot = {"LINE": {}, "ANY": {}}
for f in sorted(os.listdir(V1)):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]; N = 0
    cnt = {k: {s: 0 for s in SRC} for k in ("LINE", "ANY")}
    fill = {k: {(a, b): 0 for a in SRC for b in SRC if a != b} for k in ("LINE", "ANY")}
    for l in open(os.path.join(V1, f), encoding="utf-8"):
        d = json.loads(l); N += 1
        for k, fn in (("LINE", line_has), ("ANY", any_has)):
            h = fn(d, book)
            for s in SRC: cnt[k][s] += h[s]
            for (a, b) in fill[k]:
                if not h[a] and h[b]: fill[k][(a, b)] += 1
    for k in ("LINE", "ANY"):
        for a in SRC:
            best = max((fill[k][(a, b)], -SRC.index(b), b) for b in SRC if b != a)
            tied = [b for b in SRC if b != a and fill[k][(a, b)] == best[0]]
            second = best[2] if best[0] > 0 else ""
            fa, fb = tenths(cnt[k][a], N), tenths(best[0], N) if second else 0
            rest = 1000 - fa - fb
            rows.append((k, book, N, a, cnt[k][a], second, best[0] if second else 0, N - cnt[k][a] - (best[0] if second else 0),
                         f"{fa/10:.1f}", f"{fb/10:.1f}", f"{rest/10:.1f}", "/".join(tied) if len(tied) > 1 else ""))
            t = tot[k].setdefault(a, {"N": 0, "first": 0, "fills": {}})
            t["N"] += N; t["first"] += cnt[k][a]
            for b in SRC:
                if b != a: t["fills"][b] = t["fills"].get(b, 0) + fill[k][(a, b)]
with open(OUT, "w") as o:
    o.write("reading\tbook\tplaces\tfirst\tfirst_places\tsecond\tsecond_fills\tleft\tfirst_pct\tsecond_pct\tleft_pct\ttied\n")
    for r in rows: o.write("\t".join(str(x) for x in r) + "\n")
for k in ("LINE", "ANY"):
    for a, t in tot[k].items():
        print(k, a, f"first {100*t['first']/t['N']:.2f}%", " · ".join(f"{b} fills {100*v/t['N']:.2f}%" for b, v in t["fills"].items()))
