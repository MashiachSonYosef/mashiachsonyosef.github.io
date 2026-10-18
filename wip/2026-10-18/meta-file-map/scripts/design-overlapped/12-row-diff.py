# "This version differs from that one by these rows": a row diff of two JSONL.gz versions.
# Usage: python3 -I 12-row-diff.py OUT.json FROM.gz TO.gz [pair_fields]
# Rows are whole lines. Removed/added are counted as multisets of exact line bytes. Removed and added rows that
# share the pair fields (default book,i,j,row_i,m_id) are paired and the changed fields are named.
import sys, gzip, json, collections
OUT, A, B = sys.argv[1:4]
pair_fields = (sys.argv[4] if len(sys.argv) > 4 else "book,i,j,row_i,m_id").split(",")
def lines(p):
    with gzip.open(p, "rb") as f:
        return f.read().split(b"\n")
la, lb = lines(A), lines(B)
ca, cb = collections.Counter(la), collections.Counter(lb)
rem, add = ca - cb, cb - ca
def keyof(raw):
    try:
        d = json.loads(raw); return tuple(d.get(k) for k in pair_fields), d
    except Exception:
        return None, None
remk = collections.defaultdict(list)
for raw, n in rem.items():
    k, d = keyof(raw)
    for _ in range(n): remk[k].append(d)
paired, only_added, field_changes = [], 0, collections.Counter()
for raw, n in add.items():
    k, d = keyof(raw)
    for _ in range(n):
        if remk.get(k):
            o = remk[k].pop()
            ch = sorted(f for f in set(o) | set(d) if o.get(f) != d.get(f))
            for f in ch: field_changes[f] += 1
            paired.append({"row": dict(zip(pair_fields, k)), "changed": {f: [o.get(f), d.get(f)] for f in ch}})
        else:
            only_added += 1
only_removed = sum(len(v) for v in remk.values())
out = {"from": A.split("/dl/")[-1], "to": B.split("/dl/")[-1], "rows_from": len(la) - (la[-1] == b""), "rows_to": len(lb) - (lb[-1] == b""),
       "rows_removed": sum(rem.values()), "rows_added": sum(add.values()), "bytes_removed": sum(len(r) + 1 for r in rem.elements()),
       "bytes_added": sum(len(r) + 1 for r in add.elements()), "paired_changes": len(paired), "only_removed": only_removed,
       "only_added": only_added, "fields_changed": dict(field_changes.most_common()), "examples": paired[:4]}
json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in out.items() if k != "examples"}, ensure_ascii=False))
