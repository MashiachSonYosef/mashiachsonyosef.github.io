# Count the resting lines of the 39 books led by each family outside the Bible kind (read-only).
import gzip, json, sys, collections, os
R = sys.argv[1]
idx = json.load(open(f'{R}/data/route-store/index.json'))['m_sources']
fam = json.load(open(f'{R}/data/dictionary-kinds-v1.json'))['families']
k2f = {k: f for f in fam if f['shelf'] == 'store' for k in f['keys']}
by = collections.Counter(); ex = collections.defaultdict(list); total = 0
for fn in sorted(os.listdir(f'{R}/data/resting-lines')):
    book = fn.split('.')[0]
    if book == 'tikkunei-zohar': continue
    d = json.load(gzip.open(f'{R}/data/resting-lines/{fn}'))
    for label, entries in d['sections']:
        for e in entries:
            total += 1
            m = e[3]
            src = idx.get(m)
            f = k2f.get(src['key']) if src else None
            kind = f['kind'] if f else ('piece' if str(m).startswith('PIECE') else 'none:' + str(m))
            if kind != 'bible':
                key = (kind, f['id'] if f else m)
                by[key] += 1
                if len(ex[key]) < 40: ex[key].append(f'{book} {label}#{e[0]+1} «{e[2]}» ({m})')
print('lines', total)
for k, n in by.most_common(): print(n, k, '\n    '.join(ex[k]))
