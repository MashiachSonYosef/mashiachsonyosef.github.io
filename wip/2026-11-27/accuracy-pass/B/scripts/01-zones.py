#!/usr/bin/env python3
# Re-hash every served zone (and its sidecars) and compare with serve-gate-receipt served_sha256.
import json, hashlib, os, sys, gzip
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D=S+'/base/reader/data'
out=S+'/w39/out/B/data/zones-rehash.tsv'
r=json.load(open(D+'/serve-gate-receipt-v1.json'))
sh=r['served_sha256']
def h(p):
    m=hashlib.sha256()
    with open(p,'rb') as f:
        for c in iter(lambda:f.read(1<<20),b''): m.update(c)
    return m.hexdigest()
rows=[]
ok=bad=0
for slug in sorted(sh):
    p=f'{D}/zones/{slug}.bin'
    t=h(p); n=os.path.getsize(p)
    m='MATCH' if t==sh[slug] else 'MISMATCH'
    ok+= m=='MATCH'; bad+= m!='MATCH'
    rows.append((slug,'zone',f'reader/data/zones/{slug}.bin',n,sh[slug],t,m))
with open(out,'w') as f:
    f.write('slug\trole\tpath\tbytes\tsha256_recorded\tsha256_today\tverdict\n')
    for x in rows: f.write('\t'.join(map(str,x))+'\n')
print('served',len(sh),'match',ok,'mismatch',bad)
print([s for s in sh if s not in r['served']], len(r['served']))
