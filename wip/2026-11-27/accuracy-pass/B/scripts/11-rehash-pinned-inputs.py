#!/usr/bin/env python3 -I
# Re-hash the off-tree pinned build inputs fetched from the store against the pins in the tree.
import json, os, hashlib, gzip, sys
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'; D=S+'/base/reader/data'; DL=W+'/dl/pinned-inputs'
def content(key, pinned_name):
    b=open(os.path.join(DL,key),'rb').read()
    if key.endswith('.gz') and not pinned_name.endswith('.gz'): b=gzip.decompress(b)
    return b
rows=[]
def rec(group, pinned_in, name, key, bytes_rec, sha_rec):
    p=os.path.join(DL,key)
    if not os.path.exists(p):
        rows.append((group,pinned_in,name,key,bytes_rec,sha_rec,'','not fetched')); return
    b=content(key,name)
    t=hashlib.sha256(b).hexdigest()
    rows.append((group,pinned_in,name,key,bytes_rec,sha_rec,t,'MATCH' if (t==sha_rec and (bytes_rec in ('',None) or int(bytes_rec)==len(b))) else 'OTHER_BYTES'))
# default picks
pin=json.load(open(D+'/default-picks/PIN.json'))
base='v2/ledgers/all/default-picks/'
for k,v in pin.items():
    if isinstance(v,dict) and 'file' in v and 'sha256' in v and not v.get('kept') and v['file'].startswith('default-picks-v'):
        rec('default picks','data/default-picks/PIN.json '+k, v['file'], base+v['file']+'.gz', v.get('bytes'), v['sha256'])
# the 39 book files are held to receipt-v1.json outputs[]
r1=json.load(open(D+'/default-picks/default-picks-v1/receipt-v1.json'))
outs=r1.get('outputs')
n=0
for o in outs if isinstance(outs,list) else []:
    f=o.get('file') or o.get('name')
    if f and f.endswith('.jsonl') and f not in ('rows-v1.jsonl',):
        rec('default picks book file','data/default-picks/default-picks-v1/receipt-v1.json outputs[] (the pin says book files are held to it)', 'default-picks-v1/'+os.path.basename(f), base+'default-picks-v1/'+os.path.basename(f)+'.gz', o.get('bytes'), o.get('sha256')); n+=1
sp=json.load(open(D+'/default-picks/spans-v1/PIN.json'))
for k in ('spans','twice_words'):
    v=sp[k]; rec('default spans','data/default-picks/spans-v1/PIN.json '+k, v['file'], base+'spans-v1/'+v['file']+'.gz', v.get('bytes'), v['sha256'])
ld=json.load(open(D+'/lattice-delta/PIN.json'))
for k,v in ld['lists'].items():
    key='v2/ledgers/all/lattice-delta/delta-v13-v1/'+v['file']+('' if v['file'].endswith('.gz') else '.gz')
    rec('lattice delta','data/lattice-delta/PIN.json lists.'+k, v['file'], key, v.get('bytes'), v['sha256'])
re_=json.load(open(D+'/row-entries/PIN.json'))
v=re_['ledger']; rec('row entries ledger','data/row-entries/PIN.json ledger', v['file'], 'v2/ledgers/all/row-entries/row-entries-v1.2/row-entries-v1.2.jsonl.gz', v.get('bytes'), v['sha256'])
l0=re_['lists'][0]
rec('entry ledger lists','data/row-entries/PIN.json lists[0].changes', l0['changes']['file'], 'v2/ledgers/all/entry-ledger/lists-v1.1/changes-v1.1.jsonl', l0['changes'].get('bytes'), l0['changes']['sha256'])
rec('entry ledger lists','data/row-entries/PIN.json lists[0].list', l0['list']['file'], 'v2/ledgers/all/entry-ledger/lists-v1.1/facts-slot-wiktionary-v1.1.tsv', l0['list'].get('bytes'), l0['list']['sha256'])
t=l0['facts_from']['t']['list']; rec('entry ledger lists','data/row-entries/PIN.json lists[0].facts_from.t.list', t['file'], 'v2/ledgers/all/entry-ledger/tbesh-letters-v1/facts-slot-t-v1.1.tsv', t.get('bytes'), t['sha256'])
se=json.load(open(D+'/stems-extension/PIN.json'))
v=se['lines']; rec('stems extension','data/stems-extension/PIN.json lines', v['file'], 'v2/ledgers/all/stems-extension/stems-extension-v1/row-stems-extension-v1.jsonl.gz', v.get('bytes'), v['sha256'])
nm=json.load(open(D+'/names/PIN.json'))
v=nm['more_name_rows'][1]['not_laid']; rec('names (not laid)','data/names/PIN.json more_name_rows[1].not_laid', v['file'], 'v2/ledgers/all/names/places-at-bridge-v1/name-rows-m51-v1.jsonl', v.get('bytes'), v['sha256'])
with open(W+'/data/pinned-inputs-rehash.tsv','w') as f:
    f.write('group\tpinned_in\tfile\tstore_key\tbytes_recorded\tsha256_recorded\tsha256_today\tverdict\n')
    for r in rows: f.write('\t'.join(str(x) for x in r)+'\n')
import collections
print(collections.Counter((r[0],r[7]) for r in rows))
for r in rows:
    if r[7]!='MATCH': print(r)
print('book files in receipt-v1 outputs:',n, type(outs).__name__)
