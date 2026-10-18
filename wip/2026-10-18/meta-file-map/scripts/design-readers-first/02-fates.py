# Sort every key into a fate under the readers-first rule, and size each fate.
# Reads out/keys.tsv (from 01-join.py) and census/served-payload.tsv. Writes out/fates.json, out/fate-by-top.tsv.
import json, collections
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
D = M + "/design-readers-first"

served = []
for i, l in enumerate(open(M + "/census/served-payload.tsv", encoding="utf-8")):
    f = l.rstrip("\n").split("\t")
    if i == 0 or f[0].startswith("TOTAL"):
        continue
    if f[0] == "masoretic marks":
        continue  # whole folder is not served: only the 42 files the site pins (added below)
    served.append((f[0], f[1]))

# masoretic marks: the files reader/data/masoretic-marks-v1.json pins, by name and size (census rule)
sizes = {}
for l in open(S + "/meta/hazards/bucket-etag.tsv", encoding="utf-8"):
    k, sz = l.split("\t")[:2]
    if k.startswith("corpus-lane-builds/moses-masoretic-marks-v1/"):
        sizes[k] = int(sz)
mm = json.load(open(S + "/ghp/reader/data/masoretic-marks-v1.json", encoding="utf-8"))["from"]
want = [(v["file"], v["bytes"]) for k, v in mm.items() if k != "books"] + [(v["file"], v["bytes"]) for v in mm["books"].values()]
MM = set()
for name, b in want:
    c = sorted((k for k, s in sizes.items() if k.endswith("/" + name) and s == b), key=lambda k: (k.count("/"), k))
    if c:
        MM.add(c[0])

CHANNELS = ("serving-lane/", "serving-lane-handoffs/", "moses-ledgers/", "frame/", "disposition/", "r2-push-suite/", "retired/", "cas/")
ROOTFILES_CHANNEL = ("MOSES-LEDGER-INDEX.md",)

def fate(k):
    if k in MM:
        return "standing-until-reader-moves (served payload)"
    if k.startswith("corpus-lane-builds/") or k.startswith("mishkan/"):
        for name, p in served:
            if p.startswith("corpus-lane-builds/") and k.startswith(p):
                return "standing-until-reader-moves (served payload)"
        return "lookup"
    if k.startswith(CHANNELS) or k in ROOTFILES_CHANNEL:
        return "standing-forever (channel)"
    return "standing-until-owner-names (archive)"

rows = []
for i, l in enumerate(open(D + "/out/keys.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = l.rstrip("\n").split("\t")
    rows.append((f[0], int(f[1]), f[3], f[4], f[5]))

by = collections.defaultdict(lambda: [0, 0])
content_fates = collections.defaultdict(set)
content_size = {}
top = collections.defaultdict(lambda: [0, 0])
for k, s, md5, u, st in rows:
    fa = fate(k)
    by[fa][0] += 1; by[fa][1] += s
    c = (md5, s)
    content_size[c] = s
    content_fates[c].add("lookup" if fa == "lookup" else "standing")
    t = k.split("/")[0] + ("/" if "/" in k else "")
    top[(t, fa)][0] += 1; top[(t, fa)][1] += s

only_lookup = [c for c, fs in content_fates.items() if fs == {"lookup"}]
only_standing = [c for c, fs in content_fates.items() if fs == {"standing"}]
both = [c for c, fs in content_fates.items() if fs == {"lookup", "standing"}]
standing_keys_bytes = sum(v[1] for fa, v in by.items() if fa != "lookup")
distinct = sum(content_size.values())
out = {
    "keys": len(rows), "bytes": sum(r[1] for r in rows),
    "distinct_contents": len(content_size), "distinct_bytes": distinct,
    "fates": {fa: {"keys": v[0], "bytes": v[1]} for fa, v in sorted(by.items())},
    "contents_only_in_lookup_keys": {"n": len(only_lookup), "bytes": sum(content_size[c] for c in only_lookup)},
    "contents_only_in_standing_keys": {"n": len(only_standing), "bytes": sum(content_size[c] for c in only_standing)},
    "contents_in_both": {"n": len(both), "bytes": sum(content_size[c] for c in both)},
    "physical_if_cas_holds_everything_and_standing_keys_stay": distinct + standing_keys_bytes,
    "physical_if_cas_holds_only_lookup_content": standing_keys_bytes + sum(content_size[c] for c in only_lookup),
}
# end state: archives retired into cas after the owner names them; channels and served payload stay standing
end_standing = sum(v[1] for fa, v in by.items() if fa.startswith("standing-forever") or fa.startswith("standing-until-reader"))
out["physical_end_state_cas_plus_channels_plus_served"] = distinct + end_standing
out["physical_end_state_cas_plus_channels_only"] = distinct + by["standing-forever (channel)"][1]
json.dump(out, open(D + "/out/fates.json", "w"), indent=1)
with open(D + "/out/fate-by-top.tsv", "w") as w:
    w.write("top\tfate\tkeys\tbytes\n")
    for (t, fa), v in sorted(top.items(), key=lambda x: -x[1][1]):
        w.write(f"{t}\t{fa}\t{v[0]}\t{v[1]}\n")
print(json.dumps(out, indent=1))

# phase-1 store: every distinct content held by a lookup, channel or served key (archives wait for the owner)
fa_of = collections.defaultdict(set)
for k, s, md5, u, st in rows:
    fa_of[(md5, s)].add(fate(k).split(" ")[0])
p1 = [c for c, fs in fa_of.items() if fs & {"lookup", "standing-forever", "standing-until-reader-moves"}]
arch_only = [c for c, fs in fa_of.items() if fs == {"standing-until-owner-names"}]
p1b = sum(content_size[c] for c in p1)
extra = {
  "phase1_cas_contents": len(p1), "phase1_cas_bytes": p1b,
  "phase1_physical": p1b + standing_keys_bytes,
  "archive_only_contents": len(arch_only), "archive_only_bytes": sum(content_size[c] for c in arch_only),
  "end_state_physical (cas all + channels + served)": distinct + by["standing-forever (channel)"][1] + by["standing-until-reader-moves (served payload)"][1],
  "standing_forever_plus_served_bytes": by["standing-forever (channel)"][1] + by["standing-until-reader-moves (served payload)"][1],
}
out.update(extra)
json.dump(out, open(D + "/out/fates.json", "w"), indent=1)
print(json.dumps(extra, indent=1))
