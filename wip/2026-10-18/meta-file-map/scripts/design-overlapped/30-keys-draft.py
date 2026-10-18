# Draft the per-key part of the meta file from tables already on disk (no network) and measure its size.
# Usage: python3 -I 30-keys-draft.py OUT bucket-etag.tsv r2-md5.tsv nested-copies.tsv builds.tsv
# Writes OUT/keys-draft.jsonl.xz (sha256 left null: it is filled at ingest) and OUT/keys-numbers.json.
# Also writes a size model with a random 64-hex sha256 in every row, to measure the real cost of that column.
import sys, os, json, lzma, hashlib, collections, re

OUT, LISTING, MD5T, NESTED, BUILDS = sys.argv[1:6]
os.makedirs(OUT, exist_ok=True)

def unit_of(k):  # the census unit rule (meta/census/scripts/census.py), copied
    p = k.split('/')
    if len(p) == 1: return k
    top = p[0]
    if top in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging'):
        return top + '/(own files)' if len(p) == 2 else top + '/' + p[1] + '/'
    if top == 'editions-built-v1':
        return 'editions-built-v1/' + p[1] + '/' if p[1] in ('pby-wave', 'h1-canon', 'tanakh-editions') else 'editions-built-v1/[4,031 work folders]/'
    if top == 'cold':
        return 'cold/' + p[1] if len(p) == 2 else 'cold/' + p[1] + '/'
    if top in ('serving-lane', 'serving-lane-handoffs', 'retired'):
        return top + '/' + p[1] + '/'
    if top == 'mishkan':
        return 'mishkan/' + p[1] + '/' + p[2] + '/'
    return top + '/'

md5 = {}
for l in open(MD5T):
    m, s, k = l.rstrip('\n').split('\t'); md5[k] = m
nested = {}
for i, l in enumerate(open(NESTED)):
    if i == 0: continue
    h, nb, verdict, b, k = l.rstrip('\n').split('\t'); nested[k] = nb
status = {}
for i, l in enumerate(open(BUILDS)):
    if i == 0: continue
    c = l.rstrip('\n').split('\t'); status[c[0]] = c[4]

ctype = {'.json': 'application/json', '.jsonl': 'application/x-ndjson', '.gz': 'application/gzip'}
rows = 0; raw = bytearray(); model = bytearray(); multipart = 0; no_md5 = 0; units = collections.Counter()
for l in open(LISTING):
    k, s, lm, et, sc = l.rstrip('\n').split('\t')
    mp = '-' in et
    m = md5.get(k) or (None if mp else et)
    if m is None: no_md5 += 1
    multipart += mp
    u = unit_of(k); units[u] += 1
    rec = {"k": k, "u": u, "s": int(s), "md5": m, "etag": et, "lm": lm, "sha256": None}
    if k in nested: rec["copy_of"] = nested[k]
    raw += (json.dumps(rec, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    rec["sha256"] = hashlib.sha256(k.encode()).hexdigest()   # stands in for a real content hash (same entropy)
    model += (json.dumps(rec, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    rows += 1
open(os.path.join(OUT, 'keys-draft.jsonl.xz'), 'wb').write(lzma.compress(bytes(raw), preset=6))
mx = lzma.compress(bytes(model), preset=6)
num = {"rows": rows, "multipart_keys": multipart, "keys_without_md5": no_md5, "units": len(units),
       "draft_raw_bytes": len(raw), "draft_xz6_bytes": os.path.getsize(os.path.join(OUT, 'keys-draft.jsonl.xz')),
       "with_sha256_raw_bytes": len(model), "with_sha256_xz6_bytes": len(mx),
       "units_without_status": sorted(u for u in units if u not in status)[:20]}
json.dump(num, open(os.path.join(OUT, 'keys-numbers.json'), 'w'), indent=1)
print(json.dumps(num))
