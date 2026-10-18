# Show a family's composition: by 2nd/3rd path segment and by extension, over distinct-in-family content.
import sys, collections, re
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
MD5=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'
pref=sys.argv[1]; depth=int(sys.argv[2]) if len(sys.argv)>2 else 3
seen=set(); seg=collections.Counter(); segn=collections.Counter(); ext=collections.Counter(); big=[]
L0=0
for l in open(MD5,encoding='utf-8'):
    h,s,k=l.rstrip('\n').split('\t',2)
    if not k.startswith(pref): continue
    s=int(s); L0+=s
    if (h,s) in seen: continue
    seen.add((h,s))
    p='/'.join(k.split('/')[:depth]); seg[p]+=s; segn[p]+=1
    b=k.rsplit('/',1)[-1].lower(); e='.'.join(b.split('.')[-2:]) if b.count('.')>=2 and b.split('.')[-1] in('gz','xz') else b.split('.')[-1]
    ext[e]+=s; big.append((s,k))
tot=sum(seg.values())
print('L0 %.3f GB  L1-within %.3f GB  distinct %d'%(L0/1e9,tot/1e9,len(seen)))
for p,v in seg.most_common(25): print('  %8.3f GB %6d %s'%(v/1e9,segn[p],p))
print(' ext:',', '.join('%s %.3f'%(e,v/1e9) for e,v in ext.most_common(10)))
big.sort(reverse=True)
for s,k in big[:12]: print('  %10d %s'%(s,k))
