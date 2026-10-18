# DESIGN files-first, step 01 (read-only; never touches R2).
# Joins the 18 Oct listing with the md5 table (and the hazards survey's ETag listing for keys the
# table lacks), assigns every key to its unit with the census's unit rule, and writes:
#   out/01-numbers.json   size classes of distinct contents, keep-real set sizes, status bytes
#   out/01-examples.tsv   candidate example keys for the DESIGN's records
# Run: python3 -I 01-tables.py
import collections, json, re

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/design-files-first/out'
BUCKET = S + '/clean/bucket-now2.tsv'
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
ETAG = S + '/meta/hazards/bucket-etag.tsv'          # key size last_modified etag class (18 Oct 16:46-16:50 UTC)
BUILDS = S + '/meta/census/builds.tsv'

rows = []
for l in open(BUCKET, encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); rows.append((k, int(s), t))
md5 = {}
for l in open(MD5, encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
etag = {}
for l in open(ETAG, encoding='utf-8'):
    k, s, t, e, c = l.rstrip('\n').split('\t'); etag[k] = e
src = collections.Counter(); from_etag = set()
for k, s, t in rows:
    if k in md5: src['md5 table'] += 1
    elif re.fullmatch(r'[0-9a-f]{32}', etag.get(k, '')): md5[k] = etag[k]; src['etag'] += 1; from_etag.add(k)
    else: src['none'] += 1
assert src['none'] == 0, src

# census unit rule (copied from meta/census/scripts/census.py)
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

status = {}
for i, l in enumerate(open(BUILDS, encoding='utf-8')):
    if i == 0: continue
    f = l.rstrip('\n').split('\t'); status[f[0]] = (f[4], f[1], f[2])
miss = {unit_of(k) for k, s, t in rows} - set(status)
assert not miss, sorted(miss)[:5]

N = {'keys': len(rows), 'bytes': sum(s for _, s, _ in rows), 'md5_source': dict(src), 'units': len(status)}

# distinct contents by (md5,size)
cont = {}
for k, s, t in rows:
    c = (md5[k], s)
    d = cont.get(c)
    if d is None: cont[c] = d = [0, k]
    d[0] += 1
N['distinct_contents'] = len(cont)
N['distinct_bytes'] = sum(c[1] for c in cont)
N['copy_bytes'] = N['bytes'] - N['distinct_bytes']

# size classes of distinct contents (for the packing decision)
edges = [(0, '0 B'), (1024, '1 B-1 KiB'), (4096, '1-4 KiB'), (65536, '4-64 KiB'), (1 << 20, '64 KiB-1 MiB'),
         (16 << 20, '1-16 MiB'), (209715200, '16-200 MiB'), (1 << 62, '200 MiB and up')]
cls = collections.OrderedDict((n, [0, 0]) for _, n in edges)
for (h, s) in cont:
    for e, n in edges:
        if s <= e: cls[n][0] += 1; cls[n][1] += s; break
N['distinct_size_classes'] = {n: {'contents': v[0], 'bytes': v[1]} for n, v in cls.items()}
N['largest_content_bytes'] = max(s for _, s in cont)

# bytes by status, and distinct by status
st = collections.defaultdict(lambda: [0, 0])
for k, s, t in rows:
    x = status[unit_of(k)][0]; st[x][0] += 1; st[x][1] += s
N['by_status'] = {x: {'keys': v[0], 'bytes': v[1]} for x, v in st.items()}

# the keep-real set: keys that tools read by their own path today (readers survey) and keep rules
def under(prefixes, exact=()):
    ks = [(k, s) for k, s, t in rows if k in exact or any(k.startswith(p) for p in prefixes)]
    dc = {(md5[k], s) for k, s in ks}
    return {'keys': len(ks), 'bytes': sum(s for _, s in ks), 'distinct_bytes': sum(s for _, s in dc)}
PUSH_FETCH = ['moses-ledgers/toggle-builds-v1/', 'moses-ledgers/maqaf-reseal-v1/streams/', 'moses-ledgers/kq-reseal-v1/streams/',
              'moses-ledgers/frame/', 'moses-ledgers/lattice-v12/', 'moses-ledgers/v-ledger-v2/', 'moses-ledgers/toggle-ledgers-v1/',
              'corpus-lane-builds/moses-parse-source-and-declaration-v1/declaration-store-v7/',
              'corpus-lane-builds/moses-source-suggested-v1/v1.1/build/out/source-suggested-bsb/',
              'corpus-lane-builds/moses-megacompspan-toggles-v1/build/toggles-v1/']
N['keep_real'] = {
    'serving-lane/': under(['serving-lane/']),
    'MOSES-LEDGER-INDEX.md': under([], {'MOSES-LEDGER-INDEX.md'}),
    'push-toggles fetch prefixes (10)': under(PUSH_FETCH),
    'cas/': under(['cas/']),
    'all doors together': under(['serving-lane/', 'cas/'] + PUSH_FETCH, {'MOSES-LEDGER-INDEX.md'}),
}
# served payload (census served-payload.tsv) as prefixes or keys
served = []
for i, l in enumerate(open(S + '/meta/census/served-payload.tsv', encoding='utf-8')):
    if i == 0: continue
    served.append(l.rstrip('\n').split('\t')[1])
N['keep_real']['census served payload'] = under([p for p in served if p.endswith('/')], {p for p in served if not p.endswith('/')})
N['keep_real']['doors + served payload'] = under(['serving-lane/', 'cas/'] + PUSH_FETCH + [p for p in served if p.endswith('/')],
                                                  {'MOSES-LEDGER-INDEX.md'} | {p for p in served if not p.endswith('/')})

# key spelling classes (hazards survey reported them; recounted here on the 18 Oct 02:00 listing)
N['keys_with_space'] = sum(1 for k, _, _ in rows if ' ' in k)
N['keys_non_ascii'] = sum(1 for k, _, _ in rows if any(ord(c) > 127 for c in k))
N['zero_byte_keys'] = sum(1 for _, s, _ in rows if s == 0)
N['gz_keys'] = sum(1 for k, _, _ in rows if k.endswith('.gz'))

json.dump(N, open(OUT + '/01-numbers.json', 'w'), indent=1)

# example candidates
ex = open(OUT + '/01-examples.tsv', 'w', encoding='utf-8')
ex.write('why\tkey\tsize\tmd5\tlast_modified\tunit\tstatus\tkeys_with_same_content\n')
def put(why, k, s, t):
    u = unit_of(k); ex.write(f'{why}\t{k}\t{s}\t{md5[k]}\t{t}\t{u}\t{status[u][0]}\t{cont[(md5[k], s)][0]}\n')
byk = {k: (s, t) for k, s, t in rows}
for k in ['corpus-lane-builds/moses-span-store-v1/build-v1.4/span-store-v1.4/places/amos.jsonl',
          'cold/editorial-999-strike-20260830-evidence.tar.gz']:
    put('named', k, *byk[k])
# same content in a superseded and a current unit of the same family
fam_cur = collections.defaultdict(set)
for k, s, t in rows:
    x, fam, ver = status[unit_of(k)]
    if x == 'current': fam_cur[fam].add((md5[k], s))
n = 0
for k, s, t in rows:
    x, fam, ver = status[unit_of(k)]
    if x == 'superseded' and 2000 < s < 40000 and (md5[k], s) in fam_cur[fam] and n < 12:
        put('superseded shares with current', k, s, t); n += 1
n = 0
for k, s, t in rows:
    if k.endswith('.gz') and 500 < s < 60000 and status[unit_of(k)][0] == 'current' and n < 8: put('gz in current', k, s, t); n += 1
n = 0
for k, s, t in rows:
    if s == 0 and status[unit_of(k)][0] in ('current', 'superseded') and n < 6: put('zero-byte', k, s, t); n += 1
n = 0
for k, s, t in rows:
    if ' ' in k and s < 50000 and n < 10: put('space', k, s, t); n += 1
n = 0
for k, s, t in rows:
    if k in from_etag and 100 < s < 20000 and n < 6: put('md5 from etag only', k, s, t); n += 1
ex.close()
print(json.dumps(N, indent=1)[:4000])
