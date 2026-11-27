#!/usr/bin/env python3
# For each recorded hash whose record names a file that stands in the tree: are today's bytes the recorded ones?
import os, re, sys, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'
B=S+'/base'
bypath={}
for i,l in enumerate(open(W+'/data/tree-hashes.tsv')):
    if i==0: continue
    p,b,h,ub,uh=l.rstrip('\n').split('\t')
    bypath[p]=(h,uh,b,ub)
def resolve(name, recfile):
    name=name.strip()
    if not name or len(name)>300 or ' ' in name and not name.startswith('data/') : 
        pass
    cands=[name, 'reader/'+name, 'reader/data/'+name, os.path.normpath(os.path.join('reader/data',os.path.dirname(recfile),name))]
    for c in cands:
        c=os.path.normpath(c)
        if c in bypath: return c
    return None
out=[]
stat=collections.Counter()
for i,l in enumerate(open(W+'/data/recorded-hashes-classified.tsv')):
    if i==0: continue
    rec,jp,h,where,hit,sib=l.rstrip('\n').split('\t',5)
    names=[]
    for part in sib.split(' ; '):
        if '=' in part:
            k,v=part.split('=',1)
            if k in ('file','path','name','record','list','from','store_file','local','kept','kept_as','in_this_tree','here','at'):
                names.append((k,v))
    # also the json key may be the file name (e.g. files.<name>.sha256, pins.<name>.sha256)
    m=re.search(r'(?:files|pins|shards|members|bins)\.([^.\[]+(?:\.[A-Za-z0-9_-]+)*)\.(?:sha256|bytes)$',jp)
    if m: names.append(('key',m.group(1)))
    res=None
    for k,v in names:
        r=resolve(v,rec)
        if r: res=(k,v,r); break
    if not res:
        stat['names_no_tree_file']+=1; continue
    k,v,r=res
    th,tuh,tb,tub=bypath[r]
    if h==th: verdict='MATCH'
    elif h==tuh: verdict='MATCH_UNZIPPED'
    else: verdict='OTHER_BYTES'
    stat[verdict]+=1
    out.append((rec,jp,h,r,th,verdict,sib))
with open(W+'/data/named-file-rehash.tsv','w') as o:
    o.write('recorded_in\tjson_path\tsha256_recorded\ttree_file_named\tsha256_today\tverdict\tsiblings\n')
    for r in out: o.write('\t'.join(r)+'\n')
print(stat)
c=collections.Counter((r[0]) for r in out if r[5]=='OTHER_BYTES')
for k,v in c.most_common(60): print(v,k)
