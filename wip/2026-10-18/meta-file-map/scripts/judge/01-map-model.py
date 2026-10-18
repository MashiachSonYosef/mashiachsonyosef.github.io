# Model of THE MAP's recommended meta file (overlapped-build-meta-v1), built from the real 16:46 UTC listing,
# to MEASURE its size, and a real per-build "added bytes over the previous version" table (MEASURED from md5 groups).
#
# Real: keys, sizes, last-modified, md5 (content id groups), census units, family, version, status, copy-of,
#       multipart part counts, door/archive/build classes (readers-first fate rule, reused read-only).
# SYNTHETIC (same length and randomness as real values; the capture pass fills the real ones):
#       sha256, crc64nvme, x-amz-meta-mtime, content-type, build digests, pin records.
# Writes out/added-bytes.tsv, out/model-numbers.json. The model file itself is deleted after measuring.
import json, hashlib, gzip, lzma, collections, os, base64, re, sys

S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
OUT = M + "/judge/out"

# readers-first fate rule (definitions only), so door/archive/build classes match that design's measured split
src = open(M + "/design-readers-first/scripts/02-fates.py", encoding="utf-8").read().split("rows = []")[0]
ns = {}
exec(src, ns)
fate = ns["fate"]
CLASS = {"standing-forever (channel)": "door", "standing-until-reader-moves (served payload)": "door",
         "standing-until-owner-names (archive)": "archive", "lookup": "build"}

units = {}
for i, l in enumerate(open(M + "/census/builds.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = l.rstrip("\n").split("\t")
    units[f[0]] = dict(family=f[1], version=f[2], role=f[3], status=f[4], why=f[11])

mp = {r["k"]: r for r in json.load(open(M + "/hazards/multipart-verify.json"))["rows"]}

rows = []
for i, l in enumerate(open(M + "/design-readers-first/out/keys.tsv", encoding="utf-8")):
    if i == 0:
        continue
    k, size, lm, md5, u, st, cb, cv = l.rstrip("\n").split("\t")
    rows.append((k, int(size), lm, md5, u, cb))
rows.sort(key=lambda r: r[0].encode("utf-8"))

def fake(s, n=64):
    return hashlib.sha256(s.encode()).hexdigest()[:n]

content_sha = {}
content_keys = collections.Counter()
unit_contents = collections.defaultdict(set)
holders = collections.defaultdict(set)
ukeys = collections.Counter()
ubytes = collections.Counter()
for k, size, lm, md5, u, cb in rows:
    c = (md5, size)
    if c not in content_sha:
        content_sha[c] = fake(f"{md5}:{size}")
    content_keys[c] += 1
    unit_contents[u].add(c)
    holders[c].add(u)
    ukeys[u] += 1
    ubytes[u] += size

# ---- per-build added bytes over the previous version of the same family (MEASURED) ----
def vkey(v):
    return tuple(int(x) for x in re.findall(r"\d+", v)) if v else (0,)

fam = collections.defaultdict(list)
for u, info in units.items():
    if u in unit_contents and info["family"]:
        fam[info["family"]].append(u)
prev = {}
for f, us in fam.items():
    us.sort(key=lambda u: vkey(units[u]["version"]))
    for a, b in zip(us, us[1:]):
        prev[b] = a

added = {}
lines_tsv = ["build\tfamily\tversion\tprev\tdistinct_bytes\tnew_bytes_vs_prev\tnew_bytes_vs_all_earlier\tunique_bytes"]
fam_seen = collections.defaultdict(set)
for f, us in fam.items():
    for u in us:
        cs = unit_contents[u]
        db = sum(c[1] for c in cs)
        p = prev.get(u)
        nvp = sum(c[1] for c in cs if not p or c not in unit_contents[p])
        nae = sum(c[1] for c in cs if c not in fam_seen[f])
        ub = sum(c[1] for c in cs if holders[c] == {u})
        fam_seen[f] |= cs
        added[u] = (p, db, nvp, nae, ub)
        lines_tsv.append(f"{u}\t{f}\t{units[u]['version']}\t{p or ''}\t{db}\t{nvp}\t{nae}\t{ub}")
open(OUT + "/added-bytes.tsv", "w", encoding="utf-8").write("\n".join(lines_tsv) + "\n")

multi = [u for f, us in fam.items() if len(us) > 1 for u in us]
fam_multi = {f: us for f, us in fam.items() if len(us) > 1}
sum_first = sum(added[us[0]][1] for us in fam_multi.values())
sum_later_dist = sum(added[u][1] for us in fam_multi.values() for u in us[1:])
sum_later_new_all = sum(added[u][3] for us in fam_multi.values() for u in us[1:])

# ---- the model meta file ----
EXT_CT = {".json": "application/json", ".md": "text/markdown; charset=utf-8", ".gz": "application/x-gzip",
          ".jsonl": "application/octet-stream", ".txt": "text/plain; charset=utf-8", ".tsv": "text/tab-separated-values",
          ".mjs": "application/javascript", ".bin": "application/octet-stream", ".csv": "text/csv"}
L = []
L.append({"record": "head", "format": "overlapped-build-meta-v1", "bucket": "mishkan", "version": 1, "previous-sha256": None,
          "listed-from": "2026-10-18T16:46:00Z", "listed-to": "2026-10-18T16:50:00Z", "hashed-to": "2026-10-18T22:00:00Z",
          "keys": len(rows), "key-bytes": sum(r[1] for r in rows), "contents": len(content_sha),
          "content-bytes": sum(c[1] for c in content_sha), "builds": len(unit_contents),
          "unit-rule": "census unit rule v1 (verbatim text, about 1 KB)" + "x" * 900,
          "store-layout": "cas/sha256/{sha256[0:2]}/{sha256}",
          "tools": {"capture-bucket-meta-v1.mjs": fake("cap"), "node": "v22.22.0"}})
for i in range(22):
    L.append({"record": "door", "prefix": f"door-prefix-{i}/", "class": "door", "readers": ["reader/tools/push-toggles-v1.mjs"],
              "why": "read by key by a program that will not change", "keys": 1000, "bytes": 100000000})
for i in range(14):
    L.append({"record": "reader", "reader": f"reader-{i}", "lane": "serving", "how": "SigV4 GET by key", "reads": ["moses-ledgers/"],
              "after": "unchanged"})
for i in range(24):
    L.append({"record": "alias", "from": f"{{ALIAS{i}}}/", "to": "corpus-lane-builds/", "why": "readers survey normalization"})
for u in sorted(unit_contents, key=lambda s: s.encode("utf-8")):
    info = units.get(u, {})
    p, db, nvp, nae, ub = added.get(u, (None, sum(c[1] for c in unit_contents[u]), None, None, None))
    L.append({"record": "build", "build": u, "family": info.get("family"), "version": info.get("version"), "prev": p,
              "status": info.get("status"), "status-why": (info.get("why") or "")[:160],
              "keys": ukeys[u], "bytes": ubytes[u], "distinct-bytes": db, "unique-bytes": ub,
              "new-bytes": nvp, "digest": fake("d" + u), "holds-copies-of": [],
              "first-modified": "2026-10-02T14:44:33Z", "last-modified": "2026-10-02T14:44:36Z"})
for c, sha in sorted(content_sha.items(), key=lambda x: x[1]):
    rec = {"record": "content", "sha256": sha, "size": c[1], "md5": c[0],
           "crc64nvme": base64.b64encode(hashlib.md5(sha.encode()).digest()[:8]).decode(), "keys": content_keys[c], "form": "plain"}
    L.append(rec)
for k, size, lm, md5, u, cb in rows:
    ext = os.path.splitext(k)[1].lower()
    rec = {"record": "key", "key": k, "build": u, "class": CLASS[fate(k)], "present": True, "size": size,
           "sha256": content_sha[(md5, size)], "last-modified": lm, "content-type": EXT_CT.get(ext, "application/octet-stream")}
    if k in mp:
        rec["etag"] = mp[k]["etag"]
        rec["parts"] = [5242880, int(mp[k]["etag"].split("-")[1])]
    if not k.startswith("serving-lane/"):
        rec["meta"] = {"mtime": "%d.%07d" % (1780000000 + (int(md5[:6], 16) % 20000000), int(md5[6:12], 16) % 10000000)}
        rec["checksum"] = {"crc64nvme": base64.b64encode(bytes.fromhex(md5[:16])).decode()}
    else:
        rec["meta"] = {"sha256": content_sha[(md5, size)]}
        rec["checksum"] = {"crc32": base64.b64encode(bytes.fromhex(md5[:8])).decode()}
    if cb:
        rec["copy-of"] = cb
    L.append(rec)
for i in range(4302):
    L.append({"record": "pin", "key": f"serving-lane/shelf/zones/model-{i}.bin", "sha256": fake(f"pin{i}"), "size": 207289,
              "pinned-by": ["reader/data/zone-store-v1.json"], "verdict": "differs-at-capture", "held": False,
              "why": "shelf backup of 2026-09-28 predates the pin"})

raw = ("\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in L) + "\n").encode("utf-8")
gz = gzip.compress(raw, 9, mtime=0)
xz = lzma.compress(raw, preset=6)
by = collections.Counter(x["record"] for x in L)
keyraw = sum(len(json.dumps(x, ensure_ascii=False, separators=(",", ":"))) + 1 for x in L if x["record"] == "key")

nums = {
    "model": {"lines": len(L), "raw_bytes": len(raw), "gzip9_bytes": len(gz), "xz6_bytes": len(xz),
              "lines_by_record": dict(by), "key_lines_raw_bytes": keyraw},
    "added_bytes": {
        "families_with_more_than_one_unit": len(fam_multi),
        "units_in_them": sum(len(v) for v in fam_multi.values()),
        "first_versions_distinct_bytes": sum_first,
        "later_versions_distinct_bytes": sum_later_dist,
        "later_versions_new_bytes_vs_all_earlier": sum_later_new_all,
    },
    "examples": {u: dict(zip(["prev", "distinct", "new_vs_prev", "new_vs_all_earlier", "unique"], added[u]))
                 for u in ["corpus-lane-builds/moses-compspan-v13.8/", "corpus-lane-builds/moses-witnessed-order-v2.4/",
                           "corpus-lane-builds/moses-witnessed-order-v2.5/", "corpus-lane-builds/moses-search-ledger-v1.8/",
                           "corpus-lane-builds/moses-bundled-by-century-v1/", "corpus-lane-builds/moses-piece-store-v2/"]
                 if u in added},
}
json.dump(nums, open(OUT + "/model-numbers.json", "w"), indent=1)
print(json.dumps(nums, indent=1))
