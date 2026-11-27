#!/usr/bin/env python3 -I
# For each of the 39 books: re-hash the restore file fetched from the store, recompute the surface hash from its rows,
# compare with the receipt, the rights record and the zone's own walk block; then rebuild the row surfaces from the
# SERVED zone's words and hash them the same way.
import json, gzip, hashlib, os, sys, csv, io
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
D=S+'/base/reader/data'
W=S+'/w39/out/B'
RST=W+'/dl/restore/v2/ledgers/mam/mam-restore'
RCP=W+'/dl/restore-x/receipts'
sha=lambda b: hashlib.sha256(b).hexdigest()
rights_bytes=open(D+'/mam-restore-v5-rights-v1.json','rb').read()
rights=json.loads(rights_bytes)
rights_sha=sha(rights_bytes)
gate=json.load(open(D+'/serve-gate-receipt-v1.json'))
wit_sha=sha(open(D+'/masorah-witnesses-v1.json','rb').read())
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
rows_out=[]
hdr=['book','restore_gz_bytes','restore_gz_sha256_zone','restore_gz_sha256_today','gz_match','surface_sha256_rights_record','surface_sha256_receipt','surface_sha256_zone','surface_sha256_from_store_rows','surface_match_all','receipt_sha256_today','receipt_sha256_part_index','restore_rows','zone_positions','zone_rows_rebuilt','surface_sha256_from_served_zone','zone_rejoins_to_surface','zone_concat_equals_restore_concat','rights_record_sha256_zone','rights_record_sha256_today','rights_match','witnesses_sha256_zone','witnesses_match','book_cards_sha256_zone','bridge_sha256_zone']
idx={}
for l in open(RCP+'/TEXT-PART-INDEX-v1.tsv',encoding='utf8').read().split('\n')[1:]:
    if l.strip():
        p=l.split('\t'); idx[p[0]]=p[4]
books=[w.split('/')[1] for w in rights['works']]
tot=dict(gz=0,surf=0,zone=0,concat=0,rights=0)
for b in sorted(books):
    rw=rights['works']['tanakh/'+b]
    z=json.load(gzip.open(f'{D}/zones/{b}.bin'))
    ro=z['emitted_from']['walk']['restore_oracle']
    gzb=open(f'{RST}/mam-{b}-restored-v5.csv.gz','rb').read()
    txt=gzip.decompress(gzb).decode('utf8')
    lines=[l for l in txt.split('\n') if len(l)]
    header=csv_split(lines[0])
    rows=[dict(zip(header,csv_split(l))) for l in lines[1:]]
    surf=[r['surface'] for r in rows]
    s_store=sha(('\n'.join(surf)+'\n').encode('utf8'))
    rc_bytes=open(f'{RCP}/mam-{b}-restored-v5.json','rb').read()
    rc=json.loads(rc_bytes)
    # rebuild rows from the served zone
    zw=[w for s in z['sections'] for w in s['words']]
    zrows=[];cur=''
    for w in zw:
        cur+=w['s']
        pj=w.get('presentation_join') or {}
        if pj.get('join_next_without_separator'): continue
        zrows.append(cur); cur=''
    if cur: zrows.append(cur)
    s_zone=sha(('\n'.join(zrows)+'\n').encode('utf8'))
    concat_eq = ''.join(w['s'] for w in zw)==''.join(surf)
    gz_match = sha(gzb)==ro['restore_gz_sha256']
    surf_all = (s_store==rw['restore_surface_sha256']==rc['surface_sha256']==ro['surface_sha256'])
    rr=z['emitted_from']['walk']['rights']
    cs=z.get('count_stamp',{})
    tot['gz']+=gz_match; tot['surf']+=surf_all; tot['zone']+= s_zone==s_store; tot['concat']+=concat_eq; tot['rights']+= rr['record_sha256']==rights_sha
    rows_out.append([b,len(gzb),ro['restore_gz_sha256'],sha(gzb),gz_match,rw['restore_surface_sha256'],rc['surface_sha256'],ro['surface_sha256'],s_store,surf_all,sha(rc_bytes),idx.get(f'mam-{b}-restored-v5.json',''),len(rows),len(zw),len(zrows),s_zone,s_zone==s_store,concat_eq,rr['record_sha256'],rights_sha,rr['record_sha256']==rights_sha,cs.get('witnesses',{}).get('sha256',''),cs.get('witnesses',{}).get('sha256','')==wit_sha,ro['count']['held_to']['sha256'],z['emitted_from']['walk']['identity']['bridge_sha256']])
with open(W+'/data/books-chain.tsv','w',encoding='utf8') as f:
    f.write('\t'.join(hdr)+'\n')
    for r in rows_out: f.write('\t'.join(str(x) for x in r)+'\n')
print('books',len(books),tot)
for r in rows_out:
    if not (r[4] and r[9] and r[16] and r[17] and r[20] and r[22]): print('NOT ALL TRUE',r[0],r[4],r[9],r[16],r[17],r[20],r[22],r[12],r[14])
print('receipt index agrees', sum(1 for r in rows_out if r[10]==r[11]))
print('distinct rights sha in zones', set(r[18] for r in rows_out), 'today', rights_sha)
print('distinct witnesses sha in zones', set(r[21] for r in rows_out), 'today', wit_sha)
print('distinct book cards sha', set(r[23] for r in rows_out))
