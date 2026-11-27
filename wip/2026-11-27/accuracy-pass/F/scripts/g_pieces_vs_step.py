# Whose division is the row of pieces under each word? The zone's pieces at every place against STEP's own
# cut of the same word (the "/" in STEP's Hebrew column), wherever the verse's words line up one to one.
import sys, json, gzip, re, collections
sys.path.insert(0,'scripts')
from stepidx import load, LET
idx=load('.')
Z=sys.argv[1]
books=[l.strip() for l in open('books39.txt')]
c=collections.Counter(); diffs=[]
for b in books:
    z=json.load(gzip.open(f'{Z}/{b}.bin'))
    for s in z['sections']:
        ref=s['label']
        zw=[w for w in s['words'] if 'mark' not in w]
        st=[x for x in idx[b].get(ref,[]) if len(x['n'])==2 and x['type']!='X']
        c['verses']+=1; c['words']+=len(zw)
        if len(zw)!=len(st):
            c['verses whose words do not line up one to one']+=1; c['words in such verses']+=len(zw); continue
        for i,(w,x) in enumerate(zip(zw,st)):
            main=x['heb'].split('\\')[0]
            sp=[LET(p) for p in main.split('/')]; sp=[p for p in sp if p]
            if 'kq' in w:
                c['pairs (set aside here)']+=1; continue
            zl=LET(w['s'])
            if zl!=''.join(sp):
                c['words whose letters differ from STEP letters (the spelling bridge and the like)']+=1; continue
            pg=w.get('pg')
            if pg is None:
                c['same letters, the zone carries no pieces']+=1
                if len(sp)>1: c['  of them STEP divides the word']+=1
                continue
            zp=[p['k'] for p in pg]; srcs={str(p.get('s')) for p in pg}
            if zp==sp:
                c['same letters, pieces equal to STEP own cut']+=1
                if len(sp)>1: c['  of them divided (two or more pieces)']+=1
            else:
                c['same letters, pieces DIFFER from STEP own cut']+=1; c['  differ, pieces credited to '+'+'.join(sorted(srcs))]+=1
                if len(diffs)<4000: diffs.append((b,ref,i+1,w['s'],'+'.join(zp),'/'.join(sp),x['heb'],'+'.join(sorted(srcs))))
with open('data/pieces-not-steps-cut.tsv','w') as f:
    f.write('book\tref\tword\thebrew\tzone_pieces\tstep_cut\tstep_hebrew_column\tzone_credit\n')
    for d in diffs: f.write('\t'.join(str(v) for v in d)+'\n')
for k,v in c.items(): print(v,k)
print(collections.Counter((d[4].count('+')+1,d[5].count('/')+1) for d in diffs).most_common(8))
for d in diffs[:25]: print(d)
