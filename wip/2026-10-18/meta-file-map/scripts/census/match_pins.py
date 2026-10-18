# Match the site's pinned files (basename + exact bytes) to bucket keys; report which top units hold them.
import json, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/census'
P = json.load(open(OUT + '/_site-pins.json'))
by = collections.defaultdict(list)
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t')
    by[(k.rsplit('/', 1)[-1], int(s))].append(k)
md5 = {}
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
def unit(k):
    p = k.split('/')
    if p[0] in ('corpus-lane-builds', 'moses-ledgers') and len(p) > 2: return p[0] + '/' + p[1] + '/'
    return p[0] + '/'
seen = set(); hits = collections.defaultdict(lambda: collections.Counter()); miss = collections.Counter()
rows = []
for src, jp, base, b, h, full in P['pins']:
    if b is None: continue
    key = (base, b)
    if key in seen: continue
    seen.add(key)
    ks = by.get(key, [])
    if not ks: miss[src.split('/')[0]] += 1; rows.append((src, jp, base, b, '', 'NO-KEY')); continue
    # the "home" copy: the shortest key path
    ks = sorted(ks, key=lambda k: (k.count('/'), k))
    rows.append((src, jp, base, b, ks[0], '%d keys' % len(ks)))
    hits[unit(ks[0])][src.split('/')[0]] += 1
with open(OUT + '/site-pins-matched.tsv', 'w', encoding='utf-8') as f:
    f.write('site_file\tjson_path\tbasename\tbytes\thome_key(shortest path with same name+size)\tcopies\n')
    for r in rows: f.write('\t'.join(map(str, r)) + '\n')
print('pins with bytes:', len(seen), 'matched:', sum(1 for r in rows if r[4]), 'missing:', sum(miss.values()), dict(miss))
for u, c in sorted(hits.items(), key=lambda x: -sum(x[1].values())): print(sum(c.values()), u, dict(c))
