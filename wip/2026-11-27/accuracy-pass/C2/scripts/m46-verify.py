# Every served M46 row against unabridged-BDB-Hebrew-lexicon.csv (commit 6e8326c), by the catalog's declared step
# (data/made-spaces/made-spaces-v2/RULE.md): highlighted word, a point's highlight, a point's opening.
import re,json,collections,gzip,sys,html
lines=open('dl-ubdb-x/unabridged-BDB-Hebrew-lexicon.csv',encoding='utf-8').read().split('\n')
recs=[l.split('\t') for l in lines[1:] if l]
TAG=re.compile(r'<[^>]+>')
def ws(s): return re.sub(r'\s+',' ',s).strip()
EDGE=re.compile(r'^[\s,;:\-—–]+|[\s,;:\-—–]+$')
def edge(s):
    return re.sub(r'[\s,;:\-—–]+$','',re.sub(r'^[\s,;:\-—–]+','',s))
def ours(raw): return ws(html.unescape(TAG.sub(' ',raw)))
def theirs(raw): return ws(html.unescape(TAG.sub('',raw)))
WHOLE=re.compile(r'<(bdbheb|bdbarc|lookup|transliteration|entry)\b[^>]*>.*?</\1>',re.S)
R={}
byH=collections.defaultdict(list)
for bid,sn,content in recs:
    i=content.find('</div>'); main=content[i+6:] if i>=0 else content
    fields=[]
    for k,m in enumerate(re.finditer(r'<highlightword>(.*?)</highlightword>',main,flags=re.S),1):
        fields.append((bid+':highlightword%d'%k, m.group(1), 'highlightword'))
    # points
    p=0
    for m in re.finditer(r'<div class="point">(.*?)(?=<div class="point">|</div>|$)',main,flags=re.S):
        body=m.group(1)
        mm=re.match(r'\s*<b>\s*([0-9]+\.|[a-z]\.)\s*</b>',body)
        if not mm: continue
        p+=1; marker=mm.group(1)
        j=body.find('<ref'); head=body[:j] if j>=0 else body
        hs=list(re.finditer(r'<highlight>(.*?)</highlight>',head,flags=re.S))
        for k,h in enumerate(hs,1): fields.append(('%s:point%d:%s:highlight%d'%(bid,p,marker,k), h.group(1), 'highlight'))
        op=head[mm.end():]
        fields.append(('%s:point%d:%s:opening'%(bid,p,marker), op, 'opening'))
    R[bid]={'id':bid,'sn':sn,'main':main,'fields':fields,'ours':ours(main),'theirs':theirs(main)}
    for h in sn.split('_'):
        if h: byH[h].append(bid)
print('records',len(R),file=sys.stderr)
def variants(raw,kind):
    out=[]
    if kind=='opening':
        o=WHOLE.sub(' ',raw)
        out.append(('opening, whole elements out', edge(ours(o)), edge(theirs(WHOLE.sub(' ',raw)))))
        out.append(('opening, words back', edge(ours(raw)), edge(theirs(raw))))
    else:
        out.append((kind, edge(ours(raw)), edge(theirs(raw))))
    return out
c=collections.Counter(); out=[]
allrecs=list(R.values())
RET={}
for l in open(sys.argv[1]+'/data/made-spaces/land-v187-v1/retext-v1.jsonl'):
    x=json.loads(l); RET[(x['key'],x['rank'])]=x

for line in open('rows-M46.jsonl'):
    r=json.loads(line); c['rows']+=1
    f=r['facts'] or {}
    ns=f.get('n') or []
    cand=[]
    if f.get('opens'): cand.append(f['opens'].split(' ')[0])
    for n in ns: cand+= [b for b in byH.get(n,[]) if b not in cand]
    route=r['route']; printed=r['routePrinted']
    found=None
    def look(bids):
        for b in bids:
            rec=R.get(b)
            if not rec: continue
            for name,raw,kind in rec['fields']:
                for vk,o,t in variants(raw,kind):
                    if o==route: return (rec,name,vk,o,t)
        return None
    found=look(cand)
    where='its own entry (fact n or opens)'
    pill = 'pill' if r['readings'] else 'note (a sense opening, no pill)'
    c['rows that print as a '+pill]+=1
    x=RET.get((r['k'],r['rank']))
    if not found and x and x['to_text']==route:
        c['route == the words-back list (relay v187), '+pill]+=1
        # the words given back: are they the record's own, in the record's text?
        rec=R.get(x['opens'].split(' ')[0]) if x.get('opens') else None
        continue
    if not found:
        found=look(R.keys()); where='another entry than its facts name'
    if found:
        rec,name,vk,o,t=found
        c['route == a field of the record: '+vk+', '+pill]+=1
        if where.startswith('another'): c['field found only in '+where]+=1; out.append(('field-in-another-entry',r['k'],','.join(ns),route,name,''))
        if printed==t: c['printed exact (tags out, nothing in their place)']+=1
        else:
            kind='made space kept' if printed==o else 'printed differs'
            c[kind]+=1; out.append((kind,r['k'],name,route,printed,t))
    else:
        # a run of the record's text?
        hit=None
        for b in cand:
            rec=R.get(b)
            if rec and route in rec['ours']: hit=(rec,'run of the record text (tags as spaces)'); break
            if rec and printed in rec['theirs']: hit=(rec,'printed is a run of the record text (tags out)'); break
        if not hit:
            for rec in allrecs:
                if route in rec['ours']: hit=(rec,'run of ANOTHER record text'); break
        if hit:
            c['route is no field; '+hit[1]+', '+pill]+=1; out.append(('no-field-'+hit[1]+' / '+pill,r['k'],hit[0]['id'],route,printed,''))
        else:
            c['source entry not found, '+pill]+=1; out.append(('not-found / '+pill,r['k'],','.join(ns)+' '+str(f.get('opens')),route,printed,''))
    for rd in r['readings']:
        c['readings']+=1
        if rd not in printed: c['reading no run of printed']+=1; out.append(('reading-not-a-run',r['k'],'',route,rd,printed))
print(json.dumps(c,indent=1,ensure_ascii=False))
with gzip.open('rows-differ-unabridged_bdb_1906.tsv.gz','wt',encoding='utf-8') as g:
    g.write('kind\tkey\tentry_or_field\troute_as_served\tprinted_or_reading\tsource_own_text\n')
    for o in out: g.write('\t'.join(str(x).replace('\t',' ').replace('\n',' ') for x in o)+'\n')
json.dump({k:{'sn':v['sn'],'fields':v['fields']} for k,v in R.items()},open('m46-fields.json','w'),ensure_ascii=False)
