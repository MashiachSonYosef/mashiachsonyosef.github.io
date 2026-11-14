# The note the page would print, per book and first source, from shares-by-book.json's per-book counts, by the
# spec's number format. Measures only. python3 -I notes.py <shares-by-book.json> <book> [<book> ...]
import json, sys
d = json.load(open(sys.argv[1]))["per_book"]
SRC = ["step", "macula", "ubs", "bdb"]; NAME = {"step": "STEP", "macula": "MACULA", "ubs": "UBS", "bdb": "BDB"}
def fmt(n, w):
    if n == 0: return "0%"
    if n == w: return "100%"
    x = 100 * n / w
    if x < 0.05: return "<0.1%"
    if x >= 99.95: return ">99.9%"
    return f"{x:.1f}%"
for book in sys.argv[2:]:
    C = d[book]; W = C["words"]; T = book.replace("-", " ").title()
    for a in SRC:
        fills = {b: C.get(f"fill {a} {b}", 0) for b in SRC if b != a}
        best = max(fills.values())
        sec = next((b for b in SRC if b != a and fills[b] == best), None) if best else None
        has = C.get(f"has {a}", 0); left = W - has - (fills[sec] if sec else 0)
        dirt = fmt(has, W) + (f" · then {NAME[sec]}" if sec else "")
        s = f"{NAME[a]} is partial: its own reading under {fmt(has, W)} of {T}. "
        s += f"{NAME[sec]} fills out {fmt(fills[sec], W)}, chosen for this book. " if sec else "No other source reads the rest. "
        s += f"Today’s line stands under the other {fmt(left, W)}." if left else ""
        s += "  fill out with: " + " ".join(f"[{NAME[b]} {fmt(fills[b], W)}]" for b in SRC if b != a) + " [today’s line]"
        print(f"{book:13s} {NAME[a]:6s} dir «{dirt}»\n    {s}")
