# The resting lines that print another text in the second tree, counted by work and chapter: where on the site the
# change can be seen. With a list of "work chapter" pairs after the two folders, only those are printed (to set
# beside the pages a gate sampled).
# python3 -I lines-changed-by-chapter.py <reader dir before> <reader dir after> [work:chapter ...]
import gzip, json, os, sys, collections
before, after, want = sys.argv[1], sys.argv[2], set(sys.argv[3:])
def load(reader):
    out = {}
    d0 = os.path.join(reader, "data/resting-lines")
    for f in sorted(os.listdir(d0)):
        if f.endswith(".json.gz"):
            d = json.loads(gzip.open(os.path.join(d0, f)).read())
            out[d["work"]] = d
    return out
A, B = load(before), load(after)
by = collections.Counter(); works = collections.Counter()
for work in sorted(B):
    for (label, ua), (_, ub) in zip(A[work]["sections"], B[work]["sections"]):
        ch = str(label).split(":")[0]
        for x, y in zip(ua, ub):
            if x[2] != y[2]:
                by[f"{work}:{ch}"] += 1; works[work] += 1
print(f"{sum(by.values())} lines print another text, in {len(by)} chapters of {len(works)} works")
print("by work:", ", ".join(f"{w} {n}" for w, n in works.most_common()))
if want:
    for w in sorted(want): print(f"   {w}: {by.get(w, 0)} lines changed")
