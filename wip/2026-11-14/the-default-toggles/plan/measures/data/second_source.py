# The second source per first source per book, from measure_defaults.py's measures.json: the source that fills the most
# of the places the first leaves without a line pick; a tie goes to the earlier in the pill order STEP, MACULA, UBS, BDB.
# Writes second-source-by-book.tsv and prints the 39-book totals. python3 -I second_source.py <measures.json> <out tsv>
import json, sys
M = json.load(open(sys.argv[1])); OUT = sys.argv[2]
SRC = ["step", "macula", "ubs", "bdb"]; NAME = {"step": "STEP", "macula": "MACULA", "ubs": "UBS", "bdb": "BDB"}
def pct(a, n): return f"{100 * a / n:.2f}"
rows = []; ties = []
books = sorted(M["per_book"]) + ["ALL 39"]
for b in books:
    B = M["total"] if b == "ALL 39" else M["per_book"][b]; n = B["places"]
    for a in SRC:
        own = B.get(f"line {a}", 0); rest = n - own
        fills = {c: B.get(f"fill {a}>{c}", 0) for c in SRC if c != a}
        best = max(fills.values())
        top = [c for c in SRC if c != a and fills[c] == best]
        if len(top) > 1 and best > 0: ties.append((b, a, top, best))
        second = top[0] if best > 0 else None
        left = rest - (fills[second] if second else 0)
        rows.append([b, n, NAME[a], own, pct(own, n), rest, NAME[second] if second else "-", fills[second] if second else 0,
                     pct(fills[second] if second else 0, n), left, pct(left, n)] +
                    [f"{NAME[c]} {fills[c]}" for c in SRC if c != a])
with open(OUT, "w") as o:
    o.write("book\tplaces\tfirst\tfirst_places\tfirst_pct\tleft_by_first\tsecond\tsecond_fills\tsecond_pct\tleft_by_both\tleft_pct\tfill_a\tfill_b\tfill_c\n")
    for r in rows: o.write("\t".join(str(x) for x in r) + "\n")
for r in rows:
    if r[0] == "ALL 39": print(r)
print("ties", ties)
from collections import Counter
for a in SRC:
    c = Counter(r[6] for r in rows if r[2] == NAME[a] and r[0] != "ALL 39"); print(NAME[a], "second by book:", dict(c))
