# Every resting line of two trees, work by work and line by line: the same; moved by the gap rule alone (the new
# text is the old one with the joiner beside a hidden sign's gap dropped, the credit the same); or moved otherwise.
# It measures; it changes nothing.
# python3 -I lines-moved-by-the-gap-rule.py <reader dir before> <reader dir after> [<gate diff file>]
import gzip, json, os, re, sys, collections
A, B = sys.argv[1], sys.argv[2]
GATE = sys.argv[3] if len(sys.argv) > 3 else None
GAP = chr(0x200b)
JOINER = " + "

def pieces_of(text):
    out = []
    for chunk in str(text).split(JOINER):
        a, b, tail = 0, len(chunk), 0
        while a < b and chunk[a] == GAP:
            out.append(GAP); a += 1
        while b > a and chunk[b - 1] == GAP:
            tail += 1; b -= 1
        if b > a: out.append(chunk[a:b])
        out.extend([GAP] * tail)
    return out

def drawn(pieces):
    s = []
    for i, x in enumerate(pieces):
        if i and x != GAP and any(y != GAP for y in pieces[:i]): s.append(JOINER)
        s.append(x)
    return "".join(s)

def load(root, work):
    p = os.path.join(root, "data", "resting-lines", f"{work}.json.gz")
    return json.loads(gzip.decompress(open(p, "rb").read())) if os.path.exists(p) else None

T = collections.Counter(); kinds = collections.Counter(); other = []
works = sorted(f[:-8] for f in os.listdir(os.path.join(B, "data", "resting-lines")) if f.endswith(".json.gz"))
for w in works:
    a, b = load(A, w), load(B, w)
    if not a or not b:
        T["works missing a record"] += 1; continue
    T["works"] += 1
    sa = {s[0]: s[1] for s in a["sections"]}; sb = {s[0]: s[1] for s in b["sections"]}
    for label in sorted(set(sa) | set(sb)):
        la, lb = sa.get(label, []), sb.get(label, [])
        for i in range(max(len(la), len(lb))):
            x = la[i] if i < len(la) else None; y = lb[i] if i < len(lb) else None
            T["lines"] += 1
            if x == y: T["the same"] += 1; continue
            if x and y and x[0] == y[0] and x[1] == y[1] and x[3] == y[3] and GAP in x[2] and y[2] == drawn(pieces_of(x[2])):
                T["moved by the gap rule alone"] += 1
                ps = pieces_of(x[2]); at = [j for j, p in enumerate(ps) if p == GAP]
                kinds["gap at the start" if 0 in at else "gap at the end" if len(ps) - 1 in at else "gap between two pieces"] += 1
                continue
            T["moved otherwise"] += 1
            if len(other) < 12: other.append(f"{w} {label} #{i + 1}: {x} -> {y}")
for k, v in T.items(): print(f"{v:>10,}  {k}")
print("the lines moved by the gap rule, by where the gap stands:")
for k, v in kinds.most_common(): print(f"{v:>10,}  {k}")
for o in other: print("  otherwise:", o.replace(GAP, "[gap]"))

if GATE and os.path.exists(GATE):
    G = collections.Counter(); gother = []
    rx = re.compile(r': "(.*)" \[(.*?)\] → "(.*)" \[(.*?)\]$')
    for line in open(GATE, encoding="utf-8"):
        if not line.startswith("line: "): continue
        m = rx.search(line.rstrip("\n"))
        if not m: G["lines the accounting could not read"] += 1; continue
        old, oc, new, nc = m.groups()
        if oc == nc and GAP in old and new == drawn(pieces_of(old)): G["gate lines moved by the gap rule alone"] += 1
        else:
            G["gate lines moved otherwise"] += 1
            if len(gother) < 8: gother.append(line.strip().replace(GAP, "[gap]")[:200])
    for k, v in G.items(): print(f"{v:>10,}  {k}")
    for o in gother: print("  otherwise:", o)
