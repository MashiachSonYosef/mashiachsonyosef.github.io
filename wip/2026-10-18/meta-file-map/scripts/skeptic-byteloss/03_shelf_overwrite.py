# Step 5 (shelf refresh) overwrites serving-lane/shelf/zones/<name>.bin keys whose bytes differ from the site's pins.
# How many bytes would it overwrite, and do those bytes have any copy off R2 (Moses's disk md5s, git blobs)?
import json, hashlib, os, subprocess, collections
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
pins = json.load(open(S + '/ghp/reader/data/zone-store-v1.json'))['pins']
head = {}
for l in open(S + '/meta/hazards/head-serving-lane.jsonl'):
    d = json.loads(l); head[d['k']] = d['headers']
r2 = {}
for line in open(S + '/meta/hazards/bucket-etag.tsv', encoding='utf-8'):
    k, s, lm, et, sc = line.rstrip('\n').split('\t')
    if k.startswith('serving-lane/'): r2[k] = (et, int(s))
off = set()
for line in open(S + '/meta/copies/out/local-known-md5.tsv'):
    m, s = line.split('\t')[:2]; off.add((m, int(s)))
for line in open(S + '/meta/copies/out/git-blob-md5.tsv'):
    p = line.rstrip('\n').split('\t'); off.add((p[2], int(p[1])))
# git history blobs of the bins at any size: md5 of every reader/data/zones/*.bin blob in history is not in git-blob-md5 unless sizes matched an R2 size; git-blob-md5 covers exactly those.
c = collections.Counter()
for name, p in pins.items():
    k = 'serving-lane/shelf/zones/' + name
    if k not in r2: c['pinned bins absent from shelf'] += 1; continue
    et, sz = r2[k]
    meta_sha = head.get(k, {}).get('x-amz-meta-sha256')
    same = (meta_sha == p['sha256'] and sz == p['bytes'])
    if same: c['shelf key equals pin (by x-amz-meta-sha256 and size)'] += 1; continue
    c['shelf keys step 5 overwrites'] += 1; c['bytes step 5 overwrites'] += sz
    if (et, sz) in off: c['of them: old bytes also off R2 (md5+size)'] += 1; c['of them: old bytes also off R2, bytes'] += sz
    else: c['of them: old bytes on R2 only'] += 1; c['of them: old bytes on R2 only, bytes'] += sz
print(json.dumps(c, indent=1))
