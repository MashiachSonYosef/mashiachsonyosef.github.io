#!/usr/bin/env python3
# Classify every sha256 recorded in the data folder's JSON: does a file of the tree hold those bytes today?
import csv, os, re, sys, collections, json
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
W=S+'/w39/out/B'
raw=collections.defaultdict(list); unz=collections.defaultdict(list); bypath={}
for i,l in enumerate(open(W+'/data/tree-hashes.tsv')):
    if i==0: continue
    p,b,h,ub,uh=l.rstrip('\n').split('\t')
    raw[h].append(p); bypath[p]=(h,uh,b,ub)
    if uh: unz[uh].append(p)
rows=[]
for i,l in enumerate(open(W+'/data/all-recorded-hashes.tsv')):
    if i==0: continue
    f,jp,h,sib=l.rstrip('\n').split('\t',3)
    where='off_tree'
    hit=''
    if h in raw: where='tree_raw'; hit=';'.join(raw[h][:3])
    elif h in unz: where='tree_unzipped'; hit=';'.join(unz[h][:3])
    rows.append((f,jp,h,where,hit,sib))
with open(W+'/data/recorded-hashes-classified.tsv','w') as o:
    o.write('recorded_in\tjson_path\tsha256\twhere_today\ttree_file\tsiblings\n')
    for r in rows: o.write('\t'.join(r)+'\n')
c=collections.Counter(r[3] for r in rows)
print(c)
# by recording file
byf=collections.defaultdict(collections.Counter)
for r in rows: byf[r[0]][r[3]]+=1
for f,cc in sorted(byf.items(), key=lambda x:-sum(x[1].values()))[:400]:
    print(sum(cc.values()), dict(cc), f)
