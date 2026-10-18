# 03_scratch_none_anywhere.py - scratch-unit files the ledger found no kept R2 copy for:
# does ANY R2 key (17 Oct md5 table) hold the same md5+size? Also physical bytes (one per inode).
import json, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
B=L+'/build'
r2=collections.defaultdict(list)
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); r2[(m,int(sz))].append(k)
files={}
for l in open(B+'/proofs/scratch/files.jsonl'):
    j=json.loads(l); files[j['path']]=j
fb={}
for l in open(B+'/proofs/scratch/fallback-hashes.jsonl'):
    j=json.loads(l); fb[j['path']]=j
c=collections.Counter(); ex=collections.defaultdict(list)
seen_ino=set(); phys=collections.Counter()
by_build=collections.defaultdict(lambda:[0,0])
for l in open(B+'/proofs/scratch/matches.jsonl'):
    j=json.loads(l)
    if j['outcome']=='ON_R2': continue
    f=files[j['path']]; m=f.get('md5') or (fb.get(j['path']) or {}).get('md5')
    sz=f['size']
    if m is None: k='no md5 known'
    else:
        keys=r2.get((m,sz),[])
        if not keys: k='no R2 key anywhere'
        else:
            k='on R2 at the same path' if any(x.endswith('/'+j['path'].split('/',1)[1]) or x=='corpus-lane-builds/'+j['path'].split('/',1)[1] for x in keys) else 'on R2 elsewhere (scratch/gate copy)'
            if len(ex[k])<3: ex[k].append((j['path'],keys[:2]))
    c[k+' files']+=1; c[k+' bytes']+=sz
    ino=(f.get('dev'),f.get('ino'))
    if k=='no R2 key anywhere':
        by_build[j['path'].split('/')[1]][0]+=1; by_build[j['path'].split('/')[1]][1]+=sz
        if ino not in seen_ino or ino==(None,None):
            seen_ino.add(ino); phys['no R2 key anywhere physical bytes']+=sz
print(json.dumps(dict(c),indent=1)); print(dict(phys))
for k,v in ex.items(): print(k, v)
bb=sorted(by_build.items(), key=lambda x:-x[1][1])
print('no R2 key anywhere, by build:'); [print('  ',k,v) for k,v in bb[:25]]
json.dump(dict(counts=dict(c), physical=dict(phys), by_build=dict(bb)), open(S+'/meta/copies/out/03-scratch-none-anywhere.json','w'), indent=1)
