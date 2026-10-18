# 05_git_blobs.py - site repo history: blob sizes, biggest blobs, by top folder; candidates for R2 match by size.
import collections, json
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O=S+'/meta/copies/out'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
path={}
for line in open(O+'/git-objects-all.txt', encoding='utf-8', errors='surrogateescape'):
    line=line.rstrip('\n'); sha,_,p=line.partition(' ')
    if sha not in path: path[sha]=p
blobs={}
for line in open(O+'/git-objects-sizes.txt'):
    sha,t,sz,dsk=line.split()
    if t=='blob': blobs[sha]=(int(sz),int(dsk))
tot=sum(v[0] for v in blobs.values()); dtot=sum(v[1] for v in blobs.values())
by_top=collections.defaultdict(lambda:[0,0,0])
for sha,(sz,d) in blobs.items():
    p=path.get(sha,'')
    parts=p.split('/')
    top=parts[0] if len(parts)>1 else '(root file)'
    if top=='reader' and len(parts)>2: top='reader/'+parts[1]
    if top=='reader/data' and len(parts)>3: top='reader/data/'+parts[2]
    by_top[top][0]+=1; by_top[top][1]+=sz; by_top[top][2]+=d
big=sorted(blobs.items(), key=lambda x:-x[1][0])[:40]
r2sizes=collections.Counter()
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); r2sizes[int(sz)]+=1
cand=[sha for sha,(sz,d) in blobs.items() if sz>0 and sz in r2sizes]
open(O+'/git-blob-candidates.txt','w').write('\n'.join(cand)+'\n')
res=dict(blobs=len(blobs), blob_bytes=tot, blob_disk_bytes=dtot,
  by_top_level=sorted([[k]+v for k,v in by_top.items()], key=lambda x:-x[2])[:40],
  biggest=[[sha, sz, d, path.get(sha)] for sha,(sz,d) in big],
  r2_size_candidates=len(cand), r2_size_candidate_bytes=sum(blobs[s][0] for s in cand))
json.dump(res, open(O+'/05-git-blobs.json','w'), indent=1)
print(json.dumps({k:v for k,v in res.items() if k!='biggest'}, indent=0)[:6000])
for b in res['biggest'][:25]: print(b)
