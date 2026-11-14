import json,hashlib,sys,os
D=sys.argv[1]
r=json.load(open(os.path.join(D,'default-picks-v1/receipt-v1.json')))
ok=bad=0
for o in r['outputs']:
    p=os.path.join(D,'default-picks-v1',o['file'])
    if not os.path.exists(p): print('MISSING',o['file']); continue
    b=open(p,'rb').read()
    h=hashlib.sha256(b).hexdigest()
    n=b.count(b'\n')
    if h==o['sha256'] and len(b)==o['bytes'] and n==o['lines']: ok+=1
    else: bad+=1; print('BAD',o['file'],h,len(b),n)
print('ok',ok,'bad',bad,'of',len(r['outputs']))
r1=json.load(open(os.path.join(D,'default-picks-v1.1/receipt-v1.1.json')))
for o in r1.get('outputs',[]):
    p=os.path.join(D,'default-picks-v1.1',o['file'])
    b=open(p,'rb').read(); print(o['file'], hashlib.sha256(b).hexdigest()==o['sha256'], len(b)==o['bytes'])
print(json.dumps({k:v for k,v in r1.items() if k!='outputs'})[:3000])
