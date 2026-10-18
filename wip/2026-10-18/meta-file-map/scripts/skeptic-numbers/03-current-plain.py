import collections, json
M='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta'
src=open(M+'/design-readers-first/scripts/02-fates.py',encoding='utf-8').read().split('rows = []')[0]
ns={}; exec(src,ns); fate=ns['fate']
st={}
for i,l in enumerate(open(M+'/census/builds.tsv')):
    if i==0: continue
    f=l.rstrip('\n').split('\t'); st[f[0]]=f[4]
agg=collections.defaultdict(lambda:[0,0])
curunits=set()
for i,l in enumerate(open(M+'/design-readers-first/out/keys.tsv',encoding='utf-8')):
    if i==0: continue
    f=l.rstrip('\n').split('\t')
    k,s,u,status=f[0],int(f[1]),f[4],f[5]
    if status=='current':
        curunits.add(u)
        agg[fate(k)][0]+=1; agg[fate(k)][1]+=s
print(len(curunits),'current units in keys.tsv')
tot=sum(v[1] for v in agg.values())
print('current bytes',tot)
for k,v in agg.items(): print(k,v)
# what status column values are there
