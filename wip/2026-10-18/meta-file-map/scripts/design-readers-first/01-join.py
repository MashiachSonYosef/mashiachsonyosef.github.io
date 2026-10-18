# Join the 18 Oct 16:46 UTC listing (hazards/bucket-etag.tsv) with md5s and census units.
# Writes out/keys.tsv: key, size, last_modified, md5, unit, unit_status, copy_of_build
# Read only: reads on-disk tables, writes only under design-readers-first/out.
import json, os, sys
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
OUT = M + "/design-readers-first/out"

mp = {r["k"]: r for r in json.load(open(M + "/hazards/multipart-verify.json"))["rows"]}

units = []
for i, line in enumerate(open(M + "/census/builds.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = line.rstrip("\n").split("\t")
    units.append((f[0], f[1], f[4], f[3]))
plain = []      # (prefix, unit, status)
own = []        # "(own files)" units: files directly under the parent
special = []
for u, fam, st, role in units:
    if u.endswith("(own files)"):
        own.append((u[: -len("(own files)")], u, st))
    elif "[" in u:
        special.append((u.split("[")[0], u, st))
    else:
        plain.append((u, u, st))
plain.sort(key=lambda x: -len(x[0]))

def unit_of(k):
    for p, u, st in plain:
        if k.startswith(p):
            return u, st
    for p, u, st in own:
        if k.startswith(p) and "/" not in k[len(p):]:
            return u, st
    for p, u, st in special:
        if k.startswith(p):
            return u, st
    return "(none)", "unknown"

nested = {}
for i, line in enumerate(open(M + "/census/nested-copies.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = line.rstrip("\n").split("\t")
    nested[f[4]] = (f[1], f[2])

n = 0
with open(OUT + "/keys.tsv", "w", encoding="utf-8") as w:
    w.write("key\tsize\tlast_modified\tmd5\tunit\tstatus\tcopy_of_build\tcopy_verdict\n")
    for line in open(M + "/hazards/bucket-etag.tsv", encoding="utf-8"):
        k, size, lm, etag, sc = line.rstrip("\n").split("\t")
        md5 = mp[k]["md5"] if "-" in etag else etag
        u, st = unit_of(k)
        cb, cv = nested.get(k, ("", ""))
        w.write("\t".join([k, size, lm, md5, u, st, cb, cv]) + "\n")
        n += 1
print("keys", n)
