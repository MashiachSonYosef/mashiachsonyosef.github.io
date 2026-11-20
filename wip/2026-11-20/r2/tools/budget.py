import sys, collections, re
keys_path = sys.argv[1]
TEXT = {'jsonl','json','txt','csv','tsv','ndjson','xml','md','log','html','htm','py','mjs','js','sh','yaml','yml','err','out','sql','tex','svg','stderr','stdout'}
PACKED = {'gz','zst','xz','bz2','zip','pdf','jp2','jpg','jpeg','png','djvu','epub','7z','tgz','tar','webp','gif','mp4','bin','br','parquet','sqlite','db'}
def ext(k):
    b = k.rsplit('/',1)[-1]
    return b.rsplit('.',1)[-1].lower() if '.' in b else '(none)'
G = 1e9
tot = collections.Counter(); cnt = collections.Counter()
kind = collections.defaultdict(collections.Counter)
seen = {}
dupe = collections.Counter()
extb = collections.defaultdict(collections.Counter)
month = collections.Counter(); monthn = collections.Counter()
big = []
with open(keys_path, encoding='utf-8') as f:
    for line in f:
        p = line.rstrip('\n').split('\t')
        if len(p) < 3: continue
        k, s, d = p[0], int(p[1]), p[2]
        month[d[:7]] += s; monthn[d[:7]] += 1
        if not k.startswith('v2/'): continue
        parts = k.split('/')
        top = '/'.join(parts[:2])
        sub = '/'.join(parts[:3])
        e = ext(k)
        c = 'text' if e in TEXT else ('packed' if e in PACKED else 'other')
        tot[top] += s; cnt[top] += 1
        kind[top][c] += s
        extb[top][e] += s
        key = (k.rsplit('/',1)[-1], s)
        if key in seen and s > 0:
            dupe[(top, c)] += s
        else:
            seen[key] = k
        if top == 'v2/sources':
            kind[sub][c] += s; tot[sub] += s; cnt[sub] += 1; extb[sub][e] += s
print('uploads by month (bytes GB, objects):')
for m in sorted(month): print(' ', m, round(month[m]/G,2), monthn[m])
print()
for top in sorted(tot, key=lambda t: -tot[t]):
    k = kind[top]
    print(f"{top:44s} {tot[top]/G:7.2f} GB {cnt[top]:7d} obj  text {k['text']/G:6.2f} packed {k['packed']/G:6.2f} other {k['other']/G:6.2f}")
    print('    ext:', ', '.join(f"{e} {b/G:.2f}" for e, b in extb[top].most_common(7)))
print()
print('repeats (same name and size, later copies) by area and kind:')
for (top, c), b in sorted(dupe.items(), key=lambda x: -x[1]): print(f"  {top:16s} {c:7s} {b/G:6.2f}")
