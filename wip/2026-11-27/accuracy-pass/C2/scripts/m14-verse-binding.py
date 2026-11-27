# The Wikisource Strong's own binding: each entry lists its forms and the verses they stand in. Do we use it?
import json,re,collections,sys
ent=json.load(open('m14-entries.json'))
HB={'בראשית':'genesis','שמות':'exodus','ויקרא':'leviticus','במדבר':'numbers','דברים':'deuteronomy','יהושע':'joshua','שופטים':'judges','שמואל א':'i-samuel','שמואל ב':'ii-samuel','מלכים א':'i-kings','מלכים ב':'ii-kings','ישעיהו':'isaiah','ירמיהו':'jeremiah','יחזקאל':'ezekiel','הושע':'hosea','יואל':'joel','עמוס':'amos','עובדיה':'obadiah','יונה':'jonah','מיכה':'micah','נחום':'nahum','חבקוק':'habakkuk','צפניה':'zephaniah','חגי':'haggai','זכריה':'zechariah','מלאכי':'malachi','תהילים':'psalms','משלי':'proverbs','איוב':'job','שיר השירים':'song-of-songs','רות':'ruth','איכה':'lamentations','קהלת':'ecclesiastes','אסתר':'esther','דניאל':'daniel','עזרא':'ezra','נחמיה':'nehemiah','דברי הימים א':'i-chronicles','דברי הימים ב':'ii-chronicles'}
VAL={'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,'ק':100,'ר':200,'ש':300,'ת':400}
def num(s): return sum(VAL.get(ch,0) for ch in s)
verses={}; forms={}
for n,es in ent.items():
    vs=set(); fs=set()
    for e in es:
        fr=e['forms_raw']
        head=fr.split(' - [[')[0]
        for f in head.split(','): 
            f=f.strip()
            if f: fs.add(f)
        for m in re.finditer(r'\[\[([^\]]+)\]\]',fr):
            mm=re.match(r'^(.*) ([^ ,]+), ([^ ,]+)$',m.group(1))
            if mm and mm.group(1) in HB: vs.add((HB[mm.group(1)],'%d:%d'%(num(mm.group(2)),num(mm.group(3)))))
    verses[n]=vs; forms[n]=fs
c=collections.Counter()
placeagg={}  # (book,label,n,how,key) -> flags
ex=collections.defaultdict(list)
for line in open('m14-row-places.tsv'):
    p=line.rstrip('\n').split('\t')
    if len(p)<9: continue
    book,label,n,how,key,ents,out,rank,text=p
    es=[x for x in ents.split('+') if x]
    known=[x for x in es if x in verses]
    if not known: c['pairs whose entry is not in the records on hand']+=1; continue
    listed=any((book,label) in verses[x] for x in known)
    form_listed=any(key in forms[x] for x in known)
    c['pairs']+=1
    c[f'{how} key | {out} | verse {"listed" if listed else "not listed"} by the entry']+=1
    c[f'{how} key | form {"listed" if form_listed else "not listed"} by the entry']+=1
    pid=(book,label,n,how,key)
    a=placeagg.get(pid)
    if a is None: a=placeagg[pid]=[0,0,0,0]   # stands&listed, stands&notlisted, withheld(other entry)&listed, withheld&notlisted
    if out=='stands': a[0 if listed else 1]+=1
    elif out=='other_entry': a[2 if listed else 3]+=1
    if out=='other_entry' and listed and len(ex['withheld though the source lists the verse'])<4000 and how=='word': ex['withheld though the source lists the verse'].append((book,label,n,key,ents,text))
    if out=='stands' and not listed and len(ex['stands though the source does not list the verse'])<4000 and how=='word': ex['stands though the source does not list the verse'].append((book,label,n,key,ents,text))
pc=collections.Counter()
for pid,a in placeagg.items():
    how=pid[3]
    pc[f'{how} key places with a Wikisource row']+=1
    if a[0]: pc[f'{how}: a row stands and its entry lists the verse']+=1
    if a[1] and not a[0]: pc[f'{how}: rows stand, none of whose entries lists the verse']+=1
    if a[2] and not a[0]: pc[f'{how}: the entry gate withholds a row whose entry lists the verse, and no listed row stands']+=1
    if a[2] and not a[0] and not a[1]: pc[f'{how}: … and no Wikisource row stands at all']+=1
    if a[2]: pc[f'{how}: the entry gate withholds a row whose entry lists the verse']+=1
print(json.dumps(dict(sorted(c.items())),indent=1,ensure_ascii=False))
print(json.dumps(dict(sorted(pc.items())),indent=1,ensure_ascii=False))
json.dump({'pairs':dict(c),'places':dict(pc),'verse_refs_in_records':sum(len(v) for v in verses.values())},open('m14-verse-binding-stats.json','w'),ensure_ascii=False,indent=1)
import random; random.seed(2)
for k,v in ex.items():
    with open('m14-verse-binding-%s.tsv'%('withheld-listed' if k.startswith('withheld') else 'stands-unlisted'),'w') as f:
        f.write('book\tverse\tword\tkey\tentries_of_row\ttext\n')
        for x in v: f.write('\t'.join(x)+'\n')
    print('##',k)
    for x in random.sample(v,12): print('   ',x)
