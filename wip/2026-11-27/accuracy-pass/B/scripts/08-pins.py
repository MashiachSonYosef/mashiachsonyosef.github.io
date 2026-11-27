#!/usr/bin/env python3
# Walk every PIN.json under reader/data. For every entry that names a file with a sha256, find the file in the tree,
# hash it (unzipped where the entry says stored: gzip) and compare.
import json, os, hashlib, gzip, re, collections, sys
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'; B=S+'/base'; D=B+'/reader/data'
HEX=re.compile(r'^[0-9a-f]{64}$')
rows=[]
def sha_file(p, unz=False):
    b=open(p,'rb').read()
    if unz: b=gzip.decompress(b)
    return hashlib.sha256(b).hexdigest(), len(b)
def cands(name, pindir, folder_hint):
    out=[]
    name=str(name)
    for base in [pindir]+([os.path.join(pindir,folder_hint)] if folder_hint else [])+[D, B+'/reader', B]:
        out.append(os.path.normpath(os.path.join(base,name)))
        out.append(os.path.normpath(os.path.join(base,name+'.gz')))
    return out
def walk(o, path, pinfile, pindir, folder_hint):
    if isinstance(o,dict):
        fh=folder_hint
        for fk in ('folder','dir','kept_in','in'):
            if isinstance(o.get(fk),str) and os.path.isdir(os.path.join(pindir,o[fk])): fh=o[fk]
        # entry with a file and a sha256
        shakeys=[k for k,v in o.items() if isinstance(v,str) and HEX.match(v)]
        name=None
        for nk in ('file','name','path','list','receipt','rule'):
            if isinstance(o.get(nk),str): name=o[nk]; break
        for sk in shakeys:
            h=o[sk]
            rec=dict(pin=os.path.relpath(pinfile,B), json_path=path+'.'+sk, name=name or '', bytes=o.get('bytes',''), sha256=h, stored=o.get('stored',''))
            found=None
            if name:
                for c in cands(name,pindir,fh):
                    if os.path.isfile(c): found=c; break
            if found:
                unz = (o.get('stored')=='gzip') or (found.endswith('.gz') and not str(name).endswith('.gz'))
                try:
                    t,n=sha_file(found,unz)
                except Exception as e:
                    t,n='ERR',0
                if t!=h and not unz and found.endswith('.gz'):
                    t2,n2=sha_file(found,True)
                    if t2==h: t,n,unz=t2,n2,True
                rec.update(tree_file=os.path.relpath(found,B), sha256_today=t, verdict='MATCH' if t==h else 'OTHER_BYTES', unzipped=unz)
            else:
                rec.update(tree_file='', sha256_today='', verdict='NOT_IN_TREE', unzipped='')
            rows.append(rec)
        for k,v in o.items():
            walk(v, path+'.'+str(k) if path else str(k), pinfile, pindir, fh)
    elif isinstance(o,list):
        for i,v in enumerate(o): walk(v, f'{path}[{i}]', pinfile, pindir, folder_hint)
pins=[]
for root,dirs,files in os.walk(D):
    for fn in files:
        if fn=='PIN.json': pins.append(os.path.join(root,fn))
for p in sorted(pins):
    walk(json.load(open(p)),'',p,os.path.dirname(p),None)
with open(W+'/data/pin-entries-rehash.tsv','w') as f:
    cols=['pin','json_path','name','bytes','stored','sha256','tree_file','sha256_today','verdict']
    f.write('\t'.join(cols)+'\n')
    for r in rows: f.write('\t'.join(str(r[c]) for c in cols)+'\n')
c=collections.defaultdict(collections.Counter)
for r in rows: c[r['pin']][r['verdict']]+=1
for k,v in sorted(c.items()): print(dict(v),k)
print('---- OTHER_BYTES')
for r in rows:
    if r['verdict']=='OTHER_BYTES': print(r['pin'],'|',r['json_path'],'|',r['name'],'|',r['tree_file'],'|',r['sha256'][:12],r['sha256_today'][:12])
