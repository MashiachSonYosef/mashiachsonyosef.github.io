# Every served M9 row against HebrewStrong.xml (Open Scriptures, commit 21c9add).
# Run: python3 -I scripts/m9-verify.py
import re,json,collections,gzip,sys,html
W='.'
t=open(W+'/dl-os/HebrewStrong.xml',encoding='utf-8').read()
entries={}
TAG=re.compile(r'<[^>]+>')
def ws(s): return re.sub(r'\s+',' ',s).strip()
def store_text(raw):   # the catalog's step: a tag becomes one space, whitespace collapsed
    return ws(html.unescape(TAG.sub(' ',raw)))
def own_text(raw):     # the source's own text: the note element out, tags out with nothing in their place
    r=re.sub(r'<note>.*?</note>','',raw,flags=re.S)
    return ws(html.unescape(TAG.sub('',r)))
for hid,body in re.findall(r'<entry id="(H\d+)">(.*?)</entry>',t,flags=re.S):
    e={'id':hid}
    m=re.search(r'<w ([^>]*)>(.*?)</w>',body,flags=re.S)
    e['w']=m.group(2); e['attrs']=dict(re.findall(r'([a-z:]+)="([^"]*)"',m.group(1)))
    for f in ('source','meaning','usage'):
        mm=re.search(r'<%s>(.*?)</%s>'%(f,f),body,flags=re.S)
        e[f]=mm.group(1) if mm else None
    e['defs']=re.findall(r'<def>(.*?)</def>',e['meaning'] or '',flags=re.S)
    entries[hid]=e
print('entries',len(entries),file=sys.stderr)
c=collections.Counter(); out=[]
kinds=collections.Counter()
for line in open(W+'/rows-M9.jsonl'):
    r=json.loads(line)
    c['rows']+=1
    ns=(r['facts'] or {}).get('n') or []
    route=r['route']; printed=r['routePrinted']
    found=None
    cands=[entries[n] for n in ns if n in entries]
    if not cands: c['fact n names no entry of the file']+=1
    # 1. which field of which entry
    for e in cands:
        for f in ('meaning','usage'):
            if e[f] is None: continue
            if store_text(e[f])==route: found=(e['id'],f,e[f]); break
        if found: break
        for d in e['defs']:
            if store_text(d)==route: found=(e['id'],'def',d); break
        if found: break
    if not found:
        # anywhere in the file?
        for e in entries.values():
            for f in ('meaning','usage'):
                if e[f] is not None and store_text(e[f])==route: found=(e['id'],f+' (another entry)',e[f]); break
            if found: break
            for d in e['defs']:
                if store_text(d)==route: found=(e['id'],'def (another entry)',d); break
            if found: break
    if not found:
        c['source entry not found']+=1
        out.append(('not-found',r['k'],','.join(ns),route,'',''))
        continue
    hid,f,raw=found
    kinds[f]+=1
    own=own_text(raw)
    if printed==own: c['printed text exact']+=1
    else:
        # classify the difference
        if printed==store_text(raw): kind='made space kept (the tag\'s space still prints)'
        elif ws(printed)==ws(own): kind='whitespace only'
        elif printed.replace(' ','')==own.replace(' ','') : kind='spaces differ'
        else: kind='text differs'
        c['printed text differs: '+kind]+=1
        out.append((kind,r['k'],hid+' '+f,route,printed,own))
    # definition slot
    if r['def']:
        e=entries[hid.split()[0]]
        okd=False
        for ff in ('meaning','usage'):
            if e[ff] is not None and store_text(e[ff])==r['def']:
                okd=True
                if r['recordPrinted']!=own_text(e[ff]):
                    c['definition as printed differs from the source']+=1
                    out.append(('definition-printed-differs',r['k'],hid+' '+ff,r['def'],r['recordPrinted'],own_text(e[ff])))
                else: c['definition printed exact']+=1
                break
        if not okd:
            c['definition slot is no whole field of the entry']+=1
            out.append(('definition-not-a-field',r['k'],hid,r['def'],'',''))
    # readings: each must be a run of the printed text
    for rd in r['readings']:
        c['readings']+=1
        if rd not in printed: c['reading is no run of the printed text']+=1; out.append(('reading-not-a-run',r['k'],hid+' '+f,route,rd,printed))
print(json.dumps(c,indent=1,ensure_ascii=False)); print(kinds)
with gzip.open(W+'/rows-differ-openscriptures_strongs.tsv.gz','wt',encoding='utf-8') as g:
    g.write('kind\tkey\tentry_field\troute_as_served\tprinted_or_reading\tsource_own_text\n')
    for o in out: g.write('\t'.join(x.replace('\t',' ').replace('\n',' ') for x in o)+'\n')
json.dump({k:v for k,v in entries.items()},open(W+'/m9-entries.json','w'),ensure_ascii=False)
