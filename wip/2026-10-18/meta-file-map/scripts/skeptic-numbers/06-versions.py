import collections, re
M='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta'
A={}
for i,l in enumerate(open(M+'/judge/out/added-bytes.tsv')):
    if i==0: continue
    f=l.rstrip('\n').split('\t')
    A[f[0]]=dict(family=f[1],version=f[2],prev=f[3],dist=int(f[4]),nvp=int(f[5]),nae=int(f[6]))
fam=collections.defaultdict(list)
for u,d in A.items(): fam[d['family']].append(u)
def vkey(v): return tuple(int(x) for x in re.findall(r"\d+", v)) if v else (0,)
multi={f:us for f,us in fam.items() if len(us)>1}
print('multi-unit families',len(multi),'units',sum(len(v) for v in multi.values()))
tot_d=tot_n=0; real_d=real_n=0; per=[]
for f,us in multi.items():
    us.sort(key=lambda u: vkey(A[u]['version']))
    vers=[A[u]['version'] for u in us]
    for i,u in enumerate(us[1:],1):
        d=A[u]; tot_d+=d['dist']; tot_n+=d['nae']
        realver = d['version'] not in vers[:i]
        if realver: real_d+=d['dist']; real_n+=d['nae']
        per.append((d['nae'],f,u,d['version'],realver))
print('later units: distinct sum %.3f GB new_vs_all_earlier %.3f GB'%(tot_d/1e9,tot_n/1e9))
print('only units whose version string is new in the family: distinct %.3f GB new %.3f GB'%(real_d/1e9,real_n/1e9))
dv=[f for f,us in multi.items() if len({A[u]['version'] for u in us})>1]
print('families with >1 distinct version string',len(dv),'units',sum(len(multi[f]) for f in dv))
per.sort(reverse=True)
for p in per[:14]: print('%.3f GB'%(p[0]/1e9),p[1:])
# by family new sums
bf=collections.Counter()
for p in per: bf[p[1]]+=p[0]
for f,v in bf.most_common(8): print(f,'%.3f'%(v/1e9))
print('--- later units that repeat a version string already in the family')
n=0
for p in sorted(per, key=lambda x:-x[0]):
    if not p[4]: n+=1; print('%.3f GB new'%(p[0]/1e9), p[1], p[2], 'v'+p[3])
print(n,'units')
