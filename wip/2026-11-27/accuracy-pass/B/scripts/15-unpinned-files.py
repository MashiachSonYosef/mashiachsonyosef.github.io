#!/usr/bin/env python3
# Which files under reader/data does no record in the tree name by sha256 (raw or unzipped)?
import collections, os, re
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'
rec=collections.defaultdict(set)
for fn in ('all-recorded-hashes.tsv','zone-header-hashes.tsv'):
    for i,l in enumerate(open(W+'/data/'+fn)):
        if i==0: continue
        p=l.rstrip('\n').split('\t')
        rec[p[2]].add(p[0])
for i,l in enumerate(open(W+'/data/resting-lines-read-off.tsv')):
    if i==0: continue
    q=l.rstrip('\n').split('\t')
    rec[q[2]].add('resting-lines/'+q[0]+'.json.gz read_off.files')
# hashes hard-coded in tools / html / md
for root,dirs,files in os.walk(S+'/base/reader/tools'):
    for f in files:
        try: t=open(os.path.join(root,f),encoding='utf8',errors='ignore').read()
        except: continue
        for h in re.findall(r'(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])',t): rec[h].add('tools/'+f)
groups=collections.defaultdict(lambda: [0,0,0,0])  # files, bytes, pinned files, pinned bytes
unp=[]
for i,l in enumerate(open(W+'/data/tree-hashes.tsv')):
    if i==0: continue
    p,b,h,ub,uh=l.rstrip('\n').split('\t')
    if not p.startswith('reader/data/'): continue
    rel=p[len('reader/data/'):]
    top=rel.split('/')[0]
    if '/' in rel and rel.split('/')[1] in ('shards',): top=top+'/shards'
    g=groups[top]; g[0]+=1; g[1]+=int(b)
    by=(rec.get(h) or (rec.get(uh) if uh else None))
    # a record naming its own bytes does not count
    by={x for x in (by or set()) if x!=rel}
    if by: g[2]+=1; g[3]+=int(b)
    else: unp.append((p,b,h))
with open(W+'/data/unpinned-data-files.tsv','w') as f:
    f.write('path\tbytes\tsha256_today\n')
    for x in unp: f.write('\t'.join(x)+'\n')
print('files under reader/data:',sum(g[0] for g in groups.values()),'named by a sha256 somewhere:',sum(g[2] for g in groups.values()),'not named:',len(unp))
print('%-34s %6s %12s %6s %12s'%('folder','files','bytes','pinned','unpinned'))
for k,g in sorted(groups.items(), key=lambda kv:-(kv[1][1]-kv[1][3])):
    print('%-34s %6d %12d %6d %12d'%(k,g[0],g[1],g[2],g[0]-g[2]))
