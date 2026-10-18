# Class (door / archive / build) of each key in a key list, under the map's fate rule (readers-first 02-fates.py,
# reused read-only). Usage: python3 -I 02-keylist-fate.py <keys file: key in first tab column> [label]
# Prints keys and bytes per class, using the sizes in design-readers-first/out/keys.tsv (16:46 listing).
import sys, collections
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
src = open(M + "/design-readers-first/scripts/02-fates.py", encoding="utf-8").read().split("rows = []")[0]
ns = {}
exec(src, ns)
fate = ns["fate"]
CLASS = {"standing-forever (channel)": "door", "standing-until-reader-moves (served payload)": "door",
         "standing-until-owner-names (archive)": "archive", "lookup": "build"}
size = {}
for i, l in enumerate(open(M + "/design-readers-first/out/keys.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = l.split("\t", 2)
    size[f[0]] = int(f[1])
c = collections.Counter(); b = collections.Counter(); tops = collections.Counter()
for i, l in enumerate(open(sys.argv[1], encoding="utf-8")):
    k = l.rstrip("\n").split("\t")[0]
    if not k or k == "key":
        continue
    if k not in size:
        c["absent-at-16:46"] += 1
        continue
    cl = CLASS[fate(k)]
    c[cl] += 1; b[cl] += size[k]
    if cl == "build":
        tops["/".join(k.split("/")[:2])] += 1
label = sys.argv[2] if len(sys.argv) > 2 else sys.argv[1]
for cl in sorted(c):
    print(label, cl, c[cl], "keys", b[cl], "bytes", sep="\t")
print(label, "build-class units", len(tops), sep="\t")
