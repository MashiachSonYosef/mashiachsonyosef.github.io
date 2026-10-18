# Compressibility of each content class in the part of the bucket the sample did not cover.
# Byte-weighted systematic sample of distinct contents per class (not in a sampled family); READ-ONLY ranged GET
# of the first PREFIX bytes; .gz prefixes are inflated first. Measures gzip -6 and xz -6 of the (inflated) prefix
# against the stored bytes it came from. Run: python3 -I 46-class-sample.py PER_CLASS PREFIX_BYTES
import os, sys, subprocess, zlib, lzma, json, hashlib, collections
M = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/overlap'
S = M.rsplit('/meta/', 1)[0]
CAT = M + '/scripts/r2cat.mjs'
PER = int(sys.argv[1]) if len(sys.argv) > 1 else 40
PREFIX = int(sys.argv[2]) if len(sys.argv) > 2 else 4 << 20
env = dict(os.environ); env['NODE_NO_WARNINGS'] = '1'
TEXT = {'jsonl', 'json', 'csv', 'tsv', 'txt', 'md', 'html', 'htm', 'xml', 'mjs', 'js', 'cjs', 'log', 'lsf', 'lsjson',
        'ps1', 'sh', 'svg', 'yaml', 'yml', 'py', 'r2head', 'ndjson', 'sha256', 'css'}
MEDIA = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'zip', 'xz', 'zst', 'br', 'bz2', '7z', 'woff', 'woff2', 'jp2', 'tif', 'tiff'}
def classify(key):
    b = key.rsplit('/', 1)[-1].lower(); p = b.split('.')[1:]
    if p[-2:] == ['tar', 'gz'] or p[-1:] == ['tgz']: return 'tar.gz'
    if p and p[-1] == 'gz': return 'gz-text' if len(p) >= 2 and p[-2] in TEXT else 'gz-other'
    e = p[-1] if p else ''
    return 'text' if e in TEXT else ('media' if e in MEDIA else 'binary')
PREFS = ['corpus-lane-builds/moses-licence-ledger-v1/', 'cold/', 'corpus-lane-builds/moses-witnessed-order-v',
         'corpus-lane-builds/moses-compspan-v13', 'corpus-lane-builds/moses-source-census-v', 'moses-ia-wave-v',
         'corpus-staging/', 'corpus-lane-builds/moses-run-ledger-backwards-v', 'corpus-lane-builds/moses-hud-record-v',
         'editions-built-v1/']
insample = set()
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2)
    if any(k.startswith(p) for p in PREFS): insample.add((h, int(s)))
pool = collections.defaultdict(list)
for l in open(M + '/tables/10-distinct.tsv', encoding='utf-8'):
    h, s, fam, ext, k = l.rstrip('\n').split('\t'); s = int(s)
    if (h, s) in insample or s == 0: continue
    pool[classify(k)].append((hashlib.md5(k.encode()).hexdigest(), s, k, fam))
picks = []
for c, v in pool.items():
    if c in ('tar.gz', 'gz-other'): continue
    v.sort(); tot = sum(x[1] for x in v); step = tot / PER; nxt = step / 2; acc = 0
    for x in v:
        acc += x[1]
        while acc >= nxt and len([p for p in picks if p[0] == c]) < PER:
            picks.append((c,) + x); nxt += step
            break
res = collections.defaultdict(lambda: collections.Counter()); rows = []
for c, _, s, k, fam in picks:
    e = dict(env); e['RANGE'] = 'bytes=0-%d' % (PREFIX - 1)
    raw = subprocess.run(['node', CAT, k], capture_output=True, env=e).stdout
    data = raw
    if c == 'gz-text':
        try:
            d = zlib.decompressobj(31); data = d.decompress(raw)
        except zlib.error:
            continue
    gz6 = len(zlib.compress(data, 6)); xz6 = len(lzma.compress(data, preset=6))
    r = res[c]; r['files'] += 1; r['stored'] += len(raw); r['inflated'] += len(data); r['gz6'] += gz6; r['xz6'] += xz6
    rows.append({'class': c, 'family': fam, 'key': k, 'size': s, 'stored_prefix': len(raw), 'inflated': len(data), 'gz6': gz6, 'xz6': xz6})
out = {c: dict(v, gz6_over_stored=v['gz6'] / v['stored'], xz6_over_stored=v['xz6'] / v['stored']) for c, v in res.items()}
json.dump({'summary': out, 'rows': rows}, open(M + '/tables/46-class-sample.json', 'w'), indent=1)
for c, v in out.items():
    print('%-8s files %3d stored %7.1f MB inflated %7.1f MB  gz6/stored %.3f  xz6/stored %.3f' % (c, v['files'], v['stored'] / 1e6, v['inflated'] / 1e6, v['gz6_over_stored'], v['xz6_over_stored']))
