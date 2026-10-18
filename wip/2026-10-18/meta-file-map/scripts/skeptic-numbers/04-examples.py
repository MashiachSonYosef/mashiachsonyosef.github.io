import json, collections
H='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards/'
mp={}
for l in open(H+'stream-hash-multipart.jsonl'):
    r=json.loads(l); mp[r['k']]=r['md5']
rows=[]
for l in open(H+'bucket-etag.tsv'):
    k,s,lm,et,sc=l.rstrip('\n').split('\t'); s=int(s)
    md5=mp.get(k,et)
    rows.append((k,s,lm,md5))
bykey={r[0]:r for r in rows}
cnt=collections.Counter((r[3],r[1]) for r in rows)
def show(k):
    r=bykey.get(k); print(k, r, 'content keys', cnt[(r[3],r[1])] if r else None)
show('corpus-lane-builds/moses-span-store-v1/build-v1.4/span-store-v1.4/places/amos.jsonl')
show('corpus-lane-builds/moses-compspan-v13.7/verify/gate-v136/root/tab/lane/moses-compspan-v13.6/build/RULE-compspan-v13.6.md')
show('corpus-lane-builds/moses-compspan-v13.6/build/RULE-compspan-v13.6.md')
# v13.7 rule
for r in rows:
    if r[0].startswith('corpus-lane-builds/moses-compspan-v13.7/') and r[0].endswith('RULE-compspan-v13.7.md'): print('v13.7 RULE', r)
show('corpus-lane-builds/moses-witnessed-order-v2.4/old-witness-table-v2.4.jsonl.gz')
show('cold/editorial-999-strike-20260830-evidence.tar.gz')
show('serving-lane/shelf/zones/amos.bin')
# builds
def build(p):
    ks=[r for r in rows if r[0].startswith(p)]
    cs={(r[3],r[1]) for r in ks}
    print(p,'keys',len(ks),'bytes',sum(r[1] for r in ks),'distinct',sum(c[1] for c in cs),'first',min(r[2] for r in ks),'last',max(r[2] for r in ks))
    return ks
build('corpus-lane-builds/moses-witnessed-order-v2.4/')
build('corpus-lane-builds/moses-bundled-by-century-v1/')
build('serving-lane/shelf/')
build('cas/')
# old witness tables
ow=[r for r in rows if 'old-witness-table' in r[0]]
print('old-witness keys',len(ow),'bytes',sum(r[1] for r in ow),'distinct',len({(r[3],r[1]) for r in ow}),'distinct bytes',sum(c[1] for c in {(r[3],r[1]) for r in ow}))
for c in sorted({(r[3],r[1]) for r in ow}): print('  ',c, cnt[c])
