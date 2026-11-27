# Lay each card read on the page beside its source entry, for reading by hand.
import json,re,html,collections,gzip,sys
TAG=re.compile(r'<[^>]+>')
def ws(s): return re.sub(r'\s+',' ',s).strip()
def own(raw): return ws(html.unescape(TAG.sub('',re.sub(r'<note>.*?</note>','',raw,flags=re.S))))
e9=json.load(open('m9-entries.json')); e14=json.load(open('m14-entries.json')); e5=json.load(open('m5-entries.json'))
lines=open('dl-ubdb-x/unabridged-BDB-Hebrew-lexicon.csv',encoding='utf-8').read().split('\n')
m46={}; byH=collections.defaultdict(list)
for l in lines[1:]:
    if not l: continue
    bid,sn,content=l.split('\t'); i=content.find('</div>'); main=content[i+6:] if i>=0 else content
    m46[bid]=ws(html.unescape(TAG.sub('',main)))
    for h in sn.split('_'):
        if h: byH[h].append(bid)
# zone tags of each place
import os
def place_tag(base,book,si,e):
    z=json.loads(gzip.open(os.path.join(base,'data/zones',book+'.bin')).read())
    w=z['sections'][si]['words'][e]
    return w
base=sys.argv[1]
rest=json.load(open('cards-read-rest.json'))
signs={}
try:
    for x in json.load(open('cards-read-signs.json')):
        if 'm' in x: signs[(x['m'],x['book'],x['si'],x['e'],x['reading'])]=x
except Exception as ex: print('no signs file',ex)
zc={}
out=[]
for x in rest:
    if 'm' not in x: continue
    m=x['m']; ent=x.get('entry') or {}
    src=''
    if m=='M9':
        for n in ent.get('n',[])[:2]:
            e=e9.get(n)
            if e: src+=f"{n} {e['w']} [{e['attrs'].get('pos','')}] source: {own(e['source'] or '')} | meaning: {own(e['meaning'] or '')} | usage: {own(e['usage'] or '')}  "
    elif m=='M14':
        for n in ent.get('n',[])[:2]:
            for e in e14.get(n,[]): src+=f"{n} {e['head']}: {e['theirs']}  "
    elif m=='M5':
        for b in ent.get('b',[])[:2]:
            e=e5.get(b)
            if e:
                t=own(e['body']); i=t.find(x['route']); 
                isroot = '(root) ' if 'type="root"' in e['attrs'] else ''
                seg = t[max(0,i-170):i+len(x['route'])+110] if i>=0 else t[:300]
                src+=f"{b} {isroot}…{seg}…  "
    elif m=='M46':
        for n in ent.get('n',[])[:3]:
            for b in byH.get(n,[]):
                t=m46[b]; i=t.find(x['route'])
                if i>=0: src+=f"{b} [{n}] …{t[max(0,i-170):i+len(x['route'])+110]}…  "; break
        if not src and ent.get('opens'): src=ent['opens']
    if x['book'] not in zc: zc[x['book']]=json.loads(gzip.open(os.path.join(base,'data/zones',x['book']+'.bin')).read())
    w=zc[x['book']]['sections'][x['si']]['words'][x['e']]
    s=signs.get((m,x['book'],x['si'],x['e'],x['reading']))
    out.append({'source':x['source'],'m':m,'class':x['class'],'place':f"{x['book']} {x['label']}:{x['n']}",'hebrew':x.get('heb') or w.get('s'),'step_tag':w.get('tg'),'pieces':'+'.join(p.get('k','') for p in (w.get('pg') or [])),'line':x.get('line'),'key':x['k'],'how':x['how'],'reading':x['reading'],'route':x['route'],'row_entry':ent,
      'offered_at_rest':x.get('found_at',-1)>=0,'pill_at_rest':x.get('pill_text'),'pill_title':x.get('pill_title'),'by':(x.get('by') or [None]*(x.get('found_at',-1)+1))[x['found_at']] if x.get('found_at',-1)>=0 else None,
      'record':x.get('dtext'),'credit':x.get('att'),'cutnote':x.get('cutnote'),'notes':x.get('notes'),'signs_note':x.get('signs_note'),'held':x.get('held'),'pills_n':x.get('pills_n'),'mine_at_rest':x.get('mine'),
      'offered_with_signs_printed':(s.get('found_at',-1)>=0) if s else None,'pill_with_signs_printed':s.get('pill_text') if s else None,'credit_signs':s.get('att') if s else None,
      'source_entry':src[:900],'fault':x.get('fault')})
json.dump(out,open('cards-review.json','w'),ensure_ascii=False,indent=0)
c=collections.Counter((o['m'],o['offered_at_rest'],o['offered_with_signs_printed']) for o in out); print(sorted(c.items(),key=str))
