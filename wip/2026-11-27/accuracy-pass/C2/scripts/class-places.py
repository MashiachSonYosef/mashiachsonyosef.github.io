# For each class of reading: how many rows, how many readings, and at how many (word, pill) places of the 39 books a
# reading of the class stands on the card as it opens (row-place-counts.tsv, from the second walk).
import json,re,collections,html
cnt={}
for i,l in enumerate(open('row-place-counts.tsv')):
    if i==0: continue
    p=l.rstrip('\n').split('\t')
    cnt[(p[0],p[1],int(p[2]),p[11])]=(int(p[3]),int(p[4]),int(p[5]),int(p[6]),int(p[7]),int(p[8]),int(p[9]),p[10])
def stands(m,r):
    c=cnt.get((m,r['k'],r['rank'],r['route']))
    return (c[0]+c[1]+c[2]) if c else 0
def first(m,r):
    c=cnt.get((m,r['k'],r['rank'],r['route'])); return c[7] if c else ''
def bal(t):
    st=[]
    for ch in t:
        if ch in '([': st.append(ch)
        elif ch in ')]':
            if st and ((st[-1]=='(' and ch==')') or (st[-1]=='[' and ch==']')): st.pop()
            else: return False
    return not st
SIGNED=lambda rd: bool(re.match(r'^(X|×|\+) ',rd) or re.match(r'^\(\s*(X|×|\+)\s*\)',rd))
# Strong's + in the Wikisource edition, per entry
m14=json.load(open('m14-entries.json'))
plus14=collections.defaultdict(set)
def rend(text):
    out=[];depth=0;cur=''
    for ch in text:
        if ch=='(':depth+=1
        elif ch==')':depth=max(0,depth-1)
        if ch in ',;' and depth==0: out.append(cur);cur=''
        else: cur+=ch
    out.append(cur); return [x.strip() for x in out]
def norm(s): return re.sub(r'[\s.]+','',s).lower()
for n,es in m14.items():
    d=es[0]['theirs']; k=max(d.rfind(': '),d.rfind(':--')); lst=d[k+1:] if k>=0 else d
    for x in rend(lst):
        if x.startswith('+ '): plus14[n].add(norm(x[2:]))
m5ctx={}
for i,l in enumerate(open('m5-row-context.tsv')):
    if i==0: continue
    p=l.rstrip('\n').split('\t'); m5ctx[(p[0],int(p[1]),p[2])]=p[4]
m14pos={}
for i,l in enumerate(open('m14-route-position.tsv')):
    if i==0: continue
    p=l.rstrip('\n').split('\t'); m14pos[(p[0],int(p[1]),p[4])]=p[3]
GRAM=set('perfect imperfect infinitive imperative participle adverb adverbial verbal literal figurative figuratively absolute construct plural singular masculine feminine suffix noun verb adjective preposition conjunction interjection passive active dual collective substantive intransitive transitive'.split())
FOREIGN=re.compile(r'^(excidit|mutavit rejecitque|celeriter extraxit|es gibt|à part|ad|et|umri|sphaerula|coccus ilicis|sive \.\.\. sive, whether \.\.\. or|à fortiori, the more so|id\.|a\.)$')
C={
'M9':[
 ("opens with Strong's sign (× or +): not offered while the signs switch rests off", lambda r,rd: SIGNED(rd)),
 ('holds a square-bracket group: not offered while the signs switch rests off', lambda r,rd: bool(re.search(r'\[[^\]]*\]',rd))),
 ("a rendering Strong marks + in the Wikisource edition, printed plain (the file lost the sign)", lambda r,rd: r['route'].endswith('.') and any(norm(rd) in plus14.get(n,()) for n in (r['facts'] or {}).get('n',[])) and not SIGNED(rd)),
 ('a bracket that opens on a blank (the place of a lost sign)', lambda r,rd: bool(re.search(r'\(\s+\)|\(\s+\S',rd))),
 ('the last rendering keeps a pointer (See / Compare and a number)', lambda r,rd: bool(re.search(r'(Compare|See also|See) \d',rd))),
 ('a piece cut at a semicolon that opens with also / hence / or / by implication and the like', lambda r,rd: bool(r['cuts']) and bool(re.match(r'(also|hence|or|and|but|by implication|by extension|by analogy|specifically|figuratively|generally|especially|abstractly|concretely|causatively|intransitively|transitively|collectively|reflexively|subjectively|objectively|usually|then|thus)\b',rd))),
 ('condensed form (a bracketed word end or word start)', lambda r,rd: bool(re.search(r'\(-|-\)',rd))),
 ('holds a round-bracket group', lambda r,rd: '(' in rd),
 ('ends with ; or ,', lambda r,rd: rd.endswith(';') or rd.endswith(',')),
 ('brackets do not balance', lambda r,rd: not bal(rd)),
 ('a tagged gloss whose tag took in a closing bracket', lambda r,rd: r['cut']==1 and not bal(rd)),
 ('every reading', lambda r,rd: True),
],
'M14':[
 ("opens with Strong's sign (X or +): not offered while the signs switch rests off", lambda r,rd: SIGNED(rd)),
 ("a piece of Strong's own sentence (before or across the list opener, or in a definition with none)", lambda r,rd: (r['k'],r['rank'],r['route']) in m14pos),
 ("the edition's dash for the list sign printed on the rendering (opens with - or --)", lambda r,rd: rd.startswith('-') or bool(re.search(r'(; ?|\. ?| )--?[A-Za-z(X+]',rd))),
 ('opens with &', lambda r,rd: rd.startswith('&')),
 ('condensed form (a bracketed word end or word start)', lambda r,rd: bool(re.search(r'\(-|-\)',rd))),
 ('holds a round-bracket group', lambda r,rd: '(' in rd),
 ('a bracket alone is the whole reading', lambda r,rd: bool(re.fullmatch(r'\(+[^()]*\)+',rd))),
 ('brackets do not balance', lambda r,rd: not bal(rd)),
 ('every reading', lambda r,rd: True),
],
'M5':[
 ("stands in the entry's opening bracket (a related word's meaning)", lambda r,rd: 'opening bracket' in m5ctx.get((r['k'],r['rank'],r['route']),'')),
 ('the wording of a verse or phrase (five words or more)', lambda r,rd: len(rd.split())>=5),
 ('a verse reference follows every def of that text in the entry', lambda r,rd: 'verse reference follows' in m5ctx.get((r['k'],r['rank'],r['route']),'')),
 ('one letter', lambda r,rd: len(rd)==1),
 ('half a word (opens or ends with a hyphen)', lambda r,rd: len(rd)>1 and (rd.startswith('-') or rd.endswith('-'))),
 ('written against letters of the entry (part of a word)', lambda r,rd: 'written against' in m5ctx.get((r['k'],r['rank'],r['route']),'')),
 ('a row with no entry number (a root)', lambda r,rd: not (r['facts'] or {}).get('n')),
 ('every reading', lambda r,rd: True),
],
'M46':[
 ('the whole reading is a grammar word', lambda r,rd: rd.strip(' .:').lower() in GRAM),
 ('ends with a grammar word after a colon', lambda r,rd: bool(re.search(r': ?(Perfect|Imperfect|Infinitive|Imperative|Participle)\b',rd))),
 ('not English', lambda r,rd: bool(FOREIGN.match(rd))),
 ('the wording of a verse or phrase (five words or more)', lambda r,rd: len(rd.split())>=5),
 ('holds a square-bracket group: not offered while the signs switch rests off', lambda r,rd: bool(re.search(r'\[[^\]]*\]',rd))),
 ('a row with no entry number', lambda r,rd: not (r['facts'] or {}).get('n')),
 ('every reading', lambda r,rd: True),
],
}
out={}
for m,classes in C.items():
    agg={name:[0,0,0,0,[]] for name,_ in classes}   # rows, readings, pill places, rows standing somewhere, examples
    for line in open(f'rows-{m}.jsonl'):
        r=json.loads(line)
        if not r['readings']: continue
        s=stands(m,r)
        hitrow=set()
        for rd in r['readings']:
            for name,pred in classes:
                try: ok=pred(r,rd)
                except Exception: ok=False
                if ok:
                    a=agg[name]; a[1]+=1; a[2]+=s
                    if name not in hitrow:
                        hitrow.add(name); a[0]+=1
                        if s: a[3]+=1
                    if s and len(a[4])<6: a[4].append((r['k'],rd[:90],first(m,r),s))
    out[m]={k:{'rows':v[0],'readings':v[1],'pill_places':v[2],'rows_standing_somewhere':v[3],'examples':v[4]} for k,v in agg.items()}
    print('=====',m)
    for k,v in agg.items(): print('  rows %6d | readings %6d | pills at places %8d | rows standing somewhere %6d | %s'%(v[0],v[1],v[2],v[3],k)); 
    for k,v in agg.items():
        if k!='every reading': print('     ex',k[:40],v[4][:3])
json.dump(out,open('class-places.json','w'),ensure_ascii=False,indent=1)
