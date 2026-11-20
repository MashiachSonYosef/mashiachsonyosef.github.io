import sys, collections, re
G = 1e9
raw = {}; ed = {}
other = collections.Counter()
for line in open(sys.argv[1], encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) < 3 or not p[0].startswith('v2/sources/ia-scans/wave-'): continue
    k, s = p[0], int(p[1]); parts = k.split('/')
    wave, kind, name = parts[3], '/'.join(parts[4:6]), parts[-1]
    if kind == 'collected/raw':
        stem = re.sub(r'(_djvu)?\.txt\.gz$|\.djvu\.txt\.gz$', '', name); raw[(wave, stem)] = raw.get((wave, stem), 0) + s
        other['raw:' + ('.'.join(name.split('.')[-3:]) if name.count('.') >= 3 else name.split('.', 1)[-1])] += s
    elif kind == 'collected/editions':
        stem = re.sub(r'\.tokens\.csv\.gz$|\.json$|\.receipt\.json$', '', name); ed[(wave, stem)] = ed.get((wave, stem), 0) + s
        other['editions:' + ('tokens.csv.gz' if name.endswith('.tokens.csv.gz') else name.rsplit('.', 1)[-1])] += s
    else: other['else:' + kind] += s
both = set(raw) & set(ed)
print('raw stems', len(raw), round(sum(raw.values())/G, 2), 'GB; edition stems', len(ed), round(sum(ed.values())/G, 2), 'GB; stems in both', len(both))
print('edition stems with no raw:', len(set(ed) - set(raw)), round(sum(v for k, v in ed.items() if k not in raw)/G, 2), 'GB; raw with no edition:', len(set(raw) - set(ed)), round(sum(v for k, v in raw.items() if k not in ed)/G, 2), 'GB')
for k, v in other.most_common(12): print(' ', k, round(v/G, 3))
print(list(sorted(set(ed) - set(raw)))[:5]); print(list(sorted(set(raw) - set(ed)))[:5])
