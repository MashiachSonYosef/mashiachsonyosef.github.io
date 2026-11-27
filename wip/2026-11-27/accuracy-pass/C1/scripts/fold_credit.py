# For each source reading of TBESH and TAHOT (whole rows): under whose name does the store serve the same words under the same key,
# and is every such row shut at rest? Run: python3 -I fold_credit.py <out dir>
import sys, json, re, collections, os
outdir = sys.argv[1]
S = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(outdir)))) if False else None
letters = lambda s: ''.join(ch for ch in s if 'א' <= ch <= 'ת')
rows = collections.defaultdict(list)   # (k, text) -> [(m, shut)]
for l in open(os.path.join(outdir, 'data', 'all-rows.tsv'), encoding='utf-8'):
    p = l.rstrip('\n').split('\t')
    rows[(p[0], p[7])].append((p[2], p[6]))
keys = set(k for k, _ in rows)
def tally(pairs, me, label, outname):
    c = collections.Counter(); who = collections.Counter(); who_shut = collections.Counter()
    o = open(os.path.join(outdir, outname), 'w', encoding='utf-8')
    o.write('class\tkey\treading\tserved_under\n')
    for k, g, extra in pairs:
        rr = rows.get((k, g))
        if k not in keys: cls = 'key not in the store'
        elif not rr: cls = 'key in the store, these words not served under it'
        elif any(m == me for m, _ in rr): cls = 'served under its own name'
        elif all(sh for _, sh in rr):
            cls = 'served only under another name, and every such row rests shut'
            for m, sh in rr: who_shut[m] += 1
        else:
            cls = 'served only under another name (open at rest)'
            for m, sh in rr:
                if not sh: who[m] += 1
        c[cls] += 1
        if not cls.startswith('served under its own'):
            o.write('\t'.join([cls, k, g, ','.join(m + (':shut' if sh else '') for m, sh in (rr or []))]) + '\n')
    o.close()
    print('==', label, sum(c.values()))
    for a, b in c.most_common(): print(f'{b:>7}  {a}')
    print('   open carriers:', who.most_common(12)); print('   shut carriers:', who_shut.most_common(12))
    return c
# TBESH
ents = json.load(open(os.path.join(outdir, 'data', 'tbesh-entries.json')))
seen = set(); pairs = []
for e in ents:
    for sp in e['heb'].split(','):
        k = letters(sp); g = re.sub(r'\s+', ' ', e['gloss']).strip()
        if k and (k, g) not in seen: seen.add((k, g)); pairs.append((k, g, e['e']))
tally(pairs, 'M19', 'TBESH: distinct (letters, Gloss) pairs', 'fold-credit-stepbible_tbesh_gloss.tsv')
# TAHOT whole rows
seen = set(); pairs = []
for l in open(os.path.join(outdir, 'data', 'tahot-rows.jsonl'), encoding='utf-8'):
    t = json.loads(l)
    k = letters(''.join(x.split('\\')[0] for x in t['hebrew'].split('/'))); g = re.sub(r'\s+', ' ', t['tr']).strip()
    if k and (k, g) not in seen: seen.add((k, g)); pairs.append((k, g, t['ref']))
tally(pairs, 'M4', 'TAHOT: distinct (letters of the word, translation column) pairs', 'fold-credit-stepbible_tahot_aligned_translation.tsv')
