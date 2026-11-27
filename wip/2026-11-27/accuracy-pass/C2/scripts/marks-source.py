# Every mark in the source's own raw readings (the fields a row can come from), per source.
import json,re,collections,html,unicodedata
TAG=re.compile(r'<[^>]+>')
def marks(text,c,rows):
    seen=set()
    for ch in text:
        if ch.isalnum() or ch.isspace(): continue
        if unicodedata.category(ch).startswith(('L','N')): continue
        c[ch]+=1; seen.add(ch)
    for ch in seen: rows[ch]+=1
def words(text,c):
    for pat,name in ((r'\bi\.e\.','i.e.'),(r'\be\.g\.','e.g.'),(r'\betc\.','etc.'),(r'\bSee\b','See'),(r'\bsee\b','see'),(r'\bCompare\b','Compare'),(r'\bcompare\b','compare'),(r'\bComp\.','Comp.'),(r'\bcf\.','cf.'),(r'\bq\. ?v\.','q.v.'),(r'\bid\.','id.'),(r'\bib\.','ib.'),(r'\bv\. ','v. (vide)'),(r'\bsq\.','sq.'),(r'\bfr\.','fr.'),(r'(?<![A-Za-z])X(?![A-Za-z])','X standing alone'),(r'\b\d+\.(?=\s)','a number and a stop'),(r'\([a-z]\)|\b[a-z]\.\s','a sense letter'),(r'--','--'),(r':--',':--'),(r'\.\.\.|\. \. \.','dots'),(r'\(-|-\)','bracketed word end or start')):
        n=len(re.findall(pat,text))
        if n: c[name]+=n
out={}
# M9
e9=json.load(open('m9-entries.json'))
c=collections.Counter(); rows=collections.Counter(); w=collections.Counter(); n=0
tags=collections.Counter()
for h,e in e9.items():
    for f in ('meaning','usage'):
        if e[f] is None: continue
        n+=1
        for t in re.findall(r'<([a-z]+)',e[f]): tags['<%s> in %s'%(t,f)]+=1
        t=html.unescape(TAG.sub('',re.sub(r'<note>.*?</note>','',e[f],flags=re.S)))
        marks(t,c,rows); words(t,w)
out['openscriptures_strongs']={'fields':n,'what':'the meaning and usage fields of all 8,674 entries of HebrewStrong.xml, tags out','marks':dict(c),'fields_with':dict(rows),'words':dict(w),'tags':dict(tags)}
# M14
e14=json.load(open('m14-entries.json'))
c=collections.Counter(); rows=collections.Counter(); w=collections.Counter(); n=0; tags=collections.Counter()
for h,es in e14.items():
    for e in es:
        n+=1
        raw=e['raw']
        tags['[[link]]']+=len(re.findall(r'\[\[',raw)); tags["'' (italic quotes)"]+=raw.replace("'''",'').count("''"); tags['{{template}}']+=len(re.findall(r'\{\{',raw)); tags['&entity;']+=len(re.findall(r'&[a-z]+;',raw))
        marks(e['theirs'],c,rows); words(e['theirs'],w)
out['wikisource_strongs_explicit_forms']={'fields':n,'what':'the definition of each of the 5,806 entries in the records on hand (links read as their text, bold quotes out)','marks':dict(c),'fields_with':dict(rows),'words':dict(w),'tags':dict(tags)}
# M5
e5=json.load(open('m5-entries.json'))
c=collections.Counter(); rows=collections.Counter(); w=collections.Counter(); n=0; tags=collections.Counter()
for h,e in e5.items():
    for d in e['defs']:
        n+=1
        for t in re.findall(r'<([a-z]+)',d['raw']): tags['<%s> inside <def>'%t]+=1
        t=html.unescape(TAG.sub('',d['raw'])); marks(t,c,rows); words(t,w)
out['openscriptures_bdb_1906']={'fields':n,'what':'all 21,343 def elements of BrownDriverBriggs.xml, tags out','marks':dict(c),'fields_with':dict(rows),'words':dict(w),'tags':dict(tags)}
# M46
f46=json.load(open('m46-fields.json'))
c=collections.Counter(); rows=collections.Counter(); w=collections.Counter(); n=0; tags=collections.Counter()
for h,e in f46.items():
    for name,raw,kind in e['fields']:
        n+=1; tags['field: '+kind]+=1
        for t in re.findall(r'<([a-zA-Z]+)',raw): tags['<%s> inside a field'%t]+=1
        t=re.sub(r'\s+',' ',html.unescape(TAG.sub('',raw))); marks(t,c,rows); words(t,w)
out['unabridged_bdb_1906']={'fields':n,'what':'every highlighted word, point highlight and point opening of the 10,022 records (the three fields a route comes from), tags out','marks':dict(c),'fields_with':dict(rows),'words':dict(w),'tags':dict(tags)}
json.dump(out,open('marks-source.json','w'),ensure_ascii=False,indent=1)
for k,v in out.items():
    print('=====',k,v['fields'],v['what'])
    print('  marks:',sorted(v['marks'].items(),key=lambda x:-x[1])[:45])
    print('  words:',sorted(v['words'].items(),key=lambda x:-x[1]))
    print('  tags:',sorted(v['tags'].items(),key=lambda x:-x[1])[:25])
