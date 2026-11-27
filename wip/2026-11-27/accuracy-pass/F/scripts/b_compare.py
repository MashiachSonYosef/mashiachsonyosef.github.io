# Three-way count of every mark, per book and per verse: the provider's export (source as published),
# the corpus lane's restore surface, and our zone. Reads only.
import json, re, sys, os, collections, gzip, csv, io
W=sys.argv[1]; ZONES=sys.argv[2]
books=[l.strip() for l in open(f'{W}/books39.txt')]
RESTORE=f'{W}/dl-restore/v2/ledgers/mam/mam-restore'
WS='   \n\t'
def strip(s): return ''.join(c for c in s if c not in WS and c not in '▯\x05')
def cpcount(s): return collections.Counter(f'{ord(c):04X}' for c in s)
MARKS=['maqaf','implicit_maqaf','sof_pasuq','paseq','legarmeh','paseq_or_legarmeh','pe','samekh','invnun','brick','empty_dash',
       'kq_sites','kq_k_then_q','kq_q_then_k','kq_ketiv_only','kq_qere_only','kq_multiword','kq_trivial',
       'large_words','small_words','suspended_words','dotted_words','dots','footnote',
       'meteg_or_silluq_05BD','rafe_05BF','cgj_034F','qamats_qatan_05C7','holam_haser_05BA','letters','points_all']
src=collections.defaultdict(dict); res=collections.defaultdict(dict); zon=collections.defaultdict(dict)
order=collections.defaultdict(list)
def blank(): return {'c':collections.Counter(),'txt':''}
# ---- source
for line in open(f'{W}/data/source-verses.jsonl'):
    r=json.loads(line); b=r['book']; ref=r['ref']; c=collections.Counter()
    k=r['counts']
    c['maqaf']=k.get('maqaf',0); c['implicit_maqaf']=k.get('implicit_maqaf',0); c['sof_pasuq']=k.get('sof_pasuq',0)
    c['paseq']=k.get('paseq',0); c['legarmeh']=k.get('legarmeh',0); c['paseq_or_legarmeh']=c['paseq']+c['legarmeh']
    c['pe']=k.get('pe',0); c['samekh']=k.get('samekh',0); c['invnun']=k.get('invnun',0); c['brick']=k.get('brick',0); c['empty_dash']=k.get('empty_dash',0)
    raw=r['raw']
    wrapped=len(re.findall(r'<span class="mam-kq">',raw)); nk=k.get('kq_k_spans',0); nq=k.get('kq_q_spans',0)
    c['kq_sites']=wrapped+(nk-wrapped)+(nq-wrapped); c['kq_ketiv_only']=nk-wrapped; c['kq_qere_only']=nq-wrapped
    for m in re.finditer(r'<span class="mam-kq">(.*?)</span></span>',raw):
        inner=m.group(1); ki=inner.find('mam-kq-k'); qi=inner.find('mam-kq-q')
        c['kq_k_then_q' if ki<qi else 'kq_q_then_k']+=1
        kt=re.search(r'<span class="mam-kq-k">(.*?)(?:</span>|$)',inner).group(1); qt=re.search(r'<span class="mam-kq-q">(.*?)(?:</span>|$)',inner).group(1)
        nwords=lambda t: len([x for x in re.split(r'[\s־]+',re.sub(r'<[^>]+>|&thinsp;|&nbsp;',' ',t).strip('()[] ־')) if re.search('[א-ת]',x)])
        if nwords(kt)>1 or nwords(qt)>1: c['kq_multiword']+=1
    c['kq_trivial']=k.get('kq_trivial',0)
    for t in r['toks']:
        la=t.get('la',{})
        if 'big' in la: c['large_words']+=1
        if 'small' in la: c['small_words']+=1
        if 'sup' in la: c['suspended_words']+=1
        if 'dot' in la: c['dotted_words']+=1
    c['dots']=k.get('dot_upper',0)+k.get('dot_lower',0); c['footnote']=k.get('footnote',0)
    cp=r['cp']
    c['meteg_or_silluq_05BD']=cp.get('05BD',0); c['rafe_05BF']=cp.get('05BF',0); c['cgj_034F']=cp.get('034F',0); c['qamats_qatan_05C7']=cp.get('05C7',0); c['holam_haser_05BA']=cp.get('05BA',0)
    c['letters']=sum(n for h,n in cp.items() if 0x5d0<=int(h,16)<=0x5ea)
    c['points_all']=sum(n for h,n in cp.items() if (0x591<=int(h,16)<=0x5bd) or h in('05BF','05C1','05C2','05C4','05C5','05C7','034F'))
    txt=''.join(t['t'] for t in r['toks'])
    src[b][ref]={'c':c,'txt':strip(txt),'cp':cp}
    order[b].append(ref)
# ---- restore
for b in books:
    rows=list(csv.DictReader(io.TextIOWrapper(gzip.open(f'{RESTORE}/mam-{b}-restored-v5.csv.gz'),encoding='utf8')))
    for r in rows:
        ref=r['ref']; d=res[b].setdefault(ref,{'c':collections.Counter(),'txt':''})
        c=d['c']; s=r['surface']; d['txt']+=strip(s)
        if r['c0_off']=='1':
            if r['sof_pasuq']=='1': c['sof_pasuq']+=1
            elif r['paseq']=='1': c['paseq_or_legarmeh']+=1
            elif r['gap']=='1': c['brick']+=1
            elif r['spi']=='pe': c['pe']+=1
            elif r['spi']=='samekh': c['samekh']+=1
            elif r['spi']=='invnun': c['invnun']+=1
            elif s=='—': c['empty_dash']+=1
            else: c['other_off:'+s]+=1
        else:
            c['maqaf']+=s.count('־')
            if r['implicit_maqaf']=='1': c['implicit_maqaf_rows']+=1
            if r['kq']=='1':
                c['kq_sites']+=1
                kw=len(r['ketiv'].split()) if r['ketiv'] else 0; qw=len(r['qere'].split()) if r['qere'] else 0
                if not qw: c['kq_ketiv_only']+=1
                elif not kw: c['kq_qere_only']+=1
                elif r['source_order']=='q_then_k': c['kq_q_then_k']+=1
                else: c['kq_k_then_q']+=1
                if kw>1 or qw>1: c['kq_multiword']+=1
            if r['kq_trivial']=='1': c['kq_trivial_rows']+=1
            sc=r['scribal'].split('|') if r['scribal'] else []
            if 'OTIYOT_GEDOLOT' in sc: c['large_words']+=1
            if 'OTIYOT_KETANOT' in sc: c['small_words']+=1
            if 'OTIYOT_TELUYOT' in sc: c['suspended_words']+=1
            if 'OTIYOT_MENUKADOT' in sc: c['dotted_words']+=1
            c['dots']+=s.count('ׄ')+s.count('ׅ')
    for ref,d in res[b].items():
        cp=cpcount(d['txt']); c=d['c']; d['cp']=cp
        c['meteg_or_silluq_05BD']=cp.get('05BD',0); c['rafe_05BF']=cp.get('05BF',0); c['cgj_034F']=cp.get('034F',0); c['qamats_qatan_05C7']=cp.get('05C7',0); c['holam_haser_05BA']=cp.get('05BA',0)
        c['letters']=sum(n for h,n in cp.items() if 0x5d0<=int(h,16)<=0x5ea)
        c['points_all']=sum(n for h,n in cp.items() if (0x591<=int(h,16)<=0x5bd) or h in('05BF','05C1','05C2','05C4','05C5','05C7','034F'))
# ---- zone
for b in books:
    z=json.load(gzip.open(f'{ZONES}/{b}.bin'))
    for s in z['sections']:
        ref=s['label']; d=zon[b].setdefault(ref,{'c':collections.Counter(),'txt':''}); c=d['c']
        for w in s['words']:
            t=w['s']; d['txt']+=strip(t)
            if 'mark' in w:
                kd=w['mark']['kind']
                key={'SOF_PASUQ':'sof_pasuq','PASEQ':'paseq_or_legarmeh','PETUCHAH':'pe','SETUMAH':'samekh','INVERTED_NUN':'invnun','BRICK_GAP':'brick','EMPTY_VERSE':'empty_dash'}.get(kd,'other_mark:'+kd)
                c[key]+=1
                if kd=='PASEQ': c['paseq']+=1   # every bar is named a paseq in the zone
                if kd=='LEGARMEH': c['legarmeh']+=1
            else:
                c['maqaf']+=t.count('־')
                if w.get('maqaf_implicit'): c['implicit_maqaf_words']+=1
                if 'kq' in w:
                    c['kq_sites']+=1; o=w['kq'].get('order')
                    c[{'KETIV_THEN_QERE':'kq_k_then_q','QERE_THEN_KETIV':'kq_q_then_k','KETIV_ONLY':'kq_ketiv_only','QERE_ONLY':'kq_qere_only'}[o]]+=1
                    if (w['kq'].get('words_read') or 0)>1 or (w['kq'].get('words_written') or 0)>1: c['kq_multiword']+=1
                if w.get('kq_trivial'): c['kq_trivial_words']+=1
                kinds={lm['kind'] for lm in w.get('letter_marks',[])}
                if 'LARGE' in kinds: c['large_words']+=1
                if 'SMALL' in kinds: c['small_words']+=1
                if 'SUSPENDED' in kinds: c['suspended_words']+=1
                if 'DOTTED' in kinds: c['dotted_words']+=1
                c['dots']+=t.count('ׄ')+t.count('ׅ')
                if 'ld' in w: c['ld_words']+=1
        cp=cpcount(d['txt']); d['cp']=cp
        c['meteg_or_silluq_05BD']=cp.get('05BD',0); c['rafe_05BF']=cp.get('05BF',0); c['cgj_034F']=cp.get('034F',0); c['qamats_qatan_05C7']=cp.get('05C7',0); c['holam_haser_05BA']=cp.get('05BA',0)
        c['letters']=sum(n for h,n in cp.items() if 0x5d0<=int(h,16)<=0x5ea)
        c['points_all']=sum(n for h,n in cp.items() if (0x591<=int(h,16)<=0x5bd) or h in('05BF','05C1','05C2','05C4','05C5','05C7','034F'))
# ---- per book table
rowsout=[]; vd=[]
EXTRA=['implicit_maqaf_rows','implicit_maqaf_words','kq_trivial_rows','kq_trivial_words','ld_words']
tot=collections.defaultdict(lambda: [0,0,0])
for b in books:
    refs=order[b]
    assert set(refs)==set(res[b])==set(zon[b]), (b, set(refs)^set(res[b]), set(refs)^set(zon[b]))
    agg=[collections.Counter(),collections.Counter(),collections.Counter()]
    for ref in refs:
        a,r,z=src[b][ref],res[b][ref],zon[b][ref]
        for i,x in enumerate((a,r,z)): agg[i].update(x['c'])
        # text equality
        if a['txt']!=r['txt']: vd.append((b,ref,'TEXT source!=restore',a['txt'],r['txt']))
        if r['txt']!=z['txt']: vd.append((b,ref,'TEXT restore!=zone',r['txt'],z['txt']))
        for m in MARKS:
            sa,sr,sz=a['c'].get(m,0),r['c'].get(m,0),z['c'].get(m,0)
            if m in('implicit_maqaf','kq_trivial','legarmeh','paseq','footnote'): continue
            if not (sa==sr==sz): vd.append((b,ref,'COUNT '+m,f'source={sa}',f'restore={sr} zone={sz}'))
    for m in MARKS+EXTRA:
        v=[agg[0].get(m,''),agg[1].get(m,''),agg[2].get(m,'')]
        rowsout.append((b,m,*v))
        for i in range(3): tot[m][i]+= (v[i] or 0)
    for i in range(3):
        for k in agg[i]:
            if k.startswith('other'): rowsout.append((b,k,*(agg[j].get(k,'') for j in range(3))))
with open(f'{W}/data/marks-by-book-raw.tsv','w') as f:
    f.write('book\tmark\tsource_export\trestore_surface\tzone\n')
    for r in rowsout: f.write('\t'.join(str(x) for x in r)+'\n')
    for m in MARKS+EXTRA: f.write('\t'.join(['ALL-39',m,*[str(x) for x in tot[m]]])+'\n')
with open(f'{W}/data/verse-diffs.tsv','w') as f:
    f.write('book\tref\tkind\ta\tb\n')
    for r in vd: f.write('\t'.join(str(x) for x in r)+'\n')
for m in MARKS+EXTRA: print(m, tot[m])
print('verse diffs', len(vd), collections.Counter(x[2] for x in vd))
