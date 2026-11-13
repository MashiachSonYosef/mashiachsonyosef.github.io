# The resting lines as recorded (data/resting-lines) in two trees, work by work and unit by unit: how many lines
# stand in both, how many print another text, and of those how many differ by spaces alone (a made space closed)
# and how many otherwise; how many keep their text and change their credit; and, in each tree, how many lines print
# a space before a stop. It measures; it changes nothing.
# python3 -I lines-before-and-after.py <reader dir before> <reader dir after>
import gzip, json, os, re, sys, collections

before, after = sys.argv[1], sys.argv[2]
stop = re.compile(r"\s[,;.:?!)\]]")
def load(reader):
    d0 = os.path.join(reader, "data/resting-lines")
    out = {}
    for f in sorted(os.listdir(d0)):
        if not f.endswith(".json.gz"):
            continue
        d = json.loads(gzip.open(os.path.join(d0, f)).read())
        units = {}
        for si, (label, us) in enumerate(d["sections"]):
            for first, count, text, credit in us:
                units[(si, first, count)] = (label, text, " | ".join(d["sources"][c]["label"] for c in credit.split()))
        out[d["work"]] = units
    return out
A, B = load(before), load(after)
T = collections.Counter(); by = collections.Counter(); other = []; recredited = []; closed_eg = []
for work in sorted(set(A) | set(B)):
    a, b = A.get(work, {}), B.get(work, {})
    T["works"] += 1
    T["lines before"] += len(a); T["lines after"] += len(b)
    T["lines before with a space before a stop"] += sum(1 for v in a.values() if stop.search(v[1]))
    T["lines after with a space before a stop"] += sum(1 for v in b.values() if stop.search(v[1]))
    T["units only before"] += len(set(a) - set(b)); T["units only after"] += len(set(b) - set(a))
    for k in sorted(set(a) & set(b)):
        (label, ta, ca), (_, tb, cb) = a[k], b[k]
        if ta == tb:
            if ca != cb:
                T["same text, another credit"] += 1
                if len(recredited) < 8: recredited.append(f"{work} {label} word {k[1]}: {ta[:50]!r} · {ca[:50]} -> {cb[:50]}")
            continue
        T["lines whose text differs"] += 1
        if ta.replace(" ", "") == tb.replace(" ", ""):
            T["  by spaces alone"] += 1
            if ca != cb: T["    and credited otherwise"] += 1
            for c in cb.split(" | "): by[c[:64]] += 1
            if len(closed_eg) < 6: closed_eg.append(f"{work} {label} word {k[1]}: {ta[:60]!r} -> {tb[:60]!r}")
        else:
            T["  otherwise"] += 1
            if len(other) < 40: other.append(f"{work} {label} word {k[1]}: {ta[:60]!r} ({ca[:36]}) -> {tb[:60]!r} ({cb[:36]})")
for k, v in T.items(): print(f"{v:9,d}  {k}")
print("the lines that differ by spaces alone, by the source the line is now credited to:")
for k, v in by.most_common(6): print(f"{v:9,d}  {k}")
for e in closed_eg: print("    ", e)
if recredited:
    print("the same text under another credit:")
    for e in recredited: print("    ", e)
if other:
    print("the lines that differ otherwise:")
    for e in other: print("    ", e)
