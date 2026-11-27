# Where each Wikisource Strong's route stands in its definition: after the list opener (a King James rendering),
# before it (a piece of Strong's own sentence), or across it.
import json,re,collections,sys
ent=json.load(open('m14-entries.json'))
defs={}
for n,es in ent.items():
    for e in es: defs[e['ours']]=n
def opener(d):
    # the last ':' at bracket depth 0 that is not inside a verse citation (digit:digit)
    depth=0; last=-1
    for i,ch in enumerate(d):
        if ch=='(': depth+=1
        elif ch==')': depth=max(0,depth-1)
        elif ch==':' and depth==0:
            if i>0 and i+1<len(d) and d[i-1].isdigit() and d[i+1].isdigit(): continue
            last=i
    if last<0:
        for i,ch in enumerate(d):
            if ch==':' and not (i>0 and i+1<len(d) and d[i-1].isdigit() and d[i+1].isdigit()): last=i
    if last<0:
        for sep in ('; --','; -',' -- ',';--'):
            k=d.rfind(sep)
            if k>=0: last=k+len(sep)-1; break
    return last
c=collections.Counter(); ex=collections.defaultdict(list)
out=open('m14-route-position.tsv','w'); out.write('key\trank\tentry\tposition\troute\treadings\n')
for line in open('rows-M14.jsonl'):
    r=json.loads(line)
    d=r['def']; route=r['route']
    if d not in defs: c['definition not in the records on hand']+=1; continue
    op=opener(d)
    i=d.find(route)
    # prefer an occurrence after the opener
    j=d.find(route,op+1) if op>=0 else -1
    if op<0: pos='the definition has no list opener'
    elif j>=0: pos='after the list opener (a King James rendering)'
    elif i>=0 and i+len(route)<=op+1: pos="before the list opener (a piece of Strong's own sentence)"
    elif i>=0: pos='across the list opener'
    else: pos='not a run'
    c[pos]+=1
    if not pos.startswith('after'):
        out.write('\t'.join([r['k'],str(r['rank']),defs[d],pos,route.replace('\t',' '),' || '.join(r['readings'])])+'\n')
        if len(ex[pos])<300: ex[pos].append((r['k'],defs[d],route[:200]))
out.close()
print(json.dumps(c,indent=1,ensure_ascii=False))
import random; random.seed(4)
for k,v in ex.items():
    print('##',k,len(v))
    for x in random.sample(v,min(14,len(v))): print('    ',x)
