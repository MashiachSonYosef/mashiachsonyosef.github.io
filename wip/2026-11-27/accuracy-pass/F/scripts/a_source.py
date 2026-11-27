# Parse the provider's public export of the edition (markup kept) into per-verse mark records.
# Independent of the corpus lane's restore script. Reads only; writes data/source-verses.jsonl
import json, re, sys, os, collections, html
SRC=sys.argv[1]; OUT=sys.argv[2]
books=[l.strip() for l in open(sys.argv[3])]
FN=re.compile(r'<sup[^>]*class="footnote-marker"[^>]*>.*?</sup>\s*<i[^>]*class="footnote"[^>]*>(.*?)</i>', re.S)
def parse(v):
    r=collections.Counter(); rec={}
    fns=[re.sub(r'<[^>]+>','',m.group(1)) for m in FN.finditer(v)]
    s=FN.sub('\x05',v)   # \x05 = footnote anchor
    assert 'footnote' not in s, s
    r['footnote']=len(fns)
    r['legarmeh']=len(re.findall(r'<b>\s*׀\s*</b>',s))
    r['paseq']=len(re.findall(r'<small>\s*׀\s*</small>',s))
    assert s.count('׀')==r['legarmeh']+r['paseq'], s
    r['pe']=len(re.findall(r'<span class="mam-spi-pe">',s)); r['samekh']=len(re.findall(r'<span class="mam-spi-samekh">',s)); r['invnun']=len(re.findall(r'<span class="mam-spi-invnun">',s))
    r['br']=len(re.findall(r'<br\s*/?>',s))
    # brick gaps: runs of exactly 8 nbsp that are not the samekh's own gap (the run that directly follows a samekh span)
    b=0
    for m in re.finditer(r'(?:&nbsp;)+',s):
        n=len(m.group(0))//6
        if n==8:
            before=s[:m.start()]
            if not re.search(r'<span class="mam-spi-samekh">\{ס\}</span>$',before): b+=1
        elif n!=1: r['nbsp_run_other']+=1
    r['brick']=b
    r['kq_wrapped']=len(re.findall(r'<span class="mam-kq">',s))
    nk=len(re.findall(r'<span class="mam-kq-k">',s)); nq=len(re.findall(r'<span class="mam-kq-q">',s))
    r['kq_k_spans']=nk; r['kq_q_spans']=nq
    r['kq_trivial']=len(re.findall(r'<span class="mam-kq-trivial">',s))
    r['implicit_maqaf']=len(re.findall(r'<span class="mam-implicit-maqaf">',s))
    r['big']=len(re.findall(r'<big>',s)); r['small_letters']=len(re.findall(r'<small>(?!\s*׀)',s)); r['sup']=len(re.findall(r'<sup>',s))
    # token stream with attributes: walk tags
    out=[]  # list of (char, frozenset(attrs))
    stack=[]
    pos=0
    for m in re.finditer(r'<[^>]+>|&nbsp;|&thinsp;|&amp;|&lt;|&gt;|&quot;',s):
        for ch in s[pos:m.start()]: out.append((ch,tuple(stack)))
        pos=m.end(); t=m.group(0)
        if t=='&nbsp;': out.append((' ',tuple(stack)))
        elif t=='&thinsp;': out.append((' ',tuple(stack)))
        elif t[0]=='&': out.append((html.unescape(t),tuple(stack)))
        elif t.startswith('</'): 
            if stack: stack.pop()
        elif re.match(r'<br',t): out.append(('\n',tuple(stack)))
        else:
            mm=re.match(r'<(\w+)(?:\s+class="([^"]*)")?',t); stack.append(mm.group(2) or mm.group(1))
    for ch in s[pos:]: out.append((ch,tuple(stack)))
    assert not stack, (stack,v)
    rec['chars']=out
    plain=''.join(c for c,_ in out)
    r['sof_pasuq']=plain.count('׃'); r['maqaf']=plain.count('־')
    r['dot_upper']=plain.count('ׄ'); r['dot_lower']=plain.count('ׅ')
    r['empty_dash']=plain.count('—')
    rec['counts']=dict(r); rec['footnotes']=fns
    # code point census of the text (letters, points) excluding whitespace
    cp=collections.Counter(c for c in plain if not c.isspace() and c not in '  \x05')
    rec['cp']={f'{ord(k):04X}':n for k,n in cp.items()}
    return rec
tot=collections.Counter()
with open(OUT,'w') as fo:
    for b in books:
        d=json.load(open(f'{SRC}/{b}.json'))
        for ci,ch in enumerate(d['text']):
            for vi,v in enumerate(ch):
                rec=parse(v)
                tot.update(rec['counts'])
                # words with attributes: split on whitespace
                words=[]; cur=[]
                for c,st in rec['chars']:
                    if c in '   \n\t': 
                        if cur: words.append(cur); cur=[]
                    else: cur.append((c,st))
                if cur: words.append(cur)
                toks=[]
                for w in words:
                    txt=''.join(c for c,_ in w); 
                    attrs=sorted({a for _,st in w for a in st})
                    # letter-level attrs: index (1-based over Hebrew letters) of big/small/sup letters
                    li=0; la={}
                    for c,st in w:
                        if 'א'<=c<='ת':
                            li+=1
                            for a in ('big','small','sup'):
                                if a in st: la.setdefault(a,[]).append(li)
                        elif c in 'ׅׄ' and li: la.setdefault('dot',[]).append(li)
                    toks.append({'t':txt,'a':attrs,**({'la':la} if la else {})})
                fo.write(json.dumps({'book':b,'ref':f'{ci+1}:{vi+1}','counts':rec['counts'],'cp':rec['cp'],'toks':toks,'fn':rec['footnotes'],'raw':v},ensure_ascii=False)+'\n')
print(json.dumps(dict(tot),indent=0))
