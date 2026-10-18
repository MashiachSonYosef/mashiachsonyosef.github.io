import json, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
H=S+'/meta/hazards/'
mp={}
for l in open(H+'stream-hash-multipart.jsonl'):
    r=json.loads(l); mp[r['k']]=r['md5']
snap=set()
for l in open(S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv',encoding='utf-8'):
    h,s,k=l.rstrip('\n').split('\t',2); snap.add((h,int(s)))
now={}; outside=collections.Counter(); okeys=0
for l in open(H+'bucket-etag.tsv',encoding='utf-8'):
    k,s,lm,et,sc=l.rstrip('\n').split('\t'); s=int(s); c=(mp.get(k,et),s); now[c]=s
nos=[c for c in now if c not in snap]
print('16:46 contents',len(now),'bytes',sum(now.values()))
print('contents absent from the 02-r2-md5 snapshot',len(nos),'bytes',sum(c[1] for c in nos))
print('snapshot contents',len(snap),'bytes',sum(c[1] for c in snap))
