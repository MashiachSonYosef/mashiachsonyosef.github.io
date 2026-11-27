#!/usr/bin/env python3
# For each pin entry whose file is not in the tree, find candidate objects on the corpus lane's store by file name.
import os, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'
store=collections.defaultdict(list)
for l in open(W+'/data/store-listing-v2-2026-11-27.tsv'):
    k,sz,dt=l.rstrip('\n').split('\t')
    b=os.path.basename(k)
    store[b].append((k,int(sz)))
out=[]
tot=0
for i,l in enumerate(open(W+'/data/pin-entries-rehash.tsv')):
    if i==0: continue
    pin,jp,name,byt,stored,sha,tf,st,verdict=l.rstrip('\n').split('\t')
    if verdict!='NOT_IN_TREE' or not name or 'letter' in jp: continue
    b=os.path.basename(name)
    c=store.get(b,[])+store.get(b+'.gz',[])
    out.append((pin,jp,name,byt,sha,c))
seen=set()
for pin,jp,name,byt,sha,c in out:
    print(pin.replace('reader/data/',''),'|',jp,'|',name,'|',byt,'|',sha[:12],'|',len(c),'|',' ; '.join(f'{k} ({s})' for k,s in c[:3]))
