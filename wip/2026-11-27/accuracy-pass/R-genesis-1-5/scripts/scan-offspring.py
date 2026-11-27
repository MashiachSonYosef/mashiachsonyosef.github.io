#!/usr/bin/env python3
# Read-only: over the 39 books, every word STEP tags as H2233 (zera, seed/offspring) whose line reads "spring ..." and not
# "offspring ...", with the line of the word before it: the cut "... of" + "spring" for "... offspring".
import gzip, json, sys, os, re, glob
R, OUT = sys.argv[1], sys.argv[2]
rows = []
n_zera = 0
for p in sorted(glob.glob(R + '/data/resting-lines/*.json.gz')):
    book = os.path.basename(p)[:-8]
    if book == 'tikkunei-zohar':
        continue
    rl = json.load(gzip.open(p))
    z = json.load(gzip.open(R + '/data/zones/%s.bin' % book))
    lines = {lab: {r[0]: r for r in rs} for lab, rs in rl['sections']}
    for sec in z['sections']:
        lab = sec['label']
        prev = None
        for e, w in enumerate(sec['words']):
            if 'mark' in w:
                continue
            row = lines.get(lab, {}).get(e)
            line = row[2] if row else ''
            if str(w.get('tg', '')).startswith('H2233'):
                n_zera += 1
                core = line.replace('​', '').split(' + ')
                if any(re.match(r'^(\[[^\]]*\] |<[^>]*> )*spring\b', pc.strip()) for pc in core):
                    rows.append((book, lab, e, w['s'], line, prev[0] if prev else '', prev[1] if prev else ''))
            prev = (w['s'], line)
with open(OUT + '/offspring-cut.tsv', 'w') as f:
    f.write('book\tplace\tentry\thebrew\tline\tword_before\tline_before\n')
    for r in rows:
        f.write('\t'.join(str(x) for x in r) + '\n')
print('words tagged H2233:', n_zera, 'reading "spring":', len(rows))
for r in rows:
    print(r)
