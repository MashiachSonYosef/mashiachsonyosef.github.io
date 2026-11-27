#!/usr/bin/env python3
# For every check tool: which records of data/ it names, and whether it hashes (createHash / sha256Of / readPinned / heldToPin).
import os, re, collections, json
S='/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
R=S+'/base/reader'; W=S+'/w39/out/B'
tools=sorted(f for f in os.listdir(R+'/tools') if f.endswith('.mjs') or f.endswith('.sh'))
names=set()
for root,dirs,files in os.walk(R+'/data'):
    rel=os.path.relpath(root,R+'/data')
    if rel=='.':
        for f in files: names.add(f)
        for d in dirs: names.add(d)
    for f in files:
        if f=='PIN.json': names.add(os.path.join(rel,f))
names=sorted(names,key=len,reverse=True)
rows=[]
imports=collections.defaultdict(set)
for t in tools:
    src=open(os.path.join(R,'tools',t),encoding='utf8',errors='replace').read()
    hashes = bool(re.search(r'createHash|sha256Of|readPinned|heldToPin|readPinnedLines|sha256\(',src))
    pinned = bool(re.search(r'readPinned|heldToPin|readPinnedLines',src))
    named=[n for n in names if n in src]
    for m in re.finditer(r'from\s+"\./([A-Za-z0-9_.-]+\.mjs)"',src): imports[t].add(m.group(1))
    run=re.search(r'//\s*RUN:\s*(.*)',src)
    rows.append((t, 'check' if t.startswith('check-') else 'tool', run.group(1).strip() if run else '', hashes, pinned, ';'.join(named)))
with open(W+'/data/check-matrix.tsv','w') as f:
    f.write('tool\tkind\trun\thashes\treads_through_pin_helper\tdata_records_named\n')
    for r in rows: f.write('\t'.join(str(x) for x in r)+'\n')
json.dump({k:sorted(v) for k,v in imports.items()},open(W+'/data/tool-imports.json','w'),indent=0)
print(len(rows), sum(1 for r in rows if r[1]=='check'), sum(1 for r in rows if r[1]=='check' and r[3]), sum(1 for r in rows if r[1]=='check' and r[4]))
