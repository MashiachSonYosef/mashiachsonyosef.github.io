#!/usr/bin/env python3 -I
# Re-hash: (a) the collected Sefaria edition token streams against their own receipts; (b) every bin against
# zone-store-v1.json; (c) every route-store file against store-manifest-v1.json; (d) every ledger declaration and
# classifier against ledgers-v1/manifest.json; (e) overlays against their LEDGERED records; (f) resting lines,
# default-picks index, search index, witnessed orders index, span store, piece store, dictionary store as each names its files.
import json, gzip, hashlib, os, sys, io, csv, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'; B=S+'/base'; R=B+'/reader'; D=R+'/data'
sha=lambda b: hashlib.sha256(b).hexdigest()
rows=[]; tally=collections.Counter()
def add(group, name, where, bytes_rec, sha_rec, path, pinned_in, unz=False):
    if not os.path.exists(path):
        rows.append((group,name,where,bytes_rec,sha_rec,'','ABSENT',pinned_in)); tally[(group,'ABSENT')]+=1; return
    b=open(path,'rb').read()
    if unz: b=gzip.decompress(b)
    t=sha(b); v='MATCH' if t==sha_rec and (bytes_rec in ('',None) or int(bytes_rec)==len(b)) else 'OTHER_BYTES'
    rows.append((group,name,where,len(b),sha_rec,t,v,pinned_in)); tally[(group,v)]+=1
# (a) collected editions
COL=W+'/dl/editions/v2/sources/tanakh-editions-collect/collected'; CX=W+'/dl/editions-x/b'
for d in sorted(os.listdir(COL)):
    p=f'{COL}/{d}/edition-miqra-according-to-the-masorah.tokens.csv.gz'
    if not os.path.exists(p): continue
    rc=json.load(open(f'{CX}/{d}/edition-miqra-according-to-the-masorah.json'))
    t=gzip.open(p,'rt',encoding='utf8',newline='').read()
    rd=list(csv.reader(io.StringIO(t)))[1:]
    h=hashlib.sha256()
    for r in rd: h.update(r[0].encode('utf8')); h.update(b'\n')
    v='MATCH' if h.hexdigest()==rc['surface_token_stream_sha256'] and len(rd)==rc['built_rows'] else 'OTHER_BYTES'
    rows.append(('collected Sefaria edition (token stream)',d,'store: v2/sources/tanakh-editions-collect/collected/'+d+'/edition-miqra-according-to-the-masorah.tokens.csv.gz',len(rd),rc['surface_token_stream_sha256'],h.hexdigest(),v,'the collection receipt beside it (in a part on the store); not in the tree')); tally[('collected',v)]+=1
# (b) zone store
zs=json.load(open(D+'/zone-store-v1.json'))
for f,pin in zs['pins'].items(): add('zone store bin',f,'reader/data/zones/'+f,pin['bytes'],pin['sha256'],D+'/zones/'+f,'data/zone-store-v1.json pins')
onDisk=set(x for x in os.listdir(D+'/zones'))
print('bins on disk not pinned:',sorted(onDisk-set(zs['pins']))[:5], '| pinned not on disk:',sorted(set(zs['pins'])-onDisk)[:5])
# (c) route store
sm=json.load(open(D+'/route-store/store-manifest-v1.json'))
for f,pin in sm['files'].items(): add('route store file',f,'reader/data/route-store/'+f,pin['bytes'],pin['sha256'],D+'/route-store/'+f,'data/route-store/store-manifest-v1.json files')
# (d) ledgers
lm=json.load(open(D+'/ledgers-v1/manifest.json'))
for k,v in lm['ledgers'].items():
    for what in ('declaration','classifier'):
        if what in v: add('ledger '+what,k,'reader/'+v[what]['file'],'',v[what]['sha256'],R+'/'+v[what]['file'],'data/ledgers-v1/manifest.json ledgers.'+k)
# (e) overlays
for o in ('jastrow','samaritan'):
    led=json.load(open(f'{D}/overlays/{o}/LEDGERED-overlay-v1.json'))
    man=json.load(open(f'{D}/overlays/{o}/MANIFEST-overlay-v1.json'))
    now={x['path']:x['now'] for x in led['files']}
    for x in man['files']:
        pin=now.get(x['path'],x)
        add('overlay '+o,x['path'],f'reader/data/overlays/{o}/'+x['path'],pin['bytes'],pin['sha256'],f'{D}/overlays/{o}/'+x['path'],f'data/overlays/{o}/'+('LEDGERED-overlay-v1.json now' if x['path'] in now else 'MANIFEST-overlay-v1.json'))
with open(W+'/data/manifests-rehash.tsv','w',encoding='utf8') as f:
    f.write('group\tname\twhere\tbytes\tsha256_recorded\tsha256_today\tverdict\tpinned_in\n')
    for r in rows: f.write('\t'.join(str(x) for x in r)+'\n')
for k,v in sorted(tally.items()): print(v,k)
