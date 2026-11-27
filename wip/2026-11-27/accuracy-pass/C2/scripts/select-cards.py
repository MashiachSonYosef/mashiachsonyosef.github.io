# Choose the cards to read on the page: per source, rows stratified by mark class, each at a place where every gate
# leaves it standing (standing-rows.jsonl, from the walk).
import json,re,collections,random,sys
random.seed(39)
SRC={'M9':'openscriptures_strongs','M14':'wikisource_strongs_explicit_forms','M5':'openscriptures_bdb_1906','M46':'unabridged_bdb_1906'}
places={}
for line in open('standing-rows.jsonl'):
    x=json.loads(line); places[(x['m'],x['k'],x['rank'],x['text'])]=x['places']
m5ctx={}
for i,l in enumerate(open('m5-row-context.tsv')):
    if i==0: continue
    p=l.rstrip('\n').split('\t'); m5ctx[(p[0],int(p[1]),p[2])]=p[4]
m14pos={}
for i,l in enumerate(open('m14-route-position.tsv')):
    if i==0: continue
    p=l.rstrip('\n').split('\t'); m14pos[(p[0],int(p[1]),p[4])]=p[3]
def bal(t):
    st=[]
    for ch in t:
        if ch in '([': st.append(ch)
        elif ch in ')]':
            if st and ((st[-1]=='(' and ch==')') or (st[-1]=='[' and ch==']')): st.pop()
            else: return False
    return not st
SIGNED=lambda rd: bool(re.match(r'^(X|\u00d7|\+) ',rd) or re.match(r'^\(\s*(X|\u00d7|\+)\s*\)',rd))
CL={
'M9':[
 ('condensed form: a bracketed word end or word start', lambda r,rd: re.search(r'\(-|-\)',rd) and not SIGNED(rd), 6),
 ('bracketed optional words', lambda r,rd: re.search(r'\([a-z ,]+\)',rd) and r['route'].endswith('.') and len(rd)<40 and not SIGNED(rd), 4),
 ("opens with × (Strong's multiplication sign)", lambda r,rd: rd.startswith('\u00d7 '), 5),
 ("opens with + (Strong's addition sign)", lambda r,rd: rd.startswith('+ '), 3),
 ('residue of a lost sign: a bracket that opens on a blank', lambda r,rd: re.search(r'\(\s+\)|\(\s+\S',rd), 4),
 ('holds a square bracket', lambda r,rd: '[' in rd, 3),
 ('a piece cut at a semicolon that opens with also/hence/by implication', lambda r,rd: r['cuts'] and re.match(r'(also|hence|by implication|specifically|figuratively|generally|or)\b',rd), 5),
 ('a whole meaning field with i.e.', lambda r,rd: 'i.e.' in rd and not r['cuts'] and not r['cut'] and len(rd)>40, 4),
 ('the last rendering keeps a pointer (See/Compare and a number)', lambda r,rd: re.search(r'(Compare|See also|See) \d',rd), 5),
 ('brackets do not balance', lambda r,rd: not bal(rd), 3),
 ('a name with its description', lambda r,rd: (r['facts'] or {}).get('name') and ', ' in rd and not r['route'].endswith('.'), 3),
 ('the longest rows', lambda r,rd: len(rd)>220, 3),
 ('ends with ; or ,', lambda r,rd: rd.endswith(';') or rd.endswith(','), 2),
 ('holds a verse citation', lambda r,rd: re.search(r'\d:\d',rd), 2),
 ("carries the provider's note", lambda r,rd: r['note'], 1),
 ('a question or exclamation mark', lambda r,rd: rd.endswith('!') or rd.endswith('?'), 2),
 ('a quotation', lambda r,rd: "'" in rd and re.search(r"'[A-Za-z ]+'",rd), 1),
 ('a cut wider than its tag (not found as a field)', lambda r,rd: rd.startswith('the body (probably') or rd.startswith('something piled up (as if (figuratively) raised by mental aspiration)') and 'paterre' not in rd, 2),
 ('one or two letters', lambda r,rd: len(rd.rstrip('.'))<=2, 2),
  ('plain rendering cut at a comma of the King James list', lambda r,rd: r['cuts'] and r['route'].endswith('.') and re.fullmatch(r"[a-z' -]+\.?",rd), 6),
  ('a tagged gloss cut from a meaning', lambda r,rd: r['cut']==1 and len(rd)<25, 5),
],
'M14':[
 ("opens with X (the edition's multiplication sign)", lambda r,rd: rd.startswith('X '), 6),
 ("opens with + (Strong's addition sign)", lambda r,rd: rd.startswith('+ '), 6),
 ('the sign alone in a bracket', lambda r,rd: re.match(r'^\(\s*(X|\+)\s*\)',rd), 3),
 ('bracketed choices', lambda r,rd: re.search(r'\([a-z]+, [a-z ,]+\)',rd) and not SIGNED(rd), 5),
 ('a bracketed word end or word start', lambda r,rd: re.search(r'\(-|-\)',rd) and not SIGNED(rd), 5),
 ("a piece of Strong's own sentence (before the list opener)", lambda r,rd: m14pos.get((r['k'],r['rank'],r['route']),'').startswith('before') or (m14pos.get((r['k'],r['rank'],r['route']),'').startswith('the definition') and re.search(r';|from|\(Chald\)|\(dual\)',rd)), 6),
 ('across the list opener', lambda r,rd: m14pos.get((r['k'],r['rank'],r['route']),'').startswith('across'), 4),
 ('cut at a semicolon between two renderings', lambda r,rd: r['cuts'] and ';' in r['route'], 3),
 ('cut at a full stop between two renderings', lambda r,rd: r['cuts'] and '.' in r['route'] and ';' not in r['route'], 2),
 ('brackets do not balance', lambda r,rd: not bal(rd), 4),
 ('holds Hebrew letters', lambda r,rd: re.search(r'[\u05d0-\u05ea]',rd), 3),
 ('holds a verse citation', lambda r,rd: re.search(r'\d:\d',rd), 2),
 ('holds &', lambda r,rd: '&' in rd, 2),
 ('a note after the rendering', lambda r,rd: re.search(r'\. \(',rd), 2),
 ('the longest rows', lambda r,rd: len(rd)>150, 2),
 ('one or two letters', lambda r,rd: len(rd)<=2, 3),
 ('a row landed from the fold strike (entry not in the records on hand)', lambda r,rd: r['def'] and r['route'] in ('mattock','ant','thunder','prayer','lion','onion','camel','serpent','frog','leopard','Aaron','year','talent','fort','woe','lamb','darkness'), 2),
 ('dots', lambda r,rd: '..' in rd, 2),
 ('a quotation', lambda r,rd: '"' in rd, 1),
  ('plain King James rendering', lambda r,rd: re.fullmatch(r"[a-z' -]+",rd) and len(rd)>3, 6),
],
'M5':[
 ('a list held whole (be firm, strong)', lambda r,rd: ',' in rd and not r['cuts'] and not r['prints'] and re.match(r'(be|make|become) ',rd), 4),
 ('prints by the keeping-signs branch', lambda r,rd: r['prints'] is not None, 4),
 ('a hyphen compound', lambda r,rd: re.search(r'[a-z]-[a-z]',rd), 3),
 ('half a word or one letter', lambda r,rd: len(rd)==1 or rd.startswith('-') or rd.endswith('-'), 6),
 ("stands in the entry's opening bracket (a related word's meaning)", lambda r,rd: 'opening bracket' in m5ctx.get((r['k'],r['rank'],r['route']),''), 7),
 ('the wording of a verse (five words or more)', lambda r,rd: len(rd.split())>=5, 6),
 ('written against letters of the entry', lambda r,rd: 'written against' in m5ctx.get((r['k'],r['rank'],r['route']),''), 4),
 ('holds round brackets', lambda r,rd: '(' in rd, 3),
 ('the meaning of a name', lambda r,rd: (r['facts'] or {}).get('name') and ' ' in rd, 3),
 ('a transliterated name', lambda r,rd: re.search(r'[\u2018\u2019\u201b\u0100-\u017f\u1e00-\u1eff]',rd), 3),
 ('ends with ! or ?', lambda r,rd: rd.endswith('!') or rd.endswith('?'), 3),
 ('holds an ellipsis', lambda r,rd: '\u2026' in rd or '...' in rd, 1),
 ('the longest rows', lambda r,rd: len(rd)>55, 2),
 ('holds a shortened word', lambda r,rd: re.search(r'\b[A-Za-z]{1,4}\.$',rd), 2),
  ('plain definition', lambda r,rd: re.fullmatch(r"[a-z ]+",rd) and not r['cuts'] and len(rd)>3 and 'opening bracket' not in m5ctx.get((r['k'],r['rank'],r['route']),''), 8),
  ('cut at a comma (branch B01)', lambda r,rd: bool(r['cuts']), 6),
  ('under a stem', lambda r,rd: 'under a stem' in m5ctx.get((r['k'],r['rank'],r['route']),'') and re.fullmatch(r"[a-z ]+",rd), 5),
],
'M46':[
 ('cut at a semicolon or colon', lambda r,rd: r['cuts'] and (';' in r['route'] or ':' in r['route']), 4),
 ('prints by the keeping-signs branch', lambda r,rd: r['prints'] is not None, 4),
 ('the wording of a verse (five words or more)', lambda r,rd: len(rd.split())>=5, 6),
 ('a grammar word', lambda r,rd: rd.strip(' .:').lower() in ('figuratively','suffix','plural','singular','construct','masculine','feminine','noun','preposition','conjunction','qal','niphal','piel','hiphil','hithpael','dual','verb','substantive','verbal','intransitive','figurative','adverb','literal','perfect','imperfect','infinitive','participle','active','passive','collective','absolute'), 4),
 ('not English (Latin, German, French)', lambda r,rd: rd in ('excidit','mutavit rejecitque','celeriter extraxit','es gibt','\u00e0 part','ad','et','umri','sphaerula','coccus ilicis','sive ... sive, whether ... or') or rd.startswith('\u00e0 '), 5),
 ('a made space closes', lambda r,rd: r['closes'] and r['closes'][0], 3),
 ('holds brackets', lambda r,rd: '(' in rd or '[' in rd, 4),
 ('holds a digit', lambda r,rd: re.search(r'\d',rd), 3),
 ('a name row', lambda r,rd: (r['facts'] or {}).get('name'), 4),
 ('the longest rows', lambda r,rd: len(rd)>70, 2),
 ('odd rows', lambda r,rd: rd in ('apaulet','Ionia ns), Greece','one of tribe ofJudah','\u2021obol','Semitic Studies in Memory of Dr. Kohut','declar.','id.','a.','then ?','n. of relation','quails ?)') , 8),
 ('ends on a small word', lambda r,rd: re.search(r'\b(of|to|with|in|for|the)$',rd), 3),
 ('holds = or &', lambda r,rd: '=' in rd or '&' in rd, 2),
 ('ends with ! or ?', lambda r,rd: rd.endswith('!') or rd.endswith('?'), 2),
  ('main gloss, plain', lambda r,rd: re.fullmatch(r"[a-z ]+",rd) and not r['cuts'] and len(rd)>3, 7),
  ('cut at a comma', lambda r,rd: r['cuts'] and ';' not in r['route'] and ':' not in r['route'], 8),
],
}
out=[]
for m,key in SRC.items():
    pools=collections.defaultdict(list)
    for line in open(f'rows-{m}.jsonl'):
        r=json.loads(line)
        pl=places.get((m,r['k'],r['rank'],r['route']))
        if not pl: continue
        for rd in r['readings']:
            for name,pred,n in CL[m]:
                try: ok=pred(r,rd)
                except Exception: ok=False
                if ok: pools[name].append((r,rd,pl)); break
    bookuse=collections.Counter(); chosen=0
    for name,pred,n in CL[m]:
        cand=pools.get(name,[])
        random.shuffle(cand)
        # prefer a place under the word's own key; spread over books
        picked=0; seen=set()
        cand.sort(key=lambda x: (0 if any(p['how']=='word' for p in x[2]) else 1))
        for r,rd,pl in cand:
            if picked>=n+ (2 if len(cand)>n else 0): break
            if (r['k'],rd) in seen: continue
            ps=sorted(pl,key=lambda p:(0 if p['how']=='word' else 1, bookuse[p['book']]))
            p=ps[0]; bookuse[p['book']]+=1; seen.add((r['k'],rd)); picked+=1; chosen+=1
            out.append({'source':key,'m':m,'class':name,'k':r['k'],'rank':r['rank'],'route':r['route'],'reading':rd,'entry':(r['facts'] or {}),'book':p['book'],'label':p['label'],'si':p['si'],'e':p['e'],'n':p['n'],'how':p['how'],'signs':'printed' if SIGNED(rd) or '[' in rd else 'off'})
        print(m,name,'pool',len(cand),'picked',picked)
    print(m,'chosen',chosen,'books',len(bookuse),dict(bookuse))
json.dump(out,open('cards-to-read.json','w'),ensure_ascii=False,indent=0)
print(len(out))
