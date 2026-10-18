# 07_git_vs_r2.py - which git blobs (any branch, any commit) are byte copies of R2 objects; which R2 content
# exists only in git besides R2; and the same for the current main tree (reader/data) and the notes branch.
import collections, json, subprocess
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O=S+'/meta/copies/out'
G=S+'/ghp'
L=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1'
r2=collections.defaultdict(list)
for line in open(L+'/verify-proof-r3/out/02-r2-md5.tsv'):
    m,sz,k=line.rstrip('\n').split('\t',2); r2[(m,int(sz))].append(k)
path={}
for line in open(O+'/git-objects-all.txt', encoding='utf-8', errors='surrogateescape'):
    line=line.rstrip('\n'); sha,_,p=line.partition(' ')
    if sha not in path: path[sha]=p
blob_md5={}
for line in open(O+'/git-blob-md5.tsv'):
    sha,sz,m=line.split(); blob_md5[sha]=(m,int(sz))
matched={sha:v for sha,v in blob_md5.items() if v in r2}
contents=set(matched.values())
# R2 side: distinct contents present in git
by_r2top=collections.defaultdict(lambda:[0,0])
for c in contents:
    keys=r2[c]; tops=sorted(set(k.split('/')[0] if not k.startswith('corpus-lane-builds/') else 'corpus-lane-builds/'+k.split('/')[1] for k in keys))
    t=tops[0] if len(tops)==1 else '(several)'
    by_r2top[t][0]+=1; by_r2top[t][1]+=c[1]
by_gittop=collections.defaultdict(lambda:[0,0])
for sha,c in matched.items():
    p=path.get(sha,''); parts=p.split('/')
    t='/'.join(parts[:3]) if parts[0]=='reader' else parts[0]
    by_gittop[t][0]+=1; by_gittop[t][1]+=c[1]
# trees: main (origin/main), gh-pages, workbench-archive, notes branch
def tree(ref):
    out=subprocess.run(['git','-C',G,'ls-tree','-r','-l',ref],capture_output=True).stdout.decode('utf-8','surrogateescape')
    rows=[]
    for line in out.splitlines():
        meta,_,p=line.partition('\t'); mode,t,sha,sz=meta.split()
        if t=='blob': rows.append((sha,int(sz),p))
    return rows
refs={'origin/main':'origin/main','origin/gh-pages':'origin/gh-pages','origin/workbench-archive':'origin/workbench-archive','notes branch (claude/awesome-hypatia-2pxz43)':'claude/awesome-hypatia-2pxz43'}
trees={}
for name,ref in refs.items():
    rows=tree(ref)
    tb=sum(r[1] for r in rows)
    m=[r for r in rows if r[0] in matched]
    rd=[r for r in rows if r[2].startswith('reader/data/')]
    rdm=[r for r in rd if r[0] in matched]
    # by r2 prefix for matched in this tree
    pre=collections.Counter()
    for r in m:
        keys=r2[matched[r[0]]]; pre[keys[0].split('/')[0] if not keys[0].startswith('corpus-lane-builds/') else 'corpus-lane-builds/'+keys[0].split('/')[1]]+=r[1]
    trees[name]=dict(files=len(rows), bytes=tb, files_equal_to_an_r2_object=len(m), bytes_equal_to_an_r2_object=sum(r[1] for r in m),
        reader_data_files=len(rd), reader_data_bytes=sum(r[1] for r in rd), reader_data_files_equal_r2=len(rdm), reader_data_bytes_equal_r2=sum(r[1] for r in rdm),
        equal_bytes_by_r2_prefix=dict(pre.most_common(15)),
        examples=[(r[2], r[1], r2[matched[r[0]]][0]) for r in sorted(m,key=lambda r:-r[1])[:12]])
res=dict(blobs_hashed=len(blob_md5), blobs_equal_to_an_r2_object=len(matched),
    bytes_of_those_blobs=sum(v[1] for v in matched.values()), distinct_r2_contents_in_git=len(contents),
    distinct_r2_content_bytes_in_git=sum(c[1] for c in contents),
    by_r2_prefix=sorted([[k]+v for k,v in by_r2top.items()], key=lambda x:-x[2])[:30],
    by_git_path=sorted([[k]+v for k,v in by_gittop.items()], key=lambda x:-x[2])[:30],
    trees=trees)
json.dump(res, open(O+'/07-git-vs-r2.json','w'), indent=1)
print(json.dumps(res, indent=1)[:9000])
