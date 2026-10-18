# 02_scratch_reconcile.py - join scratch-unit NONE files (no R2 copy by hash) with the ledger's class per unit.
import json, collections
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
B=S+'/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/build'
files={}
for l in open(B+'/proofs/scratch/files.jsonl'):
    j=json.loads(l); files[j['path']]=j
none=collections.defaultdict(lambda:[0,0])
for l in open(B+'/proofs/scratch/matches.jsonl'):
    j=json.loads(l)
    if j['outcome']!='ON_R2':
        f=files[j['path']]; none[f['unit']][0]+=1; none[f['unit']][1]+=f['size']
led={}
for l in open(B+'/ledger/delete-ledger-v1.jsonl'):
    j=json.loads(l); led[j['item']]=j
c=collections.defaultdict(lambda:[0,0,0])
for u,(n,b) in none.items():
    r=led.get(u)
    k=(r['class'], (r['proof'] or {}).get('rule'), 'has scratch_unproved' if r and 'scratch_unproved_files' in r else '-') if r else ('NOT IN LEDGER',None,None)
    c[k][0]+=1; c[k][1]+=n; c[k][2]+=b
for k,v in sorted(c.items(), key=lambda x:-x[1][2]): print(k, 'units',v[0],'files',v[1],'bytes',v[2])
# by build
bb=collections.Counter(); bn=collections.Counter()
for u,(n,b) in none.items():
    bb[u.split('/')[1]]+=b; bn[u.split('/')[1]]+=n
print('NONE by build (top 15):')
for k,v in bb.most_common(15): print('  ',k,bn[k],v)
json.dump({k:[bn[k],v] for k,v in bb.items()}, open(S+'/meta/copies/out/02-scratch-none-by-build.json','w'), indent=1)
