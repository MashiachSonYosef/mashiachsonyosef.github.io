# Each source's share of a book's word places with a pick of its own (v1, STEP mended by v1.1), and how much of the
# rest each other source fills. python3 -I coverage.py <ledger dir default-picks/> <out tsv>
import json, os, sys
D, OUT = sys.argv[1], sys.argv[2]
mend = {}
for line in open(os.path.join(D, "default-picks-v1.1", "step-mend-v1.1.jsonl"), encoding="utf-8"):
    d = json.loads(line); mend[(d["book"], d["p"])] = d["step"]
SRC = ["step", "macula", "ubs", "bdb"]
def has(d, src, book):
    if src == "step":
        st = mend.get((book, d["p"]), d.get("step") or [])
        return any(x[1] == "r" and x[4] for x in st) or any(x[4] for x in st)
    if src == "macula":
        m = d.get("macula"); return bool(m and m[0])
    if src == "ubs":
        return any(piece[2] for piece in (d.get("ubs") or []))
    if src == "bdb":
        return any((x[5] or x[3]) for x in (d.get("bdb") or []))
tot = {s: 0 for s in SRC}; pair = {(a, b): 0 for a in SRC for b in SRC if a != b}; N = 0
rows = []
for f in sorted(os.listdir(os.path.join(D, "default-picks-v1"))):
    if not f.endswith(".jsonl") or f == "rows-v1.jsonl": continue
    book = f[:-6]; n = 0; c = {s: 0 for s in SRC}; pc = {k: 0 for k in pair}
    for line in open(os.path.join(D, "default-picks-v1", f), encoding="utf-8"):
        d = json.loads(line); n += 1
        h = {s: has(d, s, book) for s in SRC}
        for s in SRC: c[s] += h[s]
        for (a, b) in pair:
            if not h[a] and h[b]: pc[(a, b)] += 1
    N += n
    for s in SRC: tot[s] += c[s]
    for k in pair: pair[k] += pc[k]
    rows.append((book, n, c, pc))
with open(OUT, "w") as o:
    o.write("book\tplaces\t" + "\t".join(SRC) + "\n")
    for book, n, c, pc in rows: o.write(f"{book}\t{n}\t" + "\t".join(f"{100*c[s]/n:.1f}" for s in SRC) + "\n")
print(f"all 39 books, {N} places: " + " · ".join(f"{s} {100*tot[s]/N:.1f}%" for s in SRC))
for a in SRC:
    rest = N - tot[a]
    print(f"  {a} first ({100*tot[a]/N:.1f}%); of the other {100*rest/N:.1f}%: " + " · ".join(f"{b} fills {100*pair[(a,b)]/N:.1f}% (left {100*(rest-pair[(a,b)])/N:.1f}%)" for b in SRC if b != a))
