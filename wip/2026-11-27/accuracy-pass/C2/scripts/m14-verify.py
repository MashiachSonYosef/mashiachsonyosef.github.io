# Every served M14 row against the Hebrew Wikisource wikitext of Strong's (the dictionary store's records/M14.jsonl, field D).
import json,re,collections,gzip,sys,html
recs=[json.loads(l) for l in open('x-dict/dictionary-store-v1/records/M14.jsonl')]
def ws(s): return re.sub(r'\s+',' ',s).strip()
def body_of(D):
    i=D.find('{{ltr|1='); 
    if i<0: return None
    j=i+len('{{ltr|1='); depth=1; k=j
    while k<len(D) and depth>0:
        if D.startswith('{{',k): depth+=1; k+=2
        elif D.startswith('}}',k): depth-=1; k+=2
        else: k+=1
    return D[j:k-2]
def display(s, tag_as=' '):
    s=re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]',r'\1',s)     # a link reads as its text
    s=re.sub(r'\{\{[^{}]*\}\}',tag_as,s)                    # a template
    s=re.sub(r'<[^>]+>',tag_as,s)                            # a tag
    s=s.replace("'''",'').replace("''",'')                   # bold and italic quotes out
    return ws(html.unescape(s))
ent={}
bad=0
for r in recs:
    D=r['D']; m=re.match(r'==\s*(\d+)\s*==',D); n='H'+m.group(1)
    b=body_of(D)
    if b is None: bad+=1; continue
    mm=re.match(r"\s*'''(.*?)'''\s*:?",b,flags=re.S)
    if not mm: bad+=1; head=''; rest=b
    else: head=mm.group(1); rest=b[mm.end():]
    after=D[D.find(b)+len(b)+2:]
    ent.setdefault(n,[]).append({'n':n,'head':head,'raw':rest,'ours':display(rest,' '),'theirs':display(rest,''),'forms_raw':after.strip(),'loc':r['loc'],'file':r['file'].split('/')[-1]})
print('records',len(recs),'entries',len(ent),'unparsed',bad,file=sys.stderr)
json.dump(ent,open('m14-entries.json','w'),ensure_ascii=False)
def pieces(text):
    out=[]; depth=0; cur=''
    for ch in text:
        if ch=='(': depth+=1
        elif ch==')': depth=max(0,depth-1)
        if ch==',' and depth==0: out.append(cur); cur=''
        else: cur+=ch
    out.append(cur); return [p.strip() for p in out]
c=collections.Counter(); out=[]
for line in open('rows-M14.jsonl'):
    r=json.loads(line); c['rows']+=1
    ns=(r['facts'] or {}).get('n') or []
    cands=[e for n in ns for e in ent.get(n,[])]
    if not cands: c['fact n names no entry']+=1
    found=None
    for e in cands:
        if e['ours']==r['def']: found=e; break
    if not found:
        for n,es in ent.items():
            for e in es:
                if e['ours']==r['def']: found=e; c['definition found only under another entry than fact n']+=1; out.append(('def-under-another-entry',r['k'],','.join(ns),r['route'],n,'')); break
            if found: break
    if not found:
        c['source entry not found']+=1; out.append(('not-found',r['k'],','.join(ns),r['route'],r['def'][:200],'')); continue
    c['definition slot exact (the catalog step)']+=1
    if r['recordPrinted']==found['theirs']: c['definition printed == source without made spaces']+=1
    else: c['definition printed differs from source without made spaces']+=1
    route=r['route']
    ps=pieces(found['ours'])
    ok=None
    if route in ps: ok='a comma piece'
    else:
        # the piece that crosses the list opener: its part after the last ': ' or ':--' or '; --'
        for p in ps:
            for sep in (':--',': --','; --',';--',': ',':'):
                if sep in p:
                    tail=p.split(sep)[-1].strip()
                    if tail==route: ok='the part of a comma piece after the list opener «%s»'%sep.strip(); break
                    t2=re.sub(r'^-{1,2}','',tail).strip()
                    if t2==route: ok='after the opener, head hyphens removed'; break
            if ok: break
            t2=re.sub(r'^-{1,2}','',p).strip()
            if t2==route: ok='a comma piece, head hyphens removed'; break
    if not ok:
        if route==found['ours']: ok='the whole definition'
        else:
            for p in ps:
                for sep in ('',':--',': --','; --',';--',': ',':'):
                    tail=p.split(sep)[-1].strip() if sep else p
                    tail2=re.sub(r'^-{1,2}','',tail).strip()
                    for tl in (tail,tail2):
                        if tl==route+'.': ok='a comma piece without its closing stop'; break
                        if tl.startswith(route+'. ') or tl.startswith(route+'.'): ok='a comma piece up to its first stop (what follows the stop is left out)'; break
                    if ok: break
                if ok: break
            if not ok and route in found['ours']: ok='another run of the definition'
    if ok: c['route is '+ok]+=1
    else: c['route is no run of the definition']+=1; out.append(('route-not-a-run',r['k'],found['n'],route,found['ours'][:300],''))
    if ok and (ok.startswith('another')): out.append(('route-another-run',r['k'],found['n'],route,found['ours'][:400],''))
    for rd in r['readings']:
        c['readings']+=1
        if rd not in r['routePrinted']: c['reading no run of printed']+=1
print(json.dumps(c,indent=1,ensure_ascii=False))
with gzip.open('rows-differ-wikisource_strongs_explicit_forms.tsv.gz','wt',encoding='utf-8') as g:
    g.write('kind\tkey\tentry\troute_as_served\tdefinition_or_note\tx\n')
    for o in out: g.write('\t'.join(x.replace('\t',' ').replace('\n',' ') for x in o)+'\n')
