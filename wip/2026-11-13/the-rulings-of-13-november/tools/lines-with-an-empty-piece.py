# The resting lines (data/resting-lines, as the reader draws each work at rest) whose pieces include one that prints
# nothing: an empty piece, or one of zero-width or blank characters only, at the head of the line ("+ earth"), at its
# end ("and + "), or between two pieces. Counted work by work and by the source the line is credited to, with the
# commonest such lines and a few places of each. It reads; it changes nothing.
# python3 -I lines-with-an-empty-piece.py <reader dir>
import collections, glob, gzip, json, os, sys

R = sys.argv[1]
BLANK = {"​", "‌", "‍", "⁠", "﻿", " ", " "}
blank = lambda t: all(c in BLANK for c in t)
T = collections.Counter(); by_work = collections.Counter(); by_src = collections.Counter(); texts = collections.Counter(); where = collections.defaultdict(list)
for p in sorted(glob.glob(os.path.join(R, "data/resting-lines/*.json.gz"))):
    work = os.path.basename(p)[: -len(".json.gz")]
    d = json.loads(gzip.decompress(open(p, "rb").read()))
    for label, units in d.get("sections") or []:
        for u in units:
            text = u[2] if len(u) > 2 else None
            if not isinstance(text, str): continue
            T["lines"] += 1
            pieces = text.split(" + ")
            if len(pieces) < 2:
                if blank(text) and text: T["a line of blank characters only"] += 1
                continue
            T["lines of pieces"] += 1
            empty = [i for i, x in enumerate(pieces) if blank(x)]
            if not empty: continue
            kind = "the first piece" if empty == [0] else "the last piece" if empty == [len(pieces) - 1] else "every piece" if len(empty) == len(pieces) else "a middle piece or more than one"
            T[f"lines with an empty piece: {kind}"] += 1
            by_work[work] += 1; by_src[u[3] if len(u) > 3 else "?"] += 1
            shown = text.replace("​", "<ZWSP>")
            texts[shown] += 1
            if len(where[shown]) < 3: where[shown].append(f"{work} {label} word {u[0]}")
for k, v in T.items(): print(f"{v:9,}  {k}")
print("\nby work:", ", ".join(f"{w} {n}" for w, n in by_work.most_common()))
print("by the source credited:", ", ".join(f"{s} {n}" for s, n in by_src.most_common()))
print(f"\n{len(texts):,} distinct lines; the commonest 30:")
for t, n in texts.most_common(30): print(f"  {n:6,} · «{t}» · e.g. {'; '.join(where[t])}")
