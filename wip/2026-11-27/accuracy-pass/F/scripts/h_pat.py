import json,sys,collections
d=json.load(open('data/read-by-hand-page.json'))
want=sys.argv[1:]
by=collections.defaultdict(list)
for r in d: by[r['cls']].append(r)
print({k:len(v) for k,v in sorted(by.items())}, sum(len(v) for v in by.values()))
for cls in sorted(by):
    if want and not any(w in cls for w in want): continue
    pat=collections.Counter(); exs={}
    for r in by[cls]:
        p=r['press']; ones=[p['one']] if p.get('one') else (p.get('regions') or [])
        rest=r['rest']
        lm=';'.join(f"{x['cls'].split()[1]}:{x['size']}/{x['word_size']}:{x['valign']}" for x in rest.get('lm',[]))
        mqc=','.join(sorted({x['fill'] for x in rest.get('mq',[])}))
        key=(rest.get('display'), 'gap' if rest.get('gapAfter')=='" "' else str(rest.get('gapAfter'))[:10], rest.get('inJoin'), r['on'].get('display'), r['on'].get('strokeDrawn'), lm, mqc,
             tuple(tuple(o.get('roles') or []) for o in ones), tuple(tuple(k[:90] for k in (o.get('keys') or [])) for o in ones))
        pat[key]+=1; exs.setdefault(key,[]).append(f"{r['book']} {r['ref']} {r['s']} line={rest.get('line')!r} pills={[ (o.get('pills') or [])[:2] for o in ones]}")
    print('=====',cls,len(by[cls]))
    for k,v in pat.most_common():
        print(' ',v,'x rest:',k[0],'| after:',k[1],'| join:',k[2],'| on:',k[3],'| stroke:',k[4],'| lm:',k[5],'| stroke ink:',k[6]); print('      roles:',k[7]); print('      keys:',k[8])
        for e in exs[k][:int(sys.argv[0] and 3)]: print('      e.g.',e[:260])
