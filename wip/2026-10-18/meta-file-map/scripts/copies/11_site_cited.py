# 11_site_cited.py - do the paths the site's data files cite (clean/site-cited2.txt) resolve on R2?
# Tried spellings: as written, "corpus-staging/"+path, "moses-"+path; as a key or as a folder prefix.
import collections, json
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
b={}
for l in open(S+'/clean/bucket-now2.tsv'):
    k,s,m=l.rstrip('\n').split('\t'); b[k]=int(s)
keys=sorted(b)
import bisect
def has_prefix(pre):
    i=bisect.bisect_left(keys,pre); return i<len(keys) and keys[i].startswith(pre)
c=collections.Counter(); miss=[]
for l in open(S+'/clean/site-cited2.txt'):
    p=l.strip()
    if not p: continue
    hit=None
    for q in [p,'corpus-staging/'+p,'moses-'+p]:
        if q in b or has_prefix(q.rstrip('/')+'/'): hit=q; break
    c['resolves on R2' if hit else 'not on R2 by these spellings']+=1
    if not hit: miss.append(p)
fs_like=sum(1 for p in miss if p.startswith('ledgers/work/') or p.startswith('source-cache/'))
res=dict(counts=dict(c), missing_that_look_like_footsteps_paths=fs_like, missing=miss)
json.dump(res, open(S+'/meta/copies/out/11-site-cited.json','w'), indent=1)
print(dict(c), fs_like)
