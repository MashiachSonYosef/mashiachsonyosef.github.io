import json, collections
H='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards/'
mp={}
for l in open(H+'stream-hash-multipart.jsonl'):
    r=json.loads(l); mp[r['k']]=r['md5']
rows=[]
for l in open(H+'bucket-etag.tsv'):
    k,s,lm,et,sc=l.rstrip('\n').split('\t'); s=int(s)
    rows.append((k,s,mp.get(k,et)))
A='corpus-lane-builds/moses-witnessed-order-v2.3/'; B='corpus-lane-builds/moses-witnessed-order-v2.4/'
a={(m,s) for k,s,m in rows if k.startswith(A)}
new=collections.defaultdict(int); seen=set(); files=[]
for k,s,m in rows:
    if k.startswith(B) and (m,s) not in a and (m,s) not in seen:
        seen.add((m,s)); files.append((s,k))
files.sort(reverse=True)
print('new distinct contents',len(files),'bytes',sum(f[0] for f in files))
for s,k in files[:15]: print(s,k)
gz=sum(s for s,k in files if 'old-witness-table' in k)
print('old-witness-table share of new bytes',gz)
