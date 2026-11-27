# Every served M5 row against BrownDriverBriggs.xml (Open Scriptures, commit 21c9add).
import re,json,collections,gzip,sys,html
t=open('dl-os/BrownDriverBriggs.xml',encoding='utf-8').read()
TAG=re.compile(r'<[^>]+>')
def ws(s): return re.sub(r'\s+',' ',s).strip()
def store_text(raw): return ws(html.unescape(TAG.sub(' ',raw)))
def own_text(raw): return ws(html.unescape(TAG.sub('',raw)))
entries={}
for m in re.finditer(r'<entry id="([^"]+)"([^>]*)>(.*?)</entry>',t,flags=re.S):
    eid,attrs,body=m.group(1),m.group(2),m.group(3)
    body_nostatus=re.sub(r'<status[^>]*>.*?</status>','',body,flags=re.S)
    defs=[]
    # each def with its context: enclosing sense numbers, stem, aspect
    # walk tokens
    stack=[]; stem=None; pos=0
    for tk in re.finditer(r'<(/?)(sense|stem|def|asp|pos)([^>]*)>',body_nostatus):
        close,name,at=tk.group(1),tk.group(2),tk.group(3)
        if name=='sense':
            if close:
                if stack: stack.pop()
            else:
                n=re.search(r'n="([^"]*)"',at); stack.append({'n':n.group(1) if n else None,'stem':None})
        elif name=='stem' and not close:
            e=body_nostatus.find('</stem>',tk.end()); s=own_text(body_nostatus[tk.end():e])
            if stack: stack[-1]['stem']=s
            else: stem=s
        elif name=='def' and not close:
            e=body_nostatus.find('</def>',tk.end()); raw=body_nostatus[tk.end():e]
            st=None
            for fr in reversed(stack):
                if fr['stem']: st=fr['stem']; break
            defs.append({'raw':raw,'senses':[fr['n'] for fr in stack],'stem':st or stem,'at':tk.start()})
    entries[eid]={'id':eid,'attrs':attrs,'body':body_nostatus,'defs':defs}
print('entries',len(entries),'defs',sum(len(e['defs']) for e in entries.values()),file=sys.stderr)
c=collections.Counter(); out=[]
for line in open('rows-M5.jsonl'):
    r=json.loads(line); c['rows']+=1
    bs=(r['facts'] or {}).get('b') or []
    route=r['route']; printed=r['routePrinted']
    cands=[entries[b] for b in bs if b in entries]
    if len(cands)<len(bs): c['fact b names an entry not in the file']+=1
    found=None
    for e in cands:
        for d in e['defs']:
            if store_text(d['raw'])==route: found=(e,d); break
        if found: break
    if not found:
        for e in entries.values():
            for d in e['defs']:
                if store_text(d['raw'])==route: found=(e,d); c['found only in another entry than fact b']+=1; break
            if found: break
        if found: out.append(('def-found-only-in-another-entry',r['k'],','.join(bs),route,found[0]['id'],''))
    if not found:
        c['source entry not found']+=1; out.append(('not-found',r['k'],','.join(bs),route,'','')); continue
    e,d=found
    own=own_text(d['raw'])
    if printed==own: c['printed text exact']+=1
    else:
        kind='made space kept' if printed==store_text(d['raw']) else ('spaces differ' if printed.replace(' ','')==own.replace(' ','') else 'text differs')
        c['printed differs: '+kind]+=1; out.append((kind,r['k'],e['id'],route,printed,own))
    for rd in r['readings']:
        c['readings']+=1
        if rd not in printed: c['reading is no run of the printed text']+=1; out.append(('reading-not-a-run',r['k'],e['id'],route,rd,printed))
    # the definition slot: is it derived from the entry's text?
    if r['def']:
        full=store_text(e['body'])
        if r['def']==full: c['def slot == whole entry text']+=1
        elif r['def'] in full: c['def slot is a run of the entry text']+=1
        else: c['def slot not a run of the entry text']+=1
print(json.dumps(c,indent=1,ensure_ascii=False))
with gzip.open('rows-differ-openscriptures_bdb_1906.tsv.gz','wt',encoding='utf-8') as g:
    g.write('kind\tkey\tentry\troute_as_served\tprinted_or_reading\tsource_own_text\n')
    for o in out: g.write('\t'.join(x.replace('\t',' ').replace('\n',' ') for x in o)+'\n')
json.dump(entries,open('m5-entries.json','w'),ensure_ascii=False)
