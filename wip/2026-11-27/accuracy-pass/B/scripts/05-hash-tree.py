#!/usr/bin/env python3
# Hash every file of the frozen tree's reader/ (raw bytes; and the unzipped bytes where the file is gzip).
import hashlib, os, gzip, sys, zlib
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R=S+'/base/reader'
out=S+'/w39/out/B/data/tree-hashes.tsv'
n=0
with open(out,'w') as f:
    f.write('path\tbytes\tsha256\tunzipped_bytes\tunzipped_sha256\n')
    for root,dirs,files in os.walk(R):
        dirs.sort()
        for fn in sorted(files):
            p=os.path.join(root,fn)
            b=open(p,'rb').read()
            h=hashlib.sha256(b).hexdigest()
            ub='';uh=''
            if b[:2]==b'\x1f\x8b':
                try:
                    u=gzip.decompress(b); ub=len(u); uh=hashlib.sha256(u).hexdigest()
                except Exception as e:
                    ub='ERR'; uh=''
            f.write(f'{os.path.relpath(p,S+"/base")}\t{len(b)}\t{h}\t{ub}\t{uh}\n'); n+=1
print(n)
