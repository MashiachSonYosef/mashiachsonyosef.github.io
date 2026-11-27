import gzip, json, collections, sys, os
Z=sys.argv[1]
books=[l.strip() for l in open(sys.argv[2])]
wk=collections.Counter(); mk=collections.Counter(); says={}; roles=collections.Counter(); kqshape=collections.Counter(); samples=collections.defaultdict(list)
lmk=collections.Counter(); ldk=collections.Counter(); pj=collections.Counter(); pgs=collections.Counter(); pgr=collections.Counter()
tot=collections.Counter()
for b in books:
    z=json.load(gzip.open(f'{Z}/{b}.bin'))
    for s in z['sections']:
        for i,w in enumerate(s['words']):
            tot['positions']+=1
            wk.update(w.keys())
            if 'mark' in w:
                m=w['mark']; mk[(m['kind'],m.get('glyph'),m.get('toggleable'),tuple(sorted(m.keys())))]+=1; says[m['kind']]=m.get('says')
                if m['kind'] not in('SOF_PASUQ','PASEQ','PETUCHAH','SETUMAH') and len(samples[m['kind']])<3: samples[m['kind']].append((b,s['label'],i,w))
                if 'in_read_form' in m and len(samples['in_read_form'])<3: samples['in_read_form'].append((b,s['label'],i,w))
            if 'w' in w:
                rs=tuple(r.get('role','-') for r in w['w']); roles[rs]+=1
                if 'kq' in w:
                    kq=w['kq']; kqshape[(kq.get('order'),kq.get('rows'),kq.get('convention'),kq.get('words_read'),kq.get('words_written'),tuple(sorted(kq.keys())))]+=1
                    key=('kqshape',rs)
                    if len(samples[key])<2: samples[key].append((b,s['label'],i,w))
                else:
                    if len(samples['w-no-kq'])<4: samples['w-no-kq'].append((b,s['label'],i,w))
            if 'kq' in w and 'w' not in w and len(samples['kq-no-w'])<4: samples['kq-no-w'].append((b,s['label'],i,w))
            for lm in w.get('letter_marks',[]): lmk[lm['kind']]+=1
            if 'ld' in w:
                kd=str(w['ld'].get('kind')); ldk[kd.split(':')[0] if '|' not in kd else 'multi']+=1
            if 'presentation_join' in w:
                p=w['presentation_join']; pj[(tuple(sorted(k for k in p if k!='why')), p.get('why','')[:40])]+=1
            for p in w.get('pg',[]): pgs[p.get('s')]+=1; pgr[p.get('r')]+=1
            for f in ('maqaf_implicit','vs','q','held','typed_here','overlay','kqw','te','np','ph'):
                if f in w and len(samples[f])<2: samples[f].append((b,s['label'],i,w))
print(tot); print('wordkeys',wk)
for k,v in sorted(mk.items(),key=lambda x:-x[1]): print('mark',v,k)
for k,v in says.items(): print('says',k,'::',v)
print('roles',roles)
for k,v in kqshape.items(): print('kq',v,k)
print('letter_marks',lmk); print('ld',ldk); print('pj',pj); print('pg.s',pgs); print('pg.r',pgr)
for k,v in samples.items():
    for x in v: print('##',k,x[0],x[1],x[2],json.dumps(x[3],ensure_ascii=False)[:700])
