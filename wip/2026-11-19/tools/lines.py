import gzip, json, sys
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
book=sys.argv[1]
for tree in ('old','s8'):
    d=json.load(gzip.open(f'{S}/{tree}/reader/data/resting-lines/{book}.json.gz'))
    z=json.load(gzip.open(f'{S}/{tree}/reader/data/zones/{book}.bin'))
    secs={s['label']:s for s in z['sections']}
    src=d.get('sources',{})
    for want in sys.argv[2:]:
        for label, entries in d['sections']:
            if label==want:
                out=[]
                for e in entries:
                    w=secs[label]['words'][e[0]]
                    extra=''.join(k for k in ('tg','te','kq','kq_trivial','np') if w.get(k))
                    out.append(f"{e[0]+1}:«{e[2]}»({e[3]}){'['+extra+']' if extra else ''}")
                print(tree, label, ' '.join(out)[:1500])
