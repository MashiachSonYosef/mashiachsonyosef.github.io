# 08_r2_second_copies.py - for each R2 top-level prefix: keys, bytes, distinct content (md5+size),
# and how much of that distinct content has a second copy proved by hash on Moses's disk (CLB) or in the
# site git history; the rest is "R2-only as far as any hash shows". Distinct contents found under more
# than one prefix are counted under each prefix that holds them (so prefix rows overlap), and once in the total.
import collections, json
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O=S+'/meta/copies/out'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
md5={}
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); md5[k]=(m,int(sz))
bucket={}
for line in open(S+'/clean/bucket-now2.tsv'):
    k,sz,lm=line.rstrip('\n').split('\t'); bucket[k]=int(sz)
local=set()
for line in open(O+'/local-known-md5.tsv'):
    m,sz=line.split(); local.add((m,int(sz)))
git=set()
for line in open(O+'/git-blob-md5.tsv'):
    sha,sz,m=line.split(); git.add((m,int(sz)))
def top(k):
    p=k.split('/')
    return p[0] if len(p)>1 else '(root file)'
rows=collections.defaultdict(lambda: dict(keys=0,bytes=0,no_md5_keys=0,no_md5_bytes=0))
cont=collections.defaultdict(set)
for k,sz in bucket.items():
    t=top(k); r=rows[t]; r['keys']+=1; r['bytes']+=sz
    if k in md5: cont[t].add(md5[k])
    else: r['no_md5_keys']+=1; r['no_md5_bytes']+=sz
allc=set().union(*cont.values())
def split(cs):
    d=sum(c[1] for c in cs); l=sum(c[1] for c in cs if c in local); g=sum(c[1] for c in cs if c in git and c not in local)
    o=sum(c[1] for c in cs if c not in local and c not in git)
    return dict(distinct=len(cs), distinct_bytes=d, second_copy_on_moses_disk_bytes=l, second_copy_only_in_git_bytes=g, r2_only_as_far_as_hashes_show_bytes=o)
for t,cs in cont.items(): rows[t].update(split(cs))
tot=dict(keys=sum(r['keys'] for r in rows.values()), bytes=sum(r['bytes'] for r in rows.values()),
         no_md5_keys=sum(r['no_md5_keys'] for r in rows.values()), no_md5_bytes=sum(r['no_md5_bytes'] for r in rows.values()))
tot.update(split(allc))
# moses-ledgers detail: second segment, with shipment hint (same path same size on CLB, not hashed)
ship={}
for line in open(L+'/inventory-r2/out/shipment-to-local.tsv').read().splitlines()[1:]:
    c=line.split('\t'); ship[c[0]]=dict(state=c[6], same_path_same_size_bytes=int(c[8]), r2_bytes=int(c[2]))
ml=collections.defaultdict(set)
for k,(m,sz) in md5.items():
    if k.startswith('moses-ledgers/'):
        p=k.split('/'); ml[p[1]+'/' if len(p)>2 else p[1]].add((m,sz))
mld={}
for g,cs in ml.items():
    s=split(cs); s['clb_path_and_size_hint']=ship.get('moses-ledgers/'+g); mld[g]=s
res=dict(axis='bytes [bytes]; keys [objects]; distinct [distinct md5+size contents]', total=tot,
         by_prefix=dict(sorted(rows.items(), key=lambda x:-x[1]['bytes'])), moses_ledgers=dict(sorted(mld.items(), key=lambda x:-x[1]['distinct_bytes'])))
json.dump(res, open(O+'/08-r2-second-copies.json','w'), indent=1)
print('TOTAL', tot)
print('%-28s %10s %14s %14s %14s %14s %14s'%('prefix','keys','bytes','distinct_b','on_moses','only_git','r2_only'))
for t,r in res['by_prefix'].items():
    print('%-28s %10d %14d %14d %14d %14d %14d'%(t,r['keys'],r['bytes'],r.get('distinct_bytes',0),r.get('second_copy_on_moses_disk_bytes',0),r.get('second_copy_only_in_git_bytes',0),r.get('r2_only_as_far_as_hashes_show_bytes',0)))
print('moses-ledgers:')
for g,s in list(res['moses_ledgers'].items())[:14]: print('  ',g,s['distinct_bytes'],s['second_copy_on_moses_disk_bytes'],s['r2_only_as_far_as_hashes_show_bytes'],s['clb_path_and_size_hint'])
