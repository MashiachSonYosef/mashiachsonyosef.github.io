import collections, re
M='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta'
A={}
for i,l in enumerate(open(M+'/judge/out/added-bytes.tsv')):
    if i==0: continue
    f=l.rstrip('\n').split('\t'); A[f[0]]=(f[1],f[2])
fam=collections.defaultdict(list)
for u,(f,v) in A.items(): fam[f].append(u)
def vkey(v): return tuple(int(x) for x in re.findall(r"\d+", v)) if v else (0,)
later=set(); first=set()
for f,us in fam.items():
    if len(us)<2: continue
    us.sort(key=lambda u: vkey(A[u][1]))
    first.add(us[0]); later.update(us[1:])
uc=collections.defaultdict(set)
for i,l in enumerate(open(M+'/design-readers-first/out/keys.tsv',encoding='utf-8')):
    if i==0: continue
    f=l.rstrip('\n').split('\t')
    if f[4] in later or f[4] in first: uc[f[4]].add((f[3],int(f[1])))
L=set().union(*(uc[u] for u in later)); F=set().union(*(uc[u] for u in first))
print('later units',len(later),'union distinct %.3f GB'%(sum(c[1] for c in L)/1e9))
print('later union minus first versions %.3f GB'%(sum(c[1] for c in L-F)/1e9))
print('sum of per-unit distinct over later %.3f GB'%(sum(sum(c[1] for c in uc[u]) for u in later)/1e9))
