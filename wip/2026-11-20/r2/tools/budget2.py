import sys, collections
keys_path = sys.argv[1]
TEXT = {'jsonl','json','txt','csv','tsv','ndjson','xml','md','log','html','htm','py','mjs','js','sh','yaml','yml','err','out','sql','tex','svg','stderr','stdout','wikitext'}
G = 1e9
def ext(k):
    b = k.rsplit('/',1)[-1]
    return b.rsplit('.',1)[-1].lower() if '.' in b else '(none)'
raw = collections.Counter(); est = collections.Counter(); n = collections.Counter(); rep = collections.Counter()
seen = set()
ia = collections.Counter(); ian = collections.Counter(); iasuf = collections.Counter()
samples = []
with open(keys_path, encoding='utf-8') as f:
    for line in f:
        p = line.rstrip('\n').split('\t')
        if len(p) < 3 or not p[0].startswith('v2/'): continue
        k, s = p[0], int(p[1])
        parts = k.split('/')
        sub = '/'.join(parts[:3])
        e = ext(k)
        c = s / 6.8 if e in TEXT else s
        key = (parts[-1], s)
        raw[sub] += s; n[sub] += 1
        if key in seen and s > 0: rep[sub] += c
        else:
            seen.add(key); est[sub] += c
        if sub == 'v2/sources/ia-scans':
            d = '/'.join(parts[3:6]); ia[d] += s; ian[d] += 1
            b = parts[-1]
            suf = '.'.join(b.split('.')[-2:]) if b.count('.') >= 2 else b.split('.')[-1]
            if '_' in b: suf = b.rsplit('_',1)[-1] if len(b.rsplit('_',1)[-1]) < 24 else suf
            iasuf[suf] += s
            if len(samples) < 12 and s > 5e6: samples.append((k, s))
print('area (depth 3): now GB -> kept once and compressed GB (objects)')
tr = te = 0
for sub in sorted(est, key=lambda t: -est[t])[:34]:
    print(f"  {sub:52s} {raw[sub]/G:6.2f} -> {est[sub]/G:5.2f}  ({n[sub]})")
for sub in est:
    tr += raw[sub]; te += est[sub]
print(f"  ALL v2 {tr/G:.2f} -> {te/G:.2f}")
for top in ('v2/ledgers','v2/corpus','v2/sources','v2/letters'):
    print(' ', top, round(sum(v for k, v in raw.items() if k.startswith(top))/G,2), '->', round(sum(v for k, v in est.items() if k.startswith(top))/G,2))
print('ia-scans by folder:')
for d, b in ia.most_common(12): print(f"  {d:60s} {b/G:5.2f} ({ian[d]})")
print('ia-scans by file ending:')
for d, b in iasuf.most_common(14): print(f"  {d:30s} {b/G:5.2f}")
for k, s in samples: print('  e.g.', k[:170], s)
