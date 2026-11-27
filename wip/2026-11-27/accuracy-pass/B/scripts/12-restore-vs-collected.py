#!/usr/bin/env python3 -I
# Compare each book's restore v5 with the same Sefaria edition as the corpus lane's edition collection holds it
# (another extraction, of 2 September 2026): letters, points and accents only; the scribes' marks (maqaf, paseq,
# sof pasuq, inverted nun, section letters in braces) are left out of both sides.
import gzip, re, os, sys, hashlib
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'
RST=W+'/dl/restore/v2/ledgers/mam/mam-restore'
COL=W+'/dl/editions/v2/sources/tanakh-editions-collect/collected'
DROP=re.compile('[^֑-ׇֽֿׁׂׅׄא-ת]')
BR=re.compile(r'\{[^}]*\}')
strip=lambda x: DROP.sub('',BR.sub('',x))
def csv_split(line):
    o=[];cur='';q=False;i=0
    while i<len(line):
        c=line[i]
        if q:
            if c=='"':
                if i+1<len(line) and line[i+1]=='"': cur+='"'; i+=1
                else: q=False
            else: cur+=c
        elif c=='"': q=True
        elif c==',': o.append(cur); cur=''
        else: cur+=c
        i+=1
    o.append(cur); return o
def rows_of(path):
    t=gzip.open(path,'rt',encoding='utf8').read()
    lines=[l for l in t.split('\n') if len(l)]
    h=csv_split(lines[0])
    return [dict(zip(h,csv_split(l))) for l in lines[1:]]
books=sorted(f[4:-len('-restored-v5.csv.gz')] for f in os.listdir(RST) if f.endswith('-restored-v5.csv.gz'))
out=[]
for b in books:
    r=rows_of(f'{RST}/mam-{b}-restored-v5.csv.gz')
    c=rows_of(f'{COL}/tanakh-{b}/edition-miqra-according-to-the-masorah.tokens.csv.gz')
    rs=''.join(strip(x['surface']) for x in r if x.get('c0_off')!='1')
    cs=''.join(strip(x['hebrew']) for x in c)
    eq = rs==cs
    first=''; ndiff=0
    if not eq:
        n=min(len(rs),len(cs)); i=0
        while i<n and rs[i]==cs[i]: i+=1
        first=f'at char {i}: restore «{rs[max(0,i-14):i+14]}» collected «{cs[max(0,i-14):i+14]}»'
    out.append((b,len(r),len(c),len(rs),len(cs),eq,hashlib.sha256(open(f'{COL}/tanakh-{b}/edition-miqra-according-to-the-masorah.tokens.csv.gz','rb').read()).hexdigest(),first))
with open(W+'/data/restore-vs-collected.tsv','w',encoding='utf8') as f:
    f.write('book\trestore_rows\tcollected_tokens\trestore_chars\tcollected_chars\tequal_letters_points_accents\tcollected_tokens_gz_sha256_today\tfirst_difference\n')
    for x in out: f.write('\t'.join(str(v) for v in x)+'\n')
print('books',len(out),'equal',sum(1 for x in out if x[5]),'not equal',sum(1 for x in out if not x[5]))
for x in out:
    if not x[5]: print(x[0],x[3],x[4],x[7][:220])
