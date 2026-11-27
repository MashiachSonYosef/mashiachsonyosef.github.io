#!/usr/bin/env python3 -I
# For the six books whose restore and collected streams differ: align and list every stretch that stands on one side only.
import gzip, re, os, sys, json, difflib
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'
RST=W+'/dl/restore/v2/ledgers/mam/mam-restore'
COL=W+'/dl/editions/v2/sources/tanakh-editions-collect/collected'
RCP=W+'/dl/restore-x/receipts'
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
out=open(W+'/data/six-books-one-side-only.tsv','w',encoding='utf8')
out.write('book\tside\tat_restore_char\ttext\trestore_ref_nearby\n')
for b in ['deuteronomy','esther','exodus','genesis','leviticus','numbers']:
    r=rows_of(f'{RST}/mam-{b}-restored-v5.csv.gz')
    c=rows_of(f'{COL}/tanakh-{b}/edition-miqra-according-to-the-masorah.tokens.csv.gz')
    rw=[(strip(x['surface']),x['ref']) for x in r if x.get('c0_off')!='1']
    rs=''.join(t for t,_ in rw); cs=''.join(strip(x['hebrew']) for x in c)
    # char offset -> ref
    offs=[];o=0
    for t,ref in rw: offs.append((o,ref)); o+=len(t)
    import bisect
    def ref_at(i):
        k=bisect.bisect_right([a for a,_ in offs],i)-1
        return offs[max(0,k)][1]
    # walk: find common prefix, then resync by searching the next 40 chars of restore in collected
    i=j=0; ins=[]; dele=[]
    n=len(rs); m=len(cs)
    while i<n and j<m:
        if rs[i]==cs[j]: i+=1; j+=1; continue
        # mismatch: try insertion in collected (footnote): find rs[i:i+40] in cs after j
        probe=rs[i:i+40]
        k=cs.find(probe,j)
        if k!=-1 and k-j<4000:
            ins.append((i,cs[j:k])); j=k; continue
        probe2=cs[j:j+40]
        k2=rs.find(probe2,i)
        if k2!=-1 and k2-i<4000:
            dele.append((i,rs[i:k2])); i=k2; continue
        ins.append((i,'<<could not resync>>')); break
    tail_c=cs[j:] if i>=n else ''; tail_r=rs[i:] if j>=m else ''
    rc=json.load(open(f'{RCP}/mam-{b}-restored-v5.json'))
    print(b,'collected-only stretches',len(ins),'restore-only stretches',len(dele),'| receipt footnotes_lifted',rc['counts'].get('footnotes_lifted'),'| tails',len(tail_c),len(tail_r))
    for at,t in ins: out.write(f'{b}\tcollected only\t{at}\t{t}\t{ref_at(at)}\n')
    for at,t in dele: out.write(f'{b}\trestore only\t{at}\t{t}\t{ref_at(at)}\n')
    for at,t in (ins+dele)[:3]: print('   ',ref_at(at),t[:90])
out.close()
