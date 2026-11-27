#!/usr/bin/env python3
# Read-only: over the 39 books' zone files, counts the words of more than one piece whose core piece's reading (STEP's)
# is a sign and nothing else (so the signs switch, off by default, leaves it undrawn), by the letters of that piece.
# These are the places where the card, opened on the core piece, cannot press STEP's own reading.
import gzip, json, sys, os, re, glob, collections
R, OUT = sys.argv[1], sys.argv[2]
sign_only = re.compile(r'^(<[^>]*>|\[[^\]]*\]|¿|~|X|×|\+)$')
tot = collections.Counter(); by_key = collections.Counter(); ex = {}
for p in sorted(glob.glob(R + '/data/zones/*.bin')):
    book = os.path.basename(p)[:-4]
    if '.' in book or book == 'tikkunei-zohar':
        continue
    z = json.load(gzip.open(p))
    for sec in z['sections']:
        for w in sec['words']:
            if 'mark' in w: continue
            tot['words'] += 1
            pg = w.get('pg') or []
            if len(pg) < 2: continue
            tot['words_of_more_than_one_piece'] += 1
            gl = [str(x.get('g', '')).strip() for x in pg]
            if all(sign_only.match(g) for g in gl): tot['every_piece_a_sign'] += 1; continue
            cores = [x for x in pg if x.get('r') == 'core']
            if cores and all(sign_only.match(str(x.get('g', '')).strip()) for x in cores):
                tot['core_piece_a_hidden_sign'] += 1
                k = '%s %s' % (cores[0].get('k'), str(cores[0].get('g', '')).strip())
                by_key[k] += 1
                ex.setdefault(k, '%s %s %s' % (book, sec['label'], w['s']))
            if any(sign_only.match(g) for g in gl): tot['some_piece_a_hidden_sign'] += 1
print(dict(tot))
with open(OUT + '/hidden-core-pieces.tsv', 'w') as f:
    f.write('piece_and_sign\tplaces\tfirst_place\n')
    for k, v in by_key.most_common():
        f.write('%s\t%d\t%s\n' % (k, v, ex[k]))
for k, v in by_key.most_common(25):
    print(v, k, '|', ex[k])
