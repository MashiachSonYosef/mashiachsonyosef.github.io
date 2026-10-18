# 04_plus_lines.py - local files that rclone check found missing on R2 at the same path ("+" and "*").
# Are they hard links of a file whose content IS on R2 ("=" line or scratch ON_R2)? Is their path on R2 now (18 Oct)?
import json, collections, os
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
B=L+'/build'
bucket={}
for line in open(S+'/clean/bucket-now2.tsv'):
    k,sz,lm=line.rstrip('\n').split('\t'); bucket[k]=(int(sz),lm)
jobs=json.load(open(B+'/out/sweep-jobs.json'))['jobs']
eq=set(); plus=[]
for j in jobs:
    f=B+'/proofs/check/'+j['job']+'.combined.txt'
    if not os.path.exists(f): continue
    for line in open(f):
        line=line.rstrip('\n')
        if not line: continue
        st,rel=line[0],line[2:]
        p=j['src']+'/'+rel
        if st=='=': eq.add(p)
        else: plus.append((st,p,j['dst']+'/'+rel))
onr2=set()
for l in open(B+'/proofs/scratch/matches.jsonl'):
    r=json.loads(l)
    if r['outcome']=='ON_R2': onr2.add(r['path'])
grp={}
groups=[]
for l in open(L+'/inventory-local/out/hardlink-groups.jsonl'):
    g=json.loads(l); groups.append(g)
    for p in g['paths']: grp[p]=len(groups)-1
c=collections.Counter(); ex=collections.defaultdict(list); b=collections.Counter()
for st,p,key in plus:
    if key in bucket: k='path on R2 by 18 Oct (uploaded after the check)'; b[k]+=bucket[key][0]
    elif p in grp:
        g=groups[grp[p]]
        if any(q in eq or q in onr2 for q in g['paths'] if q!=p): k='hard link of a file whose bytes are on R2'; b[k]+=int(g['bytes'])
        else: k='hard link, no linked name proved on R2'; b[k]+=int(g['bytes'])
    else: k='no R2 path, not a hard link (bytes unknown here)'
    c[(st,k)]+=1
    if len(ex[k])<4: ex[k].append(p)
for k,v in c.items(): print(k,v)
print(dict(b))
for k,v in ex.items(): print(k); [print('   ',x) for x in v]
json.dump(dict(counts={'|'.join(k):v for k,v in c.items()}, bytes=dict(b), examples=ex), open(S+'/meta/copies/out/04-plus-lines.json','w'), indent=1)
