# Of the keys missing from the 17 Oct md5 snapshot, how many bytes hold content with no known off-R2 copy?
import json, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
H = S + '/meta/hazards'
snap = set()
for line in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) >= 3: snap.add(p[2])
local = set()
for line in open(S + '/meta/copies/out/local-known-md5.tsv'):
    m, s = line.split('\t')[:2]; local.add((m, int(s)))
for line in open(S + '/meta/copies/out/git-blob-md5.tsv'):
    p = line.rstrip('\n').split('\t'); local.add((p[2], int(p[1])))
allc = collections.defaultdict(set)
rows = []
for line in open(H + '/bucket-etag.tsv', encoding='utf-8'):
    k, s, lm, et, sc = line.rstrip('\n').split('\t'); rows.append((k, int(s), lm, et))
    allc[(et, int(s))].add(k in snap)
c = collections.Counter(); by = collections.Counter(); dates = collections.Counter()
seen = set()
for k, s, lm, et in rows:
    if k in snap: continue
    c['keys not in snapshot'] += 1; c['bytes not in snapshot'] += s
    key = (et, s)
    if key in local: c['of them: off-R2 copy known, bytes'] += s; continue
    if True in allc[key]: c['of them: same content also at a snapshot key, bytes'] += s; continue
    c['of them: content seen only at post-snapshot keys, no off-R2 copy known, keys'] += 1
    c['of them: content seen only at post-snapshot keys, no off-R2 copy known, bytes'] += s
    by['/'.join(k.split('/')[:2])] += s; dates[lm[:10]] += s
print(json.dumps({**c, 'by_folder_bytes': by.most_common(15), 'by_upload_day_bytes': sorted(dates.items())}, indent=1))
