# Build a MODEL of the meta file in the proposed JSONL shape from the real listing, to measure its size.
# Real: keys, sizes, last_modified, md5s, build units, statuses, copy_of. SYNTHETIC (marked): sha256,
# crc64nvme, content-type and x-amz-meta-mtime values (same length and entropy as real ones; the real
# values come from the capture pass). Writes out/model-meta.jsonl.gz and out/model-numbers.json.
import json, hashlib, gzip, lzma, collections, os, base64, importlib.util
S = "/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad"
M = S + "/meta"
D = M + "/design-readers-first"

spec = importlib.util.spec_from_file_location("fates", D + "/scripts/02-fates.py")
# reuse fate() without rerunning prints: exec only the definitions we need
src = open(D + "/scripts/02-fates.py").read().split("rows = []")[0]
ns = {}
exec(src, ns)
fate = ns["fate"]

units = {}
for i, l in enumerate(open(M + "/census/builds.tsv", encoding="utf-8")):
    if i == 0:
        continue
    f = l.rstrip("\n").split("\t")
    units[f[0]] = dict(family=f[1], version=f[2], role=f[3], status=f[4], why=f[11])

mp = {r["k"]: r for r in json.load(open(M + "/hazards/multipart-verify.json"))["rows"]}
EXT_CT = {".json": "application/json", ".md": "text/markdown", ".gz": "application/gzip", ".jsonl": "application/octet-stream",
          ".txt": "text/plain; charset=utf-8", ".tsv": "text/tab-separated-values", ".mjs": "application/javascript",
          ".bin": "application/octet-stream", ".csv": "text/csv"}

def fake_sha(md5, size):  # SYNTHETIC stand-in with real entropy
    return hashlib.sha256(f"{md5}:{size}".encode()).hexdigest()

rows = []
for i, l in enumerate(open(D + "/out/keys.tsv", encoding="utf-8")):
    if i == 0:
        continue
    k, size, lm, md5, u, st, cb, cv = l.rstrip("\n").split("\t")
    rows.append((k, int(size), lm, md5, u, st, cb))
rows.sort(key=lambda r: r[0].encode("utf-8"))

contents = {}
per_build = collections.defaultdict(list)
for k, size, lm, md5, u, st, cb in rows:
    c = (md5, size)
    if c not in contents:
        contents[c] = fake_sha(md5, size)
    rel = k[len(u):] if u in units and not u.endswith(")") and "[" not in u else k
    per_build[u].append(f"{rel}\t{contents[c]}\t{size}\n")

lines = []
head = {"t": "head", "schema": "OVERLAPPED_BUILD_META_V1", "version": 1, "bucket": "mishkan",
        "captured_from": "ListObjectsV2 2026-10-18T16:46Z + one streamed GET per key", "previous_sha256": None,
        "store": "cas/sha256/<first 2 hex>/<sha256>", "keys": len(rows), "bytes": sum(r[1] for r in rows),
        "contents": len(contents), "content_bytes": sum(c[1] for c in contents), "builds": len(per_build),
        "rule": "a key's bytes are the content its sha256 names, whole; every key of every build is listed exactly as listed by R2",
        "tools": {"capture": "tools/capture-bucket-map-v1.mjs", "node": "v22.22.0"}}
lines.append(head)
lines.append({"t": "alias", "from": "{BUILDS}/", "to": "corpus-lane-builds/"})
for b, recs in sorted(per_build.items()):
    recs.sort(key=lambda s: s.split("\t")[0].encode("utf-8"))
    bh = hashlib.sha256("".join(recs).encode("utf-8")).hexdigest()
    info = units.get(b, {})
    ks = [r for r in rows if False]
    lines.append({"t": "build", "build": b, "family": info.get("family"), "version": info.get("version"),
                  "status": info.get("status"), "status_why": info.get("why"), "role": info.get("role"),
                  "keys": len(recs), "bytes": sum(int(s.rsplit("\t", 1)[1]) for s in recs), "build_sha256": bh})
for (md5, size), sha in sorted(contents.items(), key=lambda x: x[1]):
    rec = {"t": "content", "sha256": sha, "md5": md5, "bytes": size,
           "crc64nvme": base64.b64encode(hashlib.md5(sha.encode()).digest()[:8]).decode()}  # SYNTHETIC crc
    lines.append(rec)
for k, size, lm, md5, u, st, cb in rows:
    ext = os.path.splitext(k)[1].lower()
    rec = {"t": "key", "key": k, "sha256": contents[(md5, size)], "build": u, "fate": fate(k).split(" ")[0],
           "modified": lm, "type": EXT_CT.get(ext, "application/octet-stream")}
    if not k.startswith("serving-lane/"):
        rec["mtime"] = "%d.%07d" % (1780000000 + (int(md5[:6], 16) % 20000000), int(md5[6:12], 16) % 10000000)  # SYNTHETIC
    if cb:
        rec["copy_of"] = cb
    if k in mp:
        rec["parts"] = [5242880, int(mp[k]["etag"].split("-")[1])]
    lines.append(rec)

raw = ("\n".join(json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in lines) + "\n").encode("utf-8")
gz = gzip.compress(raw, 9)
xz = lzma.compress(raw, preset=6)
open(D + "/out/model-meta.jsonl.gz", "wb").write(gz)
nums = {"model_lines": len(lines), "raw_bytes": len(raw), "gzip9_bytes": len(gz), "xz6_bytes": len(xz),
        "builds": len(per_build), "contents": len(contents), "keys": len(rows)}
by_t = collections.Counter(x["t"] for x in lines)
nums["lines_by_type"] = dict(by_t)
json.dump(nums, open(D + "/out/model-numbers.json", "w"), indent=1)
print(json.dumps(nums, indent=1))
