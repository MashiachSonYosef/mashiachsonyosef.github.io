import json, sys, collections
H='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/hazards/'
# multipart md5s from stream hashing
mp={}
for l in open(H+'stream-hash-multipart.jsonl'):
    r=json.loads(l); mp[r['k']]=(r['md5'],r['bytes'],r['sha256'])
keys=0; byts=0; groups=collections.Counter(); gbytes={}
zero=0; mpk=0; mpb=0
for l in open(H+'bucket-etag.tsv'):
    k,s,lm,et,sc=l.rstrip('\n').split('\t')
    s=int(s); keys+=1; byts+=s
    if '-' in et:
        mpk+=1; mpb+=s
        md5=mp[k][0]; assert mp[k][1]==s
    else: md5=et
    g=(md5,s); groups[g]+=1; gbytes[g]=s
    if s==0: zero+=1
dist=sum(gbytes.values())
print(json.dumps(dict(keys=keys,bytes=byts,contents=len(groups),distinct_bytes=dist,copies=byts-dist,copies_pct=(byts-dist)/byts,zero=zero,zero_group=groups[('d41d8cd98f00b204e9800998ecf8427e',0)],mp_keys=mpk,mp_bytes=mpb),indent=1))
# under 4 KiB
small=[g for g in gbytes if gbytes[g]<4096]
print('contents <4KiB',len(small),len(small)/len(groups),sum(gbytes[g] for g in small))
small2=[g for g in gbytes if gbytes[g]<=4096]
print('contents <=4KiB',len(small2),len(small2)/len(groups),sum(gbytes[g] for g in small2))
