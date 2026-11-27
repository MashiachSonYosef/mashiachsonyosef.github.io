# The verse references each BDB source sets beside a reading: for the Open Scriptures file, the <ref r> that follows a
# <def> before the next definition; for the unabridged file, the references of the numbered point a highlight stands in.
import json,re,collections,html,sys
SBL={'Gen':'genesis','Exod':'exodus','Lev':'leviticus','Num':'numbers','Deut':'deuteronomy','Josh':'joshua','Judg':'judges','Ruth':'ruth','1Sam':'i-samuel','2Sam':'ii-samuel','1Kgs':'i-kings','2Kgs':'ii-kings','1Chr':'i-chronicles','2Chr':'ii-chronicles','Ezra':'ezra','Neh':'nehemiah','Esth':'esther','Job':'job','Ps':'psalms','Prov':'proverbs','Eccl':'ecclesiastes','Song':'song-of-songs','Isa':'isaiah','Jer':'jeremiah','Lam':'lamentations','Ezek':'ezekiel','Dan':'daniel','Hos':'hosea','Joel':'joel','Amos':'amos','Obad':'obadiah','Jonah':'jonah','Mic':'micah','Nah':'nahum','Hab':'habakkuk','Zeph':'zephaniah','Hag':'haggai','Zech':'zechariah','Mal':'malachi'}
TAG=re.compile(r'<[^>]+>')
def ws(s): return re.sub(r'\s+',' ',s).strip()
# ---- M5
e5=json.load(open('m5-entries.json'))
m5={}   # (entry id, def text) -> list of next refs
for eid,e in e5.items():
    body=e['body']
    for d in e['defs']:
        at=d['at']; end=body.find('</def>',at)+6; after=body[end:]
        nxt=re.search(r'<def>|<sense|</sense>',after); seg=after[:nxt.start()] if nxt else after
        refs=[]
        for m in re.finditer(r'<ref r="([^"]+)"',seg):
            p=m.group(1).split('.')
            if len(p)>=3 and p[0] in SBL: refs.append(SBL[p[0]]+' '+p[1]+':'+p[2].split('-')[0])
        text=ws(html.unescape(TAG.sub('',d['raw'])))
        m5.setdefault(eid+'\t'+text,[]).append(refs)
out5={}
for line in open('rows-M5.jsonl'):
    r=json.loads(line)
    for b in (r['facts'] or {}).get('b') or []:
        k=b+'\t'+r['routePrinted']
        if k in m5:
            lists=m5[k]
            if all(l for l in lists):   # every def of that text in the entry is followed by a reference
                out5[r['k']+'\t'+str(r['rank'])]=sorted(set(x for l in lists for x in l))
            break
json.dump(out5,open('m5-row-refs.json','w'),ensure_ascii=False)
print('M5 rows whose every def of that text is followed by a verse reference:',len(out5))
# ---- M46
lines=open('dl-ubdb-x/unabridged-BDB-Hebrew-lexicon.csv',encoding='utf-8').read().split('\n')
recs=[l.split('\t') for l in lines[1:] if l]
def edge(s): return re.sub(r'[\s,;:\-—–]+$','',re.sub(r'^[\s,;:\-—–]+','',s))
def ours(raw): return edge(ws(html.unescape(TAG.sub(' ',raw))))
byH=collections.defaultdict(list); R={}
for bid,sn,content in recs:
    i=content.find('</div>'); main=content[i+6:] if i>=0 else content
    fields={}
    for m in re.finditer(r'<div class="point">(.*?)(?=<div class="point">|</div>|$)',main,flags=re.S):
        body=m.group(1)
        if not re.match(r'\s*<b>\s*([0-9]+\.|[a-z]\.)\s*</b>',body): continue
        refs=[]
        for rm in re.finditer(r'<ref ref="([^"]+)"',body):
            mm=re.match(r'^(\S+) (\d+):(\d+)',rm.group(1))
            if mm and mm.group(1) in SBL: refs.append(SBL[mm.group(1)]+' '+mm.group(2)+':'+mm.group(3))
        j=body.find('<ref'); head=body[:j] if j>=0 else body
        for h in re.finditer(r'<highlight>(.*?)</highlight>',head,flags=re.S):
            t=ours(h.group(1))
            # is the highlight directly followed by the point's first reference (only blanks and marks between)?
            gap=ws(TAG.sub(' ',head[h.end():]))
            fields.setdefault(t,[]).append({'refs':refs,'first':refs[0] if refs else None,'gap':gap[:60],'last_before_ref': gap==''})
    R[bid]=fields
    for h in sn.split('_'):
        if h: byH[h].append(bid)
out46={}
for line in open('rows-M46.jsonl'):
    r=json.loads(line)
    if not r['readings']: continue
    ns=(r['facts'] or {}).get('n') or []
    for n in ns:
        hit=None
        for b in byH.get(n,[]):
            if r['route'] in R[b]: hit=(b,R[b][r['route']]); break
        if hit:
            b,fl=hit
            out46[r['k']+'\t'+str(r['rank'])]={'bdb':b,'refs':sorted(set(x for f in fl for x in f['refs'])),'first':[f['first'] for f in fl],'last_before_ref':all(f['last_before_ref'] for f in fl)}
            break
json.dump(out46,open('m46-row-refs.json','w'),ensure_ascii=False)
print('M46 pill rows that are a highlight of a numbered point:',len(out46),'of them directly before the point\'s first reference:',sum(1 for v in out46.values() if v['last_before_ref']))
