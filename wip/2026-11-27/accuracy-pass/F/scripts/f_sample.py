# Choose the places read by hand: up to 30 per class of mark, spread over the books, each with the source's own markup.
import json, gzip, sys, re, collections
sys.path.insert(0, sys.argv[1]+'/scripts')
from srcparse import chars, FN
W=sys.argv[1]; ZONES=sys.argv[2]
books=[l.strip() for l in open(f'{W}/books39.txt')]
src={}
for line in open(f'{W}/data/source-verses.jsonl'):
    r=json.loads(line); src[(r['book'],r['ref'])]=r['raw']
strip=lambda s: ''.join(c for c in s if c not in '   \n\t▯׀')
pool=collections.defaultdict(list)
def snippet(raw, needle_start, width=70):
    a=max(0,needle_start-width); b=min(len(raw),needle_start+width)
    return raw[a:b].replace('\t',' ')
for b in books:
    z=json.load(gzip.open(f'{ZONES}/{b}.bin'))
    for si,sec in enumerate(z['sections']):
        ref=sec['label']; raw=src[(b,ref)]
        # the source verse with the footnotes kept as anchors, to find where each zone word stands in the raw markup
        sc=chars(raw,keep_bar=False)
        # raw offsets of each kept char: recompute by walking raw (approximate: search forward for the char outside tags)
        # simpler: carry a snippet by searching the word's bare text in raw
        pos=0; bars=[m for m in re.finditer(r'<(b|small)>\s*׀\s*</(?:b|small)>',FN.sub('',raw))]
        bar_i=0
        nwords=0
        for wi,w in enumerate(sec['words']):
            t=strip(w['s']); rng=range(pos,pos+len(t)); pos+=len(t)
            attrs=[sc[i][1] for i in rng] if t else []
            has=lambda name: any(name in a for a in attrs)
            base=dict(book=b,si=si,ref=ref,e=wi,s=w['s'])
            def add(cls,**kw): pool[cls].append({**base,'cls':cls,**kw})
            if 'mark' in w:
                kd=w['mark']['kind']
                if kd=='PASEQ':
                    m=bars[bar_i] if bar_i<len(bars) else None; bar_i+=1
                    kind='legarmeh' if (m and m.group(1)=='b') else 'paseq'
                    if w['mark'].get('in_read_form'): add('paseq written inside a read form',src_kind=kind)
                    else: add(kind)
                elif kd=='SOF_PASUQ': add('sof pasuq')
                elif kd=='PETUCHAH': add('petuchah'+(' inside a verse' if wi<len(sec['words'])-1 and any('mark' not in x for x in sec['words'][wi+1:]) else ''))
                elif kd=='SETUMAH': add('setumah'+(' inside a verse' if wi<len(sec['words'])-1 and any('mark' not in x for x in sec['words'][wi+1:]) else ''))
                elif kd=='BRICK_GAP': add('song spacing (brick gap)')
                elif kd=='INVERTED_NUN': add('inverted nun')
                elif kd=='EMPTY_VERSE': add('empty verse')
                continue
            nwords+=1; base['word']=nwords
            if 'kq' in w:
                o=w['kq']['order']; wr=w['kq'].get('words_read') or 0; ww=w['kq'].get('words_written') or 0
                if o=='KETIV_ONLY': add('ketiv: written, not read')
                elif o=='QERE_ONLY': add('qere: read, not written')
                elif wr>1 or ww>1: add('ketiv and qere: one word for two or two for one')
                elif o=='QERE_THEN_KETIV': add('ketiv and qere, the read form first')
                else: add('ketiv and qere')
            if w.get('kq_trivial'):
                add('trivial ketiv/qere (one pointed form)' if has('mam-kq-trivial') else 'flagged trivial ketiv/qere, not so marked in the source')
            impl=[i for i in rng if sc[i][0]=='־' and 'mam-implicit-maqaf' in sc[i][1]]
            if impl: add('gray maqaf (implicit)')
            elif w.get('maqaf_implicit'): add('flagged implicit maqaf, not so marked in the source')
            elif '־' in w['s'] and 'kq' not in w: add('maqaf')
            for lm in w.get('letter_marks',[]):
                add({'LARGE':'large letter','SMALL':'small letter','SUSPENDED':'suspended letter','DOTTED':'dotted letters'}[lm['kind']],letters=lm['letters'])
            if 'ld' in w: add('our text spells otherwise than Leningrad (ld)',ld=w['ld'])
            if 'ֽ' in w['s'] and 'kq' not in w:
                # meteg: a U+05BD that is not the last accent before sof pasuq (silluq); take words not last in verse
                rest=[x for x in sec['words'][wi+1:] if 'mark' not in x]
                if rest: add('meteg')
            if 'ֿ' in w['s']: add('rafe')
            if '͏' in w['s']: add('two vowels on one letter (joiner)')
        # the edition's notes on scroll differences
        for m in FN.finditer(raw):
            before=re.sub(r'<[^>]+>|&[a-z]+;',' ',FN.sub('',raw[:m.start()]))
            tw=[x for x in before.split() if re.search('[א-ת]',x)]
            pool["the edition's note on a scroll difference"].append(dict(book=b,si=si,ref=ref,e=None,cls="the edition's note on a scroll difference",note=re.sub(r'<[^>]+>','',m.group(1)),after_word=tw[-1] if tw else '',raw=raw[max(0,m.start()-60):m.end()+10]))
# choose: spread over books, deterministic
chosen=[]
for cls,items in sorted(pool.items()):
    if len(items)<=31: pick=items
    else:
        byb=collections.defaultdict(list)
        for it in items: byb[it['book']].append(it)
        pick=[]; bl=sorted(byb); r=0
        while len(pick)<30:
            progressed=False
            for bk in bl:
                lst=byb[bk]
                if r<1 and lst:
                    it=lst[len(lst)//2]   # the middle one of the book
                    pick.append(it); lst.remove(it); progressed=True
                elif lst and r>=1:
                    it=lst[(len(lst)*((r*7)%10))//10]; pick.append(it); lst.remove(it); progressed=True
                if len(pick)>=30: break
            r+=1
            if not progressed: break
    for it in pick:
        raw=src[(it['book'],it['ref'])]
        if 'raw' not in it:
            bare=it['s'].replace('▯','')
            core=re.sub(r'[()\[\] ]','',bare)[:6]
            i=raw.find(core) if core else -1
            it['raw']=snippet(raw,i if i>=0 else 0)
        chosen.append(it)
json.dump(chosen,open(f'{W}/data/read-by-hand-targets.json','w'),ensure_ascii=False)
print({k:len(v) for k,v in sorted(pool.items())})
print(len(chosen), collections.Counter(c['cls'] for c in chosen))
