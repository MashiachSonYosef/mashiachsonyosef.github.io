# Where each <def> of the Open Scriptures BDB stands in its entry: what the source's own structure says of it.
import json,re,collections,html
ent=json.load(open('m5-entries.json'))
TAG=re.compile(r'<[^>]+>')
def own(raw): return re.sub(r'\s+',' ',html.unescape(TAG.sub('',raw))).strip()
ctx={}   # (entry id, def text) -> list of contexts
allc=collections.Counter()
for eid,e in ent.items():
    body=e['body']
    for d in e['defs']:
        at=d['at']; raw=d['raw']; end=body.find('</def>',at)+6
        before=body[:at]; after=body[end:]
        text=own(raw)
        k=[]
        # inside the entry's opening round bracket (the etymology) before any sense?
        pre=TAG.sub('',before)
        depth=pre.count('(')-pre.count(')')
        first_sense=body.find('<sense')
        in_head = first_sense<0 or at<first_sense
        if depth>0 and in_head: k.append('in the opening bracket of the entry (a related word\'s meaning)')
        elif depth>0: k.append('inside a round bracket of a sense')
        # directly after a Hebrew phrase <w>..</w> (two words or more) 
        m=re.search(r'<w[^>]*>([^<]*)</w>\s*$',before)
        if m and re.search(r'[\s־]',m.group(1).strip()): k.append('right after a Hebrew phrase of two or more words')
        elif m: k.append('right after one Hebrew word')
        # followed by a verse reference before the next def or sense
        nxt=re.search(r'<def>|<sense|</sense>',after)
        seg=after[:nxt.start()] if nxt else after
        if '<ref' in seg: k.append('a verse reference follows before the next definition')
        if d['stem']: k.append('under a stem (%s)'%d['stem'])
        if any(d['senses']): k.append('under a numbered sense')
        if re.search(r'[\w\)]$',before) and not before.endswith(' ') : k.append('written against the letters before it (part of a word)')
        if re.match(r'^[\w]',after) : k.append('written against the letters after it (part of a word)')
        ctx.setdefault((eid,text),[]).append(k)
c=collections.Counter(); ex=collections.defaultdict(list)
rows=0
TS=open('m5-row-context.tsv','w'); TS.write('key\trank\ttext\tentry\tcontexts_every\tcontexts_some\n')
for line in open('rows-M5.jsonl'):
    r=json.loads(line); rows+=1
    bs=(r['facts'] or {}).get('b') or []
    ks=None
    for b in bs:
        if (b,r['routePrinted']) in ctx: ks=ctx[(b,r['routePrinted'])]; break
    if ks is None: c['(context not found)']+=1; continue
    # a row stands for every def of that text in the entry: take the union, and "every one" flags
    for name in set(x for k in ks for x in k):
        nm=re.sub(r'\(.*?\)$','',name).strip() if name.startswith('under a stem') else name
        every = all(any((re.sub(r'\(.*?\)$','',y).strip() if y.startswith('under a stem') else y)==nm for y in k) for k in ks)
        c[nm+(' [every def of that text in the entry]' if every else ' [some]')]+=1
        if every and len(ex[nm])<300: ex[nm].append((r['k'],r['routePrinted'],bs[0]))
    def nmz(y): return re.sub(r'\(.*?\)$','',y).strip() if y.startswith('under a stem') else y
    names=set(nmz(x) for k in ks for x in k)
    ev=[n for n in names if all(any(nmz(y)==n for y in k) for k in ks)]
    TS.write('\t'.join([r['k'],str(r['rank']),r['routePrinted'],bs[0],' | '.join(sorted(ev)),' | '.join(sorted(names-set(ev)))])+'\n')
    words=len(r['routePrinted'].split())
    if words>=5: c['five words or more']+=1
print('rows',rows); 
for k,v in sorted(c.items(),key=lambda x:-x[1]): print('  %6d %s'%(v,k))
json.dump(ex,open('m5-context-examples.json','w'),ensure_ascii=False,indent=0)
import random; random.seed(3)
for k in ['in the opening bracket of the entry (a related word\'s meaning)','right after a Hebrew phrase of two or more words','written against the letters before it (part of a word)','written against the letters after it (part of a word)']:
    print('##',k); 
    for x in random.sample(ex[k],min(12,len(ex[k]))): print('    ',x)
