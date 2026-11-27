# The page as drawn on a first visit (the browser census) against the zone, entry by entry, all 39 books.
import json, gzip, sys, collections, re
W=sys.argv[1]; ZONES=sys.argv[2]
books=[l.strip() for l in open(f'{W}/books39.txt')]
tally=collections.Counter(); diffs=[]; perbook=collections.defaultdict(collections.Counter)
disp_rest=collections.defaultdict(collections.Counter); disp_on=collections.defaultdict(collections.Counter); heads=collections.Counter()
joins=[]; 
LETTER=lambda c: 'א'<=c<='ת'
def is_point(c):
    cp=ord(c); return 0x591<=cp<=0x5c7 and cp not in (0x5be,0x5c0,0x5c3,0x5c6)
for b in books:
    z=json.load(gzip.open(f'{ZONES}/{b}.bin')); p=json.load(open(f'{W}/data/page/{b}.json'))
    heads[(p['head']['marksOn'],p['head']['bodyClass'],json.dumps(p['head']['toggles'],sort_keys=True),p['head']['masorah'])]+=1
    for k,v in (p['disp_rest'] or {}).items(): disp_rest[k][v]+=1
    for k,v in ((p['disp_on'] or {}).get('disp') or {}).items(): disp_on[k][v]+=1
    if p['disp_on'] and p['disp_on'].get('stroke'): disp_on['kq-stroke::before content'][p['disp_on']['stroke']]+=1
    pb=perbook[b]
    assert len(z['sections'])==len(p['secs']),(b,len(z['sections']),len(p['secs']))
    for zs,ps in zip(z['sections'],p['secs']):
        ref=zs['label']
        if ps['l']!=ref: diffs.append((b,ref,0,'label differs',ps['l'],ref))
        ze=zs['words']; pe=ps['e'] or []
        tally['sections']+=1
        if len(ze)!=len(pe):
            diffs.append((b,ref,0,'entry count differs',len(pe),len(ze))); tally['sections with a different entry count']+=1; continue
        for i,(zw,pw) in enumerate(zip(ze,pe)):
            tally['entries']+=1
            if pw['t']!=zw['s']:
                diffs.append((b,ref,i+1,'text differs',pw['t'],zw['s'])); tally['entries whose text differs']+=1
            zm=zw.get('mark'); pm=pw.get('m')
            cls=set((pw.get('c') or '').split())
            if zm:
                kd=zm['kind']; pb['page '+kd]+=1
                if pm!=kd: diffs.append((b,ref,i+1,'mark kind differs',pm,kd)); tally['marks whose kind differs']+=1
                off='mark-off' in cls
                if off!=bool(zm.get('toggleable')): diffs.append((b,ref,i+1,'mark-off differs',off,zm.get('toggleable')))
                if off: pb['page hidden at rest '+kd]+=1
                else: pb['page shown at rest '+kd]+=1
                if zm.get('in_read_form'):
                    pb['page PASEQ in read form']+=1
                    if 'in-read-form' not in cls: diffs.append((b,ref,i+1,'in-read-form class missing','',''))
            else:
                if pm: diffs.append((b,ref,i+1,'page draws a mark the zone has not',pm,''))
                t=pw['t'] or ''
                pb['page maqaf']+=t.count('־'); pb['page dots']+=t.count('ׄ')+t.count('ׅ')
                pb['page meteg_or_silluq_05BD']+=t.count('ֽ'); pb['page rafe_05BF']+=t.count('ֿ'); pb['page cgj_034F']+=t.count('͏')
                # letter marks
                zl=zw.get('letter_marks') or []
                want=[]
                if zl:
                    letters=[j for j,c in enumerate(zw['s']) if LETTER(c)]
                    marked={}
                    for lm in zl:
                        for at in lm['letters']: marked[at]=lm['kind'].lower()
                    for at in sorted(marked):
                        j=letters[at-1]; txt=zw['s'][j]; k=j+1
                        while k<len(zw['s']) and is_point(zw['s'][k]): txt+=zw['s'][k]; k+=1
                        want.append([marked[at],txt])
                    for lm in zl: pb['page letter mark words '+lm['kind']]+=1
                got=[[a,t2] for a,t2 in (pw.get('lm') or [])]
                if want!=got:
                    diffs.append((b,ref,i+1,'letter marks differ',json.dumps(got,ensure_ascii=False),json.dumps(want,ensure_ascii=False))); tally['words whose drawn letter marks differ']+=1
                elif want: tally['words whose letter marks are drawn as the zone says']+=1
                # kq
                if 'kq' in zw:
                    pb['page kq cells']+=1
                    if 'kq' not in cls: diffs.append((b,ref,i+1,'kq class missing',pw.get('c'),''))
                    regs=[r for r in zw['w'] if '־' not in (r.get('s') or r.get('k') or '')]
                    gotr=[x[0] for x in (pw.get('wr') or [])]
                    if [r['s'] for r in regs]!=gotr and 'ks' not in pw:
                        diffs.append((b,ref,i+1,'kq regions differ',json.dumps(gotr,ensure_ascii=False),json.dumps([r['s'] for r in regs],ensure_ascii=False))); tally['kq regions differ']+=1
                    back=[x[0] for x in (pw.get('wr') or []) if 'backs-en' in x[1]]
                    roles={r['s']:r['role'] for r in regs}
                    br=sorted({roles.get(x,'?') for x in back})
                    tally['kq line stands on: '+('+'.join(br) if br else 'none')+' ['+zw['kq']['order']+']']+=1
                    if zw['kq'].get('stroke'):
                        pb['page kq with stroke']+=1
                        if 'ks' not in pw: diffs.append((b,ref,i+1,'stroke not drawn',zw['s'],json.dumps(zw['kq']['stroke'],ensure_ascii=False)))
                    elif 'ks' in pw: diffs.append((b,ref,i+1,'stroke drawn with none in zone','',''))
                elif 'kq' in cls: diffs.append((b,ref,i+1,'kq class with no kq in zone','',''))
                if ('ld' in zw)!=('ld' in pw): diffs.append((b,ref,i+1,'ld differs',pw.get('ld'),json.dumps(zw.get('ld'),ensure_ascii=False)))
                if 'ld' in zw: pb['page ld words']+=1
            if 'j' in pw: pass
        # joined cells at rest
        seen={}
        for i,pw in enumerate(pe):
            if 'j' in pw: seen.setdefault(pw['j'],[]).append(i)
        for j,idx in seen.items():
            words=[ze[i] for i in idx]
            joins.append((b,ref,idx[0]+1,len(idx),pe[idx[0]].get('jc'),' '.join(w['s'] for w in words),pe[idx[0]].get('jg') or ''))
            tally['joined cells at rest']+=1; pb['page joined cells']+=1
        # the ink at rest: is a stroke followed by a space?
        rest=ps.get('rest') or ''
        pb['page maqaf followed by a space at rest']+=len(re.findall('־\\s',rest)); pb['page maqaf followed by no space at rest']+=len(re.findall('־(?=\\S)',rest))
with open(f'{W}/data/page-vs-zone-diffs.tsv','w') as f:
    f.write('book\tref\tentry\tkind\tpage\tzone\n')
    for d in diffs: f.write('\t'.join(str(x) for x in d)+'\n')
with open(f'{W}/data/page-joined-cells.tsv','w') as f:
    f.write('book\tref\tfirst_entry\twords\tclasses\thebrew\tline\n')
    for d in joins: f.write('\t'.join(str(x) for x in d)+'\n')
keys=sorted({k for b in perbook for k in perbook[b]})
with open(f'{W}/data/page-marks-by-book.tsv','w') as f:
    f.write('book\t'+'\t'.join(keys)+'\n')
    for b in books: f.write(b+'\t'+'\t'.join(str(perbook[b].get(k,0)) for k in keys)+'\n')
    f.write('ALL-39\t'+'\t'.join(str(sum(perbook[b].get(k,0) for b in books)) for k in keys)+'\n')
for k in keys: print(sum(perbook[b].get(k,0) for b in books), k)
print(); 
for k,v in sorted(tally.items()): print(v,k)
print('heads',heads); print('display at rest',dict(disp_rest)); print('display with marks on',dict(disp_on))
print('diffs',len(diffs),collections.Counter(d[3] for d in diffs))
print('join classes',collections.Counter(j[4] for j in joins))
