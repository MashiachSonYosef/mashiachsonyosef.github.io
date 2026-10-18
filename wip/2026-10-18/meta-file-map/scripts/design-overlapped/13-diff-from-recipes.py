# Row diff read off the store: compare two contents' chunk lists, inflate only the chunks that differ, diff their rows.
# Usage: python3 -I 13-diff-from-recipes.py STORE_DIR FROM_SHA256 TO_SHA256 OUT.json
import sys, json, lzma, difflib, collections
D, A, B, OUT = sys.argv[1:5]
recs = {}
for l in open(f"{D}/contents.jsonl"):
    r = json.loads(l); recs[r["sha256"]] = r
def seq(r):
    out = []
    for o, n in r["inner"]["extents"]: out.extend(range(o, o + n))
    return out
sa, sb = seq(recs[A]), seq(recs[B])
sm = difflib.SequenceMatcher(None, sa, sb, autojunk=False)
ops = [op for op in sm.get_opcodes() if op[0] != "equal"]
idx = [l.split("\t") for l in open(f"{D}/chunks.tsv")]
need = sorted({sa[i] for t, i1, i2, j1, j2 in ops for i in range(i1, i2)} | {sb[j] for t, i1, i2, j1, j2 in ops for j in range(j1, j2)})
# read just the needed chunks: here the pack is one xz stream, so it is decompressed whole; the real packs are
# cut into independent xz blocks so a reader fetches and decompresses only the blocks that hold these chunks
pack = lzma.decompress(open(f"{D}/pack.xz", "rb").read())
chunk = {o: pack[int(idx[o][1]):int(idx[o][1]) + int(idx[o][2])] for o in need}
rows_removed, rows_added = collections.Counter(), collections.Counter()
for t, i1, i2, j1, j2 in ops:
    old = b"".join(chunk[sa[i]] for i in range(i1, i2)).split(b"\n")
    new = b"".join(chunk[sb[j]] for j in range(j1, j2)).split(b"\n")
    rows_removed.update(collections.Counter(old) - collections.Counter(new))
    rows_added.update(collections.Counter(new) - collections.Counter(old))
out = {"from": A, "to": B, "chunks_from": len(sa), "chunks_to": len(sb), "ops": [list(o) for o in ops],
       "chunks_read": len(need), "bytes_read": sum(len(chunk[o]) for o in need),
       "rows_removed": sum(rows_removed.values()), "rows_added": sum(rows_added.values()),
       "removed_rows": [r.decode("utf-8")[:300] for r in list(rows_removed)[:3]],
       "added_rows": [r.decode("utf-8")[:300] for r in list(rows_added)[:3]]}
json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("removed_rows", "added_rows")}))
print(out["removed_rows"][:1], out["added_rows"][:1])
