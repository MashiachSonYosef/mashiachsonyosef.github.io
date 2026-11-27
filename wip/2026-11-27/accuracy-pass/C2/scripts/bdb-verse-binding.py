# BDB's own verse references beside a reading, against the places where the reading stands on the card.
import json,collections
r5=json.load(open('m5-row-refs.json')); r46=json.load(open('m46-row-refs.json'))
c=collections.Counter(); ex=collections.defaultdict(list)
rows5=collections.defaultdict(lambda:[0,0]); rows46=collections.defaultdict(lambda:[0,0,0])
for line in open('bdb-standing-pairs.tsv'):
    p=line.rstrip('\n').split('\t')
    if len(p)<7: continue
    m,book,label,n,k,rank,text=p
    key=k+'\t'+rank; here=book+' '+label
    if m=='M5':
        c['M5 pill places']+=1
        refs=r5.get(key)
        if refs is None: continue
        c['M5 pill places of a reading that a verse reference follows']+=1
        if here in refs: c['M5 … at the verse the source cites']+=1; rows5[key][0]+=1
        else:
            c['M5 … at another verse than the source cites']+=1; rows5[key][1]+=1
            if len(text.split())>=4 and len(ex['M5'])<400: ex['M5'].append((here,n,k,text,';'.join(refs[:3])))
    else:
        c['M46 pill places']+=1
        x=r46.get(key)
        if x is None: continue
        c['M46 pill places of a highlight of a numbered point']+=1
        if here in x['refs']: c['M46 … at a verse the point cites']+=1; rows46[key][0]+=1
        else: c['M46 … at a verse the point does not cite']+=1; rows46[key][1]+=1
        if x['last_before_ref']:
            c['M46 pill places of a highlight set directly before the point\'s first reference']+=1
            if here in [f for f in x['first'] if f]: c['M46 … at that very verse']+=1
            else:
                c['M46 … at another verse']+=1
                if len(text.split())>=4 and len(ex['M46'])<400: ex['M46'].append((here,n,k,text,';'.join([f for f in x['first'] if f][:3])))
print(json.dumps(dict(sorted(c.items())),indent=1,ensure_ascii=False))
print('M5 rows followed by a reference:',len(r5),'standing somewhere:',len(rows5),'never standing at its cited verse:',sum(1 for v in rows5.values() if v[0]==0))
print('M46 point highlights:',len(r46),'standing somewhere:',len(rows46),'never at a verse its point cites:',sum(1 for v in rows46.values() if v[0]==0))
import random; random.seed(8)
for k,v in ex.items():
    with open(f'bdb-verse-wording-elsewhere-{k}.tsv','w') as f:
        f.write('place\tword\tkey\treading\tverse_the_source_cites\n')
        for x in v: f.write('\t'.join(x)+'\n')
    print('##',k)
    for x in random.sample(v,min(14,len(v))): print('   ',x)
json.dump(dict(c),open('bdb-verse-binding-stats.json','w'),ensure_ascii=False,indent=1)
