import sys, collections
keys_path = sys.argv[1]
TEXT = {'jsonl','json','txt','csv','tsv','ndjson','xml','md','log','html','htm','py','mjs','js','sh','yaml','yml','err','out','sql','tex','svg','stderr','stdout','wikitext'}
G = 1e9
def ext(k):
    b = k.rsplit('/',1)[-1]
    return b.rsplit('.',1)[-1].lower() if '.' in b else '(none)'
raw = collections.Counter(); est = collections.Counter(); n = collections.Counter()
seen = set()
read = collections.Counter(); readn = collections.Counter()
READS = ['v2/corpus/lattice', 'v2/corpus/binyan-ledger', 'v2/corpus/default-picks', 'v2/corpus/row-entries', 'v2/letters', 'serving-lane/shelf']
old = collections.Counter(); oldn = collections.Counter()
with open(keys_path, encoding='utf-8') as f:
    for line in f:
        p = line.rstrip('\n').split('\t')
        if len(p) < 3: continue
        k, s = p[0], int(p[1])
        parts = k.split('/')
        if k.startswith('serving-lane/'):
            old['/'.join(parts[:2])] += s; oldn['/'.join(parts[:2])] += 1
        if not k.startswith('v2/'): continue
        for d in (4, 5):
            sub = '/'.join(parts[:d])
            if sub.startswith('v2/ledgers/all') or sub.startswith('v2/corpus/lattice') or sub.startswith('v2/corpus/shelf-lattice') or sub.startswith('v2/corpus/dictionary-store'):
                if (d == 4) or sub.startswith('v2/corpus/lattice-ledger'):
                    e = ext(k); c = s / 6.8 if e in TEXT else s
                    raw[sub] += s; n[sub] += 1
                    key = (d, parts[-1], s)
                    if key in seen and s > 0: pass
                    else: seen.add(key); est[sub] += c
        if parts[1] == 'corpus':
            sub = '/'.join(parts[:3])
            if 'lattice' in sub or 'picks' in sub or 'entries' in sub or 'binyan' in sub or 'stems' in sub or 'rule-pass' in sub or 'bridge' in sub:
                read[sub] += s; readn[sub] += 1
for sub in sorted(est, key=lambda t: -est[t])[:46]:
    print(f"  {sub:64s} {raw[sub]/G:6.2f} -> {est[sub]/G:5.2f}  ({n[sub]})")
print('corpus folders the page lane may read:')
for sub, b in read.most_common(): print(f"  {sub:50s} {b/G:6.3f} ({readn[sub]})")
print('serving-lane:')
for sub, b in old.most_common(): print(f"  {sub:50s} {b/G:6.3f} ({oldn[sub]})")
