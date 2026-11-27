#!/usr/bin/env python3
# Count the served store's rows by source record (M) and by family; and which of them carry a landing record.
import json, gzip, os, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'; D=S+'/base/reader/data'
ix=json.load(open(D+'/route-store/index.json'))
rr=ix['route_row']
assert 'm_id' in rr[3], rr[3]
kinds=json.load(open(D+'/dictionary-kinds-v1.json'))
key2fam={k:f['id'] for f in kinds['families'] for k in f['keys']}
fam_kind={f['id']:f['kind'] for f in kinds['families']}
ms=ix['m_sources']
rows=collections.Counter(); keys=collections.defaultdict(set)
total=0
for f in sorted(os.listdir(D+'/route-store/shards')):
    sh=json.load(gzip.open(D+'/route-store/shards/'+f))
    for k,lst in sh.items():
        for row in lst:
            m=row[3]; rows[m]+=1; keys[m].add(k); total+=1
fam=collections.Counter(); famm=collections.defaultdict(list)
unfiled=[]
for m,n in rows.items():
    src=ms.get(m)
    if not src: unfiled.append((m,n)); continue
    fid=key2fam.get(src['key'])
    if not fid: unfiled.append((m,n,src['key'])); continue
    fam[fid]+=n; famm[fid].append((m,src['key'],n))
with open(W+'/data/rows-by-family.tsv','w') as o:
    o.write('family\tkind\trows_served\tsource_records\n')
    for f in kinds['families']:
        fid=f['id']
        o.write(f"{fid}\t{f['kind']}\t{fam.get(fid,0)}\t{'; '.join(f'{m} {k} {n}' for m,k,n in sorted(famm.get(fid,[]),key=lambda x:-x[2]))}\n")
print('rows in shards',total,'index counts',ix['counts']['routes'],'unfiled',unfiled[:5])
for f in kinds['families']:
    fid=f['id']
    if f['kind']=='bible': print('%-22s %7d  %s'%(fid,fam.get(fid,0),', '.join(f'{m}:{n}' for m,k,n in sorted(famm.get(fid,[]),key=lambda x:-x[2])[:6])))
print('bible total',sum(fam[f['id']] for f in kinds['families'] if f['kind']=='bible'),'other total',sum(fam[f['id']] for f in kinds['families'] if f['kind']!='bible'))
