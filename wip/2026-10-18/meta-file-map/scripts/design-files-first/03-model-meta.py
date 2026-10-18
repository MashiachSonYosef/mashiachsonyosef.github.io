# DESIGN files-first, step 03 (local only): build a full-size MODEL of the bucket-meta-v1 capture file
# from the 18 Oct listing + md5 table, to measure its size. Real sha256, mtimes and checksums are not
# known without reading every object, so the model uses STAND-INS of the same length and randomness:
#   sha256 stand-in   = sha256("md5:size") (64 hex; identical for keys of the same content, as real ones are)
#   meta.mtime        = a deterministic 18-character decimal derived from the key (rclone's form)
#   checksum value    = a deterministic 12-character base64 derived from the content (crc64nvme's form)
#   content_type      = by extension, the values rclone wrote on the 17 example keys
# The model files are deleted after measuring; only out/03-model-numbers.json is kept.
# Run: python3 -I 03-model-meta.py
import base64, collections, gzip, hashlib, json, lzma, os, re

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D = S + '/meta/design-files-first'
rows = [l.rstrip('\n').split('\t') for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8')]
md5 = {}
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
etag = {}
for l in open(S + '/meta/hazards/bucket-etag.tsv', encoding='utf-8'):
    k, s, t, e, c = l.rstrip('\n').split('\t'); etag[k] = e
for k, s, t in rows:
    if k not in md5: md5[k] = etag[k]
EDB_SUBS = {'pby-wave', 'h1-canon', 'tanakh-editions'}
def unit_of(k):
    p = k.split('/')
    if len(p) == 1: return k
    top = p[0]
    if top in ('corpus-lane-builds', 'moses-ledgers', 'corpus-staging'):
        return top + '/(own files)' if len(p) == 2 else top + '/' + p[1] + '/'
    if top == 'editions-built-v1':
        return 'editions-built-v1/' + p[1] + '/' if p[1] in EDB_SUBS else 'editions-built-v1/[4,031 work folders]/'
    if top == 'cold':
        return 'cold/' + p[1] if len(p) == 2 else 'cold/' + p[1] + '/'
    if top in ('serving-lane', 'serving-lane-handoffs', 'retired'):
        return top + '/' + p[1] + '/'
    if top == 'mishkan':
        return 'mishkan/' + p[1] + '/' + p[2] + '/'
    return top + '/'
CT = {'.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
      '.gz': 'application/x-gzip', '.txt': 'text/plain; charset=utf-8'}
def ctype(k):
    m = re.search(r'\.[A-Za-z0-9]+$', k); return CT.get(m.group(0) if m else '', 'application/octet-stream')
def h(x): return hashlib.sha256(x.encode('utf-8')).digest()
def sha(m, s): return hashlib.sha256(f'{m}:{s}'.encode()).hexdigest()

conts = collections.OrderedDict(); builds = collections.OrderedDict()
for k, s, t in rows:
    s = int(s); c = (md5[k], s)
    conts[c] = conts.get(c, 0) + 1
    u = unit_of(k); b = builds.setdefault(u, [0, 0, set()]); b[0] += 1; b[1] += s; b[2].add(c)
f = D + '/out/03-model.jsonl'
with open(f, 'w', encoding='utf-8') as o:
    o.write(json.dumps({'t': 'head', 'format': 'bucket-meta-v1', 'bucket': 'mishkan', 'capture': 1, 'model': True}) + '\n')
    for (m, s), n in sorted(conts.items(), key=lambda x: sha(*x[0])):
        o.write(json.dumps({'t': 'content', 'sha256': sha(m, s), 'size': s, 'md5': m,
                            'crc64nvme': base64.b64encode(h(m)[:8]).decode(), 'keys': n, 'form': 'plain'}) + '\n')
    for u, (n, by, cs) in builds.items():
        o.write(json.dumps({'t': 'build', 'build': u, 'keys': n, 'bytes': by, 'distinct_bytes': sum(s for _, s in cs),
                            'digest': hashlib.sha256(u.encode()).hexdigest()}) + '\n')
    for k, s, t in rows:
        s = int(s); m = md5[k]; e = etag[k] if k in etag else m
        mt = str(1788000000 + int.from_bytes(h(k)[:4], 'big') % 5000000) + '.' + str(int.from_bytes(h(k)[4:8], 'big') % 10**7).zfill(7)
        o.write(json.dumps({'t': 'key', 'key': k, 'build': unit_of(k), 'size': s, 'sha256': sha(m, s), 'etag': e,
                            'last_modified': t, 'content_type': ctype(k), 'meta': {'mtime': mt},
                            'checksum': {'crc64nvme': base64.b64encode(h(m)[:8]).decode()}}, ensure_ascii=False) + '\n')
raw = os.path.getsize(f)
data = open(f, 'rb').read()
gz9 = len(gzip.compress(data, 9, mtime=0))
xz6 = len(lzma.compress(data, preset=6))
N = {'model_file_raw_bytes': raw, 'gzip9_bytes': gz9, 'xz6_bytes': xz6, 'records': {'content': len(conts), 'build': len(builds), 'key': len(rows)},
     'note': 'stand-ins for sha256, mtime and checksum values; real values are as long and as random'}
json.dump(N, open(D + '/out/03-model-numbers.json', 'w'), indent=1)
os.remove(f)
print(json.dumps(N, indent=1))
