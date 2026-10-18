# R2-only contents (no md5+size match on Moses's disk or in git history) by how many R2 keys hold them today.
import json, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
H = S + '/meta/hazards'
mp = {r['k']: r['md5'] for r in json.load(open(H + '/multipart-verify.json'))['rows']}
keys = collections.defaultdict(list)
for line in open(H + '/bucket-etag.tsv', encoding='utf-8'):
    k, s, lm, et, sc = line.rstrip('\n').split('\t')
    md5 = mp[k] if '-' in et else et
    keys[(md5, int(s))].append(k)
local = set()
for line in open(S + '/meta/copies/out/local-known-md5.tsv'):
    m, s = line.split('\t')[:2]; local.add((m, int(s)))
for line in open(S + '/meta/copies/out/git-blob-md5.tsv'):
    p = line.rstrip('\n').split('\t'); local.add((p[2], int(p[1])))
out = collections.Counter(); tops = collections.Counter()
for c, ks in keys.items():
    off = c in local
    n = len(ks)
    bucket = 'off-R2 copy known' if off else ('R2-only, 1 key today' if n == 1 else 'R2-only, 2+ keys today')
    out[bucket + ' contents'] += 1; out[bucket + ' bytes'] += c[1]
    if not off and n >= 2:
        units = {k.split('/')[0] + '/' + (k.split('/')[1] if k.startswith(('corpus-lane-builds/', 'moses-ledgers/', 'cold/')) and k.count('/') > 1 else '') for k in ks}
        if len(units) >= 2: out['R2-only, 2+ keys in 2+ top folders/builds bytes'] += c[1]; out['R2-only, 2+ keys in 2+ top folders/builds contents'] += 1
        tops[ks[0].split('/')[0]] += c[1]
print(json.dumps({'contents': len(keys), **out, 'r2only_2plus_by_top_of_first_key_bytes': tops.most_common(12)}, indent=1))
