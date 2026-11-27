#!/usr/bin/env python3
# Walk every JSON file under reader/data (not zones, not shards) and list each 64-hex value with file, JSON path, and sibling scalar fields.
import json, gzip, re, sys, os
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D=S+'/base/reader/data'
out=S+'/w39/out/B/data/all-recorded-hashes.tsv'
HEX=re.compile(r'(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])')
rows=[]
def sib(parent):
    if not isinstance(parent,dict): return ''
    parts=[]
    for k,v in parent.items():
        if isinstance(v,(str,int,float)) and not (isinstance(v,str) and HEX.fullmatch(v)):
            s=str(v)
            if len(s)>140: s=s[:140]+'…'
            parts.append(f'{k}={s}')
    return ' ; '.join(parts)[:600].replace('\t',' ').replace('\n',' ')
def walk(o,path,rel,parent):
    if isinstance(o,dict):
        for k,v in o.items():
            # a key may itself be a hash
            if isinstance(k,str) and HEX.fullmatch(k):
                rows.append((rel,path+'{key}',k,'(hash used as a key)'))
            walk(v,path+'.'+str(k) if path else str(k),rel,o)
    elif isinstance(o,list):
        for i,v in enumerate(o):
            walk(v,path+'['+str(i)+']',rel,parent if not isinstance(o,dict) else o)
    elif isinstance(o,str):
        for m in HEX.findall(o):
            rows.append((rel,path,m,sib(parent) if len(o)==64 else ('in text: '+o[:300].replace('\t',' ').replace('\n',' '))))
skipdirs={'zones','shards'}
nfiles=0
for root,dirs,files in os.walk(D):
    dirs[:]=[d for d in dirs if d not in skipdirs]
    for fn in files:
        p=os.path.join(root,fn); rel=os.path.relpath(p,D)
        if fn.endswith('.json'):
            try:
                if os.path.getsize(p)>60_000_000: 
                    print('skip big',rel); continue
                o=json.load(open(p))
            except Exception as e:
                print('unreadable',rel,e); continue
            nfiles+=1
            walk(o,'',rel,None)
with open(out,'w') as f:
    f.write('file\tjson_path\tsha256\tsiblings\n')
    for x in rows: f.write('\t'.join(x)+'\n')
print('json files',nfiles,'hash occurrences',len(rows),'distinct',len(set(r[2] for r in rows)))
import collections
c=collections.Counter(r[0] for r in rows)
for k,v in c.most_common(80): print(v,k)
