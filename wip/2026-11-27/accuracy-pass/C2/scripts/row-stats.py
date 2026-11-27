import json,sys,collections
for m in ['M9','M14','M5','M46']:
    c=collections.Counter(); ex={}
    for line in open(f'rows-{m}.jsonl'):
        r=json.loads(line)
        c['rows']+=1
        if r['route']==r['def']: c['route==def']+=1
        if r['def'] in (None,''): c['def empty']+=1
        if r['cut']: c['cutflag']+=1
        if r['cuts']: c['has cuts']+=1
        if r['prints'] is not None: c['has prints']+=1; ex.setdefault('prints',[]).append((r['k'],r['route'],r['prints']))
        if r['prints']==[]: c['prints empty (no pill)']+=1
        if r['closes']:
            if r['closes'][0]: c['closes route']+=1
            if len(r['closes'])>1 and r['closes'][1]: c['closes def']+=1
            if len(r['closes'])>2 and r['closes'][2]: c['note']+=1; ex.setdefault('note',[]).append((r['k'],r['route'],r['closes'][2]))
        f=r['facts'] or {}
        for kk in f: c['fact:'+kk]+=1
        if not f.get('n'): c['no n']+=1
        if f.get('n') and len(f['n'])>1: c['n>1']+=1
        if r['opened']: c['opened']+=1
        if not r['readings']: c['no readings']+=1
        c['readings total']+=len(r['readings'])
        if r['year']: c['year:'+str(r['year'])]+=1
        c['len:'+str(r['len'])]+=1
        if not r['heads']: c['no heads']+=1
        if r['routePrinted']!=r['route']: c['routePrinted != route']+=1
    print('=====',m)
    for k,v in sorted(c.items()): print('  ',k,v)
    for k,v in ex.items(): print('  ex',k,v[:4])
