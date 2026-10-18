# Build the sample selections: one TSV per run, each listing the family's distinct (md5,size) files (first
# occurrence by last_modified), in chronological order. ia-wave is sampled by item (all files of an item together).
# Run: python3 -I 15-select.py
import hashlib, collections, json, os

S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
O = S + '/meta/overlap/tables'
BUCKET = S + '/clean/bucket-now2.tsv'
MD5 = S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv'

RUNS = {
    'licence': ['corpus-lane-builds/moses-licence-ledger-v1/'],
    'cold': ['cold/'],
    'witnessed': ['corpus-lane-builds/moses-witnessed-order-v'],
    'compspan': ['corpus-lane-builds/moses-compspan-v13'],
    'census': ['corpus-lane-builds/moses-source-census-v'],
    'iawave': ['moses-ia-wave-v'],
    'staging': ['corpus-staging/'],
    'runback': ['corpus-lane-builds/moses-run-ledger-backwards-v'],
    'hud': ['corpus-lane-builds/moses-hud-record-v'],
    'editions': ['editions-built-v1/'],
}
IA_MOD = 7  # ia-wave: keep items whose md5(item name) % 7 == 0 (about 1/7 of the items)
ED_MOD = 4  # editions-built: keep work folders whose md5(work) % 4 == 0

lm = {}
for l in open(BUCKET, encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); lm[k] = t

def item_of(k):
    return k.rsplit('/', 1)[-1].split('.')[0]

summary = {}
for run, prefs in RUNS.items():
    first = {}
    L1w = 0
    for l in open(MD5, encoding='utf-8'):
        h, s, k = l.rstrip('\n').split('\t', 2)
        if not any(k.startswith(p) for p in prefs): continue
        c = (h, int(s)); t = lm[k]
        if c not in first or (t, k) < (first[c][0], first[c][1]): first[c] = (t, k)
    L1w = sum(c[1] for c in first)
    rows = []
    for (h, s), (t, k) in first.items():
        if run == 'iawave' and '/collected/' in k:
            if int(hashlib.md5(item_of(k).encode()).hexdigest(), 16) % IA_MOD: continue
        if run == 'editions':
            work = k.split('/')[1] if not k.startswith('editions-built-v1/pby-wave/') else item_of(k)
            if int(hashlib.md5(work.encode()).hexdigest(), 16) % ED_MOD: continue
        rows.append((t, k, s, h))
    rows.sort()
    with open(O + '/sel-%s.tsv' % run, 'w', encoding='utf-8') as w:
        for t, k, s, h in rows:
            w.write('%s\t%s\t%d\t%s\t%s\n' % (run, k, s, h, t))
    summary[run] = {'distinct_in_family': len(first), 'L1_within_bytes': L1w, 'selected_files': len(rows),
                    'selected_bytes': sum(r[2] for r in rows)}
    print(run, summary[run])
json.dump(summary, open(O + '/15-selection.json', 'w'), indent=1)
