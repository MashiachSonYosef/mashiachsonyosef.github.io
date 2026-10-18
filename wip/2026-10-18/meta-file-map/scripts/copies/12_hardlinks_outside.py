# 12_hardlinks_outside.py - CLB hard-link groups: duplicate names inside the walk, and groups with names outside it.
import json, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
I=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/inventory-local/out'
n=b=dup=0
for l in open(I+'/hardlink-groups.jsonl'):
    g=json.loads(l); sz=int(g['bytes']); dup+=sz*(g['paths_seen']-1)
    if g['paths_seen']<g['nlink']: n+=1; b+=sz
res=dict(groups_with_names_outside_walk=n, their_bytes_one_copy_each=b, duplicate_names_inside_walk_bytes=dup)
json.dump(res, open(S+'/meta/copies/out/12-hardlinks.json','w'), indent=1); print(res)
