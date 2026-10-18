# Independent recheck of BL-1 and R2: shelf keys vs pins, off-R2 copies, ghp-only bins.
import json, hashlib, os, sys, csv
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
pins=json.load(open(S+'/ghp/reader/data/zone-store-v1.json'))['pins']
heads={}
for line in open(S+'/meta/hazards/head-serving-lane.jsonl'):
    r=json.loads(line); heads[r['k']]=r
local=set()
for line in open(S+'/meta/copies/out/local-known-md5.tsv'):
    p=line.rstrip('\n').split('\t'); local.add((p[0],int(p[1])))
git=set()
for line in open(S+'/meta/copies/out/git-blob-md5.tsv'):
    p=line.rstrip('\n').split('\t'); git.add((p[2],int(p[1])))
n=0;nb=0;eq=0;off=0;offb=0;only=0;onlyb=0;missing=0
for name,pin in pins.items():
    k='serving-lane/shelf/zones/'+name
    h=heads.get(k)
    if not h: missing+=1; continue
    hh=h['headers']; size=int(hh['content-length']); sha=hh.get('x-amz-meta-sha256'); md5=hh['etag'].strip('"')
    if sha==pin['sha256'] and size==pin['bytes']: eq+=1; continue
    n+=1; nb+=size
    if (md5,size) in local or (md5,size) in git: off+=1; offb+=size
    else: only+=1; onlyb+=size
# ghp bins on disk equal to pins
ghp_ok=0; ghp_b=0
main_ok=0
for name,pin in pins.items():
    for root,acc in ((S+'/ghp/reader/data/zones/','g'),('/home/user/mashiachsonyosef.github.io/reader/data/zones/','m')):
        p=root+name
        if os.path.exists(p):
            d=open(p,'rb').read()
            if hashlib.sha256(d).hexdigest()==pin['sha256']:
                if acc=='g': ghp_ok+=1; ghp_b+=len(d)
                else: main_ok+=1
print(json.dumps(dict(pins=len(pins),shelf_heads=len(heads),missing_head=missing,equal=eq,overwrite_keys=n,overwrite_bytes=nb,
  old_off_r2=off,old_off_r2_bytes=offb,old_r2_only=only,old_r2_only_bytes=onlyb,ghp_exact=ghp_ok,ghp_exact_bytes=ghp_b,main_checkout_exact=main_ok),indent=1))
