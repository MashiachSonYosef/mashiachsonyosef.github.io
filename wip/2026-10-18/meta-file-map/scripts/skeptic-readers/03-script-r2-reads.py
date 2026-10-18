# Scan the distinct script bodies downloaded from R2 (dl-scripts/, one per (md5,size), from out/script-bodies.tsv)
# for literal R2 paths `r2:mishkan/<path>` (or `r2:<path>`) in scripts that call rclone. For each, record the
# script's own build, the target, whether the target is another build, the target's class under the map's fate
# rule, and the rclone verbs the script uses. Writes out/script-r2-reads.tsv; prints counts. Read-only.
import os, re, sys, collections, bisect
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
D = M + "/skeptic-readers/dl-scripts"
src = open(M + "/design-readers-first/scripts/02-fates.py", encoding="utf-8").read().split("rows = []")[0]
ns = {}; exec(src, ns); fate = ns["fate"]
CLASS = {"standing-forever (channel)": "door", "standing-until-reader-moves (served payload)": "door",
         "standing-until-owner-names (archive)": "archive", "lookup": "build"}
keys = sorted(l.split("\t", 1)[0] for i, l in enumerate(open(M + "/design-readers-first/out/keys.tsv", encoding="utf-8")) if i)
def under(p):
    i = bisect.bisect_left(keys, p); out = []
    while i < len(keys) and keys[i].startswith(p): out.append(keys[i]); i += 1
    return out
LIT = re.compile(r"r2:(?:mishkan/)?([A-Za-z0-9][A-Za-z0-9._/\-]*)")
VERB = re.compile(r"""['"](cat|lsjson|lsf|ls|check|md5sum|hashsum|copy|copyto|sync|size|cryptcheck)['"]|rclone\s+(cat|lsjson|lsf|ls|check|md5sum|hashsum|copy|copyto|sync|size)\b""")
rows = []
for root, ds, fs in os.walk(D):
    for f in fs:
        p = os.path.join(root, f)
        rel = os.path.relpath(p, D)
        t = open(p, encoding="utf-8", errors="replace").read()
        if "rclone" not in t:
            continue
        verbs = sorted({a or b for a, b in VERB.findall(t)})
        own = rel.split("/")[1] if rel.startswith("corpus-lane-builds/") else rel.split("/")[0]
        for m in LIT.finditer(t):
            tgt = m.group(1).rstrip("/.")
            parts = tgt.split("/")
            if parts[0] == "corpus-lane-builds" and len(parts) > 1:
                tb = parts[1]
                if tb.startswith("moses-") is False and tb == "":
                    continue
            else:
                tb = None
            other = (tb is not None and tb != own)
            if tgt in set([]):
                continue
            ks = [tgt] if (tgt in keys[bisect.bisect_left(keys, tgt):bisect.bisect_left(keys, tgt) + 1]) else under(tgt + "/")
            cls = "+".join(sorted({CLASS[fate(k)] for k in ks})) or "not-on-r2-now"
            rows.append((rel, own, tgt, tb or "", "cross-build" if other else ("same-build" if tb else "outside-builds"), cls, ",".join(verbs)))
seen = set(); uniq = []
for r in rows:
    if (r[0], r[2]) in seen: continue
    seen.add((r[0], r[2])); uniq.append(r)
with open(M + "/skeptic-readers/out/script-r2-reads.tsv", "w", encoding="utf-8") as w:
    w.write("script\town_build\tr2_target\ttarget_build\tscope\ttarget_class_now\trclone_verbs_in_script\n")
    for r in uniq: w.write("\t".join(r) + "\n")
c = collections.Counter((r[4], r[5]) for r in uniq)
for k, v in sorted(c.items(), key=lambda x: -x[1]): print(v, *k, sep="\t")
cb = [r for r in uniq if r[4] == "cross-build" and "build" in r[5].split("+")]
print("cross-build literal targets that hold build-class keys:", len(cb), "in", len({r[0] for r in cb}), "scripts of", len({r[1] for r in cb}), "builds")
