# 09_reader_data_copies.py - files in origin/main reader/data (the live site) byte-equal to an R2 object:
# which are copies OF a build output (R2 key outside any cache/scratch/gate folder) and which are only
# found inside Moses's check caches (copies made FROM the site).
import subprocess, collections, json, re
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O=S+'/meta/copies/out'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
r2=collections.defaultdict(list)
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); r2[(m,int(sz))].append(k)
bm={}
for line in open(O+'/git-blob-md5.tsv'):
    sha,sz,m=line.split(); bm[sha]=(m,int(sz))
CACHE=re.compile(r'/(cache|scratch|sandbox|gate[^/]*|probe-cache[^/]*|fetched|stage|tmp[^/]*)/')
out=subprocess.run(['git','-C',S+'/ghp','ls-tree','-r','-l','origin/main','reader/data'],capture_output=True).stdout.decode('utf-8','surrogateescape')
rows=[]
for line in out.splitlines():
    meta,_,p=line.partition('\t'); mode,t,sha,sz=meta.split()
    if t!='blob': continue
    c=bm.get(sha); keys=r2.get(c,[]) if c else []
    if not keys: continue
    real=[k for k in keys if not CACHE.search(k)]
    rows.append(dict(path=p, bytes=int(sz), kind='copy of a build output' if real else 'only in R2 check caches (copied from the site)', r2=(real or keys)[:3]))
agg=collections.defaultdict(lambda:[0,0])
for r in rows: agg[r['kind']][0]+=1; agg[r['kind']][1]+=r['bytes']
byb=collections.defaultdict(lambda:[0,0])
for r in rows:
    if r['kind']=='copy of a build output':
        b='/'.join(r['r2'][0].split('/')[:2]); byb[b][0]+=1; byb[b][1]+=r['bytes']
res=dict(summary=dict(agg), copies_of_build_outputs_by_build=dict(byb), rows=rows)
json.dump(res, open(O+'/09-reader-data-copies.json','w'), indent=1)
print(dict(agg)); print(dict(byb))
for r in rows:
    if r['kind']=='copy of a build output': print(r['path'], r['bytes'], r['r2'][0])
