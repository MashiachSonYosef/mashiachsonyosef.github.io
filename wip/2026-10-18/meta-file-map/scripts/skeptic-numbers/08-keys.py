import unicodedata, collections, json
H='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards/'
keys=[l.split('\t',1)[0] for l in open(H+'bucket-etag.tsv',encoding='utf-8')]
sp=sum(1 for k in keys if ' ' in k)
na=[k for k in keys if any(ord(c)>127 for c in k)]
nfd=sum(1 for k in na if unicodedata.normalize('NFD',k)!=k)
nfc=sum(1 for k in na if unicodedata.normalize('NFC',k)!=k)
pc=sum(1 for k in keys if '%' in k)
br=sum(1 for k in keys if any(c in k for c in '[]'))
br2=sum(1 for k in keys if any(c in k for c in '[](){}'))
seg=[(s,k) for k in keys for s in k.split('/') if len(s.encode('utf-8'))>255]
segk={k for s,k in seg}
print('space',sp,'nonascii',len(na),'nfd-changes',nfd,'nfc-changes',nfc,'pct',pc,'square brackets',br,'any brackets',br2)
print('segments>255 bytes',len(seg),'keys',len(segk))
segc=[(s,k) for k in keys for s in k.split('/') if len(s)>255]
print('segments>255 chars',len(segc))
# case collisions
low=collections.defaultdict(set)
for k in keys: low[k.lower()].add(k)
print('case collisions',sum(1 for v in low.values() if len(v)>1))
nf=collections.defaultdict(set)
for k in keys: nf[unicodedata.normalize('NFC',k)].add(k)
print('nfc collisions',sum(1 for v in nf.values() if len(v)>1))
ks=set(keys)
ff=0
pref=set()
for k in keys:
    p=k.split('/')
    for i in range(1,len(p)): pref.add('/'.join(p[:i]))
print('file/folder collisions',len(ks&pref))
# windows path estimate: C:\Users\X\... unknown; count keys > 259 chars as-is
print('keys >259 chars',sum(1 for k in keys if len(k)>259),'>230',sum(1 for k in keys if len(k)>230))
