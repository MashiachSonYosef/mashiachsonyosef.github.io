# Probe: which keys have a directory segment, inside their build, that names another build.
import collections, sys
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
B=S+'/clean/bucket-now2.tsv'
rows=[l.rstrip('\n').split('\t') for l in open(B,encoding='utf-8')]
names=set()
for k,s,t in rows:
    p=k.split('/')
    if p[0]=='corpus-lane-builds' and len(p)>2: names.add(p[1])
    if p[0]=='moses-ledgers' and len(p)>2: names.add(p[1])
    if len(p)>1: names.add(p[0])
names-= {'corpus-lane-builds','moses-ledgers'}
c=collections.Counter(); b=collections.Counter(); ex={}
for k,s,t in rows:
    p=k.split('/')
    if p[0]=='corpus-lane-builds' and len(p)>2: own=p[1]; inner=p[2:]
    elif p[0]=='moses-ledgers' and len(p)>2: own=p[1]; inner=p[2:]
    else: own=p[0]; inner=p[1:]
    for i,seg in enumerate(inner[:-1]):
        if seg in names and seg!=own:
            key=(own,seg); c[key]+=1; b[key]+=int(s); ex.setdefault(key,k); break
tot=sum(b.values()); print('pairs',len(c),'keys',sum(c.values()),'bytes',tot)
for key,v in sorted(b.items(),key=lambda x:-x[1]):
    print('%s\t%s\t%d\t%d\t%s'%(key[0],key[1],c[key],v,ex[key]))
