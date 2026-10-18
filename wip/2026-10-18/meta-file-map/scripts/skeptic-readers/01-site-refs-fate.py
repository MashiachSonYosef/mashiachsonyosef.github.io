# For every site/notes reference row in readers/refs.tsv, find the fate (door / archive / build) of the R2 keys it
# resolves to, under the readers-first fate rule the map uses (design-readers-first/scripts/02-fates.py, reused
# read-only, as judge/scripts/01-map-model.py does). Writes out/site-refs-fate.tsv and prints counts.
# Read-only on every input.
import collections, sys, bisect, json
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
OUT = M + "/skeptic-readers/out"
src = open(M + "/design-readers-first/scripts/02-fates.py", encoding="utf-8").read().split("rows = []")[0]
ns = {}
exec(src, ns)
fate = ns["fate"]
CLASS = {"standing-forever (channel)": "door", "standing-until-reader-moves (served payload)": "door",
         "standing-until-owner-names (archive)": "archive", "lookup": "build"}
keys = []
for i, l in enumerate(open(M + "/design-readers-first/out/keys.tsv", encoding="utf-8")):
    if i == 0:
        continue
    keys.append(l.split("\t", 1)[0])
keys.sort()
def under(p):
    i = bisect.bisect_left(keys, p)
    out = []
    while i < len(keys) and keys[i].startswith(p):
        out.append(keys[i]); i += 1
    return out
holders = set(sys.argv[1:]) or {"site", "notes"}
rows = []
cnt = collections.Counter()
for i, l in enumerate(open(M + "/readers/refs.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = l.rstrip("\n").split("\t")
    src_file, tgt, kind, algo, holder, form, res = f[0], f[1], f[2], f[3], f[4], f[5], f[6]
    detail = f[10]
    if holder not in holders:
        continue
    if res == "key":
        ks = [tgt]
    elif res == "prefix":
        ks = under(tgt)
    else:
        ks = []
    cls = collections.Counter(CLASS[fate(k)] for k in ks)
    tag = "+".join(sorted(cls)) or res
    cnt[(holder, kind, tag)] += 1
    rows.append((holder, kind, tag, src_file, tgt, detail, json.dumps(dict(cls))))
with open(OUT + "/site-refs-fate.tsv", "w", encoding="utf-8") as w:
    w.write("holder\tkind\tclasses\treferencing_file\ttarget\tdetail\tclass_counts\n")
    for r in rows:
        w.write("\t".join(r) + "\n")
for k, v in sorted(cnt.items()):
    print(v, *k, sep="\t")
