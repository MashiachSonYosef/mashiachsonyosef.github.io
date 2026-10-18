# 10_fs_and_mirrors.py - (1) 999 footsteps (FS) folders beside R2 prefixes of the same name (sizes only: FS was never
# hashed, so any overlap is an estimate); (2) the "stage/Documents/The Tabernacle/" mirrors on R2 and on Moses's disk.
import json, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O=S+'/meta/copies/out'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
bucket={}
for line in open(S+'/clean/bucket-now2.tsv'):
    k,sz,lm=line.rstrip('\n').split('\t'); bucket[k]=int(sz)
md5={}
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); md5[k]=(m,int(sz))
def r2(prefix):
    n=b=0
    for k,s in bucket.items():
        if k.startswith(prefix): n+=1; b+=s
    return n,b
fs={}
for l in open(L+'/inventory-local/out/inventory-local.jsonl'):
    j=json.loads(l)
    if j['root']=='FS': fs[j['item']]=j
d2={}
for l in open(L+'/inventory-local/out/footsteps-depth2.jsonl'):
    j=json.loads(l); d2[j['dir']]=j
pairs=[('FS/corpus-refinement-v1','corpus-staging/corpus-refinement-v1/'),
       ('FS/corpus-refinement-v1/work','corpus-staging/corpus-refinement-v1/work/'),
       ('FS/corpus-refinement-v1/output','corpus-staging/corpus-refinement-v1/output/'),
       ('FS/corpus-refinement-v1/src','corpus-staging/corpus-refinement-v1/src/'),
       ('FS/ledgers','corpus-staging/ledgers/'),
       ('FS/ledgers/work','corpus-staging/ledgers/work/'),
       ('FS/rebuild-c0-w','corpus-staging/rebuild-c0-w/'),
       ('FS/rebuild-c0-w/output','corpus-staging/rebuild-c0-w/output/'),
       ('FS/corpus-lane','corpus-staging/corpus-lane/'),
       ('FS/editorial-999','cold/editorial-999-20260830/'),
       ('FS/editorial-999/analysis','cold/editorial-999-20260830/analysis/'),
       ('FS/editorial-999/work','cold/editorial-999-20260830/work/'),
       ('FS/corpus-lane-builds','corpus-lane-builds/moses-piece-store-v2/'),
       ('FS/definition-poc',None),('FS/commentary-poc',None),('FS/.git',None),('FS/storage-maintenance-v1',None),('FS/analysis',None)]
rows=[]
for f,p in pairs:
    if f in fs: lb=fs[f]['subtree_bytes'] or fs[f]['bytes']; lf=fs[f]['subtree_files'] or fs[f]['files']
    elif f in d2: lb=d2[f]['subtree_bytes']; lf=d2[f]['subtree_files']
    else: lb=lf=None
    n,b=r2(p) if p else (0,0)
    rows.append(dict(fs=f, fs_bytes=lb, fs_files=lf, r2_prefix=p, r2_objects=n, r2_bytes=b))
# whole FS vs whole R2 prefixes outside corpus-lane-builds that look like FS copies
fs_total=json.load(open(L+'/inventory-local/out/totals.json'))['by_root']['FS']
# (2) mirrors
mir=collections.Counter(); mirx=[]
for k,(m,sz) in md5.items():
    i=k.find('/stage/Documents/The Tabernacle/')
    if i<0: continue
    rest=k[i+len('/stage/Documents/The Tabernacle/'):]
    tw=md5.get(rest)
    st='same bytes at the mirrored key' if tw==(m,sz) else ('other bytes at the mirrored key' if tw else 'mirrored key absent')
    mir[st+' objects']+=1; mir[st+' bytes']+=sz
    if st!='same bytes at the mirrored key' and len(mirx)<5: mirx.append((k,rest))
res=dict(fs_total=fs_total, fs_vs_r2_by_name=rows, r2_stage_mirrors=dict(mir), r2_stage_mirror_examples=mirx)
json.dump(res, open(O+'/10-fs-and-mirrors.json','w'), indent=1)
for r in rows: print(r)
print(dict(mir)); print(mirx)
