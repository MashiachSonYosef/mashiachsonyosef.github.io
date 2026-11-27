import json,sys,collections
d=json.load(open('data/read-by-hand-page.json'))
want=sys.argv[1:] 
by=collections.defaultdict(list)
for r in d: by[r['cls']].append(r)
for cls in sorted(by):
    if want and not any(w in cls for w in want): continue
    print('=====',cls,len(by[cls]))
    pat=collections.Counter()
    for r in by[cls]:
        p=r['press']; ones=[p['one']] if p.get('one') else (p.get('regions') or [])
        rest=r['rest']
        lm=';'.join(f"{x['cls'].split()[1]}:{x['text']}:{x['size']}/{x['word_size']}:{x['valign']}" for x in rest.get('lm',[]))
        mq=';'.join(f"{x['text']}:{x['fill']}" for x in rest.get('mq',[]))
        print(f"  {r['book']} {r['ref']} e{r['e']} {r['s']} | raw: {r.get('raw','')[:110]!r}")
        print(f"     rest: display={rest.get('display')} cls={rest.get('cls')} text={rest.get('text')} gapAfter={rest.get('gapAfter')} join={rest.get('inJoin')} line={rest.get('line')!r} credit={rest.get('credit')} title={rest.get('title')} lm=[{lm}] mq=[{mq}] wr={[(x[0],x[1]) for x in rest.get('wr',[])]} stroke={rest.get('stroke')} box={rest.get('box')}")
        print(f"     on: {r['on']}")
        for o in ones:
            print(f"     press{(' on '+o['on']) if 'on' in o else ''}: roles={o.get('roles')} keys={[k[:150] for k in (o.get('keys') or [])]} pills={o.get('pills')} now={o.get('now')!r}")
