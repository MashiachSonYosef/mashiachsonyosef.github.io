# Two versions of one file, as text: the stretches that differ, each shown with a little of what stands around it.
# python3 -I diff-in-words.py <file before> <file after> [how many to show]
import difflib, sys
a = open(sys.argv[1], encoding="utf8").read()
b = open(sys.argv[2], encoding="utf8").read()
many = int(sys.argv[3]) if len(sys.argv) > 3 else 12
sm = difflib.SequenceMatcher(None, a, b, autojunk=False) if len(a) < 400000 else None
if sm is None:
    # a long file: compare line by line, then within the lines that differ
    la, lb = a.split("\n"), b.split("\n")
    shown = 0
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, la, lb, autojunk=False).get_opcodes():
        if tag == "equal": continue
        for x, y in zip(la[i1:i2], lb[j1:j2]):
            for t, p1, p2, q1, q2 in difflib.SequenceMatcher(None, x, y, autojunk=False).get_opcodes():
                if t == "equal": continue
                print(f"  {x[max(0, p1 - 50):p1]!r} [{x[p1:p2]!r} -> {y[q1:q2]!r}] {x[p2:p2 + 40]!r}")
                shown += 1
                if shown >= many: sys.exit(0)
else:
    shown = 0
    for t, p1, p2, q1, q2 in sm.get_opcodes():
        if t == "equal": continue
        print(f"  {a[max(0, p1 - 50):p1]!r} [{a[p1:p2]!r} -> {b[q1:q2]!r}] {a[p2:p2 + 40]!r}")
        shown += 1
        if shown >= many: break
