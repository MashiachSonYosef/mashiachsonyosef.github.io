import sys, csv, collections
keys_path, lacks_path, out_path = sys.argv[1:4]
by_base = collections.defaultdict(list)
shas = {}
with open(keys_path, encoding='utf-8') as f:
    for line in f:
        parts = line.rstrip('\n').split('\t')
        if len(parts) < 2: continue
        k = parts[0]
        by_base[k.rsplit('/', 1)[-1]].append((k, parts[1]))
rows = list(csv.reader(open(lacks_path, encoding='utf-8'), delimiter='\t'))
head, rows = rows[0], rows[1:]
kinds = collections.Counter(); now = collections.Counter()
out = [['kind', 'file name', 'sha256', 'on 8 November', 'on 20 November', 'v2 key now', 'old-layout keys now']]
for r in rows:
    kind, name, sha, where = r[0], r[1], r[2], r[3]
    hits = by_base.get(name, [])
    v2 = [k for k, s in hits if k.startswith('v2/')]
    old = [k for k, s in hits if not k.startswith('v2/')]
    # a content-addressed copy under the sha
    cas = [k for k, s in by_base.get(sha, [])]
    v2cas = [k for k in cas if k.startswith('v2/')]
    oldcas = [k for k in cas if not k.startswith('v2/')]
    if v2 or v2cas: state = 'in v2'
    elif old or oldcas: state = 'old layout only'
    else: state = 'nowhere under this name or hash'
    kinds[kind] += 1; now[(kind, state)] += 1
    out.append([kind, name, sha, where[:40], state, ';'.join((v2 + v2cas)[:3]), ';'.join((old + oldcas)[:3])])
csv.writer(open(out_path, 'w', encoding='utf-8', newline=''), delimiter='\t', lineterminator='\n').writerows(out)
for kind in sorted(kinds):
    print(kind, kinds[kind], {s: n for (k, s), n in now.items() if k == kind})
tot = collections.Counter()
for (k, s), n in now.items(): tot[s] += n
print('TOTAL', dict(tot))
