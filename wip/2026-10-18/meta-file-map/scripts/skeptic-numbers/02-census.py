import collections
C='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad/meta/census/'
rows=[l.rstrip('\n').split('\t') for l in open(C+'builds.tsv')]
h=rows[0]; rows=rows[1:]
print(len(rows),'units')
st=collections.defaultdict(lambda:[0,0,0,0])
for r in rows:
    s=st[r[4]]; s[0]+=1; s[1]+=int(r[6]); s[2]+=int(r[7]); s[3]+=int(r[8])
for k,v in st.items(): print(k,v[0],'bytes',v[1],'sum_distinct_within',v[2],'sum_unique_to_unit',v[3])
fam=collections.Counter(r[1] for r in rows)
print('families',len(fam),'multi',sum(1 for f,c in fam.items() if c>1),'units in multi',sum(c for f,c in fam.items() if c>1))
# family version counts distinct versions
fv=collections.defaultdict(set)
for r in rows: fv[r[1]].add(r[2])
print('families with >1 distinct version string',sum(1 for f,v in fv.items() if len(v)>1))
