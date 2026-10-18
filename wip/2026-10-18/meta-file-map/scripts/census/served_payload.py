# The live payload: the exact R2 prefixes/keys the live site's data names as the source of what it serves now.
# One copy each (the copy the site names); sums keys and bytes, and distinct bytes by md5.
import csv, collections, json
S = '/tmp/claude-0/-home-user-mashiachsonyosef-github-io/c72302ec-11e7-5b6d-a5ab-47bb077585fe/scratchpad'
OUT = S + '/meta/census'
PREFIXES = [
 ('hud-runs', 'corpus-lane-builds/moses-hud-record-v1/v1.2/build/hud-record-v1.2/'),
 ('hud-toggles', 'corpus-lane-builds/moses-megacompspan-toggles-v1/build/toggles-v1/'),
 ('source-suggested', 'corpus-lane-builds/moses-source-suggested-v1/v1.1/build/out/source-suggested-bsb/'),
 ('span-store', 'corpus-lane-builds/moses-span-store-v1/build-v1.4/span-store-v1.4/'),
 ('piece-store', 'corpus-lane-builds/moses-piece-store-v2/build/piece-store-v2/'),
 ('dictionary-store', 'corpus-lane-builds/moses-dictionary-store-v1/v1.1/build/dictionary-store-v1.1/serve/shards/'),
 ('overlay jastrow', 'corpus-lane-builds/moses-jastrow-toggle-v1/overlay-store/'),
 ('overlay samaritan', 'corpus-lane-builds/moses-samaritan-toggle-v1/overlay-store/'),
 ('route-store base', 'corpus-lane-builds/moses-year-repair-v1.1/route-store/'),
 ('span ledger (zones)', 'corpus-lane-builds/moses-compspan-v13.8/build/spans-ledger/'),
 ('pg v4 (zones)', 'corpus-lane-builds/moses-compspan-v13.8/build/pg/'),
 ('witnessed orders v2.7 (zones)', 'corpus-lane-builds/moses-orders-rebase-v2.1/orders-witnessed-v2.7/'),
 ('declarations', 'corpus-lane-builds/moses-parse-source-and-declaration-v1/declaration-store-v7/'),
 ('lattice v12 (zones)', 'moses-ledgers/lattice-v12/'),
 ('headword (zones)', 'moses-ledgers/toggle-builds-v1/form-or-lemma-v2/'),
 ('source corpus', 'moses-ledgers/toggle-ledgers-v1/'),
 ('v counts', 'moses-ledgers/v-ledger-v2/'),
 ('MAM restore v5 (Tanakh text)', 'moses-ledgers/mam-restore-v5/'),
 ('shelf backup', 'serving-lane/shelf/'),
]
KEYS = [('run cards', 'corpus-lane-builds/moses-maqaf-weld-run-check-v1/strand-run-card/outputs/cards-v1.jsonl.gz')]
md5 = {}
for l in open(S + '/clean/dl/corpus-lane-builds/moses-delete-ledger-v1/verify-proof-r3/out/02-r2-md5.tsv', encoding='utf-8'):
    h, s, k = l.rstrip('\n').split('\t', 2); md5[k] = h
for f in ('corpus-lane-builds_moses-dictionary-store-v1_.tsv', 'corpus-lane-builds_moses-delete-ledger-v1_.tsv'):
    for l in open(OUT + '/etag/' + f, encoding='utf-8'):
        k, s, t, e = l.rstrip('\n').split('\t'); md5.setdefault(k, e)
bucket = {}
for l in open(S + '/clean/bucket-now2.tsv', encoding='utf-8'):
    k, s, t = l.rstrip('\n').split('\t'); bucket[k] = int(s)
# masoretic marks: the files reader/data/masoretic-marks-v1.json pins, by name and size, inside the build's build-v1.2* folders
mm = json.load(open(S + '/ghp/reader/data/masoretic-marks-v1.json', encoding='utf-8'))['from']
want = [(v['file'], v['bytes']) for k, v in mm.items() if k != 'books'] + [(v['file'], v['bytes']) for v in mm['books'].values()]
mm_keys = []
for name, b in want:
    c = sorted(k for k, s in bucket.items() if k.startswith('corpus-lane-builds/moses-masoretic-marks-v1/') and k.endswith('/' + name) and s == b)
    if c: mm_keys.append(sorted(c, key=lambda k: (k.count('/'), k))[0])
rows = []; allh = {}
for label, p in PREFIXES:
    ks = [k for k in bucket if k.startswith(p)]
    rows.append((label, p, len(ks), sum(bucket[k] for k in ks)))
    for k in ks: allh[md5[k]] = bucket[k]
for label, k in KEYS:
    rows.append((label, k, 1, bucket[k])); allh[md5[k]] = bucket[k]
rows.append(('masoretic marks', 'corpus-lane-builds/moses-masoretic-marks-v1/ (%d pinned files found of %d)' % (len(mm_keys), len(want)), len(mm_keys), sum(bucket[k] for k in mm_keys)))
for k in mm_keys: allh[md5[k]] = bucket[k]
with open(OUT + '/served-payload.tsv', 'w', encoding='utf-8') as f:
    f.write('what_the_site_serves\tr2_prefix_or_key\tkeys\tbytes\n')
    for r in rows: f.write('\t'.join(map(str, r)) + '\n')
    tk = sum(r[2] for r in rows); tb = sum(r[3] for r in rows)
    f.write('TOTAL\t\t%d\t%d\n' % (tk, tb))
    f.write('TOTAL distinct (by md5)\t\t%d\t%d\n' % (len(allh), sum(allh.values())))
for r in rows: print('%-32s %6d %13d' % (r[0], r[2], r[3]))
print('total', tk, tb, 'distinct', len(allh), sum(allh.values()))
