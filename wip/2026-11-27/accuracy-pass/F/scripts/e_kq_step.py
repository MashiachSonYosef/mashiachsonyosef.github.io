# Every ketiv/qere place: what the page draws under it at rest, against STEP's own row for the place.
import sys, json, re, collections
sys.path.insert(0,'scripts')
from stepidx import load, LET
idx=load('.')
rows=json.load(open('data/kq-places.json'))
def norm_step(en):
    parts=[p.strip() for p in en.split('/')]
    return ' + '.join(p for p in parts if p and p!='-')
def norm(s): return re.sub(r'\s+',' ',s.replace('​','')).strip()
def halves(s):
    k=' '.join(re.findall(r'\(([^)]*)\)',s)); q=' '.join(re.findall(r'\[([^\]]*)\]',s))
    return LET(k),LET(q)
out=[]; cat=collections.Counter()
for r in rows:
    st=idx[r['book']][r['ref']]
    n=r['word']
    kL,qL=halves(r['s'])
    # candidate rows: the same number, else the nearest row whose main or variant letters match a half
    cand=[x for x in st if int(x['n'][:2])==n and len(x['n'])==2]
    def fits(x):
        h=LET(x['heb']); v=LET(' '.join(re.findall(r'\(([^)]*)\)',x['varm'])))+'|'+LET(x['vars'])
        return (qL and qL in h) or (kL and (kL in h or kL in v)) or (h and (h==qL or h==kL))
    row=None
    for x in cand:
        if fits(x) or not x['heb'].strip(): row=x
    if row is None:
        near=[x for x in st if abs(int(x['n'][:2])-n)<=2 and len(x['n'])==2 and fits(x)]
        if near: row=sorted(near,key=lambda x: abs(int(x['n'][:2])-n))[0]
    rec=dict(book=r['book'],ref=r['ref'],word=n,carrier=r['s'],order=r['order'],page_line=norm(r['line']),page_src=r['src'],page_stands_on=r['backs'])
    if row is None:
        rec.update(step_ref='',step_type='',step_heb='',step_en='',step_k='',verdict='no STEP row found by number or letters'); cat[rec['verdict']]+=1; out.append(rec); continue
    h=LET(row['heb'])
    km=re.search(r'K= *\S* *\(([^)]*)\) *"([^"]*)"',row['varm'])
    step_k_heb=LET(km.group(1)) if km else ''; step_k_en=norm_step(km.group(2)) if km else ''
    rec.update(step_ref=row['ref'],step_type=row['type'],step_heb=row['heb'],step_en=norm_step(row['en']),step_k=(km.group(1)+' = '+km.group(2)) if km else row['vars'])
    main_is = 'qere' if h==qL and h!=kL else 'ketiv' if h==kL and h!=qL else 'both' if h==kL==qL else 'empty' if not h else 'contains-qere' if qL and qL in h else 'neither'
    rec['step_main_spells']=main_is
    pl=rec['page_line']; se=rec['step_en']
    same=lambda a,b: re.sub(r'[\s+]','',a)==re.sub(r'[\s+]','',b)
    if r['order']=='KETIV_ONLY':
        v='written-not-read: STEP reads nothing here and gives the written word as «'+step_k_en+'»; the page prints «'+pl+'»'
        cat['written-not-read: page prints a line; equals STEP K reading: '+str(same(pl,step_k_en))]+=1
    elif r['order']=='QERE_ONLY':
        tail=se.split(' + ')
        v='read-not-written: STEP joins it to the word before («'+se+'»); page prints «'+pl+'»'
        cat['read-not-written: page line is the tail of STEP row: '+str(any(same(pl,' + '.join(tail[i:])) for i in range(len(tail))))]+=1
    else:
        if not pl: v='no line on the page; STEP reads «'+se+'»'; cat['two-sided: no line on the page']+=1
        elif same(pl,se) or same(pl.replace('<','').replace('>',''),se.replace('<','').replace('>','')):
            if r['backs']=='QERE': v='page line is STEP reading, marked on the read form'; cat['two-sided: STEP reading, marked on the read form']+=1
            else:
                v='page line is STEP reading but the page marks the written form as the half it reads; STEP row type '+row['type']+(' gives the written form as «'+step_k_en+'»' if step_k_en else '')
                cat['two-sided: STEP reading, marked on the WRITTEN form (STEP type '+row['type']+')']+=1
        else:
            v='page line differs from STEP row reading'; cat['two-sided: page line differs from STEP reading ['+r['src']+']']+=1
    rec['verdict']=v; out.append(rec)
cols=['book','ref','word','carrier','order','page_line','page_src','page_stands_on','step_ref','step_type','step_heb','step_en','step_k','step_main_spells','verdict']
with open('data/kq-against-step.tsv','w') as f:
    f.write('\t'.join(cols)+'\n')
    for r in out: f.write('\t'.join(str(r.get(c,'')) for c in cols)+'\n')
for k,v in sorted(cat.items(),key=lambda x:-x[1]): print(v,k)
print(collections.Counter(r.get('step_type','') for r in out).most_common(12))
print(collections.Counter(r.get('step_main_spells','') for r in out))
