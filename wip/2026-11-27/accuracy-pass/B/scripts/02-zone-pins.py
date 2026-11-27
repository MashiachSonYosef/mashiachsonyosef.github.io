#!/usr/bin/env python3
# Walk every served zone's header (everything except per-word content) and list each 64-hex value with its path.
import json, gzip, re, sys, os
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D=S+'/base/reader/data'
out=S+'/w39/out/B/data/zone-header-hashes.tsv'
HEX=re.compile(r'\b[0-9a-f]{64}\b')
r=json.load(open(D+'/serve-gate-receipt-v1.json'))
rows=[]
def walk(o,path,slug):
    if isinstance(o,dict):
        for k,v in o.items():
            if path=='' and k in ('sections',): continue
            walk(v,path+'.'+str(k) if path else str(k),slug)
    elif isinstance(o,list):
        for i,v in enumerate(o):
            walk(v,path+'['+str(i)+']',slug)
    elif isinstance(o,str):
        for m in HEX.findall(o):
            rows.append((slug,path,m,o[:200].replace('\t',' ').replace('\n',' ') if len(o)!=64 else ''))
topkeys={}
for slug in sorted(r['served']):
    z=json.load(gzip.open(f'{D}/zones/{slug}.bin'))
    topkeys[slug]=[k for k in z.keys()]
    walk(z,'',slug)
with open(out,'w') as f:
    f.write('slug\tpath\tsha256\tcontext\n')
    for x in rows: f.write('\t'.join(x)+'\n')
print(len(rows))
import collections
c=collections.Counter(re.sub(r'\[\d+\]','[]',p) for _,p,_,_ in rows)
for k,v in sorted(c.items()): print(v,k)
print(topkeys['amos'])
